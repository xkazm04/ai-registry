---
layer: application
type: application
subject: conflict-of-interest-detection
technique: triage-signal-scoring
stack: node
status: forged
---

# Node: three orderings over one tie queue in the politicas money layer

The politicas project ranks its ~211 MP↔company money ties with exactly the
three orderings the technique names, each a pure deterministic function of a
tie's own fields, each defined once and imported by both the interactive
console and the offline triage pipeline.

## Significance: `signalScore`

`scripts/case-loops/money/triage.ts:218-241` computes the story-worthiness
rank, with `features/money/reviewTypes.ts:300-323` (`reviewSignal`) as the
shared mirror "kept here so the console and the offline triage agree
exactly" — the one-definition rule applied to a formula. The components,
verbatim from the code:

```ts
const classW = tieClass === "owner-operator" ? 1.0 : tieClass === "manager" ? 0.7 : 0.35;
score = classW * (
    log10(contractCzk + subsidiesCzk) * 4   // money volume, log-scaled
  + log10(temporalAlignedCzk) * 3           // money inside the role window
  + alignFrac * 8                           // fraction of money in-window
  + (triangle ? 12 : 0)                     // accountability triangle
  + Math.min(nearThresholdCount, 5) * 2     // near-threshold clustering, capped
  + (donatedToPartyCzk ? 4 : 0))            // party-donation dimension
  + (tieClass === "owner-operator" ? 10 : 0)
  + (absenteeManagerLead ? 6 : 0);          // cross-case flag — NOT class-scaled
```

Every element of the technique is visible: log-scaled money so magnitude
steps not linear amounts move rank; the tie class as a *multiplier* (with
the inline rationale that an owner-operator private firm selling to the
state "is the real FollowTheMoney" while a steward seat is oversight); the
accountability triangle — one entity holding contracts AND subsidies AND
party donations — as the largest single bonus (12); the near-threshold
cluster bonus capped at 5 instances; and the cross-case flag added
*outside* the class weight because it is evidence of a different kind.
Rounding to two decimals is part of the formula.

## Review order: `reviewTier` + `reviewRank`

`reviewTypes.ts:325-365` implements trust-before-money. The batch-005
comment states the doctrine: "Corroboration ('is this MP really tied to
this company, per ARES VR') gates trust BEFORE money gates urgency — an
unconfirmed 500M-CZK tie is not yet known to be real, so it must not
out-rank a confirmed 5M-CZK one." `reviewTier` (lines 338-343) returns 0-3:
confirmed owner-operators, confirmed managers, confirmed stewards, then
*everything* non-confirmed last regardless of money. `reviewRank` (lines
356-365) packs both into one ascending sort key —
`tier * 1e12 + (1e12 - money)` — where the `REVIEW_RANK_MONEY_CAP` constant
carries its own justification (population total ~19.8bn CZK, no tie nears
1e12), so the tier term mathematically cannot interleave with money. The
offline triage (`triage.ts:206-211`) imports the same `reviewRank`. When a
stored rank's inputs have drifted, `ResolvedReviewOrder`
(`reviewTypes.ts:367-377`) recomputes and reports the origin as
`stale-recomputed` — divergence counted, never hidden.

## Evidence completeness: the tripwire ordering

`lib/analysis/tripwires.ts:9-25` orders pattern-derived watchlist
candidates by "ÚPLNOST DŮKAZŮ (evidence completeness), ne 'závažnost'" —
completeness, not severity: "the tripwire does not say what is worse — it
says where the reviewer has the most material in hand." The score is a
deterministic sum of declared parts (`EVIDENCE_PARTS`) whose decomposition
renders beside each candidate, and the whole surface is gated to the
internal `/admin` area with "requires human verification" framing and a
deep link into the verification console — the triage number never reaches
public copy, exactly the boundary the technique's "when not to use it"
draws.

## The upward lesson

The repo's structure teaches the technique's core claim physically: the
three orderings live in three functions with three names, and the surfaces
that consume them cannot accidentally swap one for another because each
answers a differently-typed question (a float score, a 0-3 tier plus packed
rank key, an evidence-part sum). Where a lesser design would expose one
"risk score" column, this one made the question part of the type.
