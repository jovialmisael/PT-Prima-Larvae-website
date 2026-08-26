# 10 · Keterbatasan Diketahui & Backlog

Ini daftar celah dan risiko hasil review kritis sebelum build. Dulu item yang khusus soal UI/UX dikeluarkan dari daftar ini; sejak lapisan antarmuka dibuka kembali, kepedulian UI/UX kini dirancang di `12`–`14` dan dibangun di Fase UI (lihat `09`). Arti tiap status:

- ✅ folded — sudah diselesaikan di desain (`00`–`09`).
- ⏳ backlog — sudah diakui, tapi dikerjakan nanti, bukan sekarang.
- 🔵 prototype-OK — wajar untuk sebuah prototype atau memang sifatnya melekat; ditangani saat build atau di fase lanjutan (F4/F5).

Tujuan daftar ini agar tidak ada yang tercecer: tiap keputusan "tunda" tercatat secara sadar, bukan karena lupa.

## A. Model domain & entitas

1. ✅ Perpindahan tank antar-stadia sudah ditangani lewat entitas `transfer` dan tabel join `penempatan`.
2. ✅ Relasi many-to-many antara spawn dan tank sudah ditangani lewat `penempatan.komposisi[]`.
3. ✅ Stadia `PL≥4` sudah dipecah menjadi PL1..PL10 secara eksplisit.
4. ✅ Panen bertahap sudah didukung lewat banyak record `prodPostLarvae` per siklus; SR final dihitung saat siklus ditutup.
5. ✅ Terminasi dibedakan dari panen normal lewat status `terminasi` yang berbeda dari `selesai`.
6. ⏳ Batch air/tandon belum menjadi entitas, sehingga traceability dari air treatment ke tank ditunda (ke F4 atau nanti).
7. ⏳ Batch probiotik/kimia/pakan belum menjadi master (kode atau nomor batch, dan tanggal kedaluwarsa), sehingga traceability-nya belum lengkap.
8. ⏳ `sumberInduk` perlu dibuat lebih extensible karena pemasok bisa lebih dari sekadar Bali/Lampung.
9. ⏳ Top-up induk (kedatangan baru yang dicampur ke batch lama) belum punya aturan.
10. ⏳ Strain algae dan sumber artemia belum banyak dimodelkan dari sisi taksonomi/sumbernya.

## B. Ambang, NH₃, Rule Engine

11. ✅ Formula NH₃ sudah dispesifikasi (Emerson 1975) di `compute.computeNH3`.
12. ✅ Kalibrasi ambang sudah ada: default SOP ditandai "provisional", lalu `suggestBounds` mengkalibrasinya dari data sendiri.
13. ⏳ Ambang stage-aware untuk DO, pH, dan Vibrio belum ada — baru suhu yang bersumber dari SOP.
14. ⏳ Arah tiap ambang (buruk-bila-tinggi, buruk-bila-rendah, atau berupa band) perlu diaudit saat mengisi schema.
15. ✅ Nilai sentinel non-numerik (`TNTC`/`>x`/`<x`) sudah ditangani `compute.num`.
16. ⏳ Notasi shorthand lapangan (seperti "pro>", "vort>", "nec 1%") vs field terstruktur belum diselaraskan.

## C. Alert lifecycle & Rekomendasi

17. ✅ Alert fatigue diatasi lewat dedup per `(param, tank, siklus)` plus prioritas.
18. ✅ Lifecycle alert `aktif → diakui → selesai` sudah ada, lengkap dengan acknowledge dan penugasan.
19. ⏳ Notifikasi otomatis lintas-divisi belum ada; untuk sekarang lewat `temuanLab` secara manual.
20. ⏳ Isi aturan rekomendasi (heuristik pemicunya) belum dirinci — akan dispesifikasi saat Fase 7.
21. ⏳ Data Bank Cerdas: penggalian pola situasi→tindakan→hasil belum ada (dan perlu diingat, korelasi bukan sebab, apalagi dengan n kecil).
22. ⏳ Formula dan bobot skor risiko belum ditentukan.
23. ⏳ `predictFinalSR` perlu menampilkan ketidakpastian atau tingkat keyakinannya.
24. ⏳ Baseline global "SR ≥ 70%" bisa jadi variatif per musim atau per pelanggan.
25. ⏳ Sinyal "metrik pakan menandakan masalah" belum didefinisikan.

## D. Workflow pengesahan & koreksi

