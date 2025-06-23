"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Play,
  BookOpen,
  Clock,
  Target,
  Award,
  Brain,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";

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
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200",
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200",
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200",
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200",
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200",
    ];
    return (
      colors[level] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200"
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Latihan tidak ditemukan
        </h3>
        <Link href="/student/exercises">
          <Button>Kembali ke Daftar Latihan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/student/exercises">
            <Button variant="outline" size="icon" className="shadow-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {exercise.title}
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Material: {exercise.material.title}
            </p>
          </div>
        </div>

        {/* Exercise Info Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-white/20 p-3 rounded-full">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {exercise.total_questions}
                </div>
                <div className="text-blue-100 text-sm">Total Soal</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-white/20 p-3 rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {exercise.total_points}
                </div>
                <div className="text-amber-100 text-sm">Total Poin</div>
              </div>
            </CardContent>
          </Card>

          {/* <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-white/20 p-3 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">~{Math.ceil(exercise.total_questions * 2)}</div>
                <div className="text-green-100 text-sm">Menit</div>
              </div>
            </CardContent>
          </Card> */}

          {/* <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center p-6">
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(exercise.difficulty_level)}`}
              >
                {getDifficultyLabel(exercise.difficulty_level)}
              </div>
            </CardContent>
          </Card> */}
          <Card className="sshadow-lg border-0 bg-gradient-to-br from-neutral-500 to-neutral-600 text-white">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xl font-bold my-1">Tingkat Kesulitan</div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium border text-center ${getDifficultyColor(
                    exercise.difficulty_level
                  )}`}
                >
                  {getDifficultyLabel(exercise.difficulty_level)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Deskripsi Latihan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {exercise.description}
            </p>
          </CardContent>
        </Card>

        {/* Progress Status */}
        {exercise.is_completed && (
          <Card className="shadow-lg border-0 border-l-4 border-l-green-500 bg-green-50/80 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-green-800 text-lg">
                  Latihan Sudah Diselesaikan
                </div>
                <div className="text-green-600">
                  Skor: {exercise.score} / {exercise.total_points} | Percobaan:{" "}
                  {exercise.attempt_count}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Petunjuk Pengerjaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                1
              </div>
              <p className="text-muted-foreground pt-1">
                Tonton video pembelajaran terlebih dahulu untuk memahami materi
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                2
              </div>
              <p className="text-muted-foreground pt-1">
                Kerjakan latihan dengan memilih jawaban yang paling tepat
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                3
              </div>
              <p className="text-muted-foreground pt-1">
                Dapatkan feedback langsung setelah menjawab setiap soal
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                4
              </div>
              <p className="text-muted-foreground pt-1">
                Anda dapat mengulang latihan untuk meningkatkan skor
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Action Buttons */}
        <div className="grid gap-6 md:grid-cols-2">
          <Link href={`/student/exercises/${exercise.id}/video`}>
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm border-l-4 border-l-blue-500">
              <CardContent className="flex items-center gap-6 p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">
                    Tonton Video Pembelajaran
                  </h3>
                  <p className="text-muted-foreground">
                    Pelajari materi melalui video sebelum mengerjakan latihan
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/student/exercises/${exercise.id}/practice`}>
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm border-l-4 border-l-green-500">
              <CardContent className="flex items-center gap-6 p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">
                    Mulai Mengerjakan Latihan
                  </h3>
                  <p className="text-muted-foreground">
                    Kerjakan soal-soal latihan untuk menguji pemahaman
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Instructions */}
      </div>
    </div>
  );
}
