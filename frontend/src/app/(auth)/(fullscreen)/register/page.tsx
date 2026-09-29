import { LoginView } from "@/features/auth/components/login-view";
import { RegisterForm } from "@/features/auth/components/register-form";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(routes.meetings);

  return (
    <LoginView label="Create account">
      <RegisterForm />
    </LoginView>
  );
}
