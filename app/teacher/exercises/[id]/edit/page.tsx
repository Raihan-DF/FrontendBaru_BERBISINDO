"use client";

import type React from "react";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { ArrowLeft, Loader2, Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";

interface Material {
  id: number;
  title: string;
}

interface MaterialVideo {
  id: number;
  title: string;
  material_id: number;
}

interface Question {
  material_video_id: string;
  question: string;
  points: number;
  options: string[];
  correct_answer: number;
}

export default function EditExercise({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [videos, setVideos] = useState<MaterialVideo[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    material_id: "",
    difficulty_level: "1",
    is_published: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const { buildUrl } = useApi();

  useEffect(() => {
    fetchMaterials();
    fetchExercise();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (formData.material_id) {
      fetchVideos(formData.material_id);
    } else {
      setVideos([]);
    }
  }, [formData.material_id]);

  const fetchMaterials = async () => {
    setMaterialsLoading(true);
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

      const response = await fetch(buildUrl("/api/materials"), {
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
        setMaterials(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const fetchVideos = async (materialId: string) => {
    console.log("Fetching videos for material ID:", materialId);
    setVideosLoading(true);
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
        buildUrl(`/api/materials/${materialId}/videos`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Videos API response status:", response.status);

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
        console.log("Videos data received:", data);
        setVideos(data.data || data || []);
      } else {
        console.error(
          "Failed to fetch videos:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setVideosLoading(false);
    }
  };

  const fetchExercise = async () => {
    console.log("Fetching exercise with ID:", resolvedParams.id);
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

      console.log("Exercise API response status:", response.status);

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
        console.log("Exercise data received:", data);

        setFormData({
          title: data.title || "",
          description: data.description || "",
          material_id: data.material_id ? data.material_id.toString() : "",
          difficulty_level: data.difficulty_level
            ? data.difficulty_level.toString()
            : "1",
          is_published: data.is_published || false,
        });

        if (data.questions && Array.isArray(data.questions)) {
          const questionsData = data.questions.map((q: any) => ({
            material_video_id: q.material_video_id
              ? q.material_video_id.toString()
              : "",
            question: q.question || "",
            points: q.points || 10,
            options:
              q.options && Array.isArray(q.options)
                ? q.options.map((opt: any) => opt.option_text || "")
                : ["", "", "", ""],
            correct_answer:
              q.options && Array.isArray(q.options)
                ? q.options.findIndex((opt: any) => opt.is_correct)
                : 0,
          }));
          setQuestions(questionsData);
        }
      } else {
        console.error(
          "Failed to fetch exercise:",
          response.status,
          response.statusText
        );
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
        description: "Terjadi kesalahan saat memuat data latihan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correct_answer = Number.parseInt(value);
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        material_video_id: "",
        question: "",
        points: 10,
        options: ["", "", "", ""],
        correct_answer: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    } else {
      toast({
        title: "Tidak dapat menghapus",
        description: "Latihan harus memiliki minimal satu soal.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...formData,
            material_id: Number.parseInt(formData.material_id),
            difficulty_level: Number.parseInt(formData.difficulty_level),
            questions: questions.map((q) => ({
              ...q,
              material_video_id: Number.parseInt(q.material_video_id),
            })),
          }),
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
        toast({
          title: "Latihan berhasil diperbarui",
          description: "Perubahan pada latihan telah berhasil disimpan.",
        });
        router.push(`/teacher/exercises/${resolvedParams.id}`);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Gagal memperbarui latihan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui latihan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Link href={`/teacher/exercises/${resolvedParams.id}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Edit Latihan
              </h1>
              <p className="text-muted-foreground">
                Perbarui latihan dan soal-soalnya.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Hapus Latihan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus latihan dan semua data terkait.
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

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Latihan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Latihan</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="material_id">Pilih Materi</Label>
                    <Select
                      value={formData.material_id}
                      onValueChange={(value) =>
                        handleSelectChange("material_id", value)
                      }
                      disabled={materialsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            materialsLoading
                              ? "Memuat materi..."
                              : "Pilih materi"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.length > 0
                          ? materials.map((material) => (
                              <SelectItem
                                key={material.id}
                                value={material.id.toString()}
                              >
                                {material.title}
                              </SelectItem>
                            ))
                          : !materialsLoading && (
                              <div className="px-2 py-1 text-sm text-muted-foreground">
                                Tidak ada materi tersedia
                              </div>
                            )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level">Tingkat Kesulitan</Label>
                    <Select
                      value={formData.difficulty_level}
                      onValueChange={(value) =>
                        handleSelectChange("difficulty_level", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tingkat kesulitan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Pemula</SelectItem>
                        <SelectItem value="2">Dasar</SelectItem>
                        <SelectItem value="3">Menengah</SelectItem>
                        <SelectItem value="4">Lanjut</SelectItem>
                        <SelectItem value="5">Ahli</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_published", checked)
                    }
                  />
                  <Label htmlFor="is_published">Publikasikan latihan</Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Soal Latihan</h2>
              <Button type="button" onClick={addQuestion} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Soal
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Soal {index + 1}</CardTitle>
                  <Button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`video-${index}`}>Pilih Video</Label>
                      <Select
                        value={question.material_video_id}
                        onValueChange={(value) =>
                          handleQuestionChange(
                            index,
                            "material_video_id",
                            value
                          )
                        }
                        disabled={videosLoading || !formData.material_id}
                      >
                        <SelectTrigger id={`video-${index}`}>
                          <SelectValue
                            placeholder={
                              !formData.material_id
                                ? "Pilih materi terlebih dahulu"
                                : videosLoading
                                ? "Memuat video..."
                                : "Pilih video"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {videos.length > 0
                            ? videos.map((video) => (
                                <SelectItem
                                  key={video.id}
                                  value={video.id.toString()}
                                >
                                  {video.title}
                                </SelectItem>
                              ))
                            : !videosLoading &&
                              formData.material_id && (
                                <div className="px-2 py-1 text-sm text-muted-foreground">
                                  Tidak ada video tersedia
                                </div>
                              )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`points-${index}`}>Poin</Label>
                      <Input
                        id={`points-${index}`}
                        type="number"
                        min="1"
                        max="100"
                        value={question.points}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            "points",
                            Number.parseInt(e.target.value)
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`question-${index}`}>Pertanyaan</Label>
                    <Input
                      id={`question-${index}`}
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(index, "question", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Pilihan Jawaban</Label>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-2"
                      >
                        <span className="text-sm font-medium w-8">
                          {optionIndex + 1}.
                        </span>
                        <Input
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              optionIndex,
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`correct-${index}`}>Jawaban Benar</Label>
                    <Select
                      value={question.correct_answer.toString()}
                      onValueChange={(value) =>
                        handleCorrectAnswerChange(index, value)
                      }
                    >
                      <SelectTrigger id={`correct-${index}`}>
                        <SelectValue placeholder="Pilih jawaban benar" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((_, optionIndex) => (
                          <SelectItem
                            key={optionIndex}
                            value={optionIndex.toString()}
                          >
                            Pilihan {optionIndex + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end gap-4">
              <Link href={`/teacher/exercises/${resolvedParams.id}`}>
                <Button variant="outline">Batal</Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
