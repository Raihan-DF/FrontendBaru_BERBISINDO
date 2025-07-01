"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Target,
  Trophy,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"

interface Exercise {
  id: number
  title: string
  description: string
  material_id: number
  difficulty_level: number
  total_questions: number
  total_points: number
  is_completed: boolean
  score: number | null
  attempt_count: number
  created_at: string
  material: {
    id: number
    title: string
  }
  creator?: {
    id: number
    name: string
  }
}

const ITEMS_PER_PAGE = 4

export default function StudentExercises() {
  const { toast } = useToast()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { get } = useApi()

  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when search changes
  }, [searchQuery])

  const fetchExercises = async () => {
    try {
      console.log("🔄 Fetching exercises...")

      // Gunakan hook useApi yang sudah diperbaiki
      const data = await get("/api/exercises")

      console.log("✅ Exercises data received:", data)
      setExercises(data.data || data || [])
    } catch (error: any) {
      console.error("❌ Error fetching exercises:", error)
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat memuat data latihan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.material?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const completedExercises = filteredExercises.filter((exercise) => exercise.is_completed)
  const inProgressExercises = filteredExercises.filter(
    (exercise) => !exercise.is_completed && exercise.attempt_count > 0,
  )

  const getFilteredExercises = (tab: string) => {
    switch (tab) {
      case "completed":
        return completedExercises
      case "progress":
        return inProgressExercises
      default:
        return filteredExercises
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Memuat data...
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Latihan Interaktif</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2">
            Tingkatkan kemampuan bahasa isyarat Anda dengan latihan yang menarik
          </p>
        </div>

        {/* Statistics */}
        <div className="rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0284c7] dark:from-[#0e7490] dark:to-[#075985] p-4 sm:p-6 shadow-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">{filteredExercises.length}</div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">Total</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">{completedExercises.length}</div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">Selesai</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">{inProgressExercises.length}</div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">Progress</p>
            </div>
          </div>
          <div className="h-1 w-16 bg-white/40 rounded-full mt-4 mx-auto shadow-inner shadow-white/30"></div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari latihan..."
              className="pl-10 border-gray-200 dark:border-gray-700 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-800 shadow-sm h-10 sm:h-11">
            <TabsTrigger
              value="all"
              className="text-xs sm:text-sm data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white"
            >
              Semua
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="text-xs sm:text-sm data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white"
            >
              Progress
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-xs sm:text-sm data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white"
            >
              Selesai
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ExerciseGrid
              exercises={getFilteredExercises("all")}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="progress">
            <ExerciseGrid
              exercises={getFilteredExercises("progress")}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="completed">
            <ExerciseGrid
              exercises={getFilteredExercises("completed")}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ExerciseGrid({
  exercises,
  currentPage,
  setCurrentPage,
}: {
  exercises: Exercise[]
  currentPage: number
  setCurrentPage: (page: number) => void
}) {
  const totalPages = Math.ceil(exercises.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentExercises = exercises.slice(startIndex, endIndex)

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada latihan ditemukan</h3>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Halaman {currentPage} dari {totalPages} ({exercises.length} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const progressPercentage =
    exercise.total_questions > 0 ? Math.round(((exercise.score || 0) / exercise.total_points) * 100) : 0

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusColor = () => {
    if (exercise.is_completed) return "border-l-green-500"
    if (exercise.attempt_count > 0) return "border-l-amber-500"
    return "border-l-[#3B82F6]"
  }

  const getStatusBadge = () => {
    if (exercise.is_completed) {
      return (
        <Badge className="bg-green-100 text-green-800 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Selesai
        </Badge>
      )
    }
    if (exercise.attempt_count > 0) {
      return (
        <Badge className="bg-amber-100 text-amber-800 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Progress
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 text-xs">
        <BookOpen className="h-3 w-3 mr-1" />
        Belum Mulai
      </Badge>
    )
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-4 shadow-sm border-l-4 ${getStatusColor()}`}>
      <div className="flex gap-3 sm:gap-4">
        {/* Icon */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-[#3B82F6]" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg sm:text-base text-gray-900 dark:text-white line-clamp-2 pr-2">
              {exercise.title}
            </h3>
            {getStatusBadge()}
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
            {exercise.material?.title || "No Material"}
          </p>

          <div className="space-y-2 mb-3">
            <Progress value={exercise.is_completed ? 100 : progressPercentage} className="h-2" />
            {exercise.score !== null && (
              <div className="text-xs text-gray-500">
                Skor: {exercise.score}/{exercise.total_points}
              </div>
            )}
          </div>

          <Link href={`/student/exercises/${exercise.id}`}>
            <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm sm:text-base h-9 sm:h-10 font-semibold">
              <Zap className="mr-2 h-4 w-4" />
              {exercise.is_completed ? "Lihat Kembali" : exercise.attempt_count > 0 ? "Lanjutkan" : "Mulai Latihan"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
