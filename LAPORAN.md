# LAPORAN — Perpustakaan Web (Frontend)

**Tanggal:** 2026-09-14
**Proyek:** `~/projects/perpustakaan-web` (React + Vite + Tailwind v4)
**Backend terkait:** `~/projects/perpustakaan-api` (Go, port 8080)

---

## 1. Ringkasan

Membangun ulang antarmuka web perpustakaan dari template kosong menjadi halaman
landing rak buku interaktif + alur login yang terhubung ke backend API. Dimulai
dengan pembersihan struktur proyek, lalu pembuatan halaman-halaman inti, dan
dilanjutkan beberapa iterasi penyempurnaan UI pada halaman login dan landing.

---

## 2. Pembersihan Awal

| Item | Aksi | Status |
|---|---|---|
| `src\017mponents` (folder aneh, ada byte kontrol `0x0F` di nama) | Dihapus | ✅ |
| `srcpages` (folder salah ketik) | Dihapus | ✅ |
| `src/components` & `src/pages` | Dihapus isi lama (sudah kosong) | ✅ |

> Catatan: `src/components/BukuTab.jsx` muncul sebagai *deleted* di `git status`,
> tapi tidak pernah saya sentuh selama sesi ini — `src/components` sudah kosong
> saat pengerjaan dimulai. Tidak terpengaruh.

---

## 3. Struktur File Final

```
src/
├── api/
│   └── client.js               # Axios instance: baseURL http://localhost:8080 + interceptor Bearer token
├── utils/
│   └── auth.js                 # Helper token/session (set, get, clear)
├── pages/
│   ├── Landing.jsx             # (B) Rak buku 2 tingkat interaktif  ← root "/"
│   ├── Login.jsx               # (B) Hero login + form, terima bookTitle/bookColor
│   ├── Register.jsx            # (B) Form pendaftaran
│   ├── Dashboard.jsx           # (M) Katalog buku + pencarian (card grid)
│   └── AdminResetPassword.jsx  # (B) Reset password admin (PUT)
├── App.jsx                     # (M) Routing + route guards
├── index.css                   # (M) Kustom animasi + sisa CSS template
├── main.jsx                    # (T) BrowserRouter + App
└── assets/                     # (T) template
```

Terbaca: `(B)` dibuat baru, `(M)` dimodifikasi, `(T)` tidak berubah.

---

## 4. Halaman & Integrasi Backend

| Endpoint | Method | Halaman | Skema | Auth |
|---|---|---|---|---|
| `http://localhost:8080/login` | POST | `Login.jsx` | body `{username, password}` → respon `{token, id_user, username, id_role, ...}` | — |
| `http://localhost:8080/register` | POST | `Register.jsx` | body `{username, password}` → `{message}` | — |
| `http://localhost:8080/buku` | GET | `Landing.jsx` & `Dashboard.jsx` | → `[]Buku {id_buku, judul, penulis, deskripsi, gambar, stok}` | — |
| `/admin/user/reset-password` | PUT | `AdminResetPassword.jsx` | body `{username, new_password}` | Bearer + Role Admin |

### Alur Login (tidak berubah sepanjang iterasi)
```
axios.post('/login', {username, password})
  → localStorage.setItem('token', res.data.token)
  → localStorage.setItem('user', JSON.stringify(res.data.user || res.data))
  → navigate('/dashboard')
```

### `src/api/client.js`
- `baseURL: 'http://localhost:8080'`
- Interceptor request menambah `Authorization: Bearer <token>` dari `localStorage`
  (dipakai untuk endpoint yang butuh auth seperti reset password).

---

## 5. Routing (`App.jsx`)

```
"/"                      → Landing (rak buku)
"/login"                 → Login (hero, menerima state.bookTitle & bookColor)
"/register"              → Register
"/dashboard"             → Dashboard (guard: wajib login)
"/admin/reset-password"  → AdminResetPassword (guard: login + id_role === 1)
"*"                      → Navigate ke "/"
```

Guard diimplementasikan:
- `Protected` — redirect ke `/` bila tidak ada token.
- `RequireAdmin` — redirect ke `/dashboard` bila bukan admin (`id_role===1`).

---

## 6. Iterasi Desain yang Dilalui

