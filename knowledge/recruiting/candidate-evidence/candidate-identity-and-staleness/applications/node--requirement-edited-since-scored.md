---
layer: application
type: application
subject: candidate-identity-and-staleness
technique: requirement-edited-since-scored
stack: node
status: forged
verified_on: 2026-08-20
---

# One shared staleness predicate across every decision surface

The app implements the "score computed before the requisition's last edit is
stale" rule exactly once, as a pure function, and every surface that shows a
score imports it.

## The rule

`app/features/shared/decisionsTypes.ts:43`:

```ts
export function isScoreStale(scoredAt: string | null | undefined, jdEditedAt: string | null | undefined): boolean {
  return Boolean(jdEditedAt) && Boolean(scoredAt) && (scoredAt as string) < (jdEditedAt as string);
}
```

The comment above it (`:37–42`) states the contract in the technique's own
terms: this is "the ONE staleness rule shared by every decision surface (the AI
review cards + the wave preview rows), byte-identical to the library roster
(`JdCandidateList`) and prep-pack (`isPrepStale`) derivation: a score computed
strictly BEFORE the JD's last content edit reflects the earlier text."

Three details are load-bearing and all three match the standard:

- **"Informs, never blocks"** is written into the comment as the rule, not as a
  UI preference. Nothing in the codebase gates an advance on staleness.
- **Both null cases are *not stale*.** A never-edited JD (`jdEditedAt` null) or
  an unscored/snapshot entry (`scoredAt` null) returns false. Absence is not
  coerced into a flag — an unscored entry is not "stale", it is unscored, and
  the two must not render alike.
- **Purity is the anti-drift mechanism.** "Pure so the client cards and the
  server wave path can't drift." A staleness rule reimplemented per surface is
  how one list disagrees with another about the same candidate.

## Where it is consumed

- The AI review cards and the wave preview rows in the decisions queue.
- The library roster: `app/features/library/jds/JdsCandidateList.tsx:81–93`
  derives it inline against `jdEditedAt` and renders a badge.
- The saved analysis report: `app/history/[slug]/page.tsx:118–133` resolves
  `jdLastEditedAt(found.row.jd_slug, ws)` server-side and computes
  `isScoreStale(found.row.created_at, jdEditedAt)`. The comment names the
  intent — a "JD edited since this analysis" cue on a saved report — and the
  lookup is best-effort: "a store fault hides the chip, never breaks the
  report."
- The badge carries the edit **date** (`staleDate`, formatted with the request
  locale at `:134`), which is what makes it a statement about the record rather
  than about the person.

## What the wording does and does not claim

The rendered cue is *the JD was edited after this analysis*, with the date. It
is not "may no longer be a fit" and not "needs re-review". The user-facing
strings live in the message catalogs rather than in the derivation, which keeps
the claim translatable — and keeps the assertion structured rather than frozen
as prose in one language.

## Deviations

Two, and the standard stays in both cases.

**Any edit counts.** `jdLastEditedAt` tracks the JD's content edit, not
specifically its decision-bearing requirement fields. The standard asks for
material-edit tracking separated from general modification, so a formatting fix
does not light every badge in the workspace permanently. The repo is on the
safe side of the tradeoff (over-flagging rather than under-flagging), but a
badge that is always on carries no information, and this is where that erosion
starts.

**Mixed-vintage comparative views are unmarked.** A ranked candidate list can
hold entries scored before and after a JD edit, each correctly badged
individually, with nothing stating that the *ordering* spans two requirement
versions. Per-row honesty does not make a cross-row ranking honest; the list
needs a count of entries predating the edit, or a cohort re-score.
