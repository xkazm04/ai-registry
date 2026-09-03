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

## 2026-09-03 — [[2026-09-03-llmfit]] (intake `llmfit-0903`)

**The mechanics half.** The subject owned *what may leave* a contributor and *what the
hub may believe*, and had nothing on the plain mechanics of the contribution act — the
half that decides whether a federation has any contributions to reason about. A local
hardware-fit tool that pools user benchmarks as proposed changes to its own repository
supplied three: `content-addressed-contribution`, `capture-locally-publish-separately`,
`strict-ingestion-lenient-consumption`, plus a golden-path section before "The boundary
with cost metering".

Two of the three carry a boundary worth remembering:

- **Transport decides whether the first one applies.** Content-derived paths solve a
  problem that exists only when contributions are *proposed changes to a shared store*
  with no transaction around the several steps. A hub endpoint has no path to derive.
  tracklight is the endpoint case and already gates repeat pushes on a digest hash, so
  it confirms the idempotency property without needing the naming half.
- **The third one dissents from this subject's own symmetry.** The golden path says
  both ends re-apply every treatment. That covers the two ends of *admission*; a
  federation that later compiles pooled data into an artifact has a **third** stage,
  and there strictness must invert — not because the data deserves more trust, but
  because the party who pays for a refusal has changed from the contributor (present,
  able to fix) to every downstream consumer (absent, submitted nothing).

`hub-ingest-plausibility-gates` gained one amendment: a bound whose authority is the
**generator's own history** — no genuine payload predates the feature that produces
payloads — which is a different class from the arithmetic-internal rules it already
holds, and which pairs with rather than replaces the hub's receipt stamp.

**Applied, and it found a real gap.** `k-anonymity-cases-and-sources` states the case
floor and its disclosure in one paragraph; a consumer implemented the enforcement and
not the disclosure, and the two were three months apart. An enforcement clause is
executable and a disclosure clause is not — the half with a natural test wins. Fixed
in tracklight, `code`/`better`, `cargo test --workspace` green.

## Open leads

- **The peer-comparison lane was not run**, and tracklight is a genuine peer (it
  operates a federated benchmark network). The front-half check already found real
  convergence: its `aliases.rs` reaches the same conservative identity posture by a
  *different* argument — unwindability of a false merge in shared data, rather than
  the cost direction of a wrong match. Two independent routes to one rule is the
  strongest triage signal available and it is sitting unspent. Return: the next run
  touching this subject with fewer than two dispatches in flight.
- Where a technique pairs a **suppression** with an obligation to **count what it
  suppressed**, consider whether the count deserves naming as its own deliverable
  rather than as a clause beside the rule. One sighting; two more make it a rule.
