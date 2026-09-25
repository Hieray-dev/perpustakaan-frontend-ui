import ModalShell from './ModalShell';

export default function DeleteConfirmModal({ book, onClose, onConfirm }) {
  if (!book) return null;

  return (
    <ModalShell eyebrow="Koleksi" title="Hapus buku" onClose={onClose} footer={<div className="flex w-full justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100">Batal</button><button type="button" onClick={onConfirm} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800">Ya, Hapus</button></div>}>
      <div className="space-y-4"><p className="text-sm leading-6 text-stone-600">Apakah Anda yakin ingin menghapus buku ini?</p><p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-800">{book.judul}</p></div>
    </ModalShell>
  );
}
