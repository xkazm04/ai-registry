---
layer: technique
type: technique
subject: decision-audit-and-traceability
technique: capture-the-machine-verdict-before-a-human-overwrites-it
status: forged
laws: [no-adverse-outcome-is-solely-automated, every-decision-names-its-actor, a-predictor-cannot-grade-its-own-labels]
shared_with: []
use_when: [designing the write order of an assisted decision, proving meaningful human oversight, measuring override rates]
---

# Capture the machine verdict before a human overwrites it

## The concern

In an assisted pipeline the machine produces a recommendation and a person accepts,
changes or rejects it. The natural implementation writes one row and mutates it: the
recommendation lands, the human acts, the field is updated. The result is a record that
says a person decided — and destroys the only evidence that they decided anything at all,
because the thing they decided *against* no longer exists.

This is not a lost metric. It is a lost defence. Your claim is that no adverse outcome is
solely automated, per
[no adverse outcome is solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated).
The proof of that claim is a pair: what the machine said, and what the human did about it.
A single mutated field proves neither half.

The failure is stubbornly common because it looks like tidiness. One authoritative value
per decision feels clean. But an assisted decision is intrinsically two decisions by two
different actors, and collapsing them into one row is a modelling error that happens to
also be a compliance error.

## Procedure

**1. Seal the machine's verdict at the moment it is produced, as its own record.**
Actor: the automated process. Content: the verdict from the closed vocabulary, the score
or confidence, the rule and prompt versions, the decisive inputs. This record is written
before any surface shows the recommendation to a human — not after they act on it, and
not lazily on first render.

**2. Seal the human's action as a second record that references the first.**
Actor: the named person. Content: what they did (accepted, changed to X, rejected), the
reason code, and — this is the field people forget — *what they were shown*. A human who
accepted a recommendation accepted a specific rendering of it; if the surface later
changes what it displays, the record must still say what was on screen.

**3. Fix the ordering in code, not in convention.**
The rule is: the machine's verdict is sealed **before** the human's acceptance nulls,
supersedes, or replaces it. Where the two writes share a transaction, order them
explicitly and comment the ordering, because it reads like an arbitrary line and the next
person to refactor will reorder it for readability. This is the kind of ordering that is
correct for a reason no test will catch: both orders produce the same final state, and
only one of them produces a defensible history.

Watch for the specific shape this takes in most implementations: the machine's
recommendation lives in a *pending* field — an approval detail, a suggested action, a
queued verdict — and the act of deciding **clears that field**, because a pending
recommendation that has been acted on is no longer pending. Which means the resolution
destroys its own antecedent. The fix is a discipline about where you read from: take the
machine's verdict off the **pre-write snapshot** you already loaded to validate the
action, and seal it before the write that clears it. Where the pending detail is absent or
unreadable, seal nulls — a decision with no machine verdict behind it, such as a plain
manual move, is the normal case, not an error, and must not be recorded as one.

**4. Keep the machine's verdict when the human overrides — never delete, never edit.**
An override is a supersedence, not a correction. The superseded verdict stays visible in
the trail marked as superseded. A trail with no visible overrides is either a perfect
model or a lying store, and the reader will not assume the former.

**5. Make the override computable.**
Store the two verdicts in the same vocabulary so a comparison is a field equality, not a
text diff. This is what turns the pair into the metric every regulator asks for: the share
of machine recommendations a human changed.

## Decision rules

- **When the machine's output is adverse, seal it and route it to a human gate.** A model
  may *recommend* against a candidate; the machine-actionable route admits only the
  non-adverse outcomes, and anything else parks. The recommendation is still sealed — the
  record of what the machine wanted is exactly the evidence that a person, not the model,
  ended the candidate's process.
- **When a human reverses an earlier automated decision, the reversal seals to the
  reversing person** and never inherits the machine's actor, per
  [every decision names its actor](../../_laws.md#every-decision-names-its-actor).
- **When the machine did not run** — degraded, unavailable, skipped — seal that as a
  distinct state. "No machine verdict" and "machine said proceed" must never look alike;
  the first is an absence and the second is a claim.
- **When a batch is approved in one action**, the machine verdicts are per-person and were
  sealed earlier; the human record is one approval that enumerates the exact set. Do not
  synthesize a per-person human verdict that nobody individually made — that is a claim
  the record does not hold.

## The measurement, and its trap

Override rate is the headline number: of machine recommendations shown, how many did a
human change? Two readings of it, both necessary:

- **Near-zero override is not agreement, it is a finding.** Sustained rates under a
  percent, with per-item review times in seconds, describe rubber-stamping. The correct
  response is to fix the oversight step — fewer items, better context, sharper diffs — not
  to celebrate the model.
- **The override population is not a validation set.** The candidates a human rescued are
  exactly the candidates the model's errors are concentrated in, and grading the model on
  outcomes it caused is circular, per
  [a predictor cannot grade its own labels](../../_laws.md#a-predictor-cannot-grade-its-own-labels).
  Overrides tell you about the *oversight process*; measuring the model needs a clean arm,
  which belongs to the score-calibration seam.

## When not to use this

- **Where no human is in the loop by design** — a fully automated non-adverse routing step,
  say. Then there is one actor and one record, and inventing a second is fabrication. But
  check the premise: if the step can *ever* end a candidacy, it is not that step.
- **Where the machine output is not a verdict.** Enrichments, extractions and summaries are
  inputs to a decision, not decisions; they belong in the decisive-inputs snapshot, not as
  their own verdict records. Sealing every model call as a verdict dilutes the trail until
  the real verdicts cannot be found.
- **As a performance surveillance tool on recruiters.** The override record exists to prove
  the oversight was real. Repurposing it to score individual reviewers' agreement with the
  model creates pressure to agree, which destroys the very oversight the record documents.
