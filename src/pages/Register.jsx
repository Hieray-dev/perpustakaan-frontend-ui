import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AtSign,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  User,
} from 'lucide-react';

function RegisterEditorial() {
  return (
    <section
      aria-labelledby="register-editorial-heading"
      className="flex flex-col border-b border-stone-200 bg-[#FAF7F2] px-6 pb-10 pt-7 sm:px-10 lg:w-[54%] lg:border-b-0 lg:border-r lg:px-14 lg:py-12 xl:px-20"
    >
      {/* Header: Logo */}
      <header>
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
      </header>

      <div className="flex flex-1 flex-col justify-center py-10 sm:py-14 lg:py-10">
        <p className="mb-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-stone-600 sm:text-xs">
          <span aria-hidden="true" className="h-px w-8 bg-stone-400" />
          Buka buku. Buka wawasan.
        </p>
        <h1
          id="register-editorial-heading"
          className="font-serif text-5xl font-normal leading-[1.04] tracking-[-0.045em] text-stone-900 sm:text-6xl lg:text-7xl xl:text-[88px] 2xl:text-[96px]"
        >
          Mulai{' '}<br />
          <span className="italic">Perjalanan</span>{' '}<br />
          Literasi Anda
        </h1>
        <p className="mt-7 max-w-80 text-sm leading-7 text-stone-600 sm:max-w-sm sm:text-[15px] lg:mt-8">
          Bergabunglah untuk mengakses ribuan koleksi cerita dan ilmu pengetahuan.
        </p>
      </div>

      <footer className="hidden items-center justify-between gap-4 border-t border-stone-300 pt-5 text-[11px] leading-5 text-stone-500 lg:flex">
        <p>© {new Date().getFullYear()} Perpustakaan Digital</p>
        <p className="font-serif text-sm italic">Untuk rasa ingin tahu.</p>
      </footer>
    </section>
  );
}

