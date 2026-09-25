import { useEffect, useState } from 'react';
import ModalShell from './ModalShell';

const PUBLISHERS_STORAGE_KEY = 'custom_penerbit';
const GENRES_STORAGE_KEY = 'custom_genres';
const DEFAULT_PUBLISHERS = ['Lentera Dipantara', 'Bentang Pustaka', 'Kompas', 'KPG'];
const DEFAULT_GENRES = ['Novel', 'Drama', 'Self-Improvement', 'Fiksi Sejarah'];
const INPUT_CLASS = 'h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF7F2] px-3.5 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200';

function readOptions(key, defaults, currentValue = '') {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || '[]');
    return [...new Set([...defaults, ...(Array.isArray(saved) ? saved : []), currentValue].filter(Boolean))];
  } catch {
    return [...new Set([...defaults, currentValue].filter(Boolean))];
  }
}

function saveOptions(key, options, defaults) {
  window.localStorage.setItem(key, JSON.stringify(options.filter((option) => !defaults.includes(option))));
}

function initialForm(book) {
  return book
    ? { judul: book.judul || '', penulis: book.penulis || '', penerbit: book.penerbit || '', genre: book.genre || '', stok: String(book.stok || 0), coverUrl: book.cover_url || book.coverUrl || '', isbn: book.isbn || book.ISBN || '', tanggalTerbit: book.tanggal_terbit || book.tanggalTerbit || '', jumlah_halaman: String(book.jumlah_halaman ?? book.halaman ?? ''), bahasa: book.bahasa || 'Indonesia', description: book.description || book.deskripsi || '' }
    : { judul: '', penulis: '', penerbit: '', genre: '', stok: '0', coverUrl: '', isbn: '', tanggalTerbit: '', jumlah_halaman: '', bahasa: 'Indonesia', description: '' };
}

function FieldLabel({ label, children, className = '' }) {
  return <label className={className}><span className="mb-2 block text-xs font-medium text-stone-700">{label}</span>{children}</label>;
}

