"use client";

import type React from "react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useApi } from "@/hooks/use-api";

interface Material {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty_level: number;
  is_published: boolean;
  created_at: string;
  creator: {
    id: number;
    name: string;
  };
}

export default function EditMaterial({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const resolvedParams = use(params);
  const { buildUrl } = useApi();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [material, setMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty_level: "",
    is_published: false,
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterial();
  }, [resolvedParams.id]);

  const fetchMaterial = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        buildUrl(`/api/materials/${resolvedParams.id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMaterial(data);
        setFormData({
          title: data.title,
          description: data.description,
          difficulty_level: data.difficulty_level.toString(),
          is_published: data.is_published,
        });
        if (data.thumbnail) {
          setThumbnailPreview(buildUrl(`/storage/${data.thumbnail}`));
        }
      } else {
        setError("Gagal memuat materi");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memuat materi");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("difficulty_level", formData.difficulty_level);
      submitData.append("is_published", formData.is_published ? "1" : "0");
      submitData.append("_method", "PUT");
      if (thumbnail) submitData.append("thumbnail", thumbnail);

      const response = await fetch(
        buildUrl(`/api/materials/${resolvedParams.id}`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: submitData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Materi berhasil diperbarui",
          description: "Perubahan materi telah disimpan.",
        });
        router.push(`/teacher/materials/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Gagal memperbarui materi");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memperbarui materi");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="space-y-4">
        <Link href="/teacher/materials">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Materi tidak ditemukan</AlertDescription>
        </Alert>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold tracking-tight">Edit Materi</h1>
              <p className="text-muted-foreground">
                Perbarui informasi materi pembelajaran.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Materi</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Judul Materi</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Contoh: Bahasa Isyarat Huruf"
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
                    placeholder="Deskripsi singkat tentang materi ini"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) =>
                      handleInputChange("difficulty_level", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat kesulitan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Pemula</SelectItem>
                      <SelectItem value="2">Dasar</SelectItem>
                      <SelectItem value="3">Menengah</SelectItem>
                      <SelectItem value="4">Lanjut</SelectItem>
                      <SelectItem value="5">Ahli</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail Materi</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="mt-2 aspect-video w-full max-w-md rounded-md border object-cover"
                    />
                  )}
                  {!thumbnailPreview && (
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
                          PNG, JPG atau GIF (Maks. 2MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_published", checked)
                    }
                  />
                  <Label htmlFor="published">Publikasikan materi</Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href={`/teacher/materials/${resolvedParams.id}`}>
                <Button variant="outline">Batal</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
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
      </div>
    </div>
  );
}
