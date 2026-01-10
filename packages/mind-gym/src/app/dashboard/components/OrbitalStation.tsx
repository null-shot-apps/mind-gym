'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Line } from '@react-three/drei';
import * as THREE from 'three';

// Earth component
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={earthRef} position={[0, -15, -30]}>
      <sphereGeometry args={[8, 64, 64]} />
      <meshStandardMaterial
        color="#1e40af"
        emissive="#1e3a8a"
        emissiveIntensity={0.3}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

// Glass Dome
function GlassDome() {
  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <sphereGeometry args={[20, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial
        color="#00d9ff"
        transparent
        opacity={0.1}
        roughness={0}
        metalness={0.1}
        transmission={0.9}
        thickness={0.5}
      />
    </mesh>
  );
}

// Training Pod
function TrainingPod({ position, color, streak }: { position: [number, number, number], color: string, streak: number }) {
  const podRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (podRef.current) {
      podRef.current.rotation.y += 0.01;
      podRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Glow */}
      <pointLight color={color} intensity={2} distance={5} />
      
      {/* Pod */}
      <mesh ref={podRef}>
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Top cap */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

// Power Core (central sphere)
function PowerCore({ streak }: { streak: number }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.x += 0.005;
      coreRef.current.rotation.y += 0.01;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const coreColor = streak > 3 ? '#00d9ff' : '#ff6b00';

  return (
    <group position={[0, 2, -5]}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={1}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Point light */}
      <pointLight color={coreColor} intensity={3} distance={10} />
    </group>
  );
}

// Neural Pathway (connecting lines)
function NeuralPathway({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3((start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 1, (start[2] + end[2]) / 2),
      new THREE.Vector3(...end),
    ]);
    return curve.getPoints(50);
  }, [start, end]);

  return (
    <Line
      points={points}
      color="#00d9ff"
      lineWidth={2}
      transparent
      opacity={0.4}
    />
  );
}

// Stars
function Stars() {
  const starsRef = useRef<THREE.Points>(null);
  
  const starPositions = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Satellite
function Satellite() {
  const satelliteRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (satelliteRef.current) {
      const time = state.clock.elapsedTime * 0.2;
      satelliteRef.current.position.x = Math.cos(time) * 25;
      satelliteRef.current.position.z = Math.sin(time) * 25 - 20;
      satelliteRef.current.position.y = Math.sin(time * 2) * 5 - 10;
      satelliteRef.current.rotation.y = time;
    }
  });

  return (
    <group ref={satelliteRef}>
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.5]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.05, 1.2]} />
        <meshStandardMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.05, 1.2]} />
        <meshStandardMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.5} />
      </mesh>
      <pointLight color="#ff0000" intensity={0.5} distance={2} />
    </group>
  );
}

// Main Scene
function Scene({ streak }: { streak: number }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#00d9ff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#0066ff" />
      
      {/* Environment */}
      <Stars />
      <Earth />
      <GlassDome />
      <Satellite />
      
      {/* Power Core */}
      <PowerCore streak={streak} />
      
      {/* Training Pods */}
      <TrainingPod position={[-4, 1, -3]} color="#a855f7" streak={streak} />
      <TrainingPod position={[4, 1, -3]} color="#f97316" streak={streak} />
      <TrainingPod position={[-6, 1, -6]} color="#ffffff" streak={streak} />
      <TrainingPod position={[6, 1, -6]} color="#00d9ff" streak={streak} />
      <TrainingPod position={[0, 1, -8]} color="#22c55e" streak={streak} />
      
      {/* Neural Pathways */}
      <NeuralPathway start={[-4, 1, -3]} end={[0, 2, -5]} />
      <NeuralPathway start={[4, 1, -3]} end={[0, 2, -5]} />
      <NeuralPathway start={[-6, 1, -6]} end={[0, 2, -5]} />
      <NeuralPathway start={[6, 1, -6]} end={[0, 2, -5]} />
      <NeuralPathway start={[0, 1, -8]} end={[0, 2, -5]} />
      
      {/* Orbital rings */}
      <Torus args={[15, 0.05, 16, 100]} position={[0, -10, -25]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.5} />
      </Torus>
      
      {/* Camera Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Main Component
export default function OrbitalStation({ streak }: { streak: number }) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 10, 50]} />
        <Scene streak={streak} />
      </Canvas>
    </div>
  );
}

