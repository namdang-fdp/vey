"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, ShieldAlert } from "lucide-react";
import { RecoveryPanel, RecoveryArrow } from "./recovery-panel";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "../schemas/recovery-schema";

export function ResetPasswordForm({
  token,
  invalidLink = false,
}: {
  token?: string;
  invalidLink?: boolean;
}) {
  const router = useRouter();
  const [linkInvalid, setLinkInvalid] = useState(!token || invalidLink);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const submit = async ({ password }: ResetPasswordValues) => {
    if (!token) return;
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (error) {
        if (error.code === "INVALID_TOKEN" || error.code === "TOKEN_EXPIRED")
          setLinkInvalid(true);
        else toast.error("Unable to update your password. Please try again.");
        return;
      }
      toast.success(
        "Password updated. You can sign in with your new password.",
      );
      router.replace(routes.login);
      router.refresh();
    } catch {
      toast.error("Unable to update your password. Please try again.");
    }
  };

  return (
    <RecoveryPanel
      title={linkInvalid ? "Reset link unavailable" : "Set a new password"}
      icon={
        linkInvalid ? (
          <ShieldAlert className="size-5" />
        ) : (
          <KeyRound className="size-5" />
        )
      }
      description={
        linkInvalid
          ? "This reset link is missing, invalid, or expired. Request a new one to continue."
          : "Choose a new password for your Vey account."
      }
    >
      {linkInvalid ? (
        <Button
          asChild
          className="t-learn mt-7 h-12 w-full justify-between rounded-xl px-5"
        >
          <Link href={routes.forgotPassword}>
            Request a new link
            <RecoveryArrow />
          </Link>
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="mt-7 space-y-5"
          aria-label="Reset password form"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="reset-password"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              New password
            </label>
            <div className="relative">
              <Input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password
                    ? "reset-password-hint reset-password-error"
                    : "reset-password-hint"
                }
                className="h-12 rounded-xl bg-background px-4 pr-12 shadow-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isSubmitting}
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </Button>
            </div>
            <p
              id="reset-password-hint"
              className="text-xs text-muted-foreground"
            >
              Use 8–128 characters.
            </p>
            {errors.password && (
              <p
                id="reset-password-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="reset-confirm-password"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Confirm new password
            </label>
            <Input
              id="reset-confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword
                  ? "reset-confirm-password-error"
                  : undefined
              }
              className="h-12 rounded-xl bg-background px-4 shadow-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p
                id="reset-confirm-password-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="t-learn h-12 w-full justify-between rounded-xl bg-primary px-5 text-primary-foreground transition-colors duration-[var(--duration-quick)] hover:bg-primary-hover"
          >
            {isSubmitting ? "Updating..." : "Update password"}
            <RecoveryArrow />
          </Button>
        </form>
      )}
    </RecoveryPanel>
  );
}
