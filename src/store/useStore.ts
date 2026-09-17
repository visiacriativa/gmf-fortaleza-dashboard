import { create } from 'zustand'
import type {
  AppState,
  UserId,
  DomainLevel,
  Lesson,
  LessonProgress,
  StudySession,
  QuestionLog,
  ErrorEntry,
  Review,
  Goals,
  PomodoroConfig,
  TopicState,
} from '../types'
import { buildEditalSeed } from '../data/edital'
import { uid, nowISO, todayISO, daysBetween, clamp } from '../lib/utils'
import { pullAll, cloud, subscribeRealtime } from '../lib/cloudSync'

const { disciplines, topics } = buildEditalSeed()

const DEFAULT_POMODORO: PomodoroConfig = {
  focusMin: 25,
  breakMin: 5,
  longBreakMin: 15,
  cyclesBeforeLongBreak: 4,
}

const DEFAULT_GOALS: Goals = { dailyMinutes: 60, weeklyMinutes: 420 }

function defaultTopicState(topicId: string, userId: UserId): TopicState {
  return {
    topicId,
    userId,
    domainLevel: 0,
    timesStudied: 0,
    questionsTotal: 0,
    questionsCorrect: 0,
    lastStudiedAt: null,
    lastReviewedAt: null,
    reviewIntervalDays: 1,
  }
}

function upsertBy<T>(arr: T[], match: (x: T) => boolean, next: T): T[] {
  const exists = arr.some(match)
  return exists ? arr.map((x) => (match(x) ? next : x)) : [...arr, next]
}

interface Store extends AppState {
  hydrated: boolean
  cloudInitialized: boolean
  cloudError: string | null

  initCloud: () => Promise<void>

  setActiveUser: (userId: UserId) => void
  completeOnboarding: (input: {
    laiseName: string
    savioName: string
    dailyMinutes: number
    pomodoro: PomodoroConfig
  }) => void

  setDomainLevel: (topicId: string, userId: UserId, level: DomainLevel) => void
  getTopicState: (topicId: string, userId: UserId) => TopicState

  addLesson: (lesson: Omit<Lesson, 'id' | 'createdAt'>) => string
  updateLessonProgress: (
    lessonId: string,
    userId: UserId,
    patch: Partial<Pick<LessonProgress, 'posicaoSegundos' | 'status' | 'observacoes'>>
  ) => void
  getLessonProgress: (lessonId: string, userId: UserId) => LessonProgress

  logStudySession: (input: Omit<StudySession, 'id' | 'createdAt'>) => void

  addQuestionLog: (input: Omit<QuestionLog, 'id' | 'createdAt'>) => void
  addErrorEntry: (input: Omit<ErrorEntry, 'id'>) => void

  scheduleReview: (topicId: string, userId: UserId, dueDate: string, reason: string, priority: Review['priority']) => void
  completeReview: (reviewId: string, performancePct: number | null) => void

  setGoals: (userId: UserId, goals: Goals) => void
  setPomodoroConfig: (config: PomodoroConfig) => void

  exportData: () => string
  importData: (json: string) => boolean
  resetAll: () => Promise<void>
}

const initialState: AppState = {
  onboardingDone: false,
  users: {
    laise: { id: 'laise', name: 'Laise' },
    savio: { id: 'savio', name: 'Sávio' },
  },
  activeUserId: 'laise',
  disciplines,
  topics,
  topicStates: [],
  lessons: [],
  lessonProgress: [],
  sessions: [],
  pomodoroConfig: DEFAULT_POMODORO,
  questionLogs: [],
  errorEntries: [],
  reviews: [],
  goals: { laise: { ...DEFAULT_GOALS }, savio: { ...DEFAULT_GOALS } },
}

let didInit = false
let unsubscribeRealtime: (() => void) | null = null

