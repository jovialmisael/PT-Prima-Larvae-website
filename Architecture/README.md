# Arsitektur — PT Prima Larvae Panel

Folder ini memuat panduan arsitektur aplikasi web pemantauan dan pencatatan pembenihan (hatchery) udang vaname Prima Larvae — kategori produknya: **Hatchery Operating System**.

Baca `PRODUCT-DNA.md` sebelum apa pun. Dokumen bernomor `00`–`14` menjelaskan bagaimana produk ini dibangun, sedangkan Product DNA menjelaskan apa produk ini sebenarnya dan mengapa ia ada. Kalau suatu saat ada keputusan teknis yang berbenturan dengan Product DNA, yang menang adalah Product DNA.

Catatan penomoran: dokumen `07` (dulu UI) sudah pensiun; lapisan antarmuka kini ditulis ulang lengkap di trio `12`–`14` (IA, UX, UI).

---

## Status build (per 19 Agustus 2026)

**Aplikasinya sudah berjalan.** Folder ini semula ditulis sebagai cetak biru *sebelum* ngoding, tapi kodenya sudah lama menyalip dokumen. Kondisi nyata di `src/`:

| Ukuran | Nilai |
|---|---|
| Berkas sumber | 188 berkas (136 `.ts`/`.tsx` + 52 `.css`) |
| Baris kode | 14.662 |
| Halaman terpasang | Login, Dashboard (7 varian peran), Data Entry, Workstation Produksi, Master Siklus, Panen, Input Lab, Input Manajemen, Inbox Pengesahan, Alert Center, Laporan |
| Persistensi | localStorage lewat seam tunggal `src/services/api.ts` |
| Gerbang tipe | `tsc --noEmit` — **0 error** |
| Gerbang uji | Vitest — **12 tes hijau** (`test/logic.test.ts`) |

Yang belum: backend Laravel (F4) dan laporan PDF (F5) masih berstatus roadmap.

---

## Dua sumber kebenaran, dan mana yang menang

Sejak kode berjalan, folder ini bukan lagi satu-satunya acuan. Pembagiannya:

| Sumber | Cakupan | Menang untuk |
|---|---|---|
| **`Architecture/`** (folder ini) | Domain, parameter, peran & pengesahan, kontrak API, IA/UX/UI, roadmap | Pertanyaan **"apa dan mengapa"** — aturan domain, ambang batas, rantai pengesahan, batas cakupan produk |
| **`src/README.md`** | Struktur folder aktual, konvensi penamaan, alias, cara verifikasi | Pertanyaan **"di mana dan bagaimana"** — letak berkas, casing, pola halaman |

Kalau keduanya berbenturan soal **struktur kode**, `src/README.md` yang benar. Kalau berbenturan soal **aturan domain**, folder ini yang benar.

---

## Akurasi dokumen terhadap kode

Seluruh dokumen di folder ini sudah diselaraskan dengan kode pada 19 Agustus 2026. Nama layer lama `src/logic/` sudah tidak dipakai lagi di mana pun — layer itu dipecah jadi `src/services/` (persistensi, sesi, peran, alert, seed) dan `src/utils/` (compute, schema, validate, stages, kategori). Alias `@logic` tidak pernah ada di konfigurasi.

| Dokumen | Akurasi | Catatan |
|---|---|---|
| `README.md`, `01`, `02` | Selaras | Ditulis ulang 19 Agu 2026: status build, versi stack terpasang, pohon folder, konvensi CSS bertoken |
| `00`, `03`, `05`, `06`, `08`, `09`, `11` | Selaras | Rujukan `src/logic/` disapu bersih; `06` memuat catatan pemetaan layer lama ke baru |
| `04`, `10`, `12`, `13`, `14`, `PRODUCT-DNA` | Selaras | Tidak terikat struktur folder |

Yang masih perlu ditinjau kapan-kapan, di luar urusan struktur:

- `14-ui-design-system.md` menetapkan tema terang sebagai default **dengan opsi mode gelap**; `src/styles/tokens.css` baru memuat palet terang, jadi opsi gelapnya belum ada.
- Modul yang direncanakan di `09`/`11` tapi belum ada di kode: analitik, rekomendasi, dan utilitas CSV/pencarian/backup.

## Cara memakai panduan ini

Untuk memahami produk: `PRODUCT-DNA` → `00` → `03` (domain & schema) → `05` (peran & pengesahan).

Untuk mulai menyentuh kode: baca `src/README.md` dulu, lalu `02` (prinsip arsitektur) dan `06` (kontrak modul & API).

