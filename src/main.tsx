import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ensureSeeded } from '@services/seed';
import './styles/tokens.css';
import './styles/primitives.css';

// Pastikan data master contoh (tank/induk/siklus/rearingPlan) tersedia sebelum
// render, agar field `ref` pada form data-entry punya opsi untuk dipilih.
ensureSeeded().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
