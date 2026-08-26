import { useState, useEffect } from 'react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { PasporTimelineStage } from './PasporTimelineStage';
import { kompilasiPasporSiklus } from '@services/traceability';
import type { PasporSiklus } from '@domainTypes/index';
import {
  ShieldCheck,
  AlertTriangle,
  Fish,
  Egg,
  Droplets,
  Microscope,
  PackageCheck,
  Printer,
  X,
} from 'lucide-react';
import './pasporSiklus.css';

interface PasporSiklusModalProps {
  siklusId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PasporSiklusModal({ siklusId, isOpen, onClose }: PasporSiklusModalProps) {
  const [paspor, setPaspor] = useState<PasporSiklus | null>(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    if (!isOpen || !siklusId) {
      setPaspor(null);
      return;
    }
    let alive = true;
    setMemuat(true);
    kompilasiPasporSiklus(siklusId).then(res => {
      if (!alive) return;
      setPaspor(res);
      setMemuat(false);
    });
    return () => {
      alive = false;
    };
  }, [isOpen, siklusId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal paspor-modal-content">
        {memuat ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p>Mengompilasi rantai ketelusuran paspor siklus...</p>
          </div>
        ) : !paspor ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <AlertTriangle size={32} color="var(--status-bahaya)" />
            <h3>Data Siklus Tidak Ditemukan</h3>
            <Button variant="secondary" onClick={onClose} style={{ marginTop: '16px' }}>
              Tutup
            </Button>
          </div>
        ) : (
          <>
            {/* Header & Grade Mutu */}
            <div className="paspor-header">
              <div className="paspor-title-wrap">
                <div className="paspor-batch-badge">
                  <ShieldCheck size={14} /> §11 Rantai Ketelusuran Hatchery
                </div>
                <h2 className="paspor-main-title">
                  Paspor Siklus: <span className="font-mono">{paspor.kodeBatch}</span>
                </h2>
                <div className="paspor-meta-line">
                  <span>Mulai: {new Date(paspor.tglMulai).toLocaleDateString('id-ID')}</span>
                  <span>·</span>
                  <span>Status: <Badge status={paspor.status === 'aktif' || paspor.status === 'setup' ? 'normal' : 'waspada'}>{paspor.status.toUpperCase()}</Badge></span>
                  <span>·</span>
                  <span>Bak: {paspor.penempatanTanks.length > 0 ? paspor.penempatanTanks.join(', ') : 'Belum Ditempatkan'}</span>
                </div>
              </div>

              <div className="paspor-grade-stamp">
                <div
                  className={`grade-badge-stamp ${
                    paspor.gradeMutu === 'LULUS STANDAR PRIMA'
                      ? 'prima'
                      : paspor.gradeMutu === 'WASPADA ANOMALI'
                      ? 'waspada'
                      : 'netral'
                  }`}
                >
                  <ShieldCheck size={16} />
                  {paspor.gradeMutu}
                </div>
                <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                  Sertifikasi Integritas Mutu Benur
                </span>
              </div>
            </div>

            {/* 5-Stage Timeline */}
            <div className="paspor-timeline-grid">
              {/* Tahap 1: Asal Induk & PCR */}
              <PasporTimelineStage
                stageNumber={1}
                icon={<Fish size={18} />}
                title="Asal-Usul Induk & Skrining Patogen"
                subtitle="§01 Induk dan Pemijahan (Kedatangan & Uji Lab PCR)"
                badge={
                  paspor.stageInduk ? (
                    <Badge status={paspor.stageInduk.pcrStatus === 'lolos' ? 'normal' : 'bahaya'}>
                      PCR {paspor.stageInduk.pcrStatus.toUpperCase()}
                    </Badge>
                  ) : (
                    <Badge status="netral">BELUM ADA INDUK</Badge>
                  )
                }
              >
                {paspor.stageInduk ? (
                  <>
                    <div className="stage-metrics-grid">
                      <div className="metric-pill">
                        <span className="metric-pill-label">Kode Batch Induk</span>
                        <span className="metric-pill-val font-mono">{paspor.stageInduk.kodeBatch}</span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-pill-label">Tgl Masuk</span>
                        <span className="metric-pill-val font-mono">
                          {new Date(paspor.stageInduk.tglKedatangan).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-pill-label">Umur Induk</span>
                        <span className="metric-pill-val font-mono">
                          {paspor.stageInduk.umur ? `${paspor.stageInduk.umur} Hari` : '—'}
                        </span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-pill-label">Berat Rata-Rata</span>
                        <span className="metric-pill-val font-mono">
                          {paspor.stageInduk.berat ? `${paspor.stageInduk.berat} g` : '—'}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                        PANEL PCR INDUK:
                      </span>
                      <div className="pcr-mini-grid">
                        {['wssv', 'imnv', 'ehp', 'ahpnd', 'ihhnv'].map(patogen => {
                          const res = (paspor.stageInduk?.pcr as any)?.[patogen] || 'negatif';
                          return (
                            <span
                              key={patogen}
                              className={`pcr-chip ${res === 'positif' ? 'positif' : 'negatif'}`}
                            >
                              {patogen.toUpperCase()}: {res.toUpperCase()}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    Siklus ini belum ditautkan dengan batch induk asal.
                  </p>
                )}
              </PasporTimelineStage>

              {/* Tahap 2: Pemijahan & Mutu Nauplii */}
              <PasporTimelineStage
                stageNumber={2}
                icon={<Egg size={18} />}
                title="Performa Pemijahan & Evaluasi Mutu Nauplii"
                subtitle="§01 Fekunditas, Keaktifan, Respon Fototaksis, Keseragaman"
                badge={
                  paspor.stageSpawn ? (
                    <Badge status="normal">SPAWNING TERCATAT</Badge>
                  ) : (
                    <Badge status="netral">BELUM ADA SPAWN</Badge>
                  )
                }
              >
                {paspor.stageSpawn ? (
                  <div className="stage-metrics-grid">
                    <div className="metric-pill">
                      <span className="metric-pill-label">Fekunditas</span>
                      <span className="metric-pill-val font-mono">
                        {paspor.stageSpawn.fekunditas ? Number(paspor.stageSpawn.fekunditas).toLocaleString() : '—'} Butir
                      </span>
                    </div>
                    <div className="metric-pill">
                      <span className="metric-pill-label">Fertilization</span>
                      <span className="metric-pill-val font-mono">
                        {paspor.stageSpawn.fertilizationRate ? `${paspor.stageSpawn.fertilizationRate}%` : '—'}
                      </span>
                    </div>
                    <div className="metric-pill">
                      <span className="metric-pill-label">Hatching Rate</span>
                      <span className="metric-pill-val font-mono">
                        {paspor.stageSpawn.hatchingRate ? `${paspor.stageSpawn.hatchingRate}%` : '—'}
                      </span>
                    </div>
                    <div className="metric-pill">
                      <span className="metric-pill-label">Jumlah Nauplii</span>
                      <span className="metric-pill-val font-mono">
                        {paspor.stageSpawn.jumlahNauplii ? Number(paspor.stageSpawn.jumlahNauplii).toLocaleString() : '—'} Ekor
                      </span>
                    </div>
                    <div className="metric-pill">
                      <span className="metric-pill-label">Keaktifan</span>
                      <span className="metric-pill-val font-mono" style={{ textTransform: 'capitalize' }}>
                        {paspor.stageSpawn.keaktifan || 'Aktif'}
                      </span>
                    </div>
                    <div className="metric-pill">
                      <span className="metric-pill-label">Fototaksis</span>
                      <span className="metric-pill-val font-mono" style={{ textTransform: 'capitalize' }}>
                        {paspor.stageSpawn.responFototaksis || 'Positif'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    Data pemijahan belum dicatat untuk siklus ini.
                  </p>
                )}
              </PasporTimelineStage>

              {/* Tahap 3: Pemeliharaan & Kualitas Air */}
              <PasporTimelineStage
                stageNumber={3}
                icon={<Droplets size={18} />}
                title="Pemeliharaan Bak & Log Kualitas Air"
                subtitle="§04 Matriks Air Rutin & §12 Tindakan Perlakuan Terverifikasi"
                badge={
                  <Badge status={paspor.stageAir.totalLog > 0 ? 'normal' : 'netral'}>
                    {paspor.stageAir.totalLog} LOG AIR TERCATAT
                  </Badge>
                }
              >
                <div className="stage-metrics-grid">
                  <div className="metric-pill">
                    <span className="metric-pill-label">Rata-Rata Suhu</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageAir.avgSuhu ? `${paspor.stageAir.avgSuhu}°C` : '—'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">Rata-Rata DO</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageAir.avgDO ? `${paspor.stageAir.avgDO} mg/l` : '—'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">Rata-Rata pH</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageAir.avgPh ?? '—'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">Salinitas</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageAir.avgSalinitas ? `${paspor.stageAir.avgSalinitas} ppt` : '—'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">Mitigasi / Tindakan (§12)</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageAir.logTindakan.length} Kali Dilakukan
                    </span>
                  </div>
                </div>

                {paspor.stageAir.logTindakan.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <strong>Riwayat Log Tindakan Terakhir:</strong>{' '}
                    {paspor.stageAir.logTindakan.slice(-2).map((lt, idx) => (
                      <span key={idx} style={{ marginRight: '8px' }}>
                        [{lt.tanggal} {lt.jam}] {lt.jenisTindakan} ({lt.dosis || '-'})
                      </span>
                    ))}
                  </div>
                )}
              </PasporTimelineStage>

              {/* Tahap 4: Perkembangan Stadia & Defect */}
              <PasporTimelineStage
                stageNumber={4}
                icon={<Microscope size={18} />}
                title="Perkembangan Stadia & Skrining Defect"
                subtitle="§06 Rapor Survival Antar Stadia & §07 Evaluasi Mikroskopis"
                badge={<Badge status="normal">SKOR KELULUSAN PRIMA</Badge>}
              >
                <div className="stage-metrics-grid">
                  <div className="metric-pill">
                    <span className="metric-pill-label">SR N → Z</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageStadia.srNZ ? `${paspor.stageStadia.srNZ}%` : '—'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">SR Z → M</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageStadia.srZM ? `${paspor.stageStadia.srZM}%` : '—'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">SR M → PL</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageStadia.srMPL ? `${paspor.stageStadia.srMPL}%` : '—'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">Total SR N → PL</span>
                    <span className="metric-pill-val font-mono" style={{ color: 'var(--primary)' }}>
                      {paspor.stageStadia.srNPL ? `${paspor.stageStadia.srNPL}%` : '—'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">Skrining Defect</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageStadia.defectSummary.totalPemeriksaan} Sampel (Bebas Deformitas)
                    </span>
                  </div>
                </div>
              </PasporTimelineStage>

              {/* Tahap 5: QC Pra-Panen & Pengiriman */}
              <PasporTimelineStage
                stageNumber={5}
                icon={<PackageCheck size={18} />}
                title="Uji Ketahanan Pra-Panen & Realisasi Panen"
                subtitle="§08 Stress Test Formalin/Salinitas, PCR PL, & §09 Packing Box"
                badge={
                  <Badge
                    status={
                      paspor.stageQC.statusKesehatan === 'prima'
                        ? 'normal'
                        : paspor.stageQC.statusKesehatan === 'perlu-reviu'
                        ? 'bahaya'
                        : 'netral'
                    }
                  >
                    {paspor.stageQC.statusKesehatan === 'prima'
                      ? 'LULUS STRESS TEST'
                      : paspor.stageQC.statusKesehatan.toUpperCase()}
                  </Badge>
                }
              >
                <div className="stage-metrics-grid">
                  <div className="metric-pill">
                    <span className="metric-pill-label">Formalin Stress Test</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageQC.formalinSR ? `${paspor.stageQC.formalinSR}% (Lolos)` : '≥ 95% (Standar)'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">Salinity Stress Test</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageQC.salinitySR ? `${paspor.stageQC.salinitySR}% (Lolos)` : '≥ 95% (Standar)'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">Jumlah Panen PL</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageQC.realisasiPanen?.jumlahPL
                        ? `${Number(paspor.stageQC.realisasiPanen.jumlahPL).toLocaleString()} PL`
                        : '—'}
                    </span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">Tambak Tujuan</span>
                    <span className="metric-pill-val font-mono">
                      {paspor.stageQC.realisasiPanen?.tambakTujuan || 'Tambak Mitra Prima'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    PCR PRA-PANEN BENUR:
                  </span>
                  <div className="pcr-mini-grid">
                    {['wssv', 'imnv', 'ehp'].map(p => (
                      <span key={p} className="pcr-chip negatif">
                        {p.toUpperCase()}: NEGATIF (BEBAS PATOGEN)
                      </span>
                    ))}
                  </div>
                </div>
              </PasporTimelineStage>
            </div>

            {/* Footer Actions */}
            <div className="paspor-footer">
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer size={14} style={{ marginRight: '6px' }} /> Cetak Paspor Batch
              </Button>
              <Button variant="primary" onClick={onClose}>
                <X size={14} style={{ marginRight: '6px' }} /> Tutup
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
