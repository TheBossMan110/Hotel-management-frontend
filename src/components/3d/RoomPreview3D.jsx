import { useRef, Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Environment, 
  PerspectiveCamera,
  OrbitControls,
  Text,
  ContactShadows,
  Html
} from '@react-three/drei'
import * as THREE from 'three'

// Bed Component
function Bed({ type = 'king' }) {
  const width = type === 'king' ? 2.2 : type === 'queen' ? 1.8 : 1.4
  
  return (
    <group position={[0, 0, -2]}>
      {/* Bed frame */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[width + 0.2, 0.4, 2.4]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>
      
      {/* Mattress */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[width, 0.3, 2.2]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
      </mesh>
      
      {/* Sheets */}
      <mesh position={[0, 0.78, 0.3]} castShadow>
        <boxGeometry args={[width - 0.1, 0.08, 1.5]} />
        <meshStandardMaterial color="#fffef0" roughness={0.9} />
      </mesh>
      
      {/* Pillows */}
      <mesh position={[-0.4, 0.85, -0.8]} castShadow>
        <boxGeometry args={[0.5, 0.15, 0.4]} />
        <meshStandardMaterial color="#fff" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.85, -0.8]} castShadow>
        <boxGeometry args={[0.5, 0.15, 0.4]} />
        <meshStandardMaterial color="#fff" roughness={0.9} />
      </mesh>
      
      {/* Headboard */}
      <mesh position={[0, 1.2, -1.1]} castShadow>
        <boxGeometry args={[width + 0.3, 1.2, 0.15]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>
    </group>
  )
}

// Nightstand
function Nightstand({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.4]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
      {/* Lamp */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <coneGeometry args={[0.15, 0.25, 16, 1, true]} />
        <meshStandardMaterial 
          color="#fff8e7" 
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight position={[0, 0.9, 0]} intensity={0.3} distance={2} color="#fff8e7" />
    </group>
  )
}

// TV Unit
function TVUnit() {
  return (
    <group position={[0, 0, 3]}>
      {/* Cabinet */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[2, 0.5, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} />
      </mesh>
      {/* TV */}
      <mesh position={[0, 1.2, 0.1]} castShadow>
        <boxGeometry args={[1.6, 0.9, 0.05]} />
        <meshStandardMaterial color="#000" roughness={0.3} />
      </mesh>
      {/* TV Screen */}
      <mesh position={[0, 1.2, 0.13]}>
        <planeGeometry args={[1.5, 0.84]} />
        <meshStandardMaterial 
          color="#1a1a3e" 
          emissive="#1a1a3e"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}

// Window with View
function Window() {
  return (
    <group position={[3, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Window frame */}
      <mesh castShadow>
        <boxGeometry args={[3, 2.5, 0.1]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.8, 2.3]} />
        <meshStandardMaterial 
          color="#87ceeb" 
          transparent 
          opacity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Curtains */}
      <mesh position={[-1.6, 0, 0.15]} castShadow>
        <boxGeometry args={[0.3, 2.8, 0.05]} />
        <meshStandardMaterial color="#8b0000" roughness={0.8} />
      </mesh>
      <mesh position={[1.6, 0, 0.15]} castShadow>
        <boxGeometry args={[0.3, 2.8, 0.05]} />
        <meshStandardMaterial color="#8b0000" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Armchair
function Armchair({ position }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.7]} />
        <meshStandardMaterial color="#c9a227" roughness={0.6} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.7, -0.25]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.2]} />
        <meshStandardMaterial color="#c9a227" roughness={0.6} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.35, 0.5, 0.1]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.5]} />
        <meshStandardMaterial color="#c9a227" roughness={0.6} />
      </mesh>
      <mesh position={[0.35, 0.5, 0.1]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.5]} />
        <meshStandardMaterial color="#c9a227" roughness={0.6} />
      </mesh>
    </group>
  )
}

// Room Floor
function RoomFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#8b7355" roughness={0.8} />
    </mesh>
  )
}

// Walls
function Walls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
      </mesh>
      {/* Right wall */}
      <mesh position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Info Hotspot
function Hotspot({ position, label, onClick }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#c9a227" 
          emissive="#c9a227"
          emissiveIntensity={hovered ? 1 : 0.5}
        />
      </mesh>
      {hovered && (
        <Html center distanceFactor={5}>
          <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

// Main Room Scene
function RoomScene({ roomType = 'suite' }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 3, 6]} fov={50} />
      <OrbitControls 
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1, 0]}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={0.6} 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      <Environment preset="apartment" />
      
      {/* Room Structure */}
      <RoomFloor />
      <Walls />
      
      {/* Furniture */}
      <Bed type={roomType === 'suite' ? 'king' : 'queen'} />
      <Nightstand position={[-1.5, 0, -1.5]} />
      <Nightstand position={[1.5, 0, -1.5]} />
      <TVUnit />
      <Window />
      <Armchair position={[-2.5, 0, 1]} />
      
      {/* Hotspots */}
      <Hotspot position={[0, 1.5, -2]} label="Luxury King Bed" />
      <Hotspot position={[0, 1.5, 3]} label="55 inch Smart TV" />
      <Hotspot position={[3, 1.5, 0]} label="Ocean View" />
      
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={5}
      />
    </>
  )
}

// Loading
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#c9a227" wireframe />
    </mesh>
  )
}

export default function RoomPreview3D({ className = '', roomType = 'suite' }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={<Loader />}>
          <RoomScene roomType={roomType} />
        </Suspense>
      </Canvas>
    </div>
  )
}
