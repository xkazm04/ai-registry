---
layer: application
type: application
subject: candidate-identity-and-staleness
technique: requirement-edited-since-scored
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
---

# One shared staleness predicate across every decision surface

The app implements the "score computed before the requisition's last edit is
stale" rule once, as a pure function, and every surface that shows a score
imports it, except one, recorded below. Re-verified at the tree's HEAD
`c39dc91a6` on 2026-09-28.

## The rule

`app/features/shared/decisionsTypes.ts:65–82`:

```ts
export function isScoreStale(
  scoredAt: string | null | undefined,
  jdEditedAt: string | null | undefined,
  scorecardAt?: string | null,
): boolean {
  if (!scoredAt) return false;
  const scored = Date.parse(scoredAt);
  if (!Number.isFinite(scored)) return false;
  if (jdEditedAt) {
    const edited = Date.parse(jdEditedAt);
    if (Number.isFinite(edited) && scored < edited) return true;
  }
  ...
```

Since the 2026-08-30 reading it compares **parsed instants** rather than
strings, because "stored timestamps may use different UTC offsets or
fractional-second precision" (`:59–60`). An unparseable timestamp returns
false. The comment (`:54–64`) still states the contract in the technique's own
terms: "the ONE staleness rule shared by every decision surface … a score
computed strictly BEFORE the JD's last content edit reflects the earlier text".

Three details are load-bearing and all three match the standard:

- **"Informs, never fabricates"** is written into the comment as the rule, not
  as a UI preference.
- **Every null case is *not stale*.** A never-edited JD, an unscored or snapshot
  entry, or an unparseable timestamp returns false. Absence is not coerced into
  a flag: an unscored entry is unscored, not stale, and the two must not render
  alike.
- **Purity is the anti-drift mechanism.** "Pure so the client cards and the
  server wave path can't drift."

An optional third timestamp, `scorecardAt` (`:57–58`, `:77–80`), applies the
same strictly-before rule to later interview evidence: a CV score predating a
scorecard is stale even when the JD has not moved. At this HEAD it is exercised
by `app/features/hiring/decisions/decisionsScoreStaleness.test.ts:45` and passed
by no production caller.

## Where it is consumed

- The decisions queue: `app/features/hiring/decisions/useDecisionsQueue.ts:363`.
- The bulk screen wave: `app/_lib/screen-wave.ts:170–178` resolves the JD's last
  edit once and attaches `{ stale: true, staleSince }` per cohort member to the
  preview. The wave is the surface that produces an adverse outcome, and it
  routes through a human approval gate that sees both dates. That is the
  technique's rule for adverse surfaces.
- The candidate timeline drawer: `app/_lib/candidate-timeline.ts:504`.
- The saved analysis report: `app/history/[slug]/page.tsx:139–143` resolves
  `jdLastEditedAt(found.row.jd_slug, ws)` server-side and computes
  `isScoreStale(found.row.created_at, jdEditedAt)`. The badge carries the edit
  **date** (`staleDate`, formatted with the request locale at `:158`, rendered at
  `:233–235`), which is what makes it a statement about the record rather than
  about the person.

## What the wording does and does not claim

The rendered cue is *the JD was edited after this analysis*, with the date. It
is not "may no longer be a fit" and not "needs re-review". The user-facing
strings live in the message catalogs rather than in the derivation, which keeps
the claim translatable, and keeps the assertion structured rather than frozen
as prose in one language.

## Deviations

Three, and the standard stays in each case.

**Any save counts, including a save that changes nothing.** `updateJd`
(`app/_lib/db/jobs.ts:388–415`) snapshots the pre-edit version into
`jd_revisions` on every call, stamped now, with no check that the title or body
changed. `jdLastEditedAt` (`:472`) reads `MAX(created_at)` over those rows. So a
title-only change, a formatting fix, or a save of identical text marks every
analysis for that JD stale. The standard asks for the last *material* edit, to
the decision-bearing requirement content. At minimum, skip the revision when
nothing changed. A badge that any save can light carries little information,
and this is where it starts to erode.

**One surface still carries its own copy of the rule.** The library roster
(`app/features/library/jds/JdsCandidateList.tsx:88–90`) derives staleness
inline with a string compare, `row.created_at < jdEditedAt`. The shared
predicate moved to parsed instants, and this copy did not follow. So the
predicate's comment, "byte-identical to the library roster", is now false. This
is the drift that the "one place" rule exists to prevent, caught in the act.

**Mixed-vintage comparative views are unmarked.** A ranked candidate list can
hold entries scored before and after a JD edit, each correctly badged
individually, with nothing stating that the *ordering* spans two requirement
versions. Per-row honesty does not make a cross-row ranking honest. The list
needs a count of entries predating the edit, or a cohort re-score.
