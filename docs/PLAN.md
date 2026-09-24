# IASCA CRM — Foundation & v1 Plan

## Context

The repo (`github.com/SonnyC56/iasca-demo-project`, branch `master`) holds only a README and .gitignore. The goal is a general-purpose CRM for a small business: a demo, but built to production standards.

- Everything runs **locally first** with no paid integrations. External accounts come last.
- The dev server must be reachable from a **phone on the LAN**.
- **CI/CD and the PR workflow start in the first PR.**

## Stack decisions

| Area            | Choice                                                                                                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language        | TypeScript (strict) everywhere, **pnpm** via corepack, one package (`src/` frontend + `convex/` backend)                                                                                                                                                                      |
| Frontend        | **Vue 3.5 + Vite**, Vue Router 4, VueUse, Zod for form validation                                                                                                                                                                                                             |
| Styling         | **Tailwind v4** (`@tailwindcss/vite`, tokens in `@theme`) plus **our own component library** in `src/components/ui/` built on **Reka UI** headless primitives; `lucide-vue-next` icons                                                                                        |
| CRM UI libs     | TanStack Table (Vue) for lists, `vue-draggable-plus` for kanban, `vue-chartjs` for dashboards                                                                                                                                                                                 |
| Backend/DB      | **Convex**. Local: self-hosted Docker backend (no account). Production: **Convex Cloud free tier** with per-PR **preview deployments** (available on Free, beta, 5-day expiry)                                                                                                |
| Convex ↔ Vue    | Our own thin layer over the official `ConvexClient` (`convex/browser`): plugin plus `useQuery`, `usePaginatedQuery`, `useMutation`, `useAction`, `useConvexAuth`. Community `convex-vue` is stale (last commit July 2025)                                                     |
| Auth            | **Better Auth** + `@convex-dev/better-auth@0.12.5`. `better-auth` pinned to exactly one **1.6.x** version, because 1.7 breaks the adapter at bundle time. Email+password with the SPA `crossDomain` plugin; we write our own ~40-line Vue auth bridge (`convex.setAuth(...)`) |
| Email (phase 1) | `emailOutbox` table with a pluggable transport: `log` → **Mailpit** (docker compose) → Resend later                                                                                                                                                                           |
| Hosting         | **Vercel** (Vite SPA) via Git integration. DigitalOcean is not needed for v1; keep it for future workers or a self-host fallback                                                                                                                                              |
| CI/CD           | GitHub Actions (CI gate). Vercel Git integration deploys: previews per PR, production on `master`                                                                                                                                                                             |

## Architecture

```
Phone / Browser ──► Vite dev server :5173 (LAN, optional HTTPS)
                     ├─ /            → Vue SPA
                     ├─ /api  (ws)   → Convex backend :3210  (Docker)
                     └─ /http        → Convex HTTP actions :3211 (Better Auth routes)
Production: Vercel (SPA) ──► Convex Cloud prod   |  PR preview ──► Convex preview deployment
```

**Phone testing uses a single origin:**

- In dev, the client uses `window.location.origin` as the Convex URL, and Vite proxies Convex traffic (websocket plus HTTP).
- So only port 5173 has to be exposed. HTTPS via `@vitejs/plugin-basic-ssl` works without mixed-content problems (a secure context is needed for clipboard copy of invite links).
- The Docker backend sets `CONVEX_CLOUD_ORIGIN`/`CONVEX_SITE_ORIGIN` to the LAN origin so storage and auth URLs work on the phone.
- **WSL2 is in NAT mode** (Windows 11 23H2). `scripts/windows/expose-dev.ps1` (admin PowerShell) adds a `netsh portproxy` rule for 5173 → current WSL IP plus a Private-profile firewall rule. Re-run it after a reboot, because the WSL IP changes.
- Mirrored networking is avoided because of known conflicts with Docker Desktop.
- **Fallback if the proxy spike fails:** point `VITE_CONVEX_URL` at `http://<LAN-IP>:3210`, since the Docker-published ports are reachable from the LAN.

## Repo layout (key paths)

