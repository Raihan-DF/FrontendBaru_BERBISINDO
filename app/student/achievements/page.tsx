"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/use-api";

interface ProgressData {
  total: number;
  completed: number;
  percentage: number;
}

interface QuizProgress extends ProgressData {
  average_score: number;
}

interface MyProgress {
  overview: {
    materials: ProgressData;
    exercises: ProgressData;
    quizzes: QuizProgress;
  };
  recent_progress: Array<{
    id: number;
    progress_type: string;
    completed_at: string;
    material?: { title: string };
    exercise?: { title: string };
    quiz?: { title: string };
    score?: number;
  }>;
  material_progress: Array<{
    id: number;
    title: string;
    description: string;
    difficulty_level: string;
    is_completed: boolean;
    completed_at: string | null;
    progress_percentage: number;
    total_videos: number;
    completed_videos: number;
  }>;
  exercise_progress: Array<{
    id: number;
    title: string;
    description: string;
    material_title: string | null;
    difficulty_level: string;
    is_completed: boolean;
    completed_at: string | null;
    score: number | null;
    max_score: number | null;
    attempt_count: number;
  }>;
  quiz_progress: Array<{
    id: number;
    title: string;
    description: string;
    material_title: string | null;
    passing_score: number;
    is_completed: boolean;
    score: number | null;
    max_score: number | null;
    completed_at: string | null;
    passed: boolean;
    attempt_count: number;
  }>;
}

