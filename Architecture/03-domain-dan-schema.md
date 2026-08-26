# 03 · Domain & Schema (`src/utils/schema.ts` + `src/utils/categories/`)

`schema.ts` adalah sumber tunggal definisi domain. Semua validasi dan alert dibangkitkan dari sini.

Ekspor utamanya: `CATEGORIES`, `STAGES`, `PCR_OPTIONS`, `DEFAULT_ACTIONS`, dan `GLOSSARY`.

## STAGES (stadia larva)

Urutan resminya, yang dipakai untuk penentuan stadia, `expectedStageForDoc`, dan distribusi:

`N1..N5, Z1, Z2, Z3, M1, M2, M3, MPL, PL1, PL2, … PL10, PL10+`

Di sini N berarti Naupli, Z Zoea, M Mysis, MPL adalah transisi M3→PL, dan PL adalah Post Larva.

PL sengaja dirinci per hari (`PL1..PL10`), bukan digabung jadi `PL≥4`, karena ukuran, ekor-per-gram, CV, dan panen dilacak per DOC (day of culture). Menurut SOP Lampung, N5 jatuh di DOC 1 dan PL10 di DOC 18, dengan panen sekitar PL10–12. Kode `PL10+` menampung sisa hari sampai panen.

Nilainya disimpan sebagai kode (misalnya `"Z2"`, `"PL7"`), sedangkan label untuk tampilan diambil dari peta di schema. Fungsi `expectedStageForDoc(doc)` memetakan DOC ke stadia (berdasarkan `rearingPlan`) supaya sistem bisa mendeteksi tank yang "tertinggal jadwal".

## Tipe field

| Tipe | Untuk |
|---|---|
| `text` | teks bebas pendek (kode batch, nama petugas). |
| `number` | angka (suhu, pH, DO, count). Mendukung satuan dan presisi. |
| `date` | tanggal (tidak boleh di masa depan — lihat validasi). |
| `select` | pilihan dari daftar (stadia, kualitas A/B, waktu am/pm). |
| `pcr` | hasil PCR multi-penyakit (lihat `PCR_OPTIONS`). |
| `textarea` | catatan panjang (remarks, tindakan koreksi). |
| `ref` | relasi ke entitas lain, misalnya `tankId → tank` (labelnya via `refLabel`). |
| `computed` | dihitung otomatis, tidak diinput (NH3, suhuDelta, lamaTransport, persentase). |

Bentuk sebuah definisi field:

```
{ key, label, type, unit?, group?, required?, options?, ref?,
  precision?, threshold?, compute?, hint? }
```

Di sini `group` mengelompokkan field secara logis, dan `hint` merujuk ke kunci di `GLOSSARY`.

## Ambang (`threshold`) — mesin alert

Ada tiga bentuk ambang, dipilih sesuai jenis parameternya:

- Numerik: `{ safeMin, safeMax, dangerMin, dangerMax }`, menghasilkan status normal, waspada, atau bahaya. Nilai yang berada di antara zona safe dan danger dihitung sebagai waspada.
- Kategorikal: `{ badValues:[...], warnValues:[...] }`. Contohnya, hasil PCR positif dihitung bahaya, dan koloni luminescent yang terdeteksi juga bahaya.
- Stage-aware (`byStage`): `{ default:{...}, byStage:{ Z1:{...}, "PL10+":{...} } }`, yaitu ambang yang berbeda per stadia — misalnya suhu target 33 di Zoea/Mysis tapi 30 di PL. Nilai per-stadia ini di-seed dari master `rearingPlan` (lihat bagian Master di bawah).

Ambang default berasal dari `rearingPlan` (SOP per stadia) ditambah PDF parameter dan catatan lapangan, dan bisa di-override per instalasi lewat Standar Parameter (lihat `06`). Beberapa nilai acuannya:

