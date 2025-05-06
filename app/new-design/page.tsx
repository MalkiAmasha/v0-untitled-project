"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sofa,
  Bed,
  ChefHat,
  Bath,
  Utensils,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Check,
  Home,
  Ruler,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RoomSetup } from "./room-setup"
import type { RoomShape } from "@/lib/types"

// Room templates
const roomTemplates = [
  {
    id: "living-room",
    name: "Living Room",
    icon: Sofa,
    dimensions: { length: 5.5, width: 4.2, height: 2.8 },
    wallColor: "#f5f5f5",
    floorColor: "#d2b48c",
    floorType: "hardwood",
    shape: "rectangular" as RoomShape,
    description: "A comfortable space for relaxation and entertaining guests",
  },
  {
    id: "bedroom",
    name: "Bedroom",
    icon: Bed,
    dimensions: { length: 4.8, width: 3.6, height: 2.6 },
    wallColor: "#e8e8e8",
    floorColor: "#8b7355",
    floorType: "carpet",
    shape: "rectangular" as RoomShape,
    description: "A peaceful retreat for rest and relaxation",
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: ChefHat,
    dimensions: { length: 4.2, width: 3.8, height: 2.7 },
    wallColor: "#f0f0f0",
    floorColor: "#a9a9a9",
    floorType: "tile",
    shape: "rectangular" as RoomShape,
    description: "A functional space for cooking and meal preparation",
  },
  {
    id: "bathroom",
    name: "Bathroom",
    icon: Bath,
    dimensions: { length: 3.0, width: 2.5, height: 2.4 },
    wallColor: "#ffffff",
    floorColor: "#d3d3d3",
    floorType: "tile",
    shape: "rectangular" as RoomShape,
    description: "A clean and refreshing personal space",
  },
  {
    id: "dining-room",
    name: "Dining Room",
    icon: Utensils,
    dimensions: { length: 4.5, width: 3.8, height: 2.7 },
    wallColor: "#f5f5f5",
    floorColor: "#8b4513",
    floorType: "hardwood",
    shape: "rectangular" as RoomShape,
    description: "A welcoming space for sharing meals and conversation",
  },
  {
    id: "office",
    name: "Home Office",
    icon: BookOpen,
    dimensions: { length: 3.6, width: 3.0, height: 2.6 },
    wallColor: "#f0f0f0",
    floorColor: "#deb887",
    floorType: "hardwood",
    shape: "rectangular" as RoomShape,
    description: "A productive environment for work and study",
  },
  {
    id: "l-shaped-living",
    name: "L-Shaped Living Room",
    icon: Sofa,
    dimensions: { length: 6.0, width: 5.0, height: 2.8 },
    wallColor: "#f5f5f5",
    floorColor: "#d2b48c",
    floorType: "hardwood",
    shape: "l-shaped" as RoomShape,
    description: "A spacious living area with distinct functional zones",
  },
  {
    id: "custom-room",
    name: "Custom Room",
    icon: Home,
    dimensions: { length: 5.0, width: 4.0, height: 2.7 },
    wallColor: "#ffffff",
    floorColor: "#d2b48c",
    floorType: "hardwood",
    shape: "rectangular" as RoomShape,
    description: "Design your own space from scratch",
  },
]

// Color palettes
const colorPalettes = [
  {
    id: "neutral",
    name: "Neutral",
    colors: ["#f5f5f5", "#e0e0e0", "#9e9e9e", "#616161", "#212121"],
    description: "Timeless and versatile colors that work with any style",
  },
  {
    id: "modern",
    name: "Modern",
    colors: ["#ffffff", "#f5f5f5", "#2196f3", "#1976d2", "#0d47a1"],
    description: "Clean, crisp colors with bold blue accents",
  },
  {
    id: "warm",
    name: "Warm",
    colors: ["#fff8e1", "#ffecb3", "#ffd54f", "#ffb300", "#ff8f00"],
    description: "Cozy and inviting amber and yellow tones",
  },
  {
    id: "cool",
    name: "Cool",
    colors: ["#e8f5e9", "#c8e6c9", "#81c784", "#4caf50", "#2e7d32"],
    description: "Refreshing and calming green hues",
  },
  {
    id: "bold",
    name: "Bold",
    colors: ["#ffffff", "#f5f5f5", "#e91e63", "#9c27b0", "#673ab7"],
    description: "Vibrant pink and purple accents for a dramatic look",
  },
]

