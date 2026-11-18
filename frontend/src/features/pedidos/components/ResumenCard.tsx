interface ResumenCardProps {
  title: string
  value: string | number
  detail: string
  tone?: 'orange' | 'blue' | 'green' | 'red' | 'slate'
}

const tonos: Record<NonNullable<ResumenCardProps['tone']>, string> = {
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  slate: 'border-slate-200 bg-white text-slate-700',
}

export function ResumenCard({ title, value, detail, tone = 'slate' }: ResumenCardProps) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${tonos[tone]}`}>
      <p className="text-sm font-semibold opacity-80">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs opacity-70">{detail}</p>
    </div>
  )
}