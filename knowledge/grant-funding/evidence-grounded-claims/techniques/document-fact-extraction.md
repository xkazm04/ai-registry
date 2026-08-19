---
layer: technique
type: technique
subject: evidence-grounded-claims
technique: document-fact-extraction
status: forged
laws: [never-fabricate-a-figure, honest-null-over-forced-guess, untrusted-text-is-data]
shared_with: []
use_when: [pulling typed facts out of uploaded organizational documents, designing an extraction prompt for financial or program documents, choosing between deterministic and model extraction]
---

# Document fact extraction

Extraction is where the authoritative number set is born, so its failure
mode is the worst one available: a fact that was never in the document,
now wearing the ledger's authority. The technique is conservative
extraction — deterministic patterns first, a model pass second, both bound
by the same rule: **emit a fact only when the document states it; return
nothing rather than stretch.**

## Two extractors over the same text

- **The deterministic floor.** Cheap pattern matching for facts with
  canonical written forms: a registration identifier with a fixed digit
  shape, a dollar amount adjacent to a revenue cue, a count next to a
  beneficiary noun, a board size, a fiscal year. It runs on every
  document, costs nothing, and cannot hallucinate — its worst case is a
  miss or a mis-anchored match, both graded down by confidence. Heuristic
  before model: where a regex can read the figure, a model should not be
  asked to.
- **The model pass.** Reaches what patterns cannot: figures phrased in
  prose, tables flattened to text, narrative outcome statements. It runs
  over the *same* extracted text and enriches the same ledger, emitting
  the same typed shape. The model is given the closed kind taxonomy, the
  cardinality rules, and the anti-fabrication clause — and its output goes
  through a defensive parser that validates every item against the kind
  set, enforces per-kind caps, and degrades to the deterministic facts
  alone when the response is junk. A parser that throws on malformed
  output turns one bad completion into a lost document; a parser that
  accepts unvalidated output turns one bad completion into a poisoned
  ledger.

## The rules that keep extraction honest

- **Both parts or nothing.** The highest-value kind — a measurable program
  outcome — requires the metric AND its number together ("reading
  proficiency +14 points" with the assessment named, not "students
  improved" and not a bare "+14"). An outcome missing either half is not
  extracted; half-facts are how anecdotes get promoted to statistics.
- **Values verbatim.** Keep the value exactly as written — currency
  symbols, percent signs, commas, the assessment name, the sample size.
  Extraction quotes; it never normalizes, rounds, or converts. The
  qualifying detail is not decoration: "n=388" is part of what makes the
  figure defensible.
- **Distinct outcomes stay distinct.** An org with a reading outcome and a
  math outcome has two facts, not one blended claim. Plural kinds accept
  several entries each, under a cap; singular kinds keep one.
- **Confidence is graded, not assumed.** Stated explicitly → high;
  inferred from context → medium; uncertain → low. The grade travels with
  the fact and shapes how downstream steps present it — a low-confidence
  fiscal year is a suggestion to confirm, not a value to auto-fill.
- **An empty result is a valid result.** A document that supports none of
  the kinds yields an empty set. No minimum-yield pressure, ever:
  extraction quotas are fabrication quotas.

## The document is untrusted

Uploaded files carry whatever their authors — or whoever crafted them —
put there, including text addressed to the extraction model. Document text
enters the prompt delimited as untrusted data, with forged delimiters
stripped at the boundary so the document cannot close its own block and
smuggle instructions; the model is told explicitly that nothing inside the
markers may change its task or output format. This is not paranoia about
nonprofits: a pipeline that fills a truth ledger from user uploads is a
prompt-injection target *because* the ledger is trusted downstream. Cap
the text fed to the model — the facts worth having cluster in the parts a
sensible cap keeps, and an unbounded document is both a cost and an
attack surface.

## Decision rules

- When both extractors find the same kind, the explicitly stated value
  with source detail beats the pattern-matched fragment; confidence
  breaks ties, and a conflict neither grade resolves goes to the writer.
- When a pattern match is plausible but its anchor is weak (a year that
  might be a page artifact), emit with low confidence rather than
  suppressing — the grade exists so borderline reads can be surfaced
  honestly instead of decided silently.
- When the model returns kinds outside the taxonomy, drop them in the
  parser. Do not widen the taxonomy from the output side.

## When not to use

Do not point extraction at documents the organization did not produce or
adopt — a funder's call text or a sector report is not a source of *org*
facts, and extracting from it plants third-party numbers in the
first-party ledger. And do not use the model pass as a fallback for
unreadable inputs (failed text extraction, scanned images that yielded
garbage): a model asked to extract facts from noise will find some.
