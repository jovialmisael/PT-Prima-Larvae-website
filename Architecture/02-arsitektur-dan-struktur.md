# 02 · Arsitektur & Struktur

## Prinsip Arsitektur (Clean Architecture & Modular Layering)

### Schema-driven (tanpa kode per-kategori)

Definisi domain tidak tersebar di komponen. `src/utils/schema.ts` merakit seluruh kategori dari modul-modul di `src/utils/categories/`, dan hasil rakitan itulah yang melayani validasi, alert, serta rendering form. Menambah atau mengubah parameter dilakukan dengan menyunting modul kategori — bukan membuat handler baru per kategori. Mesin validasi, mesin alert, dan form generik semuanya membaca schema secara generik. Bentuk data schema dideklarasikan sekali di `src/types/index.ts` sebagai tipe domain bersama.

Pemecahan `categories/` mengikuti 13 bagian PDF parameter klien: ada modul per divisi (`lab.ts`, `produksiRearing.ts`, `produksiBroodstock.ts`) dan modul per-section (`sectionAirTreatment.ts`, `sectionInduk.ts`, `sectionMikroDefect.ts`, `sectionPakanHidup.ts`, `sectionPanen.ts`, `sectionLogFeedback.ts`), dengan potongan bersama di `_shared.ts` dan perakitan di `index.ts`.

### Satu Seam Data: `src/services/api.ts`, Async Sejak Awal

Semua akses data melewati satu pintu, yaitu `api.ts`. Untuk sekarang `api.ts` menyimpan ke localStorage, tapi kontrak REST-nya sudah didokumentasikan (lihat `06`) supaya migrasi ke backend Laravel nanti cukup dengan mengganti isi `api.ts` saja.

Semua fungsi `api.*` bersifat async (mengembalikan `Promise`) sejak hari pertama — localStorage pun dibungkus `Promise.resolve`. Karena pemanggilnya sudah dibangun dengan `async/await` sejak awal, saat backend REST menggantikan `api.ts` di F4 nanti, sisi pemanggil tidak perlu berubah. Cara ini menghindari rework besar dari sync ke async yang biasanya menjebak proyek saat migrasi. Tipe hasilnya memakai pola `ApiResult<T> = T | null` supaya kontrak "gagal simpan" ditegakkan oleh compiler.

### Logic Murni dan Bisa Diuji (Separation of Concerns)

Modul di `src/utils/` adalah domain murni: deterministik, tanpa ketergantungan pada React atau DOM, sehingga mudah diuji dengan Vitest. Efek samping seperti localStorage dan waktu diisolasi di `src/services/` — terutama `api.ts` — sehingga gampang di-shim saat pengujian.

### Pemisahan Presentasi & Controller (Custom Hooks Pattern)

Logika bisnis UI, state internal, dan penanganan event diekstraksi ke custom hook, sementara komponen tetap presentasional. Hook diletakkan **berdampingan dengan fitur yang memakainya**, bukan di folder global — misalnya `pages/auth/useLoginController.ts`, `pages/produksi/workstation/useWorkstationSubmit.ts`, dan `components/dataEntry/useEntrySubmit.ts`. Folder `src/hooks/` tidak dipakai; alias `@hooks` masih dideklarasikan tapi nol pemakai (lihat `01`).

---

## Struktur Folder

