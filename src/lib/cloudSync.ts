import { supabase } from './supabase'
import type {
  UserId,
  TopicState,
  Lesson,
  LessonProgress,
  StudySession,
  QuestionLog,
  ErrorEntry,
  Review,
  Goals,
  PomodoroConfig,
} from '../types'

// ===== Mapeamento entre colunas do banco (snake_case) e os tipos do app (camelCase) =====

export function topicStateFromRow(r: any): TopicState {
  return {
    topicId: r.topic_id,
    userId: r.user_id,
    domainLevel: r.domain_level,
    timesStudied: r.times_studied,
    questionsTotal: r.questions_total,
    questionsCorrect: r.questions_correct,
    lastStudiedAt: r.last_studied_at,
    lastReviewedAt: r.last_reviewed_at,
    reviewIntervalDays: r.review_interval_days,
  }
}
export function topicStateToRow(t: TopicState) {
  return {
    topic_id: t.topicId,
    user_id: t.userId,
    domain_level: t.domainLevel,
    times_studied: t.timesStudied,
    questions_total: t.questionsTotal,
    questions_correct: t.questionsCorrect,
    last_studied_at: t.lastStudiedAt,
    last_reviewed_at: t.lastReviewedAt,
    review_interval_days: t.reviewIntervalDays,
  }
}

export function lessonFromRow(r: any): Lesson {
  return {
    id: r.id,
    materia: r.materia,
    modulo: r.modulo,
    assunto: r.assunto,
    nome: r.nome,
    numero: r.numero,
    duracaoSegundos: r.duracao_segundos,
    disciplineId: r.discipline_id,
    topicId: r.topic_id,
    createdAt: r.created_at,
  }
}
export function lessonToRow(l: Lesson) {
  return {
    id: l.id,
    materia: l.materia,
    modulo: l.modulo,
    assunto: l.assunto,
    nome: l.nome,
    numero: l.numero,
    duracao_segundos: l.duracaoSegundos,
    discipline_id: l.disciplineId,
    topic_id: l.topicId,
    created_at: l.createdAt,
  }
}

export function lessonProgressFromRow(r: any): LessonProgress {
  return {
    lessonId: r.lesson_id,
    userId: r.user_id,
    posicaoSegundos: r.posicao_segundos,
    status: r.status,
    observacoes: r.observacoes,
    ultimoAcesso: r.ultimo_acesso,
  }
}
export function lessonProgressToRow(p: LessonProgress) {
  return {
    lesson_id: p.lessonId,
    user_id: p.userId,
    posicao_segundos: p.posicaoSegundos,
    status: p.status,
    observacoes: p.observacoes,
    ultimo_acesso: p.ultimoAcesso,
  }
}

export function sessionFromRow(r: any): StudySession {
  return {
    id: r.id,
    userId: r.user_id,
    disciplineId: r.discipline_id,
    topicId: r.topic_id,
    lessonId: r.lesson_id,
    type: r.type,
    plannedMinutes: r.planned_minutes,
    actualMinutes: r.actual_minutes,
    date: r.date,
    note: r.note,
    createdAt: r.created_at,
  }
}
export function sessionToRow(s: StudySession) {
  return {
    id: s.id,
    user_id: s.userId,
    discipline_id: s.disciplineId,
    topic_id: s.topicId,
    lesson_id: s.lessonId,
    type: s.type,
    planned_minutes: s.plannedMinutes,
    actual_minutes: s.actualMinutes,
    date: s.date,
    note: s.note,
    created_at: s.createdAt,
  }
}

export function questionLogFromRow(r: any): QuestionLog {
  return {
    id: r.id,
    userId: r.user_id,
    disciplineId: r.discipline_id,
    topicId: r.topic_id,
    date: r.date,
    quantidade: r.quantidade,
    acertos: r.acertos,
    erros: r.erros,
    banca: r.banca,
    dificuldade: r.dificuldade,
    observacao: r.observacao,
    createdAt: r.created_at,
  }
}
export function questionLogToRow(q: QuestionLog) {
  return {
    id: q.id,
    user_id: q.userId,
    discipline_id: q.disciplineId,
    topic_id: q.topicId,
    date: q.date,
    quantidade: q.quantidade,
    acertos: q.acertos,
    erros: q.erros,
    banca: q.banca,
    dificuldade: q.dificuldade,
    observacao: q.observacao,
    created_at: q.createdAt,
  }
}

