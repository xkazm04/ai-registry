---
layer: technique
type: technique
subject: accountability-publishing-ethics
technique: lead-not-verdict-framing
status: forged
laws: [lead-not-finding, provenance-or-nothing, incident-anchored-doctrine]
shared_with: []
use_when: [an automated detector matches a named person, wording copy for machine-generated candidates, deciding whether a result may leave the internal review surface]
---

# Lead-not-verdict framing

Automated detection over public registries is good at exactly one thing:
noticing co-occurrence. A person and a firm in the same registry window, a
donation and a contract near each other in time, two bills sharing a clause.
Co-occurrence is a fact. A *substantive connection* — influence, favoritism,
coordination — is an inference no join can make, and asserting it about a
named person without human verification is the canonical defamation risk of
this domain. Lead-not-verdict framing is the discipline that keeps the two
apart: every machine output is a **candidate for human review**, and it is
framed, routed, and rendered as one until a human gate promotes it.

The technique is structural, not stylistic. A style rule ("write carefully")
fails silently the first time a new surface paraphrases an old candidate; a
structural rule makes the safe framing the only framing the pipeline can emit.

## The procedure

1. **Classify every output at its source.** The module that derives candidates
   stamps each with its rung: machine match vs human-verified finding. The
   rung is data, carried with the row — never re-derived by a rendering
   surface from context, because context is exactly what a copy-pasting
   maintainer loses.
2. **Gate the surface, not just the sentence.** Machine candidates render only
   on internal, access-gated review surfaces, each item carrying the explicit
   "requires human verification" framing and a direct link into the review
   console where promotion happens. The public surface renders verified
   findings only. If a candidate is useful context on a public page at all, it
   renders as a *flag* with the verification sentence in its own copy — the
   flag's copy carries the caveat, so no consuming surface can drop it.
3. **Make promotion a recorded act.** The only path from candidate to public
   finding is a human decision written to an append-only audit trail: who
   decided, when, what state (verified / rejected / needs-more). The decision
   record is the finding's provenance; a "verified" without a decision row is
   a bug, not a finding.
4. **Never publish the reviewer's worksheet.** The reviewer's free-text notes
   are working material — hypotheses, doubts, half-checked threads. The public
   entry renders gated, templated copy derived from the decision state; the
   note field is accepted on input and deliberately never copied to output.
   This is enforced in the derivation function, not by convention at call
   sites, because conventions have as many enforcement points as call sites.
5. **Say which review happened.** "Machine-checked" and "human-verified" are
   different claims and the copy states which one is true. A model reading a
   document is machine review; a confidence label emitted by a research agent
   is itself a claim to verify, not a verification.

## Decision rules

- **Coincidence may be stated; connection may not.** "Held a registry role at
  a firm that received contracts in the same period" is a fact with dates and
  sources. "Channeled contracts to his firm" is a verdict. When drafting
  candidate copy, the test is: could the sentence be true even if the human
  review ultimately rejects the tie? If not, it is a verdict wearing a
  candidate's badge.
- **The presumption of innocence is the default rung.** Professional codes
  require reporting to respect it on unadjudicated matters; here that means an
  unreviewed candidate has no public existence at all, and a rejected one
  leaves a public trace only as part of the published correction/decision
  ledger — where rejection is itself a symmetric, citable outcome.
- **Recompute, don't accumulate.** Where feasible, derive candidates fresh on
  every read instead of persisting a candidate table. A stored candidate is a
  liability that outlives its evidence: the registry row it matched may be
  corrected upstream while the stored flag keeps accusing.
- **When a rule keeps being violated, give it an observable output.** Framing
  discipline restated in review comments erodes; framing discipline enforced
  by a pure function with a test that feeds it a rejected tie and asserts no
  public copy is emitted does not.

## When not to use it

- Not for registry facts and deterministic figures — a dated contract or a
  computed rate is publishable as fact with its citation, and wrapping it in
  "candidate" language would falsely weaken it. The technique governs the
  inference layer, not the data layer.
- Not as a substitute for the human gate itself. Framing a verdict as a lead
  and then never staffing the review queue produces a platform that *implies*
  everything and *verifies* nothing — the caveat becomes a liability shield,
  which readers and courts both see through.
