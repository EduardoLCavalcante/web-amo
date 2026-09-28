"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { apiRequest } from '@/lib/amo/mock-store'
import { Input } from '@/components/ui/input'

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

const OTP_LENGTH = 6

export function VerifyCodeForm() {
  const router = useRouter()
  const [code, setCode] = React.useState("")
  const [demoCode, setDemoCode] = React.useState('')
  const [recover, setRecover] = React.useState(false)
  const [verified, setVerified] = React.useState(false)
  const [newPassword, setNewPassword] = React.useState('')
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const recovery = new URLSearchParams(window.location.search).has('recover')
    setRecover(recovery)
    apiRequest<{ code: string }>(recovery ? 'auth/recover/code' : 'auth/register/code').then(data => setDemoCode(data.code)).catch(cause => setError(cause instanceof Error ? cause.message : 'Código indisponível.'))
  }, [])

  const isComplete = code.length === OTP_LENGTH

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (verified && recover) {
        await apiRequest('auth/recover/finish', 'POST', { newPassword })
        router.push('/')
      } else {
        if (!isComplete) return
        await apiRequest(recover ? 'auth/recover/verify' : 'auth/register/verify', 'POST', { code })
        if (recover) setVerified(true)
        else router.push('/cadastro-dados')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Código inválido.')
    }
  }

  const handleCodeComplete = (value: string) => {
    setCode(value)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white px-6 py-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 pt-2">
        {/* Logo */}
        <div className="h-[80px] w-[80px]">
          <img
            src="/logo.png"
            alt="AMO Logo"
            className="h-full w-full object-contain"
          />
        </div>

        {/* Título */}
        <h1 className="text-xl font-bold text-[#024284]">Inserir código</h1>

        {/* Descrição */}
        <p className="text-center text-base leading-relaxed text-[#2D3748]">
          Código de demonstração: <strong>{demoCode || '...'}</strong><br />Válido por 10 minutos.
        </p>

        {/* Input OTP */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center gap-4 pt-2"
        >
          {!verified ? <InputOTP
            maxLength={OTP_LENGTH}
            pattern={REGEXP_ONLY_DIGITS}
            value={code}
            onChange={handleCodeComplete}
            containerClassName="gap-3"
          >
            <InputOTPGroup className="gap-3">
              {Array.from({ length: OTP_LENGTH }, (_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-14 w-14 rounded-xl border-2 border-amo-border bg-white text-lg font-semibold text-[#024284] shadow-none first:rounded-xl last:rounded-xl data-[active=true]:border-[#48CAE4] data-[active=true]:ring-[#48CAE4]/20"
                />
              ))}
            </InputOTPGroup>
          </InputOTP> : <Input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="Nova senha" minLength={8} required />}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {/* Espaçador flexível */}
          <div className="min-h-[200px] flex-1" />

          {/* Botão Verificar */}
          <button
            type="submit"
            disabled={!verified && !isComplete}
            className="h-14 w-full rounded-2xl bg-[#024284] text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#1B3A5C] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {verified ? 'Redefinir senha' : 'Verificar código'}
          </button>
        </form>
      </div>
    </div>
  )
}
