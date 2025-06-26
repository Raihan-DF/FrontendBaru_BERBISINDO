"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Target,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Eye,
  Brain,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  Star,
  Trophy,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useApi } from "@/hooks/use-api"

interface QuizAttempt {
  id: number
  score: number
  total_points: number
  percentage: number
  completed_at: string
  time_taken: number // in seconds
}

interface Quiz {
  id: number
  title: string
  description: string
  material_id?: number
  time_limit: number // in minutes
  total_questions: number
  total_points: number
  difficulty_level: number
  max_attempts?: number
  is_published: boolean
  instructions?: string
  created_at: string
  creator_id: number
  creator?: {
    id: number
    name: string
  }
  material?: {
    id: number
    title: string
  }
  is_completed?: boolean
  score?: number
  attempt_count?: number
  best_score?: number
  last_attempt_at?: string
  attempts?: QuizAttempt[]
  can_attempt?: boolean
  next_attempt_available_at?: string
  questions?: Array<{
    id: number
    material_video_id?: number
    material_video?: {
      id: number
      title: string
    }
  }>
}

export default function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { toast } = useToast()
  const router = useRouter()
  const resolvedParams = use(params)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const { get, post, put, delete: del, buildUrl } = useApi()

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

  const getDifficultyLabel = (level: number) => {
    const labels = ["", "Sangat Mudah", "Mudah", "Sedang", "Sulit", "Sangat Sulit"]
    return labels[level] || "Tidak Diketahui"
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

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} jam ${remainingMinutes > 0 ? `${remainingMinutes} menit` : ""}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}j ${minutes}m ${secs}d`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}d`
    } else {
      return `${secs}d`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const hasVideos = () => {
    return quiz?.questions && quiz.questions.some((q) => q.material_video_id && q.material_video)
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#8B5CF6]" />
          <p className="text-muted-foreground">Memuat detail quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Quiz tidak ditemukan</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Quiz yang Anda cari tidak tersedia.</p>
          <Link href="/student/quizzes">
            <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Quiz
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/student/quizzes">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white line-clamp-2">
              {quiz.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              {quiz.material?.title ? `Materi: ${quiz.material.title}` : "Quiz Interaktif"}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] dark:from-[#5B21B6] dark:to-[#7C3AED] p-4 sm:p-6 shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">{quiz.total_questions}</div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">Soal</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">{quiz.total_points}</div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">Poin</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">{formatTime(quiz.time_limit)}</div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">Waktu</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-lg sm:text-xl font-bold text-white">{getDifficultyLabel(quiz.difficulty_level)}</div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">Tingkat</p>
            </div>
          </div>
          <div className="h-1 w-16 bg-white/30 rounded-full mt-4 mx-auto"></div>
        </div>

        {/* Progress Status */}
        {quiz.is_completed && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 border-l-green-500">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-green-800 dark:text-green-400">
                  Quiz Sudah Diselesaikan
                </h3>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-500">
                  Skor Terbaik: {quiz.best_score || quiz.score}/{quiz.total_points} • Percobaan: {quiz.attempt_count}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs">
                <Star className="h-3 w-3 mr-1" />
                Selesai
              </Badge>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B5CF6]" />
            <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Deskripsi Quiz</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{quiz.description}</p>
        </div>

        {/* Quiz Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B5CF6]" />
            <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Informasi Quiz</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Dibuat oleh: {quiz.creator?.name || "Admin"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Dibuat: {formatDate(quiz.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <Badge className={`${getDifficultyColor(quiz.difficulty_level)} text-xs`}>
                {getDifficultyLabel(quiz.difficulty_level)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>
                Percobaan: {quiz.attempt_count || 0}
                {quiz.max_attempts && ` / ${quiz.max_attempts}`}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Details */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B5CF6]" />
            <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Progress Anda</h2>
          </div>
          <div className="space-y-3">
            {quiz.best_score !== undefined && (
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                <span className="text-xs sm:text-sm font-medium">Skor Terbaik:</span>
                <span className="text-xs sm:text-sm font-bold">
                  {quiz.best_score}/{quiz.total_points}
                </span>
              </div>
            )}
            {quiz.last_attempt_at && (
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                <span className="text-xs sm:text-sm font-medium">Terakhir Dikerjakan:</span>
                <span className="text-xs sm:text-sm">{formatDate(quiz.last_attempt_at)}</span>
              </div>
            )}
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
              <span className="text-xs sm:text-sm font-medium">Status:</span>
              {quiz.is_completed ? (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Selesai
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Belum Selesai
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B5CF6]" />
            <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Petunjuk Pengerjaan</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-0.5">
                Pastikan koneksi internet Anda stabil sebelum memulai quiz
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-0.5">
                Baca setiap soal dengan teliti sebelum memilih jawaban
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-0.5">
                Perhatikan batas waktu yang telah ditentukan
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-0.5">
                Pastikan semua soal telah dijawab sebelum mengirim
              </p>
            </div>
            {hasVideos() && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  5
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-0.5">
                  Tonton video pembelajaran terlebih dahulu untuk pemahaman yang lebih baik
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Attempt History */}
        {quiz.attempts && quiz.attempts.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B5CF6]" />
              <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Riwayat Percobaan</h2>
            </div>
            <div className="space-y-3">
              {quiz.attempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      Percobaan {quiz.attempts!.length - index}
                    </Badge>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{formatDate(attempt.completed_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <span>
                      <span className="font-medium">{attempt.score}</span>/{attempt.total_points}
                    </span>
                    <Badge className={`text-xs ${getScoreColor(attempt.percentage)}`} variant="outline">
                      {attempt.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning for attempts */}
        {quiz.max_attempts && quiz.attempt_count && quiz.attempt_count >= quiz.max_attempts && !quiz.can_attempt && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 border-l-red-500">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-700 dark:text-red-400 text-sm sm:text-base">
                  Batas Percobaan Tercapai
                </h3>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-500">
                  Anda telah mencapai batas maksimal percobaan untuk quiz ini.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid gap-4 sm:gap-6">
          {/* Video Button - hanya tampil jika ada video */}
          {hasVideos() && (
            <Link href={`/student/quizzes/${quiz.id}/video`}>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                      Tonton Video Pembelajaran
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Pelajari materi melalui video sebelum mengerjakan quiz
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Quiz Button */}
          <Link href={`/student/quizzes/${quiz.id}/attempt`}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 border-l-[#8B5CF6] hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                    {quiz.can_attempt !== false
                      ? quiz.attempt_count && quiz.attempt_count > 0
                        ? "Coba Lagi"
                        : "Mulai Quiz"
                      : "Quiz Tidak Dapat Diakses"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {quiz.can_attempt !== false
                      ? "Kerjakan soal-soal quiz untuk menguji pemahaman"
                      : "Batas percobaan telah tercapai"}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
