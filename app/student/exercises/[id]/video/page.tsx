"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Play, Pause, CheckCircle, RotateCcw, Eye } from "lucide-react"
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
  questions: ExerciseQuestion[]
  material: {
    id: number
    title: string
  }
}

export default function ExerciseVideoPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { buildUrl } = useApi()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false)

  useEffect(() => {
    fetchExercise()
  }, [id])

  const fetchExercise = async () => {
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

      const response = await fetch(buildUrl(`/api/exercises/${id}`), {
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

      if (!response.ok) {
        throw new Error("Failed to fetch exercise")
      }

      const data = await response.json()
      setExercise(data)
    } catch (error) {
      console.error("Error fetching exercise:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data exercise",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // SIMPLIFIED: Video URL handling like materials
  const getVideoStreamUrl = (question: ExerciseQuestion) => {
    return buildUrl(`/exercise-video/${exercise?.id}/${question.id}`)
  }

  // SIMPLIFIED: Video event handlers like materials
  const handleVideoPlay = () => {
    setIsPlaying(true)
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    setHasWatchedVideo(true)
  }

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    if (video.currentTime / video.duration >= 0.5) {
      setHasWatchedVideo(true)
    }
  }

  const replayVideo = () => {
    const videoElement = document.querySelector("video") as HTMLVideoElement
    if (videoElement) {
      videoElement.currentTime = 0
      videoElement.play().catch((err) => {
        console.warn("Replay failed:", err)
      })
    }
  }

  const handleVideoNavigation = (index: number) => {
    setCurrentVideoIndex(index)
    setHasWatchedVideo(false)
    setIsPlaying(false)
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

  const getDifficultyText = (level: number) => {
    const labels = ["", "Sangat Mudah", "Mudah", "Sedang", "Sulit", "Sangat Sulit"]
    return labels[level] || "Tidak Diketahui"
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video w-full mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div>
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!exercise || !exercise.questions || exercise.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Video Tidak Tersedia</h1>
          <p className="text-gray-600 mb-6">Exercise ini tidak memiliki video yang dapat ditonton.</p>
          <Link href="/student/exercises">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Exercise
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = exercise.questions[currentVideoIndex]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/student/exercises">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Exercise
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
          <p className="text-gray-600">{exercise.description}</p>
        </div>
        <Badge className={`${getDifficultyColor(exercise.difficulty_level)}`}>
          {getDifficultyText(exercise.difficulty_level)}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Video {currentVideoIndex + 1}: {currentQuestion.material_video?.title}
                </span>
                {hasWatchedVideo && (
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ditonton
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-b-lg overflow-hidden">
                {/* SIMPLIFIED: Video element like materials */}
                <video
                  key={currentVideoIndex} // Force reload when changing videos
                  className="w-full h-full"
                  controls
                  playsInline
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnded}
                  onTimeUpdate={handleVideoTimeUpdate}
                >
                  <source src={getVideoStreamUrl(currentQuestion)} type="video/mp4" />
                  <p className="text-white p-4">Browser Anda tidak mendukung pemutar video.</p>
                </video>
              </div>
            </CardContent>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={replayVideo}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Putar Ulang
                  </Button>
                  {isPlaying ? (
                    <Badge variant="secondary" className="text-blue-600">
                      <Play className="h-3 w-3 mr-1" />
                      Sedang Diputar
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Pause className="h-3 w-3 mr-1" />
                      Dijeda
                    </Badge>
                  )}
                </div>
                {!hasWatchedVideo && (
                  <div className="text-xs text-muted-foreground">💡 Tonton video hingga selesai</div>
                )}
              </div>

              {/* Video Description */}
              {currentQuestion.material_video?.description && (
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-1 text-sm">Deskripsi Video</h4>
                  <p className="text-xs text-muted-foreground">{currentQuestion.material_video.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Preview */}
          <Card className="mt-6 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Soal untuk Video Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted rounded-md mb-4">
                <p className="text-sm font-medium">{currentQuestion.question}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Poin: {currentQuestion.points}</span>
                <Link href={`/student/exercises/${exercise.id}/practice`}>
                  <Button size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Mulai Latihan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video List Sidebar */}
        <div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Daftar Video ({exercise.questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exercise.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    index === currentVideoIndex ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20" : "hover:bg-muted"
                  }`}
                  onClick={() => handleVideoNavigation(index)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Video {index + 1}</span>
                    {index === currentVideoIndex && hasWatchedVideo && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {question.material_video?.title || `Video untuk soal ${index + 1}`}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Exercise Info */}
          <Card className="mt-6 shadow-sm">
            <CardHeader>
              <CardTitle>Tentang Exercise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Materi:</span>
                  <p className="text-sm text-muted-foreground">{exercise.material?.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Total Soal:</span>
                  <p className="text-sm text-muted-foreground">{exercise.questions.length} soal</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Tingkat Kesulitan:</span>
                  <Badge className={`${getDifficultyColor(exercise.difficulty_level)} text-xs ml-2`}>
                    {getDifficultyText(exercise.difficulty_level)}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link href={`/student/exercises/${exercise.id}/practice`}>
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Mulai Latihan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
