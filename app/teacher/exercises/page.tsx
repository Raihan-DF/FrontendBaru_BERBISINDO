import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Search } from "lucide-react"

export default function TeacherExercises() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Latihan</h1>
        <p className="text-muted-foreground">Kelola latihan bahasa isyarat untuk siswa Anda.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Cari latihan..." className="w-full bg-background pl-8 md:w-[300px]" />
        </div>
        <Link href="/teacher/exercises/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Latihan
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua Latihan</TabsTrigger>
          <TabsTrigger value="recent">Terbaru</TabsTrigger>
          <TabsTrigger value="popular">Terpopuler</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Latihan Huruf A-M</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat huruf A-M</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>13 soal</span>
                  <span>Dibuat 5 hari yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
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
                <CardTitle>Latihan Huruf N-Z</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat huruf N-Z</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>13 soal</span>
                  <span>Dibuat 5 hari yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
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
                <CardTitle>Latihan Angka 0-9</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat angka 0-9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>10 soal</span>
                  <span>Dibuat 1 minggu yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
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
                <CardTitle>Latihan Huruf A-M</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat huruf A-M</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>13 soal</span>
                  <span>Dibuat 5 hari yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
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
                <CardTitle>Latihan Angka 0-9</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat angka 0-9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>10 soal</span>
                  <span>Dibuat 1 minggu yang lalu</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
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
