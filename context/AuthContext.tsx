// "use client"

// import type React from "react"
// import { createContext, useContext, useState, useEffect } from "react"
// import { useRouter } from "next/navigation"

// interface User {
//   [x: string]: any
//   id: number
//   name: string
//   email: string
//   email_verified_at?: string
//   created_at?: string
//   updated_at?: string
// }

// interface LoginCredentials {
//   email: string
//   password: string
//   rememberMe?: boolean
// }

// interface LoginResponse {
//   user: User
//   role: string
//   token: string
// }

// interface AuthContextType {
//   user: User | null
//   userRole: string | null
//   token: string | null
//   isAuthenticated: boolean
//   loading: boolean
//   loginUser: (credentials: LoginCredentials) => Promise<LoginResponse>
//   logout: () => void
//   refreshUser: () => Promise<void>
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   userRole: null,
//   token: null,
//   isAuthenticated: false,
//   loading: true,
//   loginUser: async () => ({ user: {} as User, role: "", token: "" }),
//   logout: () => {},
//   refreshUser: async () => {},
// })

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null)
//   const [userRole, setUserRole] = useState<string | null>(null)
//   const [token, setToken] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()

//   const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

//   // Initialize auth state from localStorage
//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         const storedToken = localStorage.getItem("token")
//         const storedUser = localStorage.getItem("user")
//         const storedRole = localStorage.getItem("userRole")

//         if (storedToken && storedUser && storedRole) {
//           setToken(storedToken)
//           setUser(JSON.parse(storedUser))
//           setUserRole(storedRole)

//           // Verify token is still valid
//           await verifyToken(storedToken)
//         }
//       } catch (error) {
//         console.error("Error initializing auth:", error)
//         clearAuthData()
//       } finally {
//         setLoading(false)
//       }
//     }

//     initializeAuth()
//   }, [])

//   const verifyToken = async (tokenToVerify: string) => {
//     try {
//       console.log("Verifying token...")
//       const response = await fetch(`${apiBaseUrl}/api/user`, {
//         headers: {
//           Authorization: `Bearer ${tokenToVerify}`,
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       })

//       if (!response.ok) {
//         console.error("Token verification failed with status:", response.status)
//         throw new Error("Token verification failed")
//       }

//       const data = await response.json()
//       console.log("Token verification successful, user data:", data)
//       setUser(data.user)
//       setUserRole(data.role)

//       // Update localStorage with fresh data
//       localStorage.setItem("user", JSON.stringify(data.user))
//       localStorage.setItem("userRole", data.role)

//       return data
//     } catch (error) {
//       console.error("Token verification failed:", error)
//       clearAuthData()
//       throw error
//     }
//   }

//   const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
//     try {
//       const response = await fetch(`${apiBaseUrl}/api/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           "X-Requested-With": "XMLHttpRequest",
//         },
//         body: JSON.stringify({
//           email: credentials.email,
//           password: credentials.password,
//         }),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.message || "Login gagal")
//       }

//       if (!data.token) {
//         throw new Error("Token tidak ditemukan dalam respons")
//       }

//       // Store auth data
//       const authData = {
//         user: data.user,
//         role: data.role,
//         token: data.token,
//       }

//       setUser(data.user)
//       setUserRole(data.role)
//       setToken(data.token)

//       // Store in localStorage
//       localStorage.setItem("token", data.token)
//       localStorage.setItem("user", JSON.stringify(data.user))
//       localStorage.setItem("userRole", data.role)

//       // Store remember me preference
//       if (credentials.rememberMe) {
//         localStorage.setItem("rememberMe", "true")
//       }

//       console.log("Login successful, user role:", data.role)
//       return authData
//     } catch (error) {
//       console.error("Login error:", error)
//       throw error
//     }
//   }

//   const logout = async () => {
//     try {
//       if (token) {
//         // Call logout API
//         await fetch(`${apiBaseUrl}/api/logout`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: "application/json",
//             "Content-Type": "application/json",
//           },
//         })
//       }
//     } catch (error) {
//       console.error("Logout API error:", error)
//     } finally {
//       clearAuthData()
//       router.push("/login")
//     }
//   }

//   const clearAuthData = () => {
//     setUser(null)
//     setUserRole(null)
//     setToken(null)
//     localStorage.removeItem("token")
//     localStorage.removeItem("user")
//     localStorage.removeItem("userRole")
//     localStorage.removeItem("rememberMe")
//   }

//   const refreshUser = async () => {
//     if (!token) return

//     try {
//       console.log("Refreshing user data...")
//       const data = await verifyToken(token)
//       console.log("User data refreshed:", data)
//       return data
//     } catch (error) {
//       console.error("Failed to refresh user:", error)
//       logout()
//       throw error
//     }
//   }

//   const isAuthenticated = !!token && !!user

//   const value: AuthContextType = {
//     user,
//     userRole,
//     token,
//     isAuthenticated,
//     loading,
//     loginUser,
//     logout,
//     refreshUser,
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  [x: string]: any
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

interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: string
}

interface LoginResponse {
  user: User
  role: string
  token: string
}

interface RegistrationResponse {
  message: string
  user: {
    id: number
    name: string
    email: string
    email_verified_at: string | null
  }
  role: string
  verification_required: boolean
}

interface AuthContextType {
  user: User | null
  userRole: string | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  apiBaseUrl: string
  loginUser: (credentials: LoginCredentials) => Promise<LoginResponse>
  registerUser: (credentials: RegisterCredentials) => Promise<RegistrationResponse>
  resendVerificationEmail: (email: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  apiBaseUrl: "",
  loginUser: async () => ({ user: {} as User, role: "", token: "" }),
  registerUser: async () => ({ message: "", user: {} as any, role: "", verification_required: false }),
  resendVerificationEmail: async () => {},
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

  // const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://e664-180-242-100-155.ngrok-free.app"
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
      console.log("Verifying token...")
      const response = await fetch(`${apiBaseUrl}/api/user`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error("Token verification failed with status:", response.status)
        throw new Error("Token verification failed")
      }

      const data = await response.json()
      console.log("Token verification successful, user data:", data)
      setUser(data.user)
      setUserRole(data.role)

      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("userRole", data.role)

      return data
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
      console.log("ini data user:",data)

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

  const registerUser = async (credentials: RegisterCredentials): Promise<RegistrationResponse> => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          const firstError = Object.values(data.errors)[0] as string[]
          throw new Error(firstError[0])
        } else {
          throw new Error(data.message || "Pendaftaran gagal. Silakan coba lagi.")
        }
      }

      return data as RegistrationResponse
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/email/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim email verifikasi.")
      }
    } catch (error) {
      console.error("Resend email error:", error)
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
      console.log("Refreshing user data...")
      const data = await verifyToken(token)
      console.log("User data refreshed:", data)
      return data
    } catch (error) {
      console.error("Failed to refresh user:", error)
      logout()
      throw error
    }
  }

  const isAuthenticated = !!token && !!user

  const value: AuthContextType = {
    user,
    userRole,
    token,
    isAuthenticated,
    loading,
    apiBaseUrl,
    loginUser,
    registerUser,
    resendVerificationEmail,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
