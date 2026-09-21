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
  ChevronDown,
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
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import api from '../api/client';
import { clearSession, getToken, getUser } from '../utils/auth';

const MOCK_BOOKS = [
  {
    id_buku: 1,
    judul: 'Filosofi Teras',
    penulis: 'Henry Manampiring',
    deskripsi: 'Belajar menjadi lebih tenang dan tangguh melalui filsafat Stoa.',
    genre: 'Pengembangan Diri',
    penerbit: 'Kompas',
    stok: 8,
    cover: 'from-[#d8c6ad] via-[#b79b79] to-[#7d6249]',
    initials: 'FT',
  },
  {
    id_buku: 2,
    judul: 'Laut Bercerita',
    penulis: 'Leila S. Chudori',
    deskripsi: 'Sebuah kisah tentang kehilangan, keluarga, dan ingatan yang bertahan.',
    genre: 'Fiksi',
    penerbit: 'Kepustakaan Populer Gramedia',
    stok: 3,
    cover: 'from-[#7c8d91] via-[#48595e] to-[#27383d]',
    initials: 'LB',
  },
  {
    id_buku: 3,
    judul: 'Atomic Habits',
    penulis: 'James Clear',
    deskripsi: 'Perubahan kecil yang konsisten untuk hasil besar dalam kehidupan sehari-hari.',
    genre: 'Pengembangan Diri',
    penerbit: 'Gramedia Pustaka Utama',
    stok: 0,
    cover: 'from-[#d3b7a7] via-[#ab816b] to-[#6d4c3e]',
    initials: 'AH',
  },
  {
    id_buku: 4,
    judul: 'Sapiens',
    penulis: 'Yuval Noah Harari',
    deskripsi: 'Riwayat singkat umat manusia dan gagasan yang membentuk peradaban.',
    genre: 'Sejarah',
    penerbit: 'Kepustakaan Populer Gramedia',
    stok: 5,
    cover: 'from-[#b9b79f] via-[#83846c] to-[#4e5042]',
    initials: 'SP',
  },
  {
    id_buku: 5,
    judul: 'Pulang',
    penulis: 'Leila S. Chudori',
    deskripsi: 'Novel tentang rumah, perjalanan pulang, dan sejarah yang tak pernah selesai.',
    genre: 'Fiksi',
    penerbit: 'Kepustakaan Populer Gramedia',
    stok: 6,
    cover: 'from-[#c9b2a4] via-[#a87968] to-[#69473e]',
    initials: 'PL',
  },
  {
    id_buku: 6,
    judul: 'The Design of Everyday Things',
    penulis: 'Don Norman',
    deskripsi: 'Memahami bagaimana desain yang baik membuat hidup terasa lebih mudah.',
    genre: 'Desain',
    penerbit: 'Basic Books',
    stok: 2,
    cover: 'from-[#c4c0ad] via-[#908b73] to-[#5e5a48]',
    initials: 'DO',
  },
];

const MOCK_LOANS = [
  { id: 1, code: 'TRX-2026-0821', member: 'Alya Prameswari', book: 'Laut Bercerita', date: '18 Sep 2026', due: '25 Sep 2026', status: 'Dipinjam', fine: 0 },
  { id: 2, code: 'TRX-2026-0817', member: 'Raka Mahendra', book: 'Sapiens', date: '12 Sep 2026', due: '19 Sep 2026', status: 'Terlambat', fine: 15000 },
  { id: 3, code: 'TRX-2026-0810', member: 'Nadia Putri', book: 'Atomic Habits', date: '05 Sep 2026', due: '12 Sep 2026', status: 'Selesai', fine: 0 },
];

const MOCK_FACILITIES = [
  { id: 1, name: 'Ruang Baca Utama', condition: 'Baik', quantity: 1 },
  { id: 2, name: 'Meja Baca Individual', condition: 'Baik', quantity: 24 },
  { id: 3, name: 'Komputer Katalog', condition: 'Perlu perawatan', quantity: 6 },
  { id: 4, name: 'Loker Penitipan', condition: 'Baik', quantity: 32 },
];

