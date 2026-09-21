export const roleNames = { 1: "Administrator", 2: "Pustakawan", 3: "Anggota" };
export const pageNames = {
  overview: "Ringkasan",
  books: "Koleksi Buku",
  loans: "Peminjaman",
  facilities: "Fasilitas",
  employees: "Karyawan & Shift",
  attendance: "Laporan Absensi",
  catalog: "Katalog Buku",
  "my-loans": "Peminjaman Saya",
};
export const demoUsers = {
  1: {
    id_user: 1,
    username: "Aditya Pratama",
    id_role: 1,
    email: "aditya@example.com",
  },
  2: {
    id_user: 2,
    username: "Nadia Putri",
    id_role: 2,
    email: "nadia@example.com",
  },
  3: {
    id_user: 3,
    username: "Alya Rahma",
    id_role: 3,
    email: "alya@example.com",
  },
};

export function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
export function relativeDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}
export function formatDate(value, full = false) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: full ? "long" : "short",
    ...(full ? { year: "numeric" } : {}),
  }).format(date);
}
export const rupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
export const activeLoan = (loan) =>
  !["Dikembalikan", "Dibatalkan"].includes(loan.status);
export function loanStatus(loan) {
  return activeLoan(loan) && loan.batas_waktu < dateKey()
    ? "Terlambat"
    : loan.status;
}

