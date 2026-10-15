import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { routes } from "@/config/routes";
import { LoginView } from "@/features/auth/components/login-view";
import { CompleteSignIn } from "@/features/auth/components/complete-sign-in";
import { getVeySession } from "@/lib/auth/vey-session";
export default async function AuthCompletePage() {
  if (await getVeySession()) redirect(routes.meetings);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(routes.login);
  return (
    <LoginView label="Complete sign in">
      <CompleteSignIn />
    </LoginView>
  );
}
