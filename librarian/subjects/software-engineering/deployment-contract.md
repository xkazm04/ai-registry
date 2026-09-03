---
subject: deployment-contract
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# deployment-contract

First touch: 2026-09-03, an `/intake` run over a doctrine corpus ([[2026-09-03-rusttraining]]).

## State

5 -> 6 techniques, +2 applications, +2 amendments.

**`cache-immutability-licensing`** (new) — marking a served asset immutable is
**licensed by content-addressed naming**, not chosen as a tuning level. Where the
same URL serves new bytes after a rebuild, an immutability directive is a
correctness bug: clients that never revalidate pin stale code indefinitely. Placed
here after verifying `client-fetch-cache` is entirely in-process (SWR, dedup, cache
keys — no HTTP directive doctrine), and that `packaging` owns artifact identity
for distribution while `release-pipeline` owns the publish door. What a *host tells
clients about the artifact it serves* is this subject's territory.

**Amendment to `platform-build-parity` — it enumerated too little.** Its "inputs
that diverge" list is build command, runtime version, install, build-time
environment, trigger: **every one a build-time input**. The same byte-identical
artifact served by two hosts whose request-resolution rules differ (extensionless
paths, directory index, trailing-slash redirect, not-found behaviour) yields links
valid in one and broken in the other — and the build-parity check *passes*, because
the artifact really is identical. The test must request the shape that fails.

**Amendment to `deployment-config-as-code`**: config-language override semantics
that *replace* rather than *merge* a parent's directive set make security headers
silently droppable, so every block repeats what it needs. An instance of
`silent-state-is-ungoverned` about a committed config file.

## The application is a refutation, and it is the run's best structural fact

`rust--platform-build-parity`: **there is a third host.** The serving config
resolves extensionless paths and the CI smoke test asserts one returns 200 — but
the repository's own local preview server (`xtask/src/main.rs:328-375`) implements
directory-index and trailing-slash redirect and has **no `.html` fallback**, so the
very links the other two hosts were aligned on 404 in local preview. Parity was
written pairwise instead of across the host set. Nobody designed that; it fell out
of the structure.