const MOCK_STAFF = [
  { id: 1, name: 'Sinta Maharani', username: 'sinta.m', role: 'Pustakawan', shift: 'Pagi · 08.00–16.00', status: 'Aktif' },
  { id: 2, name: 'Dimas Pratama', username: 'dimas.p', role: 'Pustakawan', shift: 'Siang · 12.00–20.00', status: 'Aktif' },
  { id: 3, name: 'Rani Kusuma', username: 'rani.k', role: 'Petugas', shift: 'Pagi · 08.00–16.00', status: 'Cuti' },
];

const ROLE_NAMES = { 1: 'Administrator', 2: 'Pustakawan', 3: 'Anggota' };

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function getInitials(name = 'Pengguna') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
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
      {!compact && (
        <span className="font-serif text-[13px] leading-snug tracking-[0.13em] text-stone-900">
          PERPUSTAKAAN
          <span className="block">DIGITAL</span>
        </span>
      )}
    </div>
  );
}

function Sidebar({ activeView, onViewChange, role, onLogout, mobileOpen, onClose }) {
  const isAdmin = role === 1;
  const items = [
    { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
    ...(role === 3 ? [{ id: 'catalog', label: 'Katalog Buku', icon: Library }] : []),
    ...(role !== 3 ? [
      { id: 'books', label: 'Kelola Buku', icon: BookOpen },
      { id: 'loans', label: 'Peminjaman', icon: BookOpenCheck },
      { id: 'facilities', label: 'Fasilitas', icon: Building2 },
    ] : []),
    ...(isAdmin ? [
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
          <button type="button" aria-label="Tutup menu" onClick={onClose} className="rounded-md p-2 text-stone-500 hover:bg-stone-100 lg:hidden">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="mt-10 flex flex-1 flex-col">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">Menu utama</p>
          <nav aria-label="Navigasi dashboard" className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onViewChange(item.id); onClose(); }}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${active ? 'bg-stone-900 text-[#FAF7F2]' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}
                >
                  <Icon aria-hidden="true" className="size-[17px]" strokeWidth={1.6} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-stone-200 pt-5">
          <div className="mb-4 flex items-center gap-3 px-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-stone-100 font-serif text-sm text-stone-700">{getInitials(getUser()?.username)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-stone-900">{getUser()?.username || 'Pengguna'}</p>
              <p className="truncate text-xs text-stone-500">{ROLE_NAMES[role]}</p>
            </div>
          </div>
          <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-stone-500 transition-colors hover:bg-red-50 hover:text-red-700">
            <LogOut aria-hidden="true" className="size-[17px]" strokeWidth={1.6} />
            Keluar dari akun
          </button>
        </div>
      </aside>
    </>
  );
}

function MobileHeader({ onOpenMenu, onLogout, user }) {
  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 lg:hidden">
      <button type="button" aria-label="Buka menu navigasi" onClick={onOpenMenu} className="rounded-md p-2 text-stone-700 hover:bg-stone-100">
        <Menu aria-hidden="true" className="size-5" />
      </button>
      <LibraryMark compact />
      <button type="button" aria-label="Keluar" onClick={onLogout} className="rounded-md p-2 text-stone-600 hover:bg-red-50 hover:text-red-700">
        <LogOut aria-hidden="true" className="size-5" />
      </button>
      <span className="sr-only">Akun {user?.username}</span>
    </header>
  );
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">{eyebrow}</p>
        <h1 className="font-serif text-4xl font-normal tracking-[-0.04em] text-stone-900 sm:text-[46px]">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500">{description}</p>}
      </div>
      {action}
    </header>
  );
}

function StatCard({ label, value, detail, icon: Icon, accent = 'stone' }) {
  const iconStyles = {
    stone: 'bg-stone-100 text-stone-700',
    green: 'bg-[#edf5ee] text-[#4c7e5b]',
    amber: 'bg-[#faf4e7] text-[#977333]',
    rose: 'bg-[#fcf0f0] text-[#a25d5d]',
  };

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-stone-500">{label}</p>
        <span className={`flex size-9 items-center justify-center rounded-md ${iconStyles[accent]}`}><Icon aria-hidden="true" className="size-[17px]" strokeWidth={1.5} /></span>
      </div>
      <p className="mt-5 font-serif text-[30px] leading-none tracking-[-0.03em] text-stone-900">{value}</p>
      <p className="mt-2 text-xs text-stone-500">{detail}</p>
    </article>
  );
}

