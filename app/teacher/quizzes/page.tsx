import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Plus, Search } from "lucide-react"

export default function TeacherQuizzes() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Quiz & Test</h1>
        <p className="text-muted-foreground">Kelola quiz dan test bahasa isyarat untuk siswa Anda.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Cari quiz..." className="w-full bg-background pl-8 md:w-[300px]" />
        </div>
        <Link href="/teacher/quizzes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Quiz
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua Quiz</TabsTrigger>
          <TabsTrigger value="recent">Terbaru</TabsTrigger>
          <TabsTrigger value="popular">Terpopuler</TabsTrigger>
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
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>20 soal</span>
                  <span>Dibuat 1 minggu yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Lihat
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Edit
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
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>10 soal</span>
                  <span>Dibuat 2 minggu yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Lihat
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Edit
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
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>15 soal</span>
                  <span>Dibuat 3 minggu yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Lihat
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Huruf Alfabet</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat huruf A-Z</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>20 soal</span>
                  <span>Dibuat 1 minggu yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Lihat
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="popular" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Angka</CardTitle>
                <CardDescription>Quiz mengenali bahasa isyarat angka 0-9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>10 soal</span>
                  <span>Dibuat 2 minggu yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Lihat
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
