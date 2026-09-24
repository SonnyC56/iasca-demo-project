# IASCA CRM

A general-purpose CRM for a small business, built with **Vue 3 + Vite + TypeScript**, **Tailwind v4** with our own component library, and **Convex** as the reactive backend/database.

- Roadmap and architecture: [`docs/PLAN.md`](docs/PLAN.md)
- Contributing / PR workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Quick start

Requirements: Node 24 (`.nvmrc`), pnpm via corepack.

```bash
corepack enable pnpm        # add --install-directory ~/.local/bin if /usr/local is not writable
pnpm install
pnpm dev                    # local Convex backend + Vite on http://localhost:5173
```

The first `pnpm dev` downloads a local Convex backend binary and writes `.env.local`. No Convex account is needed.

## Test on your phone

The dev server listens on the LAN, and Convex traffic is proxied through it (`/api`, `/http`), so a phone only needs port 5173.

```bash
pnpm dev:lan                # prints the LAN URL + a QR code, then starts everything
```

**WSL2 users:** WSL's NAT network hides port 5173 from other devices. Run this once per Windows boot in an elevated PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows\expose-dev.ps1
```

Need a secure context on the phone (clipboard, etc.)? Use `pnpm dev:https` (self-signed certificate).

## Docker backend (optional)

`infra/convex/docker-compose.yml` runs the self-hosted Convex backend, its dashboard (http://localhost:6791) and Mailpit (http://localhost:8025). On WSL, first enable Docker Desktop → Settings → Resources → WSL Integration for your distro. Setup steps are in the compose file header and in `.env.example` (Option B).

## Scripts

| Script            | What it does                                                       |
| ----------------- | ------------------------------------------------------------------ |
| `pnpm dev`        | Convex backend (watch + push) and Vite dev server                  |
| `pnpm dev:lan`    | Same, plus phone URL/QR code                                       |
| `pnpm dev:https`  | Same, over HTTPS                                                   |
| `pnpm test`       | Vitest (web components in jsdom, Convex functions via convex-test) |
| `pnpm lint`       | oxlint + ESLint                                                    |
| `pnpm type-check` | vue-tsc (app) + tsc (Convex)                                       |
| `pnpm format`     | Prettier                                                           |
| `pnpm build`      | Typecheck + production build                                       |

## Project layout

```
convex/            Backend: schema, queries/mutations, tests (*.test.ts)
src/lib/convex/    Vue ↔ Convex composables (useQuery, useMutation, …)
src/components/ui/ In-house component library (Tailwind + Reka UI)
src/styles/        Design tokens (tokens.css) and base styles
infra/convex/      Docker compose for self-hosted Convex, dashboard, Mailpit
scripts/           Dev helpers (LAN URL, Windows port proxy)
.github/           CI, CodeQL, dependency review, templates, Dependabot
```

## Deployment

- **Frontend:** Vercel (Git integration). `vercel.json` runs `npx convex deploy --cmd 'pnpm build-only'`.
- **Backend:** Convex Cloud. Production and per-PR preview deployments use `CONVEX_DEPLOY_KEY` set in Vercel.

Both are set up in milestone M8 (see the plan).
