---
layer: technique
type: technique
subject: grant-taxonomy-design
technique: llm-residual-classification
status: forged
laws: [honest-null-over-forced-guess, untrusted-text-is-data]
shared_with: []
use_when: [a residual tail stays uncategorized after all deterministic layers, corpus rows carry non-English or idiomatic sector signal, deciding how to constrain an LLM classifier over a controlled vocabulary]
---

# LLM residual classification

The concern: after the rulebook, the suppressors, and the metadata fallbacks
have run, a residual remains — typically single-digit percent of a corpus —
whose sector signal is real but off every deterministic path: non-English
prose, idiomatic phrasing, meaning that requires actually reading. This is
the one job a language model is *allowed* in the classification stack, and
the technique is entirely about the constraints that keep it honest.

## The contract

- **Residuals only.** The model sees exactly the rows the deterministic
  layers left undecided. It never re-classifies a row a rule decided, and it
  never becomes the primary path — if the residual grows, the fix is more
  rules or fallbacks, not more model.
- **Exactly one code from the closed vocabulary, or null.** The prompt
  enumerates the legal codes; the parser validates the answer against the
  live code set and converts anything else — an invented code, a label
  instead of a code, prose — to null. The model cannot extend the taxonomy,
  by construction, because the validator sits between it and persistence.
- **Null is a first-class answer, and the prompt says why.** State the
  stakes in one sentence — a wrong category routes an opportunity away from
  the organizations it belongs to, so *a wrong guess is worse than an honest
  null* — and instruct the model to prefer null with low confidence over a
  weak guess. Models default to being helpful; the prompt must make
  abstention the helpful act.
- **Confidence-gated persistence.** The model self-reports confidence
  (clamped to 0–1 by the parser); a result is accepted only when the code is
  valid *and* confidence clears a threshold. Everything below stays
  "still uncategorized" — the same honest state it entered with.
- **Failure never fabricates.** An unparseable response, a transport error,
  a timeout: all resolve to a null-sector, zero-confidence, unaccepted
  result. The pipeline never throws mid-corpus and never converts an error
  into a tag.
- **Derived, never source.** Accepted codes persist as derived metadata —
  stamped with the taxonomy version and distinguishable from
  deterministic tags — and source fields are untouched. The corpus must
  never be fabricated into looking complete: a model tag is an annotation
  with provenance, not a fact about the grant.

## Procedure

1. **Ship the vocabulary as `code — label — hint`.** For every code whose
   *label alone* is ambiguous, add a one-line boundary hint saying what the
   code is and — crucially — what it is NOT ("generic research and
   innovation — NOT the small-business set-aside"; "jobs and workforce —
   NOT research *about* an economic topic"). The hints carry the boundary
   knowledge the audits earned; the label carries almost none of it.
2. **Encode the known traps as few-shot exemplars.** Keep the set small and
   high-signal: one exemplar per documented mistag class, each with the
   input, the correct code, and a one-line *why*. The exemplars that matter
   most are the boundary cases: the substring trap where one program
   acronym contains another, unrelated one (a clinical screening protocol
   whose acronym embeds a small-business programme's acronym — the exemplar
   teaches the model the containing string belongs to health); the
   "research about topic X belongs to X" case; the non-English row; the
   identifier-prefix-decides case; and at least one exemplar whose correct
   answer is **null** (boilerplate with no substantive signal), so
   abstention is demonstrated, not merely permitted.
3. **Give the model the strong fields.** Title, issuer, source identifier,
   a truncated summary — and tell it the issuer and identifier are strong
   signals. Grant text is untrusted third-party prose: it enters as
   delimited data the model classifies, never as instructions; length-cap
   it, and let nothing inside it change the task or the output contract.
4. **Demand a structured object** — code-or-null, confidence, short reason —
   and parse defensively. The reason field is for the human reviewing
   near-threshold results, and is capped, not trusted.
5. **Cache by input.** Residual classification is deterministic in intent —
   the same row should get the same code — so cache responses keyed on the
   prompt. This makes re-runs cheap and, usefully, makes the model layer
   behave a little more like the deterministic layers above it.

## Decision rules

- **Set the acceptance threshold empirically, starting strict.** Sample
  accepted results at a candidate threshold and measure agreement with a
  human read; lower it only when precision holds. A threshold defaulted to
  "whatever the model says" is no gate at all.
- **Route near-misses to review, not to the void.** Results with a valid
  code just under threshold are the best human-review queue the pipeline
  produces — pre-argued, with a reason attached.
- **When the model keeps assigning one missing concept, that is vocabulary
  feedback.** Recurring nulls with reasons pointing at the same unhoused
  theme are the same signal an uncategorized-audit gives: a code wants to
  exist. Feed it to the taxonomy process; do not loosen the model's leash.

## When NOT to use it

- On rows the deterministic layers already decided — re-judging them buys
  inconsistency at inference prices.
- When the residual is hollow rather than hard. A row with genuinely no
  signal (boilerplate, empty title) should stay null; running a model over
  it manufactures confidence out of nothing. Triage the residual first:
  enrichable rows get enrichment, signal-bearing rows get the model,
  hollow rows stay honest nulls.
- For multi-label dimensions where the deterministic layers already produce
  sets. The exactly-one-or-null contract is what makes validation and
  thresholding crisp; loosening it to "return all that apply" quietly
  reopens the guessing door.
