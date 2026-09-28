import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { isAuthenticated } = await auth();

  redirect(isAuthenticated ? "/meetings" : "/login");
}
