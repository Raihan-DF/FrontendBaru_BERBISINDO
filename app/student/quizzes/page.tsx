"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Clock,
  Trophy,
  Users,
  Calendar,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Target,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";

interface Quiz {
  id: number;
  title: string;
  description: string;
  material_id?: number;
  time_limit: number;
  total_questions: number;
  total_points: number;
  difficulty_level: number;
  is_published: boolean;
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

const ITEMS_PER_PAGE = 4;

export default function QuizzesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { get, post, put, delete: del, buildUrl } = useApi();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedMaterial, selectedDifficulty, selectedStatus]);

  const fetchQuizzes = async () => {
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

      const response = await fetch(buildUrl("/api/quizzes"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("Data dari API:", data);

        if (data && !Array.isArray(data)) {
          if (data.data && Array.isArray(data.data)) {
            setQuizzes(data.data);
          } else if (data.quizzes && Array.isArray(data.quizzes)) {
            setQuizzes(data.quizzes);
          } else if (typeof data === "object") {
            setQuizzes(Object.values(data));
          } else {
            console.error("Format data tidak dikenali:", data);
            setQuizzes([]);
          }
        } else {
          setQuizzes(data || []);
        }
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data quiz",
          variant: "destructive",
        });
        setQuizzes([]);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} jam ${
      remainingMinutes > 0 ? `${remainingMinutes} menit` : ""
    }`;
  };

  const filteredQuizzes = Array.isArray(quizzes)
    ? quizzes.filter((quiz) => {
        if (!quiz) return false;

        const matchesSearch =
          quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.material?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          quiz.creator?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          false;

        const matchesMaterial =
          selectedMaterial === "all" ||
          quiz.material?.title === selectedMaterial;
        const matchesDifficulty =
          selectedDifficulty === "all" ||
          quiz.difficulty_level?.toString() === selectedDifficulty;

        let matchesStatus = true;
        if (selectedStatus === "completed") {
          matchesStatus = quiz.is_completed === true;
        } else if (selectedStatus === "in-progress") {
          matchesStatus = !quiz.is_completed && (quiz.attempt_count || 0) > 0;
        } else if (selectedStatus === "not-started") {
          matchesStatus = !quiz.is_completed && (quiz.attempt_count || 0) === 0;
        }

        return (
          matchesSearch && matchesMaterial && matchesDifficulty && matchesStatus
        );
      })
    : [];

  const materials = Array.isArray(quizzes)
    ? Array.from(
        new Set(
          quizzes
            .filter((quiz) => quiz && quiz.material?.title)
            .map((quiz) => quiz.material!.title)
        )
      )
    : [];

  const completedQuizzes = filteredQuizzes.filter((quiz) => quiz.is_completed);
  const inProgressQuizzes = filteredQuizzes.filter(
    (quiz) => !quiz.is_completed && (quiz.attempt_count || 0) > 0
  );

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Quiz Interaktif
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2">
            Uji pemahaman bahasa isyarat Anda dengan berbagai quiz yang
            menantang
          </p>
        </div>

        {/* Statistics */}
        <div className="rounded-xl bg-gradient-to-br from-[#f472b6] to-[#8B5CF6] dark:from-[#be185d] dark:to-[#7c3aed] p-4 sm:p-6 shadow-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {filteredQuizzes.length}
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Total
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {completedQuizzes.length}
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Selesai
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {inProgressQuizzes.length}
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Progress
              </p>
            </div>
          </div>
          <div className="h-1 w-16 bg-white/30 rounded-full mt-4 mx-auto"></div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm space-y-3 sm:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari quiz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 dark:border-gray-700 text-sm sm:text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <Select
              value={selectedMaterial}
              onValueChange={setSelectedMaterial}
            >
              <SelectTrigger className="border-gray-200 dark:border-gray-700 text-sm">
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
              <SelectTrigger className="border-gray-200 dark:border-gray-700 text-sm">
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
              <SelectTrigger className="border-gray-200 dark:border-gray-700 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="not-started">Belum Dimulai</SelectItem>
                <SelectItem value="in-progress">Progress</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quiz Grid */}
        <QuizGrid
          quizzes={filteredQuizzes}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

function QuizGrid({
  quizzes,
  currentPage,
  setCurrentPage,
}: {
  quizzes: Quiz[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) {
  const totalPages = Math.ceil(quizzes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentQuizzes = quizzes.slice(startIndex, endIndex);

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
        <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Tidak ada quiz yang sesuai
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm px-4">
          Coba ubah kriteria pencarian
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQuizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Halaman {currentPage} dari {totalPages} ({quizzes.length} total)
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const getDifficultyLabel = (level: number) => {
    const labels = [
      "",
      "Sangat Mudah",
      "Mudah",
      "Sedang",
      "Sulit",
      "Sangat Sulit",
    ];
    return labels[level] || "Tidak Diketahui";
  };

  const getDifficultyColor = (level: number) => {
    const colors = [
      "",
      "bg-green-100 text-green-800",
      "bg-blue-100 text-blue-800",
      "bg-yellow-100 text-yellow-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
    ];
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.is_completed) {
      return (
        <Badge className="bg-green-100 text-green-800 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Selesai
        </Badge>
      );
    }

    if (quiz.attempt_count && quiz.attempt_count > 0) {
      return (
        <Badge className="bg-amber-100 text-amber-800 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Progress
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-800 text-xs">
        <BookOpen className="h-3 w-3 mr-1" />
        Belum Mulai
      </Badge>
    );
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} jam ${
      remainingMinutes > 0 ? `${remainingMinutes} menit` : ""
    }`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = () => {
    if (quiz.is_completed) return "border-l-green-500";
    if (quiz.attempt_count && quiz.attempt_count > 0)
      return "border-l-amber-500";
    return "border-l-[#8B5CF6]";
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 ${getStatusColor()}`}
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Icon */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-[#8B5CF6]" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full min-h-[150px]">
          {/* Judul & Status Badge */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2 pr-2">
                {quiz.title}
              </h3>
              {getStatusBadge(quiz)}
            </div>
          </div>

          {/* Tingkat Kesulitan di pojok kanan bawah sebelum tombol */}
          <div className="mt-auto flex flex-col items-start">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2 ml-auto">
              <span>Tingkat Kesulitan:</span>
              <Badge
                className={`${getDifficultyColor(
                  quiz.difficulty_level
                )} text-xs`}
              >
                {getDifficultyLabel(quiz.difficulty_level)}
              </Badge>
            </div>

            <Link href={`/student/quizzes/${quiz.id}`} className="w-full">
              <Button className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm sm:text-base h-9 sm:h-10 font-semibold">
                <Zap className="mr-2 h-4 w-4" />
                {quiz.is_completed
                  ? "Lihat Detail"
                  : quiz.attempt_count && quiz.attempt_count > 0
                  ? "Lanjutkan Quiz"
                  : "Mulai Quiz"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
