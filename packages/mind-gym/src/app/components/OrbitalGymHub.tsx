'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Html } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Power Core Component
function PowerCore({ streak = 5 }: { streak: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.01);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = time * (1 + streak * 0.1);
    }
  }, [time, streak]);

  const coreIntensity = Math.min(streak / 30, 1);
  const coreColor = new THREE.Color().setHSL(0.5, 1, 0.3 + coreIntensity * 0.3);

  return (
    <group position={[0, 0, 0]}>
      <Sphere ref={meshRef} args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={0.5 + coreIntensity * 0.5}
          transparent
          opacity={0.8}
          wireframe={streak < 3}
        />
      </Sphere>
      <pointLight position={[0, 0, 0]} intensity={2} color={coreColor} distance={10} />
      <Html center>
        <div className="text-cyan-400 font-bold text-4xl pointer-events-none select-none">
          {streak}
        </div>
      </Html>
    </group>
  );
}

// Training Pod Component
function TrainingPod({ position, color, label, locked = false }: { 
  position: [number, number, number]; 
  color: string; 
  label: string;
  locked?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.05;
    }
  }, [hovered]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshStandardMaterial
          color={locked ? '#333' : color}
          emissive={locked ? '#111' : color}
          emissiveIntensity={locked ? 0.1 : 0.5}
          transparent
          opacity={locked ? 0.3 : 0.7}
        />
      </mesh>
      {!locked && (
        <pointLight position={[0, 0, 0]} intensity={1} color={color} distance={3} />
      )}
      <Html center distanceFactor={8}>
        <div className="text-white text-xs font-semibold pointer-events-none select-none whitespace-nowrap">
          {locked ? '🔒' : label}
        </div>
      </Html>
    </group>
  );
}

// Neural Pathway Component
function NeuralPathway({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: '#00ffff', linewidth: 2, transparent: true, opacity: 0.4 }))} />
  );
}

// Earth Component
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.001;
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sphere ref={meshRef} args={[8, 64, 64]} position={[0, -15, -30]}>
      <meshStandardMaterial
        color="#1e40af"
        emissive="#1e3a8a"
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
}

// 3D Scene Component
function SpaceStationScene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00ffff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Earth />
      
      <PowerCore streak={5} />
      
      <TrainingPod position={[-4, 2, -2]} color="#a855f7" label="N-Back" />
      <TrainingPod position={[4, 2, -2]} color="#f97316" label="Stroop" />
      <TrainingPod position={[-4, -2, -2]} color="#ffffff" label="Visual Search" />
      <TrainingPod position={[4, -2, -2]} color="#10b981" label="Memory Matrix" locked />
      
      <NeuralPathway start={[-4, 2, -2]} end={[0, 0, 0]} />
      <NeuralPathway start={[4, 2, -2]} end={[0, 0, 0]} />
      <NeuralPathway start={[-4, -2, -2]} end={[0, 0, 0]} />
      <NeuralPathway start={[4, -2, -2]} end={[0, 0, 0]} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Main Dashboard Component
