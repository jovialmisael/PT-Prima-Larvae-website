# 09 · Fase Build & Roadmap

Prinsipnya: bangun bertahap. Tiap fase harus lulus gerbang yang sama — build bersih, Vitest hijau, dan `tsc --noEmit` bersih — lalu berhenti menunggu aba-aba user sebelum lanjut.

Milestone 1 (folder `Architecture/` ini) sudah selesai lebih dulu sebagai panduan. Fase-fase di bawah adalah build kode, yang baru dikerjakan setelah panduan disetujui dan user memberi aba-aba "kerjakan".

## Fase 2 — Scaffold

Jalankan `npm init` dan pasang dependensi (versinya di `01`). Siapkan `vite.config.ts` (alias `@services`/`@utils`/`@components`/`@pages`/`@domainTypes` plus konfigurasi Vitest) dan `tsconfig.json` (mode strict plus `paths`).

Gerbangnya: build dan dev berjalan bersih.

## Fase 3 — Logic inti + uji

Tulis semua modul domain di `src/services/*` dan `src/utils/*`, plus `api.ts` yang async (seam localStorage), plus `schema.ts` yang lengkap. Yang lengkap di sini berarti mencakup master (`tank`, `induk`, `spawn`, `siklus`, `penempatan`, `transfer`, `rearingPlan`) dan kategori termasuk `prodPakan`. Tulis juga Rule Engine (`alerts`, stage-aware `byStage` plus lifecycle/dedup plus alert umur induk), `compute` (NH₃ Emerson, sentinel `TNTC`, `srTank`/`srFinal`), dan `api` (`createInduk`/`afkirInduk`/`createSpawn`/`createSiklus`/`createPenempatan`/`transfer`/`closeSiklus` dengan kode otomatis; plus `verify` dan `tolak`), lalu `seed.ts` (SOP Lampung plus induk/spawn/penempatan), dan peran (`services/rolesConfig.ts` plus `services/session.ts`).

Gerbangnya: `test/logic.test.ts` hijau semua — mencakup stage-aware, entitas siklus, pengesahan dan tolak, alert lifecycle, serta SR.

## Fase 7 — Analitik, Siklus & Rekomendasi (logic)

Tulis `analytics` (`cycleSummaries`, skor risiko, cohort, `predictFinalSR`); daur hidup siklus (inisiasi auto-batch, lalu tutup, lalu `updateSuccessBaseline` yang closed-loop); read-model `dailySheet`; Mesin Rekomendasi (4 sumber); dan Standar Parameter (`suggestBounds` untuk kalibrasi).

Gerbangnya: angka-angkanya konsisten dengan seed, dan baseline closed-loop terbukti bekerja.

## Fase 8 — Utilitas lintas (logic)

Tulis `csv` (parse/format), `searchAll` (yang menghormati `categoryVisible`), Backup/Restore (`exportAll`/`importAll`), dan Reset (`resetData`).

Gerbangnya: tiap fungsi terverifikasi lewat Vitest.

## Fase UI — Lapisan antarmuka (setelah logic inti jalan)

Fase-fase ini mewujudkan desain di `12`–`14`. Semuanya berdiri di atas `api.ts` lewat hook tipis (tanpa menyentuh persistensi langsung), dan komponennya schema-driven. Gerbang logic yang lama tetap berlaku (Vitest hijau, `tsc --noEmit` bersih) di tiap fase. Sejak fase ini, tiap gerbang juga memasukkan uji komponen UI (React Testing Library) hijau, dan e2e Playwright untuk alur kritis wajib mulai UI-2 (lihat `08`).

### Fase UI-1 — Shell & Navigasi

Siapkan pendekatan styling dan design token (`14`), lalu app shell: sidebar per divisi/role + topbar + login/sesi (`roles/session`), hook tipis atas `api.ts`, dan routing halaman (masih kosong). Gerbang: build/dev bersih; sidebar hanya menampilkan halaman sesuai matriks role di `12`.

### Fase UI-2 — Input & Pengesahan

Field renderer per `FieldType` (schema-driven), halaman Input (Produksi dan Lab per area) dengan validasi inline (`validateRecord`), field `computed` read-only, dan autosave draf (`saveDraft`/`loadDraft`). Setup Wizard cold-start (deteksi first-run → master `rearingPlan`/tank/induk/spawn/siklus, alur di `13`). Lalu Inbox Pengesahan + signature pad + `verify`/`tolak`/`sahkan`. Gerbang: onboarding, daily input flow, dan QC/approval flow di `13` berjalan; record `disahkan` immutable; e2e Playwright daily input & QC hijau.

### Fase UI-3 — Monitoring & Dashboard

Beranda (mengikuti prioritas kesehatan→kritis→produksi→monitoring), Monitoring Tank (`dailySheet`), Pusat Alert (dedup + acknowledge/selesai), dan badge status. Gerbang: sel/badge status konsisten dengan `alerts`.

### Fase UI-4 — Analitik & Knowledge

Analitik Siklus & Induk (`analytics.*`), SOP Rearing (`rearingPlan`), Data Bank Strategi, editor Standar Parameter (`canEditStandard`), dan Ekspor/Backup. Kartu rekomendasi menampilkan driver+sumber+keyakinan kualitatif (kontrak kejujuran `PRODUCT-DNA`). Gerbang: angka konsisten dengan seed & analytics; tak ada klaim/angka palsu.

## Roadmap lanjutan (setelah inti jalan)

- F4 — Backend Laravel + auth: mewujudkan kontrak REST yang ada di `api.ts` (lihat `06`), menegakkan policy pengesahan di sisi server, menyediakan persistensi bersama untuk multi-perangkat, dan menjadi proxy Asisten AI (dengan key yang tersimpan di server).
- F5 — Laporan: rekap siklus dan rekap TTD dalam bentuk PDF untuk keperluan audit.

## Checklist konsistensi (dijaga sepanjang build)

- [ ] Semua akses data lewat `api.ts`.
- [ ] Modul `logic` murni dan teruji.
- [ ] Menambah kategori atau parameter cukup lewat `schema.ts`.
- [ ] Tidak ada fitur grow-out/tambak komersial (biomassa jual, harga, keuangan/HPP, profit).
- [ ] Diferensiasi terjaga: mutu larva, deteksi dini, traceability, serta pengesahan berjenjang dengan TTD.
- [ ] `create`/`update`/`verify` mengembalikan `null` bila gagal — tidak ada sukses palsu.