Aturan yang tetap mengikat saat ngoding:

- Jangan menyimpang dari kontrak di `06` (`api.ts`) maupun definisi di `03` (schema).
- Menambah kategori atau parameter dilakukan lewat modul di `src/utils/categories/` — bukan menulis handler baru per kategori.
- Setiap identifier dalam kode (id kategori, role, nama modul) ditulis dalam bahasa Inggris dan konsisten dengan dokumen ini.

## Peta dokumen

| Berkas | Isi |
|---|---|
| `PRODUCT-DNA.md` | Baca pertama. Identitas produk (Hatchery Operating System), apa yang produk ini bukan, filosofi, sikap AI, prioritas informasi, arti "enterprise", serta beda antara kondisi hari ini vs tujuan jangka panjang. |
| `00-gagasan-dan-tujuan.md` | Peran, tujuan, pengguna, skala, prinsip pembeda, dan batasan-batasan wajib. |
| `01-stack-teknologi.md` | Teknologi beserta versi yang benar-benar terpasang, alasan pemilihan, dan perkakas. |
| `02-arsitektur-dan-struktur.md` | Prinsip arsitektur, struktur folder, path alias, dan konvensi penulisan. |
| `03-domain-dan-schema.md` | Isi schema: kategori, stadia larva (PL1..PL10), tipe field beserta ambang batasnya (NH₃ Emerson/sentinel/stage-aware), data master (induk→spawn→siklus multi-tank→penempatan/transfer), dan 5 prinsip domain. |
| `04-pemetaan-form-kertas.md` | Peta yang menghubungkan Form kertas 03–27 dan PDF parameter ke kategori/field di schema. |
| `05-peran-divisi-pengesahan.md` | Divisi (Produksi/Lab 3 area/MPM/Manajemen), peran dan izinnya, rantai pengesahan Petugas→QC MPM→Kepala, serta tanda tangan. |
| `06-modul-logic-dan-kontrak-api.md` | Kontrak tiap modul domain plus kontrak REST untuk nanti bermigrasi ke Laravel. |
| `08-data-seed-uji-verifikasi.md` | Strategi data contoh (seed), bentuk record, pengujian dengan Vitest, dan verifikasi logic. |
| `09-fase-build-dan-roadmap.md` | Urutan fase build, gerbang verifikasi tiap fase, dan roadmap F4/F5. |
| `10-keterbatasan-backlog.md` | Celah dan risiko hasil review kritis, lengkap dengan statusnya. |
| `11-peta-fase-delivery.md` | Sudut pandang delivery — memetakan progres ke dokumen `00`–`10`. |
| `12-arsitektur-informasi.md` | Lapisan antarmuka (IA): model navigasi (sidebar per divisi/role), inventaris halaman, peta antar-halaman, dan matriks role→halaman. |
| `13-ux-flow.md` | Lapisan antarmuka (UX): alur layar-per-layar — dashboard, daily input, lab, QC/pengesahan, AI, dan daur siklus. |
| `14-ui-design-system.md` | Lapisan antarmuka (UI): arah visual data-dense (tema terang default + opsi gelap), tipografi, token warna status, spacing, katalog komponen, aksesibilitas WCAG 2.1 AA, dan perilaku responsif. |

## Verifikasi

Gerbang wajib hijau sebelum pekerjaan dianggap selesai:

```bash
npm run typecheck   # tsc --noEmit
npm test            # Vitest
npm run build       # typecheck + vite build
```

Menjalankan aplikasi: `npm run dev`. Login demo memakai username peran (mis. `owner`, `manager`, `petugas.lab.maturasi`) dengan sandi `prima123`.

## Sumber acuan (di luar folder ini)

- `../Panduan Prototype/Parameter-Pengukuran-Hatchery-Prima-Larvae.pdf` — daftar lengkap parameter, frekuensi pengukuran, dan alasan teknisnya (13 bagian).
- `../Panduan Prototype/Parameter Pengukuran Hatchery - per Proses (Prima Larvae).pdf` — versi ringkas, disusun per proses.
- `../Panduan Prototype/WhatsApp Image *.jpeg` — foto 11 form kertas asli plus 2 catatan requirement.
- `../Panduan Prototype/PR-Juni-2026.xlsx` — Laporan Produksi harian yang nyata dipakai.
- `../Contoh form pengisian/Screenshot *.png` — prototype web lama, dipakai sebagai acuan isi field.
