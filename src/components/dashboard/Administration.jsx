import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  Pencil,
  Plus,
  Sofa,
  Trash2,
  Users,
} from "lucide-react";
import { dateKey, formatDate, initials, roleNames } from "./data";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Modal,
  Notice,
  SearchInput,
  StatusBadge,
} from "./ui";

export function Facilities({ data, perform, saving, notify }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const items = data.facilities.filter((item) =>
    item.nama_fasilitas.toLowerCase().includes(search.toLowerCase()),
  );
  async function submit(event) {
    event.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      nama_fasilitas: values.nama_fasilitas.trim(),
      jumlah: Number(values.jumlah),
      kondisi: values.kondisi,
    };
    if (
      !payload.nama_fasilitas ||
      !Number.isInteger(payload.jumlah) ||
      payload.jumlah < 0
    )
      return setError(
        "Nama wajib diisi dan jumlah harus bilangan bulat positif atau nol.",
      );
    try {
      notify(
        await perform("facilities", payload, {
          id: editing.id_fasilitas,
          method: editing.id_fasilitas ? "PUT" : "POST",
        }),
      );
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }
  async function remove() {
    setError("");
    try {
      notify(
        await perform("facilities", undefined, {
          id: deleting.id_fasilitas,
          method: "DELETE",
        }),
      );
      setDeleting(null);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <section>
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari fasilitas..."
          className="min-w-48 flex-1"
        />
        <Button
          onClick={() => {
            setEditing({});
            setError("");
          }}
        >
          <Plus className="size-3.5" />
          Tambah fasilitas
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id_fasilitas}
            className="rounded-lg border border-stone-200 bg-white p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-md border border-stone-200 bg-[#FAF7F2] p-3">
                <Sofa className="size-5 text-stone-600" strokeWidth={1.3} />
              </span>
              <StatusBadge status={item.kondisi} />
            </div>
            <h2 className="font-serif text-xl">{item.nama_fasilitas}</h2>
            <p className="mt-2 text-xs text-stone-500">
              {item.jumlah} unit tercatat
            </p>
            <div className="mt-5 flex justify-end gap-1 border-t border-stone-100 pt-3">
              <button
                aria-label={`Sunting ${item.nama_fasilitas}`}
                className="rounded-md p-2 text-stone-500 hover:bg-stone-100"
                onClick={() => {
                  setEditing(item);
                  setError("");
                }}
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                aria-label={`Hapus ${item.nama_fasilitas}`}
                className="rounded-md p-2 text-stone-400 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  setDeleting(item);
                  setError("");
                }}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <EmptyState
          title="Tidak ada fasilitas"
          description="Tambahkan fasilitas atau coba pencarian yang berbeda."
        />
      )}
      {editing && (
        <Modal
          title={
            editing.id_fasilitas ? "Sunting fasilitas" : "Tambah fasilitas"
          }
          onClose={() => !saving && setEditing(null)}
        >
          <form onSubmit={submit} className="space-y-4">
            <Field
              label="Nama fasilitas"
              name="nama_fasilitas"
              defaultValue={editing.nama_fasilitas || ""}
              maxLength={150}
              required
            />
            <Field
              label="Jumlah unit"
              name="jumlah"
              type="number"
              min="0"
              max="100000"
              step="1"
              defaultValue={editing.jumlah ?? 1}
              required
            />
            <Field
              label="Kondisi"
              name="kondisi"
              defaultValue={editing.kondisi || "Baik"}
            >
              {["Baik", "Perlu perbaikan", "Rusak"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </Field>
            {data.isDemo && (
              <Notice>Perubahan demo tidak disimpan ke server.</Notice>
            )}
            {error && <Notice error>{error}</Notice>}
            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="secondary"
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
              >
                Batal
              </Button>
              <Button type="submit" busy={saving}>
                Simpan fasilitas
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Hapus fasilitas?"
          onClose={() => !saving && setDeleting(null)}
        >
          <p className="text-sm text-stone-600">
            Hapus {deleting.nama_fasilitas} dari inventaris perpustakaan?
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
            <Button variant="danger" busy={saving} onClick={remove}>
              Hapus fasilitas
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}

export function Employees({ data, user, perform, saving, notify }) {
  const [tab, setTab] = useState("users");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [resource, setResource] = useState("users");
  const [error, setError] = useState("");
  const users = data.users.filter((item) =>
    item.username.toLowerCase().includes(search.toLowerCase()),
  );
  const staff = data.users.filter((item) =>
    [1, 2].includes(Number(item.id_role)),
  );
  function openEditor(type, record) {
    setResource(type);
    setEditing(record);
    setError("");
  }
  async function submit(event) {
    event.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const payload =
      resource === "shifts"
        ? {
            nama_shift: values.nama_shift.trim(),
            id_user: Number(values.id_user),
            jam_masuk: values.jam_masuk,
            jam_keluar: values.jam_keluar,
          }
        : {
            username: values.username.trim(),
            email: values.email.trim(),
            id_role: Number(
              editing.id_user === user.id_user ? user.id_role : values.id_role,
            ),
          };
    if (
      resource === "shifts" &&
      (!payload.nama_shift || payload.jam_masuk === payload.jam_keluar)
    )
      return setError(
        "Nama shift wajib diisi dan jam masuk harus berbeda dari jam keluar.",
      );
    if (resource === "users" && !payload.username)
      return setError("Nama pengguna wajib diisi.");
    const id = resource === "shifts" ? editing.id_shift : editing.id_user;
    try {
      notify(
        await perform(resource, payload, { id, method: id ? "PUT" : "POST" }),
      );
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-5">
        <div className="flex gap-5">
          {[
            ["users", "Pengguna & akses", Users],
            ["shifts", "Jadwal shift", CalendarDays],
          ].map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex items-center gap-2 border-b pb-2 text-xs ${tab === value ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400"}`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
        {tab === "shifts" && (
          <Button onClick={() => openEditor("shifts", {})}>
            <Plus className="size-3.5" />
            Tambah shift
          </Button>
        )}
      </div>
      {tab === "users" ? (
        <>
          <div className="p-5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari nama pengguna..."
            />
            <p className="mt-3 text-[10px] leading-5 text-stone-500">
              Kelola peran akun yang sudah terdaftar. {staff.length}{" "}
              administrator dan pustakawan bertugas.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-xs">
              <thead className="border-y border-stone-100 bg-[#FCFBF8] text-[9px] uppercase tracking-wider text-stone-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Pengguna</th>
                  <th className="px-5 py-3 font-medium">Peran</th>
                  <th className="px-5 py-3 font-medium">Shift</th>
                  <th className="px-5 py-3 text-right font-medium">Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((item) => (
                  <tr key={item.id_user}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-[#efebe2] font-serif text-xs">
                          {initials(item.username)}
                        </span>
                        <div>
                          <p className="text-xs">{item.username}</p>
                          <p className="mt-1 text-[10px] text-stone-400">
                            {item.email || `ID ${item.id_user}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5">
                      <Badge dot={false}>
                        {roleNames[Number(item.id_role)] || "Tidak diketahui"}
                      </Badge>
                    </td>
                    <td className="px-5 text-[11px] text-stone-500">
                      {data.shifts.find(
                        (shift) => shift.id_user === item.id_user,
                      )?.nama_shift || "—"}
                    </td>
                    <td className="px-5 text-right">
                      <button
                        aria-label={`Sunting akses ${item.username}`}
                        onClick={() => openEditor("users", item)}
                        className="rounded-md p-2 text-stone-500 hover:bg-stone-100"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!users.length && <EmptyState title="Pengguna tidak ditemukan" />}
        </>
      ) : (
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {data.shifts.map((shift) => (
            <article
              key={shift.id_shift}
              className="rounded-lg border border-stone-200 bg-[#FAF7F2] p-5"
            >
              <div className="flex items-center justify-between">
                <Clock3 className="size-5 text-stone-400" strokeWidth={1.3} />
                <button
                  aria-label={`Sunting ${shift.nama_shift}`}
                  onClick={() => openEditor("shifts", shift)}
                  className="rounded p-2 hover:bg-stone-200"
                >
                  <Pencil className="size-3.5 text-stone-500" />
                </button>
              </div>
              <h2 className="mt-4 font-serif text-xl">{shift.nama_shift}</h2>
              <p className="mt-2 text-lg tabular-nums text-stone-700">
                {shift.jam_masuk?.slice(0, 5)} – {shift.jam_keluar?.slice(0, 5)}
              </p>
              <p className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-500">
                {data.users.find((item) => item.id_user === shift.id_user)
                  ?.username || `Pengguna #${shift.id_user}`}
              </p>
            </article>
          ))}
          {!data.shifts.length && <EmptyState title="Belum ada jadwal shift" />}
        </div>
      )}
      {editing && (
        <Modal
          title={
            resource === "users"
              ? "Kelola akses pengguna"
              : editing.id_shift
                ? "Sunting jadwal shift"
                : "Tambah jadwal shift"
          }
          onClose={() => !saving && setEditing(null)}
        >
          <form onSubmit={submit} className="space-y-4">
            {resource === "users" ? (
              <>
                <Field
                  label="Nama pengguna"
                  name="username"
                  defaultValue={editing.username}
                  required
                  maxLength={150}
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={editing.email || ""}
                  maxLength={200}
                />
                <Field
                  label="Peran pengguna"
                  name="id_role"
                  defaultValue={editing.id_role}
                  disabled={editing.id_user === user.id_user}
                >
                  {Object.entries(roleNames).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </Field>
                {editing.id_user === user.id_user && (
                  <p className="text-[11px] leading-5 text-stone-500">
                    Peran akun Anda sendiri tidak dapat diubah untuk mencegah
                    kehilangan akses administrator.
                  </p>
                )}
              </>
            ) : (
              <>
                <Field
                  label="Nama shift"
                  name="nama_shift"
                  defaultValue={editing.nama_shift || ""}
                  required
                  maxLength={100}
                />
                <Field
                  label="Karyawan"
                  name="id_user"
                  defaultValue={editing.id_user || ""}
                  required
                >
                  <option value="" disabled>
                    Pilih karyawan
                  </option>
                  {staff.map((item) => (
                    <option key={item.id_user} value={item.id_user}>
                      {item.username}
                    </option>
                  ))}
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Jam masuk (WIB)"
                    name="jam_masuk"
                    type="time"
                    defaultValue={editing.jam_masuk?.slice(0, 5) || "08:00"}
                    required
                  />
                  <Field
                    label="Jam keluar (WIB)"
                    name="jam_keluar"
                    type="time"
                    defaultValue={editing.jam_keluar?.slice(0, 5) || "16:00"}
                    required
                  />
                </div>
              </>
            )}
            {data.isDemo && (
              <Notice>Mode demo: tidak mengubah akun atau jadwal asli.</Notice>
            )}
            {error && <Notice error>{error}</Notice>}
            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => setEditing(null)}
              >
                Batal
              </Button>
              <Button type="submit" busy={saving}>
                Simpan perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

export function AttendanceReport({ data }) {
  const [date, setDate] = useState(dateKey());
  const [search, setSearch] = useState("");
  const records = data.attendance.filter(
    (item) =>
      (!date || String(item.tanggal).slice(0, 10) === date) &&
      (data.users.find((user) => user.id_user === item.id_user)?.username || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const status = (record) => {
    const shift = data.shifts.find((item) => item.id_shift === record.id_shift);
    if (!record.jam_masuk_aktual) return "Belum absen";
    return shift
      ? record.jam_masuk_aktual.slice(0, 5) > shift.jam_masuk.slice(0, 5)
        ? "Terlambat"
        : "Tepat Waktu"
      : "Tanpa jadwal";
  };
  return (
    <>
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          [
            "Tercatat hadir",
            records.filter((item) => item.jam_masuk_aktual).length,
          ],
          [
            "Tepat waktu",
            records.filter((item) => status(item) === "Tepat Waktu").length,
          ],
          [
            "Terlambat",
            records.filter((item) => status(item) === "Terlambat").length,
          ],
        ].map(([label, count]) => (
          <div
            key={label}
            className="rounded-lg border border-stone-200 bg-white p-5"
          >
            <p className="text-[10px] text-stone-500">{label}</p>
            <p className="mt-3 font-serif text-3xl">{count}</p>
          </div>
        ))}
      </div>
      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari nama karyawan..."
            className="min-w-48 flex-1"
          />
          <input
            type="date"
            aria-label="Tanggal laporan absensi"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-10 rounded-md border border-stone-200 bg-white px-3 text-xs text-stone-600"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-[11px]">
            <thead className="border-y border-stone-100 bg-[#FCFBF8] text-[9px] uppercase tracking-wider text-stone-400">
              <tr>
                {[
                  "Karyawan",
                  "Tanggal",
                  "Jadwal masuk",
                  "Masuk aktual",
                  "Keluar aktual",
                  "Status",
                ].map((label) => (
                  <th key={label} className="px-5 py-3 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {records.map((record) => (
                <tr key={record.id_absensi}>
                  <td className="px-5 py-5">
                    {data.users.find((item) => item.id_user === record.id_user)
                      ?.username || `Pengguna #${record.id_user}`}
                  </td>
                  <td className="px-5 text-stone-500">
                    {formatDate(record.tanggal)}
                  </td>
                  <td className="px-5 text-stone-500">
                    {data.shifts
                      .find((item) => item.id_shift === record.id_shift)
                      ?.jam_masuk?.slice(0, 5) || "—"}
                  </td>
                  <td className="px-5">
                    {record.jam_masuk_aktual?.slice(0, 5) || "—"}
                  </td>
                  <td className="px-5">
                    {record.jam_keluar_aktual?.slice(0, 5) || "—"}
                  </td>
                  <td className="px-5">
                    <StatusBadge status={status(record)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!records.length && (
          <EmptyState
            title="Tidak ada catatan absensi"
            description="Pilih tanggal lain atau ubah pencarian karyawan."
          />
        )}
        <p className="border-t border-stone-100 px-5 py-4 text-[10px] text-stone-400">
          Semua jam ditampilkan dalam Waktu Indonesia Barat (WIB).
        </p>
      </section>
    </>
  );
}
