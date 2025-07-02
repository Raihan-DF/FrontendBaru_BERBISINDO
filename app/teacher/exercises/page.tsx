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
  FileText,
  Plus,
  Search,
  Calendar,
  Users,
  Eye,
  BookOpen,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";

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
}

export default function TeacherExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { buildUrl } = useApi();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(buildUrl("/api/exercises?my_exercises=1"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExercises(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((exercise) =>
    exercise.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredExercises = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (activeTab) {
      case "recent":
        return filteredExercises.filter(
          (exercise) => new Date(exercise.created_at) > oneWeekAgo
        );
      case "popular":
        return filteredExercises.sort(
          (a, b) => b.total_questions - a.total_questions
        );
      default:
        return filteredExercises;
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
                  Memuat data Latihan...
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
            <h1 className="text-3xl font-bold tracking-tight">Latihan</h1>
            <p className="text-muted-foreground">
              Kelola latihan bahasa isyarat untuk pengguna.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari latihan..."
                className="w-full bg-background pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/teacher/exercises/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Latihan
              </Button>
            </Link>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="all">Semua Latihan</TabsTrigger>
              <TabsTrigger value="recent">Terbaru</TabsTrigger>
              <TabsTrigger value="popular">Terpopuler</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredExercises().map((exercise) => (
                  <Card
                    key={exercise.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="line-clamp-2">
                            {exercise.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {exercise.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge
                            className={getDifficultyColor(
                              exercise.difficulty_level
                            )}
                          >
                            {getDifficultyLabel(exercise.difficulty_level)}
                          </Badge>
                          {!exercise.is_published && (
                            <Badge variant="secondary" className="text-xs bg">
                              Draft
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-md bg-muted mb-3 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-green-100">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{exercise.total_questions} soal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(exercise.created_at)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span>Materi: {exercise.material.title}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/teacher/exercises/${exercise.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat
                        </Button>
                      </Link>
                      <Link href={`/teacher/exercises/${exercise.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {getFilteredExercises().length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Tidak ada latihan ditemukan
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm
                      ? "Coba ubah kata kunci pencarian Anda"
                      : "Mulai dengan membuat latihan pertama Anda"}
                  </p>
                  {!searchTerm && (
                    <Link href="/teacher/exercises/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Latihan
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
