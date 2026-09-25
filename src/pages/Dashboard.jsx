import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleAlert, RefreshCw, X } from 'lucide-react';
import { getToken, getUser } from '../utils/auth';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import DetailBookModal from '../components/modals/DetailBookModal';
import EditBookModal from '../components/modals/EditBookModal';
import useBooks from '../hooks/useBooks';
import {
  ATTENDANCE_STORAGE_KEY,
  FacilitiesManagement,
  LEGACY_ATTENDANCE_STORAGE_KEY,
  LAST_ATTENDANCE_DATE_STORAGE_KEY,
  LoansManagement,
  MOCK_FACILITIES,
  MobileHeader,
  Overview,
  Catalog,
  AttendanceReport,
  BooksManagement,
  downloadCsv,
  formatTransactionDate,
  getDisplayName,
  getInitials,
  getLocalDateKey,
  normalizeAttendanceRecords,
  normalizeLoan,
  PageHeader,
  readAttendanceData,
  readLoanData,
  readRegisteredUsers,
  readShiftOptions,
  RecentLoans,
  readStaffData,
  resetAttendanceData,
  saveStaffData,
  ShiftModal,
  Sidebar,
  sortStaff,
  STAFF_STORAGE_KEY,
  StaffManagement,
  StaffModal,
  TransactionModal,
  USERS_DATA_STORAGE_KEY,
  USERS_STORAGE_KEY,
  LOANS_STORAGE_KEY,
  SHIFT_STORAGE_KEY,
  writeLoanData,
  writeShiftOptions,
} from '../components/dashboard/DashboardSections';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);
  const role = Number(user?.id_role) || 3;
  const [activeView, setActiveView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiNotice, setApiNotice] = useState('');
  const { books, loading: loadingBooks, selectedBook, setSelectedBook, fetchBooks, handleSaveBook: saveBook, handleDeleteBook: removeBook } = useBooks({ onNotice: setApiNotice });
  const [deleteBook, setDeleteBook] = useState(null);
  const selectedBookFromState = useMemo(() => selectedBook ? books.find((book) => book.id_buku === selectedBook.id_buku) || selectedBook : null, [books, selectedBook]);
  const [users, setUsers] = useState(() => readRegisteredUsers(user));
  const [loans, setLoans] = useState(() => readLoanData());
  const [facilities, setFacilities] = useState(MOCK_FACILITIES);
  const [karyawan, setKaryawan] = useState(() => readStaffData(user));
  const [listShift, setListShift] = useState(() => readShiftOptions());
  const [attendanceRecords, setAttendanceRecords] = useState(() => readAttendanceData());
  const [transactionBook, setTransactionBook] = useState(null);
  const [detailBook, setDetailBook] = useState(null);
  const [shiftMember, setShiftMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const todayAttendanceRecords = useMemo(() => {
    const today = getLocalDateKey();
    return attendanceRecords.filter((record) => record.tanggal === today);
  }, [attendanceRecords]);

  useEffect(() => {
    if (!apiNotice) return undefined;
    const timer = window.setTimeout(() => {
      setApiNotice('');
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [apiNotice]);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true });
      return;
    }
    const timer = window.setTimeout(fetchBooks, 0);
    return () => window.clearTimeout(timer);
  }, [fetchBooks, navigate]);

  useEffect(() => {
    const syncAttendance = (event) => {
      const today = getLocalDateKey();
      const records = Array.isArray(event.detail) ? normalizeAttendanceRecords(event.detail) : readAttendanceData();
      setAttendanceRecords(records.filter((record) => record.tanggal === today));
    };
    const syncStaff = () => {
      setKaryawan(readStaffData(user));
      setUsers(readRegisteredUsers(user));
    };
    const syncShiftOptions = (event) => setListShift(Array.isArray(event.detail) ? event.detail : readShiftOptions());
    const syncLoans = (event) => setLoans(Array.isArray(event.detail) ? event.detail.map(normalizeLoan).filter(Boolean) : readLoanData());
    const syncFromStorage = (event) => {
      if (!event.key || event.key === ATTENDANCE_STORAGE_KEY || event.key === LEGACY_ATTENDANCE_STORAGE_KEY) {
        const today = getLocalDateKey();
        setAttendanceRecords(readAttendanceData().filter((record) => record.tanggal === today));
      }
      if (!event.key || event.key === STAFF_STORAGE_KEY || event.key === USERS_STORAGE_KEY || event.key === USERS_DATA_STORAGE_KEY) syncStaff();
      if (!event.key || event.key === LOANS_STORAGE_KEY) setLoans(readLoanData());
      if (!event.key || event.key === SHIFT_STORAGE_KEY) setListShift(readShiftOptions());
    };
    window.addEventListener('absensi_data_updated', syncAttendance);
    window.addEventListener('karyawan_data_updated', syncStaff);
    window.addEventListener('shift_options_updated', syncShiftOptions);
    window.addEventListener('transaksi_peminjaman_updated', syncLoans);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('absensi_data_updated', syncAttendance);
      window.removeEventListener('karyawan_data_updated', syncStaff);
      window.removeEventListener('shift_options_updated', syncShiftOptions);
      window.removeEventListener('transaksi_peminjaman_updated', syncLoans);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, [user]);

  useEffect(() => {
    const today = getLocalDateKey();
    const lastAttendanceDate = window.localStorage.getItem(LAST_ATTENDANCE_DATE_STORAGE_KEY);
    if (lastAttendanceDate !== today) resetAttendanceData();
    window.localStorage.setItem(LAST_ATTENDANCE_DATE_STORAGE_KEY, today);
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };
  const openModal = (type) => { setModalType(type); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setModalType(null); setSelectedBook(null); setTransactionBook(null); setDetailBook(null); setShiftMember(null); };
  const handleAddBook = async (form) => {
    await saveBook(form);
    closeModal();
  };
  const handleEditBook = async (form) => {
    await saveBook(form, detailBook);
    closeModal();
  };
  const requestDeleteBook = (book) => setDeleteBook(book);
  const handleDeleteBook = () => {
    if (!deleteBook) return;
    removeBook(deleteBook);
    setDeleteBook(null);
    closeModal();
  };
  const handleNewTransaction = (form) => {
    const newLoan = { id: Date.now(), code: `TRX-${new Date().getFullYear()}-${String(loans.length + 1).padStart(4, '0')}`, member: form.member, book: form.book, date: formatTransactionDate(), due: form.due, status: 'Dipinjam', fine: 0 };
    const nextLoans = [newLoan, ...loans];
    setLoans(nextLoans);
    writeLoanData(nextLoans);
    setApiNotice('Transaksi baru ditambahkan ke daftar lokal.');
    closeModal();
  };
  const handleShiftOptionsChange = (nextOptions) => {
    setListShift(nextOptions);
    writeShiftOptions(nextOptions);
  };
  const handleEditShift = (member) => {
    setShiftMember(member);
    openModal('edit-shift');
  };
  const handleSaveShift = (shift) => {
    if (!shiftMember) return;
    const nextStaff = sortStaff(karyawan.map((member) => member.id === shiftMember.id ? { ...member, shift } : member));
    setKaryawan(nextStaff);
    setUsers((current) => current.map((member) => member.id === shiftMember.id ? { ...member, shift } : member));
    saveStaffData(nextStaff);
    setApiNotice('Jadwal shift berhasil diperbarui.');
    closeModal();
  };
  const handleAddStaff = (form) => {
    const newStaff = { id: Date.now(), ...form, name: form.name.trim(), username: form.username.trim(), shift: form.shift.trim(), status: 'Aktif' };
    const nextStaff = sortStaff([...karyawan, newStaff]);
    setKaryawan(nextStaff);
    setUsers((current) => sortStaff([...current.filter((member) => member.username !== newStaff.username), newStaff]));
    saveStaffData(nextStaff);
    setApiNotice('Karyawan baru berhasil ditambahkan.');
    closeModal();
  };
  const exportBooks = () => downloadCsv('data-buku.csv', ['Judul', 'Penulis', 'Penerbit', 'Genre', 'Stok', 'Status'], books.map((book) => [book.judul, book.penulis, book.penerbit, book.genre, book.stok, book.status]));
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const handleFacilityEdit = ({ id, good, maintenance, broken }) => {
    setFacilities((current) => current.map((facility) => facility.id === id ? { ...facility, good, maintenance, broken } : facility));
    setApiNotice('Jumlah kondisi fasilitas berhasil diperbarui.');
  };
  return <div className="flex min-h-svh bg-[#FAF7F2] font-sans text-stone-900"><Sidebar activeView={activeView} onViewChange={setActiveView} role={role} user={user} onLogout={handleLogout} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="min-w-0 flex-1"><MobileHeader onOpenMenu={() => setMobileOpen(true)} onLogout={handleLogout} user={user} /><main className="mx-auto max-w-[1480px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"><div className="mb-6 hidden items-center justify-between lg:flex"><p className="text-xs text-stone-500">{currentDate}</p><div className="flex items-center gap-3"><button type="button" aria-label="Muat ulang katalog" onClick={fetchBooks} className="rounded-md p-2 text-stone-500 hover:bg-white hover:text-stone-900"><RefreshCw aria-hidden="true" className={`size-4 ${loadingBooks ? 'animate-spin' : ''}`} /></button><div className="flex items-center gap-2 border-l border-stone-200 pl-4"><span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-[#FAF7F2]">{getInitials(getDisplayName(user))}</span><span className="text-sm text-stone-700">{getDisplayName(user)}</span></div></div></div>{apiNotice && <div className="mb-5 flex items-center gap-3 rounded-md border border-[#ead9b8] bg-[#faf4e7] px-4 py-3 text-xs text-[#85672c]" role="status" aria-live="polite"><CircleAlert aria-hidden="true" className="size-4 shrink-0" /><span className="flex-1">{apiNotice}</span><button type="button" aria-label="Tutup notifikasi" onClick={() => setApiNotice('')} className="rounded p-1 text-[#85672c]/70 transition hover:bg-[#f3e6cc] hover:text-[#85672c]"><X aria-hidden="true" className="size-4" /></button></div>}{activeView === 'overview' && <Overview user={user} role={role} onViewChange={setActiveView} loans={loans} users={users} />}{activeView === 'catalog' && <Catalog books={books} onBookSelect={(book) => setSelectedBook(book)} />}{activeView === 'my-loans' && <><PageHeader eyebrow="Aktivitas pengguna" title="Peminjaman saya" description="Daftar buku yang sedang dipinjam dan riwayat transaksi." /><RecentLoans loans={loans} memberOnly /></>}{activeView === 'books' && <BooksManagement books={books} onAddBook={() => openModal('add-book')} onExport={exportBooks} onBookSelect={(book) => setSelectedBook(book)} />}{activeView === 'loans' && <LoansManagement loans={loans} books={books} onNewTransaction={() => openModal('transaction')} />}{activeView === 'facilities' && <FacilitiesManagement facilities={facilities} onEdit={handleFacilityEdit} />}{activeView === 'staff' && role === 1 && <StaffManagement staff={karyawan} currentUser={user} onEditShift={handleEditShift} onAddStaff={() => openModal('add-staff')} />}{activeView === 'attendance' && role === 1 && <AttendanceReport attendanceRecords={todayAttendanceRecords} />}{selectedBook && !isModalOpen && <DetailBookModal book={selectedBookFromState} canDelete={role !== 3} onDelete={requestDeleteBook} onClose={() => setSelectedBook(null)} onBorrow={(book) => { setSelectedBook(null); setTransactionBook(book); openModal('transaction'); }} onEdit={(book) => { setSelectedBook(null); setDetailBook(book); openModal('edit-book'); }} />}{isModalOpen && modalType === 'add-book' && <EditBookModal onClose={closeModal} onSave={handleAddBook} />}{isModalOpen && modalType === 'edit-book' && detailBook && <EditBookModal key={detailBook.id_buku} book={detailBook} canDelete={role !== 3} onDelete={requestDeleteBook} onClose={closeModal} onSave={handleEditBook} />}{isModalOpen && modalType === 'transaction' && <TransactionModal key={transactionBook?.id_buku || 'new'} books={books} users={users} initialBook={transactionBook} onClose={closeModal} onSave={handleNewTransaction} />}{isModalOpen && modalType === 'add-staff' && <StaffModal shiftOptions={listShift} onClose={closeModal} onSave={handleAddStaff} />}{isModalOpen && modalType === 'edit-shift' && shiftMember && <ShiftModal member={shiftMember} shiftOptions={listShift} onShiftOptionsChange={handleShiftOptionsChange} onClose={closeModal} onSave={handleSaveShift} />}</main>{deleteBook && <DeleteConfirmModal book={deleteBook} onClose={() => setDeleteBook(null)} onConfirm={handleDeleteBook} />}</div></div>;
}

