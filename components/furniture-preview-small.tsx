"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface FurniturePreviewSmallProps {
  type: string
  color: string
  material: string
  dimensions?: { width: number; depth: number; height: number }
  className?: string
}

export function FurniturePreviewSmall({
  type,
  color,
  material,
  dimensions = { width: 1, depth: 1, height: 1 },
  className,
}: FurniturePreviewSmallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const frameIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Setup
    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f5f5f5")
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(2, 2, 2)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 1
    controls.maxDistance = 5
    controls.enablePan = false
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5)
    backLight.position.set(-5, 5, -5)
    scene.add(backLight)

    // Create furniture based on type
    createFurniture(type, color, material, dimensions)

    // Animation loop
    const animate = () => {
      if (!controlsRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return

      frameIdRef.current = requestAnimationFrame(animate)
      controlsRef.current.update()
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
      if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Update furniture when props change
  useEffect(() => {
    if (!sceneRef.current) return

    // Clear existing furniture
    const furnitureGroup = sceneRef.current.getObjectByName("furnitureGroup")
    if (furnitureGroup) {
      sceneRef.current.remove(furnitureGroup)
    }

    // Create new furniture
    createFurniture(type, color, material, dimensions)
  }, [type, color, material, dimensions])

  const createFurniture = (
    type: string,
    color: string,
    material: string,
    dimensions: { width: number; depth: number; height: number },
  ) => {
    if (!sceneRef.current || !cameraRef.current) return

    const scene = sceneRef.current
    const furnitureGroup = new THREE.Group()
    furnitureGroup.name = "furnitureGroup"

    // Create material
    const materialColor = new THREE.Color(color)
    let furnitureMaterial: THREE.Material

    if (material === "glass") {
      furnitureMaterial = new THREE.MeshPhysicalMaterial({
        color: materialColor,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
        transmission: 0.9,
      })
    } else if (material === "metal") {
      furnitureMaterial = new THREE.MeshStandardMaterial({
        color: materialColor,
        metalness: 0.8,
        roughness: 0.2,
      })
    } else {
      // Wood, fabric, ceramic, etc.
      furnitureMaterial = new THREE.MeshStandardMaterial({
        color: materialColor,
        roughness: 0.7,
      })
    }

    // Create geometry based on furniture type
    switch (type) {
      case "sofa": {
        // Base
        const baseGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.4, dimensions.depth)
        const base = new THREE.Mesh(baseGeometry, furnitureMaterial)
        base.position.y = dimensions.height * 0.2
        furnitureGroup.add(base)

        // Back
        const backGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.6, dimensions.depth * 0.2)
        const back = new THREE.Mesh(backGeometry, furnitureMaterial)
        back.position.y = dimensions.height * 0.5
        back.position.z = -dimensions.depth * 0.4
        furnitureGroup.add(back)

        // Arms
        const armGeometry = new THREE.BoxGeometry(dimensions.width * 0.1, dimensions.height * 0.4, dimensions.depth)

        const leftArm = new THREE.Mesh(armGeometry, furnitureMaterial)
        leftArm.position.x = -dimensions.width * 0.45
        leftArm.position.y = dimensions.height * 0.4
        furnitureGroup.add(leftArm)

        const rightArm = new THREE.Mesh(armGeometry, furnitureMaterial)
        rightArm.position.x = dimensions.width * 0.45
        rightArm.position.y = dimensions.height * 0.4
        furnitureGroup.add(rightArm)
        break
      }
      case "chair": {
        // Seat
        const seatGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.1, dimensions.depth)
        const seat = new THREE.Mesh(seatGeometry, furnitureMaterial)
        seat.position.y = dimensions.height * 0.3
        furnitureGroup.add(seat)

        // Back
        const backGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.5, dimensions.depth * 0.1)
        const back = new THREE.Mesh(backGeometry, furnitureMaterial)
        back.position.y = dimensions.height * 0.6
        back.position.z = -dimensions.depth * 0.45
        furnitureGroup.add(back)

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, dimensions.height * 0.3)

        const positions = [
          { x: -dimensions.width * 0.4, z: -dimensions.depth * 0.4 },
          { x: dimensions.width * 0.4, z: -dimensions.depth * 0.4 },
          { x: -dimensions.width * 0.4, z: dimensions.depth * 0.4 },
          { x: dimensions.width * 0.4, z: dimensions.depth * 0.4 },
        ]

        positions.forEach((pos) => {
          const leg = new THREE.Mesh(legGeometry, furnitureMaterial)
          leg.position.set(pos.x, dimensions.height * 0.15, pos.z)
          furnitureGroup.add(leg)
        })
        break
      }
      case "table": {
        // Table top
        const topGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.1, dimensions.depth)
        const top = new THREE.Mesh(topGeometry, furnitureMaterial)
        top.position.y = dimensions.height * 0.95
        furnitureGroup.add(top)

        // Legs
        const legGeometry = new THREE.BoxGeometry(
          dimensions.width * 0.05,
          dimensions.height * 0.9,
          dimensions.depth * 0.05,
        )

        const positions = [
          { x: -dimensions.width * 0.45, z: -dimensions.depth * 0.45 },
          { x: dimensions.width * 0.45, z: -dimensions.depth * 0.45 },
          { x: -dimensions.width * 0.45, z: dimensions.depth * 0.45 },
          { x: dimensions.width * 0.45, z: dimensions.depth * 0.45 },
        ]

        positions.forEach((pos) => {
          const leg = new THREE.Mesh(legGeometry, furnitureMaterial)
          leg.position.set(pos.x, dimensions.height * 0.45, pos.z)
          furnitureGroup.add(leg)
        })
        break
      }
      case "storage": {
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth)
        const body = new THREE.Mesh(bodyGeometry, furnitureMaterial)
        body.position.y = dimensions.height / 2
        furnitureGroup.add(body)

        // Shelves
        const numShelves = 4
        const shelfGeometry = new THREE.BoxGeometry(
          dimensions.width - 0.1,
          dimensions.height * 0.02,
          dimensions.depth - 0.05,
        )

        for (let i = 1; i < numShelves; i++) {
          const shelf = new THREE.Mesh(shelfGeometry, furnitureMaterial)
          shelf.position.y = (i * dimensions.height) / numShelves
          furnitureGroup.add(shelf)
        }
        break
      }
      case "lamp": {
        // Base
        const baseGeometry = new THREE.CylinderGeometry(
          dimensions.width * 0.3,
          dimensions.width * 0.4,
          dimensions.height * 0.1,
        )
        const base = new THREE.Mesh(baseGeometry, furnitureMaterial)
        base.position.y = dimensions.height * 0.05
        furnitureGroup.add(base)

        // Pole
        const poleGeometry = new THREE.CylinderGeometry(
          dimensions.width * 0.05,
          dimensions.width * 0.05,
          dimensions.height * 0.7,
        )
        const pole = new THREE.Mesh(poleGeometry, furnitureMaterial)
        pole.position.y = dimensions.height * 0.4
        furnitureGroup.add(pole)

        // Shade
        const shadeGeometry = new THREE.ConeGeometry(dimensions.width * 0.25, dimensions.height * 0.2, 32, 1, true)
        const shadeMaterial = new THREE.MeshStandardMaterial({
          color: materialColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        })
        const shade = new THREE.Mesh(shadeGeometry, shadeMaterial)
        shade.position.y = dimensions.height * 0.8
        shade.rotation.x = Math.PI
        furnitureGroup.add(shade)
        break
      }
      case "decor": {
        // Simple vase
        const vaseGeometry = new THREE.CylinderGeometry(
          dimensions.width * 0.3,
          dimensions.width * 0.2,
          dimensions.height,
          32,
        )
        const vase = new THREE.Mesh(vaseGeometry, furnitureMaterial)
        vase.position.y = dimensions.height / 2
        furnitureGroup.add(vase)
        break
      }
      default: {
        // Default cube
        const geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth)
        const mesh = new THREE.Mesh(geometry, furnitureMaterial)
        mesh.position.y = dimensions.height / 2
        furnitureGroup.add(mesh)
      }
    }

    // Add to scene
    scene.add(furnitureGroup)

    // Position camera to view the furniture properly
    const box = new THREE.Box3().setFromObject(furnitureGroup)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = cameraRef.current.fov * (Math.PI / 180)
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2))
    cameraDistance *= 1.5 // Add some margin

    cameraRef.current.position.set(center.x + cameraDistance, center.y + cameraDistance / 2, center.z + cameraDistance)
    cameraRef.current.lookAt(center)

    if (controlsRef.current) {
      controlsRef.current.target.copy(center)
      controlsRef.current.update()
    }
  }

  return <div ref={containerRef} className={`w-full h-full ${className || ""}`} />
}
