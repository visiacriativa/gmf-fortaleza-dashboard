import { useState } from 'react'
import { useStore } from '../store/useStore'
import { snapshotTopics } from '../lib/engine'
import { Card, ProgressBar, DomainBadge, domainMeta } from '../components/ui'
import { pct } from '../lib/utils'
import type { DomainLevel } from '../types'

export function Edital() {
  const state = useStore()
  const { activeUserId, disciplines } = state
  const snaps = snapshotTopics(state, activeUserId)
  const setDomainLevel = useStore((s) => s.setDomainLevel)
  const [openId, setOpenId] = useState<string | null>(disciplines[0]?.id ?? null)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">📚 Edital</h1>
        <p className="text-sm text-[var(--color-text-dim)]">
          Mapa visual do conteúdo programático — clique em uma disciplina para ver os assuntos.
        </p>
      </div>

      <div className="space-y-3">
        {disciplines.map((d) => {
          const topicSnaps = snaps.filter((s) => s.discipline.id === d.id)
          const studied = topicSnaps.filter((s) => s.studied).length
          const dominated = topicSnaps.filter((s) => s.state.domainLevel >= 3).length
          const inReview = state.reviews.filter(
            (r) => !r.done && r.userId === activeUserId && topicSnaps.some((s) => s.topic.id === r.topicId)
          ).length
          const completionPct = pct(studied, topicSnaps.length)
          const isOpen = openId === d.id

          return (
            <Card key={d.id}>
              <button
                className="w-full flex items-center justify-between gap-3 text-left"
                onClick={() => setOpenId(isOpen ? null : d.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-sm text-[var(--color-text-dim)]">{completionPct}%</span>
                  </div>
                  <ProgressBar value={completionPct} />
                  <p className="text-xs text-[var(--color-text-dim)] mt-1">
                    {studied}/{topicSnaps.length} estudados · {dominated} dominados
                    {inReview > 0 ? ` · ${inReview} em revisão` : ''}
                  </p>
                </div>
              </button>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t border-[var(--color-border)] pt-3">
                  {topicSnaps.map((s) => (
                    <div key={s.topic.id} className="flex items-start justify-between gap-3">
                      <p className="text-sm flex-1">{s.topic.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <DomainBadge level={s.state.domainLevel} />
                        <select
                          className="rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1.5 py-1 text-xs"
                          value={s.state.domainLevel}
                          onChange={(e) =>
                            setDomainLevel(s.topic.id, activeUserId, Number(e.target.value) as DomainLevel)
                          }
                        >
                          {[0, 1, 2, 3, 4].map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {domainMeta(lvl as DomainLevel).emoji} {lvl}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
