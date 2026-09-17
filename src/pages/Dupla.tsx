import { useStore } from '../store/useStore'
import { getUserStats } from '../lib/stats'
import { rankByPriority } from '../lib/engine'
import { Card, ProgressBar, StatCard } from '../components/ui'
import { formatMinutes } from '../lib/utils'

export function Dupla() {
  const state = useStore()
  const { users } = state
  const laiseStats = getUserStats(state, 'laise')
  const savioStats = getUserStats(state, 'savio')

  const laiseNext = rankByPriority(state, 'laise')[0]
  const savioNext = rankByPriority(state, 'savio')[0]

  const laiseCourse = laiseStats.courseProgressPct
  const savioCourse = savioStats.courseProgressPct
  const diff = laiseCourse - savioCourse

  let comparisonMsg = 'Vocês estão praticamente no mesmo ritmo no curso.'
  if (diff >= 8) comparisonMsg = `Você está ${diff}% à frente do Sávio no curso.`
  else if (diff <= -8) comparisonMsg = `${users.savio.name} está ${Math.abs(diff)}% à frente no curso.`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">👥 Nossa preparação</h1>
        <p className="text-sm text-[var(--color-text-dim)]">
          Organização compartilhada — isso não é uma competição.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold mb-3">Progresso no curso</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{users.laise.name}</span>
              <span className="text-[var(--color-text-dim)]">{laiseCourse}%</span>
            </div>
            <ProgressBar value={laiseCourse} color="var(--color-primary)" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{users.savio.name}</span>
              <span className="text-[var(--color-text-dim)]">{savioCourse}%</span>
            </div>
            <ProgressBar value={savioCourse} color="var(--color-primary-2)" />
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-dim)] mt-3">{comparisonMsg}</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {(['laise', 'savio'] as const).map((uid) => {
          const s = uid === 'laise' ? laiseStats : savioStats
          return (
            <Card key={uid}>
              <h2 className="font-semibold mb-3">{users[uid].name}</h2>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Aulas concluídas" value={s.lessonsConcluded} />
                <StatCard label="Horas estudadas" value={formatMinutes(s.totalMinutes)} />
                <StatCard label="Questões" value={s.questionsTotal} />
                <StatCard label="Taxa de acerto" value={s.accuracyPct !== null ? `${s.accuracyPct}%` : '—'} />
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <h2 className="text-sm font-semibold mb-3">📌 Próximos passos</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>{users.laise.name}</strong> →{' '}
            {laiseNext ? `${laiseNext.snapshot.discipline.name} — ${laiseNext.snapshot.topic.name}` : 'sem recomendação ainda'}
          </p>
          <p>
            <strong>{users.savio.name}</strong> →{' '}
            {savioNext ? `${savioNext.snapshot.discipline.name} — ${savioNext.snapshot.topic.name}` : 'sem recomendação ainda'}
          </p>
        </div>
      </Card>
    </div>
  )
}
