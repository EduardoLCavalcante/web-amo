import { randomBytes, randomUUID } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initialAmoState, type AmoAppointment, type AmoAttendance, type AmoAvailability, type AmoEnrollment, type AmoMonitoria, type AmoNotification, type AmoQuestion, type AmoReport, type AmoSettings, type AmoState, type AmoUser, type AmoUserRole } from './model'

type PendingCode = { email: string; code: string; expires: number; verified: boolean; password?: string }
type StaffRequest = { id: string; role: 'Monitor' | 'Professor'; name: string; email: string; registration: string; courseId: string; disciplineId: string; status: 'Pendente' | 'Aprovada' | 'Rejeitada' }
type Context = { session?: string; register?: string; recover?: string }
type Result = { data: unknown; status?: number; cookie?: { name: string; value: string; maxAge: number } }

type Memory = {
  state: AmoState
  registrationOpen: boolean
  sessions: Map<string, string>
  registrationCodes: Map<string, PendingCode>
  recoveryCodes: Map<string, PendingCode>
  requests: StaffRequest[]
  userSettings: Map<string, AmoSettings>
  userNotifications: Map<string, AmoNotification[]>
}
// ponytail: o JSON local atende uma instância de desenvolvimento; use banco compartilhado em produção.
const stateFile = resolve(process.cwd(), process.env.AMO_STATE_FILE ?? '.amo-state.json')
const processMemory = process as NodeJS.Process & { __amoMemory?: Memory }
const memory: Memory = processMemory.__amoMemory ??= {
  state: existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) as AmoState : structuredClone(initialAmoState), registrationOpen: true,
  sessions: new Map(), registrationCodes: new Map(), recoveryCodes: new Map(),
  requests: [], userSettings: new Map(), userNotifications: new Map(),
}
let state = memory.state
let registrationOpen = memory.registrationOpen
const { sessions, registrationCodes, recoveryCodes, requests, userSettings, userNotifications } = memory