export default function OrbitalGymHub() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <SpaceStationScene />
        </Canvas>
      </div>

      {/* HUD Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top Navigation Bar */}
        <div className="w-full px-8 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
              <span className="text-3xl">🧠</span>
              MIND GYM
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse" />
          </div>
          
          <div className="text-cyan-400 text-sm">
            Training Session: Day 5 | {currentTime.toLocaleTimeString()}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-cyan-400 hover:text-cyan-300 text-xl">🔔</button>
            <button className="text-cyan-400 hover:text-cyan-300 text-xl">⚙️</button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="w-full h-[calc(100vh-80px)] p-8 grid grid-cols-12 gap-4 pointer-events-auto">
          
          {/* STREAK DISCIPLINE CORE */}
          <div className="col-span-4 row-span-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
            <div className="relative z-10 text-center">
              <div className="text-6xl font-bold text-cyan-400 mb-2">5</div>
              <div className="text-xl text-cyan-300 mb-4">Day Streak</div>
              <div className="text-sm text-gray-400 italic mb-6">
                &quot;The core stays alive only if you do&quot;
              </div>
              <div className="w-32 h-32 mx-auto relative mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#1e3a8a"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#00ffff"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(5 / 7) * 351.86} 351.86`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-cyan-400 text-sm">
                  5/7 days
                </div>
              </div>
              <div className="text-xs text-green-400">Core Stability: 98%</div>
            </div>
          </div>

          {/* TODAY'S PROTOCOL */}
          <div className="col-span-5 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">TODAY&apos;S PROTOCOL</h2>
            <div className="space-y-4">
              <div className="text-gray-300">Your 15-minute protocol awaits</div>
              <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-lg rounded-xl transition-all duration-300 animate-pulse">
                START TODAY&apos;S TRAINING
              </button>
              <div className="text-sm text-gray-400">
                <div className="mb-2">Today&apos;s Target: <span className="text-cyan-400">Working Memory Enhancement</span></div>
                <div className="flex items-center gap-2 mb-2">
                  <span>Adaptive Level:</span>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-4 ${i < 5 ? 'bg-cyan-400' : 'bg-gray-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-cyan-400">5/10</span>
                </div>
                <div className="text-yellow-400">⏰ 11 hours until protocol expires</div>
              </div>
            </div>
          </div>

          {/* NEURAL EVOLUTION TRACKER */}
          <div className="col-span-3 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">NEURAL EVOLUTION</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Focus Endurance</span>
                  <span className="text-green-400">67/100 (+8) 📈</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: '67%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Working Memory</span>
                  <span className="text-green-400">52/100 (+12) 📈</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '52%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Reaction Speed</span>
                  <span className="text-cyan-400">78/100 (+3) 📊</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
              <button className="text-cyan-400 hover:text-cyan-300 text-sm underline">
                View Full Neural Map →
              </button>
              <div className="text-xs text-gray-500 mt-4">
                Next assessment in 23 days
              </div>
            </div>
          </div>

          {/* RECENT PERFORMANCE */}
          <div className="col-span-4 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">RECENT PERFORMANCE</h2>
            <div className="space-y-3">
              {[
                { date: 'Today', score: 0, status: 'pending', drill: 'Not started' },
                { date: 'Yesterday', score: 92, status: 'pr', drill: 'N-Back' },
                { date: '2 days ago', score: 85, status: 'good', drill: 'Stroop' },
                { date: '3 days ago', score: 88, status: 'good', drill: 'Visual Search' },
                { date: '4 days ago', score: 78, status: 'average', drill: 'N-Back' },
                { date: '5 days ago', score: 45, status: 'incomplete', drill: 'Stroop' },
                { date: '6 days ago', score: 90, status: 'good', drill: 'N-Back' },
              ].map((session, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    session.status === 'pr'
                      ? 'bg-green-500/20 border-green-500/50'
                      : session.status === 'good'
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : session.status === 'average'
                      ? 'bg-yellow-500/20 border-yellow-500/50'
                      : session.status === 'incomplete'
                      ? 'bg-red-500/20 border-red-500/50'
                      : 'bg-gray-500/20 border-gray-500/50'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{session.date}</div>
                    <div className="text-xs text-gray-400">{session.drill}</div>
                  </div>
                  <div className="text-right">
                    {session.status === 'pr' && <div className="text-xs text-green-400 mb-1">🏆 PR</div>}
                    <div className="text-lg font-bold text-white">
                      {session.score > 0 ? session.score : '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-cyan-400 hover:text-cyan-300 text-sm border border-cyan-500/30 rounded-lg">
              Review All Sessions
            </button>
          </div>

          {/* THE LAB - DRILL LIBRARY */}
          <div className="col-span-5 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyan-400">THE LAB</h2>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" className="rounded" />
                Free Training Mode
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'N-Back Isolation', color: 'purple', level: 5, score: 92, locked: false },
                { name: 'Stroop Interference', color: 'orange', level: 4, score: 85, locked: false },
                { name: 'Visual Search Sprints', color: 'white', level: 6, score: 88, locked: false },
                { name: 'Memory Matrix', color: 'green', level: 0, score: 0, locked: true },
              ].map((drill, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    drill.locked
                      ? 'bg-gray-800/50 border-gray-700/50 cursor-not-allowed'
                      : 'bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/30 hover:border-cyan-500/60 cursor-pointer transform hover:scale-105 transition-all'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{drill.locked ? '🔒' : '⚡'}</div>
                    <div className="text-sm font-semibold text-white mb-1">{drill.name}</div>
                    {!drill.locked && (
                      <>
                        <div className="text-xs text-gray-400">Level {drill.level}</div>
                        <div className="text-xs text-cyan-400">Last: {drill.score}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GLOBAL RANKINGS */}
          <div className="col-span-3 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">THE 1%</h2>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/50">
                <div className="text-2xl font-bold text-yellow-400">#4,782</div>
                <div className="text-xs text-gray-400">of 250,000 operators</div>
                <div className="text-sm text-yellow-400 mt-2">Top 2% 🏆</div>
              </div>
              <div className="space-y-2">
                {[
                  { rank: 1, name: 'NeuralKing', icon: '⚡', points: 2847 },
                  { rank: 2, name: 'CognitiveEdge', icon: '🔥', points: 2801 },
                  { rank: 3, name: 'MindMaster', icon: '💎', points: 2756 },
                  { rank: 4, name: 'BrainForce', icon: '⭐', points: 2698 },
                  { rank: 5, name: 'SynapseX', icon: '🚀', points: 2645 },
                ].map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm w-6">{user.rank}.</span>
                      <span className="text-white text-sm">{user.name}</span>
                      <span>{user.icon}</span>
                    </div>
                    <span className="text-cyan-400 text-sm font-semibold">{user.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



