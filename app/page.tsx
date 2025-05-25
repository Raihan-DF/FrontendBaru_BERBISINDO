import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BERBISINDO</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#fitur"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Fitur
            </Link>
            <Link
              href="#tentang"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Tentang Kami
            </Link>
            <Link
              href="#kontak"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Kontak
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Belajar Bahasa Isyarat Indonesia dengan Mudah
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Platform pembelajaran interaktif untuk memahami dan
                    menguasai bahasa isyarat Indonesia dengan metode yang
                    terstruktur.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1 bg-[#38b6ff] hover:bg-[#2ca9f3] text-white">
                      Mulai Belajar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#fitur">
                    <Button size="lg" variant="outline">
                      Pelajari Lebih Lanjut
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 rounded-xl overflow-hidden">
                <img
                  alt="Platform Belajar Bahasa Isyarat"
                  className="aspect-video object-cover w-full rounded-xl"
                  src="/images/posterHome.svg"
                />
              </div>
            </div>
          </div>
        </section>
        <section id="fitur" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Fitur Utama
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Platform kami menyediakan berbagai fitur untuk mendukung
                  pembelajaran bahasa isyarat
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm bg-[#fffedc]">
                <BookOpen className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Materi Terstruktur</h3>
                <p className="text-center text-muted-foreground">
                  Materi pembelajaran yang disusun secara terstruktur dan mudah
                  dipahami
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm bg-[#daffec]">
                <CheckCircle className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Latihan Interaktif</h3>
                <p className="text-center text-muted-foreground">
                  Latihan interaktif untuk mempraktikkan pemahaman bahasa
                  isyarat
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm bg-[#d3dbff]">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Pemantauan Kemajuan</h3>
                <p className="text-center text-muted-foreground">
                  Pantau kemajuan belajar siswa dengan detail dan terukur
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-muted/50">
        <div className="container mx-auto flex flex-col gap-4 py-10 md:flex-row md:gap-8">
          <div className="flex flex-col gap-2 md:gap-4 md:flex-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">BERBISINDO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Platform pembelajaran bahasa isyarat Indonesia untuk semua
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 md:flex-1 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:underline"
                  >
                    Fitur
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:underline"
                  >
                    Tentang Kami
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Bantuan</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:underline"
                  >
                    Panduan
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:underline"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Kontak</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:underline"
                  >
                    Email
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:underline"
                  >
                    Media Sosial
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © 2025 BERBISINDO. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
