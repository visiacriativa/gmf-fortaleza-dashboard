import { useState } from 'react'
import { useStore } from '../store/useStore'
import { rankByPriority } from '../lib/engine'
import { Button, Card } from './ui'
import { todayISO } from '../lib/utils'
import type { StudyType } from '../types'

const TYPES: { value: StudyType; label: string }[] = [
  { value: 'teoria', label: '📚 Teoria' },
  { value: 'video', label: '🎥 Vídeo-aula' },
  { value: 'questoes', label: '📝 Questões' },
  { value: 'revisao', label: '🔄 Revisão' },
  { value: 'flashcards', label: '🧠 Flashcards' },
  { value: 'pdf', label: '📄 PDF' },
  { value: 'resumo', label: '📖 Resumão' },
]

export function QuickRegisterForm({ onClose }: { onClose: () => void }) {
  const state = useStore()
  const { activeUserId, disciplines, topics } = state
  const logStudySession = useStore((s) => s.logStudySession)
  const addQuestionLog = useStore((s) => s.addQuestionLog)

  const suggestion = rankByPriority(state, activeUserId)[0]

  const [disciplineId, setDisciplineId] = useState(suggestion?.snapshot.discipline.id ?? disciplines[0]?.id ?? '')
  const [topicId, setTopicId] = useState(suggestion?.snapshot.topic.id ?? '')
  const [type, setType] = useState<StudyType>('teoria')
  const [tempo, setTempo] = useState(25)
  const [questoes, setQuestoes] = useState('')
  const [acertos, setAcertos] = useState('')
  const [note, setNote] = useState('')

  const availableTopics = topics.filter((t) => t.disciplineId === disciplineId)

  function save() {
    logStudySession({
      userId: activeUserId,
      disciplineId: disciplineId || null,
      topicId: topicId || null,
      lessonId: null,
      type,
      plannedMinutes: tempo,
      actualMinutes: tempo,
      date: todayISO(),
      note,
    })

    const qtd = Number(questoes)
    const ac = Number(acertos)
    if (qtd > 0 && topicId && disciplineId) {
      addQuestionLog({
        userId: activeUserId,
        disciplineId,
        topicId,
        date: todayISO(),
        quantidade: qtd,
        acertos: Math.min(ac || 0, qtd),
        erros: Math.max(0, qtd - (ac || 0)),
        banca: '',
        dificuldade: '',
        observacao: '',
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold mb-3">+ Registrar estudo</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[var(--color-text-dim)]">Matéria</label>
            <select
              className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
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
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-dim)]">Assunto</label>
            <select
              className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
            >
              <option value="">—</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name.slice(0, 60)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-dim)]">Tipo de estudo</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
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
          <div>
            <label className="text-xs text-[var(--color-text-dim)]">Tempo (minutos)</label>
            <input
              type="number"
              className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value) || 0)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[var(--color-text-dim)]">Questões (opcional)</label>
              <input
                type="number"
                className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
                value={questoes}
                onChange={(e) => setQuestoes(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-dim)]">Acertos (opcional)</label>
              <input
                type="number"
                className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
                value={acertos}
                onChange={(e) => setAcertos(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-dim)]">Observação (opcional)</label>
            <input
              className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save}>Salvar</Button>
        </div>
      </Card>
    </div>
  )
}