export const useStore = create<Store>()((set, get) => ({
  ...initialState,
  hydrated: false,
  cloudInitialized: false,
  cloudError: null,

  initCloud: async () => {
    if (didInit) return
    didInit = true
    try {
      const snap = await pullAll()
      set((s) => ({
        topicStates: snap.topicStates,
        lessons: snap.lessons,
        lessonProgress: snap.lessonProgress,
        sessions: snap.sessions,
        questionLogs: snap.questionLogs,
        errorEntries: snap.errorEntries,
        reviews: snap.reviews,
        goals: snap.goals,
        pomodoroConfig: snap.pomodoroConfig ?? s.pomodoroConfig,
        users: snap.userNames
          ? {
              laise: { id: 'laise', name: snap.userNames.laise || 'Laise' },
              savio: { id: 'savio', name: snap.userNames.savio || 'Sávio' },
            }
          : s.users,
        cloudInitialized: snap.initialized,
        hydrated: true,
      }))

      if (!unsubscribeRealtime) {
        unsubscribeRealtime = subscribeRealtime({
          onTopicState: (t) =>
            set((s) => ({
              topicStates: upsertBy(s.topicStates, (x) => x.topicId === t.topicId && x.userId === t.userId, t),
            })),
          onLesson: (l) =>
            set((s) => ({ lessons: upsertBy(s.lessons, (x) => x.id === l.id, l) })),
          onLessonProgress: (p) =>
            set((s) => ({
              lessonProgress: upsertBy(
                s.lessonProgress,
                (x) => x.lessonId === p.lessonId && x.userId === p.userId,
                p
              ),
            })),
          onSession: (sess) =>
            set((s) => ({ sessions: upsertBy(s.sessions, (x) => x.id === sess.id, sess) })),
          onQuestionLog: (q) =>
            set((s) => ({ questionLogs: upsertBy(s.questionLogs, (x) => x.id === q.id, q) })),
          onErrorEntry: (e) =>
            set((s) => ({ errorEntries: upsertBy(s.errorEntries, (x) => x.id === e.id, e) })),
          onReview: (r) =>
            set((s) => ({ reviews: upsertBy(s.reviews, (x) => x.id === r.id, r) })),
          onGoals: (userId, g) => set((s) => ({ goals: { ...s.goals, [userId]: g } })),
          onSetting: (key, value: any) => {
            if (key === 'pomodoro_config') set({ pomodoroConfig: value })
            else if (key === 'user_names')
              set({
                users: {
                  laise: { id: 'laise', name: value.laise || 'Laise' },
                  savio: { id: 'savio', name: value.savio || 'Sávio' },
                },
              })
            else if (key === 'initialized') set({ cloudInitialized: Boolean(value?.done) })
          },
        })
      }
    } catch (err: any) {
      set({ hydrated: true, cloudError: err?.message ?? 'Falha ao conectar ao banco de dados.' })
    }
  },

  setActiveUser: (userId) => set({ activeUserId: userId }),

  completeOnboarding: ({ laiseName, savioName, dailyMinutes, pomodoro }) => {
    const goals = {
      laise: { dailyMinutes, weeklyMinutes: dailyMinutes * 7 },
      savio: { dailyMinutes, weeklyMinutes: dailyMinutes * 7 },
    }
    set({
      onboardingDone: true,
      cloudInitialized: true,
      users: {
        laise: { id: 'laise', name: laiseName || 'Laise' },
        savio: { id: 'savio', name: savioName || 'Sávio' },
      },
      goals,
      pomodoroConfig: pomodoro,
    })
    cloud.upsertGoals('laise', goals.laise)
    cloud.upsertGoals('savio', goals.savio)
    cloud.setSetting('pomodoro_config', pomodoro)
    cloud.setSetting('user_names', { laise: laiseName || 'Laise', savio: savioName || 'Sávio' })
    cloud.setSetting('initialized', { done: true })
  },

  getTopicState: (topicId, userId) => {
    const found = get().topicStates.find((t) => t.topicId === topicId && t.userId === userId)
    return found ?? defaultTopicState(topicId, userId)
  },

  setDomainLevel: (topicId, userId, level) => {
    const base = get().getTopicState(topicId, userId)
    const updated: TopicState = { ...base, domainLevel: level }
    set((s) => ({
      topicStates: upsertBy(s.topicStates, (t) => t.topicId === topicId && t.userId === userId, updated),
    }))
    cloud.upsertTopicState(updated)
  },

  addLesson: (lesson) => {
    const id = uid('lesson')
    const full: Lesson = { ...lesson, id, createdAt: nowISO() }
    set((s) => ({ lessons: [...s.lessons, full] }))
    cloud.upsertLesson(full)
    return id
  },

  getLessonProgress: (lessonId, userId) => {
    const found = get().lessonProgress.find((p) => p.lessonId === lessonId && p.userId === userId)
    return (
      found ?? {
        lessonId,
        userId,
        posicaoSegundos: 0,
        status: 'nao_iniciada',
        observacoes: '',
        ultimoAcesso: null,
      }
    )
  },

  updateLessonProgress: (lessonId, userId, patch) => {
    const base = get().getLessonProgress(lessonId, userId)
    const updated: LessonProgress = { ...base, ...patch, ultimoAcesso: nowISO() }
    set((s) => ({
      lessonProgress: upsertBy(
        s.lessonProgress,
        (p) => p.lessonId === lessonId && p.userId === userId,
        updated
      ),
    }))
    cloud.upsertLessonProgress(updated)
  },

  logStudySession: (input) => {
    const session: StudySession = { ...input, id: uid('sess'), createdAt: nowISO() }
    let updatedTopicState: TopicState | null = null
    let newReview: Review | null = null

    set((s) => {
      let topicStates = s.topicStates
      let reviews = s.reviews

      if (session.topicId) {
        const existing = topicStates.find(
          (t) => t.topicId === session.topicId && t.userId === session.userId
        )
        const base = existing ?? defaultTopicState(session.topicId, session.userId)
        updatedTopicState = {
          ...base,
          timesStudied: base.timesStudied + 1,
          lastStudiedAt: nowISO(),
          domainLevel: (base.domainLevel === 0 ? 1 : base.domainLevel) as DomainLevel,
        }
        topicStates = existing
          ? topicStates.map((t) => (t === existing ? updatedTopicState! : t))
          : [...topicStates, updatedTopicState]

        const hasPendingReview = reviews.some(
          (r) => r.topicId === session.topicId && r.userId === session.userId && !r.done
        )
        if (!hasPendingReview && session.type !== 'revisao') {
          const due = new Date()
          due.setDate(due.getDate() + 1)
          newReview = {
            id: uid('rev'),
            userId: session.userId,
            topicId: session.topicId,
            dueDate: due.toISOString().slice(0, 10),
            reason: 'Primeira revisão após estudo inicial',
            priority: 'media',
            done: false,
            doneAt: null,
            createdAt: nowISO(),
          }
          reviews = [...reviews, newReview]
        }
      }

      return { sessions: [...s.sessions, session], topicStates, reviews }
    })

    cloud.insertSession(session)
    if (updatedTopicState) cloud.upsertTopicState(updatedTopicState)
    if (newReview) cloud.upsertReview(newReview)
  },

  addQuestionLog: (input) => {
    const log: QuestionLog = { ...input, id: uid('q'), createdAt: nowISO() }
    let updatedTopicState: TopicState | null = null

    set((s) => {
      let topicStates = s.topicStates
      if (log.topicId) {
        const existing = topicStates.find(
          (t) => t.topicId === log.topicId && t.userId === log.userId
        )
        const base = existing ?? defaultTopicState(log.topicId, log.userId)
        updatedTopicState = {
          ...base,
          questionsTotal: base.questionsTotal + log.quantidade,
          questionsCorrect: base.questionsCorrect + log.acertos,
        }
        topicStates = existing
          ? topicStates.map((t) => (t === existing ? updatedTopicState! : t))
          : [...topicStates, updatedTopicState]
      }
      return { questionLogs: [...s.questionLogs, log], topicStates }
    })

    cloud.insertQuestionLog(log)
    if (updatedTopicState) cloud.upsertTopicState(updatedTopicState)
  },

  addErrorEntry: (input) => {
    const entry: ErrorEntry = { ...input, id: uid('err') }
    set((s) => ({ errorEntries: [...s.errorEntries, entry] }))
    cloud.insertErrorEntry(entry)
  },

  scheduleReview: (topicId, userId, dueDate, reason, priority) => {
    const review: Review = {
      id: uid('rev'),
      userId,
      topicId,
      dueDate,
      reason,
      priority,
      done: false,
      doneAt: null,
      createdAt: nowISO(),
    }
    set((s) => ({ reviews: [...s.reviews, review] }))
    cloud.upsertReview(review)
  },

  completeReview: (reviewId, performancePct) => {
    const review = get().reviews.find((r) => r.id === reviewId)
    if (!review) return

    const base =
      get().topicStates.find((t) => t.topicId === review.topicId && t.userId === review.userId) ??
      defaultTopicState(review.topicId, review.userId)

    let nextInterval = base.reviewIntervalDays
    if (performancePct === null) {
      nextInterval = clamp(nextInterval * 1.3, 1, 30)
    } else if (performancePct >= 80) {
      nextInterval = clamp(nextInterval * 2.2, 1, 45)
    } else if (performancePct >= 50) {
      nextInterval = clamp(nextInterval * 1.3, 1, 30)
    } else {
      nextInterval = 1
    }

    const updatedTopicState: TopicState = {
      ...base,
      lastReviewedAt: nowISO(),
      reviewIntervalDays: Math.round(nextInterval),
    }

    const nextDue = new Date()
    nextDue.setDate(nextDue.getDate() + Math.round(nextInterval))

    const completedReview: Review = { ...review, done: true, doneAt: nowISO() }
    const newReview: Review = {
      id: uid('rev'),
      userId: review.userId,
      topicId: review.topicId,
      dueDate: nextDue.toISOString().slice(0, 10),
      reason:
        performancePct !== null
          ? `Revisão programada (desempenho anterior: ${performancePct}%)`
          : 'Revisão programada',
      priority: performancePct !== null && performancePct < 50 ? 'alta' : 'media',
      done: false,
      doneAt: null,
      createdAt: nowISO(),
    }

    set((s) => ({
      topicStates: upsertBy(
        s.topicStates,
        (t) => t.topicId === review.topicId && t.userId === review.userId,
        updatedTopicState
      ),
      reviews: [...s.reviews.map((r) => (r.id === reviewId ? completedReview : r)), newReview],
    }))

    cloud.upsertTopicState(updatedTopicState)
    cloud.upsertReview(completedReview)
    cloud.upsertReview(newReview)
  },

  setGoals: (userId, goals) => {
    set((s) => ({ goals: { ...s.goals, [userId]: goals } }))
    cloud.upsertGoals(userId, goals)
  },

  setPomodoroConfig: (config) => {
    set({ pomodoroConfig: config })
    cloud.setSetting('pomodoro_config', config)
  },

  exportData: () => JSON.stringify(get(), null, 2),

  importData: (json) => {
    try {
      const parsed = JSON.parse(json)
      set(parsed)
      ;(parsed.topicStates ?? []).forEach((t: TopicState) => cloud.upsertTopicState(t))
      ;(parsed.lessons ?? []).forEach((l: Lesson) => cloud.upsertLesson(l))
      ;(parsed.lessonProgress ?? []).forEach((p: LessonProgress) => cloud.upsertLessonProgress(p))
      ;(parsed.sessions ?? []).forEach((s: StudySession) => cloud.insertSession(s))
      ;(parsed.questionLogs ?? []).forEach((q: QuestionLog) => cloud.insertQuestionLog(q))
      ;(parsed.errorEntries ?? []).forEach((e: ErrorEntry) => cloud.insertErrorEntry(e))
      ;(parsed.reviews ?? []).forEach((r: Review) => cloud.upsertReview(r))
      if (parsed.goals) {
        cloud.upsertGoals('laise', parsed.goals.laise)
        cloud.upsertGoals('savio', parsed.goals.savio)
      }
      if (parsed.pomodoroConfig) cloud.setSetting('pomodoro_config', parsed.pomodoroConfig)
      return true
    } catch {
      return false
    }
  },

  resetAll: async () => {
    await cloud.resetAll()
    set({ ...initialState, disciplines, topics, hydrated: true, cloudInitialized: false })
  },
}))

export function daysSince(iso: string | null): number {
  return daysBetween(iso)
}

export const TODAY = todayISO
