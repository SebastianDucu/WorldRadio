import { AnimatePresence, motion } from "framer-motion";
import { AlertIcon, CheckIcon, CloseIcon, RadioTowerIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useToastStore, type ToastTone } from "@/store/toast";
import { IconButton } from "./IconButton";

const tones: Record<ToastTone, { icon: typeof CheckIcon; color: string }> = {
  info: { icon: RadioTowerIcon, color: "text-accent" },
  success: { icon: CheckIcon, color: "text-success" },
  error: { icon: AlertIcon, color: "text-danger" },
};

/** Monta una sola vez en la raíz. Los avisos se leen en voz alta (aria-live). */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, color } = tones[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="glass pointer-events-auto flex max-w-sm items-center gap-3 py-2.5 pl-4 pr-2 text-xs font-semibold shadow-2xl border border-white/10"
            >
              <Icon size={18} className={cn("shrink-0", color)} />
              <span className="flex-1 leading-snug text-fg">{t.message}</span>
              <IconButton size="sm" tooltip={false} label="Cerrar aviso" icon={<CloseIcon size={16} />} onClick={() => dismiss(t.id)} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