export default function NewDesignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    roomTemplate: "living-room",
    roomName: "My Living Room",
    dimensions: { length: 5.5, width: 4.2, height: 2.8 },
    wallColor: "#f5f5f5",
    floorColor: "#d2b48c",
    floorType: "hardwood",
    roomShape: "rectangular" as RoomShape,
    colorPalette: "neutral",
  })

  // State for room preview
  const [previewDimensions, setPreviewDimensions] = useState(formData.dimensions)
  const [previewUpdated, setPreviewUpdated] = useState(false)

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    const template = roomTemplates.find((t) => t.id === templateId)
    if (template) {
      setFormData({
        ...formData,
        roomTemplate: templateId,
        roomName: `My ${template.name}`,
        dimensions: template.dimensions,
        wallColor: template.wallColor,
        floorColor: template.floorColor,
        floorType: template.floorType,
        roomShape: template.shape,
      })

      // Update preview dimensions
      setPreviewDimensions(template.dimensions)
      setPreviewUpdated(true)
    }
  }

  // Handle dimension changes with real-time preview
  const handleDimensionChange = (dimension: "length" | "width" | "height", value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      const newDimensions = {
        ...formData.dimensions,
        [dimension]: numValue,
      }

      setFormData({
        ...formData,
        dimensions: newDimensions,
      })

      // Update preview dimensions
      setPreviewDimensions(newDimensions)
      setPreviewUpdated(true)
    }
  }

  // Handle room setup changes
  const handleRoomSetupChange = (
    dimensions: { length: number; width: number; height: number },
    roomShape: RoomShape,
    wallColor: string,
    floorColor: string,
    floorType: string,
  ) => {
    setFormData({
      ...formData,
      dimensions,
      roomShape,
      wallColor,
      floorColor,
      floorType,
    })

    // Update preview dimensions
    setPreviewDimensions(dimensions)
    setPreviewUpdated(true)
  }

  // Handle color palette selection
  const handleSelectColorPalette = (paletteId: string) => {
    setFormData({
      ...formData,
      colorPalette: paletteId,
      wallColor: colorPalettes.find((p) => p.id === paletteId)?.colors[0] || "#f5f5f5",
    })
  }

  // Handle form submission
  const handleCreateRoom = () => {
    // In a real app, you would save the design data to a database
    // For now, we'll just navigate to the design page with the data as URL parameters
    router.push(
      `/?designId=new-${Date.now()}&name=${encodeURIComponent(formData.roomName)}&template=${
        formData.roomTemplate
      }&shape=${formData.roomShape}`,
    )
  }

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Get the selected template
  const selectedTemplate = roomTemplates.find((t) => t.id === formData.roomTemplate) || roomTemplates[0]
  const TemplateIcon = selectedTemplate.icon

  // Reset preview updated flag after animation
  useEffect(() => {
    if (previewUpdated) {
      const timer = setTimeout(() => {
        setPreviewUpdated(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [previewUpdated])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Design</h1>
          <div className="flex items-center mt-6 w-full max-w-md">
            <div className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Home className="h-5 w-5" />
              </div>
              <span className="text-sm mt-2">Room Type</span>
            </div>
            <div className="w-16 h-0.5 bg-muted relative">
              <div
                className="absolute inset-0 bg-primary transition-all duration-300"
                style={{ width: currentStep >= 2 ? "100%" : "0%" }}
              ></div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Ruler className="h-5 w-5" />
              </div>
              <span className="text-sm mt-2">Dimensions</span>
            </div>
            <div className="w-16 h-0.5 bg-muted relative">
              <div
                className="absolute inset-0 bg-primary transition-all duration-300"
                style={{ width: currentStep >= 3 ? "100%" : "0%" }}
              ></div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Palette className="h-5 w-5" />
              </div>
              <span className="text-sm mt-2">Colors</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Room Type */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Room Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {roomTemplates.map((template) => {
                    const Icon = template.icon
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:border-primary ${
                          formData.roomTemplate === template.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => handleSelectTemplate(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{template.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                          <div className="text-xs text-muted-foreground">
                            {template.dimensions.length}m × {template.dimensions.width}m
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={nextStep}>
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Room Dimensions */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Room Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="room-name">Room Name</Label>
                      <Input
                        id="room-name"
                        value={formData.roomName}
                        onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Room Dimensions</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label htmlFor="length" className="text-xs">
                            Length (m)
                          </Label>
                          <Input
                            id="length"
                            type="number"
                            value={formData.dimensions.length}
                            onChange={(e) => handleDimensionChange("length", e.target.value)}
                            min="1"
                            max="20"
                            step="0.1"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="width" className="text-xs">
                            Width (m)
                          </Label>
                          <Input
                            id="width"
                            type="number"
                            value={formData.dimensions.width}
                            onChange={(e) => handleDimensionChange("width", e.target.value)}
                            min="1"
                            max="20"
                            step="0.1"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height" className="text-xs">
                            Height (m)
                          </Label>
                          <Input
                            id="height"
                            type="number"
                            value={formData.dimensions.height}
                            onChange={(e) => handleDimensionChange("height", e.target.value)}
                            min="1"
                            max="10"
                            step="0.1"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Room Shape</Label>
                      <RadioGroup
                        value={formData.roomShape}
                        onValueChange={(value) => setFormData({ ...formData, roomShape: value as RoomShape })}
                        className="grid grid-cols-3 gap-4 mt-2"
                      >
                        {[
                          { id: "rectangular", name: "Rectangular" },
                          { id: "l-shaped", name: "L-Shaped" },
                          { id: "custom", name: "Custom" },
                        ].map((shape) => (
                          <div key={shape.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={shape.id} id={`shape-${shape.id}`} />
                            <Label htmlFor={`shape-${shape.id}`} className="cursor-pointer">
                              {shape.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Room Preview</Label>
                      <div className="mt-2 border rounded-lg p-4 h-48 flex items-center justify-center bg-gray-50">
                        <div
                          className={`relative transition-all duration-300 ${previewUpdated ? "scale-105" : "scale-100"}`}
                          style={{
                            width: `${previewDimensions.length * 20}px`,
                            height: `${previewDimensions.width * 20}px`,
                            maxWidth: "100%",
                            maxHeight: "100%",
                            backgroundColor: formData.floorColor,
                            border: `2px solid ${formData.wallColor}`,
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <TemplateIcon className="h-8 w-8 text-white opacity-50" />
                          </div>
                          <div className="absolute bottom-1 right-1 text-xs text-white bg-black/50 px-1 rounded">
                            {formData.dimensions.length}m × {formData.dimensions.width}m
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <RoomSetup
                        dimensions={formData.dimensions}
                        roomShape={formData.roomShape}
                        wallColor={formData.wallColor}
                        floorColor={formData.floorColor}
                        floorType={formData.floorType}
                        onDimensionsChange={(dimensions) => {
                          setFormData({ ...formData, dimensions })
                          setPreviewDimensions(dimensions)
                          setPreviewUpdated(true)
                        }}
                        onRoomShapeChange={(shape) => setFormData({ ...formData, roomShape: shape })}
                        onWallColorChange={(color) => setFormData({ ...formData, wallColor: color })}
                        onFloorColorChange={(color) => setFormData({ ...formData, floorColor: color })}
                        onFloorTypeChange={(type) => setFormData({ ...formData, floorType: type })}
                        onApply={() => {}}
                        onCancel={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button onClick={nextStep}>
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Colors and Finalize */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {colorPalettes.map((palette) => (
                    <Card
                      key={palette.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        formData.colorPalette === palette.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => handleSelectColorPalette(palette.id)}
                    >
                      <CardContent className="p-4">
                        <div className="font-medium mb-2">{palette.name}</div>
                        <div className="flex gap-1 mb-2">
                          {palette.colors.map((color, index) => (
                            <div
                              key={index}
                              className="h-6 w-6 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{palette.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Design Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Name:</span>
                      <span className="font-medium">{formData.roomName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Type:</span>
                      <span className="font-medium">{selectedTemplate.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="font-medium">
                        {formData.dimensions.length}m × {formData.dimensions.width}m × {formData.dimensions.height}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Shape:</span>
                      <span className="font-medium capitalize">{formData.roomShape}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Floor Type:</span>
                      <span className="font-medium capitalize">{formData.floorType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color Palette:</span>
                      <span className="font-medium">
                        {colorPalettes.find((p) => p.id === formData.colorPalette)?.name || "Custom"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Wall Color:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: formData.wallColor }}
                        ></div>
                        <span className="font-medium">{formData.wallColor}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Floor Color:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: formData.floorColor }}
                        ></div>
                        <span className="font-medium">{formData.floorColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button onClick={handleCreateRoom}>
                  <Check className="mr-2 h-4 w-4" /> Create Room
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
