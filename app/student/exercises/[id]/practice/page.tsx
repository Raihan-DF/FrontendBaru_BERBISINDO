"use client";

import type React from "react";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Clock,
  Play,
  Pause,
  RepeatIcon as Replay,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";

interface ExerciseOption {
  id: number;
  option_text: string;
  is_correct?: boolean;
  order: number;
}

interface MaterialVideo {
  id: number;
  title: string;
  description: string;
  video_filename: string;
  video_path: string;
  order: number;
}

interface ExerciseQuestion {
  id: number;
  exercise_id: number;
  material_video_id: number;
  question: string;
  points: number;
  order: number;
  material_video: MaterialVideo;
  options: ExerciseOption[];
}

interface Exercise {
  id: number;
  title: string;
  description: string;
  material_id: number;
  difficulty_level: number;
  is_published: boolean;
  created_at: string;
  total_questions: number;
  total_points: number;
  creator: {
    id: number;
    name: string;
  };
  material: {
    id: number;
    title: string;
  };
  questions: ExerciseQuestion[];
  is_completed?: boolean;
  score?: number;
  attempt_count?: number;
}

interface FeedbackResponse {
  question_id: number;
  selected_option: {
    id: number;
    text: string;
    is_correct: boolean;
  };
  correct_option: {
    id: number;
    text: string;
  };
  is_correct: boolean;
  points_earned: number;
  max_points: number;
  explanation: string;
  is_last_question: boolean;
  current_progress: {
    answered_questions: number;
    total_questions: number;
    current_score: number;
    max_score: number;
  };
  final_results?: {
    total_score: number;
    max_score: number;
    percentage: number;
    correct_answers: number;
    total_questions: number;
    message: string;
  };
}

