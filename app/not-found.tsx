import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="rounded-full bg-muted p-4 mb-6">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>

        <h1 className="text-6xl font-bold tracking-tight mb-2">404</h1>
        
        <h2 className="text-xl font-semibold mb-2">
          Página não encontrada
        </h2>
        
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>

        <div className="flex gap-4">
          <Button variant="default" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Página inicial
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
