import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, GraduationCap, Plus, Users } from "lucide-react"

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Guru</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali, Ahmad Fauzi. Berikut adalah ringkasan aktivitas pembelajaran Anda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materi</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 dalam 30 hari terakhir</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Latihan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 dalam 30 hari terakhir</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quiz</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+1 dalam 30 hari terakhir</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 dalam 30 hari terakhir</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="materials">Materi Terbaru</TabsTrigger>
          <TabsTrigger value="exercises">Latihan Terbaru</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Terbaru</TabsTrigger>
        </TabsList>
        <TabsContent value="materials" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Materi Terbaru</h2>
            <Link href="/teacher/materials/create">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Materi
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Bahasa Isyarat Huruf</CardTitle>
                <CardDescription>Kumpulan video bahasa isyarat untuk huruf A-Z</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">26 video • Dibuat 3 hari yang lalu</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bahasa Isyarat Angka</CardTitle>
                <CardDescription>Kumpulan video bahasa isyarat untuk angka 0-9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">10 video • Dibuat 1 minggu yang lalu</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bahasa Isyarat Sehari-hari</CardTitle>
                <CardDescription>Kumpulan video bahasa isyarat untuk percakapan sehari-hari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">15 video • Dibuat 2 minggu yang lalu</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="exercises" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Latihan Terbaru</h2>
            <Link href="/teacher/exercises/create">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Latihan
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Latihan Huruf A-M</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat huruf A-M</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">13 soal • Dibuat 5 hari yang lalu</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Latihan Huruf N-Z</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat huruf N-Z</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">13 soal • Dibuat 5 hari yang lalu</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Latihan Angka 0-9</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat angka 0-9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">10 soal • Dibuat 1 minggu yang lalu</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="quizzes" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Quiz Terbaru</h2>
            <Link href="/teacher/quizzes/create">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Quiz
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Huruf Alfabet</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat huruf A-Z</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">20 soal • Dibuat 1 minggu yang lalu</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quiz Angka</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat angka 0-9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">10 soal • Dibuat 2 minggu yang lalu</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quiz Percakapan Dasar</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat percakapan dasar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <p className="mt-2 text-sm text-muted-foreground">15 soal • Dibuat 3 minggu yang lalu</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
