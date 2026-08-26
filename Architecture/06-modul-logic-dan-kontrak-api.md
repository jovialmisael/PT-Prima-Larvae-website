# 06 · Modul Logic & Kontrak API (`src/services/` + `src/utils/`)

> Layer yang dulu direncanakan sebagai `src/logic/` akhirnya dipecah dua: `src/services/` untuk yang menyentuh persistensi/sesi (`api`, `session`, `rolesConfig`, `alerts`, `seed`) dan `src/utils/` untuk helper murni (`compute`, `schema`, `validate`, `stages`, `categories/`). Setiap penyebutan `logic/` di bawah merujuk ke salah satu dari keduanya.

Semua modul di sini bersifat murni, kecuali `api.ts` yang memang mengelola persistensi. Semuanya ditulis supaya bisa diuji dengan Vitest tanpa React atau DOM.

## `api.ts` — satu seam data

Ini satu-satunya modul yang menyentuh persistensi (untuk sekarang `localStorage`). UI hanya boleh mengaksesnya lewat sini.

Semua fungsi `api.*` bersifat async (mengembalikan `Promise`) sejak awal. Meski localStorage sebenarnya sinkron, hasilnya tetap dibungkus `Promise.resolve()`. Konsekuensinya, UI dibangun dengan `async/await` dan state loading sejak hari pertama, sehingga ketika backend REST (Laravel, di F4) menggantikan isi `api.ts`, sisi view tidak berubah sama sekali. Ini menghindari rework besar (celah nomor 34).

CRUD generik (per `collection`):

- `list(collection, filter?)` mengembalikan array record.
- `get(collection, id)` mengembalikan record atau `null`.
- `create(collection, data)` mengembalikan record baru, atau `null` bila gagal menyimpan.
- `update(collection, id, patch)` mengembalikan record, atau `null` bila gagal menyimpan.
- `remove(collection, id)` mengembalikan `boolean`.

Pengesahan & koreksi (dengan status `draft`, `qc`, `disahkan`, `ditolak`, atau `revisi`):

- `verify(collection, id, step, stamp)` — di sini `step` bernilai `parafArea`, `qc`, atau `sahkan`. Fungsi ini mengubah status dan menempelkan `diparafArea`/`diperiksaMpm`/`disahkanKepala` (beserta TTD). Mengembalikan `null` bila gagal.
- `tolak(collection, id, {step, alasan, stamp})` mengubah status menjadi `ditolak` (kembali ke petugas) atau `revisi`. Alasannya wajib dan ikut tercatat. Mengembalikan `null` bila gagal.
- Record yang sudah `disahkan` bersifat immutable, jadi koreksi berarti membuat record versi baru yang bertaut `koreksiDari`, dan setiap edit terekam di `riwayatEdit[]` sebagai jejak audit. (Rantai, TTD, dan fallback QC dibahas di `05`.)

Induk, Spawn, Siklus, Penempatan, dan Transfer (daur hidupnya di `03`):

- `createInduk(data)` membuat batch induk baru dengan kode otomatis dari `tglKedatangan` (misalnya `IND-260601-A`, dari Form 27). Mengembalikan `null` bila gagal.
- `afkirInduk(id)` mengubah `status` menjadi `afkir` (di akhir masa produktif, sekitar 3–4 bln). Mengembalikan `null` bila gagal.
- `createSpawn({indukId, ...})` mencatat event pemijahan (Form 04). Mengembalikan `null` bila gagal.
- `createSiklus({indukId, tglMulai, ...})` membuat siklus multi-tank baru dengan kode otomatis dari `tglMulai` (misalnya `SIK-260605-01`) plus snapshot `parameterBaseline` (dari `rearingPlan`). Tank ditambahkan lewat `penempatan`. Mengembalikan `null` bila gagal.
- `createPenempatan({siklusId, tankId, ruangStadia, jumlahAwal, komposisi:[{spawnId,jumlah}]})` menempatkan tank dalam siklus (relasi many-to-many antara spawn dan tank). Mengembalikan `null` bila gagal.
- `transfer({siklusId, jenis, tankSumber?, tankTujuan, jumlah})` memindahkan/split/merge antar ruang-stadia; ia mengakhiri penempatan lama (mengisi `tglKeluar`) dan membuka yang baru. Mengembalikan `null` bila gagal.
- `closeSiklus(id, srFinal)` mengubah status menjadi `selesai` (atau `terminasi`); bila SR ≥ 70%, ia memicu `analytics.updateSuccessBaseline` (closed-loop). Mengembalikan `null` bila gagal.

