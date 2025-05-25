"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Eye, Loader2, MoreHorizontal, Plus, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function QuizDetail({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // Mock data for the quiz
  const quiz = {
    id: params.id,
    title: "Quiz Huruf Alfabet",
    description: "Quiz mengenali bahasa isyarat huruf A-Z",
    createdAt: "1 minggu yang lalu",
    materialTitle: "Bahasa Isyarat Huruf",
    timeLimit: 30,
    passingScore: 70,
    randomizeQuestions: true,
    showResultsImmediately: true,
    questions: [
      {
        id: "1",
        videoTitle: "Huruf A",
        question: "Apa arti dari bahasa isyarat ini?",
        options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
        correctAnswer: 0,
      },
      {
        id: "2",
        videoTitle: "Huruf B",
        question: "Apa arti dari bahasa isyarat ini?",
        options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
        correctAnswer: 1,
      },
      {
        id: "3",
        videoTitle: "Huruf C",
        question: "Apa arti dari bahasa isyarat ini?",
        options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
        correctAnswer: 2,
      },
      {
        id: "4",
        videoTitle: "Huruf D",
        question: "Apa arti dari bahasa isyarat ini?",
        options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
        correctAnswer: 3,
      },
      {
        id: "5",
        videoTitle: "Huruf E",
        question: "Apa arti dari bahasa isyarat ini?",
        options: ["Huruf E", "Huruf F", "Huruf G", "Huruf H"],
        correctAnswer: 0,
      },
    ],
    students: [
      {
        id: "1",
        name: "Budi Santoso",
        status: "Selesai",
        score: 90,
        completedAt: "2 hari yang lalu",
        duration: "25 menit",
      },
      {
        id: "2",
        name: "Siti Nuraini",
        status: "Selesai",
        score: 75,
        completedAt: "3 hari yang lalu",
        duration: "28 menit",
      },
      {
        id: "3",
        name: "Ahmad Rizki",
        status: "Belum Selesai",
        score: null,
        completedAt: null,
        duration: null,
      },
      {
        id: "4",
        name: "Dewi Putri",
        status: "Belum Mulai",
        score: null,
        completedAt: null,
        duration: null,
      },
    ],
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    // Simulate API call
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: "Quiz berhasil dihapus",
        description: "Quiz telah dihapus dari sistem.",
      })
      // Redirect to quizzes page
      window.location.href = "/teacher/quizzes"
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/quizzes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/teacher/quizzes/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menghapus quiz dan semua data terkait. Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Judul</p>
              <p>{quiz.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dibuat</p>
              <p>{quiz.createdAt}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Materi</p>
              <p>{quiz.materialTitle}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Batas Waktu</p>
              <p>{quiz.timeLimit} menit</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nilai Kelulusan</p>
              <p>{quiz.passingScore}/100</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jumlah Soal</p>
              <p>{quiz.questions.length} soal</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Acak Urutan Soal</p>
              <p>{quiz.randomizeQuestions ? "Ya" : "Tidak"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tampilkan Hasil Segera</p>
              <p>{quiz.showResultsImmediately ? "Ya" : "Tidak"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">Daftar Soal</TabsTrigger>
          <TabsTrigger value="students">Hasil Siswa</TabsTrigger>
        </TabsList>
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Daftar Soal</h2>
            <Link href={`/teacher/quizzes/${params.id}/edit`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Soal
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Soal {index + 1}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>Video: {question.videoTitle}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="font-medium">{question.question}</p>
                  <div className="mt-2 space-y-1">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`rounded-md p-2 text-sm ${
                          optionIndex === question.correctAnswer ? "bg-green-100 dark:bg-green-900/20" : "bg-muted"
                        }`}
                      >
                        {optionIndex === question.correctAnswer && (
                          <span className="mr-2 text-xs font-medium text-green-600 dark:text-green-400">
                            Jawaban Benar
                          </span>
                        )}
                        {option}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="students" className="space-y-4">
          <h2 className="text-xl font-semibold">Hasil Siswa</h2>
          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b bg-muted/50 p-3 text-sm font-medium">
              <div>Nama Siswa</div>
              <div>Status</div>
              <div>Nilai</div>
              <div>Lulus</div>
              <div>Waktu Pengerjaan</div>
              <div className="text-right">Aksi</div>
            </div>
            {quiz.students.map((student) => (
              <div key={student.id} className="grid grid-cols-6 items-center border-b p-3 text-sm">
                <div>{student.name}</div>
                <div>{student.status}</div>
                <div>{student.score !== null ? `${student.score}/100` : "-"}</div>
                <div>
                  {student.score !== null ? (
                    student.score >= quiz.passingScore ? (
                      <span className="text-green-600 dark:text-green-400">Ya</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">Tidak</span>
                    )
                  ) : (
                    "-"
                  )}
                </div>
                <div>{student.duration || "-"}</div>
                <div className="text-right">
                  <Button variant="ghost" size="sm" disabled={student.status === "Belum Mulai"}>
                    <Eye className="mr-2 h-4 w-4" />
                    Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
