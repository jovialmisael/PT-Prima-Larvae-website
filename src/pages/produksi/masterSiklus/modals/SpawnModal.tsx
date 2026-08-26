import { useState, type FormEvent } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

interface SpawnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    indukId: string;
    tanggal: string;
    fekunditas: number;
    fertilizationRate: number;
    hatchingRate: number;
    jumlahNauplii: number;
    keaktifan?: 'aktif' | 'sedang' | 'lemah';
    responFototaksis?: 'positif' | 'lemah' | 'negatif';
    keseragaman?: string;
  }) => void;
  indukList: any[];
}

export function SpawnModal({ isOpen, onClose, onSave, indukList }: SpawnModalProps) {
  const [spawnIndukId, setSpawnIndukId] = useState(indukList[0]?.id || '');
  const [spawnTgl, setSpawnTgl] = useState(() => new Date().toISOString().slice(0, 10));
  const [fekunditas, setFekunditas] = useState('1200000');
  const [fertilizationRate, setFertilizationRate] = useState('90');
  const [hatchingRate, setHatchingRate] = useState('85');
  const [jumlahNauplii, setJumlahNauplii] = useState('918000');
  const [keaktifan, setKeaktifan] = useState<'aktif' | 'sedang' | 'lemah'>('aktif');
  const [responFototaksis, setResponFototaksis] = useState<'positif' | 'lemah' | 'negatif'>('positif');
  const [keseragaman, setKeseragaman] = useState('Seragam');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal" style={{ maxWidth: '540px' }}>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            onSave({
              indukId: spawnIndukId || (indukList[0]?.id ?? 'IND-1'),
              tanggal: spawnTgl,
              fekunditas: parseInt(fekunditas, 10) || 0,
              fertilizationRate: parseFloat(fertilizationRate) || 0,
              hatchingRate: parseFloat(hatchingRate) || 0,
              jumlahNauplii: parseInt(jumlahNauplii, 10) || 0,
              keaktifan,
              responFototaksis,
              keseragaman,
            });
            onClose();
          }}
        >
          <h3 className="modal-title">Catat Performa Pemijahan & Kualitas Nauplii</h3>
          <p className="modal-description">Pencatatan produksi telur dan mutu benur nauplii sesuai PDF §01.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div className="ui-input-wrapper">
              <label className="ui-label">BATCH INDUK ASAL</label>
              <select value={spawnIndukId} onChange={(e) => setSpawnIndukId(e.target.value)} className="ui-input font-mono">
                {indukList.map(i => <option key={i.id} value={i.id}>{i.kodeBatch}</option>)}
              </select>
            </div>
            <Input label="TANGGAL PEMIJAHAN" type="date" value={spawnTgl} onChange={(e) => setSpawnTgl(e.target.value)} required className="font-mono" />
            <div className="form-row-2">
              <Input label="FEKUNDITAS (BUTIR TELUR)" type="number" value={fekunditas} onChange={(e) => setFekunditas(e.target.value)} required className="font-mono" />
              <Input label="JUMLAH NAUPLII PER SPAWN" type="number" value={jumlahNauplii} onChange={(e) => setJumlahNauplii(e.target.value)} required className="font-mono" />
            </div>
            <div className="form-row-2">
              <Input label="FERTILIZATION RATE (%)" type="number" value={fertilizationRate} onChange={(e) => setFertilizationRate(e.target.value)} required className="font-mono" />
              <Input label="HATCHING RATE (%)" type="number" value={hatchingRate} onChange={(e) => setHatchingRate(e.target.value)} required className="font-mono" />
            </div>
            <div className="form-row-2">
              <div className="ui-input-wrapper">
                <label className="ui-label">KEAKTIFAN NAUPLII</label>
                <select value={keaktifan} onChange={(e) => setKeaktifan(e.target.value as any)} className="ui-input">
                  <option value="aktif">Aktif (Normal)</option>
                  <option value="sedang">Sedang</option>
                  <option value="lemah">Lemah (Bahaya)</option>
                </select>
              </div>
              <div className="ui-input-wrapper">
                <label className="ui-label">RESPON FOTOTAKSIS</label>
                <select value={responFototaksis} onChange={(e) => setResponFototaksis(e.target.value as any)} className="ui-input">
                  <option value="positif">Positif (Normal)</option>
                  <option value="lemah">Lemah</option>
                  <option value="negatif">Negatif (Bahaya)</option>
                </select>
              </div>
            </div>
            <Input label="KESERAGAMAN NAUPLII" type="text" value={keseragaman} onChange={(e) => setKeseragaman(e.target.value)} className="font-mono" />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose} type="button">Batal</Button>
            <Button variant="primary" type="submit">Catat Pemijahan</Button>
          </div>
        </form>
      </div>
    </div>
  );
}


