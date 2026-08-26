import { useEffect, useState } from 'react';
import type { JadwalBerkala } from '@domainTypes/index';
import { CATEGORIES } from '@utils/schema';
import { PERLU_JADWAL_KEPALA } from '@utils/kadens';
import { currentRole, currentUser } from '@services/session';
import { muatJadwal, simpanJadwal, jatuhTempoTerakhir, jatuhTempoBerikut, type PetaJadwal } from '@services/jadwalBerkala';
import { tanggalLokal } from '@utils/waktuJadwal';
import { CalendarClock } from 'lucide-react';
import { SeksiUmurPakai } from './SeksiUmurPakai';
import './jadwalBerkala.css';

/**
 * Jadwal Pemeriksaan Berkala — ditetapkan Kepala Divisi.
 *
 * PDF menandai sebagian pemeriksaan "berkala" lalu menulis sendiri bahwa
 * intervalnya perlu ditetapkan. Keputusan itu milik orang, bukan angka bawaan,
 * jadi di sinilah tempatnya — bukan dikeraskan di skema.
 */
export function JadwalBerkalaPage() {
  const role = currentRole();
  const user = currentUser();
  const bisaSunting = role?.level === 'kepala';

  const [peta, setPeta] = useState<PetaJadwal>({});
  const [pesan, setPesan] = useState('');
  const hariIni = tanggalLokal();

  useEffect(() => {
    let alive = true;
    muatJadwal().then(p => { if (alive) setPeta(p); });
    return () => { alive = false; };
  }, []);

  const kategori = PERLU_JADWAL_KEPALA
    .map(id => CATEGORIES.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const ubah = (categoryId: string, patch: Partial<JadwalBerkala>) => {
    const bawaan: JadwalBerkala = {
      id: categoryId,
      categoryId,
      mulai: hariIni,
      intervalHari: 30,
      aktif: true,
      ditetapkanOleh: user?.userId ?? '',
      diperbaruiPada: Date.now(),
    };
    setPeta({ ...peta, [categoryId]: { ...bawaan, ...peta[categoryId], ...patch } });
  };

  const simpan = async (categoryId: string) => {
    const j = peta[categoryId];
    if (!j) return;
    await simpanJadwal({ ...j, ditetapkanOleh: user?.userId ?? '', diperbaruiPada: Date.now() });
    setPeta(await muatJadwal());
    setPesan('Jadwal disimpan. Pemeriksaan akan muncul di daftar tugas pada tanggal jatuh temponya.');
    setTimeout(() => setPesan(''), 4000);
  };

  return (
    <div className="jb-page">
      <div className="jb-header">
        <h1 className="jb-title"><CalendarClock size={20} /> Jadwal Pemeriksaan Berkala</h1>
        <p className="jb-sub">
          Dokumen parameter menandai pemeriksaan berikut sebagai <em>berkala</em> tanpa menyebut
          intervalnya, dan menulis bahwa interval itu perlu ditetapkan. Selama belum dijadwalkan di
          sini, keduanya tidak akan pernah muncul sebagai tugas — dan ketiadaannya tidak akan
          terdeteksi sebagai keterlambatan.
        </p>
      </div>

      {!bisaSunting && (
        <p className="jb-notice">Tampilan baca-saja. Penjadwalan adalah kewenangan Kepala Divisi.</p>
      )}
      {pesan && <p className="jb-toast">{pesan}</p>}

      <section className="jb-seksi">
        <h2 className="jb-seksi-judul">Interval Pemeriksaan Berkala</h2>
        <div className="jb-list">
        {kategori.map(c => {
          const j = peta[c.id];
          const aktif = j?.aktif ?? false;
          const berikut = j && aktif ? jatuhTempoBerikut(j, hariIni) : null;
          const terakhir = j && aktif ? jatuhTempoTerakhir(j, hariIni) : null;

          return (
            <div key={c.id} className={`jb-card ${aktif ? 'is-aktif' : ''}`}>
              <div className="jb-card-head">
                <div>
                  <strong>{c.title}</strong>
                  <span className="jb-card-pdf">PDF: {c.frekuensi}</span>
                </div>
                <label className="jb-toggle">
                  <input
                    type="checkbox"
                    checked={aktif}
                    disabled={!bisaSunting}
                    onChange={e => ubah(c.id, { aktif: e.target.checked })}
                  />
                  <span>{aktif ? 'Dijadwalkan' : 'Belum dijadwalkan'}</span>
                </label>
              </div>

              <div className="jb-form">
                <label className="jb-field">
                  <span>Mulai</span>
                  <input
                    type="date"
                    value={j?.mulai ?? hariIni}
                    disabled={!bisaSunting || !aktif}
                    onChange={e => ubah(c.id, { mulai: e.target.value })}
                  />
                </label>
                <label className="jb-field">
                  <span>Interval (hari)</span>
                  <input
                    type="number"
                    min={0}
                    value={j?.intervalHari ?? 30}
                    disabled={!bisaSunting || !aktif}
                    onChange={e => ubah(c.id, { intervalHari: Number(e.target.value) })}
                  />
                </label>
                <label className="jb-field jb-field-wide">
                  <span>Catatan</span>
                  <input
                    type="text"
                    value={j?.catatan ?? ''}
                    disabled={!bisaSunting || !aktif}
                    placeholder="Dasar penetapan interval"
                    onChange={e => ubah(c.id, { catatan: e.target.value })}
                  />
                </label>
              </div>

              <div className="jb-card-foot">
                <span className="jb-jatuh-tempo font-mono">
                  {aktif
                    ? `Jatuh tempo berjalan: ${terakhir ?? 'belum mulai'}${berikut ? ' · berikutnya ' + berikut : ''}`
                    : 'Interval 0 berarti sekali saja.'}
                </span>
                {bisaSunting && (
                  <button type="button" className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => simpan(c.id)}>
                    Simpan jadwal
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </section>

      <SeksiUmurPakai bisaSunting={bisaSunting} userId={user?.userId ?? ''} />
    </div>
  );
}
