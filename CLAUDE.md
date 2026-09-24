# IASCA CRM — agent notes

Vue 3 + Vite + TypeScript SPA with a Convex backend. Plan and milestones: `docs/PLAN.md`. PR workflow: `CONTRIBUTING.md`.

## Commands

- `pnpm dev`: local Convex backend (anonymous, no account) + Vite on :5173. The Convex URL is written to `.env.local`.
- `pnpm test` / `pnpm lint` / `pnpm type-check` / `pnpm format:check` / `pnpm build-only`: all must pass before a PR.
- pnpm is installed at `~/.local/bin/pnpm` via corepack (`/usr/local` is not writable).

## Architecture notes

- In dev, the browser connects to Convex through the Vite proxy (`/api` websocket + HTTP → :3210, `/http` → :3211), using `window.location.origin` (see `src/lib/convex/client.ts`). Never create app routes under `/api` or `/http`.
- Vue ↔ Convex: use our own composables in `src/lib/convex` (`useQuery`, `useMutation`, `useConnectionState`). Don't add community convex-vue packages.
- UI: Tailwind v4 tokens in `src/styles/tokens.css`. Build shared components in `src/components/ui` on Reka UI primitives. Icons come from `@lucide/vue`; the old `lucide-vue-next` package is deprecated.
- Auth (M2) will use Better Auth + `@convex-dev/better-auth`. **Pin `better-auth` to 1.6.x**, because 1.7 breaks the adapter at bundle time.
- Vitest has two projects: `web` (jsdom, `src/**`) and `convex` (edge-runtime + convex-test, `convex/**/*.test.ts`).
- The dev machine is WSL2 in NAT mode: phone testing needs `scripts/windows/expose-dev.ps1`. Docker Desktop's WSL integration may be off.
