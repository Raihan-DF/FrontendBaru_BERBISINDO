"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  Calendar,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
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

const ITEMS_PER_PAGE = 4;

export default function StudentMaterials() {
  const { toast } = useToast();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { get, post, put, delete: del, buildUrl } = useApi();

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search or tab changes
  }, [searchQuery]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Memuat data...
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4 space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Materi Pembelajaran
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2">
            Pelajari berbagai materi bahasa isyarat dengan video pembelajaran
            interaktif
          </p>
        </div>

        {/* Statistics */}
        <div className="rounded-xl bg-gradient-to-br from-[#06D7A0] to-[#108AB1] dark:from-[#073A4B] dark:to-[#0A3F52] p-4 sm:p-6 shadow-md text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-4xl sm:text-5xl font-bold text-white dark:text-[#06D7A0]">
              {materials.length}
            </div>
            <p className="text-sm sm:text-base text-white dark:text-gray-300 font-medium">
              Total Materi Tersedia
            </p>
            <div className="h-1 w-16 bg-[#06D7A0] dark:bg-[#F7AF02] rounded-full mt-2"></div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari materi..."
              className="pl-10 border-gray-200 dark:border-gray-700 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setCurrentPage(1);
          }}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-slate-800 shadow-sm h-10 sm:h-11">
            <TabsTrigger
              value="all"
              className="text-sm sm:text-base data-[state=active]:bg-[#06D7A0] data-[state=active]:text-white"
            >
              Semua Materi
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="text-sm sm:text-base data-[state=active]:bg-[#06D7A0] data-[state=active]:text-white"
            >
              Terbaru
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <MaterialGrid
              materials={getFilteredMaterials()}
              buildUrl={buildUrl}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="recent">
            <MaterialGrid
              materials={getFilteredMaterials()}
              buildUrl={buildUrl}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MaterialGrid({
  materials,
  buildUrl,
  currentPage,
  setCurrentPage,
}: {
  materials: Material[];
  buildUrl: (endpoint: string) => string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) {
  const totalPages = Math.ceil(materials.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMaterials = materials.slice(startIndex, endIndex);

  if (materials.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Tidak ada materi ditemukan
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Coba gunakan kata kunci yang berbeda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentMaterials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            buildUrl={buildUrl}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Halaman {currentPage} dari {totalPages} ({materials.length} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialCard({
  material,
  buildUrl,
}: {
  material: Material;
  buildUrl: (endpoint: string) => string;
}) {
  const getDifficultyLabel = (level: number) => {
    const labels = ["", "Pemula", "Dasar", "Menengah", "Lanjut", "Ahli"];
    return labels[level] || "Tidak Diketahui";
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
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border-l-4 border-l-[#06D7A0]">
      <div className="flex gap-3 sm:gap-4">
        {/* Thumbnail */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          {material.thumbnail ? (
            <img
              src={buildUrl(
                `/storage/${material.thumbnail || "/placeholder.svg"}`
              )}
              alt={material.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#06D7A0]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 pr-2">
              {material.title}
            </h3>
            <Badge
              className={`${getDifficultyColor(
                material.difficulty_level
              )} text-xs flex-shrink-0`}
            >
              {getDifficultyLabel(material.difficulty_level)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {material.creator.name}
            </span>
          </div>

          <Link href={`/student/materials/${material.id}`}>
            <Button className="w-full bg-[#06D7A0] hover:bg-[#0c7a9a] text-white text-sm sm:text-base h-9 sm:h-10 mt-2 font-semibold">
              <Zap className="mr-2 h-4 w-4" />
              Lihat Materi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
