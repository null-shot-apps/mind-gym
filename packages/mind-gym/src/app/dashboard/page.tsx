'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';

// Lazy load 3D scene
const OrbitalStation = dynamic(() => import('./components/OrbitalStation'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#0a0a0a]" />
});

export default function OrbitalGymHub() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const streak = 5;
  const lastSession = 18; // hours ago
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const ctx = gsap.context(() => {
      // Fade in dashboard cards
      gsap.from('.dashboard-card', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.3
      });

      // Pulse animation for CTA button
      gsap.to('.cta-pulse', {
        scale: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLoaded]);

  const coreStability = Math.max(0, 100 - (lastSession * 1.3));
  const hoursUntilExpire = 24 - currentTime.getHours();

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-[#0a0a0a]">
      {/* 3D Orbital Station Background */}
      {isLoaded && <OrbitalStation streak={streak} />}

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-container-dark border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-orbitron font-bold text-[#00d9ff]">
              MIND GYM
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#0066ff] animate-spin-slow" />
          </div>

          <div className="flex items-center gap-6">
            <div className="text-white/70 font-inter text-sm">
              Training Session: Day {streak}
            </div>
            <div className="text-white font-inter">
              {currentTime.toLocaleTimeString()}
            </div>
            <button className="relative">
              <span className="text-2xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00d9ff] rounded-full animate-pulse" />
            </button>
            <button className="text-2xl">⚙️</button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Grid */}
      <div className="relative z-10 pt-24 px-6 pb-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-12 gap-6">
          
          {/* STREAK DISCIPLINE CORE - Large focal card */}
          <div className="col-span-12 lg:col-span-5 dashboard-card">
            <div className="glass-container p-8 rounded-3xl h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-radial from-[#00d9ff]/20 to-transparent opacity-50" />
              
              <div className="relative z-10">
                <h2 className="font-orbitron text-2xl font-bold text-white mb-6">
                  POWER CORE STATUS
                </h2>
                
                {/* 3D Power Core Visualization */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-48 h-48">
                    <div 
                      className={`absolute inset-0 rounded-full ${
                        coreStability > 70 ? 'bg-[#00d9ff]' : 'bg-orange-500'
                      } blur-3xl opacity-50 animate-pulse`}
                    />
                    <div 
                      className={`absolute inset-4 rounded-full border-4 ${
                        coreStability > 70 ? 'border-[#00d9ff]' : 'border-orange-500'
                      } flex items-center justify-center backdrop-blur-sm`}
                      style={{
                        animation: `spin ${Math.max(10 - streak, 3)}s linear infinite`
                      }}
                    >
                      <div className="text-center">
                        <div className="text-6xl font-orbitron font-bold text-white">
                          {streak}
                        </div>
                        <div className="text-sm font-inter text-white/70">
                          DAY STREAK
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-xl font-inter text-white/90 mb-2">
                    &quot;The core stays alive only if you do&quot;
                  </p>
                  {coreStability < 80 && (
                    <div className="text-orange-400 font-inter text-sm">
                      ⚠️ Core Stability: {coreStability.toFixed(0)}%
                    </div>
                  )}
                </div>

                {/* Progress Ring */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-inter text-white/70">
                    <span>Next Milestone: 7 Days</span>
                    <span>{streak}/7</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00d9ff] to-[#0066ff] transition-all duration-500"
                      style={{ width: `${(streak / 7) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TODAY'S PROTOCOL */}
          <div className="col-span-12 lg:col-span-4 dashboard-card">
            <div className="glass-container p-8 rounded-3xl h-full">
              <h2 className="font-orbitron text-2xl font-bold text-white mb-6">
                TODAY&apos;S PROTOCOL
              </h2>
              
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="text-white/70 font-inter mb-4">
                    Your 15-minute protocol awaits
                  </div>
                  <button className="cta-pulse w-full py-6 rounded-2xl bg-gradient-to-r from-[#00d9ff] to-[#0066ff] text-black font-orbitron font-bold text-xl hover:shadow-cyan transition-all">
                    START TODAY&apos;S TRAINING
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 font-inter text-sm">Today&apos;s Target:</span>
                    <span className="text-white font-inter text-sm">Working Memory Enhancement</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 font-inter text-sm">Adaptive Level:</span>
                      <span className="text-white font-inter text-sm">5/10</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i}
                          className={`h-2 flex-1 rounded ${
                            i < 5 ? 'bg-[#00d9ff]' : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-orange-400 font-inter text-sm text-center pt-4">
                    ⏰ {hoursUntilExpire} hours until protocol expires
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NEURAL EVOLUTION TRACKER */}
          <div className="col-span-12 lg:col-span-3 dashboard-card">
            <div className="glass-container p-8 rounded-3xl h-full">
              <h2 className="font-orbitron text-xl font-bold text-white mb-6">
                NEURAL EVOLUTION
              </h2>
              
              {/* Mini 3D Brain */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 font-inter text-sm">Focus Endurance</span>
                    <span className="text-[#00d9ff] font-inter text-sm">67/100 📈</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00d9ff] w-[67%]" />
                  </div>
                  <div className="text-xs text-white/50 font-inter mt-1">+8 this week</div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 font-inter text-sm">Working Memory</span>
                    <span className="text-green-400 font-inter text-sm">52/100 📈</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 w-[52%]" />
                  </div>
                  <div className="text-xs text-white/50 font-inter mt-1">+12 this week</div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 font-inter text-sm">Reaction Speed</span>
                    <span className="text-purple-400 font-inter text-sm">78/100 📊</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 w-[78%]" />
                  </div>
                  <div className="text-xs text-white/50 font-inter mt-1">+3 this week</div>
                </div>
              </div>

              <button className="w-full mt-6 py-3 rounded-xl border border-[#00d9ff] text-[#00d9ff] font-inter text-sm hover:bg-[#00d9ff]/10 transition-all">
                View Full Neural Map
              </button>

              <div className="text-center text-white/50 font-inter text-xs mt-4">
                Next assessment in 23 days
              </div>
            </div>
          </div>

          {/* RECENT PERFORMANCE */}
          <div className="col-span-12 lg:col-span-4 dashboard-card">
            <div className="glass-container p-8 rounded-3xl h-full">
              <h2 className="font-orbitron text-xl font-bold text-white mb-6">
                RECENT PERFORMANCE
              </h2>
              
              <div className="space-y-3">
                {[
                  { date: 'Today', score: 0, status: 'pending', drill: 'Not started' },
                  { date: 'Yesterday', score: 92, status: 'pr', drill: 'N-Back' },
                  { date: '2 days ago', score: 85, status: 'good', drill: 'Stroop' },
                  { date: '3 days ago', score: 78, status: 'good', drill: 'Visual Search' },
                  { date: '4 days ago', score: 88, status: 'good', drill: 'N-Back' },
                  { date: '5 days ago', score: 71, status: 'average', drill: 'Stroop' },
                  { date: '6 days ago', score: 0, status: 'incomplete', drill: 'Missed' },
                ].map((session, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-xl border ${
                      session.status === 'pr' ? 'border-green-500 bg-green-500/10' :
                      session.status === 'good' ? 'border-[#00d9ff] bg-[#00d9ff]/10' :
                      session.status === 'average' ? 'border-yellow-500 bg-yellow-500/10' :
                      session.status === 'incomplete' ? 'border-red-500 bg-red-500/10' :
                      'border-white/20 bg-white/5'
                    } hover:scale-105 transition-all cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-inter text-sm">{session.date}</div>
                        <div className="text-white/50 font-inter text-xs">{session.drill}</div>
                      </div>
                      <div className="text-right">
                        {session.status === 'pr' && (
                          <div className="text-green-400 font-orbitron text-xs mb-1">🏆 PR</div>
                        )}
                        {session.score > 0 && (
                          <div className="text-white font-orbitron text-lg">{session.score}</div>
                        )}
                        {session.status === 'pending' && (
                          <div className="text-white/50 font-inter text-xs">Pending</div>
                        )}
                        {session.status === 'incomplete' && (
                          <div className="text-red-400 font-inter text-xs">Incomplete</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 rounded-xl border border-white/20 text-white/70 font-inter text-sm hover:bg-white/5 transition-all">
                Review All Sessions
              </button>
            </div>
          </div>

          {/* THE LAB - DRILL LIBRARY */}
          <div className="col-span-12 lg:col-span-5 dashboard-card">
            <div className="glass-container p-8 rounded-3xl h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-orbitron text-xl font-bold text-white">
                  THE LAB - DRILL LIBRARY
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-white/70 font-inter text-sm">Free Training</span>
                  <div className="w-12 h-6 bg-white/20 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'N-Back Isolation', color: 'purple', level: 5, score: 92, locked: false },
                  { name: 'Stroop Interference', color: 'orange', level: 4, score: 85, locked: false },
                  { name: 'Visual Search Sprints', color: 'white', level: 6, score: 88, locked: false },
                  { name: 'Dual Task Challenge', color: 'cyan', level: 3, score: 78, locked: false },
                  { name: 'Pattern Recognition', color: 'green', level: 0, score: 0, locked: true },
                  { name: 'Memory Palace', color: 'pink', level: 0, score: 0, locked: true },
                ].map((drill, i) => (
                  <div 
                    key={i}
                    className={`relative p-6 rounded-2xl border ${
                      drill.locked 
                        ? 'border-white/10 bg-white/5 opacity-50' 
                        : 'border-white/20 bg-white/10 hover:scale-105 hover:border-' + drill.color + '-500'
                    } transition-all cursor-pointer group`}
                  >
                    {drill.locked && (
                      <div className="absolute top-2 right-2 text-2xl">🔒</div>
                    )}
                    
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${drill.color}-500 blur-xl opacity-50 group-hover:opacity-100 transition-all`} />
                    
                    <div className="text-center">
                      <div className="text-white font-orbitron text-sm mb-2">
                        {drill.name}
                      </div>
                      {!drill.locked && (
                        <>
                          <div className="text-white/50 font-inter text-xs mb-1">
                            Level {drill.level}
                          </div>
                          <div className="text-[#00d9ff] font-orbitron text-lg">
                            {drill.score}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GLOBAL RANKINGS */}
          <div className="col-span-12 lg:col-span-3 dashboard-card">
            <div className="glass-container p-8 rounded-3xl h-full">
              <h2 className="font-orbitron text-xl font-bold text-white mb-6">
                THE 1%
              </h2>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-orbitron font-bold text-[#00d9ff] mb-2">
                  #4,782
                </div>
                <div className="text-white/50 font-inter text-sm mb-2">
                  of 250,000 operators
                </div>
                <div className="inline-block px-4 py-2 rounded-full bg-[#00d9ff]/20 border border-[#00d9ff]">
                  <span className="text-[#00d9ff] font-orbitron text-sm">Top 2%</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { rank: 1, name: 'NeuralKing', icon: '⚡', points: 2847 },
                  { rank: 2, name: 'CognitiveEdge', icon: '🔥', points: 2801 },
                  { rank: 3, name: 'MindAthlete', icon: '💪', points: 2756 },
                  { rank: 4, name: 'BrainForce', icon: '🧠', points: 2698 },
                  { rank: 5, name: 'SynapseKing', icon: '⭐', points: 2654 },
                ].map((user) => (
                  <div 
                    key={user.rank}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/50 font-orbitron text-sm w-6">
                        {user.rank}
                      </span>
                      <span className="text-xl">{user.icon}</span>
                      <span className="text-white font-inter text-sm">{user.name}</span>
                    </div>
                    <span className="text-[#00d9ff] font-orbitron text-sm">
                      {user.points}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center text-white/50 font-inter text-xs mb-4">
                1 point per session + bonuses
              </div>

              <button className="w-full py-3 rounded-xl border border-white/20 text-white/70 font-inter text-sm hover:bg-white/5 transition-all">
                View Full Leaderboard
              </button>
            </div>
          </div>

          {/* ACHIEVEMENTS & MILESTONES */}
          <div className="col-span-12 lg:col-span-4 dashboard-card">
            <div className="glass-container p-8 rounded-3xl h-full">
              <h2 className="font-orbitron text-xl font-bold text-white mb-6">
                ACHIEVEMENTS
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { name: '7-Day Warrior', icon: '🏆', unlocked: true },
                  { name: 'Memory Master', icon: '🧠', unlocked: true },
                  { name: 'Speed Demon', icon: '⚡', unlocked: true },
                  { name: '30-Day Legend', icon: '👑', unlocked: false },
                  { name: 'Perfect Week', icon: '💎', unlocked: false },
                  { name: 'Top 1%', icon: '🌟', unlocked: false },
                ].map((achievement, i) => (
                  <div 
                    key={i}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-[#00d9ff] to-[#0066ff] hover:scale-110' 
                        : 'bg-white/5 opacity-50'
                    } transition-all cursor-pointer`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <div className="text-white font-inter text-xs text-center px-2">
                      {achievement.name}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-white/70 font-inter text-sm">Next Achievement:</div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-inter text-sm">30-Day Legend</span>
                    <span className="text-[#00d9ff] font-orbitron text-sm">23/30</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00d9ff] w-[76%]" />
                  </div>
                </div>
              </div>

              <div className="text-center text-white/50 font-inter text-sm mb-4">
                8/50 achievements unlocked
              </div>

              <button className="w-full py-3 rounded-xl border border-white/20 text-white/70 font-inter text-sm hover:bg-white/5 transition-all">
                View All Achievements
              </button>
            </div>
          </div>

          {/* NEURAL WATTS */}
          <div className="col-span-12 lg:col-span-4 dashboard-card">
            <div className="glass-container p-8 rounded-3xl h-full">
              <h2 className="font-orbitron text-xl font-bold text-white mb-6">
                NEURAL WATTS
              </h2>
              
              <div className="text-center mb-6">
                <div className="text-6xl font-orbitron font-bold text-[#00d9ff] mb-2">
                  ⚡ 1,247
                </div>
                <div className="text-white/50 font-inter text-sm">
                  Available Currency
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70 font-inter">Per session:</span>
                  <span className="text-green-400 font-orbitron">+50 ⚡</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70 font-inter">Personal Record:</span>
                  <span className="text-green-400 font-orbitron">+100 ⚡</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70 font-inter">Streak bonus:</span>
                  <span className="text-green-400 font-orbitron">+{streak * 10} ⚡</span>
                </div>
              </div>

              <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00d9ff] to-[#0066ff] text-black font-orbitron font-bold hover:shadow-cyan transition-all mb-6">
                SPEND WATTS
              </button>

              <div className="space-y-3">
                <div className="text-white/70 font-inter text-sm mb-3">Unlockable Items:</div>
                {[
                  { name: 'Advanced Drill Pack', cost: 500 },
                  { name: 'Custom Gym Environment', cost: 1000 },
                  { name: 'AI Coach Personality', cost: 750 },
                  { name: 'Biometric Integration', cost: 2000 },
                ].map((item, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <span className="text-white font-inter text-sm">{item.name}</span>
                    <span className="text-[#00d9ff] font-orbitron text-sm">{item.cost} ⚡</span>
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


