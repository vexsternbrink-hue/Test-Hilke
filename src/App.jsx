import { Suspense, lazy, useEffect, useState } from 'react';
import PublicSite from './PublicSite';

// Der Admin-Bereich wird nur geladen, wenn er aufgerufen wird – die öffentliche Seite bleibt schlank.
const AdminApp = lazy(() => import('./admin/AdminApp'));

export const ADMIN_HASH = '#/admin';

function useIsAdminRoute() {
  const [admin, setAdmin] = useState(() => window.location.hash.startsWith(ADMIN_HASH));
  useEffect(() => {
    const onHash = () => setAdmin(window.location.hash.startsWith(ADMIN_HASH));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return admin;
}

export default function App() {
  const admin = useIsAdminRoute();

  useEffect(() => {
    document.title = admin ? 'Admin · Biohof Tambke' : 'Biohof Tambke – Bio-Obst vom Hof auf dem Wochenmarkt Volksdorf';
    if (admin) window.scrollTo(0, 0);
  }, [admin]);

  if (admin) {
    return (
      <Suspense fallback={<div className="grid min-h-svh place-items-center text-muted">Admin-Bereich wird geladen …</div>}>
        <AdminApp />
      </Suspense>
    );
  }
  return <PublicSite />;
}
