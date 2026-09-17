// ===== Usuários =====
export type UserId = 'laise' | 'savio'

export interface UserProfile {
  id: UserId
  name: string
}

// ===== Edital =====
export interface Topic {
  id: string
  disciplineId: string
  name: string
  order: number
}

export interface Discipline {
  id: string
  name: string
  order: number
}

export type DomainLevel = 0 | 1 | 2 | 3 | 4

export interface TopicState {
  topicId: string
  userId: UserId
  domainLevel: DomainLevel
  timesStudied: number
  questionsTotal: number
  questionsCorrect: number
  lastStudiedAt: string | null
  lastReviewedAt: string | null
  reviewIntervalDays: number
}

// ===== Curso online (Laise & Sávio) =====
export type LessonStatus = 'nao_iniciada' | 'em_andamento' | 'concluida' | 'revisao'

export interface Lesson {
  id: string
  materia: string
  modulo: string
  assunto: string
  nome: string
  numero: string
  duracaoSegundos: number
  createdAt: string
  disciplineId: string | null
  topicId: string | null
}

export interface LessonProgress {
  lessonId: string
  userId: UserId
  posicaoSegundos: number
  status: LessonStatus
  observacoes: string
  ultimoAcesso: string | null
}

// ===== Estudo / Registro =====
export type StudyType =
  | 'teoria'
  | 'video'
  | 'questoes'
  | 'revisao'
  | 'flashcards'
  | 'pdf'
  | 'resumo'

export interface StudySession {
  id: string
  userId: UserId
  disciplineId: string | null
  topicId: string | null
  lessonId: string | null
  type: StudyType
  plannedMinutes: number
  actualMinutes: number
  date: string // ISO date (yyyy-MM-dd)
  createdAt: string
  note: string
}

// ===== Pomodoro =====
export interface PomodoroConfig {
  focusMin: number
  breakMin: number
  longBreakMin: number
  cyclesBeforeLongBreak: number
}

export interface PomodoroTask {
  disciplineId: string | null
  topicId: string | null
  lessonId: string | null
  label: string
}

// ===== Questões =====
export interface QuestionLog {
  id: string
  userId: UserId
  disciplineId: string
  topicId: string | null
  date: string
  quantidade: number
  acertos: number
  erros: number
  banca: string
  dificuldade: 'facil' | 'media' | 'dificil' | ''
  observacao: string
  createdAt: string
}

// ===== Caderno de erros =====
export type ErrorCategory =
  | 'desconhecimento'
  | 'confusao'
  | 'interpretacao'
  | 'desatencao'
  | 'falta_memorizacao'
  | 'aplicacao_incorreta'

export interface ErrorEntry {
  id: string
  userId: UserId
  disciplineId: string
  topicId: string | null
  date: string
  questao: string
  categoria: ErrorCategory
  observacao: string
  conteudoCorreto: string
}

// ===== Revisão =====
export interface Review {
  id: string
  userId: UserId
  topicId: string
  dueDate: string
  reason: string
  priority: 'alta' | 'media' | 'baixa'
  done: boolean
  doneAt: string | null
  createdAt: string
}

// ===== Metas =====
export interface Goals {
  dailyMinutes: number
  weeklyMinutes: number
}

// ===== Estado raiz =====
export interface AppState {
  onboardingDone: boolean
  users: Record<UserId, UserProfile>
  activeUserId: UserId

  disciplines: Discipline[]
  topics: Topic[]
  topicStates: TopicState[]

  lessons: Lesson[]
  lessonProgress: LessonProgress[]

  sessions: StudySession[]
  pomodoroConfig: PomodoroConfig
  questionLogs: QuestionLog[]
  errorEntries: ErrorEntry[]
  reviews: Review[]
  goals: Record<UserId, Goals>
}
