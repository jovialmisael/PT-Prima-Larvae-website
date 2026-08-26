# 14 · UI Design Direction & System

Bagian ketiga lapisan antarmuka (`12` IA, `13` UX, `14` UI). Dokumen ini menetapkan arah visual dan sistem desainnya: tipografi, warna, spacing, gaya komponen, dan perilaku responsif. Token ditulis secara semantik (menurut perannya, bukan nilai mentah) supaya pengikatan implementasinya bisa diputuskan saat build.

## Arah desain

Arahnya adalah dashboard yang padat data (data-dense) untuk operasi hatchery skala besar — banyak tank dan siklus paralel harus terbaca sekaligus. Tema terang menjadi default, dengan opsi mode gelap. Ada satu ketegangan yang harus dijaga sepanjang desain: padat data tapi tetap terbaca untuk pengguna 19–60+ tahun. Resolusinya bukan memperbesar segalanya, melainkan hierarki yang jelas, ukuran minimum yang dijaga, dan kepadatan yang hanya diterapkan di tempat yang memang menuntutnya (tabel monitoring), bukan di form input.

Prioritas informasi Product DNA (kesehatan → kritis → produksi → monitoring) menjadi panduan penempatan: yang paling penting mendapat posisi dan bobot visual paling kuat.

## Tipografi

- Satu font sans-serif yang legible untuk UI dan angka; angka sebaiknya tabular (lebar sama) supaya kolom tabel rapi.
- Skala berjenjang jelas: judul halaman, judul seksi, label, teks tubuh, dan teks bantu/caption. Perbedaan antar-jenjang harus terasa, bukan tipis.
- Ukuran minimum dijaga (teks tubuh tidak lebih kecil dari ambang nyaman baca) meski tampilan padat — ini janji "ramah lintas usia".
- Label field dan satuan (mis. ppm, °C, g/l) konsisten memakai gaya caption yang sama.

## Warna

Warna di produk ini membawa makna, bukan sekadar dekorasi. Dua kelompok token:

Status (terhubung langsung ke `alerts` di `06`):

| Token | Makna | Terpakai di |
|---|---|---|
| `status-normal` | aman (hijau) | sel tabel, badge, indikator |
| `status-waspada` | waspada (amber) | nilai di zona antara safe–danger |
| `status-bahaya` | bahaya (merah) | ambang terlampaui, PCR positif, Vibrio luminescent |
| `status-netral` | tanpa penilaian (abu) | nilai tanpa threshold |

Seksi form (merasionalkan warna prototype lama menjadi token bermakna):

| Token | Asal prototype lama | Makna |
|---|---|---|
| `section-info` | biru | blok informasi umum/netral |
| `section-danger` | merah/pink | blok mortalitas/peringatan |
| `section-harvest` | hijau | blok panen/hasil |

Kedua palet (terang dan gelap) harus memenuhi kontras yang memadai — status bahaya tetap terbaca jelas di kedua mode, dan warna tidak boleh menjadi satu-satunya penanda status (selalu dibarengi ikon atau teks) demi keterbacaan bagi yang kesulitan membedakan warna.

## Spacing & layout

- Skala spacing kompak dan konsisten (kelipatan tetap) supaya tampilan padat tetap rapi.
- Grid untuk menata kartu dan panel dashboard; tabel monitoring boleh lebih rapat daripada form.
- Kepadatan berbeda per konteks: form input diberi ruang lebih lega (mengurangi salah isi), tabel monitoring lebih rapat (menampung banyak tank/siklus).

## Katalog komponen

Komponen dipetakan langsung ke domain supaya tidak ada yang mengambang. Yang inti:

| Komponen | Fungsi | Terhubung ke |
|---|---|---|
| Field renderer | Merender kontrol per `FieldType` (`text`/`number`/`date`/`select`/`pcr`/`textarea`/`ref`/`computed`) | schema `03`, `validate` `06` |
| Status badge | Menampilkan normal/waspada/bahaya + ikon + teks | `alerts.evaluate` |
| Kartu alert | Satu alert: parameter, tank/siklus, tindakan, kontak, tombol acknowledge/selesai | `scanAlerts` `06` |
| Signature pad | Ambil TTD (dataURL PNG) saat QC/sahkan/paraf area | rantai `05` |
| Stempel pengesahan | Menampilkan `dibuatOleh`/`diperiksaMpm`/`disahkanKepala` beserta waktu & TTD | bentuk record `08` |
| Tabel dense | Read-model 1 baris/tank/hari, sel berstatus warna | `dailySheet` `06` |
| Sidebar & topbar | Navigasi per divisi/role; collapse jadi drawer di mobile | IA `12` |
| State kosong/loading/error | Tampilan tenang untuk data kosong, sedang dimuat, atau gagal | prinsip lintas-alur `13` |
| Kartu rekomendasi | Rekomendasi dengan driver + sumber + keyakinan kualitatif | `recommend` `06`, kejujuran `PRODUCT-DNA` |

