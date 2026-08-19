---
layer: technique
type: technique
subject: grant-matching
technique: diminishing-returns-keyword-overlap
status: forged
laws: [honest-null-over-forced-guess]
shared_with: []
use_when: [scoring mission or topical fit from keyword overlap, debugging why broad umbrella announcements outrank narrow fits]
---

# Diminishing-returns keyword overlap

The concern: the natural way to score topical fit — count how many of the
organization's mission keywords appear in the opportunity's text — has a
built-in inversion. Credit that grows linearly with hit count ranks the
document that mentions *everything* highest, and the document that mentions
everything is almost never the best fit: it is an umbrella program, a portal
digest, a multi-topic meta-announcement. Real fit shows up as a few strong,
independent signals; exhaustive coverage is a genre marker for breadth. The
technique is to make overlap credit **saturate**: steep for the first few
hits, nearly flat after.

## Procedure

1. **Build the keyword set as variants of a few concepts, not a long list of
   distinct concepts.** Include spelling and punctuation variants ("after
   school", "after-school") because matching is substring-level; but remember
   this inflates raw counts — one concept can hit three times. Saturation
   also absorbs this inflation.
2. **Count hits case-insensitively over the fields that describe the
   opportunity** (title + description). Zero hits scores zero — no floor
   credit for "could be related".
3. **Apply a saturating transform.** An exponential-approach curve,
   `max × (1 − e^(−hits / k))`, is the standard shape: with `k = 2` the first
   hit earns ~39% of the maximum, three hits ~78%, five ~92%, and the tenth
   hit adds almost nothing. Choose `k` so that the hit count you consider "a
   clearly on-mission document" (typically 3-5) lands near 80-90% of the
   maximum.
4. **Keep the matched terms, deduplicated on a normalized key** (strip
   spaces, hyphens, dashes) so variant pairs surface once. These terms are
   the evidence the explanation layer will cite; compute them alongside the
   score, from the identical matching rule, or the explanation will drift
   from the score.

## Decision rules

- **When a document hits an unusually large fraction of the keyword set,**
  treat that as weak evidence of a meta-document, not strong evidence of
  fit — the saturating curve does this automatically; resist "rewarding"
  high counts with a bonus.
- **When two keyword variants normalize to the same concept,** show one in
  explanations but let both count toward hits — the curve flattens the
  double-count; deduplicating *hits* (not just display) is extra precision
  you can add when counts drive anything beyond the saturated score.
- **When the keyword set grows past a dozen or two,** audit it for generic
  terms ("community", "program") that hit everything; a saturating curve
  cannot rescue a keyword set whose members are individually meaningless.
- **When there is no descriptive text at all,** score zero and let the
  verdict layer surface the absence — do not substitute funder name matching
  or guesswork.

## When NOT to use it

- When you have real semantic similarity available (embeddings over a corpus
  you trust): use it for ranking, but keep a saturating keyword lane as the
  explainable fallback — an embedding score can rank but cannot cite the
  three terms that matched.
- For eligibility-adjacent text checks (applicant-type phrases, geography
  names): those are gates or tiered credits, not accumulating hits, and
  saturation semantics would blur a pass/fail question.
- When hit counts are being used analytically (e.g. corpus statistics) rather
  than for ranking — report raw counts there; the transform is a ranking
  device, not a measurement.
