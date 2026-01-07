'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Lazy load 3D scene
const SpaceScene = dynamic(() => import('./components/SpaceScene'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#0a0a0a]" />
});

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function MindGymLanding() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraProgressRef = useRef({ value: 0 });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const ctx = gsap.context(() => {
      // Parallax scroll animation
      gsap.to(cameraProgressRef.current, {
        value: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        }
      });

      // Hero section fade in
      gsap.from('.hero-content', {
        opacity: 0,
        y: 50,
        duration: 1.5,
        delay: 0.5,
        ease: 'power3.out'
      });

      // Problem cards stagger
      gsap.from('.problem-card', {
        opacity: 0,
        y: 80,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: {
          trigger: '.problem-section',
          start: 'top 70%',
          end: 'top 30%',
          toggleActions: 'play none none reverse'
        }
      });

      // Solution section
      gsap.from('.solution-content', {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        scrollTrigger: {
          trigger: '.solution-section',
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="relative w-full bg-[#0a0a0a]">
      {/* 3D Space Scene Background */}
      {isLoaded && <SpaceScene cameraProgress={cameraProgressRef.current} />}

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center px-6">
          <div className="hero-content text-center max-w-4xl">
            <div className="glass-container p-12 rounded-3xl">
              <h1 className="font-orbitron text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Your Mind Deserves a Gym
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-10 font-inter">
                Elite cognitive training in Earth&apos;s orbit
              </p>
              <button 
                onClick={() => router.push('/assessment')}
                className="cta-button px-10 py-5 text-xl font-orbitron font-bold rounded-full bg-[#00d9ff] text-black hover:shadow-cyan transition-all duration-300 hover:scale-105"
              >
                Enter the Protocol
              </button>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="problem-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-6xl w-full">
            <div className="glass-container p-8 rounded-3xl mb-12">
              <h2 className="font-orbitron text-4xl md:text-5xl font-bold text-white text-center mb-4">
                The Crisis
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="problem-card glass-container p-8 rounded-2xl">
                <div className="text-6xl font-orbitron font-bold text-[#00d9ff] mb-4">8s</div>
                <h3 className="font-orbitron text-2xl font-bold text-white mb-3">
                  Attention Span
                </h3>
                <p className="text-white/70 font-inter leading-relaxed">
                  The average human attention span has dropped below that of a goldfish. Your focus is under siege.
                </p>
              </div>

              <div className="problem-card glass-container p-8 rounded-2xl">
                <div className="text-6xl font-orbitron font-bold text-[#00d9ff] mb-4">400%</div>
                <h3 className="font-orbitron text-2xl font-bold text-white mb-3">
                  Dopamine Exhaustion
                </h3>
                <p className="text-white/70 font-inter leading-relaxed">
                  Constant stimulation has burned out your reward circuits. You&apos;re running on empty.
                </p>
              </div>

              <div className="problem-card glass-container p-8 rounded-2xl">
                <div className="text-6xl font-orbitron font-bold text-[#00d9ff] mb-4">-40%</div>
                <h3 className="font-orbitron text-2xl font-bold text-white mb-3">
                  Mental Atrophy
                </h3>
                <p className="text-white/70 font-inter leading-relaxed">
                  Without training, cognitive performance declines 40% by age 60. Use it or lose it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="solution-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="solution-content max-w-5xl text-center">
            <div className="glass-container p-12 rounded-3xl">
              <h2 className="font-orbitron text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Train Like an Athlete,<br />Think Like a Machine
              </h2>
              <p className="text-xl md:text-2xl text-white/80 mb-10 font-inter leading-relaxed">
                Mind Gym combines neuroscience-backed exercises with gamified progression. 
                Build focus, memory, and processing speed in our zero-gravity cognitive arena.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={() => router.push('/assessment')}
                  className="cta-button px-10 py-5 text-xl font-orbitron font-bold rounded-full bg-[#00d9ff] text-black hover:shadow-cyan transition-all duration-300 hover:scale-105"
                >
                  Start Training
                </button>
                <button 
                  onClick={() => router.push('/assessment')}
                  className="px-10 py-5 text-xl font-orbitron font-bold rounded-full border-2 border-[#00d9ff] text-[#00d9ff] hover:bg-[#00d9ff]/10 transition-all duration-300"
                >
                  Take Assessment
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}








