
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function StudentSettings() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      reminders: true,
      newContent: true,
      achievements: true,
    },
    appearance: {
      theme: "light",
      fontSize: "medium",
      reduceMotion: false,
      highContrast: false,
    },
    learning: {
      autoPlayVideos: true,
      showHints: true,
      showProgressBar: true,
      dailyGoal: "30",
    },
    privacy: {
      shareProgress: true,
      showOnlineStatus: true,
      allowDataCollection: true,
    },
  })

  const handleNotificationChange = (key: keyof typeof settings.notifications, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked,
      },
    }))
  }

  const handleAppearanceChange = (key: keyof typeof settings.appearance, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value,
      },
    }))
  }

  const handleLearningChange = (key: keyof typeof settings.learning, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      learning: {
        ...prev.learning,
        [key]: value,
      },
    }))
  }

  const handlePrivacyChange = (key: keyof typeof settings.privacy, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: checked,
      },
    }))
  }

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Pengaturan disimpan",
        description: "Perubahan pengaturan Anda telah berhasil disimpan.",
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pengaturan</h1>
        <p className="text-muted-foreground">Kustomisasi pengalaman belajar Anda.</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          <TabsTrigger value="learning">Pembelajaran</TabsTrigger>
          <TabsTrigger value="privacy">Privasi</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>Kelola bagaimana Anda menerima notifikasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Notifikasi Email</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Terima notifikasi melalui email
                  </span>
                </Label>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                  <span>Notifikasi Push</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Terima notifikasi push di perangkat Anda
                  </span>
                </Label>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="reminders" className="flex flex-col space-y-1">
                  <span>Pengingat Belajar</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Terima pengingat untuk belajar setiap hari
                  </span>
                </Label>
                <Switch
                  id="reminders"
                  checked={settings.notifications.reminders}
                  onCheckedChange={(checked) => handleNotificationChange("reminders", checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="new-content" className="flex flex-col space-y-1">
                  <span>Konten Baru</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Terima notifikasi saat ada materi baru
                  </span>
                </Label>
                <Switch
                  id="new-content"
                  checked={settings.notifications.newContent}
                  onCheckedChange={(checked) => handleNotificationChange("newContent", checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="achievements" className="flex flex-col space-y-1">
                  <span>Pencapaian</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Terima notifikasi saat mendapatkan pencapaian baru
                  </span>
                </Label>
                <Switch
                  id="achievements"
                  checked={settings.notifications.achievements}
                  onCheckedChange={(checked) => handleNotificationChange("achievements", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
              <CardDescription>Kustomisasi tampilan aplikasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleAppearanceChange("theme", value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Pilih tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Terang</SelectItem>
                    <SelectItem value="dark">Gelap</SelectItem>
                    <SelectItem value="system">Sistem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-size">Ukuran Font</Label>
                <Select
                  value={settings.appearance.fontSize}
                  onValueChange={(value) => handleAppearanceChange("fontSize", value)}
                >
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Pilih ukuran font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Kecil</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="large">Besar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="reduce-motion" className="flex flex-col space-y-1">
                  <span>Kurangi Gerakan</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Kurangi animasi dan efek gerakan
                  </span>
                </Label>
                <Switch
                  id="reduce-motion"
                  checked={settings.appearance.reduceMotion}
                  onCheckedChange={(checked) => handleAppearanceChange("reduceMotion", checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="high-contrast" className="flex flex-col space-y-1">
                  <span>Kontras Tinggi</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Tingkatkan kontras untuk keterbacaan yang lebih baik
                  </span>
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.appearance.highContrast}
                  onCheckedChange={(checked) => handleAppearanceChange("highContrast", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Pembelajaran</CardTitle>
              <CardDescription>Kustomisasi pengalaman belajar Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="auto-play" className="flex flex-col space-y-1">
                  <span>Putar Video Otomatis</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Putar video secara otomatis saat membuka materi
                  </span>
                </Label>
                <Switch
                  id="auto-play"
                  checked={settings.learning.autoPlayVideos}
                  onCheckedChange={(checked) => handleLearningChange("autoPlayVideos", checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-hints" className="flex flex-col space-y-1">
                  <span>Tampilkan Petunjuk</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Tampilkan petunjuk saat mengerjakan latihan
                  </span>
                </Label>
                <Switch
                  id="show-hints"
                  checked={settings.learning.showHints}
                  onCheckedChange={(checked) => handleLearningChange("showHints", checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-progress" className="flex flex-col space-y-1">
                  <span>Tampilkan Bar Kemajuan</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Tampilkan bar kemajuan saat belajar
                  </span>
                </Label>
                <Switch
                  id="show-progress"
                  checked={settings.learning.showProgressBar}
                  onCheckedChange={(checked) => handleLearningChange("showProgressBar", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-goal">Target Harian (menit)</Label>
                <Select
                  value={settings.learning.dailyGoal}
                  onValueChange={(value) => handleLearningChange("dailyGoal", value)}
                >
                  <SelectTrigger id="daily-goal">
                    <SelectValue placeholder="Pilih target harian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 menit</SelectItem>
                    <SelectItem value="30">30 menit</SelectItem>
                    <SelectItem value="45">45 menit</SelectItem>
                    <SelectItem value="60">60 menit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Privasi</CardTitle>
              <CardDescription>Kelola pengaturan privasi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="share-progress" className="flex flex-col space-y-1">
                  <span>Bagikan Kemajuan</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Izinkan guru melihat kemajuan belajar Anda
                  </span>
                </Label>
                <Switch
                  id="share-progress"
                  checked={settings.privacy.shareProgress}
                  onCheckedChange={(checked) => handlePrivacyChange("shareProgress", checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="online-status" className="flex flex-col space-y-1">
                  <span>Tampilkan Status Online</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Tampilkan status online Anda kepada pengguna lain
                  </span>
                </Label>
                <Switch
                  id="online-status"
                  checked={settings.privacy.showOnlineStatus}
                  onCheckedChange={(checked) => handlePrivacyChange("showOnlineStatus", checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="data-collection" className="flex flex-col space-y-1">
                  <span>Pengumpulan Data</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Izinkan pengumpulan data untuk meningkatkan pengalaman belajar
                  </span>
                </Label>
                <Switch
                  id="data-collection"
                  checked={settings.privacy.allowDataCollection}
                  onCheckedChange={(checked) => handlePrivacyChange("allowDataCollection", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Pengaturan"
          )}
        </Button>
      </div>
    </div>
  )
}