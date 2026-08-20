---
layer: application
type: application
subject: readiness-passports
technique: declined-by-choice
stack: node
status: forged
---

# The read-time overlay that turns a fingerprint into decision memory

Realized in the Ascent repo as `src/lib/analyze/passport-overlay.ts` (177
lines), with the doctrine stated at `APP_READINESS_PASSPORT.md` §2d and the
portfolio consequences in `src/features/standing/passports/passportBlockerAgg.ts`.

## Storage: beside the scan, never inside it

The module header (`passport-overlay.ts:11-14`) names re-scan survival as the
load-bearing property and gets it structurally: declines are stored per repo in
`Repository.passportOverridesJson`, keyed by field path, **never inside the
scan-derived `passportJson`**. A new scan rewrites `passportJson` only, so the
overlay re-applies the same declines to the freshly generated passport. "A
re-scan can never silently clear an owner's decision."

`applyPassportOverrides()` (`:129-142`) is pure — clones, never mutates, no IO,
no clock — and `applyDeclines()` (`:99-124`) iterates
`Object.keys(declined).sort()` so the projection is deterministic. The
technique's requirement that the overlay leave the computed assessment
reproducible is met exactly.

Two owner inputs share the module and are worth distinguishing: the P4
non-observable facts (`criticality`, `lifecycle`, `rollback`) are owner-supplied
*measurements* the scan cannot take, and one of them (`rollback`) legitimately
re-derives the production score via `deriveProductionScore`
(`:140` region). Declines are the opposite: they never touch a score.

## Re-render, never hide

`applyDeclines()` retires the matching blocker line from
`automationReadiness.blockers` or `productionReadiness.blockers` and re-emits
it under a top-level `declined[]` as
`{ path, label, reason?, blocker? }` — with the **original blocker text
preserved** in `blocker` for audit (`:110-122`). The technique's
re-render-don't-hide rule, implemented as a splice-and-republish rather than a
filter.

Note also `if (!field) continue; // unknown path — ignore` (`:103`): an
override naming a path this version does not know is ignored rather than
rejected, which is must-ignore-unknown applied to the overlay store.

## The allow-list, and the one thing that is not on it

`DECLINABLE_PATHS` (`passport-overlay.ts:53-75`) is a literal enumerated map,
not a rule: the monitoring vendors (`stack.monitoring.errorTracking`, `.logs`,
`.metrics`, `.tracing`, `.uptime`), the production sub-scales
(`productionReadiness.observability | .ci | .security | .tests`,
`delivery.iac`, `delivery.rollback`), and the automation artifacts
(`manifest`, `contextGraph`, `memory`, `skills`, `evals`, `aiInWorkflow`).
`isDeclinablePath()` (`:77`) is exported specifically for route-level
validation, so the API surface and the projection share one door.

The comment above the map (`:47-50`) is the source of the technique's hardest
rule, stated in the repo before this subject existed:

> Enforcement facts a SCAN couldn't observe (the tokenless branch-protection
> caveat) are deliberately NOT declinable — that would let an owner silence a
> limitation of the evidence rather than accept a real trade-off.

That is an **upward lesson**: the draft had "declines never move a score" but
not the sharper claim that a *blind spot* is categorically outside the
allow-list while a *gap* is inside it. §2d restates it as "letting an owner
silence a blind spot would let a trade-off annotation launder it."

Reason text is trimmed and capped at `MAX_REASON = 280` (`:79`, applied at
`:153`), and `at` is a caller-supplied `YYYY-MM-DD` — the module never reads a
clock, so decline provenance is an input, not an ambient value.

## Where the realization falls short of the standard

- **Identity by rendered text.** `DeclinableField.blocker` is a `RegExp` matched
  against the builder-authored blocker string (`:66-74`, e.g.
  `/^zero observability/i`), and the portfolio aggregator
  (`passportBlockerAgg.ts:20-33`) groups by exact blocker string with one
  hand-normalized bucket (`SELF_VERIFY_BUCKET`, `:21`) for the single variable
  message. Both work today because the strings are canonical constants from one
  builder — the aggregator's header says so explicitly — but both are the
  identity-by-message-text failure the techniques warn about: rewording a
  blocker silently detaches every decline made against it and silently splits a
  rollup bucket. The standard wants a minted blocker id carried through, with
  the rendered string as payload.
- **No re-surfacing on material change.** A decline persists by path
  indefinitely; nothing marks it as needing re-confirmation when the underlying
  finding changes in kind or severity, and nothing ages it. The `at` field
  exists but is display-only.
- **Declines are not shown beside the portfolio rollup.** `aggregateBlockers()`
  counts blockers from `detail.autoBlockers`/`detail.prodBlockers`, which the
  overlay has already retired — so a deliberately accepted gap silently shrinks
  the fleet-wide count for that blocker. The standard's rule is that declines
  are counted beside the rollup, never subtracted from it, precisely so the
  shared problem keeps its true size.
