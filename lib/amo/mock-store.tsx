'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AmoState, AmoUser } from '@/lib/amo/model'

export type {
  AmoAppointment, AmoAttendance, AmoAvailability, AmoClass, AmoCourse, AmoDiscipline,
  AmoEnrollment, AmoMonitoria, AmoNotification, AmoQuestion, AmoReport, AmoSettings, AmoUser, AmoUserRole,
} from '@/lib/amo/model'

export async function apiRequest<T = unknown>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  })
  const result = await response.json()
  if (!response.ok) {
    const error = new Error(result.error || 'Não foi possível concluir a operação.') as Error & { status: number }
    error.status = response.status
    throw error
  }
  return result.data as T
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
