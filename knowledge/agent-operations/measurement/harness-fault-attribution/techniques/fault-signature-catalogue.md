---
layer: technique
type: technique
subject: harness-fault-attribution
technique: fault-signature-catalogue
status: draft
laws: [the-harness-is-a-suspect-in-every-red, a-ceiling-is-a-measurement-boundary]
shared_with: []
use_when: [recognising a known environment fault quickly, building a triage aid for a fleet, deciding whether a failure shape has been seen before]
---

# Fault signature catalogue

The concern: environment faults repeat, but each one is investigated from scratch because
the previous investigation was recorded as a fix rather than as a *shape*. A catalogue of
signatures turns a multi-hour investigation into a recognition, and it is the fastest way
to stop a fleet attributing its own faults to models.

## The signatures worth cataloguing

- **Shared build state.** Symptom: a check fails intermittently across unrelated
  configurations, often referencing artefacts the run did not produce. Tell: the failure
  moves with concurrency, not with the model. Fix: per-run output directories.
- **A link into a real tree.** Symptom: a check reads or writes state the run never
  created; results depend on what a human did outside the bench. Tell: the same cell
  behaves differently on a quiet machine. Fix: no links; copy or install per run.
- **Missing setup.** Symptom: type-checks or imports fail for dependencies the repository
  clearly declares. Tell: running the declared environment step makes it green. Fix: order
  setup before the checks; never accept an abbreviated stage list.
- **Host clock anomalies.** Symptom: a duration exceeding the ceiling without a truncation
  flag, or a truncation at the exact moment a host woke. Tell: the times bracket a
  suspension. Fix: flag the duration as unusable; requeue the killed run.
- **Refusal-as-result.** Symptom: near-instant runs with no output and a success-shaped
  status. Tell: they cluster in a window and stop at a reset time. Fix: detect on message
  text; requeue.
- **Stale measurement.** Symptom: a fact present for later runs and absent for earlier ones,
  or two runs with identical behaviour scored differently. Tell: the harness changed
  between them. Fix: recompute from stored artefacts.
- **Hot-reload failure.** Symptom: a queue silently stops scoring or starts skipping jobs
  after an edit. Tell: the log has a reload error nobody read. Fix: guard the reload, log
  the failure loudly, and re-run what the queue lost.
- **Concurrent claim.** Symptom: two processes work the same cell, one archives or deletes
  what the other is reading. Tell: partially-written artefacts, vanishing directories. Fix:
  claim heuristics and a rule against touching a cell another process can reach.

## Using the catalogue

Each entry carries **symptom → tell → fix**, and every new fault is added in that shape
rather than as prose. Triage starts by matching the symptom; the tell is what confirms it
cheaply, before a full investigation.

## Decision rules

- **Add the entry when the fix lands**, while the tell is still known. A fix recorded
  without its symptom teaches nobody.
- **Keep the wrong hypotheses in the record.** The plausible-but-false explanation is part
  of the signature — the next triager will reach for it too, and knowing it was tested and
  failed is what stops the second wrong attribution.
- **Re-run the affected cells after every entry.** A catalogue that records faults without
  correcting the results they produced is documentation of a corpus nobody fixed.
