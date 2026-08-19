---
layer: technique
type: technique
subject: llm-forensic-gating
technique: prose-register-gates
status: forged
laws: [one-definition-one-import, incident-anchored-doctrine]
shared_with: []
use_when:
  - model prose renders verbatim to readers
  - internal identifiers, batch talk, or the wrong language leak into public copy
---

# Prose register gates

A register gate checks whether model prose is *publishable* — independent of
whether it is true. It exists because accuracy gates have a blind spot the
size of the whole product surface: a sentence can be factually correct,
schema-valid, fully cited, and still be a defect — because it is written in
the wrong language for every reader, because it carries a raw pipeline
identifier, because it cites the analyst's own batch machinery, or because it
scopes a superlative to a working sample the reader can never see. Measured
practice found entire batches in this state: dozens of verdicts perfect on
every accuracy dimension and rendering in the analysts' language rather than
the readers'; hundreds of true sentences carrying internal field names into
public profiles. Register is a first-class gate dimension, enforced
deterministically.

## Procedure

1. **Enumerate the jargon classes structurally, not as a token blacklist
   alone.** Internal identifiers have decidable shapes the reader's language
   does not produce: camel-case and snake-case tokens, property-value
   fragments ("flagged: false"), store addresses and cache paths, batch and
   pass references. Shape rules catch the class; named-token rules catch the
   residuals shapes cannot. Three batches of token-by-token whack-a-mole
   before the structural rules is the measured cost of doing it the other
   way around.
2. **Carry a verified allowlist next to each shape rule.** Real prose
   contains legitimate tokens the shapes match — e-government brand names
   with internal capitals, unit symbols. Grow the allowlist only by
   verifying a specific name, never by loosening the rule; and check *every*
   match against the allowlist, because letting the first allowlisted match
   short-circuit the rule makes the gate's verdict depend on word order.
3. **Detect language deterministically, with disjoint stopword sets.** No
   model call. Score against two closed lists of function words that exist in
   only one of the two languages — the ambiguous homographs score for neither
   side — because domain prose is dense with legal tokens of the other
   language, and a naive bag-of-words or diacritics test misclassifies it.
   Use a frequency threshold above a minimum token count and a stricter
   presence rule below it, with ties resolving against rendering.
4. **Gate at both doors from one definition.** Persist-time rejection keeps
   new violations out of the store; render-time withholding keeps the backlog
   already inside the store away from readers while a rewrite proceeds — and
   withholding is non-destructive: the original stays stored as ground truth,
   it simply does not ship, replaced by an honest placeholder saying the
   reader-facing version is pending. Both doors import the same rule module.
   A rule forked per door has been measured dropping content at one door
   that the other rendered.
5. **Anchor every rule to its incident.** Each rule carries the batch that
   produced it, what leaked, and how much. Rules with incidents attached
   resist the next tuning pass; rules stated as taste get relitigated and
   loosened.

## Decision rules

- **When a token is genuinely ambiguous, gate the decidable form only.** The
  same word can be a social benefit in one sentence and a batch id sentences
  later; gate the id-shaped occurrences (zero-padded digits, machinery
  head-nouns) and let a unit or currency suffix legitimize the rest. Encode
  the disambiguation; do not ban the word.
- **When composing another surface's rule set, audit each rule against this
  surface's corpus.** A sample-self-reference rule correct for cohort prose
  wrongly withholds legal prose where the same words denote a statutory
  group; compose with documented carve-outs, never verbatim.
- **When the gate starts withholding correct prose, treat it as a
  measurement failure of the gate.** One overbroad stopword flipped a
  measurable fraction of genuinely correct reviewer notes into withheld
  state. Precision failures are incidents too — log them, fix the rule, and
  keep the case as a regression fixture.
- **When matching a language with diacritics, do not trust ASCII word
  boundaries.** Word-boundary and word-class shortcuts silently stop at the
  first non-ASCII letter, making rules and allowlists dead without erroring.
  Use full Unicode letter classes; this lesson has been re-learned per rule.

## When not to use it

Do not run register gates over internal artifacts — analyst briefs, handoff
documents, review-queue notes meant for operators. Jargon is the correct
register there, and gating it teaches contributors to obfuscate the internal
record. Do not use the language gate as a translation trigger that machine-
translates failing prose in place: withhold-and-rewrite keeps authorship
honest; silent translation is repair, and repaired prose is prose nobody
wrote. And accept the gate's stated limit: it bounds register, not truth — a
polished, reader-language, jargon-free fabrication sails through, which is
exactly why the reference sweep and citation gates run beside it.
