"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Mail, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useApi } from "@/hooks/use-api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalState, setModalState] = useState<"sending" | "sent" | "error">("sending")
  const [errorMessage, setErrorMessage] = useState("")
    const { get, post, put, delete: del, buildUrl } = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Email harus diisi",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    setShowModal(true)
    setModalState("sending")
    try {
      const response = await fetch(buildUrl("/api/password/forgot"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setModalState("sent")
        toast({
          title: "Email Terkirim",
          description: "Link reset password telah dikirim ke email Anda",
        })
      } else {
        setModalState("error")
        setErrorMessage(data.message || "Terjadi kesalahan saat mengirim email")
        toast({
          title: "Error",
          description: data.message || "Terjadi kesalahan saat mengirim email",
          variant: "destructive",
        })
      }
    } catch (error) {
      setModalState("error")
      setErrorMessage("Terjadi kesalahan jaringan")
      toast({
        title: "Error",
        description: "Terjadi kesalahan jaringan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    if (modalState === "sent") {
      // Reset form after successful send
      setEmail("")
    }
  }

  const handleRetry = () => {
    setShowModal(false)
    setModalState("sending")
    // Retry the request
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/login" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <CardTitle className="text-2xl font-bold">Lupa Password</CardTitle>
          </div>
          <CardDescription>Masukkan email Anda dan kami akan mengirimkan link untuk reset password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Kirim Link Reset
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Ingat password Anda?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Kembali ke Login
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                Daftar di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {modalState === "sending" && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  Mengirim Email...
                </>
              )}
              {modalState === "sent" && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Email Terkirim!
                </>
              )}
              {modalState === "error" && (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Gagal Mengirim
                </>
              )}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3">
                {modalState === "sending" && (
                  <div className="text-center py-4">
                    <div className="animate-pulse">
                      <Mail className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                      <p>Sedang mengirim link reset password ke:</p>
                      <p className="font-medium text-gray-900">{email}</p>
                    </div>
                  </div>
                )}

                {modalState === "sent" && (
                  <div className="text-center py-4">
                    <Mail className="h-12 w-12 mx-auto text-green-600 mb-3" />
                    <p className="text-green-700 font-medium mb-2">Link reset password berhasil dikirim!</p>
                    <p className="text-sm text-gray-600 mb-4">Kami telah mengirim link reset password ke:</p>
                    <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded">{email}</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Langkah selanjutnya:</strong>
                      </p>
                      <ol className="text-sm text-blue-700 mt-1 text-left">
                        <li>1. Buka email Anda</li>
                        <li>2. Klik link "Reset Password"</li>
                        <li>3. Masukkan password baru</li>
                        <li>4. Login dengan password baru</li>
                      </ol>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Link akan expired dalam 60 menit</p>
                  </div>
                )}

                {modalState === "error" && (
                  <div className="text-center py-4">
                    <XCircle className="h-12 w-12 mx-auto text-red-600 mb-3" />
                    <p className="text-red-700 font-medium mb-2">Gagal mengirim email</p>
                    <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm" onClick={handleCloseModal}>
                        Tutup
                      </Button>
                      <Button size="sm" onClick={handleRetry}>
                        Coba Lagi
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {modalState === "sent" && (
            <div className="flex justify-center gap-2 mt-4">
              <Button onClick={handleCloseModal}>Mengerti</Button>
              <Button variant="outline" asChild>
                <Link href="/login">Kembali ke Login</Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
