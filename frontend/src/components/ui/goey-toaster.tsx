"use client";
import { GooeyToaster } from "goey-toast";
export function Toaster() {
  return (
    <GooeyToaster
      position="bottom-right"
      theme="dark"
      preset="subtle"
      spring={false}
      closeButton="top-right"
      closeOnEscape
      toastOptions={{ style: { height: "auto" } }}
      showTimestamp={false}
      showProgress={false}
      visibleToasts={1}
      maxQueue={1}
    />
  );
}
