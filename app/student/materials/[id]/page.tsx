"use client";

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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  TestTube,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";

interface MaterialVideo {
  id: number;
  title: string;
  description: string;
  video_path: string;
  video_url: string;
  stream_url: string;
  direct_url?: string;
  video_filename?: string;
  video_type?: string;
  order: number;
  is_completed?: boolean;
  created_at: string;
}

interface Material {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty_level: number;
  is_published: boolean;
  created_at: string;
  videos_count: number;
  creator: {
    id: number;
    name: string;
  };
  videos: MaterialVideo[];
}

export default function StudentMaterialDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MaterialVideo | null>(
    null
  );
  const [completingVideo, setCompletingVideo] = useState<number | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const { get, post, put, delete: del, buildUrl } = useApi();

  useEffect(() => {
    fetchMaterial();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (selectedVideo) {
      setVideoError(null);
      setVideoLoading(true);

      // Force video element to reload
      const videoElement = document.querySelector("video") as HTMLVideoElement;
      if (videoElement) {
        videoElement.load();
      }
    }
  }, [selectedVideo]);

  const fetchMaterial = async () => {
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
        buildUrl(`/api/materials/${resolvedParams.id}`),
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
        setMaterial(data);

        // Select the first video by default if available
        if (data.videos && data.videos.length > 0) {
          const sortedVideos = [...data.videos].sort(
            (a, b) => a.order - b.order
          );
          setSelectedVideo(sortedVideos[0]);
        }
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data materi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching material:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: MaterialVideo) => {
    console.log("🎬 Switching to video:", video.title);
    setSelectedVideo(video);
    setVideoError(null);
    setVideoLoading(true);
  };

  const markVideoAsCompleted = async (videoId: number) => {
    try {
      setCompletingVideo(videoId);
      const token = localStorage.getItem("token");
      const response = await fetch(
        buildUrl(
          `/api/materials/${resolvedParams.id}/videos/${videoId}/complete`
        ),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        // Update local state
        setMaterial((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            videos: prev.videos.map((video) =>
              video.id === videoId ? { ...video, is_completed: true } : video
            ),
          };
        });

        toast({
          title: "Video selesai!",
          description: "Video telah ditandai sebagai selesai.",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal menandai video sebagai selesai",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking video as completed:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menandai video",
        variant: "destructive",
      });
    } finally {
      setCompletingVideo(null);
    }
  };

  // Generate video URLs
  const getVideoDirectUrl = (video: MaterialVideo) => {
    if (video?.video_path) {
      // Parse video path: material_videos/1/1748173170_huruf-a.mp4
      const pathParts = video.video_path.split("/");
      const materialId = pathParts[1] || resolvedParams.id;
      const filename = pathParts[2] || video.video_filename;
      return buildUrl(`/video/${materialId}/${filename}`);
    }
    return undefined;
  };

  const getVideoStreamUrl = (video: MaterialVideo) => {
    const token = localStorage.getItem("token");
    return buildUrl(
      `/api/materials/${resolvedParams.id}/videos/${video.id}/stream?token=${token}`
    );
  };

  // Test video URLs
  // const testVideoUrls = async () => {
  //   if (!selectedVideo) return

  //   const directUrl = getVideoDirectUrl(selectedVideo)
  //   const streamUrl = getVideoStreamUrl(selectedVideo)

  //   console.log("🧪 Testing Video URLs")
  //   console.log("📁 Direct URL:", directUrl)
  //   console.log("📡 Stream URL:", streamUrl)

  //   let workingUrls = 0
  //   let totalUrls = 0

  //   // Test direct URL
  //   if (directUrl) {
  //     totalUrls++
  //     try {
  //       const directResponse = await fetch(directUrl, {
  //         method: "HEAD",
  //         mode: "cors",
  //       })
  //       console.log("✅ Direct response:", directResponse.status, directResponse.statusText)

  //       if (directResponse.ok) {
  //         workingUrls++
  //         console.log("✅ Direct URL working")
  //       } else {
  //         console.log("❌ Direct URL failed:", directResponse.status)
  //       }
  //     } catch (error) {
  //       console.log("❌ Direct URL CORS/Network error (this is normal):", error)
  //     }
  //   }

  //   // Test stream URL
  //   totalUrls++
  //   try {
  //     const token = localStorage.getItem("token")
  //     const streamResponse = await fetch(streamUrl, {
  //       method: "HEAD",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     console.log("✅ Stream response:", streamResponse.status, streamResponse.statusText)

  //     if (streamResponse.ok) {
  //       workingUrls++
  //       console.log("✅ Stream URL working")
  //     } else {
  //       console.log("❌ Stream URL failed:", streamResponse.status)
  //     }
  //   } catch (error) {
  //     console.log("❌ Stream URL error:", error)
  //   }

  //   // Only show toast if we want to inform user
  //   toast({
  //     title: "URL Test Complete",
  //     description: `Tested ${totalUrls} URLs. Check console for details.`,
  //   })
  // }

  const getDifficultyLabel = (level: number) => {
    const labels = ["", "Pemula", "Dasar", "Menengah", "Lanjut", "Ahli"];
    return labels[level] || "Unknown";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateProgress = () => {
    if (!material?.videos.length) return 0;
    const completedVideos = material.videos.filter(
      (video) => video.is_completed
    ).length;
    return Math.round((completedVideos / material.videos.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Materi tidak ditemukan
        </h3>
        <Link href="/student/materials">
          <Button>Kembali ke Daftar Materi</Button>
        </Link>
      </div>
    );
  }

  const progress = calculateProgress();
  const completedVideos = material.videos.filter(
    (video) => video.is_completed
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/student/materials">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {material.title}
          </h1>
          <p className="text-muted-foreground">{material.description}</p>
        </div>
      </div>

      {selectedVideo ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Material Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Materi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {material.thumbnail && (
                  <div className="aspect-video rounded-md overflow-hidden">
                    <img
                      src={buildUrl(`/storage/${material.thumbnail}`)}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getDifficultyColor(material.difficulty_level)}
                    >
                      {getDifficultyLabel(material.difficulty_level)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{material.videos.length} video</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(material.created_at)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      <span className="font-medium">Dibuat oleh:</span>{" "}
                      {material.creator.name}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {completedVideos}/{material.videos.length} selesai
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {progress}% selesai
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Videos List */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Daftar Video ({material.videos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {material.videos.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Materi ini belum memiliki video pembelajaran
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {material.videos
                      .sort((a, b) => a.order - b.order)
                      .map((video, index) => (
                        <div
                          key={video.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                            selectedVideo?.id === video.id
                              ? "bg-primary/10 border-primary/30"
                              : video.is_completed
                              ? "bg-green-50 border-green-200"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleVideoClick(video)}
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate text-sm flex items-center gap-2">
                              {video.title}
                              {video.is_completed && (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              )}
                            </h4>
                          </div>
                          <Play className="h-4 w-4 flex-shrink-0" />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  {selectedVideo.title}
                </CardTitle>
                {selectedVideo.description && (
                  <CardDescription>{selectedVideo.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {/* Video Container */}
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
                        <div className="flex gap-2 mt-2">
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
                          {/* <Button variant="outline" size="sm" onClick={testVideoUrls}>
                            Test URLs
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  )}

                  <video
                    key={selectedVideo.id} // Add this line
                    className="w-full h-full"
                    controls
                    preload="metadata"
                    onLoadStart={() => {
                      console.log(
                        "⏳ Video loading started for:",
                        selectedVideo.title
                      );
                      setVideoLoading(true);
                    }}
                    onCanPlay={() => {
                      console.log("✅ Video can play:", selectedVideo.title);
                      setVideoLoading(false);
                      toast({
                        title: "Video Ready! ✅",
                        description: `${selectedVideo.title} berhasil dimuat dan siap diputar`,
                      });
                    }}
                    onError={(e) => {
                      console.error(
                        "🚫 Video error for:",
                        selectedVideo.title,
                        e
                      );
                      setVideoError("Video gagal dimuat");
                      setVideoLoading(false);
                      toast({
                        title: "Video Error ❌",
                        description: `${selectedVideo.title} gagal dimuat. Coba refresh halaman atau test URLs.`,
                        variant: "destructive",
                      });
                    }}
                    // Remove the onEnded event handler completely
                    crossOrigin="anonymous"
                    title={selectedVideo.title}
                  >
                    {/* Primary source - Direct URL with CORS headers */}
                    <source
                      src={getVideoDirectUrl(selectedVideo)}
                      type={selectedVideo.video_type || "video/mp4"}
                    />
                    {/* Fallback source - Stream URL */}
                    <source
                      src={getVideoStreamUrl(selectedVideo)}
                      type={selectedVideo.video_type || "video/mp4"}
                    />
                    Browser Anda tidak mendukung video player.
                  </video>
                </div>

                {/* Video Controls */}
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    {!selectedVideo.is_completed && (
                      <Button
                        onClick={() => markVideoAsCompleted(selectedVideo.id)}
                        disabled={completingVideo === selectedVideo.id}
                      >
                        {completingVideo === selectedVideo.id ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                            Menandai...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Tandai Selesai
                          </>
                        )}
                      </Button>
                    )}
                    {selectedVideo.is_completed && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 px-3 py-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selesai
                      </Badge>
                    )}
                  </div>
                  {/* <Button variant="ghost" size="sm" onClick={testVideoUrls} className="text-xs">
                    <TestTube className="h-3 w-3 mr-1" />
                    Debug
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tidak ada video yang tersedia untuk materi ini.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
