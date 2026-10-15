"use client";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/notifications";
import { RecoveryPanel } from "./recovery-panel";
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
        if (error.code === "INVALID_TOKEN" || error.code === "TOKEN_EXPIRED") {
          setLinkInvalid(true);
          toast.error("Request a new password reset link to continue.", {
            title: "Reset link unavailable",
          });
        } else toast.error("Unable to update your password. Please try again.");
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
      description={
        linkInvalid
          ? "This reset link is missing, invalid, or expired. Request a new one to continue."
          : "Choose a new password for your Vey account."
      }
    >
      {linkInvalid ? (
        <Button asChild className="mt-7 h-12 w-full rounded-xl px-5">
          <Link href={routes.forgotPassword}>Request a new link</Link>
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit(submit, () =>
            toast.error("Review the highlighted fields and try again.", {
              title: "Check your password",
            }),
          )}
          noValidate
          className="mt-7 space-y-5"
          aria-label="Reset password form"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="reset-password"
              className="block text-sm font-medium text-foreground"
            >
              New password
            </label>
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password
                  ? "reset-password-hint reset-password-error"
                  : "reset-password-hint"
              }
              className="h-12 rounded-xl border-border bg-surface px-4 text-sm text-foreground shadow-none transition-colors duration-[var(--duration-quick)] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:bg-muted/60"
              {...register("password")}
            />
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
              className="block text-sm font-medium text-foreground"
            >
              Confirm new password
            </label>
            <PasswordInput
              visibilityLabel="confirmation password"
              id="reset-confirm-password"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword
                  ? "reset-confirm-password-error"
                  : undefined
              }
              className="h-12 rounded-xl border-border bg-surface px-4 text-sm text-foreground shadow-none transition-colors duration-[var(--duration-quick)] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:bg-muted/60"
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
            className="h-12 w-full rounded-xl bg-primary px-5 text-primary-foreground transition-colors duration-[var(--duration-quick)] hover:bg-primary-hover"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      )}
    </RecoveryPanel>
  );
}
