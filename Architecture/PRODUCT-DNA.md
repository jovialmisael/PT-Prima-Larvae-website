# Prima Larvae — Product DNA

Baca ini sebelum menulis satu baris kode pun. Dokumen bernomor `00`–`14` menjelaskan bagaimana produk ini dibangun; dokumen ini menjelaskan apa produk ini dan mengapa ia ada. Kalau suatu keputusan teknis berbenturan dengan DNA di sini, DNA yang menang — atau, kalau memang perlu berubah, DNA-nya yang harus direvisi lebih dulu secara sadar.

## Prima Larvae dalam satu kalimat

Prima Larvae adalah sebuah Enterprise Hatchery Operating System.

Produk ini dibuat untuk hatchery udang vaname skala besar, dengan empat tujuan: membakukan operasi, menaikkan kualitas data, mendeteksi risiko lebih dini, dan terus menaikkan survival dari siklus ke siklus.

Satu paragraf itu semestinya mengubah cara semua orang memandang produk ini. Ini bukan sekadar aplikasi pencatatan, bukan pula dashboard di atas Excel. Ini adalah sistem operasi — tempat sebuah hatchery benar-benar dijalankan.

## Apa itu Prima Larvae

Setiap produk besar biasanya menamai kategorinya sendiri dalam satu kata:

| Produk | Kategori |
|---|---|
| Notion | Workspace |
| Stripe | Financial Infrastructure |
| Linear | Issue Tracking |
| Grafana | Observability |
| Prima Larvae | Hatchery Operating System |

Kata "Operating System" (OS) kita pilih dengan sengaja, dan itu bukan sekadar hiasan.

Sebuah OS bukan satu aplikasi tunggal. Ia adalah lapisan dasar tempat semua pekerjaan terjadi, sekaligus fondasi tempat hal-hal lain berjalan di atasnya. Prima Larvae bekerja persis seperti itu. Kernel-nya — inti paling dasar — adalah pencatatan harian yang jujur dari semua divisi, yaitu Produksi, Lab, dan QC; tanpa kernel ini, tidak ada bagian lain yang bisa berdiri. Di atas kernel itu barulah berjalan deteksi dini (Rule Engine), monitoring (memantau kesehatan tank secara langsung), knowledge (belajar dari satu siklus ke siklus berikutnya), dan AI (ringkasan, rekomendasi, temuan).

Excel tidak punya kernel semacam ini. Excel hanyalah lembaran: setiap sel berdiri sendiri, tidak tahu apa-apa tentang sel lain, tidak bisa memperingatkan, dan tidak bisa belajar. Prima Larvae mengubah data harian dari sekadar arsip mati menjadi sistem hidup yang mengingat, membandingkan, memperingatkan, dan menuntun.

Ujilah dengan satu kalimat: Prima Larvae adalah sistem operasi tempat sebuah hatchery mencatat, memantau, dan menjadi lebih pintar setiap siklus.

## Apa yang bukan Prima Larvae

Identitas sebuah produk ditentukan sama kuatnya oleh apa yang sengaja ia tolak.

Prima Larvae bukan ERP. ERP berusaha menjadi segalanya untuk semua orang, sedangkan Prima Larvae fokus tajam pada satu hal: menjaga sebuah hatchery tetap sehat dan makin pintar.

Ia bukan modul komersial atau grow-out. Tidak ada biomassa untuk dijual, harga pasar, HPP (harga pokok produksi), atau profit. Uang adalah akibat dari hatchery yang sehat, bukan fitur yang dibangun di sini. Ini batasan wajib — lihat `00-gagasan-dan-tujuan.md`.

Ia bukan dashboard di atas Excel. Produk ini menggantikan Excel sebagai sistem pencatatan utama, bukan sekadar memvisualkan isinya.

Ia bukan alat akuntansi. Metrik pakan di sini dipakai sebagai indikator kesehatan dan pertumbuhan larva, bukan untuk menghitung FCR (rasio pakan) atau biaya.

Dan ia bukan cerminan bagan organisasi. Software mengikuti alur kerja, bukan struktur departemen (alasannya ada di bagian Filosofi produk).

Kalau ada fitur yang mulai menggoda kita ke salah satu arah di atas, berarti fitur itu keliru — atau kita sebenarnya sedang membangun produk yang lain.

## Mengapa Prima Larvae ada

Hatchery modern menghadapi empat masalah nyata: data yang tersebar di mana-mana, operasi manual yang lambat dan rawan salah, risiko human-error yang tinggi pada keputusan-keputusan kritis, dan tuntutan digitalisasi dari hulu ke hilir.

