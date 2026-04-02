// HotelLobby3D.jsx - Grand Interior with Rotating Rounded Cube
import { useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  PerspectiveCamera,
  MeshReflectorMaterial,
  Float,
  Text,
  RoundedBox,
  Environment
} from '@react-three/drei'
import * as THREE from 'three'

// Rotating Background Element - Elegant Rounded Cube with Wireframe
function RotatingBackgroundCube() {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group position={[0, 5, -18]}>
      <mesh ref={meshRef}>
        <RoundedBox args={[3.5, 3.5, 3.5]} radius={0.5} smoothness={4}>
          <meshStandardMaterial
            color="#c9a227"
            wireframe
            transparent
            opacity={0.2}
            emissive="#c9a227"
            emissiveIntensity={0.4}
          />
        </RoundedBox>
      </mesh>
      {/* Inner glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[1.2, 2.2, 64]} />
        <meshStandardMaterial
          color="#f7d460"
          emissive="#f7d460"
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// Luxurious Floating Dust Particles
function Particles() {
  const ref = useRef()
  const count = 400

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      array[i * 3] = (Math.random() - 0.5) * 40
      array[i * 3 + 1] = Math.random() * 20
      array[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return array
  }, [count])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.5
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#f7d460"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// Elegant Abstract Chandelier made of glowing rings
function ModernChandelier() {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15
      groupRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map((ring) => (
        <mesh key={ring} position={[0, -ring * 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4 - ring * 0.8, 0.08, 16, 100]} />
          <meshStandardMaterial color="#c9a227" emissive="#c9a227" emissiveIntensity={2} />
        </mesh>
      ))}
      <pointLight position={[0, -2, 0]} intensity={1.5} color="#f7d460" distance={25} decay={2} />
    </group>
  )
}

// The Grand Atrium Architecture
function GrandAtrium() {
  return (
    <group position={[0, -2, 0]}>
      {/* Super Reflective Marble Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={80}
          roughness={0.15}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050508"
          metalness={0.8}
        />
      </mesh>

      {/* Circular array of majestic dark pillars */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 12
        return (
          <group key={i} position={[Math.cos(angle) * radius, 6, Math.sin(angle) * radius]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.6, 0.6, 12, 32]} />
              <meshStandardMaterial color="#0a0a0f" roughness={0.2} metalness={0.5} />
            </mesh>
            {/* Golden sconce on each pillar facing inward */}
            <mesh position={[-Math.cos(angle) * 0.6, -2, -Math.sin(angle) * 0.6]}>
              <boxGeometry args={[0.2, 1.5, 0.2]} />
              <meshStandardMaterial color="#c9a227" emissive="#c9a227" emissiveIntensity={3} />
              <pointLight color="#f7d460" intensity={0.5} distance={12} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// Main Scene
function LobbyScene() {
  const cameraRef = useRef()

  useFrame((state) => {
    if (cameraRef.current) {
      const t = state.clock.elapsedTime
      // Cinematic slow orbit around the grand atrium
      const radius = 18
      cameraRef.current.position.x = Math.sin(t * 0.05) * radius
      cameraRef.current.position.z = Math.cos(t * 0.05) * radius
      cameraRef.current.position.y = 3 + Math.sin(t * 0.1) * 1
      cameraRef.current.lookAt(0, 4, 0)
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={50} />

      {/* Deep cinematic atmosphere */}
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 10, 40]} />

      {/* Subtle global lighting to expose shapes */}
      <ambientLight intensity={0.15} color="#ffffff" />
      <Environment preset="night" background={false} />

      <GrandAtrium />
      <ModernChandelier />
      <Particles />
      <RotatingBackgroundCube />

      {/* Grand Title floating in the center */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
        <Text
          position={[0, 4, 0]}
          fontSize={1.5}
          color="#c9a227"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#020205"
        >
          GRAND AZURE
        </Text>
      </Float>
    </>
  )
}

// Loading Fallback
function Loader() {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#c9a227" wireframe />
    </mesh>
  )
}

export default function HotelLobby3D({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={<Loader />}>
          <LobbyScene />
        </Suspense>
      </Canvas>
    </div>
  )
}