- DO ≥ 4 ppm, pH 7–8.5, Salinitas 25–34 g/l, Amoniak (TAN) ≤ 0,3 mg/l, Alkalinitas 100–150 mg/l, Nitrat ≤ 10 mg/l, Nitrit ≤ 0,06 mg/l (dari Form 24.A, baku mutu Kepmen 51/2004).
- Suhu air tandon 29–31 °C, ORP in 530–550 (maksimum 570), ORP ozon 150–200, Resirkulasi > 12 jam, Usia karbon < 50 hari, TVC acuan 2,3 × 10³, Nitrit test < 1 ppm (dari catatan tulisan tangan).
- Suhu rearing per stadia (dari SOP Lampung): 30–32 di N5, lalu 33 di Zoea–M1, lalu 32 di MPL–PL1, lalu 30 di PL3 ke atas.

Frekuensi pengukuran tidak dikunci. Suhu, DO, dan pH bisa dicatat 2 sampai 8 kali sehari (di Lampung nyatanya tiap 2 jam). Field `waktu`/`waktuJam` menampung berapa pun titik ukur, dan agregasinya (rata-rata, delta pagi–sore) dihitung di `compute`.

Ada juga nilai sentinel non-numerik. Field bertipe `number` boleh menerima `TNTC` (too numerous to count — nyata muncul di data Vibrio), `>x`, dan `<x`. Fungsi `compute.num` memetakannya ke `{ nilai, flag }` — misalnya `TNTC` diberi nilai sama dengan ambang atas ditambah flag `tntc`. Validasi tidak menolak nilai-nilai ini, dan mesin alert memperlakukan `TNTC` maupun `>danger` sebagai bahaya.

Terakhir, soal ambang provisional vs terkalibrasi. Ambang bawaan (dari `rearingPlan`, PDF, atau Kepmen) ditandai `provisional`. Setelah beberapa siklus terkumpul, `compute.suggestBounds` mengkalibrasinya dari data fasilitas sendiri, dan ambang lalu ditandai apakah masih provisional atau sudah terkalibrasi. Prinsipnya: ambang idealnya dihitung dari data siklus sendiri, bukan dari buku.

## PCR_OPTIONS

Penyakit yang dipantau: WSSV, IMNV, EHP, AHPND (PirAB), dan IHHNV. Tiap penyakit bernilai `negatif`, `positif`, atau `tidak diuji`. Field `pcr` menyimpan objek seperti `{ WSSV:'negatif', EHP:'positif', ... }`. Nilai `positif` dihitung sebagai bahaya (masuk `badValues`).

## DEFAULT_ACTIONS

Ini peta dari parameter/status ke tindakan yang disarankan beserta role kontaknya. Dipakai oleh `alerts.resolveStandard` supaya setiap peringatan bisa menampilkan apa yang harus dilakukan dan siapa yang dihubungi — misalnya NH3 bahaya memunculkan "ganti air X%, kurangi pakan; hubungi Kepala Produksi".

## GLOSSARY

Peta dari istilah ke penjelasan singkatnya (NH3, TAN, DO, TVC, TBC, TCBS, ORP, DOC, SR, CV, MB, dan seterusnya). Diekspor dari `src/utils/schema.ts` dan dikonsumsi `components/ui/FieldControl.tsx` — tiap field menampilkan tombol hint yang mengambil `field.hint` atau `GLOSSARY[field.key]`.

## CATEGORIES (kategori per divisi)

Tiap kategori berbentuk `{ id, code, division, area?, collection, title, frekuensi, fields[] }`. Penjelasan tiap atributnya: `code` adalah nomor form kertas kalau ada (misalnya `"24.A"`); `division` bernilai `produksi`, `lab`, atau `mpm`; `area` khusus Lab bernilai `maturasi`, `algae`, atau `pl` (di mana PL mencakup Kimia dan Micro); `collection` adalah nama koleksi penyimpanan di `api.ts`; dan `frekuensi` adalah teks acuan (harian, per pengiriman, dan seterusnya).

Soal siapa yang mengisi (detailnya di `04`): form dikelompokkan per pengecekan demi mencegah human-error. Produksi berperan sebagai pelaksana, operasional, dan penghitung; Lab sebagai analis (mikrobiologi, PCR, kimia, mikroskopi); dan MPM sebagai verifikator plus auditor, bukan pengisi rutin. Karena satu form fisik bisa melibatkan beberapa divisi, kategorinya dipisah per pemilik.

### Divisi Lab & Algae (analis)

Setiap record Lab membawa atribut `area` (sub-lab pembuatnya), yang dipakai untuk filter, izin (`categoryVisible`), dan paraf area oleh PJ (lihat `05`).

