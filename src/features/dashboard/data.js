export const roleNames = { 1: 'Administrator', 2: 'Pustakawan', 3: 'Anggota' };
export const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
export const number = (value) => new Intl.NumberFormat('id-ID').format(value);
export const dateLabel = (value, options = {}) => value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', ...options }) : '—';
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function relativeDay(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return dayKey(date);
}
export const userId = (user) => user.id_user ?? user.id;
export const isOpenLoan = (loan) => !['Dikembalikan', 'Dibatalkan'].includes(loan.status);
export const loanStatus = (loan) => isOpenLoan(loan) && loan.batas_waktu < dayKey() ? 'Terlambat' : loan.status;
export const demoUsers = {
  1: { id_user: 1, username: 'Aditya', nama: 'Aditya Pratama', id_role: 1, id_shift: 1 },
  2: { id_user: 2, username: 'Nadia', nama: 'Nadia Putri', id_role: 2, id_shift: 1 },
  3: { id_user: 3, username: 'Alya', nama: 'Alya Rahma', id_role: 3 },
};

export function createDemoData(user = demoUsers[1]) {
  const books = [
    { id_buku: 1, judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', deskripsi: 'Kisah persahabatan, mimpi, dan semangat sepuluh anak di Belitung yang tak pernah padam.', stok: 12, id_genre: 1, id_penerbit: 1, id_status: 1, cover: 0 },
    { id_buku: 2, judul: 'Laut Bercerita', penulis: 'Leila S. Chudori', deskripsi: 'Tentang kehilangan, keberanian, dan ingatan yang tetap hidup melampaui waktu.', stok: 8, id_genre: 1, id_penerbit: 2, id_status: 1, cover: 1 },
    { id_buku: 3, judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', deskripsi: 'Perjalanan Minke menemukan kemanusiaan, cinta, dan keberanian di tengah perubahan zaman.', stok: 6, id_genre: 2, id_penerbit: 3, id_status: 1, cover: 2 },
    { id_buku: 4, judul: 'Filosofi Teras', penulis: 'Henry Manampiring', deskripsi: 'Filsafat Yunani–Romawi kuno untuk menghadapi kehidupan modern dengan lebih tenang.', stok: 10, id_genre: 3, id_penerbit: 4, id_status: 1, cover: 3 },
    { id_buku: 5, judul: 'Atomic Habits', penulis: 'James Clear', deskripsi: 'Perubahan kecil yang membawa hasil luar biasa. Panduan membangun kebiasaan yang bertahan.', stok: 0, id_genre: 3, id_penerbit: 2, id_status: 2, cover: 4 },
    { id_buku: 6, judul: 'Pulang', penulis: 'Tere Liye', deskripsi: 'Sebuah perjalanan menemukan arti rumah, keluarga, dan jalan untuk kembali.', stok: 5, id_genre: 1, id_penerbit: 1, id_status: 1, cover: 5 },
  ];
  const memberId = Number(user.id_role) === 3 ? userId(user) : 3;
  const loans = [
    { id_peminjaman: 1, kode_transaksi: 'PJM-00128', id_user: memberId, nama: Number(user.id_role) === 3 ? user.nama || user.username : 'Alya Rahma', id_buku: 2, tanggal_peminjaman: relativeDay(-3), batas_waktu: relativeDay(4), denda: 0, status: 'Dipinjam' },
    { id_peminjaman: 2, kode_transaksi: 'PJM-00127', id_user: 4, nama: 'Bima Saputra', id_buku: 1, tanggal_peminjaman: relativeDay(-9), batas_waktu: relativeDay(-2), denda: 2000, status: 'Dipinjam' },
    { id_peminjaman: 3, kode_transaksi: 'PJM-00126', id_user: 5, nama: 'Citra Lestari', id_buku: 4, tanggal_peminjaman: relativeDay(-2), batas_waktu: relativeDay(5), denda: 0, status: 'Dipinjam' },
    { id_peminjaman: 4, kode_transaksi: 'PJM-00125', id_user: memberId, nama: Number(user.id_role) === 3 ? user.nama || user.username : 'Alya Rahma', id_buku: 3, tanggal_peminjaman: relativeDay(-14), batas_waktu: relativeDay(-7), denda: 3000, status: 'Dikembalikan' },
    { id_peminjaman: 5, kode_transaksi: 'PJM-00124', id_user: 6, nama: 'Dimas Wicaksono', id_buku: 6, tanggal_peminjaman: relativeDay(-1), batas_waktu: relativeDay(6), denda: 0, status: 'Menunggu' },
  ];
  return {
    mode: 'demo', reason: '', books, loans,
    genres: [{ id_genre: 1, nama_genre: 'Fiksi' }, { id_genre: 2, nama_genre: 'Sastra & Sejarah' }, { id_genre: 3, nama_genre: 'Pengembangan Diri' }],
    publishers: [{ id_penerbit: 1, nama_penerbit: 'Bentang Pustaka' }, { id_penerbit: 2, nama_penerbit: 'Gramedia Pustaka Utama' }, { id_penerbit: 3, nama_penerbit: 'Lentera Dipantara' }, { id_penerbit: 4, nama_penerbit: 'Penerbit Buku Kompas' }],
    statuses: [{ id_status: 1, nama_status: 'Tersedia' }, { id_status: 2, nama_status: 'Tidak tersedia' }],
    users: [demoUsers[1], demoUsers[2], { ...demoUsers[3], id_user: memberId }, { id_user: 4, nama: 'Bima Saputra', username: 'bima', id_role: 3 }, { id_user: 5, nama: 'Citra Lestari', username: 'citra', id_role: 3 }, { id_user: 6, nama: 'Dimas Wicaksono', username: 'dimas', id_role: 3 }],
    shifts: [{ id_shift: 1, nama_shift: 'Shift Pagi', jam_masuk: '08:00', jam_keluar: '16:00' }, { id_shift: 2, nama_shift: 'Shift Siang', jam_masuk: '12:00', jam_keluar: '20:00' }],
    attendance: [{ id_absensi: 1, id_user: 2, id_shift: 1, tanggal: dayKey(), jam_masuk_aktual: '07:52', jam_keluar_aktual: null }],
    facilities: [{ id_fasilitas: 1, nama_fasilitas: 'Meja baca', kondisi: 'Baik', jumlah: 24 }, { id_fasilitas: 2, nama_fasilitas: 'Komputer katalog', kondisi: 'Baik', jumlah: 6 }, { id_fasilitas: 3, nama_fasilitas: 'Rak buku', kondisi: 'Baik', jumlah: 18 }, { id_fasilitas: 4, nama_fasilitas: 'Kursi ruang diskusi', kondisi: 'Perlu perbaikan', jumlah: 2 }],
  };
}
