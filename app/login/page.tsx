"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Animation states
  const [showLeftPanel, setShowLeftPanel] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setShowLeftPanel(true), 300)
  }, [])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))

    // Clear errors when typing
    if (Object.keys(formErrors).includes(name)) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const errors = {
      email: "",
      password: "",
      confirmPassword: "",
    }
    let isValid = true

    if (!validateEmail(formState.email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }

    if (formState.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
      isValid = false
    }

    if (activeTab === "register" && formState.password !== formState.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Panel - Decorative */}
      <div
        className={`hidden md:flex md:w-1/2 bg-gradient-to-br from-amber-50 to-amber-100 relative transition-all duration-700 ease-in-out ${
          showLeftPanel ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] rotate-12 opacity-5">
            <div className="grid grid-cols-6 gap-4 w-full h-full">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="aspect-square bg-rich-walnut rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="mb-8 flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LZ8K9z0B0UjQaBCK5ntxcKBUAmuI7S.png"
              alt="RoomCrafter Logo"
              width={180}
              height={40}
              className="object-contain"
            />
          </div>

          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-warm-chestnut mb-4">Transform Your Space</h2>
            <p className="text-amber-900/70 max-w-md">
              Design, visualize, and bring your dream interior to life with our intuitive furniture design platform.
            </p>
          </div>

          <div className="relative w-full max-w-md aspect-[4/3] rounded-lg overflow-hidden shadow-2xl mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-UsDM0xDupK3FRQi4Weh7ZmfPETS3tm.png"
              alt="Interior design preview"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center mb-2">
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                <span className="text-sm font-medium">Kitchen Renovation</span>
              </div>
              <div className="flex space-x-2">
                <span className="text-xs px-2 py-1 bg-white/20 rounded-full">Modern</span>
                <span className="text-xs px-2 py-1 bg-white/20 rounded-full">Elegant</span>
                <span className="text-xs px-2 py-1 bg-white/20 rounded-full">Functional</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-warm-chestnut/30"></div>
            ))}
            <div className="w-3 h-3 rounded-full bg-warm-chestnut"></div>
            {[5, 6].map((i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-warm-chestnut/30"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-amber-50/30">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center md:hidden">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LZ8K9z0B0UjQaBCK5ntxcKBUAmuI7S.png"
              alt="RoomCrafter Logo"
              width={160}
              height={36}
              className="object-contain"
            />
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="data-[state=active]:bg-rich-walnut data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-rich-walnut data-[state=active]:text-white"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-rich-walnut">Welcome back</CardTitle>
                  <CardDescription>Log in to your account to continue designing beautiful spaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          value={formState.email}
                          onChange={handleInputChange}
                          className={`pr-10 ${formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          required
                        />
                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <Link href="#" className="text-xs text-warm-chestnut hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formState.password}
                          onChange={handleInputChange}
                          className={`pr-10 ${formErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-rich-walnut hover:bg-warm-chestnut text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-0">
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Button variant="outline" className="w-full">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" className="w-full">
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-rich-walnut">Create an account</CardTitle>
                  <CardDescription>Sign up to start designing your perfect space</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input
                          id="first-name"
                          name="firstName"
                          type="text"
                          value={formState.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input
                          id="last-name"
                          name="lastName"
                          type="text"
                          value={formState.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formState.email}
                        onChange={handleInputChange}
                        className={formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formState.password}
                          onChange={handleInputChange}
                          className={formErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                          required
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formState.confirmPassword}
                        onChange={handleInputChange}
                        className={formErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded border border-gray-300 flex items-center justify-center">
                        <Check className="h-3 w-3 text-rich-walnut" />
                      </div>
                      <Label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{" "}
                        <Link href="#" className="text-warm-chestnut hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-warm-chestnut hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-rich-walnut hover:bg-warm-chestnut text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating account...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our{" "}
            <Link href="#" className="text-warm-chestnut hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-warm-chestnut hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
