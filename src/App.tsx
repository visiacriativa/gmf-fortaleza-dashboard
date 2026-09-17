import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import { getDeviceUser } from './lib/deviceIdentity'
import { Layout } from './components/Layout'
import { Onboarding } from './pages/Onboarding'
import { DeviceIdentityPicker } from './pages/DeviceIdentityPicker'
import { Dashboard } from './pages/Dashboard'
import { EstudoHoje } from './pages/EstudoHoje'
import { Edital } from './pages/Edital'
import { Curso } from './pages/Curso'
import { PomodoroPage } from './pages/PomodoroPage'
import { Questoes } from './pages/Questoes'
import { CadernoErros } from './pages/CadernoErros'
import { Revisoes } from './pages/Revisoes'
import { Desempenho } from './pages/Desempenho'
import { Dupla } from './pages/Dupla'
import { Calendario } from './pages/Calendario'
import { Configuracoes } from './pages/Configuracoes'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-[var(--color-text-dim)]">Carregando seu painel de preparação…</p>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-6 max-w-md text-center">
        <h1 className="font-semibold mb-2">Não foi possível conectar</h1>
        <p className="text-sm text-[var(--color-text-dim)] mb-4">{message}</p>
        <button
          className="rounded-xl px-4 py-2 bg-[var(--color-primary)] text-white text-sm"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const hydrated = useStore((s) => s.hydrated)
  const cloudInitialized = useStore((s) => s.cloudInitialized)
  const cloudError = useStore((s) => s.cloudError)
  const initCloud = useStore((s) => s.initCloud)
  const setActiveUser = useStore((s) => s.setActiveUser)
  const [deviceReady, setDeviceReady] = useState(() => getDeviceUser() !== null)

  useEffect(() => {
    initCloud()
    const deviceUser = getDeviceUser()
    if (deviceUser) setActiveUser(deviceUser)
  }, [initCloud, setActiveUser])

  if (!hydrated) return <LoadingScreen />
  if (cloudError) return <ErrorScreen message={cloudError} />
  if (!cloudInitialized) return <Onboarding onFinish={() => setDeviceReady(true)} />
  if (!deviceReady) return <DeviceIdentityPicker onPick={() => setDeviceReady(true)} />

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hoje" element={<EstudoHoje />} />
          <Route path="/edital" element={<Edital />} />
          <Route path="/curso" element={<Curso />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/questoes" element={<Questoes />} />
          <Route path="/erros" element={<CadernoErros />} />
          <Route path="/revisoes" element={<Revisoes />} />
          <Route path="/desempenho" element={<Desempenho />} />
          <Route path="/dupla" element={<Dupla />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/config" element={<Configuracoes />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
