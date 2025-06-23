"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Calendar,
  Edit,
  FileText,
  GraduationCap,
  Loader2,
  Trophy,
  User,
} from "lucide-react";
import router from "next/router";
import { useApi } from "@/hooks/use-api";
interface User {
  name: string;
  email: string;
  bio?: string; // opsional
  profile_photo?: string; // opsional
}

export default function TeacherProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    bio: "",
    profile_photo: "",
  });
  const { buildUrl } = useApi();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
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

      const response = await fetch(buildUrl("/api/user"), {
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
        setFormData({
          name: data.user.name,
          email: data.user.email,
          bio: data.user.bio ?? "", // kalau undefined diisi ''
          profile_photo: data.user.profile_photo ?? "",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data profil",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat profil",
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

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "Token tidak ditemukan. Silakan login kembali.",
        variant: "destructive",
      });
      return;
    }

    const form = new FormData();
    form.append("name", formData.name || ""); // pastikan tidak undefined
    form.append("bio", formData.bio || ""); // nullable, bisa kosong string

    if (selectedFile) {
      form.append("profile_photo", selectedFile); // hanya kirim jika ada file baru
    }

    setIsSaving(true);

    try {
      const response = await fetch(buildUrl("/api/user/profile"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json", // Jangan pakai 'Content-Type': 'multipart/form-data' (biarkan browser yang set)
        },
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        // Tampilkan error dari Laravel
        toast({
          title: "Error",
          description: data.message || "Gagal menyimpan data",
          variant: "destructive",
        });
        console.log("Error:", data);
      } else {
        toast({
          title: "Sukses",
          description: "Profil berhasil diperbarui",
        });
        setIsEditing(false);
        // update formData jika perlu
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Mock data for learning statistics
  const learningStats = {
    totalLearningTime: "45 jam",
    averageDailyTime: "30 menit",
    longestStreak: "7 hari",
    currentStreak: "5 hari",
    totalMaterials: 12,
    completedMaterials: 8,
    totalExercises: 8,
    completedExercises: 5,
    totalQuizzes: 5,
    completedQuizzes: 3,
    averageScore: 85,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Profil Saya
            </h1>
            <p className="text-muted-foreground text-sm">
              Lihat dan kelola informasi profil Anda.
            </p>
          </div>

          <div className="grid gap-6 md:grid">
            <Card className="shadow-xl rounded-3xl border border-gray-200 overflow-hidden">
              <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-6 px-6 pt-6">
                <div className="text-center md:text-left space-y-1">
                  <CardTitle className="text-2xl font-semibold text-gray-800">
                    Profil Pengguna
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Kelola informasi pribadi Anda di sini.
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profil
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-gray-600 border-gray-300"
                  >
                    Batal
                  </Button>
                )}
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <div className="space-y-10">
                  {/* Avatar & Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-48 w-48 shadow-lg ring-4 ring-blue-500 transition-transform hover:scale-105">
                      <AvatarImage
                        src={
                          selectedFile
                            ? URL.createObjectURL(selectedFile)
                            : formData.profile_photo
                            ? buildUrl(`/storage/${formData.profile_photo}`)
                            : "/placeholder.svg"
                        }
                        alt={formData.name || "Profile Photo"}
                      />
                      <AvatarFallback>
                        {formData.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {isEditing && (
                      <div className="flex flex-col items-center gap-1 text-sm">
                        <input
                          type="file"
                          accept="image/*"
                          id="profilePhotoInput"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSelectedFile(e.target.files[0]);
                            }
                          }}
                          style={{ display: "none" }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById("profilePhotoInput")
                              ?.click()
                          }
                        >
                          Pilih Foto Baru
                        </Button>
                        <p className="text-xs text-gray-400">
                          Max 2MB. Format: JPG, PNG.
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Form */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="border-gray-300 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="border-gray-300 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="text-gray-700">
                        Bio
                      </Label>
                      <Input
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              {isEditing && (
                <CardFooter className="flex justify-end px-6 pb-6">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Learning Progress Summary */}
            {/* <Card>
          <CardHeader>
            <CardTitle>Ringkasan Kemajuan</CardTitle>
            <CardDescription>Kemajuan belajar Anda saat ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Materi</span>
                </div>
                <span className="text-sm">
                  {learningStats.completedMaterials}/
                  {learningStats.totalMaterials}
                </span>
              </div>
              <Progress
                value={
                  (learningStats.completedMaterials /
                    learningStats.totalMaterials) *
                  100
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Latihan</span>
                </div>
                <span className="text-sm">
                  {learningStats.completedExercises}/
                  {learningStats.totalExercises}
                </span>
              </div>
              <Progress
                value={
                  (learningStats.completedExercises /
                    learningStats.totalExercises) *
                  100
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Quiz</span>
                </div>
                <span className="text-sm">
                  {learningStats.completedQuizzes}/{learningStats.totalQuizzes}
                </span>
              </div>
              <Progress
                value={
                  (learningStats.completedQuizzes /
                    learningStats.totalQuizzes) *
                  100
                }
              />
            </div>

            <div className="rounded-lg border p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Total Waktu Belajar
                  </p>
                  <p className="font-medium">
                    {learningStats.totalLearningTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Rata-rata Harian
                  </p>
                  <p className="font-medium">
                    {learningStats.averageDailyTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Streak Terpanjang
                  </p>
                  <p className="font-medium">{learningStats.longestStreak}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Streak Saat Ini
                  </p>
                  <p className="font-medium">{learningStats.currentStreak}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
          </div>

          {/* Detailed Statistics */}
          {/* <Tabs defaultValue="statistics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statistics">Statistik Belajar</TabsTrigger>
          <TabsTrigger value="achievements">Pencapaian</TabsTrigger>
          <TabsTrigger value="history">Riwayat Aktivitas</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Belajar</CardTitle>
              <CardDescription>
                Statistik detail tentang aktivitas belajar Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Materi</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {learningStats.completedMaterials}/
                    {learningStats.totalMaterials}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Materi selesai
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Latihan</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {learningStats.completedExercises}/
                    {learningStats.totalExercises}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Latihan selesai
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium">Quiz</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {learningStats.completedQuizzes}/
                    {learningStats.totalQuizzes}
                  </p>
                  <p className="text-sm text-muted-foreground">Quiz selesai</p>
                </div>

                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Nilai Rata-rata</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {learningStats.averageScore}/100
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dari semua quiz
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-medium">Waktu Belajar</h3>
                  <div className="h-[200px] rounded-md bg-muted"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Waktu
                      </p>
                      <p className="font-medium">
                        {learningStats.totalLearningTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Rata-rata Harian
                      </p>
                      <p className="font-medium">
                        {learningStats.averageDailyTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-medium">Kehadiran</h3>
                  <div className="h-[200px] rounded-md bg-muted"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Streak Terpanjang
                      </p>
                      <p className="font-medium">
                        {learningStats.longestStreak}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Streak Saat Ini
                      </p>
                      <p className="font-medium">
                        {learningStats.currentStreak}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pencapaian</CardTitle>
              <CardDescription>
                Pencapaian yang telah Anda raih dalam perjalanan belajar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Pemula Bahasa Isyarat</h3>
                      <p className="text-sm text-muted-foreground">
                        Selesaikan 5 materi pembelajaran
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                      <Trophy className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Ahli Alfabet</h3>
                      <p className="text-sm text-muted-foreground">
                        Selesaikan semua materi huruf A-Z
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <Trophy className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Juara Quiz</h3>
                      <p className="text-sm text-muted-foreground">
                        Dapatkan nilai 90+ pada quiz apapun
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                      <Trophy className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Rajin Berlatih</h3>
                      <p className="text-sm text-muted-foreground">
                        Selesaikan 5 latihan berbeda
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <Link href="/student/achievements">
                  <Button variant="outline">Lihat Semua Pencapaian</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Aktivitas</CardTitle>
              <CardDescription>Aktivitas belajar terbaru Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Menonton Video Huruf T</h3>
                      <p className="text-sm text-muted-foreground">
                        2 jam yang lalu
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Materi: Bahasa Isyarat Huruf
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                    <FileText className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Menyelesaikan Latihan Huruf N-Z
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        1 hari yang lalu
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Skor: 100%</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                    <GraduationCap className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Menyelesaikan Quiz Huruf Alfabet
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        2 hari yang lalu
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Skor: 90/100
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Mendapatkan Pencapaian Juara Quiz
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        2 hari yang lalu
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pencapaian: Dapatkan nilai 90+ pada quiz apapun
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Login 5 Hari Berturut-turut
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        3 hari yang lalu
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Streak saat ini: 5 hari
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs> */}
        </div>
      </div>
    </div>
  );
}
