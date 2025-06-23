"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useApi } from "@/hooks/use-api"

interface MaterialVideo {
  id: number
  title: string
  description: string
  video_filename: string
  video_path: string
  order: number
}

interface ExerciseQuestion {
  id: number
  exercise_id: number
  material_video_id: number
  question: string
  points: number
  order: number
  material_video: MaterialVideo
}

interface Exercise {
  id: number
  title: string
  description: string
  material_id: number
  difficulty_level: number
  total_questions: number
  total_points: number
  creator: {
    id: number
    name: string
  }
  material: {
    id: number
    title: string
  }
  questions: ExerciseQuestion[]
}

export default function ExerciseVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { toast } = useToast()
  const router = useRouter()
  const resolvedParams = use(params)
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)
  const { get, post, put, delete: del, buildUrl } = useApi()

  useEffect(() => {
    fetchExercise()
  }, [resolvedParams.id])

  const fetchExercise = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const response = await fetch(buildUrl(`/api/exercises/${resolvedParams.id}`), {
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
        router.push("/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        setExercise(data)
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data latihan",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching exercise:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // PERBAIKAN: Menggunakan route web yang sama seperti material video
  const getVideoStreamUrl = (question: ExerciseQuestion) => {
    // Menggunakan route web yang sudah dibuat khusus untuk exercise video
    return buildUrl(`/exercise-video/${exercise?.id}/${question.id}`)
  }

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1)
      setVideoLoading(true)
      setVideoError(null)
    }
  }

  const handleNextVideo = () => {
    if (exercise && currentVideoIndex < exercise.questions.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
      setVideoLoading(true)
      setVideoError(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Latihan tidak ditemukan</h3>
        <Link href="/student/exercises">
          <Button>Kembali ke Daftar Latihan</Button>
        </Link>
      </div>
    )
  }

  const currentQuestion = exercise.questions[currentVideoIndex]

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/exercises">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{exercise.title}</h1>
          <p className="text-muted-foreground">Tonton video pembelajaran sebelum mengerjakan latihan</p>
        </div>
        <Link href={`/student/exercises/${exercise.id}/practice`}>
          <Button className="bg-gradient-to-br from-blue-500 to-blue-600">
            <BookOpen className="mr-2 h-4 w-4" />
            Mulai Latihan
          </Button>
        </Link>
      </div>

      {/* Video Navigation */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Video {currentVideoIndex + 1} dari {exercise.questions.length}
        </Badge>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousVideo} disabled={currentVideoIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextVideo}
            disabled={currentVideoIndex === exercise.questions.length - 1}
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{currentQuestion.material_video.title}</CardTitle>
              <CardDescription>
                Soal {currentQuestion.order}: {currentQuestion.question}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-md bg-black flex items-center justify-center relative overflow-hidden">
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p className="text-sm">Memuat video...</p>
                    </div>
                  </div>
                )}

                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="flex flex-col items-center gap-2 text-white text-center p-4">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm">{videoError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVideoError(null)
                          setVideoLoading(true)
                          const videoElement = document.querySelector("video") as HTMLVideoElement
                          if (videoElement) {
                            videoElement.load()
                          }
                        }}
                      >
                        Coba Lagi
                      </Button>
                    </div>
                  </div>
                )}

                <video
                  key={`${currentQuestion.id}-${currentQuestion.material_video.id}`}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                  onLoadStart={() => {
                    console.log("⏳ Exercise video loading started")
                    setVideoLoading(true)
                  }}
                  onCanPlay={() => {
                    console.log("✅ Exercise video can play")
                    setVideoLoading(false)
                  }}
                  onError={(e) => {
                    console.error("🚫 Exercise video error:", e)
                    setVideoError("Video gagal dimuat. Periksa koneksi internet Anda.")
                    setVideoLoading(false)
                  }}
                  crossOrigin="anonymous"
                >
                  <source src={getVideoStreamUrl(currentQuestion)} type="video/mp4" />
                  <p className="text-white p-4">Browser Anda tidak mendukung pemutar video.</p>
                </video>
              </div>

              {currentQuestion.material_video.description && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Deskripsi Video</h4>
                  <p className="text-sm text-muted-foreground">{currentQuestion.material_video.description}</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Exercise Info */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Info Latihan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Soal</span>
                <span className="text-sm font-medium">{exercise.total_questions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Poin</span>
                <span className="text-sm font-medium">{exercise.total_points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tingkat Kesulitan</span>
                <Badge variant="secondary">{exercise.difficulty_level}/5</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Material</span>
                <span className="text-sm font-medium">{exercise.material.title}</span>
              </div>
            </CardContent>
          </Card> */}

          {/* Video List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 ">
                {exercise.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => {
                      setCurrentVideoIndex(index)
                      setVideoLoading(true)
                      setVideoError(null)
                    }}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      index === currentVideoIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium text-sm ">
                      {question.order}. {question.material_video.title}
                    </div>
                    <div className="text-xs opacity-75 mt-1">{question.points} poin</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Link href={`/student/exercises/${exercise.id}/practice`} className="block">
            <Button className="w-full bg-gradient-to-br from-blue-500 to-blue-600" size="lg">
              <BookOpen className="mr-2 h-4 w-4" />
              Mulai Mengerjakan Latihan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
