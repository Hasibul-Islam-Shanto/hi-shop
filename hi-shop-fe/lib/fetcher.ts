import { envConfig } from "@/config/envs"

export type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  token?: string | null
  headers?: Record<string, string>
  cache?: RequestCache
  next?: { revalidate?: number; tags?: string[] }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers = {}, body, method = "GET", ...rest } = options
  const url = path.startsWith("http") ? path : `${envConfig.apiBaseUrl}${path}`
  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  }

  const response = await fetch(url, {
    method,
    headers: mergedHeaders,
    ...(body !== undefined && { body: body }),
    ...rest,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? `HTTP ${response.status}`)
    throw new Error(message)
  }

  if (response.status === 204) return undefined as unknown as T

  const data = await response.json()
  return data as unknown as T
}