```
PT PRIMA LARVAE PANEL/
├─ Architecture/          ← panduan arsitektur (dokumen acuan)
├─ Panduan Prototype/     ← acuan (PDF, foto form, xlsx)
├─ Contoh form pengisian/ ← acuan konten field (screenshot)
├─ test/logic.test.ts     ← uji Vitest (12 tes, impor via path relatif)
├─ vite.config.ts         ← 6 alias + konfigurasi Vitest (environment jsdom)
├─ tsconfig.json          ← TypeScript strict + paths sinkron dengan vite.config.ts
├─ tsconfig.node.json     ← konteks Node untuk vite.config.ts & skrip
├─ package.json
└─ src/
   ├─ main.tsx            ← entry: muat tokens.css + primitives.css, seed, render <App/>
   ├─ App.tsx             ← routing react-router + PrivateRoute (shell via AppLayout)
   ├─ README.md           ← panduan struktur untuk developer (sumber kebenaran struktur)
   ├─ types/              ← MODEL DOMAIN
   │  ├─ index.ts         ← field, threshold, record, alert, ApiResult, union peran
   │  └─ masters.ts       ← tank, induk, spawn, siklus, penempatan, transfer, rearingPlan
   ├─ services/           ← SERVICE LAYER (menyentuh persistensi / sesi / waktu)
   │  ├─ api.ts           ← SEAM data tunggal (semua fn async; ApiResult<T> = T | null)
   │  ├─ session.ts       ← sesi aktif & peran login
   │  ├─ rolesConfig.ts   ← ROLES + USERS: matriks izin & hirarki peran
   │  ├─ alerts.ts        ← evaluasi ambang & resolusi standar
   │  └─ seed.ts          ← data inisialisasi awal
   ├─ utils/              ← HELPER MURNI & DEFINISI DOMAIN
   │  ├─ compute.ts       ← NH₃ Emerson, sentinel, stats, computed
   │  ├─ schema.ts        ← perakit kategori (tipis; isinya dari categories/)
   │  ├─ validate.ts      ← validasi record
   │  ├─ stages.ts        ← daftar stadia larva
   │  └─ categories/      ← 11 modul definisi kategori (per divisi & per section)
   ├─ styles/             ← CSS GLOBAL
   │  ├─ tokens.css       ← design token :root — ubah tema dari sini saja
   │  └─ primitives.css   ← barrel @import → primitivesBase/Cards/Forms/Operator
   ├─ components/
   │  ├─ layout/          ← shell: AppLayout, Header (+4 sub), Sidebar (+1),
   │  │                     headerConfig, sidebarNav
   │  ├─ ui/              ← presentasional generik: Button, Badge, Card, Input, DataTable,
   │  │                     SchemaForm, FieldControl, AlertModal, SignaturePad, Skeleton
   │  │                     (+ ui.css sebagai barrel @import)
   │  └─ dataEntry/       ← mesin data-entry: DataEntry, StackedFormList, CategoryPicker, FormPanel,
   │                        MatrixForm/MatrixGrid, DailyTaskSummary, useEntrySubmit
   └─ pages/              ← satu folder per rute
      ├─ auth/            ← Login + useLoginController + loginPresets
      ├─ dashboard/       ← Dashboard.tsx (dispatcher per role) + 7 folder peran:
      │                     owner, manager, mpm, kepalaLab, kepalaProduksi,
      │                     petugasLab, petugasProduksi
      │                     (8 role → 7 dashboard; pjLab menumpang kepalaLab)
      ├─ produksi/        ← inputProduksi, workstation (Observasi Bak), masterSiklus, panen
      ├─ lab/             ← inputLab
      ├─ manajemen/       ← inputManajemen
      ├─ qc/              ← inboxPengesahan (rantai pengesahan)
      ├─ alerts/          ← alertCenter
      └─ laporan/         ← laporan
```

Aturan penamaan: **folder camelCase**, **file komponen PascalCase**, file non-komponen camelCase. Tiap folder halaman berisi `NamaHalaman.tsx` + `index.ts` (barrel), plus `.css` bila perlu. Detail konvensi ini dipelihara di `src/README.md`.

---

## Path Alias

Alias didefinisikan di dua tempat yang harus selalu sinkron: `vite.config.ts` (resolusi bundler) dan `compilerOptions.paths` di `tsconfig.json` (resolusi editor dan `tsc --noEmit`). Daftar lengkap beserta statusnya ada di `01`.

`@domainTypes/*` · `@services/*` · `@utils/*` · `@components/*` · `@pages/*` — semuanya aktif. `@hooks/*` mati.

Impor selalu memakai alias, misalnya `import { list } from '@services/api'` atau `import { Category } from '@domainTypes/index'`. Import halaman lewat foldernya (`@pages/produksi/inputProduksi`) supaya resolve ke barrel `index.ts`.

---

## Konvensi Kode & Quality Standards

- **Anti-Emoji Policy**: emoji dilarang di seluruh markup/UI/logika. Semua simbol memakai ikon SVG dari `lucide-react`. Status saat ini: nol pelanggaran di `src/`.
- **CSS bertoken, tanpa framework**: proyek ini **tidak memakai Tailwind**. Semua warna, spacing, radius, font, dan efek diambil dari custom property di `src/styles/tokens.css` (`var(--bg-surface)`, `var(--text-sm)`, dan seterusnya). Jangan menulis nilai warna mentah di komponen.
- **Tiga lapis CSS**: token global (`tokens.css`) → primitif bersama (`primitives.css`, dipakai lintas peran) → gaya khas satu halaman/peran di berkas `.css` di folder komponennya. Kalau sebuah kelas tak ditemukan di CSS lokal, cari di `primitives.css`.
- **Berkas CSS panjang dipecah lewat barrel `@import`** — pola ini sudah dipakai di `styles/primitives.css` dan `components/ui/ui.css`.
- **Batas panjang berkas**: usahakan setiap berkas di bawah ~200 baris. Kalau lewat, pecah per tanggung jawab (ekstrak subkomponen, modul kategori, atau `@import` CSS).
- **Sumber kebenaran peran tunggal**: `services/rolesConfig.ts` (`ROLES` + `USERS`). Jangan membuat daftar role paralel.
- **Strict TypeScript**: pada `api.ts`, fungsi create/update mengembalikan `null` bila gagal menyimpan. Pemanggil wajib menangani `null` lewat `ApiResult<T> = T | null`. `tsc --noEmit` wajib hijau 0 error.