```
convex/                 schema.ts, lib/functions.ts (authed wrappers), lib/permissions.ts,
                        auth.ts, http.ts, contacts.ts, companies.ts, deals.ts, pipelines.ts,
                        activities.ts, tasks.ts, search.ts, imports.ts, dashboard.ts,
                        audit.ts, email/outbox.ts, setup.ts (bootstrapOwner, seed)
src/lib/convex/         plugin.ts, useQuery.ts, usePaginatedQuery.ts, useMutation.ts, auth.ts
src/components/ui/      Button, Input, Select, Combobox, Dialog, Drawer, DropdownMenu, Table,
                        Badge, Card, Tabs, Toast, EmptyState, Skeleton, Avatar
src/features/<area>/    pages + feature components (contacts, companies, deals, tasks, …)
src/styles/             tokens.css (@theme), base.css
infra/convex/           docker-compose.yml (backend, dashboard, mailpit), .env.example
scripts/                dev-lan.ts (prints LAN URL + QR), windows/expose-dev.ps1
.github/                workflows/ci.yml, codeql.yml; PR + issue templates; CODEOWNERS; dependabot.yml
docs/PLAN.md            copy of this plan;  CLAUDE.md + CONTRIBUTING.md
```

## Data model (single-tenant: one business per deployment)

- **Workspace**
  - `members` (authUserId, name, email, role: owner|admin|member|viewer, status)
  - `invitations` (email, role, tokenHash, expiresAt, invitedBy, acceptedAt)
- **Records**
  - `companies` (name, domain, industry, size, phone, address, ownerId, tagIds, archivedAt)
  - `contacts` (first/last name, email, phone, title, companyId, ownerId, lifecycleStage, source, tagIds, archivedAt)
  - `pipelines` and `stages` (pipelineId, name, order, probability, kind: open|won|lost)
  - `deals` (title, amountCents, currency, pipelineId, stageId, position, companyId, primaryContactId, ownerId, expectedCloseDate, status, closedAt)
- **Activity**
  - `activities` (type: note|call|meeting|email_log, body, occurredAt, authorId, contactId?, companyId?, dealId?)
  - `tasks` (title, dueAt, status, assigneeId, related ids, completedAt)
- **Support**
  - `tags`
  - `auditLog` (actorId, action, entityType, entityId, diff, at)
  - `emailOutbox`
  - `importJobs`
- **Indexes**
  - by foreign key, owner, and `stageId+position`
  - Convex **search indexes** on contacts, companies and deals, used for global search
  - Money is stored as integer cents

## Auth & RBAC

- **Invite-only sign-up:**
  - The first owner is created with `npx convex run setup:bootstrapOwner`.
  - Admins generate one-time invite links (256-bit token, stored hashed, 7-day expiry) shown in the UI with copy + QR. A Better Auth before-hook enforces the token.
- **Every function goes through wrappers** in `convex/lib/functions.ts` (convex-helpers `customQuery`/`customMutation`):
  - `authedQuery`, `authedMutation({ minRole })`
  - An ESLint `no-restricted-imports` rule bans raw `query`/`mutation`.
  - Mutations write to `auditLog`.
- **Security:**
  - Better Auth rate limiting plus `@convex-dev/rate-limiter` keyed on email
  - 7-day sliding sessions
  - Strict CSP headers in `vercel.json`, because the token lives in localStorage
  - Rich-text notes are sanitized
  - Only `ConvexError` messages reach the client

## Testing

- **Vitest:**
  - `convex-test` for backend functions, including a role matrix (each role × each function using `withIdentity`)
  - `@vue/test-utils` for components and composables
- **Playwright e2e:** desktop Chromium plus mobile emulation (Pixel, iPhone/WebKit), run against the Docker Convex backend in CI.

## CI/CD & PR workflow

- **`ci.yml`** (on PRs + pushes to `master`, cancels superseded runs via concurrency):
  - install (pnpm cache) → `eslint` → `prettier --check` → `vue-tsc -b` + convex typecheck → `vitest run` → `vite build`
  - Separate **e2e job:** starts the Convex backend as a Docker service, runs `npx convex deploy` against it (this catches bundling failures such as better-auth 1.7), then runs Playwright.
