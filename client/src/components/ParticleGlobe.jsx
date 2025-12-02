import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

const ParticleGlobe = ({ routes }) => {
  const globeRef = useRef();
  const [particles, setParticles] = useState(new Float32Array(0));

  // Load Earth Texture for Sampling
  useEffect(() => {
    const img = new Image();
    img.src = '//unpkg.com/three-globe/example/img/earth-dark.jpg';
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const positions = [];
      const step = 3; // Skip pixels for performance/density control

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          // Simple threshold: if pixel is bright enough, it's land (in this specific dark map, land is lighter)
          if (r > 30) {
            const lat = 90 - (y / canvas.height) * 180;
            const lng = (x / canvas.width) * 360 - 180;

            // Convert to 3D
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);
            const rad = 5;

            const vx = -(rad * Math.sin(phi) * Math.cos(theta));
            const vy = rad * Math.cos(phi);
            const vz = rad * Math.sin(phi) * Math.sin(theta);

            positions.push(vx, vy, vz);
          }
        }
      }
      setParticles(new Float32Array(positions));
    };
  }, []);

  useFrame((state) => {
    if (globeRef.current) {
      // Very slow rotation to keep it alive but focused on Turkey
      globeRef.current.rotation.y += 0.0002;
    }
  });

  return (
    // Reset rotation to default to ensure it's centered
    <group ref={globeRef}>
      {/* Core Sphere (Deep Ocean) */}
      <mesh>
        <sphereGeometry args={[4.9, 64, 64]} />
        <meshPhongMaterial
          color="#050810"
          emissive="#000000"
          specular="#111111"
          shininess={10}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial
          color="#1c2e4a"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Particle Continents */}
      {particles.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particles.length / 3}
              array={particles}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            color="#4facfe" // Cyan-Blue
            transparent
            opacity={0.8}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Arcs Layer */}
      {routes && routes.map((route, i) => (
        <Arc key={i} start={{lat: route.startLat, lng: route.startLng}} end={{lat: route.endLat, lng: route.endLng}} />
      ))}
    </group>
  );
};

// Improved Arc Component
const Arc = ({ start, end }) => {
  const curve = useMemo(() => {
    const getPos = (lat, lng, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    const startPos = getPos(start.lat, start.lng, 5);
    const endPos = getPos(end.lat, end.lng, 5);

    // Calculate mid-point height based on distance
    const distance = startPos.distanceTo(endPos);
    const midHeight = 5 + distance * 0.5;

    const midPos = startPos.clone().add(endPos).multiplyScalar(0.5).normalize().multiplyScalar(midHeight);

    return new THREE.QuadraticBezierCurve3(startPos, midPos, endPos);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ff00cc" opacity={0.8} transparent linewidth={2} />
    </line>
  );
};

export default ParticleGlobe;
