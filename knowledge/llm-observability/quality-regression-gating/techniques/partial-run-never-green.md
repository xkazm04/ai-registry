---
layer: technique
type: technique
subject: quality-regression-gating
technique: partial-run-never-green
status: forged
laws: [never-present-absence-as-an-answer, nullable-never-zero, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [a run can halt on a cost ceiling, an operator can cancel mid-run, deciding what a truncated eval result is allowed to claim]
---

# Partial run never green

A run that judged a fraction of its dataset knows nothing about the rest —
and the rest is not a random omission. Runs halt for structural reasons: a
cost ceiling trips partway through (and the expensive cases, often the hard
ones, are the ones that trip it), an operator cancels when something looks
wrong, a pre-flight refuses to start. In every one of those, the unjudged
remainder is correlated with exactly the conditions under which quality
problems live. Reading a partial run as "no regression detected → green"
converts *detection you did not perform* into *assurance you did not earn*.
The doctrine is one sentence: **a run that judged part of its dataset can
never be a green build** — it is unverified, a distinct state from passed
(unverified-vs-regressed-exit-states).

## Why halting must exist at all

The temptation is to avoid the problem by never halting — always finish
the run. But an eval run's cost is multiplicative: targets × cases ×
generation samples × judge calls, so an extra target or a higher sample
count multiplies the invoice, and the true cost used to be knowable only
after the fact. A responsible runner therefore spends by consent, twice:

- **Pre-flight**: before the first paid call, print the call counts and a
  cost estimate priced from the current price book. Models the book cannot
  price are *named*, and their share is shown as unpriced — making the
  figure an explicit lower bound ("≥"), never a false precision ("~").
  If the estimate exceeds the ceiling, refuse to start: an **aborted**
  run, cleanly, with the exact ceiling value that would allow it.
- **Live ceiling**: the same ceiling is checked during the run, at case
  boundaries, *before* spending — so a run whose real cost outruns the
  nominal estimate stops mid-flight instead of finishing the invoice.
  That stop produces the **partial** run this technique governs.

Halting is the honest behavior; the dishonesty would be letting the halted
result impersonate a complete one.

## Procedure

1. **Stamp the truncation into the artifact.** A halted run's status is
   `partial` — never `passed`, never silently `completed`. The per-target
   report carries the evidence: what halted it, how many cases were
   skipped versus planned, and what was actually spent.
2. **Make it loud on every surface.** The human-facing report gets an
   unmissable banner; the machine-facing status and the gate endpoint
   carry the same status. No surface may summarize a partial run without
   its partiality attached — the reader learns it from the payload, not
   from documentation.
3. **Gate it as unverified.** The pipeline exit for `partial`, `aborted`,
   and `cancelled` is the unverified code — the same as "no baseline" —
   because they share a meaning: no defensible verdict exists. A pipeline
   can choose to warn-and-proceed on unverified; it can never receive a
   partial run as exit 0.
4. **Report what was measured, honestly scoped.** The judged cases'
   scores are real data — show them, labelled as covering n of N cases.
   What is forbidden is aggregating them into the run-level verdict slot,
   where they would speak for cases they never saw.

## Decision rules

- **Skipped is not zero.** A skipped case contributes no score; averaging
  it as zero manufactures a regression, dropping it silently manufactures
  a pass on a smaller, easier denominator. It is a disclosed absence,
  counted beside every aggregate it was excluded from.
- **All truncation causes converge on one state.** Cost ceiling, operator
  cancel, pre-flight refusal, crash-with-partial-results — different
  causes, one verdict-class: unverified. Recording *which* cause is
  diagnostic metadata; letting any cause upgrade to green or downgrade to
  regressed is a category error in both directions — a partial run is not
  evidence of harm either, and hard-failing it as "regressed" teaches
  operators to raise ceilings until the guard never fires.
- **The ceiling is an operator ceiling on benchmark spend, per run.** Do
  not entangle it with the product's usage-limit machinery: the quality
  apparatus is governed by its own explicit consent mechanism, not by the
  caps that meter customer traffic.
- **When a partial run keeps recurring**, the fix is upstream — raise the
  ceiling deliberately, cut the case set deliberately, or cheapen the
  judge — never a gate that learns to accept partials.

## When not to use it

- A dataset *designed* to subsample (a rotating smoke suite that scores a
  documented random 10% each night) is complete with respect to its own
  declared plan — partiality is measured against the plan, not against
  the full corpus the plan deliberately excludes. The plan itself must be
  recorded with the run, or this exemption becomes the loophole.
- Per-case judge failures inside an otherwise complete run (a judge call
  that never parsed) are a different defect with their own disclosure —
  count them, report them beside the aggregate, and only escalate the run
  to unverified when their volume undermines the verdict.
