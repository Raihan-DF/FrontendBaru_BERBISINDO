"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, Users, Trophy, BookOpen, CheckCircle, AlertCircle, Target, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useApi } from "@/hooks/use-api"

interface Quiz {
  id: number
  title: string
  description: string
  material_id?: number
  time_limit: number
  total_questions: number
  total_points: number
  difficulty_level: number
  is_published: boolean
  created_at: string
  updated_at: string
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
  max_attempts?: number
  best_score?: number
  last_attempt_at?: string
}

export default function QuizzesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const { get, post, put, delete: del, buildUrl } = useApi();

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
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

      const response = await fetch(buildUrl("/api/quizzes"), {
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
        console.log("Data dari API:", data)

        if (data && !Array.isArray(data)) {
          if (data.data && Array.isArray(data.data)) {
            setQuizzes(data.data)
          } else if (data.quizzes && Array.isArray(data.quizzes)) {
            setQuizzes(data.quizzes)
          } else if (typeof data === "object") {
            setQuizzes(Object.values(data))
          } else {
            console.error("Format data tidak dikenali:", data)
            setQuizzes([])
          }
        } else {
          setQuizzes(data || [])
        }
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data quiz",
          variant: "destructive",
        })
        setQuizzes([])
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      })
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  // const getDifficultyLabel = (level: number) => {
  //   const labels = ["", "Sangat Mudah", "Mudah", "Sedang", "Sulit", "Sangat Sulit"]
  //   return labels[level] || "Tidak Diketahui"
  // }

  // const getDifficultyColor = (level: number) => {
  //   const colors = [
  //     "",
  //     "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200",
  //     "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200",
  //     "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200",
  //     "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200",
  //     "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200",
  //   ]
  //   return colors[level] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200"
  // }
  const difficultyLabels: Record<string, string> = {
    all: "Semua Tingkat",
    "1": "Sangat Mudah",
    "2": "Mudah",
    "3": "Sedang",
    "4": "Sulit",
    "5": "Sangat Sulit",
  };
  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.is_completed) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 border">
          <CheckCircle className="h-3 w-3 mr-1" />
          Selesai
        </Badge>
      )
    }

    if (quiz.attempt_count && quiz.attempt_count > 0) {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 border">
          <AlertCircle className="h-3 w-3 mr-1" />
          Dalam Progress
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="border-blue-200">
        <BookOpen className="h-3 w-3 mr-1" />
        Belum Dimulai
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} jam ${remainingMinutes > 0 ? `${remainingMinutes} menit` : ""}`
  }

  const filteredQuizzes = Array.isArray(quizzes)
    ? quizzes.filter((quiz) => {
        if (!quiz) return false

        const matchesSearch =
          quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.material?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false

        const matchesMaterial = selectedMaterial === "all" || quiz.material?.title === selectedMaterial
        const matchesDifficulty =
          selectedDifficulty === "all" || quiz.difficulty_level?.toString() === selectedDifficulty

        let matchesStatus = true
        if (selectedStatus === "completed") {
          matchesStatus = quiz.is_completed === true
        } else if (selectedStatus === "in-progress") {
          matchesStatus = !quiz.is_completed && (quiz.attempt_count || 0) > 0
        } else if (selectedStatus === "not-started") {
          matchesStatus = !quiz.is_completed && (quiz.attempt_count || 0) === 0
        }

        return matchesSearch && matchesMaterial && matchesDifficulty && matchesStatus
      })
    : []

  const materials = Array.isArray(quizzes)
    ? Array.from(new Set(quizzes.filter((quiz) => quiz && quiz.material?.title).map((quiz) => quiz.material!.title)))
    : []

  const completedQuizzes = filteredQuizzes.filter((quiz) => quiz.is_completed)
  const inProgressQuizzes = filteredQuizzes.filter((quiz) => !quiz.is_completed && (quiz.attempt_count || 0) > 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div> */}
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Quiz Interaktif
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uji pemahaman bahasa isyarat Anda dengan berbagai quiz yang menantang dan interaktif
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Total Quiz</p>
                  <p className="text-3xl font-bold">{filteredQuizzes.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Selesai</p>
                  <p className="text-3xl font-bold">{completedQuizzes.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Dalam Progress</p>
                  <p className="text-3xl font-bold">{inProgressQuizzes.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="max-w-6xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari quiz berdasarkan judul, deskripsi, atau materi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger className="w-[150px] border-0 bg-gray-50">
                    <SelectValue placeholder="Materi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Materi</SelectItem>
                    {materials.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
  value={selectedDifficulty} 
  onValueChange={setSelectedDifficulty}
  defaultValue="all"
>
  <SelectTrigger className="w-[150px] border-0 bg-gray-50">
    <SelectValue placeholder="Tingkat" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Semua Tingkat</SelectItem>
    <SelectItem value="1">Sangat Mudah</SelectItem>
    <SelectItem value="2">Mudah</SelectItem>
    <SelectItem value="3">Sedang</SelectItem>
    <SelectItem value="4">Sulit</SelectItem>
    <SelectItem value="5">Sangat Sulit</SelectItem>
  </SelectContent>
</Select>


                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[130px] border-0 bg-gray-50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="not-started">Belum Dimulai</SelectItem>
                    <SelectItem value="in-progress">Dalam Progress</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredQuizzes.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-6" />
                <h3 className="text-xl font-medium text-muted-foreground mb-3">
                  {searchTerm || selectedMaterial !== "all" || selectedDifficulty !== "all" || selectedStatus !== "all"
                    ? "Tidak ada quiz yang sesuai dengan filter"
                    : "Belum ada quiz tersedia"}
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchTerm || selectedMaterial !== "all" || selectedDifficulty !== "all" || selectedStatus !== "all"
                    ? "Coba ubah kriteria pencarian atau filter Anda untuk menemukan quiz yang sesuai"
                    : "Quiz akan muncul di sini ketika sudah tersedia dari instruktur"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const getDifficultyLabel = (level: number) => {
    const labels = ["", "Sangat Mudah", "Mudah", "Sedang", "Sulit", "Sangat Sulit"]
    return labels[level] || "Tidak Diketahui"
  }

  const getDifficultyColor = (level: number) => {
    const colors = [
      "",
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200",
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200",
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200",
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200",
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200",
    ]
    return colors[level] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200"
  }

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.is_completed) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 border">
          <CheckCircle className="h-3 w-3 mr-1" />
          Selesai
        </Badge>
      )
    }

    if (quiz.attempt_count && quiz.attempt_count > 0) {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 border">
          <AlertCircle className="h-3 w-3 mr-1" />
          Dalam Progress
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="border-blue-200">
        <BookOpen className="h-3 w-3 mr-1" />
        Belum Dimulai
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} jam ${remainingMinutes > 0 ? `${remainingMinutes} menit` : ""}`
  }

  const getStatusColor = () => {
    if (quiz.is_completed) return "border-l-green-500 bg-green-50/30"
    if (quiz.attempt_count && quiz.attempt_count > 0) return "border-l-amber-500 bg-amber-50/30"
    return "border-l-indigo-500 bg-indigo-50/30"
  }

  return (
    <Card
      className={`shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 ${getStatusColor()}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-1">{quiz.title}</CardTitle>
            <CardDescription className="text-sm">{quiz.material?.title || "Quiz Umum"}</CardDescription>
          </div>
          {getStatusBadge(quiz)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{quiz.description}</p>

        {/* Quiz Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <Target className="h-3 w-3 text-blue-600" />
            </div>
            <span className="font-medium">{quiz.total_questions} Soal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 p-1.5 rounded-full">
              <Trophy className="h-3 w-3 text-yellow-600" />
            </div>
            <span className="font-medium">{quiz.total_points} Poin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Clock className="h-3 w-3 text-green-600" />
            </div>
            <span className="font-medium">{formatTime(quiz.time_limit)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded-full">
              <Users className="h-3 w-3 text-purple-600" />
            </div>
            <span className="font-medium">{quiz.creator?.name || "Admin"}</span>
          </div>
        </div>

        {/* Difficulty and Date */}
        <div className="flex items-center justify-between">
          <Badge className={`${getDifficultyColor(quiz.difficulty_level)} border font-medium`}>
            {getDifficultyLabel(quiz.difficulty_level)}
          </Badge>
          <span className="text-xs text-muted-foreground">{formatDate(quiz.created_at)}</span>
        </div>

        {/* Progress Info - PERBAIKAN: Tampilkan best_score yang benar */}
        {/* {quiz.is_completed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-green-700 dark:text-green-400 font-medium">Skor Terbaik:</span>
              <span className="font-bold text-green-700 dark:text-green-400">
                {quiz.best_score || quiz.score}/{quiz.total_points}
              </span>
            </div>
            {quiz.attempt_count && quiz.attempt_count > 1 && (
              <div className="text-xs text-green-600 dark:text-green-500">
                Dicapai dalam {quiz.attempt_count} percobaan
              </div>
            )}
          </div>
        )}

        {quiz.attempt_count && quiz.attempt_count > 0 && !quiz.is_completed && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              Percobaan: {quiz.attempt_count}
              {quiz.max_attempts && ` / ${quiz.max_attempts}`}
            </div>
            {quiz.last_attempt_at && (
              <div className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                Terakhir: {formatDate(quiz.last_attempt_at)}
              </div>
            )}
          </div>
        )} */}
      </CardContent>

      <CardContent className="pt-0">
        <Link href={`/student/quizzes/${quiz.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg">
            {quiz.is_completed
              ? "Lihat Detail"
              : quiz.attempt_count && quiz.attempt_count > 0
                ? "Lanjutkan Quiz"
                : "Mulai Quiz"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
