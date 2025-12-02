import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Let's do the replacement in chunks.

// Chunk 1: Imports
// Chunk 2: PulseMarker usage in map
// Chunk 3: PulseMarker definition

// ... wait, I can do this in one go if I'm careful, or multiple chunks.
// Let's use multiple chunks for safety.

const ParticleGlobe = ({ routes }) => {
  const meshRef = useRef();
  const globeRef = useRef();
  const [dummyData, setDummyData] = useState([]);

  // Load Earth Texture for the base sphere
  const [earthMap] = useLoader(THREE.TextureLoader, [
    '//unpkg.com/three-globe/example/img/earth-night.jpg'
  ]);

  // Generate dots using Fibonacci Sphere (Procedural)
  useEffect(() => {
    const temp = [];
    const N = 5000; // More dots
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      const r = 5.1; // Clearly above the sphere
      temp.push({ x: x * r, y: y * r, z: z * r });
    }
    setDummyData(temp);
  }, []);

  // Update InstancedMesh
  useEffect(() => {
    if (!meshRef.current || dummyData.length === 0) return;

    const tempObject = new THREE.Object3D();
    const color = new THREE.Color();

    dummyData.forEach((d, i) => {
      tempObject.position.set(d.x, d.y, d.z);
      tempObject.lookAt(0, 0, 0);

      const scale = 0.5 + Math.random() * 0.5; // Larger dots
      tempObject.scale.set(scale, scale, 1);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Brighter Colors
      if (Math.random() > 0.7) color.setHex(0x00ffff); // Cyan
      else color.setHex(0x4f46e5); // Indigo

      meshRef.current.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [dummyData]);

  useFrame(() => {
    if (globeRef.current) {
      // Rotation speed
      globeRef.current.rotation.y -= 0.001;
    }
  });

  useEffect(() => {
    if (globeRef.current) {
      // Initial rotation to face Turkey (35°E)
      // Camera looks at -90° (Americas) by default geometry
      // We need to rotate ~125 degrees to bring Turkey to front
      globeRef.current.rotation.y = -2.2;
    }
  }, []);

  return (
    <group ref={globeRef}>
      {/* 1. Base Realistic Sphere - Deep Blue/Purple */}
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshPhongMaterial
          color="#1e1b4b" // Deep Indigo
          emissive="#0f172a" // Dark Slate
          specular="#60a5fa" // Blue highlight
          shininess={20}
        />
      </mesh>

      {/* 2. Procedural Dots Layer - White/Light Blue */}
      {dummyData.length > 0 && (
        <instancedMesh ref={meshRef} args={[null, null, dummyData.length]}>
          <circleGeometry args={[0.05, 8]} />
          <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.6} blending={THREE.AdditiveBlending} toneMapped={false} />
        </instancedMesh>
      )}

      {/* 3. Atmosphere Glow - Bright Cyan */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial
          color="#3b82f6" // Bright Blue
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Arcs & Markers */}
      {routes && routes.map((route, i) => (
        <React.Fragment key={i}>
          <Arc start={{lat: route.startLat, lng: route.startLng}} end={{lat: route.endLat, lng: route.endLng}} />
          <DataBar lat={route.startLat} lng={route.startLng} label={route.label} />
        </React.Fragment>
      ))}
    </group>
  );
};

const DataBar = ({ lat, lng, label }) => {
  const meshRef = useRef();

  const position = useMemo(() => {
    const radius = 5.0;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [lat, lng]);

  // Calculate rotation to stand perpendicular to surface
  const quaternion = useMemo(() => {
    const dummy = new THREE.Object3D();
    dummy.position.copy(position);
    dummy.lookAt(0, 0, 0);
    return dummy.quaternion;
  }, [position]);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulse height
      const t = state.clock.getElapsedTime();
      const scaleY = 1 + Math.sin(t * 3 + lat) * 0.3;
      meshRef.current.scale.set(1, scaleY, 1);
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      {/* Vertical Bar */}
      <mesh ref={meshRef} position={[0, 0, 1]} rotation={[Math.PI / 2, 0, 0]}> {/* Rotate to point out */}
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} /> {/* Tall thin bar */}
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Base Ring */}
      <mesh position={[0, 0, 0.1]} rotation={[0, 0, 0]}>
         <circleGeometry args={[0.15, 16]} />
         <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Text Label */}
      {label && (
        <Text
          position={[0, 2.5, 0]} // Top of the bar
          rotation={[Math.PI / 2, Math.PI, 0]} // Face camera (approx) - actually needs billboard behavior
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="bottom"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

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
    const distance = startPos.distanceTo(endPos);
    const midHeight = 5 + distance * 0.7; // Higher arcs
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
      <lineBasicMaterial color="#ff4081" opacity={0.8} transparent linewidth={2} toneMapped={false} /> {/* Hot Pink */}
    </line>
  );
};

export default ParticleGlobe;
