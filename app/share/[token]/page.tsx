import type { Metadata } from "next";
import { ShareImport } from "@/components/ShareImport";
import { getCurrentUser } from "@/lib/auth";

type SharePageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shared lineup · 5-1 Mentor",
    description:
      "Preview custom role names and libero, then import them into your signed-in account.",
    robots: "noindex",
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const user = await getCurrentUser();

  return <ShareImport key={token} token={token} initialUser={user} />;
}
