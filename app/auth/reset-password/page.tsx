"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useApi } from "@/hooks/use-api"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const token = searchParams.get("token")
  const email = searchParams.get("email")
    const { get, post, put, delete: del, buildUrl } = useApi()

  useEffect(() => {
    console.log("URL params:", { token, email }) // Debug log

    if (!token || !email) {
      toast({
        title: "Error",
        description: "Link reset password tidak valid",
        variant: "destructive",
      })
      router.push("/auth/forgot-password")
      return
    }

    validateToken()
  }, [token, email])

  const validateToken = async () => {
    try {
      console.log("Validating token:", { token, email }) // Debug log

      const response = await fetch(buildUrl("/api/password/validate-token"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json()
      console.log("Validation response:", data) // Debug log

      if (data.success && data.valid) {
        setIsValidToken(true)
        toast({
          title: "Token Valid",
          description: "Silakan masukkan password baru Anda.",
        })
      } else {
        console.error("Token validation failed:", data)
        toast({
          title: "Token Tidak Valid",
          description: data.message || "Link reset password tidak valid atau sudah expired",
          variant: "destructive",
        })
        setTimeout(() => {
          router.push("/auth/forgot-password")
        }, 3000)
      }
    } catch (error) {
      console.error("Token validation error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat validasi token",
        variant: "destructive",
      })
      router.push("/auth/forgot-password")
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !passwordConfirmation) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      })
      return
    }

    if (password !== passwordConfirmation) {
      toast({
        title: "Error",
        description: "Konfirmasi password tidak cocok",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password minimal 8 karakter",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("Resetting password:", { token, email }) // Debug log

      const response = await fetch(buildUrl("/api/password/reset"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      const data = await response.json()
      console.log("Reset response:", data) // Debug log

      if (data.success) {
        setIsSuccess(true)
        toast({
          title: "Berhasil",
          description: "Password berhasil direset. Anda akan diarahkan ke halaman login.",
        })

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        toast({
          title: "Error",
          description: data.message || "Terjadi kesalahan saat reset password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan jaringan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-600">Memvalidasi link reset password...</p>
              <p className="text-xs text-gray-500 mt-2">Token: {token?.substring(0, 10)}...</p>
              <p className="text-xs text-gray-500">Email: {email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Direset!</h2>
              <p className="text-gray-600 mb-6">
                Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login dalam beberapa detik.
              </p>
              <Button asChild>
                <Link href="/login">Login Sekarang</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Tidak Valid</h2>
              <p className="text-gray-600 mb-6">
                Link reset password tidak valid atau sudah expired. Silakan request ulang.
              </p>
              <Button asChild>
                <Link href="/auth/forgot-password">Request Reset Password</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Reset Password
          </CardTitle>
          <CardDescription>
            Masukkan password baru untuk akun: <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
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

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  placeholder="Konfirmasi password baru"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  disabled={isLoading}
                >
                  {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Syarat password:</p>
              <ul className="text-xs space-y-1">
                <li className={password.length >= 8 ? "text-green-600" : "text-gray-500"}>• Minimal 8 karakter</li>
                <li
                  className={
                    password !== passwordConfirmation && passwordConfirmation
                      ? "text-red-600"
                      : password === passwordConfirmation && password
                        ? "text-green-600"
                        : "text-gray-500"
                  }
                >
                  • Konfirmasi password harus sama
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || password !== passwordConfirmation || password.length < 8}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mereset Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ingat password Anda?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Kembali ke Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
