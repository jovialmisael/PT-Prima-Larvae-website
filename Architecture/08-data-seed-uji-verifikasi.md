# 08 · Data, Seed, Uji & Verifikasi

## Bentuk record

```
{
  id, createdAt, updatedAt,
  tankId?,          // ref → tank (record HARIAN per-tank); kunci = (tankId,tanggal)
  siklusId,         // ref → siklus (pengelompokan); area? untuk record Lab
  ...fields,        // sesuai kategori (lihat 03)
  status,           // 'draft' | 'qc' | 'disahkan' | 'ditolak' | 'revisi'
  dibuatOleh,       // { name, role, area?, at }
  diparafArea?,     // { name, role, area, at, signature }   (opsional, Lab)
  diperiksaMpm?,    // { name, role, at, signature }         (QC)
  disahkanKepala?,  // { name, role, division, at, signature } (final)
  ditolakOleh?,     // { name, role, at, alasan }            (tolak; alasan wajib)
  koreksiDari?,     // <idRecordAsal> bila record ini koreksi
  riwayatEdit?      // [{ name, role, at, ringkasan }]
}
```

Field computed (NH3, suhuDelta, persentase) tidak disimpan mentah selama masih bisa dihitung ulang — nilainya dihitung saat dibaca lewat `compute`, supaya tidak ada data basi. Kalau nanti butuh performa, ia boleh di-cache asalkan sumber datanya tetap tersimpan.

## Strategi `seed.ts`

Tujuannya mengisi data supaya analitik dan rekomendasi langsung hidup begitu aplikasi pertama kali dibuka:

- Master `rearingPlan` (SOP per stadia dari N5 ke PL10, dari referensi Lampung), dipakai untuk baseline siklus, ambang stage-aware, dan rekomendasi.
- Master `induk` (2–3 batch, kode otomatis dari tanggal kedatangan, dengan `sumberInduk` yang variatif antara Bali dan Lampung). Salah satunya sengaja dibuat mendekati afkir (umur ~3–4 bln) supaya memicu peringatan induk sekaligus mendemokan analitik umur terhadap SR.
- `spawn` (beberapa per induk) plus `penempatan` (beberapa tank per siklus, dengan `komposisi` many-to-many — salah satu tank sengaja berisi campuran 2 spawn untuk mendemokannya) plus contoh `transfer` (perpindahan antar ruang-stadia).
- Master `tank` dan `siklus`, minimal 3 profil siklus (batch multi-tank, kode otomatis dari tglMulai, dengan `indukId` yang me-ref induk — mendemokan bahwa satu induk dipakai banyak siklus, dan satu siklus mencakup banyak tank):
  - Siklus berhasil (SR final ≥ 70%, parameter dekat SOP) — mewakili sisi "berhasil" pada kohort sekaligus baseline sukses.
  - Siklus gagal (SR rendah, ada lonjakan NH3 / Vibrio luminescent / suhu yang menyimpang dari SOP) — memicu peringatan dan skor risiko tinggi.
  - Siklus berjalan (status aktif) — untuk KPI Siklus Aktif dan prediksi SR.
- Record contoh lintas kategori (air harian, mikrobiologi, defek, panen, tindakan, dan asupan pakan) yang menempel ke siklus-siklus di atas, tersebar beberapa hari supaya tren dan rekomendasi bisa terbentuk.
- Beberapa TTD contoh (dataURL sederhana) pada record `qc`/`disahkan` supaya jejak pengesahannya terlihat.
- Bersifat idempoten: dipanggil lewat `ensureSeeded()`, dan hanya mengisi bila datanya kosong atau `DATA_VERSION` berubah.

## Uji — `test/logic.test.ts` (Vitest)

Uji dijalankan dengan shim `localStorage` (sebuah objek memori) supaya `api.ts` bisa berjalan di lingkungan uji (Node env). Vitest bersifat TS-native dan berbagi `vite.config.ts` dengan aplikasi. Berkas uji saat ini mengimpor lewat path relatif (`../src/utils/compute`), bukan alias. Cakupan berikut wajib hijau semua:

