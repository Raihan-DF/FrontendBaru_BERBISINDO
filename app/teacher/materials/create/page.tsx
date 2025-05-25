"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function CreateMaterial() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty_level: "",
    is_published: false,
  })
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError(null)
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      const reader = new FileReader()
      reader.onload = (e) => setThumbnailPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("difficulty_level", formData.difficulty_level)
      submitData.append("is_published", formData.is_published ? "1" : "0")
      if (thumbnail) submitData.append("thumbnail", thumbnail)

      const response = await fetch("http://localhost:8000/api/materials", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: submitData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Folder materi berhasil dibuat",
          description: "Folder materi telah berhasil dibuat. Anda dapat menambahkan video ke dalamnya.",
        })
        router.push(`/teacher/materials/${data.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Gagal membuat materi")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat membuat materi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/materials">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Folder Materi Baru</h1>
          <p className="text-muted-foreground">
            Buat folder materi baru untuk mengelompokkan video bahasa isyarat.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Judul Folder</Label>
              <Input
                id="title"
                name="title"
                placeholder="Contoh: Bahasa Isyarat Huruf"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Deskripsi singkat tentang folder materi ini"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => handleInputChange("difficulty_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tingkat kesulitan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Pemula</SelectItem>
                  <SelectItem value="2">Dasar</SelectItem>
                  <SelectItem value="3">Menengah</SelectItem>
                  <SelectItem value="4">Lanjut</SelectItem>
                  <SelectItem value="5">Ahli</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Thumbnail Folder</Label>
              <Input type="file" accept="image/*" onChange={handleThumbnailChange} />
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  className="mt-2 aspect-video w-full max-w-md rounded-md border object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drag & drop file atau <span className="cursor-pointer text-primary underline">pilih file</span>
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG atau GIF (Maks. 2MB)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => handleInputChange("is_published", checked)}
              />
              <Label htmlFor="published">Publikasikan materi setelah dibuat</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/teacher/materials">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Buat Folder"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
