"use client";

import type React from "react";
import { useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload, Video, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useApi } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";

export default function CreateVideo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const resolvedParams = use(params);
  const { buildUrl } = useApi();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 0,
  });
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    width: number;
    height: number;
  } | null>(null);
  const [isVideoValid, setIsVideoValid] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "order"
          ? value === "" || isNaN(Number(value))
            ? 0
            : Number(value)
          : value,
    }));
    if (error) setError(null);
  };

  const validateAndProcessVideo = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);

      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const metadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        };

        setVideoMetadata(metadata);

        const isValid =
          metadata.width > 0 && metadata.height > 0 && metadata.duration > 0;
        setIsVideoValid(isValid);

        if (isValid) {
          setVideoPreview(url);
        } else {
          URL.revokeObjectURL(url);
          setError(
            "File video tidak valid atau corrupt. Silakan pilih file lain."
          );
        }

        resolve(isValid);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        setError(
          "File video tidak dapat dibaca. Format mungkin tidak didukung."
        );
        resolve(false);
      };

      video.src = url;
    });
  };

  // Simplified high-quality video compression (8 Mbps)
  const compressVideo = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Check MediaRecorder support
      if (!window.MediaRecorder) {
        const renamedFile = new File(
          [file],
          file.name.replace(/\.[^/.]+$/, ".mp4"),
          {
            type: "video/mp4",
            lastModified: file.lastModified,
          }
        );
        resolve(renamedFile);
        return;
      }

      setIsCompressing(true);
      setCompressionProgress(0);

      const video = videoRef.current || document.createElement("video");
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      const url = URL.createObjectURL(file);
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const { videoWidth, videoHeight, duration } = video;

        // Keep original dimensions, just optimize quality
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        // Create MediaRecorder with high quality settings (8 Mbps)
        const stream = canvas.captureStream(30); // 30 FPS
        let mimeType = "video/mp4";

        // Fallback ke WebM jika MP4 tidak didukung
        if (!MediaRecorder.isTypeSupported("video/mp4")) {
          if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
            mimeType = "video/webm;codecs=vp9";
          } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
            mimeType = "video/webm;codecs=vp8";
          } else {
            mimeType = "video/webm";
          }
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: 8000000, // 8 Mbps for high quality
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const fileName = file.name.replace(/\.[^/.]+$/, ".mp4");

          const compressedFile = new File([blob], fileName, {
            type: "video/mp4",
            lastModified: Date.now(),
          });

          URL.revokeObjectURL(url);
          setIsCompressing(false);
          resolve(compressedFile);
        };

        mediaRecorder.onerror = (event) => {
          URL.revokeObjectURL(url);
          setIsCompressing(false);
          reject(new Error("Compression failed"));
        };

        // Start recording
        mediaRecorder.start(100);

        let currentTime = 0;
        const frameInterval = 1 / 30; // 30 FPS

        const drawFrame = () => {
          if (currentTime >= duration) {
            mediaRecorder.stop();
            return;
          }

          video.currentTime = currentTime;

          video.onseeked = () => {
            // High quality canvas rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

            currentTime += frameInterval;
            setCompressionProgress((currentTime / duration) * 100);

            setTimeout(drawFrame, 33); // ~30 FPS
          };
        };

        drawFrame();
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        setIsCompressing(false);
        reject(new Error("Video processing failed"));
      };
    });
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setOriginalFile(null);
    setProcessedFile(null);
    setVideoPreview(null);
    setVideoMetadata(null);
    setIsVideoValid(false);

    // Check file size (max 500MB for original)
    if (file.size > 500 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 500MB.");
      return;
    }

    // Enhanced file type checking
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-ms-wmv",
      "video/webm",
      "video/ogg",
    ];

    const fileExtension = file.name.toLowerCase().split(".").pop();
    const supportedExtensions = ["mp4", "mov", "avi", "wmv", "webm", "ogv"];

    const isValidType =
      allowedTypes.includes(file.type) ||
      supportedExtensions.includes(fileExtension || "");

    if (!isValidType) {
      setError(
        "Format file tidak didukung. Gunakan MP4, MOV, AVI, WMV, WebM, atau OGV."
      );
      return;
    }

    setOriginalFile(file);

    // Auto-fill title if empty
    if (!formData.title) {
      const titleFromFilename = file.name.replace(/\.[^/.]+$/, "");
      setFormData((prev) => ({
        ...prev,
        title: titleFromFilename,
      }));
    }

    try {
      const isValid = await validateAndProcessVideo(file);
      if (!isValid) return;

      // Auto-compress for non-MP4 files or large files
      const needsCompression =
        file.type !== "video/mp4" || file.size > 50 * 1024 * 1024;

      if (needsCompression) {
        toast({
          title: "Mengoptimalkan Video",
          description:
            "Video sedang diproses dengan kualitas tinggi (8 Mbps)...",
        });

        try {
          const processed = await compressVideo(file);
          setProcessedFile(processed);

          toast({
            title: "Video Berhasil Dioptimalkan",
            description:
              "Video telah diproses dengan kualitas tinggi dan siap diupload.",
          });
        } catch (compressionError) {
          console.error("Compression failed:", compressionError);
          const fallbackFile = new File(
            [file],
            file.name.replace(/\.[^/.]+$/, ".mp4"),
            {
              type: "video/mp4",
              lastModified: file.lastModified,
            }
          );
          setProcessedFile(fallbackFile);
          toast({
            title: "Menggunakan File Asli",
            description: "Optimasi gagal, menggunakan file original.",
            variant: "destructive",
          });
        }
      } else {
        setProcessedFile(file);
      }
    } catch (validationError) {
      console.error("Video validation failed:", validationError);
      setError("Gagal memvalidasi video. Silakan coba file lain.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fileToUpload = processedFile || originalFile;
    if (!fileToUpload) {
      setError("Silakan pilih file video");
      return;
    }

    if (!isVideoValid) {
      setError("Video tidak valid. Silakan pilih file video yang benar.");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

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

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("video", fileToUpload);

      // if (formData.order) {
      //   submitData.append("order", formData.order)
      // }

      submitData.append(
        "order",
        formData.order !== undefined && formData.order !== null
          ? String(formData.order)
          : "0"
      );

      if (videoMetadata) {
        submitData.append("video_duration", videoMetadata.duration.toString());
        submitData.append("video_width", videoMetadata.width.toString());
        submitData.append("video_height", videoMetadata.height.toString());
      }

      if (processedFile && processedFile !== originalFile) {
        submitData.append("is_processed", "true");
        submitData.append("compression_quality", "high");
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 201) {
          toast({
            title: "Video berhasil ditambahkan",
            description:
              "Video telah berhasil diupload dengan kualitas tinggi.",
          });

          if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
          }

          router.push(`/teacher/materials/${resolvedParams.id}`);
        } else if (xhr.status === 401) {
          toast({
            title: "Session Expired",
            description: "Sesi Anda telah berakhir. Silakan login kembali.",
            variant: "destructive",
          });
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          const errorData = JSON.parse(xhr.responseText);
          setError(
            errorData.error || errorData.message || "Gagal mengupload video"
          );
        }
        setLoading(false);
      });

      xhr.addEventListener("error", () => {
        setError("Terjadi kesalahan saat mengupload video");
        setLoading(false);
      });

      xhr.addEventListener("timeout", () => {
        setError("Upload timeout. Coba lagi dengan koneksi yang lebih stabil.");
        setLoading(false);
      });

      xhr.timeout = 15 * 60 * 1000;

      xhr.open("POST", buildUrl(`/api/materials/${resolvedParams.id}/videos`));
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(submitData);
    } catch (err) {
      console.error("UPLOAD ERROR", err);
      setError("Terjadi kesalahan saat mengupload video");
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getFileFormatBadge = (file: File) => {
    const extension = file.name.toLowerCase().split(".").pop();
    const isOptimal = extension === "mp4" || extension === "webm";
    return (
      <Badge variant={isOptimal ? "default" : "secondary"}>
        {extension?.toUpperCase() || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Link href={`/teacher/materials/${resolvedParams.id}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Tambah Video Baru
              </h1>
              <p className="text-muted-foreground">
                Upload video pembelajaran bahasa isyarat ke materi ini.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Judul Video</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Contoh: Huruf A dalam Bahasa Isyarat"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Deskripsi singkat tentang video ini"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Urutan Video (Opsional)</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    min="0"
                    placeholder="0 (otomatis)"
                    value={formData.order}
                    onChange={(e) => handleInputChange("order", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>File Video</Label>
                  <Input
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/webm,video/ogg,.mp4,.mov,.avi,.wmv,.webm,.ogv"
                    onChange={handleVideoChange}
                    required
                  />

                  {/* File Info */}
                  {originalFile && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                        <Video className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">
                              {originalFile.name}
                            </p>
                            {getFileFormatBadge(originalFile)}
                            {isVideoValid && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(originalFile.size)}
                            {videoMetadata && (
                              <>
                                {" "}
                                • {videoMetadata.width}x{videoMetadata.height} •{" "}
                                {formatDuration(videoMetadata.duration)}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Compression Progress */}
                      {isCompressing && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              Mengoptimalkan video dengan kualitas tinggi...
                            </span>
                            <span>{Math.round(compressionProgress)}%</span>
                          </div>
                          <Progress
                            value={compressionProgress}
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* Processed File Info */}
                      {processedFile && processedFile !== originalFile && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md border border-green-200">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">
                              Video telah dioptimalkan (Kualitas Tinggi - 8
                              Mbps)
                            </p>
                            <p className="text-xs text-green-600">
                              Ukuran: {formatFileSize(originalFile.size)} →{" "}
                              {formatFileSize(processedFile.size)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Video Preview */}
                      {videoPreview && isVideoValid && (
                        <div className="space-y-2">
                          <Label>Preview Video</Label>
                          <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <video
                              ref={videoRef}
                              src={videoPreview}
                              controls
                              className="w-full h-full object-contain"
                              preload="metadata"
                              playsInline
                              muted
                            >
                              Browser Anda tidak mendukung pemutar video.
                            </video>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!originalFile && (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          Drag & drop file atau{" "}
                          <span className="cursor-pointer text-primary underline">
                            pilih file
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          MP4, MOV, AVI, WMV, WebM, atau OGV (Maks. 500MB)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 Video akan dioptimalkan otomatis dengan kualitas
                          tinggi
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {loading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mengupload video...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href={`/teacher/materials/${resolvedParams.id}`}>
                <Button variant="outline" disabled={loading || isCompressing}>
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || isCompressing || !isVideoValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengupload...
                  </>
                ) : isCompressing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengoptimalkan...
                  </>
                ) : (
                  "Upload Video"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Hidden canvas for video processing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
