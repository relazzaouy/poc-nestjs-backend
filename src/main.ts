import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Load .env if one exists. Node has this built in (>= 20.12), so no dotenv
// dependency is needed. In Docker/Render there is no .env file and the real
// environment variables are already set - the throw is expected there.
try {
  process.loadEnvFile();
} catch {
  // no .env file present
}

/**
 * CORS_ORIGIN is a comma-separated list of allowed origins, e.g.
 *   CORS_ORIGIN=https://poc-nextjs-frontend.onrender.com
 *   CORS_ORIGIN=http://localhost:3000,https://poc-nextjs-frontend.onrender.com
 * When unset, all origins are allowed (convenient for local dev; see DEPLOYMENT.md).
 */
function corsOrigin(): string[] | boolean {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return true;
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: corsOrigin(), methods: ['GET'] });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`[backend] listening on port ${port}`);
  console.log(`[backend] CORS_ORIGIN=${process.env.CORS_ORIGIN ?? '(unset -> allow all)'}`);
}

void bootstrap();
