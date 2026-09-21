import { useState } from "react";
import { ArrowRight, BookOpen, Clock3, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { activeLoan, loanStatus, rupiah } from "./data";
import { LoanRows } from "./Overview";
import {
  Button,
  EmptyState,
  Field,
  Modal,
  Notice,
  Pagination,
  SearchInput,
} from "./ui";

export default function Loans({
  data,
  user,
  member = false,
  perform,
  saving,
  notify,
  linkTo,
}) {
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(params.get("status") || "Semua");
  const [page, setPage] = useState(1);
  const [returning, setReturning] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const ownLoans = member
    ? data.loans.filter((item) => String(item.id_user) === String(user.id_user))
    : data.loans;
  const loans = ownLoans
    .filter((loan) => {
      const book = data.books.find((item) => item.id_buku === loan.id_buku);
      const borrower = data.users.find((item) => item.id_user === loan.id_user);
      return (
        (status === "Semua" || loanStatus(loan) === status) &&
        `${loan.kode_transaksi} ${book?.judul || ""} ${borrower?.username || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    })
    .sort((a, b) => b.tanggal_peminjaman.localeCompare(a.tanggal_peminjaman));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(loans.length / 5)));
  async function confirmReturn() {
    setError("");
    try {
      notify(
        await perform(
          "returns",
          { id_peminjaman: returning.id_peminjaman },
          { operation: "return" },
        ),
      );
      setReturning(null);
    } catch (err) {
      setError(err.message);
    }
  }
  async function createLoan(event) {
    event.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      notify(
        await perform(
          "loans",
          { id_buku: Number(values.id_buku), id_user: Number(values.id_user) },
          { operation: "borrow" },
        ),
      );
      setCreating(false);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <>
      {member && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Sedang Anda baca",
              value: ownLoans.filter(activeLoan).length,
              icon: BookOpen,
            },
            {
              label: "Perlu dikembalikan",
              value: ownLoans.filter((item) => loanStatus(item) === "Terlambat")
                .length,
              icon: Clock3,
            },
            {
              label: "Denda belum dibayar",
              value: rupiah(
                ownLoans
                  .filter(activeLoan)
                  .reduce((sum, item) => sum + Number(item.denda || 0), 0),
              ),
              icon: BookOpen,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-lg border border-stone-200 bg-white p-5"
            >
              <div className="flex items-center justify-between text-xs text-stone-500">
                {label}
                <Icon className="size-4" strokeWidth={1.5} />
              </div>
              <p className="mt-4 font-serif text-3xl">{value}</p>
            </div>
          ))}
        </div>
      )}
      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-5">
          <div>
            <h2 className="font-serif text-xl">
              {member ? "Perjalanan membaca Anda" : "Daftar peminjaman"}
            </h2>
            <p className="mt-1 text-[10px] text-stone-500">
              {member
                ? "Pantau buku, tanggal pengembalian, dan riwayat Anda."
                : "Setiap buku yang keluar, setiap cerita yang berlanjut."}
            </p>
          </div>
          {!member && (
            <Button
              onClick={() => {
                setCreating(true);
                setError("");
              }}
            >
              <Plus className="size-3.5" />
              Peminjaman baru
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-3 p-5">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Cari buku, anggota, atau transaksi..."
            className="min-w-48 flex-1"
          />
          <select
            aria-label="Filter status peminjaman"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-stone-200 bg-white px-3 text-xs text-stone-600"
          >
            {["Semua", "Dipinjam", "Menunggu", "Terlambat", "Dikembalikan"].map(
              (value) => (
                <option key={value} value={value}>
                  {value === "Semua" ? "Semua status" : value}
                </option>
              ),
            )}
          </select>
        </div>
        {!ownLoans.length && member ? (
          <EmptyState
            title="Cerita pertama menanti."
            description="Anda belum memiliki peminjaman. Temukan bacaan pertama di katalog kami."
            action={
              <Link
                to={linkTo("catalog")}
                className="inline-flex items-center gap-2 text-xs underline underline-offset-4"
              >
                Jelajahi katalog
                <ArrowRight className="size-3.5" />
              </Link>
            }
          />
        ) : (
          <LoanRows
            loans={loans.slice((currentPage - 1) * 5, currentPage * 5)}
            data={data}
            member={member}
            onReturn={
              member
                ? undefined
                : (loan) => {
                    setReturning(loan);
                    setError("");
                  }
            }
            saving={saving}
          />
        )}
        <Pagination page={currentPage} setPage={setPage} total={loans.length} />
      </section>
      {member && (
        <p className="mt-4 text-[11px] leading-6 text-stone-500">
          Pengembalian dan pembayaran denda dilakukan melalui petugas
          perpustakaan. Nilai denda mengikuti catatan server.
        </p>
      )}
      {returning && (
        <Modal
          title="Konfirmasi pengembalian"
          subtitle={returning.kode_transaksi}
          onClose={() => !saving && setReturning(null)}
        >
          <p className="text-sm leading-6 text-stone-600">
            Pastikan buku{" "}
            <strong className="font-medium text-stone-900">
              {
                data.books.find((book) => book.id_buku === returning.id_buku)
                  ?.judul
              }
            </strong>{" "}
            sudah diterima petugas dan kondisinya telah diperiksa.
          </p>
          <div className="my-5 flex justify-between rounded-md border border-stone-200 bg-white p-4 text-xs">
            <span>Denda tercatat</span>
            <strong className="font-medium">{rupiah(returning.denda)}</strong>
          </div>
          <p className="text-[11px] leading-5 text-stone-500">
            Konfirmasikan setelah denda diselesaikan. Server menentukan nominal
            akhir dan memperbarui stok.
          </p>
          {data.isDemo && (
            <div className="mt-4">
              <Notice>Simulasi: tidak memproses pembayaran nyata.</Notice>
            </div>
          )}
          {error && (
            <div className="mt-4">
              <Notice error>{error}</Notice>
            </div>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setReturning(null)}
            >
              Batal
            </Button>
            <Button busy={saving} onClick={confirmReturn}>
              Konfirmasi kembali
            </Button>
          </div>
        </Modal>
      )}
      {creating && (
        <Modal
          title="Peminjaman baru"
          subtitle="Pilih anggota dan buku yang akan dipinjam."
          onClose={() => !saving && setCreating(false)}
        >
          <form onSubmit={createLoan} className="space-y-4">
            <Field label="Anggota" name="id_user" required defaultValue="">
              <option disabled value="">
                Pilih anggota
              </option>
              {data.users
                .filter((item) => Number(item.id_role) === 3)
                .map((item) => (
                  <option key={item.id_user} value={item.id_user}>
                    {item.username}
                  </option>
                ))}
            </Field>
            <Field label="Buku" name="id_buku" required defaultValue="">
              <option disabled value="">
                Pilih buku
              </option>
              {data.books
                .filter(
                  (item) =>
                    Number(item.stok) > 0 && Number(item.id_status) !== 2,
                )
                .map((item) => (
                  <option key={item.id_buku} value={item.id_buku}>
                    {item.judul} · {item.stok} tersedia
                  </option>
                ))}
            </Field>
            <p className="text-xs leading-5 text-stone-500">
              Durasi standar: 7 hari. Batas pengembalian final ditentukan
              server.
            </p>
            {data.isDemo && (
              <Notice>Mode demo: peminjaman ini hanya simulasi.</Notice>
            )}
            {error && <Notice error>{error}</Notice>}
            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => setCreating(false)}
              >
                Batal
              </Button>
              <Button type="submit" busy={saving}>
                Buat peminjaman
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
