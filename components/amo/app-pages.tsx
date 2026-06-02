'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
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
  X,
} from 'lucide-react'

import {
  type AmoAppointment,
  type AmoCourse,
  type AmoDiscipline,
  type AmoMonitoria,
  type AmoQuestion,
  type AmoUser,
  type AmoUserRole,
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
    status === 'Aberta' || status === 'Confirmado'
      ? 'bg-amo-ice text-amo-navy'
      : status === 'Respondida' || status === 'Concluido'
        ? 'bg-amo-border text-amo-deep'
        : status === 'Pendente'
          ? 'bg-amber-100 text-amber-800'
          : status === 'Negado' || status === 'Cancelado'
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
  const { state, currentUser } = useAmoStore()
  const selectedCourse = searchParams.get('curso') ?? 'todos'
  const [query, setQuery] = useState('')

  const filtered = state.monitorias.filter((monitoria) => {
    const courseMatch = selectedCourse === 'todos' || monitoria.courseId === selectedCourse
    const text = `${monitoria.subject} ${monitoria.schedule} ${monitoria.room} ${monitoria.tags.join(' ')}`.toLowerCase()
    return courseMatch && text.includes(query.toLowerCase())
  })

  const enrolled = state.classes.flatMap((klass) =>
    klass.studentIds.includes(currentUser.id) ? state.monitorias.filter((item) => item.disciplineId === klass.disciplineId) : [],
  )

  return (
    <>
      <PageTitle
        title="Monitorias"
        description="Consulte horarios, salas, contato do monitor e forum de cada monitoria."
      />
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
      <div className="mb-5 rounded-md border bg-white p-4 text-sm text-zinc-700">
        <span className="font-medium">Minhas monitorias:</span> {enrolled.length ? enrolled.map((item) => item.subject).join(', ') : 'nenhuma matricula encontrada no mock.'}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((monitoria) => (
          <Link key={monitoria.id} href={`/forum?monitoria=${monitoria.id}`}>
            <Card className="h-full rounded-md transition hover:border-amo-cyan hover:shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <StatusBadge status={monitoria.status} />
                    <h2 className="mt-3 text-lg font-semibold">{monitoria.subject}</h2>
                    <p className="mt-1 text-sm text-zinc-600">{userName(state.users, monitoria.monitorId)} · {userName(state.users, monitoria.professorId)}</p>
                  </div>
                  <ChevronRight className="size-5 text-zinc-400" />
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-md bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">Horario</span>{monitoria.schedule}</div>
                  <div className="rounded-md bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">Local</span>{monitoria.room}</div>
                  <div className="rounded-md bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">Contato</span>{monitoria.contact}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">{monitoria.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
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
                {question.reported ? <Badge className="border-0 bg-rose-100 text-rose-800">Denunciada</Badge> : null}
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

export function ForumPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state } = useAmoStore()
  const monitoriaId = searchParams.get('monitoria') ?? 'todas'
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recentes')
  const [quickFilter, setQuickFilter] = useState('todas')

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
        (quickFilter === 'minhas' && question.authorId === 'u-student') ||
        (quickFilter === 'seguindo' && question.followingUserIds.includes('u-student'))
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
  }, [monitoriaId, query, quickFilter, sort, state.answers, state.questions])

  return (
    <div className="relative">
      <PageTitle
        title="Forum"
        description="Dúvidas organizadas por monitoria, tag, respostas e curtidas."
        action={<Button asChild><Link href="/forum/nova-duvida"><Plus className="size-4" />Nova duvida</Link></Button>}
      />
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
        <Button asChild size="icon-lg" className="rounded-full shadow-lg"><Link href="/forum/nova-duvida"><Plus className="size-5" /><span className="sr-only">Nova duvida</span></Link></Button>
        <Button asChild variant="secondary" size="icon-lg" className="rounded-full shadow-lg"><Link href="/usuarios/novo"><UserPlus className="size-5" /><span className="sr-only">Novo usuario</span></Link></Button>
      </div>
    </div>
  )
}

