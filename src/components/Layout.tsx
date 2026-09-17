import { NavLink, Outlet } from 'react-router-dom'
import {
  Home,
  Target,
  BookOpen,
  Clapperboard,
  Timer,
  ListChecks,
  XCircle,
  RefreshCw,
  BarChart3,
  Users,
  Calendar,
  Settings,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { setDeviceUser } from '../lib/deviceIdentity'
import { PomodoroWatcher } from './PomodoroWatcher'

const NAV = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/hoje', label: 'Estudo de Hoje', icon: Target },
  { to: '/edital', label: 'Edital', icon: BookOpen },
  { to: '/curso', label: 'Curso', icon: Clapperboard },
  { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { to: '/questoes', label: 'Questões', icon: ListChecks },
  { to: '/erros', label: 'Caderno de Erros', icon: XCircle },
  { to: '/revisoes', label: 'Revisões', icon: RefreshCw },
  { to: '/desempenho', label: 'Desempenho', icon: BarChart3 },
  { to: '/dupla', label: 'Laise & Sávio', icon: Users },
  { to: '/calendario', label: 'Calendário', icon: Calendar },
  { to: '/config', label: 'Configurações', icon: Settings },
]

export function Layout() {
  const users = useStore((s) => s.users)
  const activeUserId = useStore((s) => s.activeUserId)
  const setActiveUser = useStore((s) => s.setActiveUser)

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-60 md:flex-col border-r border-[var(--color-border)] p-4 gap-1 shrink-0">
        <div className="mb-4 px-2">
          <h1 className="font-bold text-lg leading-tight">GMF Fortaleza</h1>
          <p className="text-xs text-[var(--color-text-dim)]">Painel de preparação</p>
        </div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-medium'
                  : 'text-[var(--color-text-dim)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 sticky top-0 bg-[var(--color-bg)]/95 backdrop-blur z-30">
          <span className="font-semibold md:hidden">GMF Fortaleza</span>
          <div className="flex items-center gap-1 ml-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-1">
            {(['laise', 'savio'] as const).map((id) => (
              <button
                key={id}
                onClick={() => {
                  setActiveUser(id)
                  setDeviceUser(id)
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  activeUserId === id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
              >
                {users[id].name}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 md:pb-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] shrink-0 ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-dim)]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <PomodoroWatcher />
    </div>
  )
}
