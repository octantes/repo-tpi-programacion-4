import type { ReactNode } from 'react'

interface EstadoVacioProps {
  title: string
  message: string
  children?: ReactNode
}

export function EstadoVacio({ title, message, children }: EstadoVacioProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      {children ? <div className="mt-5 flex justify-center">{children}</div> : null}
    </div>
  )
}