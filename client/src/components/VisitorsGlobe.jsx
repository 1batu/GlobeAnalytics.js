import React, { useEffect, useState, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { fetchVisitors } from '../services/api';

const VisitorsGlobe = () => {
  const globeEl = useRef();
  const [visitors, setVisitors] = useState([]);
  const [arcs, setArcs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchVisitors();
      setVisitors(data);

      // Generate random arcs for visual effect (or connect to a "HQ" if we had one)
      // For now, let's just create some arcs between random points in the data to simulate traffic
      if (data.length > 1) {
        const newArcs = [];
        for (let i = 0; i < Math.min(data.length, 20); i++) {
          const start = data[Math.floor(Math.random() * data.length)];
          const end = data[Math.floor(Math.random() * data.length)];
          if (start !== end) {
            newArcs.push({
              startLat: start.lat,
              startLng: start.lng,
              endLat: end.lat,
              endLng: end.lng,
              color: ['#ff0000', '#ffffff'][Math.round(Math.random())]
            });
          }
        }
        setArcs(newArcs);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const globeMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial();
    material.bumpScale = 10;
    new THREE.TextureLoader().load('//unpkg.com/three-globe/example/img/earth-topology.png', texture => {
      material.bumpMap = texture;
      material.needsUpdate = true;
    });
    return material;
  }, []);

  return (
    <div className="w-full h-screen bg-black">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        globeMaterial={globeMaterial}

        // Points (Visitors)
        pointsData={visitors}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => '#ffcc00'}
        pointAltitude={0.1}
        pointRadius={0.5} // Size based on activeUsers?
        pointsMerge={true}

        // Rings (Pulse effect)
        ringsData={visitors}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => '#ffcc00'}
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1000}

        // Arcs
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={4}
        arcDashInitialGap={() => Math.random() * 5}
        arcDashAnimateTime={1000}

        // Labels
        labelsData={visitors}
        labelLat="lat"
        labelLng="lng"
        labelText={d => `${d.city}, ${d.country} (${d.activeUsers})`}
        labelSize={1.5}
        labelDotRadius={0.4}
        labelColor={() => 'rgba(255, 255, 255, 0.75)'}
        labelResolution={2}
      />

      <div className="absolute top-4 left-4 text-white z-10 pointer-events-none">
        <h1 className="text-3xl font-bold">GlobeAnalytics</h1>
        <p className="text-sm opacity-70">Real-time Visitor Map</p>
        <div className="mt-2">
          <p className="text-xs">Active Users: {visitors.reduce((acc, curr) => acc + curr.activeUsers, 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default VisitorsGlobe;
