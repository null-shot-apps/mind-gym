'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Phase = 'intro' | 'focus' | 'memory' | 'reaction' | 'results';

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

  const colors = ['#00d9ff', '#a855f7', '#fb923c', '#ffffff'];

  // Start assessment
  const startAssessment = () => {
    setPhase('focus');
    setTimeRemaining(60);
    focusStartTime.current = Date.now();
    lastDotMove.current = Date.now();
  };

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
    if (phase === 'intro' || phase === 'results') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (phase === 'focus') {
            setFocusMetrics(prev => ({
              ...prev,
              averageDistance: distanceSum.current / distanceCount.current
            }));
            setPhase('memory');
            return 60;
          } else if (phase === 'memory') {
            setPhase('reaction');
            return 60;
          } else if (phase === 'reaction') {
            setReactionMetrics(prev => ({
              ...prev,
              missedTargets: missedCount.current
            }));
            setPhase('results');
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Calculate scores
  const calculateScores = () => {
    const focusScore = Math.min(100, Math.round((focusMetrics.totalTimeOnTarget / 60) * 100));
    const memoryScore = Math.min(100, Math.round((memoryMetrics.maxSequenceLength / 9) * 100));
    const reactionScore = Math.min(100, Math.round((reactionMetrics.totalClicks / 60) * 100));
    const overallScore = Math.round((focusScore + memoryScore + reactionScore) / 3);

    return { focusScore, memoryScore, reactionScore, overallScore };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
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
              <p className="text-sm text-white/50 mt-1">Keep your cursor on the cyan dot</p>
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
              <p className="text-sm text-white/50 mt-1">Sequence length: {sequenceLength}</p>
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
              <p className="text-sm text-white/50 mt-1">Click the targets quickly!</p>
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

      {/* Results Phase */}
      {phase === 'results' && (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="max-w-4xl w-full backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-3xl p-12">
            <h1 className="text-5xl font-bold mb-8 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Assessment Complete
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-[#00d9ff] font-bold mb-2">Focus Endurance</p>
                <p className="text-5xl font-bold mb-2">{calculateScores().focusScore}</p>
                <p className="text-sm text-white/50">{focusMetrics.totalTimeOnTarget.toFixed(1)}s on target</p>
              </div>

              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-[#00d9ff] font-bold mb-2">Working Memory</p>
                <p className="text-5xl font-bold mb-2">{calculateScores().memoryScore}</p>
                <p className="text-sm text-white/50">Max sequence: {memoryMetrics.maxSequenceLength}</p>
              </div>

              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-[#00d9ff] font-bold mb-2">Reaction Speed</p>
                <p className="text-5xl font-bold mb-2">{calculateScores().reactionScore}</p>
                <p className="text-sm text-white/50">{reactionMetrics.totalClicks} targets hit</p>
              </div>
            </div>

            <div className="backdrop-blur-[20px] bg-white/5 border border-[#00d9ff]/30 rounded-2xl p-8 mb-8 text-center">
              <p className="text-white/70 mb-2">Overall Cognitive Performance</p>
              <p className="text-7xl font-bold text-[#00d9ff]">{calculateScores().overallScore}</p>
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
}

