# 00 · Gagasan & Tujuan

## Peran & tujuan

Kita membangun prototype aplikasi web untuk monitoring dan pencatatan pembenihan (hatchery) udang vaname. Aplikasi ini menggantikan pencatatan Excel harian (misalnya `PR-Juni-2026.xlsx`) sebagai sistem pencatatan utama semua divisi — bukan sekadar dashboard yang menempel di atas Excel. Sebagai gantinya, ia memberi sistem terstruktur yang menegakkan mutu, deteksi dini, traceability, dan pengesahan berjenjang.

Inti nilainya adalah mengubah data harian dari sekadar arsip menjadi peringatan dini. Setiap parameter punya batas beserta tindakannya, seluruh riwayat tersimpan dalam satu tabel yang bisa dibandingkan antar siklus, dan setiap kali sebuah siklus ditutup, baseline ikut diperbarui sehingga rekomendasi untuk siklus berikutnya makin kuat. Inilah yang kita sebut closed-loop.

## Inti proyek (jantungnya, dan ini bukan soal finansial)

Inti proyek ada pada empat hal yang setara dan saling menopang, bukan pada keuntungan uang:

1. Disiplin data dan anti human-error — ini fondasinya. Tanpa pencatatan yang jujur dan lengkap, tiga hal lainnya ikut runtuh. Itu sebabnya form digabung per pengecekan, supaya petugas tidak sampai melewatkan pencatatan.
2. Deteksi dini — Rule Engine memberi peringatan sebelum terjadi kematian massal.
3. Mutu dan kesehatan benur — inilah yang dijaga: larva yang sehat, seragam, dan tahan.
4. Pembelajaran antar-siklus — lewat traceability dan baseline closed-loop; hatchery yang makin pintar tiap siklus.

Benang merah yang mengikat keempatnya adalah keputusan lebih baik lahir dari data lebih baik. SR yang tinggi dan profitabilitas adalah akibat kalau keempatnya berjalan, bukan sasaran desain. Membidik uang secara langsung akan menggoda kita membangun modul komersial yang justru dilarang (lihat bagian Batasan wajib).

## Masalah yang dipecahkan

Ada empat tantangan yang dihadapi hatchery modern:

1. Data tersebar di banyak sistem dan berkas, sehingga sulit diakses dan dianalisis secara terpadu.
2. Operasi tidak efisien karena prosesnya masih manual — lambat dan rentan salah.
3. Risiko human-error tinggi dalam pencatatan maupun pengambilan keputusan kritis.
4. Ada kebutuhan mendesak untuk digitalisasi dari hulu ke hilir demi daya saing dan profitabilitas.

Perlu dicatat, "daya saing dan profitabilitas" pada poin 4 itu adalah motivasi industri, bukan inti proyek ini. Di sini ia berada di hilir — buah dari SR yang lebih tinggi dan konsisten (hasil dari empat inti di atas), bukan dari modul komersial (lihat bagian Batasan wajib).

## Pengguna & peran (ringkas, detail di 05)

| Pengguna | Peran di sistem |
|---|---|
| Petugas Produksi | Menginput data harian (larvae, treatment, post-larvae) dan mengantar sample ke Lab. |
| Kepala Produksi | Pengesah final Produksi sekaligus penerima alert domain Produksi (alert dirutekan terpusat ke Kepala divisi pemiliknya). Ia mengambil keputusan operasional, mencatat log tindakan, dan menjadi mitra MPM. |
| Petugas Lab (3 area: Maturasi/Algae/PL) | Mencatat hasil sample harian. |
| PJ/Ka.Sie Lab (per area) | Penanggung jawab harian sub-lab; memberi paraf area. |
| Kepala Lab | Pengesah dan pengambil keputusan atas ketiga sub-lab. |
| MPM / QC (1 orang) | Melakukan verifikasi (QC) lintas divisi dan audit sampling — jadi bukan pencatat rutin. Ia pemilik baku mutu (bersama Kepala Lab), penerbit Tindakan Koreksi, dan mitra Kepala Produksi. |
| Manager (1 orang) | Memantau seluruh operasi dan melakukan ekspor. |
| Owner (1 orang) | Memantau dan mengekspor ke Excel/PDF; fokusnya menelusuri kenapa SR turun atau tidak konsisten. |

