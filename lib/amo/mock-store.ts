'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  appointments as baseAppointments,
  courses as baseCourses,
  monitorias as baseMonitorias,
  notifications as baseNotifications,
  profiles,
  questions as baseQuestions,
} from '@/lib/amo/mock-data'

export type AmoUserRole = 'Aluno' | 'Monitor' | 'Professor' | 'Administrador'

export type AmoUser = {
  id: string
  name: string
  displayName: string
  email: string
  password: string
  role: AmoUserRole
  registration: string
  courseId: string
  birthDate?: string
  entryYear?: string
  avatar?: string
  active: boolean
}

export type AmoCourse = {
  id: string
  name: string
  period: string
  coordinator: string
  description: string
}

export type AmoDiscipline = {
  id: string
  courseId: string
  name: string
}

export type AmoClass = {
  id: string
  courseId: string
  disciplineId: string
  semester: string
  studentIds: string[]
}

export type AmoMonitoria = {
  id: string
  courseId: string
  disciplineId: string
  subject: string
  monitorId: string
  professorId: string
  schedule: string
  room: string
  contact: string
  status: 'Aberta' | 'Lotada' | 'Em breve'
  tags: string[]
}

export type AmoAnswer = {
  id: string
  questionId: string
  authorId: string
  body: string
  createdAt: string
  correct: boolean
}

export type AmoQuestion = {
  id: string
  monitoriaId: string
  title: string
  tag: string
  description: string
  authorId: string
  createdAt: string
  updatedAt: string
  status: 'Aberta' | 'Respondida'
  likes: number
  views: number
  followingUserIds: string[]
  reported: boolean
}

export type AmoAppointment = {
  id: string
  monitoriaId: string
  studentId: string
  monitorId?: string
  subject: string
  description: string
  date: string
  time: string
  type: 'Presencial' | 'Virtual'
  status: 'Pendente' | 'Confirmado' | 'Negado' | 'Cancelado' | 'Concluido'
  meetingUrl?: string
  tags: string[]
}

export type AmoAttendance = {
  id: string
  monitoriaId: string
  date: string
  studentId: string
  present: boolean
  preConfirmed: boolean
  difficulty?: string
}

export type AmoNotification = {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  type: 'forum' | 'agenda' | 'sistema' | 'frequencia'
}

export type AmoSettings = {
  forum: boolean
  appointments: boolean
  email: boolean
  userRegistration: boolean
}

export type AmoState = {
  users: AmoUser[]
  courses: AmoCourse[]
  disciplines: AmoDiscipline[]
  classes: AmoClass[]
  monitorias: AmoMonitoria[]
  questions: AmoQuestion[]
  answers: AmoAnswer[]
  appointments: AmoAppointment[]
  attendances: AmoAttendance[]
  notifications: AmoNotification[]
  settings: AmoSettings
}

const STORAGE_KEY = 'amo-data-v1'
export const SESSION_KEY = 'amo-session'

const now = '2026-06-02T11:00:00.000Z'

