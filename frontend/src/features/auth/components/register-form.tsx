"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getAuthErrorMessage } from "../utils/get-auth-error-message";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/register-schema";

const fieldLabelClassName =
  "block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";
const inputClassName =
  "h-12 rounded-xl border-border bg-background px-4 text-sm text-foreground shadow-none transition-colors duration-[var(--duration-quick)] placeholder:text-muted-foreground/75 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:bg-muted/60";
const errorClassName = "text-xs font-medium text-destructive";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const submit = async ({ name, email, password }: RegisterFormValues) => {
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (error) {
        toast.error(
          getAuthErrorMessage(
            error,
            "Unable to create your account. Please try again.",
          ),
        );
        return;
      }
      router.replace(routes.meetings);
      router.refresh();
    } catch (error) {
      toast.error(
        getAuthErrorMessage(
          error,
          "Unable to create your account. Please check your connection and try again.",
        ),
      );
    }
  };

  return (
    <div className="w-full rounded-[28px] border border-border bg-surface p-5 shadow-[0_20px_60px_rgba(29,33,28,0.08)] sm:p-7">
      <header className="mb-6 text-center">
        <h1 className="text-[27px] font-semibold tracking-[-0.035em] text-foreground sm:text-[30px]">
          Create your Vey account
        </h1>
        <p className="mx-auto mt-2 max-w-[320px] text-sm leading-relaxed text-muted-foreground">
          Set up your account to continue to your workspace.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        aria-label="Create account form"
        className="space-y-3.5"
      >
        <div className="space-y-1.5">
          <label htmlFor="register-name" className={fieldLabelClassName}>
            Name
          </label>
          <Input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            disabled={isSubmitting}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "register-name-error" : undefined}
            className={inputClassName}
            {...register("name")}
          />
          {errors.name && (
            <p id="register-name-error" role="alert" className={errorClassName}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className={fieldLabelClassName}>
            Email address
          </label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            className={inputClassName}
            {...register("email")}
          />
          {errors.email && (
            <p
              id="register-email-error"
              role="alert"
              className={errorClassName}
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-password" className={fieldLabelClassName}>
            Password
          </label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="8 characters minimum"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            className={inputClassName}
            {...register("password")}
          />
          {errors.password && (
            <p
              id="register-password-error"
              role="alert"
              className={errorClassName}
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="register-confirm-password"
            className={fieldLabelClassName}
          >
            Confirm password
          </label>
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter it again"
            disabled={isSubmitting}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword
                ? "register-confirm-password-error"
                : undefined
            }
            className={inputClassName}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p
              id="register-confirm-password-error"
              role="alert"
              className={errorClassName}
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="t-learn mt-1 h-12 w-full justify-between rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-[var(--duration-quick)] hover:bg-primary-hover active:scale-[0.99] focus-visible:ring-primary/40"
        >
          <span>{isSubmitting ? "Creating account..." : "Create account"}</span>
          <span className="t-learn-chevron" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path className="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
              <path className="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
            </svg>
          </span>
        </Button>
      </form>

      <div className="mt-5 border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Already have an account?{" "}
          <Link
            href={routes.login}
            className="rounded-sm font-semibold text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
