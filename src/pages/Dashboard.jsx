import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { clearSession, getUser } from "../utils/auth";
import Sidebar, {
  DashboardHeader,
  ExportButton,
} from "../components/dashboard/Sidebar";
import Overview from "../components/dashboard/Overview";
import Books, { BookEditor } from "../components/dashboard/Books";
import Loans from "../components/dashboard/Loans";
import {
  AttendanceReport,
  Employees,
  Facilities,
} from "../components/dashboard/Administration";
import { Button, Notice } from "../components/dashboard/ui";
import {
  activeLoan,
  dateKey,
  demoUsers,
  initials,
  loanStatus,
  pageNames,
  roleNames,
} from "../components/dashboard/data";
import useDashboardData from "../components/dashboard/useDashboardData";

const allowedViews = {
  1: ["overview", "books", "loans", "facilities", "employees", "attendance"],
  2: ["overview", "books", "loans", "facilities"],
  3: ["catalog", "my-loans"],
};
const descriptions = {
  overview: "Mari ciptakan ruang untuk lebih banyak cerita hari ini.",
  books: "Rawat koleksi, buka lebih banyak jendela pengetahuan.",
  loans: "Kelola perjalanan buku, dari rak hingga kembali lagi.",
  facilities: "Ruang yang nyaman untuk setiap pembaca.",
  employees: "Orang-orang di balik ruang baca yang terus hidup.",
  attendance: "Catatan kehadiran untuk operasional yang lebih tertata.",
  catalog: "Temukan bacaan yang tepat untuk rasa ingin tahu Anda.",
  "my-loans": "Setiap buku menyimpan bagian dari perjalanan Anda.",
};

