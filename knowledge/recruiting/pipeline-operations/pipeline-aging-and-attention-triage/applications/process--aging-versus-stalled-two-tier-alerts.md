---
layer: application
type: application
subject: pipeline-aging-and-attention-triage
technique: aging-versus-stalled-two-tier-alerts
stack: process
status: forged
verified_on: 2026-09-29
---

# Two tiers in the automation policy pass (process)

The daily policy pass lives in the spawned Python analysis pipeline
(`pipeline/jobfit/automation.py`). This note was first written against a pass
that carried its own flat aging numbers, and four of its five findings were
deviations from the standard. On 2026-09-23 a single commit (`1f62d70c5`, one
architecture challenge) closed them, citing this subject's three techniques as
what it encodes. What follows is the tree as re-read on 2026-09-29, with the
old shape kept because the way it failed is the lesson.

## Before: one flat cut, inverted names, an alert every day

The pass used to apply `stale_days: 21` / `aging_days: 30` to
`days = int(entry.get("daysInStage") or 0)` for every stage. Three defects
followed from that one design: an offer and an intake row with 21 silent days
emitted the same alert, while the board's amber dot fired at 3 days for the
offer; a hire in the terminal stage collected an `aging_alert` every day from
day 30 on; and the same alert was re-written into the feed on every business
day "until someone moved the card". The ratio 30/21 (about 1.43) was also below
the two-to-three-times separation the standard recommends.

## After: the tier is resolved once and handed in

`app/_lib/aging-policy.ts` is now the one aging clock. `agingTier(stage, days,
axis, overrides)` returns `none | aging | stalled`: a terminal-role stage never
ages, a non-positive SLA never ages, an unknown dwell reads fresh, `aging` is
dwell at or past the stage's SLA, and `stalled` is dwell at or past
`STALLED_MULTIPLE = 2` times it. The multiple is stated once and both numbers
derive from the per-stage table, exactly as the standard asks; 2x sits at the
bottom edge of its two-to-three range.

Three surfaces read that one function: the board's amber dot, the sidebar badge,
and the policy pass. The pass never re-derives the tier.
`listActiveEntriesForAutomation` stamps `agingTier` on each entry on that
entry's own workspace axis, and Python maps it (`AGING_TIER_ALERTS`, `automation.py`
`:178`): `aging` becomes `stale_alert`, `stalled` becomes `aging_alert`. The flat
`POLICY` 21/30 cut survives only as the fallback for a caller that sends no
tier (the bare CLI) and now also refuses a terminal stage on that path
(`aging_alerts`, `:220-233`). The constants that cross the language boundary as
code are bound by `AgingTierSyncTest`, which reads the TypeScript literals and
fails on drift.

## The vocabulary inversion: kept, but written down once

The persisted event kinds still read the wrong way round by name (the soft
tier is `stale_alert`, the hard tier is `aging_alert`) because stored rows must
keep reading. The change is that the mapping is now a single documented
constant, `AGING_TIER_ALERT` in `aging-policy.ts`, whose comment says why it is
inverted, rather than two layers each guessing. That is the standard's "write
it down where both layers can see it" met by a bridge rather than a rename. The
standard's stronger advice, names that carry their own severity, is not
followed at the storage layer; the recruiter-facing layer and the internal
`AgingTier` type do use `aging` / `stalled`.

## The alert is an event: once per stint, not once per pass

`recordDecisionAlerts` (`automation-pass.ts`) is shared by the preview and the
commit loop, so the forecast count and the feed agree. The two aging kinds are
deduped once per stage stint per tier, keyed on the snapshot's `stageChangedAt`
through `hasEventSinceStageChange`. An aging alert on an `advance` decision, or
on a `staleSkip` where the entry moved mid-pass, is dropped, because the move
ends the stint the alert describes and a row written after it would sit inside
the new stint and suppress that stint's own first alert. The fairness backstop's
`fairness_gate_blocked_reject` keeps a per-day dedupe, since each refusal is a
fresh event. The standard's two-tier technique did not say this; it is now
carried there as its own rule.

## Executed 2026-09-29: where a stint starts and ends

Run against the real store (`recordDecisionAlerts`, `automation-pass.ts:388-410`;
`hasEventSinceStageChange`, `db/pipeline.ts:3205-3221`), with `stage_changed_at` and
event times overwritten to simulate elapsed days except where noted:

- **Aging, edited but not moved, then stalled:** day 4 writes one `stale_alert`; a
  second pass the same day writes nothing; after an edit that leaves the stage
  timestamp alone, day 7 writes one `aging_alert`. The two kinds dedupe
  independently, so the harder tier still fires once.
- **Un-reject:** `reinstatePipelineEntry` (`db/pipeline.ts:1402-1406`) sets
  `stage_changed_at` to now, so the old alerts sit before the new anchor and a new
  stint starts. That is the right shape for an outcome that ended the last stint.
- **Reopening a closed role:** `reopenEntriesByJobId` (`:974`) sets status only.
  Unedited close and reopen left `stageChangedAt` at its old value, so the stint
  continues, the alert already written stays suppressed, and only the next tier
  fires; months of closure count as dwell. Whether that is the right answer turns
  on whether closing told the candidate, which this code cannot see.
- **Moving away and back:** every move rewrites `stage_changed_at`, so re-entry is
  a new stint.
- **A missing timestamp:** the store keys it as an empty string, so any earlier
  event of that kind would suppress forever; unreachable in practice because the
  tier is `none` for an unknown date, and worth a test.

The existing `automation-pass.test.ts:125-155` pins once-per-stint and the new
stint after a move. Nothing pins the reopen case, and nothing in the pass reads
whether an offer is sent or its window is open (see the React note): an offer
inside its window collects the same `stale_alert` and `aging_alert` as any other
stage.

## Still true: the tiers only nudge

`alerts` rides alongside `action` and never sets it. Every `return out(...)`
chooses its action from stage, score, archetype and approval state, and no
branch reads `days` or the tier to advance, reject or close.
`RECOMMENDATION_FALLBACK = "hold"` and the early-career gate are unchanged. The
`elif` shape, one tier per entry and never both, holds on both the tier path
and the fallback.

## Remaining deviations

- **The fallback path is still one global cut.** A caller that sends no tier
  gets 21/30 days regardless of stage. The production pass always sends one, so
  the blunt cut is confined to the bare CLI, but it is the same number the
  standard calls wrong.
- **The 21/30 fallback is still not tunable at runtime.** The `POLICY` header
  still says "tunable per market/season" and there is still no override
  mechanism for those two numbers. What changed is that the numbers that drive
  the production alerts are now the team's own per-column cadence, which is
  tunable (see the React application), so the half-tunable failure no longer
  applies to the path that matters.
- **A missing duration still coerces to zero.** `days = int(entry.get("daysInStage") or 0)`
  (`:973`) is unchanged, and on the fallback path a missing duration therefore
  never alerts by arithmetic rather than by an explicit unmeasured state. On the
  tier path the TypeScript side reads an unparseable or absent timestamp as
  `none` on purpose (`daysInStageAt` returns null), which is the explicit form.
