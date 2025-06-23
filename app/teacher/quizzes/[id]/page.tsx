"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Loader2, Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";

interface QuizQuestion {
  id: number;
  quiz_id: number;
  material_video_id: number;
  question: string;
  points: number;
  order: number;
  material_video: {
    id: number;
    title: string;
    video_filename: string;
  };
  options: {
    id: number;
    option_text: string;
    is_correct: boolean;
    order: number;
  }[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  material_id: number;
  difficulty_level: number;
  passing_score: number;
  time_limit: number;
  is_published: boolean;
  created_at: string;
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
  questions: QuizQuestion[];
}

export default function QuizDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { buildUrl } = useApi();

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

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        buildUrl(`/api/quizzes/${resolvedParams.id}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        toast({
          title: "Quiz berhasil dihapus",
          description: "Quiz telah dihapus dari sistem.",
        });
        router.push("/teacher/quizzes");
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus quiz",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus quiz",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 hari yang lalu";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`;
    return `${Math.ceil(diffDays / 30)} bulan yang lalu`;
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
        <Link href="/teacher/quizzes">
          <Button>Kembali ke Daftar Quiz</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Link href="/teacher/quizzes">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {quiz.title}
              </h1>
              <p className="text-muted-foreground">{quiz.description}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/teacher/quizzes/${resolvedParams.id}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan menghapus quiz dan semua data terkait.
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        "Hapus"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Judul
                  </p>
                  <p>{quiz.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Dibuat
                  </p>
                  <p>{formatDate(quiz.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Materi
                  </p>
                  <p>{quiz.material.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Batas Waktu
                  </p>
                  <p>{quiz.time_limit} menit</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nilai Kelulusan
                  </p>
                  <p>{quiz.passing_score}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Jumlah Soal
                  </p>
                  <p>{quiz.total_questions} soal</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Poin
                  </p>
                  <p>{quiz.total_points} poin</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <p>{quiz.is_published ? "Dipublikasi" : "Draft"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="questions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="questions">Daftar Soal</TabsTrigger>
            </TabsList>
            <TabsContent value="questions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Daftar Soal</h2>
                <Link href={`/teacher/quizzes/${resolvedParams.id}/edit`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Edit Soal
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {quiz.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Soal {index + 1}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {question.points} poin
                        </div>
                      </div>
                      <CardDescription>
                        Video: {question.material_video.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="font-medium">{question.question}</p>
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={option.id}
                            className={`rounded-md p-2 text-sm ${
                              option.is_correct
                                ? "bg-green-100 dark:bg-green-900/20"
                                : "bg-muted"
                            }`}
                          >
                            {option.is_correct && (
                              <span className="mr-2 text-xs font-medium text-green-600 dark:text-green-400">
                                Jawaban Benar
                              </span>
                            )}
                            <span className="font-semibold mr-1">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {option.option_text}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
