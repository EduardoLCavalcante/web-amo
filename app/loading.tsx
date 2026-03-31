export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-muted" />
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Carregando...
        </p>
      </div>
    </div>
  )
}
