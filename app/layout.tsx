import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import { Newsreader, Outfit } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { getAuth0Client } from "@/lib/auth0";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "5-1 Mentor",
  description:
    "Phone-first volleyball study app for learning 5-1 rotations, serve-receive looks, and overlap rules.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06140c",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const auth0 = getAuth0Client();
  let auth0User = undefined;
  if (auth0) {
    try {
      const session = await auth0.getSession();
      auth0User = session?.user;
    } catch {
      auth0User = undefined;
    }
  }

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Auth0Provider user={auth0User}>
          <AppShell user={user}>{children}</AppShell>
        </Auth0Provider>
      </body>
    </html>
  );
}
