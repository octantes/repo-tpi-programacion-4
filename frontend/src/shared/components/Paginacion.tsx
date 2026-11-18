import { Button } from '../ui/Button'

interface PaginacionProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Paginacion({ page, totalPages, onPageChange }: PaginacionProps) {
  if (totalPages <= 1) {
    return null
  }
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 0}>
        anterior
      </Button>
      <span className="text-sm text-slate-600">
        pagina {page + 1} de {totalPages}
      </span>
      <Button variant="secondary" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
        siguiente
      </Button>
    </div>
  )
}