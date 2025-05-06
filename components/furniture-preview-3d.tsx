"use client"
import { useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { PresentationControls, Stage } from "@react-three/drei"
import * as THREE from "three"

interface FurniturePreview3DProps {
  type: string
  color: string
  material: string
  dimensions: {
    width: number
    height: number
    depth: number
  }
}

export function FurniturePreview3D({ type, color, material, dimensions }: FurniturePreview3DProps) {
  // Use state to ensure the component only renders on the client
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Only render the Canvas after component is mounted
  useEffect(() => {
    setIsMounted(true)

    // Cleanup function
    return () => {
      setIsMounted(false)
    }
  }, [])

  if (!isMounted) {
    // Return a placeholder while waiting for client-side hydration
    return (
      <div ref={containerRef} className="w-full h-40 bg-gray-50 rounded-md flex items-center justify-center">
        Loading 3D preview...
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-40 bg-gray-50 rounded-md overflow-hidden">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [2, 2, 2], fov: 50 }}>
        <color attach="background" args={["#f8f8f8"]} />
        <PresentationControls
          global
          zoom={0.8}
          rotation={[0, -Math.PI / 4, 0]}
          polar={[0, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <Stage environment="city" intensity={0.5} contactShadow shadows>
            <FurnitureModel type={type} color={color} material={material} dimensions={dimensions} />
          </Stage>
        </PresentationControls>
      </Canvas>
    </div>
  )
}

function FurnitureModel({ type, color, material, dimensions }: FurniturePreview3DProps) {
  const { width, depth, height } = dimensions

  switch (type) {
    case "chair":
      return (
        <group>
          {/* Chair seat */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height * 0.4, depth]} />
            <meshStandardMaterial
              color={color}
              roughness={material === "leather" ? 0.6 : 0.8}
              metalness={material === "metal" ? 0.6 : 0.2}
            />
          </mesh>

          {/* Chair back */}
          <mesh position={[0, height * 0.6, -depth * 0.4]} castShadow receiveShadow>
            <boxGeometry args={[width, height * 0.8, depth * 0.2]} />
            <meshStandardMaterial
              color={color}
              roughness={material === "leather" ? 0.6 : 0.8}
              metalness={material === "metal" ? 0.6 : 0.2}
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
              color={color}
              roughness={material === "glass" ? 0.1 : 0.8}
              metalness={material === "metal" ? 0.6 : 0.2}
              transparent={material === "glass"}
              opacity={material === "glass" ? 0.6 : 1}
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
            <meshStandardMaterial color={color} roughness={material === "leather" ? 0.6 : 0.8} metalness={0.1} />
          </mesh>

          {/* Sofa back */}
          <mesh position={[0, height * 0.7, -depth * 0.4]} castShadow receiveShadow>
            <boxGeometry args={[width, height * 0.6, depth * 0.2]} />
            <meshStandardMaterial color={color} roughness={material === "leather" ? 0.6 : 0.8} metalness={0.1} />
          </mesh>

          {/* Sofa arms */}
          <mesh position={[-width * 0.45, height * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.1, height * 0.4, depth]} />
            <meshStandardMaterial color={color} roughness={material === "leather" ? 0.6 : 0.8} metalness={0.1} />
          </mesh>
          <mesh position={[width * 0.45, height * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.1, height * 0.4, depth]} />
            <meshStandardMaterial color={color} roughness={material === "leather" ? 0.6 : 0.8} metalness={0.1} />
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
              color={color}
              roughness={material === "wood" ? 0.8 : 0.5}
              metalness={material === "metal" ? 0.6 : 0.2}
            />
          </mesh>

          {/* Shelves */}
          {[1, 2, 3].map((i) => (
            <mesh key={i} position={[0, height * (i / 4) - height * 0.25, 0]} castShadow receiveShadow>
              <boxGeometry args={[width - 0.1, 0.05, depth - 0.1]} />
              <meshStandardMaterial color={color} opacity={0.5} transparent roughness={0.5} metalness={0.2} />
            </mesh>
          ))}

          {/* Doors */}
          <mesh position={[0, 0, depth * 0.5 + 0.01]} castShadow receiveShadow>
            <planeGeometry args={[width - 0.1, height - 0.1]} />
            <meshStandardMaterial
              color={color}
              roughness={material === "wood" ? 0.8 : 0.5}
              metalness={material === "metal" ? 0.6 : 0.2}
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
            <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.7} metalness={0.1} />
          </mesh>

          {/* Light */}
          <pointLight position={[0, height * 0.8, 0]} intensity={0.8} distance={3} color="#fff9e0" />
        </group>
      )

    case "decor":
      return (
        <group>
          {/* Decorative object (vase) */}
          <mesh position={[0, height * 0.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[width * 0.3, width * 0.5, height, 32]} />
            <meshStandardMaterial
              color={color}
              roughness={material === "glass" ? 0.1 : 0.7}
              metalness={material === "glass" ? 0.9 : 0.3}
              transparent={material === "glass"}
              opacity={material === "glass" ? 0.6 : 1}
            />
          </mesh>
        </group>
      )

    default:
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={material === "metal" ? 0.6 : 0.2} />
        </mesh>
      )
  }
}
