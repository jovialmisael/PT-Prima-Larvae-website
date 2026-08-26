# 11 · Peta Fase Delivery (lensa progres, non-UI)

Dokumen ini tidak menggantikan `00`–`10` (yang tetap menjadi sumber kebenaran teknis). Ia sekadar lensa progres/delivery yang memetakan ke desain yang sudah ada. Catatan: lapisan antarmuka yang dulu dikeluarkan kini dibuka kembali dan dirancang penuh di `12`–`14` (IA, UX, UI), dengan fase pembangunannya di `09` (Fase UI). Jadi jalur yang dilacak sekarang mencakup Product/Domain, Logic Engineering, Quality (logic), dan lapisan Antarmuka.

Arti tiap status:

- ✅ dirancang & selaras — speknya lengkap di dokumen, tinggal dibangun.
- 🟡 sebagian — sudah disinggung, dan dipertegas di bagian Firm-up.
- ⛔ di luar cakupan prototype — masuk roadmap F4/F5.

Soal status build: Fase 1 (dokumen `00`–`11`) sudah selesai. Scaffold beserta logic core sudah dibangun dan diuji: `src/services/` (seam async `api`, `session`, `rolesConfig`, `alerts`, `seed`) dan `src/utils/` (`compute` NH₃, `schema`, `categories/`, `validate`, `stages`) dengan 12 uji Vitest hijau. Analitik/siklus/rekomendasi dan utilitas logic (CSV/pencarian/backup) **belum dibangun** — tidak ada modulnya di kode. Sisanya hanya roadmap backend F4 (Laravel) dan F5 (laporan PDF).

## Fase 1 — Product & Domain

| Item | Status | Sumber |
|---|---|---|
| Product vision | ✅ | `00` |
| User persona | ✅ | `00` + `05` (ROLES/USERS/izin/area) |
| User flow | ✅ | `05` (Draft→QC→Sahkan, tolak/koreksi) + `03` (daur siklus 4 tahap) |
| Domain model & schema | ✅ | `03` (CATEGORIES, master, ambang) + `04` (pemetaan form) |

## Fase 2 — Logic Engineering

| Item | Status | Sumber |
|---|---|---|
| Arsitektur proyek | ✅ | Vite 8 + React 19 + TypeScript (`01`/`02`) |
| API integration | ✅ | `02`+`06` (`api.ts` seam, async, CRUD + verify/tolak + siklus, kontrak REST) |
| Data fetching | ✅ | `02` (async/await sejak awal) + `06` |
| Domain/schema engine | ✅ | `03`/`06` (schema-driven, validasi, Rule Engine) |
| Error states | ✅ | `02`/`06` (`null`-on-fail, tanpa sukses palsu) |
| Rekomendasi Cerdas | ✅ | `06` (rule-based, bukan LLM) |
| Real-time updates | ⛔ | localStorage single-device; multi-device/push menjadi F4 (`10` nomor 35) |

## Fase 3 — Quality & Delivery (logic)

| Item | Status | Sumber |
|---|---|---|
| Testing | ✅ | `08` (Vitest logic — layer 1 wajib tiap fase) |
| Dokumentasi | ✅ | Folder `Architecture/` (`00`–`11`) |
| Deployment | 🟡→✅ | `01` (SPA statis) + bagian Firm-up soal Deploy |

## Lapisan antarmuka (IA/UX/UI)

| Item | Status | Sumber |
|---|---|---|
| Information Architecture | ✅ dirancang | `12` (sidebar per divisi/role, inventaris halaman, matriks role→halaman) |
| UX flow | ✅ dirancang | `13` (dashboard, daily input, lab, QC, AI, daur siklus) |
| UI design system | ✅ dirancang | `14` (data-dense + mode gelap, token semantik, komponen, responsif) |
| Aksesibilitas (WCAG 2.1 AA) | ✅ dirancang | `14` (keyboard, screen reader, ukuran sentuh, zoom, reduced-motion) |
| Onboarding / cold-start | ✅ dirancang | `13` (Setup Wizard first-run) + `12` (halaman) |
| Uji UI (komponen + e2e) | ✅ dirancang | `08` (RTL + Playwright), deps `01`, gerbang `09` |
| Real-time updates | ⛔ | tetap F4 (localStorage single-device) |

