"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useReducedMotion } from "motion/react";
import { EyeIcon, type EyeIconHandle } from "@/components/icons/animated/eye";
import {
  EyeOffIcon,
  type EyeOffIconHandle,
} from "@/components/icons/animated/eye-off";
import { Input } from "./input";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/notifications";

export function PasswordInput({
  className,
  visibilityLabel = "password",
  disabled,
  id,
  ...props
}: Omit<ComponentProps<typeof Input>, "type"> & { visibilityLabel?: string }) {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const eye = useRef<EyeIconHandle>(null);
  const eyeOff = useRef<EyeOffIconHandle>(null);
  const changed = useRef(false);
  useEffect(() => {
    if (!changed.current || reducedMotion) return;
    const icon = visible ? eyeOff.current : eye.current;
    icon?.startAnimation();
    // Motion stops the departing icon on unmount. The library's stopAnimation()
    // starts a reset animation, so calling it in cleanup targets an unmounted icon.
  }, [visible, reducedMotion]);
  return (
    <div className="relative">
      <Input
        {...props}
        id={id}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className={cn(className, "pr-14")}
      />
      <Button
        variant="ghost"
        size="icon"
        type="button"
        disabled={disabled}
        aria-label={`${visible ? "Hide" : "Show"} ${visibilityLabel}`}
        aria-controls={id}
        aria-pressed={visible}
        className="absolute inset-y-0 right-1 my-auto size-11 text-muted-foreground hover:text-foreground"
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") event.preventDefault();
        }}
        onClick={() => {
          changed.current = true;
          const next = !visible;
          setVisible(next);
          toast.info(
            `Your ${visibilityLabel} is now ${next ? "visible" : "hidden"}.`,
            { title: next ? "Password shown" : "Password hidden" },
          );
        }}
      >
        {visible ? (
          <EyeOffIcon ref={eyeOff} size={16} aria-hidden="true" />
        ) : (
          <EyeIcon ref={eye} size={16} aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
