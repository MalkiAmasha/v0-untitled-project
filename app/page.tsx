"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Layers,
  Save,
  Settings,
  Grid3X3,
  CuboidIcon as Cube,
  Undo,
  Redo,
  ZoomIn,
  Move,
  RotateCcw,
  Palette,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  FileDown,
  ArrowLeft,
  Home,
  Sofa,
  Sparkles,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { FloorPlanCanvas } from "@/components/floor-plan-canvas"
import { ThreeDVisualization } from "@/components/three-d-visualization"
import { useRoomStore } from "@/lib/room-store"
import { useFurnitureStore } from "@/lib/furniture-store"
import { useHistoryStore } from "@/lib/history-store"
import { useLayerStore } from "@/lib/layer-store"
import type { FurnitureItem } from "@/lib/types"

// Import the ViewSyncProvider at the top of the file
import { ViewSyncProvider, useViewSync } from "@/components/view-sync-provider"

// Import the ViewTransition component
import { ViewTransition } from "@/components/view-transition"

// Import the ViewIndicator component
import { ViewIndicator } from "@/components/view-indicator"

// Import the FurnitureItemSync component
import { FurnitureItemSync } from "@/components/furniture-item-sync"

// Import the CameraRotationLock component
import { CameraRotationLock } from "@/components/camera-rotation-lock"

// Import the new furniture catalog component
import { FurnitureCatalog } from "@/components/furniture-catalog"

// Import the furniture recommendations component
import { FurnitureRecommendations } from "@/components/furniture-recommendations"

// Define a set of vibrant colors for furniture
const vibrantColors = [
  "#FF5252", // Bright Red
  "#FF4081", // Pink
  "#E040FB", // Purple
  "#7C4DFF", // Deep Purple
  "#536DFE", // Indigo
  "#448AFF", // Blue
  "#40C4FF", // Light Blue
  "#18FFFF", // Cyan
  "#64FFDA", // Teal
  "#69F0AE", // Green
  "#B2FF59", // Light Green
  "#EEFF41", // Lime
  "#FFFF00", // Yellow
  "#FFD740", // Amber
  "#FFAB40", // Orange
  "#FF6E40", // Deep Orange
]

// Define a set of neutral colors for furniture
const neutralColors = [
  "#5D4037", // Brown
  "#8D6E63", // Light Brown
  "#A1887F", // Taupe
  "#D7CCC8", // Light Taupe
  "#EFEBE9", // Off White
  "#3E2723", // Dark Brown
  "#212121", // Almost Black
  "#757575", // Gray
  "#BDBDBD", // Light Gray
  "#F5F5F5", // Almost White
]

// Add the FurnitureItemSync component to the ViewSyncProvider
export default function FurnitureVisualization() {
  return (
    <ViewSyncProvider>
      <FurnitureItemSync />
      <FurnitureVisualizationContent />
    </ViewSyncProvider>
  )
}

function FurnitureVisualizationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const designId = searchParams.get("designId")
  const designName = searchParams.get("name") || "Untitled Design"

  // Use the shared view state from the context
  const { viewMode, setViewMode, selectedItemId, setSelectedItemId } = useViewSync()

  const [activeTool, setActiveTool] = useState<string>("select")
  const [showRoomSetup, setShowRoomSetup] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [glossiness, setGlossiness] = useState(65)
  const [textureScale, setTextureScale] = useState(50)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [material, setMaterial] = useState<string>("fabric")
  const [projectName, setProjectName] = useState(designName)
  const [colorPalette, setColorPalette] = useState<"vibrant" | "neutral">("vibrant")

  // Add state for furniture catalog and recommendations
  const [showFurnitureCatalog, setShowFurnitureCatalog] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Add the new state for camera rotation lock
  const [isCameraRotationLocked, setIsCameraRotationLocked] = useState(false)

  // Room state
  const {
    roomDimensions,
    wallColor,
    floorColor,
    floorType,
    roomShape,
    updateRoomDimensions,
    updateWallColor,
    updateFloorColor,
    updateFloorType,
    updateRoomShape,
  } = useRoomStore()

  // Furniture state
  const {
    furnitureItems,
    addFurnitureItem,
    updateFurnitureItem,
    removeFurnitureItem,
    getFurnitureItem,
    setFurnitureItems,
  } = useFurnitureStore()

  // History state
  const { saveState, undo, redo, canUndo, canRedo } = useHistoryStore()

  // Layer state
  const { layers, toggleLayerVisibility, addLayer } = useLayerStore()

  // Get the selected furniture item
  const selectedItem = selectedItemId ? getFurnitureItem(selectedItemId) : null

  // Save state to history when furniture items change
  useEffect(() => {
    if (isInitialized && furnitureItems.length > 0) {
      saveState(furnitureItems)
    } else if (furnitureItems.length > 0 && !isInitialized) {
      setIsInitialized(true)
    }
  }, [furnitureItems, saveState, isInitialized])

  // Handle undo
  const handleUndo = () => {
    const previousState = undo()
    if (previousState) {
      // Set the furniture items to the previous state
      setFurnitureItems(previousState)

      // If the currently selected item is no longer in the previous state, deselect it
      if (selectedItemId && !previousState.some((item) => item.id === selectedItemId)) {
        setSelectedItemId(null)
      }
    }
  }

  // Handle redo
  const handleRedo = () => {
    const nextState = redo()
    if (nextState) {
      setFurnitureItems(nextState)
    }
  }

  // Handle position change
  const handlePositionChange = (axis: "x" | "y" | "z", value: string) => {
    if (!selectedItemId) return

    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return

    updateFurnitureItem(selectedItemId, {
      position: {
        ...selectedItem!.position,
        [axis]: numValue,
      },
    })
  }

  // Handle dimension change
  const handleDimensionChange = (dimension: "width" | "depth" | "height", value: string) => {
    if (!selectedItemId) return

    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return

    updateFurnitureItem(selectedItemId, {
      dimensions: {
        ...selectedItem!.dimensions,
        [dimension]: numValue,
      },
    })
  }

  // Handle rotation change
  const handleRotationChange = (axis: "x" | "y" | "z", value: string) => {
    if (!selectedItemId) return

    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return

    updateFurnitureItem(selectedItemId, {
      rotation: {
        ...selectedItem!.rotation,
        [axis]: numValue,
      },
    })
  }

  // Handle color change
  const handleColorChange = (color: string) => {
    if (!selectedItemId) return
    updateFurnitureItem(selectedItemId, { color })
  }

  // Handle material change
  const handleMaterialChange = (material: string) => {
    if (!selectedItemId) return
    updateFurnitureItem(selectedItemId, { material })
  }

  // Handle scale change
  const handleScaleChange = (scale: number) => {
    if (!selectedItemId || activeTool !== "scale") return

    const item = getFurnitureItem(selectedItemId)
    if (!item) return

    updateFurnitureItem(selectedItemId, {
      dimensions: {
        width: item.dimensions.width * scale,
        depth: item.dimensions.depth * scale,
        height: item.dimensions.height * scale,
      },
    })
  }

  // Add a new furniture item
  const handleAddFurniture = (type: string) => {
    const newItem: FurnitureItem = {
      id: `furniture-${Date.now()}`,
      type,
      name: `New ${type}`,
      position: { x: roomDimensions.length / 2, y: 0, z: roomDimensions.width / 2 },
      dimensions: { width: 1, depth: 1, height: 1 },
      rotation: { x: 0, y: 0, z: 0 },
      color: type === "sofa" ? "#7a8c98" : type === "chair" ? "#a89b8c" : type === "table" ? "#9c8c7c" : "#8a7f72",
      material: "fabric",
    }

    addFurnitureItem(newItem)
    setSelectedItemId(newItem.id)
  }

  // Handle adding furniture from catalog
  const handleAddFromCatalog = (furnitureToAdd: FurnitureItem[]) => {
    // Add each furniture item to the room
    furnitureToAdd.forEach((item) => {
      // Position the item in the center of the room initially
      const positionedItem = {
        ...item,
        position: {
          x: roomDimensions.length / 2,
          y: 0,
          z: roomDimensions.width / 2,
        },
      }
      addFurnitureItem(positionedItem)
    })

    // Close the catalog
    setShowFurnitureCatalog(false)

    // Select the last added item
    if (furnitureToAdd.length > 0) {
      setSelectedItemId(furnitureToAdd[furnitureToAdd.length - 1].id)
    }
  }

  // Handle adding furniture from recommendations
  const handleAddFromRecommendations = (furnitureToAdd: FurnitureItem[]) => {
    // Add each furniture item to the room
    furnitureToAdd.forEach((item) => {
      addFurnitureItem(item)
    })

    // Close the recommendations
    setShowRecommendations(false)
  }

  // Delete selected furniture
  const handleDeleteSelected = () => {
    if (selectedItemId) {
      removeFurnitureItem(selectedItemId)
      setSelectedItemId(null)
    }
  }

  // Handle save project
  const handleSaveProject = () => {
    const projectData = {
      id: designId || `design-${Date.now()}`,
      name: projectName,
      roomDimensions,
      wallColor,
      floorColor,
      floorType,
      roomShape,
      furnitureItems,
      lastEdited: new Date().toISOString(),
    }

    // In a real app, you would save this to a database
    // For now, we'll just save to localStorage
    const savedDesigns = JSON.parse(localStorage.getItem("savedDesigns") || "[]")
    const existingIndex = savedDesigns.findIndex((d: any) => d.id === projectData.id)

    if (existingIndex >= 0) {
      savedDesigns[existingIndex] = projectData
    } else {
      savedDesigns.push(projectData)
    }

    localStorage.setItem("savedDesigns", JSON.stringify(savedDesigns))

    alert("Design saved successfully!")
  }

  // Handle export as image
  const handleExportImage = () => {
    if (!canvasRef.current) return

    // Create a temporary canvas to capture the scene
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvasRef.current.clientWidth
    tempCanvas.height = canvasRef.current.clientHeight

    // Get the canvas from the 3D or 2D view
    let sourceCanvas: HTMLCanvasElement | null = null

    if (viewMode === "3d") {
      sourceCanvas = canvasRef.current.querySelector("canvas")
    } else {
      sourceCanvas = canvasRef.current.querySelector("canvas")
    }

    if (!sourceCanvas) return

    // Draw the source canvas to the temporary canvas
    const ctx = tempCanvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(sourceCanvas, 0, 0)

    // Convert to image and download
    const dataUrl = tempCanvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}.png`
    link.href = dataUrl
    link.click()
  }

  // Add a new layer
  const handleAddLayer = () => {
    const newLayerId = `layer-${Date.now()}`
    addLayer({
      id: newLayerId,
      name: `New Layer ${layers.length + 1}`,
      visible: true,
    })
  }

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  // Add a function to center the room when switching views
  useEffect(() => {
    // When switching views, ensure the room is centered
    // This helps maintain consistent positioning between views
    if (canvasRef.current) {
      // Reset any view transformations
      if (viewMode === "2d") {
        // For 2D view, center the room
        // This will be handled by the FloorPlanCanvas component
      } else {
        // For 3D view, reset camera position
        // This will be handled by the ThreeDVisualization component
      }
    }
  }, [viewMode])

  // Get the current color palette based on selection
  const currentColorPalette = colorPalette === "vibrant" ? vibrantColors : neutralColors

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar className="border-r bg-creamy-almond">
          <SidebarHeader className="border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscalemedia-transformed-removebg-preview-vqBzGArflcxKvkM4AobV4pUuRSe6wL.png"
                alt="RoomCrafter Logo"
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold">RoomCrafter</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="justify-between" onClick={handleBackToDashboard}>
                      <span className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="justify-between">
                      <span>{projectName}</span>
                      <span className="text-xs text-muted-foreground">Current</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Furniture</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setShowFurnitureCatalog(true)}>
                      <span className="flex items-center">
                        <Sofa className="h-4 w-4 mr-2" />
                        Browse Furniture Catalog
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setShowRecommendations(true)}>
                      <span className="flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Recommendations
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Quick Add</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleAddFurniture("chair")}>
                      <span>Chairs</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleAddFurniture("table")}>
                      <span>Tables</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleAddFurniture("sofa")}>
                      <span>Sofas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleAddFurniture("storage")}>
                      <span>Storage</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleAddFurniture("lamp")}>
                      <span>Lighting</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleAddFurniture("decor")}>
                      <span>Decor</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/profile")}>
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[#EFEBE9] border border-[#A1887F]">
                  <User className="h-5 w-5 text-[#5D4037]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">Designer</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top toolbar */}
          <div className="flex items-center justify-between border-b px-4 py-2 bg-creamy-almond">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={() => setShowRoomSetup(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Room Setup
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value && value !== viewMode) {
                    // Only update if the value is different
                    setViewMode(value as "2d" | "3d")
                  }
                }}
              >
                <ToggleGroupItem value="2d" aria-label="2D View">
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  2D
                </ToggleGroupItem>
                <ToggleGroupItem value="3d" aria-label="3D View">
                  <Cube className="mr-2 h-4 w-4" />
                  3D
                </ToggleGroupItem>
              </ToggleGroup>
              {/* Add the camera rotation lock toggle here, only visible in 3D mode */}
              {viewMode === "3d" && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <CameraRotationLock
                    isLocked={isCameraRotationLocked}
                    onToggle={() => setIsCameraRotationLocked(!isCameraRotationLocked)}
                  />
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="bg-creamy-almond hover:bg-soft-taupe text-charcoal-brown"
              >
                <Undo className="mr-2 h-4 w-4" />
                Undo
              </Button>
              <Button variant="outline" size="sm" onClick={handleRedo} disabled={!canRedo}>
                <Redo className="mr-2 h-4 w-4" />
                Redo
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportImage}>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="default" size="sm" onClick={handleSaveProject}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left toolbar */}
            <div className="flex w-12 flex-col items-center border-r py-4 bg-creamy-almond">
              <TooltipProvider>
                <div className="flex flex-col gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeTool === "select" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setActiveTool("select")}
                      >
                        <Move className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Select & Move</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeTool === "rotate" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setActiveTool("rotate")}
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Rotate</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeTool === "scale" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setActiveTool("scale")}
                      >
                        <ZoomIn className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Scale</TooltipContent>
                  </Tooltip>
                  <Separator className="my-2" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeTool === "color" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setActiveTool("color")}
                      >
                        <Palette className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Change Color</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeTool === "layers" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setActiveTool("layers")}
                      >
                        <Layers className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Layers</TooltipContent>
                  </Tooltip>
                  <Separator className="my-2" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleDeleteSelected} disabled={!selectedItemId}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Delete Selected</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>

            {/* Main canvas area */}
            <div ref={canvasRef} className="relative flex-1 overflow-hidden bg-light-sand-beige">
              <ViewTransition>
                {viewMode === "2d" ? (
                  <FloorPlanCanvas
                    roomDimensions={roomDimensions}
                    roomShape={roomShape}
                    wallColor={wallColor}
                    floorColor={floorColor}
                    furnitureItems={furnitureItems}
                    selectedItemId={isPreviewMode ? null : selectedItemId}
                    setSelectedItemId={setSelectedItemId}
                    activeTool={activeTool}
                    updateFurnitureItem={updateFurnitureItem}
                    layers={layers}
                  />
                ) : (
                  <ThreeDVisualization
                    roomDimensions={roomDimensions}
                    roomShape={roomShape}
                    wallColor={wallColor}
                    floorColor={floorColor}
                    floorType={floorType}
                    furnitureItems={furnitureItems}
                    selectedItemId={isPreviewMode ? null : selectedItemId}
                    setSelectedItemId={setSelectedItemId}
                    activeTool={activeTool}
                    updateFurnitureItem={updateFurnitureItem}
                    layers={layers}
                    glossiness={glossiness / 100}
                    textureScale={textureScale / 50}
                    isPreviewMode={isPreviewMode}
                    isCameraRotationLocked={isCameraRotationLocked}
                  />
                )}
              </ViewTransition>
              <ViewIndicator />
            </div>

            {/* Right properties panel */}
            <div className={cn("w-72 border-l overflow-y-auto bg-creamy-almond", isPreviewMode && "hidden")}>
              <div className="p-4">
                <h3 className="font-medium mb-4 text-charcoal-brown">Properties</h3>

                {activeTool === "select" && selectedItem && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-rich-walnut">Selected Item</h4>
                      <p className="text-sm text-muted-foreground">{selectedItem.name}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-rich-walnut">Position</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="pos-x" className="text-xs">
                            X
                          </Label>
                          <Input
                            id="pos-x"
                            value={selectedItem.position.x.toString()}
                            onChange={(e) => handlePositionChange("x", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pos-y" className="text-xs">
                            Y
                          </Label>
                          <Input
                            id="pos-y"
                            value={selectedItem.position.y.toString()}
                            onChange={(e) => handlePositionChange("y", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pos-z" className="text-xs">
                            Z
                          </Label>
                          <Input
                            id="pos-z"
                            value={selectedItem.position.z.toString()}
                            onChange={(e) => handlePositionChange("z", e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-rich-walnut">Dimensions</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="dim-w" className="text-xs">
                            Width
                          </Label>
                          <Input
                            id="dim-w"
                            value={selectedItem.dimensions.width.toString()}
                            onChange={(e) => handleDimensionChange("width", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dim-d" className="text-xs">
                            Depth
                          </Label>
                          <Input
                            id="dim-d"
                            value={selectedItem.dimensions.depth.toString()}
                            onChange={(e) => handleDimensionChange("depth", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dim-h" className="text-xs">
                            Height
                          </Label>
                          <Input
                            id="dim-h"
                            value={selectedItem.dimensions.height.toString()}
                            onChange={(e) => handleDimensionChange("height", e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-rich-walnut">Rotation</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="rot-x" className="text-xs">
                            X
                          </Label>
                          <Input
                            id="rot-x"
                            value={selectedItem.rotation.x.toString()}
                            onChange={(e) => handleRotationChange("x", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rot-y" className="text-xs">
                            Y
                          </Label>
                          <Input
                            id="rot-y"
                            value={selectedItem.rotation.y.toString()}
                            onChange={(e) => handleRotationChange("y", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rot-z" className="text-xs">
                            Z
                          </Label>
                          <Input
                            id="rot-z"
                            value={selectedItem.rotation.z.toString()}
                            onChange={(e) => handleRotationChange("z", e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTool === "scale" && selectedItem && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Scale Item</h4>
                      <p className="text-sm text-muted-foreground">{selectedItem.name}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">Scale Factor</h4>
                        <span className="text-xs text-muted-foreground">1.0x</span>
                      </div>
                      <Slider
                        defaultValue={[1]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={(value) => handleScaleChange(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.5x</span>
                        <span>2.0x</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Dimensions</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="dim-w" className="text-xs">
                            Width
                          </Label>
                          <Input
                            id="dim-w"
                            value={selectedItem.dimensions.width.toString()}
                            onChange={(e) => handleDimensionChange("width", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dim-d" className="text-xs">
                            Depth
                          </Label>
                          <Input
                            id="dim-d"
                            value={selectedItem.dimensions.depth.toString()}
                            onChange={(e) => handleDimensionChange("depth", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dim-h" className="text-xs">
                            Height
                          </Label>
                          <Input
                            id="dim-h"
                            value={selectedItem.dimensions.height.toString()}
                            onChange={(e) => handleDimensionChange("height", e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTool === "color" && selectedItem && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Material</h4>
                      <Select value={selectedItem.material} onValueChange={handleMaterialChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fabric">Fabric</SelectItem>
                          <SelectItem value="leather">Leather</SelectItem>
                          <SelectItem value="wood">Wood</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="glass">Glass</SelectItem>
                          <SelectItem value="marble">Marble</SelectItem>
                          <SelectItem value="velvet">Velvet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Color Palette</h4>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={colorPalette === "vibrant" ? "default" : "outline"}
                            onClick={() => setColorPalette("vibrant")}
                            className="text-xs px-2 py-1 h-7"
                          >
                            Vibrant
                          </Button>
                          <Button
                            size="sm"
                            variant={colorPalette === "neutral" ? "default" : "outline"}
                            onClick={() => setColorPalette("neutral")}
                            className="text-xs px-2 py-1 h-7"
                          >
                            Neutral
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {currentColorPalette.map((color) => (
                          <div
                            key={color}
                            className={cn(
                              "h-8 w-8 rounded-md cursor-pointer border",
                              color === "#EFEBE9" || color === "#F5F5F5" ? "border-gray-300" : "border-transparent",
                              selectedItem.color === color && "ring-2 ring-rich-walnut ring-offset-2",
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorChange(color)}
                          />
                        ))}
                      </div>

                      <Input
                        type="color"
                        value={selectedItem.color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="h-8 w-full mt-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">Glossiness</h4>
                        <span className="text-xs text-muted-foreground">{glossiness}%</span>
                      </div>
                      <Slider
                        value={[glossiness]}
                        max={100}
                        step={1}
                        onValueChange={(value) => setGlossiness(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Matte</span>
                        <span>Glossy</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">Texture Scale</h4>
                        <span className="text-xs text-muted-foreground">{(textureScale / 50).toFixed(1)}x</span>
                      </div>
                      <Slider
                        value={[textureScale]}
                        max={100}
                        step={1}
                        onValueChange={(value) => setTextureScale(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Fine</span>
                        <span>Coarse</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium mb-2">Material Preview</h4>
                      <div
                        className="h-24 rounded-md border"
                        style={{
                          backgroundColor: selectedItem.color,
                          boxShadow: `inset 0 0 20px rgba(0,0,0,${0.2 + glossiness / 200})`,
                          backgroundImage:
                            selectedItem.material === "wood"
                              ? `url('/textures/hardwood.jpg')`
                              : selectedItem.material === "fabric"
                                ? `url('/textures/fabric.jpg')`
                                : selectedItem.material === "marble"
                                  ? `url('/textures/marble.jpg')`
                                  : "",
                          backgroundSize: `${textureScale * 2}%`,
                          backgroundBlendMode: "multiply",
                          opacity: selectedItem.material === "glass" ? 0.7 : 1,
                        }}
                      />
                    </div>
                  </div>
                )}

                {activeTool === "layers" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Layers</h4>
                      <Button variant="ghost" size="sm" onClick={handleAddLayer}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {layers.map((layer) => (
                        <div
                          key={layer.id}
                          className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted"
                        >
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mr-1"
                              onClick={() => toggleLayerVisibility(layer.id)}
                            >
                              {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <span className="text-sm">{layer.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedItem && activeTool !== "layers" && (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <p>No item selected</p>
                    <p className="text-sm">Click on a furniture item to select it</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Setup Sheet */}
      <Sheet open={showRoomSetup} onOpenChange={setShowRoomSetup}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Room Setup</SheetTitle>
            <SheetDescription>Configure the dimensions and properties of your room.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Room Dimensions</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="room-length" className="text-xs">
                    Length (m)
                  </Label>
                  <Input
                    id="room-length"
                    type="number"
                    value={roomDimensions.length}
                    onChange={(e) => {
                      const val = Number.parseFloat(e.target.value)
                      if (!isNaN(val) && val > 0) {
                        updateRoomDimensions({ ...roomDimensions, length: val })
                      }
                    }}
                    min="1"
                    step="0.1"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="room-width" className="text-xs">
                    Width (m)
                  </Label>
                  <Input
                    id="room-width"
                    type="number"
                    value={roomDimensions.width}
                    onChange={(e) => {
                      const val = Number.parseFloat(e.target.value)
                      if (!isNaN(val) && val > 0) {
                        updateRoomDimensions({ ...roomDimensions, width: val })
                      }
                    }}
                    min="1"
                    step="0.1"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="room-height" className="text-xs">
                    Height (m)
                  </Label>
                  <Input
                    id="room-height"
                    type="number"
                    value={roomDimensions.height}
                    onChange={(e) => {
                      const val = Number.parseFloat(e.target.value)
                      if (!isNaN(val) && val > 0) {
                        updateRoomDimensions({ ...roomDimensions, height: val })
                      }
                    }}
                    min="1"
                    step="0.1"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Room Shape</h3>
              <RadioGroup
                value={roomShape}
                onValueChange={(value) => updateRoomShape(value as "rectangular" | "l-shaped" | "custom")}
              >
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rectangular" id="rectangular" />
                    <Label htmlFor="rectangular">Rectangular</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="l-shaped" id="l-shaped" />
                    <Label htmlFor="l-shaped">L-Shaped</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Wall Color</h3>
              <div className="grid grid-cols-6 gap-2">
                {["#FFFFFF", "#F5F5F5", "#D7CCC8", "#A1887F", "#8D6E63", "#5D4037"].map((color) => (
                  <div
                    key={color}
                    className={cn(
                      "h-8 w-8 rounded-md cursor-pointer border border-gray-300",
                      wallColor === color && "ring-2 ring-rich-walnut ring-offset-2",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => updateWallColor(color)}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={wallColor}
                onChange={(e) => updateWallColor(e.target.value)}
                className="h-9 w-full mt-2"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Floor Type</h3>
              <Select value={floorType} onValueChange={updateFloorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select floor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hardwood">Hardwood</SelectItem>
                  <SelectItem value="carpet">Carpet</SelectItem>
                  <SelectItem value="tile">Tile</SelectItem>
                  <SelectItem value="laminate">Laminate</SelectItem>
                  <SelectItem value="concrete">Concrete</SelectItem>
                  <SelectItem value="marble">Marble</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Floor Color</h3>
              <div className="grid grid-cols-6 gap-2">
                {["#5D4037", "#8D6E63", "#A1887F", "#D7CCC8", "#EFEBE9", "#3E2723"].map((color) => (
                  <div
                    key={color}
                    className={cn(
                      "h-8 w-8 rounded-md cursor-pointer border border-transparent",
                      floorColor === color && "ring-2 ring-rich-walnut ring-offset-2",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => updateFloorColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRoomSetup(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowRoomSetup(false)}>Apply Changes</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Furniture Catalog Sheet */}
      <Sheet open={showFurnitureCatalog} onOpenChange={setShowFurnitureCatalog}>
        <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
          <FurnitureCatalog onSelectFurniture={handleAddFromCatalog} onClose={() => setShowFurnitureCatalog(false)} />
        </SheetContent>
      </Sheet>

      {/* Furniture Recommendations Sheet */}
      <Sheet open={showRecommendations} onOpenChange={setShowRecommendations}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
          <FurnitureRecommendations
            roomDimensions={roomDimensions}
            onSelectRecommendation={handleAddFromRecommendations}
            onClose={() => setShowRecommendations(false)}
          />
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  )
}