Relasi: `refLabel(refName, id)` mengembalikan label tampilan untuk field `ref` (misalnya nama tank atau kode batch siklus).

Override standar (ambang) & SOP:

- `getThresholdOverride(categoryId, fieldKey, stadia?)` mengembalikan threshold efektif (gabungan `rearingPlan`, schema default, dan override; menghormati `byStage`).
- `patchStandard(categoryId, fieldKey, threshold)` menyimpan override (boleh dalam bentuk `byStage`).
- `clearStandard(categoryId, fieldKey)` menghapus override sehingga kembali ke default.
- `getRearingPlan(stadia?)` mengembalikan baris SOP per stadia (master `rearingPlan`); `patchRearingPlan(stadia, patch)` menyuntingnya (oleh Kabag Lab dan MPM).

Lifecycle data:

- `ensureSeeded()` mengisi data contoh bila kosong (idempoten, mengecek `DATA_VERSION`).
- `resetData()` menghapus lalu men-seed ulang.
- `exportAll()` mengembalikan objek backup (semua koleksi plus standar); `importAll(obj)` memulihkannya.
- `DATA_VERSION` adalah konstanta versi skema penyimpanan (untuk migrasi atau seed ulang).

Autosave draf isian (ini berbeda dari status record `draft`):

- `saveDraft(key, values)`, `loadDraft(key)`, dan `clearDraft(key)` menyimpan isian yang belum disubmit agar bisa dipulihkan.

Rekomendasi/Asisten: `askAssistant(question, context)` mengembalikan jawaban dari Mesin Rekomendasi (rule-based transparan atas 4 sumber data — lihat bawah); kontraknya sudah siap diganti proxy Laravel.

Aturan kerasnya: `create`, `update`, dan `verify` mengembalikan `null` bila gagal (misalnya kuota penuh). Pemanggil tidak boleh melaporkan sukses tanpa memeriksa nilai baliknya.

## `schema.ts`

Sumber definisi domain (lihat `03`). Tanpa efek samping.

## `compute.ts`

- `num(v)` mem-parse angka secara aman (menangani koma/titik; kosong menjadi `null`). Nilai sentinel non-numerik `TNTC`/`>x`/`<x` dipetakan ke `{ nilai, flag }` — misalnya `TNTC` diberi nilai sama dengan ambang danger plus flag `tntc`. Fungsi ini tidak melempar error (celah nomor 15).
- `computeNH3({ tan, ph, suhu, salinitas })` = `TAN × f`, dengan `f = 1/(1 + 10^(pKa − pH))` dan `pKa = 0.09018 + 2729.92/(273.15 + suhu°C)` (mengikuti Emerson 1975; koreksi salinitas opsional; pH pada skala NBS).
- `COMPUTED` adalah peta dari field computed ke fungsinya: `suhuDelta` (selisih pagi–sore), `lamaTransport` (jam tiba dikurangi berangkat), berbagai persentase (fertil%, hatching%, % defek), `umurInduk` (= umurAwal + hari sejak `tglKedatangan`), `estimasiAfkir` (= `tglKedatangan` + `masaProduktifHari`), `srTank` (survivor dibagi `jumlahAwal` penempatan), dan `srFinal` (total panen dibagi total stok awal siklus).
- `computeField(key, record)` menghitung satu field computed.
- `stats(values)` mengembalikan `{ n, mean, sd, cv, min, max }` (untuk CV dan kalibrasi).
- `suggestBounds(values)` mengusulkan `{safeMin, safeMax, dangerMin, dangerMax}` dari sebaran data (kalibrasi Standar Parameter).

## `alerts.ts` — Rule Engine

Ini mesin aturan deteksi dini: ia mengevaluasi tiap record saat disimpan, sekaligus terus-menerus untuk keperluan monitoring.

