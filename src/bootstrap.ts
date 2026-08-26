import { INestApplication } from '@nestjs/common';

/**
 * Allowed browser origins.
 *
 * CORS_ORIGIN is a comma-separated list, e.g.
 *   CORS_ORIGIN=https://poc-nextjs-frontend.vercel.app
 *   CORS_ORIGIN=http://localhost:3000,https://poc-nextjs-frontend.vercel.app
 *
 * When unset we fall back to the local frontend only - never a wildcard, so a
 * misconfigured deployment fails closed instead of silently allowing everyone.
 */
export function corsOrigin(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return ['http://localhost:3000'];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Shared setup for every way this app is started: the long-running server
 * (src/main.ts), the Vercel serverless handler (api/index.ts) and the e2e
 * tests. Keeping it in one place stops the three from drifting apart.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableCors({ origin: corsOrigin(), methods: ['GET'] });
}