export function NewQuestionPage() {
  const router = useRouter()
  const { state, currentUser, update, ids, notify } = useAmoStore()
  const [monitoriaId, setMonitoriaId] = useState(state.monitorias[0]?.id ?? 'alg')
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (!title.trim() || !tag.trim() || !description.trim()) {
      setError('Informe titulo, tag e descricao.')
      return
    }
    const id = ids.createId('q')
    update((current) => ({
      ...current,
      questions: [
        {
          id,
          monitoriaId,
          title: title.trim(),
          tag: tag.trim(),
          description: description.trim(),
          authorId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'Aberta',
          likes: 0,
          views: 0,
          followingUserIds: [],
          reported: false,
        },
        ...current.questions,
      ],
    }))
    notify('Duvida cadastrada', title, 'forum')
    router.push(`/forum/${id}`)
  }

  return (
    <>
      <PageTitle title="Nova duvida" description="Informe titulo, tag e descricao da duvida." />
      <Card className="rounded-md">
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <div className="grid gap-2">
            <Label>Monitoria</Label>
            <Select value={monitoriaId} onValueChange={setMonitoriaId}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>{state.monitorias.map((item) => <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>)}</SelectContent>
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
      </Card>
    </>
  )
}

export function QuestionDetailPage() {
  const params = useParams<{ duvidaId: string }>()
  const { state, currentUser, update, ids, notify } = useAmoStore()
  const question = state.questions.find((item) => item.id === params.duvidaId) ?? state.questions[0]
  const answers = state.answers.filter((answer) => answer.questionId === question.id)
  const [draft, setDraft] = useState('')
  const [editTitle, setEditTitle] = useState(question.title)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const router = useRouter()

  const canModerate = currentUser.role === 'Monitor' || currentUser.role === 'Professor' || currentUser.role === 'Administrador' || question.authorId === currentUser.id

  if (!question) return null

  return (
    <>
      <PageTitle title={question.title} description={`${monitoriaTitle(state.monitorias, question.monitoriaId)} · ${userName(state.users, question.authorId)}`} />
      <Card className="rounded-md">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={question.status} />
            <Badge variant="secondary">{question.tag}</Badge>
            {question.reported ? <Badge className="border-0 bg-rose-100 text-rose-800">Denunciada</Badge> : null}
          </div>
          <p className="text-sm leading-6 text-zinc-700">{question.description}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => update((current) => ({ ...current, questions: current.questions.map((item) => item.id === question.id ? { ...item, likes: item.likes + 1 } : item) }))}><Heart className="size-4" />Curtir {question.likes}</Button>
            <Button variant="outline" size="sm" onClick={() => update((current) => ({ ...current, questions: current.questions.map((item) => item.id === question.id ? { ...item, reported: true } : item) }))}><Flag className="size-4" />Denunciar</Button>
            {canModerate ? (
              <>
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline" size="sm"><Pencil className="size-4" />Editar</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Editar duvida</DialogTitle></DialogHeader>
                    <Input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                    <DialogFooter>
                      <Button onClick={() => update((current) => ({ ...current, questions: current.questions.map((item) => item.id === question.id ? { ...item, title: editTitle, updatedAt: new Date().toISOString() } : item) }))}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="size-4" />Excluir</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Excluir duvida?</DialogTitle><DialogDescription>Esta acao remove a duvida e respostas do prototipo local.</DialogDescription></DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteOpen(false)}>Nao</Button>
                      <Button variant="destructive" onClick={() => {
                        update((current) => ({
                          ...current,
                          questions: current.questions.filter((item) => item.id !== question.id),
                          answers: current.answers.filter((item) => item.questionId !== question.id),
                        }))
                        notify('Duvida excluida', question.title, 'forum')
                        router.push('/forum')
                      }}>Sim, excluir</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : null}
          </div>
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
                  {currentUser.role === 'Monitor' ? (
                    <Button size="sm" variant="outline" onClick={() => update((current) => ({
                      ...current,
                      answers: current.answers.map((item) => item.questionId === question.id ? { ...item, correct: item.id === answer.id ? !answer.correct : false } : item),
                      questions: current.questions.map((item) => item.id === question.id ? { ...item, status: answer.correct ? 'Aberta' : 'Respondida' } : item),
                    }))}>{answer.correct ? 'Desmarcar' : 'Marcar correta'}</Button>
                  ) : null}
                </div>
              </div>
              {answer.body}
            </CardContent>
          </Card>
        ))}
      </section>
      <Card className="mt-5 rounded-md">
        <CardContent className="space-y-3 p-4">
          <Label>Responder</Label>
          <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escreva uma resposta objetiva." />
          <Button onClick={() => {
            if (!draft.trim()) return
            update((current) => ({
              ...current,
              answers: [{ id: ids.createId('ans'), questionId: question.id, authorId: currentUser.id, body: draft.trim(), createdAt: new Date().toISOString(), correct: false }, ...current.answers],
              questions: current.questions.map((item) => item.id === question.id ? { ...item, status: 'Respondida', updatedAt: new Date().toISOString() } : item),
            }))
            notify('Nova resposta no forum', question.title, 'forum')
            setDraft('')
          }}><MessageCircle className="size-4" />Enviar resposta</Button>
        </CardContent>
      </Card>
    </>
  )
}