| # | Konsep | Hasil |
|---|---|---|
| 1 | Dasar: split-screen kiri banner gradient dark + kanan card glassmorphism | ❌ dianggap *neon/AI slop* |
| 2 | Minimalis single card `max-w-md` di atas `bg-slate-50` | ✅ awal |
| 3 | Split-screen modern flat (banner `bg-slate-900` + fitur) | sementara |
| 4 | Polesan: dot grid + preview card "Buku Paling Dipinjam" | ❌ dianggap widget AI dump |
| 5 | Single card Linear/Vercel style (`bg-slate-100`, button `bg-slate-900`) | ✅ |
| 6 | Single card + accent border atas `border-t-zinc-900`, gradient bg | ✅ |
| 7 | Warm Aesthetic Library Split-Screen (foto Unsplash + card amber) | sementara |
| 8 | **Bookshelf Landing + Hero Login Modal** (interaktif, modal fade/zoom) | ❌ ternyata modal, bukan tujuan |
| 9 | **Landing rak polos + `/login` hero** (klik buku → login hero) | ✅ inti |
| 10 | **Editorial Interactive Bookshelf** (1 baris penuh, hover lift + tooltip) | ✅ |
| 11 | **2-Tier Bookshelf Final** (2 rak tebal, buku polos tanpa teks, tumpukan horizontal, badge putih) | ✅ **final** |

---

## 7. Detail Halaman Final

### `Landing.jsx` — Rak Buku 2 Tingkat
- Background krem `bg-[#F3EFE6]`.
- 2 baris rak kayu tebal (`bg-gradient from-[#A67C52] to-[#8B5A2B]`, `h-5`, highlight + shadow).
- 22 buku/baris = 44 buku (dari API `/buku`, dilengkapi dummy sampai penuh).
- Buku polos tanpa teks; palet retro/earth-tone (mustard, terracotta, sage, dusty blue, cream…).
- Variasi: tinggi 120–255px, tebal 14–34px, sebagian miring `rotate(±3–6deg)`, 1 tumpukan horizontal per 8 buku.
- Hover: buku terangkat `-translate-y`, shadow 3D; badge pill putih serif (`bg-white/95 backdrop-blur`) dengan judul & "Klik untuk Pinjam".
- Klik → `navigate('/login', {state: {bookTitle, bookColor}})`.
- Bayangan lembut `blur-2xl` di belakang rak untuk efek 3D.
- Fallback daftar dummy bila backend mati.

### `Login.jsx` — Hero Login
- Terima `bookTitle` + `bookColor` (default: "Laskar Pelangi" + warna hash).
- Kiri: badge kecil "Perpustakaan", headline "Buku impianmu, tinggal satu klik lagi.", render buku hero besar (warna sesuai buku 3that diklik, miring + bayangan).
- Kanan: card form (Username, Password, tombol `Masuk` `bg-slate-900`).
- Logika POST `/login` + simpan token + redirect `/dashboard` **identik** sejak awal.

### `Dashboard.jsx` — Katalog
- Navbar + hero sambutan + toolbar pencarian.
- Grid card buku dari `/buku`; gambar dari `/uploads/`; badge stok.
- Fixes: `loading` init `false`, get `fetched` flag, fetch di-defer via `setTimeout(0)` (memuhi rule `react-hooks/set-state-in-effect`).

### `Register.jsx` & `AdminResetPassword.jsx`
- Saat lint, variabel `navigate` tak terpakai dihapus; fungsi tidak berubah.

---

## 8. Build & Lint

Perintah terakhir berhasil di jalankan di root proyek:
- `npm run build` ✅ (Vite 8, 1904 modules; bundle JS ~310 kB / gzip ~100 kB).
- `npm run lint` ✅ 0 error / 0 warning.

---

## 9. Hal yang Masih Terbuka / Risk

1. **`src/components/BukuTab.jsx` terhapus** — bukan pekerjaan saya; konfirmasi apakah item ini sengaja (mungkin sisa commit lama). `git status` menampilkan ` D` (deleted di working tree).
2. **`index.css`** masih memuat class *sliding overlay* template lama yang tidak dipakai; safe untuk dihapus, tapi tidak mengganggu runtime.
3. **Backend `GET /buku` tidak butuh auth** → Landing & Dashboard memanggilnya tanpa token. Dashboard tetap dijaga route-nya (login).
4. **Gambar buku** di Dashboard di-prefix `http://localhost:8080/` (karena backend serve dari `/uploads/`).
5. `.env`/secret JWT ada di backend (`perpustakaan-api`), tidak termasuk scope laporan ini.