import { apiFetch, ApiFetchOptions } from "./fetcher"
export const get = <T>(url: string, options?: ApiFetchOptions) => apiFetch<T>(url, options)

export const post = <T>(url: string, data?: unknown, options?: ApiFetchOptions) =>
  apiFetch<T>(url, { ...options, method: "POST", body: JSON.stringify(data) })

export const patch = <T>(url: string, data?: unknown, options?: ApiFetchOptions) =>
  apiFetch<T>(url, { ...options, method: "PATCH", body: JSON.stringify(data) })

export const del = <T>(url: string, options?: ApiFetchOptions) =>
  apiFetch<T>(url, { ...options, method: "DELETE" })