Prima Larvae menjawabnya lewat empat nilai inti yang setara dan saling menopang, bukan sekadar mengejar keuntungan uang:

1. Disiplin data dan anti human-error — ini fondasinya. Tanpa pencatatan yang jujur dan lengkap, tiga nilai lainnya ikut runtuh.
2. Deteksi dini — memberi peringatan sebelum terjadi kematian massal, bukan menjelaskannya setelah semuanya terlambat.
3. Mutu dan kesehatan benur — inilah yang dijaga: larva yang sehat, seragam, dan tahan.
4. Pembelajaran antar-siklus — hatchery yang makin pintar tiap siklus (kita sebut ini closed-loop).

Benang merah yang mengikat keempatnya, dan kalimat yang perlu diingat semua orang: keputusan lebih baik lahir dari data lebih baik.

SR (survival rate — persentase larva yang bertahan hidup) yang tinggi dan profitabilitas adalah akibat kalau keempat nilai itu berjalan, bukan sasaran desain. Membidik uang secara langsung justru menggoda kita membangun modul komersial yang sebenarnya dilarang.

## Filosofi produk

Ini keyakinan yang membentuk setiap keputusan desain. Anggap sebagai aturan, bukan slogan.

1. Data lebih baik menghasilkan keputusan lebih baik. Apa pun yang menaikkan kualitas dan kejujuran data itu bernilai; sebaliknya, apa pun yang menggoda orang mencatat asal-asalan itu berbahaya.
2. SR adalah akibat, bukan sasaran. Kita tidak mengejar angka SR. Kita menjaga keempat nilai inti, dan SR akan mengikuti dengan sendirinya.
3. Software mengikuti alur kerja, bukan struktur organisasi. Tiap perusahaan bisa punya struktur berbeda, tapi alur kerja hatchery relatif universal. Produk yang meniru bagan organisasi akan cepat usang begitu organisasinya berubah. Karena itu kita menata produk seputar jenis pekerjaan (Operations, Monitoring, Analytics, Knowledge), bukan seputar kotak jabatan (Divisi Lab, Divisi Produksi).
4. Deteksi dini lebih penting daripada pelaporan. Nilai tertinggi ada pada peringatan sebelum kejadian, bukan laporan sesudahnya.
5. Sistem yang belajar. Setiap siklus yang selesai memperkaya baseline dan menuntun siklus berikutnya. Hatchery ini harus makin pintar, bukan cuma makin banyak menumpuk data.
6. Ramah untuk semua usia (19 sampai 60 tahun ke atas). Bahasa Indonesia yang jelas, alur yang lugas, dan glosarium untuk istilah teknis. Kecanggihannya ada di dalam mesin, bukan dibebankan ke pengguna.
7. Kejujuran di atas kesan pintar. Produk tidak pernah berpura-pura tahu lebih dari yang sebenarnya ia tahu (lihat bagian Bagaimana AI harus bersikap).

Catatan penyimpangan sadar soal navigasi: saat mendesain antarmuka, navigasi aplikasi diputuskan dikelompokkan per divisi/role — sidebar Produksi/Lab/MPM/Manajemen (lihat `12`) — yang sekilas berlawanan dengan prinsip #3. Ini keputusan yang diambil sadar demi keterintuitifan bagi staf lintas usia, bukan penyimpangan diam-diam. Komprominya: prinsip #3 tetap berlaku untuk penataan konten kerja — Beranda/Dashboard dan Analytics disusun berorientasi kerja (kesehatan → kritis → produksi → monitoring), bukan meniru bagan organisasi. Yang dikelompokkan per-divisi hanyalah menu navigasi, bukan cara berpikir produk.

## Bagaimana AI harus bersikap

AI di Prima Larvae adalah produk, bukan sekadar fitur. Ia hadir di sepanjang pengalaman pemakaian — meringkas, merekomendasikan, menemukan pola — bukan terpojok di satu sudut saja.

Berikut sikap AI yang kita perlakukan sebagai kontrak perilaku:

