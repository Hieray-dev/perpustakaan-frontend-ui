import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Loader2, BookOpen, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="grid min-h-screen grid-cols-1 bg-[#FAF7F2] lg:grid-cols-2">
      {/* ── Kiri: Editorial column ─────────────────────────────── */}
      <div className="flex min-h-screen flex-col justify-between border-r border-stone-200/80 bg-[#FAF7F2]">
        {/* Atas: Brand logo */}
        <Link to="/" className="flex items-center gap-2 p-8 font-serif text-lg font-bold text-stone-900">
          <BookOpen className="h-5 w-5" />
          Perpustakaan Digital
        </Link>

        {/* Tengah: Headline editorial */}
        <div className="flex-1 flex flex-col items-start justify-center px-8 py-10">
          <span className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/60">
            PERPUSTAKAAN DIGITAL
          </span>
          <h1 className="mb-4 max-w-lg font-serif text-4xl font-medium leading-[1.15] tracking-tight text-stone-900 lg:text-5xl">
            Ruang baca hangat untuk setiap petualangan barumu.
          </h1>
          <p className="max-w-md font-sans text-sm text-stone-500">
            Jelajahi ribuan koleksi buku digital kapan saja, di mana saja.
          </p>
        </div>

        {/* Bawah: Footer minimalis */}
        <p className="p-8 font-sans text-xs text-stone-400">© 2026 Perpustakaan Digital</p>
      </div>

      {/* ── Kanan: Card amber terintegrasi grid ────────────────── */}
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] p-6 lg:p-10">
        <div className="w-full max-w-md rounded-3xl border border-amber-500/20 bg-amber-400 p-8 shadow-lg">
          <h1 className="mb-6 text-center text-xl font-semibold text-slate-900">Login to continue</h1>

          {error && (
            <div className="mb-5 w-full rounded-xl bg-white/90 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex w-full flex-col gap-4">
            <div className="flex w-full items-center rounded-full bg-white px-4 py-3 shadow-sm">
              <User className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                aria-label="Username"
                className="w-full min-w-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Username"
              />
            </div>

            <div className="flex w-full items-center rounded-full bg-white px-4 py-3 shadow-sm">
              <Lock className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-label="Password"
                className="w-full min-w-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="ml-auto shrink-0 text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Memproses...' : 'Masuk'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-800/80">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-700">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}