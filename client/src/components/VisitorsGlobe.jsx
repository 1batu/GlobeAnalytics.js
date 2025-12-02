import React, { useEffect, useState, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { fetchVisitors } from '../services/api';
import Starfield from './Starfield';
import HudOverlay from './HudOverlay';
import TelemetryPanel from './TelemetryPanel';

// Import Shaders (Raw strings for simplicity in this setup, or use vite plugin)
import atmosphereVertexShader from '../shaders/atmosphereVertex.glsl?raw';
import atmosphereFragmentShader from '../shaders/atmosphereFragment.glsl?raw';

const VisitorsGlobe = () => {
  const globeEl = useRef();
  const [visitors, setVisitors] = useState([]);
  const [arcs, setArcs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchVisitors();
      setVisitors(data);

      if (data.length > 1) {
        const newArcs = [];
        // Create arcs from all cities to a central "HQ" (e.g., Istanbul) or random
        // For SpaceX vibe, let's connect major hubs
        for (let i = 0; i < Math.min(data.length, 20); i++) {
          const start = data[Math.floor(Math.random() * data.length)];
          const end = data[Math.floor(Math.random() * data.length)];
          if (start !== end) {
            newArcs.push({
              startLat: start.lat,
              startLng: start.lng,
              endLat: end.lat,
              endLng: end.lng,
              color: ['#00CFFF', '#ffffff'] // Cyan to White
            });
          }
        }
        setArcs(newArcs);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.3;
      globeEl.current.pointOfView({ altitude: 2.2 });

      // Add Atmosphere Glow Mesh
      const globeRadius = globeEl.current.getGlobeRadius();
      const geometry = new THREE.SphereGeometry(globeRadius + 2, 64, 64);
      const material = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        uniforms: {}
      });
      const atmosphere = new THREE.Mesh(geometry, material);
      globeEl.current.scene().add(atmosphere);
    }
  }, []);

  // Aggregate Data by Country
  const countryData = useMemo(() => {
    const countryMap = {};
    visitors.forEach(v => {
      if (!countryMap[v.country]) {
        countryMap[v.country] = {
          name: v.country,
          activeUsers: 0,
          latSum: 0,
          lngSum: 0,
          count: 0
        };
      }
      const c = countryMap[v.country];
      c.activeUsers += v.activeUsers;
      c.latSum += v.lat;
      c.lngSum += v.lng;
      c.count += 1;
    });

    return Object.values(countryMap).map(c => ({
      country: c.name,
      activeUsers: c.activeUsers,
      lat: c.latSum / c.count,
      lng: c.lngSum / c.count,
      size: Math.sqrt(c.activeUsers)
    })).sort((a, b) => b.activeUsers - a.activeUsers);
  }, [visitors]);

  const customLayerData = useMemo(() => visitors.map(d => ({
    lat: d.lat,
    lng: d.lng,
    size: Math.min(d.activeUsers * 0.8, 8),
    color: '#00CFFF',
    city: d.city
  })), [visitors]);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Layer 1: Starfield Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Starfield count={6000} />
        </Canvas>
      </div>

      {/* Layer 2: Globe */}
      <div className="absolute inset-0 z-10">
        <Globe
          ref={globeEl}
          backgroundColor="rgba(0,0,0,0)" // Transparent
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

          // Atmosphere (Built-in + Custom Shader above)
          atmosphereColor="#00CFFF"
          atmosphereAltitude={0.15}

          // Arcs
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcDashLength={0.5}
          arcDashGap={2}
          arcDashInitialGap={() => Math.random() * 5}
          arcDashAnimateTime={2000}
          arcStroke={0.6}

          // 3D Bars (Cities)
          customLayerData={customLayerData}
          customThreeObject={d => {
            const geometry = new THREE.CylinderGeometry(0.1, 0.1, d.size, 8);
            geometry.translate(0, d.size / 2, 0);
            const material = new THREE.MeshPhongMaterial({
              color: d.color,
              emissive: d.color,
              emissiveIntensity: 1,
              transparent: true,
              opacity: 0.9
            });
            return new THREE.Mesh(geometry, material);
          }}
          customThreeObjectUpdate={(obj, d) => {
            Object.assign(obj.position, globeEl.current.getCoords(d.lat, d.lng, 0.01));
            obj.lookAt(new THREE.Vector3(0, 0, 0));
            obj.rotateX(Math.PI / 2);
          }}

          // Labels (Countries)
          labelsData={countryData}
          labelLat="lat"
          labelLng="lng"
          labelText={d => d.country.toUpperCase()}
          labelSize={d => Math.max(0.5, Math.min(d.size * 0.4, 1.5))}
          labelDotRadius={0.2}
          labelColor={() => 'rgba(200, 255, 255, 0.8)'}
          labelResolution={2}
          labelAltitude={0.02}
          labelTypeFace="Orbitron"

          // Rings (Pulse)
          ringsData={visitors}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => '#00CFFF'}
          ringMaxRadius={5}
          ringPropagationSpeed={4}
          ringRepeatPeriod={600}
        />
      </div>

      {/* Layer 3: HUD & UI */}
      <HudOverlay />
      <TelemetryPanel visitors={visitors} countryData={countryData} />

      {/* Scanline Overlay */}
      <div className="absolute inset-0 z-40 pointer-events-none bg-[url('https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif')] opacity-[0.02] mix-blend-overlay"></div>
      <div className="absolute inset-0 z-40 pointer-events-none bg-gradient-to-t from-cyan-900/20 to-transparent"></div>
    </div>
  );
};

export default VisitorsGlobe;