- `evalField(value, threshold, stadia?)` mengembalikan `normal`, `waspada`, atau `bahaya`. Ia stage-aware: bila `threshold.byStage[stadia]` ada, itu yang dipakai; kalau tidak, ia jatuh ke `threshold.default`.
- `evaluate(record, category)` mengembalikan peta `fieldKey → status` (memakai `record.stadia` untuk ambang per-stadia).
- `resolveStandard(categoryId, fieldKey, stadia?)` mengembalikan `{ threshold, tindakan, kontakRole, sumber }` (gabungan `rearingPlan`, schema default, override, dan `DEFAULT_ACTIONS`). Nilai `kontakRole` default-nya adalah Kepala divisi pemilik kategori (routing terpusat), tapi bisa di-override per parameter bila aksinya lintas-divisi.
- `scanAlerts(scope)` mengembalikan daftar alert otomatis yang aktif lintas record/siklus (berisi status, parameter, tank/siklus, tindakan, dan kontakRole).
- `acknowledgeAlert(id, oleh)` dan `resolveAlert(id, oleh)` menggerakkan siklus hidup alert dari `aktif` ke `diakui` ke `selesai` (mencatat oleh siapa dan kapan).
- Dedup (untuk mencegah alert-fatigue, celah nomor 17/18): hanya ada satu alert aktif per kombinasi `(param, tank, siklus)`; kejadian berulang menaikkan `hitungan`/`terakhir`, bukan membuat alert baru.

Soal routing dan visibilitas alert: alert dirutekan terpusat ke Kepala divisi pemilik kategori (menjadi titik keputusan tunggal; koordinasi lintas-divisi lewat `temuanLab`). Alert dan tren hanya terlihat oleh role yang punya `canViewTrends` (PJ, Kepala, MPM, plus Manager/Owner secara agregat), bukan oleh petugas.

## `validate.ts`

- `validateRecord(record, category)` mengembalikan `{ errors, warnings, ok }`.
- Aturannya: field `required` harus terisi; tipe dan rentangnya benar; persentase antara 0–100; tanggal tidak boleh di masa depan; duplikat `(tankId, tanggal)` untuk kategori harian dihitung error (mengikuti prinsip satu baris per tank per hari); dan nilai di zona `waspada` menghasilkan warning, bukan pemblokiran.

## `analytics.ts`

- `cycleSummaries()` mengembalikan ringkasan per siklus (agregat dari SR per tank) plus skor risiko 0–100 yang heuristik dan transparan. Skor ini adalah jumlah tertimbang deviasi dari SOP/ambang — misalnya +40 untuk tiap bahaya aktif (NH₃ atau Vibrio luminescent), +20 untuk waspada, +15 untuk tertinggal jadwal stadia, +10 untuk CV yang melebar, dan +10 untuk TVC yang naik; lalu dikurangi bila mendekati baseline sukses. Driver skornya ditampilkan (bukan black-box), dan bobotnya bisa dikonfigurasi.
- `predictFinalSR(siklus)` memprediksi SR akhir dari tren survival yang sedang berjalan (plus rentang/keyakinan bila datanya cukup; celah nomor 23, masuk backlog).
- `cohortComparison()` membandingkan kohort berhasil (SR ≥ 70%) vs gagal — parameter mana yang membedakan keduanya. Hasilnya disajikan sebagai indikasi, bukan sebab, karena n-nya kecil.
- `expectedStageForDoc(doc)` mengembalikan stadia yang diharapkan pada umur tertentu (untuk mendeteksi tank yang tertinggal jadwal).
- `updateSuccessBaseline()` memperbarui baseline tangki sukses dari siklus ber-SR ≥ 70% (dipanggil oleh `api.closeSiklus`; inilah closed-loop-nya).
- `feedMetrics(siklus)` mengembalikan pola asupan pakan (dari `prodPakan`) sebagai indikator kesehatan dan pertumbuhan.
- `strategyBank()` adalah Data Bank Cerdas: kumpulan strategi tervalidasi dari `prodTindakan` yang terbukti memperbaiki keadaan (situasi → tindakan → hasil).
- `indukPerforma()` mengorelasikan umur dan asal induk terhadap hatching rate atau SR (deteksi dini penurunan kualitas seiring induk menua; menjawab pertanyaan apakah asal/umur induk memengaruhi SR). Rule Engine juga memperingatkan induk yang mendekati afkir (~3–4 bln), dengan routing ke Kepala Produksi.

## `dailySheet.ts`

Read-model satu baris per tank per hari: ia merakit record lintas kategori menjadi satu tabel harian, dan tiap selnya diberi status lewat `alerts`.

