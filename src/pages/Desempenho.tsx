import { useStore } from '../store/useStore'
import { rankByPriority, riskLevel, snapshotTopics } from '../lib/engine'
import { getUserStats, getMinutesEvolution, getAccuracyEvolution } from '../lib/stats'
import { Card, ProgressBar, Pill, StatCard } from '../components/ui'
import { MinutesChart, AccuracyChart } from '../components/EvolutionCharts'

const RISK_META = {
  critico: { label: 'Crítico', tone: 'bad' as const, emoji: '🔴' },
  atencao: { label: 'Atenção', tone: 'warn' as const, emoji: '🟠' },
  monitorar: { label: 'Monitorar', tone: 'neutral' as const, emoji: '🟡' },
  controlado: { label: 'Controlado', tone: 'good' as const, emoji: '🟢' },
}

export function Desempenho() {
  const state = useStore()
  const { activeUserId, disciplines } = state
  const stats = getUserStats(state, activeUserId)
  const ranking = rankByPriority(state, activeUserId)
  const snaps = snapshotTopics(state, activeUserId)
  const minutesEvolution = getMinutesEvolution(state, activeUserId, 14)
  const accuracyEvolution = getAccuracyEvolution(state, activeUserId, 8)

  const byDiscipline = disciplines.map((d) => {
    const topicSnaps = snaps.filter((s) => s.discipline.id === d.id)
    const avgDomain = topicSnaps.length
      ? topicSnaps.reduce((sum, s) => sum + s.state.domainLevel, 0) / topicSnaps.length
      : 0
    const withAccuracy = topicSnaps.filter((s) => s.accuracy !== null)
    const accuracy = withAccuracy.length
      ? Math.round(withAccuracy.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) / withAccuracy.length)
      : null
    return { discipline: d, domainPct: Math.round((avgDomain / 4) * 100), accuracy }
  })

  const riskGroups = ranking.reduce<Record<string, typeof ranking>>((acc, r) => {
    const level = riskLevel(r)
    acc[level] = acc[level] ?? []
    acc[level].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">📊 Painel de preparação</h1>
        <p className="text-sm text-[var(--color-text-dim)]">
          Indicadores de preparação — não é uma previsão de aprovação.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Cobertura do edital" value={`${stats.editalStudiedPct}%`} />
        <StatCard label="Domínio médio" value={`${stats.editalDominatedPct}%`} sub="assuntos com bom domínio" />
        <StatCard label="Desempenho em questões" value={stats.accuracyPct !== null ? `${stats.accuracyPct}%` : '—'} />
        <StatCard label="Regularidade" value={`${stats.streak}d seguidos`} />
        <StatCard label="Revisões pendentes" value={stats.pendingReviewsCount} />
        <StatCard label="Erros registrados" value={state.errorEntries.filter((e) => e.userId === activeUserId).length} />
        <StatCard label="Progresso das aulas" value={`${stats.courseProgressPct}%`} />
        <StatCard label="Questões realizadas" value={stats.questionsTotal} />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <MinutesChart data={minutesEvolution} />
        <AccuracyChart data={accuracyEvolution} />
      </div>

      <Card>
        <h2 className="text-sm font-semibold mb-3">Domínio declarado × Desempenho em questões</h2>
        <div className="space-y-3">
          {byDiscipline.map(({ discipline, domainPct, accuracy }) => (
            <div key={discipline.id}>
              <p className="text-sm mb-1">{discipline.name}</p>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs w-20 text-[var(--color-text-dim)]">Domínio</span>
                <ProgressBar value={domainPct} color="var(--color-d4)" />
                <span className="text-xs w-10 text-right">{domainPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs w-20 text-[var(--color-text-dim)]">Questões</span>
                <ProgressBar value={accuracy ?? 0} color="var(--color-primary-2)" />
                <span className="text-xs w-10 text-right">{accuracy !== null ? `${accuracy}%` : '—'}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold mb-3">⚠️ Mapa de risco</h2>
        <div className="space-y-4">
          {(['critico', 'atencao', 'monitorar', 'controlado'] as const).map((level) => {
            const group = riskGroups[level] ?? []
            if (group.length === 0) return null
            const meta = RISK_META[level]
            return (
              <div key={level}>
                <p className="text-xs font-semibold mb-1.5">
                  {meta.emoji} {meta.label} ({group.length})
                </p>
                <div className="space-y-1">
                  {group.slice(0, 6).map((r) => (
                    <div key={r.snapshot.topic.id} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">{r.snapshot.topic.name}</span>
                      <Pill tone={meta.tone}>{r.score}</Pill>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
