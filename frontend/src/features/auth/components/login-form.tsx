"use client";

import {
  FacebookIcon,
  GitHubIcon,
  GoogleIcon,
} from "@/components/icons/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "../utils/get-auth-error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  const [showPassword, setShowPassword] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (oauthFailed)
      toast.error("Social sign in did not complete. Please try again.");
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
        callbackURL: routes.meetings,
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
      router.replace(routes.meetings);
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
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: routes.meetings,
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
      <header className="mb-7 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
          Sign in to Vey
        </h1>
        <p className="mx-auto mt-1.5 max-w-[320px] text-sm leading-normal text-muted-foreground">
          Welcome back. Choose how you want to continue to your workspace.
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
            className="group h-12 w-full rounded-xl border-[#dbdbdb] bg-white px-2 text-sm font-medium text-[#262626] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-[#b5b5b5] hover:bg-[#fafafa] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-[0.99]"
          >
            <Icon
              className={`size-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${iconClassName}`}
            />
            <span>{name}</span>
          </Button>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-[#858585]">
        <Separator className="flex-1 bg-[#e5e5e5]" />
        <span className="select-none text-[11px] font-medium tracking-[0.12em]">
          or continue with email
        </span>
        <Separator className="flex-1 bg-[#e5e5e5]" />
      </div>

      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        aria-label="Sign in credentials form"
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold uppercase tracking-wider text-[#494949]"
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
            className="h-11 rounded-xl border-[#dbdbdb] bg-white px-3.5 text-sm text-foreground shadow-2xs transition-all placeholder:text-[#a3a3a3] focus-visible:border-[#121814] focus-visible:ring-[#121814]/10 disabled:bg-[#f5f5f5] sm:h-12"
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
              className="block text-xs font-semibold uppercase tracking-wider text-[#494949]"
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
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isPending}
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              className="h-11 rounded-xl border-[#dbdbdb] bg-white px-3.5 pr-12 text-sm text-foreground shadow-2xs transition-all placeholder:text-[#a3a3a3] focus-visible:border-[#121814] focus-visible:ring-[#121814]/10 disabled:bg-[#f5f5f5] sm:h-12"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-[#737373] hover:text-foreground"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
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
          className="mt-1 h-11 w-full rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-xs transition-all hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(18,24,20,0.18)] active:scale-[0.99] focus-visible:ring-primary/40 sm:h-12"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-[#5c5c5c] sm:text-sm">
        New to Vey?{" "}
        <Link
          href={routes.register}
          className="rounded-sm font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202020]/35"
        >
          Register
        </Link>
      </p>
      <p className="mt-3.5 text-center text-[11px] leading-relaxed text-[#737373] sm:text-xs">
        By continuing, you agree to the{" "}
        <Link
          href={routes.terms}
          className="font-medium text-[#494949] hover:text-foreground hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and acknowledge that you have read the{" "}
        <Link
          href={routes.privacy}
          className="font-medium text-[#494949] hover:text-foreground hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
