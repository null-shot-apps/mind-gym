'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Phase = 'intro' | 'countdown' | 'focus' | 'rest1' | 'memory' | 'rest2' | 'reaction' | 'transition' | 'results';

interface FocusMetrics {
  totalTimeOnTarget: number;
  averageDistance: number;
  reactionTimes: number[];
}

interface MemoryMetrics {
  maxSequenceLength: number;
  accuracy: number;
  responseTimes: number[];
}

interface ReactionMetrics {
  totalClicks: number;
  averageReactionTime: number;
  missedTargets: number;
}

export default function AssessmentPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [countdown, setCountdown] = useState(3);
  const [breathingScale, setBreathingScale] = useState(1);
  
  // Focus Phase State
  const [dotPosition, setDotPosition] = useState({ x: 50, y: 50 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [focusMetrics, setFocusMetrics] = useState<FocusMetrics>({
    totalTimeOnTarget: 0,
    averageDistance: 0,
    reactionTimes: []
  });
  const focusStartTime = useRef<number>(0);
  const lastDotMove = useRef<number>(0);
  const distanceSum = useRef<number>(0);
  const distanceCount = useRef<number>(0);
  
  // Memory Phase State
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [currentFlash, setCurrentFlash] = useState(-1);
  const [sequenceLength, setSequenceLength] = useState(4);
  const [memoryMetrics, setMemoryMetrics] = useState<MemoryMetrics>({
    maxSequenceLength: 0,
    accuracy: 100,
    responseTimes: []
  });
  const memoryStartTime = useRef<number>(0);
  const correctAnswers = useRef<number>(0);
  const totalAttempts = useRef<number>(0);
  
  // Reaction Phase State
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; spawnTime: number }>>([]);
  const [reactionMetrics, setReactionMetrics] = useState<ReactionMetrics>({
    totalClicks: 0,
    averageReactionTime: 0,
    missedTargets: 0
  });
  const reactionTimes = useRef<number[]>([]);
  const missedCount = useRef<number>(0);
  
  // Transition state
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [brainRotation, setBrainRotation] = useState(0);

  const colors = ['#00d9ff', '#a855f7', '#fb923c', '#ffffff'];

  // Start assessment
  const startAssessment = () => {
    setPhase('countdown');
    setCountdown(3);
  };

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPhase('focus');
      setTimeRemaining(60);
      focusStartTime.current = Date.now();
      lastDotMove.current = Date.now();
    }
  }, [phase, countdown]);

  // Rest breathing animation
  useEffect(() => {
    if (phase !== 'rest1' && phase !== 'rest2') return;

    const interval = setInterval(() => {
      setBreathingScale(prev => prev === 1 ? 1.5 : 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [phase]);

  // Focus Phase: Dot Movement
  useEffect(() => {
    if (phase !== 'focus') return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - focusStartTime.current;
      const speed = Math.min(5 + Math.floor(elapsed / 10000) * 2, 15);
      
      setDotPosition(prev => {
        const angle = Math.random() * Math.PI * 2;
        const distance = speed;
        let newX = prev.x + Math.cos(angle) * distance;
        let newY = prev.y + Math.sin(angle) * distance;
        
        newX = Math.max(10, Math.min(90, newX));
        newY = Math.max(10, Math.min(90, newY));
        
        lastDotMove.current = Date.now();
        return { x: newX, y: newY };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [phase]);

  // Focus Phase: Track cursor
  useEffect(() => {
    if (phase !== 'focus') return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setCursorPosition({ x, y });

      const distance = Math.sqrt(
        Math.pow(x - dotPosition.x, 2) + Math.pow(y - dotPosition.y, 2)
      );

      distanceSum.current += distance;
      distanceCount.current += 1;

      if (distance <= 7) {
        setFocusMetrics(prev => ({
          ...prev,
          totalTimeOnTarget: prev.totalTimeOnTarget + 0.016
        }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [phase, dotPosition]);

  // Memory Phase: Generate and show sequence
  const startMemoryRound = () => {
    const newSequence = Array.from({ length: sequenceLength }, () => 
      colors[Math.floor(Math.random() * colors.length)]
    );
    setSequence(newSequence);
    setUserSequence([]);
    setShowingSequence(true);
    setCurrentFlash(0);
    memoryStartTime.current = Date.now();
  };

  useEffect(() => {
    if (phase === 'memory' && timeRemaining === 60) {
      startMemoryRound();
    }
  }, [phase]);

  // Memory Phase: Flash sequence
  useEffect(() => {
    if (!showingSequence || currentFlash >= sequence.length) {
      if (showingSequence && currentFlash >= sequence.length) {
        setTimeout(() => setShowingSequence(false), 500);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCurrentFlash(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showingSequence, currentFlash, sequence.length]);

  // Memory Phase: Handle user input
  const handleColorClick = (color: string) => {
    if (showingSequence) return;

    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);

    if (newUserSequence.length === sequence.length) {
      const responseTime = Date.now() - memoryStartTime.current;
      totalAttempts.current += 1;

      const isCorrect = newUserSequence.every((c, i) => c === sequence[i]);
      
      if (isCorrect) {
        correctAnswers.current += 1;
        setMemoryMetrics(prev => ({
          maxSequenceLength: Math.max(prev.maxSequenceLength, sequenceLength),
          accuracy: (correctAnswers.current / totalAttempts.current) * 100,
          responseTimes: [...prev.responseTimes, responseTime]
        }));
        
        if (sequenceLength < 9) {
          setSequenceLength(prev => prev + 1);
        }
      } else {
        setMemoryMetrics(prev => ({
          ...prev,
          accuracy: (correctAnswers.current / totalAttempts.current) * 100,
          responseTimes: [...prev.responseTimes, responseTime]
        }));
      }

      setTimeout(() => startMemoryRound(), 1000);
    }
  };

  // Reaction Phase: Spawn targets
  useEffect(() => {
    if (phase !== 'reaction') return;

    const spawnInterval = setInterval(() => {
      const id = Date.now();
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 80;
      
      setTargets(prev => [...prev, { id, x, y, spawnTime: Date.now() }]);

      setTimeout(() => {
        setTargets(prev => {
          const target = prev.find(t => t.id === id);
          if (target) {
            missedCount.current += 1;
          }
          return prev.filter(t => t.id !== id);
        });
      }, 2000);
    }, 1000);

    return () => clearInterval(spawnInterval);
  }, [phase]);

  // Reaction Phase: Handle clicks
  const handleTargetClick = (targetId: number, spawnTime: number) => {
    const reactionTime = Date.now() - spawnTime;
    reactionTimes.current.push(reactionTime);
    
    setReactionMetrics(prev => ({
      totalClicks: prev.totalClicks + 1,
      averageReactionTime: reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length,
      missedTargets: missedCount.current
    }));

    setTargets(prev => prev.filter(t => t.id !== targetId));
  };

  // Timer countdown
  useEffect(() => {
    if (phase === 'intro' || phase === 'results' || phase === 'countdown') return;

    if (phase === 'rest1' || phase === 'rest2') {
      const restTimer = setTimeout(() => {
        if (phase === 'rest1') {
          setPhase('memory');
          setTimeRemaining(60);
        } else {
          setPhase('reaction');
          setTimeRemaining(60);
        }
      }, 5000);
      return () => clearTimeout(restTimer);
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (phase === 'focus') {
            setFocusMetrics(prev => ({
              ...prev,
              averageDistance: distanceSum.current / distanceCount.current
            }));
            setPhase('rest1');
            return 0;
          } else if (phase === 'memory') {
            setPhase('rest2');
            return 0;
          } else if (phase === 'reaction') {
            setReactionMetrics(prev => ({
              ...prev,
              missedTargets: missedCount.current
            }));
            setPhase('transition');
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Transition animation
  useEffect(() => {
    if (phase !== 'transition') return;

    const interval = setInterval(() => {
      setTransitionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Save results to localStorage
          const scores = calculateScores();
          localStorage.setItem('mindGymBaseline', JSON.stringify({
            timestamp: Date.now(),
            focusScore: scores.focusScore,
            memoryScore: scores.memoryScore,
            reactionScore: scores.reactionScore,
            overallScore: scores.overallScore,
            rawData: {
              focus: focusMetrics,
              memory: memoryMetrics,
              reaction: reactionMetrics
            }
          }));
          setPhase('results');
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  // Brain rotation animation
  useEffect(() => {
    if (phase !== 'results') return;

    const interval = setInterval(() => {
      setBrainRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  // Calculate scores
  const calculateScores = () => {
    const focusScore = Math.min(100, Math.round((focusMetrics.totalTimeOnTarget / 60) * 100));
    const memoryScore = Math.min(100, Math.round((memoryMetrics.maxSequenceLength / 9) * 100));
    const reactionScore = Math.min(100, Math.round((reactionMetrics.totalClicks / 60) * 100));
    const overallScore = Math.round((focusScore + memoryScore + reactionScore) / 3);

    return { focusScore, memoryScore, reactionScore, overallScore };
  };

  // Determine weakest area and fitness level
  const getInsights = () => {
    const scores = calculateScores();
    const weakest = 
      scores.focusScore <= scores.memoryScore && scores.focusScore <= scores.reactionScore
        ? 'Focus Endurance'
        : scores.memoryScore <= scores.reactionScore
        ? 'Working Memory'
        : 'Reaction Speed';

    const level = 
      scores.overallScore >= 80 ? 'Elite'
      : scores.overallScore >= 60 ? 'Advanced'
      : scores.overallScore >= 40 ? 'Intermediate'
      : 'Beginner';

    return { weakest, level };
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00ff88';
    if (score >= 60) return '#00d9ff';
    if (score >= 40) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1}s`
            }}
          />
        ))}
      </div>
      {/* Countdown Phase */}
      {phase === 'countdown' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-white/50 text-2xl mb-8" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              GET READY
            </p>
            <p 
              className="text-[#00d9ff] font-bold transition-all duration-300"
              style={{ 
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '200px',
                textShadow: '0 0 60px #00d9ff, 0 0 120px #00d9ff'
              }}
            >
              {countdown}
            </p>
          </div>
        </div>
      )}

      {/* Rest Phase */}
      {(phase === 'rest1' || phase === 'rest2') && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-white/50 text-2xl mb-12" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              BREATHE
            </p>
            <div 
              className="w-32 h-32 mx-auto bg-[#00d9ff] rounded-full transition-all duration-2000 ease-in-out"
              style={{
                transform: `scale(${breathingScale})`,
                boxShadow: `0 0 ${breathingScale * 60}px #00d9ff`
              }}
            />
            <p className="text-white/30 text-lg mt-12">
              Next phase starting soon...
            </p>
          </div>
        </div>
      )}

      {/* Intro Phase */}
      {phase === 'intro' && (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="max-w-2xl backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Cognitive Diagnostic
            </h1>
            <p className="text-xl text-white/70 mb-8">
              This 3-minute assessment measures your baseline cognitive performance across three domains:
            </p>
            <div className="space-y-4 mb-12 text-left">
              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-[#00d9ff] font-bold mb-2">Phase 1: Focus Endurance</h3>
                <p className="text-white/70">Track a moving target to measure sustained attention</p>
              </div>
              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-[#00d9ff] font-bold mb-2">Phase 2: Working Memory</h3>
                <p className="text-white/70">Remember and reproduce color sequences</p>
              </div>
              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-[#00d9ff] font-bold mb-2">Phase 3: Reaction Speed</h3>
                <p className="text-white/70">Click targets as quickly as possible</p>
              </div>
            </div>
            <button
              onClick={startAssessment}
              className="px-12 py-4 bg-[#00d9ff] text-black font-bold rounded-full text-lg hover:shadow-[0_0_30px_#00d9ff] transition-all duration-300"
            >
              Begin Assessment
            </button>
          </div>
        </div>
      )}

      {/* Focus Phase */}
      {phase === 'focus' && (
        <div className="relative w-full h-screen">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
            <div className="text-center">
              <p className="text-[#00d9ff] font-bold mb-1">Phase 1: Focus Endurance</p>
              <p className="text-3xl font-bold">{timeRemaining}s</p>
              <div className="w-64 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-[#00d9ff] transition-all duration-1000"
                  style={{ width: `${(timeRemaining / 60) * 100}%` }}
                />
              </div>
              <p className="text-sm text-white/50 mt-2">Keep your cursor on the cyan dot</p>
            </div>
          </div>

          <div
            className="absolute w-16 h-16 bg-[#00d9ff] rounded-full shadow-[0_0_40px_#00d9ff] transition-all duration-100"
            style={{
              left: `${dotPosition.x}%`,
              top: `${dotPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
            <p className="text-sm text-white/70">
              Time on target: <span className="text-[#00d9ff] font-bold">{focusMetrics.totalTimeOnTarget.toFixed(1)}s</span>
            </p>
          </div>
        </div>
      )}

      {/* Memory Phase */}
      {phase === 'memory' && (
        <div className="relative w-full h-screen flex items-center justify-center">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
            <div className="text-center">
              <p className="text-[#00d9ff] font-bold mb-1">Phase 2: Working Memory</p>
              <p className="text-3xl font-bold">{timeRemaining}s</p>
              <div className="w-64 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-[#00d9ff] transition-all duration-1000"
                  style={{ width: `${(timeRemaining / 60) * 100}%` }}
                />
              </div>
              <p className="text-sm text-white/50 mt-2">Sequence length: {sequenceLength}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {colors.map((color, index) => (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                disabled={showingSequence}
                className="w-32 h-32 rounded-2xl transition-all duration-300 disabled:opacity-50"
                style={{
                  backgroundColor: showingSequence && currentFlash === sequence.indexOf(color) && sequence[currentFlash] === color
                    ? color
                    : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${color}`,
                  boxShadow: showingSequence && currentFlash === sequence.indexOf(color) && sequence[currentFlash] === color
                    ? `0 0 40px ${color}`
                    : 'none'
                }}
              />
            ))}
          </div>

          {!showingSequence && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
              <p className="text-sm text-white/70">
                Click the colors in order • Progress: {userSequence.length}/{sequence.length}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reaction Phase */}
      {phase === 'reaction' && (
        <div className="relative w-full h-screen">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
            <div className="text-center">
              <p className="text-[#00d9ff] font-bold mb-1">Phase 3: Reaction Speed</p>
              <p className="text-3xl font-bold">{timeRemaining}s</p>
              <div className="w-64 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-[#00d9ff] transition-all duration-1000"
                  style={{ width: `${(timeRemaining / 60) * 100}%` }}
                />
              </div>
              <p className="text-sm text-white/50 mt-2">Click the targets quickly!</p>
            </div>
          </div>

          {targets.map(target => (
            <button
              key={target.id}
              onClick={() => handleTargetClick(target.id, target.spawnTime)}
              className="absolute w-20 h-20 bg-[#00d9ff] rounded-full shadow-[0_0_40px_#00d9ff] animate-pulse cursor-pointer hover:scale-110 transition-transform"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
            <p className="text-sm text-white/70">
              Hits: <span className="text-[#00d9ff] font-bold">{reactionMetrics.totalClicks}</span> • 
              Avg: <span className="text-[#00d9ff] font-bold">{reactionMetrics.averageReactionTime.toFixed(0)}ms</span>
            </p>
          </div>
        </div>
      )}

      {/* Transition Phase */}
      {phase === 'transition' && (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
          {/* Neural network lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: transitionProgress / 100 }}>
            {Array.from({ length: 20 }).map((_, i) => {
              const startX = Math.random() * 100;
              const startY = Math.random() * 100;
              const endX = 50 + (Math.random() - 0.5) * 20;
              const endY = 50 + (Math.random() - 0.5) * 20;
              const delay = i * 50;
              
              return (
                <line
                  key={i}
                  x1={`${startX}%`}
                  y1={`${startY}%`}
                  x2={`${endX}%`}
                  y2={`${endY}%`}
                  stroke="#00d9ff"
                  strokeWidth="2"
                  opacity={transitionProgress > delay ? "0.6" : "0"}
                  style={{
                    transition: 'opacity 0.3s ease-in',
                    filter: 'drop-shadow(0 0 4px #00d9ff)'
                  }}
                />
              );
            })}
            
            {/* Connection nodes */}
            {Array.from({ length: 20 }).map((_, i) => {
              const cx = i < 10 ? Math.random() * 100 : 50 + (Math.random() - 0.5) * 20;
              const cy = i < 10 ? Math.random() * 100 : 50 + (Math.random() - 0.5) * 20;
              const delay = i * 50;
              
              return (
                <circle
                  key={i}
                  cx={`${cx}%`}
                  cy={`${cy}%`}
                  r="4"
                  fill="#00d9ff"
                  opacity={transitionProgress > delay ? "1" : "0"}
                  style={{
                    transition: 'opacity 0.3s ease-in',
                    filter: 'drop-shadow(0 0 6px #00d9ff)'
                  }}
                />
              );
            })}
          </svg>

          <div className="text-center z-10">
            <p 
              className="text-[#00d9ff] text-3xl font-bold mb-4"
              style={{ 
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 20px #00d9ff'
              }}
            >
              ANALYZING NEURAL PATTERNS
            </p>
            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-[#00d9ff] transition-all duration-100"
                style={{ 
                  width: `${transitionProgress}%`,
                  boxShadow: '0 0 10px #00d9ff'
                }}
              />
            </div>
            <p className="text-white/50 mt-4">{transitionProgress}%</p>
          </div>
        </div>
      )}

      {/* Results Phase */}
      {phase === 'results' && (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="max-w-5xl w-full backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-3xl p-12">
            <h1 className="text-5xl font-bold mb-2 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Neural Analysis Complete
            </h1>
            <p className="text-center text-white/50 mb-8">Your cognitive baseline has been established</p>

            {/* 3D Brain Visualization */}
            <div className="relative w-64 h-64 mx-auto mb-12">
              {/* Brain outline */}
              <svg 
                viewBox="0 0 200 200" 
                className="w-full h-full"
                style={{ transform: `rotateY(${brainRotation}deg)`, transformStyle: 'preserve-3d' }}
              >
                {/* Brain shape */}
                <ellipse cx="100" cy="100" rx="80" ry="90" fill="none" stroke="#00d9ff" strokeWidth="2" opacity="0.3" />
                <ellipse cx="100" cy="100" rx="60" ry="70" fill="none" stroke="#00d9ff" strokeWidth="2" opacity="0.3" />
                
                {/* Brain regions colored by performance */}
                {/* Focus region (frontal) */}
                <path
                  d="M 100 20 Q 140 40 140 80 L 120 90 Q 100 70 80 90 L 60 80 Q 60 40 100 20"
                  fill={getScoreColor(calculateScores().focusScore)}
                  opacity="0.6"
                  stroke={getScoreColor(calculateScores().focusScore)}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 10px ${getScoreColor(calculateScores().focusScore)})` }}
                />
                
                {/* Memory region (temporal) */}
                <path
                  d="M 60 80 L 40 100 Q 35 120 45 140 L 70 130 Q 65 110 60 80"
                  fill={getScoreColor(calculateScores().memoryScore)}
                  opacity="0.6"
                  stroke={getScoreColor(calculateScores().memoryScore)}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 10px ${getScoreColor(calculateScores().memoryScore)})` }}
                />
                <path
                  d="M 140 80 L 160 100 Q 165 120 155 140 L 130 130 Q 135 110 140 80"
                  fill={getScoreColor(calculateScores().memoryScore)}
                  opacity="0.6"
                  stroke={getScoreColor(calculateScores().memoryScore)}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 10px ${getScoreColor(calculateScores().memoryScore)})` }}
                />
                
                {/* Reaction region (motor cortex) */}
                <path
                  d="M 70 130 L 45 140 Q 50 160 70 170 Q 85 175 100 175 Q 115 175 130 170 Q 150 160 155 140 L 130 130 Q 115 145 100 145 Q 85 145 70 130"
                  fill={getScoreColor(calculateScores().reactionScore)}
                  opacity="0.6"
                  stroke={getScoreColor(calculateScores().reactionScore)}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 10px ${getScoreColor(calculateScores().reactionScore)})` }}
                />
                
                {/* Neural connections */}
                <line x1="100" y1="50" x2="100" y2="150" stroke="#00d9ff" strokeWidth="1" opacity="0.3" />
                <line x1="60" y1="80" x2="140" y2="80" stroke="#00d9ff" strokeWidth="1" opacity="0.3" />
                <line x1="70" y1="130" x2="130" y2="130" stroke="#00d9ff" strokeWidth="1" opacity="0.3" />
              </svg>
              
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p className="text-xs text-white/50">3D Neural Map</p>
              </div>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-white/70 font-bold mb-2">Focus Endurance</p>
                <p 
                  className="text-6xl font-bold mb-2"
                  style={{ color: getScoreColor(calculateScores().focusScore) }}
                >
                  {calculateScores().focusScore}
                </p>
                <div className="text-xs text-white/50 space-y-1">
                  <p>{focusMetrics.totalTimeOnTarget.toFixed(1)}s on target</p>
                  <p>Avg distance: {focusMetrics.averageDistance.toFixed(1)}px</p>
                </div>
              </div>

              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-white/70 font-bold mb-2">Working Memory</p>
                <p 
                  className="text-6xl font-bold mb-2"
                  style={{ color: getScoreColor(calculateScores().memoryScore) }}
                >
                  {calculateScores().memoryScore}
                </p>
                <div className="text-xs text-white/50 space-y-1">
                  <p>Max sequence: {memoryMetrics.maxSequenceLength}</p>
                  <p>Accuracy: {memoryMetrics.accuracy.toFixed(0)}%</p>
                </div>
              </div>

              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-white/70 font-bold mb-2">Reaction Speed</p>
                <p 
                  className="text-6xl font-bold mb-2"
                  style={{ color: getScoreColor(calculateScores().reactionScore) }}
                >
                  {calculateScores().reactionScore}
                </p>
                <div className="text-xs text-white/50 space-y-1">
                  <p>{reactionMetrics.totalClicks} targets hit</p>
                  <p>Avg: {reactionMetrics.averageReactionTime.toFixed(0)}ms</p>
                </div>
              </div>
            </div>

            {/* Overall score and fitness level */}
            <div className="backdrop-blur-[20px] bg-gradient-to-br from-[#00d9ff]/20 to-purple-500/20 border border-[#00d9ff]/30 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 mb-1">Neural Fitness Level</p>
                  <p 
                    className="text-5xl font-bold"
                    style={{ 
                      fontFamily: 'Orbitron, sans-serif',
                      color: getScoreColor(calculateScores().overallScore)
                    }}
                  >
                    {getInsights().level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 mb-1">Overall Score</p>
                  <p 
                    className="text-7xl font-bold"
                    style={{ color: getScoreColor(calculateScores().overallScore) }}
                  >
                    {calculateScores().overallScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Personalized insight */}
            <div className="backdrop-blur-[20px] bg-white/5 border border-yellow-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚡</div>
                <div>
                  <p className="text-yellow-400 font-bold mb-2">Personalized Training Focus</p>
                  <p className="text-white/80">
                    Your weakest cognitive muscle is <span className="text-yellow-400 font-bold">{getInsights().weakest}</span>. 
                    We'll target this first in your training protocol to maximize neural gains.
                  </p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#00ff88' }} />
                <span className="text-white/50">Elite (80+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#00d9ff' }} />
                <span className="text-white/50">Advanced (60+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
                <span className="text-white/50">Intermediate (40+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                <span className="text-white/50">Beginner (0-39)</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                Return Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-[#00d9ff] text-black font-bold rounded-full hover:shadow-[0_0_30px_#00d9ff] transition-all duration-300"
              >
                Retake Assessment
              </button>
            </div>

            <p className="text-center text-white/30 text-xs mt-6">
              Results saved locally • Create an account to track progress over time
            </p>
          </div>
        </div>
      )}
    </div>
  );
}



