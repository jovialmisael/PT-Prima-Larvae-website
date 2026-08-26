import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { list } from '@services/api';

import type { Siklus } from '@domainTypes/masters';

const RUNNING: Siklus['status'][] = ['setup', 'aktif', 'panen'];
const STORAGE_KEY = 'prima_larvae_ui_activeSiklus';

const STATUS_LABEL: Record<string, string> = {
  setup: 'Setup', aktif: 'Aktif', panen: 'Panen',
};

export function HeaderBatchChip() {
  const [siklus, setSiklus] = useState<Siklus[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null),
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    list('siklus', (s: Siklus) => RUNNING.includes(s.status)).then((rows: Siklus[]) => {
      if (alive) setSiklus(rows);
    });
    return () => { alive = false; };
  }, []);

  const selected = useMemo(
    () => siklus.find(s => s.id === selectedId) ?? siklus[0] ?? null,
    [siklus, selectedId],
  );

  const choose = useCallback((id: string) => {
    setSelectedId(id);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, id);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  if (!selected) {
    return (
      <div className="batch-chip-wrap" ref={ref}>
        <button className="batch-chip batch-chip--empty" onClick={() => setOpen(o => !o)}>
          <span className="batch-dot" />
          <span className="batch-code">Semua Batch</span>
          <ChevronDown size={13} className="batch-chip-caret" />
        </button>
      </div>
    );
  }

  return (
    <div className="batch-chip-wrap" ref={ref}>
      <button className="batch-chip" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className={`batch-dot batch-dot--${selected.status}`} />
        <span className="batch-code">Batch: {selected.kodeBatch}</span>
        <ChevronDown size={13} className="batch-chip-caret" />
      </button>

      {open && (
        <div className="header-menu batch-menu" role="listbox">
          {siklus.map(s => (
            <button
              key={s.id}
              className="header-menu-item"
              role="option"
              aria-selected={s.id === selected.id}
              onClick={() => choose(s.id)}
            >
              <span className={`batch-dot batch-dot--${s.status}`} />
              <span className="batch-code">{s.kodeBatch}</span>
              <span className="batch-status">{STATUS_LABEL[s.status] ?? s.status}</span>
              {s.id === selected.id && <Check size={14} className="batch-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

