"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
import { ArrowLeft, Loader2, Plus, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EditExercise({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: "Latihan Huruf A-M",
    description: "Latihan mengenali bahasa isyarat huruf A-M",
    materialId: "1",
  })
  const [questions, setQuestions] = useState([
    {
      id: 1,
      videoId: "1",
      question: "Apa arti dari bahasa isyarat ini?",
      options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
      correctAnswer: 0,
    },
    {
      id: 2,
      videoId: "2",
      question: "Apa arti dari bahasa isyarat ini?",
      options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
      correctAnswer: 1,
    },
    {
      id: 3,
      videoId: "3",
      question: "Apa arti dari bahasa isyarat ini?",
      options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
      correctAnswer: 2,
    },
    {
      id: 4,
      videoId: "4",
      question: "Apa arti dari bahasa isyarat ini?",
      options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
      correctAnswer: 3,
    },
    {
      id: 5,
      videoId: "5",
      question: "Apa arti dari bahasa isyarat ini?",
      options: ["Huruf E", "Huruf F", "Huruf G", "Huruf H"],
      correctAnswer: 0,
    },
  ])

  // Mock data for materials
  const materials = [
    { id: "1", title: "Bahasa Isyarat Huruf" },
    { id: "2", title: "Bahasa Isyarat Angka" },
    { id: "3", title: "Bahasa Isyarat Sehari-hari" },
  ]

  // Mock data for videos
  const videos = [
    { id: "1", title: "Huruf A", materialId: "1" },
    { id: "2", title: "Huruf B", materialId: "1" },
    { id: "3", title: "Huruf C", materialId: "1" },
    { id: "4", title: "Huruf D", materialId: "1" },
    { id: "5", title: "Huruf E", materialId: "1" },
    { id: "6", title: "Huruf F", materialId: "1" },
    { id: "7", title: "Huruf G", materialId: "1" },
    { id: "8", title: "Angka 1", materialId: "2" },
    { id: "9", title: "Angka 2", materialId: "2" },
    { id: "10", title: "Halo", materialId: "3" },
    { id: "11", title: "Terima Kasih", materialId: "3" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleQuestionChange = (index: number, field: string, value: string | number) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  const handleCorrectAnswerChange = (questionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].correctAnswer = Number.parseInt(value)
    setQuestions(newQuestions)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, videoId: "", question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      setQuestions(newQuestions)
    } else {
      toast({
        title: "Tidak dapat menghapus",
        description: "Latihan harus memiliki minimal satu soal.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Latihan berhasil diperbarui",
        description: "Perubahan pada latihan telah berhasil disimpan.",
      })
      // Redirect to exercise detail page
      window.location.href = `/teacher/exercises/${params.id}`
    }, 1500)
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    // Simulate API call
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: "Latihan berhasil dihapus",
        description: "Latihan telah dihapus dari sistem.",
      })
      // Redirect to exercises page
      window.location.href = "/teacher/exercises"
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/teacher/exercises/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Latihan</h1>
          <p className="text-muted-foreground">Perbarui latihan dan soal-soalnya.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Hapus Latihan
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus latihan dan semua data terkait. Tindakan ini tidak dapat dibatalkan.
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Latihan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Latihan</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialId">Pilih Materi</Label>
              <Select value={formData.materialId} onValueChange={(value) => handleSelectChange("materialId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih materi" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Soal Latihan</h2>
          <Button type="button" onClick={addQuestion} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Soal
          </Button>
        </div>

        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Soal {index + 1}</CardTitle>
              <Button
                type="button"
                onClick={() => removeQuestion(index)}
                variant="ghost"
                size="icon"
                className="text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`video-${index}`}>Pilih Video</Label>
                <Select
                  value={question.videoId}
                  onValueChange={(value) => handleQuestionChange(index, "videoId", value)}
                >
                  <SelectTrigger id={`video-${index}`}>
                    <SelectValue placeholder="Pilih video" />
                  </SelectTrigger>
                  <SelectContent>
                    {videos
                      .filter((video) => !formData.materialId || video.materialId === formData.materialId)
                      .map((video) => (
                        <SelectItem key={video.id} value={video.id}>
                          {video.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`question-${index}`}>Pertanyaan</Label>
                <Input
                  id={`question-${index}`}
                  value={question.question}
                  onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-4">
                <Label>Pilihan Jawaban</Label>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`correct-${index}`}>Jawaban Benar</Label>
                <Select
                  value={question.correctAnswer.toString()}
                  onValueChange={(value) => handleCorrectAnswerChange(index, value)}
                >
                  <SelectTrigger id={`correct-${index}`}>
                    <SelectValue placeholder="Pilih jawaban benar" />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options.map((_, optionIndex) => (
                      <SelectItem key={optionIndex} value={optionIndex.toString()}>
                        Pilihan {optionIndex + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-4">
          <Link href={`/teacher/exercises/${params.id}`}>
            <Button variant="outline">Batal</Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
