'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro capturado:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="rounded-full bg-destructive/10 p-4 mb-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Ops! Algo deu errado
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Ocorreu um erro inesperado. Por favor, tente novamente ou volte para a página inicial.
        </p>

        <div className="flex gap-4">
          <Button onClick={reset} variant="default">
            <RotateCcw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Página inicial
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground">
            Código do erro: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
