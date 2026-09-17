import type { AppState, Discipline, Topic, TopicState, UserId } from '../types'
import { clamp, daysBetween, pct } from './utils'

export interface TopicSnapshot {
  topic: Topic
  discipline: Discipline
  state: TopicState
  accuracy: number | null // null = sem dados
  daysSinceStudy: number
  daysSinceReview: number
  studied: boolean
}

export function snapshotTopics(state: AppState, userId: UserId): TopicSnapshot[] {
  return state.topics.map((topic) => {
    const discipline = state.disciplines.find((d) => d.id === topic.disciplineId)!
    const ts =
      state.topicStates.find((t) => t.topicId === topic.id && t.userId === userId) ?? {
        topicId: topic.id,
        userId,
        domainLevel: 0 as const,
        timesStudied: 0,
        questionsTotal: 0,
        questionsCorrect: 0,
        lastStudiedAt: null,
        lastReviewedAt: null,
        reviewIntervalDays: 1,
      }
    const accuracy = ts.questionsTotal > 0 ? pct(ts.questionsCorrect, ts.questionsTotal) : null
    return {
      topic,
      discipline,
      state: ts,
      accuracy,
      daysSinceStudy: daysBetween(ts.lastStudiedAt),
      daysSinceReview: daysBetween(ts.lastReviewedAt),
      studied: ts.timesStudied > 0,
    }
  })
}

export interface PriorityResult {
  snapshot: TopicSnapshot
  score: number
  reasons: string[]
}

/**
 * Score de prioridade (0-100). Quanto maior, mais urgente estudar/revisar o assunto.
 * Todo fator só entra na justificativa quando há dado real por trás dele.
 */
export function priorityScore(s: TopicSnapshot): PriorityResult {
  const reasons: string[] = []
  let score = 0

  if (!s.studied) {
    score = 78
    reasons.push('Ainda não estudado')
  } else {
    score = 30

    if (s.accuracy !== null) {
      const gap = 100 - s.accuracy
      score += gap * 0.25
      if (s.accuracy < 70) reasons.push(`${s.accuracy}% de acerto em questões`)
    }

    const domainGap = 4 - s.state.domainLevel
    score += domainGap * 6
    if (s.state.domainLevel <= 1) reasons.push('Domínio declarado baixo')

    if (Number.isFinite(s.daysSinceReview)) {
      const d = clamp(s.daysSinceReview, 0, 30)
      score += d * 1.4
      if (d >= 7) reasons.push(`${d} dias sem revisão`)
    } else if (Number.isFinite(s.daysSinceStudy) && s.daysSinceStudy >= 5) {
      score += 10
      reasons.push(`${s.daysSinceStudy} dias sem contato`)
    }

    const errorCount = s.state.questionsTotal - s.state.questionsCorrect
    if (errorCount > 0) {
      score += Math.min(errorCount, 10) * 1.5
      if (errorCount >= 3) reasons.push(`${errorCount} erros acumulados em questões`)
    }
  }

  return { snapshot: s, score: Math.round(clamp(score, 0, 100)), reasons }
}

export function rankByPriority(state: AppState, userId: UserId): PriorityResult[] {
  return snapshotTopics(state, userId)
    .map(priorityScore)
    .sort((a, b) => b.score - a.score)
}

export type RiskLevel = 'critico' | 'atencao' | 'monitorar' | 'controlado'

export function riskLevel(p: PriorityResult): RiskLevel {
  if (!p.snapshot.studied) {
    return p.score >= 78 ? 'atencao' : 'monitorar'
  }
  if (p.score >= 65) return 'critico'
  if (p.score >= 45) return 'atencao'
  if (p.score >= 25) return 'monitorar'
  return 'controlado'
}

// ===== Insights =====
export interface Insight {
  id: string
  text: string
  tone: 'positivo' | 'atencao' | 'neutro'
}

