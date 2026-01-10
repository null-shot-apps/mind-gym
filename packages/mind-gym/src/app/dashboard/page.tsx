'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Sphere, Text } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Power Core Component
function PowerCore({ streak, lastSession }: { streak: number; lastSession: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [stability, setStability] = useState(100);

  useEffect(() => {
    const hoursSinceSession = (Date.now() - lastSession) / (1000 * 60 * 60);
    const newStability = Math.max(0, 100 - (hoursSinceSession > 20 ? (hoursSinceSession - 20) * 2 : 0));
    setStability(newStability);
  }, [lastSession]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * (1 + streak / 100);
    }
  });

  const coreColor = stability > 80 ? '#00ffff' : stability > 50 ? '#ffaa00' : '#ff3333';
  const intensity = stability / 100;

  return (
    <group position={[0, 0, 0]}>
      <Sphere ref={meshRef} args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={intensity * 2}
          transparent
          opacity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      <Sphere args={[1.6, 32, 32]}>
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {streak}
      </Text>
    </group>
  );
}

// Training Pod Component
function TrainingPod({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// Neural Pathway Lines
function NeuralPathways() {
  const points = [
    new THREE.Vector3(-4, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(4, 0, 0),
  ];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#00ffff" linewidth={2} />
    </line>
  );
}

// Earth View through Dome
function EarthView() {
  const earthRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Sphere ref={earthRef} args={[8, 64, 64]} position={[0, 0, -30]}>
      <meshStandardMaterial
        color="#1e4d8b"
        emissive="#0a2540"
        emissiveIntensity={0.3}
        roughness={0.8}
      />
    </Sphere>
  );
}

// Main 3D Scene
function OrbitalScene({ streak, lastSession }: { streak: number; lastSession: number }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 8]} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        rotateSpeed={0.3}
      />
      
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#00ffff" />
      <pointLight position={[-5, 0, 0]} intensity={0.5} color="#0066ff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <EarthView />
      <PowerCore streak={streak} lastSession={lastSession} />
      <NeuralPathways />
      
      <TrainingPod position={[-4, 0, 0]} label="MEMORY" color="#ff00ff" />
      <TrainingPod position={[4, 0, 0]} label="FOCUS" color="#00ff00" />
      <TrainingPod position={[0, 0, -4]} label="SPEED" color="#ffaa00" />
    </>
  );
}

// Dashboard UI Overlay
export default function OrbitalGymHub() {
  const [streak, setStreak] = useState(7);
  const [lastSession] = useState(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago
  const [sessionStatus, setSessionStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
  const [sessionTime, setSessionTime] = useState(900); // 15 minutes in seconds

  const hoursSinceSession = (Date.now() - lastSession) / (1000 * 60 * 60);
  const stability = Math.max(0, Math.min(100, 100 - (hoursSinceSession > 20 ? (hoursSinceSession - 20) * 2 : 0)));

  const nextMilestone = streak < 7 ? 7 : streak < 30 ? 30 : streak < 90 ? 90 : 365;
  const milestoneProgress = (streak / nextMilestone) * 100;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <OrbitalScene streak={streak} lastSession={lastSession} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {/* Top Navigation Bar */}
        <nav className="flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center">
                <span className="text-cyan-400 text-xl">⚡</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wider">MIND GYM</h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse" />
            <div className="text-right">
              <p className="text-cyan-400 text-sm">Training Session</p>
              <p className="text-white font-semibold">Day {streak}</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
              🔔
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
              ⚙️
            </button>
          </div>
        </nav>

        {/* Main Dashboard Grid */}
        <div className="px-8 py-6 grid grid-cols-12 gap-6 h-[calc(100vh-100px)] pointer-events-auto">
          {/* STREAK DISCIPLINE CORE - Large Left Card */}
          <div className="col-span-5 row-span-2 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">POWER CORE</h2>
              <p className="text-cyan-300 text-lg mb-6">{streak} Day Streak</p>
              
              <div className="relative w-48 h-48 mx-auto my-8">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#1e3a5f"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#00ffff"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${milestoneProgress * 5.53} 553`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-cyan-400">{streak}</p>
                    <p className="text-sm text-cyan-300">days</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-white/80 italic mb-4">
                "The core stays alive only if you do"
              </p>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cyan-300">Next Milestone</span>
                  <span className="text-white font-bold">{nextMilestone} days</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${milestoneProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {stability < 80 && (
              <div className="mt-4 bg-orange-500/20 border border-orange-500/50 rounded-lg p-4">
                <p className="text-orange-300 font-semibold">⚠️ Core Stability: {stability.toFixed(0)}%</p>
                <p className="text-orange-200 text-sm mt-1">Last session was {hoursSinceSession.toFixed(1)} hours ago</p>
              </div>
            )}
          </div>

          {/* TODAY'S PROTOCOL - Top Center Card */}
          <div className="col-span-7 bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">TODAY&apos;S PROTOCOL</h2>
            
            {sessionStatus === 'not-started' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-lg mb-2">Your 15-minute protocol awaits</p>
                  <p className="text-purple-300">3 drills • Adaptive difficulty</p>
                </div>
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105">
                  START SESSION
                </button>
              </div>
            )}

            {sessionStatus === 'in-progress' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-lg mb-2">Session in progress</p>
                  <p className="text-purple-300">Paused at {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')} remaining</p>
                </div>
                <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105">
                  RESUME
                </button>
              </div>
            )}

            {sessionStatus === 'completed' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-lg mb-2">✓ Protocol completed</p>
                  <p className="text-green-300">+250 XP earned • Streak maintained</p>
                </div>
                <button className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl text-white font-bold text-lg opacity-50 cursor-not-allowed">
                  COMPLETED
                </button>
              </div>
            )}
          </div>

          {/* NEURAL STATS - Top Right Cards */}
          <div className="col-span-4 bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4">MEMORY CORE</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-300">Level</span>
                <span className="text-white font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-300">Accuracy</span>
                <span className="text-white font-bold">87%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>
          </div>

          <div className="col-span-3 bg-gradient-to-br from-orange-900/40 to-yellow-900/40 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4">SPEED</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-orange-300">Level</span>
                <span className="text-white font-bold">9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-300">Avg Time</span>
                <span className="text-white font-bold">1.2s</span>
              </div>
            </div>
          </div>

          {/* LEADERBOARD */}
          <div className="col-span-7 row-span-1 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4">GLOBAL RANKINGS</h3>
            <div className="space-y-2">
              {[
                { rank: 1, name: 'NeuroMaster', score: 15420, you: false },
                { rank: 2, name: 'CognitiveElite', score: 14890, you: false },
                { rank: 3, name: 'You', score: 12750, you: true },
                { rank: 4, name: 'BrainAce', score: 12100, you: false },
              ].map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.you ? 'bg-cyan-500/20 border border-cyan-400' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-white/50">#{player.rank}</span>
                    <span className={`font-semibold ${player.you ? 'text-cyan-400' : 'text-white'}`}>
                      {player.name}
                    </span>
                  </div>
                  <span className="text-white font-bold">{player.score.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

