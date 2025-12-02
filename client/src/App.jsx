import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import DashboardSidebar from './components/DashboardSidebar';
import ParticleGlobe from './components/ParticleGlobe';

const DUMMY_DATA = {
  stats: { activeUsers: 1240, uniqueCountries: 45, uniqueCities: 120, totalPageViews: 8500 },
  countries: [
    { name: 'Turkey', activeUsers: 450 },
    { name: 'Germany', activeUsers: 200 },
    { name: 'USA', activeUsers: 150 },
    { name: 'Netherlands', activeUsers: 100 },
    { name: 'UK', activeUsers: 80 }
  ],
  pages: [
    { path: '/', views: 500 },
    { path: '/pricing', views: 300 },
    { path: '/blog', views: 200 }
  ],
  routes: [
    { startLat: 52.52, startLng: 13.405, endLat: 39.93, endLng: 32.85 }, // Berlin -> Ankara
    { startLat: 40.71, startLng: -74.00, endLat: 39.93, endLng: 32.85 }, // NYC -> Ankara
    { startLat: 51.50, startLng: -0.12, endLat: 39.93, endLng: 32.85 }, // London -> Ankara
  ]
};

function App() {
  const [data, setData] = useState(DUMMY_DATA);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard-data');
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError(err.message);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#020202] text-white overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-100">

      {/* 1. Full Screen Globe Background */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Canvas
          className="w-full h-full block"
          style={{ width: '100vw', height: '100vh' }}
          camera={{ position: [0, 0, 16], fov: 45 }}
        >
          <color attach="background" args={['#020202']} />

          <ambientLight intensity={3} />
          <pointLight position={[20, 20, 20]} intensity={4} color="#ffffff" />
          <pointLight position={[-20, -10, -20]} intensity={2} color="#4f46e5" />

          <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />

          <ParticleGlobe routes={data?.routes} />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={6}
            maxDistance={25}
            autoRotate
            autoRotateSpeed={0.5}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>

      {/* 2. Floating Sidebar Overlay */}
      <div className="absolute top-0 left-0 h-full w-[400px] z-10 p-6 pointer-events-none">
        {/* Pointer events auto re-enabled on the sidebar content itself */}
        <div className="h-full w-full pointer-events-auto">
          <DashboardSidebar
            stats={data?.stats}
            countries={data?.countries}
            pages={data?.pages}
          />
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-red-500/80 text-white px-4 py-2 rounded shadow-lg backdrop-blur text-xs font-mono">
          ⚠ CONNECTION ERROR: {error} <br/>
          <span className="opacity-75">Showing Simulation Data</span>
        </div>
      )}
    </div>
  );
}

export default App;
