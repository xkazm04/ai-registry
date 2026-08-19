---
layer: technique
type: technique
subject: grant-taxonomy-design
technique: agency-and-programme-fallbacks
status: forged
laws: [honest-null-over-forced-guess]
shared_with: []
use_when: [a large share of a corpus is uncategorized despite good text rules, titles are bare programme names or reference codes, a source encodes sector in identifiers rather than prose]
---

# Agency and programme fallbacks

The concern: funding corpora carry rows whose *text* is hollow — a title
that is a bare programme name, an internal reference code, a boilerplate
formula — while their *structured metadata* is rich. The issuing agency is
essentially always populated and highly predictive: a grant from a national
health-research institute is a health grant even when its title is an opaque
funding-announcement code. Likewise, supranational and portal-driven sources
often encode the sector in the opportunity identifier itself — a programme
or cluster prefix that maps to a domain far more reliably than the title
copy. Fallbacks convert this metadata into sector evidence, filling the
uncategorized tail without guessing. One production audit found ~37% of a
national portal's rows uncategorized purely because their un-enriched titles
carried no sector word — and the issuer field decided nearly all of them.

## Procedure

1. **Build an issuer → sector map for *unambiguous* issuers only.** A
   health-research institute, an education ministry, an environmental
   regulator, a science-funding agency: institutions whose entire remit is
   one sector. First match wins; order specific patterns before general
   ones. Match on the issuer field itself, and remember which fields your
   text rules already cover — an issuer name absent from the text haystack
   means the map is the *only* path for that signal, so spell out full names
   as well as abbreviations (a production bug: an agency matched only by
   its acronym while the corpus spelled it out, silently orphaning its
   whole slice).
2. **Deliberately leave ambiguous issuers unmapped.** A ministry that funds
   both farming and rural health, a foreign ministry funding everything
   abroad, a defense department funding both weapons and medical research:
   mapping these forces wrong buckets. Their rows stay uncategorized —
   which is the honest state and the signal that the taxonomy or the rules
   need work. Write the omissions down as decisions, or a future maintainer
   will "complete" the map.
3. **Build a programme-code → sector map per source that encodes sector in
   identifiers.** Pattern-match on the identifier prefix; specific topic
   codes (a mission or health cluster) before general cluster codes. Unlike
   issuer maps, programme codes may legitimately map to *two* sectors when
   the programme genuinely straddles (a food-systems cluster spanning
   environment and agriculture).
4. **Blend conservatively with the text-derived codes.** The fallback rules
   of engagement, in order of text-evidence strength:
   - text found nothing → fallback fills the gap (its main job);
   - text found only a *weak* bucket (a generic research stem, which
     over-fires structurally) → enrich with the issuer's real domain
     alongside it;
   - text found a genuine sector → leave it untouched. The grant's own
     words outrank the issuer's average.
   Programme-code evidence is the exception: where a source's identifiers
   are authoritative by construction, merge them ahead of the blended text
   result rather than deferring to it.

## Decision rules

- **An issuer mapping earns its row by remit purity, not by frequency.**
  The question is never "what does this issuer usually fund" but "can this
  issuer fund anything outside this sector"; if yes, omit.
- **Fallbacks apply after suppressors.** Sense-suppression cleans the text
  evidence first; then the fallback sees an honest picture of what the text
  established. This also means a fallback can restore a sector a suppressor
  removed — correct, because issuer identity is stronger evidence than a
  polysemous word.
- **Keep maps per jurisdiction/source, not global.** Issuer names collide
  across countries and programme-code grammars are source-specific; a
  global map invites cross-source false matches.
- **Fallback tags are still vocabulary-validated.** Map outputs pass
  through the same migrate-then-keep-known filter as everything else.

## When NOT to use it

- When the issuer field is unreliable or free-text-entered by third
  parties — the technique's premise is that the metadata is *cleaner* than
  the prose; verify that before building on it.
- To override genuine text evidence. An issuer funds outside its core remit
  regularly enough that "issuer beats text" produces exactly the systematic
  mis-tags the honest-null posture exists to avoid.
- As a substitute for enrichment. If summaries can be fetched cheaply, a
  richer haystack fixes the root cause; fallbacks are for the residual
  where enrichment is unavailable or still hollow.
