"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Menu, Bell } from "lucide-react"
import { MonitorRegisterInput } from "./monitor-register-input"

export function MonitorRegisterForm() {
  const router = useRouter()
  const [nome, setNome] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [disciplina, setDisciplina] = React.useState("")
  const [matricula, setMatricula] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Lógica de cadastro de monitor será implementada posteriormente
    console.log("Monitor register attempt:", { nome, email, disciplina, matricula })

    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      {/* Conteúdo */}
      <main className="flex flex-1 flex-col items-center px-6 pt-8">
        <div className="flex w-full max-w-md flex-col items-center gap-8">

          {/* Logo */}
          <div className="h-16 w-full">
            <img
              src="/logo.png"
              alt="AMO Logo"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-4"
            id="monitor-register-form"
          >
            <MonitorRegisterInput
              label="Nome:"
              placeholder="digite o nome..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              required
              id="monitor-nome"
            />

            <MonitorRegisterInput
              label="E-mail:"
              type="email"
              placeholder="digite o e-mail..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              id="monitor-email"
            />

            <MonitorRegisterInput
              label="Disciplina:"
              placeholder="digite a disciplina..."
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              required
              id="monitor-disciplina"
            />

            <MonitorRegisterInput
              label="Matrícula:"
              placeholder="digite a matrícula..."
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              id="monitor-matricula"
            />

            {/* Feedback de sucesso */}
            {success && (
              <p className="text-center text-sm font-medium text-emerald-600">
                Monitor cadastrado com sucesso!
              </p>
            )}

            {/* Espaçador */}
            <div  />

            {/* Botão Cadastrar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-14 w-full rounded-2xl bg-[#1B3A5C] text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#162F4A] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              id="monitor-submit-btn"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Cadastrando...
                </span>
              ) : (
                "cadastrar"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
