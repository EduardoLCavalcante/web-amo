export type Course = {
  id: string
  name: string
  period: string
  coordinator: string
  progress: number
  color: string
  description: string
}

export type Monitoria = {
  id: string
  courseId: string
  subject: string
  monitor: string
  professor: string
  nextSlot: string
  room: string
  status: 'Aberta' | 'Lotada' | 'Em breve'
  tags: string[]
}

export type ForumQuestion = {
  id: string
  monitoriaId: string
  title: string
  author: string
  role: string
  excerpt: string
  status: 'Aberta' | 'Respondida' | 'Fixada'
  answers: number
  views: number
  updatedAt: string
  body: string
}

export type Appointment = {
  id: string
  monitoriaId: string
  student: string
  date: string
  time: string
  topic: string
  status: 'Pendente' | 'Confirmado' | 'Concluido'
}

export type Notification = {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  type: 'forum' | 'agenda' | 'sistema'
}

export const courses: Course[] = [
  {
    id: 'cc',
    name: 'Ciencia da Computacao',
    period: '2026.1',
    coordinator: 'Prof. Helena Duarte',
    progress: 68,
    color: 'bg-amo-navy',
    description: 'Algoritmos, sistemas, dados e fundamentos de engenharia de software.',
  },
  {
    id: 'si',
    name: 'Sistemas de Informacao',
    period: '2026.1',
    coordinator: 'Prof. Marcos Lima',
    progress: 54,
    color: 'bg-amo-cyan',
    description: 'Processos, banco de dados, gestao de tecnologia e produto digital.',
  },
  {
    id: 'eng',
    name: 'Engenharia de Software',
    period: '2026.1',
    coordinator: 'Prof. Ana Beatriz',
    progress: 73,
    color: 'bg-amo-blue',
    description: 'Qualidade, arquitetura, requisitos e construcao colaborativa de sistemas.',
  },
]

export const monitorias: Monitoria[] = [
  {
    id: 'alg',
    courseId: 'cc',
    subject: 'Algoritmos e Estruturas de Dados',
    monitor: 'Lucas Freire',
    professor: 'Prof. Helena Duarte',
    nextSlot: 'Hoje, 16:00',
    room: 'Lab 03',
    status: 'Aberta',
    tags: ['listas', 'arvores', 'recursao'],
  },
  {
    id: 'bd',
    courseId: 'si',
    subject: 'Banco de Dados',
    monitor: 'Marina Costa',
    professor: 'Prof. Marcos Lima',
    nextSlot: 'Amanha, 09:00',
    room: 'Sala 12',
    status: 'Aberta',
    tags: ['sql', 'modelagem', 'normalizacao'],
  },
  {
    id: 'web',
    courseId: 'eng',
    subject: 'Desenvolvimento Web',
    monitor: 'Rafael Sousa',
    professor: 'Prof. Ana Beatriz',
    nextSlot: 'Quinta, 14:00',
    room: 'Lab 01',
    status: 'Lotada',
    tags: ['react', 'apis', 'testes'],
  },
  {
    id: 'calc',
    courseId: 'cc',
    subject: 'Calculo I',
    monitor: 'Bianca Alves',
    professor: 'Prof. Daniel Rocha',
    nextSlot: 'Sexta, 10:00',
    room: 'Sala 08',
    status: 'Em breve',
    tags: ['limites', 'derivadas', 'integrais'],
  },
]

export const questions: ForumQuestion[] = [
  {
    id: 'q1',
    monitoriaId: 'alg',
    title: 'Como decidir entre pilha e fila nesta lista?',
    author: 'Camila Nunes',
    role: 'Aluno',
    excerpt: 'Estou presa no exercicio 4 e nao entendi qual estrutura usar para controlar a ordem.',
    status: 'Respondida',
    answers: 5,
    views: 42,
    updatedAt: 'ha 12 min',
    body: 'No exercicio 4 a entrada chega em uma ordem, mas a saida esperada parece inverter alguns blocos. Queria entender o criterio para escolher pilha ou fila.',
  },
  {
    id: 'q2',
    monitoriaId: 'bd',
    title: 'Duvida sobre chave composta no DER',
    author: 'Joao Pedro',
    role: 'Aluno',
    excerpt: 'Quando uma entidade fraca depende de duas tabelas, a chave fica com quais atributos?',
    status: 'Aberta',
    answers: 2,
    views: 28,
    updatedAt: 'ha 1 h',
    body: 'Montei o relacionamento, mas fiquei em duvida se a chave parcial entra junto com as duas chaves estrangeiras.',
  },
  {
    id: 'q3',
    monitoriaId: 'web',
    title: 'Checklist para entregar o trabalho de API',
    author: 'Rafael Sousa',
    role: 'Monitor',
    excerpt: 'Itens obrigatorios para a entrega final e criterios que serao revisados.',
    status: 'Fixada',
    answers: 8,
    views: 91,
    updatedAt: 'ontem',
    body: 'A entrega deve conter rotas documentadas, validacao dos dados de entrada, tratamento de erro e testes dos principais fluxos.',
  },
]

export const appointments: Appointment[] = [
  {
    id: 'a1',
    monitoriaId: 'alg',
    student: 'Camila Nunes',
    date: '02/06/2026',
    time: '16:00',
    topic: 'Lista de pilhas e filas',
    status: 'Confirmado',
  },
  {
    id: 'a2',
    monitoriaId: 'bd',
    student: 'Joao Pedro',
    date: '03/06/2026',
    time: '09:00',
    topic: 'DER e normalizacao',
    status: 'Pendente',
  },
  {
    id: 'a3',
    monitoriaId: 'web',
    student: 'Larissa Melo',
    date: '28/05/2026',
    time: '14:00',
    topic: 'Autenticacao no frontend',
    status: 'Concluido',
  },
]

export const notifications: Notification[] = [
  {
    id: 'n1',
    title: 'Resposta recebida',
    message: 'Lucas respondeu sua duvida em Algoritmos.',
    time: 'agora',
    unread: true,
    type: 'forum',
  },
  {
    id: 'n2',
    title: 'Agendamento confirmado',
    message: 'Sua monitoria de Banco de Dados foi confirmada para amanha.',
    time: '20 min',
    unread: true,
    type: 'agenda',
  },
  {
    id: 'n3',
    title: 'Preferencias salvas',
    message: 'As configuracoes de notificacao foram atualizadas.',
    time: 'ontem',
    unread: false,
    type: 'sistema',
  },
]

export const profiles = {
  student: {
    name: 'Camila Nunes',
    role: 'Aluno',
    email: 'camila.nunes@amo.edu',
    course: 'Ciencia da Computacao',
    registration: '202401234',
    bio: 'Estudante focada em estruturas de dados, web e projetos de extensao.',
  },
  professor: {
    name: 'Prof. Helena Duarte',
    role: 'Professor',
    email: 'helena.duarte@amo.edu',
    course: 'Ciencia da Computacao',
    registration: 'SIAPE 145782',
    bio: 'Docente de algoritmos, programacao e aprendizagem colaborativa.',
  },
  monitor: {
    name: 'Lucas Freire',
    role: 'Monitor',
    email: 'lucas.freire@amo.edu',
    course: 'Ciencia da Computacao',
    registration: '202200987',
    bio: 'Monitor de Algoritmos, com foco em resolucao guiada de exercicios.',
  },
}
