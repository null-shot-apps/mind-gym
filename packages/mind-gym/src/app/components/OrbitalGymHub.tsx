'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Sphere, Environment } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Earth component
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <mesh ref={earthRef} position={[0, -50, -200]}>
      <sphereGeometry args={[40, 64, 64]} />
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
      <sphereGeometry args={[80, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial
        color="#0ea5e9"
        transparent
        opacity={0.1}
        roughness={0.1}
        metalness={0.9}
        transmission={0.95}
        thickness={0.5}
      />
    </mesh>
  );
}

// Training Pod
function TrainingPod({ position, color, label, glowIntensity = 1 }: { 
  position: [number, number, number]; 
  color: string; 
  label: string;
  glowIntensity?: number;
}) {
  const podRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (podRef.current) {
      podRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh>
        <cylinderGeometry args={[2.5, 2.5, 6, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
      
      {/* Main pod */}
      <mesh
        ref={podRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered ? 1.05 : 1}
      >
        <cylinderGeometry args={[2, 2, 5, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.3}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={glowIntensity * (hovered ? 1.5 : 1)}
        />
      </mesh>

      {/* Inner core */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 5.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Power Core (Central Sphere)
function PowerCore({ streak = 7 }: { streak?: number }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.01;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.y += 0.005;
      ringsRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const intensity = Math.min(streak / 30, 1);

  return (
    <group position={[0, 5, -10]}>
      {/* Outer rings */}
      <group ref={ringsRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}>
            <torusGeometry args={[5 + i * 1.5, 0.1, 16, 100]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshPhysicalMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={1 + intensity}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

// Neural Pathway
function NeuralPathway({ start, end, color = "#06b6d4" }: { 
  start: [number, number, number]; 
  end: [number, number, number];
  color?: string;
}) {
  const points = [];
  const segments = 20;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = start[0] + (end[0] - start[0]) * t;
    const y = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI) * 2;
    const z = start[2] + (end[2] - start[2]) * t;
    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);

  return (
    <mesh geometry={tubeGeometry}>
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

// Floating Satellite
function Satellite() {
  const satRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (satRef.current) {
      const t = state.clock.elapsedTime * 0.1;
      satRef.current.position.x = Math.cos(t) * 100;
      satRef.current.position.y = Math.sin(t * 0.5) * 30 - 30;
      satRef.current.position.z = Math.sin(t) * 100 - 150;
      satRef.current.rotation.y = t;
    }
  });

  return (
    <group ref={satRef}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-3, 0, 0]}>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#1e293b" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[3, 0, 0]}>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#1e293b" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// 3D Scene
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 25]} fov={75} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        rotateSpeed={0.3}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, -50, -200]} intensity={1} color="#1e40af" distance={200} />
      <pointLight position={[0, 20, 0]} intensity={0.5} color="#06b6d4" />
      <spotLight position={[0, 50, 0]} angle={0.3} penumbra={1} intensity={0.5} color="#06b6d4" />

      {/* Environment */}
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      <Earth />
      <GlassDome />
      <Satellite />

      {/* Power Core */}
      <PowerCore streak={7} />

      {/* Training Pods */}
      <TrainingPod position={[-15, 3, -5]} color="#8b5cf6" label="Memory" glowIntensity={1.2} />
      <TrainingPod position={[15, 3, -5]} color="#ec4899" label="Focus" glowIntensity={0.9} />
      <TrainingPod position={[-10, 3, -20]} color="#f59e0b" label="Speed" glowIntensity={1.0} />
      <TrainingPod position={[10, 3, -20]} color="#10b981" label="Logic" glowIntensity={1.1} />

      {/* Neural Pathways */}
      <NeuralPathway start={[-15, 3, -5]} end={[0, 5, -10]} color="#8b5cf6" />
      <NeuralPathway start={[15, 3, -5]} end={[0, 5, -10]} color="#ec4899" />
      <NeuralPathway start={[-10, 3, -20]} end={[0, 5, -10]} color="#f59e0b" />
      <NeuralPathway start={[10, 3, -20]} end={[0, 5, -10]} color="#10b981" />

      {/* Floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100, 20, 20]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.1} />
      </mesh>
    </>
  );
}

// HUD Overlay
function HUDOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wider">MIND GYM</h1>
              <p className="text-xs text-cyan-400">Orbital Training Facility</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Neural Profile Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-cyan-500 to-pink-500 p-0.5 animate-pulse">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Central Stats Panel */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-8 min-w-[400px]">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back, Commander</h2>
            <p className="text-cyan-400">Your neural network is online</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
              <div className="text-purple-400 text-sm mb-1">Current Streak</div>
              <div className="text-3xl font-bold text-white">7 Days</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="text-cyan-400 text-sm mb-1">Neural Score</div>
              <div className="text-3xl font-bold text-white">2,847</div>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/50">
            Begin Training Session
          </button>
        </div>
      </div>

      {/* Training Pods Labels */}
      <div className="absolute bottom-32 left-20 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm border border-purple-500/50 rounded-lg px-4 py-2">
          <div className="text-purple-400 font-bold">Memory Pod</div>
          <div className="text-white text-sm">Level 12</div>
        </div>
      </div>

      <div className="absolute bottom-32 right-20 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm border border-pink-500/50 rounded-lg px-4 py-2">
          <div className="text-pink-400 font-bold">Focus Pod</div>
          <div className="text-white text-sm">Level 9</div>
        </div>
      </div>

      <div className="absolute bottom-12 left-32 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm border border-amber-500/50 rounded-lg px-4 py-2">
          <div className="text-amber-400 font-bold">Speed Pod</div>
          <div className="text-white text-sm">Level 15</div>
        </div>
      </div>

      <div className="absolute bottom-12 right-32 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm border border-green-500/50 rounded-lg px-4 py-2">
          <div className="text-green-400 font-bold">Logic Pod</div>
          <div className="text-white text-sm">Level 11</div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
        <div className="flex gap-4">
          <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-cyan-400 text-sm">System Online</span>
          </div>
          <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-4 py-2">
            <span className="text-cyan-400 text-sm">Orbital Altitude: 408 km</span>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-4 py-2">
          <span className="text-cyan-400 text-sm">Next Session: 18:00 UTC</span>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function OrbitalGymHub() {
  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <HUDOverlay />
    </div>
  );
}