Peran Admin sistem (manajemen user dan sejenisnya) ditunda ke roadmap; untuk sementara tugas sistem dipegang Kepala Produksi. Detailnya ada di `05`.

## Skala & cakupan

Satu hatchery menjalankan banyak tank dan banyak siklus secara paralel. Tank adalah unit fisiknya, sedangkan siklus adalah satu batch run pada sebuah tank (dari nauplii/zoea sampai panen PL).

Cakupan prototype ini adalah fasilitas Bali. Data Lampung (`Larvae Observation.xlsm`) dipakai sebagai referensi bila memang lebih akurat atau lengkap, khususnya tabel SOP rearing per stadia yang menjadi master `rearingPlan`. Dimensi multi-fasilitas ditunda; asal induk (Bali atau Lampung) cukup dicatat sebagai atribut `sumberInduk` pada master `induk` untuk keperluan traceability. Daur hidup siklus (detail di `03`) berjalan empat tahap: Setup & Inisiasi, lalu Observasi & Monitoring Aktif, lalu Eksekusi Panen & Distribusi, lalu Pembaruan Baseline & Optimalisasi.

## Prinsip diferensiasi (jati diri produk yang wajib dipertahankan)

1. Mutu larva — parameter kualitas air, mikrobiologi, defek, ukuran dan keseragaman, serta asupan pakan.
2. Deteksi dini — Rule Engine dengan ambang (normal, waspada, bahaya), peringatan aktif, dan skor risiko siklus.
3. Traceability — rantai induk (batch, sumber, umur) → siklus → tank → tambak tujuan (satu induk bisa dipakai banyak siklus) tercatat di setiap baris.
4. Pengesahan berjenjang dengan tanda tangan digital — Draft (Petugas) → QC (MPM) → Disahkan (Kepala divisi).
5. Rekomendasi cerdas — dibangun di atas empat sumber data yang terintegrasi: SOP baku, baseline sukses (SR ≥ 70%), data bank strategi, dan metrik asupan pakan.

## Batasan wajib (jangan dilanggar)

Jangan meniru fitur grow-out atau tambak seperti biomassa jual, harga pasar, keuangan/HPP, atau profit. Fokus tetap pada hatchery.

Kategori `hasilTambak` (survival tambak, ADG, FCR, size panen, penyakit) berasal dari PDF Parameter bagian 13, dan **tidak ada di data operasional manapun** — ini sudah diverifikasi ke semua file Excel, baik Bali (`PR-Juni-2026.xlsx`) maupun Lampung (`Larvae Observation.xlsm`): tidak ditemukan ADG, FCR, maupun survival tambak. Karena itu ia sengaja tidak dibangun sebagai modul komersial tambak. Yang benar-benar ada di data hanyalah tujuan pengiriman PL — di data Lampung berupa kolom "POND" (sekadar jumlah PL/tank yang dikirim) — dan itu dipertahankan sebagai traceability lewat `siklus.tambakTujuan` / `prodPostLarvae.tujuan`. Sementara itu metrik asupan pakan (Feeding Table di data Bali) adalah indikator kesehatan dan pertumbuhan larva, bukan akuntansi biaya atau FCR komersial.

Semua akses data harus lewat `api.ts`; modul `logic` harus tetap murni dan teruji; dan penambahan kategori atau parameter cukup lewat `schema.ts` (schema-driven).

Terakhir, bangun secara bertahap dan verifikasi tiap fase sebelum lanjut.

## Glosarium singkat (detail di 03)

NH3 (amonia beracun yang tak terionisasi), TAN (total amonia nitrogen), DO (oksigen terlarut), TVC (total vibrio count), TBC (total bacterial count), TCBS (media agar Vibrio dengan koloni hijau/kuning/luminescent), ORP (potensial redoks, indikator dosis ozon), DOC (day of culture), SR (survival rate; sukses berarti SR ≥ 70%), CV (koefisien variasi ukuran), PL (post larva), dan MB (molting atau keseragaman).
