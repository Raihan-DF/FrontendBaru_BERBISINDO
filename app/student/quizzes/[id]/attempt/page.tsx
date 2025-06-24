"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  ChevronLeft,
  ChevronRight,
  Flag,
  Eye,
  EyeOff,
  Play,
  Pause,
  Loader2,
  RepeatIcon as Replay,
  Trophy,
  Target,
  Award,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApi } from "@/hooks/use-api"

// Sesuaikan dengan struktur backend yang ada
interface MaterialVideo {
  id: number
  title: string
  description: string
  video_filename: string
  video_path: string
  order: number
}

interface QuizOption {
  id: number
  option_text: string
  order: number
}

interface QuizQuestion {
  id: number
  quiz_id: number
  question: string
  points: number
  order: number
  material_video_id?: number
  material_video?: MaterialVideo
  options: QuizOption[]
}

interface Quiz {
  id: number
  title: string
  description: string
  time_limit: number // in minutes
  total_questions: number
  total_points: number
  passing_score: number
  questions: QuizQuestion[]
}

interface QuizAttemptResult {
  message: string
  attempt_id: number
  score: number
  max_score: number
  percentage: number
  passing_score: number
  passed: boolean
  correct_answers: number
  total_questions: number
  time_taken?: number
}

export default function QuizAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { toast } = useToast()
  const router = useRouter()
  const resolvedParams = use(params)
  const { buildUrl } = useApi()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // questionId -> optionId
  const [timeLeft, setTimeLeft] = useState(0) // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<QuizAttemptResult | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [showQuestionNavigation, setShowQuestionNavigation] = useState(false)

  // Modal states for better UX
  const [showTimeUpModal, setShowTimeUpModal] = useState(false)
  const [showUnfinishedModal, setShowUnfinishedModal] = useState(false)
  const [showQuizStateModal, setShowQuizStateModal] = useState(false)
  const [quizStateMessage, setQuizStateMessage] = useState("")
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [resolvedParams.id])

  // Timer effect for countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResults && !showTimeUpModal) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quiz && !showResults && !showTimeUpModal) {
      setShowTimeUpModal(true)
    }
  }, [timeLeft, showResults, quiz, showTimeUpModal])

  // Timer effect for elapsed time tracking
  useEffect(() => {
    if (startTime && !showResults) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [startTime, showResults])

  // Reset video states when question changes
  useEffect(() => {
    if (quiz && quiz.questions[currentQuestionIndex]) {
      setVideoLoading(true)
      setVideoError(null)
      setHasWatchedVideo(false)
      setIsVideoPlaying(false)

      // Automatically show video if available for this question
      const currentQuestion = quiz.questions[currentQuestionIndex]
      setShowVideo(!!currentQuestion.material_video_id && !!currentQuestion.material_video)
    }
  }, [currentQuestionIndex, quiz])

  const fetchQuiz = async () => {
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
        router.push("/auth/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        console.log("Quiz data for attempt:", data)

        // Pastikan questions adalah array
        if (data && data.questions && !Array.isArray(data.questions)) {
          data.questions = Object.values(data.questions)
        }

        // Pastikan setiap question memiliki options sebagai array
        if (data && data.questions) {
          data.questions = data.questions.map((question: any) => {
            if (question.options && !Array.isArray(question.options)) {
              question.options = Object.values(question.options)
            }
            return question
          })
        }

        setQuiz(data)
        setTimeLeft(data.time_limit * 60) // Convert minutes to seconds
        setStartTime(new Date())

        // Cek apakah question pertama memiliki video
        if (data.questions && data.questions.length > 0) {
          const firstQuestion = data.questions[0]
          setShowVideo(!!firstQuestion.material_video_id && !!firstQuestion.material_video)
        }

        // Start quiz attempt after loading quiz data
        await startQuizAttempt()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Gagal memuat quiz",
          variant: "destructive",
        })
        router.push(`/student/quizzes/${resolvedParams.id}`)
      }
    } catch (error) {
      console.error("Error fetching quiz:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat quiz",
        variant: "destructive",
      })
      router.push(`/student/quizzes/${resolvedParams.id}`)
    } finally {
      setLoading(false)
    }
  }

  // Start a new quiz attempt
  const startQuizAttempt = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(buildUrl(`/api/quizzes/${resolvedParams.id}/start`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const attemptData = await response.json()
        console.log("Quiz attempt started:", attemptData)
        return attemptData
      } else {
        const errorData = await response.json()
        console.error("Failed to start quiz attempt:", errorData)

        // Handle specific error cases
        if (errorData.error === "Quiz already completed") {
          toast({
            title: "Quiz Sudah Selesai",
            description: "Anda sudah menyelesaikan quiz ini sebelumnya.",
            variant: "destructive",
          })
          router.push(`/student/quizzes/${resolvedParams.id}`)
        } else if (errorData.error === "Maximum attempts reached") {
          toast({
            title: "Batas Percobaan Tercapai",
            description: "Anda telah mencapai batas maksimal percobaan untuk quiz ini.",
            variant: "destructive",
          })
          router.push(`/student/quizzes/${resolvedParams.id}`)
        } else if (errorData.error === "No active attempt found") {
          toast({
            title: "Tidak Ada Percobaan Aktif",
            description: "Tidak ada percobaan aktif ditemukan. Silakan mulai ulang quiz.",
            variant: "destructive",
          })
          router.push(`/student/quizzes/${resolvedParams.id}`)
        }
      }
    } catch (error) {
      console.error("Error starting quiz attempt:", error)
      toast({
        title: "Error",
        description: "Gagal memulai quiz attempt.",
        variant: "destructive",
      })
    }
  }

  // Use working video streaming approach from exercise practice page
  const getVideoStreamUrl = (question: QuizQuestion) => {
    if (!question.material_video_id || !question.material_video) return ""
    return buildUrl(`/quiz-video/${quiz?.id}/${question.id}`)
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

  const toggleVideoDisplay = () => {
    setShowVideo(!showVideo)
  }

  const handleAnswerChange = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index)
    setShowQuestionNavigation(false)
  }

  const toggleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  // Handle time up scenarios
  const handleTimeUp = async () => {
    setShowTimeUpModal(false)
    await handleSubmitQuiz(true)
  }

  // Improved submit function with better error handling
  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (!quiz) return

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter((q) => !answers[q.id])

    if (unansweredQuestions.length > 0 && !isAutoSubmit) {
      // For manual submission, show confirmation modal
      setShowUnfinishedModal(true)
      return
    } else if (unansweredQuestions.length > 0 && isAutoSubmit) {
      // For auto submission (time up), show warning but continue
      toast({
        title: "Waktu Habis",
        description: `${unansweredQuestions.length} soal belum terjawab, tetapi quiz akan tetap dikirim.`,
        variant: "destructive",
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

      console.log("Submitting quiz with data:", {
        quiz_id: quiz.id,
        answers: answers,
        answers_count: Object.keys(answers).length,
        total_questions: quiz.questions.length,
      })

      const response = await fetch(buildUrl(`/api/quizzes/${quiz.id}/submit`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          answers: answers,
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
        const resultData = await response.json()
        console.log("Quiz submission result:", resultData)

        // Add elapsed time to results
        resultData.time_taken = elapsedTime

        setResults(resultData)
        setShowResults(true)

        if (isAutoSubmit) {
          toast({
            title: "Quiz Dikirim Otomatis",
            description: "Quiz telah dikirim karena waktu habis atau sistem.",
            variant: "default",
          })
        } else {
          toast({
            title: "Quiz Berhasil Dikirim",
            description: `Skor Anda: ${resultData.score}/${resultData.max_score} (${resultData.percentage}%)`,
          })
        }
      } else {
        const errorData = await response.json()
        console.error("Quiz submission error:", errorData)
        console.error("Request data was:", { answers, quiz_id: quiz.id })

        // Handle specific error cases
        if (errorData.error === "No active attempt found") {
          toast({
            title: "Sesi Quiz Berakhir",
            description: "Sesi quiz Anda telah berakhir. Memulai ulang quiz...",
            variant: "destructive",
          })
          // Try to start a new attempt
          await startQuizAttempt()
          // Retry submission
          setTimeout(() => {
            handleSubmitQuiz(isAutoSubmit)
          }, 1000)
        } else if (errorData.error === "Quiz already submitted") {
          toast({
            title: "Quiz Sudah Dikirim",
            description: "Quiz ini sudah pernah dikirim sebelumnya.",
            variant: "destructive",
          })
          router.push(`/student/quizzes/${quiz.id}`)
        } else {
          toast({
            title: "Error",
            description: errorData.message || errorData.error || "Gagal mengirim quiz",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim quiz",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle unfinished quiz submission
  const handleUnfinishedSubmit = async (forceSubmit: boolean) => {
    setShowUnfinishedModal(false)
    if (forceSubmit) {
      await handleSubmitQuiz(true)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    } else {
      return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
  }

  const getTimeColor = () => {
    if (timeLeft <= 300) return "text-red-600" // Last 5 minutes
    if (timeLeft <= 600) return "text-yellow-600" // Last 10 minutes
    return "text-green-600"
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  const getFlaggedCount = () => {
    return flaggedQuestions.size
  }

  // Cek apakah question saat ini memiliki video
  const currentQuestionHasVideo = () => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return false
    const currentQuestion = quiz.questions[currentQuestionIndex]
    return !!currentQuestion.material_video_id && !!currentQuestion.material_video
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

  // Pastikan questions adalah array dan tidak kosong
  if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Quiz tidak memiliki soal</h3>
        <Link href="/student/quizzes">
          <Button>Kembali ke Daftar Quiz</Button>
        </Link>
      </div>
    )
  }

  // Results Screen - Updated to match exercise practice page styling
  if (showResults && results) {
    const isPassingGrade = results.percentage >= results.passing_score

    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4">
          <Link href="/student/quizzes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Selesai</h1>
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
            <CardDescription className="text-lg">{quiz.title} • Quiz Selesai</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Score Overview */}
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{results.score}</div>
                <div className="text-sm text-blue-600 font-medium">Skor Total</div>
                <div className="text-xs text-muted-foreground">dari {results.max_score}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{results.percentage.toFixed(1)}%</div>
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

            {/* Passing Status */}
            <div className="mb-6 p-4 rounded-md border">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status Kelulusan:</span>
                <Badge variant={isPassingGrade ? "default" : "destructive"}>
                  {isPassingGrade ? "LULUS" : "TIDAK LULUS"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Nilai minimum untuk lulus: {results.passing_score}%
              </div>
            </div>

            {/* Achievement Badge */}
            {isPassingGrade && (
              <div className="text-center mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">Selamat! Anda telah lulus quiz ini</p>
                <p className="text-sm text-green-600">Skor Anda melebihi batas kelulusan {results.passing_score}%</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link href="/student/quizzes">
                <Button variant="outline" className="w-full md:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Daftar Quiz
                </Button>
              </Link>
              <Link href={`/student/quizzes/${quiz.id}`}>
                <Button variant="outline" className="w-full md:w-auto">
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail Quiz
                </Button>
              </Link>
              {results.attempt_id && (
                <Link href={`/student/quizzes/${quiz.id}/attempts/${results.attempt_id}/results`}>
                  <Button className="w-full md:w-auto">
                    <Trophy className="mr-2 h-4 w-4" />
                    Lihat Detail Jawaban
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen py-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto max-w-4xl p-4 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/student/quizzes/${quiz.id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{quiz.title}</h1>
            <p className="text-muted-foreground">Kerjakan semua soal dengan teliti</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getTimeColor()}`}>
              <Clock className="inline h-5 w-5 mr-1" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground">Waktu tersisa</div>
          </div>
        </div>

        {/* Progress and Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {currentQuestionIndex + 1} / {quiz.questions.length}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </CardContent>
          </Card>

          <Card className="shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Terjawab</span>
                <span className="text-lg font-bold text-green-600">
                  {getAnsweredCount()} / {quiz.questions.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Waktu Berlalu</span>
                <span className="text-lg font-bold text-blue-600">{formatTime(elapsedTime)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Navigation Toggle */}
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => setShowQuestionNavigation(!showQuestionNavigation)}>
            {showQuestionNavigation ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showQuestionNavigation ? "Sembunyikan" : "Tampilkan"} Navigasi Soal
          </Button>

          {currentQuestionHasVideo() && (
            <Button variant="outline" onClick={toggleVideoDisplay}>
              {showVideo ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showVideo ? "Sembunyikan" : "Tampilkan"} Video
            </Button>
          )}
        </div>

        {/* Question Navigation */}
        {showQuestionNavigation && (
          <Card className="shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Navigasi Soal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {quiz.questions.map((question, index) => (
                  <Button
                    key={question.id}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuestionNavigation(index)}
                    className={`relative ${
                      answers[question.id] ? "bg-green-100 border-green-300 dark:bg-green-900/20" : ""
                    }`}
                  >
                    {index + 1}
                    {flaggedQuestions.has(question.id) && (
                      <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                    )}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>Belum Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-yellow-500" />
                  <span>Ditandai</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Player - hanya ditampilkan jika showVideo true dan question memiliki video */}
        {showVideo && currentQuestionHasVideo() && (
          <Card className="shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
                <span>Video: {currentQuestion.material_video?.title || "Video Pembelajaran"}</span>
                {hasWatchedVideo && (
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ditonton
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                Tonton video ini untuk membantu menjawab soal
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
                      <AlertTriangle className="h-8 w-8" />
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
                  key={`${currentQuestion.id}-${currentQuestion.material_video_id}`}
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
                  <div className="text-xs text-muted-foreground">💡 Tonton video untuk pemahaman lebih baik</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        <Card className="shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Soal {currentQuestion.order}
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  {currentQuestion.points} poin
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {currentQuestionHasVideo() && !showVideo && (
                  <Button variant="outline" size="sm" onClick={toggleVideoDisplay}>
                    <Eye className="h-4 w-4 mr-1" />
                    Video
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFlagQuestion(currentQuestion.id)}
                  className={flaggedQuestions.has(currentQuestion.id) ? "bg-yellow-100 border-yellow-300" : ""}
                >
                  <Flag className={`h-4 w-4 ${flaggedQuestions.has(currentQuestion.id) ? "text-yellow-600" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div className="p-4 bg-muted rounded-md">
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{currentQuestion.question}</p>
            </div>

            {/* Answer Options */}
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, Number.parseInt(value))}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50">
                    <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                    <Label
                      htmlFor={`option-${option.id}`}
                      className="flex-1 cursor-pointer text-gray-900 dark:text-gray-100"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Sebelumnya
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button
                    onClick={() => handleSubmitQuiz()}
                    disabled={isSubmitting}
                    size="lg"
                    className="px-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Mengirim..." : "Kirim Quiz"}
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} disabled={currentQuestionIndex === quiz.questions.length - 1}>
                    Berikutnya
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Warning */}
        {timeLeft <= 300 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border dark:border-gray-700">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <div className="font-medium text-red-700 dark:text-red-400">Waktu Hampir Habis!</div>
                <div className="text-sm text-red-600 dark:text-red-500">
                  Segera selesaikan quiz Anda. Quiz akan otomatis dikirim jika waktu habis.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Up Modal */}
        <Dialog open={showTimeUpModal} onOpenChange={setShowTimeUpModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Clock className="h-5 w-5" />
                Waktu Habis!
              </DialogTitle>
              <DialogDescription>
                Waktu untuk mengerjakan quiz telah habis. Apa yang ingin Anda lakukan?
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold text-red-600">00:00</div>
                <p className="text-sm text-muted-foreground">
                  Soal terjawab: {getAnsweredCount()} dari {quiz?.questions.length || 0}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleTimeUp} className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Kirim Quiz Sekarang
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                  Mulai Ulang Quiz
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Unfinished Quiz Modal */}
        <Dialog open={showUnfinishedModal} onOpenChange={setShowUnfinishedModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Quiz Belum Selesai
              </DialogTitle>
              <DialogDescription>
                Masih ada soal yang belum dijawab. Apakah Anda yakin ingin mengirim quiz?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="text-center space-y-2 mb-4">
                <p className="text-sm">
                  Soal belum terjawab:{" "}
                  <span className="font-semibold text-red-600">
                    {quiz ? quiz.questions.length - getAnsweredCount() : 0}
                  </span>{" "}
                  dari {quiz?.questions.length || 0}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleUnfinishedSubmit(true)}
                  variant="destructive"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    "Ya, Kirim Quiz"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowUnfinishedModal(false)} className="w-full">
                  Kembali Mengerjakan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
