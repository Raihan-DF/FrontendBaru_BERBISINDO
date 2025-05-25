import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search } from "lucide-react"

export default function StudentExercises() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Latihan</h1>
        <p className="text-muted-foreground">Latihan untuk meningkatkan pemahaman bahasa isyarat Anda.</p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Cari latihan..." className="w-full bg-background pl-8 md:w-[300px]" />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua Latihan</TabsTrigger>
          {/* <TabsTrigger value="progress">Sedang Dikerjakan</TabsTrigger> */}
          <TabsTrigger value="completed">Selesai</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* <Card>
              <CardHeader>
                <CardTitle>Latihan Huruf A-M</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat huruf A-M</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Kemajuan:</span>
                    <span>10/13 soal</span>
                  </div>
                  <Progress value={77} />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/exercises/1" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Lanjutkan Latihan
                  </Button>
                </Link>
              </CardFooter>
            </Card> */}
            <Card>
              <CardHeader>
                <CardTitle>Latihan Huruf N-Z</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat huruf N-Z</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Kemajuan:</span>
                    <span>13/13 soal</span>
                  </div>
                  <Progress value={100} />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/exercises/2" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Lihat Kembali
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Latihan Angka 0-9</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat angka 0-9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Kemajuan:</span>
                    <span>0/10 soal</span>
                  </div>
                  <Progress value={0} />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/exercises/3" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Mulai Latihan
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Latihan Huruf A-M</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat huruf A-M</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Kemajuan:</span>
                    <span>10/13 soal</span>
                  </div>
                  <Progress value={77} />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/exercises/1" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Lanjutkan Latihan
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
                <CardTitle>Latihan Huruf N-Z</CardTitle>
                <CardDescription>Latihan mengenali bahasa isyarat huruf N-Z</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-muted"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Kemajuan:</span>
                    <span>13/13 soal</span>
                  </div>
                  <Progress value={100} />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/student/exercises/2" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Lihat Kembali
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
