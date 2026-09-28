'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiRequest, type AmoCourse } from '@/lib/amo/mock-store'

function Shell({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter()
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white px-6 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-4 top-8 rounded-full p-1 text-[#48CAE4] transition hover:bg-[#48CAE4]/10 hover:text-[#024284]"
        aria-label="Voltar"
      >
        <ChevronLeft className="h-7 w-7" strokeWidth={2.5} />
      </button>
      <div className="flex w-full max-w-sm flex-col items-center gap-6 pt-2">
        <img src="/logo.png" alt="AMO Logo" className="h-20 w-20 object-contain" />
        <h1 className="text-xl font-bold text-[#024284]">{title}</h1>
        {children}
      </div>
    </div>
  )
}

export function RegisterDataPage() {
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [displayName, setDisplayName] = React.useState('')
  const [registration, setRegistration] = React.useState('')
  const [entryYear, setEntryYear] = React.useState('2026')
  const [courseId, setCourseId] = React.useState('')
  const [courses, setCourses] = React.useState<AmoCourse[]>([])
  const [birthDate, setBirthDate] = React.useState('')
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    apiRequest<{ courses: AmoCourse[] }>('catalog').then(data => { setCourses(data.courses); setCourseId(data.courses[0]?.id ?? '') }).catch(cause => setError(cause instanceof Error ? cause.message : 'Cursos indisponíveis.'))
  }, [])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name || !displayName || !registration || !entryYear || !courseId || !birthDate) {
      setError('Existem campos em branco.')
      return
    }
    window.sessionStorage.setItem('amo-pending-register', JSON.stringify({ name, displayName, registration, entryYear, courseId, birthDate }))
    router.push('/cadastro-foto')
  }

  return (
    <Shell title="Estamos quase la">
      <form onSubmit={submit} className="grid w-full gap-4">
        <div className="grid gap-2"><Label>Nome completo</Label><Input value={name} onChange={(event) => setName(event.target.value)} /></div>
        <div className="grid gap-2"><Label>Nome de exibicao</Label><Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></div>
        <div className="grid gap-2"><Label>Matricula</Label><Input value={registration} onChange={(event) => setRegistration(event.target.value)} /></div>
        <div className="grid gap-2"><Label>Ano de entrada</Label><Select value={entryYear} onValueChange={setEntryYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['2026','2025','2024','2023','2022'].map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-2"><Label>Escolha seu curso</Label><Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-2"><Label>Data de nascimento</Label><Input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} /></div>
        {error ? <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div> : null}
        <Button className="h-14 rounded-2xl bg-[#024284]">Avancar</Button>
      </form>
    </Shell>
  )
}

export function RegisterPhotoPage() {
  const router = useRouter()
  const [avatar, setAvatar] = React.useState('')
  const finish = () => {
    const pending = JSON.parse(window.sessionStorage.getItem('amo-pending-register') ?? '{}')
    window.sessionStorage.setItem('amo-pending-register', JSON.stringify({ ...pending, avatar }))
    router.push('/cadastro-final')
  }
  return (
    <Shell title="Selecione uma foto se quiser">
      <div className="grid w-full gap-4">
        <div className="grid gap-2"><Label>Foto por URL</Label><Input value={avatar} onChange={(event) => setAvatar(event.target.value)} placeholder="https://..." /></div>
        <Button className="h-14 rounded-2xl bg-[#024284]" onClick={finish}>Usar foto</Button>
        <Button variant="outline" className="h-14 rounded-2xl" onClick={finish}>Pular</Button>
      </div>
    </Shell>
  )
}

export function RegisterFinalPage() {
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState('')
  const [retry, setRetry] = React.useState(0)
  const sent = React.useRef(false)

  React.useEffect(() => {
    if (saved || sent.current) return
    const raw = window.sessionStorage.getItem('amo-pending-register')
    if (!raw) { setError('Dados do cadastro não encontrados. Volte ao início.'); return }
    const pending = JSON.parse(raw)
    sent.current = true
    apiRequest('auth/register/finish', 'POST', pending).then(() => {
      window.sessionStorage.removeItem('amo-pending-register')
      setSaved(true)
    }).catch(cause => { sent.current = false; setError(cause instanceof Error ? cause.message : 'Cadastro não concluído.') })
  }, [saved, retry])

  return (
    <Shell title="Obrigado pelo cadastro!">
      <p className="text-center text-sm text-zinc-600">{error || (saved ? 'Cadastro concluído. Retorne ao login para entrar no app.' : 'Concluindo cadastro...')}</p>
      {error ? <Button variant="outline" onClick={() => { setError(''); setRetry(value => value + 1) }}>Tentar novamente</Button> : null}
      <Button asChild className="h-14 w-full rounded-2xl bg-[#024284]">
        <Link href="/">Login</Link>
      </Button>
    </Shell>
  )
}
