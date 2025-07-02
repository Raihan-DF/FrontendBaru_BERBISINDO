"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";

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
}

interface Exercise {
  id: number;
  title: string;
  description: string;
  material_id: number;
  difficulty_level: number;
  questions: ExerciseQuestion[];
  material: {
    id: number;
    title: string;
  };
}

export default function ExerciseVideoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { buildUrl } = useApi();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);

  useEffect(() => {
    fetchExercise();
  }, [id]);

  const fetchExercise = async () => {
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

      const response = await fetch(buildUrl(`/api/exercises/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
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

      if (!response.ok) {
        throw new Error("Failed to fetch exercise");
      }

      const data = await response.json();
      setExercise(data);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data exercise",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // SIMPLIFIED: Video URL handling like materials
  const getVideoStreamUrl = (question: ExerciseQuestion) => {
    return buildUrl(`/exercise-video/${exercise?.id}/${question.id}`);
  };

  // SIMPLIFIED: Video event handlers like materials
  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setHasWatchedVideo(true);
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.currentTime / video.duration >= 0.5) {
      setHasWatchedVideo(true);
    }
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

  const handleVideoNavigation = (index: number) => {
    setCurrentVideoIndex(index);
    setHasWatchedVideo(false);
    setIsPlaying(false);
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setHasWatchedVideo(false);
      setIsPlaying(false);
    }
  };

  const handleNextVideo = () => {
    if (exercise && currentVideoIndex < exercise.questions.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setHasWatchedVideo(false);
      setIsPlaying(false);
    }
  };

  const getDifficultyColor = (level: number) => {
    const colors = [
      "",
      "bg-green-100 text-green-800",
      "bg-blue-100 text-blue-800",
      "bg-yellow-100 text-yellow-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
    ];
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyText = (level: number) => {
    const labels = [
      "",
      "Sangat Mudah",
      "Mudah",
      "Sedang",
      "Sulit",
      "Sangat Sulit",
    ];
    return labels[level] || "Tidak Diketahui";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3B82F6] border-t-transparent" />
          <p className="text-muted-foreground">Memuat video latihan...</p>
        </div>
      </div>
    );
  }

  if (!exercise || !exercise.questions || exercise.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center py-12">
          <div className="h-16 w-16 text-gray-400 mx-auto mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Video Tidak Tersedia
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Exercise ini tidak memiliki video yang dapat ditonton.
          </p>
          <Link href="/student/exercises">
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Exercise
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = exercise.questions[currentVideoIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/student/exercises">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white line-clamp-2">
              {exercise.title}
            </h1>
          </div>
        </div>

        {/* Video Navigation */}
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            Video {currentVideoIndex + 1} dari {exercise.questions.length}
          </Badge>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousVideo}
              disabled={currentVideoIndex === 0}
              className="h-8 px-2 sm:px-3 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Sebelumnya</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextVideo}
              disabled={currentVideoIndex === exercise.questions.length - 1}
              className="h-8 px-2 sm:px-3 bg-transparent"
            >
              <span className="hidden sm:inline mr-1">Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm bg-white dark:bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span className="line-clamp-2">
                    Video {currentVideoIndex + 1}:{" "}
                    {currentQuestion.material_video?.title}
                  </span>
                  {!hasWatchedVideo && (
                    <div className="text-xs text-muted-foreground">
                      💡 Tonton video hingga selesai
                    </div>
                  )}
                  {hasWatchedVideo && (
                    <Badge
                      variant="secondary"
                      className="text-green-600 ml-2 shrink-0"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Ditonton</span>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-b-lg overflow-hidden">
                  {/* SIMPLIFIED: Video element like materials */}
                  <video
                    key={currentVideoIndex} // Force reload when changing videos
                    className="w-full h-full"
                    controls
                    playsInline
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onEnded={handleVideoEnded}
                    onTimeUpdate={handleVideoTimeUpdate}
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
              </CardContent>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={replayVideo}
                      className="bg-transparent"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Putar Ulang
                    </Button>
                    {isPlaying ? (
                      <Badge variant="secondary" className="text-[#3B82F6]">
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
                </div>
                <div>
                  <span className="text-sm font-medium ml-3">
                    Tingkat Kesulitan:
                  </span>
                  <Badge
                    className={`${getDifficultyColor(
                      exercise.difficulty_level
                    )} text-xs ml-2`}
                  >
                    {getDifficultyText(exercise.difficulty_level)}
                  </Badge>
                </div>
                {/* Video Description */}
                {currentQuestion.material_video?.description && (
                  <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                    <h4 className="font-medium mb-1 text-sm">
                      Deskripsi Video
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {currentQuestion.material_video.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video List Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Daftar Video ({exercise.questions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {exercise.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      index === currentVideoIndex
                        ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                        : "hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-gray-700"
                    }`}
                    onClick={() => handleVideoNavigation(index)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        Video {index + 1}
                      </span>
                      {index === currentVideoIndex && hasWatchedVideo && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs opacity-75 line-clamp-2">
                      {question.material_video?.title ||
                        `Video untuk soal ${index + 1}`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="mt-4 pt-4 border-t">
              <Link href={`/student/exercises/${exercise.id}/practice`}>
                <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] h-10 sm:h-12">
                  <Play className="w-4 h-4 mr-2" />
                  Mulai Latihan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
