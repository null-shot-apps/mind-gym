'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Earth component with realistic atmosphere
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001; // Slow rotation
    }
  });

  return (
    <group position={[0, -8, -30]}>
      {/* Earth sphere */}
      <Sphere ref={earthRef} args={[8, 64, 64]}>
        <meshStandardMaterial
          color="#1e4d7b"
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Sphere args={[8.3, 64, 64]}>
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Outer atmosphere */}
      <Sphere args={[8.6, 64, 64]}>
        <meshBasicMaterial
          color="#6bb6ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}

// Glass Gym Facility
function GlassGym() {
  const gymRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (gymRef.current) {
      gymRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={gymRef} position={[0, 0, -10]}>
      {/* Main dome structure */}
      <Sphere args={[3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.9}
          transmission={0.9}
          thickness={0.5}
        />
      </Sphere>
      
      {/* Glass panels - vertical */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`panel-v-${i}`}
            position={[
              Math.cos(angle) * 3,
              0,
              Math.sin(angle) * 3
            ]}
            rotation={[0, angle, 0]}
          >
            <planeGeometry args={[0.1, 3]} />
            <meshPhysicalMaterial
              color="#00d9ff"
              transparent
              opacity={0.3}
              emissive="#00d9ff"
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
      
      {/* Energy paths - horizontal rings */}
      {[0.5, 1.5, 2.5].map((y, i) => (
        <mesh key={`ring-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.8, 0.02, 16, 100]} />
          <meshBasicMaterial
            color="#00d9ff"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      
      {/* Central core */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 3, 32]} />
        <meshPhysicalMaterial
          color="#00d9ff"
          transparent
          opacity={0.4}
          emissive="#00d9ff"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

// Cosmic particles
function CosmicDust() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);
  
  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Stars background
function Stars() {
  const starsRef = useRef<THREE.Points>(null);
  
  const stars = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return positions;
  }, []);

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={stars.length / 3}
          array={stars}
          itemSize={3}
          args={[stars, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.8}
      />
    </points>
  );
}

// Camera controller
function CameraController({ progress }: { progress: { value: number } }) {
  useFrame((state) => {
    const t = progress.value;
    // Move camera from distant view to close-up
    state.camera.position.z = 20 - t * 15;
    state.camera.position.y = 5 - t * 3;
    state.camera.lookAt(0, 0, -10);
  });
  
  return null;
}

interface SpaceSceneProps {
  cameraProgress: { value: number };
}

export default function SpaceScene({ cameraProgress }: SpaceSceneProps) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 5, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[0, 0, -10]} intensity={2} color="#00d9ff" />
        
        {/* Scene elements */}
        <Stars />
        <CosmicDust />
        <Earth />
        <GlassGym />
        
        {/* Camera animation */}
        <CameraController progress={cameraProgress} />
      </Canvas>
    </div>
  );
}


