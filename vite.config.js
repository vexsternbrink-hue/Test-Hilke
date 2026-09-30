import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createAppApi } from './server/app.js';

/**
 * Bindet die API (server/api.js) in `npm run dev` und `npm run preview` ein –
 * so läuft lokal alles mit einem Befehl. In Produktion übernimmt server/index.js.
 * Variablen aus .env werden nur hier serverseitig gelesen (kein VITE_-Präfix → nie im Bundle).
 */
function marketApi(mode) {
  let api;
  const handler = (req, res, next) => {
    api ??= createAppApi({ ...process.env, ...loadEnv(mode, process.cwd(), '') });
    return api(req, res, next);
  };
  return {
    name: 'market-api',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), marketApi(mode)],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Three.js / R3F / Framer Motion getrennt cachen
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('@react-three')) return 'r3f';
          if (id.includes('framer-motion') || id.includes('motion-')) return 'motion';
          return undefined;
        },
      },
    },
  },
}));
