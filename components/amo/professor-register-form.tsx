"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Menu, Bell } from "lucide-react"
import { ProfessorRegisterInput } from "./professor-register-input"

export function ProfessorRegisterForm() {
  const router = useRouter()
  const [nome, setNome] = React.useState("")
  const [disciplina, setDisciplina] = React.useState("")
  const [siape, setSiape] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Lógica de cadastro de professor será implementada posteriormente
    console.log("Professor register attempt:", { nome, disciplina, siape })

    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#E8F4FB] bg-white px-5 py-4 shadow-sm">
        <button
          type="button"
          aria-label="Menu"
          id="professor-menu-btn"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#48CAE4] transition-all duration-200 hover:bg-[#48CAE4]/10"
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>

        <h1 className="text-base font-semibold tracking-wide text-[#48CAE4]">
          adicionar professor
        </h1>

        <button
          type="button"
          aria-label="Notificações"
          id="professor-notification-btn"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#48CAE4] transition-all duration-200 hover:bg-[#48CAE4]/10"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
        </button>
      </header>

      {/* Conteúdo */}
      <main className="flex flex-1 flex-col items-center px-6 pt-8">
        <div className="flex w-full max-w-md flex-col items-center gap-8">

          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-[80px] w-[80px]">
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
              label="nome:"
              placeholder="digite o nome..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              required
              id="professor-nome"
            />

            <ProfessorRegisterInput
              label="disciplina:"
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
              <p className="text-center text-sm font-medium text-emerald-600 animate-fade-in">
                Professor cadastrado com sucesso!
              </p>
            )}

            {/* Espaçador */}
            <div className="min-h-[60px]" />

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

      {/* Bottom Nav — decorativo, igual ao app */}
      <nav className="flex items-center justify-around border-t border-[#E8F4FB] bg-white px-6 py-3 shadow-[0_-2px_8px_rgba(0,119,182,0.06)]">
        {/* Professores (ativo) */}
        <button
          type="button"
          aria-label="Professores"
          id="nav-professors"
          className="flex flex-col items-center gap-1 text-[#48CAE4]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-[10px] font-medium">professores</span>
        </button>

        {/* Calendário */}
        <button
          type="button"
          aria-label="Calendário"
          id="nav-calendar"
          className="flex flex-col items-center gap-1 text-[#B0BEC5]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[10px]">calendário</span>
        </button>

        {/* Notificações */}
        <button
          type="button"
          aria-label="Notificações"
          id="nav-notifications"
          className="flex flex-col items-center gap-1 text-[#B0BEC5]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="text-[10px]">notificações</span>
        </button>

        {/* Perfil */}
        <button
          type="button"
          aria-label="Perfil"
          id="nav-profile"
          className="flex flex-col items-center gap-1 text-[#B0BEC5]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[10px]">perfil</span>
        </button>
      </nav>
    </div>
  )
}
