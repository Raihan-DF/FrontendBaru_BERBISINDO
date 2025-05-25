"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, GraduationCap, Trophy } from "lucide-react"

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("recent")

  return (
    <div className="flex flex-col gap-6 mb-8 mt-6x">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Halo, Budi Santoso! 👋</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali. Mari lanjutkan pembelajaran bahasa isyarat Anda.
        </p>
      </div>

      {/* Learning Progress Summary */}
      <div className="">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Materi Dipelajari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-bold">8/12</div>
            </div>
            <Progress value={66} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">66% materi telah dipelajari</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latihan Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold">5/8</div>
            </div>
            <Progress value={62} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">62% latihan telah diselesaikan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quiz Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              <div className="text-2xl font-bold">3/5</div>
            </div>
            <Progress value={60} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">60% quiz telah diselesaikan</p>
          </CardContent>
        </Card>

        {/* <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nilai Rata-rata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div className="text-2xl font-bold">85/100</div>
            </div>
            <Progress value={85} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">Nilai rata-rata dari semua quiz</p>
          </CardContent>
        </Card> */}
      </div>

      {/* Learning Journey */}
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <h2 className="mb-4 text-xl font-semibold">Perjalanan Belajar Anda</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-muted"></div>
          <div className="space-y-8">
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="font-medium">Bahasa Isyarat Huruf</h3>
              <p className="text-sm text-muted-foreground">20/26 video telah ditonton</p>
              <div className="mt-2">
                <Progress value={77} className="h-2" />
              </div>
              <div className="mt-2">
                <Link href="/student/materials/1">
                  <Button variant="outline" size="sm">
                    Lanjutkan
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative pl-10">
              <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="font-medium">Latihan Huruf A-M</h3>
              <p className="text-sm text-muted-foreground">10/13 soal telah dikerjakan</p>
              <div className="mt-2">
                <Progress value={77} className="h-2" />
              </div>
              <div className="mt-2">
                <Link href="/student/exercises/1">
                  <Button variant="outline" size="sm">
                    Lanjutkan
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative pl-10">
              <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                3
              </div>
              <h3 className="font-medium">Quiz Huruf Alfabet</h3>
              <p className="text-sm text-muted-foreground">Belum dimulai</p>
              <div className="mt-2">
                <Link href="/student/quizzes/3">
                  <Button variant="outline" size="sm">
                    Mulai Quiz
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities & Recommendations */}
      <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Aktivitas Terbaru</TabsTrigger>
          <TabsTrigger value="recommended">Rekomendasi</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Huruf Alfabet</CardTitle>
                <CardDescription>Diselesaikan 2 hari yang lalu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nilai:</span>
                  <span className="text-sm font-bold">90/100</span>
                </div>
                <Progress value={90} className="mt-2" />
                <p className="mt-2 text-sm text-muted-foreground">20 soal • 18 benar • 2 salah</p>
              </CardContent>
              <CardFooter>
                <Link href="/student/quizzes/1" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Lihat Detail
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latihan Huruf N-Z</CardTitle>
                <CardDescription>Diselesaikan 3 hari yang lalu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Kemajuan:</span>
                  <span className="text-sm font-bold">100%</span>
                </div>
                <Progress value={100} className="mt-2" />
                <p className="mt-2 text-sm text-muted-foreground">13 soal • 13 benar • 0 salah</p>
              </CardContent>
              <CardFooter>
                <Link href="/student/exercises/2" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Lihat Detail
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Materi Bahasa Isyarat Angka</CardTitle>
                <CardDescription>Dipelajari 5 hari yang lalu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Kemajuan:</span>
                  <span className="text-sm font-bold">100%</span>
                </div>
                <Progress value={100} className="mt-2" />
                <p className="mt-2 text-sm text-muted-foreground">10 video • Semua telah ditonton</p>
              </CardContent>
              <CardFooter>
                <Link href="/student/materials/2" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Lihat Kembali
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Materi Bahasa Isyarat Sehari-hari</CardTitle>
                <CardDescription>Belum dipelajari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">15 video • Estimasi waktu: 45 menit</p>
              </CardContent>
              <CardFooter>
                <Link href="/student/materials/3" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Mulai Belajar
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latihan Percakapan Dasar</CardTitle>
                <CardDescription>Belum dikerjakan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">15 soal • Estimasi waktu: 30 menit</p>
              </CardContent>
              <CardFooter>
                <Link href="/student/exercises/3" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Mulai Latihan
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Percakapan Dasar</CardTitle>
                <CardDescription>Belum dikerjakan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">15 soal • Estimasi waktu: 30 menit</p>
              </CardContent>
              <CardFooter>
                <Link href="/student/quizzes/3" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Mulai Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  )
}
