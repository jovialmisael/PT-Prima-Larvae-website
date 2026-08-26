# 05 · Peran, Divisi & Pengesahan (`src/services/rolesConfig.ts` + `src/services/session.ts`)

Model ini menggantikan draf awal yang berisi "8 peran (kasie/kabag)". Ia disusun dari obrolan dengan para kepala Prima Larvae plus kop form kertas, yang menyebut peran Kabag Produksi, Kabag Algae & Lab, MPM/QC, serta PJ./Ka.Sie Lab. Nama orang sengaja tidak dicantumkan karena bersifat privasi — kita selalu merujuk per divisi atau per role.

## Divisi

1. Produksi — menangani larvae, treatment air, post-larvae, dan husbandry induk.
2. Lab & Algae — terdiri dari 3 area: Maturasi, Algae, dan PL (yang mencakup Kimia & Micro).
3. MPM / QC — mengurus mutu lintas divisi.

Selain itu ada peran lintas-divisi: Manajemen (Manager dan Owner), Sistem, dan Analisis.

Sub-lab dimodelkan lewat atribut `area ∈ {maturasi, algae, pl}` pada user dan record Lab, jadi bukan diledakkan menjadi peran-peran terpisah.

## Peran (`ROLES`)

Tiap role berbentuk `{ id, title, division, level, area? }`. Levelnya bertingkat `petugas < pj < kepala`, ditambah `mpm`, `manager`, dan `owner` yang bersifat khusus.

| id | title | division | level |
|---|---|---|---|
| `petugasProd` | Petugas Produksi | produksi | petugas |
| `kepalaProd` | Kepala Produksi | produksi | kepala |
| `petugasLab` | Petugas Lab (ber-`area`) | lab | petugas |
| `pjLab` | PJ/Ka.Sie Lab (ber-`area`) | lab | pj |
| `kepalaLab` | Kepala Lab | lab | kepala |
| `mpm` | MPM / QC | mpm | mpm |
| `manager` | Manager | manajemen | manager |
| `owner` | Owner | manajemen | owner |

Peran Admin ditunda ke roadmap. Struktur organisasinya sendiri tidak mengenal "Admin" (peran ini tidak muncul dalam obrolan dengan Owner/Manager/Kepala) — ia murni peran teknis sistem. Karena itu belum dibuat sekarang, dan baru ditambahkan nanti ketika kita butuh manajemen user atau multi-perangkat (selaras dengan Roadmap F4 backend). Untuk sementara, tugas sistem dipegang peran operasional (lihat `canManageMaster` dan catatan utilitas di bawah).

## Akun demo (`USERS`)

Password semua akun adalah `prima123`. Saat pengembangan, kita bisa meng-override user aktif lewat query `?as=<userId>` (misalnya `?as=u-petugas-prod`, `?as=u-mpm`, `?as=u-owner`).

| username | userId | role | area |
|---|---|---|---|
| `petugas.produksi` | `u-petugas-prod` | petugasProd | — |
| `kepala.produksi` | `u-kepala-prod` | kepalaProd | — |
| `petugas.lab.maturasi` | `u-petugas-lab-mat` | petugasLab | maturasi |
| `petugas.lab.algae` | `u-petugas-lab-alg` | petugasLab | algae |
| `petugas.lab.pl` | `u-petugas-lab-pl` | petugasLab | pl |
| `pj.lab.maturasi` | `u-pj-lab-mat` | pjLab | maturasi |
| `kepala.lab` | `u-kepala-lab` | kepalaLab | — |
| `mpm` | `u-mpm` | mpm | — |
| `manager` | `u-manager` | manager | — |
| `owner` | `u-owner` | owner | — |

PJ untuk area algae dan pl bentuknya analog dengan `pj.lab.maturasi`; keduanya ditambahkan di seed sesuai kebutuhan.

## Matriks izin (helper di `roles/config.ts`)

| Kapabilitas | Siapa |
|---|---|
| `canInput(role, category)` | Hanya petugas di divisi kategori tersebut; khusus Lab, petugas dengan `area` yang cocok. Kepala, PJ, MPM, Manager, dan Owner tidak melakukan input rutin. |
| `canParafArea(role, category)` | PJ Lab dengan `area` yang cocok (untuk record Lab). Paraf area ini opsional, dilakukan sebelum QC. |
| `canQcMpm(role)` | MPM (langkah QC untuk semua record). Kalau MPM absen, fallback-nya `kepalaLab` atau `manager`. |
| `canTolak(role, record)` | Role yang berwenang di langkah aktif: MPM (saat `qc`) atau Kepala divisi (saat `disahkan`). Menolak berarti menyertakan alasan wajib. |
| `canAuditSample(role)` | MPM — mengambil sampel cross-check (audit) sewaktu-waktu, menghasilkan log `mpmAudit` (opsional, di luar rantai). |
| `canSahkan(role, category)` | Kepala divisi dari kategori tersebut: `kepalaProd` untuk record produksi, `kepalaLab` untuk record lab. |
| `canViewTrends(role)` | Semua yang bukan petugas (pj, kepala, mpm, manager, owner). |
| `canEditStandard(role)` | MPM dan Kepala Lab (baku mutu; keputusan final di MPM). |
| `canExport(role)` | Manager dan Owner (ekspor Excel/PDF penuh), plus Kepala untuk divisinya. |
| `canManageMaster(role)` | Kepala Produksi — mengelola master `tank` serta menginisiasi dan menutup `siklus` (kode batch otomatis). Nanti pindah ke Admin bila peran itu dibuat. |
| `categoryVisible(role, category)` | Per divisi; MPM, Manager, dan Owner melihat semua. `kepalaLab` melihat ketiga area, sedangkan `petugasLab`/`pjLab` hanya melihat area-nya. |

