---
layer: application
type: application
subject: adoption-measurement
technique: dormancy-verdicts
stack: node
status: forged
verified_on: 2026-08-20
---

# Dormancy verdicts in a server-side org-skills library

The source app (`C:\Users\kazda\kiro\ascent`) runs a shared library of
organization "skills" — reusable practice artifacts a team can pull into a
repository — and has to answer, per artifact, whether anyone is still using
it. The verdict engine is a pure module, `src/lib/org/skill-usage.ts`, fed by
row readers in `skill-usage-load.ts` so the judgment is unit-testable without
a database.

## The shape

`src/lib/org/skill-usage.ts:26` declares the closed verdict vocabulary:

```ts
export type SkillUsageVerdict = "new" | "active" | "dormant";
```

`skillUsage(input, now)` at `:90` folds per-type event rollups
(`OrgSkillEvent`, types `download` and `sync`) plus adoption timestamps into
one verdict. Three details in that function are the technique in miniature.

**A background pull is not a use.** `:107` computes the activity clock from
`download` only:

```ts
const daysSinceRealUse = download ? daysBetween(download.lastAt, now) : null;
```

The doc comment at `:78-83` states the reason: `sync` is emitted by the CLI on
every run, including its drift report, so counting it "would make every skill
in a repo with a scheduled sync look alive forever — exactly the false
'everything is fine' the dormancy view exists to break". `lastUsedAt` still
ranks `download > sync` so the card can show when *anything* last touched the
artifact, but only a real use can move the verdict. This is the technique's
"discriminate at the point of recording" rule realized as a discriminated
event type rather than a report-time filter.

**One constant for both halves of the rule.** `:30`:

```ts
export const DORMANCY_WINDOW_DAYS = 30;
```

The comment names the intent — "also the age below which a never-invoked skill
is still 'new' rather than dead. One constant so the two halves of the rule
can't drift apart." The age anchor at `:110-112` is the later of the artifact's
creation and its most recent adoption, so an artifact re-adopted into a new
repository gets a fresh grace period rather than inheriting a dead clock.

**Rule order.** `:113-118`:

```ts
const verdict: SkillUsageVerdict =
  daysSinceRealUse !== null && daysSinceRealUse <= DORMANCY_WINDOW_DAYS
    ? "active"
    : !download && ageDays < DORMANCY_WINDOW_DAYS
      ? "new"
      : "dormant";
```

Active is evaluated first so a freshly published artifact already in use reads
`active` rather than being swallowed by the age guard; the `new` branch can
only claim an artifact with no real use at all. The doc comment at `:84-87`
spells the ordering out as a rule, which is why it survived subsequent edits.

## The recorded defect — two counters over disjoint activity

The header comment at `:6-12` documents the incident this technique's
single-source rule comes from. The card's "N uses" counter read
`OrgSkillDownload` (bumped by the web Copy/Download path) while the verdict
folded only `OrgSkillEvent`, which that path never wrote. **A skill copied 40
times displayed "40 uses · dormant"** — both halves internally correct, the
pair incoherent.

The fix landed at the write end, not the read end:
`recordSkillDownload` in `src/lib/db/org-skills.ts:530-555` now creates the
`download` event and bumps the tally inside one `prisma.$transaction`, so both
numbers derive from the same write and cannot disagree. `recordSkillEvents`
at `:481-507` does the same in the batch path, incrementing the tally only for
events of type `download`.

The same change retired the `invoke` event type. It ranked highest in the
verdict ladder but **had no producer anywhere**, which made `active`
unreachable for every skill in production — the whole population read dormant
and the report looked like a finding. That is the standard's
"assert every state is reachable" rule, learned here the expensive way.

## Deviations from the standard

- The verdict set is three states. The standard asks for five: `never-used`
  is collapsed into `dormant` (so "tried once and abandoned" is
  indistinguishable from "nobody ever touched it"), and there is no
  `unmeasured` state, so an artifact on an uninstrumented pathway is
  indistinguishable from an idle one. The standard stands; this is a gap to
  close, and the second omission is the more dangerous of the two because the
  library's prune candidates are drawn from `dormant`.
- The 30-day window is a fixed constant rather than derived from each
  practice's cadence. It is defensible for a library of frequently-pulled
  artifacts and would misjudge a quarterly practice.
