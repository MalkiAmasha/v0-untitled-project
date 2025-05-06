"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import type { FurnitureItem, RoomDimensions, RoomShape } from "@/lib/types"
import type { Layer } from "@/lib/layer-store"
import * as THREE from "three"

// Update the ThreeDVisualization component to use the ViewSync context
import { useViewSync } from "@/components/view-sync-provider"

// Add a new prop for camera rotation lock
interface ThreeDVisualizationProps {
  roomDimensions: RoomDimensions
  roomShape: RoomShape
  wallColor: string
  floorColor: string
  floorType: string
  furnitureItems: FurnitureItem[]
  selectedItemId: string | null
  setSelectedItemId: (id: string | null) => void
  activeTool: string
  updateFurnitureItem: (id: string, updates: Partial<FurnitureItem>) => void
  layers?: Layer[]
  glossiness?: number
  textureScale?: number
  isPreviewMode?: boolean
  isCameraRotationLocked?: boolean
}

// Update the function signature to include the new prop
export function ThreeDVisualization({
  roomDimensions,
  roomShape,
  wallColor,
  floorColor,
  floorType,
  furnitureItems,
  selectedItemId,
  setSelectedItemId,
  activeTool,
  updateFurnitureItem,
  layers = [],
  glossiness = 0.5,
  textureScale = 1,
  isPreviewMode = false,
  isCameraRotationLocked = false,
}: ThreeDVisualizationProps) {
  // Get the view sync context
  const { syncViewTransform, currentTransform } = useViewSync()

  return (
    <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
      <color attach="background" args={["#f8f7f4"]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <OrbitControls
        makeDefault
        enabled={!isPreviewMode || activeTool !== "select"}
        enableRotate={!isCameraRotationLocked}
        onChange={(e) => {
          // Only sync camera position if it has significantly changed
          if (e.target) {
            const camera = e.target.object
            const newPosition = { x: camera.position.x, y: camera.position.z }
            const newRotation = camera.rotation.y

            // Check if position or rotation has changed significantly
            const positionThreshold = 0.01
            const rotationThreshold = 0.01

            const positionChanged =
              Math.abs(newPosition.x - (currentTransform.position?.x || 0)) > positionThreshold ||
              Math.abs(newPosition.y - (currentTransform.position?.y || 0)) > positionThreshold

            const rotationChanged = Math.abs(newRotation - (currentTransform.rotation || 0)) > rotationThreshold

            // Only sync if there's a significant change
            if (positionChanged || rotationChanged) {
              syncViewTransform({
                position: newPosition,
                rotation: newRotation,
              })
            }
          }
        }}
      />

      <Scene
        roomDimensions={roomDimensions}
        roomShape={roomShape}
        wallColor={wallColor}
        floorColor={floorColor}
        floorType={floorType}
        furnitureItems={furnitureItems}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        activeTool={activeTool}
        updateFurnitureItem={updateFurnitureItem}
        layers={layers}
        glossiness={glossiness}
        textureScale={textureScale}
        isPreviewMode={isPreviewMode}
      />
    </Canvas>
  )
}

// Update the Scene component to handle view sync
function Scene({
  roomDimensions,
  roomShape,
  wallColor,
  floorColor,
  floorType,
  furnitureItems,
  selectedItemId,
  setSelectedItemId,
  activeTool,
  updateFurnitureItem,
  layers,
  glossiness,
  textureScale,
  isPreviewMode,
}: ThreeDVisualizationProps) {
  const { scene, camera } = useThree()
  const { currentTransform, convertCoordinates } = useViewSync()

  // Get layer visibility
  const isLayerVisible = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId)
    return layer ? layer.visible : true
  }

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const canvas = document.querySelector("canvas")
      if (canvas) {
        canvas.mouseX = event.clientX
        canvas.mouseY = event.clientY
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Create a simple floor
  const floorGeometry = useRef<THREE.PlaneGeometry>(
    new THREE.PlaneGeometry(roomDimensions.length, roomDimensions.width),
  )
  const floorMaterial = useRef<THREE.MeshStandardMaterial>(
    new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 1 - glossiness,
      metalness: glossiness * 0.5,
    }),
  )

  // Update floor when dimensions or color change
  useEffect(() => {
    floorGeometry.current.dispose()
    floorGeometry.current = new THREE.PlaneGeometry(roomDimensions.length, roomDimensions.width)

    floorMaterial.current.color.set(floorColor)
    floorMaterial.current.roughness = 1 - glossiness
    floorMaterial.current.metalness = glossiness * 0.5
    floorMaterial.current.needsUpdate = true
  }, [roomDimensions.length, roomDimensions.width, floorColor, glossiness])

  // Handle click on empty space to deselect
  const handleSceneClick = (e: THREE.Event) => {
    // Only deselect if we're clicking on the floor or empty space
    if (e.object.userData.isFloor || !e.object) {
      setSelectedItemId(null)
    }
  }

  const createWalls = () => {
    if (roomShape === "rectangular") {
      return (
        <>
          {/* Back wall */}
          <Wall
            position={[0, roomDimensions.height / 2, -roomDimensions.width / 2]}
            size={[roomDimensions.length, roomDimensions.height, 0.1]}
            color={wallColor}
            glossiness={glossiness}
          />
          {/* Front wall */}
          <Wall
            position={[0, roomDimensions.height / 2, roomDimensions.width / 2]}
            size={[roomDimensions.length, roomDimensions.height, 0.1]}
            color={wallColor}
            glossiness={glossiness}
          />
          {/* Left wall */}
          <Wall
            position={[-roomDimensions.length / 2, roomDimensions.height / 2, 0]}
            size={[0.1, roomDimensions.height, roomDimensions.width]}
            color={wallColor}
            glossiness={glossiness}
          />
          {/* Right wall */}
          <Wall
            position={[roomDimensions.length / 2, roomDimensions.height / 2, 0]}
            size={[0.1, roomDimensions.height, roomDimensions.width]}
            color={wallColor}
            glossiness={glossiness}
          />
        </>
      )
    } else if (roomShape === "l-shaped") {
      const mainLength = roomDimensions.length
      const mainWidth = roomDimensions.width
      const secondaryLength = roomDimensions.length * 0.6
      const secondaryWidth = roomDimensions.width * 0.6

      return (
        <>
          {/* Outer walls */}
          <Wall
            position={[0, roomDimensions.height / 2, -mainWidth / 2]}
            size={[mainLength, roomDimensions.height, 0.1]}
            color={wallColor}
            glossiness={glossiness}
          />
          <Wall
            position={[-mainLength / 2, roomDimensions.height / 2, 0]}
            size={[0.1, roomDimensions.height, mainWidth]}
            color={wallColor}
            glossiness={glossiness}
          />
          <Wall
            position={[mainLength / 2 - secondaryLength / 2, roomDimensions.height / 2, mainWidth / 2]}
            size={[secondaryLength, roomDimensions.height, 0.1]}
            color={wallColor}
            glossiness={glossiness}
          />
          <Wall
            position={[mainLength / 2, roomDimensions.height / 2, 0]}
            size={[0.1, roomDimensions.height, mainWidth - secondaryWidth]}
            color={wallColor}
            glossiness={glossiness}
          />
          <Wall
            position={[0, roomDimensions.height / 2, mainWidth / 2 - secondaryWidth / 2]}
            size={[mainLength - secondaryLength, roomDimensions.height, 0.1]}
            color={wallColor}
            glossiness={glossiness}
          />
        </>
      )
    } else {
      // Custom shape (simplified to octagon)
      const radius = Math.min(roomDimensions.length, roomDimensions.width) / 2
      return Array.from({ length: 8 }).map((_, i) => {
        const angle1 = (i * Math.PI) / 4
        const angle2 = ((i + 1) * Math.PI) / 4

        const x1 = radius * Math.cos(angle1)
        const z1 = radius * Math.sin(angle1)
        const x2 = radius * Math.cos(angle2)
        const z2 = radius * Math.sin(angle2)

        const centerX = (x1 + x2) / 2
        const centerZ = (z1 + z2) / 2

        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2))
        const angle = Math.atan2(z2 - z1, x2 - x1)

        return (
          <Wall
            key={i}
            position={[centerX, roomDimensions.height / 2, centerZ]}
            rotation={[0, angle, 0]}
            size={[length, roomDimensions.height, 0.1]}
            color={wallColor}
            glossiness={glossiness}
          />
        )
      })
    }
  }

  return (
    <>
      {/* Floor */}
      {isLayerVisible("walls-floor") && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={handleSceneClick} userData={{ isFloor: true }}>
          <planeGeometry args={[roomDimensions.length, roomDimensions.width]} />
          <meshStandardMaterial color={floorColor} roughness={1 - glossiness} metalness={glossiness * 0.5} />
        </mesh>
      )}

      {/* Walls */}
      {isLayerVisible("walls-floor") && createWalls()}

      {/* Grid helper */}
      {!isPreviewMode && (
        <gridHelper args={[20, 20, "#888888", "#444444"]} position={[0, 0.01, 0]} rotation={[0, 0, 0]} />
      )}

      {/* Furniture items */}
      {isLayerVisible("furniture") &&
        furnitureItems.map((item) => (
          <FurnitureItemComponent
            key={item.id}
            item={item}
            isSelected={item.id === selectedItemId}
            setSelectedItemId={setSelectedItemId}
            activeTool={activeTool}
            updateFurnitureItem={updateFurnitureItem}
            glossiness={glossiness}
            textureScale={textureScale}
            isPreviewMode={isPreviewMode}
            roomDimensions={roomDimensions}
          />
        ))}
    </>
  )
}

