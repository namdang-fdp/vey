import { LoginView } from "@/features/auth/components/login-view";
import { RegisterForm } from "@/features/auth/components/register-form";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { getVeySession } from "@/lib/auth/vey-session";

export default async function RegisterPage() {
  if (await getVeySession()) redirect(routes.meetings);
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(routes.authComplete);

  return (
    <LoginView label="Create account">
      <RegisterForm />
    </LoginView>
  );
}
