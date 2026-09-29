import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Hero3D from './components/Hero3D';
import TeamCarousel3D from './components/TeamCarousel3D';
import MarketStand3D from './components/MarketStand3D';
import ThankYouSection from './components/ThankYouSection';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import SoundToggle from './components/SoundToggle';
import Scene from './three/Scene';
import { TEAM } from './data/team';
import { clamp01, scrollState } from './lib/scroll';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const fn = (e) => setMobile(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return mobile;
}

export default function App() {
  const heroRef = useRef(null);
  const teamRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroProgress, setHeroProgress] = useState(0);
  const [sceneVisible, setSceneVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Scroll-Treiber: schreibt in den Store (pro Frame gelesen) + wenige React-States.
  useEffect(() => {
    let raf = 0;
    let lastIdx = -1;
    let lastVisible = true;
    let lastHeroBucket = -1;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const hero = heroRef.current;
      const team = teamRef.current;
      if (!hero || !team) return;
      const heroH = hero.offsetHeight;
      const teamTop = team.offsetTop;
      const teamH = team.offsetHeight;

      const heroP = clamp01(y / heroH);
      const teamP = clamp01((y - teamTop) / (teamH - vh));
      const idx = Math.min(TEAM.length - 1, Math.round(teamP * (TEAM.length - 1)));
      const visible = y < teamTop + teamH - vh * 0.5;

      scrollState.y = y;
      scrollState.vh = vh;
      scrollState.hero = heroP;
      scrollState.team = teamP;
      scrollState.teamIndex = idx;
      scrollState.sceneVisible = visible;

      if (idx !== lastIdx) {
        lastIdx = idx;
        setActiveIndex(idx);
      }
      if (visible !== lastVisible) {
        lastVisible = visible;
        setSceneVisible(visible);
      }
      const bucket = Math.round(heroP * 40);
      if (bucket !== lastHeroBucket) {
        lastHeroBucket = bucket;
        setHeroProgress(heroP);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onMove = (e) => {
      scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <LoadingScreen show={loading} />
      <Scene activeIndex={activeIndex} isMobile={isMobile} visible={sceneVisible} />
      <Navbar />
      <main>
        <Hero3D ref={heroRef} progress={heroProgress} />
        <TeamCarousel3D ref={teamRef} activeIndex={activeIndex} />
        <MarketStand3D />
        <ThankYouSection />
      </main>
      <Footer />
      <SoundToggle />
    </>
  );
}
