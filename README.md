# 🎓 Web-AMO

**Plataforma de Apoio ao Ensino Acadêmico** - Sistema web para auxiliar estudantes e a comunidade Russana no desenvolvimento educacional.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Sobre o Projeto

O **AMO (Apoio ao Ensino Acadêmico)** é uma plataforma web desenvolvida para fornecer suporte educacional à comunidade. O sistema oferece funcionalidades de autenticação e cadastro de usuários, com uma interface moderna e responsiva.

---

## 🚀 Tecnologias

### Core
- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca de UI
- **[TypeScript 5.7](https://www.typescriptlang.org/)** - Tipagem estática

### Estilização
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes reutilizáveis
- **[Lucide React](https://lucide.dev/)** - Ícones

### Formulários & Validação
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[Zod](https://zod.dev/)** - Validação de schemas

### Outros
- **[Vercel Analytics](https://vercel.com/analytics)** - Analytics integrado
- **[date-fns](https://date-fns.org/)** - Manipulação de datas

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** 9.x ou superior (ou yarn/pnpm)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/EduardoLCavalcante/web-amo.git
cd web-amo

# 2. Instale as dependências
npm install

# 3. Execute o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa verificação de código |

---

## 📁 Estrutura do Projeto

```
web-amo/
├── app/                          # App Router (Next.js 13+)
│   ├── layout.tsx                # Layout raiz
│   ├── page.tsx                  # Página inicial (Login)
│   ├── loading.tsx               # Estado de carregamento global
│   ├── error.tsx                 # Tratamento de erros global
│   ├── not-found.tsx             # Página 404
│   ├── globals.css               # Estilos globais
│   └── cadastro/
│       └── page.tsx              # Página de cadastro
│
├── components/
│   ├── amo/                      # Componentes específicos do AMO
│   │   ├── login-form.tsx        # Formulário de login
│   │   ├── login-input.tsx       # Input estilizado para login
│   │   ├── register-form.tsx     # Formulário de cadastro
│   │   └── register-input.tsx    # Input estilizado para cadastro
│   └── ui/                       # Componentes shadcn/ui
│
├── hooks/                        # Custom hooks
├── lib/                          # Utilitários e helpers
├── public/                       # Arquivos estáticos
├── styles/                       # Estilos adicionais
├── docs/                         # Documentação
│   ├── PLAN.md                   # Plano de melhorias
│   ├── ARCHITECTURE.md           # Arquitetura detalhada
│   └── CONTRIBUTING.md           # Guia de contribuição
│
├── proxy.ts                      # Proxy de rotas (Next.js 16+)
├── next.config.mjs               # Configuração do Next.js
├── tailwind.config.ts            # Configuração do Tailwind
├── tsconfig.json                 # Configuração do TypeScript
└── package.json                  # Dependências do projeto
```

---

## 🗺️ Arquitetura de Rotas

O projeto utiliza o **App Router** do Next.js 13+ com a seguinte estrutura:

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `app/page.tsx` | Página de Login |
| `/cadastro` | `app/cadastro/page.tsx` | Página de Cadastro |

### Componentes Especiais de Rota

| Arquivo | Função |
|---------|--------|
| `layout.tsx` | Layout compartilhado entre páginas |
| `loading.tsx` | UI durante carregamento (Suspense) |
| `error.tsx` | Error boundary para erros de runtime |
| `not-found.tsx` | Página 404 personalizada |
| `proxy.ts` | Interceptação de requisições (Next.js 16+) |

### Proxy (anteriormente Middleware)

O `proxy.ts` está configurado para:
- ✅ Permitir rotas públicas (`/`, `/cadastro`)
- 🔒 Preparado para proteger rotas futuras (`/dashboard`, `/perfil`)
- ⚙️ Excluir assets estáticos do processamento

---

## 🎨 Convenções de Código

### Nomenclatura

- **Componentes**: PascalCase (`LoginForm.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.ts`)
- **Utilitários**: camelCase (`formatDate.ts`)
- **Constantes**: SCREAMING_SNAKE_CASE (`API_URL`)

### Estrutura de Componentes

```tsx
// 1. Imports
import { useState } from 'react'

// 2. Types/Interfaces
interface Props {
  title: string
}

// 3. Component
export function MyComponent({ title }: Props) {
  // Hooks
  const [state, setState] = useState('')

  // Handlers
  const handleClick = () => {}

  // Render
  return <div>{title}</div>
}
```

### Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona formulário de login
fix: corrige validação de email
docs: atualiza README
style: ajusta espaçamento do header
refactor: reorganiza estrutura de pastas
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Analytics (opcional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [Guia de Contribuição](docs/CONTRIBUTING.md) para mais detalhes.

### Passos Básicos

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Roadmap

- [x] Página de Login
- [x] Página de Cadastro
- [x] Tratamento de erros (error.tsx)
- [x] Página 404 personalizada
- [x] Estado de loading global
- [x] Middleware base
- [ ] Integração com backend
- [ ] Dashboard do usuário
- [ ] Sistema de recuperação de senha
- [ ] Perfil do usuário

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Eduardo L. Cavalcante** - [GitHub](https://github.com/EduardoLCavalcante)
- **Pedro Aumério** - [GitHub](https://github.com/Pedroaumerio)

---

<p align="center">
  Desenvolvido com 💙 para a comunidade Russana
</p>