## `csv.ts`

- `parseCsv(text)` mengembalikan array objek; `toCsv(rows, columns)` mengembalikan string CSV. Dipakai untuk impor dan ekspor CSV.

## `search.ts`

- `searchAll(query, role)` mengembalikan hasil lintas kategori, sambil menghormati `categoryVisible` milik role tersebut.

## `seed.ts`

Data contoh (lihat `08`): tank berhasil/gagal/berjalan, plus record lintas kategori, plus beberapa TTD contoh.

## `format.ts`

Memformat angka (presisi, pemisah ribuan), tanggal, persen, dan label status.

## `hints.ts`

Mengambil teks glosarium dari `GLOSSARY`.

## `roles/config.ts` & `roles/session.ts`

Lihat `05`.

## Mesin Rekomendasi Cerdas (4 sumber data terintegrasi)

Referensinya slide PPT "Basis Rekomendasi". Mesin ini menghasilkan rekomendasi keputusan (bukan sekadar alert), yang ditarik dari empat sumber:

1. SOP Baku Hatchery — master `rearingPlan` (target per stadia) plus threshold schema plus override.
2. Baseline Tangki Sukses (SR ≥ 70%) — profil optimal dari siklus yang berhasil (`analytics.updateSuccessBaseline`).
3. Data Bank Cerdas — strategi tervalidasi (`analytics.strategyBank` atas `prodTindakan`).
4. Metrik Asupan Pakan — pola konsumsi (`analytics.feedMetrics` atas `prodPakan`).

Kontrak dan aturannya: `recommend(scope)` mengembalikan daftar `{ kondisi, rekomendasi, sumber, keyakinan, tindakanRujukan? }`. Aturannya rule-based, transparan, dan deterministik, terbagi beberapa kelas:

- Deviasi SOP — membandingkan aktual vs `rearingPlan` per stadia, misalnya "suhu 35 vs target 33 di Z2, jadi turunkan aliran atau chiller".
- Ambang terlampaui — dari Rule Engine, menuju tindakan `DEFAULT_ACTIONS` (misalnya NH₃ bahaya berarti ganti air X% plus kurangi pakan).
- Jarak dari baseline sukses — parameter yang paling jauh dari profil SR ≥ 70% menjadi prioritas koreksi.
- Kecocokan Data Bank — situasi yang mirip siklus lampau menuju tindakan yang terbukti memperbaiki (plus tingkat keberhasilan historisnya).
- Sinyal pakan — konsumsi yang turun mendadak menjadi indikasi masalah kesehatan, jadi periksa mikrobiologi atau hepatopankreas.
- Umur induk — induk yang mendekati afkir dengan hatching yang menurun berarti siapkan batch induk pengganti.

Tiap rekomendasi menyertakan driver, sumber, dan keyakinannya (transparan, dan bisa ditolak atau ditindak). Prototype ini bukan LLM; kontrak `askAssistant` sekadar membungkus mesin ini (proxy AI di server menjadi Roadmap F4).

## Kontrak REST (untuk migrasi Laravel, Roadmap F4)

Berikut bentuk endpoint yang nanti dibungkus `api.ts` (dan UI tidak berubah):

| Operasi | Endpoint |
|---|---|
| List/Create | `GET /api/{collection}` · `POST /api/{collection}` |
| Get/Update/Delete | `GET|PUT|DELETE /api/{collection}/{id}` |
| Pengesahan | `POST /api/{collection}/{id}/verify` (step, signature) · `POST /api/{collection}/{id}/tolak` (step, alasan) |
| Induk | `POST /api/induk` (auto kode) · `POST /api/induk/{id}/afkir` |
| Spawn | `POST /api/spawn` (body: indukId) |
| Siklus | `POST /api/siklus` (auto kode; body: indukId) · `POST /api/siklus/{id}/close` (body: srFinal) |
| Penempatan · Transfer | `POST /api/penempatan` (siklusId, tankId, komposisi) · `POST /api/transfer` |
| Standar/ambang | `GET /api/thresholds` · `PUT /api/thresholds` |
| Rekomendasi/Asisten | `POST /api/recommend` · `POST /api/assistant` (key AI di server) |

Policy pengesahan ditegakkan di sisi server, bukan hanya di UI. Persistensi bersama yang multi-perangkat menggantikan localStorage.
