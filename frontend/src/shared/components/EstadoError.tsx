import { Button } from '../ui/Button'

interface EstadoErrorProps {
  message: string
  onRetry?: () => void
}

export function EstadoError({ message, onRetry }: EstadoErrorProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry ? (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={onRetry}>
            reintentar
          </Button>
        </div>
      ) : null}
    </div>
  )
}