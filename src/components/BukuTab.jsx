import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  X, 
  Eye, 
  Edit3, 
  Trash2, 
  BookOpen 
} from 'lucide-react';

export default function BukuTab() {
  const [bukuList, setBukuList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [currentBuku, setCurrentBuku] = useState({
    id_buku: null,
    judul: '',
    pengarang: '',
    isbn: '',
    kategori: 'Fiksi',
    stok: 10,
    status: 'Aktif'
  });

  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchBuku();
  }, []);

  const fetchBuku = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/buku`);
      setBukuList(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data buku dari backend Go:", err);
      setBukuList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/buku`, currentBuku);
      alert('Buku berhasil ditambahkan!');
      setIsAddModalOpen(false);
      resetForm();
      fetchBuku();
    } catch (err) {
      console.error("Gagal menambah buku:", err);
      setBukuList([...bukuList, { ...currentBuku, id_buku: Date.now() }]);
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/buku/${currentBuku.id_buku}`, currentBuku);
      alert('Buku berhasil diperbarui!');
      setIsEditModalOpen(false);
      resetForm();
      fetchBuku();
    } catch (err) {
      console.error("Gagal memperbarui buku:", err);
      setBukuList(bukuList.map(b => b.id_buku === currentBuku.id_buku ? currentBuku : b));
      setIsEditModalOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id, judul) => {
    if (confirm(`Yakin ingin menghapus buku "${judul}"?`)) {
      try {
        await axios.delete(`${API_URL}/buku/${id}`);
        fetchBuku();
      } catch (err) {
        console.error("Gagal menghapus buku:", err);
        setBukuList(bukuList.filter(b => b.id_buku !== id));
      }
    }
  };

  const resetForm = () => {
    setCurrentBuku({
      id_buku: null,
      judul: '',
      pengarang: '',
      isbn: '',
      kategori: 'Fiksi',
      stok: 10,
      status: 'Aktif'
    });
  };

  const filteredBuku = bukuList.filter((item) => {
    const matchesSearch = 
      (item.judul || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pengarang || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.isbn || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === '' || (item.kategori || item.genre || 'Fiksi') === selectedCategory;
    const matchesStatus = selectedStatus === '' || (item.status || 'Aktif') === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER HALAMAN & TOMBOL TAMBAH */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Buku</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola koleksi buku perpustakaan</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus size={16} /> Tambah Buku
        </button>
      </div>

      {/* 2. BOX FILTER & SEARCH */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          {/* Input Cari */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Cari Buku</label>
            <input 
              type="text"
              placeholder="Judul, pengarang, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Filter Kategori */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
            >
              <option value="">Semua Kategori</option>
              <option value="Fiksi">Fiksi</option>
              <option value="Sains">Sains</option>
              <option value="Matematika">Matematika</option>
              <option value="Sejarah">Sejarah</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>

          {/* Tombol Cari */}
          <div className="md:col-span-2">
            <button 
              onClick={() => {}} // Filter jalan otomatis via state
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={14} /> Cari
            </button>
          </div>

        </div>
      </div>

      {/* 3. TABEL DAFTAR BUKU */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4 w-5/12">BUKU</th>
              <th className="p-4 w-2/12">KATEGORI</th>
              <th className="p-4 w-2/12">STOK</th>
              <th className="p-4 w-1/12">STATUS</th>
              <th className="p-4 w-2/12 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400">Memuat data buku...</td></tr>
            ) : filteredBuku.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400">Tidak ada buku ditemukan di database Beekeeper.</td></tr>
            ) : (
              filteredBuku.map((buku) => (
                <tr key={buku.id_buku || buku.judul} className="hover:bg-slate-50/50 transition-all">
                  
                  {/* Info Buku */}
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-12 bg-slate-200 rounded flex items-center justify-center text-[9px] text-slate-400 font-bold shrink-0">
                      200 × 200
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{buku.judul}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{buku.pengarang || 'Penulis'}</p>
                      <p className="text-[10px] text-slate-400">ISBN: {buku.isbn || '9789792212983'}</p>
                    </div>
                  </td>

                  {/* Kategori Badge */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 font-bold text-[10px] rounded-md">
                      {buku.kategori || buku.genre || 'Fiksi'}
                    </span>
                  </td>

                  {/* Stok */}
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{buku.stok || 10} / {buku.stok || 10} tersedia</p>
                    <p className="text-[10px] text-slate-400">0 dipinjam</p>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 font-bold text-[10px] rounded-md ${
                      (buku.status || 'Aktif') === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {buku.status || 'Aktif'}
                    </span>
                  </td>

                  {/* Aksi (Lihat, Edit, Hapus) */}
                  <td className="p-4 text-right space-x-2 font-bold text-xs">
                    <button 
                      onClick={() => { setCurrentBuku(buku); setIsDetailModalOpen(true); }}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Lihat
                    </button>
                    <button 
                      onClick={() => { setCurrentBuku(buku); setIsEditModalOpen(true); }}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(buku.id_buku, buku.judul)}
                      className="text-rose-600 hover:underline cursor-pointer"
                    >
                      Hapus
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL TAMBAH BUKU ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Buku Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Buku</label>
                <input 
                  type="text" 
                  value={currentBuku.judul} 
                  onChange={(e) => setCurrentBuku({...currentBuku, judul: e.target.value})} 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl" required 
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pengarang</label>
                <input 
                  type="text" 
                  value={currentBuku.pengarang} 
                  onChange={(e) => setCurrentBuku({...currentBuku, pengarang: e.target.value})} 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl" required 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISBN</label>
                  <input 
                    type="text" 
                    value={currentBuku.isbn} 
                    onChange={(e) => setCurrentBuku({...currentBuku, isbn: e.target.value})} 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok</label>
                  <input 
                    type="number" 
                    value={currentBuku.stok} 
                    onChange={(e) => setCurrentBuku({...currentBuku, stok: Number(e.target.value)})} 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl" required 
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                <select 
                  value={currentBuku.kategori} 
                  onChange={(e) => setCurrentBuku({...currentBuku, kategori: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value="Fiksi">Fiksi</option>
                  <option value="Sains">Sains</option>
                  <option value="Matematika">Matematika</option>
                  <option value="Sejarah">Sejarah</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 mt-2">
                Simpan Buku
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT BUKU ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Buku</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Buku</label>
                <input 
                  type="text" 
                  value={currentBuku.judul} 
                  onChange={(e) => setCurrentBuku({...currentBuku, judul: e.target.value})} 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl" required 
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pengarang</label>
                <input 
                  type="text" 
                  value={currentBuku.pengarang} 
                  onChange={(e) => setCurrentBuku({...currentBuku, pengarang: e.target.value})} 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl" required 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok</label>
                  <input 
                    type="number" 
                    value={currentBuku.stok} 
                    onChange={(e) => setCurrentBuku({...currentBuku, stok: Number(e.target.value)})} 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl" required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select 
                    value={currentBuku.status || 'Aktif'} 
                    onChange={(e) => setCurrentBuku({...currentBuku, status: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 mt-2">
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL LIHAT DETAIL BUKU ================= */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Detail Informasi Buku</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <div className="space-y-2 text-xs">
              <p><strong>Judul:</strong> {currentBuku.judul}</p>
              <p><strong>Pengarang:</strong> {currentBuku.pengarang || '-'}</p>
              <p><strong>ISBN:</strong> {currentBuku.isbn || '9789792212983'}</p>
              <p><strong>Kategori:</strong> {currentBuku.kategori || 'Fiksi'}</p>
              <p><strong>Jumlah Stok:</strong> {currentBuku.stok || 10} Eksemplar</p>
              <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">{currentBuku.status || 'Aktif'}</span></p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
