"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Trophy,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";

interface Material {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty_level: number;
  is_published: boolean;
  created_at: string;
  videos_count?: number;
  creator: {
    id: number;
    name: string;
  };
}

interface DashboardData {
  materials: {
    total: number;
    completed: number;
    percentage: number;
    items: Material[];
  };
  exercises: {
    total: number;
    completed: number;
    percentage: number;
    items: Array<{
      id: number;
      title: string;
      description: string;
      total_questions: number;
      completed_questions: number;
      progress_percentage: number;
    }>;
  };
  quizzes: {
    total: number;
    completed: number;
    percentage: number;
    average_score: number;
    items: Array<{
      id: number;
      title: string;
      description: string;
      total_questions: number;
      best_score: number | null;
      attempts_count: number;
      passed: boolean;
    }>;
  };
  recent_progress: Array<{
    id: number;
    progress_type: string;
    completed_at: string;
    material?: { id: number; title: string };
    exercise?: { id: number; title: string };
    quiz?: { id: number; title: string };
    score?: number;
  }>;
}

export default function StudentDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("recent");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { buildUrl } = useApi();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await fetch(buildUrl(`/api/student/progress`), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json", // ✅ Wajib untuk response JSON
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("Dashboard data:", data);
        setDashboardData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Gagal memuat data dashboard");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Terjadi kesalahan saat memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 hari yang lalu";
    if (diffDays <= 7) return `${diffDays} hari yang lalu`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`;
    return date.toLocaleDateString("id-ID");
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto py-8">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Memuat dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto py-8">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Gagal Memuat Dashboard
                  </h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchDashboardData}>Coba Lagi</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!dashboardData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto py-8">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Tidak ada data dashboard
              </h3>
              <Button onClick={fetchDashboardData}>Muat Ulang</Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto py-8 space-y-8 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard Pembelajaran
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Selamat datang kembali! Mari lanjutkan perjalanan belajar bahasa
              isyarat Anda
            </p>
          </div>

          {/* Learning Progress Summary */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-l-4 border-l-blue-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Materi Dipelajari
                    </p>
                    <p className="text-3xl font-bold">
                      {dashboardData.materials.completed || 0}/
                      {dashboardData.materials.total || 0}
                    </p>
                    <Progress
                      value={dashboardData.materials.percentage || 0}
                      className="mt-2 bg-white/20"
                    />
                    <p className="mt-2 text-xs text-blue-100">
                      {(dashboardData.materials.percentage || 0).toFixed(0)}%
                      selesai
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-l-4 border-l-green-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Latihan Selesai
                    </p>
                    <p className="text-3xl font-bold">
                      {dashboardData.exercises.completed}/
                      {dashboardData.exercises.total}
                    </p>
                    <Progress
                      value={dashboardData.exercises.percentage}
                      className="mt-2 bg-white/20"
                    />
                    <p className="mt-2 text-xs text-green-100">
                      {dashboardData.exercises.percentage.toFixed(0)}% selesai
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-pink-600 text-white border-l-4 border-l-purple-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      Quiz Selesai
                    </p>
                    <p className="text-3xl font-bold">
                      {dashboardData.quizzes.completed}/
                      {dashboardData.quizzes.total}
                    </p>
                    <Progress
                      value={dashboardData.quizzes.percentage}
                      className="mt-2 bg-white/20"
                    />
                    <p className="mt-2 text-xs text-purple-100">
                      {dashboardData.quizzes.percentage.toFixed(0)}% selesai
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white border-l-4 border-l-amber-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">
                      Nilai Rata-rata
                    </p>
                    <p className="text-3xl font-bold">
                      {dashboardData.quizzes.average_score.toFixed(0)}%
                    </p>
                    <Progress
                      value={dashboardData.quizzes.average_score}
                      className="mt-2 bg-white/20"
                    />
                    <p className="mt-2 text-xs text-amber-100">
                      {dashboardData.quizzes.average_score >= 80
                        ? "Sangat baik"
                        : dashboardData.quizzes.average_score >= 60
                        ? "Baik"
                        : "Perlu ditingkatkan"}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Trophy className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Journey */}
          <Card className="max-w-6xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm border-l-4 border-l-slate-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Perjalanan Belajar Anda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-muted"></div>
                <div className="space-y-8">
                  {/* Materials Progress */}
                  {dashboardData.materials?.items &&
                    dashboardData.materials.items.length > 0 &&
                    dashboardData.materials.items
                      .slice(0, 3)
                      .map((material, index) => (
                        <div key={material.id} className="relative pl-10">
                          <div
                            className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full ${
                              dashboardData.materials.completed > index
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <h3 className="font-medium">{material.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {material.videos_count || 0} video tersedia
                          </p>
                          <div className="mt-2">
                            <Progress
                              value={
                                dashboardData.materials.completed > index
                                  ? 100
                                  : 0
                              }
                              className="h-2"
                            />
                          </div>
                          <div className="mt-2">
                            <Link href={`/student/materials/${material.id}`}>
                              <Button variant="outline" size="sm">
                                {dashboardData.materials.completed > index
                                  ? "Lihat Kembali"
                                  : "Mulai"}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}

                  {/* Exercises Progress */}
                  {dashboardData.exercises?.items &&
                    dashboardData.exercises.items.length > 0 &&
                    dashboardData.exercises.items
                      .slice(0, 2)
                      .map((exercise, index) => (
                        <div key={exercise.id} className="relative pl-10">
                          <div
                            className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full ${
                              exercise.progress_percentage > 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {(dashboardData.materials?.items?.length || 0) +
                              index +
                              1}
                          </div>
                          <h3 className="font-medium">{exercise.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {exercise.completed_questions}/
                            {exercise.total_questions} soal telah dikerjakan
                          </p>
                          <div className="mt-2">
                            <Progress
                              value={exercise.progress_percentage}
                              className="h-2"
                            />
                          </div>
                          <div className="mt-2">
                            <Link href={`/student/exercises/${exercise.id}`}>
                              <Button variant="outline" size="sm">
                                {exercise.progress_percentage > 0
                                  ? "Lanjutkan"
                                  : "Mulai"}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}

                  {/* Quizzes Progress */}
                  {dashboardData.quizzes?.items &&
                    dashboardData.quizzes.items.length > 0 &&
                    dashboardData.quizzes.items
                      .slice(0, 1)
                      .map((quiz, index) => (
                        <div key={quiz.id} className="relative pl-10">
                          <div
                            className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full ${
                              quiz.attempts_count > 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {(dashboardData.materials?.items?.length || 0) +
                              (dashboardData.exercises?.items?.length || 0) +
                              index +
                              1}
                          </div>
                          <h3 className="font-medium">{quiz.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {quiz.attempts_count > 0
                              ? `${
                                  quiz.attempts_count
                                } percobaan • Nilai terbaik: ${
                                  quiz.best_score || 0
                                }%`
                              : "Belum dimulai"}
                          </p>
                          <div className="mt-2">
                            <Link href={`/student/quizzes/${quiz.id}`}>
                              <Button variant="outline" size="sm">
                                {quiz.attempts_count > 0
                                  ? "Lihat Detail"
                                  : "Mulai Quiz"}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}

                  {/* Tampilkan pesan jika tidak ada data */}
                  {(!dashboardData.materials?.items ||
                    dashboardData.materials.items.length === 0) &&
                    (!dashboardData.exercises?.items ||
                      dashboardData.exercises.items.length === 0) &&
                    (!dashboardData.quizzes?.items ||
                      dashboardData.quizzes.items.length === 0) && (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Belum Ada Konten
                        </h3>
                        <p className="text-muted-foreground">
                          Materi pembelajaran akan muncul di sini setelah
                          tersedia
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities & Recommendations */}
          <div className="max-w-6xl mx-auto">
            <Tabs
              defaultValue="recent"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-slate-500 data-[state=active]:text-white"
                >
                  Aktivitas Terbaru
                </TabsTrigger>
                <TabsTrigger
                  value="recommended"
                  className="data-[state=active]:bg-slate-500 data-[state=active]:text-white"
                >
                  Rekomendasi
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {dashboardData.recent_progress &&
                  dashboardData.recent_progress.length > 0 ? (
                    dashboardData.recent_progress
                      .slice(0, 6)
                      .map((activity) => (
                        <Card
                          key={activity.id}
                          className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-green-50/30"
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {activity.progress_type === "quiz" && (
                                <Award className="h-4 w-4" />
                              )}
                              {activity.progress_type === "exercise" && (
                                <FileText className="h-4 w-4" />
                              )}
                              {activity.progress_type === "material" && (
                                <BookOpen className="h-4 w-4" />
                              )}
                              {activity.material?.title ||
                                activity.exercise?.title ||
                                activity.quiz?.title}
                            </CardTitle>
                            <CardDescription>
                              Diselesaikan {formatDate(activity.completed_at)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {activity.score && (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Nilai:
                                  </span>
                                  <span
                                    className={`text-sm font-bold ${getScoreColor(
                                      activity.score
                                    )}`}
                                  >
                                    {activity.score}%
                                  </span>
                                </div>
                                <Progress
                                  value={activity.score}
                                  className="mt-2"
                                />
                              </>
                            )}
                            <p className="mt-2 text-sm text-muted-foreground capitalize">
                              {activity.progress_type} selesai
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Link
                              href={
                                activity.material
                                  ? `/student/materials/${activity.material.id}`
                                  : activity.exercise
                                  ? `/student/exercises/${activity.exercise.id}`
                                  : activity.quiz
                                  ? `/student/quizzes/${activity.quiz.id}`
                                  : "#"
                              }
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Lihat Detail
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">
                        Belum ada aktivitas terbaru
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="recommended" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Recommended Materials */}
                  {dashboardData.materials?.items &&
                    dashboardData.materials.items.length > 0 &&
                    dashboardData.materials.items
                      .filter(
                        (_, index) => index >= dashboardData.materials.completed
                      )
                      .slice(0, 2)
                      .map((material) => (
                        <Card
                          key={material.id}
                          className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-green-50/30"
                        >
                          <CardHeader>
                            <CardTitle>{material.title}</CardTitle>
                            <CardDescription>Belum dipelajari</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="aspect-video rounded-md bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20 flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-green-400" />
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {material.videos_count || 0} video • Estimasi
                              waktu: {(material.videos_count || 0) * 3} menit
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Link
                              href={`/student/materials/${material.id}`}
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Mulai Belajar
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}

                  {/* Recommended Exercises */}
                  {dashboardData.exercises?.items &&
                    dashboardData.exercises.items.length > 0 &&
                    dashboardData.exercises.items
                      .filter((exercise) => exercise.progress_percentage === 0)
                      .slice(0, 2)
                      .map((exercise) => (
                        <Card
                          key={exercise.id}
                          className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-blue-50/30"
                        >
                          <CardHeader>
                            <CardTitle>{exercise.title}</CardTitle>
                            <CardDescription>Belum dikerjakan</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="aspect-video rounded-md bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                              <FileText className="h-12 w-12 text-blue-400" />
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {exercise.total_questions} soal • Estimasi waktu:{" "}
                              {Math.ceil(exercise.total_questions * 1.5)} menit
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Link
                              href={`/student/exercises/${exercise.id}`}
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Mulai Latihan
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}

                  {/* Recommended Quizzes */}
                  {dashboardData.quizzes?.items &&
                    dashboardData.quizzes.items.length > 0 &&
                    dashboardData.quizzes.items
                      .filter((quiz) => quiz.attempts_count === 0)
                      .slice(0, 2)
                      .map((quiz) => (
                        <Card
                          key={quiz.id}
                          className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-purple-50/30"
                        >
                          <CardHeader>
                            <CardTitle>{quiz.title}</CardTitle>
                            <CardDescription>Belum dikerjakan</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="aspect-video rounded-md bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                              <GraduationCap className="h-12 w-12 text-purple-400" />
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {quiz.total_questions} soal • Estimasi waktu:{" "}
                              {Math.ceil(quiz.total_questions * 2)} menit
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Link
                              href={`/student/quizzes/${quiz.id}`}
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Mulai Quiz
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}

                  {/* Tampilkan pesan jika tidak ada rekomendasi */}
                  {(!dashboardData.materials?.items ||
                    dashboardData.materials.items.filter(
                      (_, index) => index >= dashboardData.materials.completed
                    ).length === 0) &&
                    (!dashboardData.exercises?.items ||
                      dashboardData.exercises.items.filter(
                        (e) => e.progress_percentage === 0
                      ).length === 0) &&
                    (!dashboardData.quizzes?.items ||
                      dashboardData.quizzes.items.filter(
                        (q) => q.attempts_count === 0
                      ).length === 0) && (
                      <div className="col-span-full text-center py-8">
                        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Selamat!
                        </h3>
                        <p className="text-muted-foreground">
                          Anda telah menyelesaikan semua materi yang tersedia
                        </p>
                      </div>
                    )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
