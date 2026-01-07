'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface ProfileData {
  timestamp: number;
  focusScore: number;
  memoryScore: number;
  reactionScore: number;
  overallScore: number;
  rawData: {
    focus: any;
    memory: any;
    reaction: any;
  };
}

interface BrainRegionProps {
  position: [number, number, number];
  color: string;
  intensity: number;
  onClick: () => void;
  activated: boolean;
}

function BrainRegion({ position, color, intensity, onClick, activated }: BrainRegionProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing effect based on intensity
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * (intensity / 100);
      meshRef.current.scale.setScalar(scale);

      // Activation animation
      if (activated) {
        const activationScale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
        meshRef.current.scale.setScalar(activationScale);
      }
    }
  });

  // Show cracks/glitches for weak areas
  const showGlitch = intensity < 60;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : intensity / 200}
          transparent
          opacity={showGlitch ? 0.5 : 0.7}
          wireframe={showGlitch}
        />
      </mesh>

      {/* Energy field for strong areas */}
      {intensity >= 80 && (
        <mesh position={position}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
}

function NeuralPathway({ start, end, thickness }: { start: [number, number, number]; end: [number, number, number]; thickness: number }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#00d9ff" linewidth={thickness} transparent opacity={0.4} />
    </line>
  );
}

function FormingParticles({ forming }: { forming: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current && forming) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        // Move particles toward center
        positions[i] *= 0.95;
        positions[i + 1] *= 0.95;
        positions[i + 2] *= 0.95;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = 10 + Math.random() * 5;
    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#00d9ff" size={0.05} transparent opacity={forming ? 0.6 : 0} />
    </points>
  );
}