export function errorEntryFromRow(r: any): ErrorEntry {
  return {
    id: r.id,
    userId: r.user_id,
    disciplineId: r.discipline_id,
    topicId: r.topic_id,
    date: r.date,
    questao: r.questao,
    categoria: r.categoria,
    observacao: r.observacao,
    conteudoCorreto: r.conteudo_correto,
  }
}
export function errorEntryToRow(e: ErrorEntry) {
  return {
    id: e.id,
    user_id: e.userId,
    discipline_id: e.disciplineId,
    topic_id: e.topicId,
    date: e.date,
    questao: e.questao,
    categoria: e.categoria,
    observacao: e.observacao,
    conteudo_correto: e.conteudoCorreto,
  }
}

export function reviewFromRow(r: any): Review {
  return {
    id: r.id,
    userId: r.user_id,
    topicId: r.topic_id,
    dueDate: r.due_date,
    reason: r.reason,
    priority: r.priority,
    done: r.done,
    doneAt: r.done_at,
    createdAt: r.created_at,
  }
}
export function reviewToRow(r: Review) {
  return {
    id: r.id,
    user_id: r.userId,
    topic_id: r.topicId,
    due_date: r.dueDate,
    reason: r.reason,
    priority: r.priority,
    done: r.done,
    done_at: r.doneAt,
    created_at: r.createdAt,
  }
}

// ===== Carga inicial =====

export interface CloudSnapshot {
  topicStates: TopicState[]
  lessons: Lesson[]
  lessonProgress: LessonProgress[]
  sessions: StudySession[]
  questionLogs: QuestionLog[]
  errorEntries: ErrorEntry[]
  reviews: Review[]
  goals: Record<UserId, Goals>
  userNames: Record<UserId, string> | null
  pomodoroConfig: PomodoroConfig | null
  initialized: boolean
}

export async function pullAll(): Promise<CloudSnapshot> {
  const [
    topicStatesRes,
    lessonsRes,
    lessonProgressRes,
    sessionsRes,
    questionLogsRes,
    errorEntriesRes,
    reviewsRes,
    goalsRes,
    settingsRes,
  ] = await Promise.all([
    supabase.from('topic_states').select('*'),
    supabase.from('lessons').select('*'),
    supabase.from('lesson_progress').select('*'),
    supabase.from('sessions').select('*'),
    supabase.from('question_logs').select('*'),
    supabase.from('error_entries').select('*'),
    supabase.from('reviews').select('*'),
    supabase.from('goals').select('*'),
    supabase.from('app_settings').select('*'),
  ])

  const goals: Record<UserId, Goals> = {
    laise: { dailyMinutes: 60, weeklyMinutes: 420 },
    savio: { dailyMinutes: 60, weeklyMinutes: 420 },
  }
  ;(goalsRes.data ?? []).forEach((r: any) => {
    goals[r.user_id as UserId] = { dailyMinutes: r.daily_minutes, weeklyMinutes: r.weekly_minutes }
  })

  const settingsMap = new Map<string, any>((settingsRes.data ?? []).map((r: any) => [r.key, r.value]))

  return {
    topicStates: (topicStatesRes.data ?? []).map(topicStateFromRow),
    lessons: (lessonsRes.data ?? []).map(lessonFromRow),
    lessonProgress: (lessonProgressRes.data ?? []).map(lessonProgressFromRow),
    sessions: (sessionsRes.data ?? []).map(sessionFromRow),
    questionLogs: (questionLogsRes.data ?? []).map(questionLogFromRow),
    errorEntries: (errorEntriesRes.data ?? []).map(errorEntryFromRow),
    reviews: (reviewsRes.data ?? []).map(reviewFromRow),
    goals,
    userNames: settingsMap.get('user_names') ?? null,
    pomodoroConfig: settingsMap.get('pomodoro_config') ?? null,
    initialized: Boolean(settingsMap.get('initialized')?.done),
  }
}

// ===== Escrita (fire-and-forget do ponto de vista da UI) =====

async function logCloudError(action: string, error: unknown) {
  if (error) console.error(`[cloudSync] falha em ${action}:`, error)
}

