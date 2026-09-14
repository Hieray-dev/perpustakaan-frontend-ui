import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpen, User, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const SPINE_PALETTE = [
  '#fb923c',
  '#f59e0b',
  '#fb7185',
  '#0d9488',
  '#f97316',
  '#a8a29e',
  '#facc15',
  '#0284c7',
  '#059669',
  '#6366f1',
  '#d97706',
  '#64748b',
  '#f87171',
  '#0e7490',
  '#0f766e',
  '#10b981',
  '#eab308',
  '#fda4af',
  '#78716c',
  '#4f46e5',
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Judul & warna buku yang diklik dari halaman landing (opsional)
  const bookTitle =
    (location.state && location.state.bookTitle) ||
    (typeof location.state === 'string' && location.state) ||
    'Laskar Pelangi';
  const bookColor =
    (location.state && location.state.bookColor) || SPINE_PALETTE[hashStr(bookTitle) % SPINE_PALETTE.length];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const accent = bookColor;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/login', {
        username,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user || res.data));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Cek username dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6EF] via-[#FAF7F2] to-[#F3EBDD] text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        {/* ── Kiri: Hero buku yang sedang dilihat ─────────────────── */}
        <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Perpustakaan
          </span>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Buku impianmu,
            <br />
            tinggal satu klik lagi.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">
            Masuk untuk meminjam <span className="font-semibold text-slate-800">{bookTitle}</span>{' '}
            dan jelajahi koleksi lainnya.
          </p>

          {/* Buku hero */}
          <div className="relative mt-12">
            {/* bayangan lembut */}
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/3 rounded-full opacity-40 blur-2xl" style={{ background: accent }} />

            <div
              className="relative -rotate-6 rounded-r-md rounded-l-md shadow-2xl transition hover:rotate-3"
              style={{
                width: 180,
                height: 260,
                background: `linear-gradient(${accent}, ${accent}55 45%, ${accent})`,
                boxShadow: `inset -8px 0 0 rgba(0,0,0,0.16), inset 6px 0 0 rgba(255,255,255,0.12), 14px 18px 34px rgba(80,60,40,0.28)`,
              }}
            >
              <div className="flex h-full items-center justify-center rounded-r-md px-4">
                <span className="select-none text-center text-sm font-semibold leading-snug text-white/90 [writing-mode:vertical-rl]">
                  {bookTitle}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-slate-400">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-slate-800 underline">
              Daftar di sini
            </Link>
          </p>
        </div>

        {/* ── Kanan: Form login ───────────────────────────────────── */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">Masuk untuk meminjam</h2>
              <p className="mt-1 text-sm text-slate-500">Login dengan akun perpustakaan Anda</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-300/50"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-300/50"
                    placeholder="Password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Memproses...' : 'Masuk'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Kembali ke rak buku?{' '}
              <Link to="/" className="font-semibold text-amber-600 hover:underline">
                Lihat buku
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}