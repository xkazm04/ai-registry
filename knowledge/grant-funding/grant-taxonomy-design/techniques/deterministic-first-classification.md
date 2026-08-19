---
layer: technique
type: technique
subject: grant-taxonomy-design
technique: deterministic-first-classification
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess]
shared_with: []
use_when: [building the classification pipeline for a funding corpus, deciding what work an LLM classifier should be allowed, a tagging pass must be re-runnable and auditable]
---

# Deterministic-first classification

The concern: who gets to assign taxonomy codes, in what order, and why. The
technique's claim is that a deterministic rulebook — keyword patterns over
the grant's own text — is the *privileged* classification layer, and every
probabilistic layer is subordinate to it, allowed only the rows the rulebook
could not decide.

## Why deterministic wins the first turn

- **Reproducible by construction.** Same input, same codes, forever. The
  whole corpus can be re-tagged on every rulebook change for the cost of a
  batch job, so classification quality is *iterable* — audit, adjust,
  re-run, diff. A model-tagged corpus can be re-run too, but at inference
  cost and without the guarantee that unchanged inputs keep their tags.
- **Auditable to the character.** Every tag traces to a specific pattern
  that fired on specific text. "Why is this grant tagged education?" has a
  one-line answer. That auditability is what lets false positives be found,
  measured, and suppressed as systematic classes rather than anecdotes.
- **Consistent at corpus scale.** A rulebook applies one judgment uniformly
  across a hundred thousand rows; a model applies a hundred thousand
  slightly different judgments. For a *taxonomy* — whose value is that codes
  mean the same thing everywhere — uniformity is worth more than per-row
  cleverness.

## Procedure

1. **Build one haystack per grant** from the fields that carry meaning:
   title, summary, eligibility text. Decode markup entities first — encoded
   dashes and ampersands leaking into titles silently break matching, and
   the failure is invisible because a non-match looks identical to a
   legitimate absence. Note which fields are *not* in the haystack (issuer
   name often is not); rules that assume otherwise fail silently.
2. **Write stem-based patterns, one rule per code.** Anchor the stem's start
   (word boundary before, none after) so plurals and derivations match —
   "school" must catch "schools", an education stem must catch
   "educational". Every stem is a hypothesis about corpus prose; treat it as
   one.
3. **Match all, then validate.** Collect every code whose pattern fires,
   then pass the set through the canonical keep-known filter (with
   migrations applied first). Rules never emit free text; they emit codes
   the vocabulary already owns.
4. **Order the pipeline: positive rules → suppressors → metadata fallbacks →
   model residual.** Each later stage sees only what earlier stages left
   undecided or flagged. The deterministic layers are hard gates over the
   model layer: the model never re-litigates a row the rulebook decided.
5. **Audit by slice, not by anecdote.** Sample each (source × code) cell and
   measure the mis-tag rate. The audits are where every real rulebook
   improvement comes from: missing stems (real signal words absent from a
   rule), over-broad stems (a stem matching inside longer words with
   different meaning — solved by negative lookahead on the offending
   suffixes), and genre mismatches between the rulebook's home corpus and a
   newly ingested source. Expect each new source to need its own audit pass;
   prose conventions differ by publisher.

## Decision rules

- **A rule earns its stem by precision on the actual corpus**, not by
  dictionary plausibility. One production sweep removed an "academ" stem
  because it matched research-award prose four times for every real
  education grant it caught (16% of the education slice mis-tagged); the
  gap it left was covered by other stems plus an issuer fallback, and the
  remainder was allowed to stay uncategorized. Removing a bad stem and
  accepting nulls beats keeping it for recall.
- **Weak buckets are marked as weak.** Some codes (a generic "research"
  stem) over-fire structurally because their words appear in every second
  grant. Order such rules last, and let downstream layers treat their
  solo presence as low-evidence — enrichable by a fallback rather than
  authoritative.
- **No default codes for content dimensions.** When no rule fires, the
  dimension stays empty. Empty is information: it routes the row to the
  fallback layers and, ultimately, counts the taxonomy's gaps. (A
  documented, universally-true default on a form dimension — most
  opportunities are project grants — is the tolerated exception.)
- **Comment every non-obvious pattern decision inline, with the measurement
  and date.** The rulebook is a decade-long argument with the corpus; an
  uncommented removal will be helpfully re-added by a future maintainer who
  rediscovers the recall gap but not the precision disaster.

## When NOT to use it

- As the *only* layer. A rulebook's ceiling is the language it was written
  against: non-English rows, hollow programme-code titles, and idiomatic
  phrasing are structurally beyond it. Budget for the fallback and residual
  layers from day one; a rulebook forced to cover everything degenerates
  into over-broad stems.
- For open-ended dimensions (free-text themes, emergent topics) where no
  closed vocabulary exists yet — deterministic rules presuppose the code
  set. Run discovery first; ruleify once the vocabulary stabilizes.
- When the corpus is tiny and hand-tagging is cheaper than rule
  maintenance. A rulebook is an investment repaid at re-run time.
