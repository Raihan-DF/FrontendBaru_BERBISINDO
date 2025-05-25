"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Edit, Plus, Play, Trash2, AlertCircle, Calendar, Users } from "lucide-react"

interface Material {
  id: number
  title: string
  description: string
  thumbnail: string | null
  difficulty_level: number
  is_published: boolean
  created_at: string
  creator: {
    id: number
    name: string
  }
  videos: Video[]
}

interface Video {
  id: number
  title: string
  description: string
  video_filename: string
  order: number
  created_at: string
  video_url: string
  stream_url: string
}

export default function MaterialDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } else {
        setError("Gagal memuat materi")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memuat materi")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus video ini?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/api/materials/${params.id}/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        fetchMaterial() // Refresh data
      } else {
        alert("Gagal menghapus video")
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus video")
    }
  }

  const getDifficultyLabel = (level: number) => {
    const labels = ["", "Pemula", "Dasar", "Menengah", "Lanjut", "Ahli"]
    return labels[level] || "Unknown"
  }

  const getDifficultyColor = (level: number) => {
    const colors = [
      "",
      "bg-green-100 text-green-800",
      "bg-blue-100 text-blue-800",
      "bg-yellow-100 text-yellow-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
    ]
    return colors[level] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="space-y-4">
        <Link href="/teacher/materials">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Materi tidak ditemukan"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/teacher/materials">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{material.title}</h1>
            <p className="text-muted-foreground">Detail materi pembelajaran</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/teacher/materials/${material.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Materi
            </Button>
          </Link>
          <Link href={`/teacher/materials/${material.id}/videos/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Video
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Materi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {material.thumbnail && (
                <div className="aspect-video rounded-md overflow-hidden">
                  <img
                    src={`http://localhost:8000/storage/${material.thumbnail}`}
                    alt={material.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(material.difficulty_level)}>
                    {getDifficultyLabel(material.difficulty_level)}
                  </Badge>
                  {!material.is_published && <Badge variant="secondary">Draft</Badge>}
                </div>

                <p className="text-sm text-muted-foreground">{material.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{material.videos.length} video</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(material.created_at)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Dibuat oleh:</span> {material.creator.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Video ({material.videos.length})</CardTitle>
              <CardDescription>Video pembelajaran dalam materi ini</CardDescription>
            </CardHeader>
            <CardContent>
              {material.videos.length === 0 ? (
                <div className="text-center py-8">
                  <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Belum ada video</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mulai dengan menambahkan video pembelajaran pertama
                  </p>
                  <Link href={`/teacher/materials/${material.id}/video/create`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Video
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {material.videos.map((video, index) => (
                    <div key={video.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{video.title}</h4>
                        {video.description && (
                          <p className="text-sm text-muted-foreground truncate">{video.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {video.video_filename} • {formatDate(video.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/teacher/materials/${material.id}/video/${video.id}`}>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/teacher/materials/${material.id}/video/${video.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVideo(video.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
