import { describe, it, expect, beforeEach } from 'vitest';
import { num, computeNH3, COMPUTED, stats, suggestBounds } from '../src/utils/compute';
import { evalField, evaluate, resolveStandard, buildAlerts, resolveAlert, acknowledgeAlert } from '../src/services/alerts';

import { validateRecord } from '../src/utils/validate';
import { CATEGORIES } from '../src/utils/schema';
import type { FieldDef } from '../src/types';
import { bangunSections, COMMON_FIELDS } from '../src/components/dataEntry/bangunSections';

import { ROLES, canInput, categoryVisible } from '../src/services/rolesConfig';
import { muatAntrean, sahkanItem, tolakItem } from '../src/pages/qc/inboxPengesahan/inboxQueue';
import {
  createInduk, afkirInduk, createSpawn, createSiklus,
  createPenempatan, closeSiklus, list, get, verify, tolak, create
} from '../src/services/api';

// Shim localStorage
const mockStorage = new Map<string, string>();
global.localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  length: mockStorage.size,
  key: (i: number) => Array.from(mockStorage.keys())[i] || null
};

describe('Logic Unit Tests', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  describe('compute', () => {
    it('num parses correctly', () => {
      expect(num('1.5').nilai).toBe(1.5);
      expect(num('1,5').nilai).toBe(1.5);
      expect(num('TNTC').flag).toBe('tntc');
      expect(num('>10').flag).toBe('>');
    });

    it('computeNH3 correctly', () => {
      // 0.3 TAN, 8.5 pH, 30C
      const nh3 = computeNH3({ tan: 0.3, ph: 8.5, suhu: 30 });
      expect(nh3).toBeGreaterThan(0.04);
    });

    it('stats and suggestBounds', () => {
      const vals = [10, 12, 11, 10, 13];
      const s = stats(vals);
      expect(s?.mean).toBe(11.2);
      const b = suggestBounds(vals);
      expect(b?.safeMax).toBeGreaterThan(12);
    });
  });

  describe('alerts', () => {
    it('evalField evaluates thresholds', () => {
      const th = { default: { safeMin: 7, safeMax: 8.5, dangerMin: 6, dangerMax: 9 } };
      expect(evalField(8, th)).toBe('normal');
      expect(evalField(6.5, th)).toBe('waspada');
      expect(evalField(9.5, th)).toBe('bahaya');
    });

    it('evalField stage-aware', () => {
      const th = { 
        default: { safeMax: 30 },
        byStage: { 'Z1': { safeMax: 33 } }
      };
      expect(evalField(32, th, 'Z1')).toBe('normal');
      expect(evalField(32, th, 'PL1')).toBe('waspada');
    });
  });

  describe('alert diturunkan dari record', () => {
    const catId = 'prodAirRutin';
    const rec = (over: any) => ({ categoryId: catId, tankId: 'T-01', siklusId: 'S-1', ...over });

    it('tidak menerbitkan alert untuk nilai normal', () => {
      const cat = CATEGORIES.find(c => c.id === catId)!;
      // Ambil field dengan rentang aman lengkap, lalu pakai titik tengahnya.
      const field = cat.fields.find((f: FieldDef) => {
        const d = (f.threshold as any)?.default;
        return d && d.safeMin !== undefined && d.safeMax !== undefined;
      })!;
      const d = (field.threshold as any).default;
      const aman = (d.safeMin + d.safeMax) / 2;
      expect(buildAlerts([rec({ tanggal: '2026-08-10', [field.key]: aman })])).toHaveLength(0);
    });

    it('menerbitkan alert saat ambang bahaya terlampaui', () => {
      const cat = CATEGORIES.find(c => c.id === catId)!;
      const field = cat.fields.find((f: FieldDef) => (f.threshold as any)?.default?.dangerMin !== undefined)!;
      const bahaya = (field.threshold as any).default.dangerMin - 1;

      const alerts = buildAlerts([rec({ tanggal: '2026-08-10', [field.key]: bahaya })]);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].tingkat).toBe('bahaya');
      expect(alerts[0].tankId).toBe('T-01');
      expect(alerts[0].tindakan.length).toBeGreaterThan(0);
    });

    it('kejadian berulang menaikkan hitungan, bukan menambah alert (anti alert-fatigue)', () => {
      const cat = CATEGORIES.find(c => c.id === catId)!;
      const field = cat.fields.find((f: FieldDef) => (f.threshold as any)?.default?.dangerMin !== undefined)!;
      const bahaya = (field.threshold as any).default.dangerMin - 1;

      const alerts = buildAlerts([
        rec({ tanggal: '2026-08-10', [field.key]: bahaya }),
        rec({ tanggal: '2026-08-11', [field.key]: bahaya }),
        rec({ tanggal: '2026-08-12', [field.key]: bahaya }),
      ]);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].hitungan).toBe(3);
    });

    it('tank berbeda menghasilkan alert terpisah', () => {
      const cat = CATEGORIES.find(c => c.id === catId)!;
      const field = cat.fields.find((f: FieldDef) => (f.threshold as any)?.default?.dangerMin !== undefined)!;
      const bahaya = (field.threshold as any).default.dangerMin - 1;

      const alerts = buildAlerts([
        rec({ tankId: 'T-01', tanggal: '2026-08-10', [field.key]: bahaya }),
        rec({ tankId: 'T-02', tanggal: '2026-08-10', [field.key]: bahaya }),
      ]);
      expect(alerts).toHaveLength(2);
    });

    it('status tersimpan (diakui/selesai) menimpa status turunan', () => {
      const cat = CATEGORIES.find(c => c.id === catId)!;
      const field = cat.fields.find((f: FieldDef) => (f.threshold as any)?.default?.dangerMin !== undefined)!;
      const bahaya = (field.threshold as any).default.dangerMin - 1;


      const dasar = buildAlerts([rec({ tanggal: '2026-08-10', [field.key]: bahaya })]);
      const dengan = buildAlerts(
        [rec({ tanggal: '2026-08-10', [field.key]: bahaya })],
        [{ id: dasar[0].id, status: 'selesai', diselesaikanOleh: 'mpm', terakhirDiperbarui: Date.now() }],
      );
      expect(dengan[0].status).toBe('selesai');
      expect(dengan[0].diselesaikanOleh).toBe('mpm');
    });
  });

  describe('rantai pengesahan (Inbox) menulis ke penyimpanan', () => {
    const mpm = ROLES.find(r => r.id === 'mpm')!;
    const kepalaProd = ROLES.find(r => r.id === 'kepalaProd')!;

    const buatDraft = async () => {
      const rec = await create('records', {
        categoryId: 'prodAirRutin', tankId: 'T-01', siklusId: 'S-1',
        tanggal: '2026-08-10', status: 'draft', dibuatOleh: 'petugas.produksi',
      });
      return rec!;
    };

    it('antrean diturunkan dari record nyata, bukan daftar karangan', async () => {
      const rec = await buatDraft();
      const antrean = await muatAntrean(mpm);
      const item = antrean.find(a => a.id === rec.id);
      expect(item).toBeDefined();
      expect(item!.petugas).toBe('petugas.produksi');
      expect(item!.langkah).toBe('qc'); // draft menunggu QC
    });

    it('QC menyimpan status dan tanda tangan ke record', async () => {
      const rec = await buatDraft();
      const [item] = (await muatAntrean(mpm)).filter(a => a.id === rec.id);

      const galat = await sahkanItem(item, 'mpm', 'data:image/png;base64,TTD');
      expect(galat).toBeNull();

      const tersimpan = await get('records', rec.id);
      expect(tersimpan.status).toBe('qc');
      expect(tersimpan.diperiksaMpm.ttd).toBe('data:image/png;base64,TTD');
      expect(tersimpan.diperiksaMpm.oleh).toBe('mpm');
    });

    it('tanda tangan wajib — tanpa TTD pengesahan ditolak', async () => {
      const rec = await buatDraft();
      const [item] = (await muatAntrean(mpm)).filter(a => a.id === rec.id);

      const galat = await sahkanItem(item, 'mpm', '');
      expect(galat).toMatch(/[Tt]anda tangan/);

      const tersimpan = await get('records', rec.id);
      expect(tersimpan.status).toBe('draft'); // tidak berubah
    });

    it('setelah QC, Kepala divisi yang berwenang mengesahkan', async () => {
      const rec = await buatDraft();
      const [awal] = (await muatAntrean(mpm)).filter(a => a.id === rec.id);
      await sahkanItem(awal, 'mpm', 'ttd-qc');

      const [lanjut] = (await muatAntrean(kepalaProd)).filter(a => a.id === rec.id);
      expect(lanjut.langkah).toBe('sahkan');

      expect(await sahkanItem(lanjut, 'kepala.produksi', 'ttd-kepala')).toBeNull();
      const tersimpan = await get('records', rec.id);
      expect(tersimpan.status).toBe('disahkan');
      expect(tersimpan.disahkanKepala.ttd).toBe('ttd-kepala');
    });

    it('penolakan wajib beralasan dan tersimpan', async () => {
      const rec = await buatDraft();
      const [item] = (await muatAntrean(mpm)).filter(a => a.id === rec.id);

      expect(await tolakItem(item, 'mpm', '   ')).toMatch(/[Aa]lasan/);
      expect(await tolakItem(item, 'mpm', 'Nilai DO tidak wajar')).toBeNull();

      const tersimpan = await get('records', rec.id);
      expect(tersimpan.status).toBe('ditolak');
      expect(tersimpan.ditolakOleh.alasan).toBe('Nilai DO tidak wajar');
    });
  });

  describe('penyusunan blok formulir (data entry gabungan)', () => {
    const bagian01 = CATEGORIES.filter(c => c.section === '01' && c.division === 'produksi');

    it('field bersama ditanya sekali di blok Informasi Umum', () => {
      const sections = bangunSections(bagian01);
      const umum = sections[0];
      expect(umum.key).toBe('_umum');
      expect(umum.alwaysActive).toBe(true);

      const kunci = umum.fields.map((f: FieldDef) => f.key);
      expect(new Set(kunci).size).toBe(kunci.length); // tidak ada duplikat
      kunci.forEach((k: string) => expect(COMMON_FIELDS).toContain(k));
    });

    it('setiap formulir asal jadi blok tersendiri', () => {
      const sections = bangunSections(bagian01);
      const blokKategori = sections.filter(s => s.key !== '_umum');
      expect(blokKategori.length).toBeGreaterThan(1);
      blokKategori.forEach(b => {
        expect(b.title.length).toBeGreaterThan(0);
        expect(b.fields.length).toBeGreaterThan(0);
      });
    });

    it('field berlabel sama dari kategori berbeda terpisah ke blok berbeda', () => {
      // Kasus nyata: `bakInduk` berlabel "Bak" ada di spawnerKontrol DAN prodInduk.
      const sections = bangunSections(bagian01).filter(s => s.key !== '_umum');
      const blokBerlabelBak = sections.filter(s => s.fields.some((f: FieldDef) => f.label === 'Bak'));

      if (blokBerlabelBak.length > 1) {
        const kunci = blokBerlabelBak.flatMap(s => s.fields.filter((f: FieldDef) => f.label === 'Bak').map((f: FieldDef) => f.key));
        expect(new Set(kunci).size).toBe(kunci.length); // kunci tetap unik
        blokBerlabelBak.forEach(s => {
          expect(s.fields.filter((f: FieldDef) => f.label === 'Bak')).toHaveLength(1); // satu per blok
        });
      }
    });

    it('kunci field khusus diberi awalan id kategori agar tidak saling menimpa', () => {
      const sections = bangunSections(bagian01).filter(s => s.key !== '_umum');
      sections.forEach(s => {
        s.fields.forEach((f: FieldDef) => expect(f.key.startsWith(`${s.key}__`)).toBe(true));
      });
    });

    it('seluruh field terwakili tanpa ada yang hilang', () => {
      const sections = bangunSections(bagian01);
      const totalDiBlok = sections.reduce((n, s) => n + s.fields.length, 0);
      const kunciAsli = new Set(bagian01.flatMap(c => c.fields.map((f: FieldDef) => f.key)));
      const jumlahCommonDipakai = [...kunciAsli].filter(k => COMMON_FIELDS.includes(k)).length;
      const jumlahKhusus = bagian01.flatMap(c => c.fields).filter((f: FieldDef) => !COMMON_FIELDS.includes(f.key)).length;

      expect(totalDiBlok).toBe(jumlahCommonDipakai + jumlahKhusus);
    });
  });

  describe('validate', () => {
    it('validateRecord required fields', () => {
      // Kategori lab mana pun yang punya field wajib.
      const cat = CATEGORIES.find(c => c.division === 'lab' && c.fields.some((f: FieldDef) => f.required))!;
      const res = validateRecord({ tanggal: '2026-08-10' }, cat);
      expect(res.ok).toBe(false);
      expect(res.errors.length).toBeGreaterThan(0);
    });

    // Prinsip domain #1: satu baris = satu tank, satu hari.
    it('menolak duplikat (tankId, tanggal) untuk kategori harian per tank', () => {
      const cat = CATEGORIES.find(c => c.id === 'prodLarvae')!;
      const baru = { tankId: 'T-01', siklusId: 'S-1', tanggal: '2026-08-10', stadia: 'Z2' };
      const existing = [{ id: 'r1', categoryId: 'prodLarvae', tankId: 'T-01', tanggal: '2026-08-10', status: 'draft' }];

      const bentrok = validateRecord(baru, cat, { abnormalBlocks: false, existing });
      expect(bentrok.ok).toBe(false);
      expect(bentrok.errors.some(e => e.includes('Sudah ada data'))).toBe(true);
    });

    it('mengizinkan tank sama di tanggal berbeda, dan tanggal sama di tank berbeda', () => {
      const cat = CATEGORIES.find(c => c.id === 'prodLarvae')!;
      const existing = [{ id: 'r1', categoryId: 'prodLarvae', tankId: 'T-01', tanggal: '2026-08-10', status: 'draft' }];

      const besok = validateRecord({ tankId: 'T-01', tanggal: '2026-08-11' }, cat, { abnormalBlocks: false, existing });
      const tankLain = validateRecord({ tankId: 'T-02', tanggal: '2026-08-10' }, cat, { abnormalBlocks: false, existing });

      expect(besok.errors.some(e => e.includes('Sudah ada data'))).toBe(false);
      expect(tankLain.errors.some(e => e.includes('Sudah ada data'))).toBe(false);
    });

    it('record ditolak tidak dihitung sebagai duplikat (petugas boleh mengajukan ulang)', () => {
      const cat = CATEGORIES.find(c => c.id === 'prodLarvae')!;
      const existing = [{ id: 'r1', categoryId: 'prodLarvae', tankId: 'T-01', tanggal: '2026-08-10', status: 'ditolak' }];
      const res = validateRecord({ tankId: 'T-01', tanggal: '2026-08-10' }, cat, { abnormalBlocks: false, existing });
      expect(res.errors.some(e => e.includes('Sudah ada data'))).toBe(false);
    });

    // Persentase dikenali dari unit '%' di schema, bukan tebakan nama kunci.
    it('menolak field bersatuan % di luar rentang 0-100', () => {
      const cat = CATEGORIES.find(c => c.fields.some((f: FieldDef) => f.unit === '%' && f.type === 'number'))!;
      const field = cat.fields.find((f: FieldDef) => f.unit === '%' && f.type === 'number')!;

      const terlaluBesar = validateRecord({ [field.key]: 150 }, cat, { abnormalBlocks: false });
      const negatif = validateRecord({ [field.key]: -5 }, cat, { abnormalBlocks: false });
      const wajar = validateRecord({ [field.key]: 87 }, cat, { abnormalBlocks: false });

      const pesan = (r: { errors: string[] }) => r.errors.some(e => e.includes('antara 0 dan 100'));
      expect(pesan(terlaluBesar)).toBe(true);
      expect(pesan(negatif)).toBe(true);
      expect(pesan(wajar)).toBe(false);
    });

    it('menerima persentase yang ditulis dengan koma desimal', () => {
      const cat = CATEGORIES.find(c => c.fields.some((f: FieldDef) => f.unit === '%' && f.type === 'number'))!;
      const field = cat.fields.find((f: FieldDef) => f.unit === '%' && f.type === 'number')!;
      const res = validateRecord({ [field.key]: '87,5' }, cat, { abnormalBlocks: false });
      expect(res.errors.some(e => e.includes('antara 0 dan 100'))).toBe(false);
    });

  });

  describe('api entitas', () => {
    it('induk lifecycle', async () => {
      const ind = await createInduk({ tglKedatangan: '2026-08-10T00:00:00.000Z', umur: 300, berat: 110 });
      expect(ind?.kodeBatch).toContain('IND-');
      expect(ind?.status).toBe('aktif');

      const afkir = await afkirInduk(ind!.id);
      expect(afkir?.status).toBe('selesai');
    });

    it('siklus lifecycle', async () => {
      const ind = await createInduk({ tglKedatangan: '2026-08-10T00:00:00.000Z', umur: 300, berat: 110 });
      const sp = await createSpawn({ indukId: ind!.id, tanggal: '2026-08-10', fekunditas: 1200000, fertilizationRate: 90, hatchingRate: 85, jumlahNauplii: 918000 });
      const sik = await createSiklus({ indukId: ind!.id, tglMulai: '2026-08-10T00:00:00.000Z' });
      
      expect(sik?.kodeBatch).toContain('SIK-');
      expect(sik?.status).toBe('setup');

      await createPenempatan({ siklusId: sik!.id, tankId: 't1', ruangStadia: 'pl', jumlahAwal: 1000, komposisi: [{ spawnId: sp!.id, jumlah: 1000 }] });
      const closed = await closeSiklus(sik!.id, 75);
      expect(closed?.status).toBe('selesai');
    });

    it('pengesahan (verify/tolak)', async () => {
      // Mock record in localStorage
      mockStorage.set('prima_larvae_records', JSON.stringify([{ id: 'r1', status: 'draft', dibuatOleh: 'x' }]));
      
      const v = await verify('records', 'r1', 'qc', { oleh: 'mpm', pada: Date.now(), ttd: 'xx' });
      expect(v?.status).toBe('qc');
      expect(v?.diperiksaMpm?.oleh).toBe('mpm');

      const t = await tolak('records', 'r1', { step: 'qc', alasan: 'salah ketik', stamp: { oleh: 'mpm', pada: Date.now(), alasan: 'salah ketik' } });
      expect(t?.status).toBe('ditolak');
      expect(t?.ditolakOleh?.alasan).toBe('salah ketik');
    });
  });

  describe('pemisahan role (produksi vs lab)', () => {
    const petugasProd = ROLES.find(r => r.id === 'petugasProd')!;
    const petugasLab = ROLES.find(r => r.id === 'petugasLab')!;
    const catProd = CATEGORIES.find(c => c.division === 'produksi')!;
    // Dipilih lewat sifatnya (divisi + area), bukan id — supaya uji tetap sahih
    // saat kategori direstrukturisasi.
    const catLabMat = CATEGORIES.find(c => c.division === 'lab' && c.area === 'maturasi')!;
    const catLabPl = CATEGORIES.find(c => c.division === 'lab' && c.area === 'pl')!;

    it('petugas produksi hanya boleh input kategori produksi', () => {
      expect(canInput(petugasProd, catProd)).toBe(true);
      expect(canInput(petugasProd, catLabMat)).toBe(false);
    });

    it('petugas lab dibatasi oleh area-nya', () => {
      expect(canInput(petugasLab, catLabMat, 'maturasi')).toBe(true);
      expect(canInput(petugasLab, catLabPl, 'maturasi')).toBe(false);
      expect(canInput(petugasLab, catProd, 'maturasi')).toBe(false);
    });

    it('categoryVisible menyembunyikan area lain dari petugas lab', () => {
      expect(categoryVisible(petugasLab, catLabMat, 'maturasi')).toBe(true);
      expect(categoryVisible(petugasLab, catLabPl, 'maturasi')).toBe(false);
    });
  });

  describe('mitigasi alert & bukti tindakan (§12)', () => {
    it('acknowledgeAlert menandai alert sebagai diakui', async () => {
      const ok = await acknowledgeAlert('alert-1', 'operator1');
      expect(ok).toBe(true);
      const saved = await get('alerts', 'alert-1');
      expect(saved?.status).toBe('diakui');
      expect(saved?.diakuiOleh).toBe('operator1');
    });

    it('resolveAlert mewajibkan dan mencatat bukti tindakan operasional ke prodLogTindakan (§12)', async () => {
      const ok = await resolveAlert('alert-do-drop', {
        oleh: 'operator1',
        jenisTindakan: 'pergantian air',
        jam: '14:30',
        dosis: '200 Liter',
        catatanMitigasi: 'Air diganti 20% dan aerasi darurat diaktifkan',
        tankId: 'T-01',
      });
      expect(ok).toBe(true);

      const savedAlert = await get('alerts', 'alert-do-drop');
      expect(savedAlert?.status).toBe('selesai');
      expect(savedAlert?.diselesaikanOleh).toBe('operator1');
      expect(savedAlert?.mitigasi?.jenisTindakan).toBe('pergantian air');
      expect(savedAlert?.mitigasi?.dosis).toBe('200 Liter');
      expect(savedAlert?.mitigasi?.catatanMitigasi).toContain('aerasi darurat');

      // Verifikasi entri otomatis ke log tindakan (§12)
      const allRecords = await list('records');
      const logEntry = allRecords.find((r: any) => r.categoryId === 'prodLogTindakan');
      expect(logEntry).toBeDefined();
      expect(logEntry?.tankId).toBe('T-01');
      expect(logEntry?.jenisTindakan).toBe('pergantian air');
    });
  });
});

