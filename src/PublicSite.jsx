import { useCallback, useState } from 'react';
import NoticeBar from './components/NoticeBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import Highlights from './sections/Highlights';
import Board from './sections/Board';
import Products from './sections/Products';
import Preorder from './sections/Preorder';
import About from './sections/About';
import Visit from './sections/Visit';
import Contact from './sections/Contact';
import { useSiteData } from './lib/useSiteData';

export default function PublicSite() {
  const { settings, products, notices, today, status } = useSiteData();
  const [preselect, setPreselect] = useState(null);

  const preorder = useCallback((productId) => {
    setPreselect({ productId, at: Date.now() });
    document.getElementById('vorbestellen')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <>
      <a href="#inhalt" className="skip-link">
        Zum Inhalt springen
      </a>
      <NoticeBar notices={notices} />
      <Navbar />
      <main id="inhalt" tabIndex={-1} className="outline-none">
        <Hero settings={settings} notices={notices} />
        <Highlights />
        <Board notices={notices} />
        <Products products={products} onPreorder={preorder} />
        <Preorder products={products} settings={settings} today={today} preselect={preselect} offline={status === 'offline'} />
        <About />
        <Visit settings={settings} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
