import { useEffect, useRef, useState } from 'react'
import { usePomodoro } from '../store/usePomodoro'
import { useStore } from '../store/useStore'
import { todayISO, formatClock, parseClockToSeconds } from '../lib/utils'
import { playFocusEndSound, playBreakEndSound } from '../lib/sound'
import { notify } from '../lib/notifications'
import { Button, Card } from './ui'

export function PomodoroWatcher() {
  const tick = usePomodoro((s) => s.tick)
  const status = usePomodoro((s) => s.status)
  const phase = usePomodoro((s) => s.phase)
  const completedFocusEvent = usePomodoro((s) => s.completedFocusEvent)
  const clearCompletedEvent = usePomodoro((s) => s.clearCompletedEvent)
  const logStudySession = useStore((s) => s.logStudySession)
  const getLessonProgress = useStore((s) => s.getLessonProgress)
  const updateLessonProgress = useStore((s) => s.updateLessonProgress)
  const lessons = useStore((s) => s.lessons)

  const [toast, setToast] = useState<string | null>(null)
  const [lessonPrompt, setLessonPrompt] = useState<{ lessonId: string; userId: string } | null>(null)
  const [clockInput, setClockInput] = useState('')
  const previousPhase = useRef(phase)

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'running') tick()
    }, 1000)
    return () => clearInterval(interval)
  }, [status, tick])

  // Toca um aviso sonoro (e notifica, se a aba estiver em segundo plano) sempre que
  // uma pausa termina e o foco recomeça.
  useEffect(() => {
    if (previousPhase.current !== phase) {
      if (phase === 'foco' && (previousPhase.current === 'pausa' || previousPhase.current === 'pausa_longa')) {
        playBreakEndSound()
        if (document.hidden) {
          notify('Pausa concluída ☕', 'Hora de voltar ao foco. Toque para abrir o painel de estudos.')
        }
      }
      previousPhase.current = phase
    }
  }, [phase])

  useEffect(() => {
    if (!completedFocusEvent) return
    const { minutes, task, studyType } = completedFocusEvent

    playFocusEndSound()
    if (document.hidden) {
      notify('Ciclo de foco concluído 🍅', `${minutes} min registrados em "${task.label}".`)
    }

    logStudySession({
      userId: useStore.getState().activeUserId,
      disciplineId: task.disciplineId,
      topicId: task.topicId,
      lessonId: task.lessonId,
      type: studyType,
      plannedMinutes: minutes,
      actualMinutes: minutes,
      date: todayISO(),
      note: `Pomodoro: ${task.label}`,
    })

    setToast(`🍅 Ciclo concluído! ${minutes} min registrados em "${task.label}".`)
    const t = setTimeout(() => setToast(null), 5000)

    if (task.lessonId) {
      const lesson = lessons.find((l) => l.id === task.lessonId)
      if (lesson) {
        const progress = getLessonProgress(task.lessonId, useStore.getState().activeUserId)
        setClockInput(formatClock(progress.posicaoSegundos))
        setLessonPrompt({ lessonId: task.lessonId, userId: useStore.getState().activeUserId })
      }
    }

    clearCompletedEvent()
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedFocusEvent])

  function saveLessonProgress() {
    if (!lessonPrompt) return
    const seconds = parseClockToSeconds(clockInput)
    if (seconds === null) return
    updateLessonProgress(lessonPrompt.lessonId, lessonPrompt.userId as any, {
      posicaoSegundos: seconds,
      status: 'em_andamento',
    })
    setLessonPrompt(null)
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Card className="bg-[var(--color-primary)]/15 border-[var(--color-primary)]/40 text-sm">
            {toast}
          </Card>
        </div>
      )}

      {lessonPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-sm">
            <h3 className="font-semibold mb-2">Até onde você chegou?</h3>
            <p className="text-xs text-[var(--color-text-dim)] mb-3">
              Atualize o ponto da aula para continuar de onde parou na próxima sessão.
            </p>
            <input
              className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 mb-3 text-sm"
              value={clockInput}
              onChange={(e) => setClockInput(e.target.value)}
              placeholder="mm:ss ou hh:mm:ss"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setLessonPrompt(null)}>
                Agora não
              </Button>
              <Button onClick={saveLessonProgress}>Salvar progresso</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
