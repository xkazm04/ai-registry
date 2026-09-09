---
layer: application
type: application
subject: channel-native-social-and-repurposing
technique: cadence-caps-at-one-chokepoint
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Cadence caps at one chokepoint - the workspace's social-posts route

Verified against the Czech-first marketing workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08). The workspace proves the
technique's central structural claim - that a cap written once can bind every scheduler
only if every scheduler creates its post through one endpoint - and records, in its own
header comment, the state the technique exists to fix: a cap "enforced by NOTHING".

## The chokepoint

`src/app/api/social/posts/route.ts:51-56` names itself: *"THE cadence chokepoint. Every
scheduler in the app - the week planner, the content-plan board's hand-off, the
distribution variant card - creates its scheduled post here, which is the only reason a
cap written once in the kanály wizard can bind all three without any of them knowing
about it."* The `POST` handler runs `cadenceRefusal` (`:66-110`) only on the
schedule-for-later branch (`:165-169`), after the channel-limit check (`:130-134`), the
unparseable-date refusal, and the past-time refusal (`:162-163`, with the two-minute
`PAST_SCHEDULE_SKEW_MS` at `:30`). The order is the technique's: hard gates first, the
courtesy check last.

## The arithmetic, defined once and framework-free

`src/lib/publishing/cadence.ts:1-13` states the incident: `maxPerWeek` had been
*"written by the kanály setup wizard and shown in the playbook since the module
shipped, and enforced by NOTHING"*. The three functions that fix it are pure - no store,
no clock - so the same arithmetic runs in the write chokepoint and in the calendar's
meter row (`weekCadence`, `:135-137`).

- **Which week.** `weekStartIso` (`:41-48`) sets local midnight, steps back
  `(getDay() + 6) % 7` days to a Monday, and formats with a local-date helper
  (`localIso`, `:30-35`) rather than `toISOString()`, which the comment notes *"would
  shift the date across the UTC boundary near midnight"*. An unparseable instant
  returns `""` - *"a bucket nothing else lands in"* (`:37-40`).
- **What counts.** `COUNTED = ["scheduled", "published", "sent"]` (`:22`); the comment
  at `:18-21` gives the reason in the technique's words: capping plans *"would refuse a
  real post because someone sketched four ideas. `failed` freed its slot by
  definition."*
- **Which cap.** `cadenceRules` (`:62-89`) drops any track resolving to `"other"`
  (`:72-76`, with the comment that keeping it *"would let a cap on a directory listing
  refuse a LinkedIn post"*) and keeps the strictest per channel key
  (`:83-84`, `rule.maxPerWeek < prev.maxPerWeek`). `capFor` (`:92-99`) takes the
  `Math.min` again over the rule list.
- **Exceeded.** `checkCadence` (`:105-131`) returns
  `exceeded: cap !== null && weekStart !== "" && count >= cap` - count is what is
  already placed, so with a cap of three and three placed the fourth breaks it
  (`:103-104`).

## Fail open, 409, human override audited

`cadenceRefusal` returns `null` (no refusal) when there is no user or project (`:75`),
when no rules resolve (`:77`), or when the check is not exceeded (`:83`) - the
*"Fails OPEN by construction"* of the header (`:57-62`), which also pins the
zero-extra-reads property to a byte-identity test. A breach without the override flag
returns HTTP 409 with `error: "cadence-exceeded"`, the channel, cap, count and
`weekStart` (`:85-94`). With `overrideCadence: true` the post is created and
`emitProjectActivity` writes a warning-severity row against `module: "kanaly"`
(`:101-109`) - *"the module that OWNS the cap, not the one that broke it, so the audit
sits next to the promise it overrode"*. The detail string is `channel · (count+1)/cap
(weekStart)`. The header at `:63-65` fixes the doctrine: *"The override is a HUMAN
CLICK, never an inference ... Nothing auto-reschedules."*

## Structural facts the tree proves

1. A cap is bindable across N schedulers only through one write path; the workspace's
   own history (displayed-and-unenforced until this module) is the counter-example.
2. Fail-open is the correct default for a cadence check, and it is testable: the
   no-cap branch is pinned to produce a byte-identical response.
3. The week must be the operator's local Monday-start week, and the implementation
   detail that gets this wrong is `toISOString()`.

## Deviations

- The cap value itself is operator-typed in a wizard with a 1-14 range and no
  evidence attached; the technique's "renegotiate a cap overridden every week" has no
  surface here - overrides are audited but never summarised back to the operator.
- `cadenceRefusal` is skipped entirely for the publish-now branch (`:165-169` gates it
  on `future`). A publish-now post occupies a slot the moment it is sent, so a week at
  its cap can still exceed it by immediate publishes. The technique's chokepoint
  should check both branches; the workspace checks one.
- The audit row's `actor` is the literal `"Vy"` ("you"), not a user identity, so the
  record says a human overrode the cap without saying which human.
