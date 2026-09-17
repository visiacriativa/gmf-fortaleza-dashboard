import type { AppState, UserId } from '../types'
import { pct, todayISO } from './utils'

function isoDateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface DailyPoint {
  date: string
  label: string
  minutes: number
}

/** Minutos estudados por dia, últimos `days` dias (para gráfico de barras). */
export function getMinutesEvolution(state: AppState, userId: UserId, days = 14): DailyPoint[] {
  const byDate = new Map<string, number>()
  state.sessions
    .filter((s) => s.userId === userId)
    .forEach((s) => {
      byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.actualMinutes)
    })

  const points: DailyPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = isoDateNDaysAgo(i)
    const d = new Date(date)
    points.push({
      date,
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      minutes: byDate.get(date) ?? 0,
    })
  }
  return points
}

export interface AccuracyPoint {
  key: string
  label: string
  accuracy: number | null
  total: number
}

/** Taxa de acerto agregada por semana, últimas `weeks` semanas (para gráfico de linha). */
export function getAccuracyEvolution(state: AppState, userId: UserId, weeks = 8): AccuracyPoint[] {
  const logs = state.questionLogs.filter((q) => q.userId === userId)

  function weekKey(dateISO: string): string {
    const d = new Date(dateISO)
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1)
    const pastDays = Math.floor((d.getTime() - firstDayOfYear.getTime()) / 86400000)
    const week = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7)
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
  }

  const byWeek = new Map<string, { total: number; correct: number }>()
  logs.forEach((l) => {
    const key = weekKey(l.date)
    const cur = byWeek.get(key) ?? { total: 0, correct: 0 }
    cur.total += l.quantidade
    cur.correct += l.acertos
    byWeek.set(key, cur)
  })

  const points: AccuracyPoint[] = []
  const cursor = new Date()
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(cursor)
    d.setDate(d.getDate() - i * 7)
    const key = weekKey(d.toISOString().slice(0, 10))
    const data = byWeek.get(key)
    points.push({
      key,
      label: `S${key.split('-W')[1]}`,
      accuracy: data && data.total > 0 ? pct(data.correct, data.total) : null,
      total: data?.total ?? 0,
    })
  }
  return points
}

export function getUserStats(state: AppState, userId: UserId) {
  const topicStates = state.topicStates.filter((t) => t.userId === userId)
  const totalTopics = state.topics.length

  const studiedTopics = topicStates.filter((t) => t.timesStudied > 0)
  const dominatedTopics = topicStates.filter((t) => t.domainLevel >= 3)
  const pendingTopics = totalTopics - studiedTopics.length

  const pendingReviews = state.reviews.filter(
    (r) => r.userId === userId && !r.done && r.dueDate <= todayISO()
  )
  const inReviewTopicIds = new Set(
    state.reviews.filter((r) => r.userId === userId && !r.done).map((r) => r.topicId)
  )

  const userSessions = state.sessions.filter((s) => s.userId === userId)
  const totalMinutes = userSessions.reduce((sum, s) => sum + s.actualMinutes, 0)

  const userQuestions = state.questionLogs.filter((q) => q.userId === userId)
  const questionsTotal = userQuestions.reduce((sum, q) => sum + q.quantidade, 0)
  const questionsCorrect = userQuestions.reduce((sum, q) => sum + q.acertos, 0)

  const studyDays = new Set(userSessions.map((s) => s.date))

  // sequência (streak) de dias consecutivos até hoje
  let streak = 0
  const cursor = new Date()
  for (;;) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
      cursor.getDate()
    ).padStart(2, '0')}`
    if (studyDays.has(iso)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  const userLessonProgress = state.lessonProgress.filter((p) => p.userId === userId)
  const lessonsTotal = state.lessons.length
  const lessonsConcluded = userLessonProgress.filter((p) => p.status === 'concluida').length
  const lessonsInProgress = userLessonProgress.filter((p) => p.status === 'em_andamento').length

  const courseProgressPct =
    lessonsTotal > 0
      ? pct(
          state.lessons.reduce((sum, l) => {
            const p = userLessonProgress.find((lp) => lp.lessonId === l.id)
            if (!p) return sum
            if (p.status === 'concluida') return sum + 1
            if (l.duracaoSegundos > 0) return sum + Math.min(1, p.posicaoSegundos / l.duracaoSegundos)
            return sum
          }, 0),
          lessonsTotal
        )
      : 0

  return {
    totalTopics,
    studiedCount: studiedTopics.length,
    editalStudiedPct: pct(studiedTopics.length, totalTopics),
    dominatedCount: dominatedTopics.length,
    editalDominatedPct: pct(dominatedTopics.length, totalTopics),
    pendingCount: Math.max(0, pendingTopics),
    inReviewCount: inReviewTopicIds.size,
    pendingReviewsCount: pendingReviews.length,
    totalMinutes,
    questionsTotal,
    questionsCorrect,
    accuracyPct: questionsTotal > 0 ? pct(questionsCorrect, questionsTotal) : null,
    studyDaysCount: studyDays.size,
    streak,
    lessonsTotal,
    lessonsConcluded,
    lessonsInProgress,
    courseProgressPct,
  }
}