function downloadReport(data, view) {
  const tables = {
    books: data.books.map((book) => ({
      Judul: book.judul,
      Penulis: book.penulis,
      Stok: book.stok,
    })),
    facilities: data.facilities.map((item) => ({
      Fasilitas: item.nama_fasilitas,
      Kondisi: item.kondisi,
      Jumlah: item.jumlah,
    })),
    employees: data.users.map((item) => ({
      Nama: item.username,
      Peran: roleNames[item.id_role],
      Email: item.email || "",
    })),
    attendance: data.attendance.map((item) => ({
      Nama:
        data.users.find((user) => user.id_user === item.id_user)?.username ||
        item.id_user,
      Tanggal: item.tanggal,
      "Jam masuk": item.jam_masuk_aktual || "",
      "Jam keluar": item.jam_keluar_aktual || "",
    })),
  };
  const rows =
    tables[view] ||
    data.loans.map((loan) => ({
      Transaksi: loan.kode_transaksi,
      Buku:
        data.books.find((book) => book.id_buku === loan.id_buku)?.judul ||
        loan.id_buku,
      "Tanggal pinjam": loan.tanggal_peminjaman,
      "Batas waktu": loan.batas_waktu,
      Status: loanStatus(loan),
      Denda: loan.denda,
    }));
  if (!rows.length) return false;
  const escape = (value) => {
    const raw = String(value ?? "");
    const safe = /^[\s]*[=+@-]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const csv = [Object.keys(rows[0]), ...rows.map(Object.values)]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${data.isDemo ? "DEMO-" : ""}perpustakaan-${view}-${dateKey()}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export default function Dashboard({ demo = false }) {
  const [params] = useSearchParams();
  const previewRole = Number(params.get("role") || 1);
  const user = demo ? demoUsers[previewRole] || demoUsers[1] : getUser();
  if (!user || !allowedViews[Number(user.id_role)])
    return <Navigate to="/login" replace />;
  return (
    <DashboardWorkspace
      key={`${demo}-${user.id_role}-${user.id_user}`}
      user={user}
      demo={demo}
    />
  );
}

function DashboardWorkspace({ user, demo }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const role = Number(user.id_role);
  const requestedView = params.get("view");
  const view = allowedViews[role].includes(requestedView)
    ? requestedView
    : allowedViews[role][0];
  const basePath = demo ? "/demo/dashboard" : "/dashboard";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [message, setMessage] = useState("");
  const { data, error, isLoading, isValidating, reload, perform, saving } =
    useDashboardData(user, demo);
  const linkTo = (page, extra = "") =>
    `${basePath}?view=${page}${demo ? `&role=${role}` : ""}${extra}`;
  const date = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  useEffect(() => {
    document.title = `${pageNames[view]} — Perpustakaan Digital`;
  }, [view]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6500);
    return () => clearTimeout(timer);
  }, [message]);
  const logout = () => {
    if (!demo) clearSession();
    navigate("/login", { replace: true });
  };
  const setRole = (nextRole) =>
    setParams({ role: String(nextRole), view: allowedViews[nextRole][0] });
  const shared = { data, user, perform, saving, notify: setMessage };

  return (
    <div className="library-dashboard min-h-svh bg-[#FAF7F2] font-sans text-stone-900 selection:bg-stone-200">
      <a
        href="#dashboard-content"
        className="sr-only z-50 rounded bg-stone-900 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Langsung ke konten
      </a>
      <Sidebar
        user={user}
        demo={demo}
        role={role}
        view={view}
        setRole={setRole}
        basePath={basePath}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        logout={logout}
        loanCount={data?.loans.filter(activeLoan).length || 0}
      />
      <div className="flex min-h-svh flex-col lg:ml-[220px]">
        <DashboardHeader
          title={pageNames[view]}
          date={date}
          onMenu={() => setMobileOpen(true)}
        >
          <div className="flex items-center gap-2 border-l border-stone-200 pl-4">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e8e1d4] font-serif text-[11px]">
              {initials(user.username)}
            </span>
            <span className="hidden text-[10px] text-stone-600 xl:block">
              {roleNames[role]}
            </span>
          </div>
        </DashboardHeader>
        {(demo || data?.isDemo) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/75 bg-[#f2eee5] px-5 py-2.5 text-[9px] tracking-wide text-stone-500 sm:px-8">
            <span>
              <span className="mr-2 inline-block size-1.5 rounded-full bg-[#9b8d73]" />
              <strong className="font-medium text-stone-700">
                Mode pratinjau
              </strong>
              <span className="mx-2 text-stone-300">/</span>
              {demo
                ? "Data contoh · Perubahan tidak disimpan ke server"
                : `${data.fallbackReason} Data contoh, bukan data akun Anda.`}
            </span>
            {demo ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-stone-700 hover:underline"
              >
                Masuk ke akun
                <ArrowRight className="size-3" />
              </Link>
            ) : (
              <button
                disabled={isValidating}
                onClick={() => reload()}
                className="inline-flex items-center gap-1.5 text-stone-700"
              >
                <RefreshCw
                  className={`size-3 ${isValidating ? "animate-spin" : ""}`}
                />
                Coba hubungkan
              </button>
            )}
          </div>
        )}
        <main
          id="dashboard-content"
          className="mx-auto w-full max-w-[1600px] flex-1 px-5 pb-8 pt-7 sm:px-8"
        >
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.2em] text-stone-500">
                {role === 3 ? "RUANG BACA ANDA" : "RUANG KERJA ANDA"}
              </p>
              <h1 className="font-serif text-[34px] font-normal leading-tight tracking-[-0.035em] sm:text-[38px]">
                {view === "overview" ? (
                  <>
                    Selamat datang,{" "}
                    <span className="italic">
                      {user.username.split(" ")[0]}.
                    </span>
                  </>
                ) : (
                  pageNames[view]
                )}
              </h1>
              <p className="mt-2.5 text-[11px] leading-5 text-stone-500">
                {descriptions[view]}
              </p>
            </div>
            {role !== 3 && data && (
              <div className="flex flex-wrap gap-2">
                <ExportButton
                  onClick={() =>
                    setMessage(
                      downloadReport(data, view)
                        ? "Laporan CSV berhasil diunduh."
                        : "Belum ada data untuk diunduh.",
                    )
                  }
                />
                {view === "overview" && (
                  <Button onClick={() => setEditingBook({})}>
                    <Plus className="size-3.5" />
                    Tambah buku
                  </Button>
                )}
              </div>
            )}
          </div>
          {isLoading && (
            <div
              role="status"
              className="flex items-center justify-center gap-3 rounded-lg border border-stone-200 bg-white py-24 text-sm text-stone-500"
            >
              <Loader2 className="size-5 animate-spin" />
              Menyiapkan ruang perpustakaan...
            </div>
          )}
          {error && (
            <div className="space-y-4">
              <Notice error>{error.message}</Notice>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => reload()}
                  busy={isValidating}
                >
                  Coba lagi
                </Button>
                <Button onClick={logout}>Kembali ke login</Button>
              </div>
            </div>
          )}
          {data && (
            <div
              key={`${view}-${params.get("q") || ""}-${params.get("status") || ""}`}
              className="animate-fade-in"
            >
              {view === "overview" && (
                <Overview
                  {...shared}
                  linkTo={linkTo}
                  onAddBook={() => setEditingBook({})}
                />
              )}
              {view === "books" && (
                <Books {...shared} onEdit={setEditingBook} />
              )}
              {view === "loans" && <Loans {...shared} linkTo={linkTo} />}
              {view === "facilities" && <Facilities {...shared} />}
              {view === "employees" && role === 1 && <Employees {...shared} />}
              {view === "attendance" && role === 1 && (
                <AttendanceReport data={data} />
              )}
              {view === "catalog" && <Books {...shared} catalog />}
              {view === "my-loans" && (
                <Loans {...shared} member linkTo={linkTo} />
              )}
            </div>
          )}
        </main>
        <footer className="mx-5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 py-5 text-[9px] text-stone-400 sm:mx-8">
          <span>© {new Date().getFullYear()} Perpustakaan Digital</span>
          <span className="font-serif text-[12px] italic">
            Untuk rasa ingin tahu.
          </span>
        </footer>
      </div>
      {editingBook && data && role !== 3 && (
        <BookEditor
          book={editingBook.id_buku ? editingBook : null}
          data={data}
          perform={perform}
          saving={saving}
          onClose={() => setEditingBook(null)}
          notify={setMessage}
        />
      )}
      {message && (
        <div
          role="status"
          className="fixed bottom-5 left-5 right-5 z-50 mx-auto flex max-w-lg items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-lg sm:left-auto sm:right-6"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#637354]" />
          <p className="flex-1 text-xs leading-5 text-stone-700">{message}</p>
          <button
            onClick={() => setMessage("")}
            aria-label="Tutup notifikasi"
            className="rounded p-1 text-stone-400 hover:text-stone-700"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
