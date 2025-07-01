"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  BookOpen,
  Clock,
  Target,
  Brain,
  Zap,
  TrendingUp,
  CheckCircle,
  Users,
  Calendar,
  Star,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Exercise {
  id: number;
  title: string;
  description: string;
  material_id: number;
  difficulty_level: number;
  total_questions: number;
  total_points: number;
  creator: {
    id: number;
    name: string;
  };
  material: {
    id: number;
    title: string;
  };
  is_completed?: boolean;
  score?: number;
  attempt_count?: number;
  created_at?: string;
}

export default function ExerciseOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const { get, post, put, delete: del, buildUrl } = useApi();
  const [showInfo, setShowInfo] = useState(false); // << Tambahkan state ini

  const toggleShowInfo = () => setShowInfo((prev) => !prev); // Fungsi toggle

  useEffect(() => {
    fetchExercise();
  }, [resolvedParams.id]);

  const fetchExercise = async () => {
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

      const response = await fetch(
        buildUrl(`/api/exercises/${resolvedParams.id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

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
        setExercise(data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data latihan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching exercise:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6]"></div>
          <p className="text-muted-foreground">Memuat data latihan...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Latihan tidak ditemukan
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Latihan yang Anda cari tidak tersedia
          </p>
          <Link href="/student/exercises">
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">
              Kembali ke Daftar Latihan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/student/exercises">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white line-clamp-2">
              {exercise.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Materi: {exercise.material.title}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0284c7] dark:from-[#1E3A8A] dark:to-[#1E40AF] p-4 sm:p-6 shadow-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {exercise.total_questions}
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Soal
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {exercise.total_points}
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Poin
              </p>
            </div>

            {/* Spacer kosong biar bisa tengah */}

            <div className="flex flex-col items-center justify-center gap-1 col-span-1">
              <div className="text-lg sm:text-xl font-bold text-white">
                {getDifficultyLabel(exercise.difficulty_level)}
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Tingkat
              </p>
            </div>
          </div>

          <div className="h-1 w-16 bg-white/30 rounded-full mt-4 mx-auto"></div>
        </div>

        {/* Progress Status */}
        {exercise.is_completed && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 border-l-green-500">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-green-800 dark:text-green-400">
                  Latihan Sudah Diselesaikan
                </h3>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-500">
                  Skor: {exercise.score}/{exercise.total_points} • Percobaan:{" "}
                  {exercise.attempt_count}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs">
                <Star className="h-3 w-3 mr-1" />
                Selesai
              </Badge>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {/* Header Teks Interaktif */}
          <div
            onClick={toggleShowInfo}
            className="flex items-center justify-between cursor-pointer text-sm font-medium text-[#3B82F6]"
          >
            <span>
              {showInfo
                ? "Sembunyikan Detail Latihan"
                : "Tampilkan Detail Latihan"}
            </span>
            {showInfo ? (
              <ChevronUp className="w-4 h-4 text-[#3B82F6]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#3B82F6]" />
            )}
          </div>

          {/* Konten Slide */}
          <div
            className={`transition-all duration-500 overflow-hidden ${
              showInfo ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {/* Informasi Latihan */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-[#3B82F6]" />
                <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  Informasi Latihan
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Deskripsi: {exercise.description}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Dibuat oleh: {exercise.creator.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Tingkat Kesulitan:</span>
                  <Badge
                    className={`${getDifficultyColor(
                      exercise.difficulty_level
                    )} text-xs`}
                  >
                    {getDifficultyLabel(exercise.difficulty_level)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Petunjuk Pengerjaan */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-[#3B82F6]" />
                <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  Petunjuk Pengerjaan
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  "Tonton video pembelajaran terlebih dahulu untuk memahami materi",
                  "Kerjakan latihan dengan memilih jawaban yang paling tepat",
                  "Dapatkan feedback langsung setelah menjawab setiap soal",
                  "Anda dapat mengulang latihan untuk meningkatkan skor",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-0.5">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-3 sm:gap-4">
          <Link href={`/student/exercises/${exercise.id}/video`}>
            <div className="relative bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 border-l-[#3B82F6] hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center flex-shrink-0">
                  <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                    Tonton Video Pembelajaran
                  </h3>
                </div>
              </div>

              {/* Anak panah kanan */}
              <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </Link>

          <Link href={`/student/exercises/${exercise.id}/practice`}>
            <div className="relative bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                    {exercise.is_completed
                      ? "Ulangi Latihan"
                      : "Mulai Mengerjakan Latihan"}
                  </h3>
                </div>
              </div>

              {/* Anak panah kanan */}
              <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
