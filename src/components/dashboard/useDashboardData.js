import { useCallback, useRef, useState } from "react";
import useSWR from "swr";
import api from "../../api/client";
import { activeLoan, createDemoData, dateKey, relativeDate } from "./data";

// Keep the backend contract in one place; /buku is the existing catalog endpoint.
export const endpoints = {
  books: "/buku",
  genres: "/api/genre",
  publishers: "/api/penerbit",
  statuses: "/api/status",
  loans: "/api/peminjaman",
  returns: "/api/pengembalian",
  facilities: "/api/fasilitas",
  users: "/api/user",
  shifts: "/api/jadwal_shift",
  attendance: "/api/absensi",
};
const idFields = {
  books: "id_buku",
  loans: "id_peminjaman",
  facilities: "id_fasilitas",
  users: "id_user",
  shifts: "id_shift",
  attendance: "id_absensi",
  returns: "id_pengembalian",
};

async function loadData(user, demo) {
  const fallback = createDemoData(user);
  if (demo) return { ...fallback, isDemo: true };
  const role = Number(user.id_role);
  const resources = ["books", "genres", "publishers", "statuses", "loans"];
  if (role !== 3)
    resources.push("facilities", "users", "shifts", "attendance", "returns");
  try {
    if (role === 3 && !user.id_user)
      throw new Error(
        "Identitas anggota tidak lengkap. Silakan masuk kembali.",
      );
    const entries = await Promise.all(
      resources.map(async (resource) => {
        const scoped =
          (role === 3 && resource === "loans") ||
          (role === 2 && ["shifts", "attendance"].includes(resource));
        if (scoped && !user.id_user)
          throw new Error(
            "Identitas pengguna tidak lengkap. Silakan masuk kembali.",
          );
        const response = await api.get(
          resource === "users" && role === 2
            ? "/api/anggota"
            : endpoints[resource],
          {
            timeout: 5000,
            params: scoped ? { id_user: user.id_user } : undefined,
          },
        );
        const items = Array.isArray(response.data)
          ? response.data
          : response.data?.data;
        if (!Array.isArray(items))
          throw new Error(`Format respons ${resource} tidak valid.`);
        return [resource, items];
      }),
    );
    const empty = Object.fromEntries(
      Object.keys(fallback).map((key) => [key, []]),
    );
    return { ...empty, ...Object.fromEntries(entries), isDemo: false };
  } catch (error) {
    const status = error.response?.status;
    if (status === 401 || status === 403)
      throw new Error(
        status === 401
          ? "Sesi berakhir. Silakan masuk kembali."
          : "Anda tidak memiliki izin untuk mengakses data ini.",
        { cause: error },
      );
    if (
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      status === 404 ||
      status >= 500
    )
      return {
        ...fallback,
        isDemo: true,
        fallbackReason: "Backend belum tersedia atau endpoint belum lengkap.",
      };
    throw error;
  }
}

