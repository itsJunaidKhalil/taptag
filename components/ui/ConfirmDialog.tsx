"use client";

import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import Modal from "./Modal";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
}

interface ConfirmInternalProps extends ConfirmOptions {
  onResolve: (value: boolean) => void;
}

function ConfirmDialogInternal({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onResolve,
}: ConfirmInternalProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => onResolve(false), 100);
      return () => clearTimeout(t);
    }
  }, [open, onResolve]);

  const close = (value: boolean) => {
    setOpen(false);
    setTimeout(() => onResolve(value), 100);
  };

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-gradient-primary text-white hover:opacity-90";

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && close(false)}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            onClick={() => close(false)}
            className="px-4 py-2.5 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm font-semibold"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => close(true)}
            className={`px-4 py-2.5 rounded-2xl transition-all text-sm font-semibold shadow-soft ${confirmClass}`}
            autoFocus
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div />
    </Modal>
  );
}

let mountPoint: { container: HTMLDivElement; root: Root } | null = null;

function getMountPoint() {
  if (typeof window === "undefined") return null;
  if (!mountPoint) {
    const container = document.createElement("div");
    container.id = "confirm-dialog-mount";
    document.body.appendChild(container);
    mountPoint = { container, root: createRoot(container) };
  }
  return mountPoint;
}

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const mp = getMountPoint();
    if (!mp) {
      resolve(false);
      return;
    }
    const handleResolve = (value: boolean) => {
      mp.root.render(<></>);
      resolve(value);
    };
    mp.root.render(<ConfirmDialogInternal {...options} onResolve={handleResolve} />);
  });
}
