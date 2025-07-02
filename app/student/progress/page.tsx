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
  Brain,
  Loader2,
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
              className="w-fit bg-transparent"
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
                {user?.name || "Pengguna"}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                {getMotivationalMessage()}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-[#06D7A0] to-[#108AB1] dark:from-[#073A4B] dark:to-[#0A3F52] text-white border-0 shadow-lg">
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
                className="mt-2 bg-green-200"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#06b6d4] to-[#0284c7] dark:from-[#0e7490] dark:to-[#075985] text-white border-0 shadow-lg">
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
                className="mt-2 bg-blue-300"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#f472b6] to-[#8B5CF6] dark:from-[#be185d] dark:to-[#7c3aed] text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Rata-rata Quiz
              </CardTitle>
              <Trophy className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {myProgress.overview.quizzes.average_score}%
              </div>
              <p className="text-xs text-purple-200 flex items-center gap-1 mt-1">
                <Award className="h-3 w-3" />
                {myProgress.overview.quizzes.completed} dari{" "}
                {myProgress.overview.quizzes.total} selesai
              </p>
              <Progress
                value={myProgress.overview.quizzes.average_score}
                className="mt-2 bg-purple-200"
              />
            </CardContent>
          </Card>
        </div>
        {/* Detailed Progress Tabs with Responsive Horizontal Scroll */}
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

              <TabsContent value="materials" className="space-y-4">
                {myProgress.material_progress.length > 0 ? (
                  <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex space-x-3 min-w-max">
                      {myProgress.material_progress.map((material) => (
                        <Card
                          key={material.id}
                          className="w-[280px] xs:w-[300px] sm:w-[320px] flex-shrink-0 border-l-4 border-l-[#0e7490] shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight">
                                  {material.title}
                                </h3>
                                {material.is_completed ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1 flex-shrink-0">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Selesai
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-1 flex-shrink-0"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Berlangsung
                                  </Badge>
                                )}
                              </div>

                              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-green-800 font-medium text-xs">
                                    Video: {material.completed_videos}/
                                    {material.total_videos}
                                  </span>
                                  <span
                                    className={`text-xs font-bold ${getProgressColor(
                                      material.progress_percentage
                                    )}`}
                                  >
                                    {material.progress_percentage}%
                                  </span>
                                </div>
                                <Progress
                                  value={material.progress_percentage}
                                  className="h-2 bg-green-200"
                                />
                                {material.completed_at && (
                                  <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span className="truncate">
                                      {new Date(
                                        material.completed_at
                                      ).toLocaleDateString("id-ID")}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      Belum ada materi yang dimulai
                    </p>
                    <p className="text-gray-400 mt-1">
                      Mulai perjalanan belajar Anda dengan materi!
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="exercises" className="space-y-4">
                {myProgress.exercise_progress.length > 0 ? (
                  <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex space-x-3 min-w-max">
                      {myProgress.exercise_progress.map((exercise) => (
                        <Card
                          key={exercise.id}
                          className="w-[280px] xs:w-[300px] sm:w-[320px] flex-shrink-0 border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight">
                                  {exercise.title}
                                </h3>
                                {exercise.is_completed ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1 flex-shrink-0">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Selesai
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-1 flex-shrink-0"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Berlangsung
                                  </Badge>
                                )}
                              </div>

                              {exercise.material_title && (
                                <p className="text-blue-600 text-xs font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded truncate">
                                  <BookOpen className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {exercise.material_title}
                                  </span>
                                </p>
                              )}

                              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-blue-800 font-medium">
                                      Percobaan:
                                    </span>
                                    <span className="ml-1 font-bold">
                                      {exercise.attempt_count}
                                    </span>
                                  </div>
                                  {exercise.score !== null &&
                                    exercise.max_score !== null && (
                                      <div>
                                        <span className="text-blue-800 font-medium">
                                          Nilai:
                                        </span>
                                        <div className="font-bold text-xs">
                                          {exercise.score}/{exercise.max_score}
                                          <span className="block">
                                            (
                                            {Math.round(
                                              (exercise.score /
                                                exercise.max_score) *
                                                100
                                            )}
                                            %)
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                </div>
                                {exercise.completed_at && (
                                  <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {new Date(
                                        exercise.completed_at
                                      ).toLocaleDateString("id-ID")}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      Belum ada latihan yang dicoba
                    </p>
                    <p className="text-gray-400 mt-1">
                      Berlatih dengan latihan untuk meningkatkan kemampuan Anda!
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-4">
                {myProgress.quiz_progress.length > 0 ? (
                  <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex space-x-3 min-w-max">
                      {myProgress.quiz_progress.map((quiz) => (
                        <Card
                          key={quiz.id}
                          className="w-[280px] xs:w-[300px] sm:w-[320px] flex-shrink-0 border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight">
                                  {quiz.title}
                                </h3>
                                {quiz.is_completed ? (
                                  quiz.passed ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1 flex-shrink-0">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Lulus
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-1 flex-shrink-0">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Gagal
                                    </Badge>
                                  )
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-1 flex-shrink-0"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Belum Mulai
                                  </Badge>
                                )}
                              </div>

                              {quiz.material_title && (
                                <p className="text-purple-600 text-xs font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded truncate">
                                  <BookOpen className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {quiz.material_title}
                                  </span>
                                </p>
                              )}

                              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="text-purple-800">
                                    <span className="font-medium">
                                      Nilai Lulus:
                                    </span>
                                    <span className="ml-1 font-bold">
                                      {quiz.passing_score}%
                                    </span>
                                  </div>
                                  <div className="text-purple-800">
                                    <span className="font-medium">
                                      Percobaan:
                                    </span>
                                    <span className="ml-1 font-bold">
                                      {quiz.attempt_count}
                                    </span>
                                  </div>
                                </div>

                                {quiz.score !== null &&
                                  quiz.max_score !== null && (
                                    <div className="text-xs text-purple-800">
                                      <span className="font-medium">
                                        Nilai:
                                      </span>
                                      <span
                                        className={`ml-1 font-bold ${
                                          quiz.passed
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {quiz.score}/{quiz.max_score}
                                      </span>
                                    </div>
                                  )}

                                {quiz.completed_at && (
                                  <div className="flex items-center gap-1 text-xs text-purple-700">
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {new Date(
                                        quiz.completed_at
                                      ).toLocaleDateString("id-ID")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      Belum ada quiz yang dikerjakan
                    </p>
                    <p className="text-gray-400 mt-1">
                      Uji pengetahuan Anda dengan quiz!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
              {myProgress.recent_progress.length > 0 ? (
                myProgress.recent_progress.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        {activity.progress_type === "material" && (
                          <BookOpen className="h-5 w-5 text-[#06b6d4]" />
                        )}
                        {activity.progress_type === "exercise" && (
                          <FileText className="h-5 w-5 text-blue-600" />
                        )}
                        {activity.progress_type === "quiz" && (
                          <Trophy className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-2 text-sm sm:text-base font-semibold text-gray-900 break-words overflow-hidden text-ellipsis">
                          {activity.material?.title ||
                            activity.exercise?.title ||
                            activity.quiz?.title}
                        </p>
                        <p className="text-sm text-gray-600 capitalize flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-[#06b6d4]" />
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
