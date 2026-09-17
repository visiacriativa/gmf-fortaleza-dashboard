import { useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Bell, BellOff, BellRing } from 'lucide-react'
import { useStore } from '../store/useStore'
import { usePomodoro } from '../store/usePomodoro'
import { Card, Button, Pill } from '../components/ui'
import { formatClock } from '../lib/utils'
import { isSoundEnabled, setSoundEnabled, playFocusEndSound } from '../lib/sound'
import {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationsWanted,
  setNotificationsWanted,
  type NotificationPermissionState,
} from '../lib/notifications'
import type { StudyType } from '../types'

const PRESETS = [
  { label: '25 / 5', focusMin: 25, breakMin: 5 },
  { label: '40 / 10', focusMin: 40, breakMin: 10 },
  { label: '50 / 10', focusMin: 50, breakMin: 10 },
]

const TYPES: { value: StudyType; label: string }[] = [
  { value: 'teoria', label: '📚 Teoria' },
  { value: 'video', label: '🎥 Vídeo-aula' },
  { value: 'questoes', label: '📝 Questões' },
  { value: 'revisao', label: '🔄 Revisão' },
]

export function PomodoroPage() {
  const state = useStore()
  const { disciplines, topics, pomodoroConfig } = state
  const setPomodoroConfig = useStore((s) => s.setPomodoroConfig)

  const pomo = usePomodoro()
  const [disciplineId, setDisciplineId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [label, setLabel] = useState('')
  const [type, setType] = useState<StudyType>('teoria')
  const [customFocus, setCustomFocus] = useState(pomodoroConfig.focusMin)
  const [customBreak, setCustomBreak] = useState(pomodoroConfig.breakMin)
  const [soundOn, setSoundOn] = useState(isSoundEnabled())
  const [notifPermission, setNotifPermission] = useState<NotificationPermissionState>(
    getNotificationPermission()
  )
  const [notifWanted, setNotifWanted] = useState(isNotificationsWanted())

  function toggleSound() {
    const next = !soundOn
    setSoundEnabled(next)
    setSoundOn(next)
    if (next) playFocusEndSound()
  }

  async function toggleNotifications() {
    if (notifPermission === 'granted') {
      const next = !notifWanted
      setNotificationsWanted(next)
      setNotifWanted(next)
      return
    }
    if (notifPermission === 'unsupported' || notifPermission === 'denied') return
    const result = await requestNotificationPermission()
    setNotifPermission(result)
    if (result === 'granted') {
      setNotificationsWanted(true)
      setNotifWanted(true)
    }
  }

  const availableTopics = topics.filter((t) => t.disciplineId === disciplineId)
  const totalSeconds =
    pomo.phase === 'foco'
      ? pomo.config.focusMin * 60
      : pomo.phase === 'pausa_longa'
      ? pomo.config.longBreakMin * 60
      : pomo.config.breakMin * 60
  const progress = totalSeconds > 0 ? ((totalSeconds - pomo.secondsLeft) / totalSeconds) * 100 : 0

  function applyPreset(focusMin: number, breakMin: number) {
    const cfg = { ...pomodoroConfig, focusMin, breakMin }
    setPomodoroConfig(cfg)
    setCustomFocus(focusMin)
    setCustomBreak(breakMin)
  }

  function applyCustom() {
    setPomodoroConfig({ ...pomodoroConfig, focusMin: customFocus, breakMin: customBreak })
  }

  function startNew() {
    const discipline = disciplines.find((d) => d.id === disciplineId)
    const topic = topics.find((t) => t.id === topicId)
    const finalLabel = label || topic?.name || discipline?.name || 'Estudo livre'
    pomo.start(
      { disciplineId: disciplineId || null, topicId: topicId || null, lessonId: null, label: finalLabel },
      type,
      pomodoroConfig
    )
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-bold">🍅 Pomodoro</h1>
        <p className="text-sm text-[var(--color-text-dim)]">Foco cronometrado, associado ao seu estudo.</p>
      </div>

      <Card className="text-center py-8 relative">
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <button
            onClick={toggleNotifications}
            title={
              notifPermission === 'unsupported'
                ? 'Notificações não são suportadas neste navegador'
                : notifPermission === 'denied'
                ? 'Notificações bloqueadas — habilite pelo navegador para receber avisos com a aba em segundo plano'
                : notifPermission === 'granted' && notifWanted
                ? 'Notificações ativadas — clique para desativar'
                : notifPermission === 'granted'
                ? 'Notificações desativadas — clique para ativar'
                : 'Ativar notificações (avisa mesmo com a aba em segundo plano)'
            }
            disabled={notifPermission === 'unsupported' || notifPermission === 'denied'}
            className="p-1.5 rounded-lg text-[var(--color-text-dim)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:pointer-events-none"
          >
            {notifPermission === 'granted' && notifWanted ? (
              <BellRing size={16} />
            ) : notifPermission === 'denied' ? (
              <BellOff size={16} />
            ) : (
              <Bell size={16} />
            )}
          </button>
          <button
            onClick={toggleSound}
            title={soundOn ? 'Som ativado — clique para silenciar' : 'Som desativado — clique para ativar'}
            className="p-1.5 rounded-lg text-[var(--color-text-dim)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
        <Pill tone={pomo.phase === 'foco' ? 'good' : 'neutral'}>
          {pomo.phase === 'foco' ? 'FOCO' : pomo.phase === 'pausa_longa' ? 'PAUSA LONGA' : 'PAUSA'}
        </Pill>
        <div className="text-6xl font-bold my-4 tabular-nums">{formatClock(pomo.secondsLeft)}</div>
        <div className="progress-track h-2 mx-auto max-w-xs mb-2">
          <div
            className="h-full bg-[var(--color-primary)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[var(--color-text-dim)]">Ciclos concluídos: {pomo.cyclesCompleted}</p>

        {notifPermission === 'default' && (
          <button
            onClick={toggleNotifications}
            className="text-xs text-[var(--color-primary)] underline decoration-dotted mt-1"
          >
            Ativar aviso mesmo com a aba em segundo plano
          </button>
        )}

        {pomo.task && (
          <p className="text-sm mt-3 font-medium">{pomo.task.label}</p>
        )}

        <div className="flex items-center justify-center gap-2 mt-6">
          {pomo.status === 'idle' && (
            <Button onClick={startNew}>
              <Play size={16} /> Iniciar
            </Button>
          )}
          {pomo.status === 'running' && (
            <Button onClick={pomo.pause} variant="surface">
              <Pause size={16} /> Pausar
            </Button>
          )}
          {pomo.status === 'paused' && (
            <Button onClick={pomo.resume}>
              <Play size={16} /> Continuar
            </Button>
          )}
          {pomo.status !== 'idle' && (
            <>
              <Button variant="ghost" onClick={pomo.skip}>
                <SkipForward size={16} /> Pular etapa
              </Button>
              <Button variant="ghost" onClick={pomo.reset}>
                <RotateCcw size={16} /> Reiniciar
              </Button>
            </>
          )}
        </div>
      </Card>

      {pomo.status === 'idle' && (
        <Card>
          <h2 className="text-sm font-semibold mb-3">Associar a um estudo</h2>
          <div className="space-y-2">
            <select
              className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
              value={disciplineId}
              onChange={(e) => {
                setDisciplineId(e.target.value)
                setTopicId('')
              }}
            >
              <option value="">Selecione a matéria (opcional)</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {disciplineId && (
              <select
                className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">Selecione o assunto (opcional)</option>
                {availableTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name.slice(0, 60)}
                  </option>
                ))}
              </select>
            )}
            <input
              className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
              placeholder="Ou descreva a tarefa livremente"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs border ${
                    type === t.value
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-sm font-semibold mb-3">Configuração</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.focusMin, p.breakMin)}
              className={`rounded-lg px-3 py-1.5 text-sm border ${
                pomodoroConfig.focusMin === p.focusMin && pomodoroConfig.breakMin === p.breakMin
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--color-text-dim)]">Personalizado:</span>
          <input
            type="number"
            className="w-16 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-1"
            value={customFocus}
            onChange={(e) => setCustomFocus(Number(e.target.value) || 0)}
          />
          <span>/</span>
          <input
            type="number"
            className="w-16 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-1"
            value={customBreak}
            onChange={(e) => setCustomBreak(Number(e.target.value) || 0)}
          />
          <Button variant="ghost" onClick={applyCustom}>
            Aplicar
          </Button>
        </div>
      </Card>
    </div>
  )
}
