"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2, Mail, CheckCircle, AlertCircle, Send, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import loading from "../auth/reset-password/loading"

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

export default function RegisterPage() {
  const { toast } = useToast()
  const { registerUser, resendVerificationEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState("student")
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationStep, setVerificationStep] = useState<"sending" | "sent" | "error">("sending")
  const [registrationData, setRegistrationData] = useState<RegistrationResponse | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nama harus diisi")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email harus diisi")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Format email tidak valid")
      return false
    }
    if (!formData.password) {
      setError("Password harus diisi")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password harus terdiri dari minimal 8 karakter")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok")
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
      const data = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role,
      })

      // Registration successful - cast data to RegistrationResponse
      const registrationResponse: RegistrationResponse = {
        message: data.message,
        user: data.user,
        role: data.role,
        verification_required: data.verification_required,
      }

      setRegistrationData(registrationResponse)
      setShowVerificationModal(true)
      setVerificationStep("sending")

      // Simulate email sending process
      setTimeout(() => {
        setVerificationStep("sent")
      }, 2000)

      toast({
        title: "Pendaftaran Berhasil",
        description: `Selamat datang, ${data.user.name}! Email verifikasi sedang dikirim.`,
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "Terjadi kesalahan koneksi. Silakan coba lagi.")
      toast({
        title: "Pendaftaran Gagal",
        description: error.message || "Silakan periksa kembali data Anda.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowVerificationModal(false)
    // Redirect to verification page with email
    // if (registrationData) {
    //   window.location.href = `/auth/verify-email?email=${encodeURIComponent(registrationData.user.email)}`
    // }
    window.location.href = "/login"
  }

  const handleResendEmail = async () => {
    if (!registrationData) return

    setVerificationStep("sending")

    try {
      await resendVerificationEmail(registrationData.user.email)
      setVerificationStep("sent")
      toast({
        title: "Email Terkirim",
        description: "Email verifikasi telah dikirim ulang.",
      })
    } catch (error: any) {
      setVerificationStep("error")
      toast({
        title: "Gagal Mengirim",
        description: error.message || "Gagal mengirim email verifikasi.",
        variant: "destructive",
      })
    }
  }


  return (
    <div className="min-h-screen bg-muted/40 relative">
      {/* Logo positioned absolutely at top-left with proper spacing */}
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 z-10">
        <GraduationCap className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">BERBISINDO</span>
      </Link>

      {/* Main content container */}
      <div className="flex min-h-screen items-center justify-center p-4 pt-20 md:pt-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Daftar Akun Anda</CardTitle>
            <CardDescription>Buat akun baru untuk mulai belajar bahasa isyarat</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* <div className="space-y-2">
                <Label>Daftar Sebagai</Label>
                <RadioGroup value={role} onValueChange={setRole} className="flex gap-6" disabled={isLoading}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="cursor-pointer">
                      pengguna
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teacher" id="teacher" />
                    <Label htmlFor="teacher" className="cursor-pointer">
                      Pendamping
                    </Label>
                  </div>
                </RadioGroup>
              </div> */}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-800 text-white hover:from-blue-600 hover:to-blue-900"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Daftar Akun"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Sudah memiliki akun?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Masuk di sini
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Email Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Verifikasi Email
            </DialogTitle>
            <DialogDescription>
              {verificationStep === "sending" && "Sedang mengirim email verifikasi..."}
              {verificationStep === "sent" && "Email verifikasi telah dikirim"}
              {verificationStep === "error" && "Gagal mengirim email verifikasi"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 py-4">
            {verificationStep === "sending" && (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                  <Send className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium">Mengirim Email Verifikasi</p>
                  <p className="text-sm text-muted-foreground">Mohon tunggu sebentar...</p>
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </>
            )}

            {verificationStep === "sent" && (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-green-700">Email Berhasil Dikirim!</p>
                  <p className="text-sm text-muted-foreground">Kami telah mengirim email verifikasi ke:</p>
                  <p className="font-medium text-primary">{registrationData?.user.email}</p>
                  <Alert className="border-blue-200 bg-blue-50 text-left">
                    <Mail className="h-4 w-4" />
                    <AlertDescription className="text-blue-700">
                      <strong>Langkah selanjutnya:</strong>
                      <br />
                      1. Buka email Anda
                      <br />
                      2. Klik link verifikasi
                      <br />
                      3. Login ke akun Anda
                    </AlertDescription>
                  </Alert>
                </div>
              </>
            )}

            {verificationStep === "error" && (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-red-700">Gagal Mengirim Email</p>
                  <p className="text-sm text-muted-foreground">Terjadi kesalahan saat mengirim email verifikasi</p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {verificationStep === "sent" && (
              <>
                <Button onClick={handleCloseModal} className="w-full">
                  Lanjut ke Login?
                </Button>
                <Button variant="outline" onClick={handleResendEmail} className="w-full">
                  Kirim Ulang Email
                </Button>
              </>
            )}

            {verificationStep === "error" && (
              <>
                <Button onClick={handleResendEmail} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Coba Kirim Lagi
                </Button>
                <Button variant="outline" onClick={handleCloseModal} className="w-full">
                  Tutup
                </Button>
              </>
            )}

            {verificationStep === "sending" && (
              <Button variant="outline" onClick={() => setShowVerificationModal(false)} className="w-full">
                Tutup
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Tidak menerima email? Periksa folder spam atau{" "}
              <button
                onClick={handleResendEmail}
                className="text-primary hover:underline"
                disabled={verificationStep === "sending"}
              >
                kirim ulang
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