export function buildInsights(state: AppState, userId: UserId): Insight[] {
  const insights: Insight[] = []
  const snaps = snapshotTopics(state, userId)
  const studied = snaps.filter((s) => s.studied)

  if (studied.length < 2) {
    return [
      {
        id: 'no-data',
        text: 'Ainda não há dados suficientes para gerar uma recomendação personalizada. Continue registrando seus estudos.',
        tone: 'neutro',
      },
    ]
  }

  // Desempenho por disciplina com volume mínimo de questões
  const byDiscipline = new Map<string, { correct: number; total: number; name: string }>()
  state.questionLogs
    .filter((q) => q.userId === userId)
    .forEach((q) => {
      const d = state.disciplines.find((d) => d.id === q.disciplineId)
      if (!d) return
      const cur = byDiscipline.get(d.id) ?? { correct: 0, total: 0, name: d.name }
      cur.correct += q.acertos
      cur.total += q.quantidade
      byDiscipline.set(d.id, cur)
    })

  const withVolume = [...byDiscipline.values()].filter((v) => v.total >= 5)
  if (withVolume.length > 0) {
    const worst = withVolume.reduce((a, b) => (a.correct / a.total < b.correct / b.total ? a : b))
    const worstPct = pct(worst.correct, worst.total)
    if (worstPct < 70) {
      insights.push({
        id: 'worst-discipline',
        text: `${worst.name} é atualmente seu maior ponto de atenção (${worstPct}% de acerto em questões).`,
        tone: 'atencao',
      })
    }
    const best = withVolume.reduce((a, b) => (a.correct / a.total > b.correct / b.total ? a : b))
    const bestPct = pct(best.correct, best.total)
    if (bestPct >= 80 && best.name !== worst.name) {
      insights.push({
        id: 'best-discipline',
        text: `Seu desempenho em ${best.name} está sólido (${bestPct}% de acerto).`,
        tone: 'positivo',
      })
    }
  }

  // Revisões pendentes vs conteúdo novo recente
  const pendingReviews = state.reviews.filter(
    (r) => r.userId === userId && !r.done && r.dueDate <= new Date().toISOString().slice(0, 10)
  )
  const recentNewTopics = snaps.filter(
    (s) => s.studied && Number.isFinite(s.daysSinceStudy) && s.daysSinceStudy <= 7
  ).length
  if (pendingReviews.length >= 3 && recentNewTopics >= 3) {
    insights.push({
      id: 'new-vs-review',
      text: `Você estudou ${recentNewTopics} assuntos novos nos últimos 7 dias, mas há ${pendingReviews.length} revisões pendentes. Considere revisar antes de avançar.`,
      tone: 'atencao',
    })
  }

  // Domínio declarado vs desempenho real
  const declaredHighButLowAccuracy = studied.filter(
    (s) => s.state.domainLevel >= 3 && s.accuracy !== null && s.accuracy < 60
  )
  if (declaredHighButLowAccuracy.length > 0) {
    const t = declaredHighButLowAccuracy[0]
    insights.push({
      id: 'domain-vs-accuracy',
      text: `Seu desempenho em questões de "${t.topic.name}" está abaixo do domínio que você declarou. Vale revisar a teoria.`,
      tone: 'atencao',
    })
  }

  // Assunto muito tempo sem revisão
  const overdueLong = studied
    .filter((s) => Number.isFinite(s.daysSinceReview) && s.daysSinceReview >= 10)
    .sort((a, b) => b.daysSinceReview - a.daysSinceReview)[0]
  if (overdueLong) {
    insights.push({
      id: 'overdue-review',
      text: `Você está há ${overdueLong.daysSinceReview} dias sem revisar "${overdueLong.topic.name}".`,
      tone: 'atencao',
    })
  }

  // Concentração excessiva em assuntos já dominados (últimos 7 dias)
  const recentSessions = state.sessions.filter(
    (s) => s.userId === userId && daysBetween(s.createdAt) <= 7
  )
  if (recentSessions.length >= 5) {
    const minutesInStrong = recentSessions
      .filter((s) => {
        const ts = state.topicStates.find((t) => t.topicId === s.topicId && t.userId === userId)
        return ts && ts.domainLevel >= 3
      })
      .reduce((sum, s) => sum + s.actualMinutes, 0)
    const totalMinutes = recentSessions.reduce((sum, s) => sum + s.actualMinutes, 0)
    if (totalMinutes > 0 && minutesInStrong / totalMinutes > 0.6) {
      insights.push({
        id: 'over-focus-strong',
        text: 'Você está concentrando muito tempo em assuntos que já apresentam bom domínio. Considere priorizar suas fraquezas.',
        tone: 'atencao',
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: 'steady',
      text: 'Sua preparação está equilibrada até aqui. Continue registrando estudos e questões para refinar as recomendações.',
      tone: 'neutro',
    })
  }

  return insights
}

// ===== Sessão de estudo do dia =====
export interface SessionBlock {
  kind: 'foco' | 'pausa' | 'questoes'
  minutes: number
  label: string
  topicId?: string
  disciplineId?: string
  lessonId?: string
}

export function buildTodaySession(
  state: AppState,
  userId: UserId,
  totalMinutes: number
): SessionBlock[] {
  const config = state.pomodoroConfig
  const ranking = rankByPriority(state, userId).filter((r) => r.score > 0)
  const top = ranking.slice(0, 3)

  const blocks: SessionBlock[] = []
  let remaining = totalMinutes
  let cycle = 0
  let topIndex = 0

  // Reserva um bloco final de questões se houver tempo (>=45min) e algum assunto prioritário.
  const reserveQuestions = totalMinutes >= 45 && top.length > 0
  const questionsMinutes = reserveQuestions ? Math.min(15, Math.round(totalMinutes * 0.15)) : 0
  remaining -= questionsMinutes

  while (remaining > 0 && top.length > 0) {
    const focusMin = Math.min(config.focusMin, remaining)
    const current = top[topIndex % top.length]
    blocks.push({
      kind: 'foco',
      minutes: focusMin,
      label: current.snapshot.studied
        ? `Continuar: ${current.snapshot.topic.name}`
        : `Iniciar: ${current.snapshot.topic.name}`,
      topicId: current.snapshot.topic.id,
      disciplineId: current.snapshot.discipline.id,
    })
    remaining -= focusMin
    topIndex++
    cycle++

    if (remaining <= 0) break

    const isLong = cycle % config.cyclesBeforeLongBreak === 0
    const breakMin = Math.min(isLong ? config.longBreakMin : config.breakMin, remaining)
    if (breakMin > 0) {
      blocks.push({ kind: 'pausa', minutes: breakMin, label: isLong ? 'Pausa longa' : 'Pausa' })
      remaining -= breakMin
    }
  }

  if (questionsMinutes > 0) {
    const focusTopic = top[0]
    blocks.push({
      kind: 'questoes',
      minutes: questionsMinutes,
      label: `Questões: ${focusTopic.snapshot.topic.name}`,
      topicId: focusTopic.snapshot.topic.id,
      disciplineId: focusTopic.snapshot.discipline.id,
    })
  }

  return blocks
}
