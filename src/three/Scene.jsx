import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import AppleTree from './AppleTree';
import Alley from './Alley';
import Crate from './Crate';
import Leaves from './Leaves';
import { TEAM } from '../data/team';
import { scrollState, damp, easeInOut, lerp } from '../lib/scroll';

export const CRATE_SPACING = 7;
export const crateZ = (i) => -10 - i * CRATE_SPACING;

/** Kamera-Rig: fährt per Scroll vom Hero-Baum in die Marktallee. */
function CameraRig({ isMobile }) {
  const camera = useThree((s) => s.camera);
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  // Das `camera`-Prop des Canvas gilt nur beim Erzeugen – bei Wechsel Desktop ↔ Mobile
  // (Fenstergröße, Drehen des Geräts) muss das Sichtfeld hier nachgezogen werden.
  useEffect(() => {
    camera.fov = isMobile ? 55 : 42;
    camera.updateProjectionMatrix();
  }, [camera, isMobile]);

  useFrame((_, dt) => {
    const h = easeInOut(scrollState.hero);
    const t = scrollState.team;
    const n = TEAM.length;
    const px = scrollState.pointer.x;
    const py = scrollState.pointer.y;

    // Hero: Kamera steht vor dem Baum (Baum rechts auf Desktop, mittig auf Mobile)
    const heroPos = isMobile ? [0, 2.6, 14] : [-0.4, 2.3, 11.5];
    const heroLook = isMobile ? [0, 3.4, 0] : [2.2, 2.6, 0];
    // Alleeneingang
    const alleyStart = [0, 1.9, -3.5];
    const zTravel = -CRATE_SPACING * (n - 1);

    const z = lerp(heroPos[2], alleyStart[2], h) + t * zTravel;
    const activeSide = scrollState.teamIndex % 2 === 0 ? -1 : 1;
    const sideAmt = isMobile ? 0 : 1;
    const x = lerp(heroPos[0], alleyStart[0] + activeSide * 0.35 * t * sideAmt, h) + px * 0.25;
    const y = lerp(heroPos[1], alleyStart[1], h) + py * 0.15;
    target.set(x, y, z);

    const k = damp(0.0005, dt);
    camera.position.lerp(target, k);

    const lx = lerp(heroLook[0], activeSide * (isMobile ? 0.5 : 1.2) * t, h) + px * 0.6;
    const ly = lerp(heroLook[1], 1.6, h);
    const lz = lerp(heroLook[2], z - 6, h);
    look.lerp(lookTarget.set(lx, ly, lz), k);
    camera.lookAt(look);
  });
  return null;
}

function Lights() {
  const light = useRef();
  useFrame(({ camera }) => {
    // Licht + Schattenfenster fahren mit der Kamera durch die Allee
    if (!light.current) return;
    const z = camera.position.z - 6;
    light.current.position.set(6, 10, z + 6);
    light.current.target.position.set(0, 0, z);
    light.current.target.updateMatrixWorld();
  });
  return (
    <>
      <hemisphereLight args={['#fff4e0', '#4a7c23', 0.7]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        ref={light}
        castShadow
        position={[6, 10, 6]}
        intensity={2.2}
        color="#fff1d6"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
      />
    </>
  );
}

/** Aktive Kiste wird via Store gelesen; Rerender nur bei Indexwechsel (Prop). */
function CrateLayer({ activeIndex, isMobile }) {
  const dx = isMobile ? 1.2 : 2.5;
  return TEAM.map((m, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    return (
      <Crate key={m.slug} member={m} side={side} active={activeIndex === i} position={[side * dx, 0, crateZ(i)]} />
    );
  });
}

/** Pointer-Events nur verarbeiten, solange die Szene sichtbar ist. */
function EventToggle({ enabled }) {
  const setEvents = useThree((s) => s.setEvents);
  useEffect(() => {
    setEvents({ enabled });
  }, [enabled, setEvents]);
  return null;
}

/**
 * Die fixe Vollbild-Szene hinter Hero + Team.
 * Pausiert das Rendering, sobald die Sektionen aus dem Viewport sind.
 */
export default function Scene({ activeIndex, isMobile, visible }) {
  return (
    <Canvas
      // Die Sektionen liegen über der Canvas (z-10) und würden alle Mausevents abfangen –
      // daher lauscht R3F am #root, damit die Hero-Äpfel auf Hover reagieren.
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      shadows="percentage"
      dpr={[1, isMobile ? 1.5 : 2]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ fov: isMobile ? 55 : 42, near: 0.1, far: 120, position: [-0.4, 2.3, 11.5] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: visible ? 1 : 0, transition: 'opacity .6s ease' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={['#EFE7DA']} />
      <fog attach="fog" args={['#EFE7DA', 14, 46]} />
      <PerformanceMonitor>
        <AdaptiveDpr pixelated={false} />
      </PerformanceMonitor>
      <EventToggle enabled={visible} />
      <CameraRig isMobile={isMobile} />
      <Lights />
      <Suspense fallback={null}>
        <AppleTree position={isMobile ? [0, 0, -1] : [3.4, 0, 0]} scale={isMobile ? 1.15 : 1.25} />
        <Alley length={CRATE_SPACING * TEAM.length + 30} />
        <CrateLayer activeIndex={activeIndex} isMobile={isMobile} />
        <Leaves count={isMobile ? 80 : 160} />
      </Suspense>
    </Canvas>
  );
}
