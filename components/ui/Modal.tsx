"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  hideClose?: boolean;
}

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  hideClose = false,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-[70] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 ${sizeClass[size]} glass border border-white/30 dark:border-white/10 rounded-3xl shadow-soft-lg p-6 sm:p-7 focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 max-h-[90vh] overflow-y-auto`}
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
          }}
        >
          {!hideClose && (
            <Dialog.Close asChild>
              <button
                className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          )}
          {title && (
            <Dialog.Title className="text-xl sm:text-2xl font-heading font-bold text-gray-900 mb-2 pr-8">
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description className="text-sm text-gray-600 mb-5">
              {description}
            </Dialog.Description>
          )}
          <div className="text-gray-800">{children}</div>
          {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
