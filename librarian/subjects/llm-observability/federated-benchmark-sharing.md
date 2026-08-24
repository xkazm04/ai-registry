---
subject: federated-benchmark-sharing
domain: llm-observability
last_touched: 2026-08-23
touched_by: external-reconcile
dry_streak: 0
---

# federated-benchmark-sharing

First touch: [[2026-08-23-6]], external reconcile against
`mlcommons/inference` @ `b66003e` (MLPerf Inference round v6.1). Gained
`python--fixed-task-vocabulary` (uncovered); single-stack debt cleared. Hint
confirmed on the vocabulary branch; `aggregate-only-digests` deliberately NOT
bound - this tree REFUTES its foundation (raw per-sample logs are REQUIRED
evidence in a named federation), and a refutation-shaped binding deserves its
own worker, not a paragraph. Tree-repair note: Windows path-length aborted the
checkout mid-clone; the worker restored it with git checkout, minus 163
unrestorable sample paths, none needed.

## The sharpest sightings

- Upstream-reportable crash: an identity-fallthrough classifier plus dead
  alias-table targets (ssd-resnet34, llama3_1-405b still mapped onto models
  the round removed) -> unguarded TypeError aborts the whole submission walk,
  losing valid rows already found.
- Three answers to "unknown name" on three axes: scenario rejected with a
  message, division SILENTLY SKIPPED with no log line (a lossy-branch
  sighting), benchmark passed through as itself.

## Technique-edit candidates (single-sighted, banked)

- State the classifier contract as "range within the vocabulary", not
  "total"; the unit test asserts membership, not non-exception.
- New rule: an out-of-vocabulary value produces a stated outcome (mapped,
  clamped, or rejected-with-a-message) - never a silent skip.
- The alias table must be re-validated against its own round's member list;
  versioned in form only is the defect that crashed the checker.
- Pseudonymization is not coarsening (deterministic private system ids remain
  a perfect cross-round join key) - strengthens both k-anonymity and
  cost-bucketing techniques.

## Law-question sighting (director placed)

- A vocabulary's closure must be enforced at the place the vocabulary is
  consumed (MLPerf closes at argparse, at the loader, and nowhere at all,
  depending on the axis). First sighting; the convergence rule applies.

## Open leads

- aggregate-only-digests refutation-shaped second worker on this same pin.
- hub-ingest-plausibility-gates second stack: accuracy floors keyed to a
  public spec rather than to magnitude heuristics.
- submission_checker_old.py ships beside the new package - a vocabulary-drift
  risk worth one grep in a future pass.
