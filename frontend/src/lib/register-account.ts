export type RegisteredAccount = {
  name: string
  email: string
  phone: string
  password: string
  nationalId: string
}

export function isRegisteredAccount(value: unknown): value is RegisteredAccount {
  if (!value || typeof value !== "object") {
    return false
  }

  const account = value as RegisteredAccount
  return (
    typeof account.name === "string" &&
    typeof account.email === "string" &&
    typeof account.phone === "string" &&
    typeof account.password === "string" &&
    typeof account.nationalId === "string"
  )
}