export default function MyProgressPage() {
  const [myProgress, setMyProgress] = useState<MyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { get, post, put, delete: del, buildUrl } = useApi();

  // Pagination state for each tab
  const [materialPage, setMaterialPage] = useState(1);
  const [exercisePage, setExercisePage] = useState(1);
  const [quizPage, setQuizPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchMyProgress();
  }, []);

  const fetchMyProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Autentikasi diperlukan");
        toast({
          title: "Error Autentikasi",
          description: "Anda harus login untuk melihat halaman ini",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(buildUrl("/api/student/my-progress"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("My progress data received");
        setMyProgress(data);
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        setError(errorData.message || "Gagal memuat data progress");
        toast({
          title: "Error",
          description: errorData.message || "Gagal memuat data progress",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching my progress:", error);
      setError("Terjadi kesalahan yang tidak terduga");
      toast({
        title: "Error",
        description: "Gagal memuat data progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tidak pernah";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("id-ID") + " " + date.toLocaleTimeString("id-ID")
    );
  };

  const getOverallProgress = () => {
    if (!myProgress) return 0;
    const { materials, exercises, quizzes } = myProgress.overview;
    return Math.round(
      (materials.percentage + exercises.percentage + quizzes.percentage) / 3
    );
  };

  const getMotivationalMessage = () => {
    const overall = getOverallProgress();
    if (overall >= 90)
      return "🎉 Luar biasa! Anda hampir sampai di garis akhir!";
    if (overall >= 75)
      return "🚀 Kemajuan yang hebat! Teruskan kerja yang luar biasa!";
    if (overall >= 50)
      return "💪 Anda melakukannya dengan baik! Tetap fokus dan terus belajar!";
    if (overall >= 25)
      return "🌱 Selamat memulai! Setiap langkah penting untuk mencapai tujuan Anda!";
    return "🎯 Selamat datang di perjalanan belajar Anda! Mari kita mulai!";
  };

  // Fixed function to handle null/undefined values
  const getDifficultyColor = (level: string | null | undefined) => {
    if (!level) return "bg-gray-100 text-gray-800 border-gray-200";

    const levelLower = String(level).toLowerCase();

    switch (levelLower) {
      case "easy":
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Pagination helpers
  const getPaginatedData = (data: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const renderPagination = (
    currentPage: number,
    totalItems: number,
    setPage: (page: number) => void
  ) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
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
          Selanjutnya <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Memuat progress Anda...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="container mx-auto p-4 md:p-6">
          <Card className="border-red-200 bg-red-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Error Memuat Data
                </h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  onClick={fetchMyProgress}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!myProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="container mx-auto p-4 md:p-6">
          <div className="text-center py-16">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              Data progress tidak ditemukan
            </h2>
            <p className="text-gray-600 mt-2">
              Mulai perjalanan belajar Anda untuk melihat progress di sini!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get paginated data for each tab
  const paginatedMaterials = getPaginatedData(
    myProgress.material_progress,
    materialPage
  );
  const paginatedExercises = getPaginatedData(
    myProgress.exercise_progress,
    exercisePage
  );
  const paginatedQuizzes = getPaginatedData(myProgress.quiz_progress, quizPage);
  const paginatedRecent = getPaginatedData(
    myProgress.recent_progress,
    recentPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Progress Belajar
            </h1>
            <Button
              onClick={fetchMyProgress}
              variant="outline"
              size="sm"
              className="w-fit"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-100 rounded-xl">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 text-xl font-bold mb-2">
                {user?.name || "Siswa"}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                {getMotivationalMessage()}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Progress Materi
              </CardTitle>
              <BookOpen className="h-5 w-5 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {myProgress.overview.materials.percentage}%
              </div>
              <p className="text-xs text-green-200 flex items-center gap-1 mt-1">
                <Target className="h-3 w-3" />
                {myProgress.overview.materials.completed} dari{" "}
                {myProgress.overview.materials.total} selesai
              </p>
              <Progress
                value={myProgress.overview.materials.percentage}
                className="mt-2 bg-green-400"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Progress Latihan
              </CardTitle>
              <FileText className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {myProgress.overview.exercises.percentage}%
              </div>
              <p className="text-xs text-purple-200 flex items-center gap-1 mt-1">
                <Target className="h-3 w-3" />
                {myProgress.overview.exercises.completed} dari{" "}
                {myProgress.overview.exercises.total} selesai
              </p>
              <Progress
                value={myProgress.overview.exercises.percentage}
                className="mt-2 bg-purple-400"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">
                Rata-rata Quiz
              </CardTitle>
              <Trophy className="h-5 w-5 text-amber-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {myProgress.overview.quizzes.average_score}%
              </div>
              <p className="text-xs text-amber-200 flex items-center gap-1 mt-1">
                <Award className="h-3 w-3" />
                {myProgress.overview.quizzes.completed} dari{" "}
                {myProgress.overview.quizzes.total} selesai
              </p>
              <Progress
                value={myProgress.overview.quizzes.average_score}
                className="mt-2 bg-amber-400"
              />
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
                <CardTitle className="text-xl">Aktivitas Terkini</CardTitle>
                <CardDescription>
                  Aktivitas belajar terbaru Anda
                </CardDescription>
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
                        {activity.progress_type === "material" && (
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        )}
                        {activity.progress_type === "exercise" && (
                          <FileText className="h-5 w-5 text-green-600" />
                        )}
                        {activity.progress_type === "quiz" && (
                          <Trophy className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-2 text-sm sm:text-base font-semibold text-gray-900 break-words overflow-hidden text-ellipsis">
                          {activity.material?.title ||
                            activity.exercise?.title ||
                            activity.quiz?.title}
                        </p>

                        <p className="text-sm text-gray-600 capitalize flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {activity.progress_type === "material"
                            ? "Materi"
                            : activity.progress_type === "exercise"
                            ? "Latihan"
                            : "Quiz"}{" "}
                          selesai
                          {activity.score && ` • Nilai: ${activity.score}%`}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(activity.completed_at).toLocaleDateString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada aktivitas terkini</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Mulai belajar untuk melihat progress Anda di sini!
                  </p>
                </div>
              )}

              {myProgress.recent_progress.length > 0 &&
                renderPagination(
                  recentPage,
                  myProgress.recent_progress.length,
                  setRecentPage
                )}
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
                <CardTitle className="text-xl">Progress Detail</CardTitle>
                <CardDescription>
                  Rincian lengkap perjalanan belajar Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="materials" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger
                  value="materials"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Materi
                </TabsTrigger>
                <TabsTrigger
                  value="exercises"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Latihan
                </TabsTrigger>
                <TabsTrigger
                  value="quizzes"
                  className="flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Quiz
                </TabsTrigger>
              </TabsList>

              <TabsContent value="materials" className="space-y-6">
                {paginatedMaterials.length > 0 ? (
                  paginatedMaterials.map((material) => (
                    <Card
                      key={material.id}
                      className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 break-words line-clamp-2">
                              {material.title}
                            </h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                              {material.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {material.is_completed ? (
                              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <span className="text-green-800 font-semibold">
                                  Selesai
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                                <Clock className="h-6 w-6 text-gray-400" />
                                <span className="text-gray-600 font-semibold">
                                  Berlangsung
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-green-800 font-semibold text-sm">
                              Video: {material.completed_videos}/
                              {material.total_videos}
                            </span>
                            <span
                              className={`text-sm font-semibold ${getProgressColor(
                                material.progress_percentage
                              )}`}
                            >
                              {material.progress_percentage}%
                            </span>
                          </div>
                          <Progress
                            value={material.progress_percentage}
                            className="h-3 bg-green-200 mb-4"
                          />
                          {material.completed_at && (
                            <p className="text-xs text-green-700 flex items-center gap-1 mt-2">
                              <Calendar className="h-3 w-3" />
                              Selesai: {formatDate(material.completed_at)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                    <p className="text-gray-600 text-2xl font-semibold">
                      Belum ada materi yang dimulai
                    </p>
                    <p className="text-gray-400 mt-2 text-lg">
                      Mulai perjalanan belajar Anda dengan materi!
                    </p>
                  </div>
                )}

                {myProgress.material_progress.length > 0 &&
                  renderPagination(
                    materialPage,
                    myProgress.material_progress.length,
                    setMaterialPage
                  )}
              </TabsContent>

              <TabsContent value="exercises" className="space-y-6">
                {paginatedExercises.length > 0 ? (
                  paginatedExercises.map((exercise) => (
                    <Card
                      key={exercise.id}
                      className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 break-words line-clamp-2">
                              {exercise.title}
                            </h3>
                            <p className="text-gray-600 text-base leading-relaxed mb-3">
                              {exercise.description}
                            </p>
                            {exercise.material_title && (
                              <p className="text-blue-600 font-medium flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl w-fit">
                                <BookOpen className="h-4 w-4" />
                                Materi: {exercise.material_title}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {exercise.is_completed ? (
                              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <span className="text-green-800 font-semibold">
                                  Selesai
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                                <Clock className="h-6 w-6 text-gray-400" />
                                <span className="text-gray-600 font-semibold">
                                  Berlangsung
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <span className="text-purple-800 font-medium text-sm block mb-1">
                                Percobaan:
                              </span>
                              <span className="text-lg font-semibold text-purple-600">
                                {exercise.attempt_count}
                              </span>
                            </div>
                            {exercise.score !== null &&
                              exercise.max_score !== null && (
                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                  <span className="text-purple-800 font-medium text-sm block mb-1">
                                    Nilai:
                                  </span>
                                  <span className="text-lg font-semibold text-purple-600">
                                    {exercise.score}/{exercise.max_score}
                                  </span>
                                  <span className="text-sm text-purple-600 ml-2">
                                    (
                                    {Math.round(
                                      (exercise.score / exercise.max_score) *
                                        100
                                    )}
                                    %)
                                  </span>
                                </div>
                              )}
                          </div>
                          {exercise.completed_at && (
                            <p className="text-purple-700 font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Selesai: {formatDate(exercise.completed_at)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                    <p className="text-gray-600 text-2xl font-semibold">
                      Belum ada latihan yang dicoba
                    </p>
                    <p className="text-gray-400 mt-2 text-lg">
                      Berlatih dengan latihan untuk meningkatkan kemampuan Anda!
                    </p>
                  </div>
                )}

                {myProgress.exercise_progress.length > 0 &&
                  renderPagination(
                    exercisePage,
                    myProgress.exercise_progress.length,
                    setExercisePage
                  )}
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-6">
                {paginatedQuizzes.length > 0 ? (
                  paginatedQuizzes.map((quiz) => (
                    <Card
                      key={quiz.id}
                      className="border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 break-words line-clamp-2">
                              {quiz.title}
                            </h3>
                            <p className="text-gray-600 text-base leading-relaxed mb-3">
                              {quiz.description}
                            </p>
                            {quiz.material_title && (
                              <p className="text-blue-600 font-medium flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl w-fit">
                                <BookOpen className="h-4 w-4" />
                                Materi: {quiz.material_title}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {quiz.is_completed ? (
                              quiz.passed ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-base font-semibold">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Lulus
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 border-red-200 px-4 py-2 text-base font-semibold">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Tidak Lulus
                                </Badge>
                              )
                            ) : (
                              <Badge
                                variant="secondary"
                                className="px-4 py-2 text-base font-semibold"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Belum Dimulai
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <span className="text-amber-800 font-medium text-sm block mb-1">
                                Nilai Lulus:
                              </span>
                              <span className="text-lg font-semibold text-amber-600">
                                {quiz.passing_score}%
                              </span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <span className="text-amber-800 font-medium text-sm block mb-1">
                                Percobaan:
                              </span>
                              <span className="text-lg font-semibold text-amber-600">
                                {quiz.attempt_count}
                              </span>
                            </div>
                          </div>
                          {quiz.score !== null && quiz.max_score !== null && (
                            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                              <span className="text-amber-800 font-medium text-sm block mb-2">
                                Nilai Akhir:
                              </span>
                              <span
                                className={`text-2xl font-semibold ${
                                  quiz.passed
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {quiz.score}/{quiz.max_score}
                              </span>
                              <span
                                className={`text-sm ml-3 font-semibold ${
                                  quiz.passed
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                (
                                {Math.round(
                                  (quiz.score / quiz.max_score) * 100
                                )}
                                %)
                              </span>
                            </div>
                          )}
                          {quiz.completed_at && (
                            <p className="text-amber-700 font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Selesai: {formatDate(quiz.completed_at)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Trophy className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                    <p className="text-gray-600 text-2xl font-semibold">
                      Belum ada quiz yang dikerjakan
                    </p>
                    <p className="text-gray-400 mt-2 text-lg">
                      Uji pengetahuan Anda dengan quiz!
                    </p>
                  </div>
                )}

                {myProgress.quiz_progress.length > 0 &&
                  renderPagination(
                    quizPage,
                    myProgress.quiz_progress.length,
                    setQuizPage
                  )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
