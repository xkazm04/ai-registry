---
layer: application
type: application
subject: deadline-pipeline-management
technique: miss-risk-scoring
stack: node
status: forged
---

# Node: miss-risk scoring in a grant-writing pipeline

How one Next.js/TypeScript grant-writing product (repo:
`grant-writing-nonprofits`) realizes miss-risk scoring as a pure module shared
by its triage lane and its daily reminder digest.

## The model, verbatim

`src/features/reminders/triage.ts:9-101` is the whole model — pure, no DB, no
I/O. The header comment states the motivating blindness exactly as the
technique does: the deadline cron "fires on calendar thresholds (30/14/7/1)
alone and is BLIND to whether a draft is actually finishable: a draft at 10%
with 2 days left gets the same calm nudge as one at 95%."

Key constants and formula (`triage.ts:13,35-37,57-84`):

```ts
export const DEFAULT_EFFORT_DAYS = 5;      // median 0%→submittable, the one tunable
const CRITICAL_AT = 0.55;
const AT_RISK_AT  = 0.33;
const WATCH_AT    = 0.15;

const workLeftDays = effort * (1 - p);     // p = clamp(percent,0,100)/100
if (workLeftDays <= 0) return { score: 0, level: "on_track", ... };  // done = safe
if (daysOut < 0)       return { score: 1, level: "overdue", ... };   // past + unfinished = maximal
const ratio = workLeftDays / (daysOut + 1); // +1 grace: exactly-enough-time ≠ certain miss
const score = ratio / (ratio + 1);          // squash: 0→0, 1→0.5, 3→0.75, →1
```

The comments carry the calibration anchors: thresholds are "tuned so the
brief's anchor cases land sensibly: 10%@2d (4.5 work-days / 2 cal-days) →
critical; 95%@2d → on_track" — and the `DEFAULT_EFFORT_DAYS` comment names
the upgrade path (per-org historical median) instead of pretending the
constant is calibrated.

## The guarded completion input

The `percent` input comes from `src/features/drafts/computation.ts:11-29`:
completion is the fraction of funder-facing sections holding at least
`MIN_SECTION_CHARS = 40` characters — the floor is explicitly there to stop
"TBD"/"TODO" fills gaming the progress bar — and the denominator is the
funder blueprint's own funder-facing keys when supplied (an EU-style draft is
measured over Excellence/Impact/Implementation/budget, not a fixed
three-section house set). Both guards are prerequisites the technique names:
without them the risk ranking is confidently wrong.

## Two consumers, one ordering

- **Pipeline triage lane** (`src/app/pipeline/triage.helpers.ts:21-53`):
  filters to drafting/submitted inside a 90-day window, keeps
  overdue-but-unfinished rows ("the misses most worth surfacing"), computes
  `missRisk(daysOut, d.percent)`, **drops `on_track` rows** so the lane
  "stays signal, not noise", and sorts
  `b.risk.score - a.risk.score || a.daysOut - b.daysOut`. The comment states
  the anchor ordering: "a 10%-done draft three days out should lead a
  90%-done draft closing tomorrow."
- **Daily reminder digest** (`src/features/reminders/digest.ts:27-97`): maps
  each fired reminder through `missRisk`, ranks by score, escalates the
  subject line on the at-risk count ("N grant deadlines at risk of being
  missed") rather than the soonest date, and renders the decomposition per
  row via `workLeftPhrase` — "X% done · ~Yd of work left" — so recipients
  see the inputs, not just the verdict. `riskHeadline` (`triage.ts:88-101`)
  gives both surfaces the same status vocabulary so they cannot drift.

## Notable choices

- `daysOut` is computed upstream with the tz-aware `daysUntilClose`
  (`triage.helpers.ts:33` cites this explicitly: raw-UTC math "would let the
  triage 'Xd' badge drift a day from the email reminder for the same
  deadline") — the risk model composes with timezone-correct day math rather
  than re-deciding the clock.
- The risk model rides *on top of* the 30/14/7/1 ladder
  (`src/features/reminders/computation.ts:32-75`), which still guarantees the
  notice floor; risk only decides ranking and emphasis — exactly the
  layering the technique prescribes.
