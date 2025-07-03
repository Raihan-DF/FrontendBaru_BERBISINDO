"use client"

import type React from "react"
import { useApi } from "@/hooks/use-api"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Clock,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  Trophy,
  Target,
  Award,
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

  // Video states - SIMPLIFIED like materials
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false)

  // Progress tracking state
  const [isNewAttempt, setIsNewAttempt] = useState(false)
  const [progressData, setProgressData] = useState<any>(null)
  const { buildUrl } = useApi()

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

  // Reset video states when question changes - SIMPLIFIED
  useEffect(() => {
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

      const url = buildUrl(`/api/exercises/${id}`)
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
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
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (!data.questions || data.questions.length === 0) {
        throw new Error("Exercise tidak memiliki soal yang tersedia")
      }

      data.total_questions = data.questions.length
      data.total_points = data.questions.reduce((sum: number, q: ExerciseQuestion) => sum + (q.points || 10), 0)

      setExercise(data)
      await checkExerciseProgress(data.id)
    } catch (error) {
      console.error("Error fetching exercise:", error)
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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
        setProgressData(progressData)

        if (progressData.is_completed) {
          setIsCompleted(false)
          setCurrentQuestionIndex(0)
          toast({
            title: "Latihan Sudah Pernah Diselesaikan",
            description: "Anda dapat mengulang exercise ini.",
            variant: "default",
            duration:1000,
          })
        } else if (progressData.answered_questions > 0 && !progressData.is_completed) {
          const nextQuestionIndex = progressData.current_question_index ?? progressData.answered_questions
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
          setCurrentQuestionIndex(0)
        }
      }
    } catch (error) {
      console.warn("Progress check failed, starting from beginning")
      setCurrentQuestionIndex(0)
    }
  }

  // SIMPLIFIED: Video URL handling like materials
  const getVideoStreamUrl = (question: ExerciseQuestion) => {
    return buildUrl(`/exercise-video/${exercise?.id}/${question.id}`)
  }

  // SIMPLIFIED: Video event handlers like materials
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

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !exercise) return

    if (!hasWatchedVideo) {
      toast({
        title: "Tonton Video Terlebih Dahulu",
        description: "Disarankan untuk menonton video sebelum menjawab soal.",
        variant: "default",
        duration: 1000,
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
          current_question_index: currentQuestionIndex,
        }),
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
        const feedbackData = await response.json()
        setFeedback(feedbackData)
        setShowFeedback(true)

        if (feedbackData.final_results) {
          feedbackData.final_results.time_taken = elapsedTime
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        toast({
          title: "Error",
          description: errorData.message || "Gagal mengirim jawaban",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan"
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
      return
    }

    const nextIndex = feedback?.current_progress?.next_question_index ?? currentQuestionIndex + 1

    if (nextIndex < exercise!.questions.length) {
      setCurrentQuestionIndex(nextIndex)
      setSelectedOption("")
      setShowFeedback(false)
      setFeedback(null)
    }
  }

  const handleShowFinalResults = () => {
    setShowFinalResults(true)
    setIsCompleted(true)
  }

  const resetExercise = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(buildUrl(`/api/exercises/${id}/reset`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
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

        await fetchExercise()

        toast({
          title: "Latihan Direset",
          description: "Anda dapat memulai latihan dari awal.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Gagal mereset latihan",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan"
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
          <p className="text-muted-foreground">Memuat latihan...</p>
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

  if (exercise.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada soal tersedia</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Latihan ini belum memiliki soal yang dapat dikerjakan.
          </p>
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

  const currentQuestion = exercise.questions[currentQuestionIndex]

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Soal tidak ditemukan</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Soal pada index {currentQuestionIndex} tidak tersedia.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setCurrentQuestionIndex(0)} className="bg-[#3B82F6] hover:bg-[#2563EB]">
              Kembali ke Soal Pertama
            </Button>
            <Button onClick={resetExercise} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Muat Ulang Latihan
            </Button>
          </div>
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6 max-w-4xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/student/exercises">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Latihan Selesai</h1>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {isPassingGrade ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />
                  </div>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{results.message}</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {exercise.title} • Percobaan ke-{results.attempt_number}
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{results.total_score}</div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">Skor Total</div>
                <div className="text-xs text-gray-500">dari {results.max_score}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{results.percentage}%</div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">Persentase</div>
                <div className="text-xs text-gray-500">{isPassingGrade ? "Lulus" : "Belum Lulus"}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {results.correct_answers}/{results.total_questions}
                </div>
                <div className="text-xs sm:text-sm text-purple-600 font-medium">Benar</div>
                <div className="text-xs text-gray-500">
                  {Math.round((results.correct_answers / results.total_questions) * 100)}% akurasi
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                  {formatTime(results.time_taken || elapsedTime)}
                </div>
                <div className="text-xs sm:text-sm text-orange-600 font-medium">Waktu</div>
                <div className="text-xs text-gray-500">Total</div>
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
              <div className="text-center mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 dark:text-green-400 font-medium">Selamat! Anda telah lulus latihan ini</p>
                <p className="text-sm text-green-600 dark:text-green-500">Skor Anda melebihi batas kelulusan 70%</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link href="/student/exercises">
                <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Daftar Latihan
                </Button>
              </Link>
              <Link href={`/student/exercises/${exercise.id}/video`}>
                <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                  <Eye className="mr-2 h-4 w-4" />
                  Tonton Video Lagi
                </Button>
              </Link>
              <Button onClick={resetExercise} className="w-full sm:w-auto bg-[#3B82F6] hover:bg-[#2563EB]">
                <RotateCcw className="mr-2 h-4 w-4" />
                Ulangi Latihan
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-3">
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
            <Link href={`/student/exercises/${exercise.id}/video`}>
              <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                <Eye className="mr-2 h-4 w-4" />
                Lihat Semua Video
              </Button>
            </Link>
          </div>
        </div>

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
          <div className="text-sm text-gray-600 dark:text-gray-400">{currentQuestion.points} poin</div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Video Player */}
          <div className="order-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                {hasWatchedVideo && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ditonton
                  </Badge>
                )}
              </div>

              {!hasWatchedVideo && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">💡 Tonton video hingga selesai</div>
              )}

              <div className="aspect-video rounded-md bg-black flex items-center justify-center relative overflow-hidden">
                {/* SIMPLIFIED: Video element like materials */}
                <video
                  key={currentQuestionIndex} // Force reload when changing videos
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

              {/* Video Controls */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={replayVideo}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Putar Ulang
                  </Button>
                  {isVideoPlaying ? (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      <Play className="h-3 w-3 mr-1" />
                      Sedang Diputar
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Pause className="h-3 w-3 mr-1" />
                      Dijeda
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question and Answers */}
          <div className="order-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2">
                Soal {currentQuestion.order}
              </h3>

              {/* Question Text */}
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-700 rounded-md mb-4">
                <p className="text-lg sm:text-base font-medium text-gray-900 dark:text-white">
                  {currentQuestion.question}
                </p>
              </div>

              {!showFeedback ? (
                <>
                  {/* Answer Options */}
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3 mb-4">
                    {currentQuestion.options
                      .sort((a, b) => a.order - b.order)
                      .map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                          <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer text-sm sm:text-base">
                            {option.option_text}
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption || isSubmitting}
                    className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-sm sm:text-base h-10 sm:h-12"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>Kirim Jawaban</>
                    )}
                  </Button>

                  {/* Hint for watching video */}
                  {!hasWatchedVideo && (
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md mt-3">
                      <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
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
                      <span className="font-semibold text-base sm:text-lg">
                        {feedback?.is_correct ? "Jawaban Benar!" : "Jawaban Kurang Tepat"}
                      </span>
                    </div>

                    <p className="text-sm mb-4 leading-relaxed">{feedback?.explanation}</p>

                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                        <span className="font-medium">Jawaban Anda:</span>
                        <span className={`font-medium ${feedback?.is_correct ? "text-green-600" : "text-red-600"}`}>
                          {feedback?.selected_option.text}
                        </span>
                      </div>

                      {!feedback?.is_correct && (
                        <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                          <span className="font-medium">Jawaban Benar:</span>
                          <span className="text-green-600 font-medium">{feedback?.correct_option.text}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                        <span className="font-medium">Poin Diperoleh:</span>
                        <span className="font-bold">
                          {feedback?.points_earned}/{feedback?.max_points}
                        </span>
                      </div>

                      {feedback?.current_progress && (
                        <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
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
                    <Button onClick={handleNextQuestion} className="w-full bg-[#3B82F6] hover:bg-[#2563EB] h-12">
                      Soal Berikutnya
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-1">Latihan Selesai!</p>
                        <p className="text-sm text-blue-600 dark:text-blue-500">
                          Anda telah menyelesaikan semua soal dalam latihan ini
                        </p>
                      </div>

                      <Button onClick={handleShowFinalResults} className="w-full bg-[#3B82F6] hover:bg-[#2563EB] h-12">
                        <Trophy className="mr-2 h-4 w-4" />
                        Lihat Hasil Lengkap
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