Beberapa penegasan atas matriks di atas:

- MPM berperan sebagai QC verifier plus audit sampling, bukan pencatat harian. Tugasnya: menjalankan langkah QC untuk semua record, menjadi pemilik baku mutu bersama Kepala Lab (`canEditStandard`), dan sesekali melakukan audit sampling. Kualitas air kimia (Form 24.A) diisi Lab Kimia (`labAirKimia`), bukan MPM.
- Manager dan Owner bersifat view-only plus ekspor — mereka memantau seluruh operasi (Owner khususnya menelusuri kenapa SR turun atau tidak konsisten), tapi tidak menginput dan tidak mengesahkan.
- Kepala adalah pengambil keputusan sekaligus pengesah divisinya, bukan penginput. Kepala Produksi juga mengelola master `tank` serta menginisiasi dan menutup siklus (`canManageMaster`).
- Alert dan tren dirutekan terpusat ke Kepala divisi pemilik kategori (Kepala lalu mengarahkan petugasnya; aksi lintas-divisi lewat `temuanLab`). Peringatan aktif dan tren hanya terlihat oleh mereka yang punya `canViewTrends` (PJ, Kepala, MPM, plus Manager/Owner secara agregat); petugas tidak melihatnya.
- Utilitas prototype (Backup/Restore dan Reset data contoh) tersedia untuk Kepala/Manager tanpa perlu peran Admin khusus; nanti ini menjadi ranah Admin begitu peran tersebut dibuat.

## Rantai pengesahan

Bentuk kanoniknya tiga langkah:

```
Draft (Petugas)  →  QC (MPM)  →  Disahkan (Kepala divisi)
```

Alurnya: record yang dibuat petugas berstatus `draft`. MPM lalu menjalankan QC sehingga statusnya menjadi `qc` (butuh tanda tangan). Kepala divisi kemudian mengesahkannya menjadi `disahkan` (butuh tanda tangan) — dan inilah titik keputusannya.

Khusus Lab, ada langkah opsional: `pjLab` boleh memberi paraf area sebelum QC, mengikuti "Paraf PJ./Ka.Sie Lab" di form. Paraf area ini bersifat co-sign, tidak mengubah tiga langkah wajib, dan bisa dikonfigurasi aktif atau nonaktif.

Perlu ditegaskan lagi, MPM tidak mengisi form rutin. Perannya di rantai hanyalah langkah QC untuk semua record, baik Produksi maupun Lab. Form 24.A dipecah: bagian rutin ke `prodAirRutin` (Produksi) dan bagian kimia ke `labAirKimia` (Lab Kimia); MPM tinggal memverifikasinya. Audit sampling (`mpmAudit`) berada di luar rantai.

### Status, tolak & koreksi

Sebuah record bisa berstatus `draft`, `qc`, `disahkan`, `ditolak`, atau `revisi`.

Untuk penolakan: MPM (saat QC) atau Kepala (saat Sahkan) bisa menolak dengan alasan yang wajib diisi, sehingga statusnya menjadi `ditolak` (kembali ke petugas) atau `revisi`; petugas lalu memperbaiki dan mengajukan ulang. Ini ditangani `api.tolak` (lihat `06`).

Untuk koreksi setelah `disahkan`: record yang sudah disahkan bersifat immutable. Perbaikannya dilakukan dengan membuat record versi baru yang bertaut `koreksiDari` (record asalnya tetap tersimpan), dan setiap perubahan tercatat di `riwayatEdit[]` sehingga jejak auditnya utuh.

Ada juga fallback QC bila MPM absen. Karena MPM hanya satu orang (jadi menjadi single point of failure), saat ia berhalangan, Kepala Lab (co-pemilik baku mutu) atau Manager boleh menjalankan langkah QC sementara supaya rantai tidak macet. Delegasi penuh peran Kepala (acting) masih menjadi backlog.

### Helper

`nextApproval(record, role)` mengembalikan langkah berikutnya yang boleh dilakukan role ini. Helper lainnya: `canParafArea`, `canQcMpm`, `canSahkan`, dan `canTolak`.

## Tanda tangan digital

Tanda tangan wajib pada langkah QC (MPM) dan Sahkan (Kepala), serta pada Paraf Area (PJ) bila langkah itu dipakai. Ia tidak diminta saat Draft. Tanda tangan diambil tepat sebelum record disimpan pada langkah tersebut.

Stempel disimpan di dalam record seperti ini:

```
dibuatOleh     : { name, role, area?, at }                 // draft, tanpa signature
diparafArea?   : { name, role, area, at, signature }       // opsional (Lab)
diperiksaMpm   : { name, role, at, signature }             // QC — wajib TTD
disahkanKepala : { name, role, division, at, signature }   // final — wajib TTD
ditolakOleh?   : { name, role, at, alasan }                // saat tolak (alasan WAJIB; tanpa TTD)
koreksiDari?   : <idRecordAsal>                            // bila ini record koreksi
riwayatEdit?   : [{ name, role, at, ringkasan }]           // jejak audit perubahan
```

Di sini `at` adalah ISO timestamp, dan `signature` adalah dataURL PNG (wajib untuk langkah paraf-area, QC, dan sahkan). Perlu dicatat, tanda tangan ini belum diamankan secara kriptografis — integritas sisi server baru datang di F4 (celah nomor 48).

## `roles/session.ts`

Modul ini menyimpan sesi aktif (user yang login, termasuk `area` bila ia dari Lab) dan membaca override `?as=`. Ia menyediakan `currentUser()`, `currentRole()`, `currentArea()`, `login(username, password)`, `logout()`, serta mengingat username terakhir. Semua pemeriksaan izin di UI memanggil helper dari `roles/config.ts` dengan role yang diambil dari `session`.
