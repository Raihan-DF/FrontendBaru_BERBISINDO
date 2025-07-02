"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react"
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
  const [videoCanPlay, setVideoCanPlay] = useState(false)
  const [videoKey, setVideoKey] = useState(0) // Force video reload
  const { get, post, put, delete: del, buildUrl } = useApi()

  useEffect(() => {
    fetchExercise()
  }, [resolvedParams.id])

  // Reset video states when video changes
  useEffect(() => {
    setVideoLoading(true)
    setVideoError(null)
    setVideoCanPlay(false)
    setVideoKey((prev) => prev + 1) // Force video reload
  }, [currentVideoIndex])

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

  // IMPROVED: Better video URL handling for iOS
  const getVideoStreamUrl = (question: ExerciseQuestion) => {
    return buildUrl(`/exercise-video/${exercise?.id}/${question.id}`)
  }

  // IMPROVED: Better error handling for iOS
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const error = video.error

    console.error("Video error:", {
      code: error?.code,
      message: error?.message,
      src: video.src,
      networkState: video.networkState,
      readyState: video.readyState,
    })

    setVideoLoading(false)
    setVideoCanPlay(false)

    let errorMessage = "Video gagal dimuat."
    if (error?.code === 4) {
      errorMessage = "Format video tidak didukung oleh browser Anda."
    } else if (error?.code === 3) {
      errorMessage = "Video rusak atau tidak dapat didekode."
    } else if (error?.code === 2) {
      errorMessage = "Koneksi internet bermasalah."
    }

    setVideoError(errorMessage)
  }

  const handleVideoLoadStart = () => {
    console.log("Video loading started")
    setVideoLoading(true)
    setVideoCanPlay(false)
  }

  const handleVideoCanPlay = () => {
    console.log("Video can play")
    setVideoLoading(false)
    setVideoCanPlay(true)
  }

  const retryVideo = () => {
    setVideoError(null)
    setVideoLoading(true)
    setVideoCanPlay(false)
    setVideoKey((prev) => prev + 1) // Force complete reload

    // Small delay to ensure DOM update
    setTimeout(() => {
      const videoElement = document.querySelector("video") as HTMLVideoElement
      if (videoElement) {
        videoElement.load()
        setTimeout(() => {
          videoElement.play().catch((err) => {
            console.warn("Auto-play failed:", err)
          })
        }, 500)
      }
    }, 100)
  }

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1)
    }
  }

  const handleNextVideo = () => {
    if (exercise && currentVideoIndex < exercise.questions.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
    }
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#3B82F6]" />
          <p className="text-muted-foreground">Memuat video latihan...</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Latihan tidak ditemukan</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Latihan yang Anda cari tidak tersedia.</p>
          <Link href="/student/exercises">
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Latihan
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = exercise.questions[currentVideoIndex]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/student/exercises">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white line-clamp-2">
              {exercise.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getDifficultyColor(exercise.difficulty_level)} text-xs`}>
              {getDifficultyText(exercise.difficulty_level)}
            </Badge>
            <Link href={`/student/exercises/${exercise.id}/practice`}>
              <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-xs sm:text-sm">
                <span className="hidden sm:inline">Mulai Latihan</span>
                <span className="sm:hidden">Latihan</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Video Navigation */}
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            Video {currentVideoIndex + 1} dari {exercise.questions.length}
          </Badge>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousVideo}
              disabled={currentVideoIndex === 0}
              className="h-8 px-2 sm:px-3 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Sebelumnya</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextVideo}
              disabled={currentVideoIndex === exercise.questions.length - 1}
              className="h-8 px-2 sm:px-3 bg-transparent"
            >
              <span className="hidden sm:inline mr-1">Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="mb-3 sm:mb-4">
                <h2 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-1">
                  {currentQuestion.material_video.title}
                </h2>
              </div>

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
                      <p className="text-sm mb-2">{videoError}</p>
                      <Button variant="outline" size="sm" onClick={retryVideo}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Coba Lagi
                      </Button>
                    </div>
                  </div>
                )}

                {/* IMPROVED: Better video element for iOS compatibility */}
                <video
                  key={`${videoKey}-${currentQuestion.id}-${currentQuestion.material_video.id}`}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                  playsInline // Important for iOS
                  webkit-playsinline="true" // Legacy iOS support
                  muted // Helps with autoplay policies
                  x5-video-player-type="h5" // WeChat browser support
                  x5-video-player-fullscreen="true" // WeChat fullscreen
                  x5-video-orientation="portraint" // WeChat orientation
                  onLoadStart={handleVideoLoadStart}
                  onCanPlay={handleVideoCanPlay}
                  onError={handleVideoError}
                  crossOrigin="anonymous"
                  style={{ backgroundColor: "#000" }}
                >
                  <source src={getVideoStreamUrl(currentQuestion)} type="video/mp4" />
                  <p className="text-white p-4">Browser Anda tidak mendukung pemutar video.</p>
                </video>
              </div>

              {currentQuestion.material_video.description && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-slate-700 rounded-md">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Deskripsi Video</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {currentQuestion.material_video.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Video List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-3">Daftar Video</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {exercise.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      index === currentVideoIndex
                        ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                        : "hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {question.order}. {question.material_video.title}
                    </div>
                    <div className="text-xs opacity-75 mt-1">{question.points} poin</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Link href={`/student/exercises/${exercise.id}/practice`} className="block">
              <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] h-12 text-sm sm:text-base">
                Mulai Mengerjakan Latihan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
