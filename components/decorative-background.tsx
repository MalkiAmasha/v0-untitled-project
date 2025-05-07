"use client"

import { useEffect, useRef } from "react"

interface DecorativeBackgroundProps {
  variant?: "dots" | "waves" | "grid"
  color?: string
  secondaryColor?: string
  density?: number
  className?: string
}

export function DecorativeBackground({
  variant = "dots",
  color = "rgba(161, 136, 127, 0.1)",
  secondaryColor = "rgba(93, 64, 55, 0.05)",
  density = 20,
  className = "",
}: DecorativeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      if (!canvasRef.current) return
      const canvas = canvasRef.current

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
      drawPattern()
    }

    const drawPattern = () => {
      if (!canvasRef.current) return
      const canvas = canvasRef.current

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (variant === "dots") {
        const spacing = canvas.width / density

        for (let x = spacing / 2; x < canvas.width; x += spacing) {
          for (let y = spacing / 2; y < canvas.height; y += spacing) {
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fillStyle = (x + y) % (spacing * 2) < spacing ? color : secondaryColor
            ctx.fill()
          }
        }
      } else if (variant === "waves") {
        const waveHeight = 15
        const waveCount = Math.ceil(canvas.height / 50)

        for (let i = 0; i < waveCount; i++) {
          ctx.beginPath()
          ctx.moveTo(0, i * 50)

          for (let x = 0; x < canvas.width; x += 10) {
            const y = i * 50 + Math.sin(x / 50) * waveHeight
            ctx.lineTo(x, y)
          }

          ctx.strokeStyle = i % 2 === 0 ? color : secondaryColor
          ctx.lineWidth = 1
          ctx.stroke()
        }
      } else if (variant === "grid") {
        const gridSize = canvas.width / density

        // Draw vertical lines
        for (let x = 0; x <= canvas.width; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.strokeStyle = x % (gridSize * 2) < gridSize ? color : secondaryColor
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Draw horizontal lines
        for (let y = 0; y <= canvas.height; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.strokeStyle = y % (gridSize * 2) < gridSize ? color : secondaryColor
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }

    // Initial setup - make sure parent exists before setting up
    if (canvas.parentElement) {
      resizeCanvas()

      // Add the event listener safely
      const handleResize = () => {
        if (canvasRef.current && canvasRef.current.parentElement) {
          resizeCanvas()
        }
      }

      window.addEventListener("resize", handleResize)

      // Cleanup function
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }

    // If no parent element exists yet, don't set up listeners
    return () => {}
  }, [variant, color, secondaryColor, density])

  return <canvas ref={canvasRef} className={`absolute inset-0 -z-10 opacity-50 pointer-events-none ${className}`} />
}
