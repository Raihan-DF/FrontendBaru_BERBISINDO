"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getApiUrl, getHeaders, isAuthenticated } from "@/app/config/api"
import VideoPlayer from "@/components/video-player"
import AuthDebugger from "@/components/AuthDebugger"

interface Material {
  id: number
  title: string
}

interface MaterialVideo {
  id: number
  material_id: number
  title: string
  description: string
  video_path: string
  video_filename: string
  video_type: string
  order: number
  video_url: string
  stream_url: string
  is_completed?: boolean
}

export default function MaterialVideos({ params }: { params: { materialId: string } }) {
  const router = useRouter()
  const [videos, setVideos] = useState<MaterialVideo[]>([])
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDebugger, setShowDebugger] = useState(false)

  useEffect(() => {
    // Cek autentikasi terlebih dahulu
    if (!isAuthenticated()) {
      console.log("Not authenticated, redirecting to login")
      router.push("/login")
      return
    }

    const fetchVideos = async () => {
      try {
        setLoading(true)
        // Mengambil video berdasarkan material ID
        const url = `${getApiUrl()}/materials/${params.materialId}/videos`
        console.log("Fetching videos from:", url)

        const headers = getHeaders()
        console.log("Using headers:", JSON.stringify(headers, null, 2))

        const res = await fetch(url, {
          headers,
        })

        console.log("Response status:", res.status)

        if (!res.ok) {
          if (res.status === 401) {
            console.log("Unauthorized, token might be invalid")
            setShowDebugger(true)
            throw new Error(`Error ${res.status}: Unauthorized - Token might be invalid or expired`)
          } else {
            throw new Error(`Error ${res.status}: ${res.statusText}`)
          }
        }

        const data = await res.json()
        console.log("Videos data received:", data.length || 0, "videos")
        setVideos(data)

        // Mengambil detail material
        const materialUrl = `${getApiUrl()}/materials/${params.materialId}`
        const materialRes = await fetch(materialUrl, {
          headers: getHeaders(),
        })

        if (materialRes.ok) {
          const materialData = await materialRes.json()
          setMaterial(materialData)
        }
      } catch (error) {
        console.error("Gagal mengambil video:", error)
        setError(`Gagal memuat video: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [params.materialId, router])

  const markVideoAsCompleted = async (videoId: number) => {
    try {
      const url = `${getApiUrl()}/materials/${params.materialId}/videos/${videoId}/complete`
      const res = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
      })

      if (res.ok) {
        // Update local state to mark video as completed
        setVideos((prevVideos) =>
          prevVideos.map((video) => (video.id === videoId ? { ...video, is_completed: true } : video)),
        )
      }
    } catch (error) {
      console.error("Gagal menandai video sebagai selesai:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {showDebugger && <AuthDebugger />}

      <h1 className="text-2xl font-bold">{material ? material.title : "Materi Video"}</h1>

      {error ? (
        <div className="p-4 text-center border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-500 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              onClick={() => setShowDebugger(true)}
            >
              Debug Auth
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={() => {
                router.push("/login")
              }}
            >
              Login Ulang
            </button>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <p className="text-gray-500">Tidak ada video dalam materi ini.</p>
      ) : (
        <div className="space-y-8">
          {videos.map((video) => (
            <div key={video.id} className="space-y-2 border p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold">{video.title}</h2>
              {video.description && <p className="text-sm text-gray-600 mb-2">{video.description}</p>}

              {video.is_completed && (
                <div className="mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Selesai ditonton
                </div>
              )}

              <div className="aspect-video">
                <VideoPlayer
                  materialId={video.material_id}
                  videoId={video.id}
                  streamUrl={video.stream_url}
                  title={video.title}
                  onComplete={() => markVideoAsCompleted(video.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