- **`codeql.yml`** plus `actions/dependency-review-action` on PRs.
- **CD via Vercel Git integration:**
  - Build command: `npx convex deploy --cmd 'pnpm build'`
  - `CONVEX_DEPLOY_KEY` is the prod key (Production scope) and the preview key (Preview scope).
  - Previews run `--preview-run setup:seed`.
  - Enable Vercel Deployment Checks so production waits for CI.
- **`backup.yml`** (later): nightly `npx convex export --prod` (free tier has no automatic backups).
- **PR hygiene:**
  - PR template (summary / test plan / screenshots, including a mobile screenshot)
  - Bug/feature issue templates, `CODEOWNERS` (@SonnyC56)
  - Conventional commits (commitlint + lefthook with lint-staged)
  - Branches named `feat/…` / `fix/…` / `chore/…`, squash merges
  - Dependabot (npm grouped weekly + actions; **ignores `better-auth` ≥1.7**)
  - No branch protection yet

## Milestones (each one PR, merged via the PR workflow)

- **M0 — Foundation (this session):**
  - Scaffold Vite + Vue + TS with pnpm; Tailwind v4 with tokens; ESLint/Prettier/Vitest; lefthook/commitlint
  - Convex installed, with `infra/convex/docker-compose.yml` (backend, dashboard, Mailpit) and an anonymous `npx convex dev` fallback
  - The `src/lib/convex` composables
  - A `system:health` query rendered on the home page, plus a convex-test unit test for it
  - Vite LAN proxy + `pnpm dev:lan` (prints LAN URL + QR) + `expose-dev.ps1`
  - `ci.yml`, CodeQL, templates, CODEOWNERS, dependabot, `CLAUDE.md`, `docs/PLAN.md`
  - Opened as PR `chore/foundation`
- **M1 — Design system & app shell:** UI component library, responsive layout (sidebar on desktop / bottom nav + drawers on mobile), router, dark mode, toasts, empty/loading states.
- **M2 — Auth & team:** Better Auth + Vue bridge, bootstrap owner, sign-in/out, invites, roles, authed wrappers + role-matrix tests, email outbox + Mailpit, Team settings page.
- **M3 — Companies & Contacts:** CRUD, table view (cards on mobile), detail pages, tags, owner assignment, archive.
- **M4 — Deals & Pipeline:** pipeline/stage settings, kanban drag-and-drop (touch-friendly), list view, won/lost, amounts.
- **M5 — Activities, Tasks, Timeline:** log notes/calls/meetings, tasks with due dates + "My tasks" / overdue views, per-record timeline merged with `auditLog`.
- **M6 — Dashboard & Search:** pipeline value by stage, win rate, activity counts, tasks due; global search + ⌘K command palette.
- **M7 — CSV import/export:** column mapping, dedupe by email/domain, import job progress, export per list.
- **M8 — Go live:**
  - Convex Cloud project and deploy keys, Vercel project import + env vars, per-PR preview backends
  - Playwright e2e required in CI, CSP headers, backup workflow, production bootstrap runbook
- **Deferred (paid/external):** Resend email, Google/Microsoft login, email/calendar sync, file attachments on S3/Spaces, AI features, billing.

## Manual steps needed from the user

1. **Before M0's Docker part:** Docker Desktop → Settings → Resources → WSL Integration → enable this Ubuntu distro. Until then, the anonymous `npx convex dev` backend is used.
2. **For phone testing:** run `scripts/windows/expose-dev.ps1` once in an admin PowerShell (again after reboots).
3. **M8 only:** create a Convex account/project and deploy keys; import the repo into Vercel.

## Verification (M0)

- `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass locally.
- `docker compose -f infra/convex/docker-compose.yml up -d`, then `pnpm dev`: the home page shows a live `system:health` result (reactive; change the data in the Convex dashboard at :6791 and the page updates).
- `pnpm dev:lan` plus `expose-dev.ps1`: open the printed URL on the phone and see the same live result over the Vite proxy.
- Push `chore/foundation`, open the PR with `gh pr create`, and confirm the `ci.yml` checks run green on GitHub; then squash-merge.

## Reality check

M0 is the "10 minutes" target. It's a sizeable scaffold, so expect a bit more than that. The full v1 is eight PR-sized milestones after it.
