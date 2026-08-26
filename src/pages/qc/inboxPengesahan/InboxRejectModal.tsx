import { useState, type FormEvent } from 'react';
import { Button } from '@components/ui/Button';

interface InboxRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (alasan: string) => void;
}

export function InboxRejectModal({ isOpen, onClose, onConfirmReject }: InboxRejectModalProps) {
  const [alasan, setAlasan] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!alasan.trim()) return;
    onConfirmReject(alasan);
    setAlasan('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal" style={{ maxWidth: '440px' }}>
        <h3 className="modal-title" style={{ color: 'var(--status-bahaya)' }}>
          Tolak / Kembalikan Record
        </h3>
        <p className="modal-description">
          Tuliskan alasan penolakan atau instruksi perbaikan yang harus dilakukan oleh operator.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="ui-input-wrapper">
            <label className="ui-label">ALASAN PENOLAKAN & KOREKSI</label>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Parameter amonia tidak wajar, harap ulangi sampling dan tes ulang reagen..."
              required
              rows={3}
              className="ui-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose} type="button">
              Batal
            </Button>
            <Button variant="danger" type="submit">
              Konfirmasi Tolak
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
