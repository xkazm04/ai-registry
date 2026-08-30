---
layer: application
type: application
subject: cost-metering
technique: engagement-paced-cadence
stack: node
verified_on: 2026-08-30
verified_against: node@24
applied: simulation
ab_verdict: better
---

# A daily companion cycle that classifies its wakes and ignores the verdict

`ascent` — a Next.js 16 fleet-monitoring product whose companion runs one
autonomous cycle per org per day, spending one metered completion on a
briefing. Paths are relative to the repo root; citations resolved 2026-08-30
at commit `0e1f0b30` on the active branch. The seam is a platform cron
(`vercel.json`, `30 7 * * *` → `src/app/api/cron/athena/route.ts`), not an
in-process loop, which changes which half of the technique is reachable —
and makes the half that *is* reachable unusually cheap.

## The structural fact: the classification signal exists and nothing paces on it

The technique's hardest input — a per-wake verdict of "real work" versus
"empty" — is one an implementer normally has to build. This tree already
emits it. The briefing prompt is engineered so that a quiet day costs one
line (`src/lib/athena/cycle-prompt.ts:110-120`, "nothing changed" as the
declared right answer most days), and a predicate distinguishes that
declared silence from a real briefing (`cycle-prompt.ts:72`). The verdict
feeds report-or-absorb — whether to tell anyone — and nothing else. Spend is
identical either way: a dormant org whose companion has declared silence
forty days running is billed the full completion on day forty-one, at the
same rate as the org that reported every day. Nobody designed the predicate
as a cadence input; it fell out of the reporting discipline, and it is
exactly the wake classification the technique's descent schedule keys on.

The reactivity half of the split, meanwhile, is already built: an org with a
live operator turn is skipped, never queued (`src/lib/athena/cycle.ts:203`),
and interactive turns run on their own path with no throttle. The tree holds
the technique's separation and the technique's classifier, and lacks only
the schedule between them.

## The paired comparison (simulation — three cases from this tree)

No harness here can observe spend without the production ledger, so the
comparison is a walked simulation over three cases the tree names. A is the
shipped policy (fixed daily spend per org); B adds descent keyed on the
existing silence predicate: after three consecutive declared-silence cycles,
precede the full completion with a cheap probe, escalating only on yes.

- **A live operator turn** (`cycle.ts:203`): identical under both — the
  skip-never-queue rule is the technique's "reactivity is never throttled"
  clause, already enforced. Falsifier: none; B does not touch this path.
- **A dormant org** (consecutive silences, persisted as the companion's own
  episodes per `cycle.ts:24`): A spends one full completion daily forever; B
  spends a probe-priced call on most days after the third silence. Predicted
  outcome: dormant-org spend falls by roughly the full-to-probe price ratio.
  Falsified if declared-silence runs are rare — measurable today by counting
  consecutive silence episodes per org in the store the cycle already
  writes.
- **A platform retry inside the coalescing window**
  (`src/lib/athena/cycle.ts:78-82`, at-most-once claim): identical under
  both, with one obligation B inherits — the descent counter must live
  beside the claim row, so a coalesced retry does not count as a second
  empty wake.

Verdict: **better**, at simulation strength. The cron's fixed daily tick is
already a settled cap, so the descent *schedule* is mostly moot here; the
technique's second lever — cheaper wakes at depth, gated by the existing
predicate — is the whole win, and it needs no cron change.

## What this realization cannot do

The wait between wakes is the platform's, so the scheduled-wake mechanics
(singleton timer, ownership token) have no seat here — the platform's
at-most-once claim does that job. And the simulation's spend delta is
predicted, not measured: the instrument that would upgrade it is a count of
consecutive declared-silence episodes per org, which the episode store
already contains.
