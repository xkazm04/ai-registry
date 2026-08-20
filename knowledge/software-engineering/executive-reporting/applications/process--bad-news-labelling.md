---
layer: application
type: application
subject: executive-reporting
technique: bad-news-labelling
stack: process
status: forged
---

# A reader's verdict as the change driver: heading rules in a board briefing

The document contract in `C:\Users\kazda\kiro\ascent` was not designed up
front. It was assembled defect by defect from acceptance-test sessions in
which a simulated executive reader was shown a real generated briefing and
asked what they concluded. Every rule in `src/lib/org/briefing.ts` carries the
verdict that produced it, in the code, next to the fix — which is what makes
this a `process` application rather than a `node` one: the artifact worth
copying is the loop, and the habit of recording the reader's sentence verbatim.

## The heading, not the filter

`valueRealizedHeading` (`:75-90`) is four lines of code with fifteen lines of
provenance. The upstream `valueRealizedLine` (`:62-73`) pushes a points delta
sign-blind, so the live board export printed *"Value this period: 1
recommendation completed · fleet −6 pts"* — a fleet regression under the word
"Value", on the artifact most likely to leave the building unedited.

The recorded verdict is the whole lesson, and it is a diagnosis rather than a
complaint: *"That is the tool not knowing which direction is good — and the
sign is right there in the variable."* The information needed to label
correctly was in scope at the site that printed the wrong label.

The fix returns `"Activity this period"` when the delta is negative and
`"Value this period"` otherwise. The comment states the constraint that ruled
out the easier option: *"The fix is a heading, not a filter: the regression is
still printed, in full, with its basis. G1 — a briefing may never become
quieter by hiding its own bad news; it may only stop mislabelling it."*

## The same loop, three more rules

**Denominators.** `movementLine` (`:107-115`) exists because *"Of 2
repositories comparable across the period"* sat on the same page as *"6 of 6
repositories scanned"* with nothing saying the 2 was a subset of the 6. The
recorded verdict: *"A board member does not need to know the word
'cohort-matched'; they need the page not to contradict itself."* The fix
appends the superset — `(of N scanned)` — to the narrower figure.
`nextMoveLine` (`:445-458`) applies the identical treatment to a fourth
unlabelled denominator on the same page, rendering `"3 of the 6 scanned
repositories"` rather than `"3 repositories"`.

**Suppressed comparisons say why.** `benchmarkCaption` (`:92-105`) once
printed the corpus size even when the percentile itself had been suppressed,
so a slide carried a headline tile reading *"PERCENTILE — vs 1 repos"*. The
verdict: *"'Versus one repo' is not a benchmark, it's an apology, and it's
sitting in a headline slot on a page with my org's name at the top."* The
caption now returns `"not enough peers to rank"` — the reason in place of the
number — with `"no corpus yet"` for the empty case, which is a different fact
and gets different words.

**A degradation caveat must not go silent at total degradation.**
`engineMixCaveat` (`:29-45`) previously required degraded *and* healthy inputs
to be present, so *"the most degraded possible quarter — 100% synthetic scores
— was the one case the honesty machinery stayed silent on."* Keying on
presence and escalating the wording from "some scores" to "all scores" is the
fix; the comment adds the general rule that a deployment wanting a clean read
*"should gate on an explicit config flag, not on the shape of the mix."*

## Disjointness under sparsity

`buildExecBriefing` (`:296-315`) partitions dimensions into strengths and
risks. Naive top-3/bottom-3 overlaps below six dimensions, listing the same
item as both. The implemented rule is the one the technique states: strengths
are capped at `Math.min(3, Math.ceil(dimSorted.length / 2))`, risks are drawn
from the non-strength remainder. On a rich population the behaviour is
unchanged; on a three-dimension population an obviously weak item is no longer
bucketed as a strength *while also* surfacing as the weakness.

## One ranked source, and no fallback

The `recommendations` field (`:204-215`) is annotated *"THE ONE RANKED SOURCE
for 'what to do next'"* — the same list the on-screen page, the export, and
the board document all read, so they name the same move. It replaced a
`risks[0] ?? security` heuristic that existed only in the export path and
that, on a small high-scoring population with an empty risks list, *"could
label a dimension the fleet's strongest as 'the fleet's weakest dimension'."*
The serializer at `:538-556` states the resolution without hedging: *"There is
no dimension fallback any more: no qualifying recommendation ⇒ no section."*
Runner-up items still print, but under `"Next-widest gaps:"` after the single
recommended move — ordered context, never a peer.

## The transferable process

1. Generate the real document from real data, for a real population — sparse
   and unhealthy populations included; every defect above appeared only on a
   small or degraded one.
2. Put it in front of a reader with the stakeholder's authority and no access
   to the system, and capture what they *concluded*, not what they disliked.
3. Record the sentence verbatim in the code at the site of the fix. The
   verdicts here are load-bearing: each names the mechanism, which is why the
   fixes generalized instead of patching one string.
4. Prefer the heading change, the reason line, and the omitted section over
   the filter, the hedge, and the fallback — in that order, every time.
