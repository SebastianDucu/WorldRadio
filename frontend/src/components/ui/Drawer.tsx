import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { IconButton } from "./IconButton";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/** Cierra con Escape y devuelve el foco al elemento que abrió el panel. */
function useDialogFocus(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);
  return ref;
}

/** Panel lateral para escritorio. En móvil se usa BottomSheet. */
export function Drawer({ open, onClose, title, children, className }: DrawerProps) {
  const titleId = useId();
  const ref = useDialogFocus(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          ref={ref as React.RefObject<HTMLElement>}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          tabIndex={-1}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 36 }}
          className={cn("glass fixed bottom-24 left-4 top-4 z-40 flex w-[22rem] flex-col overflow-hidden outline-none", className)}
        >
          <header className="flex items-center justify-between border-b border-fg/10 px-4 py-3">
            <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
            <IconButton size="sm" label="Cerrar panel" icon={<CloseIcon size={20} />} onClick={onClose} />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
