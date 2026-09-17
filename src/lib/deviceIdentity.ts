import type { UserId } from '../types'

// Quem está usando ESTE dispositivo/navegador. Não é sincronizado — cada computador
// guarda sua própria preferência, mas isso nunca restringe o acesso: qualquer pessoa
// pode trocar pelo seletor "Laise / Sávio" no topo, em qualquer dispositivo.
const KEY = 'gmf-device-user'

export function getDeviceUser(): UserId | null {
  const v = window.localStorage.getItem(KEY)
  return v === 'laise' || v === 'savio' ? v : null
}

export function setDeviceUser(userId: UserId) {
  window.localStorage.setItem(KEY, userId)
}
