import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import api from '../api/client';
import { getUser } from '../utils/auth';

export default function AdminResetPassword() {
  const user = getUser() || { username: 'Admin', id_role: null };
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      setLoading(true);
      const res = await api.put('/admin/user/reset-password', {
        username,
        new_password: newPassword,
      });
      setSuccess(res.data?.message || 'Password berhasil di-reset.');
      setUsername('');
      setNewPassword('');
    } catch (err) {
      const data = err?.response?.data;
      setError(
        typeof data === 'string' && data.trim()
          ? data
          : data?.message || 'Gagal me-reset password.',
      );
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user.id_role === 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/30">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-lg font-semibold text-slate-800">Reset Password</h1>
            <p className="mt-1 text-sm text-slate-500">
              Admin {user.username} — atur ulang password akun pengguna.
            </p>
          </div>

          {!isAdmin && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Anda jumlah login dengan role bukan admin — endpoint ini hanya diizinkan untuk admin.
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="akun pengguna"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password Baru
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="password baru"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Menyimpan...' : 'Reset Password'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            <Link to="/dashboard" className="font-semibold text-cyan-600 hover:underline">
              Kembali ke Dashboard
            </Link>
          </p>

          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-cyan-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}