import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Card, Button, Pill } from '../components/ui'
import { todayISO } from '../lib/utils'

export function Revisoes() {
  const state = useStore()
  const { activeUserId, disciplines, topics } = state
  const completeReview = useStore((s) => s.completeReview)
  const [performanceInputs, setPerformanceInputs] = useState<Record<string, string>>({})

  const myReviews = state.reviews.filter((r) => r.userId === activeUserId && !r.done)
  const today = todayISO()
  const overdue = myReviews.filter((r) => r.dueDate < today).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const dueToday = myReviews.filter((r) => r.dueDate === today)
  const upcoming = myReviews
    .filter((r) => r.dueDate > today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 10)

  function topicInfo(topicId: string) {
    const topic = topics.find((t) => t.id === topicId)
    const discipline = topic ? disciplines.find((d) => d.id === topic.disciplineId) : undefined
    return { topic, discipline }
  }

  function finish(reviewId: string) {
    const raw = performanceInputs[reviewId]
    const value = raw !== undefined && raw !== '' ? Number(raw) : null
    completeReview(reviewId, value)
  }

  const priorityTone = { alta: 'bad', media: 'warn', baixa: 'neutral' } as const

  function ReviewRow({ r }: { r: (typeof myReviews)[number] }) {
    const { topic, discipline } = topicInfo(r.topicId)
    return (
      <Card>
        <div className="flex items-center justify-between mb-1">
          <Pill tone={priorityTone[r.priority]}>{r.priority.toUpperCase()}</Pill>
          <span className="text-xs text-[var(--color-text-dim)]">vence em {r.dueDate}</span>
        </div>
        <p className="font-medium">{discipline?.name}</p>
        <p className="text-sm text-[var(--color-text-dim)] mb-2">{topic?.name}</p>
        <p className="text-xs text-[var(--color-text-dim)] mb-3">{r.reason}</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="% acerto (opcional)"
            className="w-40 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-1.5 text-sm"
            value={performanceInputs[r.id] ?? ''}
            onChange={(e) => setPerformanceInputs((p) => ({ ...p, [r.id]: e.target.value }))}
          />
          <Button variant="surface" onClick={() => finish(r.id)}>
            Concluir revisão
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">🔄 Revisões</h1>
        <p className="text-sm text-[var(--color-text-dim)]">Repetição espaçada baseada no seu desempenho real.</p>
      </div>

      {overdue.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-red-400 mb-2">🔴 Atrasadas ({overdue.length})</h2>
          <div className="space-y-2">
            {overdue.map((r) => (
              <ReviewRow key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-2">Hoje ({dueToday.length})</h2>
        {dueToday.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--color-text-dim)]">Nenhuma revisão prevista para hoje.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {dueToday.map((r) => (
              <ReviewRow key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-dim)] mb-2">Próximas</h2>
          <div className="space-y-2">
            {upcoming.map((r) => (
              <ReviewRow key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
