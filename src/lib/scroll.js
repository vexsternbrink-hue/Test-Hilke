// Ein kleiner, mutierbarer Scroll-Store. Wird vom Scroll-Listener in App.jsx
// beschrieben und pro Frame (useFrame) von der 3D-Szene gelesen – ohne React-Rerender.
export const scrollState = {
  y: 0,
  vh: 1,
  hero: 0, // 0..1 – wie weit die Hero-Sektion nach oben gescrollt ist
  team: 0, // 0..1 – Fortschritt durch die Marktallee (Team)
  teamIndex: 0,
  sceneVisible: true,
  pointer: { x: 0, y: 0 },
};

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
