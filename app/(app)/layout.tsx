import { AppShell } from '@/components/amo/app-shell'
import { AmoProvider } from '@/lib/amo/mock-store'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('amo-session')?.value
  if (!token) redirect('/')
  return <AmoProvider><AppShell>{children}</AppShell></AmoProvider>
}