export function createDemoData(user = demoUsers[1]) {
  const users = [
    ...Object.values(demoUsers),
    {
      id_user: 4,
      username: "Rizky Maulana",
      id_role: 3,
      email: "rizky@example.com",
    },
    {
      id_user: 5,
      username: "Dinda Safitri",
      id_role: 3,
      email: "dinda@example.com",
    },
    {
      id_user: 6,
      username: "Fajar Ramadhan",
      id_role: 3,
      email: "fajar@example.com",
    },
    {
      id_user: 7,
      username: "Salsabila Putri",
      id_role: 3,
      email: "salsa@example.com",
    },
    {
      id_user: 8,
      username: "Bagas Saputra",
      id_role: 2,
      email: "bagas@example.com",
    },
    {
      id_user: 9,
      username: "Kevin Wijaya",
      id_role: 3,
      email: "kevin@example.com",
    },
  ];
  const books = [
    {
      id_buku: 1,
      judul: "Laskar Pelangi",
      penulis: "Andrea Hirata",
      deskripsi:
        "Kisah persahabatan, mimpi, dan semangat sepuluh anak di sebuah sekolah sederhana di Belitung.",
      gambar: "/images/laskar-pelangi.png",
      stok: 36,
      id_penerbit: 1,
      id_genre: 1,
      id_status: 1,
    },
    {
      id_buku: 2,
      judul: "Bumi Manusia",
      penulis: "Pramoedya Ananta Toer",
      deskripsi:
        "Perjalanan Minke menemukan kemanusiaan, cinta, dan jati diri di tengah pergolakan zaman kolonial.",
      gambar: "/images/bumi-manusia.png",
      stok: 28,
      id_penerbit: 2,
      id_genre: 2,
      id_status: 1,
    },
    {
      id_buku: 3,
      judul: "Filosofi Teras",
      penulis: "Henry Manampiring",
      deskripsi:
        "Filsafat Stoa untuk membantu kita menghadapi kecemasan dan menjalani kehidupan dengan lebih tenang.",
      gambar: "/images/filosofi-teras.png",
      stok: 24,
      id_penerbit: 3,
      id_genre: 3,
      id_status: 1,
    },
    {
      id_buku: 4,
      judul: "Laut Bercerita",
      penulis: "Leila S. Chudori",
      deskripsi:
        "Sebuah cerita tentang persahabatan, keluarga, dan ingatan yang tidak pernah benar-benar hilang.",
      gambar: "/images/laut-bercerita.png",
      stok: 40,
      id_penerbit: 4,
      id_genre: 1,
      id_status: 1,
    },
  ];
  const loans = [
    {
      id_peminjaman: 1,
      kode_transaksi: "PJM-260921-001",
      id_user: 3,
      id_buku: 1,
      tanggal_peminjaman: relativeDate(-2),
      batas_waktu: relativeDate(5),
      denda: 0,
      status: "Dipinjam",
    },
    {
      id_peminjaman: 2,
      kode_transaksi: "PJM-260921-002",
      id_user: 4,
      id_buku: 2,
      tanggal_peminjaman: relativeDate(-1),
      batas_waktu: relativeDate(6),
      denda: 0,
      status: "Dipinjam",
    },
    {
      id_peminjaman: 3,
      kode_transaksi: "PJM-260920-003",
      id_user: 5,
      id_buku: 3,
      tanggal_peminjaman: relativeDate(-10),
      batas_waktu: relativeDate(-3),
      denda: 6000,
      status: "Dipinjam",
    },
    {
      id_peminjaman: 4,
      kode_transaksi: "PJM-260920-004",
      id_user: 6,
      id_buku: 4,
      tanggal_peminjaman: relativeDate(-3),
      batas_waktu: relativeDate(4),
      denda: 0,
      status: "Dipinjam",
    },
    {
      id_peminjaman: 5,
      kode_transaksi: "PJM-260919-005",
      id_user: 7,
      id_buku: 1,
      tanggal_peminjaman: relativeDate(-14),
      batas_waktu: relativeDate(-7),
      denda: 15000,
      status: "Dikembalikan",
    },
    {
      id_peminjaman: 6,
      kode_transaksi: "PJM-260919-006",
      id_user: 9,
      id_buku: 3,
      tanggal_peminjaman: relativeDate(-6),
      batas_waktu: relativeDate(1),
      denda: 0,
      status: "Dipinjam",
    },
    {
      id_peminjaman: 7,
      kode_transaksi: "PJM-260918-007",
      id_user: 3,
      id_buku: 4,
      tanggal_peminjaman: relativeDate(-20),
      batas_waktu: relativeDate(-13),
      denda: 0,
      status: "Dikembalikan",
    },
  ];
  if (Number(user.id_role) === 3 && user.id_user !== 3) {
    for (const loan of loans)
      if (loan.id_user === 3) loan.id_user = user.id_user;
  }
  return {
    books,
    genres: [
      { id_genre: 1, nama_genre: "Fiksi" },
      { id_genre: 2, nama_genre: "Sejarah" },
      { id_genre: 3, nama_genre: "Pengembangan Diri" },
    ],
    publishers: [
      { id_penerbit: 1, nama_penerbit: "Bentang Pustaka" },
      { id_penerbit: 2, nama_penerbit: "Lentera Dipantara" },
      { id_penerbit: 3, nama_penerbit: "Penerbit Buku Kompas" },
      { id_penerbit: 4, nama_penerbit: "Kepustakaan Populer Gramedia" },
    ],
    statuses: [
      { id_status: 1, nama_status: "Tersedia" },
      { id_status: 2, nama_status: "Tidak tersedia" },
    ],
    roles: Object.entries(roleNames).map(([id_role, nama_role]) => ({
      id_role: Number(id_role),
      nama_role,
    })),
    users: Number(user.id_role) === 3 ? [user] : users,
    loans:
      Number(user.id_role) === 3
        ? loans.filter((loan) => loan.id_user === user.id_user)
        : loans,
    returns: [
      {
        id_pengembalian: 1,
        id_peminjaman: 5,
        tanggal_pengembalian: relativeDate(-1),
        denda: 15000,
      },
      {
        id_pengembalian: 2,
        id_peminjaman: 7,
        tanggal_pengembalian: relativeDate(-14),
        denda: 0,
      },
    ],
    facilities: [
      {
        id_fasilitas: 1,
        nama_fasilitas: "Meja baca individual",
        kondisi: "Baik",
        jumlah: 24,
      },
      {
        id_fasilitas: 2,
        nama_fasilitas: "Komputer katalog",
        kondisi: "Baik",
        jumlah: 6,
      },
      {
        id_fasilitas: 3,
        nama_fasilitas: "Rak koleksi utama",
        kondisi: "Baik",
        jumlah: 18,
      },
      {
        id_fasilitas: 4,
        nama_fasilitas: "Kursi ruang diskusi",
        kondisi: "Perlu perbaikan",
        jumlah: 2,
      },
    ],
    shifts: [
      {
        id_shift: 1,
        id_user: user.id_user,
        nama_shift: "Shift pagi",
        jam_masuk: "08:00",
        jam_keluar: "16:00",
      },
      {
        id_shift: 2,
        id_user: 8,
        nama_shift: "Shift siang",
        jam_masuk: "12:00",
        jam_keluar: "20:00",
      },
    ],
    attendance: [
      {
        id_absensi: 1,
        id_user: user.id_user,
        id_shift: 1,
        tanggal: dateKey(),
        jam_masuk_aktual: "07:54",
        jam_keluar_aktual: null,
      },
      {
        id_absensi: 2,
        id_user: 8,
        id_shift: 2,
        tanggal: dateKey(),
        jam_masuk_aktual: "12:08",
        jam_keluar_aktual: null,
      },
    ],
  };
}
