import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Native modal dialogs provide focus containment and make the page behind inert.
export function Modal({ children, className, onClose, ...props }: {
  children: ReactNode; className: string; onClose: () => void;
  'aria-labelledby': string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <dialog ref={ref} className={className} {...props}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex="0"]'))
          .filter(element => element.getClientRects().length > 0 && !element.closest('[hidden]'));
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={event => { event.preventDefault(); closeRef.current(); }}
      onClick={event => { if (event.target === event.currentTarget) closeRef.current(); }}>
      {children}
    </dialog>, document.body,
  );
}
