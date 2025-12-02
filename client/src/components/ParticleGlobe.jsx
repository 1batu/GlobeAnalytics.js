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
      {/* 1. Base Realistic Sphere - Brighter */}
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshPhongMaterial
          map={earthMap}
          color="#aaaaaa"
          emissive="#222222"
          specular="#555555"
          shininess={10}
        />
      </mesh>

      {/* 2. Procedural Dots Layer - Larger and Brighter */}
      {dummyData.length > 0 && (
        <instancedMesh ref={meshRef} args={[null, null, dummyData.length]}>
          <circleGeometry args={[0.06, 8]} /> {/* Larger dots */}
          <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.8} blending={THREE.AdditiveBlending} toneMapped={false} />
        </instancedMesh>
      )}

      {/* 3. Atmosphere Glow - Stronger */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial
          color="#4f46e5"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Arcs */}
      {routes && routes.map((route, i) => (
        <React.Fragment key={i}>
          <Arc start={{lat: route.startLat, lng: route.startLng}} end={{lat: route.endLat, lng: route.endLng}} />
          <PulseMarker lat={route.startLat} lng={route.startLng} label={route.label} />
        </React.Fragment>
      ))}
    </group>
  );
};

const PulseMarker = ({ lat, lng, label }) => {
  const meshRef = useRef();

  // Convert lat/lng to 3D position
  const position = useMemo(() => {
    const radius = 5.1; // Same as dots
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [lat, lng]);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulse animation - More subtle
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 3) * 0.2; // Reduced pulse scale
      meshRef.current.scale.set(scale, scale, scale);

      // Look at center to align with surface normal
      meshRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <circleGeometry args={[0.08, 16]} /> {/* Smaller radius */}
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* Text Label */}
      {label && (
        <Text
          position={[0, 0.15, 0]}
          // Actually, Text needs to be oriented correctly.
          // Since the group is at 'position', we can just offset the text slightly outward or 'up' in local space.
          // But 'up' in local space depends on rotation.
          // Simplest is to make Text look at camera.
          fontSize={0.15}
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
    const midHeight = 5 + distance * 0.6;
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
      <lineBasicMaterial color="#00ffff" opacity={1} transparent linewidth={3} toneMapped={false} />
    </line>
  );
};

export default ParticleGlobe;
