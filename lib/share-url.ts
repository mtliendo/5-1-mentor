/**
 * Absolute origin for share links: APP_BASE_URL + `/share/{token}`.
 * AUTH0_BASE_URL is accepted as an alias. Does not hardcode the production host.
 */
export function getAppBaseUrl(request?: Request): string {
  const configured = process.env.APP_BASE_URL ?? process.env.AUTH0_BASE_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (request) {
    return new URL(request.url).origin;
  }
  throw new Error("APP_BASE_URL is not set");
}

/** FE route is `app/share/[token]`. */
export function buildShareUrl(token: string, request?: Request): string {
  return `${getAppBaseUrl(request)}/share/${token}`;
}
