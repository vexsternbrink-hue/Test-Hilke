import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useHoverCursor } from '../lib/cursor';
import { damp } from '../lib/scroll';

// Prozedurales Apfel-Modell (kein GLTF nötig): Lathe-Profil + Stiel + Blatt.
// Ein Geometrie-Set wird global geteilt → sehr günstig auch bei 100+ Äpfeln.
let shared;
export function getAppleGeometry() {
  if (shared) return shared;
  const profile = [
    [0.0, -0.4],
    [0.2, -0.46],
    [0.38, -0.4],
    [0.48, -0.22],
    [0.5, 0.02],
    [0.47, 0.26],
    [0.36, 0.42],
    [0.2, 0.48],
    [0.1, 0.44],
    [0.0, 0.36],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.LatheGeometry(profile, 40);
  body.computeVertexNormals();
  const stem = new THREE.CylinderGeometry(0.02, 0.03, 0.32, 8);
  const leaf = new THREE.CircleGeometry(0.16, 16);
  leaf.scale(1, 0.45, 1);
  shared = { body, stem, leaf };
  return shared;
}

export const appleMaterials = {};
export function getAppleMaterial(color) {
  if (!appleMaterials[color]) {
    appleMaterials[color] = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.32,
      metalness: 0.05,
    });
  }
  return appleMaterials[color];
}
const stemMat = new THREE.MeshStandardMaterial({ color: '#3E2723', roughness: 0.9 });
const leafMat = new THREE.MeshStandardMaterial({ color: '#4A7C23', roughness: 0.7, side: THREE.DoubleSide });

/**
 * Ein einzelner, interaktiver Apfel.
 * Hover → wächst leicht, dreht sich, glänzt. Klick → onSelect.
 */
export default function Apple({
  color = '#C41E3A',
  scale = 1,
  interactive = true,
  onSelect,
  hoverLift = 0.08,
  ...props
}) {
  const g = getAppleGeometry();
  const mat = useMemo(() => getAppleMaterial(color), [color]);
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const spin = useRef(Math.random() * Math.PI * 2);
  useHoverCursor(hovered);

  useFrame((_, dt) => {
    // Nicht-interaktive Äpfel (Kisten, Stand) bewegen sich nie – spart ~100 Updates pro Frame.
    if (!ref.current || !interactive) return;
    const k = damp(0.001, dt);
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? scale * 1.18 : scale, k);
    ref.current.scale.setScalar(s);
    if (hovered) {
      spin.current += Math.min(dt, 0.1) * 2.2;
      ref.current.rotation.y = spin.current;
    }
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, hovered ? hoverLift : 0, damp(0.0005, dt));
  });

  return (
    <group {...props}>
      <group
        ref={ref}
        scale={scale}
        onPointerOver={
          interactive
            ? (e) => {
                e.stopPropagation();
                setHovered(true);
              }
            : undefined
        }
        onPointerOut={
          interactive
            ? () => setHovered(false)
            : undefined
        }
        onClick={
          interactive && onSelect
            ? (e) => {
                e.stopPropagation();
                onSelect();
              }
            : undefined
        }
      >
        <mesh geometry={g.body} material={mat} castShadow receiveShadow />
        <mesh geometry={g.stem} material={stemMat} position={[0.02, 0.52, 0]} rotation={[0, 0, 0.15]} />
        <mesh geometry={g.leaf} material={leafMat} position={[0.14, 0.58, 0]} rotation={[-0.6, 0.2, 0.5]} />
      </group>
    </group>
  );
}
