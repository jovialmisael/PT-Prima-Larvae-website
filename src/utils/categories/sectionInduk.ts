import { Category } from '@domainTypes/index';
import { pcrPanel, PATOGEN_INDUK } from './_shared';

// §01 Induk & Pemijahan — kategori BARU (pakan segar + PCR).
export const SECTION_INDUK: Category[] = [
  // Penerimaan pakan segar induk
  {
    id: 'prodPakanSegar',
    division: 'produksi',
    section: '01',
    collection: 'records',
    title: 'Penerimaan Pakan Segar Induk',
    frekuensi: 'setiap kedatangan pakan',
    fields: [
      { key: 'tanggal', label: 'Tanggal Masuk', type: 'date', required: true },
      { key: 'jenisPakan', label: 'Jenis Pakan', type: 'select', options: ['cumi', 'cacing laut', 'artemia biomassa'], required: true },
      { key: 'sumber', label: 'Sumber / Pemasok', type: 'text', required: true }
    ]
  },

  // PCR induk
  {
    id: 'labPcrInduk',
    division: 'lab',
    area: 'maturasi',
    section: '01',
    collection: 'records',
    title: 'Uji PCR Induk',
    frekuensi: 'setiap batch induk baru',
    fields: [
      { key: 'tanggal', label: 'Tanggal Uji', type: 'date', required: true },
      { key: 'indukId', label: 'Batch Induk', type: 'ref', ref: 'induk', required: true },
      ...pcrPanel(PATOGEN_INDUK)
    ]
  },

  // PCR pakan segar induk
  {
    id: 'labPcrPakanSegar',
    division: 'lab',
    area: 'maturasi',
    section: '01',
    collection: 'records',
    title: 'Uji PCR Pakan Segar Induk',
    frekuensi: 'setiap kedatangan pakan',
    fields: [
      { key: 'tanggal', label: 'Tanggal Uji', type: 'date', required: true },
      { key: 'jenisPakan', label: 'Jenis Pakan', type: 'select', options: ['cumi', 'cacing laut', 'artemia biomassa'], required: true },
      { key: 'sumber', label: 'Sumber / Pemasok', type: 'text' },
      ...pcrPanel(PATOGEN_INDUK)
    ]
  }
];

