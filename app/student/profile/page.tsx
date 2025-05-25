"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, Edit, FileText, GraduationCap, Loader2, Trophy, User } from 'lucide-react'

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "081234567890",
    bio: "Saya adalah siswa yang sedang belajar bahasa isyarat Indonesia.",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
    }, 1000)
  }

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
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profil Saya</h1>
        <p className="text-muted-foreground">Lihat dan kelola informasi profil Anda.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Information */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>Informasi pribadi dan kontak Anda.</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Batal
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Budi Santoso" />
                    <AvatarFallback>BS</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{formData.name}</h3>
                    <p className="text-muted-foreground">Siswa</p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nomor Telepon</p>
                    <p>{formData.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p>{formData.bio}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Budi Santoso" />
                    <AvatarFallback>BS</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Ubah Foto
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" name="bio" value={formData.bio} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
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
        <Card>
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
                  {learningStats.completedMaterials}/{learningStats.totalMaterials}
                </span>
              </div>
              <Progress value={(learningStats.completedMaterials / learningStats.totalMaterials) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Latihan</span>
                </div>
                <span className="text-sm">
                  {learningStats.completedExercises}/{learningStats.totalExercises}
                </span>
              </div>
              <Progress value={(learningStats.completedExercises / learningStats.totalExercises) * 100} />
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
              <Progress value={(learningStats.completedQuizzes / learningStats.totalQuizzes) * 100} />
            </div>

            <div className="rounded-lg border p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Waktu Belajar</p>
                  <p className="font-medium">{learningStats.totalLearningTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Rata-rata Harian</p>
                  <p className="font-medium">{learningStats.averageDailyTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Streak Terpanjang</p>
                  <p className="font-medium">{learningStats.longestStreak}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Streak Saat Ini</p>
                  <p className="font-medium">{learningStats.currentStreak}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Tabs defaultValue="statistics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statistics">Statistik Belajar</TabsTrigger>
          <TabsTrigger value="achievements">Pencapaian</TabsTrigger>
          <TabsTrigger value="history">Riwayat Aktivitas</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Belajar</CardTitle>
              <CardDescription>Statistik detail tentang aktivitas belajar Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Materi</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {learningStats.completedMaterials}/{learningStats.totalMaterials}
                  </p>
                  <p className="text-sm text-muted-foreground">Materi selesai</p>
                </div>

                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Latihan</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {learningStats.completedExercises}/{learningStats.totalExercises}
                  </p>
                  <p className="text-sm text-muted-foreground">Latihan selesai</p>
                </div>

                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium">Quiz</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {learningStats.completedQuizzes}/{learningStats.totalQuizzes}
                  </p>
                  <p className="text-sm text-muted-foreground">Quiz selesai</p>
                </div>

                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Nilai Rata-rata</h3>
                  </div>
                  <p className="text-2xl font-bold">{learningStats.averageScore}/100</p>
                  <p className="text-sm text-muted-foreground">Dari semua quiz</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-medium">Waktu Belajar</h3>
                  <div className="h-[200px] rounded-md bg-muted"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Waktu</p>
                      <p className="font-medium">{learningStats.totalLearningTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rata-rata Harian</p>
                      <p className="font-medium">{learningStats.averageDailyTime}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-medium">Kehadiran</h3>
                  <div className="h-[200px] rounded-md bg-muted"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Streak Terpanjang</p>
                      <p className="font-medium">{learningStats.longestStreak}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Streak Saat Ini</p>
                      <p className="font-medium">{learningStats.currentStreak}</p>
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
              <CardDescription>Pencapaian yang telah Anda raih dalam perjalanan belajar.</CardDescription>
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
                      <p className="text-sm text-muted-foreground">Selesaikan 5 materi pembelajaran</p>
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
                      <p className="text-sm text-muted-foreground">Selesaikan semua materi huruf A-Z</p>
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
                      <p className="text-sm text-muted-foreground">Dapatkan nilai 90+ pada quiz apapun</p>
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
                      <p className="text-sm text-muted-foreground">Selesaikan 5 latihan berbeda</p>
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
                      <p className="text-sm text-muted-foreground">2 jam yang lalu</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Materi: Bahasa Isyarat Huruf</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                    <FileText className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Menyelesaikan Latihan Huruf N-Z</h3>
                      <p className="text-sm text-muted-foreground">1 hari yang lalu</p>
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
                      <h3 className="font-medium">Menyelesaikan Quiz Huruf Alfabet</h3>
                      <p className="text-sm text-muted-foreground">2 hari yang lalu</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Skor: 90/100</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Mendapatkan Pencapaian Juara Quiz</h3>
                      <p className="text-sm text-muted-foreground">2 hari yang lalu</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Pencapaian: Dapatkan nilai 90+ pada quiz apapun</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Login 5 Hari Berturut-turut</h3>
                      <p className="text-sm text-muted-foreground">3 hari yang lalu</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Streak saat ini: 5 hari</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}