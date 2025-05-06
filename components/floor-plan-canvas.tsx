"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import type { FurnitureItem, RoomDimensions, RoomShape } from "@/lib/types"
import type { Layer } from "@/lib/layer-store"
import { useViewSync } from "@/components/view-sync-provider"

interface FloorPlanCanvasProps {
  roomDimensions: RoomDimensions
  roomShape: RoomShape
  wallColor: string
  floorColor: string
  furnitureItems: FurnitureItem[]
  selectedItemId: string | null
  setSelectedItemId: (id: string | null) => void
  activeTool: string
  updateFurnitureItem: (id: string, updates: Partial<FurnitureItem>) => void
  layers?: Layer[]
}

export function FloorPlanCanvas({
  roomDimensions,
  roomShape,
  wallColor,
  floorColor,
  furnitureItems,
  selectedItemId,
  setSelectedItemId,
  activeTool,
  updateFurnitureItem,
  layers = [],
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scale, setScale] = useState(50) // pixels per meter
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [scaleValue, setScaleValue] = useState(1)
  const [doorPosition, setDoorPosition] = useState({ x: 0, z: roomDimensions.width / 2 }) // Default door position
  const [doorWidth, setDoorWidth] = useState(1) // Door width in meters
  const [doorRotation, setDoorRotation] = useState(0) // Door rotation in degrees
  const [windowPositions, setWindowPositions] = useState([
    { x: roomDimensions.length / 2, z: 0, width: 1.5, wall: "top" },
    { x: roomDimensions.length, z: roomDimensions.width / 2, width: 1.5, wall: "right" },
  ])

  // Get the view sync context
  const { syncViewTransform, currentTransform, convertCoordinates } = useViewSync()

  // Sync view transform when scale or offset changes
  useEffect(() => {
    // Add a debounce mechanism to prevent too many updates
    const timer = setTimeout(() => {
      syncViewTransform({
        position: { x: offset.x, y: offset.y },
        scale: scale / 50, // Normalize scale
      })
    }, 50) // 50ms debounce

    return () => clearTimeout(timer)
  }, [scale, offset, syncViewTransform])

  // Get layer visibility
  const isLayerVisible = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId)
    return layer ? layer.visible : true
  }

  // Set up canvas size on mount and resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      const width = container.clientWidth
      const height = container.clientHeight

      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      setCanvasSize({ width, height })
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [])

  // Auto-center the room when dimensions change
  useEffect(() => {
    // Center the room in the canvas
    setOffset({ x: 0, y: 0 })

    // Adjust scale to fit the room
    const maxDimension = Math.max(roomDimensions.length, roomDimensions.width)
    const padding = 100 // pixels of padding around the room
    const availableWidth = canvasSize.width - padding * 2
    const availableHeight = canvasSize.height - padding * 2

    const widthScale = availableWidth / maxDimension
    const heightScale = availableHeight / maxDimension
    const newScale = Math.min(widthScale, heightScale)

    if (newScale > 0) {
      setScale(newScale)
    }
  }, [roomDimensions, canvasSize])

  // Convert world coordinates to screen coordinates
  const worldToScreen = (x: number, z: number) => {
    // In 2D view, (0,0) is the center of the room
    return {
      x: (x * scale + offset.x + canvasSize.width / 2) * window.devicePixelRatio,
      y: (z * scale + offset.y + canvasSize.height / 2) * window.devicePixelRatio,
    }
  }

  // Convert screen coordinates to world coordinates
  const screenToWorld = (x: number, y: number) => {
    // Convert from screen to world coordinates, maintaining the same system as 3D
    return {
      x: (x / window.devicePixelRatio - offset.x - canvasSize.width / 2) / scale,
      z: (y / window.devicePixelRatio - offset.y - canvasSize.height / 2) / scale,
    }
  }

  // Draw furniture icons based on type
  const drawFurnitureIcon = (
    ctx: CanvasRenderingContext2D,
    type: string,
    x: number,
    y: number,
    width: number,
    depth: number,
    rotation: number,
    color: string,
    isSelected: boolean,
  ) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)

    const strokeColor = isSelected ? "#ff9800" : "#333333"
    const lineWidth = isSelected ? 3 : 1.5

    ctx.strokeStyle = strokeColor
    ctx.lineWidth = lineWidth
    ctx.fillStyle = color

    switch (type) {
      case "chair":
        // Draw a chair with back
        const chairWidth = width
        const chairDepth = depth
        const backWidth = chairWidth * 0.8
        const backDepth = chairDepth * 0.2

        // Chair seat
        ctx.beginPath()
        ctx.rect(-chairWidth / 2, -chairDepth / 2, chairWidth, chairDepth)
        ctx.fill()
        ctx.stroke()

        // Chair back
        ctx.beginPath()
        ctx.rect(-backWidth / 2, -chairDepth / 2 - backDepth, backWidth, backDepth)
        ctx.fill()
        ctx.stroke()

        // Chair legs (small circles)
        ctx.fillStyle = "#666666"
        const legRadius = Math.min(chairWidth, chairDepth) * 0.08
        const legOffsetX = chairWidth * 0.35
        const legOffsetY = chairDepth * 0.35
        ;[
          [-legOffsetX, -legOffsetY],
          [legOffsetX, -legOffsetY],
          [-legOffsetX, legOffsetY],
          [legOffsetX, legOffsetY],
        ].forEach(([lx, ly]) => {
          ctx.beginPath()
          ctx.arc(lx, ly, legRadius, 0, Math.PI * 2)
          ctx.fill()
        })
        break

      case "table":
        // Draw a table
        const tableWidth = width
        const tableDepth = depth

        // Table top
        ctx.beginPath()
        ctx.rect(-tableWidth / 2, -tableDepth / 2, tableWidth, tableDepth)
        ctx.fill()
        ctx.stroke()

        // Table legs
        ctx.fillStyle = "#666666"
        const tableLegRadius = Math.min(tableWidth, tableDepth) * 0.08
        const tableLegOffsetX = tableWidth * 0.4
        const tableLegOffsetY = tableDepth * 0.4
        ;[
          [-tableLegOffsetX, -tableLegOffsetY],
          [tableLegOffsetX, -tableLegOffsetY],
          [-tableLegOffsetX, tableLegOffsetY],
          [tableLegOffsetX, tableLegOffsetY],
        ].forEach(([lx, ly]) => {
          ctx.beginPath()
          ctx.arc(lx, ly, tableLegRadius, 0, Math.PI * 2)
          ctx.fill()
        })
        break

      case "sofa":
        // Draw a sofa
        const sofaWidth = width
        const sofaDepth = depth
        const backDepthSofa = sofaDepth * 0.25
        const armWidth = sofaWidth * 0.1
        const cornerRadius = Math.min(sofaWidth, sofaDepth) * 0.1

        // Sofa base with rounded corners
        ctx.beginPath()
        ctx.moveTo(-sofaWidth / 2 + cornerRadius, -sofaDepth / 2)
        ctx.lineTo(sofaWidth / 2 - cornerRadius, -sofaDepth / 2)
        ctx.arcTo(sofaWidth / 2, -sofaDepth / 2, sofaWidth / 2, -sofaDepth / 2 + cornerRadius, cornerRadius)
        ctx.lineTo(sofaWidth / 2, sofaDepth / 2 - cornerRadius)
        ctx.arcTo(sofaWidth / 2, sofaDepth / 2, sofaWidth / 2 - cornerRadius, sofaDepth / 2, cornerRadius)
        ctx.lineTo(-sofaWidth / 2 + cornerRadius, sofaDepth / 2)
        ctx.arcTo(-sofaWidth / 2, sofaDepth / 2, -sofaWidth / 2, sofaDepth / 2 - cornerRadius, cornerRadius)
        ctx.lineTo(-sofaWidth / 2, -sofaDepth / 2 + cornerRadius)
        ctx.arcTo(-sofaWidth / 2, -sofaDepth / 2, -sofaWidth / 2 + cornerRadius, -sofaDepth / 2, cornerRadius)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Sofa back
        ctx.beginPath()
        ctx.rect(-sofaWidth / 2, -sofaDepth / 2, sofaWidth, backDepthSofa)
        ctx.fill()
        ctx.stroke()

        // Sofa arms
        ctx.beginPath()
        ctx.rect(-sofaWidth / 2, -sofaDepth / 2, armWidth, sofaDepth)
        ctx.rect(sofaWidth / 2 - armWidth, -sofaDepth / 2, armWidth, sofaDepth)
        ctx.fill()
        ctx.stroke()

        // Sofa cushions
        ctx.strokeStyle = isSelected ? "#ff9800" : "#555555"
        ctx.lineWidth = lineWidth * 0.7

        const cushionWidth = (sofaWidth - 2 * armWidth) / 3
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.rect(
            -sofaWidth / 2 + armWidth + i * cushionWidth,
            -sofaDepth / 2 + backDepthSofa,
            cushionWidth,
            sofaDepth - backDepthSofa,
          )
          ctx.stroke()
        }
        break

      case "storage":
        // Draw a storage unit
        const storageWidth = width
        const storageDepth = depth

        // Main cabinet
        ctx.beginPath()
        ctx.rect(-storageWidth / 2, -storageDepth / 2, storageWidth, storageDepth)
        ctx.fill()
        ctx.stroke()

        // Shelves
        ctx.strokeStyle = isSelected ? "#ff9800" : "#555555"
        ctx.lineWidth = lineWidth * 0.7

        const numShelves = 3
        for (let i = 1; i < numShelves; i++) {
          const y = -storageDepth / 2 + (i * storageDepth) / numShelves
          ctx.beginPath()
          ctx.moveTo(-storageWidth / 2, y)
          ctx.lineTo(storageWidth / 2, y)
          ctx.stroke()
        }

        // Doors
        ctx.beginPath()
        ctx.moveTo(0, -storageDepth / 2)
        ctx.lineTo(0, storageDepth / 2)
        ctx.stroke()

        // Handles
        ctx.fillStyle = "#888888"
        ctx.beginPath()
        ctx.arc(-storageWidth * 0.1, 0, storageWidth * 0.03, 0, Math.PI * 2)
        ctx.arc(storageWidth * 0.1, 0, storageWidth * 0.03, 0, Math.PI * 2)
        ctx.fill()
        break

      case "lamp":
        // Draw a lamp
        const lampRadius = Math.min(width, depth) / 2
        const baseRadius = lampRadius * 0.6

        // Lamp shade
        ctx.beginPath()
        ctx.arc(0, 0, lampRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Lamp base
        ctx.fillStyle = "#888888"
        ctx.beginPath()
        ctx.arc(0, 0, baseRadius, 0, Math.PI * 2)
        ctx.fill()

        // Light effect
        if (!isSelected) {
          ctx.fillStyle = "rgba(255, 255, 200, 0.3)"
          ctx.beginPath()
          ctx.arc(0, 0, lampRadius * 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case "decor":
        // Draw decorative item (plant)
        const decorRadius = Math.min(width, depth) / 2
        const potRadius = decorRadius * 0.7
        const potHeight = decorRadius * 0.5

        // Plant foliage
        ctx.beginPath()
        ctx.arc(0, 0, decorRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Plant pot
        ctx.fillStyle = "#a67c52"
        ctx.beginPath()
        ctx.rect(-potRadius, -potRadius, potRadius * 2, potHeight)
        ctx.fill()
        ctx.stroke()

        // Plant details
        ctx.strokeStyle = isSelected ? "#ff9800" : "#006400"
        ctx.lineWidth = lineWidth * 0.7

        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5
          const leafLength = decorRadius * 0.7

          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(Math.cos(angle) * leafLength, Math.sin(angle) * leafLength)
          ctx.stroke()
        }
        break

      default:
        // Default: draw a rectangle
        ctx.beginPath()
        ctx.rect(-width / 2, -depth / 2, width, depth)
        ctx.fill()
        ctx.stroke()
    }

    ctx.restore()
  }

  // Draw the room and furniture
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set high quality rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Background grid (drawn first)
    if (isLayerVisible("measurements")) {
      const gridSize = 0.5 // 0.5 meter grid
      const gridExtent = 20 // meters

      ctx.strokeStyle = "#e5e5e5"
      ctx.lineWidth = 1

      // Draw grid lines
      for (let x = -gridExtent; x <= gridExtent; x += gridSize) {
        const { x: x1, y: y1 } = worldToScreen(x, -gridExtent)
        const { x: x2, y: y2 } = worldToScreen(x, gridExtent)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      for (let z = -gridExtent; z <= gridExtent; z += gridSize) {
        const { x: x1, y: y1 } = worldToScreen(-gridExtent, z)
        const { x: x2, y: y2 } = worldToScreen(gridExtent, z)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }

    // Draw room
    if (isLayerVisible("walls-floor")) {
      // Calculate room dimensions in pixels
      const roomWidthPx = roomDimensions.width * scale
      const roomLengthPx = roomDimensions.length * scale

      // Calculate room position (centered at origin)
      const roomX = (canvasSize.width / 2 + offset.x) * window.devicePixelRatio - roomLengthPx / 2
      const roomY = (canvasSize.height / 2 + offset.y) * window.devicePixelRatio - roomWidthPx / 2

      ctx.fillStyle = floorColor

      if (roomShape === "rectangular") {
        // Rectangular room
        ctx.beginPath()
        ctx.rect(roomX, roomY, roomLengthPx, roomWidthPx)
        ctx.fill()
      } else if (roomShape === "l-shaped") {
        // L-shaped room
        const cutoutWidth = roomWidthPx * 0.4
        const cutoutLength = roomLengthPx * 0.4

        ctx.beginPath()
        ctx.moveTo(roomX, roomY)
        ctx.lineTo(roomX + roomLengthPx, roomY)
        ctx.lineTo(roomX + roomLengthPx, roomY + roomWidthPx - cutoutLength)
        ctx.lineTo(roomX + roomLengthPx - cutoutWidth, roomY + roomWidthPx - cutoutLength)
        ctx.lineTo(roomX + roomLengthPx - cutoutWidth, roomY + roomWidthPx)
        ctx.lineTo(roomX, roomY + roomWidthPx)
        ctx.closePath()
        ctx.fill()
      } else if (roomShape === "custom") {
        // Custom shaped room (octagon)
        const centerX = roomX + roomLengthPx / 2
        const centerY = roomY + roomWidthPx / 2
        const radius = Math.min(roomLengthPx, roomWidthPx) / 2

        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.fill()
      }

      // Walls
      ctx.strokeStyle = wallColor
      ctx.lineWidth = 15
      ctx.lineCap = "square"

      if (roomShape === "rectangular") {
        // Rectangular walls
        ctx.beginPath()
        ctx.rect(roomX, roomY, roomLengthPx, roomWidthPx)
        ctx.stroke()

        // Draw door
        const doorX = roomX + (doorPosition.x + roomDimensions.length / 2) * scale
        const doorY = roomY + (doorPosition.z + roomDimensions.width / 2) * scale
        const doorWidthPx = doorWidth * scale
        const doorThickness = 15
        const doorSwing = 40 // degrees

        // Door opening (gap in wall)
        ctx.strokeStyle = floorColor
        ctx.lineWidth = doorThickness + 2

        ctx.beginPath()
        if (doorPosition.z === -roomDimensions.width / 2) {
          // Door on top wall
          ctx.moveTo(doorX - doorWidthPx / 2, roomY)
          ctx.lineTo(doorX + doorWidthPx / 2, roomY)
        } else if (doorPosition.z === roomDimensions.width / 2) {
          // Door on bottom wall
          ctx.moveTo(doorX - doorWidthPx / 2, roomY + roomWidthPx)
          ctx.lineTo(doorX + doorWidthPx / 2, roomY + roomWidthPx)
        } else if (doorPosition.x === -roomDimensions.length / 2) {
          // Door on left wall
          ctx.moveTo(roomX, doorY - doorWidthPx / 2)
          ctx.lineTo(roomX, doorY + doorWidthPx / 2)
        } else if (doorPosition.x === roomDimensions.length / 2) {
          // Door on right wall
          ctx.moveTo(roomX + roomLengthPx, doorY - doorWidthPx / 2)
          ctx.lineTo(roomX + roomLengthPx, doorY + doorWidthPx / 2)
        }
        ctx.stroke()

        // Door swing
        ctx.strokeStyle = "#888888"
        ctx.lineWidth = 2

        ctx.beginPath()
        if (doorPosition.z === -roomDimensions.width / 2) {
          // Door on top wall
          ctx.moveTo(doorX, roomY)
          ctx.arc(doorX, roomY, doorWidthPx, -Math.PI / 2, -Math.PI / 2 - (doorSwing * Math.PI) / 180, true)
        } else if (doorPosition.z === roomDimensions.width / 2) {
          // Door on bottom wall
          ctx.moveTo(doorX, roomY + roomWidthPx)
          ctx.arc(doorX, roomY + roomWidthPx, doorWidthPx, Math.PI / 2, Math.PI / 2 + (doorSwing * Math.PI) / 180)
        } else if (doorPosition.x === -roomDimensions.length / 2) {
          // Door on left wall
          ctx.moveTo(roomX, doorY)
          ctx.arc(roomX, doorY, doorWidthPx, Math.PI, Math.PI - (doorSwing * Math.PI) / 180, true)
        } else if (doorPosition.x === roomDimensions.length / 2) {
          // Door on right wall
          ctx.moveTo(roomX + roomLengthPx, doorY)
          ctx.arc(roomX + roomLengthPx, doorY, doorWidthPx, 0, (doorSwing * Math.PI) / 180)
        }
        ctx.stroke()

        // Draw windows
        ctx.strokeStyle = "#aaccff"
        ctx.lineWidth = 8

        windowPositions.forEach((window) => {
          const windowWidthPx = window.width * scale
          const windowX = roomX + (window.x + roomDimensions.length / 2) * scale
          const windowY = roomY + (window.z + roomDimensions.width / 2) * scale

          ctx.beginPath()
          if (window.wall === "top") {
            // Window on top wall
            ctx.moveTo(windowX - windowWidthPx / 2, roomY)
            ctx.lineTo(windowX + windowWidthPx / 2, roomY)
          } else if (window.wall === "bottom") {
            // Window on bottom wall
            ctx.moveTo(windowX - windowWidthPx / 2, roomY + roomWidthPx)
            ctx.lineTo(windowX + windowWidthPx / 2, roomY + roomWidthPx)
          } else if (window.wall === "left") {
            // Window on left wall
            ctx.moveTo(roomX, windowY - windowWidthPx / 2)
            ctx.lineTo(roomX, windowY + windowWidthPx / 2)
          } else if (window.wall === "right") {
            // Window on right wall
            ctx.moveTo(roomX + roomLengthPx, windowY - windowWidthPx / 2)
            ctx.lineTo(roomX + roomLengthPx, windowY + windowWidthPx / 2)
          }
          ctx.stroke()

          // Window detail
          ctx.strokeStyle = "#dddddd"
          ctx.lineWidth = 1

          if (window.wall === "top" || window.wall === "bottom") {
            const windowY = window.wall === "top" ? roomY : roomY + roomWidthPx
            const direction = window.wall === "top" ? -1 : 1

            // Window sill
            ctx.beginPath()
            ctx.moveTo(windowX - windowWidthPx / 2, windowY)
            ctx.lineTo(windowX - windowWidthPx / 2, windowY + direction * 5)
            ctx.lineTo(windowX + windowWidthPx / 2, windowY + direction * 5)
            ctx.lineTo(windowX + windowWidthPx / 2, windowY)
            ctx.stroke()
          } else {
            const windowX = window.wall === "left" ? roomX : roomX + roomLengthPx
            const direction = window.wall === "left" ? -1 : 1

            // Window sill
            ctx.beginPath()
            ctx.moveTo(windowX, windowY - windowWidthPx / 2)
            ctx.lineTo(windowX + direction * 5, windowY - windowWidthPx / 2)
            ctx.lineTo(windowX + direction * 5, windowY + windowWidthPx / 2)
            ctx.lineTo(windowX, windowY + windowWidthPx / 2)
            ctx.stroke()
          }
        })
      } else if (roomShape === "l-shaped") {
        // L-shaped walls
        const cutoutWidth = roomWidthPx * 0.4
        const cutoutLength = roomLengthPx * 0.4

        ctx.beginPath()
        ctx.moveTo(roomX, roomY)
        ctx.lineTo(roomX + roomLengthPx, roomY)
        ctx.lineTo(roomX + roomLengthPx, roomY + roomWidthPx - cutoutLength)
        ctx.lineTo(roomX + roomLengthPx - cutoutWidth, roomY + roomWidthPx - cutoutLength)
        ctx.lineTo(roomX + roomLengthPx - cutoutWidth, roomY + roomWidthPx)
        ctx.lineTo(roomX, roomY + roomWidthPx)
        ctx.closePath()
        ctx.stroke()
      } else if (roomShape === "custom") {
        // Custom shaped walls (octagon)
        const centerX = roomX + roomLengthPx / 2
        const centerY = roomY + roomWidthPx / 2
        const radius = Math.min(roomLengthPx, roomWidthPx) / 2

        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.stroke()
      }
    }

    // Draw measurements if enabled
    if (isLayerVisible("measurements")) {
      const roomWidthPx = roomDimensions.width * scale
      const roomLengthPx = roomDimensions.length * scale

      const roomX = (canvasSize.width / 2 + offset.x) * window.devicePixelRatio - roomLengthPx / 2
      const roomY = (canvasSize.height / 2 + offset.y) * window.devicePixelRatio - roomWidthPx / 2

      ctx.fillStyle = "#333333"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Width measurement
      const widthLabelY = roomY - 30
      ctx.beginPath()
      ctx.moveTo(roomX, widthLabelY)
      ctx.lineTo(roomX + roomLengthPx, widthLabelY)
      ctx.strokeStyle = "#333333"
      ctx.lineWidth = 1
      ctx.stroke()

      // Width arrows
      ctx.beginPath()
      ctx.moveTo(roomX, widthLabelY)
      ctx.lineTo(roomX + 10, widthLabelY - 5)
      ctx.lineTo(roomX + 10, widthLabelY + 5)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(roomX + roomLengthPx, widthLabelY)
      ctx.lineTo(roomX + roomLengthPx - 10, widthLabelY - 5)
      ctx.lineTo(roomX + roomLengthPx - 10, widthLabelY + 5)
      ctx.closePath()
      ctx.fill()

      // Width text
      ctx.fillText(`${roomDimensions.length.toFixed(2)}m`, roomX + roomLengthPx / 2, widthLabelY - 15)

      // Length measurement
      const lengthLabelX = roomX - 30
      ctx.beginPath()
      ctx.moveTo(lengthLabelX, roomY)
      ctx.lineTo(lengthLabelX, roomY + roomWidthPx)
      ctx.stroke()

      // Length arrows
      ctx.beginPath()
      ctx.moveTo(lengthLabelX, roomY)
      ctx.lineTo(lengthLabelX - 5, roomY + 10)
      ctx.lineTo(lengthLabelX + 5, roomY + 10)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(lengthLabelX, roomY + roomWidthPx)
      ctx.lineTo(lengthLabelX - 5, roomY + roomWidthPx - 10)
      ctx.lineTo(lengthLabelX + 5, roomY + roomWidthPx - 10)
      ctx.closePath()
      ctx.fill()

      // Length text
      ctx.save()
      ctx.translate(lengthLabelX - 15, roomY + roomWidthPx / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(`${roomDimensions.width.toFixed(2)}m`, 0, 0)
      ctx.restore()
    }

    // Draw furniture items
    if (isLayerVisible("furniture")) {
      // Sort furniture by type to ensure proper layering
      // Draw tables first, then storage, then sofas, then chairs, then lamps and decor
      const sortOrder: Record<string, number> = {
        table: 1,
        storage: 2,
        sofa: 3,
        chair: 4,
        lamp: 5,
        decor: 6,
      }

      const sortedFurniture = [...furnitureItems].sort((a, b) => {
        return (sortOrder[a.type] || 99) - (sortOrder[b.type] || 99)
      })

      // Draw furniture items
      sortedFurniture.forEach((item) => {
        // Convert the item's position to screen coordinates
        const { x, y } = worldToScreen(item.position.x, item.position.z)
        const width = item.dimensions.width * scale
        const depth = item.dimensions.depth * scale
        const rotation = (item.rotation.y * Math.PI) / 180
        const isSelected = item.id === selectedItemId

        drawFurnitureIcon(ctx, item.type, x, y, width, depth, rotation, item.color, isSelected)

        // Draw item name if selected
        if (isSelected) {
          ctx.fillStyle = "#333333"
          ctx.font = "bold 14px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "bottom"
          ctx.fillText(item.name, x, y - depth / 2 - 10)

          // Draw selection highlight
          ctx.strokeStyle = "#ff9800"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 3])

          const selectionSize = Math.max(width, depth) * 1.2
          ctx.beginPath()
          ctx.rect(x - selectionSize / 2, y - selectionSize / 2, selectionSize, selectionSize)
          ctx.stroke()
          ctx.setLineDash([])
        }
      })
    }

    // Draw compass
    const compassRadius = 40
    const compassX = canvas.width - compassRadius - 20
    const compassY = canvas.height - compassRadius - 20

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.beginPath()
    ctx.arc(compassX, compassY, compassRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(compassX, compassY, compassRadius, 0, Math.PI * 2)
    ctx.stroke()

    // North
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(compassX, compassY)
    ctx.lineTo(compassX, compassY - compassRadius * 0.8)
    ctx.stroke()

    // North arrowhead
    ctx.fillStyle = "#333333"
    ctx.beginPath()
    ctx.moveTo(compassX, compassY - compassRadius * 0.8 - 10)
    ctx.lineTo(compassX - 5, compassY - compassRadius * 0.8)
    ctx.lineTo(compassX + 5, compassY - compassRadius * 0.8)
    ctx.closePath()
    ctx.fill()

    // East
    ctx.strokeStyle = "#666666"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(compassX, compassY)
    ctx.lineTo(compassX + compassRadius * 0.8, compassY)
    ctx.stroke()

    // South
    ctx.beginPath()
    ctx.moveTo(compassX, compassY)
    ctx.lineTo(compassX, compassY + compassRadius * 0.8)
    ctx.stroke()

    // West
    ctx.beginPath()
    ctx.moveTo(compassX, compassY)
    ctx.lineTo(compassX - compassRadius * 0.8, compassY)
    ctx.stroke()

    // Labels
    ctx.fillStyle = "#333333"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("N", compassX, compassY - compassRadius * 0.8 - 20)
    ctx.fillText("E", compassX + compassRadius * 0.8 + 10, compassY)
    ctx.fillText("S", compassX, compassY + compassRadius * 0.8 + 10)
    ctx.fillText("W", compassX - compassRadius * 0.8 - 10, compassY)
  }

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setDragStart({ x, y })

    // Check if clicking on a furniture item
    const worldPos = screenToWorld(x * window.devicePixelRatio, y * window.devicePixelRatio)

    let clickedItem: FurnitureItem | null = null

    // Check in reverse order to select items drawn on top first
    for (let i = furnitureItems.length - 1; i >= 0; i--) {
      const item = furnitureItems[i]

      // Transform point to item's local space
      const dx = worldPos.x - item.position.x
      const dz = worldPos.z - item.position.z

      // Rotate point
      const angle = (-item.rotation.y * Math.PI) / 180
      const rotatedX = dx * Math.cos(angle) - dz * Math.sin(angle)
      const rotatedZ = dx * Math.sin(angle) + dz * Math.cos(angle)

      // Check if point is inside item
      if (
        rotatedX >= -item.dimensions.width / 2 &&
        rotatedX <= item.dimensions.width / 2 &&
        rotatedZ >= -item.dimensions.depth / 2 &&
        rotatedZ <= item.dimensions.depth / 2
      ) {
        clickedItem = item
        break
      }
    }

    if (clickedItem) {
      setSelectedItemId(clickedItem.id)

      if (activeTool === "select") {
        setDraggedItemId(clickedItem.id)
        setIsDragging(true)
      } else if (activeTool === "scale" && selectedItemId === clickedItem.id) {
        // Start scaling
        setScaleValue(1)
      }
    } else {
      // If not clicking on an item and using select tool, start panning
      if (activeTool === "select") {
        setIsDragging(true)
      } else {
        setSelectedItemId(null)
      }
    }
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && activeTool !== "scale") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const dx = x - dragStart.x
    const dy = y - dragStart.y

    if (draggedItemId) {
      // Move the selected furniture item
      const item = furnitureItems.find((item) => item.id === draggedItemId)
      if (item) {
        const worldDx = dx / scale
        const worldDz = dy / scale

        // Apply rotation to movement
        const angle = (-item.rotation.y * Math.PI) / 180
        const rotatedDx = worldDx * Math.cos(angle) - worldDz * Math.sin(angle)
        const rotatedDz = worldDx * Math.sin(angle) + worldDz * Math.cos(angle)

        // Calculate new position
        const newX = item.position.x + rotatedDx
        const newZ = item.position.z + rotatedDz

        // Constrain to room boundaries
        const constrainedX = Math.max(
          -roomDimensions.length / 2 + item.dimensions.width / 2,
          Math.min(roomDimensions.length / 2 - item.dimensions.width / 2, newX),
        )

        const constrainedZ = Math.max(
          -roomDimensions.width / 2 + item.dimensions.depth / 2,
          Math.min(roomDimensions.width / 2 - item.dimensions.depth / 2, newZ),
        )

        updateFurnitureItem(draggedItemId, {
          position: {
            x: constrainedX,
            y: item.position.y,
            z: constrainedZ,
          },
        })
      }
    } else if (activeTool === "scale" && selectedItemId) {
      // Scale the selected item
      const scaleFactor = 1 + dy / 100
      setScaleValue(scaleFactor)

      const item = furnitureItems.find((item) => item.id === selectedItemId)
      if (item) {
        updateFurnitureItem(selectedItemId, {
          dimensions: {
            width: item.dimensions.width * scaleFactor,
            depth: item.dimensions.depth * scaleFactor,
            height: item.dimensions.height * scaleFactor,
          },
        })
      }
    } else {
      // Pan the view
      setOffset({
        x: offset.x + dx,
        y: offset.y + dy,
      })
    }

    setDragStart({ x, y })
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedItemId(null)
  }

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    const zoomFactor = 1.1
    const zoom = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor

    // Get mouse position
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Convert to world coordinates before zoom
    const worldX = (mouseX - offset.x - canvasSize.width / 2) / scale
    const worldY = (mouseY - offset.y - canvasSize.height / 2) / scale

    // Update scale
    const newScale = scale * zoom

    // Calculate new offset to zoom toward mouse position
    const newOffsetX = mouseX - worldX * newScale - canvasSize.width / 2
    const newOffsetY = mouseY - worldY * newScale - canvasSize.height / 2

    setScale(newScale)
    setOffset({ x: newOffsetX, y: newOffsetY })
  }

  // Handle rotation when using rotate tool
  const handleRotate = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "rotate" || !selectedItemId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const item = furnitureItems.find((item) => item.id === selectedItemId)
    if (!item) return

    const { x: itemScreenX, y: itemScreenY } = worldToScreen(item.position.x, item.position.z)
    const itemX = itemScreenX / window.devicePixelRatio
    const itemY = itemScreenY / window.devicePixelRatio

    // Calculate angle between item center and mouse position
    const dx = x - itemX
    const dy = y - itemY
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI

    // Round to nearest 15 degrees for easier placement
    const roundedAngle = Math.round(angle / 15) * 15

    updateFurnitureItem(selectedItemId, {
      rotation: {
        x: item.rotation.x,
        y: roundedAngle,
        z: item.rotation.z,
      },
    })
  }

  // Initialize canvas and start drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Start drawing
    const interval = setInterval(draw, 1000 / 60) // 60 FPS

    return () => {
      clearInterval(interval)
    }
  }, [
    roomDimensions,
    roomShape,
    wallColor,
    floorColor,
    furnitureItems,
    selectedItemId,
    offset,
    scale,
    canvasSize,
    layers,
  ])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={activeTool === "rotate" ? handleRotate : undefined}
    />
  )
}
