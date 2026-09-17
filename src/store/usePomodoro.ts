import { create } from 'zustand'
import type { PomodoroConfig, PomodoroTask, StudyType } from '../types'

export type PomodoroPhase = 'foco' | 'pausa' | 'pausa_longa'
export type PomodoroStatus = 'idle' | 'running' | 'paused'

export interface CompletedFocusEvent {
  minutes: number
  task: PomodoroTask
  studyType: StudyType
  at: number
}

interface PomodoroRuntime {
  status: PomodoroStatus
  phase: PomodoroPhase
  secondsLeft: number
  /** Timestamp (epoch ms) em que a fase atual termina. Fonte da verdade do cronômetro —
   *  permite recalcular o tempo restante com base no relógio real, em vez de contar ticks,
   *  o que mantém a precisão mesmo quando a aba fica em segundo plano e o navegador
   *  limita a frequência do setInterval. */
  phaseEndsAt: number | null
  cyclesCompleted: number
  task: PomodoroTask | null
  studyType: StudyType
  config: PomodoroConfig
  completedFocusEvent: CompletedFocusEvent | null

  start: (task: PomodoroTask, studyType: StudyType, config: PomodoroConfig) => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
  tick: () => void
  clearCompletedEvent: () => void
}

const idleDefaults = {
  status: 'idle' as PomodoroStatus,
  phase: 'foco' as PomodoroPhase,
  secondsLeft: 25 * 60,
  phaseEndsAt: null as number | null,
  cyclesCompleted: 0,
  task: null as PomodoroTask | null,
  studyType: 'teoria' as StudyType,
}

function phaseDurationSeconds(phase: PomodoroPhase, config: PomodoroConfig): number {
  if (phase === 'foco') return config.focusMin * 60
  if (phase === 'pausa_longa') return config.longBreakMin * 60
  return config.breakMin * 60
}

export const usePomodoro = create<PomodoroRuntime>((set, get) => ({
  ...idleDefaults,
  config: { focusMin: 25, breakMin: 5, longBreakMin: 15, cyclesBeforeLongBreak: 4 },
  completedFocusEvent: null,

  start: (task, studyType, config) => {
    const seconds = config.focusMin * 60
    set({
      status: 'running',
      phase: 'foco',
      secondsLeft: seconds,
      phaseEndsAt: Date.now() + seconds * 1000,
      cyclesCompleted: 0,
      task,
      studyType,
      config,
    })
  },

  pause: () =>
    set((s) => (s.status === 'running' ? { status: 'paused', phaseEndsAt: null } : {})),

  resume: () =>
    set((s) =>
      s.status === 'paused'
        ? { status: 'running', phaseEndsAt: Date.now() + s.secondsLeft * 1000 }
        : {}
    ),

  reset: () =>
    set({
      ...idleDefaults,
      config: get().config,
    }),

  skip: () => {
    const s = get()
    if (s.status === 'idle') return
    if (s.phase === 'foco' && s.task) {
      const elapsedSeconds = s.config.focusMin * 60 - s.secondsLeft
      const minutes = Math.max(1, Math.round(elapsedSeconds / 60))
      set({ completedFocusEvent: { minutes, task: s.task, studyType: s.studyType, at: Date.now() } })
      const nextCycles = s.cyclesCompleted + 1
      const isLong = nextCycles % s.config.cyclesBeforeLongBreak === 0
      const nextPhase = isLong ? 'pausa_longa' : 'pausa'
      const seconds = phaseDurationSeconds(nextPhase, s.config)
      set({
        cyclesCompleted: nextCycles,
        phase: nextPhase,
        secondsLeft: seconds,
        phaseEndsAt: s.status === 'running' ? Date.now() + seconds * 1000 : null,
      })
    } else {
      const seconds = phaseDurationSeconds('foco', s.config)
      set({
        phase: 'foco',
        secondsLeft: seconds,
        phaseEndsAt: s.status === 'running' ? Date.now() + seconds * 1000 : null,
      })
    }
  },

  tick: () => {
    const s = get()
    if (s.status !== 'running' || s.phaseEndsAt === null) return

    const remaining = Math.round((s.phaseEndsAt - Date.now()) / 1000)
    if (remaining > 0) {
      if (remaining !== s.secondsLeft) set({ secondsLeft: remaining })
      return
    }

    // fase terminou (pode ter passado mais de 1 fase se a aba ficou muito tempo em segundo plano;
    // tratamos aqui apenas a transição imediata, o que é suficiente para o uso normal do app)
    if (s.phase === 'foco') {
      if (s.task) {
        set({
          completedFocusEvent: {
            minutes: s.config.focusMin,
            task: s.task,
            studyType: s.studyType,
            at: Date.now(),
          },
        })
      }
      const nextCycles = s.cyclesCompleted + 1
      const isLong = nextCycles % s.config.cyclesBeforeLongBreak === 0
      const nextPhase = isLong ? 'pausa_longa' : 'pausa'
      const seconds = phaseDurationSeconds(nextPhase, s.config)
      set({
        cyclesCompleted: nextCycles,
        phase: nextPhase,
        secondsLeft: seconds,
        phaseEndsAt: Date.now() + seconds * 1000,
      })
    } else {
      const seconds = phaseDurationSeconds('foco', s.config)
      set({ phase: 'foco', secondsLeft: seconds, phaseEndsAt: Date.now() + seconds * 1000 })
    }
  },

  clearCompletedEvent: () => set({ completedFocusEvent: null }),
}))
