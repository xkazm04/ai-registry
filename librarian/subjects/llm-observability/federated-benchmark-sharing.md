---
subject: federated-benchmark-sharing
domain: llm-observability
last_touched: 2026-09-10
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

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/federated-benchmark-sharing",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:33873c1114f3a53d",
  "disposition": "reverify",
  "coverage": "All 17 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A three-source aggregate passes a floor of three, then a contributor filter leaves one source; the released subset must be gated again.",
    "Two independently measured identical aggregates have equal content hashes but are not necessarily duplicate measurements.",
    "An eight-hex-digit digest has only 32 bits and can collide.",
    "Unknown cost mapped to zero makes unpriced evidence appear free.",
    "A score of 1.4 on a declared zero-to-one scale is not ordinary floating-point dust."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/federation-and-surfaces/federated-benchmark-sharing",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://csrc.nist.gov/pubs/sp/800/188/final",
      "scope": "NIST abstract describes de-identification as disclosure-risk reduction requiring release-model assessment and re-identification studies; no claim that source-count floors guarantee anonymity. Historical external implementations not rerun."
    }
  ],
  "documents": {
    "federated-benchmark-sharing.md": {
      "disposition": "reverify",
      "reason": "Aggregate-only and closed vocabularies reduce disclosure but cannot guarantee anonymity or honest rankings. Stable contributor identifiers, model names and repeated releases permit linkage. Pooling percentiles is invalid without distributions; case weighting needs compatible tasks, rubric, judge and configurations. Floors must hold for the actual released population, and exact suppression counts can leak."
    },
    "techniques/aggregate-only-digests.md": {
      "disposition": "reverify",
      "reason": "An import boundary reduces accidental raw access but is not proof that leaks cannot occur. Aggregate tuples, identifiers and custom model names can disclose information. Percentiles cannot generally be merged by averaging; compatibility includes more than a local all-runs-pinned flag. Unsafe schema versions need retirement rather than indefinite acceptance."
    },
    "techniques/bounded-contributor-influence.md": {
      "disposition": "reverify",
      "reason": "The largest-weight clamp needs declared feasible cap and positive weights; for small caps another weight may exceed the cap after renormalization. Two-source caps can be meaningful. Receipt identities are not independent organizations and self-reported counts are not authenticated evidence. Weighted uncertainty requires an estimator, not merely reusing mean weights."
    },
    "techniques/capture-locally-publish-separately.md": {
      "disposition": "reverify",
      "reason": "Separate collection authorization and minimization from publication consent. Full durable local capture is not universally required or authorized; ephemeral previews can be legitimate. Retry must honor revoked consent, deletion and retention. Historical publishing observations do not establish these controls."
    },
    "techniques/content-addressed-contribution.md": {
      "disposition": "clarify",
      "reason": "Repaired short-hash collision, evidence identity versus content identity and retry canonicalization. Identical independent observations must not automatically collapse; a same-name different-payload collision is not proof of dishonesty."
    },
    "techniques/cost-bucketing-side-channels.md": {
      "disposition": "clarify",
      "reason": "Repaired unknown cost becoming zero, false precision comparison and anonymity guarantee. Whole tuples and successive releases remain inference channels."
    },
    "techniques/fixed-task-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Closed versioned task labels limit arbitrary identifiers but do not guarantee privacy or valid task comparability. Public attribution does not authorize disclosing private workloads. Unknown categories need explicit semantics; broad general buckets can hide different populations."
    },
    "techniques/hub-ingest-plausibility-gates.md": {
      "disposition": "clarify",
      "reason": "Repaired score clamping, policy limits versus impossibilities, timestamp meanings and model-version alias collapse. Sanitization establishes shape and policy compliance, not provenance or independent sources."
    },
    "techniques/k-anonymity-cases-and-sources.md": {
      "disposition": "clarify",
      "reason": "Repaired floor ordering and anonymous interpretation, repeated cases, source identity independence and suppression disclosure. Thresholds apply to actual released populations and are risk controls rather than formal anonymity."
    },
    "techniques/strict-ingestion-lenient-consumption.md": {
      "disposition": "reverify",
      "reason": "Lenient consumption needs visible coverage, minimum evidence and privacy floors after skipping; mandatory/security-critical artifacts may require refusal. A parse failure can be corruption or version mismatch, not necessarily a gate defect. Whole-store validation can burden unrelated contributors when legacy debt exists."
    },
    "applications/python--fixed-task-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Historical MLPerf commit/probes retained, not rerun. Fixed vocabulary supports grouping, not anonymity; attributed benchmark hardware does not exempt private data. Unknown bench/division behavior and counts are scoped to cited version. Coarse classification may invalidate pooled comparisons."
    },
    "applications/rust--bounded-contributor-influence.md": {
      "disposition": "reverify",
      "reason": "Historical Rust implementation retained, not rerun. The stated 0.8 cap works for its positive-weight example but does not authenticate million-case reports or independent source identities. Shared mean weights alone do not establish a valid confidence interval; the variance threshold is a policy assumption."
    },
    "applications/rust--capture-locally-publish-separately.md": {
      "disposition": "reverify",
      "reason": "Historical llmfit capture/publish structure retained, not rerun. Repository structure and README do not prove storage durability, permissions or complete state flow. Local full capture requires its own authorization and retention; public attribution is separate from publication consent."
    },
    "applications/rust--content-addressed-contribution.md": {
      "disposition": "reverify",
      "reason": "Historical llmfit naming/count observations retained, not rerun. Eight hexadecimal characters can collide; batch shape does not prove append behavior or incident absence. Naming convention is inconsistently described as enforced versus a failure, and content identity is not measurement identity."
    },
    "applications/rust--hub-ingest-plausibility-gates.md": {
      "disposition": "reverify",
      "reason": "Historical sanitization code retained, not rerun. Clamping 1.4 to 1 hides invalid data; received_at cannot establish measurement freshness. Dated model aliases may identify materially different targets. Reapply source floors if filtering changes contributors; exact held-back counts need audience-aware disclosure."
    },
    "applications/rust--k-anonymity-cases-and-sources.md": {
      "disposition": "reverify",
      "reason": "Historical paired proof and 253-test claim retained without rerun or maturity refresh. Local operator disclosure is useful but public exact suppression counts can leak. Empty data need not justify lowering a privacy floor. Equal surviving entries can be equal publication evidence despite distinct private observations."
    },
    "applications/rust--strict-ingestion-lenient-consumption.md": {
      "disposition": "reverify",
      "reason": "Historical strict-gate/lenient-build structure retained, not rerun. Warning counts alone do not expose missing coverage to downstream binary users; skip policy needs minimum coverage and protected-population checks. Full-store validation can shift pre-existing failures onto unrelated contributors; parse failures need diagnosis before blaming gate code."
    }
  }
}
```
