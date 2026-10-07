"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, TriangleAlert } from "lucide-react";

/**
 * The admin's confirmation modal — every destructive action in the CMS
 * (delete member, partner, FAQ, article, media file, site content…) routes
 * through this instead of `window.confirm`.
 *
 * Usage: hold `open` + `pending` in the caller's state, pass an async
 * `onConfirm`; the dialog shows "Deleting…" while it runs and closes itself.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  /** True while the caller's async delete runs — disables both buttons. */
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus the confirm button when the dialog opens, and close on Escape.
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-ink-deep/50"
            onClick={pending ? undefined : onCancel}
            aria-hidden
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={description ? "confirm-dialog-desc" : undefined}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="relative w-[400px] max-w-full rounded-xl border border-gray-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fee2e2]">
                <TriangleAlert className="size-5 text-red-600" />
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <h2 id="confirm-dialog-title" className="font-bold text-ink">
                  {title}
                </h2>
                {description && (
                  <p id="confirm-dialog-desc" className="text-sm text-gray-500">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={pending}
                className="h-9 rounded-lg border border-gray-200 px-4 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {pending && <Loader2 className="size-3.5 animate-spin" />}
                {pending ? "Deleting…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
