import { useState } from 'react';
import type { Aksi, BakuMutu, FieldDef, NumericThreshold, RoleLevel } from '@domainTypes/index';
import type { Usulan } from '@services/bakuMutu';
import { protokolEfektif } from '@services/bakuMutu';
import { Badge } from '@components/ui/Badge';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

export type BarisMutu = {
  categoryId: string;
  categoryTitle: string;
  field: FieldDef;
  ambangBawaan?: NumericThreshold;
  override?: BakuMutu;
  usulan: Usulan;
};

const PIC: RoleLevel[] = ['petugas', 'pj', 'kepala', 'mpm'];

const ringkasAmbang = (a?: NumericThreshold) =>
  !a ? 'belum ditetapkan'
    : [a.dangerMin != null ? `bahaya ≤${a.dangerMin}` : null,
       a.safeMin != null ? `aman ${a.safeMin}` : null,
       a.safeMax != null ? `–${a.safeMax}` : null,
       a.dangerMax != null ? `bahaya ≥${a.dangerMax}` : null].filter(Boolean).join(' · ');

const bulat = (n?: number) => (n == null ? undefined : Math.round(n * 100) / 100);

export function BakuMutuRow({ baris, bisaSunting, onSimpan }: {
  baris: BarisMutu;
  bisaSunting: boolean;
  onSimpan: (bm: BakuMutu) => void;
}) {
  const { categoryId, categoryTitle, field, ambangBawaan, override, usulan } = baris;
  const [buka, setBuka] = useState(false);
  const [ambang, setAmbang] = useState<NumericThreshold>(override?.ambang ?? ambangBawaan ?? {});
  const [waspada, setWaspada] = useState<Aksi>(override?.protokol?.waspada ?? protokolEfektif(field.key, 'waspada', override));
  const [bahaya, setBahaya] = useState<Aksi>(override?.protokol?.bahaya ?? protokolEfektif(field.key, 'bahaya', override));

  const efektif = override?.ambang ?? ambangBawaan;
  const sumber = override ? override.sumber : 'literatur';

  const pakaiUsulan = () => {
    if (!usulan.usulan) return;
    setAmbang({
      safeMin: bulat(usulan.usulan.safeMin), safeMax: bulat(usulan.usulan.safeMax),
      dangerMin: bulat(usulan.usulan.dangerMin), dangerMax: bulat(usulan.usulan.dangerMax),
    });
  };

  const simpan = (sumberBaru: BakuMutu['sumber']) => onSimpan({
    id: `${categoryId}:${field.key}`,
    categoryId, fieldKey: field.key,
    ambang, protokol: { waspada, bahaya },
    sumber: sumberBaru, diperbaruiPada: Date.now(), nSampel: usulan.n,
  });

  const angka = (k: keyof NumericThreshold, label: string) => (
    <label className="bm-field">
      <span>{label}</span>
      <input type="number" value={ambang[k] ?? ''} disabled={!bisaSunting}
        onChange={e => setAmbang({ ...ambang, [k]: e.target.value === '' ? undefined : Number(e.target.value) })} />
    </label>
  );

  const aksi = (nilai: Aksi, set: (a: Aksi) => void, label: string) => (
    <div className="bm-aksi">
      <span className="bm-aksi-label">{label}</span>
      <input type="text" value={nilai.tindakan} disabled={!bisaSunting} placeholder="Tindakan yang harus diambil"
        onChange={e => set({ ...nilai, tindakan: e.target.value })} />
      <select value={nilai.kontakRole} disabled={!bisaSunting}
        onChange={e => set({ ...nilai, kontakRole: e.target.value as RoleLevel })}>
        {PIC.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );

  return (
    <div className={`bm-row ${buka ? 'is-open' : ''}`}>
      <button type="button" className="bm-row-head" onClick={() => setBuka(b => !b)}>
        {buka ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="bm-row-nama">
          <strong>{field.label}</strong>
          <em>{categoryTitle}</em>
        </span>
        <span className="bm-row-ambang font-mono">{ringkasAmbang(efektif)}</span>
        <Badge status={sumber === 'literatur' ? 'netral' : 'normal'}>
          {sumber === 'literatur' ? 'Seed literatur' : sumber === 'usulan-data' ? 'Dari data' : 'Disetujui MPM'}
        </Badge>
      </button>

      {buka && (
        <div className="bm-row-body">
          <div className="bm-grid">
            {angka('dangerMin', 'Bahaya bawah')}
            {angka('safeMin', 'Aman bawah')}
            {angka('safeMax', 'Aman atas')}
            {angka('dangerMax', 'Bahaya atas')}
          </div>

          <div className="bm-usulan">
            {usulan.cukup ? (
              <>
                <Sparkles size={13} />
                <span>Usulan dari {usulan.n} pengukuran sendiri: {ringkasAmbang(usulan.usulan)}</span>
                {bisaSunting && <button type="button" className="ui-btn ui-btn-secondary ui-btn-sm" onClick={pakaiUsulan}>Pakai usulan</button>}
              </>
            ) : (
              <span className="bm-usulan-kurang">
                Riwayat belum cukup untuk mengusulkan batas sendiri ({usulan.n} dari {usulan.minSampel} pengukuran).
              </span>
            )}
          </div>

          {aksi(waspada, setWaspada, 'Waspada')}
          {aksi(bahaya, setBahaya, 'Bahaya')}

          {bisaSunting && (
            <div className="bm-actions">
              <button type="button" className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => simpan('mpm')}>
                Setujui &amp; simpan
              </button>
              {usulan.cukup && (
                <button type="button" className="ui-btn ui-btn-secondary ui-btn-sm" onClick={() => { pakaiUsulan(); simpan('usulan-data'); }}>
                  Setujui usulan data
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
