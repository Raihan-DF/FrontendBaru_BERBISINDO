"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FolderPlus, Plus, Search, Calendar, Users, Eye } from "lucide-react"

interface Material {
  id: number
  title: string
  description: string
  thumbnail: string | null
  difficulty_level: number
  is_published: boolean
  created_at: string
  videos_count: number
  creator: {
    id: number
    name: string
  }
}

export default function TeacherMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/api/materials", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMaterials(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching materials:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMaterials = materials.filter((material) =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getFilteredMaterials = () => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    switch (activeTab) {
      case "recent":
        return filteredMaterials.filter((material) => new Date(material.created_at) > oneWeekAgo)
      case "popular":
        return filteredMaterials.sort((a, b) => b.videos_count - a.videos_count)
      default:
        return filteredMaterials
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
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 hari yang lalu"
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`
    return `${Math.ceil(diffDays / 30)} bulan yang lalu`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Materi Pembelajaran</h1>
        <p className="text-muted-foreground">Kelola materi pembelajaran bahasa isyarat untuk siswa Anda.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari materi..."
            className="w-full bg-background pl-8 md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/teacher/materials/create">
          <Button>
            <FolderPlus className="mr-2 h-4 w-4" />
            Buat Materi Baru
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua Materi</TabsTrigger>
          <TabsTrigger value="recent">Terbaru</TabsTrigger>
          <TabsTrigger value="popular">Terpopuler</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredMaterials().map((material) => (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-2">{material.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{material.description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getDifficultyColor(material.difficulty_level)}>
                        {getDifficultyLabel(material.difficulty_level)}
                      </Badge>
                      {!material.is_published && (
                        <Badge variant="secondary" className="text-xs">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted mb-3 overflow-hidden">
                    {material.thumbnail ? (
                      <img
                        src={`http://localhost:8000/storage/${material.thumbnail}`}
                        alt={material.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{material.videos_count} video</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(material.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/teacher/materials/${material.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat
                    </Button>
                  </Link>
                  <Link href={`/teacher/materials/${material.id}/video/create`}>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Video
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {getFilteredMaterials().length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Tidak ada materi ditemukan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm
                  ? "Coba ubah kata kunci pencarian Anda"
                  : "Mulai dengan membuat materi pembelajaran pertama Anda"}
              </p>
              {!searchTerm && (
                <Link href="/teacher/materials/create">
                  <Button>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Buat Materi Baru
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
