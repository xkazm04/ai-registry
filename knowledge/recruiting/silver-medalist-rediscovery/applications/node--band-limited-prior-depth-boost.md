---
layer: application
type: application
subject: silver-medalist-rediscovery
technique: band-limited-prior-depth-boost
stack: node
---

# The five-point band in the rediscovery ranker (Node)

The ranking rule lives in `app/_lib/rediscovery-rank.ts`, deliberately split out
of `app/_lib/rediscover.ts` so the band guarantee is unit-testable: the header
comment (`:11-14`) records that the sibling is kept "IMPORT-light (only
`PIPELINE_STAGES`, a pure DB-free axis) so the band guarantee is unit-testable
under bare `node --test` — rediscover.ts pulls in better-sqlite3 + the db barrel
+ python-runner and won't load there." The fairness property is a test target,
not a comment.

## The band is derived, not chosen

`PRIOR_DEPTH_BAND = 5` (`rediscovery-rank.ts:26`) is documented with its
derivation rather than as a tuned constant (`:17-25`):

> 5 is the chosen, defensible band: it's half of matching's 10-point fit-tier
> step (`SCORE_FLOOR=55` mirrors the "promising" tier), so the boost can shuffle
> a near-tie inside one tier but never vault a candidate a whole tier's width
> past a genuinely stronger fit. The guarantee is STRUCTURAL, not incidental:
> because the boost is bounded to `[0, PRIOR_DEPTH_BAND]`, the maximum ordering
> swing IS the band.

This is the standard's "roughly half a fit tier" realized literally, and the
structural argument is the one that matters — the bound is a clamp on the boost
function's range, so no combination of inputs can exceed it.

`priorDepthBoost` (`:38-42`) is one point per `PIPELINE_STAGES` step reached,
`Math.min(idx, PRIOR_DEPTH_BAND)`, with `idx <= 0` returning 0. Two of the
standard's rules fall out of that single line: an unknown or blank stage
contributes nothing rather than a default, and the shallow entry stage
(`Accepted`, index 0) contributes nothing — "a boost only ever HELPS a candidate
we can place deeper on the axis; it never penalises" (`:35-37`).

## Ordering only, honest score displayed

`byPriorAwareRank` (`:52-57`) sorts on `score + boost` and falls back to the
honest `score` as the stable tiebreak, and the contract is explicit that
"callers keep displaying `score`, the honest base" (`:46-51`). The consumer in
`rediscover.ts:141-143` sorts with it and keeps the displayed `score` as the
rounded raw total from the ranking run (`:127`).

Admission precedes the boost, exactly as the standard requires. `rediscover.ts:117`
filters on `row.koPassed && Math.round(row.result?.total ?? 0) >= SCORE_FLOOR` —
knockout gates first, then the honest total against the floor — and the comment
at `:132-140` states the resulting property: "Admission (`SCORE_FLOOR`) already
happened above on the HONEST score, so the boost only REORDERS the admitted set."

The same comment reasons about the display cut, which the standard now carries
as a named consequence: at the `REDISCOVER_LIMIT` cut "a deeper prior just below
the cut may edge out a shallower one just above it — but only when their base
scores are within the band, so the cut never admits anyone a real tier stronger
got bumped for."

## The active-candidate exemption

`pickPrior` (`rediscover.ts:58-84`) returns a `depth` of `priorDepthBoost(o.stage)`
for terminal priors, but the `elsewhere` branch overrides it to zero (`:82`):

> An `elsewhere` prior is a LIVE entry, not a terminal one — the depth boost
> (and its "got as far as X last time" disclosure) is about how far a silver
> medalist's FINISHED run advanced, so a currently-active candidate takes no
> boost: their stage would inflate ordering for someone who may not even be
> available.

The same file drops anyone already active in *this* role before ranking
(`:120-121`) — "Already in THIS role's pipeline → not a rediscovery."

## Depth doubles as the disclosure trigger

The `PriorOutcome` type (`:31-43`) documents `depth > 0` as "the signal a
surface uses to DISCLOSE the depth in its why-now rationale — the boost that
influenced order", with `stage` carried alongside as the canonical, enum-mapped
value. That ties the ranking adjustment and the candidate-facing explanation to
one field: the surface can only claim depth influenced the order when it
actually did.

## Where the repo is short of the standard

- The boost has **no recency ageing**: a final round from three years ago
  contributes the same points as one from last quarter. The band contains the
  damage, but the standard's "age the depth signal rather than deleting it" is
  not implemented.
- There is **no property test asserting the non-reversal invariant across
  arbitrary pairs** — the band is documented and unit-tested at the function
  level (`priorDepthBoost` clamping, `byPriorAwareRank` ordering), which is
  strong, but the standard's "for any two candidates whose raw fit differs by
  more than the cap, the boost never reverses their order" would be one
  generative assertion.
- The boost is not **surfaced as an inference to the recruiter** beyond the
  prior chip; the ordering influence itself is not labelled in the list.
