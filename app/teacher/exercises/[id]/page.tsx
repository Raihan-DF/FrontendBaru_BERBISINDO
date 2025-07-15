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

interface ExerciseQuestion {
  id: number;
  exercise_id: number;
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

interface Exercise {
  id: number;
  title: string;
  description: string;
  material_id: number;
  difficulty_level: number;
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
  questions: ExerciseQuestion[];
}

export default function ExerciseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { buildUrl } = useApi();

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

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        buildUrl(`/api/exercises/${resolvedParams.id}`),
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
          title: "Latihan berhasil dihapus",
          description: "Latihan telah dihapus dari sistem.",
        });
        router.push("/teacher/exercises");
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus latihan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus latihan",
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

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Latihan tidak ditemukan
        </h3>
        <Link href="/teacher/exercises">
          <Button>Kembali ke Daftar Latihan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Link href="/teacher/exercises">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {exercise.title}
              </h1>
              <p className="text-muted-foreground">{exercise.description}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/teacher/exercises/${resolvedParams.id}/edit`}>
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
                      Tindakan ini akan menghapus latihan dan semua data
                      terkait. Tindakan ini tidak dapat dibatalkan.
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
              <CardTitle>Informasi Latihan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Judul
                  </p>
                  <p>{exercise.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Dibuat
                  </p>
                  <p>{formatDate(exercise.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Deskripsi
                  </p>
                  <p>{exercise.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Materi
                  </p>
                  <p>{exercise.material.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Jumlah Soal
                  </p>
                  <p>{exercise.total_questions} soal</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Poin
                  </p>
                  <p>{exercise.total_points} poin</p>
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
                <Link href={`/teacher/exercises/${resolvedParams.id}/edit`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Edit Soal
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {exercise.questions.map((question, index) => (
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
