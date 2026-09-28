'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Flag,
  Heart,
  KeyRound,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  UserPlus,
  Video,
  X,
} from 'lucide-react'

import {
  type AmoAppointment,
  type AmoAvailability,
  type AmoCourse,
  type AmoDiscipline,
  type AmoMonitoria,
  type AmoQuestion,
  type AmoReport,
  type AmoUser,
  type AmoUserRole,
  apiRequest,
  formatDateTime,
  toDateLabel,
  useAmoStore,
} from '@/lib/amo/mock-store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

function PageTitle({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-zinc-600">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 bg-white pl-9"
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'Aberta' || status === 'Confirmado' || status === 'Aprovada'
      ? 'bg-amo-ice text-amo-navy'
      : status === 'Respondida' || status === 'Concluido'
        ? 'bg-amo-border text-amo-deep'
        : status === 'Pendente'
          ? 'bg-amber-100 text-amber-800'
          : status === 'Negado' || status === 'Cancelado' || status === 'Recusada' || status === 'Cancelada'
            ? 'bg-rose-100 text-rose-800'
            : 'bg-zinc-100 text-zinc-700'

  return <Badge className={cn('border-0', tone)}>{status}</Badge>
}

function userName(users: AmoUser[], userId?: string) {
  return users.find((user) => user.id === userId)?.name ?? 'Usuario'
}

function monitoriaTitle(monitorias: AmoMonitoria[], monitoriaId?: string) {
  return monitorias.find((item) => item.id === monitoriaId)?.subject ?? 'Monitoria'
}

function AdminOnlyHint() {
  return (
    <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      Prototipo frontend: as permissoes sao simuladas e persistidas no navegador.
    </div>
  )
}

function fire(promise: Promise<unknown>) {
  void promise.catch((cause) => window.alert(cause instanceof Error ? cause.message : 'Operação não concluída.'))
}

export function CoursesPage() {
  const { state } = useAmoStore()

  return (
    <>
      <PageTitle
        title="Cursos"
        description="Escolha um curso para consultar monitorias do semestre atual."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {state.courses.map((course, index) => {
          const monitorias = state.monitorias.filter((item) => item.courseId === course.id)
          return (
            <Link key={course.id} href={`/monitorias?curso=${course.id}`}>
              <Card className="h-full rounded-md transition hover:border-amo-cyan hover:shadow-sm">
                <CardHeader>
                  <div className={cn('mb-4 h-2 w-16 rounded-full', ['bg-amo-navy', 'bg-amo-cyan', 'bg-amo-blue'][index % 3])} />
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-600">{course.description}</p>
                  <div className="rounded-md bg-zinc-50 p-3 text-sm">
                    <span className="block text-xs text-zinc-500">Semestre</span>
                    {course.period}
                  </div>
                  <div className="text-sm text-zinc-600">{monitorias.length} monitorias disponiveis</div>
                  <div className="text-sm text-zinc-600">{course.coordinator}</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </>
  )
}

export function MonitoriasPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, currentUser, mutate } = useAmoStore()
  const selectedCourse = searchParams.get('curso') ?? 'todos'
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  const filtered = state.monitorias.filter((monitoria) => {
    const courseMatch = selectedCourse === 'todos' || monitoria.courseId === selectedCourse
    const text = `${monitoria.subject} ${monitoria.schedule} ${monitoria.room} ${monitoria.tags.join(' ')}`.toLowerCase()
    return courseMatch && text.includes(query.toLowerCase())
  })

  const ownEnrollments = state.enrollments.filter(item => item.studentId === currentUser.id)
  const enrolled = state.monitorias.filter(item => ownEnrollments.some(enrollment => enrollment.monitoriaId === item.id && enrollment.status === 'Aprovada'))
  const run = async (work: () => Promise<unknown>, success: string) => {
    try { await work(); setMessage(success) }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Não foi possível atualizar a matrícula.') }
  }

  return (
    <>
      <PageTitle
        title="Monitorias"
        description="Consulte as monitorias, solicite matrícula e acompanhe sua situação."
      />
      {message ? <p role="status" className="mb-4 rounded-md bg-zinc-100 p-3 text-sm">{message}</p> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar por monitoria, horario, sala ou tag" />
        <Select value={selectedCourse} onValueChange={(value) => router.replace(value === 'todos' ? '/monitorias' : `/monitorias?curso=${value}`)}>
          <SelectTrigger className="h-11 w-full bg-white sm:w-64">
            <SelectValue placeholder="Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os cursos</SelectItem>
            {state.courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {currentUser.role === 'Aluno' ? <div className="mb-5 rounded-md border bg-white p-4 text-sm text-zinc-700">
        <span className="font-medium">Minhas monitorias:</span> {enrolled.length ? enrolled.map((item) => item.subject).join(', ') : 'nenhuma matrícula aprovada.'}
      </div> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((monitoria) => {
          const enrollment = ownEnrollments.find(item => item.monitoriaId === monitoria.id)
          const manages = currentUser.role === 'Monitor' && monitoria.monitorIds.includes(currentUser.id) || currentUser.role === 'Professor' && monitoria.professorId === currentUser.id
          const pending = manages ? state.enrollments.filter(item => item.monitoriaId === monitoria.id && item.status === 'Pendente') : []
          const active = manages ? state.enrollments.filter(item => item.monitoriaId === monitoria.id && item.status === 'Aprovada') : []
          return <Card key={monitoria.id} className="h-full rounded-md transition hover:border-amo-cyan hover:shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <StatusBadge status={monitoria.status} />
                    <h2 className="mt-3 text-lg font-semibold">{monitoria.subject}</h2>
                    <p className="mt-1 text-sm text-zinc-600">Prof. {userName(state.users, monitoria.professorId)} · {monitoria.monitorIds.length ? `${monitoria.monitorIds.map(id => userName(state.users, id)).join(', ')} na monitoria` : 'Sem monitor cadastrado'}</p>
                  </div>
                  {enrollment ? <StatusBadge status={enrollment.status} /> : <ChevronRight className="size-5 text-zinc-400" />}
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-md bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">Horario</span>{monitoria.schedule}</div>
                  <div className="rounded-md bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">Local</span>{monitoria.room}</div>
                  <div className="rounded-md bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">Contato</span>{monitoria.contact}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">{monitoria.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm"><Link href={`/forum?monitoria=${monitoria.id}`}>{enrollment?.status === 'Aprovada' ? 'Acessar fórum' : 'Ler fórum'}</Link></Button>
                  {currentUser.role === 'Aluno' && !enrollment ? <Button size="sm" onClick={() => void run(() => mutate('enrollments', 'POST', { monitoriaId: monitoria.id }), 'Solicitação de matrícula enviada.')}>Solicitar matrícula</Button> : null}
                  {currentUser.role === 'Aluno' && enrollment?.status === 'Pendente' ? <Button size="sm" variant="outline" onClick={() => void run(() => mutate(`enrollments/${enrollment.id}`, 'PATCH', { action: 'cancel' }), 'Solicitação cancelada.')}>Cancelar solicitação</Button> : null}
                  {currentUser.role === 'Aluno' && (enrollment?.status === 'Recusada' || enrollment?.status === 'Cancelada') ? <Button size="sm" onClick={() => void run(() => mutate('enrollments', 'POST', { monitoriaId: monitoria.id }), 'Nova solicitação enviada.')}>Solicitar novamente</Button> : null}
                  {currentUser.role === 'Aluno' && enrollment?.status === 'Aprovada' ? <Button size="sm" variant="destructive" onClick={() => { if (window.confirm(`Sair da monitoria ${monitoria.subject}? Consultorias futuras serão canceladas.`)) void run(() => mutate(`enrollments/${enrollment.id}`, 'PATCH', { action: 'leave' }), 'Você saiu da monitoria.') }}>Sair da monitoria</Button> : null}
                </div>
                {manages ? <div className="mt-5 border-t pt-4">
                  <h3 className="font-medium">Solicitações de matrícula</h3>
                  <div className="mt-2 space-y-2">{pending.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-amber-50 p-3 text-sm"><span>{userName(state.users, item.studentId)}</span><div className="flex gap-2"><Button size="sm" onClick={() => void run(() => mutate(`enrollments/${item.id}`, 'PATCH', { action: 'approve' }), 'Matrícula aprovada.')}>Aprovar</Button><Button size="sm" variant="outline" onClick={() => void run(() => mutate(`enrollments/${item.id}`, 'PATCH', { action: 'reject' }), 'Solicitação recusada.')}>Recusar</Button></div></div>)}{!pending.length ? <p className="text-sm text-zinc-500">Nenhuma solicitação pendente.</p> : null}</div>
                  {active.length ? <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-amo-blue">Alunos matriculados ({active.length})</summary><div className="mt-2 space-y-2">{active.map(item => <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-zinc-50 p-3 text-sm"><span>{userName(state.users, item.studentId)}</span><Button size="sm" variant="outline" onClick={() => { if (window.confirm('Remover este aluno da monitoria?')) void run(() => mutate(`enrollments/${item.id}`, 'PATCH', { action: 'remove' }), 'Matrícula encerrada.') }}>Remover</Button></div>)}</div></details> : null}
                </div> : null}
              </CardContent>
            </Card>
        })}
      </div>
    </>
  )
}

function QuestionCard({
  question,
  answerCount,
  users,
  monitorias,
}: {
  question: AmoQuestion
  answerCount: number
  users: AmoUser[]
  monitorias: AmoMonitoria[]
}) {
  return (
    <Link href={`/forum/${question.id}`}>
      <Card className="rounded-md transition hover:border-amo-cyan hover:shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={question.status} />
                <Badge variant="secondary">{question.tag}</Badge>
                <span className="text-xs text-zinc-500">{monitoriaTitle(monitorias, question.monitoriaId)}</span>
              </div>
              <h2 className="text-base font-semibold leading-snug">{question.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{question.description}</p>
            </div>
            <ChevronRight className="mt-1 size-5 shrink-0 text-zinc-400" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
            <span>{userName(users, question.authorId)}</span>
            <span>{answerCount} respostas</span>
            <span>{question.likes} curtidas</span>
            <span>{formatDateTime(question.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ModerationPanel({ reports }: { reports: AmoReport[] }) {
  const { state, mutate } = useAmoStore()
  const pending = reports.filter(report => report.status === 'Pendente')
  if (!pending.length) return null
  return <section className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4" aria-labelledby="moderation-title">
    <div className="mb-3"><h2 id="moderation-title" className="font-semibold text-amber-950">Denúncias para analisar</h2><p className="text-sm text-amber-900">Revise o motivo e decida se o conteúdo precisa de moderação.</p></div>
    <div className="space-y-3">{pending.map(report => {
      const question = state.questions.find(item => item.id === report.questionId)
      return <article key={report.id} className="rounded-md bg-white p-3 text-sm shadow-sm">
        <p className="font-medium">{question?.title ?? 'Dúvida removida'}</p>
        <p className="mt-1 text-zinc-600">{report.reason}{report.details ? ` · ${report.details}` : ''}</p>
        <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => fire(mutate(`forum/reports/${report.id}`, 'PATCH', { decision: 'resolve' }))}>Resolver</Button><Button size="sm" variant="outline" onClick={() => fire(mutate(`forum/reports/${report.id}`, 'PATCH', { decision: 'dismiss' }))}>Descartar</Button></div>
      </article>
    })}</div>
  </section>
}

export function ForumPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, currentUser } = useAmoStore()
  const monitoriaId = searchParams.get('monitoria') ?? 'todas'
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recentes')
  const [quickFilter, setQuickFilter] = useState('todas')
  const writableMonitorias = state.monitorias.filter(item => currentUser.role === 'Aluno'
    ? state.enrollments.some(enrollment => enrollment.studentId === currentUser.id && enrollment.monitoriaId === item.id && enrollment.status === 'Aprovada')
    : currentUser.role === 'Monitor' ? item.monitorIds.includes(currentUser.id)
      : currentUser.role === 'Professor' ? item.professorId === currentUser.id : false)

  const filtered = useMemo(() => {
    const items = state.questions.filter((question) => {
      const answers = state.answers.filter((answer) => answer.questionId === question.id)
      const monitoriaMatch = monitoriaId === 'todas' || question.monitoriaId === monitoriaId
      const text = `${question.title} ${question.description} ${question.tag}`.toLowerCase()
      const queryMatch = text.includes(query.toLowerCase())
      const filterMatch =
        quickFilter === 'todas' ||
        (quickFilter === 'abertas' && question.status === 'Aberta') ||
        (quickFilter === 'respondidas' && question.status === 'Respondida') ||
        (quickFilter === 'com-resposta' && answers.length > 0) ||
        (quickFilter === 'sem-resposta' && answers.length === 0) ||
        (quickFilter === 'minhas' && question.authorId === currentUser.id) ||
        (quickFilter === 'seguindo' && question.followingUserIds.includes(currentUser.id))
      return monitoriaMatch && queryMatch && filterMatch
    })

    return [...items].sort((a, b) => {
      if (sort === 'respostas') return state.answers.filter((answer) => answer.questionId === b.id).length - state.answers.filter((answer) => answer.questionId === a.id).length
      if (sort === 'menos-respostas') return state.answers.filter((answer) => answer.questionId === a.id).length - state.answers.filter((answer) => answer.questionId === b.id).length
      if (sort === 'curtidas') return b.likes - a.likes
      if (sort === 'menos-curtidas') return a.likes - b.likes
      if (sort === 'antigas') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [monitoriaId, query, quickFilter, sort, state.answers, state.questions, currentUser.id])

  return (
    <div className="relative">
      <PageTitle
        title="Forum"
        description="Dúvidas organizadas por monitoria, tag, respostas e curtidas."
        action={writableMonitorias.length ? <Button asChild><Link href="/forum/nova-duvida"><Plus className="size-4" />Nova dúvida</Link></Button> : currentUser.role === 'Aluno' ? <Button asChild variant="outline"><Link href="/monitorias">Solicitar matrícula</Link></Button> : null}
      />
      {currentUser.role !== 'Aluno' ? <ModerationPanel reports={state.reports} /> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <SearchBox value={query} onChange={setQuery} placeholder="Pesquisar por titulo, descricao ou tag" />
        <Select value={monitoriaId} onValueChange={(value) => router.replace(value === 'todas' ? '/forum' : `/forum?monitoria=${value}`)}>
          <SelectTrigger className="h-11 w-full bg-white sm:w-64"><Filter className="size-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as monitorias</SelectItem>
            {state.monitorias.map((item) => <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>)}
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild><Button variant="outline" className="h-11 bg-white"><SlidersHorizontal className="size-4" />Filtros</Button></SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>Filtros do forum</SheetTitle></SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Consulta rapida</Label>
                {[
                  ['todas', 'Todas'],
                  ['abertas', 'Abertas'],
                  ['respondidas', 'Respondidas'],
                  ['com-resposta', 'Com resposta'],
                  ['sem-resposta', 'Sem resposta'],
                  ['minhas', 'Minhas'],
                  ['seguindo', 'Seguindo'],
                ].map(([value, label]) => (
                  <Button key={value} variant={quickFilter === value ? 'default' : 'outline'} className="mr-2 mb-2" onClick={() => setQuickFilter(value)}>{label}</Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Ordenacao</Label>
                {[
                  ['recentes', 'Mais recentes'],
                  ['antigas', 'Mais antigas'],
                  ['respostas', 'Mais respondidas'],
                  ['menos-respostas', 'Menos respondidas'],
                  ['curtidas', 'Mais curtidas'],
                  ['menos-curtidas', 'Menos curtidas'],
                ].map(([value, label]) => (
                  <Button key={value} variant={sort === value ? 'default' : 'outline'} className="mr-2 mb-2" onClick={() => setSort(value)}>{label}</Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="mb-4 rounded-md border bg-white p-3 text-sm text-zinc-700">
        <span className="font-medium">Disciplinas:</span> {state.monitorias.map((item) => item.subject).join(' · ')}
      </div>
      <div className="space-y-3">
        {filtered.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            answerCount={state.answers.filter((answer) => answer.questionId === question.id).length}
            users={state.users}
            monitorias={state.monitorias}
          />
        ))}
        {!filtered.length ? <Card className="rounded-md"><CardContent className="p-6 text-sm text-zinc-600">Nenhuma duvida encontrada.</CardContent></Card> : null}
      </div>
      <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-2 lg:bottom-8">
        {writableMonitorias.length ? <Button asChild size="icon-lg" className="rounded-full shadow-lg"><Link href="/forum/nova-duvida"><Plus className="size-5" /><span className="sr-only">Nova dúvida</span></Link></Button> : null}
        {currentUser.role === 'Administrador' ? <Button asChild variant="secondary" size="icon-lg" className="rounded-full shadow-lg"><Link href="/usuarios/novo"><UserPlus className="size-5" /><span className="sr-only">Novo usuario</span></Link></Button> : null}
      </div>
    </div>
  )
}

export function NewQuestionPage() {
  const router = useRouter()
  const { state, currentUser, mutate } = useAmoStore()
  const eligibleMonitorias = state.monitorias.filter(item => currentUser.role === 'Aluno'
    ? state.enrollments.some(enrollment => enrollment.studentId === currentUser.id && enrollment.monitoriaId === item.id && enrollment.status === 'Aprovada')
    : currentUser.role === 'Monitor' ? item.monitorIds.includes(currentUser.id)
      : currentUser.role === 'Professor' ? item.professorId === currentUser.id : false)
  const [monitoriaId, setMonitoriaId] = useState(eligibleMonitorias[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    if (!monitoriaId || !title.trim() || !tag.trim() || !description.trim()) {
      setError('Informe titulo, tag e descricao.')
      return
    }
    try {
      const question = await mutate<AmoQuestion>('forum/questions', 'POST', { monitoriaId, title, tag, description })
      router.push(`/forum/${question.id}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível publicar.')
    }
  }

  return (
    <>
      <PageTitle title="Nova dúvida" description="Publique uma dúvida em uma monitoria da qual você participa." />
      {!eligibleMonitorias.length ? <Card className="rounded-md"><CardContent className="p-6 text-center"><p className="text-sm text-zinc-600">Você precisa de uma matrícula aprovada para publicar no fórum.</p><Button asChild className="mt-4"><Link href="/monitorias">Ver monitorias</Link></Button></CardContent></Card> :
      <Card className="rounded-md">
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <div className="grid gap-2">
            <Label>Monitoria</Label>
            <Select value={monitoriaId} onValueChange={setMonitoriaId}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>{eligibleMonitorias.map((item) => <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>Titulo</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Descreva a duvida em uma frase" /></div>
          <div className="grid gap-2"><Label>Tag</Label><Input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Ex: recursao, sql, derivadas" /></div>
          <div className="grid gap-2"><Label>Descricao</Label><Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-40" placeholder="Inclua contexto, tentativa e onde travou." /></div>
          {error ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => router.push('/forum')}>Cancelar</Button>
            <Button onClick={submit}><Send className="size-4" />Publicar</Button>
          </div>
        </CardContent>
      </Card>}
    </>
  )
}

export function QuestionDetailPage() {
  const params = useParams<{ duvidaId: string }>()
  const { state, currentUser, mutate } = useAmoStore()
  const question = state.questions.find((item) => item.id === params.duvidaId)
  const answers = state.answers.filter((answer) => answer.questionId === question?.id)
  const [draft, setDraft] = useState('')
  const [editTitle, setEditTitle] = useState(question?.title ?? '')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const router = useRouter()

  const linked = state.monitorias.find(item => item.id === question?.monitoriaId)
  const canCorrect = currentUser.role === 'Administrador' || (currentUser.role === 'Monitor' && linked?.monitorIds.includes(currentUser.id)) || (currentUser.role === 'Professor' && linked?.professorId === currentUser.id)
  const canInteract = currentUser.role === 'Aluno'
    ? state.enrollments.some(item => item.studentId === currentUser.id && item.monitoriaId === question?.monitoriaId && item.status === 'Aprovada')
    : currentUser.role === 'Monitor' ? !!linked?.monitorIds.includes(currentUser.id)
      : currentUser.role === 'Professor' ? linked?.professorId === currentUser.id : false
  const canModerate = canCorrect || question?.authorId === currentUser.id && canInteract

  if (!question) return <div role="alert">Dúvida não encontrada.</div>
  const liked = question.likedUserIds.includes(currentUser.id)
  const following = question.followingUserIds.includes(currentUser.id)
  const alreadyReported = state.reports.some(report => report.questionId === question.id && report.reporterId === currentUser.id && report.status === 'Pendente')
  const submitReport = async () => {
    try {
      await mutate(`forum/questions/${question.id}/report`, 'POST', { reason: reportReason, details: reportDetails })
      setReportOpen(false); setReportReason(''); setReportDetails(''); setActionMessage('Denúncia enviada para análise.')
    } catch (cause) { setActionMessage(cause instanceof Error ? cause.message : 'Não foi possível enviar a denúncia.') }
  }

  return (
    <>
      <PageTitle title={question.title} description={`${monitoriaTitle(state.monitorias, question.monitoriaId)} · ${userName(state.users, question.authorId)}`} />
      <Card className="rounded-md">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={question.status} />
            <Badge variant="secondary">{question.tag}</Badge>
          </div>
          <p className="text-sm leading-6 text-zinc-700">{question.description}</p>
          <div className="flex flex-wrap gap-2">
            {canInteract ? <Button variant={liked ? 'default' : 'outline'} size="sm" aria-pressed={liked} onClick={async () => { try { await mutate(`forum/questions/${question.id}/like`, 'POST', {}); setActionMessage(liked ? 'Curtida removida.' : 'Dúvida curtida.') } catch (cause) { setActionMessage(cause instanceof Error ? cause.message : 'Não foi possível atualizar a curtida.') } }}><Heart className="size-4" />{liked ? 'Curtido' : 'Curtir'} {question.likes}</Button> : null}
            {canInteract ? <Button variant={following ? 'default' : 'outline'} size="sm" aria-pressed={following} onClick={async () => { try { await mutate(`forum/questions/${question.id}/follow`, 'POST', {}); setActionMessage(following ? 'Você deixou de seguir a dúvida.' : 'Você receberá atualizações desta dúvida.') } catch (cause) { setActionMessage(cause instanceof Error ? cause.message : 'Não foi possível atualizar o acompanhamento.') } }}><Bell className="size-4" />{following ? 'Seguindo' : 'Seguir'}</Button> : null}
            {canInteract && question.authorId !== currentUser.id ? <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm" disabled={alreadyReported}><Flag className="size-4" />{alreadyReported ? 'Denúncia pendente' : 'Denunciar'}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Denunciar dúvida</DialogTitle><DialogDescription>A equipe da monitoria analisará o conteúdo. O autor não verá quem enviou a denúncia.</DialogDescription></DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2"><Label htmlFor="report-reason">Motivo</Label><Select value={reportReason} onValueChange={setReportReason}><SelectTrigger id="report-reason"><SelectValue placeholder="Escolha um motivo" /></SelectTrigger><SelectContent>{['Conteúdo ofensivo', 'Spam', 'Informação incorreta', 'Outro'].map(reason => <SelectItem key={reason} value={reason}>{reason}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label htmlFor="report-details">Detalhes {reportReason === 'Outro' ? '(obrigatório)' : '(opcional)'}</Label><Textarea id="report-details" value={reportDetails} onChange={event => setReportDetails(event.target.value)} placeholder="Explique o que a equipe deve verificar." /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setReportOpen(false)}>Cancelar</Button><Button onClick={submitReport} disabled={!reportReason || reportReason === 'Outro' && !reportDetails.trim()}>Enviar denúncia</Button></DialogFooter>
              </DialogContent>
            </Dialog> : null}
            {canModerate ? (
              <>
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline" size="sm"><Pencil className="size-4" />Editar</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Editar duvida</DialogTitle></DialogHeader>
                    <Input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                    <DialogFooter>
                      <Button onClick={() => fire(mutate(`forum/questions/${question.id}`, 'PATCH', { title: editTitle }))}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="size-4" />Excluir</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Excluir duvida?</DialogTitle><DialogDescription>Esta acao remove a duvida e respostas do prototipo local.</DialogDescription></DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteOpen(false)}>Nao</Button>
                      <Button variant="destructive" onClick={async () => {
                        try { await mutate(`forum/questions/${question.id}`, 'DELETE'); router.push('/forum') }
                        catch (cause) { window.alert(cause instanceof Error ? cause.message : 'Erro ao excluir.') }
                      }}>Sim, excluir</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : null}
          </div>
          {!canInteract && currentUser.role === 'Aluno' ? <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">A leitura é pública, mas uma matrícula aprovada nesta monitoria é necessária para interagir.</p> : null}
          {actionMessage ? <p role="status" className="text-sm text-zinc-600">{actionMessage}</p> : null}
        </CardContent>
      </Card>
      <section className="mt-5 space-y-3">
        <h2 className="text-lg font-semibold">Respostas</h2>
        {answers.map((answer) => (
          <Card key={answer.id} className={cn('rounded-md', answer.correct && 'border-amo-cyan bg-amo-ice')}>
            <CardContent className="p-4 text-sm text-zinc-700">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-zinc-950">{userName(state.users, answer.authorId)}</span>
                <div className="flex items-center gap-2">
                  {answer.correct ? <Badge className="border-0 bg-amo-navy text-white">Resposta correta</Badge> : null}
                  {canCorrect ? (
                    <Button size="sm" variant="outline" onClick={() => fire(mutate(`forum/questions/${question.id}/correct`, 'POST', { answerId: answer.id }))}>{answer.correct ? 'Desmarcar' : 'Marcar correta'}</Button>
                  ) : null}
                </div>
              </div>
              {answer.body}
            </CardContent>
          </Card>
        ))}
      </section>
      {canInteract ? <Card className="mt-5 rounded-md">
        <CardContent className="space-y-3 p-4">
          <Label>Responder</Label>
          <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escreva uma resposta objetiva." />
          <Button onClick={async () => {
            if (!draft.trim()) return
            try { await mutate(`forum/questions/${question.id}/answers`, 'POST', { body: draft }); setDraft('') }
            catch (cause) { window.alert(cause instanceof Error ? cause.message : 'Erro ao responder.') }
          }}><MessageCircle className="size-4" />Enviar resposta</Button>
        </CardContent>
      </Card> : null}
    </>
  )
}

function ConsultationRequestDialog() {
  const { state, currentUser, mutate } = useAmoStore()
  const eligibleMonitorias = state.monitorias.filter(item => state.enrollments.some(enrollment => enrollment.studentId === currentUser.id && enrollment.monitoriaId === item.id && enrollment.status === 'Aprovada'))
  const [monitoriaId, setMonitoriaId] = useState(eligibleMonitorias[0]?.id ?? '')
  const available = state.availabilities.filter(item => item.status === 'Disponível' && item.monitoriaId === monitoriaId)
  const [availabilityId, setAvailabilityId] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const selected = available.find(item => item.id === availabilityId)
  const save = async () => {
    if (!availabilityId || !subject.trim() || !description.trim()) { setMessage('Escolha um horário e descreva o conteúdo e sua dificuldade.'); return }
    try {
      await mutate('appointments', 'POST', { availabilityId, subject, description })
      setMessage('Solicitação enviada. O responsável precisa confirmá-la.'); setAvailabilityId(''); setSubject(''); setDescription('')
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Não foi possível solicitar a consultoria.') }
  }
  return <DialogContent>
    <DialogHeader><DialogTitle>Agendar consultoria</DialogTitle><DialogDescription>Escolha um horário publicado pela equipe e informe o conteúdo em que precisa de ajuda.</DialogDescription></DialogHeader>
    <div className="grid gap-4">
      <div className="grid gap-2"><Label htmlFor="consultation-monitoria">Monitoria</Label><Select value={monitoriaId} onValueChange={value => { setMonitoriaId(value); setAvailabilityId('') }}><SelectTrigger id="consultation-monitoria"><SelectValue placeholder="Escolha a monitoria" /></SelectTrigger><SelectContent>{eligibleMonitorias.map(item => <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid gap-2"><Label htmlFor="consultation-slot">Horário e responsável</Label><Select value={availabilityId} onValueChange={setAvailabilityId}><SelectTrigger id="consultation-slot"><SelectValue placeholder={available.length ? 'Escolha um horário' : 'Nenhum horário disponível'} /></SelectTrigger><SelectContent>{available.map(item => <SelectItem key={item.id} value={item.id}>{toDateLabel(item.date)} às {item.time} · {userName(state.users, item.providerId)}</SelectItem>)}</SelectContent></Select></div>
      {selected ? <div className="grid gap-2 rounded-md bg-amo-ice p-3 text-sm sm:grid-cols-2"><span>{selected.type === 'Virtual' ? <Video className="mr-2 inline size-4" /> : <MapPin className="mr-2 inline size-4" />}{selected.type}</span><span><CalendarClock className="mr-2 inline size-4" />{selected.durationMinutes} minutos</span></div> : null}
      <div className="grid gap-2"><Label htmlFor="consultation-subject">Conteúdo</Label><Input id="consultation-subject" value={subject} onChange={event => setSubject(event.target.value)} placeholder="Ex.: pilhas e filas" /></div>
      <div className="grid gap-2"><Label htmlFor="consultation-description">Dificuldade ou objetivo</Label><Textarea id="consultation-description" value={description} onChange={event => setDescription(event.target.value)} placeholder="Explique o que tentou e onde precisa de orientação." /></div>
      {message ? <p role="status" className="rounded-md bg-zinc-100 p-3 text-sm">{message}</p> : null}
    </div>
    <DialogFooter><Button onClick={save} disabled={!availabilityId}>Solicitar consultoria</Button></DialogFooter>
  </DialogContent>
}

function AvailabilityDialog() {
  const { state, currentUser, mutate } = useAmoStore()
  const monitorias = state.monitorias.filter(item => item.professorId === currentUser.id || item.monitorIds.includes(currentUser.id))
  const [monitoriaId, setMonitoriaId] = useState(monitorias[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('30')
  const [type, setType] = useState<AmoAvailability['type']>('Presencial')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  const save = async () => {
    try {
      await mutate('appointments/availability', 'POST', { monitoriaId, date, time, durationMinutes: Number(durationMinutes), type, location })
      setDate(''); setTime(''); setLocation(''); setMessage('Horário publicado.')
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Não foi possível publicar o horário.') }
  }
  return <DialogContent>
    <DialogHeader><DialogTitle>Publicar horário</DialogTitle><DialogDescription>Este horário ficará disponível para alunos com matrícula aprovada.</DialogDescription></DialogHeader>
    <div className="grid gap-4">
      <div className="grid gap-2"><Label htmlFor="availability-monitoria">Monitoria</Label><Select value={monitoriaId} onValueChange={setMonitoriaId}><SelectTrigger id="availability-monitoria"><SelectValue /></SelectTrigger><SelectContent>{monitorias.map(item => <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid gap-3 sm:grid-cols-3"><div className="grid gap-2"><Label htmlFor="availability-date">Data</Label><Input id="availability-date" type="date" value={date} onChange={event => setDate(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="availability-time">Horário</Label><Input id="availability-time" type="time" value={time} onChange={event => setTime(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="availability-duration">Duração</Label><Select value={durationMinutes} onValueChange={setDurationMinutes}><SelectTrigger id="availability-duration"><SelectValue /></SelectTrigger><SelectContent>{['30','45','60'].map(value => <SelectItem key={value} value={value}>{value} min</SelectItem>)}</SelectContent></Select></div></div>
      <div className="grid gap-2"><Label htmlFor="availability-type">Modalidade</Label><Select value={type} onValueChange={(value: AmoAvailability['type']) => { setType(value); setLocation('') }}><SelectTrigger id="availability-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Presencial">Presencial</SelectItem><SelectItem value="Virtual">Remota</SelectItem></SelectContent></Select></div>
      <div className="grid gap-2"><Label htmlFor="availability-location">{type === 'Virtual' ? 'Link da sala virtual' : 'Sala ou local'}</Label><Input id="availability-location" type={type === 'Virtual' ? 'url' : 'text'} value={location} onChange={event => setLocation(event.target.value)} placeholder={type === 'Virtual' ? 'https://meet.google.com/...' : 'Ex.: Laboratório 03'} /></div>
      {message ? <p role="status" className="rounded-md bg-zinc-100 p-3 text-sm">{message}</p> : null}
    </div>
    <DialogFooter><Button onClick={save} disabled={!monitoriaId || !date || !time || !location}>Publicar horário</Button></DialogFooter>
  </DialogContent>
}

function ConsultationDetails({ appointment }: { appointment: AmoAppointment }) {
  const { state } = useAmoStore()
  return <DialogContent><DialogHeader><DialogTitle>{appointment.subject}</DialogTitle><DialogDescription>{monitoriaTitle(state.monitorias, appointment.monitoriaId)}</DialogDescription></DialogHeader>
    <dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-zinc-500">Aluno</dt><dd className="font-medium">{userName(state.users, appointment.studentId)}</dd></div><div><dt className="text-zinc-500">Responsável</dt><dd className="font-medium">{userName(state.users, appointment.providerId)}</dd></div><div><dt className="text-zinc-500">Data e horário</dt><dd>{toDateLabel(appointment.date)} às {appointment.time}</dd></div><div><dt className="text-zinc-500">Modalidade</dt><dd>{appointment.type} · {appointment.durationMinutes} minutos</dd></div><div className="sm:col-span-2"><dt className="text-zinc-500">Dificuldade ou objetivo</dt><dd>{appointment.description}</dd></div>{appointment.status === 'Confirmado' ? <div className="sm:col-span-2"><dt className="text-zinc-500">Acesso</dt><dd>{appointment.type === 'Virtual' ? <a className="font-medium text-amo-blue underline" href={appointment.location} target="_blank" rel="noreferrer">Entrar na sala virtual</a> : appointment.location}</dd></div> : null}</dl>
  </DialogContent>
}

export function AppointmentsPage() {
  const { state, currentUser, mutate } = useAmoStore()
  const [selectedMonitoria, setSelectedMonitoria] = useState('todos')
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [message, setMessage] = useState('')
  const isProvider = currentUser.role === 'Monitor' || currentUser.role === 'Professor'
  const eligibleMonitorias = state.monitorias.filter(item => state.enrollments.some(enrollment => enrollment.studentId === currentUser.id && enrollment.monitoriaId === item.id && enrollment.status === 'Aprovada'))
  const ownSlots = state.availabilities.filter(item => item.providerId === currentUser.id)
  const filtered = state.appointments.filter(item => selectedMonitoria === 'todos' || item.monitoriaId === selectedMonitoria).filter(item => !dateFilter || item.date === dateFilter).filter(item => `${item.subject} ${item.description} ${userName(state.users, item.studentId)}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
  const groups = ['Pendente', 'Confirmado', 'Negado', 'Cancelado', 'Concluido'] as const
  const setStatus = async (id: string, status: AmoAppointment['status']) => { try { await mutate(`appointments/${id}`, 'PATCH', { status }); setMessage('Consultoria atualizada.') } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Não foi possível atualizar a consultoria.') } }
  const action = currentUser.role === 'Aluno' ? (eligibleMonitorias.length ? <Dialog><DialogTrigger asChild><Button><CalendarPlus className="size-4" />Agendar consultoria</Button></DialogTrigger><ConsultationRequestDialog /></Dialog> : <Button asChild variant="outline"><Link href="/monitorias">Solicitar matrícula</Link></Button>) : isProvider ? <Dialog><DialogTrigger asChild><Button><CalendarPlus className="size-4" />Publicar horário</Button></DialogTrigger><AvailabilityDialog /></Dialog> : null
  return <>
    <PageTitle title="Consultorias" description="Atendimentos individuais, presenciais ou remotos, sobre conteúdos das suas disciplinas." action={action} />
    {message ? <p role="status" className="mb-4 rounded-md bg-zinc-100 p-3 text-sm">{message}</p> : null}
    {isProvider && ownSlots.length ? <section className="mb-5"><h2 className="mb-2 text-lg font-semibold">Meus horários publicados</h2><div className="grid gap-2 md:grid-cols-2">{ownSlots.map(item => <div key={item.id} className="flex items-center justify-between rounded-md border bg-white p-3 text-sm"><div><p className="font-medium">{monitoriaTitle(state.monitorias, item.monitoriaId)}</p><p className="text-zinc-600">{toDateLabel(item.date)} às {item.time} · {item.durationMinutes} min · {item.status}</p></div>{item.status === 'Disponível' ? <Button size="sm" variant="outline" onClick={async () => { try { await mutate(`appointments/availability/${item.id}`, 'DELETE'); setMessage('Horário removido.') } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Não foi possível remover o horário.') } }}>Remover</Button> : null}</div>)}</div></section> : null}
    <div className="mb-4 grid gap-3 lg:grid-cols-[auto_auto_1fr]"><Select value={selectedMonitoria} onValueChange={setSelectedMonitoria}><SelectTrigger className="h-11 w-full bg-white lg:w-80"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todas as monitorias</SelectItem>{state.monitorias.map(item => <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>)}</SelectContent></Select><Input aria-label="Filtrar por data" type="date" value={dateFilter} onChange={event => setDateFilter(event.target.value)} className="h-11 bg-white" /><SearchBox value={query} onChange={setQuery} placeholder="Filtrar por aluno, conteúdo ou dificuldade" /></div>
    <Tabs defaultValue="Pendente"><TabsList className="mb-4 grid h-auto w-full grid-cols-2 sm:grid-cols-5">{groups.map(group => <TabsTrigger key={group} value={group}>{group === 'Negado' ? 'Recusada' : group}</TabsTrigger>)}</TabsList>{groups.map(group => <TabsContent key={group} value={group} className="space-y-3">{filtered.filter(item => item.status === group).map(item => {
      const linked = state.monitorias.find(monitoria => monitoria.id === item.monitoriaId)
      const canManage = currentUser.role === 'Administrador' || linked?.professorId === currentUser.id || linked?.monitorIds.includes(currentUser.id)
      return <Card key={item.id}><CardContent className="p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-2 flex flex-wrap gap-2"><StatusBadge status={item.status === 'Negado' ? 'Recusada' : item.status} /><Badge variant="secondary">{item.type}</Badge></div><h2 className="font-semibold">{item.subject}</h2><p className="text-sm text-zinc-600">{monitoriaTitle(state.monitorias, item.monitoriaId)} · com {userName(state.users, item.providerId)}</p><p className="text-sm text-zinc-600">{toDateLabel(item.date)} às {item.time} · {item.durationMinutes} minutos</p></div><div className="flex flex-wrap gap-2"><Dialog><DialogTrigger asChild><Button variant="outline" size="sm"><Eye className="size-4" />Detalhes</Button></DialogTrigger><ConsultationDetails appointment={item} /></Dialog>{item.status === 'Pendente' && canManage ? <><Button size="sm" onClick={() => void setStatus(item.id, 'Confirmado')}><Check className="size-4" />Confirmar</Button><Button variant="outline" size="sm" onClick={() => void setStatus(item.id, 'Negado')}><X className="size-4" />Recusar</Button></> : null}{item.status === 'Confirmado' && canManage ? <Button size="sm" onClick={() => void setStatus(item.id, 'Concluido')}><CheckCircle2 className="size-4" />Concluir</Button> : null}{item.studentId === currentUser.id && (item.status === 'Pendente' || item.status === 'Confirmado') ? <Button variant="destructive" size="sm" onClick={() => void setStatus(item.id, 'Cancelado')}>Cancelar</Button> : null}</div></div></CardContent></Card>
    })}{!filtered.some(item => item.status === group) ? <div className="rounded-md border border-dashed bg-white p-6 text-center text-sm text-zinc-600">Nenhuma consultoria neste estado.</div> : null}</TabsContent>)}</Tabs>
  </>
}

export function UserChoicePage() {
  return (
    <>
      <PageTitle title="Novo usuario" description="Cadastre usuários internos ou acesse a gestão administrativa." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/usuarios/novo/professor"><Card className="rounded-md hover:border-amo-cyan"><CardContent className="p-5"><UserPlus className="mb-4 size-8 text-amo-blue" /><h2 className="text-lg font-semibold">Professor</h2><p className="mt-1 text-sm text-zinc-600">Nome, e-mail e SIAPE.</p></CardContent></Card></Link>
        <Link href="/usuarios/novo/monitor"><Card className="rounded-md hover:border-amo-cyan"><CardContent className="p-5"><CheckCircle2 className="mb-4 size-8 text-amo-cyan" /><h2 className="text-lg font-semibold">Monitor</h2><p className="mt-1 text-sm text-zinc-600">Matricula, curso e monitoria.</p></CardContent></Card></Link>
        <Link href="/admin"><Card className="rounded-md hover:border-amo-cyan"><CardContent className="p-5"><SlidersHorizontal className="mb-4 size-8 text-zinc-700" /><h2 className="text-lg font-semibold">Admin</h2><p className="mt-1 text-sm text-zinc-600">CRUDs locais de cursos, disciplinas e turmas.</p></CardContent></Card></Link>
      </div>
    </>
  )
}

export function UserFormPage({ type }: { type: 'professor' | 'monitor' }) {
  const { state, mutate } = useAmoStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [registration, setRegistration] = useState('')
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? 'cc')
  const [error, setError] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const title = type === 'professor' ? 'Novo professor' : 'Novo monitor'

  const save = async () => {
    if (!name.trim() || !email.includes('@') || !registration.trim()) {
      setError('Informe nome, e-mail valido e identificador institucional.')
      return
    }
    try {
      const result = await mutate<{ temporaryPassword: string }>('admin/users', 'POST', { name, email, registration, courseId, role: type === 'professor' ? 'Professor' : 'Monitor' })
      setTemporaryPassword(result.temporaryPassword)
      setName(''); setEmail(''); setRegistration(''); setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Cadastro não concluído.') }
  }

  return (
    <>
      <PageTitle title={title} description="Conta criada pela administração." />
      <Card className="rounded-md">
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label>Nome</Label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" /></div>
            <div className="grid gap-2"><Label>E-mail</Label><Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="email@amo.edu" /></div>
            <div className="grid gap-2"><Label>{type === 'professor' ? 'SIAPE' : 'Matricula'}</Label><Input value={registration} onChange={(event) => setRegistration(event.target.value)} /></div>
            <div className="grid gap-2"><Label>Curso</Label><Select value={courseId} onValueChange={setCourseId}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{state.courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <p className="rounded-md bg-amo-ice p-3 text-sm text-zinc-700">Depois do cadastro, vincule esta pessoa em <strong>Administração → Monitorias</strong>.</p>
          {temporaryPassword ? <div role="status" className="rounded-md bg-amo-ice p-3">Senha temporária (exibida uma vez): <strong>{temporaryPassword}</strong></div> : null}
          {error ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
          <div className="flex justify-end"><Button onClick={save}><Save className="size-4" />Salvar cadastro</Button></div>
        </CardContent>
      </Card>
    </>
  )
}

export function ProfilePage({ type }: { type?: 'student' | 'professor' | 'monitor'; editable?: boolean }) {
  const { state, currentUser, mutate } = useAmoStore()
  const selected = type === 'professor' ? (currentUser.role === 'Professor' ? currentUser : state.users.find((user) => user.role === 'Professor')) : type === 'monitor' ? (currentUser.role === 'Monitor' ? currentUser : state.users.find((user) => user.role === 'Monitor')) : currentUser
  const profile = selected ?? currentUser
  const editable = profile.id === currentUser.id
  const [name, setName] = useState(profile.name)
  const [courseId, setCourseId] = useState(profile.courseId)
  const [avatar, setAvatar] = useState(profile.avatar ?? '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const saveProfile = async () => {
    try { await mutate('me/profile', 'PATCH', { name, courseId, avatar }); setMessage('Perfil atualizado.') }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Erro ao salvar perfil.') }
  }
  const changePassword = async () => {
    try { await mutate('me/password', 'PATCH', { oldPassword, newPassword }); setMessage('Senha atualizada.'); setOldPassword(''); setNewPassword('') }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Erro ao alterar senha.') }
  }

  return (
    <>
      <PageTitle title="Perfil" description="Dados do usuario, edicao local e troca de senha." action={editable ? <Button onClick={saveProfile}><Pencil className="size-4" />Salvar perfil</Button> : null} />
      <Card className="rounded-md">
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 place-items-center overflow-hidden rounded-md bg-amo-ice text-2xl font-semibold text-amo-navy">
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              {editable ? <Input value={name} onChange={(event) => setName(event.target.value)} /> : <h2 className="text-xl font-semibold">{profile.name}</h2>}
              <p className="mt-1 text-sm text-zinc-600">{profile.role}{editable ? ` · ${profile.email}` : ''}</p>
            </div>
          </div>
          {editable ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Curso</Label><Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Foto por URL</Label><Input value={avatar} onChange={(event) => setAvatar(event.target.value)} placeholder="https://..." /></div>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3">
            {editable ? <div className="rounded-md bg-zinc-50 p-4"><span className="block text-xs text-zinc-500">Registro</span>{profile.registration}</div> : null}
            <div className="rounded-md bg-zinc-50 p-4"><span className="block text-xs text-zinc-500">Curso</span>{state.courses.find((course) => course.id === profile.courseId)?.name}</div>
            <div className="rounded-md bg-zinc-50 p-4"><span className="block text-xs text-zinc-500">Status</span>{profile.active ? 'Ativo' : 'Restrito'}</div>
          </div>
        </CardContent>
      </Card>
      {editable ? <Card className="mt-5 rounded-md">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="grid gap-2"><Label>Senha atual</Label><Input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} /></div>
          <div className="grid gap-2"><Label>Nova senha</Label><Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></div>
          <Button onClick={changePassword}><KeyRound className="size-4" />Trocar senha</Button>
        </CardContent>
      </Card> : null}
      {message ? <div className="mt-4 rounded-md bg-amo-ice p-3 text-sm text-amo-navy">{message}</div> : null}
    </>
  )
}

export function NotificationsPage() {
  const { state, mutate } = useAmoStore()
  const [showToast, setShowToast] = useState(true)
  return (
    <>
      <PageTitle title="Notificacoes" description="Alertas gerados por forum, agenda e frequencia." action={<Button variant="outline" onClick={() => fire(mutate('me/notifications', 'PATCH', {}))}>Marcar como lidas</Button>} />
      {showToast && state.notifications.some(notification => notification.unread) ? (
        <div className="fixed right-4 top-20 z-40 w-[calc(100%-2rem)] max-w-sm rounded-md border border-amo-border bg-white p-4 shadow-lg">
          <div className="flex gap-3"><Bell className="size-5 text-amo-blue" /><div className="min-w-0 flex-1"><p className="font-medium">Nova notificacao</p><p className="text-sm text-zinc-600">Voce tem mensagens nao lidas.</p></div><button className="text-zinc-500" onClick={() => setShowToast(false)}><MoreHorizontal className="size-4" /></button></div>
        </div>
      ) : null}
      <div className="space-y-3">
        {state.notifications.map((notification) => (
          <Card key={notification.id} className={cn('rounded-md', notification.unread && 'border-amo-cyan')}>
            <CardContent className="flex gap-3 p-4"><div className={cn('mt-1 size-2 rounded-full', notification.unread ? 'bg-amo-navy' : 'bg-zinc-300')} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{notification.title}</h2><span className="text-xs text-zinc-500">{notification.time}</span></div><p className="mt-1 text-sm text-zinc-600">{notification.message}</p></div></CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

export function SettingsPage() {
  const { state, currentUser, mutate } = useAmoStore()
  const setSetting = (key: keyof typeof state.settings, value: boolean) => fire(key === 'userRegistration' ? mutate('admin/catalog', 'POST', { action: 'registration.set', open: value }) : mutate('me/settings', 'PATCH', { [key]: value }))
  const settings: Array<[keyof typeof state.settings, string]> = [
    ['forum', 'Receber respostas do forum'],
    ['appointments', 'Lembrar agendamentos'],
    ['email', 'Mostrar notificacoes por e-mail'],
  ]
  if (currentUser.role === 'Administrador') settings.push(['userRegistration', 'Permitir cadastro de usuários'])
  return (
    <>
      <PageTitle title="Configurações" description="Preferências da sua conta." />
      <Card className="rounded-md"><CardContent className="divide-y p-0">{settings.map(([key, label]) => <div key={key} className="flex items-center justify-between gap-4 p-4"><div><h2 className="font-medium">{label}</h2></div><Switch checked={state.settings[key]} onCheckedChange={(value) => setSetting(key, value)} /></div>)}</CardContent></Card>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">{currentUser.role === 'Administrador' ? <Button variant="outline" onClick={() => { if (window.confirm('Restaurar todos os dados de demonstração?')) fire(mutate('admin/reset', 'POST', {})) }}>Restaurar dados mock</Button> : null}<Button variant="destructive" onClick={async () => { if (!window.confirm('Desativar sua conta?')) return; try { await apiRequest('me/deactivate', 'PATCH', {}); window.location.href = '/' } catch (cause) { window.alert(cause instanceof Error ? cause.message : 'Erro ao desativar conta.') } }}>Desativar conta</Button></div>
    </>
  )
}