interface WallProps {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  rotation?: [number, number, number]
  glossiness?: number
}

function Wall({ position, size, color, rotation = [0, 0, 0], glossiness = 0.5 }: WallProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={1 - glossiness} metalness={glossiness * 0.3} />
    </mesh>
  )
}

interface FurnitureItemProps {
  item: FurnitureItem
  isSelected: boolean
  setSelectedItemId: (id: string | null) => void
  activeTool: string
  updateFurnitureItem: (id: string, updates: Partial<FurnitureItem>) => void
  glossiness?: number
  textureScale?: number
  isPreviewMode?: boolean
  roomDimensions: RoomDimensions
}

function FurnitureItemComponent({
  item,
  isSelected,
  setSelectedItemId,
  activeTool,
  updateFurnitureItem,
  glossiness = 0.5,
  textureScale = 1,
  isPreviewMode = false,
  roomDimensions,
}: FurnitureItemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { camera, raycaster, gl } = useThree()
  const dragPlaneRef = useRef<THREE.Mesh>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, z: 0 })
  const [scale, setScale] = useState(1)

  // Handle click to select
  const handleClick = (e: THREE.Event) => {
    e.stopPropagation()
    if (!isPreviewMode) {
      setSelectedItemId(item.id)
    }
  }

  // Handle pointer down for dragging
  const handlePointerDown = (e: THREE.Event) => {
    if (activeTool === "select" && isSelected && !isPreviewMode) {
      e.stopPropagation()

      // Calculate intersection with the drag plane
      const mouse = new THREE.Vector2(
        (e.nativeEvent.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(e.nativeEvent.clientY / gl.domElement.clientHeight) * 2 + 1,
      )

      raycaster.setFromCamera(mouse, camera)
      if (dragPlaneRef.current) {
        const intersects = raycaster.intersectObject(dragPlaneRef.current)
        if (intersects.length > 0) {
          // Calculate offset between item position and intersection point
          const point = intersects[0].point
          setDragOffset({
            x: item.position.x - point.x,
            z: item.position.z - point.z,
          })

          setIsDragging(true)
          gl.domElement.style.cursor = "grabbing"
        }
      }
    }
  }

  // Handle pointer up to end dragging
  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false)
      gl.domElement.style.cursor = "auto"
    }
  }

  // Handle pointer move for dragging
  const handlePointerMove = (e: React.MouseEvent) => {
    if (isDragging && dragPlaneRef.current) {
      const mouse = new THREE.Vector2(
        (e.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(e.clientY / gl.domElement.clientHeight) * 2 + 1,
      )

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(dragPlaneRef.current)

      if (intersects.length > 0) {
        const point = intersects[0].point

        // Calculate new position with constraints
        const halfLength = roomDimensions.length / 2
        const halfWidth = roomDimensions.width / 2

        // Calculate the maximum allowed positions based on item dimensions
        const maxX = halfLength - item.dimensions.width / 2
        const minX = -halfLength + item.dimensions.width / 2
        const maxZ = halfWidth - item.dimensions.depth / 2
        const minZ = -halfWidth + item.dimensions.depth / 2

        // Apply constraints
        const newX = Math.max(minX, Math.min(maxX, point.x + dragOffset.x))
        const newZ = Math.max(minZ, Math.min(maxZ, point.z + dragOffset.z))

        updateFurnitureItem(item.id, {
          position: {
            x: newX,
            y: item.position.y,
            z: newZ,
          },
        })
      }
    }
  }

  // Add global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e: MouseEvent) => {
        if (isDragging && dragPlaneRef.current) {
          const mouse = new THREE.Vector2(
            (e.clientX / gl.domElement.clientWidth) * 2 - 1,
            -(e.clientY / gl.domElement.clientHeight) * 2 + 1,
          )

          raycaster.setFromCamera(mouse, camera)
          const intersects = raycaster.intersectObject(dragPlaneRef.current)

          if (intersects.length > 0) {
            const point = intersects[0].point

            // Calculate new position with constraints
            const halfLength = roomDimensions.length / 2
            const halfWidth = roomDimensions.width / 2

            // Calculate the maximum allowed positions based on item dimensions
            const maxX = halfLength - item.dimensions.width / 2
            const minX = -halfLength + item.dimensions.width / 2
            const maxZ = halfWidth - item.dimensions.depth / 2
            const minZ = -halfWidth + item.dimensions.depth / 2

            // Apply constraints
            const newX = Math.max(minX, Math.min(maxX, point.x + dragOffset.x))
            const newZ = Math.max(minZ, Math.min(maxZ, point.z + dragOffset.z))

            updateFurnitureItem(item.id, {
              position: {
                x: newX,
                y: item.position.y,
                z: newZ,
              },
            })
          }
        }
      }

      const handleGlobalUp = () => {
        setIsDragging(false)
        gl.domElement.style.cursor = "auto"
      }

      window.addEventListener("mousemove", handleGlobalMove)
      window.addEventListener("mouseup", handleGlobalUp)

      return () => {
        window.removeEventListener("mousemove", handleGlobalMove)
        window.removeEventListener("mouseup", handleGlobalUp)
      }
    }
  }, [isDragging, dragOffset, gl, raycaster, camera, item.id, updateFurnitureItem, roomDimensions, item.dimensions])

  // Handle rotation when using rotate tool
  const handleRotate = () => {
    if (activeTool === "rotate" && isSelected && !isPreviewMode) {
      // Rotate by 15 degrees
      updateFurnitureItem(item.id, {
        rotation: {
          ...item.rotation,
          y: (item.rotation.y + 15) % 360,
        },
      })
    }
  }

  // Handle scale when using scale tool
  useEffect(() => {
    if (activeTool === "scale" && isSelected) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowUp") {
          setScale((prev) => Math.min(prev + 0.1, 2))
        } else if (e.key === "ArrowDown") {
          setScale((prev) => Math.max(prev - 0.1, 0.5))
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeTool, isSelected])

  // Apply scale when it changes
  useEffect(() => {
    if (scale !== 1 && activeTool === "scale" && isSelected) {
      updateFurnitureItem(item.id, {
        dimensions: {
          width: item.dimensions.width * scale,
          depth: item.dimensions.depth * scale,
          height: item.dimensions.height * scale,
        },
      })
      setScale(1)
    }
  }, [scale, activeTool, isSelected, item.id, item.dimensions, updateFurnitureItem])

  // Create furniture model based on type
  const renderFurnitureModel = () => {
    const { width, depth, height } = item.dimensions

    switch (item.type) {
      case "chair":
        return (
          <group>
            {/* Chair seat */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, height * 0.4, depth]} />
              <meshStandardMaterial
                color={item.color}
                roughness={1 - glossiness}
                metalness={item.material === "metal" ? glossiness * 0.8 : glossiness * 0.2}
              />
            </mesh>

            {/* Chair back */}
            <mesh position={[0, height * 0.6, -depth * 0.4]} castShadow receiveShadow>
              <boxGeometry args={[width, height * 0.8, depth * 0.2]} />
              <meshStandardMaterial
                color={item.color}
                roughness={1 - glossiness}
                metalness={item.material === "metal" ? glossiness * 0.8 : glossiness * 0.2}
              />
            </mesh>

            {/* Chair legs */}
            {[
              [-width * 0.4, -height * 0.2, -depth * 0.4],
              [width * 0.4, -height * 0.2, -depth * 0.4],
              [-width * 0.4, -height * 0.2, depth * 0.4],
              [width * 0.4, -height * 0.2, depth * 0.4],
            ].map((pos, i) => (
              <mesh key={i} position={pos} castShadow>
                <cylinderGeometry args={[0.05, 0.05, height * 0.4]} />
                <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
              </mesh>
            ))}
          </group>
        )

      case "table":
        return (
          <group>
            {/* Table top */}
            <mesh position={[0, height * 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height * 0.1, depth]} />
              <meshStandardMaterial
                color={item.color}
                roughness={1 - glossiness}
                metalness={item.material === "metal" ? glossiness * 0.8 : glossiness * 0.2}
              />
            </mesh>

            {/* Table legs */}
            {[
              [-width * 0.4, 0, -depth * 0.4],
              [width * 0.4, 0, -depth * 0.4],
              [-width * 0.4, 0, depth * 0.4],
              [width * 0.4, 0, depth * 0.4],
            ].map((pos, i) => (
              <mesh key={i} position={pos} castShadow>
                <cylinderGeometry args={[0.1, 0.1, height * 0.9]} />
                <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
              </mesh>
            ))}
          </group>
        )

      case "sofa":
        return (
          <group>
            {/* Sofa base */}
            <mesh position={[0, height * 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height * 0.6, depth]} />
              <meshStandardMaterial
                color={item.color}
                roughness={item.material === "leather" ? 0.7 - glossiness * 0.5 : 0.9 - glossiness * 0.3}
                metalness={glossiness * 0.1}
              />
            </mesh>

            {/* Sofa back */}
            <mesh position={[0, height * 0.7, -depth * 0.4]} castShadow receiveShadow>
              <boxGeometry args={[width, height * 0.6, depth * 0.2]} />
              <meshStandardMaterial
                color={item.color}
                roughness={item.material === "leather" ? 0.7 - glossiness * 0.5 : 0.9 - glossiness * 0.3}
                metalness={glossiness * 0.1}
              />
            </mesh>

            {/* Sofa arms */}
            <mesh position={[-width * 0.45, height * 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.1, height * 0.4, depth]} />
              <meshStandardMaterial
                color={item.color}
                roughness={item.material === "leather" ? 0.7 - glossiness * 0.5 : 0.9 - glossiness * 0.3}
                metalness={glossiness * 0.1}
              />
            </mesh>
            <mesh position={[width * 0.45, height * 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.1, height * 0.4, depth]} />
              <meshStandardMaterial
                color={item.color}
                roughness={item.material === "leather" ? 0.7 - glossiness * 0.5 : 0.9 - glossiness * 0.3}
                metalness={glossiness * 0.1}
              />
            </mesh>

            {/* Sofa legs */}
            {[
              [-width * 0.4, 0, -depth * 0.4],
              [width * 0.4, 0, -depth * 0.4],
              [-width * 0.4, 0, depth * 0.4],
              [width * 0.4, 0, depth * 0.4],
            ].map((pos, i) => (
              <mesh key={i} position={pos} castShadow>
                <cylinderGeometry args={[0.05, 0.05, height * 0.2]} />
                <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
              </mesh>
            ))}
          </group>
        )

      case "storage":
        return (
          <group>
            {/* Storage cabinet */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={item.color}
                roughness={item.material === "wood" ? 0.8 - glossiness * 0.3 : 0.5 - glossiness * 0.4}
                metalness={item.material === "metal" ? glossiness * 0.8 : glossiness * 0.2}
              />
            </mesh>

            {/* Shelves */}
            {[1, 2, 3].map((i) => (
              <mesh key={i} position={[0, height * (i / 4) - height * 0.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.1, 0.05, depth - 0.1]} />
                <meshStandardMaterial color={item.color} opacity={0.5} transparent roughness={0.5} metalness={0.2} />
              </mesh>
            ))}

            {/* Doors */}
            <mesh position={[0, 0, depth * 0.5 + 0.01]} castShadow receiveShadow>
              <planeGeometry args={[width - 0.1, height - 0.1]} />
              <meshStandardMaterial
                color={item.color}
                roughness={item.material === "wood" ? 0.8 - glossiness * 0.3 : 0.5 - glossiness * 0.4}
                metalness={item.material === "metal" ? glossiness * 0.8 : glossiness * 0.2}
              />
            </mesh>

            {/* Handles */}
            <mesh position={[width * 0.2, 0, depth * 0.5 + 0.02]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.2]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
            </mesh>
          </group>
        )

      case "lamp":
        return (
          <group>
            {/* Lamp base */}
            <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[width * 0.3, width * 0.4, 0.2]} />
              <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Lamp pole */}
            <mesh position={[0, height * 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, height]} />
              <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Lamp shade */}
            <mesh position={[0, height, 0]} castShadow receiveShadow>
              <coneGeometry args={[width * 0.5, height * 0.4, 32, 1, true]} />
              <meshStandardMaterial
                color={item.color}
                side={THREE.DoubleSide}
                roughness={0.9 - glossiness * 0.3}
                metalness={glossiness * 0.1}
              />
            </mesh>

            {/* Light */}
            <pointLight position={[0, height * 0.8, 0]} intensity={isSelected ? 1 : 0.5} distance={3} color="#fff9e0" />
          </group>
        )

      case "decor":
        return (
          <group>
            {/* Decorative object (vase) */}
            <mesh position={[0, height * 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[width * 0.3, width * 0.5, height, 32]} />
              <meshStandardMaterial
                color={item.color}
                roughness={item.material === "glass" ? 0.1 : 0.7 - glossiness * 0.5}
                metalness={item.material === "glass" ? 0.9 : glossiness * 0.3}
                transparent={item.material === "glass"}
                opacity={item.material === "glass" ? 0.6 : 1}
              />
            </mesh>
          </group>
        )

      default:
        return (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={item.color}
              roughness={1 - glossiness}
              metalness={item.material === "metal" ? glossiness * 0.8 : glossiness * 0.2}
            />
          </mesh>
        )
    }
  }

  return (
    <>
      {/* Invisible drag plane */}
      <mesh ref={dragPlaneRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group
        ref={groupRef}
        position={[item.position.x, item.position.y, item.position.z]}
        rotation={[
          THREE.MathUtils.degToRad(item.rotation.x),
          THREE.MathUtils.degToRad(item.rotation.y),
          THREE.MathUtils.degToRad(item.rotation.z),
        ]}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerUp}
        onDoubleClick={handleRotate}
      >
        {renderFurnitureModel()}

        {/* Selection outline */}
        {isSelected && !isPreviewMode && (
          <mesh position={[0, item.dimensions.height / 2, 0]}>
            <boxGeometry
              args={[item.dimensions.width + 0.1, item.dimensions.height + 0.1, item.dimensions.depth + 0.1]}
            />
            <meshBasicMaterial color="yellow" wireframe />
          </mesh>
        )}

        {/* Item label */}
        {isSelected && !isPreviewMode && (
          <Html position={[0, item.dimensions.height + 0.3, 0]} center>
            <div className="bg-white px-2 py-1 rounded text-sm font-medium shadow-md">{item.name}</div>
          </Html>
        )}
      </group>
    </>
  )
}
