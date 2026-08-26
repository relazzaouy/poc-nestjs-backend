# Deployment — backend

Full, cross-repository setup lives in the orchestrator repo:
**`poc-deployment/DEPLOYMENT.md`**. This file covers only what is specific to
this service.

## Vercel project

| Field | Value |
| --- | --- |
| Import from | `<owner>/poc-nestjs-backend` |
| Framework Preset | **Other** |
| Root Directory | `./` |
| Build and Output Settings | leave default — `vercel.json` supplies `buildCommand` |
| Production branch | `main` |

No payment method is required. Vercel's Hobby plan takes no card and cannot be
billed — it pauses at the free-tier limits instead.

## Environment variables to set in Vercel

| Key | Value | Required |
| --- | --- | --- |
| `CORS_ORIGIN` | `https://poc-nextjs-frontend.vercel.app` | yes, once the frontend URL exists |
| `PORT` | — | **no** — the serverless handler does not listen on a port |

`CORS_ORIGIN` accepts a comma-separated list. Left unset it falls back to
`http://localhost:3000` only — never a wildcard, so a misconfigured deployment
fails closed rather than silently allowing every origin.

## How this runs on Vercel

`api/index.ts` bootstraps the existing `AppModule` behind an Express adapter and
caches the initialised app at module scope, so warm invocations reuse it.
`vercel.json` rewrites every path to that one function, and the app keeps its
`api` global prefix — so `/api/hello` and `/api/health` resolve exactly as they
do locally.

**NestJS is not replaced.** Same controllers, same DI, same tests.

### The esbuild detail that matters

Vercel bundles functions with esbuild, which does **not** support
`emitDecoratorMetadata`. Importing `src/` directly would silently break NestJS
dependency injection. So `vercel.json` runs `npm run build` first (`tsc`, which
does emit that metadata) and `api/index.ts` imports from the compiled `dist/`
output instead.

If you ever see NestJS failing to resolve a dependency on Vercel while it works
locally, this is the first thing to check.

### Why `declaration: true` is not optional

Vercel typechecks `api/index.ts`. Because that file imports from `dist/`, the
compiler needs `.d.ts` files there — without them the build fails with:

```
error TS7016: Could not find a declaration file for module '../dist/app.module'.
```

`tsconfig.json` therefore sets `"declaration": true` so `nest build` emits
declarations alongside the JavaScript. Three settings work together here and all
three are load-bearing:

| Setting | Why |
| --- | --- |
| `declaration: true` in `tsconfig.json` | emits the `.d.ts` files Vercel needs to typecheck the handler |
| `api` in `tsconfig.build.json`'s `exclude` | keeps `nest build` from compiling the handler into `dist/`, which would be circular |
| `api/**/*` in `tsconfig.json`'s `include` | makes a local `npm run typecheck` catch exactly what Vercel catches |

`npm run typecheck` must run **after** `npm run build`, since it needs `dist/` to
exist. CI does them in that order.

## Automatic deployments are disabled

`vercel.json` contains:

```json
{ "git": { "deploymentEnabled": { "main": false } } }
```

Pushes to `main` do not deploy. Only the Deploy Hook fired by `poc-deployment`
does, which keeps the orchestrator as the single deployment entry point.

## Docker

The `Dockerfile` is **not** what Vercel runs, but it is still built and smoke
tested by CI on every pull request. It exists so the backend stays portable: the
moment you want a long-running Node process on a container host, the image is
already proven.

```bash
docker build -t poc-nestjs-backend .
docker run --rm -p 3001:3001 -e PORT=3001 poc-nestjs-backend
```

## GitHub configuration for this repository

*Settings → Secrets and variables → Actions*

| Kind | Name | Value |
| --- | --- | --- |
| Secret | `DEPLOY_DISPATCH_TOKEN` | fine-grained PAT scoped to `poc-deployment`, Contents: write |
| Variable | `DEPLOY_ORCHESTRATOR_REPO` | `<owner>/poc-deployment` |

`GITHUB_TOKEN` cannot be used for the dispatch: it is scoped to this repository
only and returns `404` against another repo's `/dispatches` endpoint. The
fine-grained PAT above is the minimum-privilege replacement — one repository, one
permission.

## What happens on merge

```
merge to main -> backend-ci.yml validate -> repository_dispatch(deploy-all)
              -> poc-deployment/deploy.yml -> deploy backend -> deploy frontend
```

The deployed URLs appear in the **`poc-deployment`** run summary, not this one.
