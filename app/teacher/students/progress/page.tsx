"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Users,
  BookOpen,
  FileText,
  Trophy,
  Search,
  Eye,
  ArrowUpDown,
  RefreshCw,
  GraduationCap,
  Clock,
  TrendingUp,
  Star,
  User,
  Mail,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/use-api";

interface StudentProgress {
  student: {
    id: number;
    name: string;
    email: string;
  };
  materials: {
    total: number;
    completed: number;
    percentage: number;
  };
  exercises: {
    total: number;
    completed: number;
    percentage: number;
  };
  quizzes: {
    total: number;
    completed: number;
    percentage: number;
    average_score: number;
  };
  last_activity: string | null;
}

export default function StudentsProgressPage() {
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "materials" | "exercises" | "quizzes" | "overall"
  >("overall");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const {buildUrl} = useApi()

  useEffect(() => {
    // Check if user is authenticated and is a teacher
    if (user && userRole === "teacher") {
      fetchStudentsProgress();
    } else if (user && userRole !== "teacher") {
      toast({
        title: "Access Denied",
        description: "You must be a teacher to access this page",
        variant: "destructive",
      });
    }
  }, [user, userRole]);

  const fetchStudentsProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to view this page",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetching students progress...");
      console.log("User role:", userRole);
      console.log("Token exists:", !!token);


      const response = await fetch(buildUrl("/api/teacher/students/progress"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Students progress data:", data);
        setStudentsProgress(data);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("API Error:", errorData);

        if (response.status === 403) {
          toast({
            title: "Access Forbidden",
            description:
              "You don't have permission to access this resource. Please check your role.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed to fetch students progress",
            description: errorData.message || "Please try again later",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching students progress:", error);
      toast({
        title: "Error",
        description: "Failed to load student progress data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (
    column: "name" | "materials" | "exercises" | "quizzes" | "overall"
  ) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const getOverallProgress = (student: StudentProgress) => {
    return Math.round(
      (student.materials.percentage +
        student.exercises.percentage +
        student.quizzes.percentage) /
        3
    );
  };

  const filteredStudents = studentsProgress
    .filter(
      (student) =>
        student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.student.name.localeCompare(b.student.name);
          break;
        case "materials":
          comparison = a.materials.percentage - b.materials.percentage;
          break;
        case "exercises":
          comparison = a.exercises.percentage - b.exercises.percentage;
          break;
        case "quizzes":
          comparison = a.quizzes.average_score - b.quizzes.average_score;
          break;
        case "overall":
          comparison = getOverallProgress(a) - getOverallProgress(b);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
                </div>
                <p className="text-blue-600 font-medium">
                  Memuat data progress siswa...
                </p>
              </div>
            </div>
          </div>
        </div>
    );
  }
  // Show access denied if not teacher
  if (user && userRole !== "teacher") {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You must be a teacher to access this page.
          </p>
          <p className="text-sm text-gray-500">Current role: {userRole}</p>
        </div>
      </div>
    );
  }

  // Calculate overall statistics
  const totalStudents = studentsProgress.length;
  const activeStudents = studentsProgress.filter((s) => s.last_activity).length;
  const avgMaterialProgress =
    totalStudents > 0
      ? Math.round(
          studentsProgress.reduce((acc, s) => acc + s.materials.percentage, 0) /
            totalStudents
        )
      : 0;
  const avgExerciseProgress =
    totalStudents > 0
      ? Math.round(
          studentsProgress.reduce((acc, s) => acc + s.exercises.percentage, 0) /
            totalStudents
        )
      : 0;
  const avgQuizScore =
    totalStudents > 0
      ? Math.round(
          studentsProgress.reduce(
            (acc, s) => acc + s.quizzes.average_score,
            0
          ) / totalStudents
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {" "}
                  Progress Siswa
                </h1>
                <p className="text-gray-600 mt-1">
                  Pemantauan perjalanan belajar siswa Anda
                </p>
                {user && (
                  <div className="flex items-center gap-2 mt-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {user.name} • {userRole}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={fetchStudentsProgress}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Total Siswa
              </CardTitle>
              <Users className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStudents}</div>
              <p className="text-xs text-blue-200 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {activeStudents} active recently
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Rata-rata progress Materi
              </CardTitle>
              <BookOpen className="h-5 w-5 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgMaterialProgress}%</div>
              <Progress
                value={avgMaterialProgress}
                className="mt-2 bg-green-400"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Rata-rata Progress Latihan
              </CardTitle>
              <FileText className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgExerciseProgress}%</div>
              <Progress
                value={avgExerciseProgress}
                className="mt-2 bg-purple-400"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">
                Rata-rata nilai Quiz
              </CardTitle>
              <Trophy className="h-5 w-5 text-amber-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgQuizScore}%</div>
              <Progress value={avgQuizScore} className="mt-2 bg-amber-400" />
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-xl">List Siswa</CardTitle>
                <CardDescription>
                  Melihat dan mengelola kemajuan siswa secara individu
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="pl-10 border-gray-200 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sortBy === "name" ? "default" : "outline"}
                  onClick={() => handleSort("name")}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <User className="h-3 w-3" />
                  Nama
                  {sortBy === "name" && <ArrowUpDown className="h-3 w-3" />}
                </Button>
                <Button
                  variant={sortBy === "overall" ? "default" : "outline"}
                  onClick={() => handleSort("overall")}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Star className="h-3 w-3" />
                  Keseluruhan
                  {sortBy === "overall" && <ArrowUpDown className="h-3 w-3" />}
                </Button>
                <Button
                  variant={sortBy === "materials" ? "default" : "outline"}
                  onClick={() => handleSort("materials")}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <BookOpen className="h-3 w-3" />
                  Materi
                  {sortBy === "materials" && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant={sortBy === "exercises" ? "default" : "outline"}
                  onClick={() => handleSort("exercises")}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  Latihan
                  {sortBy === "exercises" && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant={sortBy === "quizzes" ? "default" : "outline"}
                  onClick={() => handleSort("quizzes")}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Trophy className="h-3 w-3" />
                  Skor Quiz
                  {sortBy === "quizzes" && <ArrowUpDown className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600 font-medium">
                    Loading progress siswa...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedStudents.map((studentProgress) => (
                  <Card
                    key={studentProgress.student.id}
                    className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-full">
                                <GraduationCap className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {studentProgress.student.name}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  {studentProgress.student.email}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={getProgressVariant(
                                getOverallProgress(studentProgress)
                              )}
                              className={`${getProgressBgColor(
                                getOverallProgress(studentProgress)
                              )} px-3 py-1 font-semibold`}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {getOverallProgress(studentProgress)}% Overall
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-green-800 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Materi
                                </span>
                                <span
                                  className={`text-sm font-bold ${getProgressColor(
                                    studentProgress.materials.percentage
                                  )}`}
                                >
                                  {studentProgress.materials.completed}/
                                  {studentProgress.materials.total}
                                </span>
                              </div>
                              <Progress
                                value={studentProgress.materials.percentage}
                                className="h-3 bg-green-200"
                              />
                              <p className="text-xs text-green-700 mt-1 font-medium">
                                {studentProgress.materials.percentage}% Complete
                              </p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Latihan
                                </span>
                                <span
                                  className={`text-sm font-bold ${getProgressColor(
                                    studentProgress.exercises.percentage
                                  )}`}
                                >
                                  {studentProgress.exercises.completed}/
                                  {studentProgress.exercises.total}
                                </span>
                              </div>
                              <Progress
                                value={studentProgress.exercises.percentage}
                                className="h-3 bg-purple-200"
                              />
                              <p className="text-xs text-purple-700 mt-1 font-medium">
                                {studentProgress.exercises.percentage}% Complete
                              </p>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                                  <Trophy className="h-4 w-4" />
                                  Rata-rata Quiz
                                </span>
                                <span
                                  className={`text-sm font-bold ${getProgressColor(
                                    studentProgress.quizzes.average_score
                                  )}`}
                                >
                                  {studentProgress.quizzes.average_score}%
                                </span>
                              </div>
                              <Progress
                                value={studentProgress.quizzes.average_score}
                                className="h-3 bg-amber-200"
                              />
                              <p className="text-xs text-amber-700 mt-1 font-medium">
                                {studentProgress.quizzes.completed}/
                                {studentProgress.quizzes.total} Completed
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 lg:items-end">
                          {studentProgress.last_activity && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Terakhir aktif:</span>
                              <span>
                                {new Date(
                                  studentProgress.last_activity
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <Link
                            href={`/teacher/students/${studentProgress.student.id}/progress`}
                          >
                            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                              <Eye className="h-4 w-4" />
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination Controls */}
                {filteredStudents.length > 0 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          // Show 5 pages max with current page in the middle when possible
                          let pageNum = i + 1;
                          if (totalPages > 5) {
                            if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="mx-1">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!loading && filteredStudents.length === 0 && (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No students found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm
                    ? "Try adjusting your search criteria to find students."
                    : "No students have started their learning journey yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
