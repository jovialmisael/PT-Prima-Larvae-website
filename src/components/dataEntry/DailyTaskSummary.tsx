import { CheckCircle2, Clock, AlertTriangle, ListChecks } from 'lucide-react';
import type { Division } from '@domainTypes/index';
import { ringkasTugas, type Tugas } from '@services/tugas';

interface DailyTaskSummaryProps {
  division: Division;
  tugas: Tugas[];
  onPickCategory: (id: string) => void;
}

const URUTAN: Record<Tugas['status'], number> = { terlambat: 0, belum: 1, terisi: 2 };
const SLOT_LABEL: Record<string, string> = { pagi: 'Pagi', sore: 'Sore' };

function BarisTugas({ t, onPick }: { t: Tugas; onPick: (id: string) => void }) {
  return (
    <div
      className="task-checklist-item"
      style={{ cursor: 'pointer' }}
      onClick={() => onPick(t.categoryId)}
      title={`Klik untuk isi ${t.judul}`}
    >
      <div className={`task-check-icon ${t.status === 'terisi' ? 'done' : 'pending'}`}>
        {t.status === 'terisi' && <CheckCircle2 size={12} />}
        {t.status === 'terlambat' && <AlertTriangle size={12} />}
      </div>
      <span>
        {t.slot && <strong>{SLOT_LABEL[t.slot]} · </strong>}
        {t.judul}
        {t.status === 'terlambat' && <em style={{ color: 'var(--status-bahaya)' }}> — terlambat</em>}
      </span>
    </div>
  );
}

/**
 * Ringkasan tugas shift. Seluruh angkanya diturunkan dari kadens + record nyata
 * (lihat services/tugas.ts) — tidak ada nilai contoh, karena dashboard yang
 * menampilkan angka karangan merusak justru disiplin data yang ingin dijaga.
 */
export function DailyTaskSummary({ division, tugas, onPickCategory }: DailyTaskSummaryProps) {
  const r = ringkasTugas(tugas);
  const progressPct = r.total ? Math.round((r.terisi / r.total) * 100) : 0;
  const daftar = [...tugas].sort((a, b) => URUTAN[a.status] - URUTAN[b.status] || a.judul.localeCompare(b.judul));

  return (
    <div className="daily-task-container">
      <div className="daily-task-header">
        <div className="daily-task-title-group">
          <div className="daily-task-badge-row">
            <span className="shift-pill"><Clock size={12} /> {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <span className="cycle-pill">DIVISI: {division.toUpperCase()}</span>
          </div>
          <h2 className="daily-task-heading">Dashboard Tugas & Logbook Harian</h2>
          <p className="daily-task-sub">
            Daftar di bawah dibangkitkan dari frekuensi pengukuran, bukan dari data yang sudah masuk —
            pengukuran yang terlewat tetap terlihat.
          </p>
        </div>
      </div>

      <div className="daily-task-cards-grid">
        <div className="task-summary-card">
          <div className="task-card-title-row">
            <span>PROGRES JADWAL HARI INI</span>
            <span className="font-mono" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {r.terisi} / {r.total} Selesai
            </span>
          </div>
          <div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>{progressPct}% Terpenuhi</span>
              <span>{r.belum} Menunggu</span>
            </div>
          </div>
        </div>

        <div className="task-summary-card">
          <div className="task-card-title-row">
            <span>CHECKLIST TERJADWAL</span>
            <ListChecks size={14} color="var(--primary)" />
          </div>
          <div className="task-checklist-list">
            {daftar.length === 0 ? (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Tidak ada pengukuran terjadwal untuk peran ini hari ini.
              </span>
            ) : (
              daftar.slice(0, 5).map(t => <BarisTugas key={t.id} t={t} onPick={onPickCategory} />)
            )}
          </div>
        </div>

        <div className="task-summary-card">
          <div className="task-card-title-row">
            <span>KEPATUHAN JADWAL</span>
            <AlertTriangle size={14} color={r.terlambat > 0 ? 'var(--status-bahaya)' : 'var(--status-normal)'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: 'var(--text-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Terlambat diukur:</span>
              <span className="font-mono" style={{ fontWeight: 700, color: r.terlambat > 0 ? 'var(--status-bahaya)' : 'var(--status-normal)' }}>
                {r.terlambat}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Masih dalam jadwal:</span>
              <span className="font-mono" style={{ fontWeight: 700 }}>{r.belum}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sudah tercatat:</span>
              <span className="font-mono" style={{ fontWeight: 700 }}>{r.terisi}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
