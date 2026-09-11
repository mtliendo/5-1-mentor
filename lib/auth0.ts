import { Auth0Client } from "@auth0/nextjs-auth0/server";

export type Auth0RuntimeConfig = {
  secret: string;
  clientId: string;
  clientSecret: string;
  domain: string;
  appBaseUrl?: string;
};

function stripIssuer(value: string): string {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * Accepts current Auth0 Next.js SDK names (AUTH0_DOMAIN, APP_BASE_URL)
 * and the v3 aliases listed in this repo (AUTH0_ISSUER_BASE_URL, AUTH0_BASE_URL).
 */
export function getAuth0RuntimeConfig(): Auth0RuntimeConfig | null {
  const secret = process.env.AUTH0_SECRET;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  const issuer = process.env.AUTH0_DOMAIN ?? process.env.AUTH0_ISSUER_BASE_URL;
  const appBaseUrl = process.env.APP_BASE_URL ?? process.env.AUTH0_BASE_URL;

  if (!secret || !clientId || !clientSecret || !issuer) {
    return null;
  }

  return {
    secret,
    clientId,
    clientSecret,
    domain: stripIssuer(issuer),
    appBaseUrl: appBaseUrl || undefined,
  };
}

export function isAuth0Configured(): boolean {
  return getAuth0RuntimeConfig() !== null;
}

let auth0Client: Auth0Client | null = null;

export function getAuth0Client(): Auth0Client | null {
  const config = getAuth0RuntimeConfig();
  if (!config) {
    return null;
  }
  if (!auth0Client) {
    auth0Client = new Auth0Client({
      secret: config.secret,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      domain: config.domain,
      appBaseUrl: config.appBaseUrl,
    });
  }
  return auth0Client;
}