function migrateState() {
  state.reports ??= []
  state.availabilities ??= structuredClone(initialAmoState.availabilities)
  for (const item of state.classes) item.code ??= `${item.semester}-${item.id}`.toUpperCase()
  for (const item of state.monitorias) {
    const legacy = item as AmoMonitoria & { monitorId?: string }
    item.monitorIds ??= legacy.monitorId ? [legacy.monitorId] : []
    item.classIds ??= state.classes.filter(klass => klass.disciplineId === item.disciplineId).map(klass => klass.id)
    delete legacy.monitorId
  }
  if (!Array.isArray(state.enrollments)) {
    state.enrollments = []
    for (const item of state.monitorias) {
      const studentIds = new Set(item.classIds.flatMap(classId => state.classes.find(klass => klass.id === classId)?.studentIds ?? []))
      for (const studentId of studentIds) state.enrollments.push({
        id: id(), monitoriaId: item.id, studentId, status: 'Aprovada', requestedAt: new Date().toISOString(), reviewedAt: new Date().toISOString(), reviewedBy: item.professorId,
      })
    }
  }
  for (const question of state.questions) {
    const legacy = question as AmoQuestion & { reported?: boolean }
    question.legacyLikes ??= question.likes
    question.likedUserIds ??= []
    question.likes = question.legacyLikes + question.likedUserIds.length
    if (legacy.reported && !state.reports.some(report => report.questionId === question.id)) {
      state.reports.push({ id: id(), questionId: question.id, reporterId: question.authorId, reason: 'Motivo não informado', createdAt: new Date().toISOString(), status: 'Pendente' })
    }
    delete legacy.reported
  }
  for (const item of state.appointments) {
    const legacy = item as AmoAppointment & { monitorId?: string; meetingUrl?: string }
    item.providerId ??= legacy.monitorId
    item.durationMinutes ??= 30
    item.location ??= legacy.meetingUrl ?? (item.type === 'Presencial' ? 'Local a confirmar' : 'Link a confirmar')
    delete legacy.monitorId
    delete legacy.meetingUrl
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}
const fail = (status: number, message: string): never => { throw new ApiError(status, message) }
const id = () => randomUUID()
migrateState()
export const persistState = () => writeFileSync(stateFile, JSON.stringify(state, null, 2), { mode: 0o600 })
persistState()
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : fail(400, 'Corpo inválido.')
const value = (body: Record<string, unknown>, key: string, min = 1) => typeof body[key] === 'string' && (body[key] as string).trim().length >= min ? (body[key] as string).trim() : fail(400, `Campo ${key} inválido.`)
const email = (body: Record<string, unknown>) => {
  const normalized = value(body, 'email').toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : fail(400, 'E-mail inválido.')
}
const password = (body: Record<string, unknown>, key = 'password') => {
  const text = value(body, key, 8)
  return /\d/.test(text) ? text : fail(400, 'A senha deve ter oito caracteres e um número.')
}
const userById = (userId: string) => state.users.find(user => user.id === userId)
const loginUser = (token?: string) => {
  const user = token ? userById(sessions.get(token) || '') : undefined
  return user?.active ? user : undefined
}
const requiredUser = (token?: string) => loginUser(token) ?? fail(401, 'Sessão ausente ou expirada.')
const admin = (user: AmoUser) => user.role === 'Administrador' ? user : fail(403, 'Acesso restrito ao administrador.')
const monitoria = (monitoriaId: string) => state.monitorias.find(item => item.id === monitoriaId) ?? fail(404, 'Monitoria não encontrada.')
const assigned = (user: AmoUser, monitoriaId: string) => {
  const item = monitoria(monitoriaId)
  return user.role === 'Administrador' || (user.role === 'Monitor' && item.monitorIds.includes(user.id)) || (user.role === 'Professor' && item.professorId === user.id)
}
const staff = (user: AmoUser, monitoriaId: string) => assigned(user, monitoriaId) ? user : fail(403, 'Monitoria fora do seu vínculo.')
const appointmentUser = (user: AmoUser) => user.role === 'Aluno' ? user : fail(403, 'Ação reservada a alunos.')
const ownOrModerator = (user: AmoUser, authorId: string, monitoriaId: string) => {
  if (user.id === authorId) return forumParticipant(user, monitoriaId)
  return assigned(user, monitoriaId) ? user : fail(403, 'Ação não permitida nesta dúvida.')
}
const uniqueEmail = (address: string) => !state.users.some(user => user.email.toLowerCase() === address) || fail(409, 'E-mail já cadastrado.')
const existingCourse = (courseId: string) => state.courses.some(course => course.id === courseId) || fail(400, 'Curso inválido.')
const existingDiscipline = (disciplineId: string, courseId: string) => state.disciplines.some(item => item.id === disciplineId && item.courseId === courseId) || fail(400, 'Disciplina inválida.')
const userIds = (raw: unknown, roles?: AmoUserRole[]) => {
  if (!Array.isArray(raw) || !raw.every(item => typeof item === 'string')) fail(400, 'Lista de usuários inválida.')
  const ids = [...new Set(raw as string[])]
  if (ids.some(userId => !userById(userId) || roles && !roles.includes(userById(userId)!.role))) fail(400, 'Usuário inválido na lista.')
  return ids
}
const enrolled = (userId: string, monitoriaId: string) => state.enrollments.some(item => item.studentId === userId && item.monitoriaId === monitoriaId && item.status === 'Aprovada')
const forumParticipant = (user: AmoUser, monitoriaId: string) => {
  monitoria(monitoriaId)
  if (user.role === 'Aluno') return enrolled(user.id, monitoriaId) ? user : fail(403, 'Você precisa de matrícula aprovada nesta monitoria.')
  if (user.role === 'Monitor' || user.role === 'Professor') return staff(user, monitoriaId)
  return fail(403, 'Ação reservada aos participantes da monitoria.')
}
const slot = (slotId: string) => state.availabilities.find(item => item.id === slotId) ?? fail(404, 'Horário não encontrado.')
const provider = (user: AmoUser, monitoriaId: string) => {
  const item = monitoria(monitoriaId)
  return (item.professorId === user.id || item.monitorIds.includes(user.id)) ? user : fail(403, 'Você não faz parte da equipe desta monitoria.')
}
const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
const overlaps = (startA: number, durationA: number, startB: number, durationB: number) => startA < startB + durationB && startB < startA + durationA

function safeUser(user: AmoUser, details: boolean): AmoUser {
  const { password: _password, ...safe } = user
  return details ? safe : { ...safe, email: '', registration: '', birthDate: undefined, entryYear: undefined }
}
function notice(userIds: string[], title: string, message: string, type: AmoNotification['type']) {
  for (const userId of new Set(userIds)) {
    const list = userNotifications.get(userId) ?? []
    userNotifications.set(userId, [{ id: id(), title, message, time: 'agora', unread: true, type }, ...list])
  }
}
const teamIds = (monitoriaId: string) => {
  const item = monitoria(monitoriaId)
  return [item.professorId, ...item.monitorIds].filter(Boolean)
}
function settingsFor(user: AmoUser): AmoSettings {
  return { ...(userSettings.get(user.id) ?? initialAmoState.settings), userRegistration: user.role === 'Administrador' && registrationOpen }
}
function bootstrap(user: AmoUser) {
  const adminView = user.role === 'Administrador'
  const canSeeAppointment = (item: AmoAppointment) => adminView || item.studentId === user.id || ((user.role === 'Monitor' || user.role === 'Professor') && assigned(user, item.monitoriaId))
  const canSeeAttendance = (item: AmoAttendance) => adminView || item.studentId === user.id || ((user.role === 'Monitor' || user.role === 'Professor') && assigned(user, item.monitoriaId))
  const canSeeReport = (item: AmoReport) => {
    const question = state.questions.find(entry => entry.id === item.questionId)
    return adminView || item.reporterId === user.id || !!question && (user.role === 'Monitor' || user.role === 'Professor') && assigned(user, question.monitoriaId)
  }
  const canSeeEnrollment = (item: AmoEnrollment) => adminView || item.studentId === user.id || (user.role === 'Monitor' || user.role === 'Professor') && assigned(user, item.monitoriaId)
  const canSeeAvailability = (item: AmoAvailability) => adminView
    || user.role === 'Aluno' && (enrolled(user.id, item.monitoriaId) || state.appointments.some(appointment => appointment.availabilityId === item.id && appointment.studentId === user.id))
    || (user.role === 'Monitor' || user.role === 'Professor') && assigned(user, item.monitoriaId)
  const filtered: AmoState = {
    ...state,
    users: state.users.map(item => safeUser(item, adminView || item.id === user.id)),
    classes: adminView ? state.classes : state.classes.filter(item => item.studentIds.includes(user.id) || (user.role === 'Monitor' || user.role === 'Professor') && state.monitorias.some(m => m.disciplineId === item.disciplineId && assigned(user, m.id))).map(item => ({ ...item, studentIds: item.studentIds.includes(user.id) && user.role === 'Aluno' ? [user.id] : item.studentIds })),
    appointments: state.appointments.filter(canSeeAppointment),
    attendances: state.attendances.filter(canSeeAttendance),
    enrollments: state.enrollments.filter(canSeeEnrollment),
    reports: state.reports.filter(canSeeReport),
    availabilities: state.availabilities.filter(canSeeAvailability),
    notifications: userNotifications.get(user.id) ?? (user.id === 'u-student' ? state.notifications : []),
    settings: settingsFor(user),
  }
  return { currentUser: safeUser(user, true), state: filtered }
}
function newCode(map: Map<string, PendingCode>, pending: Omit<PendingCode, 'code' | 'expires' | 'verified'>) {
  const token = randomBytes(24).toString('base64url')
  map.set(token, { ...pending, code: String(randomBytes(4).readUInt32BE() % 1_000_000).padStart(6, '0'), expires: Date.now() + 600_000, verified: false })
  return token
}
function pending(map: Map<string, PendingCode>, token?: string) {
  const item = token && map.get(token)
  return item && item.expires > Date.now() ? item : fail(400, 'Código expirado. Solicite outro.')
}
function verifyCode(map: Map<string, PendingCode>, token: string | undefined, body: Record<string, unknown>) {
  const item = pending(map, token)
  if (item.code !== value(body, 'code')) fail(400, 'Código inválido.')
  item.verified = true
}
function cookie(name: string, value: string, maxAge: number): Result['cookie'] { return { name, value, maxAge } }

export function handleApi(method: string, path: string, rawBody: unknown, context: Context): Result {
  const body = method === 'GET' ? {} : record(rawBody)
  if (method === 'GET' && path === 'catalog') return { data: { courses: state.courses, disciplines: state.disciplines } }
  if (method === 'GET' && (path === 'auth/register/code' || path === 'auth/recover/code')) {
    const item = path === 'auth/recover/code' ? pending(recoveryCodes, context.recover) : pending(registrationCodes, context.register)
    return { data: { code: item.code, expires: item.expires } }
  }
  if (method === 'POST' && path === 'auth/login') {
    const address = email(body)
    const user = state.users.find(item => item.email.toLowerCase() === address && item.password === value(body, 'password'))
    if (!user?.active) return fail(401, 'E-mail ou senha inválidos.')
    const token = randomBytes(32).toString('base64url')
    sessions.set(token, user.id)
    return { data: safeUser(user, true), cookie: cookie('amo-session', token, 604800) }
  }
  if (method === 'POST' && path === 'auth/logout') {
    if (context.session) sessions.delete(context.session)
    return { data: true, cookie: cookie('amo-session', '', 0) }
  }
  if (method === 'POST' && path === 'auth/register/start') {
    if (!registrationOpen) fail(403, 'Cadastros temporariamente fechados.')
    const address = email(body)
    uniqueEmail(address)
    const token = newCode(registrationCodes, { email: address, password: password(body) })
    return { data: true, cookie: cookie('amo-register', token, 600) }
  }
  if (method === 'POST' && path === 'auth/register/verify') {
    verifyCode(registrationCodes, context.register, body)
    return { data: true }
  }
  if (method === 'POST' && path === 'auth/register/finish') {
    const entry = pending(registrationCodes, context.register)
    if (!entry.verified) fail(403, 'Confirme o código antes de concluir.')
    uniqueEmail(entry.email)
    const courseId = value(body, 'courseId')
    existingCourse(courseId)
    const user: AmoUser = { id: id(), name: value(body, 'name'), displayName: value(body, 'displayName'), email: entry.email, password: entry.password, role: 'Aluno', registration: value(body, 'registration'), courseId, birthDate: value(body, 'birthDate'), entryYear: value(body, 'entryYear'), avatar: typeof body.avatar === 'string' ? body.avatar : undefined, active: true }
    state.users.push(user)
    registrationCodes.delete(context.register!)
    return { data: safeUser(user, true), status: 201, cookie: cookie('amo-register', '', 0) }
  }
  if (method === 'POST' && path === 'auth/recover/start') {
    const address = email(body)
    if (!state.users.some(item => item.email.toLowerCase() === address && item.active)) fail(404, 'Conta ativa não encontrada.')
    const token = newCode(recoveryCodes, { email: address })
    return { data: true, cookie: cookie('amo-recover', token, 600) }
  }
  if (method === 'POST' && path === 'auth/recover/verify') {
    verifyCode(recoveryCodes, context.recover, body)
    return { data: true }
  }
  if (method === 'POST' && path === 'auth/recover/finish') {
    const entry = pending(recoveryCodes, context.recover)
    if (!entry.verified) fail(403, 'Confirme o código antes de redefinir.')
    const user = state.users.find(item => item.email.toLowerCase() === entry.email) ?? fail(404, 'Conta não encontrada.')
    user.password = password(body, 'newPassword')
    for (const [token, userId] of sessions) if (userId === user.id) sessions.delete(token)
    recoveryCodes.delete(context.recover!)
    return { data: true, cookie: cookie('amo-recover', '', 0) }
  }
  if (method === 'POST' && path === 'auth/requests') {
    if (!registrationOpen) fail(403, 'Cadastros temporariamente fechados.')
    const role = value(body, 'role')
    if (role !== 'Professor' && role !== 'Monitor') fail(400, 'Perfil inválido.')
    const address = email(body)
    uniqueEmail(address)
    if (requests.some(item => item.email === address && item.status === 'Pendente')) fail(409, 'Solicitação já pendente.')
    const courseId = value(body, 'courseId')
    existingCourse(courseId)
    const disciplineId = value(body, 'disciplineId')
    existingDiscipline(disciplineId, courseId)
    requests.push({ id: id(), role: role as StaffRequest['role'], name: value(body, 'name'), email: address, registration: value(body, 'registration'), courseId, disciplineId, status: 'Pendente' })
    return { data: true, status: 201 }
  }

  const user = requiredUser(context.session)
  if (method === 'GET' && path === 'bootstrap') return { data: bootstrap(user) }
  if (method === 'GET' && path === 'auth/session') return { data: safeUser(user, true) }
  if (method === 'GET' && path === 'admin/requests') { admin(user); return { data: requests } }

  const parts = path.split('/')
  if (parts[0] === 'enrollments') {
    if (method === 'POST' && parts.length === 1) {
      appointmentUser(user)
      const monitoriaId = value(body, 'monitoriaId')
      const linked = monitoria(monitoriaId)
      let enrollment = state.enrollments.find(item => item.studentId === user.id && item.monitoriaId === monitoriaId)
      if (enrollment?.status === 'Pendente') fail(409, 'Sua solicitação já está pendente.')
      if (enrollment?.status === 'Aprovada') fail(409, 'Você já está matriculado nesta monitoria.')
      if (enrollment) {
        enrollment.status = 'Pendente'
        enrollment.requestedAt = new Date().toISOString()
        delete enrollment.reviewedAt
        delete enrollment.reviewedBy
      } else {
        enrollment = { id: id(), monitoriaId, studentId: user.id, status: 'Pendente', requestedAt: new Date().toISOString() }
        state.enrollments.unshift(enrollment)
      }
      notice(teamIds(monitoriaId), 'Nova solicitação de matrícula', `${user.name} solicitou matrícula em ${linked.subject}.`, 'sistema')
      return { data: enrollment, status: 201 }
    }
    if (method === 'PATCH' && parts.length === 2) {
      const enrollment = state.enrollments.find(item => item.id === parts[1]) ?? fail(404, 'Solicitação de matrícula não encontrada.')
      const action = value(body, 'action')
      const linked = monitoria(enrollment.monitoriaId)
      const student = userById(enrollment.studentId) ?? fail(404, 'Aluno não encontrado.')
      if (action === 'approve' || action === 'reject') {
        staff(user, enrollment.monitoriaId)
        if (enrollment.status !== 'Pendente') fail(409, 'Esta solicitação já foi processada.')
        enrollment.status = action === 'approve' ? 'Aprovada' : 'Recusada'
        notice([student.id], action === 'approve' ? 'Matrícula aprovada' : 'Matrícula recusada', linked.subject, 'sistema')
      } else if (action === 'cancel') {
        if (user.id !== student.id || enrollment.status !== 'Pendente') fail(409, 'Esta solicitação não pode ser cancelada.')
        enrollment.status = 'Cancelada'
        notice(teamIds(linked.id), 'Solicitação cancelada', `${student.name} cancelou a solicitação em ${linked.subject}.`, 'sistema')
      } else if (action === 'leave' || action === 'remove') {
        if (enrollment.status !== 'Aprovada') fail(409, 'Esta matrícula não está ativa.')
        if (action === 'leave') {
          if (user.id !== student.id) fail(403, 'Você não pode encerrar esta matrícula.')
          notice(teamIds(linked.id), 'Aluno saiu da monitoria', `${student.name} saiu de ${linked.subject}.`, 'sistema')
        } else {
          staff(user, enrollment.monitoriaId)
          notice([student.id], 'Matrícula encerrada', `Sua matrícula em ${linked.subject} foi encerrada pela equipe.`, 'sistema')
        }
        enrollment.status = 'Cancelada'
        const now = Date.now()
        for (const appointment of state.appointments) {
          if (appointment.studentId !== student.id || appointment.monitoriaId !== linked.id || !['Pendente', 'Confirmado'].includes(appointment.status) || new Date(`${appointment.date}T${appointment.time}:00`).getTime() <= now) continue
          appointment.status = 'Cancelado'
          const availability = state.availabilities.find(item => item.id === appointment.availabilityId)
          if (availability) availability.status = 'Disponível'
        }
      } else fail(400, 'Ação de matrícula inválida.')
      enrollment.reviewedAt = new Date().toISOString()
      enrollment.reviewedBy = user.id
      return { data: enrollment }
    }
    fail(404, 'Rota não encontrada.')
  }
  if (parts[0] === 'forum') {
    if (method === 'POST' && path === 'forum/questions') {
      const monitoriaId = value(body, 'monitoriaId')
      forumParticipant(user, monitoriaId)
      const question: AmoQuestion = { id: id(), monitoriaId, title: value(body, 'title'), tag: value(body, 'tag'), description: value(body, 'description'), authorId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'Aberta', likes: 0, legacyLikes: 0, likedUserIds: [], views: 0, followingUserIds: [] }
      state.questions.unshift(question)
      notice([user.id], 'Dúvida cadastrada', question.title, 'forum')
      return { data: question, status: 201 }
    }
    if (parts[1] === 'reports' && method === 'PATCH') {
      const report = state.reports.find(item => item.id === parts[2]) ?? fail(404, 'Denúncia não encontrada.')
      const question = state.questions.find(item => item.id === report.questionId) ?? fail(404, 'Dúvida não encontrada.')
      staff(user, question.monitoriaId)
      if (report.status !== 'Pendente') fail(409, 'Esta denúncia já foi analisada.')
      const decision = value(body, 'decision')
      if (decision !== 'resolve' && decision !== 'dismiss') fail(400, 'Decisão inválida.')
      report.status = decision === 'resolve' ? 'Resolvida' : 'Descartada'
      report.resolution = typeof body.resolution === 'string' ? body.resolution.trim() : undefined
      return { data: report }
    }
    const question = state.questions.find(item => item.id === parts[2]) ?? fail(404, 'Dúvida não encontrada.')
    if (parts[1] !== 'questions') fail(404, 'Rota não encontrada.')
    if (parts.length === 3 && method === 'PATCH') {
      ownOrModerator(user, question.authorId, question.monitoriaId)
      question.title = value(body, 'title')
      question.updatedAt = new Date().toISOString()
      return { data: question }
    }
    if (parts.length === 3 && method === 'DELETE') {
      ownOrModerator(user, question.authorId, question.monitoriaId)
      state.questions = state.questions.filter(item => item.id !== question.id)
      state.answers = state.answers.filter(item => item.questionId !== question.id)
      state.reports = state.reports.filter(item => item.questionId !== question.id)
      return { data: true }
    }
    if (method === 'POST' && parts[3] === 'answers') {
      forumParticipant(user, question.monitoriaId)
      const answer = { id: id(), questionId: question.id, authorId: user.id, body: value(body, 'body'), createdAt: new Date().toISOString(), correct: false }
      state.answers.unshift(answer)
      question.status = 'Respondida'
      question.updatedAt = new Date().toISOString()
      notice([question.authorId], 'Nova resposta no fórum', question.title, 'forum')
      return { data: answer, status: 201 }
    }
    if (method === 'POST' && parts[3] === 'like') {
      forumParticipant(user, question.monitoriaId)
      const liked = !question.likedUserIds.includes(user.id)
      question.likedUserIds = liked ? [...question.likedUserIds, user.id] : question.likedUserIds.filter(item => item !== user.id)
      question.likes = question.legacyLikes + question.likedUserIds.length
      return { data: { liked, likes: question.likes } }
    }
    if (method === 'POST' && parts[3] === 'report') {
      forumParticipant(user, question.monitoriaId)
      if (question.authorId === user.id) fail(403, 'Você não pode denunciar a própria dúvida.')
      if (state.reports.some(item => item.questionId === question.id && item.reporterId === user.id && item.status === 'Pendente')) fail(409, 'Você já enviou uma denúncia pendente para esta dúvida.')
      const reason = value(body, 'reason')
      if (!['Conteúdo ofensivo', 'Spam', 'Informação incorreta', 'Outro'].includes(reason)) fail(400, 'Motivo inválido.')
      const details = typeof body.details === 'string' ? body.details.trim() : ''
      if (reason === 'Outro' && !details) fail(400, 'Descreva o motivo da denúncia.')
      const report: AmoReport = { id: id(), questionId: question.id, reporterId: user.id, reason: reason as AmoReport['reason'], details: details || undefined, createdAt: new Date().toISOString(), status: 'Pendente' }
      state.reports.unshift(report)
      return { data: report, status: 201 }
    }
    if (method === 'POST' && parts[3] === 'follow') {
      forumParticipant(user, question.monitoriaId)
      question.followingUserIds = question.followingUserIds.includes(user.id) ? question.followingUserIds.filter(item => item !== user.id) : [...question.followingUserIds, user.id]
      return { data: question.followingUserIds.includes(user.id) }
    }
    if (method === 'POST' && parts[3] === 'correct') {
      staff(user, question.monitoriaId)
      const answerId = value(body, 'answerId')
      const answer = state.answers.find(item => item.id === answerId && item.questionId === question.id) ?? fail(404, 'Resposta não encontrada.')
      const next = !answer.correct
      for (const item of state.answers) if (item.questionId === question.id) item.correct = next && item.id === answer.id
      question.status = state.answers.some(item => item.questionId === question.id) ? 'Respondida' : 'Aberta'
      return { data: true }
    }
  }
  if (parts[0] === 'appointments') {
    if (parts[1] === 'availability') {
      if (method === 'POST' && parts.length === 2) {
        const monitoriaId = value(body, 'monitoriaId')
        provider(user, monitoriaId)
        const date = value(body, 'date'), time = value(body, 'time')
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || new Date(`${date}T${time}:00`).getTime() <= Date.now()) fail(400, 'Escolha uma data e um horário futuros.')
        const durationMinutes = Number(body.durationMinutes)
        if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 120) fail(400, 'A duração deve ficar entre 15 e 120 minutos.')
        const type = value(body, 'type')
        if (type !== 'Presencial' && type !== 'Virtual') fail(400, 'Modalidade inválida.')
        const location = value(body, 'location')
        if (type === 'Virtual' && !/^https:\/\//.test(location)) fail(400, 'Informe um link HTTPS para a consultoria remota.')
        if (state.availabilities.some(item => item.providerId === user.id && item.date === date && overlaps(minutes(item.time), item.durationMinutes, minutes(time), durationMinutes))) fail(409, 'Este horário conflita com outra disponibilidade sua.')
        const availability: AmoAvailability = { id: id(), monitoriaId, providerId: user.id, date, time, durationMinutes, type: type as AmoAvailability['type'], location, status: 'Disponível' }
        state.availabilities.push(availability)
        return { data: availability, status: 201 }
      }
      if (method === 'DELETE' && parts.length === 3) {
        const availability = slot(parts[2])
        if (availability.providerId !== user.id && user.role !== 'Administrador') fail(403, 'Você não pode remover este horário.')
        if (availability.status === 'Reservado') fail(409, 'Um horário reservado não pode ser removido.')
        state.availabilities = state.availabilities.filter(item => item.id !== availability.id)
        return { data: true }
      }
      fail(404, 'Rota não encontrada.')
    }
    if (method === 'POST' && parts.length === 1) {
      appointmentUser(user)
      const availability = slot(value(body, 'availabilityId'))
      if (availability.status !== 'Disponível') fail(409, 'Este horário já foi reservado.')
      if (new Date(`${availability.date}T${availability.time}:00`).getTime() <= Date.now()) fail(409, 'Este horário já passou.')
      if (!enrolled(user.id, availability.monitoriaId)) fail(403, 'Você precisa de matrícula aprovada nesta monitoria.')
      if (state.appointments.some(item => item.studentId === user.id && item.date === availability.date && !['Cancelado', 'Negado'].includes(item.status) && overlaps(minutes(item.time), item.durationMinutes, minutes(availability.time), availability.durationMinutes))) fail(409, 'Você já possui uma consultoria neste intervalo.')
      const subject = value(body, 'subject')
      const item: AmoAppointment = { id: id(), availabilityId: availability.id, monitoriaId: availability.monitoriaId, studentId: user.id, providerId: availability.providerId, subject, description: value(body, 'description'), date: availability.date, time: availability.time, type: availability.type, durationMinutes: availability.durationMinutes, location: availability.location, status: 'Pendente', tags: subject.toLowerCase().split(' ').slice(0, 3) }
      state.appointments.unshift(item)
      availability.status = 'Reservado'
      notice([user.id, availability.providerId], 'Nova solicitação de consultoria', item.subject, 'agenda')
      return { data: item, status: 201 }
    }
    const item = state.appointments.find(entry => entry.id === parts[1]) ?? fail(404, 'Agendamento não encontrado.')
    if (method === 'PATCH' && parts.length === 2) {
      const isOwn = item.studentId === user.id
      const isStaff = assigned(user, item.monitoriaId)
      if (!isOwn && !isStaff) fail(403, 'Agendamento fora do seu acesso.')
      if (body.status !== undefined) {
        const status = value(body, 'status')
        if (status === 'Cancelado') {
          if ((!isOwn && !isStaff) || !['Pendente', 'Confirmado'].includes(item.status)) fail(409, 'Consultoria não pode ser cancelada.')
        } else {
          if (!isStaff || !['Confirmado', 'Negado', 'Concluido'].includes(status)) fail(403, 'Alteração de status não permitida.')
          if (status === 'Concluido' ? item.status !== 'Confirmado' : item.status !== 'Pendente') fail(409, 'Transição de status inválida.')
        }
        item.status = status as AmoAppointment['status']
        if ((item.status === 'Negado' || item.status === 'Cancelado') && item.availabilityId) slot(item.availabilityId).status = 'Disponível'
      } else {
        if (!isOwn || item.status !== 'Pendente') fail(403, 'Somente o solicitante altera pedidos pendentes.')
        item.subject = value(body, 'subject')
        item.description = value(body, 'description')
      }
      notice([item.studentId, item.providerId ?? monitoria(item.monitoriaId).professorId], 'Consultoria atualizada', item.status, 'agenda')
      return { data: item }
    }
  }
  if (method === 'PUT' && path === 'attendance') {
    const monitoriaId = value(body, 'monitoriaId')
    staff(user, monitoriaId)
    const studentId = value(body, 'studentId')
    if (userById(studentId)?.role !== 'Aluno') fail(400, 'Aluno inválido.')
    const date = value(body, 'date')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(400, 'Data inválida.')
    if (!enrolled(studentId, monitoriaId)) fail(403, 'Aluno sem matrícula aprovada nesta monitoria.')
    if (typeof body.present !== 'boolean' || typeof body.preConfirmed !== 'boolean') fail(400, 'Frequência inválida.')
    let entry = state.attendances.find(item => item.monitoriaId === monitoriaId && item.studentId === studentId && item.date === date)
    if (!entry) { entry = { id: id(), monitoriaId, date, studentId, present: false, preConfirmed: false }; state.attendances.push(entry) }
    entry.present = body.present as boolean
    entry.preConfirmed = body.preConfirmed as boolean
    notice([studentId], 'Frequência registrada', monitoria(monitoriaId).subject, 'frequencia')
    return { data: entry }
  }
  if (parts[0] === 'me' && method === 'PATCH') {
    if (parts[1] === 'profile') {
      const name = value(body, 'name')
      const courseId = value(body, 'courseId')
      existingCourse(courseId)
      user.name = name
      user.displayName = name.split(' ')[0]
      user.courseId = courseId
      user.avatar = typeof body.avatar === 'string' ? body.avatar : undefined
      return { data: safeUser(user, true) }
    }
    if (parts[1] === 'password') {
      if (user.password !== value(body, 'oldPassword')) fail(400, 'Senha atual incorreta.')
      user.password = password(body, 'newPassword')
      return { data: true }
    }
    if (parts[1] === 'settings') {
      const next = settingsFor(user)
      for (const key of ['forum', 'appointments', 'email'] as const) if (body[key] !== undefined) {
        if (typeof body[key] !== 'boolean') fail(400, 'Preferência inválida.')
        next[key] = body[key] as boolean
      }
      userSettings.set(user.id, next)
      return { data: next }
    }
    if (parts[1] === 'notifications') {
      userNotifications.set(user.id, (userNotifications.get(user.id) ?? (user.id === 'u-student' ? state.notifications : [])).map(item => ({ ...item, unread: false })))
      return { data: true }
    }
    if (parts[1] === 'deactivate') {
      user.active = false
      for (const [token, userId] of sessions) if (userId === user.id) sessions.delete(token)
      return { data: true, cookie: cookie('amo-session', '', 0) }
    }
  }
  if (parts[0] === 'admin') {
    admin(user)
    if (method === 'POST' && path === 'admin/classes') {
      const courseId = value(body, 'courseId'), disciplineId = value(body, 'disciplineId')
      existingCourse(courseId); existingDiscipline(disciplineId, courseId)
      const code = value(body, 'code'), semester = value(body, 'semester')
      if (state.classes.some(item => item.code.toLowerCase() === code.toLowerCase() && item.semester === semester)) fail(409, 'Já existe uma turma com este código no semestre.')
      const studentIds = userIds(body.studentIds ?? [], ['Aluno'])
      if (studentIds.some(studentId => userById(studentId)?.courseId !== courseId)) fail(400, 'Todos os alunos devem pertencer ao curso da turma.')
      const klass = { id: id(), code, courseId, disciplineId, semester, studentIds }
      state.classes.push(klass)
      return { data: klass, status: 201 }
    }
    if (method === 'PATCH' && parts[1] === 'classes') {
      const klass = state.classes.find(item => item.id === parts[2]) ?? fail(404, 'Turma não encontrada.')
      const studentIds = userIds(body.studentIds ?? klass.studentIds, ['Aluno'])
      if (studentIds.some(studentId => userById(studentId)?.courseId !== klass.courseId)) fail(400, 'Todos os alunos devem pertencer ao curso da turma.')
      klass.code = typeof body.code === 'string' ? value(body, 'code') : klass.code
      klass.semester = typeof body.semester === 'string' ? value(body, 'semester') : klass.semester
      klass.studentIds = studentIds
      return { data: klass }
    }
    if (method === 'POST' && path === 'admin/monitorias') {
      const disciplineId = value(body, 'disciplineId')
      const discipline = state.disciplines.find(item => item.id === disciplineId) ?? fail(400, 'Disciplina inválida.')
      const classIds = Array.isArray(body.classIds) && body.classIds.every(item => typeof item === 'string') ? [...new Set(body.classIds as string[])] : fail(400, 'Turmas inválidas.')
      if (!classIds.length || classIds.some(classId => !state.classes.some(klass => klass.id === classId && klass.disciplineId === disciplineId))) fail(400, 'Escolha turmas da disciplina para a monitoria.')
      const professorId = value(body, 'professorId')
      if (userById(professorId)?.role !== 'Professor') fail(400, 'Professor responsável inválido.')
      const monitorIds = userIds(body.monitorIds ?? [], ['Monitor'])
      const tags = Array.isArray(body.tags) && body.tags.every(item => typeof item === 'string') ? (body.tags as string[]).map(item => item.trim()).filter(Boolean) : []
      const item: AmoMonitoria = { id: id(), courseId: discipline.courseId, disciplineId, subject: value(body, 'subject'), classIds, professorId, monitorIds, schedule: 'Horários publicados em Consultorias', room: 'Conforme a consultoria', contact: userById(professorId)?.email ?? '', status: 'Aberta', tags }
      state.monitorias.push(item)
      return { data: item, status: 201 }
    }
    if (method === 'PATCH' && parts[1] === 'monitorias') {
      const item = monitoria(parts[2])
      const classIds = Array.isArray(body.classIds) && body.classIds.every(entry => typeof entry === 'string') ? [...new Set(body.classIds as string[])] : item.classIds
      if (!classIds.length || classIds.some(classId => !state.classes.some(klass => klass.id === classId && klass.disciplineId === item.disciplineId))) fail(400, 'Escolha turmas da disciplina para a monitoria.')
      const professorId = typeof body.professorId === 'string' ? value(body, 'professorId') : item.professorId
      if (userById(professorId)?.role !== 'Professor') fail(400, 'Professor responsável inválido.')
      item.subject = typeof body.subject === 'string' ? value(body, 'subject') : item.subject
      item.classIds = classIds
      item.professorId = professorId
      item.monitorIds = body.monitorIds === undefined ? item.monitorIds : userIds(body.monitorIds, ['Monitor'])
      item.contact = userById(professorId)?.email ?? item.contact
      return { data: item }
    }
    if (method === 'POST' && path === 'admin/users') {
      const role = value(body, 'role') as AmoUserRole
      if (role !== 'Monitor' && role !== 'Professor') fail(400, 'Perfil inválido.')
      const address = email(body)
      uniqueEmail(address)
      const courseId = value(body, 'courseId')
      existingCourse(courseId)
      const temporaryPassword = `${randomBytes(8).toString('base64url')}9`
      const newUser: AmoUser = { id: id(), name: value(body, 'name'), displayName: value(body, 'name').split(' ')[0], email: address, password: temporaryPassword, role, registration: value(body, 'registration'), courseId, active: true }
      assignMonitorias(newUser, body.monitoriaIds)
      state.users.push(newUser)
      return { data: { user: safeUser(newUser, true), temporaryPassword }, status: 201 }
    }
    if (method === 'PATCH' && parts[1] === 'users') {
      const target = userById(parts[2]) ?? fail(404, 'Usuário não encontrado.')
      if (body.monitoriaIds !== undefined) assignMonitorias(target, body.monitoriaIds)
      if (typeof body.active === 'boolean') target.active = body.active
      if (!target.active) for (const [token, userId] of sessions) if (userId === target.id) sessions.delete(token)
      return { data: safeUser(target, true) }
    }
    if (method === 'POST' && parts[1] === 'requests') {
      const request = requests.find(item => item.id === parts[2]) ?? fail(404, 'Solicitação não encontrada.')
      if (request.status !== 'Pendente') fail(409, 'Solicitação já decidida.')
      const decision = value(body, 'decision')
      if (decision === 'reject') { request.status = 'Rejeitada'; return { data: request } }
      if (decision !== 'approve') fail(400, 'Decisão inválida.')
      uniqueEmail(request.email)
      const temporaryPassword = `${randomBytes(8).toString('base64url')}9`
      const newUser: AmoUser = { id: id(), name: request.name, displayName: request.name.split(' ')[0], email: request.email, password: temporaryPassword, role: request.role, registration: request.registration, courseId: request.courseId, active: true }
      assignMonitorias(newUser, body.monitoriaIds)
      state.users.push(newUser)
      request.status = 'Aprovada'
      return { data: { request, user: safeUser(newUser, true), temporaryPassword } }
    }
    if (method === 'POST' && path === 'admin/catalog') {
      const action = value(body, 'action')
      if (action === 'course.add') { const course = { id: id(), name: value(body, 'name'), period: '2026.1', coordinator: 'Coordenação AMO', description: 'Curso cadastrado no protótipo.' }; state.courses.push(course); return { data: course } }
      if (action === 'discipline.add') { const courseId = value(body, 'courseId'); existingCourse(courseId); const discipline = { id: id(), courseId, name: value(body, 'name') }; state.disciplines.push(discipline); return { data: discipline } }
      if (action === 'registration.set') { if (typeof body.open !== 'boolean') fail(400, 'Valor inválido.'); registrationOpen = memory.registrationOpen = body.open as boolean; return { data: registrationOpen } }
      fail(400, 'Ação inválida.')
    }
    if (method === 'DELETE' && parts[1] === 'catalog') {
      const kind = parts[2], targetId = parts[3]
      if (kind === 'courses') {
        if (state.disciplines.some(item => item.courseId === targetId) || state.users.some(item => item.courseId === targetId)) fail(409, 'Curso em uso.')
        state.courses = state.courses.filter(item => item.id !== targetId)
      } else if (kind === 'disciplines') {
        if (state.monitorias.some(item => item.disciplineId === targetId) || state.classes.some(item => item.disciplineId === targetId)) fail(409, 'Disciplina em uso.')
        state.disciplines = state.disciplines.filter(item => item.id !== targetId)
      } else fail(404, 'Recurso não encontrado.')
      return { data: true }
    }
    if (method === 'POST' && path === 'admin/reset') {
      state = memory.state = structuredClone(initialAmoState)
      requests.length = 0; userSettings.clear(); userNotifications.clear(); registrationOpen = memory.registrationOpen = true
      return { data: true }
    }
  }
  return fail(404, 'Rota não encontrada.')
}

function assignMonitorias(user: AmoUser, raw: unknown) {
  if (raw === undefined) return
  if (!Array.isArray(raw) || !raw.every(id => typeof id === 'string')) fail(400, 'Vínculos inválidos.')
  if (user.role !== 'Monitor' && user.role !== 'Professor') fail(400, 'Perfil sem monitorias.')
  const ids = raw as string[]
  for (const monitoriaId of ids) monitoria(monitoriaId)
  for (const item of state.monitorias) {
    if (user.role === 'Monitor') item.monitorIds = item.monitorIds.filter(userId => userId !== user.id)
    if (user.role === 'Professor' && item.professorId === user.id) item.professorId = ''
  }
  for (const monitoriaId of ids) {
    const item = monitoria(monitoriaId)
    if (user.role === 'Monitor') item.monitorIds = [...new Set([...item.monitorIds, user.id])]
    else item.professorId = user.id
  }
}
