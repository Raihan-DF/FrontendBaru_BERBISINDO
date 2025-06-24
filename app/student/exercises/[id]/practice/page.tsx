"use client"

import type React from "react"
import { useApi } from "@/hooks/use-api"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Clock,
  Play,
  Pause,
  RepeatIcon as Replay,
  Loader2,
  AlertCircle,
  Trophy,
  Target,
  Award,
  RefreshCw,
} from "lucide-react"

interface ExerciseOption {
  id: number
  option_text: string
  is_correct?: boolean
  order: number
}

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
  options: ExerciseOption[]
}

interface Exercise {
  id: number
  title: string
  description: string
  material_id: number
  difficulty_level: number
  is_published: boolean
  created_at: string
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
  is_completed?: boolean
  score?: number
  attempt_count?: number
  current_progress?: {
    current_question_index: number
    answered_questions: number
    can_continue: boolean
  }
}

interface FeedbackResponse {
  question_id: number
  selected_option: {
    id: number
    text: string
    is_correct: boolean
  }
  correct_option: {
    id: number
    text: string
  }
  is_correct: boolean
  points_earned: number
  max_points: number
  explanation: string
  is_last_question: boolean
  current_progress: {
    answered_questions: number
    total_questions: number
    current_score: number
    max_score: number
    next_question_index?: number
  }
  final_results?: {
    total_score: number
    max_score: number
    percentage: number
    correct_answers: number
    total_questions: number
    message: string
    time_taken: number
    attempt_number: number
  }
}

