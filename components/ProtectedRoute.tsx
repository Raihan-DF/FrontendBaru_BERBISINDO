"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
  allowedRoles, // ✅ optional: list role yang diizinkan
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Cek hanya kalau loading selesai
    if (!loading) {
      // Tidak login → Forbidden page
      if (!user) {
        router.replace("/forbidden");
        return;
      }

      // Kalau ada allowedRoles, cek apakah role user diizinkan
      if (
        allowedRoles &&
        !allowedRoles.includes(user.role) // contoh: user.role = 'admin'
      ) {
        router.replace("/forbidden");
        return;
      }

      // Kalau lolos semua cek, selesai checking
      setChecking(false);
    }
  }, [user, loading, router, allowedRoles]);

  // Sambil nunggu auth atau validasi, tampilkan loading
  if (loading || checking) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return <>{children}</>;
}
