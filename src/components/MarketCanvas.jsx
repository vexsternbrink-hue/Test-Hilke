import { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import MarketStall from '../three/MarketStall';

export default function MarketCanvas({ selected, onSelect }) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ fov: 38, position: [0, 2.2, 9.5], near: 0.1, far: 60 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#EFE7DA']} />
      <hemisphereLight args={['#fff4e0', '#8F7358', 0.7]} />
      <ambientLight intensity={0.3} />
      <directionalLight castShadow position={[5, 8, 5]} intensity={2} color="#fff1d6" shadow-mapSize={[1024, 1024]} />
      <Suspense fallback={null}>
        <MarketStall selected={selected} onSelect={onSelect} />
        <ContactShadows position={[0, -1.19, 0]} opacity={0.4} scale={14} blur={2.2} far={6} />
      </Suspense>
    </Canvas>
  );
}
