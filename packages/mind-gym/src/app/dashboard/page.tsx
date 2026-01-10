'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Line } from '@react-three/drei';
import * as THREE from 'three';

// Power Core - Central streak visualization
function PowerCore({ streak = 5, lastSession = 12 }: { streak: number; lastSession: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const isActive = lastSession < 20;
  const coreStability = Math.max(0, 100 - (lastSession * 1.3));
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * (1 + streak * 0.1);
      meshRef.current.rotation.x += 0.001;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(1 + pulse * 0.1);
    }
  });

  return (
    <group position={[-3, 0, 0]}>
      {/* Outer glow */}
      <Sphere ref={glowRef} args={[1.3, 32, 32]}>
        <meshBasicMaterial
          color={isActive ? '#00ffff' : '#ff4444'}
          transparent
          opacity={0.2}
        />
      </Sphere>
      
      {/* Core sphere */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color={isActive ? '#00ddff' : '#ff6666'}
          emissive={isActive ? '#00ffff' : '#ff4444'}
          emissiveIntensity={isActive ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      {/* Energy rings */}
      {[0, 1, 2].map((i) => (
        <Torus
          key={i}
          args={[1.5 + i * 0.3, 0.02, 16, 100]}
          rotation={[Math.PI / 2 + i * 0.3, 0, i * 0.5]}
        >
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </Torus>
      ))}
    </group>
  );
}

// Training Pod
function TrainingPod({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

// Neural Pathway Lines
function NeuralPathways() {
  const points1 = [
    new THREE.Vector3(-3, 0, 0),
    new THREE.Vector3(0, 1, 2),
    new THREE.Vector3(3, 0, 2),
  ];
  
  const points2 = [
    new THREE.Vector3(-3, 0, 0),
    new THREE.Vector3(-1, -1, 2),
    new THREE.Vector3(1, 0, 3),
  ];

  return (
    <>
      <Line points={points1} color="#00ffff" lineWidth={2} transparent opacity={0.4} />
      <Line points={points2} color="#00ffff" lineWidth={2} transparent opacity={0.4} />
    </>
  );
}

// Earth visible through dome
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Sphere ref={meshRef} args={[8, 64, 64]} position={[0, -5, -20]}>
      <meshStandardMaterial
        color="#1e40af"
        emissive="#1e3a8a"
        emissiveIntensity={0.2}
        metalness={0.3}
        roughness={0.7}
      />
    </Sphere>
  );
}

// Stars background
function Stars() {
  const starsRef = useRef<THREE.Points>(null);
  
  useEffect(() => {
    if (starsRef.current) {
      const positions = new Float32Array(1000 * 3);
      for (let i = 0; i < 1000; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 30;
      }
      starsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, []);

  return (
    <points ref={starsRef}>
      <bufferGeometry />
      <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.8} />
    </points>
  );
}

// 3D Scene Component
function OrbitalScene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, -5, -20]} intensity={1} color="#4a90e2" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
      
      <Stars />
      <Earth />
      <PowerCore streak={5} lastSession={12} />
      <NeuralPathways />
      
      <TrainingPod position={[3, 0, 2]} color="#00ff88" label="Focus" />
      <TrainingPod position={[1, 0, 3]} color="#ff00ff" label="Memory" />
      <TrainingPod position={[-1, -1, 2]} color="#ffaa00" label="Speed" />
      
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

