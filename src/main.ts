import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

// Load .env if one exists. Node has this built in (>= 20.12), so no dotenv
// dependency is needed. In Docker or on Vercel there is no .env file and the real
// environment variables are already set - the throw is expected there.
try {
  process.loadEnvFile();
} catch {
  // no .env file present
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`[backend] listening on port ${port}`);
  console.log(`[backend] CORS_ORIGIN=${process.env.CORS_ORIGIN ?? '(unset -> http://localhost:3000)'}`);
}

void bootstrap();
