"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  created_at?: string
  updated_at?: string
}

interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

interface LoginResponse {
  user: User
  role: string
  token: string
}

interface AuthContextType {
  user: User | null
  userRole: string | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  loginUser: (credentials: LoginCredentials) => Promise<LoginResponse>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  loginUser: async () => ({ user: {} as User, role: "", token: "" }),
  logout: () => {},
  refreshUser: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")
        const storedRole = localStorage.getItem("userRole")

        if (storedToken && storedUser && storedRole) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          setUserRole(storedRole)

          // Verify token is still valid
          await verifyToken(storedToken)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        clearAuthData()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/user`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Token verification failed")
      }

      const data = await response.json()
      setUser(data.user)
      setUserRole(data.role)
    } catch (error) {
      console.error("Token verification failed:", error)
      clearAuthData()
      throw error
    }
  }

  const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login gagal")
      }

      if (!data.token) {
        throw new Error("Token tidak ditemukan dalam respons")
      }

      // Store auth data
      const authData = {
        user: data.user,
        role: data.role,
        token: data.token,
      }

      setUser(data.user)
      setUserRole(data.role)
      setToken(data.token)

      // Store in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("userRole", data.role)

      // Store remember me preference
      if (credentials.rememberMe) {
        localStorage.setItem("rememberMe", "true")
      }

      console.log("Login successful, user role:", data.role)
      return authData
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      if (token) {
        // Call logout API
        await fetch(`${apiBaseUrl}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      clearAuthData()
      router.push("/login")
    }
  }

  const clearAuthData = () => {
    setUser(null)
    setUserRole(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userRole")
    localStorage.removeItem("rememberMe")
  }

  const refreshUser = async () => {
    if (!token) return

    try {
      await verifyToken(token)
    } catch (error) {
      console.error("Failed to refresh user:", error)
      logout()
    }
  }

  const isAuthenticated = !!token && !!user

  const value: AuthContextType = {
    user,
    userRole,
    token,
    isAuthenticated,
    loading,
    loginUser,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}



// "use client"

// import type React from "react"
// import { createContext, useContext, useState, useEffect } from "react"
// import { useRouter } from "next/navigation"

// interface AuthContextType {
//   isAuthenticated: boolean
//   token: string | null
//   userRole: string | null
//   loading: boolean
//   login: (token: string, role: string) => void
//   logout: () => void
// }

// const AuthContext = createContext<AuthContextType>({
//   isAuthenticated: false,
//   token: null,
//   userRole: null,
//   loading: true,
//   login: () => {},
//   logout: () => {},
// })

// export const useAuth = () => useContext(AuthContext)

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [token, setToken] = useState<string | null>(null)
//   const [userRole, setUserRole] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()

//   useEffect(() => {
//     // Cek token dari localStorage saat komponen dimount
//     const storedToken = localStorage.getItem("token")
//     const storedRole = localStorage.getItem("userRole")

//     if (storedToken) {
//       setToken(storedToken)
//       setUserRole(storedRole)
//       setIsAuthenticated(true)
//     }

//     setLoading(false)
//   }, [])

//   const login = (newToken: string, role: string) => {
//     // Simpan token dan role ke localStorage
//     localStorage.setItem("token", newToken)
//     localStorage.setItem("userRole", role)

//     // Update state
//     setToken(newToken)
//     setUserRole(role)
//     setIsAuthenticated(true)

//     console.log("Login successful. Token and role saved.")
//   }

//   const logout = () => {
//     // Hapus token dan role dari localStorage
//     localStorage.removeItem("token")
//     localStorage.removeItem("userRole")
//     localStorage.removeItem("userData")

//     // Reset state
//     setToken(null)
//     setUserRole(null)
//     setIsAuthenticated(false)

//     // Redirect ke halaman login
//     router.push("/login")

//     console.log("Logged out successfully")
//   }

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, token, userRole, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }
