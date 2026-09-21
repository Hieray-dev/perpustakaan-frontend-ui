import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CalendarDays, ClipboardList, LayoutDashboard, LibraryBig, LogOut, Menu, Settings2, Users, X } from 'lucide-react';
import { dateLabel, dayKey, roleNames } from './data';
import { Modal } from './ui';

const staffNav = [
  { path: '', label: 'Ringkasan', icon: LayoutDashboard },
  { path: 'buku', label: 'Koleksi Buku', icon: LibraryBig },
  { path: 'peminjaman', label: 'Peminjaman', icon: BookOpen },
  { path: 'fasilitas', label: 'Fasilitas', icon: Settings2 },
];
const adminNav = [
  { path: 'karyawan', label: 'Karyawan & Shift', icon: Users },
  { path: 'absensi', label: 'Laporan Absensi', icon: ClipboardList },
];
const memberNav = [{ path: '', label: 'Katalog Buku', icon: LibraryBig }, { path: 'peminjaman', label: 'Peminjaman Saya', icon: BookOpen }];

export default function DashboardShell({ user, preview, children, onLogout, pageTitle }) {
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const role = Number(user.id_role);
  const base = preview ? '/demo/dashboard' : '/dashboard';
  const query = preview ? `?role=${role}` : '';
  const name = user.nama || user.username || 'Pengguna';
  const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const renderNav = (items) => items.map(({ path, label, icon: Icon }) => <NavLink key={path} end to={`${base}${path ? `/${path}` : ''}${query}`} onClick={() => setMenu(false)} className={({ isActive }) => `group flex items-center gap-3 rounded-md px-3 py-3 text-xs transition-colors ${isActive ? 'bg-stone-900 text-[#FAF7F2]' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}><Icon aria-hidden="true" className="size-[17px]" strokeWidth={1.5} /><span>{label}</span></NavLink>);
  return <div className="dashboard min-h-svh bg-[#FAF7F2] font-sans text-stone-900 selection:bg-stone-200">
    <a href="#dashboard-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-4">Lewati ke konten</a>
    {menu && <button className="fixed inset-0 z-30 bg-stone-950/30 lg:hidden" aria-label="Tutup navigasi" onClick={() => setMenu(false)} />}
    <aside aria-label="Navigasi dashboard" className={`fixed inset-y-0 left-0 z-40 flex w-[222px] flex-col border-r border-stone-200 bg-[#fcfaf7] px-5 py-7 transition-transform lg:translate-x-0 ${menu ? 'translate-x-0' : '-translate-x-full'}`}>
      <Link to={`${base}${query}`} onClick={() => setMenu(false)} className="flex items-center gap-3 px-1"><span className="flex size-10 shrink-0 items-center justify-center rounded border border-stone-300"><BookOpen aria-hidden="true" className="size-5" strokeWidth={1.4} /></span><span className="font-serif text-[12px] leading-5 tracking-[0.10em]">PERPUSTAKAAN<br />DIGITAL</span></Link>
      <div className="mb-4 mt-11 px-3 text-[9px] font-medium uppercase tracking-[0.2em] text-stone-400">Ruang kerja</div>
      <nav aria-label="Menu utama" className="space-y-1">{renderNav(role === 3 ? memberNav : staffNav)}</nav>
      {role === 1 && <><div className="mb-3 mt-8 px-3 text-[9px] font-medium uppercase tracking-[0.2em] text-stone-400">Administrasi</div><nav aria-label="Menu administrator" className="space-y-1">{renderNav(adminNav)}</nav></>}
      <div className="flex-1" />
      <div className="mb-6 mt-8 rounded-md border border-stone-200 p-4"><BookOpen aria-hidden="true" className="mb-3 size-5 text-stone-500" strokeWidth={1.2} /><p className="font-serif text-[17px] leading-6">Ruang untuk<br /><span className="italic">bertumbuh.</span></p><p className="mt-2 text-[10px] leading-5 text-stone-500">Setiap buku membuka<br />sebuah kemungkinan baru.</p><button onClick={() => { setHelp(true); setMenu(false); }} className="mt-4 flex items-center gap-2 text-[10px] font-medium">Panduan perpustakaan <ArrowUpRight className="size-3" /></button></div>
      <div className="flex items-center gap-2.5 border-t border-stone-200 pt-5"><div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e9e5dc] font-serif text-xs">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{name}</p><p className="mt-1 text-[10px] text-stone-500">{roleNames[role]}</p></div><button aria-label="Keluar dari akun" title="Keluar" onClick={onLogout} className="rounded p-1.5 text-stone-500 hover:bg-stone-200"><LogOut className="size-4" strokeWidth={1.5} /></button></div>
    </aside>
    <div className="lg:ml-[222px]">
      <header className="flex h-[73px] items-center justify-between gap-3 border-b border-stone-200 px-5 sm:px-8"><div className="flex min-w-0 items-center gap-3"><button aria-label="Buka navigasi" aria-expanded={menu} onClick={() => setMenu(!menu)} className="p-1 lg:hidden">{menu ? <X className="size-5" /> : <Menu className="size-5" />}</button><span className="hidden text-[11px] text-stone-400 sm:inline">Ruang kerja</span><span className="hidden text-stone-300 sm:inline">/</span><span className="truncate text-[11px]">{pageTitle}</span></div><div className="flex items-center gap-4"><span className="hidden items-center gap-2 text-[10px] text-stone-500 sm:flex"><CalendarDays className="size-3.5" strokeWidth={1.5} />{dateLabel(dayKey(), { weekday: 'long' })}</span><span className="h-5 w-px bg-stone-200" /><div className="flex size-8 items-center justify-center rounded-full border border-stone-300 font-serif text-xs" aria-label={name}>{initials}</div></div></header>
      <main id="dashboard-main" className="mx-auto max-w-[1440px] px-5 pb-6 pt-7 sm:px-8 sm:pt-8">{children}<footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-5 text-[9px] text-stone-400"><p>© {new Date().getFullYear()} Perpustakaan Digital</p><p className="font-serif text-xs italic">Buka buku. Buka wawasan.</p></footer></main>
    </div>
    {help && <Modal title="Selamat datang di ruang baca." onClose={() => setHelp(false)}><div className="space-y-5 text-sm leading-7 text-stone-600"><p>Temukan buku di katalog, pilih judul yang tersedia, lalu ajukan peminjaman. Petugas akan mengonfirmasi saat buku diambil.</p><p>Cek batas pengembalian dan denda pada menu Peminjaman. Staf dapat mencatat kehadiran dan mengelola koleksi sesuai hak akses.</p><p className="border-t border-stone-200 pt-4 text-xs">Mode demo memakai data contoh dan tidak menyimpan perubahan ke server. Akses pada data asli tetap harus diverifikasi oleh backend.</p></div></Modal>}
  </div>;
}
