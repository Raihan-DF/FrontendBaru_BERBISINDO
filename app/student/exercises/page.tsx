"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Target, Trophy, Users, CheckCircle, AlertCircle, BookOpen, Zap } from "lucide-react"
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

export default function StudentExercises() {
  const { toast } = useToast()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { get } = useApi()

  useEffect(() => {
    fetchExercises()
  }, [])

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Latihan Interaktif
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tingkatkan kemampuan bahasa isyarat Anda dengan latihan yang menarik dan interaktif
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Latihan</p>
                  <p className="text-3xl font-bold">{filteredExercises.length}</p>
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
                  <p className="text-3xl font-bold">{completedExercises.length}</p>
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
                  <p className="text-3xl font-bold">{inProgressExercises.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari latihan berdasarkan judul, deskripsi, atau materi..."
                className="pl-10 border-0 bg-gray-50 focus:bg-white transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Semua Latihan
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Sedang Dikerjakan
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Selesai
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <ExerciseGrid exercises={filteredExercises} />
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <ExerciseGrid exercises={inProgressExercises} />
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <ExerciseGrid exercises={completedExercises} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function ExerciseGrid({ exercises }: { exercises: Exercise[] }) {
  if (exercises.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-medium text-muted-foreground mb-3">Tidak ada latihan ditemukan</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Coba gunakan kata kunci yang berbeda atau periksa kembali filter yang Anda gunakan
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
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
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200",
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200",
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200",
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200",
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200",
    ]
    return colors[level] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = () => {
    if (exercise.is_completed) return "border-l-green-500 bg-green-50/30"
    if (exercise.attempt_count > 0) return "border-l-amber-500 bg-amber-50/30"
    return "border-l-blue-500 bg-blue-50/30"
  }

  const getStatusBadge = () => {
    if (exercise.is_completed) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 border">
          <CheckCircle className="h-3 w-3 mr-1" />
          Selesai
        </Badge>
      )
    }
    if (exercise.attempt_count > 0) {
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

  return (
    <Card
      className={`shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 ${getStatusColor()}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-1">{exercise.title}</CardTitle>
            <CardDescription className="text-sm">{exercise.material?.title || "No Material"}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <Target className="h-3 w-3 text-blue-600" />
            </div>
            <span className="font-medium">{exercise.total_questions} Soal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 p-1.5 rounded-full">
              <Trophy className="h-3 w-3 text-yellow-600" />
            </div>
            <span className="font-medium">{exercise.total_points} Poin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded-full">
              <Users className="h-3 w-3 text-purple-600" />
            </div>
            <span className="font-medium">{exercise.creator?.name || "Admin"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getDifficultyColor(exercise.difficulty_level)} border text-xs`}>
              {getDifficultyLabel(exercise.difficulty_level)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Kemajuan:</span>
            <span>
              {exercise.is_completed ? exercise.total_questions : 0}/{exercise.total_questions} soal
            </span>
          </div>
          <Progress value={exercise.is_completed ? 100 : progressPercentage} className="h-2" />
          {exercise.score !== null && (
            <div className="flex items-center justify-between text-sm">
              <span>Skor:</span>
              <span className="font-medium">
                {exercise.score}/{exercise.total_points}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Dibuat: {formatDate(exercise.created_at)}</span>
          {exercise.attempt_count > 0 && <span>{exercise.attempt_count} percobaan</span>}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/student/exercises/${exercise.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg">
            <Zap className="mr-2 h-4 w-4" />
            {exercise.is_completed
              ? "Lihat Kembali"
              : exercise.attempt_count > 0
                ? "Lanjutkan Latihan"
                : "Mulai Latihan"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
