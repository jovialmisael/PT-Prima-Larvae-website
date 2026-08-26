import { Category, FieldDef } from '@domainTypes/index';
import { STAGES } from '../stages';

// Field defect umum (% dari sampel).
const pct = (key: string, label: string): FieldDef => ({ key, label, type: 'number', unit: '%' });

// §05 Mikrobiologi tubuh + §07 Defect & Abnormalitas per stadia (Lab).
export const SECTION_MIKRO_DEFECT: Category[] = [
  // §05 — mikrobiologi tubuh (body) larva/PL
  {
    id: 'labMikroBody',
    division: 'lab',
    area: 'pl',
    section: '05',
    collection: 'records',
    title: 'Mikrobiologi Tubuh (Body) Larva/PL',
    frekuensi: 'harian (mulai mysis)',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'tankId', label: 'Tank', type: 'ref', ref: 'tank', required: true },
      { key: 'stadia', label: 'Stadia', type: 'select', options: STAGES, required: true },
      { key: 'TBC', label: 'TBC (body)', type: 'number', hint: 'TBC' },
      { key: 'TVC', label: 'TVC (body)', type: 'number', hint: 'TVC' },
      // PDF §05: koloni hijau, kuning, dan luminescent dicatat TERPISAH di setiap
      // plating — komposisinya yang menentukan bahaya, bukan angka totalnya.
      { key: 'koloniHijau', label: 'Koloni Hijau', type: 'number' },
      { key: 'koloniKuning', label: 'Koloni Kuning', type: 'number' },
      { key: 'koloniLuminescent', label: 'Koloni Luminescent', type: 'number', threshold: { badValues: ['>0'] } },
      { key: 'pemeriksa', label: 'Pemeriksa', type: 'text' }
    ]
  },

  // §07 — Defect Naupli–Zoea3
  {
    id: 'labDefectNZ',
    division: 'lab',
    area: 'pl',
    section: '07',
    collection: 'records',
    title: 'Defect Naupli–Zoea 3',
    frekuensi: 'harian, per tank',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'tankId', label: 'Tank', type: 'ref', ref: 'tank', required: true },
      { key: 'stadia', label: 'Stadia', type: 'select', options: STAGES },
      { key: 'sampel', label: 'Jumlah Sampel', type: 'number' },
      pct('deformitasTelson', 'Deformitas Telson'),
      pct('deformitasSetae', 'Deformitas Setae'),
      pct('hpPucat', 'Hepatopankreas Pucat'),
      pct('hpHitam', 'Hepatopankreas Hitam'),
      pct('masalahMolting', 'Masalah Molting'),
      pct('penempelan', 'Penempelan'),
      pct('gumpalanAlgae', 'Gumpalan Algae'),
      pct('bolitas', 'Bolitas'),
      { key: 'pemeriksa', label: 'Pemeriksa', type: 'text' }
    ]
  },

  // §07 — Defect Mysis
  {
    id: 'labDefectMysis',
    division: 'lab',
    area: 'pl',
    section: '07',
    collection: 'records',
    title: 'Defect Mysis',
    frekuensi: 'harian, per tank',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'tankId', label: 'Tank', type: 'ref', ref: 'tank', required: true },
      { key: 'sampel', label: 'Jumlah Sampel', type: 'number' },
      pct('masalahMolting', 'Masalah Molting'),
      pct('deformitasTelsonSetae', 'Deformitas Telson & Setae'),
      pct('penempelan', 'Penempelan'),
      pct('keaktifan', 'Tingkat Keaktifan (rendah)'),
      pct('ususKosong', 'Usus Kosong'),
      pct('vorticella', 'Vorticella'),
      pct('protozoa', 'Protozoa'),
      { key: 'pemeriksa', label: 'Pemeriksa', type: 'text' }
    ]
  },

  // §07 — Defect PL
  {
    id: 'labDefectPl',
    division: 'lab',
    area: 'pl',
    section: '07',
    collection: 'records',
    title: 'Defect PL',
    frekuensi: 'harian, per tank',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'bakPl', label: 'Bak PL', type: 'text', required: true },
      { key: 'sampel', label: 'Jumlah Sampel', type: 'number' },
      pct('ususKosong', 'Usus Kosong'),
      pct('masalahMolting', 'Masalah Molting'),
      pct('deformitas', 'Deformitas'),
      pct('nekrosis', 'Nekrosis'),
      pct('kanibalisme', 'Kanibalisme'),
      pct('vorticella', 'Vorticella'),
      pct('filamen', 'Filamen'),
      pct('bakteriLuminescent', 'Bakteri Luminescent'),
      pct('penempelan', 'Penempelan'),
      { key: 'pemeriksa', label: 'Pemeriksa', type: 'text' }
    ]
  }
];
