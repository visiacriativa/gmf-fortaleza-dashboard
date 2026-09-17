import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Coffee, ListChecks } from 'lucide-react'
import { useStore } from '../store/useStore'
import { usePomodoro } from '../store/usePomodoro'
import { buildTodaySession } from '../lib/engine'
import { Card, Button, Pill } from '../components/ui'
import { QuickRegisterForm } from '../components/QuickRegisterForm'

export function EstudoHoje() {
  const navigate = useNavigate()
  const state = useStore()
  const { activeUserId, goals } = state
  const [minutes, setMinutes] = useState(goals[activeUserId].dailyMinutes)
  const [showQuick, setShowQuick] = useState(false)
  const blocks = buildTodaySession(state, activeUserId, minutes)
  const startPomodoro = usePomodoro((s) => s.start)

  function startBlock(block: (typeof blocks)[number]) {
    startPomodoro(
      {
        disciplineId: block.disciplineId ?? null,
        topicId: block.topicId ?? null,
        lessonId: block.lessonId ?? null,
        label: block.label,
      },
      block.kind === 'questoes' ? 'questoes' : block.lessonId ? 'video' : 'teoria',
      state.pomodoroConfig
    )
    navigate('/pomodoro')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">🎯 Estudo de hoje</h1>
          <p className="text-sm text-[var(--color-text-dim)]">
            Sessão montada automaticamente com base nas suas prioridades atuais.
          </p>
        </div>
        <Button variant="ghost" onClick={() => setShowQuick(true)}>
          + Registrar estudo
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-text-dim)]">Duração da sessão</span>
          <input
            type="number"
            className="w-24 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-1.5 text-sm"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value) || 0)}
          />
          <span className="text-sm text-[var(--color-text-dim)]">min</span>
        </div>
      </Card>

      {blocks.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--color-text-dim)]">
            Ainda não há dados suficientes para montar uma recomendação. Comece registrando algum estudo ou
            explore o Edital para escolher um assunto.
          </p>
          <Button className="mt-3" variant="surface" onClick={() => navigate('/edital')}>
            Ver edital
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {blocks.map((b, i) => (
            <Card key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0">
                  {b.kind === 'foco' ? '🍅' : b.kind === 'pausa' ? <Coffee size={18} /> : <ListChecks size={18} />}
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{b.label}</p>
                  <p className="text-xs text-[var(--color-text-dim)]">{b.minutes} min</p>
                </div>
              </div>
              {b.kind !== 'pausa' && (
                <Button variant="surface" onClick={() => startBlock(b)}>
                  <Play size={16} /> Começar
                </Button>
              )}
              {b.kind === 'pausa' && <Pill>pausa</Pill>}
            </Card>
          ))}
        </div>
      )}

      {showQuick && <QuickRegisterForm onClose={() => setShowQuick(false)} />}
    </div>
  )
}
