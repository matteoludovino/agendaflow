import Link from "next/link"
import { CalendarX } from "lucide-react"

export default function ProfessionalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <CalendarX className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="mb-2 text-xl font-bold">Perfil não encontrado</h1>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Esse profissional não existe ou desativou sua página de agendamentos.
        Verifique o link e tente novamente.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
