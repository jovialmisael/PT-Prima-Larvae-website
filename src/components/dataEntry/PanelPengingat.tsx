import { useNavigate } from 'react-router-dom';
import type { Pengingat, TingkatPengingat } from '@services/pengingat';
import { AlertTriangle, Clock, Info, ArrowRight, CheckCircle2 } from 'lucide-react';
import './panelPengingat.css';

interface PanelPengingatProps {
  pengingat: Pengingat[];
  onPickCategory: (id: string) => void;
}

const IKON: Record<TingkatPengingat, typeof Info> = {
  terlambat: AlertTriangle,
  segera: Clock,
  info: Info,
};

const LABEL_JENIS: Record<Pengingat['jenis'], string> = {
  fase: 'Fase siklus',
  waktu: 'Jadwal',
  umurPakai: 'Umur pakai',
  kondisi: 'Kondisi',
  kepatuhan: 'Kepatuhan',
};

/**
 * Panel pengingat workspace.
 *
 * Aturan yang dipegang: tiap baris menyebut apa yang harus dilakukan, dan
 * kliknya membawa langsung ke tempat melakukannya. Pengingat yang hanya
 * memberitahu tanpa jalan keluar tidak diterbitkan sejak di mesinnya.
 */
export function PanelPengingat({ pengingat, onPickCategory }: PanelPengingatProps) {
  const navigate = useNavigate();

  const buka = (tujuan?: string) => {
    if (!tujuan) return;
    if (tujuan.startsWith('/')) navigate(tujuan);
    else onPickCategory(tujuan);
  };

  if (pengingat.length === 0) {
    return (
      <div className="pi-panel pi-panel-kosong">
        <CheckCircle2 size={16} />
        <span>Tidak ada yang menuntut perhatian. Jadwal, umur pakai konsumabel, dan kondisi treatment semuanya aman.</span>
      </div>
    );
  }

  return (
    <div className="pi-panel">
      <div className="pi-head">
        <h3>Perlu Perhatian</h3>
        <span className="pi-count font-mono">{pengingat.length}</span>
      </div>

      <ul className="pi-list">
        {pengingat.map(p => {
          const Ikon = IKON[p.tingkat];
          return (
            <li key={p.id} className={`pi-item is-${p.tingkat}`}>
              <span className="pi-ikon"><Ikon size={15} /></span>

              <div className="pi-isi">
                <div className="pi-judul-row">
                  <strong className="pi-judul">{p.judul}</strong>
                  <span className="pi-jenis">{LABEL_JENIS[p.jenis]}</span>
                </div>
                <p className="pi-detail">{p.detail}</p>
                <p className="pi-tindakan"><ArrowRight size={12} /> {p.tindakan}</p>
              </div>

              {p.tujuan && (
                <button type="button" className="ui-btn ui-btn-secondary ui-btn-sm pi-aksi" onClick={() => buka(p.tujuan)}>
                  Buka
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