export default function ExercisePracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const { get, post, put, delete: del, buildUrl } = useApi();

  useEffect(() => {
    fetchExercise();
    setStartTime(new Date());
  }, [resolvedParams.id]);

  useEffect(() => {
    if (startTime && !isCompleted) {
      const timer = setInterval(() => {
        setElapsedTime(
          Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        );
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, isCompleted]);

  // Reset video states when question changes
  useEffect(() => {
    setVideoLoading(true);
    setVideoError(null);
    setHasWatchedVideo(false);
    setIsVideoPlaying(false);
  }, [currentQuestionIndex]);

  const fetchExercise = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      const response = await fetch(
        buildUrl(`/api/exercises/${resolvedParams.id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setExercise(data);
        setIsCompleted(data.is_completed || false);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data latihan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching exercise:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getVideoStreamUrl = (question: ExerciseQuestion) => {
    return buildUrl(`/exercise-video/${exercise?.id}/${question.id}`);
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    setHasWatchedVideo(true);
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    // Mark as watched if user has watched at least 50% of the video
    if (video.currentTime / video.duration >= 0.5) {
      setHasWatchedVideo(true);
    }
  };

  const replayVideo = () => {
    const videoElement = document.querySelector("video") as HTMLVideoElement;
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.play();
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !exercise) return;

    // Encourage watching video first
    if (!hasWatchedVideo) {
      toast({
        title: "Tonton Video Terlebih Dahulu",
        description: "Disarankan untuk menonton video sebelum menjawab soal.",
        variant: "default",
      });
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      const currentQuestion = exercise.questions[currentQuestionIndex];

      const response = await fetch(
        buildUrl(
          `/api/exercises/${resolvedParams.id}/questions/${currentQuestion.id}/answer`
        ),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            selected_option_id: Number.parseInt(selectedOption),
          }),
        }
      );

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (response.ok) {
        const feedbackData = await response.json();
        setFeedback(feedbackData);
        setShowFeedback(true);

        if (feedbackData.is_last_question) {
          setIsCompleted(true);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Gagal mengirim jawaban",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim jawaban",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exercise!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption("");
      setShowFeedback(false);
      setFeedback(null);
    }
  };

  const resetExercise = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        buildUrl(`/api/exercises/${resolvedParams.id}/reset`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        setCurrentQuestionIndex(0);
        setSelectedOption("");
        setShowFeedback(false);
        setFeedback(null);
        setIsCompleted(false);
        setStartTime(new Date());
        setElapsedTime(0);
        setHasWatchedVideo(false);
        toast({
          title: "Latihan direset",
          description: "Anda dapat memulai latihan dari awal.",
        });
      }
    } catch (error) {
      console.error("Error resetting exercise:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Latihan tidak ditemukan
        </h3>
        <Link href="/student/exercises">
          <Button>Kembali ke Daftar Latihan</Button>
        </Link>
      </div>
    );
  }

  const currentQuestion = exercise.questions[currentQuestionIndex];
  const progressPercentage = feedback?.current_progress
    ? (feedback.current_progress.answered_questions /
        feedback.current_progress.total_questions) *
      100
    : (currentQuestionIndex / exercise.questions.length) * 100;

  // Final Results Screen
  if (isCompleted && feedback?.final_results) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/student/exercises">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Latihan Selesai</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              {feedback.final_results.message}
            </CardTitle>
            <CardDescription>
              Hasil latihan: {exercise.title} • Waktu: {formatTime(elapsedTime)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {feedback.final_results.total_score}
                </div>
                <div className="text-sm text-muted-foreground">Skor Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {feedback.final_results.percentage}%
                </div>
                <div className="text-sm text-muted-foreground">Persentase</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {feedback.final_results.correct_answers}/
                  {feedback.final_results.total_questions}
                </div>
                <div className="text-sm text-muted-foreground">
                  Jawaban Benar
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {feedback.final_results.max_score}
                </div>
                <div className="text-sm text-muted-foreground">
                  Skor Maksimal
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4 py-4">
              <Link href="/student/exercises">
                <Button variant="outline" className="w-full md:w-auto">
                  Kembali ke Daftar Latihan
                </Button>
              </Link>
              <Link href={`/student/exercises/${exercise.id}/video`}>
                <Button variant="outline" className="w-full md:w-auto">
                  <Eye className="mr-2 h-4 w-4" />
                  Tonton Video Lagi
                </Button>
              </Link>
              <Button onClick={resetExercise} className="w-full md:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" />
                Ulangi Latihan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/exercises">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {exercise.title}
          </h1>
          <p className="text-muted-foreground">
            Tonton video dan jawab pertanyaan yang diberikan
          </p>
        </div>
        <Link href={`/student/exercises/${exercise.id}/video`}>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Lihat Semua Video
          </Button>
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Progress Latihan</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(elapsedTime)}
            </span>
            <span>
              {feedback?.current_progress?.answered_questions ||
                currentQuestionIndex}{" "}
              / {exercise.questions.length}
            </span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question Info */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Soal {currentQuestionIndex + 1} dari {exercise.questions.length}
        </Badge>
        <div className="text-sm text-muted-foreground">
          {currentQuestion.points} poin
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Video Player */}
        <div className="order-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Video: {currentQuestion.material_video.title}</span>
                {hasWatchedVideo && (
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ditonton
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Tonton video ini untuk menjawab soal {currentQuestion.order}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-md bg-black flex items-center justify-center relative overflow-hidden">
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p className="text-sm">Memuat video...</p>
                    </div>
                  </div>
                )}

                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="flex flex-col items-center gap-2 text-white text-center p-4">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm">{videoError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVideoError(null);
                          setVideoLoading(true);
                          const videoElement = document.querySelector(
                            "video"
                          ) as HTMLVideoElement;
                          if (videoElement) {
                            videoElement.load();
                          }
                        }}
                      >
                        Coba Lagi
                      </Button>
                    </div>
                  </div>
                )}

                <video
                  key={`${currentQuestion.id}-${currentQuestion.material_video.id}`}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                  onLoadStart={() => {
                    console.log("⏳ Practice video loading started");
                    setVideoLoading(true);
                  }}
                  onCanPlay={() => {
                    console.log("✅ Practice video can play");
                    setVideoLoading(false);
                  }}
                  onError={(e) => {
                    console.error("🚫 Practice video error:", e);
                    setVideoError(
                      "Video gagal dimuat. Periksa koneksi internet Anda."
                    );
                    setVideoLoading(false);
                  }}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnded}
                  onTimeUpdate={handleVideoTimeUpdate}
                  crossOrigin="anonymous"
                >
                  <source
                    src={getVideoStreamUrl(currentQuestion)}
                    type="video/mp4"
                  />
                  <p className="text-white p-4">
                    Browser Anda tidak mendukung pemutar video.
                  </p>
                </video>
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={replayVideo}>
                    <Replay className="h-4 w-4 mr-1" />
                    Putar Ulang
                  </Button>
                  {isVideoPlaying ? (
                    <Badge variant="secondary" className="text-blue-600">
                      <Play className="h-3 w-3 mr-1" />
                      Sedang Diputar
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Pause className="h-3 w-3 mr-1" />
                      Dijeda
                    </Badge>
                  )}
                </div>
                {!hasWatchedVideo && (
                  <div className="text-xs text-muted-foreground">
                    💡 Tonton video hingga selesai untuk melanjutkan
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question and Answers */}
        <div className="order-2">
          <Card>
            <CardHeader>
              <CardTitle>Soal {currentQuestion.order}</CardTitle>
              <CardDescription>
                Pilih jawaban yang paling tepat berdasarkan video yang Anda
                tonton
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Text */}
              <div className="p-4 bg-muted rounded-md">
                <p className="text-lg font-medium">
                  {currentQuestion.question}
                </p>
              </div>

              {!showFeedback ? (
                <>
                  {/* Answer Options */}
                  <RadioGroup
                    value={selectedOption}
                    onValueChange={setSelectedOption}
                  >
                    <div className="space-y-3">
                      {currentQuestion.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50"
                        >
                          <RadioGroupItem
                            value={option.id.toString()}
                            id={`option-${option.id}`}
                          />
                          <Label
                            htmlFor={`option-${option.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option.option_text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption || isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Jawaban"}
                  </Button>

                  {/* Hint for watching video */}
                  {!hasWatchedVideo && (
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        💡 Disarankan untuk menonton video terlebih dahulu
                        sebelum menjawab
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Feedback Section */
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-md ${
                      feedback?.is_correct
                        ? "bg-green-100 dark:bg-green-900/20"
                        : "bg-red-100 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {feedback?.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {feedback?.is_correct ? "Benar!" : "Kurang Tepat"}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{feedback?.explanation}</p>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Jawaban Anda: </span>
                        <span
                          className={
                            feedback?.is_correct
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {feedback?.selected_option.text}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Jawaban Benar: </span>
                        <span className="text-green-600">
                          {feedback?.correct_option.text}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Poin Diperoleh: </span>
                        <span>
                          {feedback?.points_earned}/{feedback?.max_points}
                        </span>
                      </div>
                      {feedback?.current_progress && (
                        <div>
                          <span className="font-medium">Skor Saat Ini: </span>
                          <span>
                            {feedback.current_progress.current_score}/
                            {feedback.current_progress.max_score}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Question Button */}
                  {!feedback?.is_last_question ? (
                    <Button
                      onClick={handleNextQuestion}
                      className="w-full"
                      size="lg"
                    >
                      Soal Berikutnya
                    </Button>
                  ) : (
                    <div className="text-center">
                      <p className="text-lg font-medium mb-4">
                        Latihan Selesai!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Hasil akan ditampilkan sebentar lagi...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
