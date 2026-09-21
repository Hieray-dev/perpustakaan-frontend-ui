import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleCheck,
  Clock3,
  Coins,
  LogIn,
  LogOut,
  Plus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  activeLoan,
  dateKey,
  formatDate,
  initials,
  loanStatus,
  rupiah,
} from "./data";
import {
  Badge,
  BookCover,
  Button,
  EmptyState,
  Notice,
  StatusBadge,
} from "./ui";

export function AttendanceWidget({ user, data, perform, saving, notify }) {
  const [error, setError] = useState("");
  const today = dateKey();
  const record = data.attendance.find(
    (item) =>
      String(item.id_user) === String(user.id_user) &&
      String(item.tanggal).slice(0, 10) === today,
  );
  const shift =
    data.shifts.find((item) => item.id_shift === record?.id_shift) ||
    data.shifts.find((item) => String(item.id_user) === String(user.id_user));
  const late =
    record?.jam_masuk_aktual &&
    shift &&
    record.jam_masuk_aktual.slice(0, 5) > shift.jam_masuk.slice(0, 5);
  async function submit() {
    if (!shift || record?.jam_keluar_aktual) return;
    setError("");
    const time = new Date().toLocaleTimeString("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const checkingOut = Boolean(record?.jam_masuk_aktual);
    try {
      const message = await perform(
        "attendance",
        {
          id_user: user.id_user,
          id_shift: shift.id_shift,
          tanggal: today,
          ...(checkingOut
            ? { jam_keluar_aktual: time, jenis: "keluar" }
            : { jam_masuk_aktual: time, jenis: "masuk" }),
        },
        { id: record?.id_absensi },
      );
      notify(message);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <section
      aria-labelledby="attendance-title"
      className="overflow-hidden rounded-lg border border-stone-200 bg-white"
    >
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-[#FAF7F2]">
            <Clock3 strokeWidth={1.4} className="size-5 text-stone-600" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="attendance-title" className="text-xs font-semibold">
                Absensi hari ini
              </h2>
              <span className="size-1.5 rounded-full bg-[#768367]" />
            </div>
            <p className="mt-1.5 text-[10px] text-stone-500">
              {shift
                ? `${shift.nama_shift} · ${shift.jam_masuk.slice(0, 5)} – ${shift.jam_keluar.slice(0, 5)}`
                : "Jadwal shift belum ditetapkan"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div>
            <p className="mb-1.5 text-[9px] uppercase tracking-wider text-stone-400">
              Jam masuk
            </p>
            <p className="font-serif text-xl leading-none">
              {record?.jam_masuk_aktual?.slice(0, 5) || "—"}
              <span className="ml-1 font-sans text-[9px] text-stone-400">
                {record?.jam_masuk_aktual ? "WIB" : ""}
              </span>
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-[9px] uppercase tracking-wider text-stone-400">
              Jam keluar
            </p>
            <p className="font-serif text-xl leading-none">
              {record?.jam_keluar_aktual?.slice(0, 5) || "—"}
              <span className="ml-1 font-sans text-[9px] text-stone-400">
                {record?.jam_keluar_aktual ? "WIB" : ""}
              </span>
            </p>
          </div>
          <Badge
            tone={
              record?.jam_masuk_aktual
                ? late
                  ? "danger"
                  : "success"
                : "neutral"
            }
          >
            {record?.jam_masuk_aktual
              ? late
                ? "Terlambat"
                : "Tepat Waktu"
              : "Belum absen"}
          </Badge>
          <Button
            variant="secondary"
            busy={saving}
            disabled={!shift || Boolean(record?.jam_keluar_aktual)}
            onClick={submit}
          >
            {record?.jam_keluar_aktual ? (
              <Check className="size-3.5" />
            ) : record?.jam_masuk_aktual ? (
              <LogOut className="size-3.5" />
            ) : (
              <LogIn className="size-3.5" />
            )}
            {record?.jam_keluar_aktual
              ? "Shift selesai"
              : record?.jam_masuk_aktual
                ? "Absen Keluar"
                : "Absen Masuk"}
          </Button>
        </div>
      </div>
      {error && (
        <div className="px-5 pb-4">
          <Notice error>{error}</Notice>
        </div>
      )}
    </section>
  );
}
function StatCards({ data }) {
  const active = data.loans.filter(activeLoan);
  const late = active.filter((loan) => loanStatus(loan) === "Terlambat");
  const stats = [
    {
      label: "Total Buku",
      value: data.books
        .reduce((sum, book) => sum + Number(book.stok || 0), 0)
        .toLocaleString("id-ID"),
      detail: `${data.books.length} judul dalam koleksi`,
      icon: BookOpen,
      secondary: "Eksemplar tersedia",
    },
    {
      label: "Peminjaman Aktif",
      value: String(active.length).padStart(2, "0"),
      detail: `${late.length} melewati batas waktu`,
      icon: ArrowUpRight,
      secondary: "Sedang dipinjam",
      warn: late.length > 0,
    },
    {
      label: "Denda Terkumpul",
      value: rupiah(
        data.returns.reduce((sum, item) => sum + Number(item.denda || 0), 0),
      ),
      detail: "Dari pengembalian selesai",
      icon: Coins,
      secondary: "Total penerimaan",
    },
    {
      label: "Anggota Aktif",
      value: String(
        data.users.filter(
          (item) => Number(item.id_role) === 3 && item.aktif !== false,
        ).length,
      ).padStart(2, "0"),
      detail: "Terdaftar di perpustakaan",
      icon: Users,
      secondary: "Komunitas pembaca",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, detail, icon: Icon, secondary, warn }) => (
        <section
          key={label}
          className="rounded-lg border border-stone-200 bg-white p-4 sm:p-5"
        >
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="text-[11px] text-stone-600">{label}</h2>
            <Icon className="size-4 text-stone-400" strokeWidth={1.5} />
          </div>
          <p
            className={`font-serif tracking-[-0.035em] ${label === "Denda Terkumpul" ? "text-[28px]" : "text-[34px]"} leading-none`}
          >
            {value}
          </p>
          <p className="mt-2 text-[9px] text-stone-400">{secondary}</p>
          <div className="mt-5 flex items-center gap-1.5 border-t border-stone-100 pt-3">
            <span
              className={`size-1 rounded-full ${warn ? "bg-[#b37a55]" : "bg-[#859274]"}`}
            />
            <span
              className={`text-[9px] ${warn ? "text-[#946d4e]" : "text-stone-500"}`}
            >
              {detail}
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
export function LoanRows({
  loans,
  data,
  compact = false,
  member = false,
  onReturn,
  saving,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-left text-xs">
        <thead>
          <tr className="border-y border-stone-100 bg-[#FCFBF8] text-[9px] font-medium uppercase tracking-[0.075em] text-stone-400">
            {!member && <th className="px-5 py-3 font-medium">Anggota</th>}
            <th className="px-4 py-3 font-medium">Buku</th>
            <th className="px-4 py-3 font-medium">Batas waktu</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {!compact && (
              <>
                <th className="px-4 py-3 font-medium">Denda</th>
                {onReturn && (
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Tindakan</span>
                  </th>
                )}
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {loans.map((loan) => {
            const borrower = data.users.find(
              (item) => item.id_user === loan.id_user,
            );
            const book = data.books.find(
              (item) => item.id_buku === loan.id_buku,
            );
            return (
              <tr key={loan.id_peminjaman} className="hover:bg-[#FAF7F2]/60">
                {!member && (
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#efebe2] font-serif text-[10px] text-stone-600">
                        {initials(
                          borrower?.username || loan.nama_user || "Anggota",
                        )}
                      </span>
                      <div>
                        <p className="text-[11px] font-medium">
                          {borrower?.username ||
                            loan.nama_user ||
                            `Anggota #${loan.id_user}`}
                        </p>
                        <p className="mt-1 text-[8px] text-stone-400">
                          {loan.kode_transaksi}
                        </p>
                      </div>
                    </div>
                  </td>
                )}
                <td className="px-4 py-4">
                  <p className="max-w-40 truncate text-[11px] font-medium">
                    {book?.judul || loan.judul || "Buku tidak ditemukan"}
                  </p>
                  <p className="mt-1 text-[9px] text-stone-400">
                    {member ? loan.kode_transaksi : book?.penulis}
                  </p>
                </td>
                <td
                  className={`px-4 py-4 text-[10px] ${loanStatus(loan) === "Terlambat" ? "text-[#a05546]" : "text-stone-500"}`}
                >
                  {formatDate(loan.batas_waktu)}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={loanStatus(loan)} />
                </td>
                {!compact && (
                  <>
                    <td className="px-4 py-4 text-[11px] text-stone-600">
                      {Number(loan.denda) ? rupiah(loan.denda) : "—"}
                    </td>
                    {onReturn && (
                      <td className="px-4 py-4">
                        {activeLoan(loan) && (
                          <Button
                            disabled={saving}
                            variant="secondary"
                            onClick={() => onReturn(loan)}
                          >
                            <ArrowDownLeft className="size-3" />
                            Kembalikan
                          </Button>
                        )}
                      </td>
                    )}
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {loans.length === 0 && (
        <EmptyState
          title="Tidak ada peminjaman"
          description="Peminjaman yang sesuai akan ditampilkan di sini."
        />
      )}
    </div>
  );
}
export default function Overview({
  data,
  user,
  linkTo,
  onAddBook,
  perform,
  saving,
  notify,
}) {
  const latest = [...data.loans].sort((a, b) =>
    b.tanggal_peminjaman.localeCompare(a.tanggal_peminjaman),
  );
  const lateLoans = data.loans.filter(
    (loan) => loanStatus(loan) === "Terlambat",
  );
  return (
    <div className="flex flex-col gap-5">
      <AttendanceWidget
        user={user}
        data={data}
        perform={perform}
        saving={saving}
        notify={notify}
      />
      <StatCards data={data} />
      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5">
            <div>
              <h2 className="font-serif text-[21px]">Peminjaman terbaru</h2>
              <p className="mt-1 text-[10px] text-stone-500">
                Cerita yang sedang menemani para pembaca.
              </p>
            </div>
            <Link
              to={linkTo("loans")}
              className="flex items-center gap-2 text-[10px] font-medium text-stone-600 hover:text-stone-900"
            >
              Lihat semua
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <LoanRows loans={latest.slice(0, 5)} data={data} compact />
          <div className="flex items-center gap-2 border-t border-stone-100 px-5 py-3 text-[9px] text-stone-500">
            <CircleCheck className="size-3 text-[#728063]" />
            {data.isDemo
              ? "Menampilkan data contoh perpustakaan"
              : "Data terbaru dari perpustakaan"}
            <span className="ml-auto">
              {Math.min(5, data.loans.length)} dari {data.loans.length}{" "}
              transaksi
            </span>
          </div>
        </section>
        <section className="hidden rounded-lg border border-stone-200 bg-white p-5 2xl:block">
          <p className="mb-4 text-[9px] uppercase tracking-[0.16em] text-stone-400">
            Perlu perhatian
          </p>
          <span className="flex size-9 items-center justify-center rounded-full bg-[#f6eee1] text-[#886631]">
            <Clock3 className="size-4" strokeWidth={1.5} />
          </span>
          <h2 className="mt-4 font-serif text-xl">
            Jangan lewatkan
            <br />
            halaman terakhir.
          </h2>
          <p className="mt-3 text-xs leading-6 text-stone-500">
            Ada{" "}
            <span className="font-medium text-stone-900">
              {lateLoans.length} peminjaman
            </span>{" "}
            yang melewati batas pengembalian. Mari bantu buku kembali ke raknya.
          </p>
          <Link
            to={linkTo("loans", "&status=Terlambat")}
            className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4 text-[10px] font-medium"
          >
            Tinjau peminjaman
            <ArrowRight className="ml-auto size-3.5" />
          </Link>
        </section>
      </div>
      <section className="rounded-lg border border-stone-200 bg-white px-5 pb-5 pt-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-[21px]">Dari rak perpustakaan</h2>
            <p className="mt-1 text-[10px] text-stone-500">
              Empat cerita, berjuta sudut pandang.
            </p>
          </div>
          <Link
            to={linkTo("books")}
            className="flex items-center gap-2 text-[10px] font-medium text-stone-600"
          >
            Kelola koleksi
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {data.books.slice(0, 4).map((book) => (
            <Link
              to={linkTo("books", `&q=${encodeURIComponent(book.judul)}`)}
              key={book.id_buku}
              className="group flex items-center gap-3 rounded-md bg-[#F9F7F2] p-3"
            >
              <BookCover
                book={book}
                className="h-20 w-14 shrink-0 rounded-sm shadow-sm transition-transform group-hover:-translate-y-1"
              />
              <div className="min-w-0">
                <h3 className="font-serif text-[14px] leading-5">
                  {book.judul}
                </h3>
                <p className="mt-1 truncate text-[9px] text-stone-500">
                  {book.penulis}
                </p>
                <p className="mt-2 text-[9px] text-stone-400">
                  {book.stok} tersedia
                </p>
              </div>
            </Link>
          ))}
        </div>
        {!data.books.length && (
          <EmptyState
            title="Rak masih kosong"
            action={
              <Button onClick={onAddBook}>
                <Plus className="size-3.5" />
                Tambah buku
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
