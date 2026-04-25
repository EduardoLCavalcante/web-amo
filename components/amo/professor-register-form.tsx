"use client"

import { ProfessorRegisterInput } from "./professor-register-input"
import { useEffect, useState } from "react"

export function ProfessorRegisterForm() {
  const [nome, setNome] = useState("")
  const [disciplina, setDisciplina] = useState("")
  const [siape, setSiape] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Lógica de cadastro de professor será implementada posteriormente
    console.log("Professor register attempt:", { nome, disciplina, siape })

    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setSuccess(true)
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      {/* Conteúdo */}
      <main className="flex flex-1 flex-col items-center px-6 pt-8">
        <div className="flex w-full max-w-md flex-col items-center gap-8">

          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-full">
              <img
                src="/logo.png"
                alt="AMO Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-4"
            id="professor-register-form"
          >
            <ProfessorRegisterInput
              label="Nome:"
              placeholder="digite o nome..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              required
              id="professor-nome"
            />

            <ProfessorRegisterInput
              label="Disciplina:"
              placeholder="digite a disciplina..."
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              required
              id="professor-disciplina"
            />

            <ProfessorRegisterInput
              label="SIAPE:"
              placeholder="digite seu SIAPE..."
              value={siape}
              onChange={(e) => setSiape(e.target.value)}
              required
              id="professor-siape"
            />

            {/* Feedback de sucesso */}
            {success && (
              <p className="animate-in fade-in-0 text-center text-sm font-medium text-emerald-600">
                Professor cadastrado com sucesso!
              </p>
            )}

            {/* Espaçador */}
            <div className="h-4 w-full" />

            {/* Botão Cadastrar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-14 w-full rounded-2xl bg-[#1B3A5C] text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#162F4A] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              id="professor-submit-btn"
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