| id | code | area | title | inti field |
|---|---|---|---|---|
| `labMikro` | — | pl·micro | Mikrobiologi Air Tank (Vibrio/TCBS) | tankId, siklusId, tanggal, stadia, TBC, TVC, koloniHijau, koloniKuning, koloniLuminescent, sumberSampel |
| `labMikroPl` | — | pl·micro | Mikrobiologi Tubuh Larva/PL | tankId, siklusId, tanggal, stadia, TBC, TVC, koloni(hijau/kuning/lumin) body |
| `labMikroAir` | — | pl·micro | Mikrobiologi Air Treatment (per titik) | tanggal, titik(sebelum/UV1/UV2/ozon), TBC, TVC |
| `labMikroPakan` | — | pl·micro | Mikrobiologi Pakan Hidup | jenis(artemia hidup/beku/chilled, algae), batch, TBC, TVC, tanggal |
| `labNaupliiMutu` | 11·mutu | maturasi | Mutu Naupli (mikroskopi, saat sampel masuk) | tanggal, asalBakInduk, waktu(pagi/sore), abnormal%, keaktifan, keseragaman, respFototaksis |
| `labPcr` | — | pl | PCR (induk/pakan/PL/air) | tanggal, objekUji(induk/pakan/PL/air), refId, pcr(WSSV/IMNV/EHP/AHPND/IHHNV) |
| `labAirKimia` | 24.A·kimia | pl·kimia | Kimia Air | tankId, siklusId, tanggal, amonium(TAN), nitrit, nitrat, alkalinitas, NH3 (computed) |
| `labMutuPl` | 07/08/09 | pl | Defek, Ukuran & Stress Test (mikroskopi) | tankId, siklusId, tanggal, stadia, defekList(% per stadia), panjang, ekorPerGram, CV, rasioUsusOtot, stressTest%, deformitas% |
| `labAlgae` | 14·kondisi | algae | Kondisi Algae | bakAlgae, jenis(Thalassiosira/Chaetoceros/Amphora), DOC, density, kemurnian, kualitas(A/B), pH, warna/kondisi |
| `temuanLab` | — | (semua) | Temuan & Rekomendasi ke Produksi | tanggal, siklusId, tankId?, temuan, rekomendasi, tingkatUrgensi |

### Divisi Produksi (pelaksana + pencatat operasional)

| id | code | title | inti field |
|---|---|---|---|
| `prodPersiapanWater` | — | Air Baku & Treatment (ops) | tanggal, airSumber(salinitas/suhu), ORPin, ORPozon, resirkulasiJam, usiaKarbonHari, carbonTest, suhuTandon, salinitas, klorin, pH |
| `prodPerawatan` | — | Jadwal Perawatan Sistem | tanggal, jenis(lampu UV/karbon/generator ozon), tindakan, keterangan |
| `prodAlgae` | 14·produksi | Produksi & Distribusi Algae | bakAlgae, jenis, DOC, volume, jumlah, distribusiKeBak, keterangan |
| `prodArtemia` | — | Penetasan Artemia | tanggal, batchKista, hatchingRate, kepadatan |
| `prodInduk` | 06 | Air Maturasi & Kematian Induk (harian) | indukId(ref), tanggal; air maturasi (bak, waktu, suhu, pH, salinitas, DO, flowrate); mortalitas/culling/molting induk (Kedatangan/Form 27 membuat master `induk`, lihat Master) |
| `spawnerKontrol` | 06.A/03 | Kontrol Spawner & Kematian Induk | indukId(ref), tanggal, suhu palam per jam; kematian induk (betina/jantan/moulting) (pemijahan/Form 04 membuat master `spawn`, lihat Master) |
| `prodNauplii` | 11·hitung | Naupli per Hari (hitung/panen) | spawnId(ref)/asalBakInduk, tanggal, waktu(pagi/sore), jmlNaupli, sampleSize, volEmber, total(computed), mati, telur |
| `prodLarvae` | 13·bawah | Observasi Bak Larvae (harian) | tankId, siklusId, tanggal, stadia, estimasi(populasi), levelAir, gantiAir%, debit, epicinD(08/16/24), probiotik(14/22), vitC, perlakuan, algaeType, pengamatan, waktu(am/pm) |
| `prodPerkembangan` | 06 | Perkembangan Stadia & Survival | tankId, siklusId, tanggal, distribusiStadia(% per stadia, pagi/sore), kepadatan, populasi, survivalHarian, survivalAntarStadia, sinkronisasiMolting |
| `prodAirRutin` | 24.A·rutin | Kualitas Air Rutin | tankId, siklusId, tanggal, waktu(pagi/sore), suhu, DO, pH, salinitas, suhuDelta(computed) |
| `prodPakan` | — | Asupan Pakan Larva (feeding table) | tankId, siklusId, tanggal, stadia, jenisPakan(artemia/algae/buatan), jumlahDiberikan, polaKonsumsi(habis/sisa), sisa, waktu |
| `prodPostLarvae` | 16 | Post Larvae: Panen & Pengiriman | tankId, siklusId, tanggal, stadia, count, estPanen, SR; panen: tujuan/tambak, jumlah, jmlKantong, suhu/salinitas kantong, jamPanen/packing/berangkat/tiba, lamaTransport(computed), DOA, suhuTiba, aklimatisasi |
| `prodTindakan` | — | Log Tindakan & Perlakuan | tankId, siklusId, tanggal, jam, jenisTindakan, dosis, alasan |
| `pakanSegarInduk` | — | Pakan Segar Induk | tanggal, jenis(cumi/cacing/artemia biomassa), sumber, tglMasuk |
| `hasilTambak` (DITUNDA — tak diimplementasikan di prototype) | 13·PDF | Hasil di Tambak (dari PDF §13; tak ada di data operasional) | pengirimanId/tambak, survivalTambak, ADG, FCR, sizePanen, kejadianPenyakit |

