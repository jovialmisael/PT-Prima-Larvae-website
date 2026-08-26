# 04 · Pemetaan Form Kertas → Schema

Tujuan dokumen ini adalah menjamin tidak ada field yang hilang saat form kertas didigitalkan, sekaligus menjaga traceability ke sumber aslinya. Setiap form kertas Prima Larvae dan setiap bagian PDF parameter dipetakan ke kategori yang sudah didefinisikan di `03`.

## Peta Form kertas ke kategori

| Form | Judul form kertas | Kategori schema | Divisi pengisi |
|---|---|---|---|
| 03 | Data Penyedian & Kontrol Kematian Induk | `spawnerKontrol` (kematian: betina/jantan/total/moulting, initial & final) | Produksi |
| 04 | Data Spawning & Hatching Perhari | membuat master `spawn` (indukId, type bagus/gumpal/no-spend, jumlahTelur, fertil%, hatching%, estNaupli) + `prodNauplii` (hitung naupli, ref `spawnId`) | Produksi |
| 06 | Data Kualitas Air Maturasi | `prodInduk` (ref `indukId`; air maturasi: bak, waktu, suhu, pH, salinitas, DO, flowrate; mortalitas induk) | Produksi |
| 06.A | Data Kualitas Spawner (lintas divisi) | `spawnerKontrol` (suhu palam per jam) + `labNaupliiMutu` (sampel abnormal pagi/sore: bagus/abnormal/telur) | Produksi + Lab (Maturasi) |
| 11 | Naupli Perhari (lintas divisi) | Produksi: `prodNauplii` (hitung/panen pagi-sore: jml, sample, vol, total, mati, telur). Lab: `labNaupliiMutu` (abnormal/keaktifan/keseragaman) | Produksi + Lab (Maturasi) |
| 13 | Data Observasi Bak Larvae (lintas divisi) | Bagian bawah (Produksi): `prodLarvae` (stadia, estimasi, level air, debit, epicin D, probiotik, vit C, perlakuan, algae, pengamatan). Bagian atas (Lab): `labMikro` + `labMikroPl` + `labMikroPakan` + `labMutuPl` (mikroskopi) + `labAlgae` | Produksi + Lab |
| 14 | Data Kondisi & Distribusi Algae (lintas divisi) | `labAlgae` (kondisi/density/kualitas — Lab Algae) + `prodAlgae` (produksi & distribusi ke bak larvae — Produksi) | Lab (Algae) + Produksi |
| 16 | Data Observasi Bak Post Larvae (lintas divisi) | Produksi: `prodPostLarvae` (count, est panen, SR, panen bertahap berarti banyak record; pindah stok via `transfer`) + `prodPerkembangan`. Lab: `labMutuPl` (size, CV, defek, stress test/kondisi benur) | Produksi + Lab (PL) |
| 23 | Data Pemakaian Probiotik | `prodLarvae` (kolom probiotik/algino per jam) — atau sub-form probiotik | Produksi |
| 24.A | Data Kualitas Air (lintas divisi) | Produksi: `prodAirRutin` (suhu/DO/pH/salinitas). Lab: `labAirKimia` (TAN/NH₃ computed/nitrit/nitrat/alkalinitas). MPM berperan memverifikasi. | Produksi + Lab (Kimia) |
| 27 | Data Kedatangan Induk | membuat master `induk` (kode batch auto; sumberInduk, kiriman/terima betina-jantan, DOC/ABW, PCR). Satu induk dipakai banyak siklus (~3–4 bln). | Produksi |

## Peta bagian PDF parameter ke kategori + pengisi (Produksi vs Lab vs MPM)

Klasifikasinya dibuat per pengecekan (lihat prinsipnya di Catatan pemetaan). Kalau satu bagian PDF terbagi antar pengisi, barisnya dipecah per pengisi.