function AttendanceWidget({ onAttendance }) {
  const [clock, setClock] = useState(new Date());
  const [attendanceState, setAttendanceState] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const submitAttendance = async (type) => {
    setAttendanceState('loading');
    setMessage('');
    try {
      await api.post('/api/absensi', { tipe: type, waktu: new Date().toISOString() });
      setMessage(type === 'masuk' ? 'Absensi masuk berhasil dicatat.' : 'Absensi keluar berhasil dicatat.');
      setAttendanceState(type === 'masuk' ? 'entered' : 'exited');
      onAttendance?.(type);
    } catch {
      setMessage('Mode demo: absensi dicatat di tampilan ini.');
      setAttendanceState(type === 'masuk' ? 'entered' : 'exited');
      onAttendance?.(type);
    }
  };

  const isLate = clock.getHours() >= 8 && clock.getMinutes() > 0;
  const isEntered = attendanceState === 'entered';

  return (
    <section className="mb-8 rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-stone-900 text-[#FAF7F2]"><Clock3 aria-hidden="true" className="size-5" strokeWidth={1.5} /></span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-xl text-stone-900">Absensi hari ini</h2>
              <StatusBadge tone={isLate ? 'danger' : 'success'}>{isLate ? 'Terlambat' : 'Tepat waktu'}</StatusBadge>
            </div>
            <p className="mt-1 text-sm text-stone-500">Shift Pagi · Jadwal masuk 08.00 WIB</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div className="mr-1 text-left sm:text-right">
            <p className="font-serif text-2xl text-stone-900">{clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-[11px] text-stone-500">Masuk aktual {isEntered ? 'tercatat' : 'belum tercatat'}</p>
          </div>
          <button type="button" disabled={attendanceState === 'loading' || isEntered} onClick={() => submitAttendance('masuk')} className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50">
            {isEntered ? 'Sudah absen masuk' : 'Absen masuk'}
          </button>
          <button type="button" disabled={attendanceState === 'loading' || !isEntered || attendanceState === 'exited'} onClick={() => submitAttendance('keluar')} className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50">
            {attendanceState === 'exited' ? 'Sudah absen keluar' : 'Absen keluar'}
          </button>
        </div>
      </div>
      {message && <p className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500" role="status">{message}</p>}
    </section>
  );
}

function WelcomePanel({ user, role, onCatalog }) {
  const isMember = role === 3;
  return (
    <section className="mb-8 flex flex-col justify-between gap-7 rounded-lg bg-stone-900 p-6 text-[#FAF7F2] sm:p-8 lg:flex-row lg:items-end">
      <div>
        <p className="mb-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-300"><Sparkles aria-hidden="true" className="size-3" /> Ruang baca Anda</p>
        <h1 className="max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Selamat datang, {user?.username || 'Pengguna'}.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-stone-300">{isMember ? 'Temukan bacaan berikutnya dan buat waktu membaca Anda lebih bermakna.' : 'Kelola koleksi, layanan, dan aktivitas perpustakaan dengan lebih teratur.'}</p>
      </div>
      {isMember && <button type="button" onClick={onCatalog} className="flex w-fit items-center gap-2 rounded-md bg-[#FAF7F2] px-4 py-3 text-xs font-semibold text-stone-900 transition hover:bg-white">Jelajahi katalog <ArrowRight aria-hidden="true" className="size-4" /></button>}
    </section>
  );
}

function RecentLoans({ loans, memberOnly = false }) {
  const rows = memberOnly ? loans.slice(0, 2) : loans;
  return (
    <section className="min-w-0 rounded-lg border border-stone-200 bg-white">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Aktivitas terbaru</p>
          <h2 className="mt-1 font-serif text-xl text-stone-900">Peminjaman terkini</h2>
        </div>
        <ArrowRight aria-hidden="true" className="size-4 text-stone-400" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-medium text-stone-500">
            <tr><th className="px-5 py-3 font-medium sm:px-6">Peminjam</th><th className="px-5 py-3 font-medium">Buku</th><th className="px-5 py-3 font-medium">Batas waktu</th><th className="px-5 py-3 font-medium">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((loan) => <tr key={loan.id}><td className="px-5 py-4 sm:px-6"><p className="font-medium text-stone-800">{memberOnly ? 'Anda' : loan.member}</p><p className="mt-0.5 text-xs text-stone-500">{loan.code}</p></td><td className="px-5 py-4 text-stone-600">{loan.book}</td><td className="px-5 py-4 text-stone-600">{loan.due}</td><td className="px-5 py-4"><StatusBadge tone={loan.status === 'Terlambat' ? 'danger' : loan.status === 'Selesai' ? 'success' : 'warning'}>{loan.status}</StatusBadge></td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Overview({ user, role, onCatalog, onViewChange, loans }) {
  const isMember = role === 3;
  return (
    <>
      <WelcomePanel user={user} role={role} onCatalog={onCatalog} />
      {(role === 1 || role === 2) && <AttendanceWidget />}
      {isMember ? (
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard label="Buku dipinjam" value="2" detail="1 segera jatuh tempo" icon={BookOpenCheck} accent="stone" />
          <StatCard label="Total kunjungan" value="12" detail="Sejak Januari 2026" icon={CalendarDays} accent="green" />
          <StatCard label="Denda berjalan" value={formatRupiah(0)} detail="Tidak ada denda aktif" icon={ShieldCheck} accent="amber" />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total koleksi buku" value="1.248" detail="+18 buku bulan ini" icon={BookOpen} accent="stone" />
          <StatCard label="Peminjaman aktif" value="86" detail="12 jatuh tempo minggu ini" icon={BookOpenCheck} accent="green" />
          <StatCard label="Denda terkumpul" value={formatRupiah(2450000)} detail="Bulan September 2026" icon={FileBarChart} accent="amber" />
          <StatCard label="Anggota aktif" value="432" detail="+24 anggota baru" icon={Users} accent="rose" />
        </div>
      )}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <RecentLoans loans={loans} memberOnly={isMember} />
        <section className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Akses cepat</p><h2 className="mt-1 font-serif text-xl text-stone-900">Yang ingin dikelola?</h2></div><Settings2 aria-hidden="true" className="size-5 text-stone-400" /></div>
          <div className="mt-6 flex flex-col gap-2">
            {(isMember ? [{ label: 'Cari koleksi buku', view: 'catalog', icon: Search }, { label: 'Lihat peminjaman saya', view: 'my-loans', icon: CalendarDays }] : [{ label: 'Tambah koleksi buku', view: 'books', icon: Plus }, { label: 'Kelola peminjaman', view: 'loans', icon: BookOpenCheck }, ...(role === 1 ? [{ label: 'Lihat laporan absensi', view: 'attendance', icon: FileBarChart }] : [])]).map((item) => { const Icon = item.icon; return <button key={item.view} type="button" onClick={() => onViewChange(item.view)} className="flex items-center justify-between rounded-md border border-stone-200 px-3.5 py-3 text-left text-sm text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"><span className="flex items-center gap-3"><Icon aria-hidden="true" className="size-4 text-stone-500" />{item.label}</span><ArrowRight aria-hidden="true" className="size-4 text-stone-400" /></button>; })}
          </div>
        </section>
      </div>
    </>
  );
}

function BookCover({ book, large = false }) {
  return <div className={`relative flex ${large ? 'h-64' : 'h-48'} items-end overflow-hidden bg-gradient-to-br ${book.cover || 'from-stone-300 to-stone-600'} p-5`}><div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,.18),transparent_60%)]" /><div className="relative border-l border-white/50 pl-3 text-white"><p className="font-serif text-3xl leading-none tracking-[-0.05em]">{book.initials || 'BK'}</p><p className="mt-2 max-w-[120px] text-[9px] uppercase tracking-[0.16em] text-white/75">Perpustakaan Digital</p></div></div>;
}

function Catalog({ books, onBookSelect }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Semua genre');
  const [publisher, setPublisher] = useState('Semua penerbit');
  const genres = useMemo(() => ['Semua genre', ...new Set(books.map((book) => book.genre).filter(Boolean))], [books]);
  const publishers = useMemo(() => ['Semua penerbit', ...new Set(books.map((book) => book.penerbit).filter(Boolean))], [books]);
  const filteredBooks = books.filter((book) => {
    const needle = search.toLowerCase();
    const matchesSearch = !needle || `${book.judul} ${book.penulis} ${book.deskripsi}`.toLowerCase().includes(needle);
    return matchesSearch && (genre === 'Semua genre' || book.genre === genre) && (publisher === 'Semua penerbit' || book.penerbit === publisher);
  });

  return (
    <>
      <PageHeader eyebrow="Koleksi perpustakaan" title="Katalog buku" description="Temukan bacaan yang sesuai dengan rasa ingin tahu Anda." />
      <div className="mb-7 flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-3 sm:flex-row">
        <div className="relative flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul, penulis, atau kata kunci..." className="h-11 w-full rounded-md border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200" /></div>
        <select value={genre} onChange={(event) => setGenre(event.target.value)} aria-label="Filter genre" className="h-11 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-stone-400"><option>{genres[0]}</option>{genres.slice(1).map((item) => <option key={item}>{item}</option>)}</select>
        <select value={publisher} onChange={(event) => setPublisher(event.target.value)} aria-label="Filter penerbit" className="h-11 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-stone-400"><option>{publishers[0]}</option>{publishers.slice(1).map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <div className="mb-4 flex items-center justify-between"><p className="text-sm text-stone-500">Menampilkan <span className="font-medium text-stone-900">{filteredBooks.length}</span> dari {books.length} buku</p><span className="text-xs text-stone-400">Diperbarui hari ini</span></div>
      {filteredBooks.length === 0 ? <div className="rounded-lg border border-dashed border-stone-300 bg-white py-20 text-center"><BookOpen aria-hidden="true" className="mx-auto size-8 text-stone-300" /><p className="mt-3 font-serif text-xl text-stone-700">Buku tidak ditemukan</p><p className="mt-1 text-sm text-stone-500">Coba ubah kata kunci atau filter pencarian.</p></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredBooks.map((book) => <article key={book.id_buku} className="group overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-lg hover:shadow-stone-200/50"><BookCover book={book} /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-serif text-xl leading-tight text-stone-900">{book.judul}</h2><p className="mt-1 text-sm text-stone-500">{book.penulis}</p></div><StatusBadge tone={book.stok > 0 ? 'success' : 'danger'}>{book.stok > 0 ? `${book.stok} tersedia` : 'Habis'}</StatusBadge></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-500">{book.deskripsi}</p><div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4"><span className="text-[11px] text-stone-400">{book.genre || 'Koleksi umum'}</span><button type="button" disabled={!book.stok} onClick={() => onBookSelect(book)} className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 transition hover:text-stone-500 disabled:cursor-not-allowed disabled:text-stone-400">{book.stok ? 'Pinjam buku' : 'Tidak tersedia'} <ArrowRight aria-hidden="true" className="size-3.5" /></button></div></div></article>)}</div>}
    </>
  );
}

function BookingModal({ book, onClose, onConfirm }) {
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => { const handler = (event) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, [onClose]);
  if (!book) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="booking-title" className="w-full max-w-md overflow-hidden rounded-lg border border-stone-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-stone-200 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Konfirmasi peminjaman</p><h2 id="booking-title" className="mt-1 font-serif text-2xl text-stone-900">{confirmed ? 'Peminjaman berhasil' : 'Siap membaca?'}</h2></div><button type="button" aria-label="Tutup dialog" onClick={onClose} className="rounded-md p-2 text-stone-500 hover:bg-stone-100"><X aria-hidden="true" className="size-5" /></button></div><div className="p-5"><div className="flex gap-4 rounded-md bg-stone-50 p-4"><div className="w-16 shrink-0 overflow-hidden rounded-sm"><BookCover book={book} /></div><div><h3 className="font-serif text-lg text-stone-900">{book.judul}</h3><p className="mt-1 text-sm text-stone-500">{book.penulis}</p><p className="mt-2 text-xs text-stone-500">Durasi peminjaman: 7 hari</p></div></div>{confirmed ? <div className="mt-5 flex items-start gap-3 rounded-md border border-[#c9dacd] bg-[#edf5ee] p-4 text-sm leading-6 text-[#3e7251]"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>Buku sudah ditambahkan ke daftar peminjaman Anda. Batas pengembalian: 28 September 2026.</p></div> : <p className="mt-5 text-sm leading-6 text-stone-500">Pastikan Anda dapat mengembalikan buku tepat waktu. Denda keterlambatan akan mengikuti ketentuan perpustakaan.</p>}</div><div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4">{confirmed ? <button type="button" onClick={onClose} className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-stone-800">Selesai</button> : <><button type="button" onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50">Batal</button><button type="button" onClick={() => { setConfirmed(true); onConfirm(book); }} className="rounded-md bg-stone-900 px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-stone-800">Konfirmasi pinjam</button></>}</div></div></div>;
}

function BooksManagement({ books, onAddBook }) {
  return <><PageHeader eyebrow="Koleksi" title="Kelola buku" description="Atur katalog, ketersediaan, dan informasi bibliografi koleksi." action={<button type="button" onClick={onAddBook} className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Tambah buku</button>} /><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="flex flex-col gap-3 border-b border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="relative w-full sm:max-w-xs"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" /><input aria-label="Cari buku" placeholder="Cari koleksi..." className="h-10 w-full rounded-md border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm outline-none focus:border-stone-400" /></div><button type="button" className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900"><ArrowDownToLine aria-hidden="true" className="size-4" /> Ekspor data</button></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Buku</th><th className="px-5 py-3 font-medium">Genre</th><th className="px-5 py-3 font-medium">Penerbit</th><th className="px-5 py-3 font-medium">Stok</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{books.map((book) => <tr key={book.id_buku} className="hover:bg-stone-50/60"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`flex size-10 items-end rounded-sm bg-gradient-to-br ${book.cover} p-1.5 text-[9px] font-semibold text-white`}>{book.initials}</div><div><p className="font-medium text-stone-800">{book.judul}</p><p className="mt-0.5 text-xs text-stone-500">{book.penulis}</p></div></div></td><td className="px-5 py-4 text-stone-600">{book.genre}</td><td className="px-5 py-4 text-stone-600">{book.penerbit}</td><td className="px-5 py-4 text-stone-600">{book.stok}</td><td className="px-5 py-4"><StatusBadge tone={book.stok > 0 ? 'success' : 'danger'}>{book.stok > 0 ? 'Tersedia' : 'Habis'}</StatusBadge></td></tr>)}</tbody></table></div></section></>;
}

function LoansManagement({ loans }) {
  return <><PageHeader eyebrow="Sirkulasi" title="Peminjaman & pengembalian" description="Pantau transaksi, batas waktu, dan denda anggota." action={<button type="button" className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Transaksi baru</button>} /><div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Sedang dipinjam" value="86" detail="Transaksi aktif" icon={BookOpenCheck} accent="green" /><StatCard label="Jatuh tempo hari ini" value="7" detail="Perlu ditindaklanjuti" icon={Clock3} accent="amber" /><StatCard label="Terlambat" value="12" detail="Total bulan ini" icon={CircleAlert} accent="rose" /></div><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Kode transaksi</th><th className="px-5 py-3 font-medium">Peminjam</th><th className="px-5 py-3 font-medium">Buku</th><th className="px-5 py-3 font-medium">Tanggal</th><th className="px-5 py-3 font-medium">Denda</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{loans.map((loan) => <tr key={loan.id}><td className="px-6 py-4 font-mono text-xs text-stone-600">{loan.code}</td><td className="px-5 py-4 font-medium text-stone-800">{loan.member}</td><td className="px-5 py-4 text-stone-600">{loan.book}</td><td className="px-5 py-4 text-stone-600">{loan.date}<span className="block text-xs text-stone-400">s/d {loan.due}</span></td><td className="px-5 py-4 text-stone-600">{formatRupiah(loan.fine)}</td><td className="px-5 py-4"><StatusBadge tone={loan.status === 'Terlambat' ? 'danger' : loan.status === 'Selesai' ? 'success' : 'warning'}>{loan.status}</StatusBadge></td></tr>)}</tbody></table></div></section></>;
}

function FacilitiesManagement() {
  return <><PageHeader eyebrow="Operasional" title="Fasilitas" description="Pastikan ruang dan fasilitas perpustakaan selalu siap digunakan." action={<button type="button" className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Tambah fasilitas</button>} /><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{MOCK_FACILITIES.map((facility) => <article key={facility.id} className="rounded-lg border border-stone-200 bg-white p-5"><div className="flex items-start justify-between"><span className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700"><Building2 aria-hidden="true" className="size-5" strokeWidth={1.5} /></span><ChevronDown aria-hidden="true" className="size-4 rotate-[-90deg] text-stone-400" /></div><h2 className="mt-5 font-serif text-xl text-stone-900">{facility.name}</h2><div className="mt-4 flex items-end justify-between border-t border-stone-100 pt-4"><div><p className="font-serif text-2xl text-stone-900">{facility.quantity}</p><p className="text-xs text-stone-500">unit tersedia</p></div><StatusBadge tone={facility.condition === 'Baik' ? 'success' : 'warning'}>{facility.condition}</StatusBadge></div></article>)}</div></>;
}

function StaffManagement() {
  return <><PageHeader eyebrow="Administrasi" title="Karyawan & shift" description="Kelola akun petugas dan pembagian jadwal kerja perpustakaan." action={<button type="button" className="flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-stone-800"><Plus aria-hidden="true" className="size-4" /> Tambah karyawan</button>} /><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Karyawan</th><th className="px-5 py-3 font-medium">Peran</th><th className="px-5 py-3 font-medium">Jadwal shift</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{MOCK_STAFF.map((staff) => <tr key={staff.id}><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-stone-100 font-serif text-sm text-stone-700">{getInitials(staff.name)}</span><div><p className="font-medium text-stone-800">{staff.name}</p><p className="mt-0.5 text-xs text-stone-500">@{staff.username}</p></div></div></td><td className="px-5 py-4 text-stone-600">{staff.role}</td><td className="px-5 py-4 text-stone-600">{staff.shift}</td><td className="px-5 py-4"><StatusBadge tone={staff.status === 'Aktif' ? 'success' : 'warning'}>{staff.status}</StatusBadge></td></tr>)}</tbody></table></div></section></>;
}

function AttendanceReport() {
  return <><PageHeader eyebrow="Administrasi" title="Laporan absensi" description="Rekap kehadiran karyawan berdasarkan jadwal shift." action={<button type="button" className="flex items-center justify-center gap-2 rounded-md border border-stone-300 px-4 py-3 text-xs font-semibold text-stone-700 hover:bg-stone-50"><ArrowDownToLine aria-hidden="true" className="size-4" /> Unduh laporan</button>} /><div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Kehadiran bulan ini" value="96%" detail="+2,4% dari bulan lalu" icon={Check} accent="green" /><StatCard label="Tepat waktu" value="82%" detail="Dari 124 jadwal" icon={Clock3} accent="stone" /><StatCard label="Tidak hadir" value="5" detail="Perlu ditinjau" icon={CircleAlert} accent="rose" /></div><section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="border-b border-stone-200 px-6 py-5"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">September 2026</p><h2 className="mt-1 font-serif text-xl text-stone-900">Aktivitas kehadiran terbaru</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-stone-50 text-[11px] text-stone-500"><tr><th className="px-6 py-3 font-medium">Karyawan</th><th className="px-5 py-3 font-medium">Tanggal</th><th className="px-5 py-3 font-medium">Jadwal</th><th className="px-5 py-3 font-medium">Masuk aktual</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{[['Sinta Maharani', '21 Sep 2026', '08.00', '07.56', 'Tepat waktu'], ['Dimas Pratama', '21 Sep 2026', '12.00', '12.08', 'Terlambat'], ['Sinta Maharani', '20 Sep 2026', '08.00', '07.58', 'Tepat waktu']].map((row) => <tr key={`${row[0]}-${row[1]}`}><td className="px-6 py-4 font-medium text-stone-800">{row[0]}</td><td className="px-5 py-4 text-stone-600">{row[1]}</td><td className="px-5 py-4 text-stone-600">{row[2]} WIB</td><td className="px-5 py-4 text-stone-600">{row[3]} WIB</td><td className="px-5 py-4"><StatusBadge tone={row[4] === 'Terlambat' ? 'danger' : 'success'}>{row[4]}</StatusBadge></td></tr>)}</tbody></table></div></section></>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser() || { username: 'Pengguna', id_role: 3 };
  const role = Number(user.id_role) || 3;
  const [activeView, setActiveView] = useState(role === 3 ? 'overview' : 'overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [books, setBooks] = useState(MOCK_BOOKS);
  const [loans, setLoans] = useState(MOCK_LOANS);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [apiNotice, setApiNotice] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

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

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const handleBooking = (book) => {
    setLoans((current) => [{ id: Date.now(), code: `TRX-2026-${String(current.length + 82).padStart(4, '0')}`, member: user.username || 'Anda', book: book.judul, date: '21 Sep 2026', due: '28 Sep 2026', status: 'Dipinjam', fine: 0 }, ...current]);
  };

  const setView = (view) => setActiveView(view);

  return (
    <div className="flex min-h-svh bg-[#FAF7F2] font-sans text-stone-900">
      <Sidebar activeView={activeView} onViewChange={setView} role={role} onLogout={handleLogout} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="min-w-0 flex-1">
        <MobileHeader onOpenMenu={() => setMobileOpen(true)} onLogout={handleLogout} user={user} />
        <main className="mx-auto max-w-[1480px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="mb-6 hidden items-center justify-between lg:flex"><p className="text-xs text-stone-500">Senin, 21 September 2026</p><div className="flex items-center gap-3"><button type="button" aria-label="Muat ulang katalog" onClick={loadBooks} className="rounded-md p-2 text-stone-500 hover:bg-white hover:text-stone-900"><RefreshCw aria-hidden="true" className={`size-4 ${loadingBooks ? 'animate-spin' : ''}`} /></button><div className="flex items-center gap-2 border-l border-stone-200 pl-4"><span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-[#FAF7F2]">{getInitials(user.username)}</span><span className="text-sm text-stone-700">{user.username}</span></div></div></div>
          {apiNotice && <div className="mb-5 flex items-center gap-2 rounded-md border border-[#ead9b8] bg-[#faf4e7] px-4 py-3 text-xs text-[#85672c]" role="status"><CircleAlert aria-hidden="true" className="size-4 shrink-0" />{apiNotice}</div>}
          {activeView === 'overview' && <Overview user={user} role={role} onCatalog={() => setView('catalog')} onViewChange={setView} loans={loans} />}
          {activeView === 'catalog' && <Catalog books={books} onBookSelect={setSelectedBook} />}
          {activeView === 'my-loans' && <><PageHeader eyebrow="Aktivitas Anda" title="Peminjaman saya" description="Pantau buku yang sedang Anda baca dan riwayat pengembalian." /><RecentLoans loans={loans} memberOnly /></>}
          {activeView === 'books' && <BooksManagement books={books} onAddBook={() => setApiNotice('Form tambah buku siap dihubungkan ke endpoint buku.')} />}
          {activeView === 'loans' && <LoansManagement loans={loans} />}
          {activeView === 'facilities' && <FacilitiesManagement />}
          {activeView === 'staff' && role === 1 && <StaffManagement />}
          {activeView === 'attendance' && role === 1 && <AttendanceReport />}
        </main>
      </div>
      <BookingModal book={selectedBook} onClose={() => setSelectedBook(null)} onConfirm={handleBooking} />
    </div>
  );
}

