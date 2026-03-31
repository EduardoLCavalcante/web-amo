# Arquitetura do Web-AMO

Este documento descreve a arquitetura técnica do projeto Web-AMO.

---

## 📐 Visão Geral

O Web-AMO é uma aplicação web construída com a stack moderna do Next.js, seguindo o padrão de arquitetura do **App Router** introduzido no Next.js 13.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Next.js Server                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 Middleware                       │   │
│  │  • Intercepta requisições                       │   │
│  │  • Proteção de rotas (futuro)                   │   │
│  │  • Redirecionamentos                            │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 App Router                       │   │
│  │  • Roteamento baseado em arquivos               │   │
│  │  • Server Components (padrão)                   │   │
│  │  • Client Components ('use client')             │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              React Components                    │   │
│  │  • UI Components (shadcn/ui)                    │   │
│  │  • Feature Components (amo/)                    │   │
│  │  • Forms (react-hook-form + zod)                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Pastas

### `/app` - App Router

Diretório principal do roteamento baseado em arquivos do Next.js.

```
app/
├── layout.tsx          # Root Layout - envolve todas as páginas
├── page.tsx            # Rota: /
├── loading.tsx         # Suspense fallback global
├── error.tsx           # Error boundary global
├── not-found.tsx       # Página 404
├── globals.css         # Estilos globais + Tailwind
└── cadastro/
    └── page.tsx        # Rota: /cadastro
```

#### Arquivos Especiais

| Arquivo | Propósito | Escopo |
|---------|-----------|--------|
| `layout.tsx` | UI compartilhada, preserva estado | Rota e filhos |
| `page.tsx` | UI única da rota | Apenas rota atual |
| `loading.tsx` | Loading UI (Suspense) | Rota e filhos |
| `error.tsx` | Error boundary | Rota e filhos |
| `not-found.tsx` | UI para 404 | Quando `notFound()` é chamado |

### `/components` - Componentes React

```
components/
├── amo/                # Componentes específicos do domínio
│   ├── login-form.tsx
│   ├── login-input.tsx
│   ├── register-form.tsx
│   └── register-input.tsx
│
└── ui/                 # Componentes genéricos (shadcn/ui)
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    └── ...
```

#### Regras de Organização

1. **`components/amo/`**: Componentes com lógica de negócio específica
2. **`components/ui/`**: Componentes puros de UI, reutilizáveis
3. **Colocation**: Componentes usados em apenas uma página podem ficar junto da página

### `/lib` - Utilitários

```
lib/
└── utils.ts            # Funções utilitárias (cn, formatters, etc.)
```

### `/hooks` - Custom Hooks

```
hooks/
└── use-*.ts            # Hooks personalizados
```

---

## 🔄 Fluxo de Dados

### Formulários

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Form Input  │ ──► │  React Hook  │ ──► │     Zod      │
│  Component   │     │    Form      │     │  Validation  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   Response   │ ◄── │   API Call   │
                     │   Handler    │     │   (futuro)   │
                     └──────────────┘     └──────────────┘
```

### Autenticação (Futuro)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Login     │ ──► │  API Route   │ ──► │   Backend    │
│    Form      │     │  /api/auth   │     │   Service    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Cookie/    │
                     │   Session    │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Middleware  │
                     │  Protection  │
                     └──────────────┘
```

---

## 🛡️ Proxy (Next.js 16+)

O proxy (`proxy.ts`) intercepta todas as requisições antes de chegarem às rotas.

> **Nota:** No Next.js 16, o `middleware.ts` foi renomeado para `proxy.ts`. O termo "proxy" deixa mais claro que esta funcionalidade opera na camada de rede, antes da aplicação.

### Configuração Atual

```typescript
// Rotas públicas
const publicRoutes = ['/', '/cadastro']

// Rotas protegidas (futuro)
const protectedRoutes = ['/dashboard', '/perfil']
```

### Fluxo do Proxy

```
Request ──► Proxy ──► Rota Pública? ──► Sim ──► Renderiza Página
                 │
                 └──► Rota Protegida? ──► Tem Token? ──► Sim ──► Renderiza
                                              │
                                              └──► Não ──► Redireciona Login
```

---

## 🎨 Sistema de Estilos

### Tailwind CSS 4

- Configuração em `tailwind.config.ts`
- Estilos globais em `app/globals.css`
- Uso de classes utilitárias inline

### Design Tokens

```css
/* Cores principais do projeto */
--primary: #0077B6      /* Azul principal */
--secondary: #48CAE4    /* Azul claro */
--accent: #1B3A5C       /* Azul escuro */
```

### Componentes shadcn/ui

- Componentes pré-estilizados e acessíveis
- Baseados em Radix UI primitives
- Personalizáveis via Tailwind

---

## 📦 Dependências Chave

| Pacote | Versão | Uso |
|--------|--------|-----|
| `next` | 16.2.0 | Framework |
| `react` | 19.2.4 | UI Library |
| `typescript` | 5.7.3 | Tipagem |
| `tailwindcss` | 4.2.0 | Estilos |
| `react-hook-form` | 7.54.1 | Formulários |
| `zod` | 3.24.1 | Validação |
| `lucide-react` | 0.564.0 | Ícones |

---

## 🔮 Evolução Planejada

### Fase 1: Atual ✅
- Login e cadastro UI
- Estrutura base de rotas
- Tratamento de erros

### Fase 2: Integração
- Backend API connection
- Autenticação real no middleware
- Session management

### Fase 3: Features
- Dashboard do usuário
- Perfil e configurações
- Sistema de notificações

### Fase 4: Otimização
- Server Components
- Streaming SSR
- Edge Runtime