// Mini 3D Brain for Neural Profile
function MiniBrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.5, 32, 32]}>
      <meshStandardMaterial
        color="#ff00ff"
        emissive="#ff00ff"
        emissiveIntensity={0.3}
        metalness={0.6}
        roughness={0.4}
      />
    </Sphere>
  );
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const streak = 5;
  const lastSessionHours = 12;
  const coreStability = Math.max(0, 100 - (lastSessionHours * 1.3));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
          <Suspense fallback={null}>
            <OrbitalScene />
          </Suspense>
        </Canvas>
      </div>

      {/* HUD Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-cyan-400 tracking-wider flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-cyan-400 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse" />
              </div>
              MIND GYM
            </div>
            
            {/* Mini Brain Avatar */}
            <div className="w-16 h-16 bg-black/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[2, 2, 2]} intensity={1} color="#00ffff" />
                <MiniBrain />
              </Canvas>
            </div>
          </div>

          <div className="flex items-center gap-6 text-cyan-400">
            <div className="text-sm">
              <div className="font-semibold">Training Session: Day {streak}</div>
              <div className="text-cyan-400/70">{currentTime.toLocaleString()}</div>
            </div>
            <button className="w-10 h-10 bg-cyan-400/10 backdrop-blur-sm border border-cyan-400/30 rounded-lg hover:bg-cyan-400/20 transition-colors flex items-center justify-center">
              🔔
            </button>
            <button className="w-10 h-10 bg-cyan-400/10 backdrop-blur-sm border border-cyan-400/30 rounded-lg hover:bg-cyan-400/20 transition-colors flex items-center justify-center">
              ⚙️
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="absolute top-24 left-0 right-0 bottom-0 p-6 grid grid-cols-12 gap-4 pointer-events-auto overflow-y-auto">
          
          {/* STREAK DISCIPLINE CORE - Large Left Card */}
          <div className="col-span-5 row-span-2 bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
            
            <div className="relative z-10 text-center">
              <div className="text-8xl font-bold text-cyan-400 mb-4">{streak}</div>
              <div className="text-2xl text-white mb-2">Day Streak</div>
              <div className="text-cyan-400/70 italic mb-6">
                "The core stays alive only if you do"
              </div>
              
              {/* Progress Ring */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="rgba(0,255,255,0.1)"
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
                    strokeDasharray={`${(streak / 7) * 553} 553`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-3xl font-bold text-white">{streak}/7</div>
                  <div className="text-sm text-cyan-400/70">to milestone</div>
                </div>
              </div>
              
              {/* Core Stability Warning */}
              {lastSessionHours > 20 && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400">
                  ⚠️ Core Stability: {coreStability.toFixed(0)}%
                </div>
              )}
              
              {lastSessionHours <= 20 && (
                <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-3 text-cyan-400">
                  ✓ Core Stability: {coreStability.toFixed(0)}%
                </div>
              )}
            </div>
          </div>

          {/* TODAY'S PROTOCOL - Top Center Card */}
          <div className="col-span-4 bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">TODAY&apos;S PROTOCOL</h2>
            
            <div className="mb-4">
              <div className="text-cyan-400/70 mb-2">Your 15-minute protocol awaits</div>
              <div className="text-white font-semibold mb-1">Today&apos;s Target: Working Memory Enhancement</div>
              
              {/* Difficulty bars */}
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm text-cyan-400/70">Adaptive Level:</div>
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-4 rounded-sm ${
                        i < 5 ? 'bg-cyan-400' : 'bg-cyan-400/20'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-cyan-400">5/10</div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 animate-pulse">
              START TODAY&apos;S TRAINING
            </button>

            <div className="mt-4 text-center text-yellow-400/70 text-sm">
              ⏰ 11 hours until protocol expires
            </div>
          </div>

          {/* NEURAL EVOLUTION TRACKER - Top Right Card */}
          <div className="col-span-3 bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">NEURAL EVOLUTION</h2>
            
            {/* Mini 3D Brain */}
            <div className="w-full h-32 mb-4 bg-black/30 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[2, 2, 2]} intensity={1} color="#ff00ff" />
                <MiniBrain />
              </Canvas>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cyan-400">Focus Endurance</span>
                  <span className="text-green-400">+8 📈</span>
                </div>
                <div className="w-full bg-cyan-400/20 rounded-full h-2">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '67%' }} />
                </div>
                <div className="text-xs text-cyan-400/70 mt-1">67/100</div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-400">Working Memory</span>
                  <span className="text-green-400">+12 📈</span>
                </div>
                <div className="w-full bg-purple-400/20 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{ width: '52%' }} />
                </div>
                <div className="text-xs text-purple-400/70 mt-1">52/100</div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-400">Reaction Speed</span>
                  <span className="text-green-400">+3 📊</span>
                </div>
                <div className="w-full bg-yellow-400/20 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
                <div className="text-xs text-yellow-400/70 mt-1">78/100</div>
              </div>
            </div>

            <button className="w-full mt-4 text-cyan-400 hover:text-cyan-300 text-sm underline">
              View Full Neural Map →
            </button>
            
            <div className="mt-3 text-xs text-cyan-400/50 text-center">
              Next diagnostic in 23 days
            </div>
          </div>

          {/* RECENT PERFORMANCE - Middle Left Card */}
          <div className="col-span-5 bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">RECENT PERFORMANCE</h2>
            
            <div className="space-y-3">
              {[
                { date: 'Today', duration: '15:32', score: 94, drill: 'N-Back Challenge', status: 'pr' },
                { date: 'Yesterday', duration: '15:01', score: 87, drill: 'Pattern Matrix', status: 'good' },
                { date: '2 days ago', duration: '14:45', score: 82, drill: 'Dual N-Back', status: 'good' },
                { date: '3 days ago', duration: '15:12', score: 76, drill: 'Memory Span', status: 'average' },
                { date: '4 days ago', duration: '12:30', score: 68, drill: 'Focus Endurance', status: 'incomplete' },
                { date: '5 days ago', duration: '15:45', score: 91, drill: 'Reaction Grid', status: 'good' },
                { date: '6 days ago', duration: '15:20', score: 85, drill: 'Pattern Matrix', status: 'good' },
              ].map((session, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    session.status === 'pr'
                      ? 'bg-green-500/10 border-green-500/50'
                      : session.status === 'good'
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : session.status === 'average'
                      ? 'bg-yellow-500/10 border-yellow-500/50'
                      : 'bg-red-500/10 border-red-500/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-white font-semibold">{session.date}</div>
                    <div className="text-sm text-cyan-400/70">{session.drill}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{session.score}</div>
                    <div className="text-xs text-cyan-400/70">{session.duration}</div>
                  </div>
                  {session.status === 'pr' && (
                    <div className="text-green-400 font-bold">PR</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GLOBAL RANKINGS - Middle Center Card */}
          <div className="col-span-4 bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">GLOBAL RANKINGS</h2>
            
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg">
              <div className="text-yellow-400 text-sm mb-1">Your Rank</div>
              <div className="text-4xl font-bold text-white">#1,247</div>
              <div className="text-sm text-yellow-400/70">Top 5% globally</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-cyan-400/70 mb-2">Leaderboard</div>
              {[
                { rank: 1, name: 'NeuroMaster', score: 9847, badge: '🥇' },
                { rank: 2, name: 'CognitiveElite', score: 9723, badge: '🥈' },
                { rank: 3, name: 'BrainAce', score: 9654, badge: '🥉' },
                { rank: 4, name: 'MindWarrior', score: 9521, badge: '' },
                { rank: 5, name: 'SynapseKing', score: 9487, badge: '' },
              ].map((player) => (
                <div
                  key={player.rank}
                  className="flex items-center justify-between p-2 bg-cyan-400/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-cyan-400 font-bold w-8">{player.badge || `#${player.rank}`}</div>
                    <div className="text-white">{player.name}</div>
                  </div>
                  <div className="text-cyan-400 font-semibold">{player.score}</div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-cyan-400 hover:text-cyan-300 text-sm underline">
              View Full Rankings →
            </button>
          </div>

          {/* ACHIEVEMENTS - Bottom Right Card */}
          <div className="col-span-3 bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">ACHIEVEMENTS</h2>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔥', name: '5-Day Streak', unlocked: true },
                { icon: '🧠', name: 'Brain Master', unlocked: true },
                { icon: '⚡', name: 'Speed Demon', unlocked: true },
                { icon: '🎯', name: 'Perfect Score', unlocked: false },
                { icon: '🏆', name: 'Champion', unlocked: false },
                { icon: '💎', name: 'Elite', unlocked: false },
              ].map((achievement, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400'
                      : 'bg-black/30 border border-cyan-400/20 opacity-40'
                  }`}
                >
                  <div className="text-3xl mb-1">{achievement.icon}</div>
                  <div className="text-xs text-center text-cyan-400">{achievement.name}</div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-cyan-400 hover:text-cyan-300 text-sm underline">
              View All Achievements →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

