import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Card, Pill } from '../components/ui'
import { formatMinutes } from '../lib/utils'

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function Calendario() {
  const state = useStore()
  const { activeUserId } = state
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState<string | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = firstDay.getDay()

  const dayData = useMemo(() => {
    const map = new Map<string, { minutes: number; questions: number }>()
    state.sessions
      .filter((s) => s.userId === activeUserId)
      .forEach((s) => {
        const cur = map.get(s.date) ?? { minutes: 0, questions: 0 }
        cur.minutes += s.actualMinutes
        map.set(s.date, cur)
      })
    state.questionLogs
      .filter((q) => q.userId === activeUserId)
      .forEach((q) => {
        const cur = map.get(q.date) ?? { minutes: 0, questions: 0 }
        cur.questions += q.quantidade
        map.set(q.date, cur)
      })
    return map
  }, [state.sessions, state.questionLogs, activeUserId])

  const cells: (number | null)[] = [...Array(startWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const selectedData = selected ? dayData.get(selected) : undefined

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📅 Calendário</h1>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded-lg border border-[var(--color-border)] text-sm"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            ‹
          </button>
          <span className="text-sm min-w-32 text-center">
            {cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <button
            className="px-2 py-1 rounded-lg border border-[var(--color-border)] text-sm"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            ›
          </button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--color-text-dim)] mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />
            const iso = isoDate(year, month, day)
            const data = dayData.get(iso)
            const studied = !!data && data.minutes > 0
            return (
              <button
                key={i}
                onClick={() => setSelected(iso)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs gap-0.5 border ${
                  selected === iso ? 'border-[var(--color-primary)]' : 'border-transparent'
                } ${studied ? 'bg-green-500/15' : 'bg-[var(--color-surface-2)]'}`}
              >
                <span>{studied ? '🟢' : '⚪'}</span>
                <span>{day}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {selected && (
        <Card>
          <h2 className="text-sm font-semibold mb-2">{selected}</h2>
          {selectedData ? (
            <div className="flex gap-2 flex-wrap">
              <Pill tone="good">📚 {formatMinutes(selectedData.minutes)}</Pill>
              <Pill>📝 {selectedData.questions} questões</Pill>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-dim)]">Nenhum estudo registrado neste dia.</p>
          )}
        </Card>
      )}
    </div>
  )
}
