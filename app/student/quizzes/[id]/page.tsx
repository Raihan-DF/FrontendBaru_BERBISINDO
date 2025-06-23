"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Eye,
  Brain,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";

interface QuizAttempt {
  id: number;
  score: number;
  total_points: number;
  percentage: number;
  completed_at: string;
  time_taken: number; // in seconds
}

// Sesuaikan interface dengan struktur data backend Laravel
interface Quiz {
  id: number;
  title: string;
  description: string;
  material_id?: number;
  time_limit: number; // in minutes
  total_questions: number;
  total_points: number;
  difficulty_level: number;
  max_attempts?: number;
  is_published: boolean;
  instructions?: string;
  created_at: string;
  creator_id: number;
  // Relasi yang mungkin ada
  creator?: {
    id: number;
    name: string;
  };
  material?: {
    id: number;
    title: string;
  };
  // Student specific data
  is_completed?: boolean;
  score?: number;
  attempt_count?: number;
  best_score?: number;
  last_attempt_at?: string;
  attempts?: QuizAttempt[];
  can_attempt?: boolean;
  next_attempt_available_at?: string;
  // Tambahan untuk video
  questions?: Array<{
    id: number;
    material_video_id?: number;
    material_video?: {
      id: number;
      title: string;
    };
  }>;
}

