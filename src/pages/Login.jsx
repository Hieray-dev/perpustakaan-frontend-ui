
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CircleAlert,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  User,
} from 'lucide-react';

function LibraryBrand() {
  return (
    <Link
      to="/"
      aria-label="Perpustakaan Digital — beranda"
      className="inline-flex w-fit items-center gap-3.5 rounded-sm text-stone-900 outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#FAF7F2]"
    >
      <span className="flex size-11 items-center justify-center rounded-sm border border-stone-300">
        <BookOpen aria-hidden="true" className="size-6" strokeWidth={1.4} />
      </span>
      <span className="font-serif text-[15px] leading-snug tracking-[0.12em]">
        PERPUSTAKAAN
        <span className="block">DIGITAL</span>
      </span>
    </Link>
  );
}

function LoginEditorial() {
  return (
    <section
      aria-labelledby="library-heading"
      className="flex flex-col border-b border-stone-200 bg-[#FAF7F2] px-6 pb-10 pt-7 sm:px-10 lg:w-[54%] lg:border-b-0 lg:border-r lg:px-14 lg:py-12 xl:px-20"
    >
      {/* Atas: Brand logo */}
      <header>
        <LibraryBrand />
      </header>

      {/* Tengah: Headline editorial */}
      <div className="flex flex-1 flex-col justify-center py-10 sm:py-14 lg:py-10">
        <p className="mb-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-stone-600 sm:text-xs">
          <span aria-hidden="true" className="h-px w-8 bg-stone-400" />
          Buka buku. Buka wawasan.
        </p>
        <h1
          id="library-heading"
          className="font-serif text-5xl font-normal leading-[1.04] tracking-[-0.045em] text-stone-900 sm:text-6xl lg:text-7xl xl:text-[88px] 2xl:text-[96px]"
        >
          Ruang Baca
          <br />
          <span className="italic">&amp; Literasi</span>
          <br />
          Digital
        </h1>
        <p className="mt-7 max-w-80 text-sm leading-7 text-stone-600 sm:max-w-sm sm:text-[15px] lg:mt-8">
          Temukan cerita, perluas pengetahuan, dan tumbuh bersama setiap halaman. Ruang baca Anda, kapan saja dan di mana saja.
        </p>
      </div>

      {/* Bawah: Footer minimalis */}
      <footer className="hidden items-center justify-between gap-4 border-t border-stone-300 pt-5 text-[11px] leading-5 text-stone-500 lg:flex">
        <p>© {new Date().getFullYear()} Perpustakaan Digital</p>
        <p className="font-serif text-sm italic">Untuk rasa ingin tahu.</p>
      </footer>
    </section>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    if (submitting.current) return;

    submitting.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const fallback = response.status === 401 || response.status === 403
          ? 'Username atau password tidak sesuai. Silakan coba lagi.'
          : 'Login gagal. Silakan coba lagi beberapa saat.';
        throw new Error(
          typeof data?.message === 'string' && data.message.trim()
            ? data.message
            : fallback,
        );
      }

      if (typeof data?.token !== 'string' || !data.token.trim()) {
        throw new Error('Respons server tidak valid. Token login tidak ditemukan.');
      }

      try {
        localStorage.setItem('user', JSON.stringify(data.user || {
          id_user: data.id_user,
          username: data.username || username.trim(),
          id_role: data.id_role ?? null,
        }));
        localStorage.setItem('token', data.token);
      } catch {
        throw new Error('Sesi tidak dapat disimpan. Izinkan penyimpanan situs di browser, lalu coba lagi.');
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setError('Server terlalu lama merespons. Silakan coba lagi.');
      } else if (err instanceof TypeError) {
        setError('Tidak dapat terhubung ke server. Periksa koneksi Anda dan coba lagi.');
      } else {
        setError(err.message || 'Login gagal. Silakan coba lagi.');
      }
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-9">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-500">
          Mulai perjalanan membaca Anda
        </p>
        <h2 id="login-heading" className="font-serif text-[40px] font-normal leading-[1.15] tracking-[-0.035em] sm:text-[44px]">
          Selamat datang<br />kembali.
        </h2>
        <p className="mt-4 text-sm leading-6 text-stone-500">
          Masuk untuk melanjutkan cerita Anda.
        </p>
      </div>

      {error && (
        <div id="login-error" role="alert" className="mb-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={handleLogin}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault();
        }}
        aria-labelledby="login-heading"
        aria-describedby={error ? 'login-error' : undefined}
        aria-busy={loading}
        className="flex flex-col gap-5"
      >
        <div>
          <label htmlFor="username" className="mb-2.5 block text-xs font-medium text-stone-700">Username</label>
          <div className="relative">
            <User aria-hidden="true" strokeWidth={1.5} className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-stone-400" />
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              disabled={loading}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="h-14 w-full rounded-md border border-stone-200 bg-white pl-11 pr-4 text-base text-stone-900 outline-none transition-colors placeholder:text-stone-500 focus:border-stone-400 focus:ring-2 focus:ring-stone-400 disabled:opacity-60 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-2.5 block text-xs font-medium text-stone-700">Password</label>
          <div className="relative">
            <LockKeyhole aria-hidden="true" strokeWidth={1.5} className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-stone-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              className="h-14 w-full rounded-md border border-stone-200 bg-white pl-11 pr-14 text-base text-stone-900 outline-none transition-colors placeholder:text-stone-500 focus:border-stone-400 focus:ring-2 focus:ring-stone-400 disabled:opacity-60 sm:text-sm"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              aria-controls="password"
              aria-pressed={showPassword}
              disabled={loading}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-1.5 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-stone-500 outline-none transition-colors hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-stone-400 disabled:cursor-not-allowed"
            >
              {showPassword
                ? <EyeOff aria-hidden="true" className="size-[18px]" strokeWidth={1.5} />
                : <Eye aria-hidden="true" className="size-[18px]" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-stone-900 px-5 text-sm font-medium text-[#FAF7F2] outline-none transition-colors hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
          <span aria-live="polite">{loading ? 'Sedang masuk...' : 'Masuk'}</span>
          {!loading && <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />}
        </button>
      </form>

      <p className="mt-8 border-t border-stone-200 pt-7 text-center text-sm leading-6 text-stone-500">
        Belum punya akun?{' '}
        <Link to="/register" className="rounded-sm font-medium text-stone-900 underline decoration-stone-400 underline-offset-4 outline-none transition-colors hover:text-stone-600 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-4">
          Daftar
        </Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <main className="flex min-h-svh flex-col bg-[#FAF7F2] font-sans text-stone-900 selection:bg-stone-200 selection:text-stone-900 lg:flex-row">
      <LoginEditorial />
      <section aria-labelledby="login-heading" className="flex flex-1 flex-col bg-white px-6 py-10 sm:px-10 lg:px-14 lg:py-12 xl:px-20">
        <div aria-hidden="true" className="hidden items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500 lg:flex">
          <span>Akses anggota</span>
          <span className="font-serif text-sm tracking-normal">01 / Masuk</span>
        </div>
        <div className="flex flex-1 items-center justify-center lg:py-4">
          <LoginForm />
        </div>
        <p className="mt-10 text-center text-[11px] leading-5 text-stone-500 lg:mt-0">
          <Link to="/demo/dashboard" className="rounded-sm text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-stone-400">Jelajahi demo dashboard</Link>
          <span className="mx-2 text-stone-300">·</span>Tanpa perlu masuk.
        </p>
      </section>
    </main>
  );
}
