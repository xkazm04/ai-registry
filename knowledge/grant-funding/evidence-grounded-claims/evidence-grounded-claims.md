---
layer: golden-path
type: golden-path
subject: evidence-grounded-claims
status: forged
use_when: [drafting or generating any funding-application narrative, wiring organizational documents into a drafting pipeline, reviewing a draft for invented statistics, deciding what a proposal may state as fact]
techniques:
  - verified-fact-ledger
  - document-fact-extraction
  - bracketed-placeholder-over-invention
  - ungrounded-statistic-detection
  - placeholder-to-fact-resolution
  - provenance-per-figure
---

# Evidence-grounded claims

A funding application is a claims document read by professional skeptics. A
program officer who catches one figure that cannot be sourced stops trusting
every other figure in the proposal; a government reviewer who catches one may
be looking at a false-statement problem, not a style problem. The subject of
evidence-grounded claims is the discipline that makes a fabricated figure
*structurally impossible* in a drafting pipeline — not merely discouraged by
an instruction — by controlling where numbers may come from, what happens
when no number exists, and how every stated figure is checked and traced.

The naive reading is "tell the writer (human or model) not to make things
up". That instruction is necessary and radically insufficient. Language
models fabricate statistics fluently and confidently, and the fabrications
are *plausible* — a sector-sounding percentage, a round beneficiary count, a
named partner that could exist. Plausibility is exactly what makes them
dangerous: nobody flags a number that looks right. The principal reading is
that grounding is an end-to-end pipeline property with five load-bearing
commitments, each of which fails independently if treated as optional.

## The authoritative number set

The first commitment: **the organization's own documents are the only
authoritative source of figures** — its tax filings, audited financials,
program evaluations, board rosters, annual reports. Not the drafting model's
world knowledge, not sector benchmarks remembered from training data, not
"typical" numbers for an organization of that size. A proposal's credibility
rests on figures the applicant can defend in a site visit or an audit, and
the applicant can only defend numbers that trace to their own records.

This inverts the usual generation posture. Instead of asking "what would
strengthen this narrative?" and finding a number to match, the pipeline asks
"what numbers do we *have*?" and builds the narrative around them. Facts are
extracted from uploaded documents into a typed, confidence-scored ledger
([document-fact-extraction](techniques/document-fact-extraction.md)), and the
ledger — not the documents, and not the model's memory — is what drafting
consumes ([verified-fact-ledger](techniques/verified-fact-ledger.md)). The
ledger is injected into every drafting step as an explicitly authoritative
block: use these exact values where they fit; state no other figure as fact;
never round or alter. Verbatim fidelity is part of the commitment — a figure
rounded "for readability" no longer matches the source document, and the
mismatch surfaces at exactly the moment trust matters most.

## The honest form of a missing number

The second commitment: **when a specific figure would strengthen the case
and none exists in the ledger, the draft emits a visible bracketed
placeholder, never an invented value**
([bracketed-placeholder-over-invention](techniques/bracketed-placeholder-over-invention.md)).
This is the single most counterintuitive rule for teams optimizing for
polished output. A draft studded with `[insert number served]` looks worse
than one with confident numbers — and is categorically safer, because a
blank the writer fills is recoverable while a wrong figure the applicant
signs becomes *their* false statement. Placeholders are the honest
anti-fabrication form: machine-detectable, impossible to miss in review, and
blockable at submission. The defect is never the placeholder; the defect is
submitting one.

Placeholders also create the pipeline's virtuous loop: each placeholder is a
typed request for a fact, and when the ledger later contains a fact of the
matching kind, the resolution step offers it — with its source — for the
writer to accept
([placeholder-to-fact-resolution](techniques/placeholder-to-fact-resolution.md)).
A placeholder whose kind cannot be determined is left alone; guessing a
value for an unmapped placeholder would re-create fabrication one step
downstream of where it was prevented.

## Grounding does not cure fabrication — it relocates it

