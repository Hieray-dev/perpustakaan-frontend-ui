import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.png';

/* Landing: ilustrasi rak buku editorial sebagai gambar fullscreen
   + satu titik interaktif (pill badge) menuju /login. */
export default function Landing() {
  const navigate = useNavigate();

  const openLogin = () => navigate('/login');

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F4F1EA] px-6 py-12">
      {/* Ornamen lembut di belakang gambar */}
      <div className="pointer-events-none absolute left-10 top-16 h-64 w-64 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-10 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />

      {/* Ilustrasi rak buku editorial */}
      <div className="relative">
        {/* Bayangan rak di bawah gambar */}
        <div className="pointer-events-none absolute -bottom-6 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-[50%] bg-slate-900/10 blur-2xl" />

        <img
          src={heroImg}
          alt="Ilustrasi rak buku perpustakaan digital"
          className="max-h-[78vh] h-auto w-auto rounded-3xl shadow-[0_40px_80px_-20px_rgba(80,60,40,0.45)] ring-8 ring-white/70"
          draggable={false}
        />

        {/* Satu-satunya titik interaktif: pill "Masuk ke Perpustakaan" */}
        <button
          type="button"
          onClick={openLogin}
          aria-label="Masuk ke Perpustakaan"
          className="absolute left-1/2 top-1/4 z-20 -translate-x-1/2 cursor-pointer select-none outline-none"
        >
          {/* halo lembut untuk affordance */}
          <span className="pointer-events-none absolute -inset-3 rounded-full bg-amber-300/60 blur-xl" />
          <span className="relative flex items-center gap-2 whitespace-nowrap rounded-full bg-white/95 px-5 py-2.5 font-serif text-base text-slate-700 shadow-[0_14px_34px_-10px_rgba(60,40,20,0.5)] ring-1 ring-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_20px_44px_-10px_rgba(60,40,20,0.55)]">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Masuk ke Perpustakaan
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-500">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {/* caret mengarah ke rak */}
          <span className="pointer-events-none absolute -bottom-[6px] left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white" />
        </button>
      </div>
    </div>
  );
}