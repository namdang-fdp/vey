"use client";

import {
  FacebookIcon,
  GitHubIcon,
  GoogleIcon,
} from "@/components/icons/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "../utils/get-auth-error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/notifications";
import { loginSchema, type LoginFormValues } from "../schemas/login-schema";

const providers = [
  {
    name: "Google",
    provider: "google",
    Icon: GoogleIcon,
    iconClassName: "",
  },
  {
    name: "GitHub",
    provider: "github",
    Icon: GitHubIcon,
    iconClassName: "",
  },
  {
    name: "Facebook",
    provider: "facebook",
    Icon: FacebookIcon,
    iconClassName: "text-[#1877f2]",
  },
] as const;

export function LoginForm({
  defaultEmail = "",
  oauthFailed = false,
}: {
  defaultEmail?: string;
  oauthFailed?: boolean;
}) {
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const router = useRouter();
  const oauthNoticeShown = useRef(false);
  useEffect(() => {
    if (oauthFailed && !oauthNoticeShown.current) {
      oauthNoticeShown.current = true;
      toast.error("Social sign in did not complete. Please try again.");
    }
  }, [oauthFailed]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: "" },
    mode: "onTouched",
  });
  const isPending = isSubmitting || pendingProvider !== null;

  const submit = async (values: LoginFormValues) => {
    if (pendingProvider !== null) return;
    try {
      const { error } = await authClient.signIn.email({
        ...values,
        callbackURL: routes.authComplete,
      });
      if (error) {
        toast.error(
          getAuthErrorMessage(
            error,
            "Unable to sign in. Please check your connection and try again.",
          ),
        );
        return;
      }
      toast.info("Your credentials were accepted. Opening your workspace.", {
        title: "Preparing workspace",
      });
      router.replace(routes.authComplete);
      router.refresh();
    } catch (error) {
      toast.error(
        getAuthErrorMessage(
          error,
          "Unable to sign in. Please check your connection and try again.",
        ),
      );
    }
  };

  const signInWithProvider = async (
    provider: "google" | "github" | "facebook",
    name: string,
  ) => {
    if (isPending) return;
    setPendingProvider(provider);
    toast.info(`Continue with ${name} to finish signing in.`, {
      title: `Opening ${name}`,
    });
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: routes.authComplete,
        errorCallbackURL: `${routes.login}?oauth=failed`,
      });
      if (error)
        toast.error(`Unable to continue with ${name}. Please try again.`);
    } catch {
      toast.error(`Unable to continue with ${name}. Please try again.`);
    } finally {
      setPendingProvider(null);
    }
  };

  return (
    <div className="w-full">
      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
          Sign in to Vey
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-normal text-muted-foreground">
          Welcome back. Sign in to your workspace.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-3">
        {providers.map(({ name, provider, Icon, iconClassName = "" }) => (
          <Button
            key={name}
            type="button"
            onClick={() => void signInWithProvider(provider, name)}
            disabled={isPending}
            aria-label={`Continue with ${name}`}
            variant="outline"
            className="h-12 w-full rounded-xl border-border bg-surface px-2 text-sm font-medium text-foreground shadow-none hover:border-border-strong hover:bg-muted"
          >
            <Icon className={`size-4 shrink-0 ${iconClassName}`} />
            <span>{name}</span>
          </Button>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <Separator className="flex-1 bg-border" />
        <span className="select-none text-[11px] font-medium tracking-[0.12em]">
          or continue with email
        </span>
        <Separator className="flex-1 bg-border" />
      </div>

      <form
        onSubmit={handleSubmit(submit, () =>
          toast.error("Review the highlighted fields and try again.", {
            title: "Check your details",
          }),
        )}
        noValidate
        aria-label="Sign in credentials form"
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-foreground"
          >
            Email address
          </label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            disabled={isPending}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className="h-12 rounded-xl border-border bg-surface px-4 text-sm text-foreground shadow-none transition-colors duration-[var(--duration-quick)] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:bg-muted/60"
            {...register("email")}
          />
          {errors.email && (
            <p
              id="login-email-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Link
              href={routes.forgotPassword}
              className="rounded text-xs font-medium text-primary transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isPending}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            className="h-12 rounded-xl border-border bg-surface px-4 text-sm text-foreground shadow-none transition-colors duration-[var(--duration-quick)] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:bg-muted/60"
            {...register("password")}
          />
          {errors.password && (
            <p
              id="login-password-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-1 h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-none hover:bg-primary-hover focus-visible:ring-primary/40"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground sm:text-sm">
        New to Vey?{" "}
        <Link
          href={routes.register}
          className="rounded-sm font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Register
        </Link>
      </p>
      <p className="mt-3.5 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
        By continuing, you agree to the{" "}
        <Link
          href={routes.terms}
          className="font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and acknowledge that you have read the{" "}
        <Link
          href={routes.privacy}
          className="font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
