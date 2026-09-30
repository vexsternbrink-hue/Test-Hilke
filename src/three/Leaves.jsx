import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { seeded } from '../lib/random';

const dummy = new THREE.Object3D();
const palette = ['#4A7C23', '#5A9130', '#C9A227', '#C41E3A', '#8F7358'];
// Konstante statt Default-Array im Parameter: ein neues Array pro Render hätte
// useMemo bei jedem Rerender der Szene (z. B. Teamwechsel) ausgelöst → Blätter sprangen zurück.
const DEFAULT_AREA = [18, 10, 18];

/**
 * Fallende Blätter als InstancedMesh (günstig: 1 Drawcall).
 * Die Blätter bleiben immer um die Kamera herum.
 */
export default function Leaves({ count = 160, area = DEFAULT_AREA }) {
  const mesh = useRef();
  const state = useMemo(() => {
    const r = seeded(1234);
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * area[0],
      y: r() * area[1],
      z: (r() - 0.5) * area[2],
      speed: 0.35 + r() * 0.6,
      drift: r() * Math.PI * 2,
      spin: (r() - 0.5) * 2,
      size: 0.08 + r() * 0.1,
      color: palette[Math.floor(r() * palette.length)],
    }));
  }, [count, area]);

  useLayoutEffect(() => {
    state.forEach((l, i) => mesh.current.setColorAt(i, new THREE.Color(l.color)));
    mesh.current.instanceColor.needsUpdate = true;
  }, [state]);

  useFrame(({ clock, camera }, delta) => {
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.1); // nach pausiertem Rendering nicht alle Blätter gleichzeitig zurücksetzen
    const cx = camera.position.x;
    const cz = camera.position.z;
    state.forEach((l, i) => {
      l.y -= l.speed * dt;
      if (l.y < 0) l.y = area[1];
      const px = cx + l.x + Math.sin(t * 0.8 + l.drift) * 0.8;
      const pz = cz - 6 + l.z + Math.cos(t * 0.6 + l.drift) * 0.5;
      dummy.position.set(px, l.y, pz);
      dummy.rotation.set(t * l.spin, t * 0.7 + l.drift, Math.sin(t + l.drift));
      dummy.scale.setScalar(l.size);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <planeGeometry args={[1, 1.6]} />
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.8} />
    </instancedMesh>
  );
}
