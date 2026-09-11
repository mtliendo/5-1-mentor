"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LineupPreview } from "./LineupPreview";
import { fetchShare, importShare } from "@/lib/shares";
import { persistPreferences } from "@/lib/storage";
import type { SessionUser, SharedLineup } from "@/lib/types";

export function ShareImport({
  token,
  initialUser,
}: {
  token: string;
  initialUser: SessionUser;
}) {
  const { user, isLoading } = useUser();
  const signedIn = Boolean(user) || initialUser.source === "auth0";
  const returnTo = encodeURIComponent(`/share/${token}`);
  const [share, setShare] = useState<SharedLineup | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchShare(token).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setShare(null);
        setLoadError(result.error.message);
      } else {
        setShare(result.value);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onImport() {
    if (!share) return;
    setImporting(true);
    setImportError(null);
    const result = await importShare(token);
    if (!result.ok) {
      setImporting(false);
      setImportError(result.error.message);
      return;
    }
    await persistPreferences({
      roleNames: share.roleNames,
      liberoEnabled: share.liberoEnabled,
    });
    setImported(true);
    setImporting(false);
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[32px] bg-court-deep px-5 py-7 text-line shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-line">
          Lineup share
        </p>
        <h2 className="font-playbook mt-2 text-5xl leading-[0.9] text-white">
          Names + libero.
          <span className="italic text-line"> That’s the handoff.</span>
        </h2>
        <p className="mt-4 max-w-lg text-base font-medium leading-relaxed text-line/90">
          Chips still read{" "}
          <span className="font-extrabold text-white">Name · Role</span>. This
          link does not include formations, guided progress, or quiz scores.
        </p>
      </section>

      <section className="rounded-[28px] bg-panel px-4 py-4 text-on-panel shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
        {loading ? (
          <p className="text-sm font-semibold text-on-panel-soft">
            Loading this lineup…
          </p>
        ) : loadError || !share ? (
          <div className="space-y-3">
            <h3 className="font-playbook text-3xl">Link isn’t available</h3>
            <p className="text-sm leading-relaxed text-on-panel-soft">
              {loadError ?? "This lineup share wasn’t found."}
            </p>
            <Link
              href="/explore"
              className="inline-flex min-h-12 items-center rounded-full bg-accent px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(255,59,0,0.35)]"
            >
              Open Explore
            </Link>
          </div>
        ) : imported ? (
          <div className="space-y-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent">
              Imported
            </p>
            <h3 className="font-playbook text-3xl">These names are yours now.</h3>
            <p className="text-sm leading-relaxed text-on-panel-soft">
              Libero is {share.liberoEnabled ? "on" : "off"} on your account.
              Open Explore to walk the 5-1 with this lineup.
            </p>
            <LineupPreview
              roleNames={share.roleNames}
              liberoEnabled={share.liberoEnabled}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/explore"
                className="inline-flex min-h-12 items-center rounded-full bg-accent px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(255,59,0,0.35)]"
              >
                Open Explore
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center rounded-full bg-on-panel px-5 text-sm font-extrabold uppercase tracking-wide text-panel"
              >
                Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent">
              Preview
            </p>
            <h3 className="font-playbook text-3xl">Import this gym’s names</h3>
            <p className="text-sm leading-relaxed text-on-panel-soft">
              {share.expiresAt
                ? `Link expires ${new Date(share.expiresAt).toLocaleDateString()}. `
                : share.createdAt
                  ? `Shared ${new Date(share.createdAt).toLocaleDateString()}. `
                  : null}
              Import writes names + libero onto your signed-in account.
            </p>
            <LineupPreview
              roleNames={share.roleNames}
              liberoEnabled={share.liberoEnabled}
            />

            {isLoading && !signedIn ? (
              <p className="text-sm font-semibold text-on-panel-soft">
                Checking sign-in…
              </p>
            ) : signedIn ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => void onImport()}
                  disabled={importing}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(255,59,0,0.35)] disabled:opacity-60"
                >
                  {importing ? "Importing…" : "Import to my account"}
                </button>
                {importError ? (
                  <p className="text-sm font-semibold text-accent" role="status">
                    {importError}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-on-panel">
                  Sign in, then you’ll return here to import.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/auth/login?connection=Username-Password-Authentication&returnTo=${returnTo}`}
                    className="inline-flex min-h-12 items-center rounded-full bg-accent px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(255,59,0,0.35)]"
                  >
                    Sign in with email
                  </a>
                  <a
                    href={`/auth/login?connection=google-oauth2&returnTo=${returnTo}`}
                    className="inline-flex min-h-12 items-center rounded-full bg-on-panel px-5 text-sm font-extrabold uppercase tracking-wide text-panel"
                  >
                    Sign in with Google
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
