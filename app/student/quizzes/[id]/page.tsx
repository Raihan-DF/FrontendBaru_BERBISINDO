"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function QuizDetail({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes in seconds
  const [quizStatus, setQuizStatus] = useState<"not-started" | "in-progress" | "completed">("not-started")
  const [quizResult, setQuizResult] = useState<{
    score: number
    totalQuestions: number
    correctAnswers: number
    timeTaken: string
    isPassed: boolean
  } | null>(null)

  // Mock data for the quiz
  const quiz = {
    id: params.id,
    title: params.id === "1" ? "Quiz Huruf Alfabet" : params.id === "2" ? "Quiz Angka" : "Quiz Percakapan Dasar",
    description:
      params.id === "1"
        ? "Quiz mengenali bahasa isyarat huruf A-Z"
        : params.id === "2"
          ? "Quiz mengenali bahasa isyarat angka 0-9"
          : "Quiz mengenali bahasa isyarat percakapan dasar",
    timeLimit: 30, // in minutes
    passingScore: 70,
    questions:
      params.id === "1"
        ? [
            {
              id: "1",
              videoUrl: "/placeholder.svg?height=300&width=500",
              question: "Apa arti dari bahasa isyarat ini?",
              options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
              correctAnswer: 0,
            },
            {
              id: "2",
              videoUrl: "/placeholder.svg?height=300&width=500",
              question: "Apa arti dari bahasa isyarat ini?",
              options: ["Huruf E", "Huruf F", "Huruf G", "Huruf H"],
              correctAnswer: 1,
            },
            {
              id: "3",
              videoUrl: "/placeholder.svg?height=300&width=500",
              question: "Apa arti dari bahasa isyarat ini?",
              options: ["Huruf I", "Huruf J", "Huruf K", "Huruf L"],
              correctAnswer: 2,
            },
            {
              id: "4",
              videoUrl: "/placeholder.svg?height=300&width=500",
              question: "Apa arti dari bahasa isyarat ini?",
              options: ["Huruf M", "Huruf N", "Huruf O", "Huruf P"],
              correctAnswer: 3,
            },
            {
              id: "5",
              videoUrl: "/placeholder.svg?height=300&width=500",
              question: "Apa arti dari bahasa isyarat ini?",
              options: ["Huruf Q", "Huruf R", "Huruf S", "Huruf T"],
              correctAnswer: 0,
            },
          ]
        : params.id === "2"
          ? [
              {
                id: "1",
                videoUrl: "/placeholder.svg?height=300&width=500",
                question: "Apa arti dari bahasa isyarat ini?",
                options: ["Angka 0", "Angka 1", "Angka 2", "Angka 3"],
                correctAnswer: 1,
              },
              {
                id: "2",
                videoUrl: "/placeholder.svg?height=300&width=500",
                question: "Apa arti dari bahasa isyarat ini?",
                options: ["Angka 4", "Angka 5", "Angka 6", "Angka 7"],
                correctAnswer: 2,
              },
              {
                id: "3",
                videoUrl: "/placeholder.svg?height=300&width=500",
                question: "Apa arti dari bahasa isyarat ini?",
                options: ["Angka 8", "Angka 9", "Angka 10", "Angka 11"],
                correctAnswer: 0,
              },
            ]
          : [
              {
                id: "1",
                videoUrl: "/placeholder.svg?height=300&width=500",
                question: "Apa arti dari bahasa isyarat ini?",
                options: ["Halo", "Selamat Tinggal", "Terima Kasih", "Maaf"],
                correctAnswer: 0,
              },
              {
                id: "2",
                videoUrl: "/placeholder.svg?height=300&width=500",
                question: "Apa arti dari bahasa isyarat ini?",
                options: ["Halo", "Selamat Tinggal", "Terima Kasih", "Maaf"],
                correctAnswer: 2,
              },
              {
                id: "3",
                videoUrl: "/placeholder.svg?height=300&width=500",
                question: "Apa arti dari bahasa isyarat ini?",
                options: ["Halo", "Selamat Tinggal", "Terima Kasih", "Maaf"],
                correctAnswer: 3,
              },
            ],
  }

  // Set initial quiz status based on the quiz ID
  useEffect(() => {
    if (params.id === "1") {
      // Quiz 1 is completed
      setQuizStatus("completed")
      setQuizResult({
        score: 90,
        totalQuestions: 5,
        correctAnswers: 4,
        timeTaken: "25 menit",
        isPassed: true,
      })
    } else if (params.id === "2") {
      // Quiz 2 is in progress
      setQuizStatus("in-progress")
      setCurrentQuestion(1) // Already answered 1 question
      setCorrectAnswers(1) // Got 1 correct
    } else {
      // Quiz 3 is not started
      setQuizStatus("not-started")
    }
  }, [params.id])

  // Timer effect
  useEffect(() => {
    if (quizStatus === "in-progress" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (quizStatus === "in-progress" && timeLeft === 0) {
      // Time's up, submit quiz
      finishQuiz()
    }
  }, [timeLeft, quizStatus])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handleStartQuiz = () => {
    setQuizStatus("in-progress")
    setTimeLeft(quiz.timeLimit * 60)
    setCurrentQuestion(0)
    setCorrectAnswers(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
  }

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(Number.parseInt(value))
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return

    setIsAnswered(true)
    if (selectedAnswer === quiz.questions[currentQuestion].correctAnswer) {
      setCorrectAnswers((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      // Quiz completed
      finishQuiz()
    }
  }

  const finishQuiz = () => {
    const totalCorrect =
      correctAnswers + (isAnswered && selectedAnswer === quiz.questions[currentQuestion].correctAnswer ? 1 : 0)
    const score = Math.round((totalCorrect / quiz.questions.length) * 100)
    const timeTaken = `${quiz.timeLimit - Math.floor(timeLeft / 60)} menit ${59 - (timeLeft % 60)} detik`

    setQuizResult({
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers: totalCorrect,
      timeTaken,
      isPassed: score >= quiz.passingScore,
    })

    setQuizStatus("completed")

    toast({
      title: "Quiz selesai!",
      description: `Anda mendapatkan nilai ${score} dari 100.`,
    })
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  // Render quiz result page
  if (quizStatus === "completed" && quizResult) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/student/quizzes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Hasil Quiz
              {quizResult.isPassed ? (
                <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="ml-2 h-5 w-5 text-red-500" />
              )}
            </CardTitle>
            <CardDescription>
              {quizResult.isPassed
                ? "Selamat! Anda telah lulus quiz ini."
                : "Anda belum lulus quiz ini. Silakan coba lagi."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nilai</p>
                  <p className="text-2xl font-bold">{quizResult.score}/100</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className={`font-medium ${quizResult.isPassed ? "text-green-600" : "text-red-600"}`}>
                    {quizResult.isPassed ? "Lulus" : "Tidak Lulus"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jawaban Benar</p>
                  <p>
                    {quizResult.correctAnswers}/{quizResult.totalQuestions} soal
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Waktu Pengerjaan</p>
                  <p>{quizResult.timeTaken}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Nilai Kelulusan: {quiz.passingScore}/100</p>
              <Progress value={(quizResult.score / 100) * 100} className="h-4" />
              <div className="flex justify-between text-xs">
                <span>0</span>
                <span className="font-medium">{quiz.passingScore}</span>
                <span>100</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <Link href="/student/quizzes" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Kembali ke Daftar Quiz
                </Button>
              </Link>
              {!quizResult.isPassed && (
                <Button className="w-full sm:w-auto" onClick={handleStartQuiz}>
                  Coba Lagi
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Render quiz start page
  if (quizStatus === "not-started") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/student/quizzes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Quiz</CardTitle>
            <CardDescription>Baca informasi berikut sebelum memulai quiz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jumlah Soal</p>
                <p>{quiz.questions.length} soal</p>
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
                <p className="text-sm font-medium text-muted-foreground">Tampilkan Hasil</p>
                <p>Setelah quiz selesai</p>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">Petunjuk:</p>
              <ul className="ml-6 mt-2 list-disc space-y-1 text-sm">
                <li>Pastikan Anda memiliki koneksi internet yang stabil.</li>
                <li>Jangan meninggalkan halaman quiz saat sedang mengerjakan.</li>
                <li>Jawab semua pertanyaan sebelum waktu habis.</li>
                <li>Klik "Periksa Jawaban" untuk melihat apakah jawaban Anda benar.</li>
                <li>Klik "Soal Berikutnya" untuk melanjutkan ke soal berikutnya.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <Link href="/student/quizzes" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Kembali
                </Button>
              </Link>
              <Button className="w-full sm:w-auto" onClick={handleStartQuiz}>
                Mulai Quiz
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Render quiz in progress
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>
            Soal {currentQuestion + 1} dari {quiz.questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="aspect-video overflow-hidden rounded-md bg-muted">
              <img
                src={quiz.questions[currentQuestion].videoUrl || "/placeholder.svg"}
                alt="Video bahasa isyarat"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{quiz.questions[currentQuestion].question}</h2>
              <RadioGroup value={selectedAnswer?.toString()} onValueChange={handleAnswerSelect} disabled={isAnswered}>
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      className={
                        isAnswered
                          ? index === quiz.questions[currentQuestion].correctAnswer
                            ? "border-green-500 text-green-500"
                            : index === selectedAnswer
                              ? "border-red-500 text-red-500"
                              : ""
                          : ""
                      }
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className={
                        isAnswered
                          ? index === quiz.questions[currentQuestion].correctAnswer
                            ? "text-green-500"
                            : index === selectedAnswer && index !== quiz.questions[currentQuestion].correctAnswer
                              ? "text-red-500"
                              : ""
                          : ""
                      }
                    >
                      {option}
                      {isAnswered && index === quiz.questions[currentQuestion].correctAnswer && (
                        <CheckCircle2 className="ml-2 inline h-4 w-4 text-green-500" />
                      )}
                      {isAnswered &&
                        index === selectedAnswer &&
                        index !== quiz.questions[currentQuestion].correctAnswer && (
                          <XCircle className="ml-2 inline h-4 w-4 text-red-500" />
                        )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        {!isAnswered ? (
          <Button onClick={handleCheckAnswer} disabled={selectedAnswer === null}>
            Periksa Jawaban
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestion < quiz.questions.length - 1 ? (
              <>
                Soal Berikutnya
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Selesai"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
