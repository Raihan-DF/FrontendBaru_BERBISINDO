"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, FileText, GraduationCap } from "lucide-react"
import { VideoPlayer } from "@/components/video-player"

export default function MaterialDetail({ params }: { params: { id: string } }) {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("videos")

  // Mock data for the material
  const material = {
    id: params.id,
    title:
      params.id === "1"
        ? "Bahasa Isyarat Huruf"
        : params.id === "2"
          ? "Bahasa Isyarat Angka"
          : "Bahasa Isyarat Sehari-hari",
    description:
      params.id === "1"
        ? "Kumpulan video bahasa isyarat untuk huruf A-Z"
        : params.id === "2"
          ? "Kumpulan video bahasa isyarat untuk angka 0-9"
          : "Kumpulan video bahasa isyarat untuk percakapan sehari-hari",
    totalVideos: params.id === "1" ? 26 : params.id === "2" ? 10 : 15,
    watchedVideos: params.id === "1" ? 20 : params.id === "2" ? 10 : 0,
    progress: params.id === "1" ? 77 : params.id === "2" ? 100 : 0,
    videos:
      params.id === "1"
        ? [
            { id: "1", title: "Huruf A", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "2", title: "Huruf B", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "3", title: "Huruf C", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "4", title: "Huruf D", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "5", title: "Huruf E", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "6", title: "Huruf F", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "7", title: "Huruf G", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "8", title: "Huruf H", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "9", title: "Huruf I", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "10", title: "Huruf J", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "11", title: "Huruf K", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "12", title: "Huruf L", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "13", title: "Huruf M", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "14", title: "Huruf N", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "15", title: "Huruf O", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "16", title: "Huruf P", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "17", title: "Huruf Q", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "18", title: "Huruf R", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "19", title: "Huruf S", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "20", title: "Huruf T", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "21", title: "Huruf U", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "22", title: "Huruf V", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "23", title: "Huruf W", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "24", title: "Huruf X", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "25", title: "Huruf Y", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
            { id: "26", title: "Huruf Z", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
          ]
        : params.id === "2"
          ? [
              { id: "1", title: "Angka 0", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "2", title: "Angka 1", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "3", title: "Angka 2", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "4", title: "Angka 3", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "5", title: "Angka 4", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "6", title: "Angka 5", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "7", title: "Angka 6", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "8", title: "Angka 7", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "9", title: "Angka 8", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "10", title: "Angka 9", watched: true, thumbnail: "/placeholder.svg?height=200&width=300" },
            ]
          : [
              { id: "1", title: "Halo", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "2", title: "Selamat Pagi", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "3", title: "Selamat Siang", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "4", title: "Selamat Malam", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "5", title: "Terima Kasih", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "6", title: "Maaf", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "7", title: "Sampai Jumpa", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "8", title: "Apa Kabar", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "9", title: "Baik", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "10", title: "Tidak", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "11", title: "Ya", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "12", title: "Tolong", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "13", title: "Saya", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "14", title: "Kamu", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
              { id: "15", title: "Mereka", watched: false, thumbnail: "/placeholder.svg?height=200&width=300" },
            ],
    relatedExercises: [
      { id: "1", title: "Latihan Huruf A-M", progress: 77 },
      { id: "2", title: "Latihan Huruf N-Z", progress: 100 },
    ],
    relatedQuizzes: [{ id: "1", title: "Quiz Huruf Alfabet", score: 90 }],
  }

  const activeVideo = material.videos[activeVideoIndex]

  const handlePrevVideo = () => {
    if (activeVideoIndex > 0) {
      setActiveVideoIndex(activeVideoIndex - 1)
    }
  }

  const handleNextVideo = () => {
    if (activeVideoIndex < material.videos.length - 1) {
      setActiveVideoIndex(activeVideoIndex + 1)
    }
  }

  const handleVideoComplete = () => {
    // In a real app, this would update the backend
    console.log(`Marked video ${activeVideo.id} as watched`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/student/materials">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{material.title}</h1>
          <p className="text-muted-foreground">{material.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>
            Kemajuan: {material.watchedVideos}/{material.totalVideos} video
          </span>
          <span>{material.progress}%</span>
        </div>
        <Progress value={material.progress} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <VideoPlayer
              src="/placeholder.svg?height=500&width=800"
              poster={activeVideo.thumbnail}
              title={activeVideo.title}
              onComplete={handleVideoComplete}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{activeVideo.title}</CardTitle>
                  <CardDescription>
                    Video {activeVideoIndex + 1} dari {material.videos.length}
                  </CardDescription>
                </div>
                {activeVideo.watched && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="icon" onClick={handlePrevVideo} disabled={activeVideoIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextVideo}
                disabled={activeVideoIndex === material.videos.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="videos" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="videos">Video</TabsTrigger>
              <TabsTrigger value="related">Terkait</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-4">
              <div className="max-h-[500px] space-y-2 overflow-y-auto pr-2">
                {material.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/50 ${
                      index === activeVideoIndex ? "border-primary bg-muted/50" : ""
                    }`}
                    onClick={() => setActiveVideoIndex(index)}
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground">Video {index + 1}</p>
                    </div>
                    {video.watched && <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="related" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Latihan Terkait</h3>
                {material.relatedExercises.map((exercise) => (
                  <Link key={exercise.id} href={`/student/exercises/${exercise.id}`} className="block">
                    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{exercise.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Progress value={exercise.progress} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground">{exercise.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                <h3 className="font-medium">Quiz Terkait</h3>
                {material.relatedQuizzes.map((quiz) => (
                  <Link key={quiz.id} href={`/student/quizzes/${quiz.id}`} className="block">
                    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{quiz.title}</p>
                        {quiz.score !== undefined && (
                          <p className="text-sm text-muted-foreground">Nilai: {quiz.score}/100</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