export const cloud = {
  upsertTopicState: async (t: TopicState) => {
    const { error } = await supabase.from('topic_states').upsert(topicStateToRow(t))
    await logCloudError('upsertTopicState', error)
  },
  upsertLesson: async (l: Lesson) => {
    const { error } = await supabase.from('lessons').upsert(lessonToRow(l))
    await logCloudError('upsertLesson', error)
  },
  upsertLessonProgress: async (p: LessonProgress) => {
    const { error } = await supabase.from('lesson_progress').upsert(lessonProgressToRow(p))
    await logCloudError('upsertLessonProgress', error)
  },
  insertSession: async (s: StudySession) => {
    const { error } = await supabase.from('sessions').upsert(sessionToRow(s))
    await logCloudError('insertSession', error)
  },
  insertQuestionLog: async (q: QuestionLog) => {
    const { error } = await supabase.from('question_logs').upsert(questionLogToRow(q))
    await logCloudError('insertQuestionLog', error)
  },
  insertErrorEntry: async (e: ErrorEntry) => {
    const { error } = await supabase.from('error_entries').upsert(errorEntryToRow(e))
    await logCloudError('insertErrorEntry', error)
  },
  upsertReview: async (r: Review) => {
    const { error } = await supabase.from('reviews').upsert(reviewToRow(r))
    await logCloudError('upsertReview', error)
  },
  upsertGoals: async (userId: UserId, g: Goals) => {
    const { error } = await supabase
      .from('goals')
      .upsert({ user_id: userId, daily_minutes: g.dailyMinutes, weekly_minutes: g.weeklyMinutes })
    await logCloudError('upsertGoals', error)
  },
  setSetting: async (key: string, value: unknown) => {
    const { error } = await supabase.from('app_settings').upsert({ key, value })
    await logCloudError('setSetting', error)
  },
  resetAll: async () => {
    const tables = [
      'topic_states',
      'lessons',
      'lesson_progress',
      'sessions',
      'question_logs',
      'error_entries',
      'reviews',
      'app_settings',
    ]
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().not('created_at', 'is', null)
      if (error) {
        // algumas tabelas não têm created_at (lesson_progress, app_settings) — refaz sem esse filtro
        const idColumn = table === 'lesson_progress' ? 'lesson_id' : table === 'app_settings' ? 'key' : 'id'
        await supabase.from(table).delete().not(idColumn, 'is', null)
      }
    }
    await supabase
      .from('goals')
      .upsert([
        { user_id: 'laise', daily_minutes: 60, weekly_minutes: 420 },
        { user_id: 'savio', daily_minutes: 60, weekly_minutes: 420 },
      ])
  },
}

// ===== Tempo real: mudanças feitas em outro dispositivo chegam aqui =====

export interface RealtimeHandlers {
  onTopicState: (t: TopicState) => void
  onLesson: (l: Lesson) => void
  onLessonProgress: (p: LessonProgress) => void
  onSession: (s: StudySession) => void
  onQuestionLog: (q: QuestionLog) => void
  onErrorEntry: (e: ErrorEntry) => void
  onReview: (r: Review) => void
  onGoals: (userId: UserId, g: Goals) => void
  onSetting: (key: string, value: unknown) => void
}

export function subscribeRealtime(handlers: RealtimeHandlers) {
  const channel = supabase
    .channel('gmf-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'topic_states' }, (payload) => {
      if (payload.eventType !== 'DELETE') handlers.onTopicState(topicStateFromRow(payload.new))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, (payload) => {
      if (payload.eventType !== 'DELETE') handlers.onLesson(lessonFromRow(payload.new))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_progress' }, (payload) => {
      if (payload.eventType !== 'DELETE') handlers.onLessonProgress(lessonProgressFromRow(payload.new))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
      if (payload.eventType !== 'DELETE') handlers.onSession(sessionFromRow(payload.new))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'question_logs' }, (payload) => {
      if (payload.eventType !== 'DELETE') handlers.onQuestionLog(questionLogFromRow(payload.new))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'error_entries' }, (payload) => {
      if (payload.eventType !== 'DELETE') handlers.onErrorEntry(errorEntryFromRow(payload.new))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, (payload) => {
      if (payload.eventType !== 'DELETE') handlers.onReview(reviewFromRow(payload.new))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, (payload) => {
      if (payload.eventType !== 'DELETE') {
        const r: any = payload.new
        handlers.onGoals(r.user_id, { dailyMinutes: r.daily_minutes, weeklyMinutes: r.weekly_minutes })
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, (payload) => {
      if (payload.eventType !== 'DELETE') {
        const r: any = payload.new
        handlers.onSetting(r.key, r.value)
      }
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
