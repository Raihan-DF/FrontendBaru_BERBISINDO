"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Plus,
  Users,
  AlertCircle,
  RefreshCcw,
  Clock,
  Calendar,
  TrendingUp,
  Zap,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "../../../context/AuthContext";

// Interfaces untuk data dari API
interface Creator {
  id: number;
  name: string;
}

interface Material {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty_level: number;
  is_published: boolean;
  created_at: string;
  videos_count: number;
  creator: Creator;
}

interface Exercise {
  id: number;
  title: string;
  description: string;
  difficulty_level: number;
  is_published: boolean;
  created_at: string;
  questions_count: number;
  creator: Creator;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  is_published: boolean;
  created_at: string;
  questions_count: number;
  total_questions: number;
  creator: Creator;
}

interface StudentProgress {
  student: {
    id: number;
    name: string;
    email: string;
  };
  materials: {
    total: number;
    completed: number;
    percentage: number;
  };
  exercises: {
    total: number;
    completed: number;
    percentage: number;
  };
  quizzes: {
    total: number;
    completed: number;
    percentage: number;
    average_score: number;
  };
  last_activity: string | null;
}

interface TeacherDashboardData {
  materials: {
    total: number;
    recent_growth: number;
    items: Material[];
  };
  exercises: {
    total: number;
    recent_growth: number;
    items: Exercise[];
  };
  quizzes: {
    total: number;
    recent_growth: number;
    items: Quiz[];
  };
  students: {
    total: number;
    recent_growth: number;
    items: StudentProgress[];
  };
  teacher_info: {
    id: number;
    name: string;
    email: string;
  };
}

