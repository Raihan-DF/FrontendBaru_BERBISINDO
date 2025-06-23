"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function MyAlert() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Terjadi Error</AlertTitle>
      <AlertDescription>
        Mohon periksa koneksi Anda atau coba beberapa saat lagi.
      </AlertDescription>
    </Alert>
  );
}
