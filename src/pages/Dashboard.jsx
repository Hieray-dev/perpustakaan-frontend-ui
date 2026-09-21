import { useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, FlaskConical, Loader2, Plus, RefreshCw } from 'lucide-react';
import { clearSession, getUser } from '../utils/auth';
import { demoUsers, roleNames, userId } from '../features/dashboard/data';
import useLibrary from '../features/dashboard/use-library';
import DashboardShell from '../features/dashboard/shell';
import Overview, { AttendanceWidget } from '../features/dashboard/overview';
import Catalogue from '../features/dashboard/catalogue';
import Transactions from '../features/dashboard/transactions';
import { AttendanceReport, BookManagement, Employees, Facilities, ResourceEditor } from '../features/dashboard/resources';
import { Button } from '../features/dashboard/ui';

const titles = { '': 'Ringkasan', buku: 'Koleksi Buku', peminjaman: 'Peminjaman', fasilitas: 'Fasilitas', karyawan: 'Karyawan & Shift', absensi: 'Laporan Absensi' };
const subtitles = { buku: 'Setiap buku punya cerita. Kelola dan hadirkan untuk pembaca.', peminjaman: 'Pantau perjalanan buku, dari rak hingga kembali.', fasilitas: 'Ruang yang nyaman untuk rasa ingin tahu yang besar.', karyawan: 'Orang-orang yang membuat perpustakaan terus bertumbuh.', absensi: 'Catatan kehadiran yang rapi, pelayanan yang terjaga.' };

function DashboardContent({ user, preview, page }) {
  const navigate = useNavigate();
  const library = useLibrary(user, preview);
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState('');
  const role = Number(user.id_role);
  const member = role === 3;
  const base = preview ? '/demo/dashboard' : '/dashboard';
  const title = member ? page === 'peminjaman' ? 'Peminjaman Saya' : 'Katalog Buku' : titles[page];
  const allowed = member ? ['', 'peminjaman'] : role === 2 ? ['', 'buku', 'peminjaman', 'fasilitas'] : Object.keys(titles);
  const go = (destination) => navigate(`${base}${destination ? `/${destination}` : ''}${preview ? `?role=${role}` : ''}`);
  const logout = () => { if (!preview) clearSession(); navigate('/login', { replace: true }); };
  const data = library.data;
  const scopedData = data && member ? { ...data, loans: data.loans.filter((loan) => String(loan.id_user) === String(userId(user))) } : data;
  function edit(resource, record) { setNotice(''); setEditor({ resource, record }); }
  async function save(resource, values, record) { await library.saveResource(resource, values, record); setNotice(data.mode === 'demo' ? 'Perubahan tersimpan dalam sesi demo.' : 'Perubahan berhasil disimpan.'); }
  if (!allowed.includes(page)) return <Navigate to={`${base}${preview ? `?role=${role}` : ''}`} replace />;
  return <DashboardShell user={user} preview={preview} onLogout={logout} pageTitle={title}>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-[9px] font-medium uppercase tracking-[0.2em] text-stone-500">{member ? 'Ruang baca Anda' : 'Ruang kelola perpustakaan'}</p><h1 className="font-serif text-[34px] leading-[1.15] tracking-[-0.035em] sm:text-[38px]">{!page ? member ? 'Cerita berikutnya dimulai di sini.' : 'Setiap halaman, berarti.' : title}</h1><p className="mt-3 text-[11px] leading-6 text-stone-500">{!page ? `Selamat datang, ${user.username || user.nama}. ${member ? 'Temukan teman untuk perjalanan membaca Anda.' : 'Mari hadirkan pengalaman membaca yang lebih baik.'}` : subtitles[page]}</p></div>{!member && ['', 'buku', 'fasilitas', 'karyawan'].includes(page) && <Button disabled={!data || Boolean(library.error)} onClick={() => edit(page === 'fasilitas' ? 'facilities' : page === 'karyawan' ? 'users' : 'books')}><Plus className="size-3.5" />{page === 'fasilitas' ? 'Tambah fasilitas' : page === 'karyawan' ? 'Tambah karyawan' : 'Tambah buku'}</Button>}</div>
    {(preview || data?.mode === 'demo') && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-stone-300 bg-[#f5f1e9] px-3.5 py-2.5"><div className="flex items-center gap-2 text-[10px] text-stone-600"><FlaskConical aria-hidden="true" className="size-3.5 shrink-0" /><p><span className="font-medium">Mode demo</span><span className="mx-2 text-stone-300">/</span>{data?.reason || 'Data contoh. Perubahan tidak dikirim ke server.'}</p></div>{preview ? <label className="flex items-center gap-2 text-[10px] text-stone-500">Lihat sebagai<select aria-label="Peran pratinjau" className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] text-stone-800" value={role} onChange={(event) => navigate(`${base}?role=${event.target.value}`)}>{Object.entries(roleNames).map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></label> : <button disabled={library.isValidating} onClick={library.reload} className="flex items-center gap-1.5 text-[10px] font-medium disabled:opacity-50"><RefreshCw className={`size-3 ${library.isValidating ? 'animate-spin' : ''}`} />Coba backend</button>}</div>}
    {notice && <div role="status" className="mb-5 flex items-center justify-between rounded-md bg-[#eef2e9] px-4 py-3 text-xs text-[#536346]">{notice}<button aria-label="Tutup notifikasi" onClick={() => setNotice('')} className="ml-3 text-lg leading-none">×</button></div>}
    {library.isLoading && <div role="status" className="flex items-center justify-center gap-3 py-24 text-sm text-stone-500"><Loader2 className="size-5 animate-spin motion-reduce:animate-none" />Memuat ruang perpustakaan…</div>}
    {library.error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6"><h2 className="font-serif text-xl">Data belum dapat ditampilkan.</h2><p className="mt-3 text-sm text-red-800">{library.error.message}</p><div className="mt-5 flex flex-wrap gap-3"><Button secondary onClick={library.reload} disabled={library.isValidating}>Coba lagi</Button><Button onClick={logout}>Kembali ke login <ArrowRight className="size-4" /></Button></div></div>}
    {data && !library.error && <>
      {!member && page === '' && <AttendanceWidget data={data} user={user} onAttendance={library.checkAttendance} />}
      {page === '' && (member ? <Catalogue data={scopedData} user={user} onBorrow={library.borrowBook} onViewLoans={() => go('peminjaman')} /> : <Overview data={data} onNavigate={go} />)}
      {page === 'buku' && <BookManagement data={data} onEdit={edit} />}
      {page === 'peminjaman' && <Transactions data={scopedData} member={member} onProcess={library.processLoan} onBrowse={() => go('')} />}
      {page === 'fasilitas' && <Facilities data={data} onEdit={edit} />}
      {page === 'karyawan' && role === 1 && <Employees data={data} onEdit={edit} />}
      {page === 'absensi' && role === 1 && <AttendanceReport data={data} />}
      {editor && <ResourceEditor {...editor} data={data} onSave={save} onClose={() => setEditor(null)} />}
    </>}
  </DashboardShell>;
}

export default function Dashboard({ preview = false }) {
  const { section = '' } = useParams();
  const [params] = useSearchParams();
  const demoRole = [1, 2, 3].includes(Number(params.get('role'))) ? Number(params.get('role')) : 1;
  const user = preview ? demoUsers[demoRole] : getUser();
  if (!user || ![1, 2, 3].includes(Number(user.id_role))) return <Navigate to="/login" replace />;
  return <DashboardContent key={`${preview}-${userId(user)}-${user.id_role}`} user={user} preview={preview} page={section} />;
}
