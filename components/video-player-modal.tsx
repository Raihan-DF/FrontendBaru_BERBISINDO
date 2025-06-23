"use client"

import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Loader2, AlertCircle, TestTube } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface MaterialVideo {
  id: number
  title: string
  description: string
  video_path: string
  video_url: string
  stream_url: string
  order: number
  is_completed?: boolean
}

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  video: MaterialVideo | null
  onVideoComplete?: (videoId: number) => void
}

export function VideoPlayerModal({ isOpen, onClose, video, onVideoComplete }: VideoPlayerModalProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (isOpen && video) {
      setIsLoading(true)
      setError(null)
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)
      setVideoLoading(true)
      setVideoError(null)
      setCurrentSrc(getVideoUrl())
    }
  }, [isOpen, video])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
    }

    const handleLoadedData = () => {
      setIsLoading(false)
      setDuration(videoElement.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (video && !video.is_completed && onVideoComplete) {
        onVideoComplete(video.id)
        toast({
          title: "Video selesai!",
          description: "Video telah ditandai sebagai selesai.",
        })
      }
    }

    const handleError = () => {
      setIsLoading(false)
      setError("Video gagal dimuat")
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleVolumeChange = () => {
      setVolume(videoElement.volume)
      setIsMuted(videoElement.muted)
    }

    videoElement.addEventListener("loadstart", handleLoadStart)
    videoElement.addEventListener("loadeddata", handleLoadedData)
    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    videoElement.addEventListener("play", handlePlay)
    videoElement.addEventListener("pause", handlePause)
    videoElement.addEventListener("ended", handleEnded)
    videoElement.addEventListener("error", handleError)
    videoElement.addEventListener("canplay", handleCanPlay)
    videoElement.addEventListener("volumechange", handleVolumeChange)

    return () => {
      videoElement.removeEventListener("loadstart", handleLoadStart)
      videoElement.removeEventListener("loadeddata", handleLoadedData)
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("play", handlePlay)
      videoElement.removeEventListener("pause", handlePause)
      videoElement.removeEventListener("ended", handleEnded)
      videoElement.removeEventListener("error", handleError)
      videoElement.removeEventListener("canplay", handleCanPlay)
      videoElement.removeEventListener("volumechange", handleVolumeChange)
    }
  }, [video, onVideoComplete, toast, currentSrc])

  const togglePlay = async () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    try {
      if (isPlaying) {
        videoElement.pause()
      } else {
        await videoElement.play()
      }
    } catch (err) {
      console.error("Play error:", err)
      setError("Gagal memutar video")
    }
  }

  const toggleMute = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    videoElement.muted = !videoElement.muted
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const time = (parseFloat(e.target.value) / 100) * duration
    videoElement.currentTime = time
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const newVolume = parseFloat(e.target.value) / 100
    videoElement.volume = newVolume
    videoElement.muted = newVolume === 0
  }

  const toggleFullscreen = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoElement.requestFullscreen()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getVideoUrl = () => {
    if (!video) return ""
    
    // Try stream URL first, fallback to video_url
    const token = localStorage.getItem("token")
    return video.stream_url || `${video.video_url}?token=${token}`
  }

  if (!video) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {video.title}
            {video.is_completed && <CheckCircle className="h-5 w-5 text-green-600" />}
          </DialogTitle>
          {video.description && (
            <DialogDescription>{video.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                    <p>Memuat video...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="text-white text-center">
                    <p className="mb-2">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setError(null)
                        if (videoRef.current) {
                          videoRef.current.load()
                        }
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Coba Lagi
                    </Button>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full h-full"
                preload="metadata"
                crossOrigin="anonymous"
                onLoadStart={() => {
                  console.log("⏳ Video loading started")
                  setVideoLoading(true)
                }}
                onCanPlay={() => {
                  console.log("✅ Video can play")
                  setVideoLoading(false)
                  toast({
                    title: "Video Ready! ✅",
                    description: "Video berhasil dimuat dan siap diputar",
                  })
                }}
                onError={(e) => {
                  console.error("🚫 Video error:", e)
                  setVideoError("Video gagal dimuat")
                  toast({
                    title: "Video Error ❌",
                    description: "Video gagal dimuat. Coba refresh halaman atau test URLs.",
                    variant: "destructive",
                  })
                }}
                src={currentSrc}
              >
                Browser Anda tidak mendukung video player.
              </video>
            </div>

            {/* Custom Controls */}
            <div className="bg-gray-900 text-white p-4 space-y-3 rounded-b-lg">
              {/* Progress Bar */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-300">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={togglePlay}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>

                  <Button onClick={toggleMute} variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-700"
                    onClick={testUrls}
                    title="Test video URLs"
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>

                  <Button onClick={toggleFullscreen} variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  async function testUrls() {
    const directUrl = getVideoUrl()
    const streamUrl = video?.stream_url

    console.log("🧪 Testing Video URLs")
    console.log("📁 Direct URL:", directUrl)
    console.log("📡 Stream URL:", streamUrl)

    // Test direct URL
    if (directUrl) {
      try {
        const directResponse = await fetch(directUrl, {
          method: "HEAD",
          mode: "cors",
        })
        console.log("✅ Direct response:", directResponse.status, directResponse.statusText)
        console.log("📋 Direct headers:", Object.fromEntries(directResponse.headers.entries()))

        if (directResponse.ok) {
          toast({
            title: "Direct URL Working! ✅",
            description: `Status: ${directResponse.status} - Video dapat diakses langsung`,
          })
        } else {
          toast({
            title: "Direct URL Failed ❌",
            description: `Status: ${directResponse.status}`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("❌ Direct URL error:", error)
        toast({
          title: "Direct URL Error ❌",
          description: "Network atau CORS error",
          variant: "destructive",
        })
      }
    }

    // Test stream URL
    if (streamUrl) {
      try {
        const streamResponse = await fetch(streamUrl, {
          method: "HEAD",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        console.log("✅ Stream response:", streamResponse.status, streamResponse.statusText)
        console.log("📋 Stream headers:", Object.fromEntries(streamResponse.headers.entries()))

        if (streamResponse.ok) {
          toast({
            title: "Stream URL Working! ✅",
            description: `Status: ${streamResponse.status} - Video stream dapat diakses`,
          })
        } else {
          toast({
            title: "Stream URL Failed ❌",
            description: `Status: ${streamResponse.status}`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("❌ Stream URL error:", error)
        toast({
          title: "Stream URL Error ❌",
          description: "Network error",
          variant: "destructive",
        })
      }
    }
  }
}
