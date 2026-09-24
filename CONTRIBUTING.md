# Contributing

## Workflow

1. Branch from `master`: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `docs/<topic>`.
2. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat: add contacts list`). The `commit-msg` hook enforces this.
3. Push and open a PR (`gh pr create`). Fill in the template, including a mobile check for UI changes.
4. CI must be green: format, lint, typecheck, unit tests, build, Convex push, CodeQL, dependency review.
5. **Squash-merge** into `master`. Delete the branch afterwards.

Git hooks come from [lefthook](https://lefthook.dev) and are installed by `pnpm install`:

- pre-commit: Prettier, oxlint and ESLint on staged files
- commit-msg: commitlint

## Conventions

- **Backend:** every Convex function validates its args with `v.*` validators. From M2 onward, functions use the authenticated wrappers in `convex/lib/functions.ts` instead of raw `query`/`mutation`.
- **Frontend:** use the composables in `src/lib/convex` and the components in `src/components/ui`. Style with the design tokens (`bg-surface`, `text-ink`, `border-line`, `bg-brand`, …), not raw colors.
- **Tests:** backend logic gets a `convex/*.test.ts` using `convex-test`. UI components get a `__tests__/*.spec.ts`.
- **Money** is stored as integer cents. **Timestamps** are epoch milliseconds.
- **Mobile-first:** every screen must work at 375px wide.
