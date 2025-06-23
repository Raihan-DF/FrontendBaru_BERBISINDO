"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { get, post, put, delete: del, buildUrl } = useApi()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "error">("pending")
  const [message, setMessage] = useState("")

  // Check if this is a verification callback
  useEffect(() => {
    const id = searchParams.get("id")
    const hash = searchParams.get("hash")
    const expires = searchParams.get("expires")
    const signature = searchParams.get("signature")

    if (id && hash && expires && signature) {
      verifyEmail(id, hash, expires, signature)
    }
  }, [searchParams])

  const verifyEmail = async (id: string, hash: string, expires: string, signature: string) => {
    setLoading(true)
    try {
      const response = await fetch(buildUrl("/api/email/verify"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: Number.parseInt(id),
          hash,
          expires: Number.parseInt(expires),
          signature,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationStatus("verified")
        setMessage(data.message)
        toast({
          title: "Email Terverifikasi",
          description: "Email Anda berhasil diverifikasi. Anda sekarang dapat login.",
        })

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setVerificationStatus("error")
        setMessage(data.message || "Verifikasi gagal")
        toast({
          title: "Verifikasi Gagal",
          description: data.message || "Terjadi kesalahan saat verifikasi email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationStatus("error")
      setMessage("Terjadi kesalahan saat verifikasi email")
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat verifikasi email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationEmail = async () => {
    if (!email) {
      toast({
        title: "Email Diperlukan",
        description: "Silakan masukkan alamat email Anda",
        variant: "destructive",
      })
      return
    }

    setResendLoading(true)
    try {
      const response = await fetch(buildUrl("/api/email/resend"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Email Terkirim",
          description: "Email verifikasi telah dikirim ulang. Silakan periksa inbox Anda.",
        })
        setMessage("Email verifikasi telah dikirim ulang")
      } else {
        toast({
          title: "Gagal Mengirim",
          description: data.message || "Gagal mengirim email verifikasi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Resend error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim email",
        variant: "destructive",
      })
    } finally {
      setResendLoading(false)
    }
  }

  const checkVerificationStatus = async () => {
    if (!email) return

    try {
      const response = await fetch(buildUrl("/api/email/check-status"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.email_verified) {
        setVerificationStatus("verified")
        setMessage("Email sudah terverifikasi")
        toast({
          title: "Email Terverifikasi",
          description: "Email Anda sudah terverifikasi. Anda dapat login sekarang.",
        })
      }
    } catch (error) {
      console.error("Status check error:", error)
    }
  }

  // Auto-check status when email is entered
  useEffect(() => {
    if (email && email.includes("@")) {
      const timeoutId = setTimeout(() => {
        checkVerificationStatus()
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [email])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">Memverifikasi email Anda...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {verificationStatus === "verified" ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : verificationStatus === "error" ? (
              <AlertCircle className="h-12 w-12 text-red-500" />
            ) : (
              <Mail className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <CardTitle>
            {verificationStatus === "verified"
              ? "Email Terverifikasi!"
              : verificationStatus === "error"
                ? "Verifikasi Gagal"
                : "Verifikasi Email"}
          </CardTitle>
          <CardDescription>
            {verificationStatus === "verified"
              ? "Akun Anda berhasil diverifikasi"
              : verificationStatus === "error"
                ? "Terjadi masalah dengan verifikasi"
                : "Silakan verifikasi alamat email Anda"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert
              className={verificationStatus === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
            >
              <AlertDescription className={verificationStatus === "error" ? "text-red-700" : "text-green-700"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === "verified" ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Anda akan diarahkan ke halaman login dalam beberapa detik...
              </p>
              <Button onClick={() => router.push("/login")} className="w-full">
                Login Sekarang
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button onClick={resendVerificationEmail} disabled={resendLoading || !email} className="w-full">
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Ulang Email Verifikasi"
                )}
              </Button>

              <div className="text-center">
                <Button variant="link" onClick={() => router.push("/login")} className="text-sm">
                  Kembali ke Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
