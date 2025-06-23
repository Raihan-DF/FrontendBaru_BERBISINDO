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

interface QuizQuestion {
  id: number
  quiz_id: number
  material_video_id: number
  question: string
  points: number
  order: number
  material_video: MaterialVideo
}

interface Quiz {
  id: number
  title: string
  description: string
  material_id: number
  difficulty_level: number
  total_questions: number
  total_points: number
  time_limit: number
  creator: {
    id: number
    name: string
  }
  material: {
    id: number
    title: string
  }
  questions: QuizQuestion[]
}

export default function QuizVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { toast } = useToast()
  const router = useRouter()
  const resolvedParams = use(params)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)
  const { get, post, put, delete: del, buildUrl } = useApi();

  useEffect(() => {
    fetchQuiz()
  }, [resolvedParams.id])

  const fetchQuiz = async () => {
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

      const response = await fetch(buildUrl(`/api/quizzes/${resolvedParams.id}`), {
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

        // Pastikan questions adalah array
        if (data && data.questions && !Array.isArray(data.questions)) {
          data.questions = Object.values(data.questions)
        }

        setQuiz(data)
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data quiz",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching quiz:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Menggunakan route web yang sama seperti exercise video
  const getVideoStreamUrl = (question: QuizQuestion) => {
    // Jika quiz menggunakan struktur yang sama dengan exercise
    return buildUrl(`/quiz-video/${quiz?.id}/${question.id}`)
  }

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1)
      setVideoLoading(true)
      setVideoError(null)
    }
  }

  const handleNextVideo = () => {
    if (quiz && currentVideoIndex < quiz.questions.length - 1) {
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

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Quiz tidak ditemukan</h3>
        <Link href="/student/quizzes">
          <Button>Kembali ke Daftar Quiz</Button>
        </Link>
      </div>
    )
  }

  // Cek apakah quiz memiliki video
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Quiz tidak memiliki video pembelajaran</h3>
        <p className="text-sm text-muted-foreground mb-4">Langsung mulai mengerjakan quiz</p>
        <div className="flex gap-2 justify-center">
          <Link href="/student/quizzes">
            <Button variant="outline">Kembali ke Daftar Quiz</Button>
          </Link>
          <Link href={`/student/quizzes/${quiz.id}/attempt`}>
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Mulai Quiz
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentVideoIndex]

  // Jika question tidak memiliki material_video, tampilkan pesan
  if (!currentQuestion.material_video) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Video tidak tersedia untuk soal ini</h3>
        <p className="text-sm text-muted-foreground mb-4">Langsung mulai mengerjakan quiz</p>
        <div className="flex gap-2 justify-center">
          <Link href="/student/quizzes">
            <Button variant="outline">Kembali ke Daftar Quiz</Button>
          </Link>
          <Link href={`/student/quizzes/${quiz.id}/attempt`}>
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Mulai Quiz
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/quizzes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-muted-foreground">Tonton video pembelajaran sebelum mengerjakan quiz</p>
        </div>
        <Link href={`/student/quizzes/${quiz.id}/attempt`}>
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Mulai Quiz
          </Button>
        </Link>
      </div>

      {/* Video Navigation */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Video {currentVideoIndex + 1} dari {quiz.questions.length}
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
            disabled={currentVideoIndex === quiz.questions.length - 1}
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
                    console.log("⏳ Quiz video loading started")
                    setVideoLoading(true)
                  }}
                  onCanPlay={() => {
                    console.log("✅ Quiz video can play")
                    setVideoLoading(false)
                  }}
                  onError={(e) => {
                    console.error("🚫 Quiz video error:", e)
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

              {/* Debug Info - Remove in production */}
              {/* <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
                <p>
                  <strong>Debug Info:</strong>
                </p>
                <p>Video URL: {getVideoStreamUrl(currentQuestion)}</p>
                <p>Question ID: {currentQuestion.id}</p>
                <p>Material Video ID: {currentQuestion.material_video.id}</p>
                <p>Video Filename: {currentQuestion.material_video.video_filename}</p>
              </div> */}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Info Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Soal</span>
                <span className="text-sm font-medium">{quiz.total_questions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Poin</span>
                <span className="text-sm font-medium">{quiz.total_points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Batas Waktu</span>
                <span className="text-sm font-medium">{quiz.time_limit} menit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tingkat Kesulitan</span>
                <Badge variant="secondary">{quiz.difficulty_level}/5</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Materi</span>
                <span className="text-sm font-medium">{quiz.material.title}</span>
              </div>
            </CardContent>
          </Card>

          {/* Video List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quiz.questions.map((question, index) => (
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
                    <div className="font-medium text-sm">
                      {question.order}. {question.material_video?.title || "Video tidak tersedia"}
                    </div>
                    <div className="text-xs opacity-75 mt-1">{question.points} poin</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Link href={`/student/quizzes/${quiz.id}/attempt`} className="block">
            <Button className="w-full" size="lg">
              <BookOpen className="mr-2 h-4 w-4" />
              Mulai Mengerjakan Quiz
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
