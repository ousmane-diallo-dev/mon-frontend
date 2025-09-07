import { useEffect, useRef, useState } from 'react';

interface ConfirmLogoutModalProps {
  open: boolean;
  onConfirm: () => void; // "Oui"
  onClose: () => void;   // "Non" ou fermeture
}

// Fenêtre de confirmation de déconnexion
// - Responsive, moderne, minimaliste
// - Animation légère à l'ouverture/fermeture
// - Boutons: "Oui" (rouge) et "Non" (par défaut focus)
// - TailwindCSS
export default function ConfirmLogoutModal({ open, onConfirm, onClose }: ConfirmLogoutModalProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  const nonBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Gérer le montage et l'animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Permettre la transition après montage
      requestAnimationFrame(() => setVisible(true));
      // Empêcher le scroll arrière-plan
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus par défaut sur "Non"
      const t = setTimeout(() => nonBtnRef.current?.focus(), 50);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = prevOverflow;
      };
    } else {
      // Sortie avec animation puis démontage
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Nettoyage overflow si unmount inattendu
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Piège de focus et gestion des touches (ESC/Tab)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }

    if (e.key === 'Tab') {
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-hidden={!open}>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-150 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="relative z-10 w-full max-w-md px-4" aria-live="assertive">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          onKeyDown={handleKeyDown}
          className={`transition-all duration-180 ease-out rounded-2xl bg-white dark:bg-neutral-900 shadow-xl ring-1 ring-black/5 outline-none ${
            visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
          }`}
        >
          {/* Header / Icone */}
          <div className="p-6 pb-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
              {/* Icône minimaliste (svg) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.75 6a.75.75 0 011.5 0v6a.75.75 0 01-1.5 0V8.25zM12 16.5a.75.75 0 100 1.5.75.75 0 000-1.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 id="logout-dialog-title" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Voulez-vous vraiment vous déconnecter ?
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Vous pourrez vous reconnecter à tout moment.
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 pt-2 flex items-center justify-end gap-3">
            <button
              ref={nonBtnRef}
              type="button"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 dark:text-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:ring-neutral-500"
              onClick={onClose}
            >
              Non
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 dark:focus:ring-red-500"
              onClick={onConfirm}
            >
              Oui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
