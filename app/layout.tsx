import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";  // Import AuthProvider
import "@/app/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <title>BISINDO - Platform Belajar Bahasa Isyarat Indonesia</title>
        <meta name="description" content="Platform pembelajaran bahasa isyarat Indonesia untuk guru dan siswa" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <AuthProvider> {/* Menambahkan AuthProvider di sini */}
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
