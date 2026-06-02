import { AppShell } from '@/components/amo/app-shell'

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
