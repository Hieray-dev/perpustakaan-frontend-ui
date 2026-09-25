import { useCallback, useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

const BOOKS_STORAGE_KEY = 'books';
const LEGACY_BOOKS_STORAGE_KEY = 'books_data';
const BOOK_COVER_PALETTES = [
  'from-[#8b6c54] via-[#b49a7d] to-[#d9c7ae]',
  'from-[#487b82] via-[#8fb4ad] to-[#d4dfd5]',
  'from-[#967252] via-[#cfad87] to-[#e4d2b9]',
  'from-[#48595e] via-[#7c8d91] to-[#c0c8c4]',
];
const MOCK_BOOKS = [
  { id_buku: 1, judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', penerbit: 'Lentera Dipantara', genre: 'Novel', stok: 5, status: 'Tersedia', description: 'Novel pembuka Tetralogi Buru tentang Minke, pendidikan, dan pergulatan manusia di tengah kolonialisme.', isbn: '9789799731234', tanggalTerbit: 'Agustus 1980', halaman: 535, bahasa: 'Indonesia', coverUrl: '/covers/bumi-manusia.png', cover: BOOK_COVER_PALETTES[0] },
  { id_buku: 2, judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', penerbit: 'Bentang Pustaka', genre: 'Drama', stok: 3, status: 'Tersedia', description: 'Kisah persahabatan sepuluh anak Belitung yang memperjuangkan pendidikan dan mimpi mereka.', isbn: '9789793062792', tanggalTerbit: 'April 2005', halaman: 529, bahasa: 'Indonesia', coverUrl: '/covers/laskar-pelangi.png', cover: BOOK_COVER_PALETTES[1] },
  { id_buku: 3, judul: 'Filosofi Teras', penulis: 'Henry Manampiring', penerbit: 'Kompas', genre: 'Self-Improvement', stok: 2, status: 'Tersedia', description: 'Pengantar praktis untuk menerapkan filsafat Stoa dalam menghadapi tantangan kehidupan sehari-hari.', isbn: '9786024125189', tanggalTerbit: 'Juni 2018', halaman: 346, bahasa: 'Indonesia', coverUrl: '/covers/filosofi-teras.png', cover: BOOK_COVER_PALETTES[2] },
  { id_buku: 4, judul: 'Laut Bercerita', penulis: 'Leila S. Chudori', penerbit: 'KPG', genre: 'Fiksi Sejarah', stok: 0, status: 'Dipinjam', description: 'Novel tentang kehilangan, persahabatan, dan ingatan keluarga dalam pusaran sejarah Indonesia.', isbn: '9786024246946', tanggalTerbit: 'Oktober 2017', halaman: 379, bahasa: 'Indonesia', coverUrl: '/covers/laut-bercerita.png', cover: BOOK_COVER_PALETTES[3] },
];

const getInitials = (name = 'Pengguna') => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const getBookCoverPalette = (title = '') => BOOK_COVER_PALETTES[[...String(title)].reduce((total, character) => total + character.charCodeAt(0), 0) % BOOK_COVER_PALETTES.length];

export function normalizeBook(value, index = 0) {
  if (!value || typeof value !== 'object') return null;
  const title = String(value.judul || value.title || '').trim();
  if (!title) return null;
  const stock = Number(value.stok ?? value.stock ?? 0);
  const description = String(value.deskripsi || value.description || '').trim();
  const coverUrl = String(value.cover_url || value.coverUrl || '').trim();
  const publishedDate = String(value.tanggal_terbit || value.tanggalTerbit || '').trim();
  return { ...value, id_buku: value.id_buku || value.id || `book-${index}`, judul: title, penulis: String(value.penulis || value.author || '').trim(), penerbit: String(value.penerbit || value.publisher || '').trim(), genre: String(value.genre || value.kategori || value.nama_genre || '').trim(), stok: Number.isFinite(stock) ? stock : 0, status: value.status || (stock > 0 ? 'Tersedia' : 'Dipinjam'), description, deskripsi: description, isbn: String(value.isbn || value.ISBN || '').trim(), tanggal_terbit: publishedDate, tanggalTerbit: publishedDate, bahasa: String(value.bahasa || value.language || 'Indonesia').trim(), jumlah_halaman: value.jumlah_halaman ?? value.halaman ?? value.pages ?? '', halaman: value.jumlah_halaman ?? value.halaman ?? value.pages ?? '', cover_url: coverUrl, coverUrl, initials: value.initials || getInitials(title), cover: value.cover || getBookCoverPalette(title) };
}

function readBookData() {
  try {
    const savedBooks = JSON.parse(window.localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
    const legacyBooks = savedBooks.length ? savedBooks : JSON.parse(window.localStorage.getItem(LEGACY_BOOKS_STORAGE_KEY) || '[]');
    return Array.isArray(legacyBooks) ? legacyBooks.map(normalizeBook).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeBookData(books) {
  const serializedBooks = JSON.stringify(books);
  window.localStorage.setItem(BOOKS_STORAGE_KEY, serializedBooks);
  window.localStorage.setItem(LEGACY_BOOKS_STORAGE_KEY, serializedBooks);
}

async function saveBookToBackend(form, method, id) {
  const endpoint = `http://localhost:8080/api/buku${id ? `/${encodeURIComponent(id)}` : ''}`;
  const payload = { ...form, cover_url: form.coverUrl?.trim() || '' };
  const body = form.coverFile ? (() => { const data = new FormData(); Object.entries(payload).forEach(([key, value]) => { if (value !== undefined && key !== 'coverFile' && key !== 'coverPreview') data.append(key, String(value ?? '')); }); data.append('cover', form.coverFile); return data; })() : JSON.stringify(payload);
  const response = await fetch(endpoint, { method, headers: body instanceof FormData ? { Authorization: `Bearer ${getToken()}` } : { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body });
  if (!response.ok) throw new Error('Backend buku tidak merespons dengan sukses');
  return response.json().catch(() => null);
}

export default function useBooks({ onNotice }) {
  const [books, setBooks] = useState(() => { const savedBooks = readBookData(); return savedBooks.length ? savedBooks : MOCK_BOOKS.map(normalizeBook).filter(Boolean); });
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (books.length) writeBookData(books);
  }, [books]);

  const fetchBooks = useCallback(async () => {
    const savedBooks = readBookData();
    if (savedBooks.length) { setBooks(savedBooks); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/buku', { headers: { Authorization: `Bearer ${getToken()}` } });
      const result = await response.json();
      const data = Array.isArray(result) ? result : result?.data;
      if (!Array.isArray(data)) throw new Error('Format data tidak sesuai');
      setBooks(data.length ? data.map(normalizeBook).filter(Boolean) : MOCK_BOOKS.map(normalizeBook).filter(Boolean));
    } catch {
      const fallback = readBookData();
      setBooks(fallback.length ? fallback : MOCK_BOOKS.map(normalizeBook).filter(Boolean));
      onNotice?.(fallback.length ? 'Menampilkan katalog buku yang tersimpan di perangkat.' : 'Menampilkan data demo karena server katalog belum terhubung.');
    } finally {
      setLoading(false);
    }
  }, [onNotice]);

  const handleSaveBook = useCallback(async (form, book = null) => {
    try { await saveBookToBackend(form, book ? 'PUT' : 'POST', book?.id_buku); } catch { onNotice?.(`Perubahan disimpan lokal karena backend tidak tersedia.`); }
    const coverUrl = form.coverUrl.trim() || form.coverPreview || '';
    const description = form.description.trim();
    const normalized = normalizeBook({ ...book, id_buku: book?.id_buku || Date.now(), judul: form.judul.trim(), penulis: form.penulis.trim(), penerbit: form.penerbit.trim(), genre: form.genre.trim(), isbn: form.isbn.trim(), tanggal_terbit: form.tanggalTerbit.trim(), tanggalTerbit: form.tanggalTerbit.trim(), jumlah_halaman: form.jumlah_halaman.trim(), halaman: form.jumlah_halaman.trim(), bahasa: form.bahasa, description, deskripsi: description, coverUrl, cover_url: coverUrl, stok: Number(form.stok), status: Number(form.stok) > 0 ? 'Tersedia' : 'Dipinjam', initials: getInitials(form.judul.trim()) });
    setBooks((current) => book ? current.map((item) => item.id_buku === normalized.id_buku ? normalized : item) : [...current, normalized]);
    setSelectedBook(normalized);
    onNotice?.(book ? 'Data buku berhasil diperbarui.' : 'Buku baru ditambahkan ke daftar lokal.');
    return normalized;
  }, [onNotice]);

  const handleDeleteBook = useCallback((book) => {
    if (!book) return;
    setBooks((current) => current.filter((item) => item.id_buku !== book.id_buku));
    setSelectedBook(null);
    onNotice?.(`Buku ${book.judul} berhasil dihapus.`);
  }, [onNotice]);

  return { books, setBooks, loading, selectedBook, setSelectedBook, fetchBooks, handleSaveBook, handleDeleteBook };
}
