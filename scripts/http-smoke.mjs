import assert from 'node:assert/strict'

const base = process.env.AMO_URL ?? 'http://localhost:3000'
async function call(path, method = 'GET', body, cookie) {
  const response = await fetch(`${base}/api/${path}`, {
    method,
    headers: { ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] }
}
async function login(email, password) {
  const result = await call('auth/login', 'POST', { email, password })
  assert.equal(result.status, 200, email)
  assert.match(result.cookie, /^amo-session=/)
  return result.cookie
}

const admin = await login('admin@amo.edu', 'admin123')
try {
  assert.equal((await call('catalog')).status, 200)
  assert.equal((await call('bootstrap')).status, 401)
  const aluno = await login('camila.nunes@amo.edu', 'aluno123')
  const monitor = await login('lucas.freire@amo.edu', 'monitor1')
  const professor = await login('helena.duarte@amo.edu', 'prof1234')

  const studentData = (await call('bootstrap', 'GET', undefined, aluno)).body.data
  assert.equal(studentData.currentUser.role, 'Aluno')
  assert.ok(studentData.state.enrollments.some(item => item.monitoriaId === 'alg' && item.status === 'Aprovada'))
  assert.ok(studentData.state.appointments.every(item => item.studentId === studentData.currentUser.id))
  assert.equal(studentData.state.users.find(item => item.role === 'Professor').email, '')
  assert.ok(!JSON.stringify(studentData).includes('password'))
  assert.equal((await call('admin/requests', 'GET', undefined, aluno)).status, 403)
  assert.equal((await call('appointments', 'POST', { availabilityId: 'slot-alg-monitor', subject: 'Teste', description: 'Teste' }, professor)).status, 403)
  assert.equal((await call('forum/questions', 'POST', { monitoriaId: 'alg', title: 'Teste', tag: 'teste', description: 'Teste' }, admin)).status, 403)
  assert.equal((await call('forum/questions', 'POST', { monitoriaId: 'bd', title: 'Sem matrícula', tag: 'teste', description: 'Teste' }, aluno)).status, 403)

  const enrollment = await call('enrollments', 'POST', { monitoriaId: 'bd' }, aluno)
  assert.equal(enrollment.status, 201)
  assert.equal((await call('enrollments', 'POST', { monitoriaId: 'bd' }, aluno)).status, 409)
  assert.equal((await call(`enrollments/${enrollment.body.data.id}`, 'PATCH', { action: 'approve' }, monitor)).status, 200)
  const multipleEnrollments = (await call('bootstrap', 'GET', undefined, aluno)).body.data.state.enrollments.filter(item => item.status === 'Aprovada')
  assert.ok(multipleEnrollments.some(item => item.monitoriaId === 'alg'))
  assert.ok(multipleEnrollments.some(item => item.monitoriaId === 'bd'))

  const firstLike = await call('forum/questions/q1/like', 'POST', {}, aluno)
  const secondLike = await call('forum/questions/q1/like', 'POST', {}, aluno)
  assert.equal(firstLike.body.data.likes, secondLike.body.data.likes + 1)
  assert.equal((await call('forum/questions/q3/like', 'POST', {}, aluno)).status, 403)
  const professorEnrollment = await call('enrollments', 'POST', { monitoriaId: 'calc' }, aluno)
  assert.equal((await call(`enrollments/${professorEnrollment.body.data.id}`, 'PATCH', { action: 'cancel' }, aluno)).status, 200)
  assert.equal((await call('enrollments', 'POST', { monitoriaId: 'calc' }, aluno)).status, 201)
  assert.equal((await call(`enrollments/${professorEnrollment.body.data.id}`, 'PATCH', { action: 'approve' }, professor)).status, 200)
  const adminEnrollment = await call('enrollments', 'POST', { monitoriaId: 'web' }, aluno)
  assert.equal((await call(`enrollments/${adminEnrollment.body.data.id}`, 'PATCH', { action: 'approve' }, admin)).status, 200)
  const reportable = await call('forum/questions', 'POST', { monitoriaId: 'alg', title: 'Questão reportável', tag: 'teste', description: 'Teste' }, monitor)
  assert.equal((await call(`forum/questions/${reportable.body.data.id}/report`, 'POST', {}, aluno)).status, 400)
  const report = await call(`forum/questions/${reportable.body.data.id}/report`, 'POST', { reason: 'Informação incorreta' }, aluno)
  assert.equal(report.status, 201)
  assert.equal((await call(`forum/reports/${report.body.data.id}`, 'PATCH', { decision: 'resolve' }, monitor)).status, 200)

  const question = await call('forum/questions', 'POST', { monitoriaId: 'alg', title: 'Dúvida de teste', tag: 'teste', description: 'Preciso de ajuda.' }, aluno)
  assert.equal(question.status, 201)
  assert.equal((await call(`forum/questions/${question.body.data.id}`, 'PATCH', { title: 'Revisada' }, monitor)).status, 200)
  const availability = await call('appointments/availability', 'POST', { monitoriaId: 'alg', date: '2099-01-02', time: '09:00', durationMinutes: 45, type: 'Virtual', location: 'https://meet.example/teste' }, monitor)
  assert.equal(availability.status, 201)
  const appointment = await call('appointments', 'POST', { availabilityId: availability.body.data.id, subject: 'Teste', description: 'Atendimento de teste' }, aluno)
  assert.equal(appointment.status, 201)
  assert.equal((await call(`appointments/${appointment.body.data.id}`, 'PATCH', { status: 'Confirmado' }, professor)).status, 200)

  const bdAvailability = await call('appointments/availability', 'POST', { monitoriaId: 'bd', date: '2099-01-03', time: '10:00', durationMinutes: 30, type: 'Presencial', location: 'Lab 04' }, monitor)
  const bdAppointment = await call('appointments', 'POST', { availabilityId: bdAvailability.body.data.id, subject: 'SQL', description: 'Atendimento de teste' }, aluno)
  assert.equal(bdAppointment.status, 201)
  assert.equal((await call(`enrollments/${enrollment.body.data.id}`, 'PATCH', { action: 'leave' }, aluno)).status, 200)
  assert.equal((await call('forum/questions', 'POST', { monitoriaId: 'bd', title: 'Após saída', tag: 'teste', description: 'Teste' }, aluno)).status, 403)
  const afterLeave = (await call('bootstrap', 'GET', undefined, admin)).body.data.state
  assert.equal(afterLeave.appointments.find(item => item.id === bdAppointment.body.data.id).status, 'Cancelado')
  assert.equal(afterLeave.availabilities.find(item => item.id === bdAvailability.body.data.id).status, 'Disponível')

  const registration = await call('auth/register/start', 'POST', { email: 'teste.aluno@amo.edu', password: 'senha123' })
  assert.equal(registration.status, 200)
  const registrationCode = (await call('auth/register/code', 'GET', undefined, registration.cookie)).body.data.code
  assert.equal((await call('auth/register/verify', 'POST', { code: registrationCode }, registration.cookie)).status, 200)
  assert.equal((await call('auth/register/finish', 'POST', { name: 'Aluno Teste', displayName: 'Teste', registration: '209900001', courseId: 'cc', birthDate: '2000-01-01', entryYear: '2099' }, registration.cookie)).status, 201)

  assert.equal((await call('auth/requests', 'POST', { role: 'Monitor', name: 'Monitor Teste', email: 'teste.monitor@amo.edu', registration: '209900002', courseId: 'cc', disciplineId: 'd-alg' })).status, 201)
  const request = (await call('admin/requests', 'GET', undefined, admin)).body.data.find(item => item.email === 'teste.monitor@amo.edu')
  const approved = await call(`admin/requests/${request.id}`, 'POST', { decision: 'approve' }, admin)
  assert.equal(approved.status, 200)
  assert.ok(approved.body.data.temporaryPassword)
  const newMonitor = await login('teste.monitor@amo.edu', approved.body.data.temporaryPassword)
  assert.equal((await call('attendance', 'PUT', { monitoriaId: 'alg', studentId: 'u-student', date: '2099-01-02', present: true, preConfirmed: true }, newMonitor)).status, 403)
  const adminData = (await call('bootstrap', 'GET', undefined, admin)).body.data
  const alg = adminData.state.monitorias.find(item => item.id === 'alg')
  assert.equal((await call('admin/monitorias/alg', 'PATCH', { classIds: alg.classIds, professorId: alg.professorId, monitorIds: [...alg.monitorIds, approved.body.data.user.id] }, admin)).status, 200)
  assert.equal((await call('attendance', 'PUT', { monitoriaId: 'alg', studentId: 'u-student', date: '2099-01-02', present: true, preConfirmed: true }, newMonitor)).status, 200)
  console.log('HTTP smoke: sessões, papéis, fórum, denúncias, vínculos, consultorias e frequência OK')
} finally {
  assert.equal((await call('admin/reset', 'POST', {}, admin)).status, 200)
}
