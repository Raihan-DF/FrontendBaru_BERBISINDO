// app/categories/[categoryId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
}

interface Creator {
  id: number;
  name: string;
}

interface Video {
  id: number;
  title: string;
  drive_url: string;
  category: Category;
  creator: Creator;
}

export default function VideoListByCategory() {
  const params = useParams();
  const categoryId = Number(params.categoryId);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (!categoryId) return;

    const fetchVideos = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/videos`);
        const data = await res.json();
        setVideos(data);
      } catch (error) {
        console.error("Gagal mengambil video:", error);
      }
    };

    fetchVideos();
  }, [categoryId]);

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Video Kategori {categoryId}</h1>
      {videos.map((video) => (
        <div key={video.id} className="space-y-2">
          <h2 className="text-lg font-semibold">{video.title}</h2>
          <p className="text-sm text-gray-600">Uploader: {video.creator?.name}</p>
          <div className="aspect-video">
            <iframe
              src={video.drive_url}
              className="w-full h-full rounded-lg border"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ))}
    </div>
  );
}
