import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
  const [data, setData] = useState(DUMMY_DATA); // Start with dummy data for visuals
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
        // Keep showing dummy data if fetch fails, but show error toast
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Faster refresh for debug
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-white overflow-hidden font-sans relative">
      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-red-500/80 text-white px-4 py-2 rounded shadow-lg backdrop-blur text-xs font-mono">
          ⚠ CONNECTION ERROR: {error} <br/>
          <span className="opacity-75">Showing Simulation Data</span>
        </div>
      )}

      {/* Left Sidebar (30%) */}
      <div className="w-[350px] flex-shrink-0 z-20 relative h-full">
        <DashboardSidebar
          stats={data?.stats}
          countries={data?.countries}
          pages={data?.pages}
        />
      </div>

      {/* Right Globe Area (70%) */}
      <div className="flex-1 relative h-full">
        <Canvas className="w-full h-full" camera={{ position: [0, 0, 16], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6B89FF" />
          <ParticleGlobe routes={data?.routes} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={8}
            maxDistance={30}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>

        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0B0F19] via-transparent to-transparent z-0"></div>
      </div>
    </div>
  );
}

export default App;
