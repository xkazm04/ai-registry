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

## 2026-09-10 — architecture re-review after the compression revert

The 2026-09-10 record above was written against documents that no longer exist: the
compression pass it dispositioned was reverted, and the bytes are back to their
pre-pass state. **I retract that entry's `documents` map wholesale for this subject.**
Its per-document reasons say things like "Repaired short-hash collision" and
"Repaired unknown cost becoming zero"; nothing was repaired, because the repairs were
reverted. Its overall `reverify` verdict also rested on a house style — "X is useful
but does not guarantee Y" — that is a restatement of every technique's own "when not
to use it" section rather than a finding. Read as a lead it was useful; read as a
decision it was wrong about the bytes.

I read all seventeen documents in full. This subject is in good shape and the
dominant disposition is `keep`. The two guarantees it holds apart — privacy from an
honest contribution, capture from a dishonest one — are carried consistently through
every technique, and the three mechanics techniques added in the 2026-09-03 intake
sit cleanly beside the original six rather than duplicating them. The
`strict-ingestion-lenient-consumption` dissent from the subject's own symmetry is
argued, not asserted, and its "who pays for a refusal" framing is the sharpest
sentence in the bundle.

Four documents carry claims I could not let stand as written.

**`bounded-contributor-influence` states an arithmetic fact without its
precondition.** "Only the largest element can breach the ceiling (two sources cannot
each hold more than half-plus), so clamping the maximum is sufficient and exact."
That holds for a share ceiling `s >= 0.5`. Below it — and the technique's own text
invites a reader to consider tighter caps before arguing against them — two or more
sources can each exceed `s`, and clamping only the maximum leaves the ceiling
breached. The rule needs its domain attached.

**`hub-ingest-plausibility-gates` applies its own laundering argument to counts and
not to scores.** It rejects an implausible count because "clamping a fabricated
number launders it into a credible one", then clamps a quality of 1.4 on a `[0,1]`
scale as "a rounding or serialization artifact". A value 40% outside the scale is not
float dust; the likeliest cause is a producer reporting a 0-10 rubric into a 0-1
field, and clamping it to 1.0 launders a scale error into a maximum score — the same
move the same document refuses one paragraph earlier. Float dust is `1.0000000000002`,
and the two cases deserve different handling.

**Percentile pooling is asserted and never specified.** The golden path lists
"latency percentiles pooled across runs" among the digest's aggregate measures and
`aggregate-only-digests` repeats it. Percentiles do not merge by averaging, and
nothing in the subject says what a hub does with several contributors' p95s. Every
other merged measure has a stated combination rule; this one does not.

**`cost-bucketing-side-channels` covers non-finite and non-positive costs and not
absent ones.** It maps degenerate inputs to zero "at this boundary" and explains why
that is safe, explicitly contrasting the internal null-never-zero rule. What it does
not say is what a contributor publishes for a bucket whose cost could not be computed
at all — the unpriced case that the sibling `llm-observability` subjects treat as the
central hazard. Silence there is the one place a reader could reasonably infer zero.