The third commitment is the subject's hardest-won lesson, and it is a
measured one: **giving the model richer real data re-introduces
fabrication.** The intuitive theory — models invent numbers because they
have none, so supplying verified facts removes the motive — is wrong. A
model handed an organization's real outcomes will also invent *adjacent*
supporting statistics: a need-statement percentage that frames the real
outcome, a comparison figure that makes it shine. The real facts raise the
narrative's statistical register, and the model fills the register with
company. Grounding therefore never retires detection; the two are permanent
complements. Any pipeline that added grounding and then relaxed its
fabrication checks has re-opened the exact hole it thought it closed.

Detection itself must be scoped to stay useful
([ungrounded-statistic-detection](techniques/ungrounded-statistic-detection.md)).
Checking every numeral in a draft against the grounding floods review with
false positives — counts, dates, and dollar amounts legitimately recur and
recombine in prose. The high-precision deterministic check targets
**percentages stated as fact**: a percentage is almost always either a real
organizational or funder figure (in which case it appears in the grounding
and echoes cleanly) or a fabrication. A percentage in the draft that appears
nowhere in the verified grounding is the cardinal sin, caught by a check
that needs no model to run. Bracketed placeholders and the rhetorical
extremes are excluded — the honest form must never be punished, or writers
learn to avoid it.

## Every figure answers "says who?"

The fourth commitment: **provenance travels with the figure**
([provenance-per-figure](techniques/provenance-per-figure.md)). Each ledger
entry carries the document it came from, how it was extracted, and a
confidence grade. This is what converts drafting and review from data entry
into *review of sourced values*: the writer accepting a suggested fact sees
which file it came from; the reviewer questioning a number gets an answer
without an archaeology project; a figure whose source cannot be shown is
demoted from fact to candidate. Provenance is also the audit posture — the
people who read funded applications later (auditors, program officers at
renewal) ask exactly this question, and the pipeline that can answer it
per-figure is the one whose applicant survives the asking.

## Extraction is conservative by construction

The fifth commitment: **a fact is emitted only when the document actually
states it.** Extraction — whether deterministic pattern-matching or a model
pass over document text — prefers an empty result to a stretched one. The
highest-value facts for a narrative, measurable program outcomes, carry the
strictest rule: the metric and its number must *both* be present, because an
outcome without its number is an anecdote and a number without its metric is
noise. Confidence grades separate "stated explicitly" from "inferred" from
"uncertain", and uploaded documents are treated as untrusted text — they are
data to read, never instructions to follow, however they are phrased inside.

## Failure modes of the naive reading

- **Instruction-only grounding.** A "do not fabricate" clause with no
  ledger, no placeholder convention, and no detection. The model complies
  until the narrative needs a number, then fabricates fluently.
- **Grounding as cure.** Real facts wired in, checks retired — and the
  model invents adjacent supporting statistics around the real ones.
- **The everything-detector.** Every numeral checked against grounding;
  review drowns in false positives and the check is turned off.
- **Polish over honesty.** Placeholders treated as defects and suppressed;
  the model, forbidden the honest form, produces the dishonest one.
- **The helpful rounder.** Values "cleaned up" in drafting — rounded,
  reformatted, unit-shifted — until they no longer match the source
  document they must be defended from.
- **Resolution by guesswork.** Placeholders auto-filled by fuzzy matching
  or model inference rather than typed fact lookup; fabrication returns
  wearing the ledger's clothes.

## The techniques

- [verified-fact-ledger](techniques/verified-fact-ledger.md) — the typed,
  source-cited fact store that is the sole authoritative number set, and
  the contract for injecting it into drafting.
- [document-fact-extraction](techniques/document-fact-extraction.md) —
  conservative extraction of typed facts from the org's own documents:
  fact taxonomy, both-parts rules, confidence policy, untrusted input.
- [bracketed-placeholder-over-invention](techniques/bracketed-placeholder-over-invention.md) —
  the honest form of a missing figure, and why visible blanks beat
  plausible numbers.
- [ungrounded-statistic-detection](techniques/ungrounded-statistic-detection.md) —
  the deterministic echo check for statistics stated as fact, and the
  precision reasoning behind scoping it to percentages.
- [placeholder-to-fact-resolution](techniques/placeholder-to-fact-resolution.md) —
  closing the loop from placeholder to sourced fact without ever guessing.
- [provenance-per-figure](techniques/provenance-per-figure.md) — source,
  method, and confidence traveling with every figure from extraction to
  submitted narrative.
