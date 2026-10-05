import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

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
