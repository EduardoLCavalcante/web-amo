"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { RegisterInput } from "./register-input"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica de redefinição será implementada posteriormente
    console.log("Reset password attempt:", { email })
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white px-6 py-8">
      {/* Botão Voltar */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="absolute left-4 top-8 flex items-center justify-center rounded-full p-1 text-[#48CAE4] hover:text-[#0077B6] hover:bg-[#48CAE4]/10 transition-all duration-200"
        aria-label="Voltar"
      >
        <ChevronLeft className="h-7 w-7" strokeWidth={2.5} />
      </button>

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
        <h1 className="text-xl font-bold text-[#48CAE4]">Esqueceu a senha?</h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 pt-6">
          <RegisterInput
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          {/* Espaçador flexível */}
          <div className="min-h-[160px] flex-1" />

          {/* Botão Redefinir */}
          <button
            type="submit"
            className="h-14 w-full rounded-2xl bg-[#48CAE4] text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#3BB5CF] hover:shadow-xl active:scale-[0.98]"
          >
            Redefinir senha
          </button>
        </form>
      </div>
    </div>
  )
}
