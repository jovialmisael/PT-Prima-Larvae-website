import { useState, type FormEvent } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

interface TankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function TankModal({ isOpen, onClose, onSave }: TankModalProps) {
  const [tankNama, setTankNama] = useState('Bak P-06');
  const [tankRuang, setTankRuang] = useState<'naupli' | 'zoea' | 'mysis' | 'pl'>('pl');
  const [tankLokasi, setTankLokasi] = useState('Modul B - Hatchery');
  const [tankKapasitas, setTankKapasitas] = useState('12000');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal" style={{ maxWidth: '500px' }}>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            onSave({ namaTank: tankNama, ruangStadia: tankRuang, lokasi: tankLokasi, kapasitas: parseInt(tankKapasitas, 10) || 10000, status: 'aktif' });
            onClose();
          }}
        >
          <h3 className="modal-title">Tambah Bak / Wadah Budidaya</h3>
          <p className="modal-description">Pendaftaran bak baru beserta alokasi ruang stadia dan kapasitas air.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div className="form-row-2">
              <Input label="NAMA / NOMOR BAK" type="text" value={tankNama} onChange={(e) => setTankNama(e.target.value)} required className="font-mono" />
              <div className="ui-input-wrapper">
                <label className="ui-label">RUANG STADIA</label>
                <select value={tankRuang} onChange={(e) => setTankRuang(e.target.value as any)} className="ui-input">
                  <option value="naupli">Naupli</option>
                  <option value="zoea">Zoea</option>
                  <option value="mysis">Mysis</option>
                  <option value="pl">Post-Larvae (PL)</option>
                </select>
              </div>
            </div>
            <div className="form-row-2">
              <Input label="LOKASI MODUL" type="text" value={tankLokasi} onChange={(e) => setTankLokasi(e.target.value)} required />
              <Input label="KAPASITAS AIR (LITER)" type="number" value={tankKapasitas} onChange={(e) => setTankKapasitas(e.target.value)} required className="font-mono" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose} type="button">Batal</Button>
            <Button variant="primary" type="submit">Tambah Bak</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
