import { useRef } from 'react';
import useSWR from 'swr';
import api from '../../api/client';
import { getToken } from '../../utils/auth';
import { createDemoData, dayKey, isOpenLoan, relativeDay, userId } from './data';

// Endpoint tambahan mengikuti kontrak REST /api; /buku mempertahankan API yang sudah ada.
const endpoints = {
  books: '/buku', loans: '/api/peminjaman', facilities: '/api/fasilitas',
  users: '/api/user', shifts: '/api/jadwal_shift', attendance: '/api/absensi',
  genres: '/api/genre', publishers: '/api/penerbit', statuses: '/api/status',
};
const idFields = { books: 'id_buku', facilities: 'id_fasilitas', users: 'id_user', shifts: 'id_shift' };

async function loadLibrary(user, allowDemo) {
  const role = Number(user.id_role);
  const keys = ['books', 'genres', 'publishers', 'statuses', 'loans', ...(role !== 3 ? ['facilities', 'shifts', 'attendance', 'users'] : [])];
  const results = await Promise.allSettled(keys.map(async (key) => {
    const response = await api.get(endpoints[key], {
      timeout: 6000,
      params: (key === 'loans' && role === 3) || (key === 'attendance' && role === 2) ? { id_user: userId(user) } : undefined,
    });
    const rows = response.data?.data ?? response.data;
    if (!Array.isArray(rows)) throw new Error(`Format data ${key} tidak sesuai. Server harus mengembalikan daftar data.`);
    return [key, rows];
  }));
  const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
  const authError = errors.find((error) => [401, 403].includes(error.response?.status));
  if (authError) throw new Error(authError.response.status === 401 ? 'Sesi telah berakhir. Silakan masuk kembali.' : 'Server menolak akses untuk peran Anda.');
  if (errors.length) {
    const canFallback = errors.every((error) => error.isAxiosError && (!error.response || [404, 501].includes(error.response.status)));
    if (allowDemo && canFallback) return { ...createDemoData(user), reason: 'Backend belum tersedia atau endpoint belum lengkap. Perubahan hanya berlaku dalam sesi demo.' };
    throw new Error(errors[0].response?.data?.message || errors[0].message || 'Data tidak dapat dimuat. Coba lagi.');
  }
  return { mode: 'live', reason: '', books: [], loans: [], facilities: [], users: [], shifts: [], attendance: [], genres: [], publishers: [], statuses: [], ...Object.fromEntries(results.map((result) => result.value)) };
}

export default function useLibrary(user, preview) {
  const hasLiveData = useRef(false);
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ['library-dashboard', preview ? 'demo' : getToken(), userId(user), Number(user.id_role)],
    async () => {
      if (preview) return createDemoData(user);
      const result = await loadLibrary(user, !hasLiveData.current);
      if (result.mode === 'live') hasLiveData.current = true;
      return result;
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false, shouldRetryOnError: false },
  );

  async function execute(method, endpoint, payload, update) {
    if (!data) throw new Error('Tunggu hingga data selesai dimuat.');
    if (data.mode === 'demo') {
      await mutate((current) => update(structuredClone(current)), { revalidate: false });
      return;
    }
    if (!userId(user)) throw new Error('ID pengguna tidak ditemukan. Silakan masuk kembali.');
    try {
      await api.request({ method, url: endpoint, data: payload, timeout: 15000 });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Perubahan gagal disimpan ke server. Silakan coba lagi.');
    }
    await mutate();
  }

  async function saveResource(resource, values, original) {
    const role = Number(user.id_role);
    if (role === 3 || (['users', 'shifts'].includes(resource) && role !== 1)) throw new Error('Anda tidak memiliki akses untuk tindakan ini.');
    const field = idFields[resource];
    if (!field) throw new Error('Jenis data tidak valid.');
    const id = original?.[field];
    return execute(id ? 'PUT' : 'POST', `${endpoints[resource]}${id ? `/${encodeURIComponent(id)}` : ''}`, values, (current) => {
      const record = { ...original, ...values, [field]: id ?? Math.max(0, ...current[resource].map((row) => Number(row[field]) || 0)) + 1 };
      current[resource] = id ? current[resource].map((row) => row[field] === id ? record : row) : [...current[resource], record];
      return current;
    });
  }

  async function checkAttendance(type) {
    if (Number(user.id_role) === 3) throw new Error('Absensi hanya tersedia untuk staf.');
    const shift = data.shifts.find((item) => String(item.id_shift) === String(user.id_shift));
    if (!shift) throw new Error('Anda belum memiliki jadwal shift. Hubungi administrator.');
    const today = data.attendance.find((item) => String(item.id_user) === String(userId(user)) && item.tanggal?.slice(0, 10) === dayKey());
    if ((type === 'masuk' && today?.jam_masuk_aktual) || (type === 'keluar' && (!today?.jam_masuk_aktual || today?.jam_keluar_aktual))) throw new Error('Status absensi sudah berubah. Muat ulang data.');
    return execute('POST', endpoints.attendance, { id_user: userId(user), id_shift: shift.id_shift, tipe: type }, (current) => {
      const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
      if (type === 'masuk') current.attendance.push({ id_absensi: crypto.randomUUID(), id_user: userId(user), id_shift: shift.id_shift, tanggal: dayKey(), jam_masuk_aktual: time, jam_keluar_aktual: null });
      else current.attendance = current.attendance.map((item) => item.id_absensi === today.id_absensi ? { ...item, jam_keluar_aktual: time } : item);
      return current;
    });
  }

  async function borrowBook(book) {
    if (Number(user.id_role) !== 3) throw new Error('Peminjaman hanya tersedia untuk anggota.');
    if (book.stok < 1) throw new Error('Buku ini sedang tidak tersedia.');
    if (data.loans.some((loan) => String(loan.id_user) === String(userId(user)) && loan.id_buku === book.id_buku && isOpenLoan(loan))) throw new Error('Anda masih memiliki peminjaman aktif untuk buku ini.');
    return execute('POST', endpoints.loans, { id_buku: book.id_buku, id_user: userId(user) }, (current) => {
      current.books = current.books.map((item) => item.id_buku === book.id_buku ? { ...item, stok: item.stok - 1 } : item);
      current.loans.unshift({ id_peminjaman: crypto.randomUUID(), kode_transaksi: `PJM-${String(current.loans.length + 129).padStart(5, '0')}`, id_user: userId(user), nama: user.nama || user.username, id_buku: book.id_buku, tanggal_peminjaman: dayKey(), batas_waktu: relativeDay(7), denda: 0, status: 'Menunggu' });
      return current;
    });
  }

  async function processLoan(loan) {
    if (Number(user.id_role) === 3 || !isOpenLoan(loan)) throw new Error('Tindakan tidak diizinkan.');
    const status = loan.status === 'Menunggu' ? 'Dipinjam' : 'Dikembalikan';
    return execute('PUT', `${endpoints.loans}/${encodeURIComponent(loan.id_peminjaman)}`, { status }, (current) => {
      current.loans = current.loans.map((item) => item.id_peminjaman === loan.id_peminjaman ? { ...item, status } : item);
      if (status === 'Dikembalikan') current.books = current.books.map((book) => book.id_buku === loan.id_buku ? { ...book, stok: book.stok + 1 } : book);
      return current;
    });
  }

  return { data, error, isLoading, isValidating, reload: () => mutate(), saveResource, checkAttendance, borrowBook, processLoan };
}
