---
layer: application
type: application
subject: presenting-a-score-to-a-recruiter
technique: one-canonical-score-with-provenance
stack: node
status: forged
verified_on: 2026-08-20
---

# Reconciling three producers of "the match score"

`app/_lib/match-score.ts` is this repo's reconciliation module. Its header
comment (`match-score.ts:44`) opens with the incident rather than the design:

> "The match score" has THREE independent producers, none of which used to be
> reconciled anywhere — the same candidate showed 57 on the offer-approval card
> header, 49 in the salary rationale that actually PRICED the offer, and 70 in
> the drawer timeline, all rendered as an undifferentiated 0-100 "match".

## The producer map, written down

The module enumerates the producers instead of assuming everyone knows them:

- **(A)** `analyses.score` — the persisted analysis total keyed by
  `(candidate_label, jd_slug)`, rendered on the analysis report, the history
  view, the job candidate list and the drawer timeline.
- **(B)** `pipeline_entries.match_score` — a **snapshot** stamped at
  add-to-pipeline time, or backfilled once by the automation sweep
  (`automation-pass.ts` `scoreUnscoredEntries`, marked **FILL-ONLY**). This is
  the number decisions act on: screen-wave thresholds, advance-top-N, the
  policy pass.
- **(C)** a fresh `score_job(candidate, job).total` recomputed at task time —
  `pipeline/jobfit/automation.py` `draft_offer` re-scores and prices the salary
  from its own total. Never persisted back, so it silently diverges from (B).

The fill-only marking on the backfill is the technique's rule in place: the
sweep may score the unscored, never overwrite an existing figure.

## Precedence, and what stays out

`getCanonicalMatchScore` (`match-score.ts:110`) implements the precedence in
one place — freshest job-matched analysis (provenance `{ source: "analysis",
at, slug }`) → the entry's own snapshot (`{ source: "snapshot" }`) → `null`,
"never a fabricated 0". `canonicalScoreOf` and `provenanceOf`
(`match-score.ts:139` and `:147`) are the client-side accessors; the comment
on the latter pair is blunt — *never fabricates*.

The more interesting half is the exclusion rule at `match-score.ts:78`:

> Numbers that are genuinely a DIFFERENT concept — the draft-time pricing basis
> (C) on the offer card, the group-eval ranking total — are not folded into the
> canonical number; they must be rendered under their own label (e.g. the offer
> card's "fresh fit check at draft: N/100" line reading `matchBasis` from the
> offer payload) instead of all reading bare "match".

That is *reconcile rival answers, label different questions*, decided
explicitly rather than by whichever field a component reached for.

## The join is the provenance

Precedence rule 1 is only sound if "the freshest analysis **for this job**" is
actually job-matched, and the server module makes that strictness the point.
`app/_lib/match-score-resolve.ts:12` states the join contract: the job axis
requires the entry's job to be a JD-backed job whose slug equals the
analysis's `jd_slug`, because "a label-only join would fold a DIFFERENT role's
fit into 'the match score', re-creating the exact conflation this path ends";
the candidate axis is an exact, case-insensitive label match, because "a fuzzy
join would invent history for same-named strangers." A corpus job with no
job-matched analyses resolves to its snapshot rather than borrowing one.

`buildFreshestFits` and `withCanonicalScores` (`match-score-resolve.ts:34`
and `:51`) stamp `canonicalScore` + `scoreProvenance` onto the `/api/pipeline`
payload, so the board card, the drawer header and the offer approval card all
read one number and can say where it came from. The pure module stays
dependency-free so both server modules and client components import the same
precedence.

## The null half of the same module

`match-score.ts:1` carries the null-score policy that the precedence terminates
in. The comment records what the removed `?? 0` coercion did: it "minted a
genuine-looking 0 for such candidates, which let a never-measured person be
ranked worst, pass a `score < threshold` auto-reject gate, and have 'match 0'
sealed into the immutable decision chain."

`isScored` narrows a cohort into scored and unscored *before* any ranking or
threshold arithmetic — "fail closed: the unscored are excluded, never
coerced" — and `compareScoreDesc` sorts unscored entries "strictly AFTER every
scored one (including a genuine 0) without inventing a number." The display
layer already handled it honestly (`ScoreBadge` renders an em dash); this
module gives the decision layer the same honesty.

## Deviations still open

Producer (C) remains unreconciled by design and un-persisted, so the pricing
basis and the decision snapshot can drift arbitrarily far apart; the module
documents this rather than fixing it, and mitigates it only by requiring the
offer card to label its own figure. And no rubric or scale version rides with
the resolved score — provenance names the producer and the timestamp but not
the rubric it was scored under, so a rubric revision cannot mark historical
figures superseded.
