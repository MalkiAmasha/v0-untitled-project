"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { RoomShape } from "@/lib/types"

interface RoomSetupProps {
  dimensions: { length: number; width: number; height: number }
  roomShape: RoomShape
  wallColor: string
  floorColor: string
  floorType: string
  onDimensionsChange: (dimensions: { length: number; width: number; height: number }) => void
  onRoomShapeChange: (shape: RoomShape) => void
  onWallColorChange: (color: string) => void
  onFloorColorChange: (color: string) => void
  onFloorTypeChange: (type: string) => void
  onApply: () => void
  onCancel: () => void
}

export function RoomSetup({
  dimensions,
  roomShape,
  wallColor,
  floorColor,
  floorType,
  onDimensionsChange,
  onRoomShapeChange,
  onWallColorChange,
  onFloorColorChange,
  onFloorTypeChange,
  onApply,
  onCancel,
}: RoomSetupProps) {
  // Local state to track changes before applying
  const [localDimensions, setLocalDimensions] = useState(dimensions)
  const [localRoomShape, setLocalRoomShape] = useState(roomShape)
  const [localWallColor, setLocalWallColor] = useState(wallColor)
  const [localFloorColor, setLocalFloorColor] = useState(floorColor)
  const [localFloorType, setLocalFloorType] = useState(floorType)

  // Update local state when props change
  useEffect(() => {
    setLocalDimensions(dimensions)
    setLocalRoomShape(roomShape)
    setLocalWallColor(wallColor)
    setLocalFloorColor(floorColor)
    setLocalFloorType(floorType)
  }, [dimensions, roomShape, wallColor, floorColor, floorType])

  // Handle dimension changes
  const handleDimensionChange = (dimension: "length" | "width" | "height", value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      const newDimensions = { ...localDimensions, [dimension]: numValue }
      setLocalDimensions(newDimensions)
      // Apply changes immediately for real-time preview
      onDimensionsChange(newDimensions)
    }
  }

  // Handle room shape changes
  const handleRoomShapeChange = (shape: string) => {
    const newShape = shape as RoomShape
    setLocalRoomShape(newShape)
    // Apply changes immediately for real-time preview
    onRoomShapeChange(newShape)
  }

  // Handle wall color changes
  const handleWallColorChange = (color: string) => {
    setLocalWallColor(color)
    // Apply changes immediately for real-time preview
    onWallColorChange(color)
  }

  // Handle floor color changes
  const handleFloorColorChange = (color: string) => {
    setLocalFloorColor(color)
    // Apply changes immediately for real-time preview
    onFloorColorChange(color)
  }

  // Handle floor type changes
  const handleFloorTypeChange = (type: string) => {
    setLocalFloorType(type)
    // Apply changes immediately for real-time preview
    onFloorTypeChange(type)
  }

  // Handle apply button click
  const handleApply = () => {
    // All changes have already been applied in real-time
    onApply()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">Room Setup</h2>
        <p className="text-sm text-muted-foreground">Configure the dimensions and properties of your room.</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Room Dimensions</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="length" className="text-xs">
                Length (m)
              </Label>
              <Input
                id="length"
                type="number"
                value={localDimensions.length}
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
                value={localDimensions.width}
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
                value={localDimensions.height}
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
          <h3 className="text-sm font-medium mb-2">Room Shape</h3>
          <RadioGroup value={localRoomShape} onValueChange={handleRoomShapeChange}>
            <div className="flex space-x-4">
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

        <div>
          <h3 className="text-sm font-medium mb-2">Wall Color</h3>
          <div className="grid grid-cols-6 gap-2 mb-2">
            {["#FFFFFF", "#F5F5F5", "#D7CCC8", "#A1887F", "#8D6E63", "#5D4037"].map((color) => (
              <div
                key={color}
                className={cn(
                  "h-8 w-8 rounded-md cursor-pointer border border-gray-300",
                  localWallColor === color && "ring-2 ring-rich-walnut ring-offset-2",
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleWallColorChange(color)}
              />
            ))}
          </div>
          <Input
            type="color"
            value={localWallColor}
            onChange={(e) => handleWallColorChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Floor Type</h3>
          <Select value={localFloorType} onValueChange={handleFloorTypeChange}>
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

        <div>
          <h3 className="text-sm font-medium mb-2">Floor Color</h3>
          <div className="grid grid-cols-6 gap-2">
            {["#5D4037", "#8D6E63", "#A1887F", "#D7CCC8", "#EFEBE9", "#3E2723"].map((color) => (
              <div
                key={color}
                className={cn(
                  "h-8 w-8 rounded-md cursor-pointer border border-gray-300",
                  localFloorColor === color && "ring-2 ring-rich-walnut ring-offset-2",
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleFloorColorChange(color)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleApply}>Apply Changes</Button>
      </div>
    </div>
  )
}
