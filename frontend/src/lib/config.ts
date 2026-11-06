export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
  return url.replace(/\/$/, "")
}
