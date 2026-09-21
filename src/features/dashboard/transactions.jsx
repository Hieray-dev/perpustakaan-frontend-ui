import { useState } from 'react';
import { ArrowUpRight, Download } from 'lucide-react';
import { Badge, BookCover, Button, EmptyState, Modal, SearchInput } from './ui';
import { dateLabel, isOpenLoan, loanStatus, rupiah } from './data';

export function LoanTable({ data, loans, compact = false, member = false, onProcess }) {
  if (!loans.length) return <EmptyState title="Belum ada peminjaman" description="Transaksi yang sesuai akan ditampilkan di sini." />;
  return <div className="overflow-x-auto"><table className="dash-table"><thead><tr><th>Buku {compact ? '& peminjam' : ''}</th>{!compact && !member && <th>Peminjam</th>}{!compact && <th>Batas kembali</th>}<th>Status</th>{!compact && <th>Denda</th>}{onProcess && <th><span className="sr-only">Tindakan</span></th>}</tr></thead><tbody>{loans.map((loan) => {
    const book = data.books.find((item) => String(item.id_buku) === String(loan.id_buku));
    const name = loan.nama || data.users.find((person) => String(person.id_user) === String(loan.id_user))?.nama || 'Anggota';
    const status = loanStatus(loan);
    return <tr key={loan.id_peminjaman}><td><div className="flex min-w-40 items-center gap-3">{book && <BookCover book={book} className="h-11 w-[30px] shrink-0 rounded-r-sm" />}<div><p className="max-w-48 truncate text-[11px] font-medium">{book?.judul || loan.judul || 'Buku tidak ditemukan'}</p><p className="mt-1.5 text-[9px] text-stone-400">{compact ? `${name} · ${loan.kode_transaksi}` : loan.kode_transaksi}</p></div></div></td>{!compact && !member && <td><p className="text-[11px]">{name}</p><p className="mt-1.5 text-[9px] text-stone-400">{dateLabel(loan.tanggal_peminjaman)}</p></td>}{!compact && <td className="whitespace-nowrap">{dateLabel(loan.batas_waktu)}</td>}<td><Badge tone={status === 'Terlambat' ? 'danger' : status === 'Dikembalikan' ? 'neutral' : status === 'Menunggu' ? 'warning' : 'success'}>{status}</Badge></td>{!compact && <td className="whitespace-nowrap">{rupiah(loan.denda)}</td>}{onProcess && <td>{isOpenLoan(loan) && <button onClick={() => onProcess(loan)} className="whitespace-nowrap text-[10px] font-medium underline decoration-stone-300 underline-offset-4">{loan.status === 'Menunggu' ? 'Konfirmasi' : 'Kembalikan'}</button>}</td>}</tr>;
  })}</tbody></table></div>;
}

export default function Transactions({ data, member, onProcess, onBrowse }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const loans = data.loans.filter((loan) => {
    const book = data.books.find((item) => item.id_buku === loan.id_buku);
    return (filter === 'Semua' || loanStatus(loan) === filter) && `${loan.kode_transaksi} ${loan.nama || ''} ${book?.judul || ''}`.toLowerCase().includes(search.toLowerCase());
  });
  async function confirm() {
    setBusy(true); setError('');
    try { await onProcess(selected); setSelected(null); } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  function download() {
    const escape = (value) => `"${String(value ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
    const rows = [['Kode transaksi', 'Peminjam', 'Buku', 'Tanggal pinjam', 'Batas kembali', 'Status', 'Denda'], ...loans.map((loan) => [loan.kode_transaksi, loan.nama, data.books.find((book) => book.id_buku === loan.id_buku)?.judul, loan.tanggal_peminjaman, loan.batas_waktu, loanStatus(loan), loan.denda])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map((row) => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'laporan-peminjaman.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <>
    {member && <div className="mb-6 grid grid-cols-3 gap-3">{[{ label: 'Sedang dipinjam', value: data.loans.filter(isOpenLoan).length }, { label: 'Selesai dibaca', value: data.loans.filter((loan) => loan.status === 'Dikembalikan').length }, { label: 'Denda tercatat', value: rupiah(data.loans.reduce((sum, loan) => sum + Number(loan.denda || 0), 0)) }].map((stat) => <div key={stat.label} className="rounded-lg border border-stone-200 bg-white p-4"><p className="text-[10px] text-stone-500">{stat.label}</p><p className="mt-3 font-serif text-2xl">{stat.value}</p></div>)}</div>}
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white"><div className="flex flex-wrap items-center gap-3 border-b border-stone-200 p-5"><SearchInput value={search} onChange={setSearch} label="Cari peminjaman" placeholder="Cari buku, peminjam, atau kode…" /><select aria-label="Filter status peminjaman" value={filter} onChange={(event) => setFilter(event.target.value)} className="dash-input w-auto">{['Semua', 'Menunggu', 'Dipinjam', 'Terlambat', 'Dikembalikan'].map((status) => <option key={status}>{status}</option>)}</select>{member ? <Button secondary onClick={onBrowse}>Cari buku <ArrowUpRight className="size-3.5" /></Button> : <Button secondary onClick={download}><Download className="size-3.5" />Ekspor</Button>}</div><LoanTable data={data} loans={loans} member={member} onProcess={member ? undefined : (loan) => { setError(''); setSelected(loan); }} /><div className="border-t border-stone-100 px-5 py-4 text-[10px] text-stone-400">Menampilkan {loans.length} dari {data.loans.length} transaksi</div></section>
    {selected && <Modal title={selected.status === 'Menunggu' ? 'Konfirmasi peminjaman?' : 'Terima pengembalian?'} onClose={() => setSelected(null)} busy={busy} description={`Transaksi ${selected.kode_transaksi}`}><p className="text-sm leading-7 text-stone-600">{selected.status === 'Menunggu' ? 'Pastikan buku sudah diserahkan kepada anggota sebelum mengonfirmasi.' : 'Pastikan kondisi buku sudah diperiksa. Stok akan ditambahkan kembali setelah pengembalian dicatat.'}</p>{Number(selected.denda) > 0 && <p className="mt-4 rounded border border-stone-200 bg-white p-3 text-xs">Denda tercatat: <strong>{rupiah(selected.denda)}</strong>. Pencatatan pengembalian tidak menandai denda sebagai lunas.</p>}{error && <p role="alert" className="mt-4 text-xs text-red-700">{error}</p>}<div className="mt-6 flex justify-end gap-3"><Button secondary disabled={busy} onClick={() => setSelected(null)}>Batal</Button><Button disabled={busy} onClick={confirm}>{busy ? 'Menyimpan…' : 'Konfirmasi'}</Button></div></Modal>}
  </>;
}
