"use client"

import * as React from "react"
import Link from "next/link"
import { LoginInput } from "./login-input"

export function LoginForm() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica de autenticação será implementada posteriormente
    console.log("Login attempt:", { email, password })
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#0077B6] to-[#48CAE4] px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* Logo */}
        <div className="h-[201px] w-[201px] pt-8">
          <img src="1.webp" alt="logo" />
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          <LoginInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <LoginInput
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {/* Links */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <Link
              href="/esqueci-senha"
              className="text-sm text-white/90 hover:text-white transition-colors"
            >
              Esqueci minha senha
            </Link>
            <Link
              href="/cadastro"
              className="text-base font-semibold text-white hover:text-white/90 transition-colors"
            >
              Cadastre-se
            </Link>
          </div>

          {/* Botão de Login */}
          <button
            type="submit"
            className="mt-4 h-14 w-full rounded-2xl bg-white text-lg font-semibold text-[#0077B6] shadow-lg transition-all hover:bg-white/95 hover:shadow-xl active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
