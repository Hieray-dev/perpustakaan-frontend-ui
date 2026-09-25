import { useEffect, useRef, useState } from 'react';
import ModalShell from './ModalShell';

const BOOK_COVER_PALETTES = [
  'from-[#d9c8b8] via-[#e9dcd0] to-[#f4ede6]',
  'from-[#bfd5d1] via-[#dce9e4] to-[#eef3ed]',
  'from-[#d7c5dc] via-[#e9dce8] to-[#f4edf2]',
  'from-[#e4c8b5] via-[#f0ded0] to-[#f7eee7]',
  'from-[#c5d3e2] via-[#dfe8f0] to-[#f0f3f5]',
];

function getBookCoverPalette(title = '') {
  const hash = [...String(title)].reduce((total, character) => total + character.charCodeAt(0), 0);
  return BOOK_COVER_PALETTES[hash % BOOK_COVER_PALETTES.length];
}

function BookCover({ book }) {
  const rawCoverUrl = book.cover_url || book.coverUrl;
  const coverUrl = rawCoverUrl && !/^(https?:|data:|blob:|\/)/i.test(rawCoverUrl)
    ? `http://localhost:8080/uploads/${rawCoverUrl}`
    : rawCoverUrl;
  const title = book.judul || 'Koleksi buku';
  const [failedCoverUrl, setFailedCoverUrl] = useState('');
  const showFallback = !coverUrl || failedCoverUrl === coverUrl;

  return (
    <div className={`relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br ${book.cover || getBookCoverPalette(title)}`}>
      {coverUrl && !showFallback && <img src={coverUrl} alt={`Sampul ${title}`} className="absolute inset-0 size-full object-cover" onError={() => setFailedCoverUrl(coverUrl)} />}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,.3),transparent_60%)]" />
      {showFallback && <div className="absolute inset-x-4 bottom-4 border-l border-stone-700/30 pl-3 text-stone-800"><p className="max-w-[12ch] font-serif text-xl leading-tight tracking-[-0.03em] sm:text-2xl">{title}</p><p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-stone-700/70">Koleksi buku</p></div>}
    </div>
  );
}

export default function DetailBookModal({ book, onClose, onBorrow, onEdit, onDelete, canDelete = false }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpandDescription, setCanExpandDescription] = useState(false);
  const descriptionRef = useRef(null);
  const description = book?.description || book?.deskripsi || 'Deskripsi buku belum diisi.';
  const available = Number(book?.stok) > 0 || book?.status === 'Tersedia';

  useEffect(() => {
    const element = descriptionRef.current;
    if (!element) return undefined;
    const measureDescription = () => setCanExpandDescription(description.length >= 180 && element.scrollHeight > element.clientHeight + 1);
    measureDescription();
    window.addEventListener('resize', measureDescription);
    return () => window.removeEventListener('resize', measureDescription);
  }, [description]);

  if (!book) return null;
  const pageCount = book.jumlah_halaman ?? book.halaman ?? book.pages;
  const specifications = [
    ['ISBN', book.isbn || book.ISBN || 'Belum diisi'],
    ['Tanggal terbit', book.tanggal_terbit || book.tanggalTerbit || 'Belum diisi'],
    ['Jumlah halaman', pageCount ? `${pageCount} halaman` : 'Belum diisi'],
    ['Bahasa', book.bahasa || 'Indonesia'],
    ['Stok tersedia', `${book.stok || 0} buku`],
  ];

  return (
    <ModalShell title={book.judul} onClose={onClose}>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2.5">
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white"><BookCover book={book} /></div>
          <div className="flex flex-col gap-2.5">
            <button type="button" disabled={!available} onClick={() => onBorrow(book)} className="rounded-lg bg-stone-900 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300">{available ? 'Pinjam Buku' : 'Stok Habis'}</button>
            <button type="button" onClick={() => onEdit(book)} className="rounded-lg border border-stone-300 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50">Edit Data</button>
            {canDelete && <button type="button" onClick={() => onDelete(book)} className="rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">Hapus Buku</button>}
          </div>
        </div>
        <div className="min-w-0 md:col-span-2">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#f4eee6] px-2.5 py-1 text-[10px] font-medium text-[#876a4c]">{book.genre || 'Tanpa genre'}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${available ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>{available ? 'Tersedia' : 'Dipinjam'}</span></div>
          <h3 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.04em] text-stone-900">{book.judul}</h3>
          <p className="mt-2 text-sm text-stone-500">{book.penulis} <span className="text-stone-300">·</span> {book.penerbit || 'Penerbit tidak tersedia'}</p>
          <section className="mt-6 border-t border-stone-200 pt-5"><h4 className="font-serif text-lg text-stone-900">Deskripsi Buku</h4><p ref={descriptionRef} className={`mt-2 text-sm leading-6 text-stone-500 ${expanded ? '' : 'line-clamp-3'}`}>{description}</p>{canExpandDescription && <button type="button" onClick={() => setExpanded((current) => !current)} className="mt-2 text-xs font-semibold text-stone-800 underline underline-offset-4">{expanded ? 'Sembunyikan' : 'Lihat selengkapnya'}</button>}</section>
          <section className="mt-6 border-t border-stone-200 pt-5"><h4 className="font-serif text-lg text-stone-900">Detail spesifikasi</h4><dl className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">{specifications.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><dt className="text-stone-500">{label}</dt><dd className="text-right font-medium text-stone-800">{value}</dd></div>)}</dl></section>
        </div>
      </div>
    </ModalShell>
  );
}
