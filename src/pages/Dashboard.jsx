import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LogOut,
  RefreshCw,
  Search,
  Library,
  User as UserIcon,
  Loader2,
} from 'lucide-react';
import api from '../api/client';
import { getToken, getUser, clearSession } from '../utils/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser() || { username: 'Pengguna', id_role: null };
  const [buku, setBuku] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(false);
  const [search, setSearch] = useState('');

  const loadBuku = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/buku');
      setBuku(res.data);
    } catch (err) {
      const data = err?.response?.data;
      setError(
        typeof data === 'string' && data.trim()
          ? data
          : data?.message || 'Gagal memuat katalog buku.',
      );
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    // Redirect ke login bila tidak ada token.
    if (!getToken()) {
      navigate('/', { replace: true });
      return;
    }
    // Defer fetch agar tidak memanggil setState sinkron dalam effect (react-hooks rule).
    const timer = setTimeout(loadBuku, 0);
    return () => clearTimeout(timer);
  }, [navigate, loadBuku]);

  const handleLogout = () => {
    clearSession();
    navigate('/', { replace: true });
  };

  const filteredBuku = buku.filter(
    (b) =>
      (b.judul || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.penulis || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-800">Perpustakaan</p>
              <p className="text-xs text-slate-400">Katalog Buku</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-4 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-white">
                <UserIcon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-slate-700">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 p-6 text-white shadow-lg shadow-cyan-500/20 sm:p-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Selamat datang, {user.username}!</h1>
          <p className="mt-2 max-w-xl text-sm text-cyan-50 sm:text-base">
            Jelajahi koleksi buku di perpustakaan kami.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Library className="h-5 w-5 text-cyan-600" />
            Katalog Buku
          </h2>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul atau penulis..."
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
            <button
              onClick={loadBuku}
              disabled={loading}
              title="Muat ulang"
              className="flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!loading && fetched && filteredBuku.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 py-20 text-center">
            <p className="text-sm text-slate-400">Tidak ada buku yang ditemukan.</p>
          </div>
        )}

        {/* Grid Buku */}
        {!loading && filteredBuku.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBuku.map((b) => (
              <div
                key={b.id_buku}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  {b.gambar ? (
                    <img
                      src={`http://localhost:8080/${b.gambar}`}
                      alt={`Sampul ${b.judul}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-slate-300" />
                  )}
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-1 font-semibold text-slate-800" title={b.judul}>
                    {b.judul}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">{b.penulis}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">{b.deskripsi}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        b.stok > 0
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {b.stok > 0 ? `Stok: ${b.stok}` : 'Stok habis'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}