"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // atau sesuaikan path kamu

interface RoleGuardProps {
  allowedRoles: string[]; // contoh: ["teacher"] atau ["teacher", "admin"]
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { userRole, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!allowedRoles.includes(userRole || "")) {
        router.push("/forbidden");
      }
    }
  }, [userRole, loading, isAuthenticated, router, allowedRoles]);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}
