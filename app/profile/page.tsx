"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Edit, ArrowLeft, Upload, Star, LinkIcon, Trash2, LogOut, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"

// Mock data for user profile
const userProfile = {
  name: "Sarah Johnson",
  username: "sarahjohnson",
  email: "sarah.johnson@example.com",
  phone: "+1 (555) 123-4567",
  role: "Designer",
  joinDate: "January 15, 2023",
  avatar: "/placeholder.svg?height=128&width=128",
}

// Mock data for user designs
const userDesigns = [
  {
    id: "1",
    name: "Modern Living Room",
    thumbnail: "/placeholder.svg?height=200&width=300",
    date: "April 10, 2023",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Minimalist Bedroom",
    thumbnail: "/placeholder.svg?height=200&width=300",
    date: "March 22, 2023",
    rating: 4.5,
  },
  {
    id: "3",
    name: "Cozy Office Space",
    thumbnail: "/placeholder.svg?height=200&width=300",
    date: "February 15, 2023",
    rating: 4.9,
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [profileData, setProfileData] = useState(userProfile)
  const [formData, setFormData] = useState(userProfile)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = () => {
    setProfileData(formData)
    setShowEditDialog(false)
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handleDeleteAccount = () => {
    setShowDeleteDialog(false)
    toast({
      title: "Account Deleted",
      description: "Your account has been deleted successfully.",
    })
    // In a real app, you would redirect to the login page after account deletion
    setTimeout(() => router.push("/login"), 2000)
  }

  const handleAvatarUpload = () => {
    // In a real app, you would handle file upload
    toast({
      title: "Avatar Updated",
      description: "Your profile picture has been updated successfully.",
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
              <User className="h-6 w-6 text-[#5D4037]" />
              <h1 className="text-xl font-bold text-[#3E2723]">Profile</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscalemedia-transformed-removebg-preview-vqBzGArflcxKvkM4AobV4pUuRSe6wL.png"
                alt="RoomCrafter Logo"
                className="h-8 w-auto"
              />
              <span className="text-lg font-semibold text-[#5D4037]">RoomCrafter</span>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="bg-[#EFEBE9] text-[#5D4037] border-[#A1887F] hover:bg-[#D7CCC8]"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1 bg-[#EFEBE9] border-[#A1887F]">
            <CardHeader className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
                  <AvatarFallback className="bg-[#8D6E63] text-white">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#5D4037] text-white hover:bg-[#3E2723] border-[#EFEBE9]"
                  onClick={handleAvatarUpload}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-center text-2xl text-[#3E2723]">{profileData.name}</CardTitle>
              <Badge className="bg-[#8D6E63] hover:bg-[#5D4037]">{profileData.role}</Badge>
              <p className="text-sm text-[#A1887F]">Member since {profileData.joinDate}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#5D4037]" />
                <span className="text-[#3E2723]">{profileData.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-[#5D4037]" />
                <span className="text-[#3E2723]">{profileData.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-[#5D4037]" />
                <span className="text-[#3E2723]">{profileData.phone}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                className="border-[#A1887F] text-[#5D4037] hover:bg-[#D7CCC8]"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardFooter>
          </Card>

          {/* Tabs Section */}
          <div className="md:col-span-2">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="mb-6 bg-[#EFEBE9] p-1">
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-[#5D4037] data-[state=active]:text-white"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="data-[state=active]:bg-[#5D4037] data-[state=active]:text-white"
                >
                  Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity">
                <Card className="bg-[#EFEBE9] border-[#A1887F]">
                  <CardHeader>
                    <CardTitle className="text-[#3E2723]">Design History</CardTitle>
                    <CardDescription>Your recent design projects and activities.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userDesigns.map((design) => (
                        <div
                          key={design.id}
                          className="flex flex-col md:flex-row items-start md:items-center gap-4 rounded-lg border border-[#A1887F] bg-white p-4"
                        >
                          <img
                            src={design.thumbnail || "/placeholder.svg"}
                            alt={design.name}
                            className="h-24 w-40 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-[#3E2723]">{design.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-[#8D6E63]">
                              <Calendar className="h-4 w-4" />
                              <span>{design.date}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-[#8D6E63]">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span>{design.rating}/5.0</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="border-[#A1887F] text-[#5D4037] hover:bg-[#D7CCC8]"
                            onClick={() => router.push(`/?designId=${design.id}`)}
                          >
                            View Design
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card className="bg-[#EFEBE9] border-[#A1887F]">
                  <CardHeader>
                    <CardTitle className="text-[#3E2723]">Account Actions</CardTitle>
                    <CardDescription>Manage your account settings and connections.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-[#A1887F] bg-white p-4">
                      <h3 className="mb-2 font-medium text-[#3E2723]">Link Social Media Accounts</h3>
                      <p className="mb-4 text-sm text-[#8D6E63]">
                        Connect your social media accounts to share your designs.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="border-[#A1887F] text-[#5D4037]">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Connect Facebook
                        </Button>
                        <Button variant="outline" className="border-[#A1887F] text-[#5D4037]">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Connect Instagram
                        </Button>
                        <Button variant="outline" className="border-[#A1887F] text-[#5D4037]">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Connect Pinterest
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#A1887F] bg-white p-4">
                      <h3 className="mb-2 font-medium text-[#3E2723]">Account Security</h3>
                      <p className="mb-4 text-sm text-[#8D6E63]">Manage your account security settings.</p>
                      <div className="flex flex-wrap gap-2">
                        <Button className="bg-[#5D4037] hover:bg-[#3E2723]">Change Password</Button>
                        <Button variant="outline" className="border-[#A1887F] text-[#5D4037]">
                          Enable Two-Factor Auth
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#A1887F] bg-white p-4">
                      <h3 className="mb-2 font-medium text-[#3E2723]">Logout</h3>
                      <p className="mb-4 text-sm text-[#8D6E63]">Sign out of your account on this device.</p>
                      <Button
                        variant="outline"
                        className="border-[#A1887F] text-[#5D4037]"
                        onClick={() => router.push("/login")}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#EFEBE9] border-[#A1887F]">
          <DialogHeader>
            <DialogTitle className="text-[#3E2723]">Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#3E2723]">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border-[#A1887F]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#3E2723]">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="border-[#A1887F]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#3E2723]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="border-[#A1887F]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#3E2723]">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="border-[#A1887F]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#3E2723]">
                Role
              </Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="border-[#A1887F]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-[#A1887F] text-[#5D4037]"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} className="bg-[#5D4037] hover:bg-[#3E2723]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#EFEBE9] border-[#A1887F]">
          <DialogHeader>
            <DialogTitle className="text-[#3E2723]">Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-[#A1887F] text-[#5D4037]"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
