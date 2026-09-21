import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Sofa,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { initials, roleNames } from "./data";

const staffLinks = [
  { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
  { id: "books", label: "Koleksi Buku", icon: LibraryBig },
  { id: "loans", label: "Peminjaman", icon: ArrowLeftRight },
  { id: "facilities", label: "Fasilitas", icon: Sofa },
];
const adminLinks = [
  { id: "employees", label: "Karyawan & Shift", icon: Users },
  { id: "attendance", label: "Laporan Absensi", icon: ClipboardList },
];
const memberLinks = [
  { id: "catalog", label: "Katalog Buku", icon: LibraryBig },
  { id: "my-loans", label: "Peminjaman Saya", icon: BookOpen },
];

export default function Sidebar({
  user,
  demo,
  role,
  view,
  setRole,
  basePath,
  mobileOpen,
  setMobileOpen,
  logout,
  loanCount,
}) {
  const staff = role === 1 || role === 2;
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = sidebarRef.current.querySelectorAll('a, button:not(:disabled), select');
    controls[0]?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key !== "Tab") return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [mobileOpen, setMobileOpen]);
  function links(items) {
    return items.map(({ id, label, icon: Icon }) => (
      <Link
        key={id}
        to={`${basePath}?view=${id}${demo ? `&role=${role}` : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-current={view === id ? "page" : undefined}
      >
        <SidebarItem
          id={id}
          label={label}
          Icon={Icon}
          loanCount={loanCount}
          selected={view === id}
        />
      </Link>
    ));
  }
  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-stone-950/30 lg:hidden"
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r border-stone-200 bg-[#F7F4EE] transition-transform lg:visible lg:translate-x-0 ${mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 pb-9 pt-8">
          <Link
            to={`${basePath}${demo ? `?role=${role}` : ""}`}
            className="flex items-center gap-3"
          >
            <span className="flex size-10 items-center justify-center rounded-sm border border-stone-400">
              <BookOpen className="size-5" strokeWidth={1.4} />
            </span>
            <span className="font-serif text-[12px] leading-[1.45] tracking-[0.1em]">
              PERPUSTAKAAN
              <br />
              DIGITAL
            </span>
          </Link>
          <button
            className="p-1 lg:hidden"
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mx-5 mb-7 flex items-center gap-2.5 rounded-md border border-stone-200 bg-white/65 px-3 py-3">
          <span className="flex size-7 items-center justify-center rounded bg-[#ece8df]">
            <LibraryBig className="size-3.5" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-[11px] font-medium">Ruang Perpustakaan</p>
            <p className="mt-0.5 text-[9px] text-stone-500">
              {staff ? "Manajemen & operasional" : "Ruang baca & eksplorasi"}
            </p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4">
          <p className="mb-3 px-3 text-[9px] font-medium uppercase tracking-[0.17em] text-stone-400">
            Menu utama
          </p>
          <div className="flex flex-col gap-1">
            {links(staff ? staffLinks : memberLinks)}
          </div>
          {role === 1 && (
            <>
              <p className="mb-3 mt-8 px-3 text-[9px] font-medium uppercase tracking-[0.17em] text-stone-400">
                Administrasi
              </p>
              <div className="flex flex-col gap-1">{links(adminLinks)}</div>
            </>
          )}
          <div className="mx-1 mb-5 mt-10 border-t border-stone-200 pt-6">
            <BookOpen
              className="mb-3 size-5 text-stone-400"
              strokeWidth={1.2}
            />
            <p className="font-serif text-[17px] italic leading-6 text-stone-600">
              “Setiap halaman,
              <br />
              sebuah kemungkinan.”
            </p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.14em] text-stone-400">
              Tumbuh bersama literasi
            </p>
          </div>
        </nav>
        {demo && (
          <div className="mx-5 mb-4">
            <label
              className="mb-1.5 block text-[9px] uppercase tracking-widest text-stone-500"
              htmlFor="demo-role"
            >
              Pratinjau peran
            </label>
            <div className="relative">
              <select
                id="demo-role"
                value={role}
                onChange={(event) => {
                  setRole(Number(event.target.value));
                  setMobileOpen(false);
                }}
                className="h-9 w-full appearance-none rounded border border-stone-200 bg-white px-3 pr-7 text-xs"
              >
                {Object.entries(roleNames).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 size-3 text-stone-400" />
            </div>
          </div>
        )}
        <div className="border-t border-stone-200 p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e6e0d4] font-serif text-xs">
              {initials(user.username)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium">
                {user.username}
              </p>
              <p className="mt-0.5 text-[10px] text-stone-500">
                {roleNames[role]}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded px-1 py-1.5 text-[11px] text-stone-500 hover:text-stone-900"
          >
            <LogOut className="size-3.5" />
            {demo ? "Kembali ke login" : "Keluar akun"}
            <ArrowUpRight className="ml-auto size-3" />
          </button>
        </div>
      </aside>
    </>
  );
}
function SidebarItem({ id, label, Icon, loanCount, selected }) {
  return (
    <span
      className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-[11px] transition-colors ${selected ? "bg-stone-900 text-[#FAF7F2]" : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900"}`}
    >
      <Icon className="size-4" strokeWidth={1.5} />
      <span>{label}</span>
      {id === "loans" && loanCount > 0 && (
        <span
          className={`ml-auto rounded px-1.5 py-0.5 text-[9px] ${selected ? "bg-stone-700" : "bg-stone-200/70"}`}
        >
          {loanCount}
        </span>
      )}
    </span>
  );
}
export function DashboardHeader({ title, onMenu, date, children }) {
  return (
    <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-stone-200 bg-[#FAF7F2] px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          aria-label="Buka navigasi"
          onClick={onMenu}
          className="rounded-md p-1 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <span className="hidden text-[11px] text-stone-400 sm:inline">
          Ruang Perpustakaan
        </span>
        <span className="hidden text-xs text-stone-300 sm:inline">/</span>
        <span className="text-[11px] font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden items-center gap-2 text-[10px] text-stone-500 md:flex">
          <CalendarCheck className="size-3.5" strokeWidth={1.5} />
          {date}
        </span>
        {children}
      </div>
    </header>
  );
}
export function ExportButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-3.5 text-[11px] font-medium hover:bg-stone-50"
    >
      <ArrowDownToLine className="size-3.5" strokeWidth={1.5} />
      Unduh laporan
    </button>
  );
}
