"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "font-sans rounded-xl shadow-lg",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