Catatan soal cakupan: kategori `hasilTambak` (survivalTambak, ADG, FCR, sizePanen, kejadianPenyakit) sengaja tidak dibangun di prototype. Perlu ditegaskan, field-field hasil ini **tidak ditemukan di data operasional manapun** — sudah diverifikasi ke semua file Excel, yaitu Bali (`PR-Juni-2026.xlsx`) dan Lampung (`Larvae Observation.xlsm`), dan tidak ada satu pun ADG, FCR, atau survival tambak. Kategori ini asalnya dari PDF Parameter bagian 13 ("Hasil di Tambak"), bukan dari data harian. Satu-satunya jejak hilir yang nyata di data adalah kolom distribusi "POND" pada file Lampung, yaitu jumlah PL yang dikirim ke tambak — murni tujuan pengiriman, bukan hasil grow-out. Alasan lain penundaan: batas wajib "tanpa fitur grow-out/komersial" (lihat batasan di `00`) dan ketergantungan pada data eksternal (backlog `10` nomor 63). Traceability ke tambak tetap ada lewat `siklus.tambakTujuan` dan `prodPostLarvae.tujuan` — keduanya sekadar teks tujuan pengiriman, bukan metrik performa atau efisiensi tambak.

### Divisi MPM (verifikasi, bukan pengisi rutin)

MPM tidak punya form input harian. Perannya adalah verifikasi (QC) dalam rantai pengesahan, pemilik baku mutu (bersama Kepala Lab), dan audit sampling yang sifatnya opsional.

| id | code | title | inti field |
|---|---|---|---|
| `mpmAudit` | — | Log Audit Sampling (opsional) | tankId, siklusId, tanggal, parameter, hasilAudit, catatan |

### Master

