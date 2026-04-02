// HeroScene3D.jsx - Ultra Premium Luxury Hotel Scene
import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Environment,
  PerspectiveCamera,
  Float,
  Text,
  MeshReflectorMaterial,
  Sparkles,
  Stars
} from '@react-three/drei'
import * as THREE from 'three'

// The breathtaking infinite water/marble reflection
function ReflectionPool() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={80}
        roughness={0.1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050a14"
        metalness={0.8}
      />
    </mesh>
  )
}

// A majestic abstract glass & gold pavilion
function LuxuryPavilion() {
  const ringRef = useRef()
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group position={[0, -2, -10]}>
      {/* Central Platform */}
      <mesh receiveShadow castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[12, 12.5, 0.4, 64]} />
        <meshStandardMaterial color="#080808" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Glowing Edge */}
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11.6, 11.8, 64]} />
        <meshStandardMaterial color="#c9a227" emissive="#c9a227" emissiveIntensity={2} side={THREE.DoubleSide} />
      </mesh>

      {/* Glass Pillars */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(angle) * 10, 6, Math.sin(angle) * 10]} rotation={[0, -angle, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.6, 12, 2]} />
              <meshPhysicalMaterial 
                color="#ffffff" 
                metalness={0.9} 
                roughness={0.05} 
                transmission={0.9} 
                thickness={1} 
                clearcoat={1}
              />
            </mesh>
            <mesh position={[0, 6, 0]}>
              <boxGeometry args={[0.8, 0.2, 2.2]} />
              <meshStandardMaterial color="#c9a227" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0, -6, 0]}>
              <boxGeometry args={[0.8, 0.2, 2.2]} />
              <meshStandardMaterial color="#c9a227" metalness={1} roughness={0.2} />
            </mesh>
          </group>
        )
      })}

      {/* Majestic Floating Core Art */}
      <Float speed={2} floatIntensity={0.5} floatingRange={[-0.5, 0.5]}>
        <group position={[0, 7, 0]}>
          <mesh>
            <octahedronGeometry args={[2.5, 0]} />
            <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} wireframe />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshStandardMaterial color="#c9a227" emissive="#c9a227" emissiveIntensity={1.5} />
          </mesh>
          
          {/* Orbiting rings */}
          <group ref={ringRef}>
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[4, 0.05, 32, 100]} />
              <meshStandardMaterial color="#ffd966" emissive="#ffd966" emissiveIntensity={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 3, 0, 0]}>
              <torusGeometry args={[4, 0.05, 32, 100]} />
              <meshStandardMaterial color="#c9a227" emissive="#c9a227" emissiveIntensity={1} />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  )
}

function FloatingPath() {
  return (
    <group position={[0, -1.8, 0]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={1.5} floatIntensity={0.2} floatingRange={[-0.05, 0.05]} rotationIntensity={0.05}>
          <group position={[0, 0, i * 3.5]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[5, 0.2, 1.8]} />
              <meshStandardMaterial color="#111" metalness={0.6} roughness={0.2} />
            </mesh>
            {/* Edge glow */}
            <mesh position={[0, -0.05, 0]}>
               <boxGeometry args={[4.8, 0.15, 1.6]} />
               <meshStandardMaterial color="#c9a227" emissive="#c9a227" emissiveIntensity={0.8} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  )
}

// Cinematic Camera
function CinematicCamera() {
  const cameraRef = useRef()
  useFrame((state) => {
    if (cameraRef.current) {
      const t = state.clock.elapsedTime
      // Smooth cinematic sweeping motion
      cameraRef.current.position.x = Math.sin(t * 0.05) * 8
      cameraRef.current.position.z = 24 + Math.cos(t * 0.05) * 4
      cameraRef.current.position.y = 1.5 + Math.sin(t * 0.1) * 1.5
      cameraRef.current.lookAt(0, 5, -10)
    }
  })
  return <PerspectiveCamera ref={cameraRef} makeDefault fov={40} />
}

function HeroSceneContent() {
  return (
    <>
      <CinematicCamera />
      
      {/* Deep luxurious atmosphere */}
      <color attach="background" args={['#02040a']} />
      <fog attach="fog" args={['#02040a', 15, 60]} />
      
      {/* Exquisite HDRI Lighting */}
      <Environment preset="night" />
      <ambientLight intensity={0.15} color="#ffffff" />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        color="#fff1e0" 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Dramatic accent lights */}
      <pointLight position={[0, 8, -10]} intensity={3} color="#c9a227" distance={40} decay={2} />
      <pointLight position={[-15, 5, 5]} intensity={1.5} color="#4a7cff" distance={50} />
      <pointLight position={[15, 5, 5]} intensity={1.5} color="#ff8e4a" distance={50} />

      {/* Core Elements */}
      <ReflectionPool />
      <LuxuryPavilion />
      <FloatingPath />
      
      {/* Atmospheric Star field and ethereal dust */}
      <Stars radius={100} depth={50} count={2500} factor={1.2} saturation={0.8} fade speed={0.3} />
      <Sparkles count={400} scale={30} size={0.8} color="#ffd966" opacity={0.5} speed={0.2} position={[0, 6, -5]} />

      {/* Grand Title */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
        <Text
          position={[0, 14, -10]}
          fontSize={3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
          outlineWidth={0.05}
          outlineColor="#c9a227"
        >
          GRAND AZURE
        </Text>
        <Text
          position={[0, 11.5, -10]}
          fontSize={0.8}
          color="#c9a227"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.5}
        >
          EXPERIENCE BEYOND LUXURY
        </Text>
      </Float>
    </>
  )
}

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
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#c9a227" wireframe />
    </mesh>
  )
}

export default function HeroScene3D({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={<Loader />}>
          <HeroSceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}