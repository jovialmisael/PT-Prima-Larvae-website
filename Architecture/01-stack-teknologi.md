# 01 · Stack Teknologi

Dokumen ini mencatat teknologi yang **benar-benar terpasang** di proyek, bukan rencana. Semua versi di bawah dibaca langsung dari `node_modules/` pada 19 Agustus 2026.

## Runtime aplikasi

| Paket | Rentang di `package.json` | Terpasang | Catatan |
|---|---|---|---|
| `react` / `react-dom` | `^18.3.1` | 18.3.1 | Runtime aplikasi. Entry di `src/main.tsx` memakai `createRoot` + `StrictMode`. |
| `react-router-dom` | `^6.26.0` | 6.30.4 | Routing halaman & deep-link. Definisi rute ada di `src/App.tsx` beserta `PrivateRoute`. |
| `lucide-react` | `^1.31.0` | 1.31.0 | Pustaka ikon SVG. Wajib dipakai sebagai pengganti emoji (lihat Anti-Emoji Policy di `02`). |

Tidak ada pustaka state management, UI kit, maupun CSS framework. Styling ditulis tangan dengan CSS biasa plus design token di `src/styles/tokens.css` — **proyek ini tidak memakai Tailwind**.

## Build & bahasa

| Paket | Rentang di `package.json` | Terpasang | Catatan |
|---|---|---|---|
| `vite` | `^5.4.0` | 5.4.21 | Bundler sekaligus dev server. Konfigurasi di `vite.config.ts`. |
| `@vitejs/plugin-react` | `^4.3.1` | 4.7.0 | Plugin React untuk Vite 5. |
| `typescript` | `^5.5.4` | 5.9.3 | Mode `strict`. Vite/esbuild mentranspile `.ts/.tsx` tanpa pengecekan tipe, jadi `tsc --noEmit` dipakai sebagai gerbang tipe terpisah. |
| `@types/react` · `@types/react-dom` | `^18.3.3` · `^18.3.0` | 18.3.31 · 18.3.7 | Deklarasi tipe React 18. |
| `@types/node` | `^22.0.0` | 22.20.1 | Tipe Node untuk `vite.config.ts` dan skrip. |

Lingkungan pengembangan: Node v22.19.0, npm 10.9.3.

## Pengujian

| Paket | Rentang di `package.json` | Terpasang | Status pemakaian |
|---|---|---|---|
| `vitest` | `^2.0.5` | 2.1.9 | **Aktif.** Menjalankan `test/logic.test.ts` — 12 tes, semuanya hijau. |
| `jsdom` | `^24.1.1` | 24.1.3 | **Aktif.** Dipakai sebagai `test.environment` di `vite.config.ts`. |
| `@testing-library/react` | `^16.0.0` | 16.3.2 | Terpasang, **belum dipakai**. Disiapkan untuk uji komponen (lihat `08`). |
| `@testing-library/user-event` | `^14.5.2` | 14.6.3 | Terpasang, **belum dipakai**. |
| `playwright` | `^1.46.0` | 1.62.1 | Terpasang, **belum dipakai**. Disiapkan untuk e2e alur kritis (lihat `08`). |

Vitest berbagi `vite.config.ts` dengan aplikasi, sehingga konfigurasinya tunggal. Uji saat ini menyentuh langsung modul domain (`compute`, `alerts`, `validate`, `schema`, `rolesConfig`, `api`) dengan shim `localStorage` berbasis objek memori.

> Catatan: berkas uji mengimpor memakai **path relatif** (`../src/utils/compute`), bukan alias. Alias `@services`/`@utils` dipakai di kode aplikasi, tapi belum diterapkan di `test/`.

Tiga paket berstatus "belum dipakai" sengaja dibiarkan terpasang karena sudah direncanakan di `08`. Karena semuanya dev-dependency, ia tidak menambah ukuran bundel hasil build.

## Path alias

Enam alias, didefinisikan di **dua tempat yang harus selalu sinkron**: `resolve.alias` di `vite.config.ts` (resolusi bundler) dan `compilerOptions.paths` di `tsconfig.json` (resolusi editor dan `tsc`).

| Alias | Menunjuk ke | Status |
|---|---|---|
| `@domainTypes/*` | `./src/types/*` | Aktif |
| `@services/*` | `./src/services/*` | Aktif |
| `@utils/*` | `./src/utils/*` | Aktif |
| `@components/*` | `./src/components/*` | Aktif |
| `@pages/*` | `./src/pages/*` | Aktif |
| `@hooks/*` | `./src/hooks/*` | **Mati** — folder `src/hooks/` tidak ada; `useLoginController.ts` sudah pindah ke `src/pages/auth/`. Aliasnya masih dideklarasikan tapi nol pemakai. |

Impor di kode aplikasi selalu memakai alias, misalnya `import { list } from '@services/api'`. Dengan begitu batas antar-modul lebih tegas dan refaktor jadi lebih mudah.

> `tsconfig.json` memakai `baseUrl: "."` dengan `paths` relatif. Ini sah dan berfungsi di TypeScript 5.

## Perkakas

Package manager npm, dengan skrip:

| Skrip | Perintah | Fungsi |
|---|---|---|
| `npm run dev` | `vite` | Dev server. |
| `npm run build` | `tsc --noEmit && vite build` | Build produksi — gerbang tipe ikut dijalankan lebih dulu. |
| `npm run preview` | `vite preview` | Menyajikan hasil build secara lokal. |
| `npm test` | `vitest` | Runner uji (mode watch; pakai `vitest run` untuk sekali jalan). |
| `npm run typecheck` | `tsc --noEmit` | Gerbang tipe. Wajib 0 error. |

Target deploy: **SPA statis**, sehingga bisa dihosting di mana saja tanpa server aplikasi. Persistensi data masih di localStorage peramban lewat seam tunggal `src/services/api.ts` — kontrak REST penggantinya sudah didokumentasikan di `06` untuk migrasi ke Laravel (F4).

## Catatan evolusi

Rencana awal dokumen ini menargetkan versi bleeding-edge (React 19, Vite 8, TypeScript 7, Vitest 4). Yang akhirnya dipasang saat scaffold adalah kombinasi stabil di atas: **Vite 5 + React 18 + TypeScript 5 + Vitest 2**. Kombinasi ini matang, ekosistem plugin-nya lengkap, dan sudah terbukti membangun seluruh aplikasi sampai kondisi sekarang.

Upgrade ke React 19 / Vite 8 masih terbuka, tapi bukan prioritas — tidak ada fitur yang sedang terhambat karenanya. Kalau nanti dikerjakan, perlakukan sebagai pekerjaan tersendiri dengan gerbang `typecheck` + Vitest sebagai jaringnya.
