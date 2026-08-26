import { useEffect, useState } from 'react';
import type { UmurPakai } from '@domainTypes/index';
import { KONSUMABEL, muatUmurPakai, simpanUmurPakai } from '@services/umurPakai';
import { list } from '@services/api';
import { majuHari, tanggalLokal } from '@utils/waktuJadwal';

/**
 * Umur pakai konsumabel treatment — lampu UV, karbon, generator ozon (§02).
 *
 * Sengaja tanpa nilai bawaan: masa pakai karbon aktif berkisar bulan sampai
 * tahun tergantung karakter airnya, jadi angka apa pun yang dibawakan sistem
 * akan salah di sebagian hatchery. Selain itu kejenuhan karbon terdeteksi lewat
 * breakthrough dan bisa terjadi jauh sebelum umur pakainya lewat — karena itu
 * hasil carbon test tetap yang paling menentukan, bukan hitungan hari ini.
 */
export function SeksiUmurPakai({ bisaSunting, userId }: { bisaSunting: boolean; userId: string }) {
  const [konfig, setKonfig] = useState<Record<string, UmurPakai>>({});
  const [terakhir, setTerakhir] = useState<Record<string, string>>({});
  const [pesan, setPesan] = useState('');
  const hariIni = tanggalLokal();

  useEffect(() => {
    let alive = true;
    Promise.all([muatUmurPakai(), list('records')]).then(([u, records]) => {
      if (!alive) return;
      setKonfig(Object.fromEntries(u.map(x => [x.jenisTindakan, x])));

      const peta: Record<string, string> = {};
      for (const r of records as any[]) {
        if (r.categoryId !== 'perawatanTreatment' || !r.tanggal) continue;
        const kini = peta[r.jenisTindakan];
        if (!kini || r.tanggal > kini) peta[r.jenisTindakan] = r.tanggal;
      }
      setTerakhir(peta);
    });
    return () => { alive = false; };
  }, []);

  const ubah = (jenis: string, patch: Partial<UmurPakai>) => {
    const bawaan: UmurPakai = {
      id: jenis, jenisTindakan: jenis, hari: 0, peringatanHari: 14,
      ditetapkanOleh: userId, diperbaruiPada: Date.now(), aktif: true,
    };
    setKonfig({ ...konfig, [jenis]: { ...bawaan, ...konfig[jenis], ...patch } });
  };

  const simpan = async (jenis: string) => {
    const u = konfig[jenis];
    if (!u) return;
    await simpanUmurPakai({ ...u, ditetapkanOleh: userId, diperbaruiPada: Date.now() });
    setKonfig(Object.fromEntries((await muatUmurPakai()).map(x => [x.jenisTindakan, x])));
    setPesan(`Umur pakai "${jenis}" disimpan.`);
    setTimeout(() => setPesan(''), 3000);
  };

  return (
    <section className="jb-seksi">
      <h2 className="jb-seksi-judul">Umur Pakai Konsumabel</h2>
      <p className="jb-sub">
        Berapa lama tiap konsumabel bertahan sebelum perlu diganti. Sistem tidak membawakan angkanya
        karena masa pakai bergantung pada karakter air setempat. Pengingat muncul sebelum habis, bukan
        setelah. Perlu diingat: hasil carbon test yang menyatakan &quot;perlu ganti&quot; tetap
        mengalahkan hitungan hari di sini — karbon bisa jenuh lebih cepat daripada umur nominalnya.
      </p>

      {pesan && <p className="jb-toast">{pesan}</p>}

      <div className="jb-list">
        {KONSUMABEL.map(jenis => {
          const u = konfig[jenis];
          const aktif = u?.aktif ?? false;
          const hari = u?.hari ?? 0;
          const sejak = terakhir[jenis];
          const habis = aktif && hari > 0 && sejak ? majuHari(sejak, hari) : null;

          return (
            <div key={jenis} className={`jb-card ${aktif && hari > 0 ? 'is-aktif' : ''}`}>
              <div className="jb-card-head">
                <div>
                  <strong>{jenis}</strong>
                  <span className="jb-card-pdf">
                    {sejak ? `Tindakan terakhir tercatat ${sejak}` : 'Belum ada tindakan tercatat'}
                  </span>
                </div>
                <label className="jb-toggle">
                  <input
                    type="checkbox"
                    checked={aktif}
                    disabled={!bisaSunting}
                    onChange={e => ubah(jenis, { aktif: e.target.checked })}
                  />
                  <span>{aktif ? 'Dipantau' : 'Belum ditetapkan'}</span>
                </label>
              </div>

              <div className="jb-form">
                <label className="jb-field">
                  <span>Umur pakai (hari)</span>
                  <input
                    type="number"
                    min={0}
                    value={hari}
                    disabled={!bisaSunting || !aktif}
                    onChange={e => ubah(jenis, { hari: Number(e.target.value) })}
                  />
                </label>
                <label className="jb-field">
                  <span>Ingatkan sejak (hari sebelum)</span>
                  <input
                    type="number"
                    min={0}
                    value={u?.peringatanHari ?? 14}
                    disabled={!bisaSunting || !aktif}
                    onChange={e => ubah(jenis, { peringatanHari: Number(e.target.value) })}
                  />
                </label>
              </div>

              <div className="jb-card-foot">
                <span className="jb-jatuh-tempo font-mono">
                  {habis
                    ? `Diperkirakan habis ${habis}${habis < hariIni ? ' — sudah lewat' : ''}`
                    : aktif && hari > 0
                      ? 'Menunggu catatan tindakan pertama sebagai titik mulai.'
                      : 'Belum dipantau.'}
                </span>
                {bisaSunting && (
                  <button type="button" className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => simpan(jenis)}>
                    Simpan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