Keputusan yang dibekukan untuk lapisan ini: navigasi sidebar per divisi/role (dengan Beranda/Analitik tetap berorientasi kerja — penyimpangan sadar dari `PRODUCT-DNA`, dicatat di sana), visual data-dense terang + mode gelap, dan responsif setara mobile→desktop.

## Keputusan yang dibekukan

1. Bahasanya TypeScript (mode `strict`), dan stack-nya tetap Vite 8 + React 19.
2. Runner uji-nya Vitest (untuk logic), menggantikan `node:test`. Ia dev-dependency, jadi tidak memengaruhi bundel.
3. Real-time updates berada di luar cakupan prototype (menjadi urusan F4 backend).
4. AI Assistant di sini berarti mesin Rekomendasi Cerdas yang rule-based dan transparan (bukan chatbot LLM); proxy AI menjadi urusan F4.

## Firm-up item 🟡

### State management

- Tanpa store global (Redux atau Zustand tidak dipakai di prototype).
- Seam `api.ts` berperan sebagai data layer, dibungkus hook kecil yang mengelola `loading | error | data`.
- Navigasi memakai React Router (`react-router-dom`) — tiap halaman punya URL dan bisa di-deep-link (lihat `02`/`12`).
- State bersama lintas-halaman (sesi, konteks siklus aktif, jumlah alert) memakai React Context kecil, bukan store global.
- TanStack Query menjadi backlog, dipertimbangkan hanya bila F4 (server) butuh cache atau sinkronisasi.

### Deployment

- Host statis — kompatibel dengan GitHub Pages, Netlify, Vercel, atau Cloudflare Pages.
- Artefaknya adalah `dist/` hasil `vite build`.
- Pemilihan host konkret dan CI (opsional) diputuskan saat rilis.

## Model tipe inti — `src/types/index.ts` + `src/types/masters.ts`

Dirancang di sini, tapi ditulis saat Fase 3. Semuanya diturunkan langsung dari `03`/`05`/`06`/`08`:

- Union/enum: `Division = 'produksi'|'lab'|'mpm'` · `RoleLevel = 'petugas'|'pj'|'kepala'|'mpm'|'manager'|'owner'` · `Area = 'maturasi'|'algae'|'pl'` · `Stadia` (union STAGES `N1..PL10+`) · `RecordStatus = 'draft'|'qc'|'disahkan'|'ditolak'|'revisi'` · `FieldType = 'text'|'number'|'date'|'select'|'pcr'|'textarea'|'ref'|'computed'`.
- Schema: `FieldDef` · `Threshold = NumericThreshold | CategoricalThreshold | StageAwareThreshold` · `Category`.
- Record: `ApprovalStamp` · `RejectStamp` · `RecordBase<TFields>` (bentuk record-nya di `08`: `dibuatOleh`, `diparafArea?`, `diperiksaMpm?`, `disahkanKepala?`, `ditolakOleh?`, `koreksiDari?`, `riwayatEdit?`).
- Master: `Tank` · `Induk` · `Spawn` · `Siklus` · `Penempatan` (dengan `komposisi: {spawnId,jumlah}[]`) · `Transfer` · `RearingPlan`.
- Mesin: `Alert` · `AlertStatus = 'aktif'|'diakui'|'selesai'` · `Recommendation`.
- Kontrak: `ApiResult<T> = T | null` (menegakkan aturan gagal-simpan dari `06`); plus tipe koleksi `Collection` dan peta `collection → record type`.
