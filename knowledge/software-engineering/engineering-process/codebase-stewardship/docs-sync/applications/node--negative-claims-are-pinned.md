---
layer: application
type: application
subject: docs-sync
technique: negative-claims-are-pinned
stack: node
verified_on: 2026-09-04
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The product's central promise lived in one paragraph that no gate could read

A local-first desktop application with an unusually mature documentation gate
chain: a declared feature-to-document map, a checker that validates every glob
in it resolves, a per-turn hook that nags when coupled documentation was not
updated, a corpus-integrity census and an evidence checker — eleven checks in
one `check` chain.

Its landing page carries the sentence the whole product is sold on: *your
personas, prompts, and credentials never leave your machine unless you
explicitly send them; the only outbound traffic goes to the providers you
configure; no telemetry dashboards; no cloud account required.*

Nothing in that chain can see it, and nothing ever could. The claim is
**entirely negative**, so there is no telemetry module for the feature map to
point at — the whole content of the promise is that no such module exists. The
map cannot hold an entry, so the glob checker has nothing to validate and the
per-turn hook has nothing to match an edit against. All three are working
exactly as designed.

## The measurable, and both arms

**The number:** pinned boundary claims whose removal the gate chain detects.

The same mutation through both arms — the promise paragraph rewritten into a
plausible, benign-sounding replacement of the kind a marketing pass produces
(*"runs on your own hardware, so you get low latency and full control over
your workflows"*), which keeps the section heading, keeps the length, and drops
every commitment.

| Arm | Instrument | Detected |
| --- | --- | --- |
| A — the chain as it stood | the three prose-adjacent checks: the map-path checker, the corpus census, the evidence checker | **0 of 4** — all three exit 0 |
| B — the same mutation, with the pin | the same three, plus the new pin check | **4 of 4** — exit 1, each missing claim named |

**The falsifier was run rather than assumed.** Before concluding that no gate
reads the landing page, every reference to it across the scripts directory was
enumerated uncapped — seven files — and each one opened. All seven are prose in
a comment, a documentation cross-reference, or seed data for a workflow recipe.
None reads the file's content. The absence is established from the whole set,
not from a truncated grep.

## What the realization does that the source instance does not

The technique's admission ticket — *a pin proves a promise is stated, never
that it is true, so it carries the date a human established the truth* — is
enforced here rather than merely documented. The pin record requires a
`reviewed` date in ISO form and the checker **refuses** a pin without one,
exiting non-zero rather than counting it. Two of the eight tests cover exactly
that branch: an undated pin and a pin dated *"last spring"* both fail. The
tree this technique was read from has the pins and not the tickets, so its
suite guarantees the continuity of sentences whose truth was established
informally; this realization cannot reach that state without the check going
red.

Three further properties were built in from the technique's own failure list.
An empty pin set exits 2 rather than passing, because a gate with nothing to
check is not a green. A pinned document that does not exist is a failure, not a
skip, since a pin over a missing file fails open silently — the defect family
the project's own map-path checker was written for. And the headline prints the
skipped count even at zero, so a run that checked less is not green in the same
way as a run that checked everything.

## The structural fact

**The promise lives in exactly one document.** The scope enumeration this
technique asks for — which documents must carry the sentence, written down as a
list — came back as a list of one, across a landing page, a documentation
index, and a contributing guide.

That is the finding, and it was invisible before the technique demanded the
enumeration. A single editorial pass on a single paragraph removes the
product's entire privacy commitment, and the reader who arrives by any other
route never had it. The pin now defends the paragraph; it does not fix the
concentration, and the honest next change is to state the commitment where a
user actually meets it — which is a product decision this run does not own.

## What this cannot do

It proves the sentence is present, not that it is placed where anyone reads it,
and not that it is true. The substring check is satisfied wherever the text
appears in the file. And the forbidden-phrase sweep is a floor of four
phrasings chosen from the promise's own vocabulary — it will not catch a
telemetry disclosure written in words nobody anticipated, which is the
permanent condition of every denylist and the reason the record says to extend
it on each escape rather than trust it as a fence.