| id | title | field |
|---|---|---|
| `tank` | Master Tank (unit fisik) | namaTank, ruangStadia(naupli/zoea/mysis/pl), lokasi, kapasitas, status(aktif/nonaktif) |
| `induk` | Master Batch Induk (~3–4 bln, dipakai banyak siklus) | kodeBatch (auto, dari `tglKedatangan`), sumberInduk(Bali/Lampung), tglKedatangan, jumlahBetina, jumlahJantan, umurAwal, pcr(WSSV/IMNV/EHP/AHPND/IHHNV), masaProduktifHari(~90–120), status(aktif/afkir); computed: umurInduk, estimasiAfkir |
| `spawn` | Pemijahan (event, dari Form 04) | indukId(ref), tanggal, tipe(bagus/gumpal/no-spend), jumlahTelur, fertil%(computed), hatching%(computed), estNaupli |
| `siklus` | Siklus = batch MULTI-TANK (~20 tank) | kodeBatch (auto, dari `tglMulai`), indukId(ref), tglMulai, parameterBaseline (dari `rearingPlan`), status(setup/aktif/panen/selesai/terminasi), srFinal(computed), tambakTujuan. Tidak punya `tankId` tunggal — tanknya lewat `penempatan`. |
| `penempatan` | Penempatan tank dalam siklus (tabel join) | siklusId(ref), tankId(ref), ruangStadia, tglMasuk, tglKeluar?, jumlahAwal, komposisi:[{spawnId, jumlah}] (many-to-many spawn↔tank; tank murni berarti 1 item), computed: srTank |
| `transfer` | Perpindahan / split / merge (event Produksi) | tanggal, jenis(stok-awal/pindah/split/merge/panen-sebagian), siklusId, tankSumber?, tankTujuan, jumlah, alasan |
| `rearingPlan` | SOP Rearing per Stadia (referensi) | per baris `stadia`+`doc`: targetSuhu, algaeTH, algaeCH, waterLevel(L), mesh(µm), waterSource, exchange, dosing{treflan, vAlgen, bzt, vitC, chlor}, probiotikSchedule(08/14/22) |

Beberapa catatan penting soal pemisahan entitas siklus. `tank` adalah unit fisik yang dimiliki satu ruang stadia. `induk` adalah batch induk (bertahan ~3–4 bln, dipakai banyak siklus) yang memijah menjadi `spawn` (sebuah event, dari Form 04). `siklus` adalah batch larva multi-tank (sekitar 20 tank) yang me-ref sebuah `induk`. Tank-tank yang ditempati sebuah siklus dicatat di `penempatan` (tabel join, sekitar 20 baris per siklus), lengkap dengan `komposisi` yang bersifat many-to-many — artinya satu tank bisa berisi campuran beberapa `spawn`. Karena tiap stadia punya ruang atau tank sendiri, larva berpindah antar-tank saat ganti stadia lewat `transfer` (yang mengakhiri penempatan lama dan membuka yang baru). Perlu dicatat, `sumberInduk` adalah milik `induk`, bukan siklus — ini untuk analitik hubungan asal/umur induk terhadap SR, bukan untuk dimensi multi-fasilitas.

Soal `induk` (batch induk): satu induk dipakai banyak siklus, dengan masa pakai sekitar 3–4 bulan. Kode batch-nya di-generate otomatis saat kedatangan (Form 27, lewat `api.createInduk`). Field `umurInduk` diberi threshold sehingga Rule Engine bisa memperingatkan saat mendekati masa afkir (~90–120 hari), dan `analytics` mengkorelasikan umur induk terhadap hatching rate atau SR untuk deteksi dini penurunan. Domain induk berada di Produksi, jadi alert-nya diarahkan ke Kepala Produksi.

Soal `rearingPlan` (SOP per stadia): diambil dari referensi Lampung (DOC 1–18, dari N5 ke PL10). Fungsinya ada tiga. Pertama, menjadi seed default untuk ambang stage-aware (`byStage`). Kedua, mengisi `siklus.parameterBaseline` secara otomatis saat inisiasi. Ketiga, menjadi sumber nomor satu bagi Mesin Rekomendasi (membandingkan aktual vs SOP — lihat `06`). Isinya bisa diedit lewat Standar Parameter oleh Kabag Lab dan MPM.

Untuk field defek per stadia (dipakai `labMutuPl`), daftarnya mengikuti PDF bagian 07:

- Naupli sampai Zoea3: deformitas telson, deformitas setae, hepatopankreas pucat, hepatopankreas hitam, masalah molting, penempelan, gumpalan algae, dan bolitas.
- Mysis: masalah molting, deformitas telson/setae, penempelan, tingkat keaktifan, usus kosong, vorticella, dan protozoa.
- PL: usus kosong, masalah molting, deformitas, nekrosis, kanibalisme, vorticella, filamen, bakteri luminescent, dan penempelan.