26. ✅ Koreksi setelah `disahkan` ditangani lewat record versi baru bertaut `koreksiDari` plus `riwayatEdit[]`.
27. ✅ Jalur tolak sudah ada lewat `api.tolak(...)` beserta alasannya; statusnya menjadi `ditolak`/`revisi`.
28. 🔵 Delegasi atau absen ditangani lewat fallback QC (Manager) yang sudah diserap desain; delegasi acting penuh masih backlog.
29. ⏳ MPM yang tunggal menjadi bottleneck sekaligus single-point-of-failure untuk QC (mitigasinya lewat fallback).
30. ⏳ Apakah penempatan pasti butuh paraf PJ dalam rantai masih perlu dikonfirmasi saat build (sekarang masih opsional).
31. ⏳ Konflik edit atau sinkronisasi offline ditunda (menuju F4 dengan server yang authoritative).

## E. Data, persistence, skala

32. 🔵 Plafon localStorage (~5–10MB) diatasi dengan paginasi/arsip; solusi sesungguhnya ada di F4 (server).
33. ⏳ TTD dalam bentuk dataURL base64 membengkakkan storage.
34. ✅ `api.ts` sudah async (Promise) sejak awal, sehingga migrasi ke REST nanti mulus.
35. 🔵 Multi-perangkat dan sinkronisasi menuju F4 (Laravel).
36. ⏳ Migrasi skema yang sesungguhnya belum ada (sekarang bump `DATA_VERSION` berarti reseed).
37. ⏳ Backup otomatis belum ada (sekarang manual berupa JSON).
38. ⏳ Soft-delete/recycle bin belum ada (sekarang hard delete).
39. ⏳ Impor data historis Excel (2 format) di-skip untuk sekarang.
40. 🔵 Pencarian masih linear-scan localStorage — cukup untuk skala prototype.

## F. Input & data lapangan

42. ⏳ Entri massal (parameter sama untuk banyak tank sekaligus) belum ada.
43. ⏳ Integrasi alat (probe pH/DO, timbangan) belum ada; sekarang masih manual, jadi human-error tetap mungkin.
44. ⏳ Lampiran foto (mikroskopi defek, plate Vibrio) sebagai bukti QC belum ada.
46. ⏳ Hari kosong (tanpa sampling) harus ditangani `dailySheet` secara anggun, bukan malah memunculkan alert.

## G. Keamanan, privasi, integritas

47. 🔵 Auth masih demo (`prima123`, `?as=`) — keamanan sesungguhnya di F4.
48. 🔵 TTD belum kriptografis — integritas sisi server ada di F4.
49. ⏳ Kebijakan PII (nama staf, tambak tujuan) beserta kontrol aksesnya belum ada.
50. ⏳ Ekspor membawa risiko eksfiltrasi, jadi perlu pengaturan cakupan, redaksi, dan log.
51. ⏳ Kebijakan retensi data belum ada.

## H. Analitik & statistik

52. 🔵 Dengan n kecil, tampilkan caveat dan hindari klaim statistik yang kuat.
53. 🔵 Confounding antar-parameter membuat hasil harus disajikan sebagai indikasi, bukan sebab.
54. ✅ Definisi SR sudah dibakukan: per tank (dibagi stok awal) plus final agregat siklus.

## I. Uji & verifikasi

58. ⏳ Realisme data seed (distribusinya perlu mendekati kondisi nyata).

## J. Stack & teknis

59. 🔵 Vite 8 dan plugin-react 6 masih bleeding-edge; fallback ke Vite 7 sudah disiapkan.

## K. Proses & ketergantungan eksternal

63. 🔵 Hasil tambak bergantung pada kerja sama eksternal, jadi dilacak sejauh yang bisa.
64. ✅ Beban setup master (tank, induk, rearingPlan) sebelum input — ditangani Onboarding / Setup Wizard first-run (alur `13`, halaman `12`).
65. ⏳ Kelengkapan `GLOSSARY` dan materi pelatihan staf belum tuntas.

---

Ringkasnya: item ⏳ ditinjau kembali saat masuk ke fase yang relevan, sedangkan item 🔵 ditangani saat build atau di F4/F5. Kepedulian UI/UX yang dulu dikeluarkan kini ditangani lewat lapisan antarmuka `12`–`14` dan Fase UI di `09` — misalnya lampiran foto bukti QC (#44), entri massal (#42), dan penanganan hari kosong (#46) menjadi bahan pertimbangan desain UX. Empat gap yang dulu under-addressed kini berspek: aksesibilitas WCAG 2.1 AA di `14`, onboarding/cold-start di `13`, uji UI (komponen + e2e) di `08`, serta state & routing di `02`/`11`.
