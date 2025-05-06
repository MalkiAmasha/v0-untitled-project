"use client"

import { useState, useEffect } from "react"
import { ArrowRight, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { GlossyButton } from "@/components/ui/glossy-button"
import { FurniturePreview3D } from "@/components/furniture-preview-3d"

// Sample recommendation sets
const recommendationSets = [
  {
    id: "modern-living",
    name: "Modern Living Room",
    description: "Clean lines and contemporary style for a modern living space",
    items: [
      {
        id: "rec-sofa-1",
        name: "Modern Sectional Sofa",
        type: "sofa",
        color: "#7a8c98",
        material: "fabric",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 2.8, depth: 1.7, height: 0.8 },
      },
      {
        id: "rec-table-1",
        name: "Glass Coffee Table",
        type: "table",
        color: "#9c8c7c",
        material: "glass",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 1.2, depth: 0.6, height: 0.45 },
      },
      {
        id: "rec-chair-1",
        name: "Accent Chair",
        type: "chair",
        color: "#a89b8c",
        material: "fabric",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 0.8, depth: 0.85, height: 1.0 },
      },
      {
        id: "rec-lighting-1",
        name: "Floor Lamp",
        type: "lighting",
        color: "#6c7c74",
        material: "metal",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 0.4, depth: 0.4, height: 1.6 },
      },
    ],
  },
  {
    id: "cozy-traditional",
    name: "Cozy Traditional",
    description: "Warm and inviting traditional furniture arrangement",
    items: [
      {
        id: "rec-sofa-2",
        name: "Traditional Sofa",
        type: "sofa",
        color: "#a89b8c",
        material: "fabric",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 2.5, depth: 1.5, height: 0.9 },
      },
      {
        id: "rec-table-2",
        name: "Wooden Coffee Table",
        type: "table",
        color: "#9c8c7c",
        material: "wood",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 1.3, depth: 0.7, height: 0.5 },
      },
      {
        id: "rec-chair-2",
        name: "Wingback Chair",
        type: "chair",
        color: "#8a7f72",
        material: "fabric",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 0.9, depth: 0.8, height: 1.1 },
      },
      {
        id: "rec-storage-1",
        name: "Bookshelf",
        type: "storage",
        color: "#9c8c7c",
        material: "wood",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 1.2, depth: 0.4, height: 1.8 },
      },
    ],
  },
  {
    id: "minimalist",
    name: "Minimalist Design",
    description: "Simple, clean, and uncluttered furniture selection",
    items: [
      {
        id: "rec-sofa-3",
        name: "Minimalist Sofa",
        type: "sofa",
        color: "#7a8c98",
        material: "fabric",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 2.2, depth: 1.0, height: 0.7 },
      },
      {
        id: "rec-table-3",
        name: "Simple Coffee Table",
        type: "table",
        color: "#6c7c74",
        material: "wood",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 1.0, depth: 0.6, height: 0.4 },
      },
      {
        id: "rec-chair-3",
        name: "Minimalist Chair",
        type: "chair",
        color: "#d2c8b4",
        material: "fabric",
        thumbnail: "/placeholder.svg?height=100&width=150",
        dimensions: { width: 0.7, depth: 0.7, height: 0.8 },
      },
    ],
  },
]

interface FurnitureRecommendationsProps {
  roomDimensions: { length: number; width: number; height: number }
  onSelectRecommendation: (items: any[]) => void
  onClose: () => void
}

export function FurnitureRecommendations({
  roomDimensions,
  onSelectRecommendation,
  onClose,
}: FurnitureRecommendationsProps) {
  const [selectedSet, setSelectedSet] = useState<string | null>(null)
  const [likedSets, setLikedSets] = useState<string[]>([])
  const [dislikedSets, setDislikedSets] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle liking a recommendation set
  const handleLike = (setId: string) => {
    setLikedSets((prev) => [...prev.filter((id) => id !== setId), setId])
    setDislikedSets((prev) => prev.filter((id) => id !== setId))
  }

  // Handle disliking a recommendation set
  const handleDislike = (setId: string) => {
    setDislikedSets((prev) => [...prev.filter((id) => id !== setId), setId])
    setLikedSets((prev) => prev.filter((id) => id !== setId))
  }

  // Handle selecting a recommendation set
  const handleSelectSet = (setId: string) => {
    setSelectedSet(setId)
  }

  // Handle applying the selected recommendation set
  const handleApplyRecommendation = () => {
    if (!selectedSet) return

    const set = recommendationSets.find((s) => s.id === selectedSet)
    if (!set) return

    // Convert recommendation items to furniture items
    const furnitureItems = set.items.map((item, index) => {
      // Calculate positions to spread items across the room
      const xPos = roomDimensions.length / 2 + (index % 2 === 0 ? -1 : 1) * (index * 0.5)
      const zPos = roomDimensions.width / 2 + (index % 3 === 0 ? -1 : 1) * (index * 0.3)

      return {
        id: `furniture-${Date.now()}-${item.id}`,
        type: item.type,
        name: item.name,
        position: { x: xPos, y: 0, z: zPos },
        dimensions: item.dimensions || { width: 1, depth: 1, height: 1 }, // Use provided dimensions or defaults
        rotation: { x: 0, y: 0, z: 0 },
        color: item.color,
        material: item.material,
      }
    })

    onSelectRecommendation(furnitureItems)
  }

  return (
    <div className="flex flex-col h-full bg-light-sand-beige">
      <div className="flex items-center justify-between p-4 border-b bg-creamy-almond">
        <h2 className="text-xl font-semibold text-charcoal-brown">Recommended Furniture Sets</h2>
        <GlossyButton onClick={onClose} className="min-w-[100px]">
          Close
        </GlossyButton>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <p className="text-sm text-muted-foreground mb-4">
          Based on your room dimensions ({roomDimensions.length}m × {roomDimensions.width}m), here are some furniture
          sets we recommend:
        </p>

        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="grid grid-cols-1 gap-4">
            {recommendationSets.map((set) => (
              <Card
                key={set.id}
                className={cn(
                  "overflow-hidden cursor-pointer transition-all",
                  selectedSet === set.id ? "ring-2 ring-rich-walnut" : "",
                  likedSets.includes(set.id) ? "border-green-200 bg-green-50" : "",
                  dislikedSets.includes(set.id) ? "border-red-200 bg-red-50" : "",
                )}
                onClick={() => handleSelectSet(set.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium flex items-center text-rich-walnut">
                        {set.name}
                        {likedSets.includes(set.id) && <Sparkles className="h-4 w-4 ml-2 text-green-500" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{set.description}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-full",
                          likedSets.includes(set.id) ? "bg-green-100 text-green-600" : "",
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(set.id)
                        }}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-full",
                          dislikedSets.includes(set.id) ? "bg-red-100 text-red-600" : "",
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDislike(set.id)
                        }}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {set.items.map((item) => (
                      <div key={item.id} className="text-center">
                        <div className="relative mb-1 h-24">
                          {isClient && (
                            <FurniturePreview3D
                              type={item.type}
                              color={item.color}
                              material={item.material}
                              dimensions={item.dimensions || { width: 1, depth: 1, height: 1 }}
                            />
                          )}
                          <div
                            className="absolute bottom-0 right-0 w-4 h-4 rounded-full border border-white"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                        <p className="text-xs truncate">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleApplyRecommendation} disabled={!selectedSet} className="gap-2">
            Apply to Room
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
