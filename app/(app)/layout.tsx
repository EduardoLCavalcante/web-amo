import { AppShell } from '@/components/amo/app-shell'
import { AmoProvider } from '@/lib/amo/mock-store'

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <AmoProvider><AppShell>{children}</AppShell></AmoProvider>
}
