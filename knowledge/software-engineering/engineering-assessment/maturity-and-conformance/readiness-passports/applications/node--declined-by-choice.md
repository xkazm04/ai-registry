---
layer: application
type: application
subject: readiness-passports
technique: declined-by-choice
stack: node
status: forged
verified_on: 2026-10-01
verified_against: node@22
---

# The read-time overlay that turns a fingerprint into decision memory

Realized in the Ascent repo as `src/lib/analyze/passport-overlay.ts` (353
lines at ascent 8998d2c0, up from 177 at the first reading), with the doctrine stated at `APP_READINESS_PASSPORT.md` §2d and the
portfolio consequences in `src/features/standing/passports/passportBlockerAgg.ts`.

## Storage: beside the scan, never inside it

The module header (`passport-overlay.ts:17-20`) names re-scan survival as the
load-bearing property and gets it structurally: declines are stored per repo in
`Repository.passportOverridesJson`, keyed by field path, **never inside the
scan-derived `passportJson`**. A new scan rewrites `passportJson` only, so the
overlay re-applies the same declines to the freshly generated passport. "A
re-scan can never silently clear an owner's decision."

`applyPassportOverrides()` (`:281`) is pure — clones, never mutates, no IO,
no clock — and `applyDeclines()` (`:227-278`) iterates
`Object.keys(declined).sort()` so the projection is deterministic. The
technique's requirement that the overlay leave the computed assessment
reproducible is met exactly.

Two owner inputs share the module and are worth distinguishing: the P4
non-observable facts (`criticality`, `lifecycle`, `rollback`) are owner-supplied
*measurements* the scan cannot take, and one of them (`rollback`) legitimately
re-derives the production score via `deriveProductionScore`
(`:290-296`). Since the first reading that override also stops looking
measured: the production block records `overridden` with the reason, the delta
and what the scan itself measured, so an owner-moved score is attributable. Declines are the opposite: they never touch a score.

## Re-render, never hide

`applyDeclines()` retires the matching blocker line from
`automationReadiness.blockers` or `productionReadiness.blockers` and re-emits
it under a top-level `declined[]` as
`{ path, label, reason?, blocker?, findingId?, at?, by?, needsReconfirm? }` —
with the **original blocker text preserved** in `blocker` for audit
(`:258-270`). The technique's
re-render-don't-hide rule, implemented as a splice-and-republish rather than a
filter.

Note also `if (!field) continue; // unknown path — ignore` (`:231`): an
override naming a path this version does not know is ignored rather than
rejected, which is must-ignore-unknown applied to the overlay store.

## The allow-list, and the one thing that is not on it

`DECLINABLE_PATHS` (`passport-overlay.ts:108-127`) is a literal enumerated map,
not a rule: the monitoring vendors (`stack.monitoring.errorTracking`, `.logs`,
`.metrics`, `.tracing`, `.uptime`), the production sub-scales
(`productionReadiness.observability | .ci | .security | .tests`,
`delivery.iac`, `delivery.rollback`), and the automation artifacts
(`manifest`, `contextGraph`, `memory`, `skills`, `evals`, `aiInWorkflow`).
`isDeclinablePath()` (`:132`) is exported specifically for route-level
validation, so the API surface and the projection share one door.

The comment above the map (`:88-91`) is the source of the technique's hardest
rule, stated in the repo before this subject existed:

> Enforcement facts a SCAN couldn't observe (the tokenless branch-protection
> caveat) are deliberately NOT declinable — that would let an owner silence a
> limitation of the evidence rather than accept a real trade-off.

That is an **upward lesson**: the draft had "declines never move a score" but
not the sharper claim that a *blind spot* is categorically outside the
allow-list while a *gap* is inside it. §2d restates it as "letting an owner
silence a blind spot would let a trade-off annotation launder it."

Reason text is trimmed and capped at `MAX_REASON = 280` (`:156`, applied at
`:324`), and `at` is a caller-supplied `YYYY-MM-DD` — the module never reads a
clock, so decline provenance is an input, not an ambient value.

## The three shortfalls the first reading named are closed (passport 0.4.0)

The first version of this note listed three ways the realization fell short.
Re-read against the tree on 2026-10-01, all three are fixed, and the file's own
header (`:11-15`) says why. The fixes are the evidence the technique's
standard is reachable, and they carry two refinements the technique did not
state.

- **Identity by minted id, not rendered text.** `DeclinableField.finding` is
  now the join key (`:96-100`), `"prod.zero-observability"` style. The
  prose regex survives only as `legacyBlocker`, a fallback for an un-migrated
  blob with no `findings`, "so an existing decline is not orphaned by the very
  change that fixes orphaning". The portfolio aggregator keys its buckets on
  the finding's cause code and keeps the sentence as payload; the hand-written
  `SELF_VERIFY_BUCKET` is now a pre-0.4.0 fallback
  (`passportBlockerAgg.ts:4-10, 81-85`).
- **Re-surfacing on material change, with a deliberately long clock.**
  `reconfirmReason()` (`:158-176`) fires on exactly three things: the
  finding's *kind* changed, its *severity* rose, or the decline is older than
  `DECLINE_MAX_AGE_DAYS = 365`, measured against the passport's own
  `generatedAt`, never a clock. Refinement one: the code comment prices the
  window against the opposite failure. Re-surfacing on a rewording or score
  jitter "trains owners to re-decline reflexively, which destroys the signal
  value of a decline", so the trigger set is narrow on purpose and the year is
  a trade-off, not a default. Refinement two: a re-surfaced decline does
  **not** retire its blocker. The blocker stays open and the decision is
  rendered beside it with `needsReconfirm` and the sentence the owner is asked
  to re-decide on (`:262-272`), so the reader sees the live gap and the
  reasoning together. The baselines (`code`, `severity`) are optional, and an
  absent baseline reads as UNKNOWN and skips that comparison rather than
  manufacturing a "nothing changed" or re-opening every old decision at once.
- **Declines counted beside the rollup.** `passportBlockerAgg.ts` now carries
  declines (and member dismissals) as their own population next to the open
  one; ranking uses the total, the lists stay separate, so "12 blocked, 4
  accepted" is renderable and an accepted gap no longer shrinks the fleet count.
  The same header keeps coverage holes (`prod.*-unassessable`,
  `enforcement-not-observable`) out of the scored buckets entirely: "we could
  not look" must not read as the org's most common problem.

## What still differs from the technique

- **The reason is optional here.** The technique says the reason is required
  and an empty one is rejected. `DeclineEntry.reason?` is optional and the
  parser only trims and caps it (`:30, 324`). Author provenance went the other
  way: `by` is stamped server-side from the session, never accepted from the
  client, and absent on old declines it renders as unknown author, not a
  guessed one (`:40-50`).
- **Aging is not display-only.** The technique calls aging "a display state
  first and an expiry second". Here an aged decline stops suppressing the
  blocker, which is closer to an expiry; nothing is deleted, and the decision
  record stays on `declined[]`, so the memory survives either way.
