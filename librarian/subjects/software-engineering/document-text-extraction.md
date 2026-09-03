---
subject: document-text-extraction
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# document-text-extraction

Touched by [[2026-09-03-awesome-langchain]]. Gained `structure-saturation-guard`,
`escalation-adjudication` and `band-calibration-by-construction`;
`extraction-yield-bands` gained an aggregation section. The subject was four days old
and single-stack (rust) when this landed; the reference was an independent python tree.

## What the gap actually was

Three shapes, and the first is the interesting one. The subject was forged entirely
around text that is **missing**, and every instrument it owns ratios what was recovered
against what was there. A reader can also **invent** structure — a heading detector
calibrated from a per-region census, run on a page with no body text to be modal about,
promotes the whole page and scores at the top of the band set, because the characters
are all present and only their shape is wrong. The general rule, and the reason no
existing instrument could have caught it: **an over-production failure is invisible to
any measure whose denominator is the source.**

Second, escalation named a second reader and never said who adjudicates its result;
adjudicating on output volume selects *for* the failure mode of a reconstructive reader,
which wins on volume whether it is right or wrong. Third, nothing said how the numbers
separating the bands are chosen.

The aggregation amendment came from the same read: "a document's band is the worst of
its regions" serves the re-acquisition consumer and breaks a **document admission
gate** — a third consumer the technique never names, under which one bad page condemns
a four-hundred-page file.

## What a project then said about it

`escalation-adjudication` came back `better` against a real 141-bill corpus: 111
documents take the first tier and 59 of those *also* carry the second tier's markers, so
a majority reach the adjudicator with two candidate structures and the adjudicator has
no adjudication in it.

`structure-saturation-guard` came back `not-better` on the same corpus. The cut-point
never plateaus — 13% of the corpus demoted at 0.90, 50% at 0.80 — because the extracted
text is the whole document including a large non-operative tail, so the metric is
dominated by a document-boundary artefact rather than by saturation. The guard is not
wrong; it is downstream of a boundary decision that tree has not made. One bill flips
under every cut-point tried, and it is a real shipped defect that tree had closed with a
bespoke special case — so the idea holds where the instrument does not.

## Open

The saturation guard has no validated cut-point anywhere yet. Return when a tree
separates operative from non-operative text and the sweep can be re-run.
