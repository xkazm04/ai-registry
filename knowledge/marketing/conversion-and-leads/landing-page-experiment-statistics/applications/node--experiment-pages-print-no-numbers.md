---
layer: application
type: application
subject: landing-page-experiment-statistics
technique: experiment-pages-print-no-numbers
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# The arm schema forecloses numeric fields, but model prose still carried invented figures

Verified against the Czech adtech marketing workspace at commit `923406d7` on a
branch (2026-10-14), Node 24. The seam was chosen to falsify the claim "the hosted
experiment page already prints no numbers": the technique has seven steps, and the
tree met six of them structurally.

## What the tree already proved

- **No numeric field**: the arm payload is prose only (headline, intro, bullets, cta),
  and the publish door states there is deliberately no numeric field.
- **One address, noindex with links followed**: all arms live at one slug, the page
  metadata is `index:false, follow:true`, deliberately the opposite of the local page.
- **Bounded destination**: only a phone link, a mail link or a secure web address is
  accepted; script and data destinations are dropped.
- **Silent beacon**: the convert route answers one empty success for every outcome and
  counts only an arm id the published payload serves.
- **Significance-gated lessons**: pattern mining reads the gated `significant`
  predicate and carries uplift, confidence and visitor count.

## What it did not prove (the finding)

Step 2, "the copy invents no proof", was enforced by instruction alone. The prompt told
the model not to invent figures; the normalizer then passed the model's prose straight
into the arm copy, and the publish door bounded only length. A model that wrote a
conversion rate or a satisfaction percentage published it to a public page. The
schema removes the field, not the sentence.

## A and B

Target: an unsupplied percentage figure in a headline, intro, bullet or call to action
reaches the published arm. Floor: a percentage the brand's own fact block or the
operator's seeds carry still passes, and the 4,100 existing unit tests that touch this
module stay green.

- A (before): the invented figure survived normalization in every field and the
  validator raised no objection (two new tests failed).
- B (after): a field with an unsupplied percentage falls to the deterministic floor
  for that field, an offending bullet is dropped, and the validator asks for one
  re-draft. A figure present in the request is treated as supplied. Both new tests pass.

Scope was deliberately narrow: percentage figures only, because they are unambiguous
in the copy this page carries. Customer counts, ratings and deadlines remain
instruction-only; a regex over those would collide with prices and opening hours.
