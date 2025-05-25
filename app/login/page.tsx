"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const router = useRouter()
  const { loginUser, isAuthenticated, userRole, loading } = useAuth()

  // Redirect jika sudah login
  useEffect(() => {
    if (!loading && isAuthenticated && userRole) {
      redirectBasedOnRole(userRole)
    }
  }, [isAuthenticated, userRole, loading])

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "student":
        router.push("/student/dashboard")
        break
      case "teacher":
        router.push("/teacher/dashboard")
        break
      case "admin":
        router.push("/admin/dashboard")
        break
      default:
        router.push("/dashboard")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.email) {
      setError("Email harus diisi")
      return false
    }
    if (!formData.password) {
      setError("Password harus diisi")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Format email tidak valid")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
        rememberMe,
      })

      console.log("Login successful, user role:", result.role)

      // Redirect berdasarkan role
      redirectBasedOnRole(result.role)
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Login gagal. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading spinner if auth is still loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Link href="/" className="absolute left-8 top-8 flex items-center gap-2">
        <GraduationCap className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">BISINDO</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
          <CardDescription>Masukkan email dan password untuk mengakses akun Anda</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ingat saya
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Memproses...
                </div>
              ) : (
                "Masuk"
              )}
            </Button>

            <div className="text-center text-sm">
              Belum memiliki akun?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Daftar
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
