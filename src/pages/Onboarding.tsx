import { useState } from 'react'
import { useStore } from '../store/useStore'
import { setDeviceUser } from '../lib/deviceIdentity'
import { Button, Card } from '../components/ui'

const PRESETS = [
  { label: '25 / 5', focusMin: 25, breakMin: 5 },
  { label: '40 / 10', focusMin: 40, breakMin: 10 },
  { label: '50 / 10', focusMin: 50, breakMin: 10 },
]

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const [laiseName, setLaiseName] = useState('Laise')
  const [savioName, setSavioName] = useState('Sávio')
  const [dailyMinutes, setDailyMinutes] = useState(60)
  const [preset, setPreset] = useState(0)
  const [step, setStep] = useState(1)

  function finish() {
    completeOnboarding({
      laiseName,
      savioName,
      dailyMinutes,
      pomodoro: {
        focusMin: PRESETS[preset].focusMin,
        breakMin: PRESETS[preset].breakMin,
        longBreakMin: 15,
        cyclesBeforeLongBreak: 4,
      },
    })
    setDeviceUser('laise')
    onFinish()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-bold mb-1">Bem-vinda ao seu painel de preparação</h1>
        <p className="text-sm text-[var(--color-text-dim)] mb-6">
          Guarda Municipal de Fortaleza — configuração inicial
        </p>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--color-text-dim)]">Seu nome</label>
              <input
                className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2"
                value={laiseName}
                onChange={(e) => setLaiseName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-dim)]">Nome do segundo usuário</label>
              <input
                className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2"
                value={savioName}
                onChange={(e) => setSavioName(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--color-text-dim)]">Meta diária de estudo (minutos)</label>
              <input
                type="number"
                className="w-full mt-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value) || 60)}
              />
              <p className="text-xs text-[var(--color-text-dim)] mt-1">
                Você pode alterar isso a qualquer momento em Configurações.
              </p>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-dim)] block mb-2">Configuração do Pomodoro</label>
              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((p, i) => (
                  <button
                    key={p.label}
                    onClick={() => setPreset(i)}
                    className={`rounded-lg px-3 py-2 text-sm border ${
                      preset === i
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                    }`}
                  >
                    🍅 {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={finish}>
                Carregar edital e começar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
