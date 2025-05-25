// "use client"

// import { useState, useRef, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Slider } from "@/components/ui/slider"
// import { cn } from "@/lib/utils"
// import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react"

// interface VideoPlayerProps {
//   src: string
//   poster?: string
//   title: string
//   onComplete?: () => void
// }

// export function VideoPlayer({ src, poster, title, onComplete }: VideoPlayerProps) {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [progress, setProgress] = useState(0)
//   const [duration, setDuration] = useState(0)
//   const [currentTime, setCurrentTime] = useState(0)
//   const [volume, setVolume] = useState(1)
//   const [isMuted, setIsMuted] = useState(false)
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const [showControls, setShowControls] = useState(true)
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     const handleLoadedMetadata = () => {
//       setDuration(video.duration)
//     }

//     const handleTimeUpdate = () => {
//       setCurrentTime(video.currentTime)
//       setProgress((video.currentTime / video.duration) * 100)

//       // Check if video is complete
//       if (video.currentTime >= video.duration) {
//         setIsPlaying(false)
//         if (onComplete) onComplete()
//       }
//     }

//     video.addEventListener("loadedmetadata", handleLoadedMetadata)
//     video.addEventListener("timeupdate", handleTimeUpdate)

//     return () => {
//       video.removeEventListener("loadedmetadata", handleLoadedMetadata)
//       video.removeEventListener("timeupdate", handleTimeUpdate)
//     }
//   }, [onComplete])

//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     if (isPlaying) {
//       video.play().catch(() => setIsPlaying(false))
//     } else {
//       video.pause()
//     }
//   }, [isPlaying])

//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     video.volume = volume
//     video.muted = isMuted
//   }, [volume, isMuted])

//   useEffect(() => {
//     const handleMouseMove = () => {
//       setShowControls(true)

//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current)
//       }

//       controlsTimeoutRef.current = setTimeout(() => {
//         if (isPlaying) setShowControls(false)
//       }, 3000)
//     }

//     const handleMouseLeave = () => {
//       if (isPlaying) setShowControls(false)
//     }

//     const playerElement = document.getElementById("video-player-container")
//     if (playerElement) {
//       playerElement.addEventListener("mousemove", handleMouseMove)
//       playerElement.addEventListener("mouseleave", handleMouseLeave)
//     }

//     return () => {
//       if (playerElement) {
//         playerElement.removeEventListener("mousemove", handleMouseMove)
//         playerElement.removeEventListener("mouseleave", handleMouseLeave)
//       }

//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current)
//       }
//     }
//   }, [isPlaying])

//   const togglePlay = () => {
//     setIsPlaying(!isPlaying)
//   }

//   const toggleMute = () => {
//     setIsMuted(!isMuted)
//   }

//   const handleVolumeChange = (value: number[]) => {
//     setVolume(value[0])
//     if (value[0] === 0) {
//       setIsMuted(true)
//     } else if (isMuted) {
//       setIsMuted(false)
//     }
//   }

//   const handleProgressChange = (value: number[]) => {
//     const video = videoRef.current
//     if (!video) return

//     const newTime = (value[0] / 100) * duration
//     video.currentTime = newTime
//     setCurrentTime(newTime)
//     setProgress(value[0])
//   }

//   const toggleFullscreen = () => {
//     const playerElement = document.getElementById("video-player-container")
//     if (!playerElement) return

//     if (!isFullscreen) {
//       if (playerElement.requestFullscreen) {
//         playerElement.requestFullscreen()
//       }
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen()
//       }
//     }

//     setIsFullscreen(!isFullscreen)
//   }

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60)
//     const remainingSeconds = Math.floor(seconds % 60)
//     return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
//   }

//   return (
//     <div id="video-player-container" className="relative aspect-video overflow-hidden rounded-md bg-black">
//       <video ref={videoRef} src={src} poster={poster} className="h-full w-full" onClick={togglePlay} playsInline />

//       <div
//         className={cn(
//           "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity",
//           showControls ? "opacity-100" : "opacity-0",
//         )}
//       >
//         <div className="space-y-2">
//           <Slider value={[progress]} max={100} step={0.1} onValueChange={handleProgressChange} className="h-1" />

//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={togglePlay}>
//                 {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
//               </Button>

//               <div className="flex items-center gap-2">
//                 <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={toggleMute}>
//                   {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
//                 </Button>

//                 <Slider
//                   value={[isMuted ? 0 : volume]}
//                   max={1}
//                   step={0.01}
//                   onValueChange={handleVolumeChange}
//                   className="w-20 h-1"
//                 />
//               </div>

//               <span className="text-xs text-white">
//                 {formatTime(currentTime)} / {formatTime(duration)}
//               </span>
//             </div>

//             <div className="flex items-center gap-2">
//               <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={toggleFullscreen}>
//                 {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {!isPlaying && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <Button
//             size="icon"
//             className="h-16 w-16 rounded-full bg-primary/80 text-primary-foreground hover:bg-primary/90"
//             onClick={togglePlay}
//           >
//             <Play className="h-8 w-8" />
//           </Button>
//         </div>
//       )}

//       <div className="absolute left-4 top-4">
//         <h3
//           className={cn(
//             "text-lg font-medium text-white drop-shadow-md",
//             showControls ? "opacity-100" : "opacity-0",
//             "transition-opacity",
//           )}
//         >
//           {title}
//         </h3>
//       </div>
//     </div>
//   )
// }

"use client";

import type React from "react";

import { useRef, useEffect, useState } from "react";
import { getToken } from "@/app/config/api";

interface VideoPlayerProps {
  materialId: number;
  videoId: number;
  streamUrl: string;
  title: string;
  onComplete?: () => void;
}

export default function VideoPlayer({
  materialId,
  videoId,
  streamUrl,
  title,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Tambahkan token ke URL streaming jika diperlukan
  const token = getToken();
  // Pastikan URL streaming sudah lengkap
  const fullStreamUrl = streamUrl.includes("?")
    ? `${streamUrl}&token=${encodeURIComponent(token || "")}`
    : `${streamUrl}?token=${encodeURIComponent(token || "")}`;

  useEffect(() => {
    // Reset state when video changes
    setError(null);
    setLoading(true);
    setProgress(0);
    setIsCompleted(false);
  }, [materialId, videoId, streamUrl]);

  const handleLoadedData = () => {
    setLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e);
    setError("Gagal memuat video. Silakan coba lagi nanti.");
    setLoading(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = Math.floor(
        (videoRef.current.currentTime / videoRef.current.duration) * 100
      );
      setProgress(currentProgress);

      // Mark as completed when 90% watched
      if (currentProgress >= 90 && !isCompleted) {
        setIsCompleted(true);
        onComplete?.();
      }
    }
  };

  const handleEnded = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }
  };

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full rounded-lg"
            controls
            preload="metadata"
            onLoadedData={handleLoadedData}
            onError={handleError}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            poster="/placeholder.svg?height=480&width=640"
          >
            <source src={fullStreamUrl} type="video/mp4" />
            Browser Anda tidak mendukung tag video.
          </video>

          {/* Progress bar di bawah video */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
}
