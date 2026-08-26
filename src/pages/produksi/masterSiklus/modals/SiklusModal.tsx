import { useState, type FormEvent } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

interface SiklusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { indukId: string; tglMulai: string }) => void;
  indukList: any[];
}

export function SiklusModal({ isOpen, onClose, onSave, indukList }: SiklusModalProps) {
  const [indukId, setIndukId] = useState(indukList[0]?.id || '');
  const [tglMulai, setTglMulai] = useState(() => new Date().toISOString().slice(0, 10));

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal" style={{ maxWidth: '500px' }}>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            onSave({ indukId: indukId || (indukList[0]?.id ?? 'IND-1'), tglMulai });
            onClose();
          }}
        >
          <h3 className="modal-title">Buka Siklus Budidaya Baru</h3>
          <p className="modal-description">Inisiasi siklus baru dengan nomor batch otomatis dan baseline rearing plan.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div className="ui-input-wrapper">
              <label className="ui-label">PILIH BATCH INDUK ASAL</label>
              <select value={indukId} onChange={(e) => setIndukId(e.target.value)} className="ui-input font-mono">
                {indukList.map(i => <option key={i.id} value={i.id}>{i.kodeBatch}</option>)}
              </select>

            </div>
            <Input label="TANGGAL MULAI SIKLUS" type="date" value={tglMulai} onChange={(e) => setTglMulai(e.target.value)} required className="font-mono" />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose} type="button">Batal</Button>
            <Button variant="primary" type="submit">Buka Siklus</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
