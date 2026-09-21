import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Clock3,
  FileBarChart,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import api from '../api/client';
import { clearSession, getToken, getUser } from '../utils/auth';

const MOCK_BOOKS = [
  { id_buku: 1, judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', penerbit: 'Lentera Dipantara', genre: 'Novel', stok: 5, status: 'Tersedia', initials: 'BM', description: 'Novel pembuka Tetralogi Buru tentang Minke, pendidikan, dan pergulatan manusia di tengah kolonialisme.', cover: 'from-[#8b6c54] via-[#b49a7d] to-[#d9c7ae]' },
  { id_buku: 2, judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', penerbit: 'Bentang Pustaka', genre: 'Drama', stok: 3, status: 'Tersedia', initials: 'LP', description: 'Kisah persahabatan sepuluh anak Belitung yang memperjuangkan pendidikan dan mimpi mereka.', cover: 'from-[#487b82] via-[#8fb4ad] to-[#d4dfd5]' },
  { id_buku: 3, judul: 'Filosofi Teras', penulis: 'Henry Manampiring', penerbit: 'Kompas', genre: 'Self-Improvement', stok: 2, status: 'Tersedia', initials: 'FT', description: 'Pengantar praktis untuk menerapkan filsafat Stoa dalam menghadapi tantangan kehidupan sehari-hari.', cover: 'from-[#967252] via-[#cfad87] to-[#e4d2b9]' },
  { id_buku: 4, judul: 'Laut Bercerita', penulis: 'Leila S. Chudori', penerbit: 'KPG', genre: 'Fiksi Sejarah', stok: 0, status: 'Dipinjam', initials: 'LB', description: 'Novel tentang kehilangan, persahabatan, dan ingatan keluarga dalam pusaran sejarah Indonesia.', cover: 'from-[#48595e] via-[#7c8d91] to-[#c0c8c4]' },
];

const MOCK_USERS = [
  { id: 1, name: 'Alya Prameswari', username: 'alya' },
  { id: 2, name: 'Raka Mahendra', username: 'raka' },
];

const MOCK_LOANS = [
  { id: 1, code: 'TRX-2026-0821', member: 'Alya Prameswari', book: 'Laut Bercerita', date: '18 Sep 2026', due: '25 Sep 2026', status: 'Dipinjam', fine: 0 },
  { id: 2, code: 'TRX-2026-0817', member: 'Raka Mahendra', book: 'Laskar Pelangi', date: '12 Sep 2026', due: '19 Sep 2026', status: 'Terlambat', fine: 15000 },
  { id: 3, code: 'TRX-2026-0810', member: 'Alya Prameswari', book: 'Filosofi Teras', date: '05 Sep 2026', due: '12 Sep 2026', status: 'Selesai', fine: 0 },
];

const MOCK_FACILITIES = [
  { id: 1, name: 'Ruang Baca Utama', good: 1, maintenance: 0, broken: 0 },
  { id: 2, name: 'Meja Baca Individual', good: 24, maintenance: 0, broken: 0 },
  { id: 3, name: 'Komputer Katalog', good: 4, maintenance: 1, broken: 1 },
  { id: 4, name: 'Loker Penitipan', good: 30, maintenance: 2, broken: 0 },
];

const MOCK_STAFF = [
  { id: 1, name: 'Admin Sistem', username: 'admin', role: 'Admin', shift: 'Administrasi', status: 'Aktif' },
  { id: 2, name: 'Sinta Maharani', username: 'sinta', role: 'Pustakawan', shift: 'Pagi · 08.00–16.00', status: 'Aktif' },
  { id: 3, name: 'Dimas Pratama', username: 'dimas', role: 'Pustakawan', shift: 'Siang · 12.00–20.00', status: 'Aktif' },
];

const ROLE_NAMES = { 1: 'Admin', 2: 'Pustakawan', 3: 'Pengunjung' };

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function getDisplayName(user) {
  if (user?.nama || user?.name) return user.nama || user.name;
  if (user?.username === 'admin') return 'Admin Sistem';
  return user?.username || 'Pengguna';
}

function getInitials(name = 'Pengguna') {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function readAttendanceData() {
  try {
    const saved = window.localStorage.getItem('absensi_data');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
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

function AttendanceWidget({ user }) {
  const displayName = getDisplayName(user);
  const currentRecord = readAttendanceData().find((record) => record.nama === displayName && record.tanggal === new Date().toISOString().slice(0, 10));
  const [clock, setClock] = useState(new Date());
  const [attendanceState, setAttendanceState] = useState(() => currentRecord?.jamKeluar ? 'exited' : currentRecord?.status === 'Terlambat' ? 'late' : currentRecord ? 'present' : 'idle');
  const [entryTime, setEntryTime] = useState(() => currentRecord?.jamMasuk || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const submitAttendance = async (type) => {
    const recordedAt = new Date();
    const today = recordedAt.toISOString().slice(0, 10);
    const time = recordedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const existingRecords = readAttendanceData();
    const currentRecord = existingRecords.find((record) => record.nama === displayName && record.tanggal === today);
    const isLate = recordedAt.getHours() > 8 || (recordedAt.getHours() === 8 && recordedAt.getMinutes() > 0);
    const nextRecord = type === 'masuk'
      ? { id: currentRecord?.id || Date.now(), nama: displayName, tanggal: today, jamMasuk: time, jamKeluar: '', status: isLate ? 'Terlambat' : 'Hadir' }
      : { ...(currentRecord || { id: Date.now(), nama: displayName, tanggal: today, jamMasuk: entryTime, status: 'Hadir' }), jamKeluar: time };
    const nextRecords = currentRecord ? existingRecords.map((record) => record.id === currentRecord.id ? nextRecord : record) : [...existingRecords, nextRecord];
    window.localStorage.setItem('absensi_data', JSON.stringify(nextRecords));
    window.dispatchEvent(new CustomEvent('absensi_data_updated', { detail: nextRecords }));
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

  return <section className="mb-8 rounded-lg border border-stone-200 bg-white p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-stone-900 text-[#FAF7F2]"><Clock3 aria-hidden="true" className="size-5" strokeWidth={1.5} /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-serif text-xl text-stone-900">Absensi pustakawan</h2><StatusBadge tone={badgeTone}>{badgeLabel}</StatusBadge></div><p className="mt-1 text-sm text-stone-500">Jadwal masuk: 08.00 WIB{entryTime && <span> · Masuk pukul {entryTime}</span>}</p></div></div><div className="flex flex-wrap items-center gap-3 sm:justify-end"><div className="mr-1 text-left sm:text-right"><p className="font-serif text-2xl text-stone-900">{clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p><p className="text-[11px] text-stone-500">Waktu sistem</p></div><button type="button" disabled={attendanceState === 'exited'} onClick={() => submitAttendance(hasEntered ? 'keluar' : 'masuk')} className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50">{actionLabel}</button></div></div>{message && <p className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500" role="status">{message}</p>}</section>;
}

function RecentLoans({ loans, memberOnly = false }) {
  const rows = memberOnly ? loans.slice(0, 2) : loans;
  return <section className="min-w-0 rounded-lg border border-stone-200 bg-white"><div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 sm:px-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Data sirkulasi</p><h2 className="mt-1 font-serif text-xl text-stone-900">Peminjaman terkini</h2></div><ArrowRight aria-hidden="true" className="size-4 text-stone-400" /></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-medium text-stone-500"><tr><th className="px-5 py-3 font-medium sm:px-6">Peminjam</th><th className="px-5 py-3 font-medium">Buku</th><th className="px-5 py-3 font-medium">Batas waktu</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{rows.map((loan) => <tr key={loan.id}><td className="px-5 py-4 sm:px-6"><p className="font-medium text-stone-800">{memberOnly ? 'Anda' : loan.member}</p><p className="mt-0.5 text-xs text-stone-500">{loan.code}</p></td><td className="px-5 py-4 text-stone-600">{loan.book}</td><td className="px-5 py-4 text-stone-600">{loan.due}</td><td className="px-5 py-4"><StatusBadge tone={loan.status === 'Terlambat' ? 'danger' : loan.status === 'Selesai' ? 'success' : 'warning'}>{loan.status}</StatusBadge></td></tr>)}</tbody></table></div></section>;
}

function Overview({ user, role, onViewChange, loans }) {
  const displayName = getDisplayName(user);
  const isMember = role === 3;
  return <>
    <div className="mb-8 flex flex-col gap-1 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Sistem informasi perpustakaan</p><h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.04em] text-stone-900 sm:text-[46px]">Dashboard Perpustakaan</h1></div><p className="text-sm text-stone-500">Pengguna aktif: <span className="font-medium text-stone-800">{displayName}</span></p></div>
    {(role === 1 || role === 2) && <AttendanceWidget user={user} />}
    {isMember ? <div className="grid gap-5 md:grid-cols-3"><StatCard label="Buku dipinjam" value="2" detail="1 jatuh tempo minggu ini" icon={BookOpenCheck} accent="stone" /><StatCard label="Total kunjungan" value="12" detail="Data tahun 2026" icon={CalendarDays} accent="green" /><StatCard label="Denda berjalan" value={formatRupiah(0)} detail="Tidak ada denda aktif" icon={ShieldCheck} accent="amber" /></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total koleksi buku" value="4" detail="Data katalog aktif" icon={BookOpen} accent="stone" /><StatCard label="Peminjaman aktif" value="2" detail="1 jatuh tempo minggu ini" icon={BookOpenCheck} accent="green" /><StatCard label="Denda terkumpul" value={formatRupiah(15000)} detail="Data bulan September 2026" icon={FileBarChart} accent="amber" /><StatCard label="Pengunjung terdaftar" value="2" detail="Data pengguna aktif" icon={Users} accent="rose" /></div>}
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]"><RecentLoans loans={loans} memberOnly={isMember} /><section className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Menu</p><h2 className="mt-1 font-serif text-xl text-stone-900">Akses cepat</h2></div><Settings2 aria-hidden="true" className="size-5 text-stone-400" /></div><div className="mt-6 flex flex-col gap-2">{(isMember ? [{ label: 'Buka katalog buku', view: 'catalog', icon: Search }, { label: 'Lihat peminjaman saya', view: 'my-loans', icon: CalendarDays }] : [{ label: 'Tambah buku', view: 'books', icon: Plus }, { label: 'Kelola peminjaman', view: 'loans', icon: BookOpenCheck }, ...(role === 1 ? [{ label: 'Lihat laporan absensi', view: 'attendance', icon: FileBarChart }] : [])]).map((item) => { const Icon = item.icon; return <button key={item.view} type="button" onClick={() => onViewChange(item.view)} className="flex items-center justify-between rounded-md border border-stone-200 px-3.5 py-3 text-left text-sm text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"><span className="flex items-center gap-3"><Icon aria-hidden="true" className="size-4 text-stone-500" />{item.label}</span><ArrowRight aria-hidden="true" className="size-4 text-stone-400" /></button>; })}</div></section></div>
  </>;
}

function BookCover({ book, large = false }) {
  return <div className={`relative flex ${large ? 'h-64' : 'h-48'} items-end overflow-hidden bg-gradient-to-br ${book.cover || 'from-stone-300 to-stone-600'} p-5`}>
    {book.coverUrl && <img src={book.coverUrl} alt={`Sampul ${book.judul}`} className="absolute inset-0 size-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,.18),transparent_60%)]" />
    <div className="relative border-l border-white/50 pl-3 text-white"><p className="font-serif text-3xl leading-none tracking-[-0.05em]">{book.initials || 'BK'}</p><p className="mt-2 max-w-[120px] text-[9px] uppercase tracking-[0.16em] text-white/75">Koleksi buku</p></div>
  </div>;
}

function Catalog({ books, onBookSelect }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Semua genre');
  const [publisher, setPublisher] = useState('Semua penerbit');
  const genres = useMemo(() => ['Semua genre', ...new Set(books.map((book) => book.genre).filter(Boolean))], [books]);
  const publishers = useMemo(() => ['Semua penerbit', ...new Set(books.map((book) => book.penerbit).filter(Boolean))], [books]);
  const filteredBooks = books.filter((book) => {
    const needle = search.toLowerCase();
    return (!needle || `${book.judul} ${book.penulis} ${book.penerbit}`.toLowerCase().includes(needle)) && (genre === 'Semua genre' || book.genre === genre) && (publisher === 'Semua penerbit' || book.penerbit === publisher);
  });
  return <><PageHeader eyebrow="Koleksi perpustakaan" title="Katalog buku" description="Cari buku berdasarkan judul, penulis, penerbit, atau genre." /><div className="mb-7 flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-3 sm:flex-row"><div className="relative flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul, penulis, atau penerbit" className="h-11 w-full rounded-md border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200" /></div><select value={genre} onChange={(event) => setGenre(event.target.value)} aria-label="Filter genre" className="h-11 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-stone-400"><option>{genres[0]}</option>{genres.slice(1).map((item) => <option key={item}>{item}</option>)}</select><select value={publisher} onChange={(event) => setPublisher(event.target.value)} aria-label="Filter penerbit" className="h-11 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-stone-400"><option>{publishers[0]}</option>{publishers.slice(1).map((item) => <option key={item}>{item}</option>)}</select></div><div className="mb-4 flex items-center justify-between"><p className="text-sm text-stone-500">Menampilkan <span className="font-medium text-stone-900">{filteredBooks.length}</span> dari {books.length} buku</p><span className="text-xs text-stone-400">Data katalog</span></div>{filteredBooks.length === 0 ? <div className="rounded-lg border border-dashed border-stone-300 bg-white py-20 text-center"><BookOpen aria-hidden="true" className="mx-auto size-8 text-stone-300" /><p className="mt-3 font-serif text-xl text-stone-700">Buku tidak ditemukan</p><p className="mt-1 text-sm text-stone-500">Ubah kata kunci atau filter.</p></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredBooks.map((book) => <article key={book.id_buku} className="group overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-lg hover:shadow-stone-200/50"><BookCover book={book} /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-serif text-xl leading-tight text-stone-900">{book.judul}</h2><p className="mt-1 text-sm text-stone-500">{book.penulis}</p></div><StatusBadge tone={book.stok > 0 ? 'success' : 'danger'}>{book.stok > 0 ? `${book.stok} tersedia` : 'Dipinjam'}</StatusBadge></div><p className="mt-3 text-xs text-stone-500">{book.penerbit}</p><div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4"><span className="text-[11px] text-stone-400">{book.genre}</span><button type="button" disabled={!book.stok} onClick={() => onBookSelect(book)} className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 transition hover:text-stone-500 disabled:cursor-not-allowed disabled:text-stone-400">{book.stok ? 'Pinjam buku' : 'Tidak tersedia'} <ArrowRight aria-hidden="true" className="size-3.5" /></button></div></div></article>)}</div>}</>;
}

function ModalShell({ title, eyebrow, onClose, children }) {
  useEffect(() => { const handler = (event) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, [onClose]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-stone-200 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">{eyebrow}</p><h2 id="modal-title" className="mt-1 font-serif text-2xl text-stone-900">{title}</h2></div><button type="button" aria-label="Tutup dialog" onClick={onClose} className="rounded-md p-2 text-stone-500 hover:bg-stone-100"><X aria-hidden="true" className="size-5" /></button></div>{children}</div></div>;
}

function BookingModal({ book, onClose, onConfirm }) {
  const [confirmed, setConfirmed] = useState(false);
  if (!book) return null;
  const confirm = () => { onConfirm(book); setConfirmed(true); };
  return <ModalShell eyebrow="Peminjaman" title={confirmed ? 'Peminjaman berhasil' : 'Konfirmasi peminjaman'} onClose={onClose}><div className="p-5"><div className="flex gap-4 rounded-md bg-stone-50 p-4"><div className="w-16 shrink-0 overflow-hidden rounded-sm"><BookCover book={book} /></div><div><h3 className="font-serif text-lg text-stone-900">{book.judul}</h3><p className="mt-1 text-sm text-stone-500">{book.penulis}</p><p className="mt-2 text-xs text-stone-500">Durasi: 7 hari</p></div></div>{confirmed ? <div className="mt-5 flex items-start gap-3 rounded-md border border-[#c9dacd] bg-[#edf5ee] p-4 text-sm leading-6 text-[#3e7251]"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>Transaksi peminjaman sudah ditambahkan. Batas pengembalian: 28 September 2026.</p></div> : <p className="mt-5 text-sm leading-6 text-stone-500">Periksa data buku sebelum menyimpan transaksi.</p>}</div><div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4">{confirmed ? <button type="button" onClick={onClose} className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-stone-800">Tutup</button> : <><button type="button" onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50">Batal</button><button type="button" onClick={confirm} className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-stone-800">Simpan peminjaman</button></>}</div></ModalShell>;
}

function AddBookModal({ onClose, onSave }) {
  const [form, setForm] = useState({ judul: '', penulis: '', penerbit: '', genre: '', stok: '0', coverUrl: '', description: '' });
  const [publishers, setPublishers] = useState(['Lentera Dipantara', 'Bentang Pustaka', 'Kompas', 'KPG']);
  const [genres, setGenres] = useState(['Novel', 'Drama', 'Self-Improvement', 'Fiksi Sejarah']);
  const [customPublisher, setCustomPublisher] = useState(false);
  const [customGenre, setCustomGenre] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const chooseOption = (field, event) => {
    const value = event.target.value;
    if (value === '__new__') {
      if (field === 'penerbit') setCustomPublisher(true);
      if (field === 'genre') setCustomGenre(true);
      setForm((current) => ({ ...current, [field]: '' }));
      return;
    }
    if (field === 'penerbit') setCustomPublisher(false);
    if (field === 'genre') setCustomGenre(false);
    setForm((current) => ({ ...current, [field]: value }));
  };
  const submit = (event) => { event.preventDefault(); onSave(form); };
  const addOption = (field, value) => {
    const cleanValue = value.trim();
    if (!cleanValue) return;
    if (field === 'penerbit') setPublishers((current) => [...new Set([...current, cleanValue])]);
    if (field === 'genre') setGenres((current) => [...new Set([...current, cleanValue])]);
  };
  const inputClass = 'h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200';
  return <ModalShell eyebrow="Koleksi" title="Tambah buku" onClose={onClose}><form onSubmit={submit}><div className="grid gap-4 p-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-medium text-stone-700">Judul Buku</span><input required type="text" name="judul" value={form.judul} onChange={update} className={inputClass} /></label><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Penulis</span><input required type="text" name="penulis" value={form.penulis} onChange={update} className={inputClass} /></label><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Stok</span><input required min="0" type="number" name="stok" value={form.stok} onChange={update} className={inputClass} /></label><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Penerbit</span>{customPublisher ? <div className="flex gap-2"><input required autoFocus name="penerbit" value={form.penerbit} onChange={update} placeholder="Tulis penerbit baru" className={inputClass} /><button type="button" onClick={() => { addOption('penerbit', form.penerbit); setCustomPublisher(false); }} className="shrink-0 rounded-md border border-stone-300 px-2 text-xs text-stone-600 hover:bg-stone-50">Pilih list</button></div> : <select required name="penerbit" value={form.penerbit} onChange={(event) => chooseOption('penerbit', event)} className={inputClass}><option value="">Pilih penerbit</option>{publishers.map((item) => <option key={item} value={item}>{item}</option>)}<option value="__new__">+ Tambah Penerbit Baru</option></select>}</label><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Genre</span>{customGenre ? <div className="flex gap-2"><input required autoFocus name="genre" value={form.genre} onChange={update} placeholder="Tulis genre baru" className={inputClass} /><button type="button" onClick={() => { addOption('genre', form.genre); setCustomGenre(false); }} className="shrink-0 rounded-md border border-stone-300 px-2 text-xs text-stone-600 hover:bg-stone-50">Pilih list</button></div> : <select required name="genre" value={form.genre} onChange={(event) => chooseOption('genre', event)} className={inputClass}><option value="">Pilih genre</option>{genres.map((item) => <option key={item} value={item}>{item}</option>)}<option value="__new__">+ Tambah Genre Baru</option></select>}</label><label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-medium text-stone-700">Deskripsi Buku <span className="font-normal text-stone-400">(opsional)</span></span><textarea name="description" value={form.description} onChange={update} rows="3" placeholder="Tulis ringkasan singkat buku" className={`${inputClass} h-auto py-2.5`} /></label><label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-medium text-stone-700">URL Gambar Cover Buku <span className="font-normal text-stone-400">(opsional)</span></span><input type="url" name="coverUrl" value={form.coverUrl} onChange={update} placeholder="https://contoh.com/cover-buku.jpg" className={inputClass} /></label></div><div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4"><button type="button" onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50">Batal</button><button type="submit" className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-stone-800">Simpan buku</button></div></form></ModalShell>;
}

function TransactionModal({ books, users, onClose, onSave }) {
  const [form, setForm] = useState({ member: users[0]?.name || '', book: books.find((item) => item.stok > 0)?.judul || '', manualMember: '', manualBook: '', due: '28 Sep 2026' });
  const [manualMember, setManualMember] = useState(false);
  const [manualBook, setManualBook] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const choose = (field, event) => {
    const value = event.target.value;
    if (field === 'member') setManualMember(value === '__manual__');
    if (field === 'book') setManualBook(value === '__manual__');
    setForm((current) => ({ ...current, [field]: value === '__manual__' ? '' : value }));
  };
  const submit = (event) => { event.preventDefault(); onSave({ ...form, member: manualMember ? form.manualMember.trim() : form.member, book: manualBook ? form.manualBook.trim() : form.book }); };
  const inputClass = 'h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200';
  return <ModalShell eyebrow="Sirkulasi" title="Transaksi baru" onClose={onClose}><form onSubmit={submit}><div className="flex flex-col gap-4 p-5"><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Peminjam</span>{manualMember ? <div className="flex gap-2"><input required autoFocus name="manualMember" value={form.manualMember} onChange={update} placeholder="Tulis nama peminjam" className={inputClass} /><button type="button" onClick={() => setManualMember(false)} className="shrink-0 rounded-md border border-stone-300 px-2 text-xs text-stone-600 hover:bg-stone-50">Pilih list</button></div> : <select required name="member" value={form.member} onChange={(event) => choose('member', event)} className={inputClass}><option value="">Pilih peminjam</option>{users.map((user) => <option key={user.id || user.name} value={user.name}>{user.name}</option>)}<option value="__manual__">+ Isi Peminjam Manual</option></select>}</label><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Buku</span>{manualBook ? <div className="flex gap-2"><input required autoFocus name="manualBook" value={form.manualBook} onChange={update} placeholder="Tulis judul buku" className={inputClass} /><button type="button" onClick={() => setManualBook(false)} className="shrink-0 rounded-md border border-stone-300 px-2 text-xs text-stone-600 hover:bg-stone-50">Pilih list</button></div> : <select required name="book" value={form.book} onChange={(event) => choose('book', event)} className={inputClass}><option value="">Pilih buku</option>{books.filter((book) => book.stok > 0).map((book) => <option key={book.id_buku} value={book.judul}>{book.judul} · stok {book.stok}</option>)}<option value="__manual__">+ Isi Buku Manual</option></select>}</label><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Batas pengembalian</span><input required name="due" value={form.due} onChange={update} className={inputClass} /></label></div><div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4"><button type="button" onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50">Batal</button><button type="submit" className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-stone-800">Simpan transaksi</button></div></form></ModalShell>;
}

function BookDetailModal({ book, onClose }) {
  if (!book) return null;
  return <ModalShell eyebrow="Detail koleksi" title={book.judul} onClose={onClose}><div className="p-5"><div className="grid gap-5 sm:grid-cols-[150px_1fr]"><div className="overflow-hidden rounded-md"><BookCover book={book} large /></div><div><p className="text-sm leading-6 text-stone-500">{book.description || 'Deskripsi buku belum tersedia.'}</p><dl className="mt-5 grid gap-3 text-sm"><div className="flex justify-between gap-4 border-b border-stone-100 pb-2"><dt className="text-stone-500">Penulis</dt><dd className="text-right font-medium text-stone-800">{book.penulis}</dd></div><div className="flex justify-between gap-4 border-b border-stone-100 pb-2"><dt className="text-stone-500">Penerbit</dt><dd className="text-right font-medium text-stone-800">{book.penerbit || '-'}</dd></div><div className="flex justify-between gap-4 border-b border-stone-100 pb-2"><dt className="text-stone-500">Genre</dt><dd className="text-right font-medium text-stone-800">{book.genre || '-'}</dd></div><div className="flex justify-between gap-4"><dt className="text-stone-500">Stok</dt><dd className="text-right font-medium text-stone-800">{book.stok} unit</dd></div></dl></div></div></div><div className="flex justify-end border-t border-stone-200 px-5 py-4"><button type="button" onClick={onClose} className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-stone-800">Tutup</button></div></ModalShell>;
}

function BooksManagement({ books, onAddBook, onExport, onBookSelect }) {
  return <><PageHeader eyebrow="Koleksi" title="Kelola buku" description="Kelola judul, penulis, penerbit, genre, stok, dan status buku." action={<button type="button" onClick={onAddBook} className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Tambah Buku</button>} /><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="flex flex-col gap-3 border-b border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="relative w-full sm:max-w-xs"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" /><input aria-label="Cari buku" placeholder="Cari koleksi" className="h-10 w-full rounded-md border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm outline-none focus:border-stone-400" /></div><button type="button" onClick={onExport} className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900"><ArrowDownToLine aria-hidden="true" className="size-4" /> Ekspor data</button></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Buku</th><th className="px-5 py-3 font-medium">Genre</th><th className="px-5 py-3 font-medium">Penerbit</th><th className="px-5 py-3 font-medium">Stok</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{books.map((book) => <tr key={book.id_buku} tabIndex="0" onClick={() => onBookSelect(book)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onBookSelect(book); }} className="cursor-pointer hover:bg-stone-50/60 focus:bg-stone-50 focus:outline-none"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`flex size-10 items-end rounded-sm bg-gradient-to-br ${book.cover || 'from-stone-300 to-stone-600'} p-1.5 text-[9px] font-semibold text-white`}>{book.initials || getInitials(book.judul)}</div><div><p className="font-medium text-stone-800">{book.judul}</p><p className="mt-0.5 text-xs text-stone-500">{book.penulis}</p></div></div></td><td className="px-5 py-4 text-stone-600">{book.genre}</td><td className="px-5 py-4 text-stone-600">{book.penerbit}</td><td className="px-5 py-4 text-stone-600">{book.stok}</td><td className="px-5 py-4"><StatusBadge tone={book.stok > 0 ? 'success' : 'danger'}>{book.stok > 0 ? 'Tersedia' : 'Dipinjam'}</StatusBadge></td></tr>)}</tbody></table></div></section></>;
}

function LoansManagement({ loans, books, onNewTransaction }) {
  return <><PageHeader eyebrow="Sirkulasi" title="Peminjaman & pengembalian" description="Catat transaksi peminjaman dan pantau batas pengembalian." action={<button type="button" onClick={onNewTransaction} className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Transaksi Baru</button>} /><div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Sedang dipinjam" value="2" detail="Transaksi aktif" icon={BookOpenCheck} accent="green" /><StatCard label="Jatuh tempo minggu ini" value="1" detail="Perlu ditindaklanjuti" icon={Clock3} accent="amber" /><StatCard label="Terlambat" value="1" detail="Total transaksi terlambat" icon={CircleAlert} accent="rose" /></div><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Kode transaksi</th><th className="px-5 py-3 font-medium">Peminjam</th><th className="px-5 py-3 font-medium">Buku</th><th className="px-5 py-3 font-medium">Tanggal</th><th className="px-5 py-3 font-medium">Denda</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{loans.map((loan) => <tr key={loan.id}><td className="px-6 py-4 font-mono text-xs text-stone-600">{loan.code}</td><td className="px-5 py-4 font-medium text-stone-800">{loan.member}</td><td className="px-5 py-4 text-stone-600">{loan.book}</td><td className="px-5 py-4 text-stone-600">{loan.date}<span className="block text-xs text-stone-400">s/d {loan.due}</span></td><td className="px-5 py-4 text-stone-600">{formatRupiah(loan.fine)}</td><td className="px-5 py-4"><StatusBadge tone={loan.status === 'Terlambat' ? 'danger' : loan.status === 'Selesai' ? 'success' : 'warning'}>{loan.status}</StatusBadge></td></tr>)}</tbody></table></div></section>{books.length === 0 && <p className="mt-4 text-sm text-stone-500">Belum ada data buku untuk transaksi.</p>}</>;
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
  return <ModalShell eyebrow="Operasional" title={`Edit jumlah · ${facility.name}`} onClose={onClose}><form onSubmit={submit}><div className="flex flex-col gap-4 p-5"><p className="text-sm leading-6 text-stone-500">Perbarui jumlah unit sesuai kondisi fasilitas saat ini. Total unit akan dihitung otomatis.</p>{[['good', 'Baik'], ['maintenance', 'Perlu Perawatan'], ['broken', 'Rusak']].map(([name, label]) => <label key={name}><span className="mb-1.5 block text-xs font-medium text-stone-700">{label}</span><input required min="0" type="number" name={name} value={form[name]} onChange={update} className="h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200" /></label>)}<div className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-600">Total unit baru: <strong className="text-stone-900">{total}</strong></div></div><div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4"><button type="button" onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50">Batal</button><button type="submit" className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-stone-800">Simpan perubahan</button></div></form></ModalShell>;
}

function FacilitiesManagement({ facilities, onEdit }) {
  const [selectedFacility, setSelectedFacility] = useState(null);
  return <><PageHeader eyebrow="Operasional" title="Fasilitas" description="Lihat kondisi setiap fasilitas tanpa membuka rincian unit yang rumit." /><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{facilities.map((facility) => { const total = facility.good + facility.maintenance + facility.broken; return <article key={facility.id} className="rounded-lg border border-stone-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700"><Building2 aria-hidden="true" className="size-5" strokeWidth={1.5} /></span><button type="button" onClick={() => setSelectedFacility(facility)} className="rounded-md border border-stone-200 px-2.5 py-1.5 text-[11px] font-medium text-stone-600 hover:border-stone-400 hover:bg-stone-50">Edit Jumlah</button></div><h2 className="mt-5 font-serif text-xl text-stone-900">{facility.name}</h2><p className="mt-1 text-sm text-stone-500">Total: <strong className="text-stone-800">{total}</strong> unit</p><div className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4"><FacilityPill label="Baik" value={facility.good} tone="success" /><FacilityPill label="Perlu Perawatan" value={facility.maintenance} tone="warning" /><FacilityPill label="Rusak" value={facility.broken} tone="danger" /></div></article>; })}</div>{selectedFacility && <FacilityEditModal facility={selectedFacility} onClose={() => setSelectedFacility(null)} onSave={(values) => { onEdit(values); setSelectedFacility(null); }} />}</>;
}

function StaffModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', username: '', role: 'Pustakawan', shift: '' });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => { event.preventDefault(); onSave(form); };
  const inputClass = 'h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200';
  return <ModalShell eyebrow="Administrasi" title="Tambah karyawan" onClose={onClose}><form onSubmit={submit}><div className="flex flex-col gap-4 p-5"><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Nama Lengkap</span><input required name="name" value={form.name} onChange={update} className={inputClass} /></label><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Username</span><input required name="username" value={form.username} onChange={update} className={inputClass} /></label><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Role</span><select name="role" value={form.role} onChange={update} className={inputClass}><option>Pustakawan</option><option>Admin</option></select></label><label><span className="mb-1.5 block text-xs font-medium text-stone-700">Jadwal Shift</span><input required name="shift" value={form.shift} onChange={update} placeholder="Pagi · 08.00–16.00" className={inputClass} /></label></div><div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4"><button type="button" onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50">Batal</button><button type="submit" className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-stone-800">Simpan karyawan</button></div></form></ModalShell>;
}

function StaffManagement({ staff, onAddStaff }) {
  return <><PageHeader eyebrow="Administrasi" title="Karyawan & shift" description="Data pengguna internal, peran, dan jadwal shift." action={<button type="button" onClick={onAddStaff} className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Tambah karyawan</button>} /><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Nama</th><th className="px-5 py-3 font-medium">Username</th><th className="px-5 py-3 font-medium">Peran</th><th className="px-5 py-3 font-medium">Jadwal shift</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{staff.map((member) => <tr key={member.id}><td className="px-6 py-4 font-medium text-stone-800">{member.name}</td><td className="px-5 py-4 text-stone-600">@{member.username}</td><td className="px-5 py-4 text-stone-600">{member.role}</td><td className="px-5 py-4 text-stone-600">{member.shift}</td><td className="px-5 py-4"><StatusBadge tone="success">{member.status}</StatusBadge></td></tr>)}</tbody></table></div></section></>;
}

function AttendanceReport({ attendanceRecords }) {
  const fallbackRows = [['Sinta Maharani', '21 Sep 2026', '08.00', '07.56', 'Tepat waktu'], ['Dimas Pratama', '21 Sep 2026', '12.00', '12.08', 'Terlambat'], ['Sinta Maharani', '20 Sep 2026', '08.00', '07.58', 'Tepat waktu']];
  const savedRows = attendanceRecords.map((record) => [record.nama, record.tanggal, '08.00', record.jamMasuk || '-', record.status === 'Terlambat' ? 'Terlambat' : 'Tepat waktu']);
  const rows = [...savedRows, ...fallbackRows.filter((row) => !attendanceRecords.some((record) => record.nama === row[0] && record.tanggal === row[1]))];
  const exportReport = () => downloadCsv('laporan-absensi.csv', ['Karyawan', 'Tanggal', 'Jadwal', 'Masuk aktual', 'Status'], rows);
  return <><PageHeader eyebrow="Administrasi" title="Laporan absensi" description="Rekap kehadiran karyawan berdasarkan jadwal shift." action={<button type="button" onClick={exportReport} className="flex items-center justify-center gap-2 rounded-md border border-stone-300 px-4 py-3 text-xs font-semibold text-stone-700 hover:bg-stone-50"><ArrowDownToLine aria-hidden="true" className="size-4" /> Unduh laporan</button>} /><div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Kehadiran bulan ini" value="96%" detail="Data September 2026" icon={Check} accent="green" /><StatCard label="Tepat waktu" value="82%" detail="Dari 124 jadwal" icon={Clock3} accent="stone" /><StatCard label="Tidak hadir" value="5" detail="Perlu ditinjau" icon={CircleAlert} accent="rose" /></div><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="border-b border-stone-200 px-6 py-5"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">September 2026</p><h2 className="mt-1 font-serif text-xl text-stone-900">Data absensi terbaru</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Karyawan</th><th className="px-5 py-3 font-medium">Tanggal</th><th className="px-5 py-3 font-medium">Jadwal</th><th className="px-5 py-3 font-medium">Masuk aktual</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{rows.map((row) => <tr key={`${row[0]}-${row[1]}`}><td className="px-6 py-4 font-medium text-stone-800">{row[0]}</td><td className="px-5 py-4 text-stone-600">{row[1]}</td><td className="px-5 py-4 text-stone-600">{row[2]} WIB</td><td className="px-5 py-4 text-stone-600">{row[3]} WIB</td><td className="px-5 py-4"><StatusBadge tone={row[4] === 'Terlambat' ? 'warning' : 'success'}>{row[4]}</StatusBadge></td></tr>)}</tbody></table></div></section></>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser() || { username: 'admin', id_role: 1 };
  const role = Number(user.id_role) || 3;
  const [activeView, setActiveView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [books, setBooks] = useState(MOCK_BOOKS);
  const [users] = useState(MOCK_USERS);
  const [loans, setLoans] = useState(MOCK_LOANS);
  const [facilities, setFacilities] = useState(MOCK_FACILITIES);
  const [karyawan, setKaryawan] = useState(MOCK_STAFF);
  const [attendanceRecords, setAttendanceRecords] = useState(() => readAttendanceData());
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [apiNotice, setApiNotice] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailBook, setDetailBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const loadBooks = useCallback(async () => {
    setLoadingBooks(true);
    setApiNotice('');
    try {
      const response = await api.get('/buku');
      const result = Array.isArray(response.data) ? response.data : response.data?.data;
      if (!Array.isArray(result)) throw new Error('Format data tidak sesuai');
      setBooks(result.length ? result : MOCK_BOOKS);
    } catch {
      setBooks(MOCK_BOOKS);
      setApiNotice('Menampilkan data demo karena server katalog belum terhubung.');
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
    const syncAttendance = (event) => setAttendanceRecords(Array.isArray(event.detail) ? event.detail : readAttendanceData());
    const syncFromStorage = () => setAttendanceRecords(readAttendanceData());
    window.addEventListener('absensi_data_updated', syncAttendance);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('absensi_data_updated', syncAttendance);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const handleLogout = () => { clearSession(); navigate('/login', { replace: true }); };
  const openModal = (type) => { setModalType(type); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setModalType(null); };
  const handleAddBook = (form) => {
    const title = form.judul.trim();
    const book = { id_buku: Date.now(), judul: title, penulis: form.penulis.trim(), penerbit: form.penerbit.trim(), genre: form.genre.trim(), description: form.description.trim(), stok: Number(form.stok), status: Number(form.stok) > 0 ? 'Tersedia' : 'Dipinjam', initials: getInitials(title), coverUrl: form.coverUrl.trim(), cover: 'from-[#74604e] via-[#a58b70] to-[#d3c1a7]' };
    setBooks((current) => [...current, book]);
    setApiNotice('Buku baru ditambahkan ke daftar lokal.');
    closeModal();
  };
  const handleNewTransaction = (form) => {
    setLoans((current) => [{ id: Date.now(), code: `TRX-2026-${String(current.length + 822).padStart(4, '0')}`, member: form.member, book: form.book, date: '21 Sep 2026', due: form.due, status: 'Dipinjam', fine: 0 }, ...current]);
    setApiNotice('Transaksi baru ditambahkan ke daftar lokal.');
    closeModal();
  };
  const handleAddStaff = (form) => {
    setKaryawan((current) => [...current, { id: Date.now(), ...form, status: 'Aktif' }]);
    setApiNotice('Karyawan baru berhasil ditambahkan.');
    closeModal();
  };
  const exportBooks = () => downloadCsv('data-buku.csv', ['Judul', 'Penulis', 'Penerbit', 'Genre', 'Stok', 'Status'], books.map((book) => [book.judul, book.penulis, book.penerbit, book.genre, book.stok, book.status]));
  const handleFacilityEdit = ({ id, good, maintenance, broken }) => {
    setFacilities((current) => current.map((facility) => facility.id === id ? { ...facility, good, maintenance, broken } : facility));
    setApiNotice('Jumlah kondisi fasilitas berhasil diperbarui.');
  };
  const handleBooking = (book) => setLoans((current) => [{ id: Date.now(), code: `TRX-2026-${String(current.length + 82).padStart(4, '0')}`, member: getDisplayName(user), book: book.judul, date: '21 Sep 2026', due: '28 Sep 2026', status: 'Dipinjam', fine: 0 }, ...current]);

  return <div className="flex min-h-svh bg-[#FAF7F2] font-sans text-stone-900"><Sidebar activeView={activeView} onViewChange={setActiveView} role={role} user={user} onLogout={handleLogout} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="min-w-0 flex-1"><MobileHeader onOpenMenu={() => setMobileOpen(true)} onLogout={handleLogout} user={user} /><main className="mx-auto max-w-[1480px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"><div className="mb-6 hidden items-center justify-between lg:flex"><p className="text-xs text-stone-500">Senin, 21 September 2026</p><div className="flex items-center gap-3"><button type="button" aria-label="Muat ulang katalog" onClick={loadBooks} className="rounded-md p-2 text-stone-500 hover:bg-white hover:text-stone-900"><RefreshCw aria-hidden="true" className={`size-4 ${loadingBooks ? 'animate-spin' : ''}`} /></button><div className="flex items-center gap-2 border-l border-stone-200 pl-4"><span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-[#FAF7F2]">{getInitials(getDisplayName(user))}</span><span className="text-sm text-stone-700">{getDisplayName(user)}</span></div></div></div>{apiNotice && <div className="mb-5 flex items-center gap-2 rounded-md border border-[#ead9b8] bg-[#faf4e7] px-4 py-3 text-xs text-[#85672c]" role="status"><CircleAlert aria-hidden="true" className="size-4 shrink-0" />{apiNotice}</div>}{activeView === 'overview' && <Overview user={user} role={role} onViewChange={setActiveView} loans={loans} />}{activeView === 'catalog' && <Catalog books={books} onBookSelect={setSelectedBook} />}{activeView === 'my-loans' && <><PageHeader eyebrow="Aktivitas pengguna" title="Peminjaman saya" description="Daftar buku yang sedang dipinjam dan riwayat transaksi." /><RecentLoans loans={loans} memberOnly /></>}{activeView === 'books' && <BooksManagement books={books} onAddBook={() => openModal('add-book')} onExport={exportBooks} onBookSelect={setDetailBook} />}{activeView === 'loans' && <LoansManagement loans={loans} books={books} onNewTransaction={() => openModal('transaction')} />}{activeView === 'facilities' && <FacilitiesManagement facilities={facilities} onEdit={handleFacilityEdit} />}{activeView === 'staff' && role === 1 && <StaffManagement staff={karyawan} onAddStaff={() => openModal('add-staff')} />}{activeView === 'attendance' && role === 1 && <AttendanceReport attendanceRecords={attendanceRecords} />}</main>{detailBook && <BookDetailModal book={detailBook} onClose={() => setDetailBook(null)} />}{isModalOpen && modalType === 'add-staff' && <StaffModal onClose={closeModal} onSave={handleAddStaff} />}</div><BookingModal book={selectedBook} onClose={() => setSelectedBook(null)} onConfirm={handleBooking} />{isModalOpen && modalType === 'add-book' && <AddBookModal onClose={closeModal} onSave={handleAddBook} />}{isModalOpen && modalType === 'transaction' && <TransactionModal books={books} users={users} onClose={closeModal} onSave={handleNewTransaction} />}</div>;
}

