import { cloneElement, isValidElement, useEffect } from 'react';
import { X } from 'lucide-react';

export function ModalShell({ title, eyebrow, onClose, children, footer, footerInsideForm = false }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formChildren = isValidElement(children)
    ? Array.isArray(children.props.children)
      ? children.props.children[0]
      : children.props.children
    : null;
  const formContent = footerInsideForm && isValidElement(children)
    ? cloneElement(
      children,
      { className: 'flex flex-col flex-1 min-h-0 overflow-hidden' },
      formChildren,
      footer && <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-[#faf9f6] shrink-0">{footer}</div>,
    )
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="relative max-w-3xl w-full max-h-[85vh] flex flex-col bg-[#faf9f6] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-stone-200 bg-[#faf9f6] shrink-0">
          <div>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{eyebrow}</p>}
            <h2 id="modal-title" className="text-xl font-bold text-stone-800">{title}</h2>
          </div>
          <button type="button" aria-label="Tutup dialog" onClick={onClose} className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700">
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        {formContent || (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>
            {footer && <div className="flex items-center justify-between border-t border-stone-200 bg-[#faf9f6] px-6 py-4 shrink-0">{footer}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default ModalShell;
