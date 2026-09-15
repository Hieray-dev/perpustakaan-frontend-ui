import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Lock, User, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sesuai.');
      return;
    }

    try {
      setLoading(true);
      // Role anggota (3) dijadikan default di backend bila id_role tidak terkirim.
      const res = await api.post('/register', { username, password });
      setSuccessMessage(res.data?.message || 'Registrasi berhasil. Silakan login.');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const data = err?.response?.data;
      setError(
        typeof data === 'string' && data.trim()
          ? data
          : data?.message || 'Terjadi kesalahan saat mendaftar.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#FAF7F2] lg:grid-cols-2">
      {/* ── Kiri: Banner visual warm ───────────────────────────── */}
      <div className="relative flex hidden flex-col justify-between overflow-hidden bg-[#FAF7F2] p-8 lg:flex lg:p-12">
        {/* Ornamen dekoratif */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-amber-200/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-6 h-64 w-64 rounded-full bg-orange-200/50 blur-3xl" />

        {/* Header: Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">Perpustakaan Digital</span>
        </Link>

        {/* Ilustrasi bertema baca/perpustakaan */}
        <div className="relative z-10 flex flex-col items-center justify-center py-10">
          <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-amber-300/40 blur-3xl" />
          <svg
            width="300"
            height="220"
            viewBox="0 0 300 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative drop-shadow-xl"
          >
            {/* Kilauan / sparkles */}
            <path d="M28 42 L31 51 L40 54 L31 57 L28 66 L25 57 L16 54 L25 51 Z" fill="#F59E0B" />
            <path d="M258 28 L260.5 35.5 L268 38 L260.5 40.5 L258 48 L255.5 40.5 L248 38 L255.5 35.5 Z" fill="#D97706" />
            <path d="M282 92 L284 98 L290 100 L284 102 L282 108 L280 102 L274 100 L280 98 Z" fill="#EAB308" />
            <circle cx="22" cy="96" r="3.5" fill="#EAB308" />
            <circle cx="272" cy="60" r="3" fill="#F59E0B" />

            {/* Halaman kiri */}
            <path
              d="M150 100 C114 70 64 58 36 70 L36 166 C64 154 114 164 150 194 L150 100 Z"
              fill="#FFF9EC"
              stroke="#D8C6A4"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Halaman kanan */}
            <path
              d="M150 100 C186 70 236 58 264 70 L264 166 C236 154 186 164 150 194 L150 100 Z"
              fill="#FFFDF5"
              stroke="#D8C6A4"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Punggung buku */}
            <line x1="150" y1="100" x2="150" y2="194" stroke="#CBB487" strokeWidth="2.5" />

            {/* Garis naskah */}
            <path d="M70 90 L134 116" stroke="#E4D5B6" strokeWidth="3" strokeLinecap="round" />
            <path d="M66 108 L134 132" stroke="#E4D5B6" strokeWidth="3" strokeLinecap="round" />
            <path d="M64 126 L134 148" stroke="#E4D5B6" strokeWidth="3" strokeLinecap="round" />
            <path d="M166 116 L230 90" stroke="#E4D5B6" strokeWidth="3" strokeLinecap="round" />
            <path d="M166 132 L234 108" stroke="#E4D5B6" strokeWidth="3" strokeLinecap="round" />
            <path d="M166 148 L236 126" stroke="#E4D5B6" strokeWidth="3" strokeLinecap="round" />

            {/* Pembatas buku */}
            <path d="M146 60 L146 96 L158 86 L170 96 L170 60 Z" fill="#F59E0B" />
          </svg>
        </div>

        <p className="relative z-10 text-center text-sm text-slate-500 lg:text-left">
          Baca, pinjam, dan jelajahi koleksi perpustakaan digital.
        </p>
      </div>

      {/* ── Kanan: Card register amber ─────────────────────────── */}
      <div className="flex w-full min-h-screen items-center justify-center bg-[#FAF7F2] px-6 py-12">
        <div className="flex w-full max-w-md min-h-[460px] flex-col items-center justify-center rounded-3xl bg-amber-400 shadow-xl">
          <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8">
            <h1 className="text-center text-xl font-semibold text-slate-900">Daftar Akun Baru</h1>

            {successMessage && (
              <div className="flex w-full items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {successMessage}
              </div>
            )}

            {error && (
              <div className="w-full rounded-xl bg-white/90 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
              <div className="flex w-full items-center rounded-full bg-white px-4 py-3 shadow-sm">
                <User className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  minLength={3}
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
                  autoComplete="new-password"
                  required
                  minLength={6}
                  aria-label="Password"
                  className="w-full min-w-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Minimal 6 karakter"
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

              <div className="flex w-full items-center rounded-full bg-white px-4 py-3 shadow-sm">
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  aria-label="Konfirmasi Password"
                  className="w-full min-w-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Ulangi password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="ml-auto shrink-0 text-slate-400 transition hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-800/80">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-700">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}