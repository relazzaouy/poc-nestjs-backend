# poc-nestjs-backend

Minimal NestJS + TypeScript REST API for the multi-repo CI/CD proof of concept.

This repository is **independent**. It has no reference to the frontend
repository and runs on its own.

## API

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/api/hello` | `{ "message": "Hello from NestJS backend!", "timestamp": "2026-08-24T..." }` |
| `GET` | `/api/health` | `{ "status": "ok" }` |

## Local development

```bash
npm install
cp .env.example .env
npm run start:dev
```

`.env.example` sets `PORT=3001`, leaving 3000 free for the Next.js frontend.
The app loads `.env` via Node's built-in `process.loadEnvFile()` — no `dotenv`
dependency, and it works the same in PowerShell, cmd and bash.

Without a `.env` the port falls back to 3000. To override for one run:

```bash
PORT=4000 npm run start:dev          # bash / Git Bash
```
```powershell
$env:PORT=4000; npm run start:dev    # PowerShell
```

Check it:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/hello
```

## Environment variables

| Variable | Local | Render | Notes |
| --- | --- | --- | --- |
| `PORT` | `3001` | injected by Render | Never hardcode it. Defaults to 3000. |
| `CORS_ORIGIN` | `http://localhost:3000` | your deployed frontend URL | Comma-separated. Unset ⇒ all origins allowed. |

See `.env.example`. `.env` is gitignored.

## Scripts

| Command | Does |
| --- | --- |
| `npm run start:dev` | watch-mode dev server |
| `npm run build` | compile to `dist/` |
| `npm start` | run the compiled build |
| `npm test` | e2e tests against both endpoints |
| `npm run lint` | ESLint |

## Docker

```bash
docker build -t poc-nestjs-backend .
docker run --rm -p 3001:3001 -e PORT=3001 poc-nestjs-backend
```

Multi-stage: build with dev dependencies, then ship only `dist/` and pruned
production `node_modules` on `node:22-alpine`, running as the non-root `node`
user.

## CI/CD

`.github/workflows/backend-ci.yml`

- **Pull request → `main`** — install, lint, test, build, `docker build`, and a
  container smoke test. Nothing deploys.
- **Push to `main` (merge)** — the same validation, then a `repository_dispatch`
  to `poc-deployment`, which deploys **both** applications.

Deployment configuration lives in [DEPLOYMENT.md](DEPLOYMENT.md).
