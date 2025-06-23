"use client";

import type React from "react";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useApi } from "@/hooks/use-api";

export default function CreateVideo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const resolvedParams = use(params);
  const { buildUrl } = useApi();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 200MB)
      if (file.size > 200 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 200MB.");
        return;
      }

      // Check file type
      const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/wmv"];
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Format file tidak didukung. Gunakan MP4, MOV, AVI, atau WMV."
        );
        return;
      }

      setVideoFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      setError("Silakan pilih file video");
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
      submitData.append("video", videoFile);
      if (formData.order) {
        submitData.append("order", formData.order);
      }

      // Create XMLHttpRequest for upload progress
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      // Handle response
      xhr.addEventListener("load", () => {
        if (xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          toast({
            title: "Video berhasil ditambahkan",
            description: "Video telah berhasil diupload ke materi.",
          });
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
          setError(errorData.message || "Gagal mengupload video");
        }
        setLoading(false);
      });

      xhr.addEventListener("error", () => {
        setError("Terjadi kesalahan saat mengupload video");
        setLoading(false);
      });

      // Send request
      xhr.open("POST", buildUrl(`/api/materials/${resolvedParams.id}/videos`));
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(submitData);
    } catch (err) {
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
                  <Label htmlFor="description">Deskripsi (Opsional)</Label>
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
                    placeholder="Urutan video dalam materi (0 = otomatis)"
                    value={formData.order}
                    onChange={(e) => handleInputChange("order", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>File Video</Label>
                  <Input
                    type="file"
                    accept="video/mp4,video/mov,video/avi,video/wmv"
                    onChange={handleVideoChange}
                    required
                  />
                  {videoFile ? (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Video className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(videoFile.size)}
                        </p>
                      </div>
                    </div>
                  ) : (
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
                          MP4, MOV, AVI, atau WMV (Maks. 200MB)
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
                <Button variant="outline" disabled={loading}>
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !videoFile}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  "Upload Video"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
