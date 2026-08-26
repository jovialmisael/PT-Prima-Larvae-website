# 13 · UX Flow

Dokumen ini bagian kedua lapisan antarmuka (`12` IA, `13` UX, `14` UI). Ia menjelaskan alur pemakaian layar-per-layar: langkah pengguna, halaman yang disentuh, gating role, state (loading/error/kosong), dan tautan ke fungsi logic yang sudah ada di `06`. Semua alur berdiri di atas kontrak yang sudah dibekukan — tidak ada perilaku baru yang diciptakan di sini, hanya cara pengguna menjalaninya.

## Prinsip lintas-alur

Beberapa hal berlaku di semua alur, jadi tidak diulang tiap bagian:

- Semua akses data lewat `api.ts` yang async, jadi setiap aksi punya tiga state: loading, error, dan data. Kegagalan (`api` mengembalikan `null`) selalu ditampilkan apa adanya — tidak ada sukses palsu (aturan `06`).
- Halaman/daftar yang kosong (mis. hari tanpa sampling) ditampilkan sebagai state kosong yang tenang, bukan error atau alert (backlog #46 di `10`).
- Gating role dievaluasi lewat helper `05`; tombol/aksi yang role-nya tidak berhak tidak dirender, bukan sekadar dinonaktifkan.
- Perilaku responsif tiap alur (mobile ↔ desktop) mengikuti aturan di `14`; poin yang menonjol disebut per alur.

## Onboarding / cold-start flow

Alur ini menjawab pertanyaan yang selama ini diasumsikan sudah beres: bagaimana aplikasi berjalan dari database yang benar-benar kosong sampai siap dipakai. Ini berbeda dari data demo (`ensureSeeded`) yang mengisi contoh otomatis — cold-start adalah pemasangan nyata di fasilitas.

1. Deteksi first-run — saat dibuka, sistem memeriksa apakah master inti (`rearingPlan`, `tank`, `induk`) masih kosong. Bila kosong, pengguna diarahkan ke Setup Wizard.
2. Gerbang peran — Setup Wizard hanya untuk yang punya `canManageMaster` (Kepala Produksi; tugas sistem untuk sementara dipegangnya, sesuai `05`). Role lain yang masuk saat sistem masih kosong melihat empty state bertuliskan "menunggu setup", bukan halaman input kosong yang membingungkan.
3. Urutan setup berpandu, tiap langkah memakai fungsi `api.ts` yang sudah ada:
   - SOP Rearing (`rearingPlan`) lebih dulu — karena ia menyeed ambang stage-aware dan mengisi `parameterBaseline` siklus (`getRearingPlan`/`patchRearingPlan`).
   - Master `tank` (unit fisik + ruang stadia).
   - Master `induk` (Form 27, `createInduk`, kode auto).
   - `spawn` per induk (Form 04, `createSpawn`).
   - Siklus pertama + `penempatan` tank (`createSiklus`/`createPenempatan`).
4. Input terbuka — begitu minimal ada SOP, satu tank, dan satu siklus/penempatan, halaman daily input aktif. Sebelum itu, halaman input menampilkan empty state yang menuntun ke langkah setup yang masih kurang, bukan error.

Alur ini menutup beban onboarding yang tadinya hanya dicatat sebagai risiko (backlog #64 di `10`).

## Dashboard flow

Titik masuk setiap pengguna setelah login. Isi Beranda disusun mengikuti prioritas informasi Product DNA: kesehatan menyeluruh dulu, lalu hal kritis, lalu produksi, lalu monitoring.

1. Pengguna login → sistem membaca role & area dari `roles/session`, lalu memfilter isi Beranda.
2. Beranda memanggil `scanAlerts` (alert aktif), `cycleSummaries` (skor risiko & KPI siklus), dan `recommend` (rekomendasi teratas).
3. Pengguna melihat status ringkas: "apakah saya perlu khawatir?" → indikator kesehatan; lalu daftar alert kritis; lalu KPI siklus aktif; lalu ringkasan produksi.
4. Dari sini pengguna men-drill: klik alert → Pusat Alert / Detail Tank; klik siklus → Detail Siklus; klik rekomendasi → rujukan SOP atau Data Bank.

Petugas (yang tidak punya `canViewTrends`) mendapat Beranda yang lebih ringkas — fokus ke tugas input hari ini dan status record miliknya, tanpa panel tren/alert agregat.

## Daily input flow

Alur inti pencatatan harian, dijalani petugas Produksi maupun Lab. Formnya schema-driven: kategori dirender secara bertumpuk (stacked) per bagian (section) dari sidebar.

1. Petugas mengklik bagian spesifik dari sidebar (misalnya "Induk & Pemijahan") → sistem menampilkan satu halaman memanjang berisi seluruh blok form untuk bagian tersebut yang dirender secara berurutan (*Stacked Form List*).
2. Di dalam halaman tersebut, setiap blok form memiliki modul `useEntrySubmit` mandiri. Artinya, pengisian, validasi, dan penyimpanan *draft* pada satu blok (misal Kedatangan Induk) dilakukan terpisah tanpa memengaruhi blok lainnya.
3. Petugas memilih tank/tanggal untuk form yang ingin diisi. Form dirender dari definisi field kategori (`03`): tiap `FieldType` (`text`/`number`/`date`/`select`/`pcr`/`textarea`/`ref`/`computed`) punya kontrol sendiri, dikelompokkan per `group`.
4. Field `computed` (NH3, suhuDelta, persentase, dst.) tampil read-only dan dihitung saat mengetik lewat `compute` — bukan diinput.
5. Validasi berjalan inline lewat `validateRecord`: field wajib, tanggal tidak di masa depan, duplikat `(tankId, tanggal)` ditolak, persentase 0–100; nilai di zona waspada memunculkan peringatan kuning, bukan blokir; sentinel `TNTC`/`>x` diterima.
6. Isian yang belum disubmit diselamatkan otomatis lewat `saveDraft`; saat form dibuka lagi, `loadDraft` memulihkannya.
7. Petugas submit per blok form → record tersimpan berstatus `draft` (`api.create`) dan masuk rantai pengesahan. Bila simpan gagal, error ditampilkan hanya pada blok tersebut dan draf tetap aman.

Tampilan katalog kartu navigasi (`CategoryPicker`) hanya dipertahankan sebagai *fallback* apabila pengguna masuk melalui dashboard utama (tanpa memfilter per *section* di sidebar), demi memfasilitasi fungsionalitas pencarian acak.

Di mobile, form menjadi satu kolom dan grid seperti distribusi ukuran/stadia menyesuaikan (lihat `14`). Petugas bisa mengisi di dekat tank.

## Lab flow

Perpanjangan daily input untuk analis Lab, dengan dua kekhususan: atribut `area` dan langkah paraf area.

1. Petugas Lab login dengan `area` (maturasi/algae/pl) → hanya melihat kategori Lab area itu (`categoryVisible`).
2. Petugas mencatat hasil sample (mikrobiologi, PCR, kimia, mikroskopi, kondisi algae) → record membawa `area` pembuatnya.
3. Opsional: PJ/Ka.Sie Lab area itu memberi paraf area (`canParafArea`) sebelum QC — co-sign dengan TTD, tidak menggantikan tiga langkah wajib.
4. Bila analis menemukan sesuatu yang perlu ditindak Produksi, ia membuat `temuanLab` (temuan + rekomendasi + urgensi) → muncul di sisi Produksi. Ini jalur koordinasi lintas-divisi (alert sendiri dirutekan ke Kepala divisi pemilik, lihat `06`).
5. Record lalu masuk rantai pengesahan yang sama seperti Produksi.

## QC / approval flow

Rantai pengesahan tiga langkah dari `05`: Draft (Petugas) → QC (MPM) → Disahkan (Kepala divisi).

1. MPM membuka Inbox Pengesahan → antrean record berstatus `draft` (dan `qc`) lintas divisi.
2. MPM meninjau satu record → menjalankan QC (`api.verify` step `qc`) dengan TTD → status `qc`. Atau menolak (`api.tolak`) dengan alasan wajib → status `ditolak`/`revisi`, kembali ke petugas.
3. Kepala divisi (kepalaProd untuk record Produksi, kepalaLab untuk Lab) membuka antrean `qc` → mengesahkan (`api.verify` step `sahkan`) dengan TTD → status `disahkan`. Ia juga bisa menolak di titik ini.
4. Record `disahkan` bersifat immutable. Bila perlu koreksi, dibuat record versi baru bertaut `koreksiDari`; perubahan tercatat di `riwayatEdit[]`. Record asal tetap tersimpan.
5. Bila MPM berhalangan, langkah QC bisa dijalankan Kepala Lab atau Manager sebagai fallback (`canQcMpm`), supaya antrean tidak macet.

TTD diambil tepat sebelum menyimpan langkah QC, sahkan, atau paraf area (bukan saat draft). Detail komponen signature pad ada di `14`.

## AI flow

AI di sini adalah mesin Rekomendasi Cerdas rule-based (`06`), bukan chatbot. Ia hadir di tempat keputusan diambil, bukan di satu halaman terpisah.

1. Rekomendasi muncul kontekstual: di Beranda (rekomendasi teratas), di Detail Tank (untuk tank itu), dan di konteks record saat anomali.
2. Tiap rekomendasi/alert menampilkan driver + sumber + keyakinan (dari empat sumber: SOP `rearingPlan`, baseline sukses SR≥70%, Data Bank, metrik pakan).
3. Keyakinan disajikan kualitatif (tinggi/sedang) dan pola nyata ("DO rendah berulang di 3 tank") — tidak pernah persentase palsu. Ini kontrak kejujuran dari Product DNA.
4. Pengguna bisa menindaklanjuti (buka rujukan SOP/Data Bank, catat `prodTindakan`) atau mengabaikan; rekomendasi transparan dan bisa ditolak.
5. `askAssistant` membungkus mesin ini bila pengguna mengajukan pertanyaan berkonteks.

Yang belum ada dan ditandai jelas: AI Investigation dan AI Chat butuh backend (F4). Di UI keduanya tidak dipalsukan — kalau ditampilkan, statusnya "menyusul", bukan jawaban karangan.

## Siklus lifecycle flow

Alur yang menggerakkan analitik dan rekomendasi, mengikuti empat tahap daur siklus di `03`.

1. Setup & Inisiasi — Kepala Produksi (`canManageMaster`) membuat siklus (`createSiklus`, kode batch auto), menautkan induk aktif, membuat `penempatan` untuk ~20 tank (mengisi komposisi spawn); `parameterBaseline` terisi dari `rearingPlan`. Status `setup → aktif`.
2. Observasi & Monitoring Aktif — petugas menjalani daily input flow; Rule Engine mengevaluasi real-time; alert muncul di Pusat Alert bila anomali. Status `aktif`.
3. Eksekusi Panen & Distribusi — panen dicatat (bisa bertahap, banyak record `prodPostLarvae`); larva pindah antar ruang-stadia lewat `transfer`. SR final dihitung saat tutup (`closeSiklus`); status `panen → selesai`, atau `terminasi` bila crash total.
4. Pembaruan Baseline — bila SR ≥ 70%, `closeSiklus` memicu `updateSuccessBaseline`, memperkuat rekomendasi siklus berikutnya (closed-loop). Hasilnya terlihat di Analitik.
