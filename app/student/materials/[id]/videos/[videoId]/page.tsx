"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CheckCircle, Play, Pause } from "lucide-react"
import { useApi } from "@/hooks/use-api"

interface MaterialVideo {
  id: number
  title: string
  description: string
  video_path: string
  video_url: string
  order: number
  is_completed?: boolean
}

interface Material {
  id: number
  title: string
  description: string
}

export default function StudentVideoPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [video, setVideo] = useState<MaterialVideo | null>(null)
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [completingVideo, setCompletingVideo] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const { get, post, put, delete: del, buildUrl } = useApi();

  useEffect(() => {
    fetchVideoData()
  }, [params.id, params.videoId])

  const fetchVideoData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch material info
      const materialResponse = await fetch(buildUrl(`/api/materials/${params.id}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!materialResponse.ok) {
        throw new Error("Failed to fetch material")
      }

      const materialData = await materialResponse.json()
      setMaterial(materialData)

      // Fetch specific video
      const videoResponse = await fetch(buildUrl(`/api/materials/${params.id}/videos/${params.videoId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!videoResponse.ok) {
        throw new Error("Failed to fetch video")
      }

      const videoData = await videoResponse.json()
      setVideo(videoData)
    } catch (error) {
      console.error("Error fetching video data:", error)
      toast({
        title: "Error",
        description: "Failed to load video",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markVideoAsCompleted = async () => {
    if (!video) return

    try {
      setCompletingVideo(true)
      const token = localStorage.getItem("token")
      const response = await fetch(buildUrl
        (`/api/materials/${params.id}/videos/${params.videoId}/complete`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to mark video as completed")
      }

      setVideo((prev) => (prev ? { ...prev, is_completed: true } : prev))

      toast({
        title: "Success",
        description: "Video marked as completed!",
      })
    } catch (error) {
      console.error("Error marking video as completed:", error)
      toast({
        title: "Error",
        description: "Failed to mark video as completed",
        variant: "destructive",
      })
    } finally {
      setCompletingVideo(false)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const getVideoStreamUrl = () => {
    const token = localStorage.getItem("token")
    return buildUrl(`/api/materials/${params.id}/videos/${params.videoId}/stream?token=${token}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video w-full mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div>
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!video || !material) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h1>
          <p className="text-gray-600 mb-6">
            The video you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push(`/student/materials/${params.id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Material
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Button variant="ghost" onClick={() => router.push(`/student/materials/${params.id}`)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {material.title}
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false)
                    if (!video.is_completed) {
                      markVideoAsCompleted()
                    }
                  }}
                >
                  <source src={getVideoStreamUrl()} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </CardContent>
          </Card>

          {/* Video Info */}
          <div className="mt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {video.title}
                  {video.is_completed && <CheckCircle className="w-6 h-6 text-green-600" />}
                </h1>
                {video.description && <p className="text-gray-600">{video.description}</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button onClick={togglePlayPause} variant="outline">
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>

              {!video.is_completed && (
                <Button onClick={markVideoAsCompleted} disabled={completingVideo}>
                  {completingVideo ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>About this Material</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-2">{material.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{material.description}</p>

              {video.is_completed ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Video Completed</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">Great job! You've completed this video.</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Play className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">In Progress</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Watch the video to completion or mark it as completed when you're done.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
