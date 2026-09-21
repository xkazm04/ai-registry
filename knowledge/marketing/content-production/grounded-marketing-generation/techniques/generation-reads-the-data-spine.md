---
layer: technique
type: technique
subject: grounded-marketing-generation
technique: generation-reads-the-data-spine
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled, not-measured-is-not-zero]
shared_with: []
use_when: [assembling the grounding block for a marketing prompt, deciding whether a catalog or scan value may reach the model, adding a mined-lesson or performance block to a generator]
---

# Generation reads the data spine

A marketing generator is conditioned on a spine of the business's own data, assembled
before the prompt, handed to the model as fact, and containing nothing the business
did not record, measure or confirm. The model composes; it does not source. Every
slot in the spine has a known origin, a precedence rule against the other origins, a
cap, and a provenance bit.

## What the spine carries

1. **The offering.** Categories, offering names, the price band in one currency, item
   count, the nature of the business, its top differentiators and channels, and the
   instruction to stay inside this catalog. Sourced from the catalog the business
   saved, capped to the top few of each list.
2. **The audience and summary.** Who the business sells to and what it is, from the
   owner's own words or an applied website scan the owner accepted.
3. **Measured performance.** For social and editorial: the revenue trend over a
   recent window and the strongest channels by return, so the copy leans into what
   provably works; for ads: a compact "what works" block from the top published posts
   by reach. Empty string when nothing is measured - never a zero, never an example.
4. **Mined lessons.** The account's own winning patterns with their evidence, retrieved
   for relevance and diversity and re-checked against fresh data before they ground.
5. **The voice block.** Owned elsewhere; enters on the user prompt only.
6. **The provenance bit.** Whether this spine is the business's data or an illustrative
   dataset, decided by the caller who loaded it, and rendered as an instruction to
   write more generally when illustrative.

## Precedence and filtering

- **Recorded wins over inferred.** Where the catalog and a scan both know a value, the
  catalog's value is used verbatim; the scan fills only the gaps. For a scalar this is
  outright; for a list it is a top-up to the cap, deduplicated case-insensitively.
- **A sample catalog grounds nothing.** A project that has never saved a catalog is
  usually served an illustrative seed for its screens. That seed is not a fact about
  the tenant. When the catalog is the seed, the offering and keyword slots are filled
  from the scan profile as if the catalog were empty, and with no profile the model is
  told the business type, the brand and the localities and nothing it would have to
  invent around.
- **Placeholder values never ground.** A row the product wrote as a fill-me-in - a
  leading "sample", "demo", "example", "placeholder" marker in the product's own
  vocabulary, or a whole-string starter category name - is stripped whichever store it
  came from. The matcher is deliberately narrow (a leading marker, a non-letter after
  it, whole-string for the known starter names) so a real category that merely
  contains the word is untouched and a renamed row exits the filter the moment the
  tenant edits it. Ordinary words the starter also uses are *not* denylisted; that gap
  is why starter rows need real provenance rather than a longer list.
- **Unconfirmed competitors are excluded, not caveated.** A scan's competitor
  suggestions stay suggestions until the owner confirms them; the spine carries a
  "competitors unavailable" flag instead of the guesses.
- **Negatives are excluded from content grounding.** Keywords the business chose not
  to bid on do not become article topics.

## Decision rules

- When a spine slot has no measured value, omit the slot or hand an empty string;
  never a zero and never an example value, because the model will write the zero as a
  fact and the example as a claim
  ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
- When the loaded dataset is illustrative, set the bit at the call site and translate
  it into an instruction to generalise; do not rely on the model noticing round
  numbers ([provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled)).
- When a value's origin is the product itself rather than the business, filter it at
  the grounding boundary, because a caveat downstream of the prompt is already too
  late - the model has read it as fact.
- When a grounding block would be non-empty only because of a library the caller has
  not built (no patterns, no catalog), emit nothing, so the prompt stays byte-identical
  to the ungrounded path and the golden fingerprint holds.
- When mined lessons are retrieved, re-rank for diversity (a relevance-led trade-off;
  the 70/30 weighting is convention) and drop any pinned lesson fresh data now
  contradicts; a lesson the data cannot re-check is exempt rather than judged against
  demo figures, because a false contradiction hides a real crater.

## When not to use this

Do not build a spine for a generator whose job is to *ask* rather than to write - an
onboarding scan that proposes keywords and competitor suggestions produces candidates
for the owner to confirm, and is grounded on the public page, not on a catalog that
does not exist yet. Do not pass the spine to a step that only regroups the caller's
own input (a clustering step): its validator drops anything not in the input, and a
spine there is noise. Do not let the spine substitute for the voice profile; the voice
is a separate block with its own owner and maturity rules.