export const initialAmoState: AmoState = {
  users: [
    {
      id: 'u-admin',
      name: 'Patricia Vasconcelos',
      displayName: 'Patricia',
      email: 'admin@amo.edu',
      password: 'admin123',
      role: 'Administrador',
      registration: 'ADM-001',
      courseId: 'cc',
      active: true,
    },
    {
      id: 'u-student',
      name: profiles.student.name,
      displayName: 'Camila',
      email: profiles.student.email,
      password: 'aluno123',
      role: 'Aluno',
      registration: profiles.student.registration,
      courseId: 'cc',
      entryYear: '2024',
      birthDate: '2003-08-14',
      active: true,
    },
    {
      id: 'u-prof',
      name: profiles.professor.name,
      displayName: 'Helena',
      email: profiles.professor.email,
      password: 'prof1234',
      role: 'Professor',
      registration: profiles.professor.registration,
      courseId: 'cc',
      active: true,
    },
    {
      id: 'u-monitor',
      name: profiles.monitor.name,
      displayName: 'Lucas',
      email: profiles.monitor.email,
      password: 'monitor1',
      role: 'Monitor',
      registration: profiles.monitor.registration,
      courseId: 'cc',
      active: true,
    },
  ],
  courses: baseCourses.map((course) => ({
    id: course.id,
    name: course.name,
    period: course.period,
    coordinator: course.coordinator,
    description: course.description,
  })),
  disciplines: baseMonitorias.map((monitoria) => ({
    id: `d-${monitoria.id}`,
    courseId: monitoria.courseId,
    name: monitoria.subject,
  })),
  classes: [
    {
      id: 't-alg-2026',
      courseId: 'cc',
      disciplineId: 'd-alg',
      semester: '2026.1',
      studentIds: ['u-student'],
    },
  ],
  monitorias: baseMonitorias.map((monitoria, index) => ({
    id: monitoria.id,
    courseId: monitoria.courseId,
    disciplineId: `d-${monitoria.id}`,
    subject: monitoria.subject,
    monitorId: index === 0 ? 'u-monitor' : 'u-student',
    professorId: 'u-prof',
    schedule: monitoria.nextSlot,
    room: monitoria.room,
    contact: index === 0 ? 'lucas.freire@amo.edu' : 'monitoria@amo.edu',
    status: monitoria.status,
    tags: monitoria.tags,
  })),
  questions: baseQuestions.map((question, index) => ({
    id: question.id,
    monitoriaId: question.monitoriaId,
    title: question.title,
    tag: question.monitoriaId === 'alg' ? 'listas' : question.monitoriaId === 'bd' ? 'modelagem' : 'apis',
    description: question.body,
    authorId: index === 2 ? 'u-monitor' : 'u-student',
    createdAt: index === 0 ? '2026-06-02T10:00:00.000Z' : index === 1 ? '2026-06-02T09:00:00.000Z' : '2026-06-01T14:00:00.000Z',
    updatedAt: now,
    status: question.status === 'Aberta' ? 'Aberta' : 'Respondida',
    likes: index === 2 ? 12 : index + 2,
    views: question.views,
    followingUserIds: index === 0 ? ['u-student'] : [],
    reported: false,
  })),
  answers: [
    {
      id: 'ans-1',
      questionId: 'q1',
      authorId: 'u-monitor',
      body: 'Use fila quando a ordem de atendimento precisa ser preservada. Use pilha quando o ultimo item inserido deve sair primeiro.',
      createdAt: '2026-06-02T10:20:00.000Z',
      correct: true,
    },
    {
      id: 'ans-2',
      questionId: 'q1',
      authorId: 'u-prof',
      body: 'Compare a saida esperada com a ordem de entrada antes de escolher a estrutura.',
      createdAt: '2026-06-02T10:30:00.000Z',
      correct: false,
    },
  ],
  appointments: baseAppointments.map((appointment, index) => ({
    id: appointment.id,
    monitoriaId: appointment.monitoriaId,
    studentId: index === 2 ? 'u-student' : 'u-student',
    monitorId: 'u-monitor',
    subject: appointment.topic,
    description: `Atendimento sobre ${appointment.topic}.`,
    date: index === 0 ? '2026-06-02' : index === 1 ? '2026-06-03' : '2026-05-28',
    time: appointment.time,
    type: index === 1 ? 'Virtual' : 'Presencial',
    status: appointment.status === 'Pendente' ? 'Pendente' : appointment.status === 'Confirmado' ? 'Confirmado' : 'Concluido',
    meetingUrl: index === 1 ? 'https://meet.google.com/amo-bd-2026' : undefined,
    tags: [appointment.topic.split(' ')[0].toLowerCase()],
  })),
  attendances: [
    {
      id: 'freq-1',
      monitoriaId: 'alg',
      date: '2026-06-02',
      studentId: 'u-student',
      present: true,
      preConfirmed: true,
      difficulty: 'Pilhas e filas',
    },
  ],
  notifications: baseNotifications.map((notification) => ({
    ...notification,
    type: notification.type,
  })),
  settings: {
    forum: true,
    appointments: true,
    email: false,
    userRegistration: true,
  },
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function readState(): AmoState {
  if (typeof window === 'undefined') return initialAmoState
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return initialAmoState
  try {
    return { ...initialAmoState, ...JSON.parse(raw) } as AmoState
  } catch {
    return initialAmoState
  }
}

function writeState(state: AmoState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function setAmoSession(userId: string) {
  window.localStorage.setItem(SESSION_KEY, userId)
  document.cookie = `${SESSION_KEY}=${userId}; path=/; max-age=604800; SameSite=Lax`
}

export function clearAmoSession() {
  window.localStorage.removeItem(SESSION_KEY)
  document.cookie = `${SESSION_KEY}=; path=/; max-age=0; SameSite=Lax`
}

export function useAmoStore() {
  const [state, setState] = useState<AmoState>(initialAmoState)
  const [sessionUserId, setSessionUserId] = useState('u-student')

  useEffect(() => {
    const stored = readState()
    setState(stored)
    writeState(stored)
    setSessionUserId(window.localStorage.getItem(SESSION_KEY) ?? 'u-student')
  }, [])

  const commit = (updater: (current: AmoState) => AmoState) => {
    setState((current) => {
      const next = updater(current)
      writeState(next)
      return next
    })
  }

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === sessionUserId) ?? state.users[1],
    [sessionUserId, state.users],
  )

  const notify = (title: string, message: string, type: AmoNotification['type'] = 'sistema') => {
    commit((current) => ({
      ...current,
      notifications: [
        { id: createId('not'), title, message, time: 'agora', unread: true, type },
        ...current.notifications,
      ],
    }))
  }

  return {
    state,
    currentUser,
    setSessionUserId: (userId: string) => {
      setAmoSession(userId)
      setSessionUserId(userId)
    },
    reset: () => commit(() => initialAmoState),
    notify,
    update: commit,
    ids: { createId },
  }
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function toDateLabel(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${value}T12:00:00`))
}
