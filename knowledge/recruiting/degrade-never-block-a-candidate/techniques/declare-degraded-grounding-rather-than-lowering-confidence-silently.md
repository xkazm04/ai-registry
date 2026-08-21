---
layer: technique
type: technique
subject: degrade-never-block-a-candidate
technique: declare-degraded-grounding-rather-than-lowering-confidence-silently
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis]
use_when: [an evidence source is unreachable at assessment time, a document failed to parse, deciding how to express a weak basis on a scored surface]
---

# Declare degraded grounding rather than lowering confidence silently

## The concern

An assessment runs with part of its evidence missing — an attachment did not parse, an
enrichment source timed out, a retrieval step returned nothing, a capability the task
depended on was unavailable on the path that answered. The system still produces a
result, and it lowers the confidence value to reflect the thinner basis.

This feels like the responsible move. It is the most damaging one available, for a
reason that is entirely about where the number goes next.

A confidence value in a hiring system is rarely read as prose. It is a *ranking input*
and a *threshold input*. Lowering it does not tell anyone "we saw less of this person
this time" — it tells the sort order "this person is a weaker match", in exactly the
grammar that decides who appears above the fold. The operator's missing source has
been silently converted into the candidate's ranking penalty, and no reviewer will
ever attribute the lower position to its real cause, because the real cause was
encoded as the thing it is not.

It also collapses the distinction the domain is built on: *we looked and found less*
versus *we could not look*
([absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

## The rule

**Degraded grounding is a declared property of the result, not a discount on its
score.** The number expresses what was found in what was seen. A separate, explicit
flag expresses what could not be seen, names which source was missing, and travels
with the result.

The surface then renders lower confidence *because the flag is set* — which is a
different visual and a different call to action than a low score. A low score says
*this candidate matched poorly*. A grounding flag says *this reading is incomplete;
a person should look, or we should re-run when the source returns*.

## The procedure

1. **Enumerate the grounding sources a result depends on**, and record which of them
   were actually available at production time. The obligation to enumerate the
   evidence budget belongs to the inference-labelling sibling; this technique consumes
   that enumeration and adds the availability dimension.
2. **Declare the missing capability before the run where you can predict it.** If the
   path that will answer is known in advance to lack something the task depends on — a
   document input, a retrieval source, a structured-output mode — flag it up front or
   refuse the routing, rather than discovering the weakness when someone reads the
   result.
3. **Keep the score's semantics constant.** Whatever the flag says, the number means
   the same thing it always meant, computed over the evidence that arrived. Two
   candidates' scores stay comparable; their *completeness* is what differs, and that
   is what the flag carries
   ([a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
4. **Make ranking flag-aware, not score-adjusted.** Incomplete readings are not pushed
   down the list. They are marked, and where the surface supports it, surfaced for
   attention — an incomplete reading is a reason to look, not a reason to skip.
5. **Never let a flagged result drive an unattended adverse outcome.** A reading
   produced on partial grounding may hold; it may not reject.
6. **Make the flag actionable on recovery.** It names the missing source, so a sweep
   can find every result affected by one outage and recompute exactly those.
7. **Express it to the candidate as consequence, not vocabulary.** Internal surfaces
   get the flag; a candidate gets "a person is reviewing this step", never a technical
   grounding term.

## Decision rules

- **When evidence is missing, flag; when evidence is present and weak, score.** The
  distinction is whether the gap is on your side or in the candidate's record.
- **When a threshold would be crossed differently with the full evidence, do not
  evaluate the threshold at all** — hold. A borderline decision made on a known-partial
  basis is a decision made about your infrastructure.
- **When several results in a window share the same flag, treat it as a cohort event,
  not a set of individual notes.** One missing source across four hundred applications
  is a fairness incident requiring a recompute.
- **When a flag would be the only difference a candidate could see, keep it internal.**
  Candidate-facing honesty is about consequences and timelines, not about your source
  availability.
- **When you must choose between a flagged result and no result, prefer the flagged
  result** — provided nothing unattended acts on it. Silence is read as rejection.

## When not to use it

- **Where the missing source was never part of the instrument.** A source that is
  optional by design and absent for half of all candidates is not degradation; treating
  it as such makes the flag meaningless through overuse.
- **Where a validated model genuinely emits a calibrated uncertainty over a fixed
  input set.** That number is part of the instrument and belongs in the score's own
  semantics. The prohibition is on *retrofitting* a discount to stand in for missing
  inputs.
- **Where the surface has no way to express the flag.** Then the result does not go on
  that surface. An unexpressible flag becomes a silent discount by the back door,
  which is the failure this technique exists to prevent.
