"use client";

import { Toaster as SonnerToaster } from "sonner";

export default function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        className: "rounded-2xl shadow-soft-lg !font-medium",
      }}
    />
  );
}
