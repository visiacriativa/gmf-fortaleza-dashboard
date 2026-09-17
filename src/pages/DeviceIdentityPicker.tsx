import { useStore } from '../store/useStore'
import { setDeviceUser } from '../lib/deviceIdentity'
import { Card, Button } from '../components/ui'
import type { UserId } from '../types'

export function DeviceIdentityPicker({ onPick }: { onPick: () => void }) {
  const users = useStore((s) => s.users)
  const setActiveUser = useStore((s) => s.setActiveUser)

  function pick(userId: UserId) {
    setDeviceUser(userId)
    setActiveUser(userId)
    onPick()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-xl font-bold mb-1">Quem é você neste dispositivo?</h1>
        <p className="text-sm text-[var(--color-text-dim)] mb-6">
          Os dados já estão compartilhados na nuvem — isso só define o perfil padrão deste
          computador. Você pode trocar a qualquer momento pelo seletor no topo da tela.
        </p>
        <div className="flex flex-col gap-3">
          <Button className="w-full py-3 text-base" onClick={() => pick('laise')}>
            Sou a {users.laise.name}
          </Button>
          <Button variant="surface" className="w-full py-3 text-base" onClick={() => pick('savio')}>
            Sou o {users.savio.name}
          </Button>
        </div>
      </Card>
    </div>
  )
}
