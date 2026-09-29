import { cn } from "@/lib/utils";
import Image from "next/image";

export function BrandLogo({
  markOnly = false,
  className,
  markClassName,
}: {
  markOnly?: boolean;
  className?: string;
  markClassName?: string;
}) {
  const src = markOnly ? "/brand/vey-mark.svg" : "/brand/vey-logo.svg";

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={src}
        alt="Vey"
        width={markOnly ? 32 : 112}
        height={32}
        loading="eager"
        sizes={markOnly ? "32px" : "112px"}
        className={cn("h-8 w-auto", markClassName)}
      />
    </span>
  );
}
