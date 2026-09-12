"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useState } from "react";
import {
  revokeShare,
  shareCurrentLineup,
  toAbsoluteShareUrl,
} from "@/lib/shares";
import type { StudyPreferences } from "@/lib/types";

export function ShareLineup({
  roleNames,
  liberoEnabled,
}: StudyPreferences) {
  const { user, isLoading } = useUser();
  const signedIn = Boolean(user);
  const [busy, setBusy] = useState<"share" | "copy" | "revoke" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [share, setShare] = useState<{ token: string; url: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  if (isLoading || !signedIn) return null;

  async function onShare() {
    setBusy("share");
    setError(null);
    setCopied(false);
    const result = await shareCurrentLineup({ roleNames, liberoEnabled });
    setBusy(null);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setShare({
      token: result.value.token,
      url: toAbsoluteShareUrl(result.value.url, result.value.token),
    });
  }

  async function onCopy() {
    if (!share) return;
    setBusy("copy");
    try {
      await navigator.clipboard.writeText(share.url);
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Copy failed — select the link and copy it yourself.");
    }
    setBusy(null);
  }

  async function onRevoke() {
    if (!share) return;
    setBusy("revoke");
    setError(null);
    const result = await revokeShare(share.token);
    setBusy(null);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setShare(null);
    setCopied(false);
  }

  return (
    <div className="rounded-2xl border-2 border-accent/25 bg-white px-3 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
        Share lineup
      </p>
      <p className="mt-1 text-sm text-on-panel-soft">
        Send your names + libero as a link. Formations and quiz stay yours.
      </p>
      <button
        type="button"
        onClick={() => void onShare()}
        disabled={busy !== null}
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(255,59,0,0.35)] disabled:opacity-60"
      >
        {busy === "share" ? "Creating link…" : "Share lineup"}
      </button>

      {share ? (
        <div className="mt-3 space-y-2">
          <label
            htmlFor="share-lineup-url"
            className="block text-[11px] font-extrabold uppercase tracking-wide text-on-panel-soft"
          >
            Copyable link
          </label>
          <input
            id="share-lineup-url"
            readOnly
            value={share.url}
            onFocus={(event) => event.currentTarget.select()}
            className="min-h-11 w-full rounded-xl border-2 border-on-panel/15 bg-panel px-3 text-sm font-semibold text-on-panel"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void onCopy()}
              disabled={busy !== null}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-on-panel px-3 text-sm font-extrabold text-panel disabled:opacity-60"
            >
              {copied ? "Copied" : busy === "copy" ? "Copying…" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => void onRevoke()}
              disabled={busy !== null}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-on-panel/10 px-3 text-sm font-extrabold text-on-panel disabled:opacity-60"
            >
              {busy === "revoke" ? "Revoking…" : "Revoke"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-sm font-semibold text-accent" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
