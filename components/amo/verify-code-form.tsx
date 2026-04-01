"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

const OTP_LENGTH = 6

export function VerifyCodeForm() {
  const router = useRouter()
  const [code, setCode] = React.useState("")

  const isComplete = code.length === OTP_LENGTH

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete) return
    // Lógica de verificação será implementada posteriormente
    console.log("Verify code attempt:", { code })
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
        <h1 className="text-xl font-bold text-[#0077B6]">Inserir código</h1>

        {/* Descrição */}
        <p className="text-center text-base leading-relaxed text-[#2D3748]">
          Acabamos de enviar um código{" "}
          <br />
          para seu e-mail!
        </p>

        {/* Input OTP */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center gap-4 pt-2"
        >
          <InputOTP
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
                  className="h-14 w-14 rounded-xl border-2 border-[#B0D4E8] bg-white text-lg font-semibold text-[#0077B6] shadow-none first:rounded-xl last:rounded-xl data-[active=true]:border-[#48CAE4] data-[active=true]:ring-[#48CAE4]/20"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {/* Espaçador flexível */}
          <div className="min-h-[200px] flex-1" />

          {/* Botão Verificar */}
          <button
            type="submit"
            disabled={!isComplete}
            className="h-14 w-full rounded-2xl bg-[#1B3A5C] text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#162F4A] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Verificar código
          </button>
        </form>
      </div>
    </div>
  )
}
