import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { SignaturePad } from '@components/ui/SignaturePad';
import type { AntreanItem } from './inboxQueue';

interface Props {
  item: AntreanItem | null;
  onClose: () => void;
  onConfirm: (ttd: string) => void;
  submitting?: boolean;
}

const JUDUL: Record<string, string> = {
  qc: 'Verifikasi QC (MPM)',
  sahkan: 'Pengesahan Kepala Divisi',
};

/**
 * Tanda tangan wajib sebelum langkah QC/Sahkan disimpan (aturan dokumen 05).
 * TTD diambil tepat sebelum record ditulis, bukan saat draft.
 */
export function InboxSignModal({ item, onClose, onConfirm, submitting }: Props) {
  const [ttd, setTtd] = useState('');

  if (!item || !item.langkah) return null;

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal" style={{ maxWidth: '460px' }}>
        <h3 className="modal-title">{JUDUL[item.langkah]}</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '12px' }}>
          {item.parameter} — {item.objek}
        </p>

        <SignaturePad onSign={setTtd} />

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button variant="primary" onClick={() => onConfirm(ttd)} disabled={!ttd || submitting}>
            {submitting ? 'Menyimpan...' : 'Tanda Tangani & Simpan'}
          </Button>
        </div>

        {!ttd && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
            Tanda tangan wajib diisi sebelum langkah ini bisa disimpan.
          </p>
        )}
      </div>
    </div>
  );
}
