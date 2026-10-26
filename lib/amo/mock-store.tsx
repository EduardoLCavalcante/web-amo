'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AmoState, AmoUser } from '@/lib/amo/model'
import { handleApi, restoreMemory, serializeMemory } from '@/lib/amo/backend'

export type {
  AmoAppointment, AmoAttendance, AmoAvailability, AmoClass, AmoCourse, AmoDiscipline,
  AmoEnrollment, AmoMonitoria, AmoNotification, AmoQuestion, AmoReport, AmoSettings, AmoUser, AmoUserRole,
} from '@/lib/amo/model'

type BrowserCookie = { value: string; expiresAt: number }
type SavedDemo = { version: 1; memory?: string; cookies: Record<string, BrowserCookie> }
const storageKey = 'amo-demo-v1'

export async function apiRequest<T = unknown>(path: string, method = 'GET', body?: unknown): Promise<T> {
  try {
    const raw = localStorage.getItem(storageKey)
    const saved = raw ? JSON.parse(raw) as SavedDemo : { version: 1 as const, cookies: {} }
    if (saved.version !== 1 || !saved.cookies || typeof saved.cookies !== 'object' || Array.isArray(saved.cookies)) {
      throw new Error('Dados de demonstração inválidos. Restaure a base local.')
    }
    restoreMemory(saved.memory)
    const cookieValue = (name: string) => {
      const cookie = saved.cookies[name]
      if (!cookie || cookie.expiresAt <= Date.now()) { delete saved.cookies[name]; return undefined }
      return cookie.value
    }
    const result = handleApi(method, path, body, {
      session: cookieValue('amo-session'), register: cookieValue('amo-register'), recover: cookieValue('amo-recover'),
    })
    if (result.cookie) {
      if (!result.cookie.maxAge) delete saved.cookies[result.cookie.name]
      else saved.cookies[result.cookie.name] = { value: result.cookie.value, expiresAt: Date.now() + result.cookie.maxAge * 1000 }
    }
    saved.memory = JSON.stringify(serializeMemory())
    localStorage.setItem(storageKey, JSON.stringify(saved))
    return structuredClone(result.data) as T
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error('Não foi possível concluir a operação.')
    const status = typeof (cause as { status?: unknown })?.status === 'number' ? (cause as { status: number }).status : 500
    Object.assign(error, { status })
    throw error
  }
}

type Snapshot = { state: AmoState; currentUser: AmoUser }
type Store = Snapshot & {
  refresh: () => Promise<void>
  mutate: <T = unknown>(path: string, method: string, body?: unknown) => Promise<T>
}

const AmoContext = createContext<Store | null>(null)

export function AmoProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    try {
      setSnapshot(await apiRequest<Snapshot>('bootstrap'))
      setError('')
    } catch (cause) {
      if ((cause as { status?: number }).status === 401) { window.location.replace('/'); return }
      setError(cause instanceof Error ? cause.message : 'Erro ao carregar dados.')
    }
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  const mutate = useCallback(async <T,>(path: string, method: string, body?: unknown) => {
    const data = await apiRequest<T>(path, method, body)
    await refresh()
    return data
  }, [refresh])
  const value = useMemo(() => snapshot ? { ...snapshot, refresh, mutate } : null, [snapshot, refresh, mutate])

  if (!value) return <div className="mx-auto max-w-md p-8 text-center">{error || 'Carregando dados...'}{error ? <button className="ml-2 underline" onClick={() => void refresh()}>Tentar novamente</button> : null}</div>
  return <AmoContext.Provider value={value}>{children}</AmoContext.Provider>
}

export function useAmoStore() {
  const store = useContext(AmoContext)
  if (!store) throw new Error('AmoProvider ausente')
  return store
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function toDateLabel(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${value}T12:00:00`))
}