export default function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const { get, post, put, delete: del, buildUrl } = useApi();

  useEffect(() => {
    fetchQuiz();
  }, [resolvedParams.id]);

  const fetchQuiz = async () => {
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
        buildUrl(`/api/quizzes/${resolvedParams.id}`),
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
        console.log("Quiz detail data:", data); // Debug
        setQuiz(data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data quiz",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}j ${minutes}m ${secs}d`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}d`;
    } else {
      return `${secs}d`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Cek apakah quiz memiliki video
  const hasVideos = () => {
    return (
      quiz?.questions &&
      quiz.questions.some((q) => q.material_video_id && q.material_video)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Quiz tidak ditemukan
        </h3>
        <Link href="/student/quizzes">
          <Button>Kembali ke Daftar Quiz</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/student/quizzes">
            <Button variant="outline" size="icon" className="shadow-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {quiz.title}
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              {quiz.material?.title
                ? `Material: ${quiz.material.title}`
                : "Quiz"}
            </p>
          </div>
        </div>

        {/* Quiz Info Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-white/20 p-3 rounded-full">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{quiz.total_questions}</div>
                <div className="text-purple-100 text-sm">Total Soal</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-white/20 p-3 rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{quiz.total_points}</div>
                <div className="text-amber-100 text-sm">Total Poin</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-white/20 p-3 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatTime(quiz.time_limit)}
                </div>
                <div className="text-green-100 text-sm">Batas Waktu</div>
              </div>
            </CardContent>
          </Card>
          <Card className="sshadow-lg border-0 bg-gradient-to-br from-neutral-500 to-neutral-600 text-white">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold my-2">Tingkat Kesulitan</div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium border text-center ${getDifficultyColor(
                    quiz.difficulty_level
                  )}`}
                >
                  {getDifficultyLabel(quiz.difficulty_level)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Deskripsi Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {quiz.description}
            </p>
          </CardContent>
        </Card>

        {/* Progress Status */}
        {quiz.is_completed && (
          <Card className="shadow-lg border-0 border-l-4 border-l-green-500 bg-green-50/80 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-green-800 text-lg">
                  Quiz Sudah Diselesaikan
                </div>
                <div className="text-green-600">
                  Skor Terbaik: {quiz.best_score || quiz.score} /{" "}
                  {quiz.total_points} | Percobaan: {quiz.attempt_count}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Details */}
        <div className="grid gap-6 md:grid-cols">
          {/* <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Informasi Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dibuat oleh</span>
                <span className="text-sm font-medium">{quiz.creator?.name || "Admin"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tanggal Dibuat</span>
                <span className="text-sm font-medium">{formatDate(quiz.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Max Percobaan</span>
                <span className="text-sm font-medium">{quiz.max_attempts || "Tidak Terbatas"}</span>
              </div> */}
          {/* <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={quiz.is_published ? "default" : "secondary"}>
                  {quiz.is_published ? "Dipublikasi" : "Draft"}
                </Badge>
              </div> */}
          {/* <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Video Pembelajaran</span>
                <Badge variant={hasVideos() ? "default" : "secondary"}>{hasVideos() ? "Tersedia" : "Tidak Ada"}</Badge>
              </div>
            </CardContent>
          </Card> */}

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                Progress Anda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Percobaan</span>
                <span className="text-sm font-medium">
                  {quiz.attempt_count || 0}
                  {quiz.max_attempts && ` / ${quiz.max_attempts}`}
                </span>
              </div>
              {quiz.best_score !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Skor Terbaik
                  </span>
                  <span className="text-sm font-medium">
                    {quiz.best_score} / {quiz.total_points}
                  </span>
                </div>
              )}
              {quiz.last_attempt_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Terakhir Dikerjakan
                  </span>
                  <span className="text-sm font-medium">
                    {formatDate(quiz.last_attempt_at)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {quiz.is_completed ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 border">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Selesai
                  </Badge>
                ) : (
                  <Badge variant="outline">Belum Selesai</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Instructions */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Petunjuk Pengerjaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                1
              </div>
              <p className="text-muted-foreground pt-1">
                Pastikan koneksi internet Anda stabil sebelum memulai quiz
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                2
              </div>
              <p className="text-muted-foreground pt-1">
                Baca setiap soal dengan teliti sebelum memilih jawaban
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                3
              </div>
              <p className="text-muted-foreground pt-1">
                Perhatikan batas waktu yang telah ditentukan
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                4
              </div>
              <p className="text-muted-foreground pt-1">
                Pastikan semua soal telah dijawab sebelum mengirim
              </p>
            </div>
            {hasVideos() && (
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                  5
                </div>
                <p className="text-muted-foreground pt-1">
                  Tonton video pembelajaran terlebih dahulu untuk pemahaman yang
                  lebih baik
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attempt History */}
        {quiz.attempts && quiz.attempts.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-purple-600" />
                Riwayat Percobaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quiz.attempts.map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        Percobaan {quiz.attempts!.length - index}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(attempt.completed_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        <span className="font-medium">{attempt.score}</span> /{" "}
                        {attempt.total_points}
                      </span>
                      <Badge
                        variant={
                          attempt.percentage >= 70 ? "default" : "secondary"
                        }
                      >
                        {attempt.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning for attempts */}
        {quiz.max_attempts &&
          quiz.attempt_count &&
          quiz.attempt_count >= quiz.max_attempts &&
          !quiz.can_attempt && (
            <Card className="shadow-lg border-0 border-l-4 border-l-red-500 bg-red-50/80 backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <div className="font-medium text-red-700 dark:text-red-400 text-lg">
                    Batas Percobaan Tercapai
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-500">
                    Anda telah mencapai batas maksimal percobaan untuk quiz ini.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Action Buttons */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Video Button - hanya tampil jika ada video */}
          {hasVideos() && (
            <Link href={`/student/quizzes/${quiz.id}/video`}>
              <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm border-l-4 border-l-blue-500">
                <CardContent className="flex items-center gap-6 p-8">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">
                      Tonton Video Pembelajaran
                    </h3>
                    <p className="text-muted-foreground">
                      Pelajari materi melalui video sebelum mengerjakan quiz
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Quiz Button */}
          <Link href={`/student/quizzes/${quiz.id}/attempt`}>
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm border-l-4 border-l-purple-500">
              <CardContent className="flex items-center gap-6 p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">
                    {quiz.can_attempt !== false
                      ? quiz.attempt_count && quiz.attempt_count > 0
                        ? "Coba Lagi"
                        : "Mulai Quiz"
                      : "Quiz Tidak Dapat Diakses"}
                  </h3>
                  <p className="text-muted-foreground">
                    {quiz.can_attempt !== false
                      ? "Kerjakan soal-soal quiz untuk menguji pemahaman"
                      : "Batas percobaan telah tercapai"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