export default function EditBookModal({ onClose, onSave, onDelete, canDelete = false, book = null }) {
  const [form, setForm] = useState(() => initialForm(book));
  const [publishers, setPublishers] = useState(() => readOptions(PUBLISHERS_STORAGE_KEY, DEFAULT_PUBLISHERS, book?.penerbit));
  const [genres, setGenres] = useState(() => readOptions(GENRES_STORAGE_KEY, DEFAULT_GENRES, book?.genre));
  const [customPublisher, setCustomPublisher] = useState(false);
  const [customGenre, setCustomGenre] = useState(false);
  const [coverMethod, setCoverMethod] = useState(() => (book?.cover_file ? 'upload' : 'url'));
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(() => book?.cover_url || book?.coverUrl || '');

  useEffect(() => () => { if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview); }, [coverPreview]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleCoverFile = (event) => {
    const file = event.target.files?.[0];
    if (!file || !['image/jpeg', 'image/png'].includes(file.type)) return;
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };
  const chooseOption = (field, value) => {
    const isCustom = value === '__new__';
    if (field === 'penerbit') setCustomPublisher(isCustom);
    if (field === 'genre') setCustomGenre(isCustom);
    setForm((current) => ({ ...current, [field]: isCustom ? '' : value }));
  };
  const addOption = (field, value) => {
    const cleanValue = value.trim();
    if (!cleanValue) return;
    const isPublisher = field === 'penerbit';
    const options = isPublisher ? publishers : genres;
    const defaults = isPublisher ? DEFAULT_PUBLISHERS : DEFAULT_GENRES;
    const nextOptions = [...new Set([...options, cleanValue])];
    if (isPublisher) { setPublishers(nextOptions); saveOptions(PUBLISHERS_STORAGE_KEY, nextOptions, defaults); setCustomPublisher(false); } else { setGenres(nextOptions); saveOptions(GENRES_STORAGE_KEY, nextOptions, defaults); setCustomGenre(false); }
    setForm((current) => ({ ...current, [field]: cleanValue }));
  };
  const submit = (event) => {
    event.preventDefault();
    if (form.genre.trim()) addOption('genre', form.genre);
    if (form.penerbit.trim()) addOption('penerbit', form.penerbit);
    onSave({ ...form, coverMethod, coverFile, coverPreview });
  };

  const selectClass = `${INPUT_CLASS} appearance-none`;
  const coverField = <div className="rounded-xl border border-[#E5E0D8] bg-white p-5 sm:col-span-2"><span className="mb-3 block text-xs font-medium text-stone-700">Cover Buku</span><div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-stone-100 p-1.5"><button type="button" onClick={() => setCoverMethod('upload')} className={`rounded-md border px-3 py-2 text-xs font-medium transition ${coverMethod === 'upload' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 text-stone-600'}`}>Upload File (JPG/PNG)</button><button type="button" onClick={() => setCoverMethod('url')} className={`rounded-md border px-3 py-2 text-xs font-medium transition ${coverMethod === 'url' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 text-stone-600'}`}>Link URL External</button></div>{coverMethod === 'upload' ? <input type="file" accept="image/jpeg,image/png" onChange={handleCoverFile} className="w-full text-xs text-stone-600" /> : <input type="url" name="coverUrl" value={form.coverUrl} onChange={(event) => { update(event); setCoverPreview(event.target.value); }} placeholder="https://contoh.com/cover.jpg" className={INPUT_CLASS} />}{coverPreview && <img src={coverPreview} alt="Preview cover buku" className="mt-3 aspect-[2/3] h-36 w-24 rounded-md object-cover shadow-sm" onError={() => setCoverPreview('')} />}</div>;
  const publisherOptions = [...publishers, { value: '__new__', label: '+ Tambah penerbit baru' }];
  const genreOptions = [...genres, { value: '__new__', label: '+ Tambah genre baru' }];

  return <ModalShell footerInsideForm eyebrow="Koleksi" title={book ? 'Edit data buku' : 'Tambah buku'} onClose={onClose} footer={<><div>{canDelete && book && <button type="button" onClick={() => onDelete(book)} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50">Hapus Buku</button>}</div><div className="flex gap-3"><button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100">Batal</button><button type="submit" form="book-form" className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800">Simpan perubahan</button></div></>}><form id="book-form" onSubmit={submit}><div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4"><div className="grid gap-5 sm:grid-cols-2">{coverField}<FieldLabel label="Judul Buku" className="sm:col-span-2"><input required type="text" name="judul" value={form.judul} onChange={update} className={INPUT_CLASS} /></FieldLabel><FieldLabel label="Penulis"><input required type="text" name="penulis" value={form.penulis} onChange={update} className={INPUT_CLASS} /></FieldLabel><FieldLabel label="Stok"><input required min="0" type="number" name="stok" value={form.stok} onChange={update} className={INPUT_CLASS} /></FieldLabel><FieldLabel label="Penerbit">{customPublisher ? <div className="flex gap-2"><input required autoFocus name="penerbit" value={form.penerbit} onChange={update} onBlur={() => addOption('penerbit', form.penerbit)} placeholder="Tulis penerbit baru" className={INPUT_CLASS} /><button type="button" onClick={() => addOption('penerbit', form.penerbit)} className="shrink-0 rounded-lg border border-[#E5E0D8] px-3 text-xs text-stone-600">Pilih list</button></div> : <select value={form.penerbit} onChange={(event) => chooseOption('penerbit', event.target.value)} className={selectClass}><option value="">Pilih penerbit</option>{publisherOptions.map((option) => <option key={option.value || option} value={option.value || option}>{option.label || option}</option>)}</select>}</FieldLabel><FieldLabel label="Genre">{customGenre ? <div className="flex gap-2"><input required autoFocus name="genre" value={form.genre} onChange={update} onBlur={() => addOption('genre', form.genre)} placeholder="Tulis genre baru" className={INPUT_CLASS} /><button type="button" onClick={() => addOption('genre', form.genre)} className="shrink-0 rounded-lg border border-[#E5E0D8] px-3 text-xs text-stone-600">Pilih list</button></div> : <select value={form.genre} onChange={(event) => chooseOption('genre', event.target.value)} className={selectClass}><option value="">Pilih genre</option>{genreOptions.map((option) => <option key={option.value || option} value={option.value || option}>{option.label || option}</option>)}</select>}</FieldLabel><FieldLabel label="ISBN"><input type="text" name="isbn" value={form.isbn} onChange={update} className={INPUT_CLASS} /></FieldLabel><FieldLabel label="Tanggal Terbit"><input type="text" name="tanggalTerbit" value={form.tanggalTerbit} onChange={update} className={INPUT_CLASS} /></FieldLabel><FieldLabel label="Jumlah Halaman"><input min="0" type="number" name="jumlah_halaman" value={form.jumlah_halaman} onChange={update} className={INPUT_CLASS} /></FieldLabel><FieldLabel label="Bahasa"><input type="text" name="bahasa" value={form.bahasa} onChange={update} className={INPUT_CLASS} /></FieldLabel><FieldLabel label="Deskripsi" className="sm:col-span-2"><textarea name="description" value={form.description} onChange={update} rows="5" className="min-h-32 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF7F2] px-3.5 py-3 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200" /></FieldLabel></div></div></form></ModalShell>;
}