## Siklus & daur hidupnya (4 tahap)

Referensinya adalah slide PPT "Penutupan Siklus & Optimalisasi Berkelanjutan". Siklus adalah unit analisis utama, dan statusnyalah yang menggerakkan analitik serta rekomendasi.

1. Setup & Inisiasi — siklus baru dibuat (`api.createSiklus`, dengan kode batch otomatis dari `tglMulai`), lalu ditautkan ke `indukId` (induk yang aktif), dibuatkan `penempatan` untuk sekitar 20 tank (mengisi `komposisi` spawn), dan `parameterBaseline` diisi dari `rearingPlan`. Status berpindah dari `setup` ke `aktif`.
2. Observasi & Monitoring Aktif — petugas menginput data harian; Rule Engine (`alerts`) mengevaluasinya secara real-time; dan alert otomatis muncul begitu ada anomali (waspada atau bahaya). Statusnya `aktif`.
3. Eksekusi Panen & Distribusi Output — panen dilakukan (bisa bertahap, berarti beberapa record `prodPostLarvae`), lalu SR final dihitung (yaitu total panen dibagi total stok awal); status berpindah dari `panen` ke `selesai`. Kalau terjadi crash total (terminasi), statusnya menjadi `terminasi`, yang sengaja dibedakan dari panen normal demi keperluan analitik.
4. Pembaruan Baseline & Optimalisasi — SR final memperbarui baseline sukses sistem (siklus dengan SR ≥ 70% menjadi referensi optimal), yang lalu memperkuat rekomendasi cerdas untuk siklus berikutnya (closed-loop). Lihat mesin rekomendasi di `06`.

## Kategori lintas divisi

Satu form fisik bisa berisi bagian dari divisi yang berbeda. Contohnya Form 13, yang memuat observasi harian Produksi sekaligus blok mikro/mikroskopis Lab. Tiap bagian diperlakukan sebagai kategori tersendiri, sehingga menghasilkan record terpisah dengan pemilik divisi dan rantai pengesahannya masing-masing. Pemilik divisi ditetapkan di level kategori.

## Lima prinsip domain (wajib ditegakkan mesin)

1. Satu baris berarti satu tank pada satu hari. Kunci logis sebuah record harian adalah `(tankId, tanggal)`, bukan siklusId — sebab satu siklus mencakup sekitar 20 tank per hari, yang berarti sekitar 20 baris. Baris yang duplikat dihitung sebagai error validasi. Tiap record juga menyimpan `siklusId`, dan `dailySheet.ts` merakit satu baris per tank per hari, dikelompokkan per siklus.
2. Setiap parameter punya batas normal, waspada, dan bahaya. Ambang di `threshold` menyalakan `alerts.evaluate`, yang menghasilkan status berwarna dan peringatan aktif.
3. NH3 dihitung, bukan diukur. Rumusnya: `compute.computeNH3({tan, ph, suhu, salinitas})` = `TAN × f`, dengan `f = 1/(1 + 10^(pKa − pH))` dan `pKa = 0.09018 + 2729.92/(273.15 + T°C)` (mengikuti Emerson 1975; koreksi salinitas bersifat opsional; pH pada skala NBS). Fraksi amonia yang beracun naik tajam saat pH tinggi, jadi ambang dipasang pada NH3, bukan pada TAN — sebab TAN yang sama bisa aman atau berbahaya tergantung pH dan suhunya.
4. Komposisi Vibrio itu penting, bukan sekadar totalnya. TCBS dicatat terpisah menjadi koloni hijau, kuning, dan luminescent. Koloni luminescent dihitung kritis (bahaya) meski TVC total terlihat stabil.
5. Traceability rantai penuh: `induk → spawn → (komposisi) → penempatan(tank) → siklus → tambak tujuan`. Relasinya bertingkat — satu induk bisa menghasilkan banyak spawn dan banyak siklus; satu siklus mencakup sekitar 20 tank (lewat `penempatan`); dan spawn dengan tank bersifat many-to-many (lewat `komposisi`). Rantai ini memungkinkan kita menelusuri tank atau siklus yang gagal sampai ke spawn/induk asalnya, mengulang yang berhasil, dan menilai apakah asal atau umur induk memengaruhi SR.
