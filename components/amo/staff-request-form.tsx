'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { apiRequest, type AmoCourse, type AmoDiscipline } from '@/lib/amo/mock-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function StaffRequestForm({ role }: { role: 'Monitor' | 'Professor' }) {
  const [catalog, setCatalog] = useState<{ courses: AmoCourse[]; disciplines: AmoDiscipline[] }>({ courses: [], disciplines: [] })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [registration, setRegistration] = useState('')
  const [courseId, setCourseId] = useState('')
  const [disciplineId, setDisciplineId] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    apiRequest<typeof catalog>('catalog').then(data => {
      setCatalog(data)
      setCourseId(data.courses[0]?.id ?? '')
    }).catch(cause => setMessage(cause instanceof Error ? cause.message : 'Catálogo indisponível.'))
  }, [])
  const disciplines = catalog.disciplines.filter(item => item.courseId === courseId)
  useEffect(() => { setDisciplineId(disciplines[0]?.id ?? '') }, [courseId, catalog.disciplines])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await apiRequest('auth/requests', 'POST', { role, name, email, registration, courseId, disciplineId })
      setSent(true)
      setMessage('Solicitação enviada. Um administrador deverá aprová-la.')
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Não foi possível enviar a solicitação.')
    }
  }
  return <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-6 py-10">
    <Link href="/" className="text-sm text-amo-blue underline">Voltar ao login</Link>
    <img src="/logo.png" alt="AMO" className="mx-auto size-20 object-contain" />
    <h1 className="text-center text-2xl font-semibold text-amo-navy">Solicitar cadastro de {role.toLowerCase()}</h1>
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2"><Label>Nome completo</Label><Input value={name} onChange={event => setName(event.target.value)} required /></div>
      <div className="grid gap-2"><Label>E-mail</Label><Input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></div>
      <div className="grid gap-2"><Label>{role === 'Professor' ? 'SIAPE' : 'Matrícula'}</Label><Input value={registration} onChange={event => setRegistration(event.target.value)} required /></div>
      <div className="grid gap-2"><Label>Curso</Label><Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue placeholder="Escolha o curso" /></SelectTrigger><SelectContent>{catalog.courses.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid gap-2"><Label>Disciplina</Label><Select value={disciplineId} onValueChange={setDisciplineId}><SelectTrigger><SelectValue placeholder="Escolha a disciplina" /></SelectTrigger><SelectContent>{disciplines.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
      {message ? <p role="status" className="rounded-md bg-amo-ice p-3 text-sm">{message}</p> : null}
      <Button disabled={sent || !courseId || !disciplineId}>Enviar solicitação</Button>
    </form>
  </main>
}
