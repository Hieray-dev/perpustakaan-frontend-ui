import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);

  const [message, setMessage] = useState('');

  const toggleForm = (toSignUp) => {
    setIsSignUp(toSignUp);
    setMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/login', {
        username: loginIdentifier,
        password: loginPass,
      });

      localStorage.setItem('token', response.data.token);

      localStorage.setItem('username', loginIdentifier);

      const userRole = response.data.id_role || response.data.role || (loginIdentifier.toLowerCase() === 'ray' ? 1 : 2);
      localStorage.setItem('userRole', userRole);

      navigate('/dashboard');
    } catch (error) {
      setMessage('Login Gagal: ' + (error.response?.data?.message || 'Gagal terhubung ke backend'));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/register', {
        username: regUser,
        email: regEmail,
        password: regPass,
      });
      setMessage('Registrasi Berhasil! Silakan Login.');
      setIsSignUp(false);
    } catch (error) {
      setMessage('Register Gagal: ' + (error.response?.data?.message || 'Gagal terhubung ke backend'));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-100 text-slate-800 relative overflow-x-hidden">

      {/* --- BACKGROUND WAVE RESPONSIVE --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg 
          className="absolute right-0 top-0 h-full w-[80%] md:w-[55%] opacity-90 transition-all duration-500" 
          viewBox="0 0 500 800" 
          preserveAspectRatio="none"
        >
          <path d="M180,0 C320,250 100,550 220,800 L500,800 L500,0 Z" fill="#b91c1c" />
        </svg>

        <svg 
          className="absolute left-0 bottom-0 h-full w-[60%] md:w-[40%] opacity-20 transition-all duration-500" 
          viewBox="0 0 500 800" 
          preserveAspectRatio="none"
        >
          <path d="M0,0 L0,800 L300,800 C150,550 350,250 0,0 Z" fill="#dc2626" />
        </svg>

        <div className="absolute top-[8%] left-[5%] md:left-[10%] w-20 h-20 md:w-28 md:h-28 rounded-full bg-red-400/10 blur-sm" />
        <div className="absolute bottom-[10%] left-[8%] md:left-[18%] w-28 h-28 md:w-36 md:h-36 rounded-full bg-red-500/15 blur-md" />
      </div>

      {/* --- KARTU UTAMA --- */}
      <div className="relative w-full max-w-4xl h-auto md:h-[550px] min-h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-200 z-10 flex flex-col md:block">

        {/* --- FORM SIGN IN --- */}
        <div className={`w-full md:w-1/2 h-full p-6 sm:p-8 md:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out md:absolute md:top-0 md:left-0 ${
          isSignUp ? 'hidden md:flex md:opacity-0 md:-translate-x-12 md:pointer-events-none' : 'flex opacity-100 translate-x-0 z-10'
        }`}>
          <form onSubmit={handleLogin} className="flex flex-col gap-3 sm:gap-4 max-w-sm mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900">Sign In</h1>
            <p className="text-xs text-center text-slate-500 -mt-1 mb-2">
              Masuk dengan akun kamu
            </p>

            {message && (
              <div className="p-2.5 text-xs text-center rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
                {message}
              </div>
            )}

            <input
              type="text"
              placeholder="Email or Username"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm border bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              required
            />

            <div className="relative">
              <input
                type={showLoginPass ? 'text' : 'password'}
                placeholder="Password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl text-sm border bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowLoginPass(!showLoginPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showLoginPass ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/25 transition transform active:scale-95 text-sm uppercase tracking-wider cursor-pointer"
            >
              Sign In
            </button>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center md:hidden">
              <p className="text-xs text-slate-500">
                Belum punya akun?{' '}
                <button 
                  type="button" 
                  onClick={() => toggleForm(true)} 
                  className="text-red-600 font-bold hover:underline cursor-pointer ml-1 inline-block"
                >
                  Daftar di sini
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* --- FORM SIGN UP --- */}
        <div className={`w-full md:w-1/2 h-full p-6 sm:p-8 md:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out md:absolute md:top-0 md:right-0 ${
          isSignUp ? 'flex opacity-100 translate-x-0 z-10' : 'hidden md:flex md:opacity-0 md:translate-x-12 md:pointer-events-none'
        }`}>
          <form onSubmit={handleRegister} className="flex flex-col gap-3 max-w-sm mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900">Create Account</h1>
            <p className="text-xs text-center text-slate-500 -mt-1 mb-2">
              Daftar untuk membuat akun perpustakaan
            </p>

            <input
              type="text"
              placeholder="Username"
              value={regUser}
              onChange={(e) => setRegUser(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              required
            />

            <div className="relative">
              <input
                type={showRegPass ? 'text' : 'password'}
                placeholder="Password"
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm border bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowRegPass(!showRegPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showRegPass ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/25 transition transform active:scale-95 text-sm uppercase tracking-wider cursor-pointer"
            >
              Sign Up
            </button>

            <div className="mt-3 pt-3 border-t border-slate-100 text-center md:hidden">
              <p className="text-xs text-slate-500">
                Sudah punya akun?{' '}
                <button 
                  type="button" 
                  onClick={() => toggleForm(false)} 
                  className="text-red-600 font-bold hover:underline cursor-pointer ml-1 inline-block"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* --- OVERLAY SLIDING PANEL MERAH --- */}
        <div className={`hidden md:block absolute top-0 left-0 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-30 ${
          isSignUp ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className={`bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white h-full w-[200%] relative -left-full transition-transform duration-700 ease-in-out flex ${
            isSignUp ? 'translate-x-1/2' : 'translate-x-0'
          }`}>
            <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center">
              <h2 className="text-3xl font-bold mb-3">Selamat Datang!</h2>
              <p className="text-sm text-red-100 mb-8 max-w-xs">
                Sudah punya akun? Masuk untuk melanjutkan akses perpustakaan.
              </p>
              <button
                type="button"
                onClick={() => toggleForm(false)}
                className="border-2 border-white text-white font-bold px-8 py-2.5 rounded-xl hover:bg-white hover:text-red-600 transition duration-300 text-xs uppercase tracking-widest shadow-md cursor-pointer"
              >
                Sign In
              </button>
            </div>

            <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center">
              <h2 className="text-3xl font-bold mb-3">Hello World!</h2>
              <p className="text-sm text-red-100 mb-8 max-w-xs">
                Belum punya akun? Buat akun sekarang dan nikmati layanan perpustakaan digital kami.
              </p>
              <button
                type="button"
                onClick={() => toggleForm(true)}
                className="border-2 border-white text-white font-bold px-8 py-2.5 rounded-xl hover:bg-white hover:text-red-600 transition duration-300 text-xs uppercase tracking-widest shadow-md cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
