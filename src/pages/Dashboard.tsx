import { useNavigate } from 'react-router-dom'
import { Play, Flame, BookOpen, Target, Clock, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getUserStats } from '../lib/stats'
import { rankByPriority, buildInsights } from '../lib/engine'
import { Card, StatCard, ProgressBar, Button, Pill } from '../components/ui'
import { formatMinutes, formatClock, todayISO } from '../lib/utils'

export function Dashboard() {
  const navigate = useNavigate()
  const state = useStore()
  const { activeUserId, users } = state
  const stats = getUserStats(state, activeUserId)
  const ranking = rankByPriority(state, activeUserId)
  const topPriority = ranking[0]
  const insights = buildInsights(state, activeUserId).slice(0, 3)

  const goal = state.goals[activeUserId]
  const todaysMinutes = state.sessions
    .filter((s) => s.userId === activeUserId && s.date === todayISO())
    .reduce((sum, s) => sum + s.actualMinutes, 0)

  // Continue de onde parou (para os dois usuários)
  const continueCards = (['laise', 'savio'] as const).map((uid) => {
    const progresses = state.lessonProgress.filter(
      (p) => p.userId === uid && p.status === 'em_andamento'
    )
    const latest = [...progresses].sort(
      (a, b) => new Date(b.ultimoAcesso ?? 0).getTime() - new Date(a.ultimoAcesso ?? 0).getTime()
    )[0]
    if (!latest) return { userId: uid, lesson: null, progress: null }
    const lesson = state.lessons.find((l) => l.id === latest.lessonId)
    return { userId: uid, lesson, progress: latest }
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">Olá, {users[activeUserId].name} 👋</h1>
          <p className="text-sm text-[var(--color-text-dim)]">Como está sua preparação hoje?</p>
        </div>
        <Button onClick={() => navigate('/hoje')} className="text-base px-5 py-3">
          <Play size={18} /> Começar sessão de estudo
        </Button>
      </div>

      {/* Meta do dia */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Meta de hoje</span>
          <span className="text-sm text-[var(--color-text-dim)]">
            {formatMinutes(todaysMinutes)} / {formatMinutes(goal.dailyMinutes)}
          </span>
        </div>
        <ProgressBar value={(todaysMinutes / goal.dailyMinutes) * 100} />
        <p className="text-xs text-[var(--color-text-dim)] mt-2">
          {todaysMinutes === 0
            ? 'Você ainda não registrou estudo hoje.'
            : todaysMinutes >= goal.dailyMinutes
            ? 'Meta diária alcançada! 🎉'
            : `${Math.round((todaysMinutes / goal.dailyMinutes) * 100)}% da meta diária.`}
        </p>
      </Card>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Edital estudado" value={`${stats.editalStudiedPct}%`} icon={<BookOpen size={16} />} sub={`${stats.studiedCount}/${stats.totalTopics} assuntos`} />
        <StatCard label="Assuntos dominados" value={`${stats.editalDominatedPct}%`} icon={<Target size={16} />} sub={`${stats.dominatedCount} assuntos`} />
        <StatCard label="Taxa de acerto" value={stats.accuracyPct !== null ? `${stats.accuracyPct}%` : '—'} icon={<TrendingUp size={16} />} sub={`${stats.questionsTotal} questões`} />
        <StatCard label="Sequência" value={`${stats.streak}d`} icon={<Flame size={16} />} sub={`${stats.studyDaysCount} dias no total`} />
        <StatCard label="Horas estudadas" value={formatMinutes(stats.totalMinutes)} icon={<Clock size={16} />} />
        <StatCard label="Assuntos pendentes" value={stats.pendingCount} />
        <StatCard label="Revisões pendentes" value={stats.pendingReviewsCount} />
        <StatCard label="Progresso do curso" value={`${stats.courseProgressPct}%`} sub={`${stats.lessonsConcluded}/${stats.lessonsTotal} aulas`} />
      </div>

      {/* Continue de onde parou */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-dim)] uppercase tracking-wide mb-2">
          ▶️ Continue de onde parou
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {continueCards.map(({ userId, lesson, progress }) => (
            <Card key={userId}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{users[userId].name}</span>
                {userId === activeUserId && <Pill tone="good">você</Pill>}
              </div>
              {lesson && progress ? (
                <>
                  <p className="text-sm text-[var(--color-text-dim)]">{lesson.materia}</p>
                  <p className="font-medium">
                    {lesson.numero ? `Aula ${lesson.numero} — ` : ''}
                    {lesson.nome}
                  </p>
                  <div className="mt-2">
                    <ProgressBar
                      value={
                        lesson.duracaoSegundos > 0
                          ? (progress.posicaoSegundos / lesson.duracaoSegundos) * 100
                          : 0
                      }
                    />
                    <p className="text-xs text-[var(--color-text-dim)] mt-1">
                      {formatClock(progress.posicaoSegundos)} / {formatClock(lesson.duracaoSegundos)}
                    </p>
                  </div>
                  <Button variant="surface" className="w-full mt-3" onClick={() => navigate('/curso')}>
                    Continuar aula
                  </Button>
                </>
              ) : (
                <p className="text-sm text-[var(--color-text-dim)]">Nenhuma aula em andamento.</p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Prioridade + insights */}
      <div className="grid md:grid-cols-2 gap-3">
        {topPriority && (
          <Card>
            <h2 className="text-sm font-semibold text-[var(--color-text-dim)] uppercase tracking-wide mb-2">
              🔥 Próximo passo recomendado
            </h2>
            <p className="font-medium">{topPriority.snapshot.discipline.name}</p>
            <p className="text-sm text-[var(--color-text-dim)] mb-2">{topPriority.snapshot.topic.name}</p>
            {topPriority.reasons.length > 0 && (
              <ul className="text-xs text-[var(--color-text-dim)] space-y-0.5 mb-3">
                {topPriority.reasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            )}
            <Button variant="surface" onClick={() => navigate('/hoje')}>
              Ir para estudo de hoje
            </Button>
          </Card>
        )}

        <Card>
          <h2 className="text-sm font-semibold text-[var(--color-text-dim)] uppercase tracking-wide mb-2">
            🧠 Insights
          </h2>
          <ul className="space-y-2 text-sm">
            {insights.map((i) => (
              <li key={i.id} className="text-[var(--color-text-dim)]">
                {i.text}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
