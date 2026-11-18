import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { LoginCredentials, LoginResponse, RegisterData, Usuario } from '../types'

export async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const body = new URLSearchParams()
  body.append('username', credentials.username)
  body.append('password', credentials.password)
  const { data } = await axiosInstance.post<LoginResponse>('/auth/token', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function registerRequest(payload: RegisterData): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/auth/register', payload)
  return data
}

export async function meRequest(): Promise<Usuario> {
  const { data } = await axiosInstance.get<Usuario>('/auth/me')
  return data
}

export async function logoutRequest(): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/auth/logout')
  return data
}