# Struktur `src/` — Panduan Singkat

Tujuan dokumen ini: satu halaman yang membuat developer baru cepat paham & konsisten.

## Peta folder
```
src/
  main.tsx            # entry: memuat styles/tokens.css + styles/primitives.css, render <App/>
  App.tsx             # routing (react-router) + PrivateRoute (shell via AppLayout)
  styles/             # CSS GLOBAL
    tokens.css        #   design token (:root), font, base html/body  ← ubah tema dari sini
    primitives.css    #   kelas dashboard yang dipakai lintas peran (.dash-*, .bak-*, .form-*, dll.)
  components/
    layout/           # shell: AppLayout, Header, Sidebar
    ui/               # komponen presentasional generik: Card, Button, Badge, DataTable, Input, ...
  pages/              # satu folder per rute/halaman (lihat aturan di bawah)
    auth/             # Login + useLoginController + loginPresets (fitur login menyatu di sini)
    dashboard/        # Dashboard.tsx (dispatcher per role) + 1 folder per peran
    produksi/ lab/ laporan/ alerts/
  services/           # data & logika non-UI: api, session, alerts, seed, rolesConfig
  utils/              # helper murni: compute, schema, validate
  types/              # tipe domain terpusat (index.ts)
```

## Aturan konvensi
1. **Satu halaman = satu folder** berisi `NamaHalaman.tsx` + `index.ts` (barrel `export { NamaHalaman } from './NamaHalaman'`), plus `NamaHalaman.css` bila perlu.
   - **Casing:** nama **folder camelCase** (mis. `inputProduksi/`, `petugasLab/`), nama **file komponen PascalCase** (mis. `InputProduksi.tsx`), file non-komponen camelCase (mis. `useLoginController.ts`). Konsisten di seluruh `pages/`.
   - Import halaman lewat foldernya: `@pages/produksi/inputProduksi` (resolve ke `index.ts`).
2. **CSS**: gaya global/bersama ada di `src/styles/` (token di `tokens.css`, primitif dashboard di `primitives.css`). Gaya KHAS satu peran/halaman diletakkan di file `.css` di folder komponen itu. Kalau sebuah kelas tak ada di CSS lokal, cek `src/styles/primitives.css`.
3. **Sumber kebenaran "role" hanya satu: `services/rolesConfig.ts`** (`ROLES` + `USERS`). Jangan bikin daftar role paralel. Preset chip di Login diturunkan dari sana via `pages/auth/loginPresets.ts` (berkas itu hanya menyimpan meta tampilan: badge/warna/ikon).
4. **Routing dashboard per peran** ada di `pages/dashboard/Dashboard.tsx` (switch atas `role.id`). Ada 8 role → 7 dashboard (`pjLab` menumpang `kepalaLab`); lihat komentar di berkas tersebut.

## Alias path (tsconfig.json)
`@components/* @services/* @utils/* @hooks/* @pages/* @domainTypes/*` → `src/*`.
Catatan: `@hooks/*` kini tak terpakai (hook login sudah pindah ke `pages/auth/`).

## Verifikasi
- `npm run typecheck` / `npm run build` — gerbang wajib hijau.
- `npm run dev` — login demo: username peran (mis. `owner`, `manager`, `petugas.lab.maturasi`), sandi `prima123`.
