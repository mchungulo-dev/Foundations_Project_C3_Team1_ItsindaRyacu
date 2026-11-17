const TOKEN_KEY = "auth_token"

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1]
    if (!payload) {
      return true
    }
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = JSON.parse(atob(base64)) as { exp?: unknown }
    if (typeof json.exp !== "number") {
      return false
    }
    return json.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}
