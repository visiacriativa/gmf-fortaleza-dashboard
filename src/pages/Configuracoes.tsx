import { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { Card, Button } from '../components/ui'

export function Configuracoes() {
  const state = useStore()
  const { users, goals } = state
  const setGoals = useStore((s) => s.setGoals)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const resetAll = useStore((s) => s.resetAll)
  const fileInput = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')

  function download() {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-preparacao-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const ok = importData(String(reader.result))
      setImportMsg(ok ? 'Backup importado com sucesso.' : 'Não foi possível importar este arquivo.')
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold">⚙️ Configurações</h1>
      </div>

      <Card>
        <h2 className="text-sm font-semibold mb-3">Metas de estudo</h2>
        <div className="space-y-4">
          {(['laise', 'savio'] as const).map((uid) => (
            <div key={uid} className="flex items-center justify-between gap-3">
              <span className="text-sm w-20">{users[uid].name}</span>
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="number"
                  className="w-20 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-1.5"
                  value={goals[uid].dailyMinutes}
                  onChange={(e) =>
                    setGoals(uid, {
                      dailyMinutes: Number(e.target.value) || 0,
                      weeklyMinutes: (Number(e.target.value) || 0) * 7,
                    })
                  }
                />
                <span className="text-[var(--color-text-dim)]">min/dia</span>
                <span className="text-[var(--color-text-dim)]">·</span>
                <span className="text-[var(--color-text-dim)]">{goals[uid].weeklyMinutes} min/semana</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold mb-3">Backup dos dados</h2>
        <p className="text-xs text-[var(--color-text-dim)] mb-3">
          Seus dados ficam salvos na nuvem e sincronizados entre os dois dispositivos. Ainda assim,
          exporte periodicamente um backup local para garantia.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="surface" onClick={download}>
            Exportar backup (JSON)
          </Button>
          <Button variant="ghost" onClick={() => fileInput.current?.click()}>
            Importar backup
          </Button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={handleFile} />
        </div>
        {importMsg && <p className="text-xs text-[var(--color-text-dim)] mt-2">{importMsg}</p>}
      </Card>

      <Card className="border-red-500/30">
        <h2 className="text-sm font-semibold mb-2 text-red-400">Zona de risco</h2>
        <p className="text-xs text-[var(--color-text-dim)] mb-3">
          Isso apaga o histórico de estudo, questões, erros e revisões — de Laise e Sávio, na nuvem,
          para os dois dispositivos. Não pode ser desfeito.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm('Tem certeza? Isso vai apagar todos os dados salvos, dos dois, na nuvem. Não pode ser desfeito.')) {
              resetAll()
            }
          }}
        >
          Resetar tudo
        </Button>
      </Card>
    </div>
  )
}
