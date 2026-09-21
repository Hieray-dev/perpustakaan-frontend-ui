import { useEffect, useRef, useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';

export function Button({ children, secondary = false, className = '', ...props }) {
  return <button className={`dash-button ${secondary ? 'dash-button-secondary' : 'dash-button-primary'} ${className}`} {...props}>{children}</button>;
}

export function Badge({ children, tone = 'neutral' }) {
  const colors = { neutral: 'bg-stone-100 text-stone-600', success: 'bg-[#eef2e9] text-[#536346]', warning: 'bg-[#faf0e3] text-[#90682f]', danger: 'bg-[#faeeeb] text-[#a04e43]' };
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 text-[10px] font-medium ${colors[tone] || colors.neutral}`}><span aria-hidden="true" className="size-1 rounded-full bg-current" />{children}</span>;
}

export function SearchInput({ value, onChange, placeholder = 'Cari judul atau penulis…', label = 'Cari buku' }) {
  return <div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" /><input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className="dash-input pl-10" /></div>;
}

export function EmptyState({ title = 'Belum ada data', description = 'Data akan tampil di sini setelah ditambahkan.' }) {
  return <div className="flex flex-col items-center gap-3 px-6 py-14 text-center"><BookOpen aria-hidden="true" className="size-7 text-stone-400" strokeWidth={1.3} /><h3 className="font-serif text-xl">{title}</h3><p className="max-w-sm text-xs leading-6 text-stone-500">{description}</p></div>;
}

export function BookCover({ book, className = '' }) {
  const [broken, setBroken] = useState(false);
  const source = book.gambar ? new URL(book.gambar, 'http://localhost:8080/').href : null;
  if (source && !broken && /^https?:/.test(source)) return <img src={source} alt={`Sampul ${book.judul}`} onError={() => setBroken(true)} loading="lazy" className={`object-cover ${className}`} />;
  if (book.cover !== undefined) return <div role="img" aria-label={`Ilustrasi sampul ${book.judul}`} className={`bg-cover ${className}`} style={{ backgroundImage: 'url(/images/book-covers.png)', backgroundSize: '300% 200%', backgroundPosition: `${(book.cover % 3) * 50}% ${Math.floor(book.cover / 3) * 100}%` }} />;
  return <div className={`flex items-center justify-center bg-stone-100 text-stone-400 ${className}`} role="img" aria-label={`Sampul ${book.judul} belum tersedia`}><BookOpen aria-hidden="true" className="size-6" strokeWidth={1.2} /></div>;
}

export function Modal({ title, description, onClose, children, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} aria-labelledby="dialog-title" aria-describedby={description ? 'dialog-description' : undefined} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }} className="dash-modal m-auto max-h-[90svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg border border-stone-200 bg-[#FAF7F2] p-0 text-stone-900 shadow-xl backdrop:bg-stone-950/35 backdrop:backdrop-blur-xs"><div className="p-6 sm:p-8"><div className="mb-6 flex items-start justify-between gap-4"><div><h2 id="dialog-title" className="font-serif text-2xl">{title}</h2>{description && <p id="dialog-description" className="mt-2 text-xs leading-6 text-stone-500">{description}</p>}</div><button disabled={busy} onClick={onClose} aria-label="Tutup dialog" className="rounded p-1.5 text-stone-500 hover:bg-stone-200 disabled:opacity-40"><X className="size-5" /></button></div>{children}</div></dialog>;
}
