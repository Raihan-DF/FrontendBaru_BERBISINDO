"use client";

import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/use-api";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  Trophy,
  TrendingUp,
  AlertCircle,
  User,
  ChevronRight,
  Play,
  FileText,
  Award,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface Exercise {
  id: number;
  title: string;
  description: string;
  total_questions: number;
  completed_questions?: number;
  progress_percentage?: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  material_id?: number;
  time_limit: number;
  total_questions: number;
  total_points: number;
  difficulty_level: number;
  is_published: boolean | number | string;
  created_at: string;
  updated_at: string;
  creator_id: number;
  creator?: {
    id: number;
    name: string;
  };
  material?: {
    id: number;
    title: string;
  };
  is_completed?: boolean;
  score?: number;
  attempt_count?: number;
  max_attempts?: number;
  best_score?: number;
  last_attempt_at?: string;
}

interface StudentProgress {
  id: number;
  progress_type: string;
  completed_at: string;
  material?: { id: number; title: string };
  exercise?: { id: number; title: string };
  quiz?: { id: number; title: string };
  score?: number;
  is_completed?: boolean;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  materials_count?: number;
  exercises_count?: number;
  quizzes_count?: number;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  score?: number;
  completed_at: string;
  thumbnail?: string;
}

interface DashboardStats {
  materials: {
    total: number;
    completed: number;
    in_progress: number;
    percentage: number;
    items: Material[];
  };
  exercises: {
    total: number;
    completed: number;
    average_score: number;
    percentage: number;
    items: Exercise[];
  };
  quizzes: {
    total: number;
    completed: number;
    average_score: number;
    percentage: number;
    items: Quiz[];
  };
  teachers: Teacher[];
  recent_activities: RecentActivity[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { buildUrl } = useApi();
  const { toast } = useToast();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Fetch materials
      const materialsResponse = await fetch(buildUrl("/api/materials"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (materialsResponse.status === 401) {
        toast({
          title: "Session Expired",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      let materials: Material[] = [];
      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        const materialsArray = materialsData.data || [];

        // Fetch video count for each material
        materials = await Promise.all(
          materialsArray.map(async (material: Material) => {
            try {
              const videoResponse = await fetch(
                buildUrl(`/api/materials/${material.id}/videos`),
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              if (videoResponse.ok) {
                const videoData = await videoResponse.json();
                return {
                  ...material,
                  videos_count: videoData.data ? videoData.data.length : 0,
                };
              }

              return { ...material, videos_count: 0 };
            } catch (error) {
              console.error(
                `Error fetching videos for material ${material.id}:`,
                error
              );
              return { ...material, videos_count: 0 };
            }
          })
        );
      }

      // Fetch exercises
      let exercises: Exercise[] = [];
      try {
        const exercisesResponse = await fetch(buildUrl("/api/exercises"), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (exercisesResponse.ok) {
          const exercisesData = await exercisesResponse.json();
          exercises = exercisesData.data || [];
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }

      // Fetch quizzes - Using the same pattern as your example
      let quizzes: Quiz[] = [];
      try {
        const quizzesResponse = await fetch(buildUrl("/api/quizzes"), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (quizzesResponse.ok) {
          const data = await quizzesResponse.json();
          console.log("Data quiz dari API:", data);

          // Handle different response formats like in your example
          if (data && !Array.isArray(data)) {
            if (data.data && Array.isArray(data.data)) {
              quizzes = data.data;
            } else if (data.quizzes && Array.isArray(data.quizzes)) {
              quizzes = data.quizzes;
            } else if (typeof data === "object") {
              quizzes = Object.values(data);
            } else {
              console.error("Format data quiz tidak dikenali:", data);
              quizzes = [];
            }
          } else {
            quizzes = data || [];
          }

          // Filter only published quizzes
          quizzes = quizzes.filter((quiz: Quiz) => {
            return (
              quiz.is_published === true ||
              quiz.is_published === 1 ||
              quiz.is_published === "1"
            );
          });
          console.log("Total quiz published:", quizzes.length);
        } else {
          console.error("Failed to fetch quizzes:", quizzesResponse.status);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }

      // Fetch student progress - Updated to get more comprehensive data
      let studentProgress: StudentProgress[] = [];
      let progressOverview: any = null;
      try {
        // Try to get progress overview first
        const progressOverviewResponse = await fetch(
          buildUrl("/api/student/progress"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (progressOverviewResponse.ok) {
          const progressData = await progressOverviewResponse.json();
          progressOverview = progressData;
          studentProgress = progressData.recent_progress || [];
          console.log("Progress overview:", progressOverview);
        }

        // If that doesn't work, try the alternative endpoint
        if (!progressOverview) {
          const myProgressResponse = await fetch(
            buildUrl("/api/student/my-progress"),
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          if (myProgressResponse.ok) {
            const myProgressData = await myProgressResponse.json();
            progressOverview = myProgressData;
            studentProgress = myProgressData.recent_progress || [];
            console.log("My progress data:", progressOverview);
          }
        }
      } catch (error) {
        console.error("Error fetching student progress:", error);
      }

      // Calculate materials statistics
      let completedMaterials = 0;
      let materialsPercentage = 0;

      if (
        progressOverview &&
        progressOverview.overview &&
        progressOverview.overview.materials
      ) {
        completedMaterials = progressOverview.overview.materials.completed || 0;
        materialsPercentage =
          progressOverview.overview.materials.percentage || 0;
      } else {
        // Fallback calculation
        completedMaterials = studentProgress.filter(
          (p) => p.progress_type === "material" && p.is_completed === true
        ).length;
        materialsPercentage =
          materials.length > 0
            ? Math.round((completedMaterials / materials.length) * 100)
            : 0;
      }

      // Calculate exercises statistics
      let completedExercises = 0;
      let exercisesPercentage = 0;
      let exerciseAverageScore = 0;

      if (
        progressOverview &&
        progressOverview.overview &&
        progressOverview.overview.exercises
      ) {
        completedExercises = progressOverview.overview.exercises.completed || 0;
        exercisesPercentage =
          progressOverview.overview.exercises.percentage || 0;
        // Calculate average score from progress data if available
        const exerciseScores = studentProgress
          .filter(
            (p) =>
              p.progress_type === "exercise" &&
              p.score !== undefined &&
              p.score !== null
          )
          .map((p) => p.score!);
        exerciseAverageScore =
          exerciseScores.length > 0
            ? Math.round(
                exerciseScores.reduce((sum, score) => sum + score, 0) /
                  exerciseScores.length
              )
            : 0;
      } else {
        // Fallback calculation
        completedExercises = studentProgress.filter(
          (p) => p.progress_type === "exercise" && p.is_completed === true
        ).length;
        exercisesPercentage =
          exercises.length > 0
            ? Math.round((completedExercises / exercises.length) * 100)
            : 0;

        const exerciseScores = studentProgress
          .filter(
            (p) =>
              p.progress_type === "exercise" &&
              p.score !== undefined &&
              p.score !== null
          )
          .map((p) => p.score!);
        exerciseAverageScore =
          exerciseScores.length > 0
            ? Math.round(
                exerciseScores.reduce((sum, score) => sum + score, 0) /
                  exerciseScores.length
              )
            : 0;
      }

      // Calculate quizzes statistics - Fixed logic with proper quiz count
      let completedQuizzes = 0;
      let quizzesPercentage = 0;
      let quizAverageScore = 0;

      if (
        progressOverview &&
        progressOverview.overview &&
        progressOverview.overview.quizzes
      ) {
        completedQuizzes = progressOverview.overview.quizzes.completed || 0;
        quizAverageScore = progressOverview.overview.quizzes.average_score || 0;
      } else {
        // Fallback calculation - count unique completed quizzes
        const completedQuizIds = new Set();
        studentProgress
          .filter(
            (p) =>
              p.progress_type === "quiz" &&
              p.is_completed === true &&
              p.quiz?.id
          )
          .forEach((p) => completedQuizIds.add(p.quiz!.id));

        completedQuizzes = completedQuizIds.size;

        // Calculate quiz average score
        const quizScores = studentProgress
          .filter(
            (p) =>
              p.progress_type === "quiz" &&
              p.score !== undefined &&
              p.score !== null
          )
          .map((p) => p.score!);
        quizAverageScore =
          quizScores.length > 0
            ? Math.round(
                quizScores.reduce((sum, score) => sum + score, 0) /
                  quizScores.length
              )
            : 0;
      }

      // Calculate quiz percentage based on actual quiz count
      quizzesPercentage =
        quizzes.length > 0
          ? Math.round((completedQuizzes / quizzes.length) * 100)
          : 0;

      console.log("Quiz statistics:", {
        totalQuizzes: quizzes.length,
        completedQuizzes,
        quizzesPercentage,
        quizAverageScore,
      });

      // Fetch teachers (users with teacher role)
      let teachers: Teacher[] = [];
      try {
        const teachersResponse = await fetch(buildUrl("/api/user"), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (teachersResponse.ok) {
          const userData = await teachersResponse.json();
          // For now, we'll create mock teachers data since we need to implement proper teacher fetching
          teachers = [
            {
              id: 1,
              name: "Dr. Sarah Johnson",
              email: "sarah@example.com",
              materials_count: 5,
              exercises_count: 3,
              quizzes_count: 2,
            },
            {
              id: 2,
              name: "Prof. Ahmad Rahman",
              email: "ahmad@example.com",
              materials_count: 4,
              exercises_count: 6,
              quizzes_count: 3,
            },
            {
              id: 3,
              name: "Ms. Lisa Chen",
              email: "lisa@example.com",
              materials_count: 3,
              exercises_count: 4,
              quizzes_count: 2,
            },
            {
              id: 4,
              name: "Mr. David Wilson",
              email: "david@example.com",
              materials_count: 6,
              exercises_count: 2,
              quizzes_count: 4,
            },
          ];
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }

      // Convert student progress to recent activities
      const recentActivities: RecentActivity[] = studentProgress
        .slice(0, 10)
        .map((progress) => ({
          id: progress.id,
          type: progress.progress_type,
          title:
            progress.material?.title ||
            progress.exercise?.title ||
            progress.quiz?.title ||
            "Unknown Activity",
          score: progress.score,
          completed_at: progress.completed_at,
        }));

      // Create dashboard stats with real data
      const dashboardStats: DashboardStats = {
        materials: {
          total: materials.length,
          completed: completedMaterials,
          in_progress: 0, // This would need additional API endpoint to track
          percentage: materialsPercentage,
          items: materials,
        },
        exercises: {
          total: exercises.length,
          completed: completedExercises,
          average_score: exerciseAverageScore,
          percentage: exercisesPercentage,
          items: exercises,
        },
        quizzes: {
          total: quizzes.length, // Now correctly shows total published quizzes
          completed: completedQuizzes, // Shows unique completed quizzes
          average_score: quizAverageScore,
          percentage: quizzesPercentage,
          items: quizzes,
        },
        teachers,
        recent_activities: recentActivities,
      };

      console.log("Final dashboard stats:", dashboardStats);
      setStats(dashboardStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Terjadi kesalahan saat memuat data dashboard");
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">
            Selamat Datang, {user?.name}! 👋
          </h1>
          <p className="text-slate-600">
            Mari lanjutkan perjalanan belajar bahasa isyarat Anda
          </p>
        </div>
        {/* Quick Stats Summary - Fixed Quiz Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Materi</p>
                  <p className="text-2xl font-bold">
                    {stats?.materials.completed || 0}/
                    {stats?.materials.total || 0}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
              <Progress
                value={stats?.materials.percentage || 0}
                className="mt-2 bg-blue-400/30"
              />
              <p className="text-xs text-blue-100 mt-1">
                {stats?.materials.percentage || 0}% selesai
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Latihan</p>
                  <p className="text-2xl font-bold">
                    {stats?.exercises.completed || 0}/
                    {stats?.exercises.total || 0}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-green-200" />
              </div>
              <Progress
                value={stats?.exercises.percentage || 0}
                className="mt-2 bg-green-400/30"
              />
              <p className="text-xs text-green-100 mt-1">
                Rata-rata: {stats?.exercises.average_score || 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Quiz</p>
                  <p className="text-2xl font-bold">
                    {stats?.quizzes.completed || 0}/{stats?.quizzes.total || 0}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-purple-200" />
              </div>
              <Progress
                value={stats?.quizzes.percentage || 0}
                className="mt-2 bg-purple-400/30"
              />
              <p className="text-xs text-purple-100 mt-1">
                Rata-rata: {stats?.quizzes.average_score || 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Nilai Keseluruhan</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      ((stats?.exercises.average_score || 0) +
                        (stats?.quizzes.average_score || 0)) /
                        2
                    )}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
              <Progress
                value={Math.round(
                  ((stats?.exercises.average_score || 0) +
                    (stats?.quizzes.average_score || 0)) /
                    2
                )}
                className="mt-2 bg-orange-400/30"
              />
              <p className="text-xs text-orange-100 mt-1">
                {Math.round(
                  ((stats?.exercises.average_score || 0) +
                    (stats?.quizzes.average_score || 0)) /
                    2
                ) >= 80
                  ? "Sangat baik"
                  : Math.round(
                      ((stats?.exercises.average_score || 0) +
                        (stats?.quizzes.average_score || 0)) /
                        2
                    ) >= 60
                  ? "Baik"
                  : "Perlu ditingkatkan"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Discover Materials Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Materi</h2>
            <Link
              href="/student/materials"
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat semua <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-4 min-w-max">
              {stats?.materials?.items?.slice(0, 5).map((material) => (
                <Card
                  key={material.id}
                  className="min-w-[280px] max-w-[280px] flex-shrink-0 shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      {material.thumbnail ? (
                        <img
                          src={
                            buildUrl(`/storage/${material.thumbnail}`) ||
                            "/placeholder.svg"
                          }
                          alt={material.title}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                        {material.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {material.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6 mb-1">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                            {getInitials(material.creator.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-500 mb-1">
                          {material.creator.name}
                        </span>
                      </div>
                      <Link href={`/student/materials/${material.id}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Mulai Belajar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!stats?.materials?.items ||
                stats.materials.items.length === 0) && (
                <div className="min-w-[280px] flex items-center justify-center">
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">Materi segera hadir!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              Aktivitas Terbaru
            </h2>
            <Link
              href="/student/progress"
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat semua <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-4 min-w-max">
              {stats?.recent_activities?.slice(0, 5).map((activity) => (
                <Card
                  key={activity.id}
                  className="min-w-[240px] max-w-[240px] flex-shrink-0 shadow-md border-0 bg-white hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`p-2 rounded-full ${
                          activity.type === "material"
                            ? "bg-blue-100"
                            : activity.type === "exercise"
                            ? "bg-green-100"
                            : "bg-purple-100"
                        }`}
                      >
                        {activity.type === "material" && (
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        )}
                        {activity.type === "exercise" && (
                          <FileText className="h-4 w-4 text-green-600" />
                        )}
                        {activity.type === "quiz" && (
                          <Award className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm line-clamp-2">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(activity.completed_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!stats?.recent_activities ||
                stats.recent_activities.length === 0) && (
                <div className="min-w-[240px] flex items-center justify-center">
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">Belum ada aktivitas</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
