import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Plus, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { usePomodoro } from '../store/usePomodoro'
import { Card, Button, ProgressBar, Pill } from '../components/ui'
import { formatClock, parseClockToSeconds } from '../lib/utils'
import type { LessonStatus, UserId } from '../types'

const STATUS_META: Record<LessonStatus, { label: string; emoji: string; tone: 'neutral' | 'warn' | 'good' | 'bad' }> = {
  nao_iniciada: { label: 'Não iniciada', emoji: '⚪', tone: 'neutral' },
  em_andamento: { label: 'Em andamento', emoji: '🟡', tone: 'warn' },
  concluida: { label: 'Concluída', emoji: '🟢', tone: 'good' },
  revisao: { label: 'Revisão', emoji: '🔵', tone: 'neutral' },
}

function LessonUserRow({ lessonId, userId, durationSeconds }: { lessonId: string; userId: UserId; durationSeconds: number }) {
  const users = useStore((s) => s.users)
  const getLessonProgress = useStore((s) => s.getLessonProgress)
  const updateLessonProgress = useStore((s) => s.updateLessonProgress)
  const startPomodoro = usePomodoro((s) => s.start)
  const pomodoroConfig = useStore((s) => s.pomodoroConfig)
  const lessons = useStore((s) => s.lessons)
  const navigate = useNavigate()

  const progress = getLessonProgress(lessonId, userId)
  const [editing, setEditing] = useState(false)
  const [clock, setClock] = useState(formatClock(progress.posicaoSegundos))

  function save() {
    const seconds = parseClockToSeconds(clock)
    if (seconds === null) return
    updateLessonProgress(lessonId, userId, {
      posicaoSegundos: seconds,
      status: seconds >= durationSeconds && durationSeconds > 0 ? 'concluida' : 'em_andamento',
    })
    setEditing(false)
  }

  function complete() {
    updateLessonProgress(lessonId, userId, { posicaoSegundos: durationSeconds, status: 'concluida' })
  }

  function studyWithPomodoro() {
    const lesson = lessons.find((l) => l.id === lessonId)
    startPomodoro(
      {
        disciplineId: lesson?.disciplineId ?? null,
        topicId: lesson?.topicId ?? null,
        lessonId,
        label: lesson?.nome ?? 'Aula',
      },
      'video',
      pomodoroConfig
    )
    navigate('/pomodoro')
  }

  const meta = STATUS_META[progress.status]

  return (
    <div className="rounded-xl bg-[var(--color-surface-2)] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{users[userId].name}</span>
        <Pill tone={meta.tone}>
          {meta.emoji} {meta.label}
        </Pill>
      </div>
      <ProgressBar value={durationSeconds > 0 ? (progress.posicaoSegundos / durationSeconds) * 100 : 0} />
      <div className="flex items-center justify-between mt-1.5">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              className="w-24 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 text-xs"
              value={clock}
              onChange={(e) => setClock(e.target.value)}
              placeholder="mm:ss"
            />
            <Button variant="primary" className="px-2 py-1 text-xs" onClick={save}>
              Salvar
            </Button>
          </div>
        ) : (
          <button
            className="text-xs text-[var(--color-text-dim)] underline decoration-dotted"
            onClick={() => setEditing(true)}
          >
            {formatClock(progress.posicaoSegundos)} / {formatClock(durationSeconds)}
          </button>
        )}
        <div className="flex items-center gap-1">
          <button
            title="Estudar com Pomodoro"
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface)]"
            onClick={studyWithPomodoro}
          >
            <Play size={14} />
          </button>
          {progress.status !== 'concluida' && (
            <button
              title="Concluir aula"
              className="p-1.5 rounded-lg hover:bg-[var(--color-surface)]"
              onClick={complete}
            >
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function NewLessonForm({ onClose }: { onClose: () => void }) {
  const addLesson = useStore((s) => s.addLesson)
  const disciplines = useStore((s) => s.disciplines)
  const topics = useStore((s) => s.topics)
  const [materia, setMateria] = useState('')
  const [modulo, setModulo] = useState('')
  const [assunto, setAssunto] = useState('')
  const [nome, setNome] = useState('')
  const [numero, setNumero] = useState('')
  const [duracao, setDuracao] = useState('00:00')
  const [disciplineId, setDisciplineId] = useState('')
  const [topicId, setTopicId] = useState('')

  const availableTopics = topics.filter((t) => t.disciplineId === disciplineId)

  function save() {
    if (!materia || !nome) return
    addLesson({
      materia,
      modulo,
      assunto,
      nome,
      numero,
      duracaoSegundos: parseClockToSeconds(duracao) ?? 0,
      disciplineId: disciplineId || null,
      topicId: topicId || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold mb-3">+ Nova aula do curso</h3>
        <div className="space-y-2">
          <input className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Matéria" value={materia} onChange={(e) => setMateria(e.target.value)} />
          <input className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Módulo" value={modulo} onChange={(e) => setModulo(e.target.value)} />
          <input className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
          <input className="w-full rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Nome da aula" value={nome} onChange={(e) => setNome(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Número (opcional)" value={numero} onChange={(e) => setNumero(e.target.value)} />
            <input className="rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm" placeholder="Duração mm:ss" value={duracao} onChange={(e) => setDuracao(e.target.value)} />
          </div>
          <div className="border-t border-[var(--color-border)] pt-2 mt-2">
            <label className="text-xs text-[var(--color-text-dim)]">
              Vincular ao edital (opcional — atualiza o progresso do assunto quando estudar essa aula)
            </label>
            <select
              className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
              value={disciplineId}
              onChange={(e) => {
                setDisciplineId(e.target.value)
                setTopicId('')
              }}
            >
              <option value="">Sem vínculo com o edital</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {disciplineId && (
              <select
                className="w-full mt-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-sm"
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
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Adicionar</Button>
        </div>
      </Card>
    </div>
  )
}

export function Curso() {
  const lessons = useStore((s) => s.lessons)
  const [showNew, setShowNew] = useState(false)

  const grouped = lessons.reduce<Record<string, typeof lessons>>((acc, l) => {
    const key = `${l.materia} — ${l.modulo || 'Geral'}`
    acc[key] = acc[key] ?? []
    acc[key].push(l)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">🎥 Curso online</h1>
          <p className="text-sm text-[var(--color-text-dim)]">Progresso independente para Laise e Sávio.</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} /> Nova aula
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--color-text-dim)]">
            Nenhuma aula cadastrada ainda. Adicione as aulas do curso que vocês compartilham para começar a
            acompanhar o progresso de cada um.
          </p>
        </Card>
      ) : (
        Object.entries(grouped).map(([group, groupLessons]) => (
          <div key={group}>
            <h2 className="text-sm font-semibold text-[var(--color-text-dim)] mb-2">{group}</h2>
            <div className="space-y-3">
              {groupLessons.map((l) => (
                <Card key={l.id}>
                  <div className="mb-2">
                    <p className="font-medium">
                      {l.numero ? `Aula ${l.numero} — ` : ''}
                      {l.nome}
                    </p>
                    {l.assunto && <p className="text-xs text-[var(--color-text-dim)]">{l.assunto}</p>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <LessonUserRow lessonId={l.id} userId="laise" durationSeconds={l.duracaoSegundos} />
                    <LessonUserRow lessonId={l.id} userId="savio" durationSeconds={l.duracaoSegundos} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {showNew && <NewLessonForm onClose={() => setShowNew(false)} />}
    </div>
  )
}
