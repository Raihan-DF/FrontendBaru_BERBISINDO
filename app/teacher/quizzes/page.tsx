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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Plus,
  Search,
  Calendar,
  Eye,
  Clock,
  Target,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";

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
}

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { buildUrl } = useApi();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("🔍 Fetching teacher quizzes...");
      console.log("🔑 Token:", token ? "Present" : "Missing");

      const response = await fetch(buildUrl("/api/quizzes?my_quizzes=1"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("📡 Response status:", response.status);
      console.log(
        "📋 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Raw API response:", data);

        // Fix: QuizController returns array directly, not wrapped in data object
        const quizzesArray = Array.isArray(data) ? data : data.data || [];
        console.log("📚 Processed quizzes:", quizzesArray);

        setQuizzes(quizzesArray);
      } else {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
      }
    } catch (error) {
      console.error("💥 Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredQuizzes = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (activeTab) {
      case "recent":
        return filteredQuizzes.filter(
          (quiz) => new Date(quiz.created_at) > oneWeekAgo
        );
      case "popular":
        return filteredQuizzes.sort(
          (a, b) => b.total_questions - a.total_questions
        );
      default:
        return filteredQuizzes;
    }
  };

  const getDifficultyLabel = (level: number) => {
    const labels = ["", "Pemula", "Dasar", "Menengah", "Lanjut", "Ahli"];
    return labels[level] || "Unknown";
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
                </div>
                <p className="text-blue-600 font-medium">
                  Memuat data quiz...
                </p>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Quiz & Test</h1>
            <p className="text-muted-foreground">
              Kelola quiz dan test bahasa isyarat untuk siswa Anda.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari quiz..."
                className="w-full bg-background pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/teacher/quizzes/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Quiz
              </Button>
            </Link>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="all">Semua Quiz</TabsTrigger>
              <TabsTrigger value="recent">Terbaru</TabsTrigger>
              <TabsTrigger value="popular">Terpopuler</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredQuizzes().map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="line-clamp-2">
                            {quiz.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {quiz.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge
                            className={getDifficultyColor(
                              quiz.difficulty_level
                            )}
                          >
                            {getDifficultyLabel(quiz.difficulty_level)}
                          </Badge>
                          {!quiz.is_published && (
                            <Badge variant="secondary" className="text-xs">
                              Draft
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-md bg-muted mb-3 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-blue-100">
                          <GraduationCap className="h-12 w-12 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>{quiz.total_questions} soal</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(quiz.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>Nilai lulus: {quiz.passing_score}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{quiz.time_limit} menit</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>Materi: {quiz.material.title}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/teacher/quizzes/${quiz.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat
                        </Button>
                      </Link>
                      <Link href={`/teacher/quizzes/${quiz.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {getFilteredQuizzes().length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Tidak ada quiz ditemukan
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm
                      ? "Coba ubah kata kunci pencarian Anda"
                      : "Mulai dengan membuat quiz pertama Anda"}
                  </p>
                  {!searchTerm && (
                    <Link href="/teacher/quizzes/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Quiz
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
