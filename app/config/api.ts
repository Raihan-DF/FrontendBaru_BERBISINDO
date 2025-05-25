// Jika file ini belum ada, tambahkan kode berikut
// Jika sudah ada, pastikan fungsi-fungsi ini tersedia

interface UserData {
  id: number
  name: string
  email: string
  role?: string
}

export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
}

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
  }
}

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
}

export const getUserData = (): UserData | null => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("userData")
    return userData ? JSON.parse(userData) : null
  }
  return null
}

export const setUserData = (userData: UserData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userData", JSON.stringify(userData))
  }
}

export const removeUserData = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userData")
  }
}

export const getHeaders = (): HeadersInit => {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}

export const logout = (): void => {
  removeToken()
  removeUserData()
}
