---
layer: application
type: application
subject: deployment-contract
technique: platform-build-parity
stack: node
status: forged
verified_on: 2026-08-27
---

# Vercel as the second build system for a Next.js repository

Vercel's Git integration builds every push with its own builder, which makes it exactly the
second delivery system the technique describes. This application records how the parity inputs
land on a Next.js + npm project deployed there, from a 2026-08 audit of a four-repository
fleet (two Vercel-deployed, both with divergences the technique predicts).

## The build command: point, don't restate — and don't hide a migration in it

`vercel.json` accepts `buildCommand`. One audited repository declares:

```json
{ "buildCommand": "npm run db:deploy && npm run build" }
```

`db:deploy` is `prisma migrate deploy` — a database migration folded into the platform's
build. Its CI workflow runs only `npm run build`. The consequence is the technique's
gate-sees-target violation in the flesh: **CI has never once executed the command that builds
production**, and a migration that fails on Vercel fails after the gate said green. The
redeeming property, documented in that repo's own runbook: a failed Vercel build leaves the
previous deployment live, so the blast radius is a failed deploy, not an outage. The parity
fix is either running the full `db:deploy && build` chain in CI against a disposable database,
or moving the migration out of `buildCommand` — not leaving the two commands different.

## The runtime version: one pin, four opinions

The audited fleet showed the full pathology on one input. A single repository carried:
`engines.node: ">=22.5"` in `package.json`, `.nvmrc` containing `24`, CI pinned to `24.14.0`
exactly (its unit tests byte-pin `Intl` goldens to that Node's ICU), and Vercel's project
setting — a fourth authority — left at the platform default, which Vercel moves on its own
schedule. Vercel reads `engines.node` to *select* a major version, so the honest single
authority for a Vercel project is a tight `engines` range (e.g. `"node": "24.x"`), with
`.nvmrc` and CI derived from it and the dashboard left untouched. A range as loose as
`>=22.5` delegates the production runtime choice to the platform.

## The install: flags travel, lockfiles betray cross-platform

Vercel runs `npm install` honoring the repository's committed `.npmrc` — one audited repo
relies on `legacy-peer-deps=true` there, which therefore holds on Vercel without any dashboard
override. The sharper lesson came from a Windows-maintained repository: `npm install` on
Windows pruned Linux-only optional entries (`@emnapi/core`, `@emnapi/runtime`, hoisted by
wasm fallbacks of `sharp` and Tailwind's oxide binary) from `package-lock.json`, so the lock
that installed cleanly for the author failed `npm ci` on every Linux builder — CI and Vercel
alike. The fleet's standing rule, recorded in that repo's workflow header: re-add the hoisted
entries when a Linux builder reports `Missing: @emnapi/... from lock file`; never regenerate
the lockfile from Windows.

## The prebuilt escape, concretely

The CLI path that collapses Vercel back to pure hosting:

```sh
vercel pull --environment=production   # fetch project settings + env into .vercel/
vercel build --prod                    # next build locally, into .vercel/output
vercel deploy --prebuilt --prod        # upload the artifact; Vercel builds nothing
```

Non-interactive use (a pipeline, an agent) authenticates with `VERCEL_TOKEN` and pins identity
with `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID` — the two identifiers from `.vercel/project.json`,
which are safe to record in the deployment manifest (the token is the secret; the identifiers
are addresses). Both audited Vercel repositories had `.vercel/` absent and gitignored, meaning
neither checkout could run a CLI deploy without an interactive `vercel link` first — the
re-linking identifiers belong in each repo's deployment doc precisely so that this is a
paste, not an investigation.

## The build-time environment

Vercel injects the project's environment variables into its builder, so a variable set for
Production but not Preview (or vice versa) is a per-environment build input — the audited
fleet's failures included preview builds failing on variables that existed only in the
production scope. The parity rule lands as: the deployment doc's variable inventory carries a
per-environment column, and a variable needed at build time is set in *every* environment
whose builds must succeed, or the build is written to degrade without it (one audited repo
proves the degradation by running its CI build with an empty environment on purpose).