function Brain3D({ focusScore, memoryScore, reactionScore, onRegionClick, activationSequence }: {
  focusScore: number;
  memoryScore: number;
  reactionScore: number;
  onRegionClick: (region: string) => void;
  activationSequence: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00ff88';
    if (score >= 60) return '#00d9ff';
    if (score >= 40) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <group ref={groupRef} onPointerDown={() => setAutoRotate(false)} onPointerUp={() => setAutoRotate(true)}>
      {/* Prefrontal Cortex - Focus */}
      <BrainRegion
        position={[0, 1, 1.5]}
        color={getScoreColor(focusScore)}
        intensity={focusScore}
        onClick={() => onRegionClick('focus')}
        activated={activationSequence >= 1}
      />

      {/* Hippocampus - Memory (left and right) */}
      <BrainRegion
        position={[-1.5, 0, 0]}
        color={getScoreColor(memoryScore)}
        intensity={memoryScore}
        onClick={() => onRegionClick('memory')}
        activated={activationSequence >= 2}
      />
      <BrainRegion
        position={[1.5, 0, 0]}
        color={getScoreColor(memoryScore)}
        intensity={memoryScore}
        onClick={() => onRegionClick('memory')}
        activated={activationSequence >= 2}
      />

      {/* Motor Cortex - Reaction */}
      <BrainRegion
        position={[0, 0.5, -1.5]}
        color={getScoreColor(reactionScore)}
        intensity={reactionScore}
        onClick={() => onRegionClick('reaction')}
        activated={activationSequence >= 3}
      />

      {/* Neural pathways */}
      {activationSequence >= 3 && (
        <>
          <NeuralPathway start={[0, 1, 1.5]} end={[-1.5, 0, 0]} thickness={(focusScore + memoryScore) / 50} />
          <NeuralPathway start={[0, 1, 1.5]} end={[1.5, 0, 0]} thickness={(focusScore + memoryScore) / 50} />
          <NeuralPathway start={[0, 1, 1.5]} end={[0, 0.5, -1.5]} thickness={(focusScore + reactionScore) / 50} />
          <NeuralPathway start={[-1.5, 0, 0]} end={[0, 0.5, -1.5]} thickness={(memoryScore + reactionScore) / 50} />
          <NeuralPathway start={[1.5, 0, 0]} end={[0, 0.5, -1.5]} thickness={(memoryScore + reactionScore) / 50} />
        </>
      )}

      {/* Ambient particles */}
      {Array.from({ length: 50 }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 3 + Math.random() * 2;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#00d9ff" transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

function AnimatedScore({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{displayValue}</>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activationSequence, setActivationSequence] = useState(0);
  const [formingBrain, setFormingBrain] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [accentColor, setAccentColor] = useState('#00d9ff');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    // Load profile data from localStorage
    const data = localStorage.getItem('mindGymBaseline');
    if (data) {
      setProfileData(JSON.parse(data));
      
      // Load saved profile name and color
      const savedName = localStorage.getItem('mindGymProfileName');
      const savedColor = localStorage.getItem('mindGymAccentColor');
      if (savedName) setProfileName(savedName);
      if (savedColor) setAccentColor(savedColor);
    }
    setLoading(false);

    // Cinematic entrance animation
    setTimeout(() => setFormingBrain(false), 1000);
    setTimeout(() => setActivationSequence(1), 1500);
    setTimeout(() => setActivationSequence(2), 2000);
    setTimeout(() => setActivationSequence(3), 2500);
  }, []);

  const saveProfileName = () => {
    if (profileName.trim()) {
      localStorage.setItem('mindGymProfileName', profileName);
      setIsEditingName(false);
    }
  };

  const saveAccentColor = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('mindGymAccentColor', color);
  };

  const shareProfile = () => {
    // In production, this would generate a shareable image
    alert('Profile sharing coming soon! Your stats will be exported as a beautiful image.');
  };

  const downloadReport = () => {
    // In production, this would generate a PDF
    alert('PDF report generation coming soon! Your detailed neural breakdown will be available for download.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d9ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Loading neural profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="max-w-2xl backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            No Profile Data Found
          </h1>
          <p className="text-white/70 mb-8">
            Complete the cognitive diagnostic assessment to generate your neural profile.
          </p>
          <button
            onClick={() => router.push('/assessment')}
            className="px-12 py-4 bg-[#00d9ff] text-black font-bold rounded-full text-lg hover:shadow-[0_0_30px_#00d9ff] transition-all duration-300"
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  const getNeuralClassification = (score: number) => {
    if (score >= 90) return 'Elite Operator';
    if (score >= 75) return 'Advanced Thinker';
    if (score >= 50) return 'Developing Mind';
    return 'Beginner Trainee';
  };

  const getMotivationalQuote = (score: number) => {
    if (score >= 90) return "Your mind is already a weapon. Let's make it legendary.";
    if (score >= 75) return "You're operating at high capacity. Time to unlock elite performance.";
    if (score >= 50) return "Your potential is emerging. Consistency will forge greatness.";
    return "Every master was once a beginner. Your transformation starts now.";
  };

  const getGlobalPercentile = (score: number) => {
    if (score >= 95) return 99;
    if (score >= 90) return 95;
    if (score >= 85) return 90;
    if (score >= 80) return 85;
    if (score >= 75) return 75;
    if (score >= 70) return 65;
    if (score >= 60) return 50;
    if (score >= 50) return 35;
    if (score >= 40) return 20;
    return 10;
  };

  const getWeakestArea = () => {
    const scores = [
      { name: 'Focus Endurance', score: profileData.focusScore },
      { name: 'Working Memory', score: profileData.memoryScore },
      { name: 'Reaction Speed', score: profileData.reactionScore }
    ];
    return scores.reduce((min, curr) => curr.score < min.score ? curr : min).name;
  };

  const getStatusIcon = (score: number) => {
    if (score >= 80) return '💪';
    if (score >= 60) return '⚠️';
    return '🔥';
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Needs Work';
    return 'Critical';
  };

  const getComparison = (score: number) => {
    const avgScore = 65;
    const diff = score - avgScore;
    const percentage = Math.abs(Math.round((diff / avgScore) * 100));
    if (diff > 0) return `${percentage}% better than average`;
    if (diff < 0) return `${percentage}% below average`;
    return 'Average performance';
  };

  const getClassificationColor = (score: number) => {
    if (score >= 90) return '#00ff88';
    if (score >= 75) return '#00d9ff';
    if (score >= 60) return '#a855f7';
    if (score >= 40) return '#fbbf24';
    return '#ef4444';
  };

  const getRegionDetails = (region: string) => {
    switch (region) {
      case 'focus':
        return {
          name: 'Prefrontal Cortex',
          domain: 'Focus Endurance',
          score: profileData.focusScore,
          description: 'Controls sustained attention, concentration, and cognitive control.',
          statusIcon: getStatusIcon(profileData.focusScore),
          statusText: getStatusText(profileData.focusScore),
          comparison: getComparison(profileData.focusScore),
          metrics: [
            { label: 'Score', value: `${profileData.focusScore}/100` },
            { label: 'Time on Target', value: `${profileData.rawData.focus.totalTimeOnTarget.toFixed(1)}s` },
            { label: 'Average Distance', value: `${profileData.rawData.focus.averageDistance.toFixed(1)}px` }
          ]
        };
      case 'memory':
        return {
          name: 'Hippocampus',
          domain: 'Working Memory',
          score: profileData.memoryScore,
          description: 'Responsible for encoding, storing, and retrieving information.',
          statusIcon: getStatusIcon(profileData.memoryScore),
          statusText: getStatusText(profileData.memoryScore),
          comparison: getComparison(profileData.memoryScore),
          metrics: [
            { label: 'Score', value: `${profileData.memoryScore}/100` },
            { label: 'Max Sequence', value: `${profileData.rawData.memory.maxSequenceLength} items` },
            { label: 'Accuracy', value: `${profileData.rawData.memory.accuracy.toFixed(0)}%` }
          ]
        };
      case 'reaction':
        return {
          name: 'Motor Cortex',
          domain: 'Reaction Speed',
          score: profileData.reactionScore,
          description: 'Governs voluntary movement and rapid response execution.',
          statusIcon: getStatusIcon(profileData.reactionScore),
          statusText: getStatusText(profileData.reactionScore),
          comparison: getComparison(profileData.reactionScore),
          metrics: [
            { label: 'Score', value: `${profileData.reactionScore}/100` },
            { label: 'Avg Reaction', value: `${profileData.rawData.reaction.averageReactionTime.toFixed(0)}ms` },
            { label: 'Targets Hit', value: `${profileData.rawData.reaction.totalClicks}/${profileData.rawData.reaction.totalTargets || 'N/A'}` }
          ]
        };
      default:
        return null;
    }
  };

  const regionDetails = selectedRegion ? getRegionDetails(selectedRegion) : null;
  const synergyScore = Math.round((Math.min(profileData.focusScore, profileData.memoryScore, profileData.reactionScore) / Math.max(profileData.focusScore, profileData.memoryScore, profileData.reactionScore)) * 100);
  const globalPercentile = getGlobalPercentile(profileData.overallScore);
  const weakestArea = getWeakestArea();
  const targetIntensity = profileData.overallScore < 50 ? 70 : profileData.overallScore < 75 ? 60 : 50;
  const motivationalQuote = getMotivationalQuote(profileData.overallScore);

  const colorThemes = [
    { name: 'Cyan', color: '#00d9ff' },
    { name: 'Purple', color: '#a855f7' },
    { name: 'Orange', color: '#fb923c' },
    { name: 'Green', color: '#00ff88' }
  ];

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

      <div className="relative z-10 container mx-auto px-8 py-12">
        {/* Header with Profile Name */}
        <div className="text-center mb-8">
          {isEditingName ? (
            <div className="flex items-center justify-center gap-4 mb-4">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveProfileName()}
                placeholder="Neural Athlete #4782"
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white text-xl text-center focus:outline-none focus:border-[#00d9ff]"
                autoFocus
              />
              <button
                onClick={saveProfileName}
                className="px-6 py-3 bg-[#00d9ff] text-black font-bold rounded-full hover:shadow-[0_0_20px_#00d9ff] transition-all"
              >
                Save
              </button>
            </div>
          ) : (
            <h1
              className="text-5xl font-bold mb-2 cursor-pointer hover:text-[#00d9ff] transition-colors"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
              onClick={() => setIsEditingName(true)}
            >
              {profileName || 'Click to Name Your Profile'}
            </h1>
          )}
          <p className="text-white/50 text-lg mb-6">
            Interactive 3D visualization of your cognitive performance
          </p>

          {/* Motivational Quote */}
          <div className="max-w-3xl mx-auto backdrop-blur-[30px] bg-gradient-to-r from-[#00d9ff]/20 to-purple-500/20 border border-[#00d9ff]/30 rounded-2xl p-6 mb-6">
            <p className="text-xl italic" style={{ color: accentColor }}>
              &quot;{motivationalQuote}&quot;
            </p>
          </div>

          {/* Color Theme Selector */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-white/50 text-sm">Accent Color:</span>
            {colorThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => saveAccentColor(theme.color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  accentColor === theme.color ? 'border-white scale-110' : 'border-white/30'
                }`}
                style={{ backgroundColor: theme.color }}
                title={theme.name}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Profile Card */}
          <div className="backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-3xl p-8 h-fit">
            <div className="text-center mb-8">
              <p className="text-white/50 text-sm mb-2">Neural Classification</p>
              <h2
                className="text-4xl font-bold mb-4"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  color: getClassificationColor(profileData.overallScore)
                }}
              >
                {getNeuralClassification(profileData.overallScore)}
              </h2>
              <div className="text-7xl font-bold" style={{ color: getClassificationColor(profileData.overallScore) }}>
                <AnimatedScore value={profileData.overallScore} />
              </div>
              <p className="text-white/30 text-sm mt-2">Overall Score</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70">Focus Endurance</span>
                  <span className="font-bold" style={{ color: getClassificationColor(profileData.focusScore) }}>
                    <AnimatedScore value={profileData.focusScore} duration={1500} />
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${profileData.focusScore}%`,
                      backgroundColor: getClassificationColor(profileData.focusScore)
                    }}
                  />
                </div>
              </div>

              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70">Working Memory</span>
                  <span className="font-bold" style={{ color: getClassificationColor(profileData.memoryScore) }}>
                    <AnimatedScore value={profileData.memoryScore} duration={1500} />
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${profileData.memoryScore}%`,
                      backgroundColor: getClassificationColor(profileData.memoryScore)
                    }}
                  />
                </div>
              </div>

              <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70">Reaction Speed</span>
                  <span className="font-bold" style={{ color: getClassificationColor(profileData.reactionScore) }}>
                    <AnimatedScore value={profileData.reactionScore} duration={1500} />
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${profileData.reactionScore}%`,
                      backgroundColor: getClassificationColor(profileData.reactionScore)
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="backdrop-blur-[20px] bg-gradient-to-br from-[#00d9ff]/20 to-purple-500/20 border border-[#00d9ff]/30 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Global Percentile</span>
                <span className="font-bold text-[#00d9ff] text-2xl">Top {100 - globalPercentile}%</span>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Better than {globalPercentile}% of all users
              </p>
            </div>

            <div className="backdrop-blur-[20px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Cognitive Synergy</span>
                <span className="font-bold text-purple-400 text-2xl">
                  <AnimatedScore value={synergyScore} duration={2000} />%
                </span>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Balance between cognitive domains
              </p>
            </div>

            <div className="backdrop-blur-[20px] bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 mb-6">
              <p className="text-white/70 text-sm mb-2">Training Recommendation</p>
              <p className="text-white font-bold">
                Your weakest cognitive muscle is <span className="text-orange-400">{weakestArea}</span>.
              </p>
              <p className="text-white/50 text-xs mt-2">
                We&apos;ll target this first with {targetIntensity}% intensity.
              </p>
            </div>

            <div className="text-xs text-white/30 text-center">
              <p>Assessment completed</p>
              <p>{new Date(profileData.timestamp).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Center Panel - 3D Brain */}
          <div className="backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-3xl p-8 h-[600px]">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                3D Neural Map
              </h3>
              <p className="text-white/50 text-sm">Drag to rotate • Click regions for details</p>
            </div>

            <div className="w-full h-[500px]">
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <OrbitControls enableZoom={true} enablePan={false} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <FormingParticles forming={formingBrain} />
                <Brain3D
                  focusScore={profileData.focusScore}
                  memoryScore={profileData.memoryScore}
                  reactionScore={profileData.reactionScore}
                  onRegionClick={setSelectedRegion}
                  activationSequence={activationSequence}
                />
              </Canvas>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00ff88' }} />
                <span className="text-white/50">Elite</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00d9ff' }} />
                <span className="text-white/50">Advanced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
                <span className="text-white/50">Intermediate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                <span className="text-white/50">Beginner</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Region Details */}
          <div className="backdrop-blur-[30px] bg-white/5 border border-white/10 rounded-3xl p-8 h-fit">
            {regionDetails ? (
              <>
                <div className="mb-6">
                  <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {regionDetails.name}
                  </h3>
                  <p className="text-[#00d9ff] font-bold mb-4">{regionDetails.domain}</p>
                  <p className="text-white/70 text-sm">{regionDetails.description}</p>
                </div>

                <div className="backdrop-blur-[20px] bg-gradient-to-br from-[#00d9ff]/20 to-purple-500/20 border border-[#00d9ff]/30 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <p className="text-white/70 mb-2">Performance Score</p>
                    <p
                      className="text-6xl font-bold mb-2"
                      style={{ color: getClassificationColor(regionDetails.score) }}
                    >
                      <AnimatedScore value={regionDetails.score} duration={1500} />
                    </p>
                    <div className="flex items-center justify-center gap-2 text-2xl">
                      <span>{regionDetails.statusIcon}</span>
                      <span className="text-lg font-bold" style={{ color: getClassificationColor(regionDetails.score) }}>
                        {regionDetails.statusText}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <p className="text-white/70 text-sm mb-2">Comparison</p>
                  <p className="text-white font-bold">{regionDetails.comparison}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-white/50 text-sm font-bold mb-2">Detailed Metrics</p>
                  {regionDetails.metrics.map((metric, index) => (
                    <div key={index} className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">{metric.label}</span>
                        <span className="font-bold text-[#00d9ff]">{metric.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Select a Region
                </h3>
                <p className="text-white/50">
                  Click on any brain region in the 3D model to view detailed performance metrics and insights.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-12">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
          <button
            onClick={() => router.push('/assessment')}
            className="px-8 py-4 backdrop-blur-[20px] bg-white/5 border border-[#00d9ff]/30 rounded-full font-bold hover:bg-[#00d9ff]/10 transition-all"
          >
            Retake Assessment
          </button>
          <button
            onClick={shareProfile}
            className="px-8 py-4 backdrop-blur-[20px] bg-white/5 border border-purple-500/30 rounded-full font-bold hover:bg-purple-500/10 transition-all"
          >
            📤 Share Profile
          </button>
          <button
            onClick={downloadReport}
            className="px-8 py-4 backdrop-blur-[20px] bg-white/5 border border-orange-500/30 rounded-full font-bold hover:bg-orange-500/10 transition-all"
          >
            📄 Download Report
          </button>
          <button
            onClick={() => {
              alert('Training protocol generation coming soon!');
            }}
            className="group relative px-12 py-4 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black font-bold rounded-full hover:shadow-[0_0_40px_#00d9ff] transition-all duration-500 transform hover:scale-105"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <span className="relative z-10">Generate Training Protocol</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

