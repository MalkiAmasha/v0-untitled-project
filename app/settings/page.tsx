"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SettingsIcon, Moon, Sun, Bell, BellOff, Globe, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Mock data for saved designs
const savedDesigns = [
  {
    id: "1",
    name: "Modern Living Room",
    lastEdited: "2 hours ago",
  },
  {
    id: "2",
    name: "Minimalist Bedroom",
    lastEdited: "Yesterday",
  },
  {
    id: "3",
    name: "Cozy Office Space",
    lastEdited: "3 days ago",
  },
]

// Mock data for color palettes
const colorPalettes = [
  {
    id: "1",
    name: "Warm Wood",
    colors: ["#5D4037", "#8D6E63", "#A1887F", "#D7CCC8", "#EFEBE9", "#3E2723"],
  },
  {
    id: "2",
    name: "Cool Modern",
    colors: ["#455A64", "#607D8B", "#90A4AE", "#CFD8DC", "#ECEFF1", "#263238"],
  },
  {
    id: "3",
    name: "Vibrant Accent",
    colors: ["#5D4037", "#8D6E63", "#A1887F", "#D7CCC8", "#EFEBE9", "#FF5722"],
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState("english")
  const [defaultMaterial, setDefaultMaterial] = useState("oak")
  const [units, setUnits] = useState("inches")
  const [cloudBackup, setCloudBackup] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [designToDelete, setDesignToDelete] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedPalette, setSelectedPalette] = useState("1")

  const handleThemeChange = () => {
    setTheme(theme === "light" ? "dark" : "light")
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${theme === "light" ? "dark" : "light"} mode.`,
    })
  }

  const handleDeleteDesign = (id: string) => {
    setDesignToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (designToDelete) {
      // In a real app, you would delete the design from your database
      toast({
        title: "Design Deleted",
        description: "The design has been permanently deleted.",
      })
      setShowDeleteDialog(false)
      setDesignToDelete(null)
    }
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would validate the current password and update it
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
    })
    setShowPasswordDialog(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleClearHistory = () => {
    // In a real app, you would clear the user's design history
    toast({
      title: "History Cleared",
      description: "Your design history has been cleared.",
    })
  }

  const handleDownloadData = () => {
    // In a real app, you would generate and download the user's data
    toast({
      title: "Data Export Started",
      description: "Your data is being prepared for download.",
    })
  }

  const handleDownloadDesigns = () => {
    // In a real app, you would generate and download all designs
    toast({
      title: "Export Started",
      description: "Your designs are being prepared for download.",
    })
  }

  return (
    <div className="min-h-screen bg-[#D7CCC8]">
      {/* Header */}
      <header className="border-b bg-[#EFEBE9] border-[#A1887F]">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-[#3E2723]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-[#5D4037]" />
              <h1 className="text-xl font-bold text-[#3E2723]">Settings</h1>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="bg-[#EFEBE9] text-[#5D4037] border-[#A1887F] hover:bg-[#D7CCC8]"
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#3E2723]">General Settings</h1>
            <p className="text-muted-foreground">Manage your application preferences</p>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscalemedia-transformed-removebg-preview-vqBzGArflcxKvkM4AobV4pUuRSe6wL.png"
              alt="RoomCrafter Logo"
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold text-[#5D4037]">RoomCrafter</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[#EFEBE9] border-[#A1887F]">
            <CardHeader>
              <CardTitle className="text-[#3E2723]">Theme</CardTitle>
              <CardDescription>Choose between light and dark mode for the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5 text-[#5D4037]" />
                  ) : (
                    <Moon className="h-5 w-5 text-[#5D4037]" />
                  )}
                  <Label htmlFor="theme-mode" className="text-[#3E2723]">
                    {theme === "light" ? "Light Mode" : "Dark Mode"}
                  </Label>
                </div>
                <Switch id="theme-mode" checked={theme === "dark"} onCheckedChange={handleThemeChange} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#EFEBE9] border-[#A1887F]">
            <CardHeader>
              <CardTitle className="text-[#3E2723]">Language</CardTitle>
              <CardDescription>Select your preferred language for the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Globe className="h-5 w-5 text-[#5D4037]" />
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-white border-[#A1887F]">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#EFEBE9] border-[#A1887F]">
            <CardHeader>
              <CardTitle className="text-[#3E2723]">Notifications</CardTitle>
              <CardDescription>Enable or disable notifications from the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {notifications ? (
                    <Bell className="h-5 w-5 text-[#5D4037]" />
                  ) : (
                    <BellOff className="h-5 w-5 text-[#5D4037]" />
                  )}
                  <Label htmlFor="notifications" className="text-[#3E2723]">
                    {notifications ? "Notifications Enabled" : "Notifications Disabled"}
                  </Label>
                </div>
                <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#EFEBE9] border-[#A1887F]">
            <CardHeader>
              <CardTitle className="text-[#3E2723]">About RoomCrafter</CardTitle>
              <CardDescription>Information about the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#3E2723]">Version</span>
                  <span className="text-[#8D6E63]">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3E2723]">Released</span>
                  <span className="text-[#8D6E63]">April 2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3E2723]">License</span>
                  <span className="text-[#8D6E63]">Commercial</span>
                </div>
                <p className="text-sm text-[#8D6E63] mt-4">
                  RoomCrafter is a powerful room design and furniture visualization tool that helps you create beautiful
                  spaces with ease.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
