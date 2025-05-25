"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle, Search } from "lucide-react"

export default function StudentMaterials() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for materials
  const materials = [
    // {
    //   id: "1",
    //   title: "Bahasa Isyarat Huruf",
    //   description: "Kumpulan video bahasa isyarat untuk huruf A-Z",
    //   totalVideos: 26,
    //   watchedVideos: 20,
    //   progress: 77,
    //   status: "in-progress",
    //   thumbnail: "/placeholder.svg?height=200&width=300",
    // },
    {
      id: "2",
      title: "Bahasa Isyarat Angka",
      description: "Kumpulan video bahasa isyarat untuk angka 0-9",
      totalVideos: 10,
      watchedVideos: 10,
      progress: 100,
      status: "completed",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "3",
      title: "Bahasa Isyarat Sehari-hari",
      description: "Kumpulan video bahasa isyarat untuk percakapan sehari-hari",
      totalVideos: 15,
      watchedVideos: 0,
      progress: 0,
      status: "not-started",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
  ]

  // Filter materials based on search query
  const filteredMaterials = materials.filter(
    (material) =>
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Materi Pembelajaran</h1>
        <p className="text-muted-foreground">Pelajari berbagai materi bahasa isyarat yang tersedia.</p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari materi..."
          className="w-full bg-background pl-8 md:w-[300px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua Materi</TabsTrigger>
          {/* <TabsTrigger value="progress">Sedang Dipelajari</TabsTrigger> */}
          <TabsTrigger value="completed">Selesai</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className={material.status === "completed" ? "border-green-200 dark:border-green-900" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{material.title}</CardTitle>
                      <CardDescription>{material.description}</CardDescription>
                    </div>
                    {material.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video overflow-hidden rounded-md">
                    <img
                      src={material.thumbnail || "/placeholder.svg"}
                      alt={material.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {material.watchedVideos}/{material.totalVideos} video ditonton
                      </span>
                      <span>{material.progress}%</span>
                    </div>
                    <Progress value={material.progress} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/student/materials/${material.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      {material.status === "not-started"
                        ? "Mulai Belajar"
                        : material.status === "in-progress"
                          ? "Lanjutkan Belajar"
                          : "Lihat Kembali"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}

            {filteredMaterials.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Tidak ada materi yang ditemukan</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Coba gunakan kata kunci yang berbeda atau hapus filter pencarian.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials
              .filter((material) => material.status === "in-progress")
              .map((material) => (
                <Card key={material.id}>
                  <CardHeader>
                    <CardTitle>{material.title}</CardTitle>
                    <CardDescription>{material.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video overflow-hidden rounded-md">
                      <img
                        src={material.thumbnail || "/placeholder.svg"}
                        alt={material.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {material.watchedVideos}/{material.totalVideos} video ditonton
                        </span>
                        <span>{material.progress}%</span>
                      </div>
                      <Progress value={material.progress} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/student/materials/${material.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Lanjutkan Belajar
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

            {filteredMaterials.filter((material) => material.status === "in-progress").length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Tidak ada materi yang sedang dipelajari</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mulai pelajari materi baru untuk melihatnya di sini.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials
              .filter((material) => material.status === "completed")
              .map((material) => (
                <Card key={material.id} className="border-green-200 dark:border-green-900">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{material.title}</CardTitle>
                        <CardDescription>{material.description}</CardDescription>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video overflow-hidden rounded-md">
                      <img
                        src={material.thumbnail || "/placeholder.svg"}
                        alt={material.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {material.watchedVideos}/{material.totalVideos} video ditonton
                        </span>
                        <span>{material.progress}%</span>
                      </div>
                      <Progress value={material.progress} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/student/materials/${material.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Lihat Kembali
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

            {filteredMaterials.filter((material) => material.status === "completed").length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Belum ada materi yang selesai</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Selesaikan materi pembelajaran untuk melihatnya di sini.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
