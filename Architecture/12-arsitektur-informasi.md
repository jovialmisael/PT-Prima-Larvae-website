# 12 · Arsitektur Informasi (IA)

Dokumen ini adalah bagian pertama dari lapisan antarmuka (`12` IA, `13` UX, `14` UI) yang sebelumnya dibekukan keluar dari cakupan dan kini dibuka kembali. Fokusnya: peta halaman aplikasi, model navigasi, hubungan antar-halaman, dan halaman apa yang boleh dilihat tiap role. Semua diturunkan dari domain di `03`, peran/izin di `05`, dan daur siklus di `03` — bukan konsep baru.

## Model navigasi

Navigasinya berupa **sidebar kiri yang dikelompokkan per divisi/role** (Produksi, Lab, MPM, Manajemen), dengan Beranda di paling atas. Ini keputusan yang diambil sadar; catatan bahwa ia berbeda dari filosofi "ikuti alur kerja" di Product DNA ada di `PRODUCT-DNA` (bagian penyimpangan). Komprominya: grup sidebar memang per divisi supaya intuitif bagi staf, tapi Beranda, Pemantauan, dan Analitik tetap disusun berorientasi kerja (mengikuti prioritas kesehatan → kritis → produksi → monitoring).

Karena target perangkatnya responsif setara (mobile sampai desktop), sidebar ini **menyusut jadi drawer** yang bisa dibuka-tutup di layar sempit, dan menjadi panel tetap di layar lebar. Detail perilaku responsifnya ada di `14`.

Visibilitas tiap grup dan item difilter per role memakai helper yang sudah ada di `05` — sidebar tidak pernah menampilkan halaman yang role-nya tidak berhak. Jadi dua orang dengan role berbeda bisa melihat sidebar yang isinya berbeda.

## Struktur sidebar

```
🦐 Prima Larvae
─────────────────
▸ Beranda                     (semua role; isi difilter)

OPERASIONAL — PRODUKSI
  · Input Produksi            (petugasProd)
  · Log Tindakan              (petugasProd / kepalaProd)
  · Master & Siklus           (kepalaProd — canManageMaster)

LAB
  · Maturasi                  (area maturasi)
  · Algae                     (area algae)
  · PL (Kimia & Micro)        (area pl)
  · Temuan ke Produksi        (semua area lab)

MPM / QC
  · Inbox Pengesahan          (mpm; fallback kepalaLab/manager)
  · Audit Sampling            (mpm)
  · Standar Parameter         (mpm + kepalaLab)

PEMANTAUAN & ANALITIK
  · Monitoring Tank           (canViewTrends)
  · Pusat Alert               (canViewTrends)
  · Analitik Siklus & Induk   (canViewTrends)

KNOWLEDGE
  · SOP Rearing               (canViewTrends)
  · Data Bank Strategi        (canViewTrends)

MANAJEMEN
  · Ekspor                    (manager, owner, + Kepala utk divisinya)
─────────────────
[ akun / sesi ]               (currentUser dari roles/session)
```

## Inventaris halaman

Berikut daftar lengkap halaman beserta asal domainnya. Halaman input tidak dibuat satu-per-kategori secara manual — satu halaman input generik merender kategori mana pun lewat schema (`03`), lalu difilter berdasarkan divisi/area role.

| Halaman | Isi | Sumber domain |
|---|---|---|
| Beranda / Dashboard | Ringkasan kesehatan hatchery, alert kritis, KPI siklus aktif, rekomendasi teratas | prioritas info `PRODUCT-DNA`; `scanAlerts`, `cycleSummaries` (`06`) |
| Input Produksi | Form harian kategori Produksi (larvae, air, pakan, post-larvae, dll.) | kategori Produksi (`03`), `validateRecord`, `saveDraft` (`06`) |
| Input Lab (per area) | Form kategori Lab sesuai area petugas (maturasi/algae/pl) | kategori Lab + atribut `area` (`03`/`05`) |
| Temuan ke Produksi | Buat/kelola `temuanLab` (temuan + rekomendasi + urgensi) | kategori `temuanLab` (`03`) |
| Log Tindakan | Catat `prodTindakan` (jenis, dosis, alasan) | kategori `prodTindakan` (`03`) |
| Master & Siklus | Kelola master `tank`/`induk`/`spawn`; inisiasi `siklus`, `penempatan`, `transfer`, tutup siklus | `api.createInduk/createSiklus/createPenempatan/transfer/closeSiklus`, `canManageMaster` (`05`/`06`) |
| Detail Siklus | Satu siklus: penempatan ~20 tank, komposisi spawn, status, SR, tambak tujuan | master `siklus`/`penempatan` (`03`) |
| Monitoring Tank | Read-model 1 baris/tank/hari, sel berstatus warna | `dailySheet` + `alerts.evaluate` (`06`) |
| Pusat Alert | Daftar alert aktif (dedup per param/tank/siklus), acknowledge/selesai | `scanAlerts`, `acknowledgeAlert`, `resolveAlert` (`06`) |
| Inbox Pengesahan | Antrean record `draft`/`qc` untuk QC & sahkan, plus tolak | `api.verify`/`tolak`, rantai `05` |
| Audit Sampling | Catat `mpmAudit` (opsional, di luar rantai) | kategori `mpmAudit` (`03`/`05`) |
| Standar Parameter | Lihat/atur ambang efektif (schema default + `rearingPlan` + override) | `getThresholdOverride`/`patchStandard`, `canEditStandard` (`05`/`06`) |
| Analitik Siklus & Induk | Skor risiko, cohort berhasil vs gagal, prediksi SR, korelasi umur induk → SR | `analytics.*` (`06`) |
| SOP Rearing | Master `rearingPlan` per stadia (referensi + baseline) | master `rearingPlan` (`03`), `getRearingPlan`/`patchRearingPlan` |
| Data Bank Strategi | Strategi tervalidasi (situasi → tindakan → hasil) | `analytics.strategyBank` (`06`) |
| Ekspor | Ekspor Excel/PDF + Backup/Restore | `exportAll`/`importAll`, `canExport` (`05`/`06`) |
| Setup Wizard | Setup awal saat database kosong: urutan `rearingPlan` → tank → induk → spawn → siklus/penempatan | first-run; `canManageMaster` (`05`), api master & siklus (`06`); alur di `13` |
| Login / Sesi | Masuk, override dev `?as=`, ingat user terakhir | `roles/session` (`05`) |

