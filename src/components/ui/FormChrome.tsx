import { CheckCircle2 } from 'lucide-react';

/**
 * Kerangka bersama seluruh form data-entry: bilah kelengkapan di kepala dan
 * bilah aksi di kaki.
 *
 * Dipakai seluruh formulir schema-driven, sehingga kepala & bilah statusnya
 * memanggil komponen yang SAMA, bukan menyalin markup — supaya kedua mode
 * tidak bisa lagi berbeda tampilan tanpa sengaja.
 */

interface FormStatusBarProps {
  /** Ringkasan kelengkapan, mis. "3 dari 6 formulir disentuh". */
  badge: string;
  /** Isi bilah progres, 0–100. */
  percent: number;
  /** Jam autosave terakhir; null = belum pernah tersimpan. */
  lastSaved?: string | null;
  /** Bila false, penanda autosave disembunyikan. */
  autosave?: boolean;
}

export function FormStatusBar({ badge, percent, lastSaved, autosave = true }: FormStatusBarProps) {
  return (
    <div className="schema-form-status-bar">
      <div className="schema-form-status-info">
        <span className="schema-form-status-text">Kelengkapan Isian</span>
        <span className="schema-form-status-badge font-mono">{badge}</span>
      </div>
      <div className="schema-form-progress-track">
        <div
          className="schema-form-progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      {autosave && (
        <span className="schema-autosave" title="Draft disimpan otomatis">
          <CheckCircle2 size={13} />
          {lastSaved ? `Autosave aktif · Terakhir ${lastSaved}` : 'Autosave aktif'}
        </span>
      )}
    </div>
  );
}

/** Kaki form: catatan status draft + tombol aksi yang diberikan pemanggil. */
export function FormActionsBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="schema-form-actions-bar">
      <p className="schema-form-actions-note">
        <span className="schema-note-dot" />
        Data disimpan sebagai <strong>Draft</strong> dan dapat diedit kembali sebelum verifikasi QC.
      </p>
      <div className="schema-form-btn-group">{children}</div>
    </div>
  );
}
