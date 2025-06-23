"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  FileText,
  Trophy,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Award,
  Target,
  Activity,
  BarChart3,
  User,
  TrendingUp,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import { useApi } from "@/hooks/use-api"

interface ProgressData {
  total: number
  completed: number
  percentage: number
}

interface QuizProgress extends ProgressData {
  average_score: number
}

interface MyProgress {
  overview: {
    materials: ProgressData
    exercises: ProgressData
    quizzes: QuizProgress
  }
  recent_progress: Array<{
    id: number
    progress_type: string
    completed_at: string
    material?: { title: string }
    exercise?: { title: string }
    quiz?: { title: string }
    score?: number
  }>
  material_progress: Array<{
    id: number
    title: string
    description: string
    difficulty_level: string
    is_completed: boolean
    completed_at: string | null
    progress_percentage: number
    total_videos: number
    completed_videos: number
  }>
  exercise_progress: Array<{
    id: number
    title: string
    description: string
    material_title: string | null
    difficulty_level: string
    is_completed: boolean
    completed_at: string | null
    score: number | null
    max_score: number | null
    attempt_count: number
  }>
  quiz_progress: Array<{
    id: number
    title: string
    description: string
    material_title: string | null
    passing_score: number
    is_completed: boolean
    score: number | null
    max_score: number | null
    completed_at: string | null
    passed: boolean
    attempt_count: number
  }>
}

