let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function beep(frequency: number, startTime: number, duration: number, volume = 0.2) {
  const audio = getContext()
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0, audio.currentTime + startTime)
  gain.gain.linearRampToValueAtTime(volume, audio.currentTime + startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + startTime + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(audio.currentTime + startTime)
  osc.stop(audio.currentTime + startTime + duration + 0.05)
}

const SOUND_PREF_KEY = 'pomodoro-sound-enabled'

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const stored = window.localStorage.getItem(SOUND_PREF_KEY)
  return stored === null ? true : stored === 'true'
}

export function setSoundEnabled(enabled: boolean) {
  window.localStorage.setItem(SOUND_PREF_KEY, String(enabled))
}

/** Toque ascendente e animado — fim de um ciclo de FOCO. */
export function playFocusEndSound() {
  if (!isSoundEnabled()) return
  beep(660, 0, 0.15)
  beep(880, 0.16, 0.22)
}

/** Toque curto e suave — fim de uma PAUSA (hora de voltar ao foco). */
export function playBreakEndSound() {
  if (!isSoundEnabled()) return
  beep(520, 0, 0.18)
}
