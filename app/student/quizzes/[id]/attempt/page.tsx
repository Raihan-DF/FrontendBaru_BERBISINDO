"use client";

import type React from "react";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  ChevronLeft,
  ChevronRight,
  Flag,
  Eye,
  EyeOff,
  Play,
  Pause,
  Loader2,
  RotateCcw,
  Trophy,
  Target,
  Award,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";

interface MaterialVideo {
  id: number;
  title: string;
  description: string;
  video_filename: string;
  video_path: string;
  order: number;
}

interface QuizOption {
  id: number;
  option_text: string;
  order: number;
}

interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  points: number;
  order: number;
  material_video_id?: number;
  material_video?: MaterialVideo;
  options: QuizOption[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit: number; // in minutes
  total_questions: number;
  total_points: number;
  passing_score: number;
  questions: QuizQuestion[];
}

interface QuizAttemptResult {
  message: string;
  attempt_id: number;
  score: number;
  max_score: number;
  percentage: number;
  passing_score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  time_taken?: number;
}

export default function QuizAttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const { buildUrl } = useApi();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionId -> optionId
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizAttemptResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showQuestionNavigation, setShowQuestionNavigation] = useState(false);

  // Modal states
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showUnfinishedModal, setShowUnfinishedModal] = useState(false);
  const [showEmptyQuizModal, setShowEmptyQuizModal] = useState(false);

  // IMPROVED: Video states for better iOS compatibility
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [videoKey, setVideoKey] = useState(0); // Force video reload

  useEffect(() => {
    fetchQuiz();
  }, [resolvedParams.id]);

  // Timer effect for countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResults && !showTimeUpModal) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !showResults && !showTimeUpModal) {
      handleTimeUp();
    }
  }, [timeLeft, showResults, quiz, showTimeUpModal]);

  // Timer effect for elapsed time tracking
  useEffect(() => {
    if (startTime && !showResults) {
      const timer = setInterval(() => {
        setElapsedTime(
          Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        );
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, showResults]);

  // IMPROVED: Reset video states when question changes
  useEffect(() => {
    if (quiz && quiz.questions[currentQuestionIndex]) {
      setVideoLoading(true);
      setVideoError(null);
      setHasWatchedVideo(false);
      setIsVideoPlaying(false);
      setVideoCanPlay(false);
      setVideoKey((prev) => prev + 1); // Force video reload

      const currentQuestion = quiz.questions[currentQuestionIndex];
      setShowVideo(
        !!currentQuestion.material_video_id && !!currentQuestion.material_video
      );
    }
  }, [currentQuestionIndex, quiz]);

  const fetchQuiz = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        buildUrl(`/api/quizzes/${resolvedParams.id}`),
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
        router.push("/auth/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();

        if (data && data.questions && !Array.isArray(data.questions)) {
          data.questions = Object.values(data.questions);
        }

        if (data && data.questions) {
          data.questions = data.questions.map((question: any) => {
            if (question.options && !Array.isArray(question.options)) {
              question.options = Object.values(question.options);
            }
            return question;
          });
        }

        setQuiz(data);
        setTimeLeft(data.time_limit * 60);
        setStartTime(new Date());

        if (data.questions && data.questions.length > 0) {
          const firstQuestion = data.questions[0];
          setShowVideo(
            !!firstQuestion.material_video_id && !!firstQuestion.material_video
          );
        }

        await startQuizAttempt();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Gagal memuat quiz",
          variant: "destructive",
        });
        router.push(`/student/quizzes/${resolvedParams.id}`);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat quiz",
        variant: "destructive",
      });
      router.push(`/student/quizzes/${resolvedParams.id}`);
    } finally {
      setLoading(false);
    }
  };

  const startQuizAttempt = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        buildUrl(`/api/quizzes/${resolvedParams.id}/start`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const attemptData = await response.json();
        return attemptData;
      } else {
        const errorData = await response.json();

        if (errorData.error === "Quiz already completed") {
          toast({
            title: "Quiz Sudah Selesai",
            description: "Anda sudah menyelesaikan quiz ini sebelumnya.",
            variant: "destructive",
          });
          router.push(`/student/quizzes/${resolvedParams.id}`);
        } else if (errorData.error === "Maximum attempts reached") {
          toast({
            title: "Batas Percobaan Tercapai",
            description:
              "Anda telah mencapai batas maksimal percobaan untuk quiz ini.",
            variant: "destructive",
          });
          router.push(`/student/quizzes/${resolvedParams.id}`);
        }
      }
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      toast({
        title: "Error",
        description: "Gagal memulai quiz attempt.",
        variant: "destructive",
      });
    }
  };

  // IMPROVED: Better video URL handling for iOS
  const getVideoStreamUrl = (question: QuizQuestion) => {
    if (!question.material_video_id || !question.material_video) return "";
    return buildUrl(`/quiz-video/${quiz?.id}/${question.id}`);
  };

  // IMPROVED: Better error handling for iOS
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const error = video.error;

    console.error("Video error:", {
      code: error?.code,
      message: error?.message,
      src: video.src,
      networkState: video.networkState,
      readyState: video.readyState,
    });

    setVideoLoading(false);
    setVideoCanPlay(false);

    let errorMessage = "Video gagal dimuat.";
    if (error?.code === 4) {
      errorMessage = "Format video tidak didukung oleh browser Anda.";
    } else if (error?.code === 3) {
      errorMessage = "Video rusak atau tidak dapat didekode.";
    } else if (error?.code === 2) {
      errorMessage = "Koneksi internet bermasalah.";
    }

    setVideoError(errorMessage);
  };

  const handleVideoLoadStart = () => {
    console.log("Video loading started");
    setVideoLoading(true);
    setVideoCanPlay(false);
  };

  const handleVideoCanPlay = () => {
    console.log("Video can play");
    setVideoLoading(false);
    setVideoCanPlay(true);
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
    if (video.currentTime / video.duration >= 0.5) {
      setHasWatchedVideo(true);
    }
  };

  // IMPROVED: Better retry mechanism for iOS
  const retryVideo = () => {
    setVideoError(null);
    setVideoLoading(true);
    setVideoCanPlay(false);
    setVideoKey((prev) => prev + 1); // Force complete reload

    // Small delay to ensure DOM update
    setTimeout(() => {
      const videoElement = document.querySelector("video") as HTMLVideoElement;
      if (videoElement) {
        videoElement.load();
        // Try to play after load for iOS
        setTimeout(() => {
          videoElement.play().catch((err) => {
            console.warn("Auto-play failed:", err);
          });
        }, 500);
      }
    }, 100);
  };

  const replayVideo = () => {
    const videoElement = document.querySelector("video") as HTMLVideoElement;
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.play().catch((err) => {
        console.warn("Replay failed:", err);
      });
    }
  };

  const toggleVideoDisplay = () => {
    setShowVideo(!showVideo);
    if (!showVideo) {
      // Reset video states when showing
      setVideoLoading(true);
      setVideoError(null);
      setVideoCanPlay(false);
      setVideoKey((prev) => prev + 1);
    }
  };

  const handleAnswerChange = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowQuestionNavigation(false);
  };

  const toggleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleTimeUp = async () => {
    const answeredCount = getAnsweredCount();

    // Jika belum ada yang dikerjakan sama sekali
    if (answeredCount === 0) {
      setShowTimeUpModal(false);
      setShowEmptyQuizModal(true); // Modal baru untuk kasus ini
    } else {
      // Jika sudah ada yang dikerjakan, submit otomatis
      setShowTimeUpModal(false);
      await handleSubmitQuiz(true);
    }
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (!quiz) return;

    const unansweredQuestions = quiz.questions.filter((q) => !answers[q.id]);

    if (unansweredQuestions.length > 0 && !isAutoSubmit) {
      setShowUnfinishedModal(true);
      return;
    } else if (unansweredQuestions.length > 0 && isAutoSubmit) {
      toast({
        title: "Waktu Habis",
        description: `${unansweredQuestions.length} soal belum terjawab, tetapi quiz akan tetap dikirim.`,
        variant: "destructive",
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
        router.push("/auth/login");
        return;
      }

      const response = await fetch(buildUrl(`/api/quizzes/${quiz.id}/submit`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          answers: answers,
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        router.push("/auth/login");
        return;
      }

      if (response.ok) {
        const resultData = await response.json();
        resultData.time_taken = elapsedTime;
        setResults(resultData);
        setShowResults(true);

        // if (isAutoSubmit) {
        //   toast({
        //     title: "Quiz Dikirim Otomatis",
        //     description: "Quiz telah dikirim karena waktu habis.",
        //     variant: "default",
        //   });
        // } else {
        //   toast({
        //     title: "Quiz Berhasil Dikirim",
        //     description: `Skor Anda: ${resultData.score}/${resultData.max_score} (${resultData.percentage}%)`,
        //   });
        // }
      } else {
        const errorData = await response.json();

        if (errorData.error === "No active attempt found") {
          toast({
            title: "Sesi Quiz Berakhir",
            description: "Sesi quiz Anda telah berakhir. Memulai ulang quiz...",
            variant: "destructive",
          });
          await startQuizAttempt();
          setTimeout(() => {
            handleSubmitQuiz(isAutoSubmit);
          }, 1000);
        } else {
          toast({
            title: "Error",
            description:
              errorData.message || errorData.error || "Gagal mengirim quiz",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim quiz",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnfinishedSubmit = async (forceSubmit: boolean) => {
    setShowUnfinishedModal(false);
    if (forceSubmit) {
      await handleSubmitQuiz(true);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
  };

  const getTimeColor = () => {
    if (timeLeft <= 300) return "text-red-600"; // Last 5 minutes
    if (timeLeft <= 600) return "text-yellow-600"; // Last 10 minutes
    return "text-green-600";
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const currentQuestionHasVideo = () => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return false;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    return (
      !!currentQuestion.material_video_id && !!currentQuestion.material_video
    );
  };

  const handleEmptyQuizExit = () => {
    setShowEmptyQuizModal(false);
    toast({
      title: "Quiz Dibatalkan",
      description: "Anda keluar dari quiz tanpa menyimpan jawaban.",
      variant: "default",
    });

    // Null check untuk quiz
    if (quiz?.id) {
      router.push(`/student/quizzes/${quiz.id}`);
    } else {
      router.push("/student/quizzes");
    }
  };

  const handleEmptyQuizSubmit = async () => {
    setShowEmptyQuizModal(false);
    await handleSubmitQuiz(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#8B5CF6]" />
          <p className="text-muted-foreground">Memuat quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Quiz tidak ditemukan
          </h3>
          <Link href="/student/quizzes">
            <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Quiz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (
    !quiz.questions ||
    !Array.isArray(quiz.questions) ||
    quiz.questions.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Quiz tidak memiliki soal
          </h3>
          <Link href="/student/quizzes">
            <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
              Kembali ke Daftar Quiz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults && results) {
    const isPassingGrade = results.percentage >= results.passing_score;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6 max-w-4xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/student/quizzes">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Quiz Selesai
            </h1>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {isPassingGrade ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />
                  </div>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {results.message}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {quiz.title} • Quiz Selesai
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {results.score}
                </div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">
                  Skor Total
                </div>
                <div className="text-xs text-gray-500">
                  dari {results.max_score}
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {results.percentage.toFixed(1)}%
                </div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">
                  Persentase
                </div>
                <div className="text-xs text-gray-500">
                  {isPassingGrade ? "Lulus" : "Belum Lulus"}
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {results.correct_answers}/{results.total_questions}
                </div>
                <div className="text-xs sm:text-sm text-purple-600 font-medium">
                  Benar
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(
                    (results.correct_answers / results.total_questions) * 100
                  )}
                  % akurasi
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                  {formatTime(results.time_taken || elapsedTime)}
                </div>
                <div className="text-xs sm:text-sm text-orange-600 font-medium">
                  Waktu
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress Penyelesaian</span>
                <span>
                  {results.correct_answers}/{results.total_questions} benar
                </span>
              </div>
              <Progress
                value={
                  (results.correct_answers / results.total_questions) * 100
                }
                className="h-3"
              />
            </div>

            {/* Achievement Badge */}
            {isPassingGrade && (
              <div className="text-center mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 dark:text-green-400 font-medium">
                  Selamat! Anda telah lulus quiz ini
                </p>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Skor Anda melebihi batas kelulusan {results.passing_score}%
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link href="/student/quizzes">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Daftar Quiz
                </Button>
              </Link>
              <Link href={`/student/quizzes/${quiz.id}`}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail Quiz
                </Button>
              </Link>
              <Button className="w-full sm:w-auto bg-[#8B5CF6] hover:bg-[#7C3AED]">
                <Trophy className="mr-2 h-4 w-4" />
                Lihat Detail Jawaban
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage =
    ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href={`/student/quizzes/${quiz.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white line-clamp-2">
              {quiz.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Kerjakan semua soal dengan teliti
            </p>
          </div>
          <div className="text-right">
            <div className={`text-xl sm:text-2xl font-bold ${getTimeColor()}`}>
              <Clock className="inline h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Waktu tersisa
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] dark:from-[#5B21B6] dark:to-[#7C3AED] p-4 sm:p-6 shadow-md">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {currentQuestionIndex + 1}/{quiz.questions.length}
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Progress
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {getAnsweredCount()}/{quiz.questions.length}
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Terjawab
              </p>
            </div>
            {/* <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">{formatTime(elapsedTime)}</div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">Berlalu</p>
            </div> */}
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2 bg-white/20" />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowQuestionNavigation(!showQuestionNavigation)}
            size="sm"
          >
            {showQuestionNavigation ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showQuestionNavigation ? "Sembunyikan" : "Tampilkan"} Navigasi
          </Button>
        </div>

        {/* Question Navigation */}
        {showQuestionNavigation && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-3">
              Navigasi Soal
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {quiz.questions.map((question, index) => (
                <Button
                  key={question.id}
                  variant={
                    index === currentQuestionIndex ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleQuestionNavigation(index)}
                  className={`relative text-xs ${
                    answers[question.id]
                      ? "bg-green-100 border-green-300 dark:bg-green-900/20"
                      : ""
                  }`}
                >
                  {index + 1}
                  {flaggedQuestions.has(question.id) && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                  )}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Terjawab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span>Belum Terjawab</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-yellow-500" />
                <span>Ditandai</span>
              </div>
            </div>
          </div>
        )}

        {/* Video Player */}
        {showVideo && currentQuestionHasVideo() && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              {hasWatchedVideo && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ditonton
                </Badge>
              )}
            </div>
            {!hasWatchedVideo && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                💡 Tonton video untuk pemahaman lebih baik
              </div>
            )}

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
                    <AlertTriangle className="h-8 w-8" />
                    <p className="text-sm mb-2">{videoError}</p>
                    <Button variant="outline" size="sm" onClick={retryVideo}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Coba Lagi
                    </Button>
                  </div>
                </div>
              )}

              {/* IMPROVED: Better video element for iOS compatibility */}
              <video
                key={`${videoKey}-${currentQuestion.id}-${currentQuestion.material_video_id}`}
                className="w-full h-full object-contain"
                controls
                preload="metadata"
                playsInline // Critical for iOS
                webkit-playsinline="true" // Legacy iOS support
                muted // Helps with autoplay policies
                onLoadStart={handleVideoLoadStart}
                onCanPlay={handleVideoCanPlay}
                onError={handleVideoError}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
                onTimeUpdate={handleVideoTimeUpdate}
                crossOrigin="anonymous"
                style={{ backgroundColor: "#000" }}
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
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={replayVideo}
                  disabled={!videoCanPlay}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Putar Ulang
                </Button>
                {isVideoPlaying ? (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    Sedang Diputar
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <Pause className="h-3 w-3 mr-1" />
                    Dijeda
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                Soal {currentQuestion.order}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {currentQuestion.points} poin
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentQuestionHasVideo() && !showVideo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVideoDisplay}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Video
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFlagQuestion(currentQuestion.id)}
                className={
                  flaggedQuestions.has(currentQuestion.id)
                    ? "bg-yellow-100 border-yellow-300"
                    : ""
                }
              >
                <Flag
                  className={`h-4 w-4 ${
                    flaggedQuestions.has(currentQuestion.id)
                      ? "text-yellow-600"
                      : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          {/* Question Text */}
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-700 rounded-md mb-4">
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer Options */}
          <RadioGroup
            value={answers[currentQuestion.id]?.toString() || ""}
            onValueChange={(value) =>
              handleAnswerChange(currentQuestion.id, Number.parseInt(value))
            }
            className="space-y-3 mb-4"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <RadioGroupItem
                  value={option.id.toString()}
                  id={`option-${option.id}`}
                />
                <Label
                  htmlFor={`option-${option.id}`}
                  className="flex-1 cursor-pointer text-sm sm:text-base text-gray-900 dark:text-white"
                >
                  {option.option_text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="h-9 sm:h-10"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={() => handleSubmitQuiz()}
                  disabled={isSubmitting}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white h-9 sm:h-10 px-6 sm:px-8"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Mengirim..." : "Kirim Quiz"}
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  className="h-9 sm:h-10"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Warning */}
        {timeLeft <= 20 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 border-l-red-500">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-700 dark:text-red-400 text-sm sm:text-base">
                  Waktu Hampir Habis!
                </h3>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-500">
                  Segera selesaikan quiz Anda. Quiz akan otomatis dikirim jika
                  waktu habis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Time Up Modal - untuk kasus sudah ada jawaban */}
        <Dialog open={showTimeUpModal} onOpenChange={setShowTimeUpModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Clock className="h-5 w-5" />
                Waktu Habis!
              </DialogTitle>
              <DialogDescription>
                Waktu quiz telah habis. Quiz akan dikirim dengan jawaban yang
                sudah Anda kerjakan.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="text-center space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <CheckCircle className="h-8 w-8 text-blue-500 mx-auto" />
                <div className="text-lg font-semibold text-red-600">00:00</div>
                <p className="text-sm text-muted-foreground">
                  Soal terjawab:{" "}
                  <span className="font-semibold text-blue-600">
                    {getAnsweredCount()}
                  </span>{" "}
                  dari {quiz?.questions.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Jawaban Anda akan disimpan otomatis
                </p>
              </div>

              <Button
                onClick={handleTimeUp}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Quiz Sekarang
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Unfinished Quiz Modal */}
        <Dialog
          open={showUnfinishedModal}
          onOpenChange={setShowUnfinishedModal}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Quiz Belum Selesai
              </DialogTitle>
              <DialogDescription>
                Masih ada soal yang belum dijawab. Apakah Anda yakin ingin
                mengirim quiz?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="text-center space-y-2 mb-4">
                <p className="text-sm">
                  Soal belum terjawab:{" "}
                  <span className="font-semibold text-red-600">
                    {quiz ? quiz.questions.length - getAnsweredCount() : 0}
                  </span>{" "}
                  dari {quiz?.questions.length || 0}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleUnfinishedSubmit(true)}
                  variant="destructive"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    "Ya, Kirim Quiz"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUnfinishedModal(false)}
                  className="w-full"
                >
                  Kembali Mengerjakan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Empty Quiz Time Up Modal */}
        <Dialog open={showEmptyQuizModal} onOpenChange={setShowEmptyQuizModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600 text-base sm:text-lg font-semibold">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                Waktu Habis - Quiz Kosong
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Waktu quiz telah habis dan Anda belum menjawab satupun soal. Apa
                yang ingin Anda lakukan?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 px-3 sm:px-4">
              {/* Alert Box */}
              <div className="text-center space-y-2 mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mx-auto" />
                <p className="text-sm sm:text-base font-medium text-orange-700 dark:text-orange-400">
                  Belum ada jawaban yang tersimpan
                </p>
                <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-500">
                  Soal terjawab: 0 dari {quiz?.questions.length || 0}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleEmptyQuizExit}
                  variant="outline"
                  className="w-full text-sm sm:text-base h-auto py-2 sm:py-3 whitespace-normal leading-snug text-wrap bg-red-600"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center text-center">
                    <span className="flex items-center justify-center gap-1 text-white">
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Keluar Tanpa Menyimpan
                    </span>
                    <span className="ml-0 sm:ml-2 mt-1 sm:mt-0 text-[10px] sm:text-xs text-yellow-300">
                      (Tidak mengurangi percobaan)
                    </span>
                  </div>
                </Button>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Atau Mulai Ulang Quiz
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
