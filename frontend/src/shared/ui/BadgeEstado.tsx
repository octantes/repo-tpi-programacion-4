interface BadgeEstadoProps {
  estado: string
}

const estilos: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

const etiquetas: Record<string, string> = {
  PENDIENTE: 'pendiente',
  EN_PREPARACION: 'en preparacion',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${estilos[estado] ?? 'bg-slate-100 text-slate-700'}`}>
      {etiquetas[estado] ?? estado.toLowerCase()}
    </span>
  )
}