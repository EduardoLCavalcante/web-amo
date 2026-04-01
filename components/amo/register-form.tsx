"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { RegisterInput } from "./register-input"

export function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica de cadastro será implementada posteriormente
    console.log("Register attempt:", { email, password, confirmPassword })
    router.push("/verificar-codigo")
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white px-6 py-8">
      {/* Botão Voltar */}
      <button
        type="button"
        onClick={() => router.back()}
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
        <h1 className="text-xl font-bold text-[#0077B6]">Cadastre-se</h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 pt-2">
          <RegisterInput
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <RegisterInput
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <RegisterInput
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          {/* Texto auxiliar */}
          <p className="text-xs leading-relaxed text-[#90A4AE] px-1">
            A senha precisa ter no mínimo 8 caracteres,
            contendo letras e números, sem espaçamento. Ex:
            12zay78d
          </p>

          {/* Espaçador flexível para empurrar o botão para baixo */}
          <div className="flex-1 min-h-[120px]" />

          {/* Botão Avançar */}
          <button
            type="submit"
            className="h-14 w-full rounded-2xl bg-[#1B3A5C] text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#162F4A] hover:shadow-xl active:scale-[0.98]"
          >
            Avançar
          </button>
        </form>
      </div>
    </div>
  )
}