| PDF bagian | Kategori schema | Pengisi |
|---|---|---|
| Induk & Pemijahan | `prodInduk`, `spawnerKontrol`, `prodNauplii`, `pakanSegarInduk` | Produksi (husbandry, spawning, hitung/panen naupli) |
| | `labPcr` (PCR induk & pakan), `labNaupliiMutu` (mutu naupli) | Lab (PCR·PL + Maturasi) |
| Air Baku & Treatment | `prodPersiapanWater`, `prodPerawatan` (air sumber, ORP, resirkulasi, carbon, UV/ozon) | Produksi |
| | `labMikroAir` (mikrobiologi air per titik TBC/TVC) | Lab (Micro) |
| Pakan Hidup & Probiotik | `prodAlgae` (massal/distribusi), `prodArtemia` (penetasan), probiotik (di `prodLarvae`) | Produksi |
| | `labAlgae` (density/kemurnian/kualitas), `labMikroPakan` (mikro algae/artemia) | Lab (Algae + Micro) |
| Kualitas Air Tank | `prodAirRutin` (suhu/DO/pH/salinitas) | Produksi (rutin) |
| | `labAirKimia` (TAN/NH₃ hitung/nitrit/nitrat/alkalinitas) | Lab (Kimia) |
| Mikrobiologi Tank | `labMikro`, `labMikroPl` (TCBS hijau/kuning/luminescent) | Lab (Micro) |
| Perkembangan & Survival | `prodPerkembangan` (distribusi stadia, populasi, survival, molting sync) | Produksi (hitung) |
| Defect & Abnormalitas | `labMutuPl` (defek % per stadia, mikroskopi) | Lab (PL) |
| Ukuran & Keseragaman PL | `labMutuPl` (panjang, ekor/gram, CV, usus:otot) | Lab (PL) |
| Kualitas PL Sebelum Kirim | `prodPostLarvae` (jumlah/stadia/DOC, operasi) | Produksi |
| | `labMutuPl` (stress test, deformitas/fototaksis), `labPcr` (PCR PL) | Lab (PL) |
| Panen, Packing, Kirim | `prodPostLarvae` (kantong, jam, transport, DOA, aklimatisasi) | Produksi |
| Traceability | master `induk` → `siklus` → `tank` → tambak (via `ref`; satu induk banyak siklus) | (melekat di semua baris) |
| Log Tindakan | `prodTindakan` (tanggal, jam, siklus, jenis, dosis, alasan) | Produksi |
| Hasil di Tambak | `hasilTambak` (survival, ADG, FCR, size, penyakit) | Produksi/Manajemen (hanya dari PDF; tak ada di data operasional, tidak dibangun) |
| — Baku mutu / QC | verifikasi rantai + `mpmAudit` (opsional) | MPM (verifier + audit) |

## Catatan pemetaan

Soal form lintas divisi — ini penting. Satu form kertas bisa diisi lebih dari satu divisi. Contoh nyatanya Form 13: tabel observasi harian (bagian bawah) diisi Petugas Produksi, sedangkan blok MICRO dan Mikroskopis (bagian atas) diisi Lab. Di sistem, tiap bagian menjadi kategori tersendiri — record terpisah, dengan pemilik divisi dan rantai pengesahan sendiri. Pemilik divisi ditetapkan di level kategori. Hal serupa berlaku untuk Form 14: kondisi algae milik Lab, sedangkan distribusi ke bak larvae milik Produksi.

Kolom kop form kertas (Tanggal Aktif, Revisi, Dibuat/Diperiksa oleh) menjadi metadata dan jejak pengesahan record, bukan field data. Sebagai contoh, kop Form 13 yang berbunyi "Dibuat oleh Kabag Algae & Lab / Diperiksa oleh MPM" plus "Paraf PJ.Ka.Sie Lab" menjadi acuan rantai pengesahan untuk bagian Lab; sementara bagian Produksi ("Paraf Petugas QC") mengikuti rantai Produksi (lihat `05`).

Persentase yang di form kertas dihitung manual — misalnya "Persentase kematian kedatangan", "Fertil %", dan "Hatching %" — menjadi field `computed` di schema yang terisi otomatis.

Berkas `PR-Juni-2026.xlsx` memperlihatkan bagaimana semua form di atas digabung menjadi satu laporan harian per tanggal. Inilah bentuk "satu tabel" yang direplikasi oleh `dailySheet.ts`, tapi dalam versi yang terstruktur dan tervalidasi.

Ada dua sumber data referensi. Yang pertama Bali (`PR-Juni-2026.xlsx`), berupa daily-sheet yang kaya parameter, dipakai sebagai acuan konten dan alur harian. Yang kedua Lampung (`Larvae Observation.xlsm`), berupa time-series, dipakai sebagai acuan SOP rearing per stadia yang menjadi master `rearingPlan`. Cakupan aplikasi ini adalah Bali; Lampung berperan sebagai referensi saja (lihat `00` dan `03`).

Soal PDF bagian 13 "Hasil di Tambak" (`hasilTambak`): field hasilnya (ADG, FCR, survival tambak, size, penyakit) hanya tercantum di PDF Parameter, dan **tidak ada di data operasional manapun** — sudah diverifikasi ke seluruh file Excel (Bali dan Lampung). Di data, satu-satunya jejak hilir yang nyata adalah kolom distribusi "POND" pada file Lampung, yaitu jumlah PL yang dikirim ke tambak (murni tujuan pengiriman). Karena itu `hasilTambak` sengaja tidak dibangun; traceability ke tambak hanya berupa teks tujuan (`siklus.tambakTujuan`, `prodPostLarvae.tujuan`).

Terakhir, screenshot di folder `Contoh form pengisian/` (dari prototype lama) dipakai sebagai acuan konten dan tata letak field.
