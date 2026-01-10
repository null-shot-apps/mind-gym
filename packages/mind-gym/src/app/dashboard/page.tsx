'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const OrbitalGymHub = dynamic(() => import('../components/OrbitalGymHub'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-cyan-400 text-xl animate-pulse">Initializing Orbital Hub...</div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl animate-pulse">Loading...</div>
      </div>
    }>
      <OrbitalGymHub />
    </Suspense>
  );
}

