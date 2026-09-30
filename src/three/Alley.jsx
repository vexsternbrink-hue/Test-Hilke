import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { seeded } from '../lib/random';
import { getAppleGeometry, getAppleMaterial } from './Apple';

const dummy = new THREE.Object3D();

/**
 * Die Marktallee: Boden, Kopfsteinweg und beidseitig instanzierte Apfelbäume.
 * `length` in Weltmeter entlang -z.
 */
export default function Alley({ length = 140, spacing = 6.5, count }) {
  const trunks = useRef();
  const leaves = useRef();
  const apples = useRef();
  const treeCount = count ?? Math.floor(length / spacing) * 2;
  const ballsPerTree = 5;
  const applesPerTree = 6;

  const data = useMemo(() => {
    const r = seeded(42);
    const trees = [];
    for (let i = 0; i < treeCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const z = -4 - Math.floor(i / 2) * spacing - r() * 2;
      const x = side * (5.2 + r() * 2.2);
      const s = 0.85 + r() * 0.5;
      trees.push({ x, z, s, rot: r() * Math.PI * 2, rr: r });
    }
    return trees;
  }, [treeCount, spacing]);

  useLayoutEffect(() => {
    const r = seeded(99);
    data.forEach((t, i) => {
      dummy.position.set(t.x, 1.15 * t.s, t.z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.set(t.s, t.s, t.s);
      dummy.updateMatrix();
      trunks.current.setMatrixAt(i, dummy.matrix);
      for (let b = 0; b < ballsPerTree; b++) {
        const a = (b / ballsPerTree) * Math.PI * 2;
        const rad = b === 0 ? 0 : 0.7 + r() * 0.6;
        const size = (b === 0 ? 1.5 : 0.9 + r() * 0.5) * t.s;
        dummy.position.set(t.x + Math.cos(a) * rad * t.s, (2.5 + (r() - 0.4) * 1.0) * t.s, t.z + Math.sin(a) * rad * t.s);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(size, size * 0.9, size);
        dummy.updateMatrix();
        const idx = i * ballsPerTree + b;
        leaves.current.setMatrixAt(idx, dummy.matrix);
        leaves.current.setColorAt(idx, new THREE.Color(['#4A7C23', '#3F6B1E', '#5A9130'][b % 3]));
      }
      for (let a = 0; a < applesPerTree; a++) {
        const th = r() * Math.PI * 2;
        const ph = Math.acos(2 * r() - 1);
        const rr = 1.5 * t.s;
        dummy.position.set(
          t.x + rr * Math.sin(ph) * Math.cos(th),
          (2.7 + rr * Math.cos(ph) * 0.6) * t.s,
          t.z + rr * Math.sin(ph) * Math.sin(th),
        );
        const sc = 0.2 * t.s;
        dummy.scale.set(sc, sc, sc);
        dummy.updateMatrix();
        apples.current.setMatrixAt(i * applesPerTree + a, dummy.matrix);
      }
    });
    trunks.current.instanceMatrix.needsUpdate = true;
    leaves.current.instanceMatrix.needsUpdate = true;
    if (leaves.current.instanceColor) leaves.current.instanceColor.needsUpdate = true;
    apples.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  const appleGeo = getAppleGeometry().body;

  return (
    <group>
      {/* Wiese */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -length / 2 + 10]} receiveShadow>
        <planeGeometry args={[80, length + 60]} />
        <meshStandardMaterial color="#5F8F2E" roughness={1} />
      </mesh>
      {/* Marktweg */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -length / 2 + 10]} receiveShadow>
        <planeGeometry args={[4.4, length + 60]} />
        <meshStandardMaterial color="#A98A72" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, -length / 2 + 10]}>
        <planeGeometry args={[0.12, length + 60]} />
        <meshStandardMaterial color="#8F7358" roughness={1} />
      </mesh>

      <instancedMesh ref={trunks} args={[null, null, treeCount]} castShadow>
        <cylinderGeometry args={[0.14, 0.3, 2.3, 8]} />
        <meshStandardMaterial color="#3E2723" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[null, null, treeCount * ballsPerTree]} castShadow>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={apples} args={[appleGeo, getAppleMaterial('#C41E3A'), treeCount * applesPerTree]} />
    </group>
  );
}
