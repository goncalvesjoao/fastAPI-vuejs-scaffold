# fastAPI + Vue 3 + Clerk + Turso

## Tech Stack

### Backend

- **Runtime:** Python 3.11+
- **Package management:** pip
- **API framework:** FastAPI
- **ASGI server:** Uvicorn
- **Persistence:** SQLModel on libSQL (local file in dev, Turso cloud in prod)
- **Authentication:** Clerk JWT/JWKS verification
- **Configuration:** pydantic-settings
- **Quality:** Ruff, mypy, pytest

### Frontend

- **Runtime:** Node.js 22.18+ or 24.12+
- **Build tool:** Vite
- **Framework:** Vue 3
- **Authentication UI/session:** Clerk Vue SDK
- **Quality:** ESLint, Oxlint, Prettier, vue-tsc, Vitest, Playwright

## Prerequisites

- **Node.js** 22.18+ or 24.12+ (includes `npm`)
- **Python** 3.11+

## Setup

Install backend and frontend dependencies:

```bash
npm run setup
```

This runs `npm install`, creates `backend/.venv`, installs the backend Python
package and dev tools with `pip`, and then installs frontend dependencies.

Copy and configure the environment file:

```bash
cp .env.example .env
```

## Development

Run both projects in one terminal:

```bash
npm run dev
```

Or individually in separate terminals:

```bash
npm run backend:dev
npm run frontend:dev
```

Default local URLs (configurable via `.env`):

- Backend API: `http://localhost:8000`
- Frontend dev server: `http://localhost:5173`

During local development, the Vite app proxies `/api` requests to the backend.

## Common Commands

Run both backend and frontend checks:

```bash
npm run check
```

Or individually:

```bash
npm run backend:check
npm run frontend:check
```

Build the frontend static bundle into `backend/spa/`:

```bash
npm run build
```

Run the production-style backend process locally:

```bash
npm run start
```

## Testing

Run both backend and frontend tests:

```bash
npm run test
```

Or individually:

```bash
npm run backend:test
npm run frontend:test
```

### End-to-End Tests with Playwright

```sh
# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
# Runs the tests with the Playwright UI
npm run test:e2e -- --ui
```

## Continuous Integration

- For each Pull Request, GitHub Actions runs the `ci` script to check the backend and frontend code quality and run tests. The CI workflow also builds the frontend bundle to ensure it compiles correctly.

- Pull Requests should not be merged until the CI workflow passes.

## Continuous Deployment

Render.com is configured to automatically deploy the `main` branch, uppon new commits. The deployment process runs the `setup` and `build` scripts, then starts the backend service with the `start` script.

### Provisioning

1. Create a project on Render.com.
2. Create a New Web Service, selecting the GitHub repository
3. Then set the settings as

- Language: `Node`
- Branch: `main`
- Region: `Singapore` (or closest to Tokyo)
- Root Direction: empty
- Build Command: `npm run setup && npm run build`
- Start Command: `npm run start`
- Instance Type: `Free` (or `Starter` if you need more resources)
- Environment Variables: copy the variables from `.env`, except `CLERK_AUTHORIZED_PARTIES` which needs to be the same as Render.com project URL (e.g. `https://<your-project-name>.onrender.com`)
