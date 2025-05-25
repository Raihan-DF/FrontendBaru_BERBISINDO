import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Search } from "lucide-react"

export default function StudentQuizzes() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Quiz & Test</h1>
        <p className="text-muted-foreground">Uji pemahaman bahasa isyarat Anda dengan quiz dan test.</p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Cari quiz..." className="w-full bg-background pl-8 md:w-[300px]" />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua Quiz</TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
          {/* <TabsTrigger value="pending">Belum Dikerjakan</TabsTrigger> */}
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Huruf Alfabet</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat huruf A-Z</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">Selesai</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Nilai:</span>
                    <span>90/100</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/quizzes/1" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Lihat Hasil
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quiz Angka</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat angka 0-9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">Belum Selesai</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Kemajuan:</span>
                    <span>5/10 soal</span>
                  </div>
                  <Progress value={50} />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/quizzes/2" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Lanjutkan Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quiz Percakapan Dasar</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat percakapan dasar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="font-medium text-muted-foreground">Belum Dikerjakan</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Jumlah Soal:</span>
                    <span>15 soal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Batas Waktu:</span>
                    <span>30 menit</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/quizzes/3" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Mulai Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Huruf Alfabet</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat huruf A-Z</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">Selesai</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Nilai:</span>
                    <span>90/100</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/quizzes/1" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Lihat Hasil
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Angka</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat angka 0-9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">Belum Selesai</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Kemajuan:</span>
                    <span>5/10 soal</span>
                  </div>
                  <Progress value={50} />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/quizzes/2" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Lanjutkan Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quiz Percakapan Dasar</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat percakapan dasar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="font-medium text-muted-foreground">Belum Dikerjakan</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Jumlah Soal:</span>
                    <span>15 soal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Batas Waktu:</span>
                    <span>30 menit</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/quizzes/3" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Mulai Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
