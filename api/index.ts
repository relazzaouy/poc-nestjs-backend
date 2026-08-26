import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import express, { Request, Response } from 'express';

// Imported from the COMPILED output, not from src/. Vercel bundles this file
// with esbuild, which does not support emitDecoratorMetadata - so NestJS
// dependency injection would break if we imported the TypeScript sources.
// `npm run build` (tsc) emits that metadata first; see vercel.json.
import { AppModule } from '../dist/app.module';
import { configureApp } from '../dist/bootstrap';

const server = express();
let ready: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  configureApp(app);
  await app.init();
}

// The promise is cached at module scope so a warm invocation reuses the
// already-initialised Nest application instead of rebuilding it per request.
export default async function handler(req: Request, res: Response) {
  ready ??= bootstrap();
  await ready;
  server(req, res);
}
