import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Apple from './Apple';
import { GROUPS } from '../data/team';
import { loadPortrait, makeLabelTexture, makePortraitTexture } from '../lib/textures';

const wood = new THREE.MeshStandardMaterial({ color: '#A98A72', roughness: 0.9 });
const woodDark = new THREE.MeshStandardMaterial({ color: '#8F7358', roughness: 0.9 });

/**
 * Schwebende Apfelkiste mit Portrait (Textur), Namensschild und Äpfeln obendrauf.
 * `active` → Kiste kommt nach vorn, leuchtet, dreht sich leicht zur Kamera.
 * `reveal` 0..1 → Einblend-Skalierung beim Heranscrollen.
 */
export default function Crate({ member, side = 1, active = false, ...props }) {
  const group = useRef();
  const inner = useRef();
  const color = GROUPS[member.group].color;
  const [portrait, setPortrait] = useState(() => makePortraitTexture(member, color));
  const label = useMemo(() => makeLabelTexture(member.name, member.role), [member]);

  useEffect(() => {
    let alive = true;
    loadPortrait(member, color, (tex) => alive && setPortrait(tex));
    return () => {
      alive = false;
    };
  }, [member, color]);

  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }, dt) => {
    if (!inner.current) return;
    const t = clock.getElapsedTime();
    const k = 1 - Math.pow(0.002, dt);
    // Schweben
    inner.current.position.y = THREE.MathUtils.lerp(
      inner.current.position.y,
      1.55 + Math.sin(t * 1.1 + phase) * 0.08 + (active ? 0.18 : 0),
      k,
    );
    // zur Kamera drehen (+ Wackeln)
    const targetRot = side * -0.55 + Math.sin(t * 0.7 + phase) * 0.03 + (active ? side * 0.25 : 0);
    inner.current.rotation.y = THREE.MathUtils.lerp(inner.current.rotation.y, targetRot, k);
    inner.current.rotation.z = Math.sin(t * 0.9 + phase) * 0.015;
    const s = active ? 1.12 : 1;
    inner.current.scale.lerp(new THREE.Vector3(s, s, s), k);
  });

  return (
    <group ref={group} {...props}>
      <group ref={inner} position={[0, 1.55, 0]}>
        {/* Boden & Wände der Kiste */}
        <mesh material={woodDark} position={[0, -0.62, 0]} castShadow>
          <boxGeometry args={[1.8, 0.08, 1.2]} />
        </mesh>
        {[-0.86, 0.86].map((x) => (
          <mesh key={x} material={wood} position={[x, -0.35, 0]} castShadow>
            <boxGeometry args={[0.08, 0.6, 1.2]} />
          </mesh>
        ))}
        {[-0.56, 0.56].map((z) => (
          <mesh key={z} material={wood} position={[0, -0.35, z]} castShadow>
            <boxGeometry args={[1.8, 0.6, 0.08]} />
          </mesh>
        ))}
        {/* Portrait-Tafel (hinten in der Kiste stehend) */}
        <group position={[0, 0.3, -0.42]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 1.5, 0.06]} />
            <meshStandardMaterial color="#F8F5F0" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <planeGeometry args={[1.36, 1.36]} />
            <meshStandardMaterial map={portrait} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.78, 0]}>
            <boxGeometry args={[1.6, 0.06, 0.1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
        {/* Namensschild vorne */}
        <mesh position={[0, -0.32, 0.605]}>
          <planeGeometry args={[1.5, 0.56]} />
          <meshStandardMaterial map={label} roughness={0.7} />
        </mesh>
        {/* Äpfel in der Kiste */}
        {[
          [-0.55, -0.1, 0.15],
          [-0.15, -0.1, 0.25],
          [0.25, -0.1, 0.1],
          [0.6, -0.1, 0.22],
          [0.05, 0.1, 0.05],
          [-0.35, 0.08, -0.05],
        ].map((p, i) => (
          <Apple key={i} position={p} scale={0.24} interactive={false} color={i % 3 === 1 ? '#D8283F' : '#C41E3A'} />
        ))}
        {/* Leuchtring wenn aktiv */}
        {active && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
            <ringGeometry args={[1.2, 1.35, 48]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        )}
      </group>
      {/* Schatten auf dem Weg */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.16} />
      </mesh>
    </group>
  );
}
