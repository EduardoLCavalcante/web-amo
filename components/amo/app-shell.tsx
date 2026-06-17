'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Home,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  User,
  UserPlus,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAmoStore } from '@/lib/amo/mock-store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navItems = [
  { href: '/cursos', label: 'Cursos', icon: Home },
  { href: '/monitorias', label: 'Monitorias', icon: BookOpen },
  { href: '/forum', label: 'Forum', icon: MessageSquare },
  { href: '/agendamentos', label: 'Agenda', icon: CalendarDays },
  { href: '/perfil', label: 'Perfil', icon: User },
]

const sideItems = [
  ...navItems,
  { href: '/frequencias', label: 'Frequencias', icon: ClipboardCheck },
  { href: '/admin', label: 'Admin', icon: Shield },
  { href: '/usuarios/novo', label: 'Usuarios', icon: UserPlus },
  { href: '/notificacoes', label: 'Notificacoes', icon: Bell },
  { href: '/configuracoes', label: 'Configuracoes', icon: Settings },
]

function AmoLogo() {
  return (
    <Link href="/cursos" className="flex items-center gap-2">
      <img src="/logo.png" alt="AMO" className="size-9 rounded-md object-contain" />
      <span className="hidden text-sm font-semibold leading-tight sm:block">
        Apoio ao Ensino
      </span>
    </Link>
  )
}

function NavLink({
  href,
  label,
  icon: Icon,
  compact = false,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  compact?: boolean
}) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/cursos' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-amo-ice hover:text-amo-navy',
        active && 'bg-amo-ice text-amo-navy ring-1 ring-amo-border',
        compact && 'flex-1 flex-col gap-1 px-1 py-2 text-[11px]',
      )}
    >
      <Icon className={cn('size-4', compact && 'size-5')} />
      <span>{label}</span>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state } = useAmoStore()
  const featuredMonitoria = state.monitorias[0]

  return (
    <div className="min-h-screen bg-amo-ice/50 text-slate-950">
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-white px-4 py-5 lg:block">
        <AmoLogo />
        <nav className="mt-8 space-y-1">
          {sideItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        {featuredMonitoria ? (
          <div className="absolute inset-x-4 bottom-5 rounded-md border border-amo-border bg-amo-ice p-3 text-sm text-amo-deep">
            <div className="font-semibold">Atendimento</div>
            <div className="mt-1">{featuredMonitoria.subject}</div>
            <div className="text-xs">{featuredMonitoria.schedule} · {featuredMonitoria.room}</div>
            <div className="mt-1 break-words text-xs">{featuredMonitoria.contact}</div>
          </div>
        ) : null}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="size-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="border-b px-5 py-4 text-left">
                    <SheetTitle>AMO</SheetTitle>
                  </SheetHeader>
                  <nav className="space-y-1 px-4 py-5">
                    {sideItems.map((item) => (
                      <NavLink key={item.href} {...item} />
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <div className="lg:hidden">
                <AmoLogo />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon">
                <Link href="/notificacoes">
                  <Bell className="size-5" />
                  <span className="sr-only">Notificacoes</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href="/usuarios/novo">
                  <Users className="size-4" />
                  Novo usuario
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-24 pt-5 sm:pt-8 lg:pb-10">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white px-2 pb-2 pt-1 lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} compact />
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
