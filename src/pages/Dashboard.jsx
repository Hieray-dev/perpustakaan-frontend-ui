import { cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  ChevronDown,
  Clock3,
  FileBarChart,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import api from '../api/client';
import { getToken, getUser } from '../utils/auth';

const MOCK_BOOKS = [
  { id_buku: 1, judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', penerbit: 'Lentera Dipantara', genre: 'Novel', stok: 5, status: 'Tersedia', initials: 'BM', description: 'Novel pembuka Tetralogi Buru tentang Minke, pendidikan, dan pergulatan manusia di tengah kolonialisme.', isbn: '9789799731234', tanggalTerbit: 'Agustus 1980', halaman: 535, bahasa: 'Indonesia', coverUrl: '/covers/bumi-manusia.png', cover: 'from-[#8b6c54] via-[#b49a7d] to-[#d9c7ae]' },
  { id_buku: 2, judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', penerbit: 'Bentang Pustaka', genre: 'Drama', stok: 3, status: 'Tersedia', initials: 'LP', description: 'Kisah persahabatan sepuluh anak Belitung yang memperjuangkan pendidikan dan mimpi mereka.', isbn: '9789793062792', tanggalTerbit: 'April 2005', halaman: 529, bahasa: 'Indonesia', coverUrl: '/covers/laskar-pelangi.png', cover: 'from-[#487b82] via-[#8fb4ad] to-[#d4dfd5]' },
  { id_buku: 3, judul: 'Filosofi Teras', penulis: 'Henry Manampiring', penerbit: 'Kompas', genre: 'Self-Improvement', stok: 2, status: 'Tersedia', initials: 'FT', description: 'Pengantar praktis untuk menerapkan filsafat Stoa dalam menghadapi tantangan kehidupan sehari-hari.', isbn: '9786024125189', tanggalTerbit: 'Juni 2018', halaman: 346, bahasa: 'Indonesia', coverUrl: '/covers/filosofi-teras.png', cover: 'from-[#967252] via-[#cfad87] to-[#e4d2b9]' },
  { id_buku: 4, judul: 'Laut Bercerita', penulis: 'Leila S. Chudori', penerbit: 'KPG', genre: 'Fiksi Sejarah', stok: 0, status: 'Dipinjam', initials: 'LB', description: 'Novel tentang kehilangan, persahabatan, dan ingatan keluarga dalam pusaran sejarah Indonesia.', isbn: '9786024246946', tanggalTerbit: 'Oktober 2017', halaman: 379, bahasa: 'Indonesia', coverUrl: '/covers/laut-bercerita.png', cover: 'from-[#48595e] via-[#7c8d91] to-[#c0c8c4]' },
];

const MOCK_FACILITIES = [
  { id: 1, name: 'Ruang Baca Utama', good: 1, maintenance: 0, broken: 0 },
  { id: 2, name: 'Meja Baca Individual', good: 24, maintenance: 0, broken: 0 },
  { id: 3, name: 'Komputer Katalog', good: 4, maintenance: 1, broken: 1 },
  { id: 4, name: 'Loker Penitipan', good: 30, maintenance: 2, broken: 0 },
];

const ROLE_NAMES = { 1: 'Admin', 2: 'Pustakawan', 3: 'Pengunjung' };
const STAFF_STORAGE_KEY = 'karyawan_data';
const USERS_STORAGE_KEY = 'registered_users';
const USERS_DATA_STORAGE_KEY = 'users_data';
const LOANS_STORAGE_KEY = 'transaksi_peminjaman';
const BOOKS_STORAGE_KEY = 'books';
const LEGACY_BOOKS_STORAGE_KEY = 'books_data';
const ATTENDANCE_STORAGE_KEY = 'absensi_logs';
const LEGACY_ATTENDANCE_STORAGE_KEY = 'absensi_data';
const LAST_ATTENDANCE_DATE_STORAGE_KEY = 'last_absensi_date';
const EXCLUDED_DUMMY_NAMES = new Set(['sinta maharani', 'dimas pratama', 'sinta', 'dimas']);
const DUMMY_LOAN_MEMBERS = new Set(['alya prameswari', 'raka mahendra', 'alya', 'raka']);
const SHIFT_STORAGE_KEY = 'shift_options';
const CUSTOM_GENRES_STORAGE_KEY = 'custom_genres';
const CUSTOM_PUBLISHERS_STORAGE_KEY = 'custom_penerbit';
const DEFAULT_GENRES = ['Novel', 'Drama', 'Self-Improvement', 'Fiksi Sejarah'];
const DEFAULT_PUBLISHERS = ['Lentera Dipantara', 'Bentang Pustaka', 'Kompas', 'KPG'];
const DEFAULT_SHIFT_OPTIONS = [{ value: 'Shift Pagi (08.00 - 16.00)', label: 'Shift Pagi (08.00 - 16.00)' }];

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function getDisplayName(user) {
  if (user?.nama || user?.name) return user.nama || user.name;
  if (user?.username === 'admin') return 'Admin Sistem';
  return user?.username || 'Pengguna';
}

const BOOK_COVER_PALETTES = [
  'from-[#d9c8b8] via-[#e9dcd0] to-[#f4ede6]',
  'from-[#bfd5d1] via-[#dce9e4] to-[#eef3ed]',
  'from-[#d7c5dc] via-[#e9dce8] to-[#f4edf2]',
  'from-[#e4c8b5] via-[#f0ded0] to-[#f7eee7]',
  'from-[#c5d3e2] via-[#dfe8f0] to-[#f0f3f5]',
];

function getInitials(name = 'Pengguna') {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function getBookCoverPalette(title = '') {
  const hash = [...String(title)].reduce((total, character) => total + character.charCodeAt(0), 0);
  return BOOK_COVER_PALETTES[hash % BOOK_COVER_PALETTES.length];
}

function normalizeBook(value, index = 0) {
  if (!value || typeof value !== 'object') return null;
  const title = String(value.judul || value.title || '').trim();
  if (!title) return null;
  const stock = Number(value.stok ?? value.stock ?? 0);
  const description = String(value.deskripsi || value.description || '').trim();
  const coverUrl = String(value.cover_url || value.coverUrl || '').trim();
  const publishedDate = String(value.tanggal_terbit || value.tanggalTerbit || '').trim();
  return {
    ...value,
    id_buku: value.id_buku || value.id || `book-${index}`,
    judul: title,
    penulis: String(value.penulis || value.author || '').trim(),
    penerbit: String(value.penerbit || value.publisher || '').trim(),
    genre: String(value.genre || value.kategori || value.nama_genre || '').trim(),
    stok: Number.isFinite(stock) ? stock : 0,
    status: value.status || (stock > 0 ? 'Tersedia' : 'Dipinjam'),
    description,
    deskripsi: description,
    isbn: String(value.isbn || value.ISBN || '').trim(),
    tanggal_terbit: publishedDate,
    tanggalTerbit: publishedDate,
    bahasa: String(value.bahasa || value.language || 'Indonesia').trim(),
    jumlah_halaman: value.jumlah_halaman ?? value.halaman ?? value.pages ?? '',
    halaman: value.jumlah_halaman ?? value.halaman ?? value.pages ?? '',
    cover_url: coverUrl,
    coverUrl,
    initials: value.initials || getInitials(title),
    cover: value.cover || getBookCoverPalette(title),
  };
}

function sortStaff(staff) {
  return [...staff].sort((left, right) => {
    const idOrder = String(left.id ?? '').localeCompare(String(right.id ?? ''), 'id', { numeric: true, sensitivity: 'base' });
    return idOrder || String(left.username || left.name || '').localeCompare(String(right.username || right.name || ''), 'id', { sensitivity: 'base' });
  });
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalArray(key) {
  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCustomOptions(key, defaults, currentValue = '') {
  const saved = parseLocalArray(key).filter((option) => typeof option === 'string' && option.trim());
  return [...new Set([...defaults, ...saved, currentValue].filter(Boolean))];
}

function writeCustomOptions(key, options) {
  window.localStorage.setItem(key, JSON.stringify([...new Set(options.filter(Boolean))]));
}

function readShiftOptions() {
  const saved = parseLocalArray(SHIFT_STORAGE_KEY);
  const legacy = saved.length ? saved : parseLocalArray('shifts');
  const options = legacy.filter((option) => option && option.value && option.label);
  return options.length ? options : DEFAULT_SHIFT_OPTIONS;
}

function writeShiftOptions(options) {
  window.localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(options));
  window.dispatchEvent(new CustomEvent('shift_options_updated', { detail: options }));
}

function isExcludedDummy(value) {
  return EXCLUDED_DUMMY_NAMES.has(String(value || '').trim().toLowerCase());
}

function normalizeUser(value, index = 0) {
  if (!value || typeof value !== 'object') return null;
  const username = String(value.username || value.user_name || value.email || '').trim();
  const name = String(value.nama || value.name || value.full_name || value.fullName || username).trim();
  if (!name && !username) return null;
  if (isExcludedDummy(name) || isExcludedDummy(username)) return null;
  return {
    id: value.id || value.id_user || `user-${username || index}`,
    name: name || username,
    username: username || name.toLowerCase().replace(/\s+/g, '-'),
    role: value.role || ROLE_NAMES[Number(value.id_role)] || 'Pustakawan',
    shift: value.shift || value.jadwal_shift || value.schedule || 'Belum diatur',
    status: value.status || 'Aktif',
  };
}

function readRegisteredUsers(activeUser) {
  const values = [activeUser, ...parseLocalArray(USERS_STORAGE_KEY), ...parseLocalArray('users'), ...parseLocalArray('user_list'), ...parseLocalArray('registeredUsers'), ...parseLocalArray(STAFF_STORAGE_KEY), ...parseLocalArray(USERS_DATA_STORAGE_KEY)];
  const users = values.map((value, index) => normalizeUser(value, index)).filter(Boolean);
  return Array.from(new Map(users.map((user) => [user.username || user.name, user])).values());
}

function normalizeAttendanceRecords(values) {
  const records = new Map();
  values.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const rawDate = entry.tanggal || entry.date || entry.waktu || entry.timestamp;
    const date = rawDate ? String(rawDate).slice(0, 10) : getLocalDateKey();
    const name = String(entry.nama || entry.name || entry.username || '').trim();
    if (!name || isExcludedDummy(name)) return;
    const key = `${name}-${date}`;
    const previous = records.get(key) || { id: entry.id || `attendance-${index}`, nama: name, tanggal: date, jamMasuk: '', jamKeluar: '', status: 'Hadir' };
    const time = entry.jamMasuk || entry.time || (entry.waktu ? new Date(entry.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '');
    if (entry.tipe === 'keluar' || entry.type === 'keluar') previous.jamKeluar = entry.jamKeluar || time;
    else if (entry.tipe === 'masuk' || entry.type === 'masuk') previous.jamMasuk = entry.jamMasuk || time;
    else {
      previous.jamMasuk = entry.jamMasuk || previous.jamMasuk || time;
      previous.jamKeluar = entry.jamKeluar || previous.jamKeluar;
    }
    previous.status = entry.status || previous.status || 'Hadir';
    records.set(key, previous);
  });
  return Array.from(records.values());
}

function readBookData() {
  const savedBooks = parseLocalArray(BOOKS_STORAGE_KEY);
  const legacyBooks = savedBooks.length ? savedBooks : parseLocalArray(LEGACY_BOOKS_STORAGE_KEY);
  return legacyBooks.map(normalizeBook).filter(Boolean);
}

function writeBookData(books) {
  const serializedBooks = JSON.stringify(books);
  window.localStorage.setItem(BOOKS_STORAGE_KEY, serializedBooks);
  window.localStorage.setItem(LEGACY_BOOKS_STORAGE_KEY, serializedBooks);
}

function readAttendanceData() {
  const logs = parseLocalArray(ATTENDANCE_STORAGE_KEY);
  const legacy = parseLocalArray(LEGACY_ATTENDANCE_STORAGE_KEY);
  return normalizeAttendanceRecords([...logs, ...legacy]);
}

function writeAttendanceData(records) {
  window.localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent('absensi_data_updated', { detail: records }));
}

function resetAttendanceData() {
  writeAttendanceData([]);
  window.localStorage.setItem(LEGACY_ATTENDANCE_STORAGE_KEY, JSON.stringify([]));
}

function formatTransactionDate(date = new Date()) {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function normalizeLoan(value, index = 0) {
  if (!value || typeof value !== 'object') return null;
  const member = String(value.member || value.nama_peminjam || value.peminjam || value.nama || '').trim();
  const book = String(value.book || value.judul_buku || value.buku || '').trim();
  if (!member && !book) return null;
  if (DUMMY_LOAN_MEMBERS.has(member.toLowerCase())) return null;
  return {
    id: value.id || value.id_transaksi || `transaction-${index}`,
    code: value.code || value.kode_transaksi || `TRX-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
    member: member || 'Peminjam tidak diketahui',
    book: book || 'Buku tidak diketahui',
    date: value.date || value.tanggal_pinjam || formatTransactionDate(),
    due: value.due || value.tanggal_kembali || value.batas_pengembalian || '-',
    status: value.status || 'Dipinjam',
    fine: Number(value.fine || value.denda || 0),
  };
}

function readLoanData() {
  const savedLoans = parseLocalArray(LOANS_STORAGE_KEY);
  const persistedLoans = savedLoans.length ? savedLoans : parseLocalArray('borrowings');
  const cleanedLoans = persistedLoans.map(normalizeLoan).filter(Boolean);
  if (JSON.stringify(persistedLoans) !== JSON.stringify(cleanedLoans)) {
    window.localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(cleanedLoans));
  }
  return cleanedLoans;
}

function writeLoanData(loans) {
  window.localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
  window.dispatchEvent(new CustomEvent('transaksi_peminjaman_updated', { detail: loans }));
}

function getUserShift(user) {
  const username = String(user?.username || '').trim().toLowerCase();
  const userId = user?.id || user?.id_user;
  const matchingUser = readRegisteredUsers(user).find((item) => (username && item.username.toLowerCase() === username) || (userId && item.id === userId));
  return matchingUser?.shift || user?.shift || 'Belum diatur';
}

function readStaffData(activeUser) {
  const persistedStaff = parseLocalArray(STAFF_STORAGE_KEY);
  const savedStaff = (persistedStaff.length ? persistedStaff : parseLocalArray('karyawan')).map(normalizeUser).filter(Boolean);
  const registeredUsers = readRegisteredUsers(activeUser);
  const attendanceUsers = readAttendanceData().map((record, index) => normalizeUser({ name: record.nama, username: record.username }, `attendance-${index}`)).filter(Boolean);
  const staff = new Map([...savedStaff, ...registeredUsers].map((member) => [member.username || member.name, member]));
  attendanceUsers.forEach((member) => {
    const key = member.username || member.name;
    if (!staff.has(key)) staff.set(key, member);
  });
  return sortStaff(Array.from(staff.values()));
}

function saveStaffData(staff) {
  const orderedStaff = sortStaff(staff);
  window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(orderedStaff));
  window.localStorage.setItem(USERS_DATA_STORAGE_KEY, JSON.stringify(orderedStaff));
  window.dispatchEvent(new CustomEvent('karyawan_data_updated', { detail: orderedStaff }));
}

function downloadCsv(filename, headers, rows) {
  const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  window.alert('Laporan berhasil diunduh');
}

function StatusBadge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-stone-200 bg-stone-50 text-stone-600',
    success: 'border-[#c9dacd] bg-[#edf5ee] text-[#3e7251]',
    warning: 'border-[#ead9b8] bg-[#faf4e7] text-[#977333]',
    danger: 'border-[#e7caca] bg-[#fcf0f0] text-[#a25d5d]',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone] || tones.neutral}`}>{children}</span>;
}

function LibraryMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-[#FAF7F2] text-stone-900">
        <BookOpen aria-hidden="true" className="size-[19px]" strokeWidth={1.5} />
      </span>
      {!compact && <span className="font-serif text-[13px] leading-snug tracking-[0.13em] text-stone-900">PERPUSTAKAAN<span className="block">DIGITAL</span></span>}
    </div>
  );
}

function Sidebar({ activeView, onViewChange, role, onLogout, mobileOpen, onClose, user }) {
  const items = [
    { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
    ...(role === 3 ? [{ id: 'catalog', label: 'Katalog Buku', icon: Library }] : []),
    ...(role !== 3 ? [
      { id: 'books', label: 'Kelola Buku', icon: BookOpen },
      { id: 'loans', label: 'Peminjaman', icon: BookOpenCheck },
      { id: 'facilities', label: 'Fasilitas', icon: Building2 },
    ] : []),
    ...(role === 1 ? [
      { id: 'staff', label: 'Karyawan & Shift', icon: Users },
      { id: 'attendance', label: 'Laporan Absensi', icon: FileBarChart },
    ] : []),
    ...(role === 3 ? [{ id: 'my-loans', label: 'Peminjaman Saya', icon: CalendarDays }] : []),
  ];

  return (
    <>
      {mobileOpen && <button aria-label="Tutup menu navigasi" onClick={onClose} className="fixed inset-0 z-30 bg-stone-900/30 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-stone-200 bg-white px-5 py-6 transition-transform duration-200 lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-1">
          <LibraryMark />
          <button type="button" aria-label="Tutup menu" onClick={onClose} className="rounded-md p-2 text-stone-500 hover:bg-stone-100 lg:hidden"><X aria-hidden="true" className="size-5" /></button>
        </div>
        <div className="mt-10 flex flex-1 flex-col">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">Menu utama</p>
          <nav aria-label="Navigasi dashboard" className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} type="button" onClick={() => { onViewChange(item.id); onClose(); }} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${activeView === item.id ? 'bg-stone-900 text-[#FAF7F2]' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}><Icon aria-hidden="true" className="size-[17px]" strokeWidth={1.6} />{item.label}</button>;
            })}
          </nav>
        </div>
        <div className="border-t border-stone-200 pt-5">
          <div className="mb-4 flex items-center gap-3 px-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-stone-100 font-serif text-sm text-stone-700">{getInitials(getDisplayName(user))}</span>
            <div className="min-w-0"><p className="truncate text-sm font-medium text-stone-900">{getDisplayName(user)}</p><p className="truncate text-xs text-stone-500">{ROLE_NAMES[role]}</p></div>
          </div>
          <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-stone-500 transition-colors hover:bg-red-50 hover:text-red-700"><LogOut aria-hidden="true" className="size-[17px]" strokeWidth={1.6} />Keluar dari akun</button>
        </div>
      </aside>
    </>
  );
}

function MobileHeader({ onOpenMenu, onLogout, user }) {
  return <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 lg:hidden"><button type="button" aria-label="Buka menu navigasi" onClick={onOpenMenu} className="rounded-md p-2 text-stone-700 hover:bg-stone-100"><Menu aria-hidden="true" className="size-5" /></button><LibraryMark compact /><button type="button" aria-label="Keluar" onClick={onLogout} className="rounded-md p-2 text-stone-600 hover:bg-red-50 hover:text-red-700"><LogOut aria-hidden="true" className="size-5" /></button><span className="sr-only">Akun {getDisplayName(user)}</span></header>;
}

function PageHeader({ eyebrow, title, description, action }) {
  return <header className="mb-8 flex flex-col gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">{eyebrow}</p><h1 className="font-serif text-4xl font-normal tracking-[-0.04em] text-stone-900 sm:text-[46px]">{title}</h1>{description && <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500">{description}</p>}</div>{action}</header>;
}

function StatCard({ label, value, detail, icon: Icon, accent = 'stone' }) {
  const iconStyles = { stone: 'bg-stone-100 text-stone-700', green: 'bg-[#edf5ee] text-[#4c7e5b]', amber: 'bg-[#faf4e7] text-[#977333]', rose: 'bg-[#fcf0f0] text-[#a25d5d]' };
  return <article className="rounded-lg border border-stone-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs text-stone-500">{label}</p><span className={`flex size-9 items-center justify-center rounded-md ${iconStyles[accent]}`}><Icon aria-hidden="true" className="size-[17px]" strokeWidth={1.5} /></span></div><p className="mt-5 font-serif text-[30px] leading-none tracking-[-0.03em] text-stone-900">{value}</p><p className="mt-2 text-xs text-stone-500">{detail}</p></article>;
}

function formatShiftLabel(shift) {
  const value = String(shift || '').trim();
  if (!value || value === 'Belum diatur') return 'Belum diatur';
  const match = value.match(/^(?:Shift\s+)?(.+?)\s*\(\s*(\d{1,2}[.:]\d{2})\s*-\s*(\d{1,2}[.:]\d{2})\s*\)$/i);
  if (!match) return value;
  return `${match[1].trim()} · ${match[2]}–${match[3]}`;
}

function getShiftStartMinutes(shift) {
  const match = String(shift || '').match(/(\d{1,2})[.:](\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 8 * 60;
}

function AttendanceWidget({ user }) {
  const displayName = getDisplayName(user);
  const currentRecord = readAttendanceData().find((record) => record.nama === displayName && record.tanggal === getLocalDateKey());
  const [shift, setShift] = useState(() => getUserShift(user));
  const [clock, setClock] = useState(new Date());
  const [attendanceState, setAttendanceState] = useState(() => currentRecord?.jamKeluar ? 'exited' : currentRecord?.status === 'Terlambat' ? 'late' : currentRecord ? 'present' : 'idle');
  const [entryTime, setEntryTime] = useState(() => currentRecord?.jamMasuk || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    const syncCurrentAttendance = (event) => {
      const records = Array.isArray(event.detail) ? event.detail : readAttendanceData();
      const todayRecord = records.find((record) => record.nama === displayName && record.tanggal === getLocalDateKey());
      if (!todayRecord) {
        setEntryTime('');
        setAttendanceState('idle');
        return;
      }
      setEntryTime(todayRecord.jamMasuk || '');
      setAttendanceState(todayRecord.jamKeluar ? 'exited' : todayRecord.status === 'Terlambat' ? 'late' : 'present');
    };
    const syncCurrentShift = () => setShift(getUserShift(user));
    window.addEventListener('absensi_data_updated', syncCurrentAttendance);
    window.addEventListener('karyawan_data_updated', syncCurrentShift);
    window.addEventListener('storage', syncCurrentAttendance);
    window.addEventListener('storage', syncCurrentShift);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('absensi_data_updated', syncCurrentAttendance);
      window.removeEventListener('karyawan_data_updated', syncCurrentShift);
      window.removeEventListener('storage', syncCurrentAttendance);
      window.removeEventListener('storage', syncCurrentShift);
    };
  }, [displayName, user]);

  const submitAttendance = async (type) => {
    const recordedAt = new Date();
    const today = getLocalDateKey(recordedAt);
    const time = recordedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const existingRecords = readAttendanceData();
    const currentRecord = existingRecords.find((record) => record.nama === displayName && record.tanggal === today);
    const scheduledStart = getShiftStartMinutes(shift);
    const isLate = recordedAt.getHours() * 60 + recordedAt.getMinutes() > scheduledStart;
    const nextRecord = type === 'masuk'
      ? { id: currentRecord?.id || Date.now(), nama: displayName, tanggal: today, jamMasuk: time, jamKeluar: '', status: isLate ? 'Terlambat' : 'Hadir' }
      : { ...(currentRecord || { id: Date.now(), nama: displayName, tanggal: today, jamMasuk: entryTime, status: 'Hadir' }), jamKeluar: time };
    const nextRecords = currentRecord ? existingRecords.map((record) => record.id === currentRecord.id ? nextRecord : record) : [...existingRecords, nextRecord];
    writeAttendanceData(nextRecords);
    try {
      await api.post('/api/absensi', { tipe: type, waktu: recordedAt.toISOString(), nama: displayName });
      setMessage(type === 'masuk' ? 'Jam masuk berhasil dicatat.' : 'Jam keluar berhasil dicatat.');
    } catch {
      setMessage('Absensi disimpan di perangkat ini.');
    }
    if (type === 'masuk') {
      setEntryTime(time);
      setAttendanceState(isLate ? 'late' : 'present');
    } else {
      setAttendanceState('exited');
    }
  };

  const hasEntered = ['present', 'late', 'exited'].includes(attendanceState);
  const badgeTone = attendanceState === 'late' ? 'warning' : attendanceState === 'idle' ? 'neutral' : 'success';
  const badgeLabel = attendanceState === 'idle' ? 'Belum Absen' : attendanceState === 'late' ? 'Terlambat' : attendanceState === 'exited' ? 'Sudah Absen Keluar' : 'Hadir';
  const actionLabel = attendanceState === 'idle' ? 'Absen Masuk' : attendanceState === 'exited' ? 'Sudah Absen Keluar' : 'Absen Keluar';

  return <section className="mb-8 rounded-lg border border-stone-200 bg-white p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-stone-900 text-[#FAF7F2]"><Clock3 aria-hidden="true" className="size-5" strokeWidth={1.5} /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-serif text-xl text-stone-900">Absensi pustakawan</h2><StatusBadge tone={badgeTone}>{badgeLabel}</StatusBadge></div><p className="mt-1 text-sm text-stone-500">Jadwal masuk: {shift === 'Belum diatur' ? 'Belum diatur' : shift}{entryTime && <span> · Masuk pukul {entryTime}</span>}</p></div></div><div className="flex flex-wrap items-center gap-3 sm:justify-end"><div className="mr-1 text-left sm:text-right"><p className="font-serif text-2xl text-stone-900">{clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p><p className="text-[11px] text-stone-500">Waktu sistem</p></div><button type="button" disabled={attendanceState === 'exited'} onClick={() => submitAttendance(hasEntered ? 'keluar' : 'masuk')} className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50">{actionLabel}</button></div></div>{message && <p className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500" role="status">{message}</p>}</section>;
}

function RecentLoans({ loans, memberOnly = false }) {
  const rows = memberOnly ? loans.slice(0, 2) : loans;
  return <section className="min-w-0 rounded-lg border border-stone-200 bg-white"><div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 sm:px-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Data sirkulasi</p><h2 className="mt-1 font-serif text-xl text-stone-900">Peminjaman terkini</h2></div><ArrowRight aria-hidden="true" className="size-4 text-stone-400" /></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-medium text-stone-500"><tr><th className="px-5 py-3 font-medium sm:px-6">Peminjam</th><th className="px-5 py-3 font-medium">Buku</th><th className="px-5 py-3 font-medium">Batas waktu</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{rows.length ? rows.map((loan) => <tr key={loan.id}><td className="px-5 py-4 sm:px-6"><p className="font-medium text-stone-800">{memberOnly ? 'Anda' : loan.member}</p><p className="mt-0.5 text-xs text-stone-500">{loan.code}</p></td><td className="px-5 py-4 text-stone-600">{loan.book}</td><td className="px-5 py-4 text-stone-600">{loan.due}</td><td className="px-5 py-4"><StatusBadge tone={loan.status === 'Terlambat' ? 'danger' : loan.status === 'Selesai' ? 'success' : 'warning'}>{loan.status}</StatusBadge></td></tr>) : <tr><td colSpan="4" className="px-5 py-12 text-center text-sm text-stone-500">Belum ada sirkulasi peminjaman</td></tr>}</tbody></table></div></section>;
}

function Overview({ user, role, onViewChange, loans, users }) {
  const displayName = getDisplayName(user);
  const isMember = role === 3;
  const visibleLoans = isMember ? loans.filter((loan) => loan.member === displayName) : loans;
  const activeLoans = visibleLoans.filter((loan) => loan.status === 'Dipinjam');
  const lateLoans = visibleLoans.filter((loan) => loan.status === 'Terlambat');
  const totalFines = visibleLoans.reduce((total, loan) => total + loan.fine, 0);
  return <>
    <div className="mb-8 flex flex-col gap-1 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Sistem informasi perpustakaan</p><h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.04em] text-stone-900 sm:text-[46px]">Dashboard Perpustakaan</h1></div><p className="text-sm text-stone-500">Pengguna aktif: <span className="font-medium text-stone-800">{displayName}</span></p></div>
    {(role === 1 || role === 2) && <AttendanceWidget user={user} />}
    {isMember ? <div className="grid gap-5 md:grid-cols-3"><StatCard label="Buku dipinjam" value={activeLoans.length} detail={`${activeLoans.length} transaksi aktif`} icon={BookOpenCheck} accent="stone" /><StatCard label="Total kunjungan" value="-" detail="Belum ada data kunjungan" icon={CalendarDays} accent="green" /><StatCard label="Denda berjalan" value={formatRupiah(totalFines)} detail={`${lateLoans.length} transaksi terlambat`} icon={ShieldCheck} accent="amber" /></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total koleksi buku" value="-" detail="Data katalog aktif" icon={BookOpen} accent="stone" /><StatCard label="Peminjaman aktif" value={activeLoans.length} detail={`${lateLoans.length} transaksi terlambat`} icon={BookOpenCheck} accent="green" /><StatCard label="Denda terkumpul" value={formatRupiah(totalFines)} detail="Dari transaksi tersimpan" icon={FileBarChart} accent="amber" /><StatCard label="Pengunjung terdaftar" value={users.length} detail="Data pengguna aktif" icon={Users} accent="rose" /></div>}
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]"><RecentLoans loans={loans} memberOnly={isMember} /><section className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Menu</p><h2 className="mt-1 font-serif text-xl text-stone-900">Akses cepat</h2></div><Settings2 aria-hidden="true" className="size-5 text-stone-400" /></div><div className="mt-6 flex flex-col gap-2">{(isMember ? [{ label: 'Buka katalog buku', view: 'catalog', icon: Search }, { label: 'Lihat peminjaman saya', view: 'my-loans', icon: CalendarDays }] : [{ label: 'Tambah buku', view: 'books', icon: Plus }, { label: 'Kelola peminjaman', view: 'loans', icon: BookOpenCheck }, ...(role === 1 ? [{ label: 'Lihat laporan absensi', view: 'attendance', icon: FileBarChart }] : [])]).map((item) => { const Icon = item.icon; return <button key={item.view} type="button" onClick={() => onViewChange(item.view)} className="flex items-center justify-between rounded-md border border-stone-200 px-3.5 py-3 text-left text-sm text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"><span className="flex items-center gap-3"><Icon aria-hidden="true" className="size-4 text-stone-500" />{item.label}</span><ArrowRight aria-hidden="true" className="size-4 text-stone-400" /></button>; })}</div></section></div>
  </>;
}

  function BookCover({ book, large = false }) {
  const rawCoverUrl = book.cover_url || book.coverUrl;
  const coverUrl = rawCoverUrl && !/^(https?:|data:|blob:|\/)/i.test(rawCoverUrl) ? `http://localhost:8080/uploads/${rawCoverUrl}` : rawCoverUrl;
  const title = book.judul || 'Koleksi buku';
  const [failedCoverUrl, setFailedCoverUrl] = useState('');
  const showFallback = !coverUrl || failedCoverUrl === coverUrl;
  return <div className={`relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br ${book.cover || getBookCoverPalette(title)} ${large ? 'max-w-none' : ''}`}>
    {coverUrl && !showFallback && <img src={coverUrl} alt={`Sampul ${title}`} className="absolute inset-0 size-full object-cover" onError={() => setFailedCoverUrl(coverUrl)} />}
    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,.3),transparent_60%)]" />
    {showFallback && <div className="absolute inset-x-4 bottom-4 border-l border-stone-700/30 pl-3 text-stone-800"><p className="max-w-[12ch] font-serif text-xl leading-tight tracking-[-0.03em] sm:text-2xl">{title}</p><p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-stone-700/70">Koleksi buku</p></div>}
  </div>;
}

function BookGrid({ books, onBookSelect, showFilters = true }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Semua genre');
  const genres = useMemo(() => ['Semua genre', ...new Set(books.map((book) => book.genre).filter(Boolean))], [books]);
  const filteredBooks = books.filter((book) => (!search || `${book.judul} ${book.penulis}`.toLowerCase().includes(search.toLowerCase())) && (genre === 'Semua genre' || book.genre === genre));
  const visibleBooks = showFilters ? filteredBooks : books;
  return <div>{showFilters && <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5E0D8] bg-white p-3 shadow-sm sm:flex-row"><label className="relative flex-1"><span className="sr-only">Cari judul atau penulis</span><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul atau penulis" className="h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF7F2] pl-10 pr-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200" /></label><div className="w-full sm:w-48"><CustomDropdown value={genre} options={genres} onChange={setGenre} ariaLabel="Filter genre" /></div></div>}<div className="mb-4 flex items-center justify-between"><p className="text-sm text-stone-500">Menampilkan <span className="font-medium text-stone-900">{visibleBooks.length}</span> buku</p><span className="text-xs text-stone-400">Koleksi pilihan</span></div>{visibleBooks.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{visibleBooks.map((book) => { const available = Number(book.stok) > 0 || book.status === 'Tersedia'; return <article key={book.id_buku} className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_8px_30px_rgba(74,59,45,0.04)] transition hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_16px_40px_rgba(74,59,45,0.1)]"><button type="button" onClick={() => onBookSelect(book)} className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-700 focus-visible:ring-inset"><BookCover book={book} /><div className="flex min-h-[154px] flex-col gap-2 p-3.5 sm:p-4"><div className="flex items-start justify-between gap-2"><h3 className="line-clamp-2 font-serif text-[17px] leading-tight text-stone-900">{book.judul}</h3><span className={`mt-0.5 size-2 shrink-0 rounded-full ${available ? 'bg-[#5f8b68]' : 'bg-stone-400'}`} aria-label={available ? 'Tersedia' : 'Dipinjam'} /></div><p className="line-clamp-1 text-xs text-stone-500">{book.penulis}</p><span className="w-fit rounded-full bg-[#f4eee6] px-2 py-1 text-[10px] font-medium text-[#876a4c]">{book.genre || 'Tanpa genre'}</span><div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-2.5 text-[11px]"><span className={available ? 'text-[#4c7e5b]' : 'text-stone-500'}>{available ? 'Tersedia' : 'Dipinjam'}</span><span className="text-stone-400">{available ? `${book.stok || 0} stok` : 'Habis'}</span></div></div></button></article>; })}</div> : <div className="rounded-lg border border-dashed border-stone-300 bg-white py-20 text-center"><BookOpen aria-hidden="true" className="mx-auto size-8 text-stone-300" /><p className="mt-3 font-serif text-xl text-stone-700">Buku tidak ditemukan</p><p className="mt-1 text-sm text-stone-500">Coba ubah kata kunci atau filter pencarian.</p></div>}</div>;
}
function Catalog({ books, onBookSelect }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Semua genre');
  const [publisher, setPublisher] = useState('Semua penerbit');
  const genres = useMemo(() => ['Semua genre', ...new Set(books.map((book) => book.genre).filter(Boolean))], [books]);
  const publishers = useMemo(() => ['Semua penerbit', ...new Set(books.map((book) => book.penerbit).filter(Boolean))], [books]);
  const filteredBooks = books.filter((book) => { const needle = search.toLowerCase(); return (!needle || `${book.judul} ${book.penulis} ${book.penerbit}`.toLowerCase().includes(needle)) && (genre === 'Semua genre' || book.genre === genre) && (publisher === 'Semua penerbit' || book.penerbit === publisher); });
  return <><PageHeader eyebrow="Koleksi perpustakaan" title="Katalog buku" description="Cari buku berdasarkan judul, penulis, penerbit, atau genre." /><div className="mb-7 flex flex-col gap-3 rounded-xl border border-[#E5E0D8] bg-white p-3 shadow-sm sm:flex-row"><div className="relative flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul, penulis, atau penerbit" className="h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF7F2] pl-10 pr-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200" /></div><div className="w-full sm:w-44"><CustomDropdown value={genre} options={genres} onChange={setGenre} ariaLabel="Filter genre" /></div><div className="w-full sm:w-48"><CustomDropdown value={publisher} options={publishers} onChange={setPublisher} ariaLabel="Filter penerbit" /></div></div><BookGrid books={filteredBooks} onBookSelect={onBookSelect} showFilters={false} /></>;
}
function CustomDropdown({ value, options, onChange, placeholder = 'Pilih opsi', ariaLabel, disabled = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const normalizedOptions = options.map((option) => typeof option === 'string' ? { value: option, label: option } : option);
  const selected = normalizedOptions.find((option) => option.value === value);
  useEffect(() => {
    const close = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return <div ref={rootRef} className="relative">
    <button type="button" disabled={disabled} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }} className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2] px-3.5 text-left text-sm text-stone-800 shadow-sm outline-none transition hover:border-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-60">
      <span className={selected ? 'truncate' : 'truncate text-stone-400'}>{selected?.label || placeholder}</span>
      <ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div role="listbox" aria-label={ariaLabel || placeholder} className="absolute inset-x-0 top-[calc(100%+0.4rem)] z-20 max-h-60 overflow-y-auto rounded-lg border border-[#E5E0D8] bg-white p-1.5 shadow-[0_16px_40px_rgba(55,45,35,0.14)]">
      {normalizedOptions.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm transition ${option.value === value ? 'bg-[#F1E9DE] font-medium text-stone-900' : 'text-stone-600 hover:bg-[#FAF7F2] hover:text-stone-900'}`}>{option.label}</button>)}
    </div>}
  </div>;
}

function getAutomaticDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  return dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ModalShell({ title, eyebrow, onClose, children, footer, footerInsideForm = false }) {
  useEffect(() => { const handler = (event) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, [onClose]);
  const formChildren = isValidElement(children) && Array.isArray(children.props.children) ? children.props.children[0] : isValidElement(children) ? children.props.children : null;
  const formContent = footerInsideForm && isValidElement(children) ? cloneElement(children, { className: 'flex flex-col flex-1 min-h-0 overflow-hidden' }, formChildren, footer && <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-[#faf9f6] shrink-0">{footer}</div>) : null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="relative max-w-3xl w-full max-h-[85vh] flex flex-col bg-[#faf9f6] rounded-2xl shadow-2xl overflow-hidden"><div className="flex justify-between items-center px-6 py-4 border-b border-stone-200 bg-[#faf9f6] shrink-0"><div>{eyebrow && <p className="text-xs font-semibold tracking-wider uppercase text-stone-400">{eyebrow}</p>}<h2 id="modal-title" className="text-xl font-bold text-stone-800">{title}</h2></div><button type="button" aria-label="Tutup dialog" onClick={onClose} className="p-2 transition-colors rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-700"><X aria-hidden="true" className="size-4" /></button></div>{formContent || <><div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>{footer && <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-[#faf9f6] shrink-0">{footer}</div>}</>}</div></div>;
}
function DeleteBookModal({ book, onClose, onConfirm }) {
  if (!book) return null;
  return <ModalShell eyebrow="Koleksi" title="Hapus buku" onClose={onClose} footer={<div className="flex w-full justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100">Batal</button><button type="button" onClick={onConfirm} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800">Ya, Hapus</button></div>}><div className="space-y-4"><p className="text-sm leading-6 text-stone-600">Apakah Anda yakin ingin menghapus buku ini?</p><p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-800">{book.judul}</p></div></ModalShell>;
}

function AddBookModal({ onClose, onSave, onDelete, canDelete = false, book = null }) {
  const [form, setForm] = useState(() => book ? { judul: book.judul || '', penulis: book.penulis || '', penerbit: book.penerbit || '', genre: book.genre || '', stok: String(book.stok || 0), coverUrl: book.cover_url || book.coverUrl || '', isbn: book.isbn || book.ISBN || '', tanggalTerbit: book.tanggal_terbit || book.tanggalTerbit || '', jumlah_halaman: String(book.jumlah_halaman ?? book.halaman ?? ''), bahasa: book.bahasa || 'Indonesia', description: book.description || book.deskripsi || '' } : { judul: '', penulis: '', penerbit: '', genre: '', stok: '0', coverUrl: '', isbn: '', tanggalTerbit: '', jumlah_halaman: '', bahasa: 'Indonesia', description: '' });
  const [publishers, setPublishers] = useState(() => readCustomOptions(CUSTOM_PUBLISHERS_STORAGE_KEY, DEFAULT_PUBLISHERS, book?.penerbit));
  const [genres, setGenres] = useState(() => readCustomOptions(CUSTOM_GENRES_STORAGE_KEY, DEFAULT_GENRES, book?.genre));
  const [customPublisher, setCustomPublisher] = useState(false);
  const [customGenre, setCustomGenre] = useState(false);
  const [coverMethod, setCoverMethod] = useState(() => book?.cover_file ? 'upload' : 'url');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(() => book?.cover_url || book?.coverUrl || '');
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleCoverFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };
  const chooseOption = (field, value) => { if (value === '__new__') { if (field === 'penerbit') setCustomPublisher(true); if (field === 'genre') setCustomGenre(true); setForm((current) => ({ ...current, [field]: '' })); return; } if (field === 'penerbit') setCustomPublisher(false); if (field === 'genre') setCustomGenre(false); setForm((current) => ({ ...current, [field]: value })); };
  const addOption = (field, value) => {
    const cleanValue = value.trim();
    if (!cleanValue) return;
    const storageKey = field === 'penerbit' ? CUSTOM_PUBLISHERS_STORAGE_KEY : CUSTOM_GENRES_STORAGE_KEY;
    const defaults = field === 'penerbit' ? DEFAULT_PUBLISHERS : DEFAULT_GENRES;
    const currentOptions = field === 'penerbit' ? publishers : genres;
    const updatedOptions = [...new Set([...currentOptions, cleanValue])];
    const setOptions = field === 'penerbit' ? setPublishers : setGenres;
    setOptions(updatedOptions);
    writeCustomOptions(storageKey, updatedOptions.filter((option) => !defaults.includes(option)));
    setForm((current) => ({ ...current, [field]: cleanValue }));
    if (field === 'penerbit') setCustomPublisher(false);
    if (field === 'genre') setCustomGenre(false);
  };
  const submit = (event) => {
    event.preventDefault();
    if (form.genre.trim()) addOption('genre', form.genre);
    if (form.penerbit.trim()) addOption('penerbit', form.penerbit);
    onSave({ ...form, coverMethod, coverFile, coverPreview });
  };
  const inputClass = 'h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF7F2] px-3.5 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200';
  const coverField = <div className="sm:col-span-2 rounded-xl border border-[#E5E0D8] bg-white p-5"><span className="mb-3 block text-xs font-medium text-stone-700">Cover Buku</span><div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-stone-100 p-1.5"><button type="button" onClick={() => setCoverMethod('upload')} className={`rounded-md border px-3 py-2 text-xs font-medium transition ${coverMethod === 'upload' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 text-stone-600'}`}>Upload File (JPG/PNG)</button><button type="button" onClick={() => setCoverMethod('url')} className={`rounded-md border px-3 py-2 text-xs font-medium transition ${coverMethod === 'url' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 text-stone-600'}`}>Link URL External</button></div>{coverMethod === 'upload' ? <input type="file" accept="image/jpeg,image/png" onChange={handleCoverFile} className="inline-block w-[calc(100%-6rem)] align-middle text-xs text-stone-600" /> : <input type="url" name="coverUrl" value={form.coverUrl} onChange={(event) => { update(event); setCoverPreview(event.target.value); }} placeholder="https://contoh.com/cover.jpg" className={`${inputClass} inline-block w-[calc(100%-6rem)] align-middle`} />}{coverPreview && <img src={coverPreview} alt="Preview cover buku" className="mt-3 inline-block aspect-[2/3] h-36 w-24 shrink-0 rounded-md object-cover align-middle shadow-sm" onError={() => setCoverPreview('')} />}</div>;
  return <ModalShell footerInsideForm eyebrow="Koleksi" title={book ? 'Edit data buku' : 'Tambah buku'} onClose={onClose} footer={<><div>{canDelete && book && <button type="button" onClick={() => onDelete(book)} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50">Hapus Buku</button>}</div><div className="flex gap-3"><button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100">Batal</button><button type="submit" form="book-form" className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800">Simpan perubahan</button></div></>}><form id="book-form" onSubmit={submit}><div className="flex-1 min-h-0 overflow-y-auto p-6 grid gap-5 sm:grid-cols-2">{coverField}<label className="sm:col-span-2"><span className="mb-2 block text-xs font-medium text-stone-700">Judul Buku</span><input required type="text" name="judul" value={form.judul} onChange={update} className={inputClass} /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">Penulis</span><input required type="text" name="penulis" value={form.penulis} onChange={update} className={inputClass} /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">Stok</span><input required min="0" type="number" name="stok" value={form.stok} onChange={update} className={inputClass} /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">Penerbit</span>{customPublisher ? <div className="flex gap-2"><input required autoFocus name="penerbit" value={form.penerbit} onChange={update} onBlur={() => addOption('penerbit', form.penerbit)} placeholder="Tulis penerbit baru" className={inputClass} /><button type="button" onClick={() => addOption('penerbit', form.penerbit)} className="shrink-0 rounded-lg border border-[#E5E0D8] bg-transparent px-3 text-xs text-stone-600 transition hover:bg-white">Pilih list</button></div> : <CustomDropdown value={form.penerbit} options={[{ value: '', label: 'Pilih penerbit' }, ...publishers, { value: '__new__', label: '+ Tambah Penerbit Baru' }]} onChange={(value) => chooseOption('penerbit', value)} ariaLabel="Pilih penerbit" />}</label><label><span className="mb-2 block text-xs font-medium text-stone-700">Genre</span>{customGenre ? <div className="flex gap-2"><input required autoFocus name="genre" value={form.genre} onChange={update} onBlur={() => addOption('genre', form.genre)} placeholder="Tulis genre baru" className={inputClass} /><button type="button" onClick={() => addOption('genre', form.genre)} className="shrink-0 rounded-lg border border-[#E5E0D8] bg-transparent px-3 text-xs text-stone-600 transition hover:bg-white">Pilih list</button></div> : <CustomDropdown value={form.genre} options={[{ value: '', label: 'Pilih genre' }, ...genres, { value: '__new__', label: '+ Tambah Genre Baru' }]} onChange={(value) => chooseOption('genre', value)} ariaLabel="Pilih genre" />}</label><label className="hidden"><span className="mb-2 block text-xs font-medium text-stone-700">URL Cover</span><input type="url" name="coverUrl" value={form.coverUrl} onChange={update} placeholder="https://..." className={inputClass} /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">ISBN</span><input type="text" name="isbn" value={form.isbn} onChange={update} placeholder="978..." className={inputClass} /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">Tanggal Terbit</span><input type="text" name="tanggalTerbit" value={form.tanggalTerbit} onChange={update} placeholder="Bulan dan tahun" className={inputClass} /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">Jumlah Halaman</span><input min="0" type="number" name="jumlah_halaman" value={form.jumlah_halaman} onChange={update} placeholder="Contoh: 250" className={inputClass} /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">Bahasa</span><CustomDropdown value={form.bahasa} options={['Indonesia', 'Inggris']} onChange={(value) => setForm((current) => ({ ...current, bahasa: value }))} ariaLabel="Pilih bahasa buku" /></label><label className="sm:col-span-2"><span className="mb-2 block text-xs font-medium text-stone-700">Deskripsi Buku</span><textarea name="description" value={form.description} onChange={update} rows="4" className={`${inputClass} h-auto py-3`} /></label></div><div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#E5E0D8] bg-[#FAF7F2]/95 backdrop-blur px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-8"><button type="button" onClick={onClose} className="rounded-lg border border-[#E5E0D8] bg-transparent px-4 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-white">Batal</button><button type="submit" className="rounded-lg bg-[#1F1E1D] px-4 py-2.5 text-xs font-medium text-[#FAF7F2] transition hover:bg-stone-800">{canDelete && book && <button type="button" onClick={() => onDelete(book)} className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">Hapus Buku</button>}<button type="submit" className="rounded-lg bg-stone-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-800">{book ? 'Simpan perubahan' : 'Simpan buku'}</button></button></div></form></ModalShell>;
}
function TransactionModal({ books, users, initialBook = null, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ member: users[0]?.name || '', book: initialBook?.judul || books.find((item) => item.stok > 0)?.judul || '', manualMember: '', manualBook: '', due: getAutomaticDueDate() }));
  const [manualMember, setManualMember] = useState(false);
  const [manualBook, setManualBook] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const choose = (field, value) => { if (field === 'member') setManualMember(value === '__manual__'); if (field === 'book') setManualBook(value === '__manual__'); setForm((current) => ({ ...current, [field]: value === '__manual__' ? '' : value })); };
  const submit = (event) => { event.preventDefault(); onSave({ ...form, member: manualMember ? form.manualMember.trim() : form.member, book: manualBook ? form.manualBook.trim() : form.book }); };
  const inputClass = 'h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF7F2] px-3.5 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200';
  const memberOptions = [{ value: '', label: 'Pilih peminjam' }, ...users.map((user) => ({ value: user.name, label: user.name })), { value: '__manual__', label: '+ Isi Peminjam Manual' }];
  const bookOptions = [{ value: '', label: 'Pilih buku' }, ...books.filter((book) => book.stok > 0).map((book) => ({ value: book.judul, label: `${book.judul} · stok ${book.stok}` })), { value: '__manual__', label: '+ Isi Buku Manual' }];
  return <ModalShell eyebrow="Sirkulasi" title="Transaksi baru" onClose={onClose}><form onSubmit={submit}><div className="flex flex-col gap-5 p-5 sm:p-8"><div className="rounded-xl border border-[#E5E0D8] bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Aturan peminjaman</p><div className="mt-3 flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-[#F1E9DE] text-stone-700"><CalendarDays aria-hidden="true" className="size-4" /></span><div><p className="text-sm font-medium text-stone-900">Durasi peminjaman 7 hari</p><p className="mt-0.5 text-xs text-stone-500">Batas pengembalian dihitung otomatis dari hari ini.</p></div></div></div><label><span className="mb-2 block text-xs font-medium text-stone-700">Peminjam</span>{manualMember ? <div className="flex gap-2"><input required autoFocus name="manualMember" value={form.manualMember} onChange={update} placeholder="Tulis nama peminjam" className={inputClass} /><button type="button" onClick={() => setManualMember(false)} className="shrink-0 rounded-lg border border-[#E5E0D8] bg-transparent px-3 text-xs text-stone-600 transition hover:bg-white">Pilih list</button></div> : <CustomDropdown value={form.member} options={memberOptions} onChange={(value) => choose('member', value)} ariaLabel="Pilih peminjam" />}</label><label><span className="mb-2 block text-xs font-medium text-stone-700">Buku</span>{manualBook ? <div className="flex gap-2"><input required autoFocus name="manualBook" value={form.manualBook} onChange={update} placeholder="Tulis judul buku" className={inputClass} /><button type="button" onClick={() => setManualBook(false)} className="shrink-0 rounded-lg border border-[#E5E0D8] bg-transparent px-3 text-xs text-stone-600 transition hover:bg-white">Pilih list</button></div> : <CustomDropdown value={form.book} options={bookOptions} onChange={(value) => choose('book', value)} ariaLabel="Pilih buku" />}</label><div className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E0D8] bg-white px-4 py-3.5"><div><p className="text-xs font-medium text-stone-700">Batas Pengembalian</p><p className="mt-1 text-sm font-semibold text-stone-900">{form.due}</p></div><span className="rounded-full bg-[#F1E9DE] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#876a4c]">7 Hari · Otomatis</span></div></div><div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#E5E0D8] bg-[#FAF7F2]/95 backdrop-blur px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-8"><button type="button" onClick={onClose} className="rounded-lg border border-[#E5E0D8] bg-transparent px-4 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-white">Batal</button><button type="submit" className="rounded-lg bg-[#1F1E1D] px-4 py-2.5 text-xs font-medium text-[#FAF7F2] transition hover:bg-stone-800">Simpan transaksi</button></div></form></ModalShell>;
}
function BookDetailModalLegacy({ book, onClose, onBorrow, onEdit, onDelete, canDelete = false }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpandDescription, setCanExpandDescription] = useState(false);
  const descriptionRef = useRef(null);
  const description = book?.description || book?.deskripsi || 'Deskripsi buku belum diisi.';
  const available = Number(book?.stok) > 0 || book?.status === 'Tersedia';
  useEffect(() => {
    const element = descriptionRef.current;
    if (!element) return undefined;
    const measureDescription = () => {
      const hasThreeLines = element.scrollHeight > element.clientHeight + 1;
      setCanExpandDescription(description.length >= 180 && hasThreeLines);
    };
    measureDescription();
    window.addEventListener('resize', measureDescription);
    return () => window.removeEventListener('resize', measureDescription);
  }, [description]);
  if (!book) return null;
  const pageCount = book.jumlah_halaman ?? book.halaman ?? book.pages;
  const specifications = [['ISBN', book.isbn || book.ISBN || 'Belum diisi'], ['Tanggal terbit', book.tanggal_terbit || book.tanggalTerbit || 'Belum diisi'], ['Jumlah halaman', pageCount ? `${pageCount} halaman` : 'Belum diisi'], ['Bahasa', book.bahasa || 'Indonesia'], ['Stok tersedia', `${book.stok || 0} buku`]];
  return <ModalShell eyebrow="Detail koleksi" title={book.judul} onClose={onClose} footer={<div className="flex w-full flex-wrap justify-end gap-3"><button type="button" disabled={!available} onClick={() => onBorrow(book)} className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-semibold text-[#FAF7F2] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300">{available ? 'Pinjam Buku' : 'Stok Habis'}</button><button type="button" onClick={() => onEdit(book)} className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50">Edit Data</button>{canDelete && <button type="button" onClick={() => onDelete(book)} className="rounded-md border border-red-300 px-4 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-50">Hapus Buku</button>}</div>}><div className="grid grid-cols-1 gap-8 md:grid-cols-12"><div className="md:col-span-4"><div className="overflow-hidden rounded-lg shadow-[0_12px_28px_rgba(74,59,45,0.12)]"><BookCover book={book} large /></div></div><div className="min-w-0 md:col-span-8"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#f4eee6] px-2.5 py-1 text-[10px] font-medium text-[#876a4c]">{book.genre || 'Tanpa genre'}</span><StatusBadge tone={available ? 'success' : 'neutral'}>{available ? 'Tersedia' : 'Dipinjam'}</StatusBadge></div><h3 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.04em] text-stone-900">{book.judul}</h3><p className="mt-2 text-sm text-stone-500">{book.penulis} <span className="text-stone-300">·</span> {book.penerbit || 'Penerbit tidak tersedia'}</p><section className="mt-6 border-t border-stone-200 pt-5"><h4 className="font-serif text-lg text-stone-900">Deskripsi Buku</h4><p ref={descriptionRef} className={`mt-2 text-sm leading-6 text-stone-500 ${expanded ? '' : 'line-clamp-3'}`}>{description}</p>{canExpandDescription && <button type="button" onClick={() => setExpanded((current) => !current)} className="mt-2 text-xs font-semibold text-stone-800 underline underline-offset-4">{expanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}</button>}</section><section className="mt-6 border-t border-stone-200 pt-5"><h4 className="font-serif text-lg text-stone-900">Detail Spesifikasi</h4><dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">{specifications.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 border-b border-stone-100 pb-2.5"><dt className="text-stone-500">{label}</dt><dd className="text-right font-medium text-stone-800">{value}</dd></div>)}</dl></section></div></div><div className="flex justify-end border-t border-stone-200 px-5 py-4 md:px-8"><button type="button" onClick={onClose} className="rounded-lg bg-stone-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-800">Tutup</button></div></ModalShell>;
}

  function BookDetailModal({ book, onClose, onBorrow, onEdit, onDelete, canDelete = false }) {
  const [expanded, setExpanded] = useState(false);
  const description = book?.description || book?.deskripsi || 'Deskripsi buku belum diisi.';
  const available = Number(book?.stok) > 0 || book?.status === 'Tersedia';
  if (!book) return <BookDetailModalLegacy book={book} onClose={onClose} onBorrow={onBorrow} onEdit={onEdit} onDelete={onDelete} canDelete={canDelete} />;
  const pageCount = book.jumlah_halaman ?? book.halaman ?? book.pages;
  const specifications = [['ISBN', book.isbn || book.ISBN || 'Belum diisi'], ['Tanggal terbit', book.tanggal_terbit || book.tanggalTerbit || 'Belum diisi'], ['Jumlah halaman', pageCount ? `${pageCount} halaman` : 'Belum diisi'], ['Bahasa', book.bahasa || 'Indonesia'], ['Stok tersedia', `${book.stok || 0} buku`]];
  return <ModalShell title={book.judul} onClose={onClose}><div className="grid gap-6 md:grid-cols-3"><div className="flex flex-col gap-2.5"><div className="overflow-hidden rounded-xl border border-stone-200 bg-white"><BookCover book={book} large /></div><div className="flex flex-col gap-2.5"><button type="button" disabled={!available} onClick={() => onBorrow(book)} className="rounded-lg bg-stone-900 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300">{available ? 'Pinjam Buku' : 'Stok Habis'}</button><button type="button" onClick={() => onEdit(book)} className="rounded-lg border border-stone-300 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50">Edit Data</button>{canDelete && <button type="button" onClick={() => onDelete(book)} className="rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">Hapus Buku</button>}</div></div><div className="min-w-0 md:col-span-2"><section><h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">Deskripsi</h3><p className={`mt-3 text-sm leading-7 text-stone-600 ${expanded ? '' : 'line-clamp-3'}`}>{description}</p>{description.length >= 180 && <button type="button" onClick={() => setExpanded((current) => !current)} className="mt-2 text-xs font-semibold text-stone-800 underline underline-offset-4">{expanded ? 'Sembunyikan' : 'Lihat selengkapnya'}</button>}</section><section className="mt-8"><h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">Spesifikasi</h3><dl className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">{specifications.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><dt className="text-stone-500">{label}</dt><dd className="text-right font-medium text-stone-800">{value}</dd></div>)}</dl></section></div></div></ModalShell>;
  }

  function BooksManagement({ books, onAddBook, onExport, onBookSelect }) {
  return <><PageHeader eyebrow="Koleksi" title="Kelola buku" description="Kelola judul, penulis, penerbit, genre, stok, dan status buku." action={<button type="button" onClick={onAddBook} className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Tambah Buku</button>} /><BookGrid books={books} onBookSelect={onBookSelect} /><section className="hidden overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="flex flex-col gap-3 border-b border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="relative w-full sm:max-w-xs"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" /><input aria-label="Cari buku" placeholder="Cari koleksi" className="h-10 w-full rounded-md border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm outline-none focus:border-stone-400" /></div><button type="button" onClick={onExport} className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900"><ArrowDownToLine aria-hidden="true" className="size-4" /> Ekspor data</button></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Buku</th><th className="px-5 py-3 font-medium">Genre</th><th className="px-5 py-3 font-medium">Penerbit</th><th className="px-5 py-3 font-medium">Stok</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{books.map((book) => <tr key={book.id_buku} tabIndex="0" onClick={() => onBookSelect(book)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onBookSelect(book); }} className="cursor-pointer hover:bg-stone-50/60 focus:bg-stone-50 focus:outline-none"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`flex size-10 items-end rounded-sm bg-gradient-to-br ${book.cover || 'from-stone-300 to-stone-600'} p-1.5 text-[9px] font-semibold text-white`}>{book.initials || getInitials(book.judul)}</div><div><p className="font-medium text-stone-800">{book.judul}</p><p className="mt-0.5 text-xs text-stone-500">{book.penulis}</p></div></div></td><td className="px-5 py-4 text-stone-600">{book.genre}</td><td className="px-5 py-4 text-stone-600">{book.penerbit}</td><td className="px-5 py-4 text-stone-600">{book.stok}</td><td className="px-5 py-4"><StatusBadge tone={book.stok > 0 ? 'success' : 'danger'}>{book.stok > 0 ? 'Tersedia' : 'Dipinjam'}</StatusBadge></td></tr>)}</tbody></table></div></section></>;
}

function LoansManagement({ loans, books, onNewTransaction }) {
  return <><PageHeader eyebrow="Sirkulasi" title="Peminjaman & pengembalian" description="Catat transaksi peminjaman dan pantau batas pengembalian." action={<button type="button" onClick={onNewTransaction} className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Transaksi Baru</button>} /><div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Sedang dipinjam" value={loans.filter((loan) => loan.status === 'Dipinjam').length} detail="Transaksi aktif" icon={BookOpenCheck} accent="green" /><StatCard label="Jatuh tempo minggu ini" value={loans.filter((loan) => loan.status === 'Dipinjam' && loan.due !== '-').length} detail="Perlu ditindaklanjuti" icon={Clock3} accent="amber" /><StatCard label="Terlambat" value={loans.filter((loan) => loan.status === 'Terlambat').length} detail="Total transaksi terlambat" icon={CircleAlert} accent="rose" /></div><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Kode transaksi</th><th className="px-5 py-3 font-medium">Peminjam</th><th className="px-5 py-3 font-medium">Buku</th><th className="px-5 py-3 font-medium">Tanggal</th><th className="px-5 py-3 font-medium">Denda</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{loans.length ? loans.map((loan) => <tr key={loan.id}><td className="px-6 py-4 font-mono text-xs text-stone-600">{loan.code}</td><td className="px-5 py-4 font-medium text-stone-800">{loan.member}</td><td className="px-5 py-4 text-stone-600">{loan.book}</td><td className="px-5 py-4 text-stone-600">{loan.date}<span className="block text-xs text-stone-400">s/d {loan.due}</span></td><td className="px-5 py-4 text-stone-600">{formatRupiah(loan.fine)}</td><td className="px-5 py-4"><StatusBadge tone={loan.status === 'Terlambat' ? 'danger' : loan.status === 'Selesai' ? 'success' : 'warning'}>{loan.status}</StatusBadge></td></tr>) : <tr><td colSpan="6" className="px-6 py-12 text-center text-sm text-stone-500">Belum ada sirkulasi peminjaman</td></tr>}</tbody></table></div></section>{books.length === 0 && <p className="mt-4 text-sm text-stone-500">Belum ada data buku untuk transaksi.</p>}</>;
}

function FacilityPill({ label, value, tone }) {
  const styles = {
    success: 'border-[#c9dacd] bg-[#edf5ee] text-[#3e7251]',
    warning: 'border-[#ead9b8] bg-[#faf4e7] text-[#977333]',
    danger: 'border-[#e7caca] bg-[#fcf0f0] text-[#a25d5d]',
  };
  return <span className={`inline-flex items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${styles[tone]}`}><span>{label}</span><strong>{value}</strong></span>;
}

function FacilityEditModal({ facility, onClose, onSave }) {
  const [form, setForm] = useState({ good: String(facility.good), maintenance: String(facility.maintenance), broken: String(facility.broken) });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => { event.preventDefault(); onSave({ id: facility.id, good: Math.max(0, Number(form.good)), maintenance: Math.max(0, Number(form.maintenance)), broken: Math.max(0, Number(form.broken)) }); };
  const total = Number(form.good || 0) + Number(form.maintenance || 0) + Number(form.broken || 0);
  return <ModalShell eyebrow="Operasional" title={`Edit jumlah · ${facility.name}`} onClose={onClose}><form onSubmit={submit}><div className="flex flex-col gap-4 p-5"><p className="text-sm leading-6 text-stone-500">Perbarui jumlah unit sesuai kondisi fasilitas saat ini. Total unit akan dihitung otomatis.</p>{[['good', 'Baik'], ['maintenance', 'Perlu Perawatan'], ['broken', 'Rusak']].map(([name, label]) => <label key={name}><span className="mb-1.5 block text-xs font-medium text-stone-700">{label}</span><input required min="0" type="number" name={name} value={form[name]} onChange={update} className="h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200" /></label>)}<div className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-600">Total unit baru: <strong className="text-stone-900">{total}</strong></div></div><div className="mt-6 flex items-center justify-between border-t border-stone-200 px-5 pt-4 pb-4"><button type="button" onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50">Batal</button><button type="submit" className="rounded-lg bg-stone-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-800">Simpan perubahan</button></div></form></ModalShell>;
}

function FacilitiesManagement({ facilities, onEdit }) {
  const [selectedFacility, setSelectedFacility] = useState(null);
  return <><PageHeader eyebrow="Operasional" title="Fasilitas" description="Lihat kondisi setiap fasilitas tanpa membuka rincian unit yang rumit." /><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{facilities.map((facility) => { const total = facility.good + facility.maintenance + facility.broken; return <article key={facility.id} className="rounded-lg border border-stone-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700"><Building2 aria-hidden="true" className="size-5" strokeWidth={1.5} /></span><button type="button" onClick={() => setSelectedFacility(facility)} className="rounded-md border border-stone-200 px-2.5 py-1.5 text-[11px] font-medium text-stone-600 hover:border-stone-400 hover:bg-stone-50">Edit Jumlah</button></div><h2 className="mt-5 font-serif text-xl text-stone-900">{facility.name}</h2><p className="mt-1 text-sm text-stone-500">Total: <strong className="text-stone-800">{total}</strong> unit</p><div className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4"><FacilityPill label="Baik" value={facility.good} tone="success" /><FacilityPill label="Perlu Perawatan" value={facility.maintenance} tone="warning" /><FacilityPill label="Rusak" value={facility.broken} tone="danger" /></div></article>; })}</div>{selectedFacility && <FacilityEditModal facility={selectedFacility} onClose={() => setSelectedFacility(null)} onSave={(values) => { onEdit(values); setSelectedFacility(null); }} />}</>;
}

function StaffModal({ onClose, onSave, shiftOptions }) {
  const [form, setForm] = useState({ name: '', username: '', role: 'Pustakawan', shift: '' });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => { event.preventDefault(); onSave(form); };
  const inputClass = 'h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF7F2] px-3.5 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200';
  return <ModalShell eyebrow="Administrasi" title="Tambah karyawan" onClose={onClose}><form onSubmit={submit}><div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8"><label><span className="mb-2 block text-xs font-medium text-stone-700">Nama Lengkap</span><input required name="name" value={form.name} onChange={update} className={inputClass} /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">Username</span><input required name="username" value={form.username} onChange={update} className={inputClass} /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">Role</span><CustomDropdown value={form.role} options={['Pustakawan', 'Admin']} onChange={(value) => setForm((current) => ({ ...current, role: value }))} ariaLabel="Pilih role" /></label><label><span className="mb-2 block text-xs font-medium text-stone-700">Jadwal Shift</span><CustomDropdown value={form.shift} options={[{ value: '', label: 'Pilih shift' }, ...shiftOptions]} onChange={(value) => setForm((current) => ({ ...current, shift: value }))} ariaLabel="Pilih shift" /></label></div><div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#E5E0D8] bg-[#FAF7F2]/95 backdrop-blur px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-8"><button type="button" onClick={onClose} className="rounded-lg border border-[#E5E0D8] bg-transparent px-4 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-white">Batal</button><button type="submit" className="rounded-lg bg-[#1F1E1D] px-4 py-2.5 text-xs font-medium text-[#FAF7F2] transition hover:bg-stone-800">Simpan karyawan</button></div></form></ModalShell>;
}
function ShiftModal({ member, onClose, onSave, shiftOptions, onShiftOptionsChange }) {
  const savedShift = shiftOptions.some((option) => option.value === member.shift) ? member.shift : '';
  const [shift, setShift] = useState(savedShift);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftHours, setNewShiftHours] = useState('');
  const submit = (event) => { event.preventDefault(); if (shift) onSave(shift); };
  const addShift = () => {
    const name = newShiftName.trim();
    const hours = newShiftHours.trim();
    if (!name || !hours) return;
    const value = `${name} (${hours})`;
    if (shiftOptions.some((option) => option.value.toLowerCase() === value.toLowerCase())) return;
    const nextOptions = [...shiftOptions, { value, label: value }];
    onShiftOptionsChange(nextOptions);
    setShift(value);
    setNewShiftName('');
    setNewShiftHours('');
  };
  const removeShift = (value) => {
    const nextOptions = shiftOptions.filter((option) => option.value !== value);
    onShiftOptionsChange(nextOptions);
    if (shift === value) setShift('');
  };
  const inputClass = 'h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF7F2] px-3.5 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200';
  return <ModalShell eyebrow="Administrasi" title="Edit shift" onClose={onClose}><form onSubmit={submit}><div className="flex flex-col gap-5 p-5 sm:p-8"><div className="rounded-xl border border-[#E5E0D8] bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Karyawan</p><p className="mt-1 font-serif text-xl text-stone-900">{member.name}</p><p className="mt-1 text-xs text-stone-500">Jadwal ini menjadi acuan waktu masuk pada widget absensi.</p></div><label><span className="mb-2 block text-xs font-medium text-stone-700">Pilih jadwal shift</span><CustomDropdown value={shift} options={[{ value: '', label: 'Pilih shift' }, ...shiftOptions]} onChange={setShift} ariaLabel="Pilih shift" /></label><div className="rounded-xl border border-[#E5E0D8] bg-white p-4"><p className="text-xs font-semibold text-stone-800">Daftar shift</p><div className="mt-3 flex flex-col gap-2">{shiftOptions.map((option) => <div key={option.value} className="flex items-center justify-between gap-3 rounded-lg border border-stone-100 bg-[#FAF7F2] px-3 py-2"><button type="button" onClick={() => setShift(option.value)} className="min-w-0 flex-1 truncate text-left text-xs text-stone-700 hover:text-stone-950">{option.label}</button><button type="button" aria-label={`Hapus ${option.label}`} onClick={() => removeShift(option.value)} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[#a25d5d] transition hover:bg-[#fcf0f0]"><Trash2 aria-hidden="true" className="size-3.5" /> Hapus</button></div>)}</div></div><div className="rounded-xl border border-dashed border-stone-300 p-4"><p className="text-xs font-semibold text-stone-800">+ Tambah Shift Baru</p><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input value={newShiftName} onChange={(event) => setNewShiftName(event.target.value)} placeholder="Nama Shift" aria-label="Nama Shift" className={inputClass} /><input value={newShiftHours} onChange={(event) => setNewShiftHours(event.target.value)} placeholder="Jam, contoh 08.00 - 09.00" aria-label="Jam shift" className={inputClass} /><button type="button" onClick={addShift} className="rounded-lg bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] transition hover:bg-stone-800">Tambah</button></div></div></div><div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#E5E0D8] bg-[#FAF7F2]/95 backdrop-blur px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-8"><button type="button" onClick={onClose} className="rounded-lg border border-[#E5E0D8] bg-transparent px-4 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-white">Batal</button><button type="submit" className="rounded-lg bg-[#1F1E1D] px-4 py-2.5 text-xs font-medium text-[#FAF7F2] transition hover:bg-stone-800">Simpan shift</button></div></form></ModalShell>;
}
function StaffManagement({ staff, currentUser, onAddStaff, onEditShift }) {
  const orderedStaff = useMemo(() => sortStaff(staff), [staff]);
  const currentUsername = String(currentUser?.username || currentUser?.user_name || currentUser?.name || '').trim().toLowerCase();
  return <><PageHeader eyebrow="Administrasi" title="Karyawan & shift" description="Data pengguna internal, peran, dan jadwal shift." action={<button type="button" onClick={onAddStaff} className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Tambah karyawan</button>} /><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Nama</th><th className="px-5 py-3 font-medium">Username</th><th className="px-5 py-3 font-medium">Peran</th><th className="px-5 py-3 font-medium">Jadwal shift</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{orderedStaff.length ? orderedStaff.map((member) => <tr key={member.id}><td className="px-6 py-4 font-medium text-stone-800">{member.name}</td><td className="px-5 py-4 text-stone-600">@{member.username}</td><td className="px-5 py-4 text-stone-600">{member.role}</td><td className="px-5 py-4">{member.shift === 'Belum diatur' ? <button type="button" onClick={() => onEditShift(member)} className="inline-flex rounded-full border border-[#ead9b8] bg-[#faf4e7] px-2.5 py-1 text-[11px] font-medium text-[#977333] transition-colors hover:border-[#c9a765] hover:bg-[#f7eedb]">Atur Shift</button> : <div className="group inline-flex items-center gap-1.5"><StatusBadge tone="neutral">{formatShiftLabel(member.shift)}</StatusBadge><button type="button" aria-label={`Ubah jadwal shift ${member.name}`} onClick={() => onEditShift(member)} className="inline-flex size-6 items-center justify-center rounded-full text-stone-400 opacity-60 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:opacity-100 group-hover:opacity-100"><Pencil aria-hidden="true" className="size-3.5" /></button></div>}</td><td className="px-5 py-4"><StatusBadge tone={String(member.username || '').trim().toLowerCase() === currentUsername ? 'success' : 'neutral'}>{String(member.username || '').trim().toLowerCase() === currentUsername ? 'Aktif' : 'Tidak Aktif'}</StatusBadge></td></tr>) : <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-stone-500">Belum ada data karyawan/absensi</td></tr>}</tbody></table></div></section></>;
}

function AttendanceReport({ attendanceRecords }) {
  const rows = attendanceRecords.map((record) => [record.nama, record.tanggal, '08.00', record.jamMasuk || '-', record.status === 'Terlambat' ? 'Terlambat' : 'Tepat waktu']);
  const presentCount = attendanceRecords.filter((record) => record.status !== 'Terlambat').length;
  const lateCount = attendanceRecords.filter((record) => record.status === 'Terlambat').length;
  const attendanceRate = attendanceRecords.length ? `${Math.round((presentCount / attendanceRecords.length) * 100)}%` : '0%';
  const exportReport = () => downloadCsv('laporan-absensi.csv', ['Karyawan', 'Tanggal', 'Jadwal', 'Masuk aktual', 'Status'], rows);
  return <><PageHeader eyebrow="Administrasi" title="Laporan absensi" description="Rekap kehadiran karyawan berdasarkan jadwal shift." action={<button type="button" onClick={exportReport} className="flex items-center justify-center gap-2 rounded-md border border-stone-300 px-4 py-3 text-xs font-semibold text-stone-700 hover:bg-stone-50"><ArrowDownToLine aria-hidden="true" className="size-4" /> Unduh laporan</button>} /><div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Kehadiran tercatat" value={attendanceRate} detail={`${attendanceRecords.length} log absensi`} icon={Check} accent="green" /><StatCard label="Tepat waktu" value={presentCount} detail="Log tanpa keterlambatan" icon={Clock3} accent="stone" /><StatCard label="Terlambat" value={lateCount} detail="Perlu ditinjau" icon={CircleAlert} accent="rose" /></div><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="border-b border-stone-200 px-6 py-5"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Riwayat tersimpan</p><h2 className="mt-1 font-serif text-xl text-stone-900">Data absensi terbaru</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Karyawan</th><th className="px-5 py-3 font-medium">Tanggal</th><th className="px-5 py-3 font-medium">Jadwal</th><th className="px-5 py-3 font-medium">Masuk aktual</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{rows.length ? rows.map((row) => <tr key={`${row[0]}-${row[1]}`}><td className="px-6 py-4 font-medium text-stone-800">{row[0]}</td><td className="px-5 py-4 text-stone-600">{row[1]}</td><td className="px-5 py-4 text-stone-600">{row[2]} WIB</td><td className="px-5 py-4 text-stone-600">{row[3]} WIB</td><td className="px-5 py-4"><StatusBadge tone={row[4] === 'Terlambat' ? 'warning' : 'success'}>{row[4]}</StatusBadge></td></tr>) : <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-stone-500">Belum ada data karyawan/absensi</td></tr>}</tbody></table></div></section></>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);
  const role = Number(user?.id_role) || 3;
  const [activeView, setActiveView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [books, setBooks] = useState(() => {
    const savedBooks = readBookData();
    return savedBooks.length ? savedBooks : MOCK_BOOKS.map(normalizeBook).filter(Boolean);
  });
  const [users, setUsers] = useState(() => readRegisteredUsers(user));
  const [loans, setLoans] = useState(() => readLoanData());
  const [facilities, setFacilities] = useState(MOCK_FACILITIES);
  const [karyawan, setKaryawan] = useState(() => readStaffData(user));
  const [listShift, setListShift] = useState(() => readShiftOptions());
  const [attendanceRecords, setAttendanceRecords] = useState(() => readAttendanceData());
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [apiNotice, setApiNotice] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);
  const selectedBookFromState = useMemo(() => selectedBook ? books.find((book) => book.id_buku === selectedBook.id_buku) || selectedBook : null, [books, selectedBook]);
  const [transactionBook, setTransactionBook] = useState(null);
  const [detailBook, setDetailBook] = useState(null);
  const [shiftMember, setShiftMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const todayAttendanceRecords = useMemo(() => {
    const today = getLocalDateKey();
    return attendanceRecords.filter((record) => record.tanggal === today);
  }, [attendanceRecords]);

  useEffect(() => {
    if (books.length) writeBookData(books);
  }, [books]);

  useEffect(() => {
    if (!apiNotice) return undefined;
    const timer = window.setTimeout(() => {
      setApiNotice('');
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [apiNotice]);

  const loadBooks = useCallback(async () => {
    const savedBooks = readBookData();
    if (savedBooks.length) {
      setBooks(savedBooks);
      return;
    }
    setLoadingBooks(true);
    try {
      const response = await api.get('/buku');
      const result = Array.isArray(response.data) ? response.data : response.data?.data;
      if (!Array.isArray(result)) throw new Error('Format data tidak sesuai');
      setBooks(result.length ? result.map(normalizeBook).filter(Boolean) : MOCK_BOOKS.map(normalizeBook).filter(Boolean));
    } catch {
      const savedBooks = readBookData();
      setBooks(savedBooks.length ? savedBooks : MOCK_BOOKS.map(normalizeBook).filter(Boolean));
      setApiNotice(savedBooks.length ? 'Menampilkan katalog buku yang tersimpan di perangkat.' : 'Menampilkan data demo karena server katalog belum terhubung.');
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true });
      return;
    }
    const timer = window.setTimeout(loadBooks, 0);
    return () => window.clearTimeout(timer);
  }, [loadBooks, navigate]);

  useEffect(() => {
    const syncAttendance = (event) => {
      const today = getLocalDateKey();
      const records = Array.isArray(event.detail) ? normalizeAttendanceRecords(event.detail) : readAttendanceData();
      setAttendanceRecords(records.filter((record) => record.tanggal === today));
    };
    const syncStaff = () => {
      setKaryawan(readStaffData(user));
      setUsers(readRegisteredUsers(user));
    };
    const syncShiftOptions = (event) => setListShift(Array.isArray(event.detail) ? event.detail : readShiftOptions());
    const syncLoans = (event) => setLoans(Array.isArray(event.detail) ? event.detail.map(normalizeLoan).filter(Boolean) : readLoanData());
    const syncFromStorage = (event) => {
      if (!event.key || event.key === ATTENDANCE_STORAGE_KEY || event.key === LEGACY_ATTENDANCE_STORAGE_KEY) {
        const today = getLocalDateKey();
        setAttendanceRecords(readAttendanceData().filter((record) => record.tanggal === today));
      }
      if (!event.key || event.key === STAFF_STORAGE_KEY || event.key === USERS_STORAGE_KEY || event.key === USERS_DATA_STORAGE_KEY) syncStaff();
      if (!event.key || event.key === LOANS_STORAGE_KEY) setLoans(readLoanData());
      if (!event.key || event.key === SHIFT_STORAGE_KEY) setListShift(readShiftOptions());
    };
    window.addEventListener('absensi_data_updated', syncAttendance);
    window.addEventListener('karyawan_data_updated', syncStaff);
    window.addEventListener('shift_options_updated', syncShiftOptions);
    window.addEventListener('transaksi_peminjaman_updated', syncLoans);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('absensi_data_updated', syncAttendance);
      window.removeEventListener('karyawan_data_updated', syncStaff);
      window.removeEventListener('shift_options_updated', syncShiftOptions);
      window.removeEventListener('transaksi_peminjaman_updated', syncLoans);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, [user]);

  useEffect(() => {
    const today = getLocalDateKey();
    const lastAttendanceDate = window.localStorage.getItem(LAST_ATTENDANCE_DATE_STORAGE_KEY);
    if (lastAttendanceDate !== today) resetAttendanceData();
    window.localStorage.setItem(LAST_ATTENDANCE_DATE_STORAGE_KEY, today);
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };
  const openModal = (type) => { setModalType(type); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setModalType(null); setSelectedBook(null); setTransactionBook(null); setDetailBook(null); setShiftMember(null); };
  const saveBookToBackend = async (form, method = 'POST', id = null) => {
    const endpoint = `http://localhost:8080/api/buku${id ? `/${encodeURIComponent(id)}` : ''}`;
    const payload = { ...form, cover_url: form.coverUrl?.trim() || '' };
    const body = form.coverFile ? (() => { const data = new FormData(); Object.entries(payload).forEach(([key, value]) => { if (value !== undefined && key !== 'coverFile' && key !== 'coverPreview') data.append(key, String(value ?? '')); }); data.append('cover', form.coverFile); return data; })() : JSON.stringify(payload);
    const response = await fetch(endpoint, { method, headers: body instanceof FormData ? { Authorization: `Bearer ${getToken()}` } : { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body });
    if (!response.ok) throw new Error('Backend buku tidak merespons dengan sukses');
    return response.json().catch(() => null);
  };
  const handleAddBook = async (form) => {
    const title = form.judul.trim();
    try { await saveBookToBackend(form); } catch { setApiNotice('Buku disimpan lokal karena backend tidak tersedia.'); }
    const coverUrl = form.coverUrl.trim() || form.coverPreview || '';
    const description = form.description.trim();
    const book = normalizeBook({ id_buku: Date.now(), judul: title, penulis: form.penulis.trim(), penerbit: form.penerbit.trim(), genre: form.genre.trim(), isbn: form.isbn.trim(), tanggal_terbit: form.tanggalTerbit.trim(), tanggalTerbit: form.tanggalTerbit.trim(), jumlah_halaman: form.jumlah_halaman.trim(), halaman: form.jumlah_halaman.trim(), bahasa: form.bahasa, description, deskripsi: description, stok: Number(form.stok), status: Number(form.stok) > 0 ? 'Tersedia' : 'Dipinjam', initials: getInitials(title), coverUrl, cover_url: coverUrl });
    const updatedBooks = [...books, book];
    setBooks(updatedBooks);
    writeBookData(updatedBooks);
    setApiNotice('Buku baru ditambahkan ke daftar lokal.');
    closeModal();
  };
  const handleEditBook = async (form) => {
    try { await saveBookToBackend(form, 'PUT', detailBook?.id_buku); } catch { setApiNotice('Perubahan disimpan lokal karena backend tidak tersedia.'); }
    const coverUrl = form.coverUrl.trim() || form.coverPreview || '';
    const description = form.description.trim();
    const editedBook = normalizeBook({ ...detailBook, ...form, isbn: form.isbn.trim(), tanggal_terbit: form.tanggalTerbit.trim(), tanggalTerbit: form.tanggalTerbit.trim(), jumlah_halaman: form.jumlah_halaman.trim(), halaman: form.jumlah_halaman.trim(), bahasa: form.bahasa, description, deskripsi: description, coverUrl, cover_url: coverUrl, stok: Number(form.stok), status: Number(form.stok) > 0 ? 'Tersedia' : 'Dipinjam', initials: getInitials(form.judul.trim()) });
    const updatedBooks = books.map((book) => book.id_buku === editedBook.id_buku ? editedBook : book);
    setBooks(updatedBooks);
    writeBookData(updatedBooks);
    setSelectedBook(editedBook);
    setApiNotice('Data buku berhasil diperbarui.');
    closeModal();
  };
  const requestDeleteBook = (book) => setDeleteBook(book);
  const handleDeleteBook = () => {
    if (!deleteBook) return;
    const updatedBooks = books.filter((book) => book.id_buku !== deleteBook.id_buku);
    setBooks(updatedBooks);
    writeBookData(updatedBooks);
    setDeleteBook(null);
    closeModal();
    setApiNotice(`Buku ${deleteBook.judul} berhasil dihapus.`);
  };
  const handleNewTransaction = (form) => {
    const newLoan = { id: Date.now(), code: `TRX-${new Date().getFullYear()}-${String(loans.length + 1).padStart(4, '0')}`, member: form.member, book: form.book, date: formatTransactionDate(), due: form.due, status: 'Dipinjam', fine: 0 };
    const nextLoans = [newLoan, ...loans];
    setLoans(nextLoans);
    writeLoanData(nextLoans);
    setApiNotice('Transaksi baru ditambahkan ke daftar lokal.');
    closeModal();
  };
  const handleShiftOptionsChange = (nextOptions) => {
    setListShift(nextOptions);
    writeShiftOptions(nextOptions);
  };
  const handleEditShift = (member) => {
    setShiftMember(member);
    openModal('edit-shift');
  };
  const handleSaveShift = (shift) => {
    if (!shiftMember) return;
    const nextStaff = sortStaff(karyawan.map((member) => member.id === shiftMember.id ? { ...member, shift } : member));
    setKaryawan(nextStaff);
    setUsers((current) => current.map((member) => member.id === shiftMember.id ? { ...member, shift } : member));
    saveStaffData(nextStaff);
    setApiNotice('Jadwal shift berhasil diperbarui.');
    closeModal();
  };
  const handleAddStaff = (form) => {
    const newStaff = { id: Date.now(), ...form, name: form.name.trim(), username: form.username.trim(), shift: form.shift.trim(), status: 'Aktif' };
    const nextStaff = sortStaff([...karyawan, newStaff]);
    setKaryawan(nextStaff);
    setUsers((current) => sortStaff([...current.filter((member) => member.username !== newStaff.username), newStaff]));
    saveStaffData(nextStaff);
    setApiNotice('Karyawan baru berhasil ditambahkan.');
    closeModal();
  };
  const exportBooks = () => downloadCsv('data-buku.csv', ['Judul', 'Penulis', 'Penerbit', 'Genre', 'Stok', 'Status'], books.map((book) => [book.judul, book.penulis, book.penerbit, book.genre, book.stok, book.status]));
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const handleFacilityEdit = ({ id, good, maintenance, broken }) => {
    setFacilities((current) => current.map((facility) => facility.id === id ? { ...facility, good, maintenance, broken } : facility));
    setApiNotice('Jumlah kondisi fasilitas berhasil diperbarui.');
  };
  return <div className="flex min-h-svh bg-[#FAF7F2] font-sans text-stone-900"><Sidebar activeView={activeView} onViewChange={setActiveView} role={role} user={user} onLogout={handleLogout} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="min-w-0 flex-1"><MobileHeader onOpenMenu={() => setMobileOpen(true)} onLogout={handleLogout} user={user} /><main className="mx-auto max-w-[1480px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"><div className="mb-6 hidden items-center justify-between lg:flex"><p className="text-xs text-stone-500">{currentDate}</p><div className="flex items-center gap-3"><button type="button" aria-label="Muat ulang katalog" onClick={loadBooks} className="rounded-md p-2 text-stone-500 hover:bg-white hover:text-stone-900"><RefreshCw aria-hidden="true" className={`size-4 ${loadingBooks ? 'animate-spin' : ''}`} /></button><div className="flex items-center gap-2 border-l border-stone-200 pl-4"><span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-[#FAF7F2]">{getInitials(getDisplayName(user))}</span><span className="text-sm text-stone-700">{getDisplayName(user)}</span></div></div></div>{apiNotice && <div className="mb-5 flex items-center gap-3 rounded-md border border-[#ead9b8] bg-[#faf4e7] px-4 py-3 text-xs text-[#85672c]" role="status" aria-live="polite"><CircleAlert aria-hidden="true" className="size-4 shrink-0" /><span className="flex-1">{apiNotice}</span><button type="button" aria-label="Tutup notifikasi" onClick={() => setApiNotice('')} className="rounded p-1 text-[#85672c]/70 transition hover:bg-[#f3e6cc] hover:text-[#85672c]"><X aria-hidden="true" className="size-4" /></button></div>}{activeView === 'overview' && <Overview user={user} role={role} onViewChange={setActiveView} loans={loans} users={users} />}{activeView === 'catalog' && <Catalog books={books} onBookSelect={(book) => setSelectedBook(book)} />}{activeView === 'my-loans' && <><PageHeader eyebrow="Aktivitas pengguna" title="Peminjaman saya" description="Daftar buku yang sedang dipinjam dan riwayat transaksi." /><RecentLoans loans={loans} memberOnly /></>}{activeView === 'books' && <BooksManagement books={books} onAddBook={() => openModal('add-book')} onExport={exportBooks} onBookSelect={(book) => setSelectedBook(book)} />}{activeView === 'loans' && <LoansManagement loans={loans} books={books} onNewTransaction={() => openModal('transaction')} />}{activeView === 'facilities' && <FacilitiesManagement facilities={facilities} onEdit={handleFacilityEdit} />}{activeView === 'staff' && role === 1 && <StaffManagement staff={karyawan} currentUser={user} onEditShift={handleEditShift} onAddStaff={() => openModal('add-staff')} />}{activeView === 'attendance' && role === 1 && <AttendanceReport attendanceRecords={todayAttendanceRecords} />}{selectedBook && !isModalOpen && <BookDetailModal book={selectedBookFromState} canDelete={role !== 3} onDelete={requestDeleteBook} onClose={() => setSelectedBook(null)} onBorrow={(book) => { setSelectedBook(null); setTransactionBook(book); openModal('transaction'); }} onEdit={(book) => { setSelectedBook(null); setDetailBook(book); openModal('edit-book'); }} />}{isModalOpen && modalType === 'add-book' && <AddBookModal onClose={closeModal} onSave={handleAddBook} />}{isModalOpen && modalType === 'edit-book' && detailBook && <AddBookModal key={detailBook.id_buku} book={detailBook} canDelete={role !== 3} onDelete={requestDeleteBook} onClose={closeModal} onSave={handleEditBook} />}{isModalOpen && modalType === 'transaction' && <TransactionModal key={transactionBook?.id_buku || 'new'} books={books} users={users} initialBook={transactionBook} onClose={closeModal} onSave={handleNewTransaction} />}{isModalOpen && modalType === 'add-staff' && <StaffModal shiftOptions={listShift} onClose={closeModal} onSave={handleAddStaff} />}{isModalOpen && modalType === 'edit-shift' && shiftMember && <ShiftModal member={shiftMember} shiftOptions={listShift} onShiftOptionsChange={handleShiftOptionsChange} onClose={closeModal} onSave={handleSaveShift} />}</main>{deleteBook && <DeleteBookModal book={deleteBook} onClose={() => setDeleteBook(null)} onConfirm={handleDeleteBook} />}</div></div>;
}