| Area | Yang diuji |
|---|---|
| `compute` | `computeNH3` (naik saat pH naik), `suhuDelta`, `stats`/CV, dan persentase. |
| `alerts` | `evalField` pada batas atas dan bawah (numerik), kategori (`badValues`/`warnValues`, luminescent = bahaya), serta stage-aware (`byStage` dipakai sesuai stadia, dengan fallback ke `default`). |
| `rearingPlan` | seed SOP per stadia; `parameterBaseline` siklus terisi dari `rearingPlan`; ambang stage-aware bersumber dari SOP. |
| `validate` | field wajib, tanggal tidak di masa depan, duplikat `(tankId,tanggal)`, persentase 0–100, dan sentinel `TNTC`/`>x` yang tidak boleh ditolak. |
| `analytics` | skor risiko (dengan bobot driver yang terlihat), `cohortComparison` berhasil (SR ≥ 70%) vs gagal, `expectedStageForDoc`, dan `updateSuccessBaseline`. |
| `induk` | `createInduk` (kode auto yang unik) dan `afkirInduk`; `umurInduk`/`estimasiAfkir` (computed); alert induk mendekati afkir; serta `indukPerforma`. |
| `spawn` | `createSpawn` (me-ref induk); rantai induk→spawn→penempatan; fertil% dan hatching% (computed). |
| `siklus/penempatan/transfer` | `createSiklus` (kode auto unik, butuh `indukId`), `createPenempatan` (komposisi many-to-many), `transfer` (split/merge: mengakhiri lalu membuka penempatan), dan `closeSiklus` (SR ≥ 70% memicu baseline; status `terminasi`). |
| `SR` | `srTank` (dibagi stok awal penempatan) dan `srFinal` (total panen dibagi total stok siklus). |
| `pengesahan` | `verify` (parafArea/qc/sahkan), `tolak` (alasan wajib, menghasilkan `ditolak`/`revisi`), record `disahkan` yang immutable sehingga koreksi jadi versi baru (`koreksiDari`), dan fallback QC. |
| `alerts-lifecycle` | `acknowledgeAlert`/`resolveAlert` (aktif→diakui→selesai) dan dedup per `(param,tank,siklus)`. |
| `csv` | `parseCsv` dan `toCsv` (round-trip). |
| `search` | `searchAll` menghormati `categoryVisible` per role. |

## Lapisan uji & verifikasi

1. Unit logic — Vitest (tabel di atas), berjalan di Node env dengan shim `localStorage`; wajib hijau tiap fase.
2. Uji komponen UI — Vitest dengan React Testing Library dan user-event di environment `jsdom`, mulai berlaku sejak Fase UI. Yang diuji minimal: field renderer per `FieldType` (render + validasi inline), badge status (warna, ikon, dan teks sesuai `alerts`), kartu alert (acknowledge/selesai), dan signature pad (menghasilkan dataURL). Komponen memanggil `api.ts` yang di-mock, bukan localStorage nyata.
3. E2e alur kritis — Playwright, minimal untuk dua alur: daily input submit (draf tersimpan + validasi) dan QC approve/reject (verify/tolak dengan TTD dan alasan). Sengaja dijaga sedikit (belum ada backend) — hanya jaring pengaman untuk alur paling penting.

Semua alat uji (Vitest, React Testing Library, Playwright) berstatus dev-dependency, jadi tidak memengaruhi bundel.

## Gerbang build

- `npm run build` bersih (tanpa error atau warning kritis).
- `npm run dev` dan `npm run preview` berjalan.
- `npm test` (Vitest, mode run) hijau semua, dan `npm run typecheck` (`tsc --noEmit`) bersih.
- Sejak Fase UI: uji komponen UI hijau, dan e2e Playwright untuk alur kritis hijau (mulai Fase UI-2).

Gerbang-gerbang ini harus lulus di setiap fase sebelum lanjut (lihat `09`).
