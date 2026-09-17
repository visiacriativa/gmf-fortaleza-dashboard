import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Card, Button, ProgressBar } from '../components/ui'
import { pct, todayISO } from '../lib/utils'

export function Questoes() {
  const state = useStore()
  const { activeUserId, disciplines, topics } = state
  const addQuestionLog = useStore((s) => s.addQuestionLog)
  const logs = state.questionLogs.filter((q) => q.userId === activeUserId).slice().reverse()

  const [disciplineId, setDisciplineId] = useState(disciplines[0]?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [quantidade, setQuantidade] = useState(10)
  const [acertos, setAcertos] = useState(0)
  const [banca, setBanca] = useState('')
  const [dificuldade, setDificuldade] = useState<'facil' | 'media' | 'dificil' | ''>('')
  const [observacao, setObservacao] = useState('')

  const availableTopics = topics.filter((t) => t.disciplineId === disciplineId)

  const byDiscipline = disciplines
    .map((d) => {
      const dLogs = logs.filter((l) => l.disciplineId === d.id)
      const total = dLogs.reduce((s, l) => s + l.quantidade, 0)
      const correct = dLogs.reduce((s, l) => s + l.acertos, 0)
      return { discipline: d, total, correct }
    })
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total)

  function save() {
    if (!disciplineId || quantidade <= 0) return
    addQuestionLog({
      userId: activeUserId,
      disciplineId,
      topicId: topicId || null,
      date: todayISO(),
      quantidade,
      acertos: Math.min(acertos, quantidade),
      erros: Math.max(0, quantidade - acertos),
      banca,
      dificuldade,
      observacao,
    })
    setQuantidade(10)
    setAcertos(0)
    setObservacao('')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">📝 Banco de questões</h1>
        <p className="text-sm text-[var(--color-text-dim)]">Registre suas questões e acompanhe sua evolução.</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold mb-3">Registrar questões</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <select
            className="rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={disciplineId}
            onChange={(e) => {
              setDisciplineId(e.target.value)
              setTopicId('')
            }}
          >
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          >
            <option value="">Assunto (opcional)</option>
            {availableTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name.slice(0, 60)}
              </option>
            ))}
          </select>
          <div>
            <label className="text-xs text-[var(--color-text-dim)]">Quantidade</label>
            <input
              type="number"
              className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-dim)]">Acertos</label>
            <input
              type="number"
              className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
              value={acertos}
              onChange={(e) => setAcertos(Number(e.target.value) || 0)}
            />
          </div>
          <input
            className="rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="Banca (opcional)"
            value={banca}
            onChange={(e) => setBanca(e.target.value)}
          />
          <select
            className="rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={dificuldade}
            onChange={(e) => setDificuldade(e.target.value as any)}
          >
            <option value="">Dificuldade (opcional)</option>
            <option value="facil">Fácil</option>
            <option value="media">Média</option>
            <option value="dificil">Difícil</option>
          </select>
          <input
            className="sm:col-span-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="Observação (opcional)"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>
        <Button className="mt-3" onClick={save}>
          Salvar
        </Button>
      </Card>

      {byDiscipline.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold mb-3">Desempenho por matéria</h2>
          <div className="space-y-2">
            {byDiscipline.map(({ discipline, total, correct }) => (
              <div key={discipline.id}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span>{discipline.name}</span>
                  <span className="text-[var(--color-text-dim)]">
                    {pct(correct, total)}% ({correct}/{total})
                  </span>
                </div>
                <ProgressBar value={pct(correct, total)} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-sm font-semibold mb-3">Histórico</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-[var(--color-text-dim)]">Nenhum registro ainda.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {logs.slice(0, 20).map((l) => {
              const d = disciplines.find((d) => d.id === l.disciplineId)
              return (
                <div key={l.id} className="flex justify-between border-b border-[var(--color-border)] pb-1.5 last:border-0">
                  <span className="text-[var(--color-text-dim)]">
                    {l.date} · {d?.name}
                  </span>
                  <span>
                    {l.acertos}/{l.quantidade} ({pct(l.acertos, l.quantidade)}%)
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
