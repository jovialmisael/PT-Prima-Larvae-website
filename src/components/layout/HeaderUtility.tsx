import { useCallback, useEffect, useRef, useState } from 'react';
import { HelpCircle, Settings, Download, Sun, Moon, Eye } from 'lucide-react';
import { exportAll } from '@services/api';

type Panel = 'help' | 'settings' | null;
type ThemeMode = 'light' | 'dark' | 'contrast';

export function HeaderUtility() {
  const [panel, setPanel] = useState<Panel>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('prima_theme') as ThemeMode) || 'light');
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback((p: Panel) => setPanel(cur => (cur === p ? null : p)), []);

  const changeTheme = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem('prima_theme', mode);
    if (mode === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('prima_theme') as ThemeMode;
    if (saved && saved !== 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const handleExport = useCallback(async () => {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prima-larvae-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setPanel(null);
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPanel(null);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [panel]);

  return (
    <div className="header-utility" ref={ref}>
      <button
        className={`header-icon-btn ${panel === 'help' ? 'active' : ''}`}
        onClick={() => toggle('help')}
        aria-label="Bantuan"
        aria-expanded={panel === 'help'}
      >
        <HelpCircle size={18} />
      </button>
      <button
        className={`header-icon-btn ${panel === 'settings' ? 'active' : ''}`}
        onClick={() => toggle('settings')}
        aria-label="Pengaturan"
        aria-expanded={panel === 'settings'}
      >
        <Settings size={18} />
      </button>

      {panel === 'help' && (
        <div className="header-menu header-help">
          <p className="header-help-title">Pintasan Keyboard</p>
          <div className="header-help-row">
            <span>Kolom Berikutnya di Form</span>
            <kbd>Enter</kbd>
          </div>
          <div className="header-help-row">
            <span>Tutup panel / modal</span>
            <kbd>Esc</kbd>
          </div>
        </div>
      )}

      {panel === 'settings' && (
        <div className="header-menu" role="menu" style={{ minWidth: '220px' }}>
          <p className="header-help-title" style={{ padding: '4px 12px', margin: 0 }}>Mode Tampilan</p>
          <button 
            className={`header-menu-item ${theme === 'light' ? 'active' : ''}`} 
            onClick={() => changeTheme('light')}
          >
            <Sun size={15} /> Terang (Standar)
          </button>
          <button 
            className={`header-menu-item ${theme === 'dark' ? 'active' : ''}`} 
            onClick={() => changeTheme('dark')}
          >
            <Moon size={15} /> Gelap (Shift Malam)
          </button>
          <button 
            className={`header-menu-item ${theme === 'contrast' ? 'active' : ''}`} 
            onClick={() => changeTheme('contrast')}
          >
            <Eye size={15} /> Kontras Tinggi (Outdoor)
          </button>

          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

          <button className="header-menu-item" onClick={handleExport} role="menuitem">
            <Download size={15} /> Ekspor Cadangan Data
          </button>
        </div>
      )}
    </div>
  );
}