1. Hadir di mana-mana, bukan di satu tempat. Ringkasan, rekomendasi, dan temuan muncul tepat di tempat keputusan diambil.
2. Menjelaskan sebab, bukan sekadar memperingatkan. Bukan cuma bilang "DO rendah", tapi menunjuk ke pola dan kemungkinan penyebabnya, dengan alasan yang transparan.
3. Jujur soal ketidakpastian, dan tidak pernah mengarang angka keyakinan. Selama belum ada inferensi yang sungguhan, AI memakai keyakinan kualitatif (tinggi atau sedang) dan pola nyata — misalnya "DO rendah berulang di 3 tank" — bukan persentase palsu seperti "83% disebabkan X". Angka yang tidak bisa dipertanggungjawabkan itu lebih buruk daripada tidak ada angka sama sekali. Kepercayaan pengguna adalah aset termahal produk ini.
4. Selalu bisa ditelusuri. Setiap keluaran AI menunjuk balik ke data atau aturan asalnya. Tidak ada kotak hitam.
5. Ramah dan tenang. Bahasanya manusiawi, tidak menakut-nakuti, dan tidak berjargon.

Catatan soal kejujuran: inferensi sebab-akibat yang sungguhan, AI Investigation, dan AI Chat semuanya butuh backend (masuk roadmap F4). Di dokumen ini mereka berperan sebagai north-star yang memandu arah, bukan sesuatu yang kita palsukan di prototype sisi-klien.

## Prioritas informasi

Kalau ragu apa yang harus ditampilkan lebih dulu, urutannya selalu Kesehatan, lalu Kritis, lalu Produksi, lalu Monitoring.

Artinya: tampilkan keadaan menyeluruh dulu (perlukah saya khawatir?), lalu hal yang menuntut aksi segera, kemudian jalannya produksi, baru sinyal latar yang cukup dipantau saja.

## Apa yang kami maksud dengan "enterprise"

"Enterprise" di sini bukan berarti rumit atau mahal. Maksudnya, produk ini serius menangani hal-hal yang membuat operasi skala besar bisa dipercaya:

- Skala — banyak tank dan banyak siklus berjalan paralel, bukan cuma satu-dua.
- Multi-peran dengan pengesahan berjenjang — Draft (Petugas) → QC (MPM) → Disahkan (Kepala), lengkap dengan tanda tangan digital dan jejak audit.
- Traceability penuh — rantai induk → siklus → tank → tambak tujuan tercatat di setiap baris.
- Keandalan data — tidak ada sukses palsu; setiap kegagalan menyimpan data terlihat jelas; record yang sudah disahkan bersifat immutable (tidak bisa diubah, jadi koreksi berarti membuat versi baru).
- Siap tumbuh — arsitekturnya sudah disiapkan untuk berkembang ke backend, multi-perangkat, dan multi-fasilitas.

Jadi enterprise di sini berarti layak dipercaya untuk menjalankan operasi sungguhan, bukan sekadar demo yang tampak cantik.

## Kondisi hari ini vs north-star

DNA ini adalah bintang utara — ia menggambarkan produk yang ingin kita jadikan. Supaya ia menuntun tanpa berbohong, berikut posisi kita yang sebenarnya:

| Kapabilitas | Hari ini (prototype klien) | North-star |
|---|---|---|
| Pencatatan multi-divisi + validasi | ✅ Ada | ✅ |
| Pengesahan berjenjang + TTD (tanda tangan) digital | ✅ Ada | ✅ |
| Traceability induk→siklus→tank→tambak | ✅ Ada | ✅ |
| Deteksi dini (Rule Engine, ambang stage-aware) | ✅ Ada (deterministik) | + deteksi anomali berbasis model (F4) |
| Pembelajaran antar-siklus (baseline closed-loop) | ✅ Ada (SR≥70%) | + model prediktif lintas siklus (F4) |
| AI Summary / Recommendation / Findings | 🔜 rule-based, keyakinan kualitatif | inferensi sungguhan (F4) |
| AI Investigation & AI Chat | ⛔ Belum ada, butuh backend | F4 |
| Multi-fasilitas | ⛔ Ditunda | roadmap lanjutan |

Yang bertanda ✅ memang sudah nyata sekarang. Yang 🔜 sedang atau akan dibangun di sisi klien. Yang ⛔ adalah bagian north-star yang dengan jujur kita akui belum ada — ia memandu arah, tapi tidak kita palsukan.

## Cara memakai dokumen ini

Dokumen ini dibaca lebih dulu oleh siapa pun, manusia maupun AI, sebelum menyentuh kode, PRD, atau desain. Ia menjelaskan mengapa; barulah `00`–`14` menjelaskan apa dan bagaimana.

Ia menang atas keputusan teknis yang berbenturan dengannya. Kalau implementasi memaksa kita menyimpang dari DNA, revisi dulu DNA-nya secara sadar — jangan diam-diam menyimpang.

Terakhir, ia bersifat hidup. DNA boleh berkembang, tapi setiap perubahannya harus merupakan keputusan produk yang disengaja, bukan efek samping dari urusan engineering.