export default function MyProgressPage() {
  const [myProgress, setMyProgress] = useState<MyProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const { get, post, put, delete: del, buildUrl } = useApi()

  // Pagination state for each tab
  const [materialPage, setMaterialPage] = useState(1)
  const [exercisePage, setExercisePage] = useState(1)
  const [quizPage, setQuizPage] = useState(1)
  const [recentPage, setRecentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchMyProgress()
  }, [])

  const fetchMyProgress = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")

      if (!token) {
        setError("Authentication required")
        toast({
          title: "Authentication Error",
          description: "You must be logged in to view this page",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(buildUrl("/api/student/my-progress"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("My progress data received")
        setMyProgress(data)
      } else {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        setError(errorData.message || "Failed to load progress data")
        toast({
          title: "Error",
          description: errorData.message || "Failed to load progress data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching my progress:", error)
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "Failed to load progress data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getOverallProgress = () => {
    if (!myProgress) return 0
    const { materials, exercises, quizzes } = myProgress.overview
    return Math.round((materials.percentage + exercises.percentage + quizzes.percentage) / 3)
  }

  const getMotivationalMessage = () => {
    const overall = getOverallProgress()
    if (overall >= 90) return "🎉 Luar biasa! Anda hampir sampai di garis akhir!"
    if (overall >= 75) return "🚀 Kemajuan yang hebat! Teruskan kerja yang luar biasa!"
    if (overall >= 50) return "💪 Anda melakukannya dengan baik! Tetap fokus dan terus belajar!"
    if (overall >= 25) return "🌱 Selamat memulai! Setiap langkah penting untuk mencapai tujuan Anda!"
    return "🎯 Selamat datang di perjalanan belajar Anda! Mari kita mulai!"
  }

  // Fixed function to handle null/undefined values
  const getDifficultyColor = (level: string | null | undefined) => {
    if (!level) return "bg-gray-100 text-gray-800 border-gray-200"

    const levelLower = String(level).toLowerCase()

    switch (levelLower) {
      case "easy":
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  // Pagination helpers
  const getPaginatedData = (data: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage
    return data.slice(startIndex, startIndex + itemsPerPage)
  }

  const renderPagination = (currentPage: number, totalItems: number, setPage: (page: number) => void) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center mt-6 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading your progress...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 md:p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchMyProgress}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!myProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 md:p-6">
          <div className="text-center py-16">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">No progress data found</h2>
            <p className="text-gray-600 mt-2">Start your learning journey to see your progress here!</p>
          </div>
        </div>
      </div>
    )
  }

  // Get paginated data for each tab
  const paginatedMaterials = getPaginatedData(myProgress.material_progress, materialPage)
  const paginatedExercises = getPaginatedData(myProgress.exercise_progress, exercisePage)
  const paginatedQuizzes = getPaginatedData(myProgress.quiz_progress, quizPage)
  const paginatedRecent = getPaginatedData(myProgress.recent_progress, recentPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3 justify-between">
            <h1 className="text-5xl font-bold text-gray-900">Progress Belajar</h1>
            <Button onClick={fetchMyProgress} variant="outline" size="sm" className="w-fit">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-100 rounded-xl">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600 text-xl font-bold">{user?.name || "Student"}</p>
              </div>
              {/* <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <Badge className="bg-blue-100 text-blue-800 font-semibold">
                  {getOverallProgress()}% Overall Progress
                </Badge>
              </div> */}
              <p className="text-sm text-gray-600 mt-2 font-medium">{getMotivationalMessage()}</p>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Materials Progress</CardTitle>
              <BookOpen className="h-5 w-5 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myProgress.overview.materials.percentage}%</div>
              <p className="text-xs text-green-200 flex items-center gap-1 mt-1">
                <Target className="h-3 w-3" />
                {myProgress.overview.materials.completed} of {myProgress.overview.materials.total} completed
              </p>
              <Progress value={myProgress.overview.materials.percentage} className="mt-2 bg-green-400" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Exercises Progress</CardTitle>
              <FileText className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myProgress.overview.exercises.percentage}%</div>
              <p className="text-xs text-purple-200 flex items-center gap-1 mt-1">
                <Target className="h-3 w-3" />
                {myProgress.overview.exercises.completed} of {myProgress.overview.exercises.total} completed
              </p>
              <Progress value={myProgress.overview.exercises.percentage} className="mt-2 bg-purple-400" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">Quiz Average</CardTitle>
              <Trophy className="h-5 w-5 text-amber-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myProgress.overview.quizzes.average_score}%</div>
              <p className="text-xs text-amber-200 flex items-center gap-1 mt-1">
                <Award className="h-3 w-3" />
                {myProgress.overview.quizzes.completed} of {myProgress.overview.quizzes.total} completed
              </p>
              <Progress value={myProgress.overview.quizzes.average_score} className="mt-2 bg-amber-400" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Activity className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>Your latest learning activities</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {paginatedRecent.length > 0 ? (
                paginatedRecent.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        {activity.progress_type === "material" && <BookOpen className="h-5 w-5 text-blue-600" />}
                        {activity.progress_type === "exercise" && <FileText className="h-5 w-5 text-green-600" />}
                        {activity.progress_type === "quiz" && <Trophy className="h-5 w-5 text-yellow-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {activity.material?.title || activity.exercise?.title || activity.quiz?.title}
                        </p>
                        <p className="text-sm text-gray-600 capitalize flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {activity.progress_type} completed
                          {activity.score && ` • Score: ${activity.score}%`}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(activity.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">Start learning to see your progress here!</p>
                </div>
              )}

              {myProgress.recent_progress.length > 0 &&
                renderPagination(recentPage, myProgress.recent_progress.length, setRecentPage)}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Progress Tabs */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <BarChart3 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Detailed Progress</CardTitle>
                <CardDescription>Comprehensive breakdown of your learning journey</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="materials" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="materials" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Materials
                </TabsTrigger>
                <TabsTrigger value="exercises" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Exercises
                </TabsTrigger>
                <TabsTrigger value="quizzes" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Quizzes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="materials" className="space-y-4">
                {paginatedMaterials.length > 0 ? (
                  paginatedMaterials.map((material) => (
                    <Card key={material.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{material.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* <Badge className={`${getDifficultyColor(material.difficulty_level)} border`}>
                              {material.difficulty_level}
                            </Badge> */}
                            {material.is_completed ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <Clock className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-800">
                              Videos: {material.completed_videos}/{material.total_videos}
                            </span>
                            <span className={`text-sm font-bold ${getProgressColor(material.progress_percentage)}`}>
                              {material.progress_percentage}%
                            </span>
                          </div>
                          <Progress value={material.progress_percentage} className="h-3 bg-green-200" />
                          {material.completed_at && (
                            <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Completed: {formatDate(material.completed_at)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No materials started yet</p>
                    <p className="text-sm text-gray-400 mt-1">Begin your learning journey with materials!</p>
                  </div>
                )}

                {myProgress.material_progress.length > 0 &&
                  renderPagination(materialPage, myProgress.material_progress.length, setMaterialPage)}
              </TabsContent>

              <TabsContent value="exercises" className="space-y-4">
                {paginatedExercises.length > 0 ? (
                  paginatedExercises.map((exercise) => (
                    <Card key={exercise.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{exercise.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                            {exercise.material_title && (
                              <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                Material: {exercise.material_title}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* <Badge className={`${getDifficultyColor(exercise.difficulty_level)} border`}>
                              {exercise.difficulty_level}
                            </Badge> */}
                            {exercise.is_completed ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <Clock className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-purple-800 font-medium">Attempts:</span>
                              <span className="ml-2 font-bold">{exercise.attempt_count}</span>
                            </div>
                            {exercise.score !== null && exercise.max_score !== null && (
                              <div>
                                <span className="text-purple-800 font-medium">Score:</span>
                                <span className="ml-2 font-bold">
                                  {exercise.score}/{exercise.max_score} (
                                  {Math.round((exercise.score / exercise.max_score) * 100)}%)
                                </span>
                              </div>
                            )}
                          </div>
                          {exercise.completed_at && (
                            <p className="text-xs text-purple-700 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Completed: {formatDate(exercise.completed_at)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No exercises attempted yet</p>
                    <p className="text-sm text-gray-400 mt-1">Practice with exercises to improve your skills!</p>
                  </div>
                )}

                {myProgress.exercise_progress.length > 0 &&
                  renderPagination(exercisePage, myProgress.exercise_progress.length, setExercisePage)}
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-4">
                {paginatedQuizzes.length > 0 ? (
                  paginatedQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="border-l-4 border-l-amber-500">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{quiz.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                            {quiz.material_title && (
                              <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                Material: {quiz.material_title}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {quiz.is_completed ? (
                              quiz.passed ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Lulus
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Tidak Lulus
                                </Badge>
                              )
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Belum Dimulai
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                            <div>
                              <span className="text-amber-800 font-medium">Passing Score:</span>
                              <span className="ml-2 font-bold">{quiz.passing_score}%</span>
                            </div>
                            <div>
                              <span className="text-amber-800 font-medium">Attempts:</span>
                              <span className="ml-2 font-bold">{quiz.attempt_count}</span>
                            </div>
                          </div>
                          {quiz.score !== null && quiz.max_score !== null && (
                            <div className="mb-2">
                              <span className={`text-sm font-bold ${quiz.passed ? "text-green-600" : "text-red-600"}`}>
                                Score: {quiz.score}/{quiz.max_score} ({Math.round((quiz.score / quiz.max_score) * 100)}
                                %)
                              </span>
                            </div>
                          )}
                          {quiz.completed_at && (
                            <p className="text-xs text-amber-700 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Completed: {formatDate(quiz.completed_at)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No quizzes taken yet</p>
                    <p className="text-sm text-gray-400 mt-1">Test your knowledge with quizzes!</p>
                  </div>
                )}

                {myProgress.quiz_progress.length > 0 &&
                  renderPagination(quizPage, myProgress.quiz_progress.length, setQuizPage)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
