import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Box, CornerDownLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { currentRole } from '@services/session';
import { list } from '@services/api';
import type { Siklus, Tank } from '@domainTypes/masters';
import { searchTargets, canOpenMaster } from './headerConfig';

type Result = { key: string; label: string; sub: string; to: string; icon: LucideIcon };

const MAX_RESULTS = 8;

export function HeaderSearch() {
  const navigate = useNavigate();
  const role = currentRole();

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [siklus, setSiklus] = useState<Siklus[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Muat data master hanya untuk role yang boleh membukanya (hindari hasil tanpa destinasi).
  useEffect(() => {
    if (!canOpenMaster(role)) return;
    let alive = true;
    Promise.all([list('siklus'), list('tank')]).then(([s, t]) => {
      if (!alive) return;
      setSiklus(s as Siklus[]);
      setTanks(t as Tank[]);
    });
    return () => { alive = false; };
  }, [role]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = debounced;
    const pages = searchTargets(role)
      .filter(t => !q || t.label.toLowerCase().includes(q))
      .map<Result>(t => ({ key: 'p:' + t.to + t.label, label: t.label, sub: 'Halaman', to: t.to, icon: t.icon }));

    if (!q) return pages.slice(0, MAX_RESULTS);

    const batches = canOpenMaster(role)
      ? siklus.filter(s => s.kodeBatch.toLowerCase().includes(q))
          .map<Result>(s => ({ key: 's:' + s.id, label: s.kodeBatch, sub: `Batch — ${s.status}`, to: '/master-siklus', icon: Clock }))
      : [];
    const tankHits = canOpenMaster(role)
      ? tanks.filter(t => t.namaTank.toLowerCase().includes(q))
          .map<Result>(t => ({ key: 't:' + t.id, label: t.namaTank, sub: 'Tank', to: '/master-siklus', icon: Box }))
      : [];

    return [...pages, ...batches, ...tankHits].slice(0, MAX_RESULTS);
  }, [debounced, role, siklus, tanks]);

  useEffect(() => setActive(0), [results]);

  const select = useCallback((r: Result | undefined) => {
    if (!r) return;
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
    navigate(r.to);
  }, [navigate]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); select(results[active]); }
  }, [results, active, select]);

  return (
    <div className="header-search" ref={wrapRef}>
      <div className="header-search-field">
        <Search size={16} className="header-search-icon" />
        <input
          ref={inputRef}
          className="header-search-input"
          type="text"
          placeholder="Cari halaman, batch, tank…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Pencarian global"
        />
      </div>

      {open && results.length > 0 && (
        <div className="header-menu header-search-results" role="listbox">
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={r.key}
                className={`header-menu-item ${i === active ? 'active' : ''}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => select(r)}
              >
                <Icon size={16} className="header-search-result-icon" />
                <span className="header-search-result-label">{r.label}</span>
                <span className="header-search-result-sub">{r.sub}</span>
                {i === active && <CornerDownLeft size={13} className="header-search-enter" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