export default function TeacherDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] =
    useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("materials");
  const { buildUrl } = useApi();

  // Fungsi untuk memformat tanggal dengan user-friendly
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: id });
    } catch (e) {
      return "Tanggal tidak valid";
    }
  };

  // Fungsi untuk memperbaiki URL thumbnail
  const getImageUrl = (thumbnail: string | null) => {
    if (!thumbnail) return null;

    // Jika sudah berupa URL lengkap, gunakan langsung
    if (thumbnail.startsWith("http")) return thumbnail;

    // Jika berupa path relatif, gabungkan dengan base URL backend
    return buildUrl(`/storage/${thumbnail}`);
  };

  // Fungsi untuk fetch data students menggunakan endpoint progress yang benar
  const fetchStudents = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
      const response = await fetch(buildUrl("/api/teacher/students/progress"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("📡 Students response status:", response.status);

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        throw new Error("Session expired");
      }

      if (!response.ok) {
        console.warn(
          `Students endpoint returned ${response.status}:`,
          response.statusText
        );
        return [];
      }

      const result = await response.json();
      console.log("📊 Students progress data:", result);

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.warn("Students endpoint error:", error);
      return [];
    }
  };

  const fetchQuizzes = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {

      const response = await fetch(buildUrl("/api/quizzes"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        throw new Error("Session expired");
      }

      if (!response.ok) {
        console.warn(
          `Quiz endpoint returned ${response.status}:`,
          response.statusText
        );
        return [];
      }

      const result = await response.json();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.warn("Quiz endpoint error:", error);
      return [];
    }
  };

  // Fungsi untuk fetch data dengan error handling yang lebih baik
  const fetchWithAuth = async (endpoint: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    const response = await fetch(buildUrl(endpoint), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      throw new Error("Sesi berakhir");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  };

  // Fungsi utama untuk fetch semua data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
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

      const [materialsResult, exercisesResult, quizzesResult, studentsResult] =
        await Promise.allSettled([
          fetchWithAuth("/api/materials"),
          fetchWithAuth("/api/exercises"),
          fetchQuizzes(),
          fetchStudents(),
        ]);

      const materialsData =
        materialsResult.status === "fulfilled"
          ? materialsResult.value
          : { data: [] };
      const exercisesData =
        exercisesResult.status === "fulfilled"
          ? exercisesResult.value
          : { data: [] };
      const quizzesData =
        quizzesResult.status === "fulfilled" ? quizzesResult.value : [];
      const studentsData =
        studentsResult.status === "fulfilled" ? studentsResult.value : [];

      console.log("📊 Final processed data:", {
        materials: materialsData,
        exercises: exercisesData,
        quizzes: quizzesData,
        students: studentsData,
      });

      const calculateGrowth = (items: any[]) => {
        if (!items || !Array.isArray(items)) return 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return items.filter((item) => {
          try {
            const createdDate = new Date(item.created_at);
            return createdDate >= thirtyDaysAgo;
          } catch {
            return false;
          }
        }).length;
      };

      const formattedData: TeacherDashboardData = {
        materials: {
          total: materialsData?.data?.length || 0,
          recent_growth: calculateGrowth(materialsData?.data || []),
          items: (materialsData?.data || []).slice(0, 6),
        },
        exercises: {
          total: exercisesData?.data?.length || 0,
          recent_growth: calculateGrowth(exercisesData?.data || []),
          items: (exercisesData?.data || []).slice(0, 6),
        },
        quizzes: {
          total: quizzesData?.length || 0,
          recent_growth: calculateGrowth(quizzesData || []),
          items: (quizzesData || []).slice(0, 6),
        },
        students: {
          total: studentsData?.length || 0,
          recent_growth: calculateGrowth(studentsData || []),
          items: (studentsData || []).slice(0, 5),
        },
        teacher_info: {
          id: 1,
          name:  "Guru",
          email: "teacher@example.com",
        },
      };

      console.log("✅ Formatted dashboard data:", formattedData);
      setDashboardData(formattedData);
    } catch (err) {
      console.error("❌ Error fetching teacher dashboard data:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data saat komponen dimount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
                </div>
                <p className="text-blue-600 font-medium">
                  Memuat dashboard guru...
                </p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Gagal Memuat Dashboard
                  </h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button
                    onClick={fetchDashboardData}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Coba Lagi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Jika tidak ada data
  if (!dashboardData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
          <div className="container mx-auto p-4 md:p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Tidak ada data dashboard
              </h3>
              <Button
                onClick={fetchDashboardData}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Muat Ulang
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="container mx-auto p-4 md:p-6 space-y-8">
          {/* Hero Section - Blue Dominant */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 p-8 md:p-12">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
              <div className="absolute top-20 right-20 w-16 h-16 bg-yellow-300 rounded-full"></div>
              <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-green-300 rounded-full"></div>
              <div className="absolute bottom-20 right-1/3 w-8 h-8 bg-orange-300 rounded-full"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Hi, {user?.name || "Guru"} 👋
                </h1>
                <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                  Selamat datang di dashboard pembelajaran bahasa isyarat. Mari
                  ciptakan pengalaman belajar yang luar biasa!
                </p>
              </div>

              {/* 3D Illustration Area */}
              <div className="flex-shrink-0">
                <div className="relative w-80 h-60">
                  {/* 3D Books Stack */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Stack of books with softer colors */}
                      <div className="absolute -rotate-12 transform">
                        <div className="w-16 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg"></div>
                      </div>
                      <div className="absolute rotate-6 transform translate-x-8">
                        <div className="w-16 h-20 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg shadow-lg"></div>
                      </div>
                      <div className="absolute rotate-12 transform translate-x-16 translate-y-2">
                        <div className="w-16 h-20 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg shadow-lg"></div>
                      </div>
                      <div className="absolute -rotate-6 transform translate-x-24 translate-y-4">
                        <div className="w-16 h-20 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg shadow-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">
                  Total Materi
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {dashboardData.materials?.total || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    <TrendingUp className="w-3 h-3 mr-1" />+
                    {dashboardData.materials?.recent_growth || 0}
                  </Badge>
                  <span className="text-xs text-blue-200">bulan ini</span>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">
                  Total Latihan
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {dashboardData.exercises?.total || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    <TrendingUp className="w-3 h-3 mr-1" />+
                    {dashboardData.exercises?.recent_growth || 0}
                  </Badge>
                  <span className="text-xs text-green-200">bulan ini</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">
                  Total Quiz
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {dashboardData.quizzes?.total || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    <TrendingUp className="w-3 h-3 mr-1" />+
                    {dashboardData.quizzes?.recent_growth || 0}
                  </Badge>
                  <span className="text-xs text-purple-200">bulan ini</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-100">
                  Total Pengguna
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {dashboardData.students?.total || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    <TrendingUp className="w-3 h-3 mr-1" />+
                    {dashboardData.students?.recent_growth || 0}
                  </Badge>
                  <span className="text-xs text-orange-200">bulan ini</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Konten - Back to Simple Layout */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Konten Pembelajaran</CardTitle>
                  <CardDescription>
                    Kelola materi, latihan, dan quiz Anda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs
                defaultValue="materials"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="materials">Materi Terbaru</TabsTrigger>
                  <TabsTrigger value="exercises">Latihan Terbaru</TabsTrigger>
                  <TabsTrigger value="quizzes">Quiz Terbaru</TabsTrigger>
                </TabsList>

                {/* Tab Materi */}
                <TabsContent value="materials" className="space-y-4">
                  {dashboardData.materials?.items &&
                  dashboardData.materials.items.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {dashboardData.materials.items.map((material) => (
                        <Card
                          key={material.id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            <CardTitle className="line-clamp-2">
                              {material.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {material.description || "Tidak ada deskripsi"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="aspect-video rounded-md bg-muted mb-3 overflow-hidden">
                              {material.thumbnail ? (
                                <img
                                  src={
                                    getImageUrl(material.thumbnail) ||
                                    "/placeholder.svg"
                                  }
                                  alt={material.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                                  <BookOpen className="h-12 w-12 text-blue-500" />
                                </div>
                              )}
                              {material.thumbnail && (
                                <div className="hidden w-full h-full flex items-center justify-center bg-blue-100">
                                  <BookOpen className="h-12 w-12 text-blue-500" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>
                                    {material.videos_count || 0} video
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(material.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardContent className="pt-0">
                            <Link
                              href={`/teacher/materials/${material.id}`}
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Kelola Materi
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Belum ada materi
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Anda belum membuat materi pembelajaran. Mulai buat
                        materi sekarang untuk membantu pengguna belajar.
                      </p>
                      <Link href="/teacher/materials/create">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Buat Materi Pertama
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                {/* Tab Latihan */}
                <TabsContent value="exercises" className="space-y-4">
                  {dashboardData.exercises?.items &&
                  dashboardData.exercises.items.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {dashboardData.exercises.items.map((exercise) => (
                        <Card
                          key={exercise.id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            <CardTitle className="line-clamp-2">
                              {exercise.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {exercise.description || "Tidak ada deskripsi"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="aspect-video rounded-md bg-muted mb-3 overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center bg-green-100">
                                <FileText className="h-12 w-12 text-green-500" />
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>
                                    {exercise.questions_count || 0} soal
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(exercise.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardContent className="pt-0">
                            <Link
                              href={`/teacher/exercises/${exercise.id}`}
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Kelola Latihan
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Belum ada latihan
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Anda belum membuat latihan. Buat latihan!.
                      </p>
                      <Link href="/teacher/exercises/create">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Buat Latihan Pertama
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                {/* Tab Quiz */}
                <TabsContent value="quizzes" className="space-y-4">
                  {dashboardData.quizzes?.items &&
                  dashboardData.quizzes.items.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {dashboardData.quizzes.items.map((quiz) => (
                        <Card
                          key={quiz.id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            <CardTitle className="line-clamp-2">
                              {quiz.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {quiz.description || "Tidak ada deskripsi"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="aspect-video rounded-md bg-muted mb-3 overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center bg-purple-100">
                                <GraduationCap className="h-12 w-12 text-purple-500" />
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="h-4 w-4" />
                                  <span>
                                    {quiz.questions_count ||
                                      quiz.total_questions ||
                                      0}{" "}
                                    soal
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(quiz.created_at)}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{quiz.time_limit} menit</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span>
                                    Nilai lulus: {quiz.passing_score}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardContent className="pt-0">
                            <Link
                              href={`/teacher/quizzes/${quiz.id}`}
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Kelola Quiz
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Belum ada quiz
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Anda belum membuat quiz. Buat quiz untuk menguji
                        pemahaman Materi.
                      </p>
                      <Link href="/teacher/quizzes/create">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Buat Quiz Pertama
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Bagian Siswa Terbaru - Simple Table */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Pengguna Terbaru</CardTitle>
                    <CardDescription>
                      Pantau progress Pengguna
                    </CardDescription>
                  </div>
                </div>
                <Link href="/teacher/students/progress">
                  <Button variant="outline" size="sm">
                    Lihat Semua Pengguna
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {dashboardData.students?.items &&
              dashboardData.students.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Nama</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">Progress</th>
                        <th className="text-right p-4 font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.students.items.map((studentProgress) => (
                        <tr
                          key={studentProgress.student.id}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-4 font-medium">
                            {studentProgress.student.name}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {studentProgress.student.email}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-muted-foreground">
                                Materi: {studentProgress.materials.percentage}%
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Quiz: {studentProgress.quizzes.average_score}%
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <Link
                              href={`/teacher/students/${studentProgress.student.id}/progress`}
                            >
                              <Button
                                variant="default"
                                size="sm"
                                className="hover:bg-blue-700 bg-blue-500 text-white"
                              >
                                Lihat Progress
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Belum ada pengguna</h3>
                  <p className="text-sm text-muted-foreground">
                    Belum ada pengguna yang terdaftar untuk kelas Anda.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
