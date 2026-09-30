import { useEffect, useRef } from 'react';
import Icon from '../components/Icon';

/** Modaler Dialog auf Basis von <dialog>: Fokusfalle, Escape und Backdrop kommen vom Browser. */
export function Modal({ open, onClose, title, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className={`m-auto max-h-[92svh] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl border border-line bg-paper p-0 text-ink shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-xl'}`}
    >
      {open && (
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 id="modal-title" className="text-2xl">
              {title}
            </h2>
            <button type="button" onClick={onClose} className="grid h-10 w-10 flex-none place-items-center rounded-full hover:bg-paper-deep" aria-label="Dialog schließen">
              <Icon name="close" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function Confirm({ open, title, text, confirmLabel = 'Löschen', onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-muted">{text}</p>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          Abbrechen
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function AField({ id, label, error, hint, required, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="req">*</span>}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="field-error">
          <Icon name="alert" size={16} className="mt-0.5 flex-none" />
          {error}
        </p>
      )}
    </div>
  );
}

export function Toggle({ id, checked, onChange, label, description }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input id={id} type="checkbox" className="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block font-bold">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
    </label>
  );
}

export function EmptyState({ children }) {
  return <p className="rounded-2xl border-2 border-dashed border-line p-8 text-center text-muted">{children}</p>;
}

export function ErrorBox({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-2xl border-2 border-apple bg-[#fbeceb] p-4 font-semibold text-apple-dark">
      <Icon name="alert" size={20} className="mt-0.5 flex-none" />
      {children}
    </p>
  );
}

export function StatusPill({ tone = 'muted', children }) {
  const tones = {
    green: 'bg-sage text-forest-dark',
    honey: 'bg-honey-soft text-[#6b4a0e]',
    red: 'bg-[#fbeceb] text-apple-dark',
    blue: 'bg-[#e4ecf5] text-[#1f4468]',
    muted: 'bg-paper-deep text-muted',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
