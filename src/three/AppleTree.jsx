import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Apple from './Apple';
import { seeded } from '../lib/random';

const trunkMat = new THREE.MeshStandardMaterial({ color: '#3E2723', roughness: 0.95 });
const foliageMats = ['#4A7C23', '#3F6B1E', '#5A9130'].map(
  (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: false }),
);

/**
 * Der Hero-Apfelbaum: Stamm, Äste, Laubkugeln und interaktive Äpfel.
 * `wind` (0..1) steuert die Stärke des Wiegens.
 */
export default function AppleTree({ seed = 7, wind = 1, apples = 20, interactive = true, ...props }) {
  const group = useRef();
  const foliage = useRef([]);

  const layout = useMemo(() => {
    const r = seeded(seed + 1);
    const balls = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + r() * 0.6;
      const rad = i === 0 ? 0 : 0.9 + r() * 0.9;
      balls.push({
        pos: [Math.cos(a) * rad, 2.6 + (r() - 0.3) * 1.4 + (i === 0 ? 0.4 : 0), Math.sin(a) * rad * 0.8],
        size: i === 0 ? 1.7 : 0.9 + r() * 0.7,
        mat: i % 3,
        phase: r() * Math.PI * 2,
      });
    }
    const fruit = [];
    for (let i = 0; i < apples; i++) {
      const b = balls[1 + Math.floor(r() * (balls.length - 1))];
      const theta = r() * Math.PI * 2;
      const phi = Math.acos(2 * r() - 1);
      const rr = b.size * 1.04;
      fruit.push({
        pos: [
          b.pos[0] + rr * Math.sin(phi) * Math.cos(theta),
          b.pos[1] + rr * Math.cos(phi) * 0.8,
          // Äpfel bevorzugt zur Kamera (+z) hin, damit sie sichtbar bleiben
          b.pos[2] + Math.abs(rr * Math.sin(phi) * Math.sin(theta)) * 0.9 + 0.25,
        ],
        scale: 0.22 + r() * 0.08,
        color: r() > 0.75 ? '#D8283F' : '#C41E3A',
      });
    }
    const branches = [
      { rot: [0, 0, 0.9], pos: [-0.45, 2.0, 0], len: 1.4 },
      { rot: [0, 0, -0.8], pos: [0.5, 2.2, 0.1], len: 1.3 },
      { rot: [0.9, 0, 0], pos: [0, 2.1, -0.4], len: 1.1 },
      { rot: [-0.8, 0.3, 0], pos: [0.1, 2.3, 0.4], len: 1.0 },
    ];
    return { balls, fruit, branches };
  }, [seed, apples]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.z = Math.sin(t * 0.7) * 0.018 * wind + Math.sin(t * 1.9) * 0.006 * wind;
    group.current.rotation.x = Math.cos(t * 0.5) * 0.01 * wind;
    foliage.current.forEach((m, i) => {
      if (!m) return;
      const b = layout.balls[i];
      const s = b.size * (1 + Math.sin(t * 1.3 + b.phase) * 0.035 * wind);
      m.scale.set(s, s * 0.92, s);
      m.position.x = b.pos[0] + Math.sin(t * 0.9 + b.phase) * 0.06 * wind;
    });
  });

  return (
    <group ref={group} {...props}>
      {/* Stamm */}
      <mesh castShadow receiveShadow position={[0, 1.1, 0]} material={trunkMat}>
        <cylinderGeometry args={[0.16, 0.34, 2.3, 12]} />
      </mesh>
      {/* Äste */}
      {layout.branches.map((b, i) => (
        <mesh key={i} castShadow position={b.pos} rotation={b.rot} material={trunkMat}>
          <cylinderGeometry args={[0.05, 0.11, b.len, 8]} />
        </mesh>
      ))}
      {/* Laub */}
      {layout.balls.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => (foliage.current[i] = el)}
          castShadow
          receiveShadow
          position={b.pos}
          material={foliageMats[b.mat]}
        >
          <icosahedronGeometry args={[1, 3]} />
        </mesh>
      ))}
      {/* Äpfel */}
      {layout.fruit.map((f, i) => (
        <Apple key={i} position={f.pos} scale={f.scale} color={f.color} interactive={interactive} />
      ))}
      {/* Wurzelschatten */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial color="#2F4F16" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
