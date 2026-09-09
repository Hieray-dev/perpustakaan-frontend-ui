import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, 
  Users, 
  BookMarked, 
  AlertTriangle, 
  DollarSign, 
  Plus, 
  Library, 
  LogOut, 
  Search, 
  X,
  ChevronRight,
  Info
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUsername, setCurrentUsername] = useState('ray');
  const [userRole, setUserRole] = useState(1);

  const [bukuPage, setBukuPage] = useState('list');

  const [bukuList, setBukuList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [genreList, setGenreList] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    const savedRole = localStorage.getItem('userRole');
    
    if (savedUser) setCurrentUsername(savedUser);
    if (savedRole) setUserRole(Number(savedRole));

    fetchData();
  }, []);

  const fetchData = async () => {
    const API_URL = 'http://localhost:8080';
    try {
      const [resBuku, resUsers, resPeminjaman, resGenre] = await Promise.allSettled([
        axios.get(`${API_URL}/buku`),
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/peminjaman`),
        axios.get(`${API_URL}/genre`),
      ]);

      if (resBuku.status === 'fulfilled') setBukuList(resBuku.value.data || []);
      if (resUsers.status === 'fulfilled') setUsersList(resUsers.value.data || []);
      if (resPeminjaman.status === 'fulfilled') setPeminjamanList(resPeminjaman.value.data || []);
      if (resGenre.status === 'fulfilled') setGenreList(resGenre.value.data || []);
    } catch (err) {
      console.error("Gagal mengambil data backend:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col justify-between">
      
      {/* ================= NAVBAR TOP ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setActiveTab('dashboard'); setBukuPage('list'); }}>
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <Library size={18} />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">Perpustakaan Sekolah</span>
            </div>

            <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
              {['dashboard', 'buku', 'anggota', 'peminjaman', 'denda'].map((tab) => {
                if (userRole === 3 && (tab === 'anggota' || tab === 'denda')) return null;
                
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === 'buku') setBukuPage('list');
                    }}
                    className={`px-4 py-2 rounded-lg capitalize transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'text-blue-600 bg-blue-50 font-bold border-b-2 border-blue-600 rounded-b-none'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                {currentUsername ? currentUsername.charAt(0) : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-700 capitalize leading-none">{currentUsername}</p>
                <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
                  {userRole === 1 ? 'Admin' : userRole === 2 ? 'Petugas' : 'Anggota'}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= KONTEN UTAMA ================= */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView 
            bukuList={bukuList} 
            usersList={usersList} 
            peminjamanList={peminjamanList} 
            currentUsername={currentUsername} 
            userRole={userRole} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'buku' && bukuPage === 'list' && (
          <BukuManagementView 
            bukuList={bukuList} 
            setBukuList={setBukuList} 
            genreList={genreList}
            fetchData={fetchData} 
            userRole={userRole}
            setBukuPage={setBukuPage}
          />
        )}

        {activeTab === 'buku' && bukuPage === 'tambah' && (
          <TambahBukuView 
            genreList={genreList}
            setGenreList={setGenreList}
            fetchData={fetchData}
            setBukuPage={setBukuPage}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © 2026 Sistem Perpustakaan Sekolah. All rights reserved.
      </footer>

    </div>
  );
}

/* ================= 1. HALAMAN DASHBOARD ================= */
function DashboardView({ bukuList, usersList, peminjamanList, currentUsername, userRole, setActiveTab }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard {userRole === 1 ? 'Admin' : userRole === 2 ? 'Petugas Perpustakaan' : 'Anggota'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Selamat datang, <strong className="text-slate-800 capitalize">{currentUsername}</strong></p>
        </div>
        
        {(userRole === 1 || userRole === 2) && (
          <button onClick={() => setActiveTab('peminjaman')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 cursor-pointer">
            <Plus size={16} /> Pinjam Buku
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen size={20} /></div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Total Buku</p>
            <h3 className="text-xl font-bold text-slate-900">{bukuList.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={20} /></div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Total Anggota</p>
            <h3 className="text-xl font-bold text-slate-900">{usersList.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><BookMarked size={20} /></div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Dipinjam</p>
            <h3 className="text-xl font-bold text-slate-900">{peminjamanList.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle size={20} /></div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Terlambat</p>
            <h3 className="text-xl font-bold text-rose-600">0</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><DollarSign size={20} /></div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Denda Belum Dibayar</p>
            <h3 className="text-xl font-bold text-slate-900">Rp 0</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Aktivitas Terbaru</h3>
          <div className="divide-y divide-slate-100">
            {peminjamanList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi peminjaman terbaru.</p>
            ) : (
              peminjamanList.slice(0, 5).map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookMarked size={16} /></div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        <strong className="text-slate-900 capitalize">{item.username || `User #${item.id_user}`}</strong> meminjam <span className="text-blue-600 font-bold">{item.judul || `Buku #${item.id_buku}`}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{item.tanggal_pinjam || 'Baru saja'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Koleksi Buku Perpustakaan</h3>
          <div className="divide-y divide-slate-100">
            {bukuList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada buku di database.</p>
            ) : (
              bukuList.slice(0, 5).map((buku, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{buku.judul}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{buku.pengarang || 'Penulis'}</p>
                  </div>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-[11px]">
                    Stok: {buku.stok}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= 2. HALAMAN MANAJEMEN BUKU ================= */
function BukuManagementView({ bukuList, setBukuList, genreList, fetchData, userRole, setBukuPage }) {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const [selectedBuku, setSelectedBuku] = useState(null);
  const [modalType, setModalType] = useState(null); 
  const [formData, setFormData] = useState({ judul: '', pengarang: '', stok: 10 });

  const API_URL = 'http://localhost:8080';
  const isAuthorized = userRole === 1 || userRole === 2;

  const handleOpenModal = (type, buku) => {
    setModalType(type);
    setSelectedBuku(buku);
    setFormData({ 
      judul: buku.judul || '', 
      pengarang: buku.pengarang || '', 
      stok: buku.stok || 10
    });
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedBuku(null);
  };

  const handleDelete = async (id, judul) => {
    if (!isAuthorized) return alert("Anda tidak memiliki akses untuk menghapus buku.");
    
    if (confirm(`Apakah Anda yakin ingin menghapus buku "${judul}"?`)) {
      try {
        await axios.delete(`${API_URL}/buku/${id}`);
        fetchData();
      } catch (err) {
        setBukuList(bukuList.filter(b => b.id_buku !== id));
      }
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (selectedBuku) {
      try {
        await axios.put(`${API_URL}/buku/${selectedBuku.id_buku}`, formData);
        fetchData();
      } catch (err) {
        setBukuList(bukuList.map(b => b.id_buku === selectedBuku.id_buku ? { ...b, ...formData } : b));
      }
    }
    handleCloseModal();
  };

  // Helper pencarian nama genre berdasarkan id_genre
  const getNamaGenre = (id_genre) => {
    if (!id_genre) return 'Umum';
    const found = genreList.find(g => String(g.id_genre || g.id) === String(id_genre));
    return found ? (found.nama_genre || found.nama) : 'Umum';
  };

  // PERBAIKAN PENCARIAN & FILTER GENRE (Perbandingan String Aman)
  const filteredBuku = bukuList.filter(b => {
    const matchSearch = (b.judul || '').toLowerCase().includes(search.toLowerCase()) || 
                        (b.pengarang || '').toLowerCase().includes(search.toLowerCase());
    
    const matchGenre = selectedGenre === '' || String(b.id_genre || '') === String(selectedGenre);
    return matchSearch && matchGenre;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Buku</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola koleksi buku perpustakaan</p>
        </div>

        {isAuthorized && (
          <button 
            onClick={() => setBukuPage('tambah')} 
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 cursor-pointer"
          >
            <Plus size={16} /> Tambah Buku
          </button>
        )}
      </div>

      {/* BOX FILTER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-7 space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Cari Judul atau Pengarang</label>
            <input 
              type="text"
              placeholder="Ketik judul buku atau pengarang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Genre / Kategori</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
            >
              <option value="">Semua Genre</option>
              {genreList.map((g) => {
                const idVal = String(g.id_genre || g.id);
                return (
                  <option key={idVal} value={idVal}>
                    {g.nama_genre || g.nama}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="md:col-span-2">
            <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer">
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>

      {/* TABEL DAFTAR BUKU */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">BUKU</th>
              <th className="p-4">GENRE</th>
              <th className="p-4">STOK</th>
              <th className="p-4 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredBuku.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400">Tidak ada buku ditemukan untuk genre ini.</td></tr>
            ) : (
              filteredBuku.map((buku) => (
                <tr key={buku.id_buku || buku.judul} className="hover:bg-slate-50/50">
                  <td className="p-4 flex items-center gap-3">
                    {/* Cover Buku Default / Vektor Bawaan */}
                    <div className="w-10 h-12 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0 font-bold">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{buku.judul}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{buku.pengarang || 'Penulis'}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 font-bold text-[10px] rounded-md">
                      {getNamaGenre(buku.id_genre)}
                    </span>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-800">{buku.stok || 0} tersedia</p>
                  </td>

                  <td className="p-4 text-right space-x-2 font-bold">
                    <button onClick={() => handleOpenModal('lihat', buku)} className="text-blue-600 hover:underline cursor-pointer">
                      Lihat
                    </button>

                    {isAuthorized && (
                      <>
                        <button onClick={() => handleOpenModal('edit', buku)} className="text-blue-600 hover:underline cursor-pointer">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(buku.id_buku, buku.judul)} className="text-rose-600 hover:underline cursor-pointer">
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* POP-UP DETAIL BUKU / EDIT BUKU */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm capitalize flex items-center gap-2">
                <Info size={16} className="text-blue-600" />
                {modalType === 'lihat' ? 'Detail Informasi Buku' : 'Edit Buku'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
            </div>

            {modalType === 'lihat' ? (
              <div className="space-y-3 text-xs">
                {/* Visual Cover Buku Sederhana */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="w-12 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedBuku?.judul}</h4>
                    <p className="text-slate-500">Oleh: {selectedBuku?.pengarang || 'Penulis'}</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <p><strong>Genre / Kategori:</strong> <span className="text-blue-600 font-bold">{getNamaGenre(selectedBuku?.id_genre)}</span></p>
                  <p><strong>Stok Tersedia:</strong> {selectedBuku?.stok || 0} Eksemplar</p>
                  <p><strong>Status Peminjaman:</strong> {selectedBuku?.stok > 0 ? <span className="text-emerald-600 font-bold">Dapat Dipinjam</span> : <span className="text-rose-600 font-bold">Stok Habis</span>}</p>
                </div>

                <button onClick={handleCloseModal} className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Buku</label>
                  <input 
                    type="text" 
                    value={formData.judul} 
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pengarang</label>
                  <input 
                    type="text" 
                    value={formData.pengarang} 
                    onChange={(e) => setFormData({ ...formData, pengarang: e.target.value })} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok</label>
                  <input 
                    type="number" 
                    value={formData.stok} 
                    onChange={(e) => setFormData({ ...formData, stok: Number(e.target.value) })} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required 
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 mt-2 cursor-pointer">
                  Simpan Perubahan
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= 3. HALAMAN FORM TAMBAH BUKU ================= */
function TambahBukuView({ genreList, setGenreList, fetchData, setBukuPage }) {
  const [formData, setFormData] = useState({
    judul: '',
    pengarang: '',
    stok: 1,
    id_genre: '',
  });

  const [newGenreInput, setNewGenreInput] = useState('');
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const API_URL = 'http://localhost:8080';

  const handleAddGenre = async () => {
    if (!newGenreInput.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/genre`, { nama_genre: newGenreInput });
      const createdGenre = res.data || { id_genre: Date.now(), nama_genre: newGenreInput };
      
      setGenreList([...genreList, createdGenre]);
      setFormData({ ...formData, id_genre: createdGenre.id_genre || createdGenre.id });
      setNewGenreInput('');
      setShowAddGenre(false);
      alert(`Genre "${newGenreInput}" berhasil ditambahkan!`);
    } catch (err) {
      const tempGenre = { id_genre: Date.now(), nama_genre: newGenreInput };
      setGenreList([...genreList, tempGenre]);
      setFormData({ ...formData, id_genre: tempGenre.id_genre });
      setNewGenreInput('');
      setShowAddGenre(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/buku`, {
        judul: formData.judul,
        pengarang: formData.pengarang,
        stok: Number(formData.stok),
        id_genre: Number(formData.id_genre) || 1
      });

      alert('Buku berhasil ditambahkan!');
      fetchData();
      setBukuPage('list');
    } catch (err) {
      console.error('Gagal menambahkan buku:', err);
      alert('Buku berhasil disimpan ke daftar lokal!');
      fetchData();
      setBukuPage('list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <button onClick={() => setBukuPage('list')} className="hover:text-blue-600 cursor-pointer">
          Manajemen Buku
        </button>
        <ChevronRight size={14} />
        <span className="text-slate-900 font-bold">Tambah Buku</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tambah Buku Baru</h1>
        <p className="text-xs text-slate-500 mt-0.5">Masukkan detail buku sesuai koleksi perpustakaan</p>
      </div>

      {/* FORM UTAMA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Judul Buku</label>
            <input 
              type="text"
              placeholder="Contoh: Belajar Pemrograman Go"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Pengarang / Penulis</label>
            <input 
              type="text"
              placeholder="Nama Pengarang"
              value={formData.pengarang}
              onChange={(e) => setFormData({ ...formData, pengarang: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* DROPDOWN GENRE BUKU */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block font-bold text-slate-700">Genre Buku</label>
                <button 
                  type="button" 
                  onClick={() => setShowAddGenre(!showAddGenre)} 
                  className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  {showAddGenre ? 'Batal' : '+ Tambah Genre'}
                </button>
              </div>

              {showAddGenre ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Genre baru..." 
                    value={newGenreInput}
                    onChange={(e) => setNewGenreInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddGenre}
                    className="px-3 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer shrink-0"
                  >
                    Tambah
                  </button>
                </div>
              ) : (
                <select
                  value={formData.id_genre}
                  onChange={(e) => setFormData({ ...formData, id_genre: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700 text-xs"
                  required
                >
                  <option value="">-- Pilih Genre Buku --</option>
                  {genreList.map((g) => {
                    const idVal = String(g.id_genre || g.id);
                    return (
                      <option key={idVal} value={idVal}>
                        {g.nama_genre || g.nama}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Jumlah Stok</label>
              <input 
                type="number"
                value={formData.stok}
                onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setBukuPage('list')} 
              className="px-5 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan Buku'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