export default function ExercisePracticePage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  // Exercise data
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)

  // Question flow
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Feedback and completion
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showFinalResults, setShowFinalResults] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Time tracking
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Video states
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false)

  // Progress tracking state
  const [isNewAttempt, setIsNewAttempt] = useState(false)
  const [progressData, setProgressData] = useState<any>(null)
  const {buildUrl} = useApi()

  // Initialize exercise
  useEffect(() => {
    fetchExercise()
    setStartTime(new Date())
  }, [id])

  // Timer effect
  useEffect(() => {
    if (startTime && !showFinalResults) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [startTime, showFinalResults])

  // Reset video states when question changes
  useEffect(() => {
    setVideoLoading(true)
    setVideoError(null)
    setHasWatchedVideo(false)
    setIsVideoPlaying(false)
  }, [currentQuestionIndex])


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

      console.log("🚀 Fetching exercise with ID:", id)

      const url = buildUrl(`/api/exercises/${id}`)
      console.log("📡 Request URL:", url)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      console.log("📥 Response status:", response.status)

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
        const errorText = await response.text()
        console.error("❌ Response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Exercise data received:", data)
      console.log("📊 Total questions:", data.questions?.length || 0)

      // Validasi data exercise
      if (!data.questions || data.questions.length === 0) {
        throw new Error("Exercise tidak memiliki soal yang tersedia")
      }

      // Calculate total questions and points dynamically
      data.total_questions = data.questions.length
      data.total_points = data.questions.reduce((sum: number, q: ExerciseQuestion) => sum + (q.points || 10), 0)

      setExercise(data)

      // Cek progress dari backend untuk menentukan starting point
      await checkExerciseProgress(data.id)
    } catch (error) {
      console.error("💥 Error fetching exercise:", error)

      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data"

      if (error instanceof TypeError && errorMessage.includes("Failed to fetch")) {
        toast({
          title: "Koneksi Gagal",
          description: "Tidak dapat terhubung ke server. Pastikan backend Laravel berjalan",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // PERBAIKAN: Method untuk check progress dengan logika yang lebih baik
  const checkExerciseProgress = async (exerciseId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(buildUrl(`/api/exercises/${exerciseId}/progress`), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const progressData = await response.json()
        console.log("📊 Progress data:", progressData)
        setProgressData(progressData)

        // PERBAIKAN: Logika yang lebih tepat untuk menentukan status
        if (progressData.is_completed) {
          console.log("✅ Exercise was previously completed")
          // Jangan langsung set sebagai completed, biarkan user memulai ulang
          setIsCompleted(false)
          setCurrentQuestionIndex(0)

          // Tampilkan info bahwa exercise sudah pernah diselesaikan
          toast({
            title: "Exercise Sudah Pernah Diselesaikan",
            description: "Anda dapat mengulang exercise ini. Klik 'Ulangi Latihan' untuk memulai dari awal.",
            variant: "default",
          })
        } else if (progressData.answered_questions > 0 && !progressData.is_completed) {
          // PERBAIKAN: Gunakan current_question_index dari backend jika tersedia
          const nextQuestionIndex = progressData.current_question_index ?? progressData.answered_questions
          console.log("📍 Continuing from question:", nextQuestionIndex + 1)

          if (exercise?.questions) {
            const maxIndex = exercise.questions.length - 1
            setCurrentQuestionIndex(Math.min(nextQuestionIndex, Math.max(0, maxIndex)))
          } else {
            setCurrentQuestionIndex(Math.min(nextQuestionIndex, 0))
          }

          toast({
            title: "Melanjutkan Progress",
            description: `Melanjutkan dari soal ${nextQuestionIndex + 1}`,
            variant: "default",
          })
        } else {
          console.log("🆕 Starting fresh from question 1")
          setCurrentQuestionIndex(0)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan"
      console.error("Error checking progress:", error)
      // Don't show toast for progress check errors, just log them
      console.warn("Progress check failed, starting from beginning")
      setCurrentQuestionIndex(0)
    }
  }

  const getVideoStreamUrl = (question: ExerciseQuestion) => {
    // Use simple endpoint like in the working quiz version
    return buildUrl(`/exercise-video/${exercise?.id}/${question.id}`)
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const error = video.error

    console.error("🚫 Video error:", {
      code: error?.code,
      message: error?.message,
      src: video.src,
    })

    setVideoLoading(false)
    setVideoError("Video gagal dimuat. Periksa koneksi internet Anda.")
  }

  const retryVideo = () => {
    setVideoError(null)
    setVideoLoading(true)

    const videoElement = document.querySelector("video") as HTMLVideoElement
    if (videoElement) {
      videoElement.load()
    }
  }

  const handleVideoPlay = () => {
    setIsVideoPlaying(true)
  }

  const handleVideoPause = () => {
    setIsVideoPlaying(false)
  }

  const handleVideoEnded = () => {
    setIsVideoPlaying(false)
    setHasWatchedVideo(true)
  }

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    // Mark as watched if user has watched at least 50% of the video
    if (video.currentTime / video.duration >= 0.5) {
      setHasWatchedVideo(true)
    }
  }

  const replayVideo = () => {
    const videoElement = document.querySelector("video") as HTMLVideoElement
    if (videoElement) {
      videoElement.currentTime = 0
      videoElement.play()
    }
  }

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !exercise) return

    if (!hasWatchedVideo) {
      toast({
        title: "Tonton Video Terlebih Dahulu",
        description: "Disarankan untuk menonton video sebelum menjawab soal.",
        variant: "default",
      })
    }

    setIsSubmitting(true)
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

      const currentQuestion = exercise.questions[currentQuestionIndex]
      const url = buildUrl(`/api/exercises/${id}/questions/${currentQuestion.id}/answer`)

      console.log("📤 Submitting answer to:", url)
      console.log("📤 Question ID:", currentQuestion.id)
      console.log("📤 Selected option:", selectedOption)
      console.log("📤 Current question index:", currentQuestionIndex)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          selected_option_id: Number.parseInt(selectedOption),
          current_question_index: currentQuestionIndex, // Kirim index untuk tracking
        }),
      })

      console.log("📥 Submit response status:", response.status)

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
        const feedbackData = await response.json()
        console.log("✅ Feedback received:", feedbackData)

        setFeedback(feedbackData)
        setShowFeedback(true)

        // PERBAIKAN: Update elapsed time untuk final results
        if (feedbackData.final_results) {
          feedbackData.final_results.time_taken = elapsedTime
        }

        // PERBAIKAN: Cek apakah ini benar-benar soal terakhir
        console.log("🔍 Is last question check:", {
          is_last_question: feedbackData.is_last_question,
          current_index: currentQuestionIndex,
          total_questions: exercise.questions.length,
          answered_questions: feedbackData.current_progress?.answered_questions,
        })
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        console.error("❌ Submit error:", errorData)

        toast({
          title: "Error",
          description: errorData.message || "Gagal mengirim jawaban",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan"
      console.error("Error:", error)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    if (feedback?.is_last_question) {
      // Don't proceed to next question if it's the last one
      console.log("🛑 This is the last question, not proceeding to next")
      return
    }

    // PERBAIKAN: Gunakan next_question_index dari feedback atau increment manual
    const nextIndex = feedback?.current_progress?.next_question_index ?? currentQuestionIndex + 1

    console.log("➡️ Moving to next question:", {
      current_index: currentQuestionIndex,
      next_index: nextIndex,
      total_questions: exercise!.questions.length,
      feedback_next_index: feedback?.current_progress?.next_question_index,
    })

    if (nextIndex < exercise!.questions.length) {
      setCurrentQuestionIndex(nextIndex)
      setSelectedOption("")
      setShowFeedback(false)
      setFeedback(null)
    } else {
      console.log("🏁 Reached end of questions")
    }
  }

  const handleShowFinalResults = () => {
    console.log("🏆 Showing final results")
    setShowFinalResults(true)
    setIsCompleted(true)
  }

  // PERBAIKAN: Reset exercise dengan proper cleanup
  const resetExercise = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔄 Resetting exercise...")

      const response = await fetch(buildUrl(`/api/exercises/${id}/reset`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        console.log("✅ Exercise reset successful")

        // PERBAIKAN: Reset semua states dengan benar
        setCurrentQuestionIndex(0)
        setSelectedOption("")
        setShowFeedback(false)
        setFeedback(null)
        setIsCompleted(false)
        setShowFinalResults(false)
        setStartTime(new Date())
        setElapsedTime(0)
        setHasWatchedVideo(false)
        setIsNewAttempt(true)
        setProgressData(null)

        // PERBAIKAN: Refresh exercise data setelah reset
        await fetchExercise()

        toast({
          title: "Latihan Direset",
          description: "Anda dapat memulai latihan dari awal.",
        })
      } else {
        const errorData = await response.json()
        console.error("❌ Reset failed:", errorData)
        toast({
          title: "Error",
          description: errorData.message || "Gagal mereset latihan",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan"
      console.error("Error:", error)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800"
      case 2:
        return "bg-blue-100 text-blue-800"
      case 3:
        return "bg-yellow-100 text-yellow-800"
      case 4:
        return "bg-orange-100 text-orange-800"
      case 5:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1:
        return "Mudah"
      case 2:
        return "Sedang"
      case 3:
        return "Menengah"
      case 4:
        return "Sulit"
      case 5:
        return "Sangat Sulit"
      default:
        return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Latihan tidak ditemukan</h3>
        <p className="text-sm text-muted-foreground mb-4">Latihan yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link href="/student/exercises">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Latihan
          </Button>
        </Link>
      </div>
    )
  }

  // Check if exercise has no questions or only one question when it should have more
  if (exercise.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Tidak ada soal tersedia</h3>
        <p className="text-sm text-muted-foreground mb-4">Latihan ini belum memiliki soal yang dapat dikerjakan.</p>
        <Link href="/student/exercises">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Latihan
          </Button>
        </Link>
      </div>
    )
  }

  // Show warning if questions seem incomplete
  if (exercise.total_questions > exercise.questions.length) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Data Latihan Tidak Lengkap</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Latihan ini seharusnya memiliki {exercise.total_questions} soal, tetapi hanya {exercise.questions.length} soal
          yang tersedia.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={resetExercise}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Muat Ulang Latihan
          </Button>
          <Link href="/student/exercises">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Latihan
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = exercise.questions[currentQuestionIndex]

  // Safety check for current question
  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Soal tidak ditemukan</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Soal pada index {currentQuestionIndex} tidak tersedia. Total soal: {exercise.questions.length}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setCurrentQuestionIndex(0)}>Kembali ke Soal Pertama</Button>
          <Button onClick={resetExercise} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Muat Ulang Latihan
          </Button>
        </div>
      </div>
    )
  }

  const progressPercentage = feedback?.current_progress
    ? (feedback.current_progress.answered_questions / feedback.current_progress.total_questions) * 100
    : ((currentQuestionIndex + (showFeedback ? 1 : 0)) / exercise.questions.length) * 100

  // Final Results Screen
  if (showFinalResults && feedback?.final_results) {
    const results = feedback.final_results
    const isPassingGrade = results.percentage >= 70

    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4">
          <Link href="/student/exercises">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Latihan Selesai</h1>
        </div>

        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isPassingGrade ? (
                <div className="p-4 bg-green-100 rounded-full">
                  <Trophy className="h-12 w-12 text-green-600" />
                </div>
              ) : (
                <div className="p-4 bg-orange-100 rounded-full">
                  <Target className="h-12 w-12 text-orange-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">{results.message}</CardTitle>
            <CardDescription className="text-lg">
              {exercise.title} • Percobaan ke-{results.attempt_number}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Score Overview */}
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{results.total_score}</div>
                <div className="text-sm text-blue-600 font-medium">Skor Total</div>
                <div className="text-xs text-muted-foreground">dari {results.max_score}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{results.percentage}%</div>
                <div className="text-sm text-green-600 font-medium">Persentase</div>
                <div className="text-xs text-muted-foreground">{isPassingGrade ? "Lulus" : "Belum Lulus"}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {results.correct_answers}/{results.total_questions}
                </div>
                <div className="text-sm text-purple-600 font-medium">Jawaban Benar</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((results.correct_answers / results.total_questions) * 100)}% akurasi
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {formatTime(results.time_taken || elapsedTime)}
                </div>
                <div className="text-sm text-orange-600 font-medium">Waktu</div>
                <div className="text-xs text-muted-foreground">Total waktu</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress Penyelesaian</span>
                <span>
                  {results.correct_answers}/{results.total_questions} benar
                </span>
              </div>
              <Progress value={(results.correct_answers / results.total_questions) * 100} className="h-3" />
            </div>

            {/* Achievement Badge */}
            {isPassingGrade && (
              <div className="text-center mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">Selamat! Anda telah lulus latihan ini</p>
                <p className="text-sm text-green-600">Skor Anda melebihi batas kelulusan 70%</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link href="/student/exercises">
                <Button variant="outline" className="w-full md:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Daftar Latihan
                </Button>
              </Link>
              <Link href={`/student/exercises/${exercise.id}/video`}>
                <Button variant="outline" className="w-full md:w-auto">
                  <Eye className="mr-2 h-4 w-4" />
                  Tonton Video Lagi
                </Button>
              </Link>
              <Button onClick={resetExercise} className="w-full md:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" />
                Ulangi Latihan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/exercises">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{exercise.title}</h1>
          <p className="text-muted-foreground">Tonton video dan jawab pertanyaan yang diberikan</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(exercise.difficulty_level)}>
            {getDifficultyText(exercise.difficulty_level)}
          </Badge>
          <Link href={`/student/exercises/${exercise.id}/video`}>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Lihat Semua Video
            </Button>
          </Link>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          Debug: Question {currentQuestionIndex + 1}/{exercise.questions.length} | Total Expected:{" "}
          {exercise.total_questions} | Questions Loaded: {exercise.questions.length} | Progress:{" "}
          {progressData?.answered_questions || 0} answered, completed: {progressData?.is_completed ? "Yes" : "No"}
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Progress Latihan</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(elapsedTime)}
            </span>
            <span>
              {feedback?.current_progress?.answered_questions ||
                (showFeedback ? currentQuestionIndex + 1 : currentQuestionIndex)}{" "}
              / {exercise.questions.length}
            </span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question Info */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Soal {currentQuestionIndex + 1} dari {exercise.questions.length}
        </Badge>
        <div className="text-sm text-muted-foreground">{currentQuestion.points} poin</div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Video Player */}
        <div className="order-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Video: {currentQuestion.material_video.title}</span>
                {hasWatchedVideo && (
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ditonton
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Tonton video ini untuk menjawab soal {currentQuestion.order}</CardDescription>
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
                      <p className="text-sm mb-2">{videoError}</p>
                      <Button variant="outline" size="sm" onClick={retryVideo}>
                        <RefreshCw className="h-4 w-4 mr-1" />
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
                    console.log("⏳ Practice video loading started")
                    setVideoLoading(true)
                  }}
                  onCanPlay={() => {
                    console.log("✅ Practice video can play")
                    setVideoLoading(false)
                  }}
                  onError={handleVideoError}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnded}
                  onTimeUpdate={handleVideoTimeUpdate}
                  crossOrigin="anonymous"
                >
                  <source src={getVideoStreamUrl(currentQuestion)} type="video/mp4" />
                  <p className="text-white p-4">Browser Anda tidak mendukung pemutar video.</p>
                </video>
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={replayVideo}>
                    <Replay className="h-4 w-4 mr-1" />
                    Putar Ulang
                  </Button>
                  {isVideoPlaying ? (
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
                  <div className="text-xs text-muted-foreground">💡 Tonton video hingga selesai untuk melanjutkan</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question and Answers */}
        <div className="order-2">
          <Card>
            <CardHeader>
              <CardTitle>Soal {currentQuestion.order}</CardTitle>
              <CardDescription>Pilih jawaban yang paling tepat berdasarkan video yang Anda tonton</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Text */}
              <div className="p-4 bg-muted rounded-md">
                <p className="text-lg font-medium">{currentQuestion.question}</p>
              </div>

              {!showFeedback ? (
                <>
                  {/* Answer Options */}
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    <div className="space-y-3">
                      {currentQuestion.options
                        .sort((a, b) => a.order - b.order)
                        .map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                            <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                              {option.option_text}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </RadioGroup>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption || isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Jawaban"
                    )}
                  </Button>

                  {/* Hint for watching video */}
                  {!hasWatchedVideo && (
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        💡 Disarankan untuk menonton video terlebih dahulu sebelum menjawab
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Feedback Section */
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-md border-2 ${
                      feedback?.is_correct
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {feedback?.is_correct ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <span className="font-semibold text-lg">
                        {feedback?.is_correct ? "Jawaban Benar!" : "Jawaban Kurang Tepat"}
                      </span>
                    </div>

                    <p className="text-sm mb-4 leading-relaxed">{feedback?.explanation}</p>

                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white/50 rounded">
                        <span className="font-medium">Jawaban Anda:</span>
                        <span className={`font-medium ${feedback?.is_correct ? "text-green-600" : "text-red-600"}`}>
                          {feedback?.selected_option.text}
                        </span>
                      </div>

                      {!feedback?.is_correct && (
                        <div className="flex justify-between items-center p-2 bg-white/50 rounded">
                          <span className="font-medium">Jawaban Benar:</span>
                          <span className="text-green-600 font-medium">{feedback?.correct_option.text}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center p-2 bg-white/50 rounded">
                        <span className="font-medium">Poin Diperoleh:</span>
                        <span className="font-bold">
                          {feedback?.points_earned}/{feedback?.max_points}
                        </span>
                      </div>

                      {feedback?.current_progress && (
                        <div className="flex justify-between items-center p-2 bg-white/50 rounded">
                          <span className="font-medium">Skor Saat Ini:</span>
                          <span className="font-bold">
                            {feedback.current_progress.current_score}/{feedback.current_progress.max_score}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Question or Final Results Button */}
                  {!feedback?.is_last_question ? (
                    <Button onClick={handleNextQuestion} className="w-full" size="lg">
                      Soal Berikutnya
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-blue-800 mb-1">Latihan Selesai!</p>
                        <p className="text-sm text-blue-600">Anda telah menyelesaikan semua soal dalam latihan ini</p>
                      </div>

                      <Button onClick={handleShowFinalResults} className="w-full" size="lg">
                        <Trophy className="mr-2 h-4 w-4" />
                        Lihat Hasil Lengkap
                      </Button>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Klik tombol di atas untuk melihat hasil dan statistik lengkap
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