function RegisterField({ id, label, icon, isPassword = false, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2.5 block text-xs font-medium text-stone-700">
        {label}
      </label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
          {icon}
        </span>
        <input
          {...inputProps}
          id={id}
          type={isPassword && !visible ? 'password' : 'text'}
          required
          className={`h-14 w-full rounded-md border border-stone-200 bg-white pl-11 text-base text-stone-900 outline-none transition-colors placeholder:text-stone-500 focus:border-stone-400 focus:ring-2 focus:ring-stone-400 disabled:opacity-60 sm:text-sm ${isPassword ? 'pr-14' : 'pr-4'}`}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={`${visible ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`}
            aria-controls={id}
            aria-pressed={visible}
            disabled={inputProps.disabled}
            onClick={() => setVisible((current) => !current)}
            className="absolute right-1.5 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-stone-500 outline-none transition-colors hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-stone-400 disabled:cursor-not-allowed"
          >
            {visible
              ? <EyeOff aria-hidden="true" className="size-[18px]" strokeWidth={1.5} />
              : <Eye aria-hidden="true" className="size-[18px]" strokeWidth={1.5} />}
          </button>
        )}
      </div>
    </div>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const submitting = useRef(false);
  const requestController = useRef(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const disabled = loading || Boolean(successMessage);
  const passwordMismatch = error === 'Password dan Konfirmasi Password tidak cocok' && password !== confirmPassword;

  useEffect(() => () => requestController.current?.abort(), []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => navigate('/login', { replace: true }), 2500);
    return () => window.clearTimeout(timer);
  }, [successMessage, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current || successMessage) return;
    setError('');

    if (password !== confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok');
      return;
    }
    if (!fullName.trim() || username.trim().length < 3) {
      setError('Isi nama lengkap dan gunakan username minimal 3 karakter.');
      return;
    }

    submitting.current = true;
    setLoading(true);
    const controller = new AbortController();
    requestController.current = controller;

    try {
      // Role anggota (3) dijadikan default di backend bila id_role tidak terkirim.
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), username: username.trim(), password }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
      });
      const data = await response.json().catch(() => null);
      if (controller.signal.aborted) return;

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data?.message;
        const fallback = response.status === 409
          ? 'Username sudah digunakan. Silakan pilih username lain.'
          : 'Registrasi gagal. Silakan coba lagi beberapa saat.';
        throw new Error(typeof message === 'string' && message.trim() ? message : fallback);
      }

      setSuccessMessage('Registrasi berhasil. Anda akan diarahkan ke halaman masuk.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setError('Server terlalu lama merespons. Silakan coba lagi.');
      } else if (err instanceof TypeError) {
        setError('Tidak dapat terhubung ke server. Periksa koneksi Anda dan coba lagi.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat mendaftar.');
      }
    } finally {
      submitting.current = false;
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-7">
        <h2 id="register-heading" className="font-serif text-[40px] font-normal leading-[1.15] tracking-[-0.035em] sm:text-[44px]">
          Buat Akun Baru.
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Lengkapi data di bawah ini untuk mendaftar.
        </p>
      </div>

      {error && (
        <div id="register-error" role="alert" className="mb-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {successMessage && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-md border border-stone-300 bg-[#FAF7F2] p-4 text-sm leading-6 text-stone-800">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault();
        }}
        aria-labelledby="register-heading"
        aria-describedby={error ? 'register-error' : undefined}
        aria-busy={loading}
        className="flex flex-col gap-4"
      >
        <RegisterField
          id="full-name"
          name="full_name"
          label="Nama Lengkap"
          icon={<User className="size-[18px]" strokeWidth={1.5} />}
          autoComplete="name"
          placeholder="Nama lengkap Anda"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={disabled}
        />
        <RegisterField
          id="username"
          name="username"
          label="Username"
          icon={<AtSign className="size-[18px]" strokeWidth={1.5} />}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          minLength={3}
          placeholder="pilih_username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={disabled}
        />
        <RegisterField
          id="password"
          name="password"
          label="Password"
          icon={<LockKeyhole className="size-[18px]" strokeWidth={1.5} />}
          isPassword
          autoComplete="new-password"
          minLength={6}
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={disabled}
        />
        <RegisterField
          id="confirm-password"
          name="confirm_password"
          label="Konfirmasi Password"
          icon={<LockKeyhole className="size-[18px]" strokeWidth={1.5} />}
          isPassword
          autoComplete="new-password"
          minLength={6}
          placeholder="Ulangi password"
          aria-invalid={passwordMismatch || undefined}
          aria-describedby={passwordMismatch ? 'register-error' : undefined}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={disabled}
        />

        <button
          type="submit"
          disabled={disabled}
          className="mt-2 flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-stone-900 px-5 text-sm font-medium text-[#FAF7F2] outline-none transition-colors hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
          <span aria-live="polite">{loading ? 'Sedang mendaftar...' : successMessage ? 'Pendaftaran berhasil' : 'Daftar Sekarang'}</span>
          {!loading && (successMessage
            ? <CheckCircle2 aria-hidden="true" className="size-4" strokeWidth={1.5} />
            : <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />)}
        </button>
      </form>

      <p className="mt-6 border-t border-stone-200 pt-5 text-center text-sm leading-6 text-stone-500">
        Sudah punya akun?{' '}
        <Link to="/login" className="rounded-sm font-medium text-stone-900 underline decoration-stone-400 underline-offset-4 outline-none transition-colors hover:text-stone-600 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-4">
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default function Register() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Daftar | Perpustakaan Digital';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="flex min-h-svh flex-col bg-[#FAF7F2] font-sans text-stone-900 selection:bg-stone-200 selection:text-stone-900 lg:flex-row">
      <RegisterEditorial />
      <section aria-labelledby="register-heading" className="flex min-w-0 flex-1 flex-col bg-white px-6 py-10 sm:px-10 lg:px-14 lg:py-12 xl:px-20">
        <div className="mb-8 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500 lg:mb-0">
          <span>Akses anggota</span>
          <span className="font-serif text-sm tracking-normal">02 / Daftar</span>
        </div>
        <div className="flex flex-1 items-center justify-center lg:py-4">
          <RegisterForm />
        </div>
        <p className="mt-10 text-center text-[11px] leading-5 text-stone-500 lg:mt-0">
          Satu akun. Banyak cerita untuk ditemukan.
        </p>
      </section>
    </main>
  );
}
