import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Card, Button, Pill } from '../components/ui'
import { todayISO } from '../lib/utils'
import type { ErrorCategory } from '../types'

const CATEGORY_LABELS: Record<ErrorCategory, string> = {
  desconhecimento: 'Desconhecimento',
  confusao: 'Confusão',
  interpretacao: 'Interpretação',
  desatencao: 'Desatenção',
  falta_memorizacao: 'Falta de memorização',
  aplicacao_incorreta: 'Aplicação incorreta',
}

export function CadernoErros() {
  const state = useStore()
  const { activeUserId, disciplines, topics } = state
  const addErrorEntry = useStore((s) => s.addErrorEntry)
  const entries = state.errorEntries.filter((e) => e.userId === activeUserId).slice().reverse()

  const [disciplineId, setDisciplineId] = useState(disciplines[0]?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [questao, setQuestao] = useState('')
  const [categoria, setCategoria] = useState<ErrorCategory>('desconhecimento')
  const [observacao, setObservacao] = useState('')
  const [conteudoCorreto, setConteudoCorreto] = useState('')

  const availableTopics = topics.filter((t) => t.disciplineId === disciplineId)

  // Identifica padrão simples: categoria mais frequente com volume mínimo
  const categoryCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.categoria] = (acc[e.categoria] ?? 0) + 1
    return acc
  }, {})
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

  function save() {
    if (!disciplineId) return
    addErrorEntry({
      userId: activeUserId,
      disciplineId,
      topicId: topicId || null,
      date: todayISO(),
      questao,
      categoria,
      observacao,
      conteudoCorreto,
    })
    setQuestao('')
    setObservacao('')
    setConteudoCorreto('')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">❌ Caderno de erros</h1>
        <p className="text-sm text-[var(--color-text-dim)]">Registre e entenda o padrão por trás dos seus erros.</p>
      </div>

      {entries.length >= 5 && topCategory && topCategory[1] >= 3 && (
        <Card className="border-orange-500/40 bg-orange-500/10">
          <p className="text-sm">
            🧠 Você tem registrado bastante erros por <strong>{CATEGORY_LABELS[topCategory[0] as ErrorCategory]}</strong> ({topCategory[1]} ocorrências). Vale focar nesse ponto na próxima revisão.
          </p>
        </Card>
      )}

      <Card>
        <h2 className="text-sm font-semibold mb-3">Novo erro</h2>
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
          <select
            className="sm:col-span-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as ErrorCategory)}
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            className="sm:col-span-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="Questão (referência ou enunciado curto)"
            value={questao}
            onChange={(e) => setQuestao(e.target.value)}
          />
          <input
            className="sm:col-span-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="O que motivou o erro"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
          <input
            className="sm:col-span-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="Conteúdo correto"
            value={conteudoCorreto}
            onChange={(e) => setConteudoCorreto(e.target.value)}
          />
        </div>
        <Button className="mt-3" onClick={save}>
          Salvar
        </Button>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold mb-3">Histórico ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-[var(--color-text-dim)]">Nenhum erro registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => {
              const d = disciplines.find((d) => d.id === e.disciplineId)
              return (
                <div key={e.id} className="border-b border-[var(--color-border)] pb-2 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{d?.name}</span>
                    <Pill>{CATEGORY_LABELS[e.categoria]}</Pill>
                  </div>
                  {e.questao && <p className="text-sm text-[var(--color-text-dim)]">{e.questao}</p>}
                  {e.observacao && <p className="text-xs text-[var(--color-text-dim)]">Motivo: {e.observacao}</p>}
                  {e.conteudoCorreto && (
                    <p className="text-xs text-green-400">Correto: {e.conteudoCorreto}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
