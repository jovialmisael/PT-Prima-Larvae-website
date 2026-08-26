import { useEffect, useMemo, useState } from 'react';
import type { BakuMutu, NumericThreshold, Threshold } from '@domainTypes/index';
import { CATEGORIES } from '@utils/schema';
import { list } from '@services/api';
import { currentRole, currentUser } from '@services/session';
import { muatBakuMutu, simpanBakuMutu, usulkanDariRiwayat, kunciBakuMutu, type PetaBakuMutu } from '@services/bakuMutu';
import { BakuMutuRow, type BarisMutu } from './BakuMutuRow';
import { Search, ShieldCheck } from 'lucide-react';
import './bakuMutu.css';

/** Hanya ambang numerik yang bisa disunting; kategorikal & per-stadia tampil apa adanya. */
function ambangNumerik(t?: Threshold): NumericThreshold | undefined {
  if (!t) return undefined;
  if ('badValues' in t) return undefined;
  if ('default' in t) return 'badValues' in t.default ? undefined : t.default;
  return t as NumericThreshold;
}

/**
 * Baku Mutu (PRD §3.C) — milik MPM.
 *
 * PDF menuntut lima hal per parameter: nilai normal, ambang waspada, ambang
 * bahaya, tindakan, dan siapa yang dihubungi. Halaman ini tempat kelimanya
 * ditetapkan, termasuk mengganti angka literatur dengan batas yang dihitung
 * dari data siklus sendiri.
 */
export function BakuMutuPage() {
  const role = currentRole();
  const user = currentUser();
  const bisaSunting = role?.level === 'mpm' || role?.level === 'kepala';

  const [peta, setPeta] = useState<PetaBakuMutu>({});
  const [records, setRecords] = useState<any[]>([]);
  const [cari, setCari] = useState('');
  const [pesan, setPesan] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([muatBakuMutu(), list('records')]).then(([p, r]) => {
      if (!alive) return;
      setPeta(p);
      setRecords(r);
    });
    return () => { alive = false; };
  }, []);

  const baris = useMemo<BarisMutu[]>(() => {
    const hasil: BarisMutu[] = [];
    for (const c of CATEGORIES) {
      for (const f of c.fields) {
        if (!f.threshold) continue;
        hasil.push({
          categoryId: c.id,
          categoryTitle: c.title,
          field: f,
          ambangBawaan: ambangNumerik(f.threshold),
          override: peta[kunciBakuMutu(c.id, f.key)],
          usulan: usulkanDariRiwayat(records, c.id, f.key),
        });
      }
    }
    return hasil;
  }, [peta, records]);

  const terlihat = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return baris;
    return baris.filter(b =>
      b.field.label.toLowerCase().includes(q) || b.categoryTitle.toLowerCase().includes(q));
  }, [baris, cari]);

  const disetujui = baris.filter(b => b.override).length;

  const simpan = async (bm: BakuMutu) => {
    await simpanBakuMutu({ ...bm, disetujuiOleh: user?.userId });
    setPeta(await muatBakuMutu());
    setPesan(`Baku mutu "${bm.fieldKey}" disimpan.`);
    setTimeout(() => setPesan(''), 3000);
  };

  return (
    <div className="bm-page">
      <div className="bm-header">
        <div>
          <h1 className="bm-title"><ShieldCheck size={20} /> Baku Mutu Parameter</h1>
          <p className="bm-sub">
            Setiap parameter perlu batas <em>dan</em> tindakan — angka tanpa batas hanya jadi arsip.
            Batas sebaiknya dihitung dari data siklus sendiri, bukan diambil dari buku.
          </p>
        </div>
        <div className="bm-stat">
          <span className="font-mono">{disetujui} / {baris.length}</span>
          <span>sudah ditetapkan</span>
        </div>
      </div>

      {!bisaSunting && (
        <p className="bm-notice">
          Tampilan baca-saja. Penetapan baku mutu adalah kewenangan MPM dan Kepala Divisi.
        </p>
      )}
      {pesan && <p className="bm-toast">{pesan}</p>}

      <div className="bm-search">
        <Search size={15} />
        <input type="text" value={cari} onChange={e => setCari(e.target.value)}
          placeholder="Cari parameter atau formulir..." />
      </div>

      <div className="bm-list">
        {terlihat.length === 0
          ? <p className="bm-kosong">Tidak ada parameter yang cocok.</p>
          : terlihat.map(b => (
            <BakuMutuRow key={`${b.categoryId}:${b.field.key}`} baris={b} bisaSunting={bisaSunting} onSimpan={simpan} />
          ))}
      </div>
    </div>
  );
}
