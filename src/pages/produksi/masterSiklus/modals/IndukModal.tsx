import { useState, type FormEvent } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

interface IndukModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { kodeBatch: string; tglKedatangan: string; umur: number; berat: number }) => void;
}

export function IndukModal({ isOpen, onClose, onSave }: IndukModalProps) {
  const [kodeBatch, setKodeBatch] = useState('');
  const [indukTgl, setIndukTgl] = useState(() => new Date().toISOString().slice(0, 10));
  const [indukUmur, setIndukUmur] = useState('300');
  const [indukBerat, setIndukBerat] = useState('110');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal" style={{ maxWidth: '480px' }}>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            onSave({
              kodeBatch: kodeBatch.trim() || `IND-${Date.now().toString().slice(-4)}`,
              tglKedatangan: indukTgl,
              umur: parseInt(indukUmur, 10) || 0,
              berat: parseFloat(indukBerat) || 0,
            });
            onClose();
          }}
        >
          <h3 className="modal-title">Tambah Batch Induk Baru</h3>
          <p className="modal-description">Pencatatan identitas batch induk sesuai PDF §01 (Kode batch, umur, dan berat).</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <Input
              label="KODE BATCH INDUK"
              type="text"
              placeholder="Contoh: BATCH-2026-A1"
              value={kodeBatch}
              onChange={(e) => setKodeBatch(e.target.value)}
              required
            />
            <Input
              label="TANGGAL KEDATANGAN"
              type="date"
              value={indukTgl}
              onChange={(e) => setIndukTgl(e.target.value)}
              required
              className="font-mono"
            />
            <div className="form-row-2">
              <Input
                label="UMUR (HARI)"
                type="number"
                value={indukUmur}
                onChange={(e) => setIndukUmur(e.target.value)}
                required
                className="font-mono"
              />
              <Input
                label="BERAT RATA-RATA (G)"
                type="number"
                value={indukBerat}
                onChange={(e) => setIndukBerat(e.target.value)}
                required
                className="font-mono"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose} type="button">Batal</Button>
            <Button variant="primary" type="submit">Simpan Batch Induk</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

