"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  Calendar,
  Loader2,
  Play,
  TestTube,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface Video {
  id: number;
  title: string;
  description: string;
  video_filename: string;
  video_path: string;
  video_type: string;
  order: number;
  created_at: string;
  material_id: number;
  video_url?: string;
  stream_url?: string;
  direct_url?: string;
}

interface Material {
  id: number;
  title: string;
  description: string;
}

export default function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string; videoId: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const resolvedParams = use(params);

  const [video, setVideo] = useState<Video | null>(null);
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const { buildUrl } = useApi();

  useEffect(() => {
    fetchVideo();
  }, [resolvedParams.id, resolvedParams.videoId]);

  const fetchVideo = async () => {
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

      // Fetch material info
      const materialResponse = await fetch(
        buildUrl(`/api/materials/${resolvedParams.id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (materialResponse.ok) {
        const materialData = await materialResponse.json();
        setMaterial(materialData);
      }

      // Fetch video info
      const videoResponse = await fetch(
        buildUrl(
          `/api/materials/${resolvedParams.id}/videos/${resolvedParams.videoId}`
        ),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (videoResponse.status === 401) {
        toast({
          title: "Session Expired",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        setVideo(videoData);
        console.log("✅ Video data loaded:", videoData);
      } else {
        const errorData = await videoResponse.text();
        console.error("❌ Video fetch error:", videoResponse.status, errorData);
        setError(`Gagal memuat data video (${videoResponse.status})`);
      }
    } catch (error) {
      console.error("💥 Fetch error:", error);
      setError("Terjadi kesalahan saat memuat data video");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        buildUrl(
          `/api/materials/${resolvedParams.id}/videos/${resolvedParams.videoId}`
        ),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        toast({
          title: "Video berhasil dihapus",
          description: "Video telah dihapus dari materi.",
        });
        router.push(`/teacher/materials/${resolvedParams.id}`);
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus video",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus video",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate video URLs
  const getVideoDirectUrl = () => {
    if (video?.video_path) {
      // Parse video path: material_videos/1/1748173170_huruf-a.mp4
      const pathParts = video.video_path.split("/");
      const materialId = pathParts[1] || resolvedParams.id;
      const filename = pathParts[2] || video.video_filename;
      return buildUrl(`/video/${materialId}/${filename}`);
    }
    return undefined;
  };

  const getVideoStreamUrl = () => {
    const token = localStorage.getItem("token");
    return buildUrl(
      `/api/materials/${resolvedParams.id}/videos/${resolvedParams.videoId}/stream?token=${token}`
    );
  };

  // Test video URLs
  const testVideoUrls = async () => {
    const directUrl = getVideoDirectUrl();
    const streamUrl = getVideoStreamUrl();

    console.log("🧪 Testing Video URLs");
    console.log("📁 Direct URL:", directUrl);
    console.log("📡 Stream URL:", streamUrl);

    // Test direct URL
    if (directUrl) {
      try {
        const directResponse = await fetch(directUrl, {
          method: "HEAD",
          mode: "cors",
        });
        console.log(
          "✅ Direct response:",
          directResponse.status,
          directResponse.statusText
        );
        console.log(
          "📋 Direct headers:",
          Object.fromEntries(directResponse.headers.entries())
        );

        if (directResponse.ok) {
          toast({
            title: "Direct URL Working! ✅",
            description: `Status: ${directResponse.status} - Video dapat diakses langsung`,
          });
        } else {
          toast({
            title: "Direct URL Failed ❌",
            description: `Status: ${directResponse.status}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("❌ Direct URL error:", error);
        toast({
          title: "Direct URL Error ❌",
          description: "Network atau CORS error",
          variant: "destructive",
        });
      }
    }

    // Test stream URL
    try {
      const token = localStorage.getItem("token");
      const streamResponse = await fetch(streamUrl, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(
        "✅ Stream response:",
        streamResponse.status,
        streamResponse.statusText
      );
      console.log(
        "📋 Stream headers:",
        Object.fromEntries(streamResponse.headers.entries())
      );

      if (streamResponse.ok) {
        toast({
          title: "Stream URL Working! ✅",
          description: `Status: ${streamResponse.status} - Video stream dapat diakses`,
        });
      } else {
        toast({
          title: "Stream URL Failed ❌",
          description: `Status: ${streamResponse.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Stream URL error:", error);
      toast({
        title: "Stream URL Error ❌",
        description: "Network error",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !video || !material) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Link href={`/teacher/materials/${resolvedParams.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Video tidak ditemukan"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/teacher/materials/${resolvedParams.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {video.title}
                </h1>
                <p className="text-muted-foreground">
                  Video dari materi: {material.title}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* <Button variant="outline" size="sm" onClick={testVideoUrls}>
            <TestTube className="h-4 w-4 mr-2" />
            Test URLs
          </Button> */}
              <Link
                href={`/teacher/materials/${resolvedParams.id}/videos/${resolvedParams.videoId}/edit`}
              >
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Video
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan menghapus video "{video.title}".
                      Tindakan ini tidak dapat dibatalkan.
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

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Video Player
                  </CardTitle>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={testVideoUrls}
                            >
                              Test URLs
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    <video
                      className="w-full h-full"
                      controls
                      preload="metadata"
                      onLoadStart={() => {
                        console.log("⏳ Video loading started");
                        setVideoLoading(true);
                      }}
                      onCanPlay={() => {
                        console.log("✅ Video can play");
                        setVideoLoading(false);
                        toast({
                          title: "Video Ready! ✅",
                          description: "Video berhasil dimuat dan siap diputar",
                        });
                      }}
                      onError={(e) => {
                        console.error("🚫 Video error:", e);
                        setVideoError("Video gagal dimuat");
                        toast({
                          title: "Video Error ❌",
                          description:
                            "Video gagal dimuat. Coba refresh halaman atau test URLs.",
                          variant: "destructive",
                        });
                      }}
                      crossOrigin="anonymous"
                      title={video.title}
                    >
                      {/* Primary source - Direct URL with CORS headers */}
                      <source
                        src={getVideoDirectUrl()}
                        type={video.video_type || "video/mp4"}
                      />
                      {/* Fallback source - Stream URL */}
                      <source
                        src={getVideoStreamUrl()}
                        type={video.video_type || "video/mp4"}
                      />
                      Browser Anda tidak mendukung video player.
                    </video>
                  </div>

                  {/* Debug Info */}
                  {/* <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                <div className="font-medium text-gray-700">🔧 Debug Information:</div>
                <div className="grid grid-cols-1 gap-1">
                  <p>
                    <strong>🎯 Primary URL:</strong>{" "}
                    <a
                      href={getVideoDirectUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {getVideoDirectUrl()}
                    </a>
                  </p>
                  <p>
                    <strong>📡 Fallback URL:</strong>{" "}
                    <a
                      href={getVideoStreamUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {getVideoStreamUrl()}
                    </a>
                  </p>
                  <p>
                    <strong>📂 Video Path:</strong> {video.video_path}
                  </p>
                  <p>
                    <strong>📄 Filename:</strong> {video.video_filename}
                  </p>
                  <p>
                    <strong>🎬 Type:</strong> {video.video_type}
                  </p>
                </div>
              </div> */}
                </CardContent>
              </Card>
            </div>

            {/* Video Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>ℹ️ Informasi Video</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Judul
                    </p>
                    <p className="font-medium">{video.title}</p>
                  </div>

                  {video.description && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Deskripsi
                      </p>
                      <p className="text-sm text-gray-600">
                        {video.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Tanggal Upload
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(video.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
