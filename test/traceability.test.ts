import { describe, it, expect, beforeEach } from 'vitest';
import { kompilasiPasporSiklus } from '../src/services/traceability';
import { createInduk, createSpawn, createSiklus, createPenempatan, create } from '../src/services/api';

// Shim localStorage
const mockStorage = new Map<string, string>();
global.localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  length: mockStorage.size,
  key: (i: number) => Array.from(mockStorage.keys())[i] || null,
};

describe('§11 Traceability & Paspor Siklus', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('mengompilasi seluruh tahapan (Induk -> Spawn -> Air -> Stadia -> QC Panen) ke dalam Paspor Siklus', async () => {
    // 1. Buat data Induk
    const induk = await createInduk({
      kodeBatch: 'IND-TEST-01',
      tglKedatangan: '2026-08-01T00:00:00.000Z',
      umur: 320,
      berat: 115,
      pcr: { wssv: 'negatif', imnv: 'negatif', ehp: 'negatif', ahpnd: 'negatif', ihhnv: 'negatif' },
    });

    // 2. Buat Spawning
    const spawn = await createSpawn({
      indukId: induk!.id,
      tanggal: '2026-08-05',
      fekunditas: 1500000,
      fertilizationRate: 92,
      hatchingRate: 88,
      jumlahNauplii: 1214400,
      keaktifan: 'aktif',
      responFototaksis: 'positif',
      keseragaman: 'Seragam',
    });

    // 3. Buka Siklus Budidaya
    const siklus = await createSiklus({
      indukId: induk!.id,
      tglMulai: '2026-08-06T00:00:00.000Z',
    });

    // 4. Tempatkan ke Tank
    await createPenempatan({
      siklusId: siklus!.id,
      tankId: 'T-01',
      ruangStadia: 'pl',
      jumlahAwal: 500000,
      komposisi: [{ spawnId: spawn!.id, jumlah: 500000 }],
    });

    // 5. Catat Log Air Rutin & Log Tindakan (§04, §12)
    await create('records', {
      categoryId: 'prodAirRutin',
      siklusId: siklus!.id,
      tankId: 'T-01',
      tanggal: '2026-08-07',
      suhuPagi: 29.5,
      suhuSore: 30.5,
      doPagi: 5.8,
      doSore: 6.2,
      phPagi: 7.9,
      phSore: 8.2,
      salinitas: 30,
    });

    await create('records', {
      categoryId: 'prodLogTindakan',
      siklusId: siklus!.id,
      tankId: 'T-01',
      tanggal: '2026-08-08',
      jam: '09:00',
      jenisTindakan: 'pemberian probiotik',
      dosis: '5 ppm',
      alasan: 'Pemeliharaan mikroflora air bak',
    });

    // 6. Catat SR Antar Stadia & Defect (§06, §07)
    await create('records', {
      categoryId: 'prodEstimasiSr',
      siklusId: siklus!.id,
      tankId: 'T-01',
      tanggal: '2026-08-15',
      totalStocking: 500000,
      estAkhirZ: 425000, // SR N->Z = 85%
      estAkhirM: 361250, // SR Z->M = 85%
      estAkhirPl: 307000, // SR M->PL = ~85%, Total N->PL = ~61.4%
    });

    // 7. Catat QC Panen (§08)
    await create('records', {
      categoryId: 'panenPl',
      siklusId: siklus!.id,
      tankId: 'T-01',
      tanggal: '2026-08-22',
      formalinSurvival: 98,
      salinitySurvival: 97,
      jumlahPanen: 300000,
      tujuan: 'Tambak Prima Lampung',
    });

    // Kompilasi Paspor Siklus
    const paspor = await kompilasiPasporSiklus(siklus!.id);
    expect(paspor).not.toBeNull();
    expect(paspor?.kodeBatch).toBe(siklus?.kodeBatch);

    // Verifikasi Tahap 1: Induk
    expect(paspor?.stageInduk?.kodeBatch).toBe('IND-TEST-01');
    expect(paspor?.stageInduk?.pcrStatus).toBe('lolos');

    // Verifikasi Tahap 2: Spawning
    expect(paspor?.stageSpawn?.fekunditas).toBe(1500000);
    expect(paspor?.stageSpawn?.fertilizationRate).toBe(92);
    expect(paspor?.stageSpawn?.jumlahNauplii).toBe(1214400);

    // Verifikasi Tahap 3: Air & Tindakan
    expect(paspor?.stageAir.totalLog).toBe(1);
    expect(paspor?.stageAir.avgSuhu).toBe(30.0);
    expect(paspor?.stageAir.logTindakan).toHaveLength(1);
    expect(paspor?.stageAir.logTindakan[0].jenisTindakan).toBe('pemberian probiotik');

    // Verifikasi Tahap 4: Stadia SR
    expect(paspor?.stageStadia.srNZ).toBeCloseTo(85, 1);
    expect(paspor?.stageStadia.srNPL).toBeCloseTo(61.4, 1);

    // Verifikasi Tahap 5: QC Pra-Panen
    expect(paspor?.stageQC.formalinSR).toBe(98);
    expect(paspor?.stageQC.salinitySR).toBe(97);
    expect(paspor?.stageQC.statusKesehatan).toBe('prima');
    expect(paspor?.gradeMutu).toBe('LULUS STANDAR PRIMA');
  });

  it('menandai status bahaya jika PCR induk positif', async () => {
    const induk = await createInduk({
      kodeBatch: 'IND-BAHAYA',
      tglKedatangan: '2026-08-01T00:00:00.000Z',
      pcr: { wssv: 'positif', imnv: 'negatif' },
    });
    const siklus = await createSiklus({ indukId: induk!.id, tglMulai: '2026-08-01T00:00:00.000Z' });

    const paspor = await kompilasiPasporSiklus(siklus!.id);
    expect(paspor?.stageInduk?.pcrStatus).toBe('bahaya');
  });

  it('STUDI KASUS NYATA: Telusur Balik (Backward Trace) dari Kantong PL Panen hingga ke Kode Batch, Umur, dan Berat Induk Asal', async () => {
    // 1. DATA KEDATANGAN INDUK ASAL (§01)
    const indukBatchAsal = await createInduk({
      kodeBatch: 'IND-2026-B12',
      tglKedatangan: '2026-08-01T00:00:00.000Z',
      umur: 315, // Umur 315 hari
      berat: 128, // Berat 128 gram
      pcr: { wssv: 'negatif', imnv: 'negatif', ehp: 'negatif', ahpnd: 'negatif', ihhnv: 'negatif' },
    });

    expect(indukBatchAsal).toBeDefined();
    expect(indukBatchAsal?.kodeBatch).toBe('IND-2026-B12');
    expect(indukBatchAsal?.umur).toBe(315);
    expect(indukBatchAsal?.berat).toBe(128);

    // 2. PEMIJAHAN DARI INDUK TERSEBUT (§01)
    const spawnHasil = await createSpawn({
      indukId: indukBatchAsal!.id,
      tanggal: '2026-08-03',
      fekunditas: 1600000,
      fertilizationRate: 94,
      hatchingRate: 90,
      jumlahNauplii: 1353600,
      keaktifan: 'aktif',
      responFototaksis: 'positif',
      keseragaman: 'Seragam',
    });

    // 3. PEMBUKAAN SIKLUS & DISTRIBUSI KE BAK LARVAE (§06)
    const siklusBaru = await createSiklus({
      indukId: indukBatchAsal!.id,
      tglMulai: '2026-08-04T00:00:00.000Z',
    });

    await createPenempatan({
      siklusId: siklusBaru!.id,
      tankId: 'BAK-PL-05',
      ruangStadia: 'pl',
      jumlahAwal: 500000,
      komposisi: [{ spawnId: spawnHasil!.id, jumlah: 500000 }],
    });

    // 4. PEMELIHARAAN, LOG AIR & PERKEMBANGAN STADIA (§04, §06, §12)
    await create('records', {
      categoryId: 'prodAirRutin',
      siklusId: siklusBaru!.id,
      tankId: 'BAK-PL-05',
      tanggal: '2026-08-10',
      suhuPagi: 29.8,
      suhuSore: 30.2,
      doPagi: 5.9,
      doSore: 6.1,
      phPagi: 8.0,
      phSore: 8.2,
      salinitas: 31,
    });

    // 5. HASIL REALISASI PANEN BENUR PL10 & PENGIRIMAN (§10)
    const panenRecord = await create('records', {
      categoryId: 'panenPl',
      siklusId: siklusBaru!.id,
      tankId: 'BAK-PL-05',
      tanggal: '2026-08-23',
      stadiaPanen: 'PL10',
      umurDoc: 19,
      jumlahPlTotal: 340000,
      plPerKantong: 5000,
      jumlahKantong: 68,
      suhuKantong: 22,
      tambakTujuan: 'Tambak Mitra Prima - Blok C Lampung',
      formalinSurvival: 98,
      salinitySurvival: 96,
    });

    // =========================================================================
    // 🔍 PEMBUKTIAN TELUSUR BALIK (BACKWARD TRACEABILITY):
    // Dari kantong PL (panenRecord.siklusId) -> Telusuri asal-usul induknya!
    // =========================================================================
    const pasporBatchPL = await kompilasiPasporSiklus(panenRecord.siklusId);

    // Verifikasi Paspor Terkompilasi Lengkap
    expect(pasporBatchPL).not.toBeNull();
    expect(pasporBatchPL?.siklusId).toBe(siklusBaru?.id);

    // KUNCI UTAMA: Telusur balik ke Batch Induk, Umur, dan Berat
    expect(pasporBatchPL?.stageInduk).toBeDefined();
    expect(pasporBatchPL?.stageInduk?.kodeBatch).toBe('IND-2026-B12');
    expect(pasporBatchPL?.stageInduk?.umur).toBe(315);
    expect(pasporBatchPL?.stageInduk?.berat).toBe(128);

    // Verifikasi Rantai Pemijahan & Mutu Nauplii
    expect(pasporBatchPL?.stageSpawn?.fekunditas).toBe(1600000);
    expect(pasporBatchPL?.stageSpawn?.fertilizationRate).toBe(94);
    expect(pasporBatchPL?.stageSpawn?.jumlahNauplii).toBe(1353600);

    // Verifikasi Bak & Panen PL
    expect(pasporBatchPL?.penempatanTanks).toContain('BAK-PL-05');
    expect(pasporBatchPL?.stageQC.realisasiPanen?.jumlahPL).toBe(340000);
    expect(pasporBatchPL?.stageQC.realisasiPanen?.tambakTujuan).toBe('Tambak Mitra Prima - Blok C Lampung');
    expect(pasporBatchPL?.gradeMutu).toBe('LULUS STANDAR PRIMA');
  });
});

