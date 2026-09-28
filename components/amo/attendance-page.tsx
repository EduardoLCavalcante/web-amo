'use client'

import { useState } from 'react'
import { useAmoStore, type AmoAttendance } from '@/lib/amo/mock-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function AttendancePage() {
  const { state, currentUser, mutate } = useAmoStore()
  const editableMonitorias = state.monitorias.filter(item => currentUser.role === 'Administrador' || (currentUser.role === 'Monitor' && item.monitorIds.includes(currentUser.id)) || (currentUser.role === 'Professor' && item.professorId === currentUser.id))
  const [monitoriaId, setMonitoriaId] = useState(editableMonitorias[0]?.id ?? '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')
  const own = state.attendances.filter(item => item.studentId === currentUser.id)
  const monitoria = state.monitorias.find(item => item.id === monitoriaId)
  const eligibleIds = new Set(state.enrollments.filter(item => item.monitoriaId === monitoriaId && item.status === 'Aprovada').map(item => item.studentId))
  const records = state.users.filter(user => user.role === 'Aluno' && eligibleIds.has(user.id)).map(user => ({ user, attendance: state.attendances.find(item => item.studentId === user.id && item.monitoriaId === monitoriaId && item.date === date) }))
  const toggle = async (studentId: string, field: 'present' | 'preConfirmed', item?: AmoAttendance) => {
    try {
      await mutate('attendance', 'PUT', { monitoriaId, studentId, date, present: field === 'present' ? !item?.present : !!item?.present, preConfirmed: field === 'preConfirmed' ? !item?.preConfirmed : !!item?.preConfirmed })
      setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Frequência não salva.') }
  }
  const exportCsv = () => {
    const rows = ['Aluno,Data,Monitoria,Presença,Pré-confirmado', ...records.map(({ user, attendance }) => `${user.name},${date},${monitoria?.subject ?? ''},${attendance ? attendance.present ? 'presente' : 'ausente' : 'não registrada'},${attendance ? attendance.preConfirmed ? 'sim' : 'não' : 'não registrado'}`)]
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'frequencias.csv'; link.click(); URL.revokeObjectURL(url)
  }
  return <div className="space-y-5">
    <h1 className="text-3xl font-semibold">Frequências</h1>
    {(currentUser.role === 'Aluno' || currentUser.role === 'Monitor') ? <section className="space-y-2"><h2 className="text-xl font-semibold">Minha frequência</h2>{own.length ? own.map(item => <Card key={item.id}><CardContent className="p-4">{state.monitorias.find(m => m.id === item.monitoriaId)?.subject} · {item.date} · {item.present ? 'Presente' : 'Ausente'}</CardContent></Card>) : <p className="text-sm text-zinc-600">Nenhum registro de frequência.</p>}</section> : null}
    {editableMonitorias.length ? <section className="space-y-3"><h2 className="text-xl font-semibold">Registrar frequência</h2>
      <div className="grid gap-2 sm:grid-cols-2"><select className="rounded-md border p-2" value={monitoriaId} onChange={event => setMonitoriaId(event.target.value)}>{editableMonitorias.map(item => <option key={item.id} value={item.id}>{item.subject}</option>)}</select><Input type="date" value={date} onChange={event => setDate(event.target.value)} /></div>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-2"><Button variant="outline" onClick={exportCsv}>Exportar CSV</Button><Button variant="outline" onClick={() => window.print()}>Imprimir PDF</Button></div>
      {records.map(({ user, attendance }) => <Card key={user.id}><CardContent className="flex flex-wrap items-center justify-between gap-2 p-4"><div><span className="font-medium">{user.name}</span><p className="text-xs text-zinc-500">{attendance ? attendance.present ? 'Presente' : 'Ausente' : 'Não registrada'}</p></div><div className="flex gap-2"><Button size="sm" variant={attendance?.preConfirmed ? 'default' : 'outline'} onClick={() => void toggle(user.id, 'preConfirmed', attendance)}>Pré-confirmado</Button><Button size="sm" variant={attendance?.present ? 'default' : 'outline'} onClick={() => void toggle(user.id, 'present', attendance)}>Presente</Button></div></CardContent></Card>)}
      {!records.length ? <p className="text-sm text-zinc-600">Nenhum aluno com matrícula aprovada nesta monitoria.</p> : null}
    </section> : null}
  </div>
}
