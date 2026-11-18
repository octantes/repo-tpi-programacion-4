import axios from 'axios'

interface ValidationError {
  msg?: string
}

interface ApiErrorData {
  detail?: string | ValidationError[]
}

function normalizarMensaje(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/ñ/g, '\uE000')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\uE000/g, 'ñ')
}

export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'ocurrio un error inesperado'
  }
  const data = error.response?.data as ApiErrorData | undefined
  if (typeof data?.detail === 'string') {
    return normalizarMensaje(data.detail)
  }
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return normalizarMensaje(data.detail[0]?.msg ?? 'los datos enviados no son validos')
  }
  return 'no se pudo completar la operacion'
}