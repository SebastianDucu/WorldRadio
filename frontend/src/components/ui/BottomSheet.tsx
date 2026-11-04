import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);

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

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          tabIndex={-1}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 36 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={onDragEnd}
          className={cn(
            "glass fixed inset-x-0 bottom-20 z-40 mx-2 flex max-h-[70dvh] flex-col rounded-b-xl outline-none",
            className,
          )}
        >
          <div className="flex justify-center pb-1 pt-2" aria-hidden="true">
            <span className="h-1.5 w-10 rounded-full bg-fg/25" />
          </div>
          <h2 id={titleId} className="px-4 pb-2 text-lg font-semibold">{title}</h2>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
