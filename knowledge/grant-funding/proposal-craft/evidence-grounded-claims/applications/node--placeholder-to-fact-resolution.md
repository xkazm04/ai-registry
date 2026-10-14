---
layer: application
type: application
subject: evidence-grounded-claims
technique: placeholder-to-fact-resolution
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A cue that read the example, not the want

Source tree: the fleet's grant-writing platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 at `d9b6076` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `d3b42c8` on the project's `main`.

## What the tree already did right

The mapping is deterministic, ordered and returns nothing for an unmapped placeholder, exactly as
the technique asks, and the suggestion function returns the ledger fact or nothing, never a
value. The null path is tested. Two parts of the technique are not realized in the tree at all:
nothing outside the module and its tests calls the mapper (the offer-to-the-writer loop is open),
and a plural kind returns its first fact rather than all of them. Those are a task, not a seam
change, and were left alone.

## The seam, chosen to falsify "the mapping is conformant"

The cues were substring tests over the whole placeholder. The sibling application on this
subject documents that the drafting prompts make the model name the want and then append an
example, so the placeholder text now carries words that are not the want. The project keeps the
raw model output of its quality-gate harness: three result files, 157 placeholders, 64 distinct
spans. The mapper was run over all 64, with ground truth read from each span's content: none of
the 64 asks for an organization fact the ledger holds, so any mapping is a false positive.

Arm A mapped five of the 64, none correctly: "underserved verticals" read as people served (the
cue "served" inside a longer word), "reason, such as technical delays or budget reallocation"
and "actual amount" and "budgeted amount" read as annual revenue (an example's word, and a
period figure), and "corrective action ... second half of the year" read as the fiscal year (an
example's word). The first cue, a three-letter identifier test, would also have fired on any
word containing it. The cost is the failure the technique names: a sourced, confident figure
offered into the wrong blank.

## The paired proof

Arm B reads cues from the want clause only (the text before the first comma, semicolon,
parenthesis, "e.g." or "such as"), as whole words, and treats an actual, budgeted, spent,
remaining or balance qualifier as a period figure that is never the annual one.

| Measure | A | B |
| --- | --- | --- |
| distinct recorded placeholders mapped to a kind (all false) | 5 of 64 | 0 of 64 |
| existing mapping tests (served, amount, identifier, board, fiscal year, unmapped) | pass | pass |
| new test (the five false positives plus two positive and negative controls) | fails | passes |

**Floor**, declared before the run: every pre-existing mapping test unchanged, and the
whole-word rewrite must still map a plain "being served" blank. Both held; the fact-ledger
suite is 45 passing tests, and the project's pre-push gates passed.

## What the tree says about the technique

The technique says determinism is the point, and it is: a deterministic mapper still fabricates
when its cues are read against text the generator pads. The null answer is only as good as the
text the cues are allowed to see. This is the consumer-side half of the same fact that
`bracketed-placeholder-over-invention` records on the reader side: once the generator adds
examples, every reader of the placeholder must separate the want from the example.

## What this realization cannot do

The recorded outputs hold no blank that truly names a ledger fact, so recall (a real "insert
number served" blank still mapping) is covered only by the unit tests, not by live data. Two
cues remain loose and were not measured: a bare pound sign followed by a space reads as people
served even in "# of schools", and "funding" or "budget" alone reads as annual revenue even
where a program budget is meant. The unwired offer loop is the larger gap.
