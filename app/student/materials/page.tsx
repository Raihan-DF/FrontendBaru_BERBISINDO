"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  Calendar,
  Users,
  Eye,
  PlayCircle,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";

interface Material {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty_level: number;
  is_published: boolean;
  created_at: string;
  videos_count?: number;
  creator: {
    id: number;
    name: string;
  };
}

export default function StudentMaterials() {
  const { toast } = useToast();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { get, post, put, delete: del, buildUrl } = useApi();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
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

      const response = await fetch(buildUrl("/api/materials"), {
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
        router.push("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const materialsData = data.data || [];

        // Fetch video count for each material
        const materialsWithVideos = await Promise.all(
          materialsData.map(async (material: Material) => {
            try {
              const videoResponse = await fetch(
                buildUrl(`/api/materials/${material.id}/videos`),
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              if (videoResponse.ok) {
                const videoData = await videoResponse.json();
                return {
                  ...material,
                  videos_count: videoData.data ? videoData.data.length : 0,
                };
              }
              return { ...material, videos_count: 0 };
            } catch (error) {
              console.error(
                `Error fetching videos for material ${material.id}:`,
                error
              );
              return { ...material, videos_count: 0 };
            }
          })
        );

        setMaterials(materialsWithVideos);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat daftar materi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat materi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(
    (material) =>
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredMaterials = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (activeTab) {
      case "recent":
        return filteredMaterials.filter(
          (material) => new Date(material.created_at) > oneWeekAgo
        );
      case "popular":
        return filteredMaterials.sort(
          (a, b) => (b.videos_count || 0) - (a.videos_count || 0)
        );
      default:
        return filteredMaterials;
    }
  };

  const [activeTab, setActiveTab] = useState("all");

  const getDifficultyLabel = (level: number) => {
    const labels = ["", "Pemula", "Dasar", "Menengah", "Lanjut", "Ahli"];
    return labels[level] || "Tidak Diketahui";
  };

  const getDifficultyColor = (level: number) => {
    const colors = [
      "",
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200",
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200",
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200",
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200",
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200",
    ];
    return (
      colors[level] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalVideos = () => {
    return materials.reduce(
      (sum, material) => sum + (material.videos_count || 0),
      0
    );
  };

  const getPublishedMaterials = () => {
    return materials.filter((material) => material.is_published);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Materi Pembelajaran
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pelajari berbagai materi bahasa isyarat yang tersedia dengan video
            pembelajaran interaktif
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Total Materi
                  </p>
                  <p className="text-3xl font-bold">{materials.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Video
                  </p>
                  <p className="text-3xl font-bold">{getTotalVideos()}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <PlayCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Dipublikasi
                  </p>
                  <p className="text-3xl font-bold">
                    {getPublishedMaterials().length}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Eye className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari materi berdasarkan judul atau deskripsi..."
                className="pl-10 border-0 bg-gray-50 focus:bg-white transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Semua Materi
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Terbaru
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <MaterialGrid
                materials={getFilteredMaterials()}
                buildUrl={buildUrl}
              />
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <MaterialGrid
                materials={getFilteredMaterials()}
                buildUrl={buildUrl}
              />
            </TabsContent>

            <TabsContent value="popular" className="space-y-6">
              <MaterialGrid
                materials={getFilteredMaterials()}
                buildUrl={buildUrl}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function MaterialGrid({ materials, buildUrl }: { materials: Material[];buildUrl: (endpoint: string) => string }) {
  if (materials.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-medium text-muted-foreground mb-3">
            Tidak ada materi ditemukan
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Coba gunakan kata kunci yang berbeda atau periksa kembali filter
            yang Anda gunakan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {materials.map((material) => (
        <MaterialCard key={material.id} material={material} buildUrl={buildUrl} />
      ))}
    </div>
  );
}

function MaterialCard({ material, buildUrl }: { material: Material; buildUrl: (endpoint: string) => string }) {
  const getDifficultyLabel = (level: number) => {
    const labels = ["", "Pemula", "Dasar", "Menengah", "Lanjut", "Ahli"];
    return labels[level] || "Tidak Diketahui";
  };

  const getDifficultyColor = (level: number) => {
    const colors = [
      "",
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200",
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200",
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200",
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200",
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200",
    ];
    return (
      colors[level] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-green-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-1">
              {material.title}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {material.description}
            </CardDescription>
          </div>
          <Badge
            className={`${getDifficultyColor(
              material.difficulty_level
            )} border text-xs ml-2`}
          >
            {getDifficultyLabel(material.difficulty_level)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="aspect-video rounded-md bg-muted overflow-hidden">
          {material.thumbnail ? (
            <img
              src={buildUrl(`/storage/${material.thumbnail}`)}
              alt={material.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20">
              <BookOpen className="h-12 w-12 text-green-400" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1.5 rounded-full">
              <PlayCircle className="h-3 w-3 text-green-600" />
            </div>
            <span className="font-medium">
              {material.videos_count || 0} Video
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <Users className="h-3 w-3 text-blue-600" />
            </div>
            <span className="font-medium">{material.creator.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded-full">
              <Calendar className="h-3 w-3 text-purple-600" />
            </div>
            <span className="font-medium text-xs">
              {formatDate(material.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {material.is_published ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 border text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Dipublikasi
              </Badge>
            ) : (
              <Badge variant="outline" className="border-gray-200 text-xs">
                Draft
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Dibuat: {formatDate(material.created_at)}</span>
          <span>{material.videos_count || 0} video tersedia</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/student/materials/${material.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0 shadow-lg">
            <Zap className="mr-2 h-4 w-4" />
            Lihat Materi
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
