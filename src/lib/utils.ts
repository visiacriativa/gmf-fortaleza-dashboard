export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function daysBetween(fromISO: string | null, toISO: string = new Date().toISOString()): number {
  if (!fromISO) return Infinity
  const from = new Date(fromISO).getTime()
  const to = new Date(toISO).getTime()
  return Math.floor((to - from) / (1000 * 60 * 60 * 24))
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (h <= 0) return `${m} min`
  return `${h}h${m > 0 ? ` ${m}min` : ''}`
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function parseClockToSeconds(clock: string): number | null {
  const parts = clock.split(':').map((p) => Number(p.trim()))
  if (parts.some((p) => Number.isNaN(p))) return null
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return null
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0
  return clamp(Math.round((part / total) * 100), 0, 100)
}
