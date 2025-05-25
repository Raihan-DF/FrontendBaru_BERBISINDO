import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, BookOpen, CheckCircle, FileText, GraduationCap, Medal, Star, Trophy } from "lucide-react"

export default function StudentAchievements() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pencapaian</h1>
        <p className="text-muted-foreground">
          Lihat semua pencapaian yang telah Anda raih dalam perjalanan belajar bahasa isyarat.
        </p>
      </div>

      {/* Achievement Summary */}
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-background p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-center text-lg font-medium">Total Pencapaian</h3>
            <p className="text-2xl font-bold">12/30</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-background p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <Medal className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-center text-lg font-medium">Medali</h3>
            <p className="text-2xl font-bold">3/10</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-background p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Award className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-center text-lg font-medium">Penghargaan</h3>
            <p className="text-2xl font-bold">5/10</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-background p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Star className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-center text-lg font-medium">Bintang</h3>
            <p className="text-2xl font-bold">4/10</p>
          </div>
        </div>
      </div>

      {/* Achievement Progress */}
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <h2 className="mb-4 text-xl font-semibold">Kemajuan Pencapaian</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Penguasaan Materi</span>
              </div>
              <span>8/12</span>
            </div>
            <Progress value={66} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Penyelesaian Latihan</span>
              </div>
              <span>5/8</span>
            </div>
            <Progress value={62} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Penyelesaian Quiz</span>
              </div>
              <span>3/5</span>
            </div>
            <Progress value={60} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Kehadiran Beruntun</span>
              </div>
              <span>5/7 hari</span>
            </div>
            <Progress value={71} />
          </div>
        </div>
      </div>

      {/* Achievement List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="earned">Diperoleh</TabsTrigger>
          <TabsTrigger value="locked">Belum Diperoleh</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Pemula Bahasa Isyarat</CardTitle>
                    <CardDescription>Selesaikan 5 materi pembelajaran</CardDescription>
                  </div>
                  <Medal className="h-6 w-6 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">3 hari yang lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Ahli Alfabet</CardTitle>
                    <CardDescription>Selesaikan semua materi huruf A-Z</CardDescription>
                  </div>
                  <Award className="h-6 w-6 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">1 minggu yang lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Juara Quiz</CardTitle>
                    <CardDescription>Dapatkan nilai 90+ pada quiz apapun</CardDescription>
                  </div>
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">2 hari yang lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Rajin Berlatih</CardTitle>
                    <CardDescription>Selesaikan 5 latihan berbeda</CardDescription>
                  </div>
                  <Star className="h-6 w-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">3 hari yang lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Master Bahasa Isyarat</CardTitle>
                    <CardDescription>Selesaikan semua materi pembelajaran</CardDescription>
                  </div>
                  <Medal className="h-6 w-6 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Belum Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">8/12 materi</span>
                </div>
                <Progress value={66} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Konsisten Belajar</CardTitle>
                    <CardDescription>Belajar 7 hari berturut-turut</CardDescription>
                  </div>
                  <Star className="h-6 w-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Belum Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">5/7 hari</span>
                </div>
                <Progress value={71} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earned" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Pemula Bahasa Isyarat</CardTitle>
                    <CardDescription>Selesaikan 5 materi pembelajaran</CardDescription>
                  </div>
                  <Medal className="h-6 w-6 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">3 hari yang lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Ahli Alfabet</CardTitle>
                    <CardDescription>Selesaikan semua materi huruf A-Z</CardDescription>
                  </div>
                  <Award className="h-6 w-6 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">1 minggu yang lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Juara Quiz</CardTitle>
                    <CardDescription>Dapatkan nilai 90+ pada quiz apapun</CardDescription>
                  </div>
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">2 hari yang lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Rajin Berlatih</CardTitle>
                    <CardDescription>Selesaikan 5 latihan berbeda</CardDescription>
                  </div>
                  <Star className="h-6 w-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">3 hari yang lalu</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="opacity-50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Master Bahasa Isyarat</CardTitle>
                    <CardDescription>Selesaikan semua materi pembelajaran</CardDescription>
                  </div>
                  <Medal className="h-6 w-6 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Belum Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">8/12 materi</span>
                </div>
                <Progress value={66} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Konsisten Belajar</CardTitle>
                    <CardDescription>Belajar 7 hari berturut-turut</CardDescription>
                  </div>
                  <Star className="h-6 w-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Belum Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">5/7 hari</span>
                </div>
                <Progress value={71} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Quiz Master</CardTitle>
                    <CardDescription>Selesaikan semua quiz dengan nilai minimal 80</CardDescription>
                  </div>
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Belum Diperoleh
                  </Badge>
                  <span className="text-xs text-muted-foreground">3/5 quiz</span>
                </div>
                <Progress value={60} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
