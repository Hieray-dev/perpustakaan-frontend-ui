import { useEffect, useId, useRef } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X,
} from "lucide-react";

export function Button({
  children,
  variant = "primary",
  className = "",
  busy = false,
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-3.5 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variant === "primary" ? "border-stone-900 bg-stone-900 text-[#FAF7F2] hover:bg-stone-800" : variant === "danger" ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100" : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"} ${className}`}
      disabled={disabled || busy}
      {...props}
    >
      {busy && <Loader2 className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
}
export function Badge({ children, tone = "neutral", dot = true }) {
  const tones = {
    neutral: "bg-stone-100 text-stone-600",
    success: "bg-[#edf1e8] text-[#526046]",
    warning: "bg-[#f6eee1] text-[#886631]",
    danger: "bg-[#f8eae5] text-[#a05546]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${tones[tone] || tones.neutral}`}
    >
      {dot && <span className="size-1 rounded-full bg-current" />}
      {children}
    </span>
  );
}
export function StatusBadge({ status }) {
  return (
    <Badge
      tone={
        status === "Terlambat"
          ? "danger"
          : status === "Dikembalikan" ||
              status === "Tepat Waktu" ||
              status === "Baik"
            ? "success"
            : status === "Menunggu" || status === "Perlu perbaikan"
              ? "warning"
              : "neutral"
      }
    >
      {status}
    </Badge>
  );
}
export function SearchInput({
  value,
  onChange,
  placeholder = "Cari di sini...",
  className = "",
}) {
  return (
    <label className={`relative block ${className}`}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
      />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-stone-200 bg-white pl-9 pr-3 text-xs placeholder:text-stone-400"
      />
    </label>
  );
}
export function EmptyState({
  title = "Belum ada data",
  description = "Data akan muncul di sini setelah ditambahkan.",
  action,
}) {
  return (
    <div className="flex flex-col items-center px-5 py-14 text-center">
      <BookOpen strokeWidth={1.25} className="mb-4 size-8 text-stone-400" />
      <h3 className="font-serif text-xl">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-6 text-stone-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function Modal({ title, subtitle, onClose, children, wide = false }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`dashboard-modal m-auto max-h-[90svh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg border border-stone-200 bg-[#FAF7F2] p-0 text-stone-900 shadow-xl backdrop:bg-stone-950/35 ${wide ? "max-w-2xl" : "max-w-lg"}`}
    >
      <div className="p-6 sm:p-8" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-serif text-3xl tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-xs leading-5 text-stone-500">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-md p-2 text-stone-500 hover:bg-stone-200"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function Field({ label, children, ...props }) {
  const id = useId();
  const classes =
    "h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm";
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-medium text-stone-700">
        {label}
      </span>
      {children ? (
        <select id={id} className={classes} {...props}>
          {children}
        </select>
      ) : props.multiline ? (
        <textarea
          id={id}
          className={`${classes} min-h-24 py-3`}
          {...Object.fromEntries(
            Object.entries(props).filter(([key]) => key !== "multiline"),
          )}
        />
      ) : (
        <input id={id} className={classes} {...props} />
      )}
    </label>
  );
}
export function Pagination({ page, setPage, total, pageSize = 5 }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-5 py-4 text-[11px] text-stone-500">
      <span>
        Menampilkan {total ? (page - 1) * pageSize + 1 : 0}–
        {Math.min(page * pageSize, total)} dari {total} data
      </span>
      <div className="flex items-center gap-2">
        <button
          aria-label="Halaman sebelumnya"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="rounded border border-stone-200 p-1.5 disabled:opacity-30"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="px-1">
          {page} / {pages}
        </span>
        <button
          aria-label="Halaman berikutnya"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          className="rounded border border-stone-200 p-1.5 disabled:opacity-30"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
export function Notice({ children, error = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`flex items-center gap-2 rounded-md border px-4 py-3 text-xs leading-5 ${error ? "border-red-200 bg-red-50 text-red-800" : "border-stone-200 bg-stone-50 text-stone-600"}`}
    >
      {!error && <Check className="size-4 shrink-0" />}
      {children}
    </div>
  );
}
export function BookCover({ book, className = "" }) {
  const source = book.gambar;
  const safeSource =
    source &&
    (source.startsWith("/images/") || /^https?:\/\//i.test(source)
      ? source
      : `${"http://localhost:8080"}/${source.replace(/^\//, "")}`);
  return (
    <div className={`relative overflow-hidden bg-[#e9e5dc] ${className}`}>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
        <BookOpen className="size-6 text-stone-500" strokeWidth={1.2} />
        <span className="font-serif text-sm">{book.judul}</span>
      </div>
      {safeSource && (
        <img
          key={safeSource}
          src={safeSource}
          alt={`Sampul ${book.judul}`}
          loading="lazy"
          className="relative h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      )}
    </div>
  );
}
