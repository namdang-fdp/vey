import * as React from "react";
import Image from "next/image";

export function AuthVisualPanel() {
  return (
    <aside
      aria-label="Vey editorial visual"
      className="relative hidden h-full w-full overflow-hidden rounded-2xl border border-border/50 bg-auth-visual shadow-xs lg:block t-auth-art-enter"
    >
      <Image
        src="/images/auth-artwork.webp"
        alt="Expressive Mediterranean coastal oil painting featuring maritime pine trees overlooking an azure sea"
        fill
        priority
        sizes="(min-width: 1280px) 54vw, (min-width: 1024px) 50vw, 0vw"
        className="object-cover object-center select-none"
      />
    </aside>
  );
}
