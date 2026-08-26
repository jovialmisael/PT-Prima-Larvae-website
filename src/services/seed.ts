import { get, create, createInduk, createSpawn, createSiklus, createPenempatan } from '@services/api';

const DATA_VERSION = 1;

export async function ensureSeeded() {
  const version = await get('config' as any, 'DATA_VERSION');
  if (version?.value === DATA_VERSION) return;
  
  await resetData();
  
  // Seed rearingPlan
  const stages = ['N5', 'Z1', 'Z2', 'Z3', 'M1', 'M2', 'M3', 'MPL', 'PL1', 'PL2', 'PL3', 'PL4', 'PL5', 'PL6', 'PL7', 'PL8', 'PL9', 'PL10'];
  for (let i = 0; i < stages.length; i++) {
    await create('rearingPlan', {
      stadia: stages[i],
      doc: i + 1,
      targetSuhu: i < 5 ? 33 : (i < 10 ? 32 : 30),
      algaeTH: 100000,
      algaeCH: 100000,
      waterLevel: 10000,
      mesh: 300,
      waterSource: 'Tandon A',
      exchange: 10,
      dosing: { treflan: 1, vAlgen: 1, bzt: 1, vitC: 1, chlor: 1 },
      probiotikSchedule: '14/22'
    });
  }

  // Seed Tanks
  const tanks = ['T01', 'T02', 'T03'];
  for (const t of tanks) {
    await create('tank', { namaTank: t, ruangStadia: 'pl', lokasi: 'A', kapasitas: 10000, status: 'aktif' });
  }

  // Seed Induk (PDF §01: Kode batch induk, umur, dan berat)
  const dateStr = new Date().toISOString();
  await createInduk({
    kodeBatch: 'IND-2608-A',
    tglKedatangan: dateStr,
    umur: 300,
    berat: 110,
    pcr: { wssv: 'negatif', ihhnv: 'negatif' }
  });
  const induk = (await get('induk' as any, 'IND-2608-A')) || (await import('@services/api').then(api => api.list('induk')))[0];

  if (induk) {
    // Seed Spawn (PDF §01: Fekunditas, Fertilization Rate, Hatching Rate, Jumlah Nauplii)
    await createSpawn({
      indukId: induk.id,
      tanggal: dateStr,
      fekunditas: 1200000,
      fertilizationRate: 90,
      hatchingRate: 85,
      jumlahNauplii: 918000
    });
    const spawn = (await import('@services/api').then(api => api.list('spawn')))[0];


    if (spawn) {
      // Seed Siklus
      await createSiklus({ indukId: induk.id, tglMulai: dateStr });
      const siklus = (await import('@services/api').then(api => api.list('siklus')))[0];
      
      if (siklus) {
        // Seed Penempatan
        const tankList = await import('@services/api').then(api => api.list('tank'));
        if (tankList.length > 0) {
          await createPenempatan({
            siklusId: siklus.id,
            tankId: tankList[0].id,
            ruangStadia: 'pl',
            tglMasuk: dateStr,
            jumlahAwal: 1000000,
            komposisi: [{ spawnId: spawn.id, jumlah: 1000000 }]
          });
        }
      }
    }
  }

  await create('config' as any, { id: 'DATA_VERSION', value: DATA_VERSION });
}

export async function resetData() {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
}
