import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Apple from './Apple';
import { makeSignTexture, makeStripeTexture } from '../lib/textures';
import { seeded } from '../lib/random';
import { useHoverCursor } from '../lib/cursor';
import { damp } from '../lib/scroll';

const wood = new THREE.MeshStandardMaterial({ color: '#3E2723', roughness: 0.9 });
const woodLight = new THREE.MeshStandardMaterial({ color: '#5A3F35', roughness: 0.9 });
const plank = new THREE.MeshStandardMaterial({ color: '#A98A72', roughness: 0.9 });

function FruitCrate({ item, x, selected, onSelect, children }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  useHoverCursor(hovered);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const k = damp(0.001, dt);
    const y = hovered || selected ? 0.14 : 0;
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, y, k);
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, selected ? 1.06 : 1, k));
  });
  return (
    <group
      ref={ref}
      position={[x, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
    >
      <mesh material={plank} position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.36, 1.1]} />
      </mesh>
      <mesh material={wood} position={[0, 0.02, 0]}>
        <boxGeometry args={[1.56, 0.06, 1.16]} />
      </mesh>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <ringGeometry args={[0.95, 1.05, 48]} />
          <meshBasicMaterial color="#4A7C23" transparent opacity={0.85} />
        </mesh>
      )}
      <group position={[0, 0.36, 0]}>{children}</group>
    </group>
  );
}

function Cherries({ count = 26 }) {
  const items = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: count }, () => ({
      p: [(r() - 0.5) * 1.15, r() * 0.18, (r() - 0.5) * 0.8],
      c: r() > 0.5 ? '#7A1020' : '#8E1428',
    }));
  }, [count]);
  return items.map((it, i) => (
    <mesh key={i} position={it.p} castShadow>
      <sphereGeometry args={[0.11, 16, 12]} />
      <meshStandardMaterial color={it.c} roughness={0.25} />
    </mesh>
  ));
}

function Plums({ count = 16 }) {
  const items = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: count }, () => ({
      p: [(r() - 0.5) * 1.1, 0.08 + r() * 0.14, (r() - 0.5) * 0.75],
      rot: [r() * 0.6, r() * Math.PI, r() * 0.6],
      c: r() > 0.5 ? '#4B2A6B' : '#5C3580',
    }));
  }, [count]);
  return items.map((it, i) => (
    <mesh key={i} position={it.p} rotation={it.rot} scale={[0.15, 0.19, 0.15]} castShadow>
      <sphereGeometry args={[1, 16, 12]} />
      <meshStandardMaterial color={it.c} roughness={0.35} />
    </mesh>
  ));
}

function Apples() {
  const items = useMemo(() => {
    const r = seeded(21);
    return Array.from({ length: 11 }, (_, i) => ({
      p: [(r() - 0.5) * 1.05, i < 7 ? 0.12 : 0.34, (r() - 0.5) * 0.5],
      c: r() > 0.7 ? '#D8283F' : '#C41E3A',
    }));
  }, []);
  return items.map((it, i) => <Apple key={i} position={it.p} scale={0.3} color={it.c} interactive={false} />);
}

/** Der Marktstand: Markise, Pfosten, Tisch, Schild, drei klickbare Obstkisten. */
export default function MarketStall({ selected, onSelect }) {
  const stripes = useMemo(() => makeStripeTexture(), []);
  const sign = useMemo(() => makeSignTexture(), []);
  const root = useRef();

  useFrame(({ pointer }, dt) => {
    if (!root.current) return;
    const k = damp(0.01, dt);
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, pointer.x * 0.28, k);
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, -pointer.y * 0.08, k);
  });

  return (
    <group ref={root} position={[0, -1.2, 0]}>
      {/* Boden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.5, 48]} />
        <meshStandardMaterial color="#8F7358" roughness={1} />
      </mesh>
      {/* Pfosten */}
      {[-2.6, 2.6].map((x) =>
        [-1.1, 1.1].map((z) => (
          <mesh key={`${x}${z}`} material={wood} position={[x, 1.6, z]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 3.2, 10]} />
          </mesh>
        )),
      )}
      {/* Markise */}
      <group position={[0, 3.3, 0]}>
        <mesh rotation={[0.18, 0, 0]} position={[0, 0, 0.15]} castShadow>
          <boxGeometry args={[6, 0.08, 3]} />
          <meshStandardMaterial map={stripes} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Bogenkante */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[-2.63 + i * 0.75, -0.28, 1.62]} rotation={[0.1, 0, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.06, 20, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color={i % 2 ? '#C41E3A' : '#F8F5F0'} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      {/* Rückwand + Schild */}
      <mesh material={woodLight} position={[0, 1.7, -1.2]} receiveShadow>
        <boxGeometry args={[5.4, 2.6, 0.08]} />
      </mesh>
      <mesh position={[0, 2.3, -1.15]}>
        <planeGeometry args={[3.6, 1.12]} />
        <meshStandardMaterial map={sign} roughness={0.7} />
      </mesh>
      {/* Tisch */}
      <mesh material={plank} position={[0, 0.98, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[5.6, 0.12, 2.2]} />
      </mesh>
      <mesh material={wood} position={[0, 0.5, 0.2]}>
        <boxGeometry args={[5.2, 0.9, 1.8]} />
      </mesh>
      {/* Obstkisten */}
      <group position={[0, 1.04, 0.35]}>
        <FruitCrate item={{ id: 'apfel' }} x={-1.85} selected={selected === 'apfel'} onSelect={onSelect}>
          <Apples />
        </FruitCrate>
        <FruitCrate item={{ id: 'kirsche' }} x={0} selected={selected === 'kirsche'} onSelect={onSelect}>
          <Cherries />
        </FruitCrate>
        <FruitCrate item={{ id: 'zwetsche' }} x={1.85} selected={selected === 'zwetsche'} onSelect={onSelect}>
          <Plums />
        </FruitCrate>
      </group>
    </group>
  );
}