Field renderer wajib menutup semua `FieldType` di `03` — kalau ada tipe baru ditambahkan di schema, renderer-nya yang menanganinya, bukan halaman baru per kategori.

## Perilaku responsif

Karena target perangkatnya responsif setara, tiap komponen punya aturan adaptasi yang jelas:

- Sidebar: panel tetap di layar lebar; menyusut jadi drawer (buka lewat tombol) di layar sempit.
- Tabel dense: tetap tabel di desktop; berubah menjadi daftar kartu (satu kartu per tank) di layar kecil supaya tidak perlu scroll horizontal.
- Form: multi-kolom di desktop; satu kolom di mobile. Grid (distribusi ukuran/stadia) membungkus rapi.
- Angka & badge status tetap terbaca di semua ukuran; ukuran sentuh tombol memadai untuk jari di tablet/mobile.
- Breakpoint didefinisikan konsisten (mobile, tablet, desktop) dan dipakai seragam oleh semua komponen.

## Aksesibilitas & keterbacaan

Aksesibilitas di sini bukan pelengkap — ia wujud konkret dari nilai "ramah untuk semua usia (19–60+)" di Product DNA. Kalau tampilan padat data membuat sebagian pengguna tersingkir, arah desainnya gagal memenuhi janji produk. Target yang dipakai adalah WCAG 2.1 tingkat AA (bukan AAA, yang terlalu ketat untuk prototype).

Yang harus dipenuhi:

- Operabilitas keyboard penuh. Semua yang bisa dilakukan dengan tetikus juga bisa dengan keyboard — navigasi sidebar, pengisian form, dan seluruh rantai pengesahan (QC, sahkan, tolak) dapat dijalankan tanpa menyentuh mouse. Urutan fokus mengikuti urutan baca yang logis.
- Focus state yang terlihat jelas. Elemen yang sedang difokus punya penanda kontras tinggi, tidak boleh dihilangkan demi estetika.
- HTML semantik + ARIA secukupnya. Tabel monitoring memakai struktur tabel yang benar (header terkait sel); badge status, toast, dan alert punya peran/label yang terbaca screen reader — status bahaya diumumkan, bukan hanya berubah warna.
- Warna tidak pernah jadi satu-satunya penanda. Status selalu dibarengi ikon dan/atau teks (menegaskan aturan di bagian Warna), supaya pengguna yang kesulitan membedakan warna tetap paham.
- Ukuran sentuh memadai. Target interaktif minimal sekitar 44×44px, penting karena target perangkat responsif setara sampai ke tablet/mobile di dekat tank.
- Teks terbaca. Ukuran teks tubuh dijaga di atas ambang nyaman baca, mendukung zoom browser sampai 200% tanpa layout rusak, dan panjang baris tidak berlebihan.
- Hormati preferensi gerak. Animasi/transisi mengikuti `prefers-reduced-motion`; tidak ada gerakan berkedip yang mengganggu.

Aturan-aturan ini berlaku lintas komponen di katalog atas — field renderer, tabel dense, kartu alert, signature pad, sidebar — bukan ditambal per halaman.

## Design token & pengikatan implementasi

Token di dokumen ini bernama semantik (`status-bahaya`, `section-harvest`, skala spacing, jenjang tipografi) — bukan nilai mentah seperti kode hex. Dengan begitu keputusan cara mengikatnya ke kode (misalnya konfigurasi Tailwind CSS versus CSS variables) bisa ditetapkan saat fase build tanpa mengubah dokumen ini. Rekomendasi awal adalah Tailwind CSS karena cocok untuk tampilan data-dense, mode gelap, dan responsif dengan Vite + React 19; alternatifnya CSS Modules dengan CSS variables. Keputusan final dan struktur folder UI dicatat di `02` dan fase build-nya di `09`.