Perlu dicatat, halaman untuk `hasilTambak` sengaja tidak ada — kategori itu tidak dibangun (lihat `03`/`00`). Jejak tambak hanya muncul sebagai teks tujuan di Detail Siklus dan record panen.

Saat database masih kosong (first-run), Setup Wizard menjadi tujuan utama bagi Kepala Produksi, dan halaman input menampilkan empty state yang menuntun ke setup alih-alih form kosong. Detail alurnya ada di `13`.

## Hubungan antar-halaman (nav graph)

Selain lewat sidebar, halaman-halaman saling tertaut secara kontekstual supaya alur keputusan mengalir. Yang utama:

- Beranda → Pusat Alert → Detail Tank (Monitoring) → record sumber alert.
- Master & Siklus → Detail Siklus → Penempatan → Detail Tank.
- Inbox Pengesahan → Detail Record (untuk verify/tolak/sahkan) → kembali ke antrean.
- Analitik Siklus → Detail Siklus tertentu; Analitik Induk → Master Induk terkait.
- Rekomendasi (di Beranda/Tank) → SOP Rearing atau Data Bank sebagai rujukan tindakannya.

Detail langkah tiap alur ada di `13`.

## Matriks role → halaman

Diturunkan langsung dari helper izin di `05`. Tanda ✅ berarti halaman muncul di sidebar role tersebut; keterangan menandai batasannya.

| Halaman | petugasProd | petugasLab | pjLab | kepalaProd | kepalaLab | mpm | manager | owner |
|---|---|---|---|---|---|---|---|---|
| Beranda | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Input Produksi | ✅ | — | — | — | — | — | — | — |
| Input Lab (area) | — | ✅ (area sendiri) | — | — | — | — | — | — |
| Temuan ke Produksi | — | ✅ | ✅ | lihat | lihat | lihat | lihat | lihat |
| Log Tindakan | ✅ | — | — | ✅ | — | — | — | — |
| Master & Siklus | — | — | — | ✅ | — | — | — | — |
| Monitoring Tank | — | — | ✅ | ✅ | ✅ (3 area) | ✅ | ✅ | ✅ |
| Pusat Alert | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inbox Pengesahan | — | — | paraf area | ✅ (sahkan Prod) | ✅ (sahkan Lab) | ✅ (QC) | fallback QC | — |
| Audit Sampling | — | — | — | — | — | ✅ | — | — |
| Standar Parameter | — | — | — | — | ✅ | ✅ | — | — |
| Analitik | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SOP Rearing | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Data Bank | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ekspor | — | — | — | ✅ (Prod) | ✅ (Lab) | — | ✅ | ✅ |
| Setup Wizard | — | — | — | ✅ | — | — | — | — |
| Login / Sesi | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Aturan yang menegakkan matriks ini: `canInput` (petugas divisi/area), `categoryVisible` (petugasLab/pjLab hanya area sendiri; kepalaLab 3 area; MPM/Manager/Owner semua), `canViewTrends` (bukan petugas — jadi Monitoring/Alert/Analitik/Knowledge tidak muncul untuk petugas), `canQcMpm` (MPM, fallback kepalaLab/manager), `canSahkan` (Kepala divisi), `canEditStandard` (MPM + kepalaLab), `canManageMaster` (kepalaProd), dan `canExport` (Manager/Owner + Kepala untuk divisinya). Kalau ada baris di sini yang berbeda dari helper `05`, yang benar adalah `05` — matriks ini mengikutinya, bukan sebaliknya.
