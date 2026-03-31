# Guia de Contribuição

Obrigado pelo interesse em contribuir com o Web-AMO! 🎉

Este documento fornece diretrizes para contribuir com o projeto.

---

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Contribuir](#como-contribuir)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Padrões de Código](#padrões-de-código)
5. [Processo de Pull Request](#processo-de-pull-request)
6. [Reportando Bugs](#reportando-bugs)

---

## 📜 Código de Conduta

### Nossos Padrões

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros contribuidores

---

## 🤝 Como Contribuir

### Tipos de Contribuição

- 🐛 **Bug fixes**: Correção de problemas existentes
- ✨ **Features**: Novas funcionalidades
- 📚 **Documentação**: Melhorias na documentação
- 🎨 **Design**: Melhorias de UI/UX
- ♻️ **Refatoração**: Melhorias de código sem mudança de comportamento
- 🧪 **Testes**: Adição de testes

### Antes de Começar

1. Verifique se já existe uma issue relacionada
2. Para features grandes, abra uma issue para discussão primeiro
3. Faça fork do repositório

---

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- Git
- Editor com suporte a TypeScript (recomendado: VS Code)

### Instalação

```bash
# Clone seu fork
git clone https://github.com/SEU_USUARIO/web-amo.git
cd web-amo

# Adicione o repositório original como upstream
git remote add upstream https://github.com/EduardoLCavalcante/web-amo.git

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode"
  ]
}
```

---

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ Bom: Tipos explícitos em funções exportadas
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ❌ Evite: any
function processData(data: any) { ... }

// ✅ Prefira: tipos específicos ou unknown
function processData(data: unknown) { ... }
```

### Componentes React

```tsx
// ✅ Bom: Interface separada, nome descritivo
interface UserCardProps {
  user: User
  onSelect?: (user: User) => void
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div onClick={() => onSelect?.(user)}>
      {user.name}
    </div>
  )
}

// ❌ Evite: Props inline, nomes genéricos
export function Card({ data, onClick }: { data: any; onClick: any }) {
  ...
}
```

### Tailwind CSS

```tsx
// ✅ Bom: Classes organizadas e legíveis
<div className="
  flex items-center justify-between
  p-4 rounded-lg
  bg-white shadow-md
  hover:shadow-lg transition-shadow
">

// ❌ Evite: Classes muito longas em uma linha
<div className="flex items-center justify-between p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
```

### Imports

```typescript
// Ordem de imports:
// 1. React/Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Bibliotecas externas
import { z } from 'zod'

// 3. Componentes internos
import { Button } from '@/components/ui/button'

// 4. Utilitários e tipos
import { cn } from '@/lib/utils'
import type { User } from '@/types'
```

---

## 🔄 Processo de Pull Request

### 1. Crie uma Branch

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie branch para sua feature/fix
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 2. Faça suas Alterações

- Mantenha commits pequenos e focados
- Siga o padrão de commits convencionais

### 3. Commits Convencionais

```bash
# Formato
<tipo>(<escopo>): <descrição>

# Exemplos
feat(auth): adiciona validação de email no login
fix(ui): corrige alinhamento do botão no mobile
docs(readme): atualiza instruções de instalação
style(login): ajusta espaçamento do formulário
refactor(forms): extrai lógica de validação para hook
test(auth): adiciona testes para fluxo de login
```

#### Tipos Permitidos

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação (não altera código) |
| `refactor` | Refatoração |
| `test` | Testes |
| `chore` | Manutenção |

### 4. Antes do PR

```bash
# Verifique erros de lint
npm run lint

# Verifique se o build funciona
npm run build

# Atualize com upstream
git fetch upstream
git rebase upstream/main
```

### 5. Abra o Pull Request

- Use um título descritivo seguindo Conventional Commits
- Descreva o que foi feito e por quê
- Referencie issues relacionadas (`Closes #123`)
- Adicione screenshots se houver mudanças visuais

### Exemplo de PR

```markdown
## Descrição
Adiciona validação de força de senha no formulário de cadastro.

## Mudanças
- Implementa indicador visual de força da senha
- Adiciona validação com Zod
- Atualiza mensagens de erro

## Screenshots
[Anexe imagens aqui]

## Checklist
- [x] Código segue os padrões do projeto
- [x] Lint passa sem erros
- [x] Build funciona corretamente
- [x] Documentação atualizada (se aplicável)

Closes #45
```

---

## 🐛 Reportando Bugs

### Template de Issue

```markdown
## Descrição do Bug
Descreva o comportamento incorreto.

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

## Comportamento Esperado
O que deveria acontecer.

## Screenshots
Se aplicável, adicione screenshots.

## Ambiente
- SO: [ex: Windows 11]
- Browser: [ex: Chrome 120]
- Node.js: [ex: 18.19.0]
```

---

## 💡 Dicas

1. **Comece pequeno**: PRs menores são revisados mais rapidamente
2. **Pergunte**: Se não tiver certeza, abra uma issue para discussão
3. **Seja paciente**: Reviews podem levar algum tempo
4. **Aprenda**: Code review é uma oportunidade de aprendizado

---

## 🙏 Agradecimentos

Obrigado por dedicar seu tempo para melhorar o Web-AMO!

Toda contribuição, grande ou pequena, é valiosa para o projeto.
