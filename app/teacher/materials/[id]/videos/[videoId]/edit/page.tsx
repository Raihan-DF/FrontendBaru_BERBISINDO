"use client"

import type React from "react"
import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Video, Upload, CheckCircle, FileVideo } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useApi } from "@/hooks/use-api"

interface VideoData {
  id: number
  title: string
  description: string
  video_filename: string
  video_path: string
  order: number
  created_at: string
}

export default function EditVideo({
  params,
}: {
  params: Promise<{ id: string; videoId: string }>
}) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const { buildUrl } = useApi()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [isCompressing, setIsCompressing] = useState(false)
  const [video, setVideo] = useState<VideoData | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: "",
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [processedFile, setProcessedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isVideoValid, setIsVideoValid] = useState(false)
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    fetchVideo()
  }, [resolvedParams.id, resolvedParams.videoId])

  const fetchVideo = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      const response = await fetch(buildUrl(`/api/materials/${resolvedParams.id}/videos/${resolvedParams.videoId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        })
        localStorage.removeItem("token")
        router.push("/auth/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        setVideo(data)
        setFormData({
          title: data.title,
          description: data.description || "",
          order: data.order?.toString() || "",
        })
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Gagal memuat video")
      }
    } catch (error) {
      console.error("Error fetching video:", error)
      setError("Terjadi kesalahan saat memuat video")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError(null)
  }

  // Enhanced video validation and metadata extraction
  const validateAndProcessVideo = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement("video")
      const url = URL.createObjectURL(file)

      video.preload = "metadata"
      video.muted = true
      video.playsInline = true

      video.onloadedmetadata = () => {
        const metadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        }

        setVideoMetadata(metadata)

        // Check if video is valid (has dimensions and duration)
        const isValid = metadata.width > 0 && metadata.height > 0 && metadata.duration > 0
        setIsVideoValid(isValid)

        if (isValid) {
          setVideoPreview(url)
        } else {
          URL.revokeObjectURL(url)
          setError("File video tidak valid atau corrupt. Silakan pilih file lain.")
        }

        resolve(isValid)
      }

      video.onerror = () => {
        URL.revokeObjectURL(url)
        setError("File video tidak dapat dibaca. Format mungkin tidak didukung.")
        resolve(false)
      }

      video.src = url
    })
  }

  // Simplified high-quality video compression (8 Mbps)
  const compressVideo = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Check MediaRecorder support
      if (!window.MediaRecorder) {
        const renamedFile = new File([file], file.name.replace(/\.[^/.]+$/, ".mp4"), {
          type: "video/mp4",
          lastModified: file.lastModified,
        })
        resolve(renamedFile)
        return
      }

      setIsCompressing(true)
      setCompressionProgress(0)

      const video = videoRef.current || document.createElement("video")
      const canvas = canvasRef.current || document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Canvas context not available"))
        return
      }

      const url = URL.createObjectURL(file)
      video.src = url
      video.muted = true
      video.playsInline = true

      video.onloadedmetadata = () => {
        const { videoWidth, videoHeight, duration } = video

        // Keep original dimensions, just optimize quality
        canvas.width = videoWidth
        canvas.height = videoHeight

        // Create MediaRecorder with high quality settings (8 Mbps)
        const stream = canvas.captureStream(30) // 30 FPS
        let mimeType = "video/mp4"

        // Fallback ke WebM jika MP4 tidak didukung
        if (!MediaRecorder.isTypeSupported("video/mp4")) {
          if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
            mimeType = "video/webm;codecs=vp9"
          } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
            mimeType = "video/webm;codecs=vp8"
          } else {
            mimeType = "video/webm"
          }
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: 8000000, // 8 Mbps for high quality
        })

        const chunks: Blob[] = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType })
          const fileName = file.name.replace(/\.[^/.]+$/, ".mp4")

          const compressedFile = new File([blob], fileName, {
            type: "video/mp4",
            lastModified: Date.now(),
          })

          URL.revokeObjectURL(url)
          setIsCompressing(false)
          resolve(compressedFile)
        }

        mediaRecorder.onerror = (event) => {
          URL.revokeObjectURL(url)
          setIsCompressing(false)
          reject(new Error("Compression failed"))
        }

        // Start recording
        mediaRecorder.start(100)

        let currentTime = 0
        const frameInterval = 1 / 30 // 30 FPS

        const drawFrame = () => {
          if (currentTime >= duration) {
            mediaRecorder.stop()
            return
          }

          video.currentTime = currentTime

          video.onseeked = () => {
            // High quality canvas rendering
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
            ctx.drawImage(video, 0, 0, videoWidth, videoHeight)

            currentTime += frameInterval
            setCompressionProgress((currentTime / duration) * 100)

            setTimeout(drawFrame, 33) // ~30 FPS
          }
        }

        drawFrame()
      }

      video.onerror = () => {
        URL.revokeObjectURL(url)
        setIsCompressing(false)
        reject(new Error("Video processing failed"))
      }
    })
  }

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset states
    setError(null)
    setVideoFile(null)
    setProcessedFile(null)
    setVideoPreview(null)
    setVideoMetadata(null)
    setIsVideoValid(false)

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 500MB.")
      return
    }

    // Enhanced file type checking
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-ms-wmv",
      "video/webm",
      "video/ogg",
    ]

    const fileExtension = file.name.toLowerCase().split(".").pop()
    const supportedExtensions = ["mp4", "mov", "avi", "wmv", "webm", "ogv"]

    const isValidType = allowedTypes.includes(file.type) || supportedExtensions.includes(fileExtension || "")

    if (!isValidType) {
      setError("Format file tidak didukung. Gunakan MP4, MOV, AVI, WMV, WebM, atau OGV.")
      return
    }

    setVideoFile(file)

    try {
      const isValid = await validateAndProcessVideo(file)
      if (!isValid) return

      // Auto-compress for non-MP4 files or large files
      const needsCompression = file.type !== "video/mp4" || file.size > 50 * 1024 * 1024

      if (needsCompression) {
        toast({
          title: "Mengoptimalkan Video",
          description: "Video sedang diproses dengan kualitas tinggi (8 Mbps)...",
        })

        try {
          const processed = await compressVideo(file)
          setProcessedFile(processed)

          toast({
            title: "Video Berhasil Dioptimalkan",
            description: "Video telah diproses dengan kualitas tinggi dan siap diupload.",
          })
        } catch (compressionError) {
          console.error("Compression failed:", compressionError)
          const fallbackFile = new File([file], file.name.replace(/\.[^/.]+$/, ".mp4"), {
            type: "video/mp4",
            lastModified: file.lastModified,
          })
          setProcessedFile(fallbackFile)
          toast({
            title: "Menggunakan File Asli",
            description: "Optimasi gagal, menggunakan file original.",
            variant: "destructive",
          })
        }
      } else {
        setProcessedFile(file)
      }
    } catch (validationError) {
      console.error("Video validation failed:", validationError)
      setError("Gagal memvalidasi video. Silakan coba file lain.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("_method", "PUT") // Laravel method spoofing

      if (formData.order) {
        submitData.append("order", formData.order)
      }

      const fileToUpload = processedFile || videoFile
      if (fileToUpload) {
        submitData.append("video", fileToUpload)
        if (videoMetadata) {
          submitData.append("video_duration", videoMetadata.duration.toString())
          submitData.append("video_width", videoMetadata.width.toString())
          submitData.append("video_height", videoMetadata.height.toString())
        }
        if (processedFile && processedFile !== videoFile) {
          submitData.append("is_processed", "true")
          submitData.append("compression_quality", "high")
        }
      }

      // Create XMLHttpRequest for upload progress
      const xhr = new XMLHttpRequest()

      // Set timeout for large files (10 minutes)
      xhr.timeout = 10 * 60 * 1000

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      // Handle response
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText)
            toast({
              title: "Video berhasil diperbarui",
              description: "Perubahan video telah disimpan.",
            })

            // Clean up preview URL
            if (videoPreview) {
              URL.revokeObjectURL(videoPreview)
            }

            router.push(`/teacher/materials/${resolvedParams.id}`)
          } catch (parseError) {
            setError("Response tidak valid dari server")
          }
        } else if (xhr.status === 401) {
          toast({
            title: "Session Expired",
            description: "Sesi Anda telah berakhir. Silakan login kembali.",
            variant: "destructive",
          })
          localStorage.removeItem("token")
          router.push("/auth/login")
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            setError(errorData.message || errorData.error || "Gagal memperbarui video")
          } catch (parseError) {
            setError(`Server error: ${xhr.status} ${xhr.statusText}`)
          }
        }
        setLoading(false)
      })

      xhr.addEventListener("error", () => {
        setError("Terjadi kesalahan jaringan saat memperbarui video")
        setLoading(false)
      })

      xhr.addEventListener("timeout", () => {
        setError("Upload timeout. File terlalu besar atau koneksi lambat.")
        setLoading(false)
      })

      xhr.open("POST", buildUrl(`/api/materials/${resolvedParams.id}/videos/${resolvedParams.videoId}`))
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.send(submitData)
    } catch (err) {
      console.error("Upload error:", err)
      setError("Terjadi kesalahan saat memperbarui video")
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getFileFormatBadge = (file: File) => {
    const extension = file.name.toLowerCase().split(".").pop()
    const isOptimal = extension === "mp4" || extension === "webm"
    return <Badge variant={isOptimal ? "default" : "secondary"}>{extension?.toUpperCase() || "Unknown"}</Badge>
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }
    }
  }, [videoPreview])

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Memuat data video...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="container mx-auto p-4 md:p-6 space-y-4">
          <Link href={`/teacher/materials/${resolvedParams.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Video tidak ditemukan</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Link href={`/teacher/materials/${resolvedParams.id}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Video</h1>
              <p className="text-muted-foreground">Perbarui informasi video pembelajaran.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="shadow-md backdrop-blur-sm bg-white/80 border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileVideo className="h-5 w-5" />
                  Informasi Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Judul Video</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Contoh: Huruf A dalam Bahasa Isyarat"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi (Opsional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Deskripsi singkat tentang video ini"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="bg-white min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Urutan Video (Opsional)</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    min="0"
                    placeholder="Urutan video dalam materi"
                    value={formData.order}
                    onChange={(e) => handleInputChange("order", e.target.value)}
                    className="bg-white"
                  />
                </div>

                {/* Current Video Info */}
                <div className="space-y-2">
                  <Label>File Video Saat Ini</Label>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Video className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{video.video_filename}</p>
                      <p className="text-xs text-muted-foreground">
                        File saat ini • Dibuat: {new Date(video.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Aktif
                    </Badge>
                  </div>
                </div>

                {/* New Video Upload */}
                <div className="space-y-4">
                  <Label>Ganti File Video (Opsional)</Label>

                  {!videoFile ? (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/webm,video/ogg,.mp4,.mov,.avi,.wmv,.webm,.ogv"
                        onChange={handleVideoChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-primary transition-colors">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            Drag & drop file atau <span className="text-primary underline">pilih file</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            MP4, MOV, AVI, WMV, WebM, OGV (Maks. 500MB)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            💡 Video akan dioptimalkan otomatis dengan kualitas tinggi
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* New Video Info */}
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Video className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">{videoFile.name}</p>
                            {getFileFormatBadge(videoFile)}
                            {isVideoValid && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(videoFile.size)}
                            {videoMetadata && (
                              <>
                                {" "}
                                • {videoMetadata.width}x{videoMetadata.height} •{" "}
                                {formatDuration(videoMetadata.duration)}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Compression Progress */}
                      {isCompressing && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Mengoptimalkan video dengan kualitas tinggi...</span>
                            <span>{Math.round(compressionProgress)}%</span>
                          </div>
                          <Progress value={compressionProgress} className="w-full" />
                        </div>
                      )}

                      {/* Processed File Info */}
                      {processedFile && processedFile !== videoFile && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md border border-green-200">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">
                              Video telah dioptimalkan (Kualitas Tinggi - 8 Mbps)
                            </p>
                            <p className="text-xs text-green-600">
                              Ukuran: {formatFileSize(videoFile.size)} → {formatFileSize(processedFile.size)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Video Preview */}
                      {videoPreview && isVideoValid && (
                        <div className="space-y-2">
                          <Label>Preview Video Baru</Label>
                          <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <video
                              ref={videoRef}
                              src={videoPreview}
                              controls
                              className="w-full h-full object-contain"
                              preload="metadata"
                              playsInline
                              muted
                            >
                              Browser Anda tidak mendukung pemutar video.
                            </video>
                          </div>
                        </div>
                      )}

                      {/* Remove File Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVideoFile(null)
                          setProcessedFile(null)
                          if (videoPreview) {
                            URL.revokeObjectURL(videoPreview)
                            setVideoPreview(null)
                          }
                        }}
                      >
                        Hapus File Baru
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Kosongkan jika tidak ingin mengganti video. File baru akan menggantikan video yang ada.
                  </p>
                </div>

                {/* Upload Progress */}
                {loading && uploadProgress > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {uploadProgress < 100 ? "Mengupload video..." : "Memproses video..."}
                      </span>
                      <span className="text-muted-foreground">
                        {uploadProgress < 100 ? `${Math.round(uploadProgress)}%` : "Hampir selesai..."}
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="w-full h-2" />
                    {uploadProgress >= 100 && (
                      <p className="text-xs text-muted-foreground">Video sedang diproses di server. Mohon tunggu...</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href={`/teacher/materials/${resolvedParams.id}`}>
                <Button variant="outline" disabled={loading || isCompressing}>
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={loading || isCompressing}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : isCompressing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengoptimalkan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Hidden canvas for video processing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}