export default function useDashboardData(user, demo) {
  const role = Number(user.id_role);
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    [
      "library-dashboard",
      demo ? "demo" : "live",
      user.id_user || user.username,
      role,
    ],
    () => loadData(user, demo),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  const pending = useRef(false);
  const [saving, setSaving] = useState(false);

  const perform = useCallback(
    async (resource, payload, { id, method = "POST", operation } = {}) => {
      if (pending.current)
        throw new Error("Permintaan sebelumnya masih diproses.");
      if (!data) throw new Error("Data belum siap.");
      if (![1, 2, 3].includes(role))
        throw new Error("Peran pengguna tidak valid.");
      if (role === 3 && resource !== "loans")
        throw new Error("Tindakan ini hanya untuk petugas.");
      if (["users", "shifts"].includes(resource) && role !== 1)
        throw new Error("Tindakan ini hanya untuk administrator.");
      if (!demo && !user.id_user && ["loans", "attendance"].includes(resource))
        throw new Error(
          "Identitas pengguna tidak lengkap. Silakan masuk kembali.",
        );
      if (operation === "borrow") {
        const book = data.books.find(
          (item) => item.id_buku === payload.id_buku,
        );
        if (!book || Number(book.stok) < 1 || Number(book.id_status) === 2)
          throw new Error("Buku sedang tidak tersedia.");
        if (
          data.loans.some(
            (loan) =>
              loan.id_user === payload.id_user &&
              loan.id_buku === payload.id_buku &&
              activeLoan(loan),
          )
        )
          throw new Error("Buku ini masih dalam peminjaman Anda.");
      }
      if (operation === "return") {
        const loan = data.loans.find(
          (item) => item.id_peminjaman === payload.id_peminjaman,
        );
        if (!loan || !activeLoan(loan))
          throw new Error("Peminjaman ini sudah diselesaikan.");
      }
      if (
        resource === "books" &&
        method === "DELETE" &&
        data.loans.some((loan) => loan.id_buku === id && activeLoan(loan))
      )
        throw new Error("Buku yang masih dipinjam tidak dapat dihapus.");
      pending.current = true;
      setSaving(true);
      try {
        if (!data.isDemo) {
          await api.request({
            url: `${endpoints[resource]}${id && resource !== "attendance" ? `/${encodeURIComponent(id)}` : ""}`,
            method,
            data: payload,
            timeout: 15000,
          });
          await mutate();
          return "Perubahan berhasil disimpan.";
        }
        await mutate(
          (current) => {
            const next = structuredClone(current);
            const key = idFields[resource];
            if (operation === "borrow") {
              const loanId =
                Math.max(
                  0,
                  ...next.loans.map((item) => Number(item.id_peminjaman)),
                ) + 1;
              next.loans.unshift({
                ...payload,
                id_peminjaman: loanId,
                kode_transaksi: `PJM-${dateKey().replaceAll("-", "")}-${String(loanId).padStart(3, "0")}`,
                tanggal_peminjaman: dateKey(),
                batas_waktu: relativeDate(7),
                denda: 0,
                status: "Menunggu",
              });
              const book = next.books.find(
                (item) => item.id_buku === payload.id_buku,
              );
              book.stok = Number(book.stok) - 1;
            } else if (operation === "return") {
              const loan = next.loans.find(
                (item) => item.id_peminjaman === payload.id_peminjaman,
              );
              loan.status = "Dikembalikan";
              const book = next.books.find(
                (item) => item.id_buku === loan.id_buku,
              );
              if (book) book.stok = Number(book.stok) + 1;
              next.returns.push({
                id_pengembalian: Date.now(),
                ...payload,
                tanggal_pengembalian: dateKey(),
                denda: loan.denda,
              });
            } else if (method === "DELETE") {
              next[resource] = next[resource].filter(
                (item) => item[key] !== id,
              );
            } else if (id) {
              next[resource] = next[resource].map((item) =>
                item[key] === id ? { ...item, ...payload } : item,
              );
            } else {
              next[resource].push({
                ...payload,
                [key]:
                  Math.max(
                    0,
                    ...next[resource].map((item) => Number(item[key])),
                  ) + 1,
              });
            }
            return next;
          },
          { revalidate: false },
        );
        return "Simulasi berhasil. Perubahan demo tidak disimpan ke server.";
      } catch (error) {
        const status = error.response?.status;
        throw new Error(
          status === 401
            ? "Sesi berakhir. Silakan masuk kembali."
            : status === 403
              ? "Server menolak akses untuk peran Anda."
              : error.response?.data?.message ||
                (error.code
                  ? "Status penyimpanan belum dapat dipastikan. Muat ulang data sebelum mencoba lagi."
                  : error.message),
          { cause: error },
        );
      } finally {
        pending.current = false;
        setSaving(false);
      }
    },
    [data, demo, mutate, role, user.id_user],
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    reload: mutate,
    perform,
    saving,
  };
}
