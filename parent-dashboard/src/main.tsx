import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initTheme } from './hooks/useTheme';

initTheme();

if (typeof console !== 'undefined') {
  const silent = () => undefined;
  console.log = silent;
  console.debug = silent;
  console.info = silent;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
