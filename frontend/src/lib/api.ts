import { getApiBaseUrl } from "@/lib/config"
import { getAuthToken, isTokenExpired, setAuthToken } from "@/lib/auth-token"
import type { RegisteredAccount } from "@/lib/register-account"
import { phoneForApi } from "@/lib/validation"

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function messageFromBody(body: unknown): string {
  if (body && typeof body === "object") {
    const { message, error } = body as { message?: unknown; error?: unknown }
    if (typeof message === "string") {
      return message
    }
    if (typeof error === "string") {
      return error
    }
  }
  return "Something went wrong."
}

export function errorDetails(error: unknown): string[] {
  if (
    error instanceof ApiError &&
    error.body &&
    typeof error.body === "object"
  ) {
    const { errors } = error.body as { errors?: unknown }
    if (Array.isArray(errors)) {
      return errors.filter((item): item is string => typeof item === "string")
    }
  }
  return []
}

export async function apiPost<T>(path: string, json: unknown): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new ApiError(messageFromBody(body), response.status, body)
  }

  return body as T
}

export const SESSION_EXPIRED_EVENT = "auth:session-expired"

export async function apiRequest<T>(
  path: string,
  options: { method?: string; json?: unknown } = {}
): Promise<T> {
  const token = getAuthToken()
  if (!token || isTokenExpired(token)) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    throw new ApiError("Your session has ended.", 401, null)
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.json === undefined ? undefined : JSON.stringify(options.json),
  })
  const body = await parseJson(response)

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    throw new ApiError(messageFromBody(body), response.status, body)
  }

  return body as T
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path)
}

export type LoginResponse = {
  message: string
  token?: string
  redirect_to?: string
  user?: {
    member_id: number
    account_id: number
    member_name: string
    email: string
    role: string
    group_name: string
  }
}

export function loginRequest(email: string, password: string) {
  return apiPost<LoginResponse>("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  })
}

export function applyLoginSuccess(data: LoginResponse): void {
  if (data.token) {
    setAuthToken(data.token)
  }
}

export type AdminRegisterBody = {
  group_name: string
  admin_email: string
  password: string
  member_name: string
  phone: string
  national_id_number: string
  savings_amount: number
  location?: string | null
  meeting_day?: string | null
  meeting_time?: string | null
  start_date?: string | null
}

export type AdminRegisterResponse = {
  message: string
  account_id: number
  group_name: string
  admin_email: string
}

export function adminRegisterRequest(
  account: RegisteredAccount,
  group: {
    groupName: string
    location: string
    savingsAmount: number
    meetingDay: string
    meetingTime: string
    startDate: string
  }
) {
  const body: AdminRegisterBody = {
    group_name: group.groupName.trim(),
    admin_email: account.email.trim().toLowerCase(),
    password: account.password,
    member_name: account.name.trim(),
    phone: phoneForApi(account.phone),
    national_id_number: account.nationalId,
    savings_amount: group.savingsAmount,
    location: group.location.trim() || null,
    meeting_day: group.meetingDay,
    meeting_time: group.meetingTime,
    start_date: `${group.startDate}T00:00:00.000Z`,
  }
  return apiPost<AdminRegisterResponse>("/auth/admin/register", body)
}
