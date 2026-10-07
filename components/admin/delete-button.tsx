"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/admin/confirm-dialog";

/**
 * A delete trigger wired to the shared ConfirmDialog: renders `children` as
 * the button (so each screen keeps its own styling), and on confirmation
 * invokes the server action with the row's id in FormData — the same shape
 * the old `<form action={deleteX}>` sent, so no action changes are needed.
 */
export default function DeleteButton({
  action,
  id,
  title,
  description,
  confirmLabel = "Delete",
  className,
  ariaLabel,
  children,
}: {
  action: (formData: FormData) => Promise<unknown>;
  /** Row id, sent as the `id` form field. */
  id: string;
  title: string;
  description?: string;
  confirmLabel?: string;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    const fd = new FormData();
    fd.set("id", id);
    try {
      await action(fd);
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        pending={pending}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