Sources: I read the W3C and NIST-adjacent material only where it bore on other
subjects in this group. For this one I resolved nothing external. The k-anonymity
technique's cell-size range ("published health-statistics practice puts minimum cell
sizes anywhere from 3 to 30") is a citation to a body of practice I did not open, so
it becomes `reverify` work rather than a confirmed claim; every other document's
external dependency is a pinned commit in a third-party tree that I did not clone and
did not rerun. The `python--fixed-task-vocabulary` executed evidence (the MLPerf
`TypeError` walk) and the `rust--k-anonymity-cases-and-sources` paired proof are
retained as historical records at their stated pins, unrerun and undated-forward.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/federated-benchmark-sharing",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:65e3f15c43a7b217",
  "disposition": "clarify",
  "coverage": "All 17 owned documents read in full at current bytes. Retracts the earlier 2026-09-10 record, whose document map described reverted content. Not evaluated: any third-party tree (mlcommons/inference @ b66003e, AlexsJones/llmfit @ 1e7bdb3) was neither cloned nor executed; the statistical-disclosure literature behind the case-floor range was not opened; no maturity or verified_on field was refreshed.",
  "counterexamples": [
    "A share ceiling of 0.3 lets three sources each hold 0.33; clamping only the largest leaves two contributors above the ceiling, so 'clamping the maximum is sufficient and exact' fails outside s >= 0.5.",
    "A producer reports a 0-10 rubric into the [0,1] quality field. The gate clamps 8.5 to 1.0 and admits the entry at maximum score - a scale error laundered into a credible measurement by the rule written for float dust.",
    "Three contributors submit p95 latencies of 400ms, 500ms and 5000ms. The subject requires the merged row to carry pooled latency percentiles and never says how; averaging them yields a number that is nobody's p95.",
    "A bucket's cost could not be computed because no model in it was priced. The technique says what to publish for a NaN and for a negative number, and nothing for an absent one.",
    "Two contributors independently measure the same public model on the same public benchmark and obtain byte-identical digests. Content addressing reads that as one contribution; it is two, and the source floor should have counted two."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/trace-context/",
      "result": "Read while checking a sibling subject; establishes nothing for this one. Recorded so the coverage claim is not read as broader than it is."
    },
    {
      "path": "knowledge/llm-observability/federation-and-surfaces/federated-benchmark-sharing",
      "result": "Every owned document read at current bytes; internal consistency between golden path, techniques and applications checked directly. Establishes what the documents say, not whether the third-party observations they cite still hold."
    }
  ],
  "documents": {
    "federated-benchmark-sharing.md": {
      "disposition": "clarify",
      "reason": "Lists 'latency percentiles pooled across runs' as a digest measure without a combination rule, while every other merged measure (case-weighted means, variance-backed intervals, between-source spread) has one stated. The rest of the golden path is sound and the privacy/capture split is the right organizing idea."
    },
    "techniques/aggregate-only-digests.md": {
      "disposition": "clarify",
      "reason": "Repeats the percentile-pooling claim from the golden path with no merge rule. Its own strongest rule - ship absence rather than a fabricated zero variance - is stated precisely, which makes the percentile silence stand out as an omission rather than a style."
    },
    "techniques/bounded-contributor-influence.md": {
      "disposition": "clarify",
      "reason": "'Only the largest element can breach the ceiling ... so clamping the maximum is sufficient and exact' is true only for a share ceiling of at least 0.5. The technique discusses tighter caps in the next paragraph without noting that the clamp's sufficiency argument does not survive them."
    },
    "techniques/capture-locally-publish-separately.md": {
      "disposition": "keep",
      "reason": "The timing rule, its three consequences and the ordering rule that keeps treatments on the way out are each argued from a concrete failure. The obligations it owes the contributor (backlog count, published record, prunable store) are the right three."
    },
    "techniques/content-addressed-contribution.md": {
      "disposition": "clarify",
      "reason": "Demands 'a duplicate that is detectable as a duplicate, not merely improbable' while specifying only 'a hash of the payload' with no digest-width floor - and its own application ships an 8-hex (32-bit) name. Detectability and improbability are the distinction the document itself draws; the width is what decides which one you get."
    },
    "techniques/cost-bucketing-side-channels.md": {
      "disposition": "clarify",
      "reason": "Handles non-finite and non-positive costs at the wire boundary and explains why zero is safe there, but says nothing about a bucket whose cost is absent. That is the one gap where a reader could infer the zero the sibling subjects spend three techniques forbidding."
    },
    "techniques/fixed-task-vocabulary.md": {
      "disposition": "keep",
      "reason": "The total-function contract, most-specific-first ordering, hint-is-still-classified rule and the catch-all-as-signal reading are all sound. The 'when not to use it' correctly identifies attributed consortia as the regime where the fingerprint argument evaporates."
    },
    "techniques/hub-ingest-plausibility-gates.md": {
      "disposition": "clarify",
      "reason": "Clamps a [0,1] overshoot of 1.4 as a rounding artifact while rejecting counts on the grounds that clamping launders a lie. A 40% overshoot is a scale error, not float dust, and clamping it admits a maximum score. Separate the dust band from the scale-error band. Everything else - the two refusals, the receipt stamp, the generator-history floor - holds."
    },
    "techniques/k-anonymity-cases-and-sources.md": {
      "disposition": "reverify",
      "reason": "The design content (two floors, two parties, the merge-floor-filter-count ordering against the isolation attack, suppression floors drop while display floors flag) is sound and I would keep it unchanged. The cell-size range attributed to published health-statistics practice was not checked against any primary source in this run; that citation is the unresolved evidence."
    },
    "techniques/strict-ingestion-lenient-consumption.md": {
      "disposition": "keep",
      "reason": "The 'who pays for a refusal' reframing earns the dissent from the subject's own both-ends symmetry, and the whole-store-not-the-change rule ships with its return condition. The gate-defect reading of a consumption-stage skip is the part most designs miss."
    },
    "applications/python--fixed-task-vocabulary.md": {
      "disposition": "keep",
      "reason": "A pinned, self-limiting record of an inverted trust model that runs the closure anyway, with the identity-fallthrough crash traced to a line. Retained as history at mlcommons/inference @ b66003e; not recloned, not rerun, and its findings are scoped to that round."
    },
    "applications/rust--bounded-contributor-influence.md": {
      "disposition": "keep",
      "reason": "Documents the 0.8 ceiling with its rationale quoted verbatim and both goal and non-goal tests named. It inherits the technique's missing precondition rather than introducing an error - at 0.8 the clamp-the-maximum argument is sound. Not rerun."
    },
    "applications/rust--capture-locally-publish-separately.md": {
      "disposition": "keep",
      "reason": "Unusually honest about being a partial realization: it states that the treatment rule has no occasion to be exercised in a named federation, so the ordering claim is untested there, and names the tree that would test it. Not rerun."
    },
    "applications/rust--content-addressed-contribution.md": {
      "disposition": "keep",
      "reason": "The 53-file single-proposal observation is the informative half and is reported as observed rather than quoted. Its negative section already bounds the technique's claim to retry safety rather than weight integrity. Not recloned; the 8-hex width is a finding against the technique, not against this record."
    },
    "applications/rust--hub-ingest-plausibility-gates.md": {
      "disposition": "keep",
      "reason": "One-function trust policy with each constant's justification quoted; the clamp-versus-reject line is stated where it executes. It reproduces the technique's score-clamping posture, which is where the finding belongs. Not rerun."
    },
    "applications/rust--k-anonymity-cases-and-sources.md": {
      "disposition": "keep",
      "reason": "A paired proof whose arms differ in exactly the claimed way, plus a load-bearing decision about what the count is not part of (the contribution hash) with a test pinning it. The closing lesson - an enforcement clause has a natural test and a disclosure clause does not - is the most transferable sentence in the subject. Not rerun; the 253-test count is retained as reported."
    },
    "applications/rust--strict-ingestion-lenient-consumption.md": {
      "disposition": "keep",
      "reason": "Two files with opposite failure policies over the same data, with the reason in the second one's comment, and the return condition for whole-store validation recorded where a slow CI job would be noticed. The missing skip counter is named as the gap. Not rerun."
    }
  }
}
```
