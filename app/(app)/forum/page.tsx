import { Suspense } from 'react'

import { ForumPage } from '@/components/amo/app-pages'

export default function Page() {
  return (
    <Suspense>
      <ForumPage />
    </Suspense>
  )
}
