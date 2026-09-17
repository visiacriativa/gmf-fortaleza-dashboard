export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

const ENABLED_KEY = 'pomodoro-notifications-enabled'

/** Preferência do usuário (independente da permissão do navegador) — permite "desligar"
 *  notificações mesmo depois de já ter concedido permissão, sem precisar mexer nas
 *  configurações do navegador. */
export function isNotificationsWanted(): boolean {
  if (typeof window === 'undefined') return true
  const stored = window.localStorage.getItem(ENABLED_KEY)
  return stored === null ? true : stored === 'true'
}

export function setNotificationsWanted(enabled: boolean) {
  window.localStorage.setItem(ENABLED_KEY, String(enabled))
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return 'unsupported'
  try {
    const result = await Notification.requestPermission()
    return result
  } catch {
    return getNotificationPermission()
  }
}

/**
 * Mostra uma notificação do sistema — funciona mesmo com a aba em segundo plano.
 * Só dispara se a permissão já tiver sido concedida; falha silenciosamente caso contrário.
 */
export function notify(title: string, body: string) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return
  if (!isNotificationsWanted()) return
  try {
    const n = new Notification(title, {
      body,
      tag: 'gmf-pomodoro',
      silent: false,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    // Alguns navegadores lançam erro ao instanciar Notification em certos contextos; ignora.
  }
}
