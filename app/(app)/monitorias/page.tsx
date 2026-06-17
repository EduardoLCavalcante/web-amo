import { Suspense } from 'react'

import { MonitoriasPage } from '@/components/amo/app-pages'

export default function Page() {
  return (
    <Suspense>
      <MonitoriasPage />
    </Suspense>
  )
}
