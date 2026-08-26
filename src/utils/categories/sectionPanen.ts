import { Category } from '@domainTypes/index';
import { STAGES } from '../stages';
// §09 Kualitas PL Pra-Panen & §10 Panen/Packing/Pengiriman (berbasis EKOR, bukan tonase).
// Pencatatan berhenti saat truk berangkat: DOA/suhu tiba/aklimatisasi dicabut (2026-08-20).
export const SECTION_PANEN: Category[] = [

  // §10 — Panen, Packing, Pengiriman (Produksi) — dihitung per EKOR
  {
    id: 'panenPl',
    division: 'produksi',
    section: '10',
    collection: 'records',
    title: 'Panen, Packing & Pengiriman PL',
    frekuensi: 'setiap pengiriman / panen',
    fields: [

      { key: 'tanggal', label: 'Tanggal Panen', type: 'date', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus', required: true },
      { key: 'tankId', label: 'Bak Sumber', type: 'ref', ref: 'tank' },
      { key: 'stadiaPanen', label: 'Stadia Saat Panen', type: 'select', options: STAGES, group: 'Panen' },
      { key: 'umurDoc', label: 'Umur (DOC) Saat Panen', type: 'number', unit: 'hari', group: 'Panen' },
      { key: 'jumlahPlTotal', label: 'Jumlah PL Total', type: 'number', unit: 'ekor', required: true, group: 'Panen' },
      { key: 'jumlahKantong', label: 'Jumlah Kantong', type: 'number', group: 'Packing' },
      { key: 'plPerKantong', label: 'PL per Kantong', type: 'number', unit: 'ekor', group: 'Packing' },
      { key: 'suhuKantong', label: 'Suhu Air Kantong', type: 'number', unit: '°C', group: 'Packing' },
      { key: 'salinitasKantong', label: 'Salinitas Air Kantong', type: 'number', unit: 'g/l', group: 'Packing' },
      { key: 'jamPanen', label: 'Jam Panen', type: 'text', group: 'Transport' },
      { key: 'jamPacking', label: 'Jam Packing', type: 'text', group: 'Transport' },
      { key: 'jamBerangkat', label: 'Jam Berangkat', type: 'text', group: 'Transport' },
      { key: 'jamTiba', label: 'Jam Tiba', type: 'text', group: 'Transport' },
      { key: 'totalTransport', label: 'Total Lama Transport', type: 'text', group: 'Transport' },
      // Tambak tujuan dipertahankan sbg kunci penelusuran §11 (label, bukan metrik grow-out).
      { key: 'tambakTujuan', label: 'Tambak Tujuan', type: 'text', group: 'Transport' },

      // PDF §10: "Data pengiriman adalah yang membedakan kematian akibat
      // perjalanan dari kematian akibat kualitas PL." Ini masih sisi hatchery —
      // yang di luar cakupan adalah §13 (ADG/FCR/hasil panen tambak).
      { key: 'suhuKantongTiba', label: 'Suhu Kantong Saat Tiba', type: 'number', unit: '°C', group: 'Kedatangan' },
      { key: 'doaPersen', label: 'DOA Saat Tiba', type: 'number', unit: '%', group: 'Kedatangan', threshold: { default: { safeMax: 3, dangerMax: 10 } } },
      { key: 'survivalTiba', label: 'Survival Saat Tiba', type: 'number', unit: '%', group: 'Kedatangan' },
      { key: 'aklimSuhu', label: 'Suhu Aklimatisasi', type: 'number', unit: '°C', group: 'Aklimatisasi' },
      { key: 'aklimSalinitas', label: 'Salinitas Aklimatisasi', type: 'number', unit: 'g/l', group: 'Aklimatisasi' },
      { key: 'aklimLama', label: 'Lama Aklimatisasi', type: 'number', unit: 'menit', group: 'Aklimatisasi' },
      { key: 'jamTebar', label: 'Jam Tebar', type: 'text', group: 'Aklimatisasi' }
    ]
  }
];
