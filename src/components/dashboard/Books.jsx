import { useState } from "react";
import {
  ArrowRight,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { activeLoan, formatDate, relativeDate } from "./data";
import {
  Badge,
  BookCover,
  Button,
  EmptyState,
  Field,
  Modal,
  Notice,
  Pagination,
  SearchInput,
} from "./ui";

export function BookEditor({ book, data, perform, saving, onClose, notify }) {
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      judul: form.judul.trim(),
      penulis: form.penulis.trim(),
      deskripsi: form.deskripsi.trim(),
      gambar: form.gambar.trim(),
      stok: Number(form.stok),
      id_genre: Number(form.id_genre),
      id_penerbit: Number(form.id_penerbit),
      id_status: Number(form.id_status),
    };
    if (
      !payload.judul ||
      !payload.penulis ||
      !Number.isInteger(payload.stok) ||
      payload.stok < 0 ||
      payload.stok > 100000
    )
      return setError(
        "Judul dan penulis wajib diisi. Stok harus bilangan bulat 0–100.000.",
      );
    if (
      payload.gambar &&
      !/^(https?:\/\/|\/(?!\/)|uploads\/)/i.test(payload.gambar)
    )
      return setError("Gunakan URL gambar http/https atau path /uploads/.");
    try {
      notify(
        await perform("books", payload, {
          id: book?.id_buku,
          method: book ? "PUT" : "POST",
        }),
      );
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Modal
      title={book ? "Sunting buku" : "Tambah cerita baru"}
      subtitle="Lengkapi informasi buku untuk memperkaya koleksi perpustakaan."
      onClose={() => !saving && onClose()}
      wide
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Judul buku"
            name="judul"
            defaultValue={book?.judul || ""}
            required
            maxLength={200}
          />
          <Field
            label="Penulis"
            name="penulis"
            defaultValue={book?.penulis || ""}
            required
            maxLength={150}
          />
        </div>
        <Field
          label="Deskripsi"
          name="deskripsi"
          defaultValue={book?.deskripsi || ""}
          multiline
          maxLength={2000}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Genre"
            name="id_genre"
            defaultValue={book?.id_genre || ""}
            required
          >
            <option value="" disabled>
              Pilih genre
            </option>
            {data.genres.map((genre) => (
              <option key={genre.id_genre} value={genre.id_genre}>
                {genre.nama_genre}
              </option>
            ))}
          </Field>
          <Field
            label="Penerbit"
            name="id_penerbit"
            defaultValue={book?.id_penerbit || ""}
            required
          >
            <option value="" disabled>
              Pilih penerbit
            </option>
            {data.publishers.map((publisher) => (
              <option key={publisher.id_penerbit} value={publisher.id_penerbit}>
                {publisher.nama_penerbit}
              </option>
            ))}
          </Field>
          <Field
            label="Stok tersedia"
            type="number"
            name="stok"
            defaultValue={book?.stok ?? 1}
            min="0"
            max="100000"
            step="1"
            required
          />
          <Field
            label="Status koleksi"
            name="id_status"
            defaultValue={book?.id_status || 1}
          >
            {data.statuses.map((status) => (
              <option key={status.id_status} value={status.id_status}>
                {status.nama_status}
              </option>
            ))}
          </Field>
        </div>
        <Field
          label="URL atau path gambar sampul (opsional)"
          name="gambar"
          defaultValue={book?.gambar || ""}
          placeholder="https://… atau /uploads/sampul.jpg"
          maxLength={2048}
        />
        {data.isDemo && (
          <Notice>Mode demo: perubahan hanya berlaku selama pratinjau.</Notice>
        )}
        {error && <Notice error>{error}</Notice>}
        <div className="flex justify-end gap-2 border-t border-stone-200 pt-5">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onClose}
          >
            Batal
          </Button>
          <Button type="submit" busy={saving}>
            Simpan buku
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function BorrowDialog({
  book,
  user,
  data,
  perform,
  saving,
  onClose,
  notify,
}) {
  const [error, setError] = useState("");
  const hasLoan = data.loans.some(
    (loan) =>
      loan.id_user === user.id_user &&
      loan.id_buku === book.id_buku &&
      activeLoan(loan),
  );
  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      notify(
        await perform(
          "loans",
          { id_user: user.id_user, id_buku: book.id_buku },
          { operation: "borrow" },
        ),
      );
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Modal
      title="Satu buku, cerita baru."
      subtitle="Periksa detail sebelum mengajukan peminjaman."
      onClose={() => !saving && onClose()}
    >
      <form onSubmit={submit}>
        <div className="mb-6 flex gap-5 rounded-md border border-stone-200 bg-white p-4">
          <BookCover
            book={book}
            className="h-36 w-24 shrink-0 rounded-sm shadow-sm"
          />
          <div>
            <Badge tone="success">{book.stok} tersedia</Badge>
            <h3 className="mt-3 font-serif text-2xl">{book.judul}</h3>
            <p className="mt-1 text-xs text-stone-500">{book.penulis}</p>
            <p className="mt-3 text-[11px] leading-5 text-stone-500">
              {book.deskripsi}
            </p>
          </div>
        </div>
        <dl className="mb-5 space-y-3 text-xs">
          <div className="flex justify-between">
            <dt className="text-stone-500">Peminjam</dt>
            <dd>{user.username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Durasi peminjaman</dt>
            <dd>7 hari</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Perkiraan batas pengembalian</dt>
            <dd>{formatDate(relativeDate(7), true)}</dd>
          </div>
        </dl>
        <p className="mb-5 text-[11px] leading-5 text-stone-500">
          Ambil buku di meja layanan setelah pengajuan disetujui petugas. Batas
          pengembalian final mengikuti konfirmasi perpustakaan.
        </p>
        {data.isDemo && (
          <Notice>
            Ini simulasi peminjaman; tidak membuat reservasi nyata.
          </Notice>
        )}
        {hasLoan && (
          <Notice error>Buku ini masih dalam peminjaman Anda.</Notice>
        )}
        {error && <Notice error>{error}</Notice>}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onClose}
          >
            Kembali
          </Button>
          <Button
            type="submit"
            busy={saving}
            disabled={
              hasLoan || Number(book.stok) < 1 || Number(book.id_status) === 2
            }
          >
            Ajukan peminjaman
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export default function Books({
  data,
  user,
  catalog = false,
  onEdit,
  perform,
  saving,
  notify,
}) {
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [genre, setGenre] = useState("");
  const [publisher, setPublisher] = useState("");
  const [availability, setAvailability] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const available = (book) =>
    Number(book.stok) > 0 && Number(book.id_status) !== 2;
  const books = data.books.filter(
    (book) =>
      `${book.judul} ${book.penulis}`
        .toLocaleLowerCase("id-ID")
        .includes(search.toLocaleLowerCase("id-ID")) &&
      (!genre || String(book.id_genre) === genre) &&
      (!publisher || String(book.id_penerbit) === publisher) &&
      (availability === "all" ||
        (availability === "available" ? available(book) : !available(book))),
  );
  const pageSize = catalog ? 8 : 5;
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(books.length / pageSize)),
  );
  const visible = books.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  async function removeBook() {
    setError("");
    try {
      notify(
        await perform("books", undefined, {
          id: deleting.id_buku,
          method: "DELETE",
        }),
      );
      setDeleting(null);
    } catch (err) {
      setError(err.message);
    }
  }
  const updateFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  return (
    <>
      {catalog && (
        <section className="mb-7 flex items-center justify-between gap-6 rounded-lg border border-[#ded8cb] bg-[#eee9df] p-6 sm:p-8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-stone-500">
              Ruang untuk rasa ingin tahu
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight">
              Buku berikutnya.
              <br />
              <span className="italic">Sudut pandang yang berbeda.</span>
            </h2>
            <p className="mt-3 max-w-sm text-xs leading-6 text-stone-600">
              Temukan cerita yang menginspirasi, pengetahuan yang memperkaya,
              dan halaman yang ingin Anda baca lagi.
            </p>
          </div>
          <div aria-hidden="true" className="hidden shrink-0 gap-2 sm:flex">
            <BookCover
              book={data.books[0] || { judul: "Koleksi perpustakaan" }}
              className="h-40 w-28 -rotate-6 rounded-sm shadow-lg"
            />
            {data.books[1] && (
              <BookCover
                book={data.books[1]}
                className="mt-5 hidden h-40 w-28 rotate-6 rounded-sm shadow-lg xl:block"
              />
            )}
          </div>
        </section>
      )}
      <section
        className={
          catalog
            ? ""
            : "overflow-hidden rounded-lg border border-stone-200 bg-white"
        }
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-4 ${catalog ? "mb-5" : "border-b border-stone-100 p-5"}`}
        >
          <div className="flex gap-5 text-xs">
            {[
              ["all", "Semua buku"],
              ["available", "Tersedia"],
              ["unavailable", "Tidak tersedia"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => updateFilter(setAvailability)(value)}
                className={`border-b pb-2 pt-2 ${availability === value ? "border-stone-900 font-medium text-stone-900" : "border-transparent text-stone-400 hover:text-stone-700"}`}
              >
                {label}
                {value === "all" && (
                  <span className="ml-1.5 rounded bg-stone-100 px-1.5 py-0.5 text-[9px] text-stone-500">
                    {data.books.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {!catalog && (
            <Button onClick={() => onEdit({})}>
              <Plus className="size-3.5" />
              Tambah buku
            </Button>
          )}
        </div>
        <div className={`flex flex-wrap gap-3 ${catalog ? "mb-6" : "p-5"}`}>
          <SearchInput
            value={search}
            onChange={updateFilter(setSearch)}
            placeholder="Cari judul atau penulis..."
            className="min-w-48 flex-1"
          />
          <div className="flex min-w-0 flex-wrap gap-2">
            <SlidersHorizontal className="my-auto hidden size-4 text-stone-400 sm:block" />
            <select
              aria-label="Filter genre"
              value={genre}
              onChange={(event) => updateFilter(setGenre)(event.target.value)}
              className="h-10 max-w-44 rounded-md border border-stone-200 bg-white px-3 text-[11px] text-stone-600"
            >
              <option value="">Semua genre</option>
              {data.genres.map((item) => (
                <option key={item.id_genre} value={item.id_genre}>
                  {item.nama_genre}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter penerbit"
              value={publisher}
              onChange={(event) =>
                updateFilter(setPublisher)(event.target.value)
              }
              className="h-10 max-w-44 rounded-md border border-stone-200 bg-white px-3 text-[11px] text-stone-600"
            >
              <option value="">Semua penerbit</option>
              {data.publishers.map((item) => (
                <option key={item.id_penerbit} value={item.id_penerbit}>
                  {item.nama_penerbit}
                </option>
              ))}
            </select>
          </div>
        </div>
        {books.length === 0 ? (
          <EmptyState
            title="Belum menemukan buku?"
            description="Coba judul, penulis, atau filter yang berbeda."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setGenre("");
                  setPublisher("");
                  setAvailability("all");
                }}
              >
                Hapus filter
              </Button>
            }
          />
        ) : catalog ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((book) => (
              <article
                key={book.id_buku}
                className="group overflow-hidden rounded-lg border border-stone-200 bg-white"
              >
                <button
                  className="flex w-full justify-center bg-[#efebe3] p-6"
                  onClick={() => setSelected(book)}
                  aria-label={`Lihat ${book.judul}`}
                >
                  <BookCover
                    book={book}
                    className="aspect-[2/3] w-full max-w-36 rounded-sm shadow-md transition-transform duration-300 group-hover:-translate-y-1"
                  />
                </button>
                <div className="p-4">
                  <p className="mb-2 text-[9px] uppercase tracking-wider text-stone-400">
                    {data.genres.find((item) => item.id_genre === book.id_genre)
                      ?.nama_genre || "Koleksi"}
                  </p>
                  <h3 className="font-serif text-xl">{book.judul}</h3>
                  <p className="mt-1 min-h-8 text-[10px] text-stone-500">
                    {book.penulis}
                  </p>
                  <div className="my-3">
                    <Badge tone={available(book) ? "success" : "neutral"}>
                      {available(book)
                        ? `${book.stok} tersedia`
                        : "Tidak tersedia"}
                    </Badge>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setSelected(book)}
                    disabled={!available(book)}
                  >
                    Pinjam buku
                    <ArrowRight className="ml-auto size-3.5" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead className="border-y border-stone-100 bg-[#FCFBF8] text-[9px] uppercase tracking-wider text-stone-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Judul buku</th>
                  <th className="px-4 py-3 font-medium">Genre</th>
                  <th className="px-4 py-3 font-medium">Stok</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((book) => (
                  <tr key={book.id_buku} className="hover:bg-stone-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <BookCover
                          book={book}
                          className="h-14 w-10 shrink-0 rounded-sm"
                        />
                        <div>
                          <h3 className="font-serif text-lg">{book.judul}</h3>
                          <p className="mt-1 text-[10px] text-stone-500">
                            {book.penulis}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 text-[11px] text-stone-500">
                      {data.genres.find(
                        (item) => item.id_genre === book.id_genre,
                      )?.nama_genre || "—"}
                    </td>
                    <td className="px-4 text-xs">
                      {book.stok}
                      <span className="ml-1 text-[9px] text-stone-400">
                        eks.
                      </span>
                    </td>
                    <td className="px-4">
                      <Badge tone={available(book) ? "success" : "neutral"}>
                        {available(book) ? "Tersedia" : "Tidak tersedia"}
                      </Badge>
                    </td>
                    <td className="px-5 text-right">
                      <button
                        aria-label={`Sunting ${book.judul}`}
                        onClick={() => onEdit(book)}
                        className="rounded p-2 text-stone-500 hover:bg-stone-100"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        aria-label={`Hapus ${book.judul}`}
                        onClick={() => {
                          setDeleting(book);
                          setError("");
                        }}
                        className="ml-1 rounded p-2 text-stone-400 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={currentPage}
          setPage={setPage}
          total={books.length}
          pageSize={pageSize}
        />
      </section>
      {selected && (
        <BorrowDialog
          book={selected}
          user={user}
          data={data}
          perform={perform}
          saving={saving}
          onClose={() => setSelected(null)}
          notify={notify}
        />
      )}
      {deleting && (
        <Modal
          title="Hapus dari koleksi?"
          onClose={() => !saving && setDeleting(null)}
        >
          <p className="text-sm leading-6 text-stone-600">
            Buku{" "}
            <strong className="font-medium text-stone-900">
              {deleting.judul}
            </strong>{" "}
            akan dihapus dari katalog. Buku yang masih dipinjam tidak dapat
            dihapus.
          </p>
          {error && (
            <div className="mt-4">
              <Notice error>{error}</Notice>
            </div>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setDeleting(null)}
            >
              Batal
            </Button>
            <Button variant="danger" busy={saving} onClick={removeBook}>
              Hapus buku
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
