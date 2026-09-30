import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Schriften lokal ausliefern (keine Verbindung zu Google-Servern → DSGVO-freundlich)
import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/manrope';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
