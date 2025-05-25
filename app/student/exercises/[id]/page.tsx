"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ExerciseDetail({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  // Mock data for the exercise
  const exercise = {
    id: params.id,
    title: "Latihan Huruf A-M",
    description: "Latihan mengenali bahasa isyarat huruf A-M",
    questions: [
      {
        id: 1,
        videoUrl: "/placeholder.svg?height=300&width=500",
        question: "Apa arti dari bahasa isyarat ini?",
        options: ["Huruf A", "Huruf B", "Huruf C", "Huruf D"],
        correctAnswer: 0,
      },
      {
        id: 2,
        videoUrl: "/placeholder.svg?height=300&width=500",
        question: "Apa arti dari bahasa isyarat ini?",
        options: ["Huruf E", "Huruf F", "Huruf G", "Huruf H"],
        correctAnswer: 2,
      },
      {
        id: 3,
        videoUrl: "/placeholder.svg?height=300&width=500",
        question: "Apa arti dari bahasa isyarat ini?",
        options: ["Huruf I", "Huruf J", "Huruf K", "Huruf L"],
        correctAnswer: 3,
      },
    ],
  }

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(Number.parseInt(value))
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return

    setIsAnswered(true)
    if (selectedAnswer === exercise.questions[currentQuestion].correctAnswer) {
      setCorrectAnswers((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < exercise.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      // Exercise completed
      toast({
        title: "Latihan selesai!",
        description: `Anda menjawab ${correctAnswers + (selectedAnswer === exercise.questions[currentQuestion].correctAnswer ? 1 : 0)} dari ${exercise.questions.length} soal dengan benar.`,
      })
      // Redirect to exercises page
      window.location.href = "/student/exercises"
    }
  }

  const progress = ((currentQuestion + 1) / exercise.questions.length) * 100

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/student/exercises">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{exercise.title}</h1>
          <p className="text-muted-foreground">{exercise.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>
            Soal {currentQuestion + 1} dari {exercise.questions.length}
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
                src={exercise.questions[currentQuestion].videoUrl || "/placeholder.svg"}
                alt="Video bahasa isyarat"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{exercise.questions[currentQuestion].question}</h2>
              <RadioGroup value={selectedAnswer?.toString()} onValueChange={handleAnswerSelect} disabled={isAnswered}>
                {exercise.questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      className={
                        isAnswered
                          ? index === exercise.questions[currentQuestion].correctAnswer
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
                          ? index === exercise.questions[currentQuestion].correctAnswer
                            ? "text-green-500"
                            : index === selectedAnswer && index !== exercise.questions[currentQuestion].correctAnswer
                              ? "text-red-500"
                              : ""
                          : ""
                      }
                    >
                      {option}
                      {isAnswered && index === exercise.questions[currentQuestion].correctAnswer && (
                        <CheckCircle2 className="ml-2 inline h-4 w-4 text-green-500" />
                      )}
                      {isAnswered &&
                        index === selectedAnswer &&
                        index !== exercise.questions[currentQuestion].correctAnswer && (
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
            {currentQuestion < exercise.questions.length - 1 ? (
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
