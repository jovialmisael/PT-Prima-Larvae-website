import { describe, it, expect } from 'vitest';
import { ambangEfektif, protokolEfektif, usulkanDariRiwayat, kunciBakuMutu } from '../src/services/bakuMutu';
import type { BakuMutu } from '../src/types/index';

const override = (p: Partial<BakuMutu>): BakuMutu => ({
  id: 'c:f', categoryId: 'c', fieldKey: 'f', sumber: 'mpm', diperbaruiPada: 0, ...p,
});

describe('ambang: persetujuan MPM menang atas seed literatur', () => {
  it('memakai ambang bawaan bila MPM belum menetapkan', () => {
    const bawaan = { safeMin: 5, safeMax: 9 };
    expect(ambangEfektif(bawaan, undefined)).toEqual(bawaan);
  });

  it('ambang MPM menggantikan bawaan sepenuhnya', () => {
    const mpm = { safeMin: 6, safeMax: 8 };
    expect(ambangEfektif({ safeMin: 5, safeMax: 9 }, override({ ambang: mpm }))).toEqual(mpm);
  });
});

describe('protokol: tindakan + PIC untuk kedua tingkat', () => {
  it('tingkat waspada punya tindakannya sendiri, bukan diam sampai bahaya', () => {
    const w = protokolEfektif('nh3', 'waspada');
    const b = protokolEfektif('nh3', 'bahaya');
    expect(w.tindakan).not.toBe(b.tindakan);
    expect(w.kontakRole).toBe('pj');
    expect(b.kontakRole).toBe('kepala');
  });

  it('parameter tanpa aksi khusus tetap mendapat tindakan dan PIC', () => {
    const a = protokolEfektif('parameterAntahBerantah', 'bahaya');
    expect(a.tindakan).toBeTruthy();
    expect(a.kontakRole).toBeTruthy();
  });

  it('field PCR apa pun jatuh ke protokol biosecurity', () => {
    expect(protokolEfektif('pcr_wssv', 'bahaya').tindakan).toMatch(/biosecurity/i);
  });

  it('protokol yang disetujui MPM mengalahkan bawaan', () => {
    const milikMpm = { tindakan: 'Hubungi saya langsung.', kontakRole: 'mpm' as const };
    const a = protokolEfektif('nh3', 'bahaya', override({ protokol: { bahaya: milikMpm } }));
    expect(a).toEqual(milikMpm);
  });
});

describe('usulan ambang dihitung dari data siklus sendiri', () => {
  const recs = (n: number) => Array.from({ length: n }, (_, i) => ({ categoryId: 'c', f: 100 + (i % 5) }));

  it('menolak mengusulkan bila riwayat belum cukup', () => {
    const u = usulkanDariRiwayat(recs(5), 'c', 'f');
    expect(u.cukup).toBe(false);
    expect(u.usulan).toBeUndefined();
    expect(u.n).toBe(5);
  });

  it('mengusulkan batas begitu sampelnya memadai', () => {
    const u = usulkanDariRiwayat(recs(30), 'c', 'f');
    expect(u.cukup).toBe(true);
    expect(u.usulan!.dangerMin).toBeLessThan(u.usulan!.safeMin);
    expect(u.usulan!.dangerMax).toBeGreaterThan(u.usulan!.safeMax);
  });

  it('hanya menghitung record milik kategori yang diminta', () => {
    const campur = [...recs(30), ...Array.from({ length: 50 }, () => ({ categoryId: 'lain', f: 999 }))];
    expect(usulkanDariRiwayat(campur, 'c', 'f').n).toBe(30);
  });

  it('kunci baku mutu menggabungkan kategori dan field', () => {
    expect(kunciBakuMutu('prodAirRutin', 'alkalinitas')).toBe('prodAirRutin:alkalinitas');
  });
});
