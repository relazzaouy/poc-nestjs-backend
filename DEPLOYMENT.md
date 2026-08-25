# Deployment — backend

Full, cross-repository setup lives in the orchestrator repo:
**`poc-deployment/DEPLOYMENT.md`**. This file covers only what is specific to
this service.

## Render service

| Field | Value |
| --- | --- |
| Type | Web Service |
| Repository | `<owner>/poc-nestjs-backend` |
| Language / Runtime | **Docker** |
| Dockerfile Path | `./Dockerfile` |
| Branch | `main` |
| Health Check Path | `/api/health` |
| Auto-Deploy | **Off** — `poc-deployment` owns deployments |

## Environment variables to set in Render

| Key | Value | Required |
| --- | --- | --- |
| `CORS_ORIGIN` | `https://poc-nextjs-frontend.onrender.com` | yes, once the frontend URL exists |
| `PORT` | — | **no**, Render injects it |

Setting `PORT` yourself will fight Render's port detection. Leave it alone.

`CORS_ORIGIN` accepts a comma-separated list if you need more than one origin.
Leave it unset and every origin is allowed — fine locally, not what you want in
production.

## GitHub configuration for this repository

*Settings → Secrets and variables → Actions*

| Kind | Name | Value |
| --- | --- | --- |
| Secret | `DEPLOY_DISPATCH_TOKEN` | fine-grained PAT scoped to `poc-deployment`, Contents: write |
| Variable | `DEPLOY_ORCHESTRATOR_REPO` | `<owner>/poc-deployment` |

`GITHUB_TOKEN` cannot be used for the dispatch: it is scoped to this repository
only and returns `404` against another repo's `/dispatches` endpoint. The
fine-grained PAT above is the minimum-privilege replacement — one repository,
one permission.

## What happens on merge

```
merge to main -> backend-ci.yml validate -> repository_dispatch(deploy-all)
              -> poc-deployment/deploy.yml -> deploy backend -> deploy frontend
```

The deployed URLs appear in the **`poc-deployment`** run summary, not this one.