function AppointmentDialog({ appointment }: { appointment?: AmoAppointment }) {
  const { state, currentUser, update, ids, notify } = useAmoStore()
  const [monitoriaId, setMonitoriaId] = useState(appointment?.monitoriaId ?? state.monitorias[0]?.id ?? 'alg')
  const [monitorId, setMonitorId] = useState(appointment?.monitorId ?? 'opcional')
  const [subject, setSubject] = useState(appointment?.subject ?? '')
  const [description, setDescription] = useState(appointment?.description ?? '')
  const [date, setDate] = useState(appointment?.date ?? '2026-06-04')
  const [time, setTime] = useState(appointment?.time ?? '15:00')
  const [type, setType] = useState<AmoAppointment['type']>(appointment?.type ?? 'Presencial')
  const [error, setError] = useState('')
  const monitors = state.users.filter((user) => user.role === 'Monitor')

  const save = () => {
    if (!subject.trim() || !description.trim() || !date || !time) {
      setError('Informe assunto, descricao, data e horario.')
      return
    }
    const duplicate = state.appointments.some((item) => !appointment && item.studentId === currentUser.id && item.date === date && item.status !== 'Cancelado')
    if (duplicate) {
      setError('O aluno nao pode ultrapassar 1 agendamento diario.')
      return
    }
    update((current) => {
      const payload: AmoAppointment = {
        id: appointment?.id ?? ids.createId('ag'),
        monitoriaId,
        studentId: appointment?.studentId ?? currentUser.id,
        monitorId: monitorId === 'opcional' ? undefined : monitorId,
        subject: subject.trim(),
        description: description.trim(),
        date,
        time,
        type,
        status: appointment?.status ?? 'Pendente',
        meetingUrl: type === 'Virtual' ? `https://meet.google.com/amo-${monitoriaId}` : undefined,
        tags: subject.toLowerCase().split(' ').slice(0, 3),
      }
      return { ...current, appointments: appointment ? current.appointments.map((item) => item.id === appointment.id ? payload : item) : [payload, ...current.appointments] }
    })
    notify('Agendamento salvo', subject, 'agenda')
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{appointment ? 'Detalhes do agendamento' : 'Solicitar agendamento'}</DialogTitle>
        <DialogDescription>Informe tipo, data, horario, assunto, descricao e monitor opcional.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <Select value={monitoriaId} onValueChange={setMonitoriaId}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{state.monitorias.map((item) => <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>)}</SelectContent></Select>
        <Select value={monitorId} onValueChange={setMonitorId}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="opcional">Monitor opcional</SelectItem>{monitors.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          <Select value={type} onValueChange={(value: AmoAppointment['type']) => setType(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Presencial">Presencial</SelectItem><SelectItem value="Virtual">Virtual</SelectItem></SelectContent></Select>
        </div>
        <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Assunto" />
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descricao" />
        {appointment?.meetingUrl && appointment.status === 'Confirmado' ? <a className="text-sm font-medium text-amo-blue underline" href={appointment.meetingUrl}>Link da videoconferencia</a> : null}
        {error ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
      </div>
      <DialogFooter><Button onClick={save}><Save className="size-4" />Salvar</Button></DialogFooter>
    </DialogContent>
  )
}

export function AppointmentsPage() {
  const { state, update, notify } = useAmoStore()
  const [selectedMonitoria, setSelectedMonitoria] = useState('todos')
  const [studentQuery, setStudentQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const filtered = state.appointments
    .filter((item) => selectedMonitoria === 'todos' || item.monitoriaId === selectedMonitoria)
    .filter((item) => !dateFilter || item.date === dateFilter)
    .filter((item) => userName(state.users, item.studentId).toLowerCase().includes(studentQuery.toLowerCase()) || item.tags.join(' ').includes(studentQuery.toLowerCase()))
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
  const groups = ['Pendente', 'Confirmado', 'Negado', 'Cancelado', 'Concluido'] as const
  const setStatus = (id: string, status: AmoAppointment['status']) => {
    update((current) => ({ ...current, appointments: current.appointments.map((item) => item.id === id ? { ...item, status } : item) }))
    notify('Agendamento atualizado', status, 'agenda')
  }

  return (
    <>
      <PageTitle
        title="Agendamentos"
        description="Solicite, visualize, aprove, negue, cancele e filtre agendamentos."
        action={<Dialog><DialogTrigger asChild><Button><CalendarPlus className="size-4" />Solicitar</Button></DialogTrigger><AppointmentDialog /></Dialog>}
      />
      <div className="mb-4 grid gap-3 lg:grid-cols-[auto_auto_1fr]">
        <Select value={selectedMonitoria} onValueChange={setSelectedMonitoria}><SelectTrigger className="h-11 w-full bg-white lg:w-80"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todas as monitorias</SelectItem>{state.monitorias.map((item) => <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>)}</SelectContent></Select>
        <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-11 bg-white" />
        <SearchBox value={studentQuery} onChange={setStudentQuery} placeholder="Filtrar por aluno ou tag/conteudo" />
      </div>
      <Tabs defaultValue="Pendente">
        <TabsList className="mb-4 grid h-auto w-full grid-cols-2 sm:grid-cols-5">
          {groups.map((group) => <TabsTrigger key={group} value={group}>{group}</TabsTrigger>)}
        </TabsList>
        {groups.map((group) => (
          <TabsContent key={group} value={group} className="space-y-3">
            {filtered.filter((item) => item.status === group).map((item) => (
              <Card key={item.id} className="rounded-md">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2"><StatusBadge status={item.status} /><Badge variant="secondary">{item.type}</Badge></div>
                      <h2 className="font-semibold">{item.subject}</h2>
                      <p className="text-sm text-zinc-600">{monitoriaTitle(state.monitorias, item.monitoriaId)} · {userName(state.users, item.studentId)}</p>
                      <p className="text-sm text-zinc-600">{toDateLabel(item.date)} · {item.time}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Dialog><DialogTrigger asChild><Button variant="outline" size="sm"><Eye className="size-4" />Detalhes</Button></DialogTrigger><AppointmentDialog appointment={item} /></Dialog>
                      {item.status === 'Pendente' ? <><Button size="sm" onClick={() => setStatus(item.id, 'Confirmado')}><Check className="size-4" />Aprovar</Button><Button variant="outline" size="sm" onClick={() => setStatus(item.id, 'Negado')}><X className="size-4" />Negar</Button></> : null}
                      {item.status !== 'Cancelado' && item.status !== 'Concluido' ? <Button variant="destructive" size="sm" onClick={() => setStatus(item.id, 'Cancelado')}>Cancelar</Button> : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
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
  const { state, update, ids, notify } = useAmoStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [registration, setRegistration] = useState('')
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? 'cc')
  const [error, setError] = useState('')
  const title = type === 'professor' ? 'Novo professor' : 'Novo monitor'

  const save = () => {
    if (!name.trim() || !email.includes('@') || !registration.trim()) {
      setError('Informe nome, e-mail valido e identificador institucional.')
      return
    }
    if (state.users.some((user) => user.email === email)) {
      setError('Endereco de email ja esta em uso.')
      return
    }
    update((current) => ({
      ...current,
      users: [...current.users, {
        id: ids.createId('u'),
        name,
        displayName: name.split(' ')[0],
        email,
        password: type === 'professor' ? 'prof1234' : 'monitor1',
        role: type === 'professor' ? 'Professor' : 'Monitor',
        registration,
        courseId,
        active: true,
      }],
    }))
    notify('Usuario cadastrado', name, 'sistema')
    setName('')
    setEmail('')
    setRegistration('')
    setError('')
  }

  return (
    <>
      <PageTitle title={title} description="Cadastro local com validacoes basicas." />
      <Card className="rounded-md">
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label>Nome</Label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" /></div>
            <div className="grid gap-2"><Label>E-mail</Label><Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="email@amo.edu" /></div>
            <div className="grid gap-2"><Label>{type === 'professor' ? 'SIAPE' : 'Matricula'}</Label><Input value={registration} onChange={(event) => setRegistration(event.target.value)} /></div>
            <div className="grid gap-2"><Label>Curso</Label><Select value={courseId} onValueChange={setCourseId}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{state.courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          {error ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
          <div className="flex justify-end"><Button onClick={save}><Save className="size-4" />Salvar cadastro</Button></div>
        </CardContent>
      </Card>
    </>
  )
}

export function ProfilePage({ type, editable = false }: { type?: 'student' | 'professor' | 'monitor'; editable?: boolean }) {
  const { state, currentUser, update, notify } = useAmoStore()
  const selected = type === 'professor' ? state.users.find((user) => user.role === 'Professor') : type === 'monitor' ? state.users.find((user) => user.role === 'Monitor') : currentUser
  const profile = selected ?? currentUser
  const [name, setName] = useState(profile.name)
  const [courseId, setCourseId] = useState(profile.courseId)
  const [avatar, setAvatar] = useState(profile.avatar ?? '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const saveProfile = () => {
    update((current) => ({ ...current, users: current.users.map((user) => user.id === profile.id ? { ...user, name, courseId, avatar } : user) }))
    notify('Perfil atualizado', name, 'sistema')
    setMessage('Perfil atualizado localmente.')
  }
  const changePassword = () => {
    if (oldPassword !== profile.password) return setMessage('Senha atual incorreta.')
    if (newPassword.length < 8) return setMessage('A nova senha precisa conter 8 caracteres.')
    update((current) => ({ ...current, users: current.users.map((user) => user.id === profile.id ? { ...user, password: newPassword } : user) }))
    setMessage('Senha atualizada.')
    setOldPassword('')
    setNewPassword('')
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
              <p className="mt-1 text-sm text-zinc-600">{profile.role} · {profile.email}</p>
            </div>
          </div>
          {editable ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Curso</Label><Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Foto por URL</Label><Input value={avatar} onChange={(event) => setAvatar(event.target.value)} placeholder="https://..." /></div>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-zinc-50 p-4"><span className="block text-xs text-zinc-500">Registro</span>{profile.registration}</div>
            <div className="rounded-md bg-zinc-50 p-4"><span className="block text-xs text-zinc-500">Curso</span>{state.courses.find((course) => course.id === profile.courseId)?.name}</div>
            <div className="rounded-md bg-zinc-50 p-4"><span className="block text-xs text-zinc-500">Status</span>{profile.active ? 'Ativo' : 'Restrito'}</div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-5 rounded-md">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="grid gap-2"><Label>Senha atual</Label><Input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} /></div>
          <div className="grid gap-2"><Label>Nova senha</Label><Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></div>
          <Button onClick={changePassword}><KeyRound className="size-4" />Trocar senha</Button>
        </CardContent>
      </Card>
      {message ? <div className="mt-4 rounded-md bg-amo-ice p-3 text-sm text-amo-navy">{message}</div> : null}
    </>
  )
}

export function NotificationsPage() {
  const { state, update } = useAmoStore()
  const [showToast, setShowToast] = useState(true)
  return (
    <>
      <PageTitle title="Notificacoes" description="Alertas gerados por forum, agenda e frequencia." action={<Button variant="outline" onClick={() => update((current) => ({ ...current, notifications: current.notifications.map((item) => ({ ...item, unread: false })) }))}>Marcar como lidas</Button>} />
      {showToast ? (
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
  const { state, update, reset } = useAmoStore()
  const setSetting = (key: keyof typeof state.settings, value: boolean) => update((current) => ({ ...current, settings: { ...current.settings, [key]: value } }))
  const settings: Array<[keyof typeof state.settings, string]> = [
    ['forum', 'Receber respostas do forum'],
    ['appointments', 'Lembrar agendamentos'],
    ['email', 'Mostrar notificacoes por e-mail'],
    ['userRegistration', 'Permitir cadastro de usuarios'],
  ]
  return (
    <>
      <PageTitle title="Configuracoes" description="Preferencias persistidas localmente." />
      <Card className="rounded-md"><CardContent className="divide-y p-0">{settings.map(([key, label]) => <div key={key} className="flex items-center justify-between gap-4 p-4"><div><h2 className="font-medium">{label}</h2><p className="text-sm text-zinc-600">Configuracao salva no localStorage.</p></div><Switch checked={state.settings[key]} onCheckedChange={(value) => setSetting(key, value)} /></div>)}</CardContent></Card>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row"><Button variant="outline" onClick={reset}>Restaurar dados mock</Button><Button variant="destructive">Desativar conta</Button></div>
    </>
  )
}

export function AdminPage() {
  const { state, update, ids, notify } = useAmoStore()
  const [courseName, setCourseName] = useState('')
  const [disciplineName, setDisciplineName] = useState('')
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? 'cc')
  const [semester, setSemester] = useState('2026.1')
  const [disciplineId, setDisciplineId] = useState(state.disciplines[0]?.id ?? 'd-alg')

  const addCourse = () => {
    if (!courseName.trim()) return
    update((current) => ({ ...current, courses: [...current.courses, { id: ids.createId('c'), name: courseName, period: '2026.1', coordinator: 'Coordenacao AMO', description: 'Curso cadastrado no prototipo.' }] }))
    setCourseName('')
  }
  const addDiscipline = () => {
    if (!disciplineName.trim()) return
    update((current) => ({ ...current, disciplines: [...current.disciplines, { id: ids.createId('d'), courseId, name: disciplineName }] }))
    setDisciplineName('')
  }
  const addClass = () => {
    update((current) => ({ ...current, classes: [...current.classes, { id: ids.createId('t'), courseId, disciplineId, semester, studentIds: current.users.filter((user) => user.role === 'Aluno').map((user) => user.id) }] }))
    notify('Turma cadastrada', semester, 'sistema')
  }

  return (
    <>
      <PageTitle title="Administracao" description="CRUD local de cursos, disciplinas, usuarios e turmas." />
      <AdminOnlyHint />
      <Tabs defaultValue="cursos">
        <TabsList className="mb-4 grid h-auto w-full grid-cols-2 sm:grid-cols-4"><TabsTrigger value="cursos">Cursos</TabsTrigger><TabsTrigger value="disciplinas">Disciplinas</TabsTrigger><TabsTrigger value="usuarios">Usuarios</TabsTrigger><TabsTrigger value="turmas">Turmas</TabsTrigger></TabsList>
        <TabsContent value="cursos" className="space-y-3">
          <Card className="rounded-md"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row"><Input value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="Nome do curso" /><Button onClick={addCourse}><Plus className="size-4" />Adicionar</Button></CardContent></Card>
          {state.courses.map((course: AmoCourse) => <Card key={course.id} className="rounded-md"><CardContent className="flex items-center justify-between p-4"><div><h2 className="font-semibold">{course.name}</h2><p className="text-sm text-zinc-600">{course.period}</p></div><Button variant="destructive" size="sm" onClick={() => update((current) => ({ ...current, courses: current.courses.filter((item) => item.id !== course.id) }))}><Trash2 className="size-4" />Excluir</Button></CardContent></Card>)}
        </TabsContent>
        <TabsContent value="disciplinas" className="space-y-3">
          <Card className="rounded-md"><CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]"><Input value={disciplineName} onChange={(event) => setDisciplineName(event.target.value)} placeholder="Disciplina" /><Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}</SelectContent></Select><Button onClick={addDiscipline}>Adicionar</Button></CardContent></Card>
          {state.disciplines.map((discipline: AmoDiscipline) => <Card key={discipline.id} className="rounded-md"><CardContent className="flex items-center justify-between p-4"><span>{discipline.name}</span><Button variant="destructive" size="sm" onClick={() => update((current) => ({ ...current, disciplines: current.disciplines.filter((item) => item.id !== discipline.id) }))}>Excluir</Button></CardContent></Card>)}
        </TabsContent>
        <TabsContent value="usuarios" className="space-y-3">
          {state.users.map((user) => <Card key={user.id} className="rounded-md"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">{user.name}</h2><p className="text-sm text-zinc-600">{user.role} · {user.email}</p></div><Button variant="outline" size="sm" onClick={() => update((current) => ({ ...current, users: current.users.map((item) => item.id === user.id ? { ...item, active: !item.active } : item) }))}>{user.active ? 'Restringir' : 'Ativar'}</Button></CardContent></Card>)}
        </TabsContent>
        <TabsContent value="turmas" className="space-y-3">
          <Card className="rounded-md"><CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"><Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}</SelectContent></Select><Select value={disciplineId} onValueChange={setDisciplineId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.disciplines.map((discipline) => <SelectItem key={discipline.id} value={discipline.id}>{discipline.name}</SelectItem>)}</SelectContent></Select><Input value={semester} onChange={(event) => setSemester(event.target.value)} /><Button onClick={addClass}>Criar turma</Button></CardContent></Card>
          {state.classes.map((klass) => <Card key={klass.id} className="rounded-md"><CardContent className="p-4"><h2 className="font-semibold">{state.disciplines.find((item) => item.id === klass.disciplineId)?.name}</h2><p className="text-sm text-zinc-600">{klass.semester} · {klass.studentIds.length} alunos</p></CardContent></Card>)}
        </TabsContent>
      </Tabs>
    </>
  )
}

export function AttendancePage() {
  const { state, update, ids, notify } = useAmoStore()
  const [monitoriaId, setMonitoriaId] = useState(state.monitorias[0]?.id ?? 'alg')
  const [date, setDate] = useState('2026-06-02')
  const students = state.users.filter((user) => user.role === 'Aluno')
  const records = students.map((student) => state.attendances.find((item) => item.studentId === student.id && item.monitoriaId === monitoriaId && item.date === date) ?? { id: '', monitoriaId, date, studentId: student.id, present: false, preConfirmed: false, difficulty: '' })

  const toggle = (studentId: string, field: 'present' | 'preConfirmed') => {
    update((current) => {
      const existing = current.attendances.find((item) => item.studentId === studentId && item.monitoriaId === monitoriaId && item.date === date)
      const next = existing
        ? current.attendances.map((item) => item.id === existing.id ? { ...item, [field]: !item[field] } : item)
        : [...current.attendances, { id: ids.createId('freq'), monitoriaId, date, studentId, present: field === 'present', preConfirmed: field === 'preConfirmed', difficulty: '' }]
      return { ...current, attendances: next }
    })
  }
  const exportCsv = () => {
    const csv = ['Aluno,Data,Monitoria,Presente,Pre-confirmado', ...records.map((item) => `${userName(state.users, item.studentId)},${item.date},${monitoriaTitle(state.monitorias, item.monitoriaId)},${item.present ? 'sim' : 'nao'},${item.preConfirmed ? 'sim' : 'nao'}`)].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'frequencias.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageTitle title="Frequencias" description="Registro local de presenca, priorizando pre-confirmados." action={<div className="flex gap-2"><Button variant="outline" onClick={exportCsv}><Download className="size-4" />CSV</Button><Button variant="outline" onClick={() => window.print()}><Download className="size-4" />PDF</Button></div>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2"><Select value={monitoriaId} onValueChange={setMonitoriaId}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent>{state.monitorias.map((item) => <SelectItem key={item.id} value={item.id}>{item.subject}</SelectItem>)}</SelectContent></Select><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="bg-white" /></div>
      <div className="space-y-3">
        {records.sort((a, b) => Number(b.preConfirmed) - Number(a.preConfirmed)).map((record) => (
          <Card key={record.studentId} className="rounded-md"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">{userName(state.users, record.studentId)}</h2><p className="text-sm text-zinc-600">{record.difficulty || 'Sem dificuldade informada'}</p></div><div className="flex flex-wrap gap-2"><Button variant={record.preConfirmed ? 'default' : 'outline'} size="sm" onClick={() => toggle(record.studentId, 'preConfirmed')}>Pre-confirmado</Button><Button variant={record.present ? 'default' : 'outline'} size="sm" onClick={() => toggle(record.studentId, 'present')}>Presente</Button></div></CardContent></Card>
        ))}
      </div>
      <Button className="mt-4" onClick={() => notify('Frequencia registrada', monitoriaTitle(state.monitorias, monitoriaId), 'frequencia')}>Salvar frequencia</Button>
    </>
  )
}
