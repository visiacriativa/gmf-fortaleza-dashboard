import type { ReactNode } from 'react'
import type { DomainLevel } from '../types'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card p-4 ${className}`}>{children}</div>
}

export function ProgressBar({
  value,
  color = 'var(--color-primary)',
  height = 8,
}: {
  value: number
  color?: string
  height?: number
}) {
  return (
    <div className="progress-track w-full" style={{ height }}>
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color, height }}
      />
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
}) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-dim)] uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-semibold">{value}</span>
      {sub && <span className="text-xs text-[var(--color-text-dim)]">{sub}</span>}
    </Card>
  )
}

const DOMAIN_META: Record<DomainLevel, { label: string; color: string; emoji: string }> = {
  0: { label: 'Não estudado', color: 'var(--color-d0)', emoji: '🔴' },
  1: { label: 'Baixo', color: 'var(--color-d1)', emoji: '🟠' },
  2: { label: 'Intermediário', color: 'var(--color-d2)', emoji: '🟡' },
  3: { label: 'Bom', color: 'var(--color-d3)', emoji: '🟢' },
  4: { label: 'Alto', color: 'var(--color-d4)', emoji: '🔵' },
}

export function DomainBadge({ level }: { level: DomainLevel }) {
  const meta = DOMAIN_META[level]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: `${meta.color}22`, color: meta.color }}
    >
      {meta.emoji} {meta.label}
    </span>
  )
}

export function domainMeta(level: DomainLevel) {
  return DOMAIN_META[level]
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger' | 'surface'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'
  const styles = {
    primary: 'bg-[var(--color-primary)] text-white hover:brightness-110',
    ghost: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
    surface: 'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:brightness-110',
    danger: 'bg-red-500/15 text-red-400 hover:bg-red-500/25',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-[var(--color-surface-2)] text-[var(--color-text-dim)]',
    good: 'bg-green-500/15 text-green-400',
    warn: 'bg-orange-500/15 text-orange-400',
    bad: 'bg-red-500/15 text-red-400',
  }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
