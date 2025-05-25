"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, AlertCircle, Video } from "lucide-react"

interface Material {
  id: number
  title: string
}

export default function CreateVideo({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: "",
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)

  useEffect(() => {
    fetchMaterial()
  }, [params.id])

  const fetchMaterial = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/api/materials/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMaterial(data)
      }
    } catch (error) {
      console.error("Error fetching material:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError(null)
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/wmv"]
      if (!allowedTypes.includes(file.type)) {
        setError("Format file tidak didukung. Gunakan MP4, MOV, AVI, atau WMV.")
        return
      }

      // Validate file size (max 200MB)
      const maxSize = 200 * 1024 * 1024 // 200MB
      if (file.size > maxSize) {
        setError("Ukuran file terlalu besar. Maksimal 200MB.")
        return
      }

      setVideoFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const token = localStorage.getItem("token")
      const submitData = new FormData()

      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      if (formData.order) {
        submitData.append("order", formData.order)
      }
      if (videoFile) {
        submitData.append("video", videoFile)
      }

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 201) {
          router.push(`/teacher/materials/${params.id}`)
        } else {
          const errorData = JSON.parse(xhr.responseText)
          setError(errorData.error || "Gagal mengunggah video")
        }
        setLoading(false)
      })

      xhr.addEventListener("error", () => {
        setError("Terjadi kesalahan saat mengunggah video")
        setLoading(false)
      })

      xhr.open("POST", `http://localhost:8000/api/materials/${params.id}/videos`)
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.send(submitData)
    } catch (error) {
      setError("Terjadi kesalahan saat mengunggah video")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/teacher/materials/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Video</h1>
          <p className="text-muted-foreground">Tambah video ke materi: {material?.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Video</CardTitle>
          <CardDescription>Masukkan detail video pembelajaran yang akan ditambahkan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Judul Video *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Masukkan judul video"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Masukkan deskripsi video (opsional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Urutan</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange("order", e.target.value)}
                placeholder="Urutan video (opsional)"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">File Video *</Label>
              <Input
                id="video"
                type="file"
                accept="video/mp4,video/mov,video/avi,video/wmv"
                onChange={handleVideoChange}
                required
              />
              <p className="text-xs text-muted-foreground">Format yang didukung: MP4, MOV, AVI, WMV. Maksimal 200MB.</p>
              {videoFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>{videoFile.name}</span>
                  <span>({(videoFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>

            {loading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mengunggah video...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || !videoFile} className="flex-1">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Mengunggah...
                  </div>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Unggah Video
                  </>
                )}
              </Button>
              <Link href={`/teacher/materials/${params.id}`}>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
