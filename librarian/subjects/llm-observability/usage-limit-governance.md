---
subject: usage-limit-governance
domain: llm-observability
last_touched: 2026-09-10
touched_by: deepen
dry_streak: 0
---

# usage-limit-governance

First note. Forged from one observability tree; never swept before this pass.

## 2026-09-05 - /deepen batch (first pass; 7 techniques, 3 -> 4 applications)

Shape after: 7 techniques / 4 applications (rust x3, all one tree; process x1).
Every rust application now carries a runtime witness (the tree pins its toolchain
in a file CI reads). The tree split its limits module between 2026-08-20 and
2026-09-05; every citation was re-addressed, one quote withdrawn because the
sentence was deliberately removed upstream (an inline "future mode" superseded by
SDK pre-spend admission on 2026-09-02).

Held under counter-evidence: record-side cannot un-spend; advisory-lock over
serializable; deterministic shed; unpriceable refuses. Refuted or qualified: "only
inline prevents" (any pre-provider seat, each approximate; a provider's own docs
admit non-instantaneous enforcement); "no gameable edge" (no reset edge; the
neighbouring seats are calendar-aligned so the status surface must say which clock
it quotes); "tenants never block each other" (they share the lock pool); "wall clock
at ingest satisfies monotonicity" (named exceptions, clamp or document);
"overload control sheds probabilistically" (much of it; queue-delay regulators are
deterministic on sojourn time; the hashed admission-level precedent re-rolls its
hash hourly, which is the fairness warning for keying on identity).

Landed structure: a fourth enforcement seat (client-side, from the last published
proximity signal, with three honesty rules); a new section on the memory a window
cache keeps and the bounded two-bucket approximation with its published error
(0.003% wrong verdicts, 6% mean rate gap, one edge network, 2017).

Blind lane 7 of 11 reached by web/tree; blind-only were four internal
contradictions (golden path "only inline" vs the provider seat; "exempt from every
cap" vs the instrument's own preflight ceiling; the monotone shed set vacuous for
fresh ids; mean-vs-median tail sensitivity). One blind claim was refuted by the web
(sliding log is exact; the 2x burst is a fixed-window defect) and not landed.

Fleet: the two joined projects' contexts are all `unknown` locally; the 6 deviations
the scan counts are not readable from any map on this machine. Two candidate
projects realise nothing operator-side (one has inbound webhook limiting, which is
rate-limiting ground; one sets per-run ceilings on its own calls, the builder side
the golden path excludes).

Proposals (Director-held): hierarchical budgets with inheritance (org > workspace >
key) - provider-documented and gateway-standard; this subject's flat (window, scope)
ledgers do not compose; home ambiguous between dimension-scoped-caps and a new
subject. Burn-rate / time-to-breach alerting - check breach-alerting's
pre-breach-forecasting first. 429-vs-403 refusal split and the two-bucket counter
belong to software-engineering/rate-limiting.

Banked (return conditions): exact hard-stop retry-after from the contribution list
(a tree computes it instead of the 30/300/900s heuristic); a second SDK stack
application - the same pre-spend admission exists in the tree's typescript and
python clients, one read away; lock-pool sizing and clock clamp as two unwritten
assumptions in the rust application (the tree documents or fixes either).

Clocks: process application refresh_by 2026-12-05 (vendor landscape).
Saturation read: the counter-evidence lane returned mostly confirmations on the
core stance; the next pass targets the hierarchical-budget proposal and the second
SDK stack, not a re-refutation.

### Impact (registry map, regenerated 2026-09-05 after this landing)

tracklight 3 and personas 4 pairs, all `unknown`; no judged verdict, nothing stale.
First `/conform` on tracklight would be the demand read this subject lacks.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/usage-limit-governance",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:046f41303bf251c9",
  "disposition": "reverify",
  "coverage": "All 13 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Sequence ID 12 commits before ID 11; advancing a cache cursor to 12 can permanently miss the later commit of 11.",
    "Minting new IDs until a deterministic shed admits defeats stable retry identity.",
    "Ten concurrent calls admitted before any usage response can overshoot by ten calls, not one."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/economics-and-governance/usage-limit-governance",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy",
      "scope": "Primary policy confirms response-based accounting, streaming estimates, concurrent overshoot and independent gateway counters; wider provider survey not refreshed."
    }
  ],
  "documents": {
    "usage-limit-governance.md": {
      "disposition": "reverify",
      "reason": "Record-side rejection cannot prevent paid spend and can suppress its evidence; retain observed-spend accounting separately from recording admission. Calls and tokens also have evidence gaps. Serializable/atomic alternatives can be valid. Missing dimensions need an explicit edge policy, and quality apparatus needs its own bounded budget. Client freshness and hashed shedding do not establish hard caps."
    },
    "techniques/concurrent-admission-integrity.md": {
      "disposition": "reverify",
      "reason": "Atomic prospective accounting is sound. Serializable designs are not universally wrong and bounded lock queues can also overload. Advisory locks require all writers and suitable post-lock snapshots; hash collisions can couple tenants. Commit failure can be ambiguous, requiring idempotency/reconciliation rather than asserting nothing stored. Atomic scripts can enforce multiple counters with defined coherence."
    },
    "techniques/cost-evidence-and-imputation.md": {
      "disposition": "clarify",
      "reason": "Repaired window mean as uniquely correct/self-correcting evidence, client cost trust, token certainty and rejection of retrospective evidence. Distinguish advisory estimates from hard reservation bounds."
    },
    "techniques/dimension-scoped-caps.md": {
      "disposition": "reverify",
      "reason": "Named scope and authenticated attribution are useful. Missing tags can bypass scoped caps unless the edge requires them or applies a separate unknown policy. Two simple caps do not implement a model AND customer intersection. Opaque IDs avoid secret correlation, but random high-entropy token hashes are not generally dictionary reversible. Include rule identity/version when otherwise-identical policies need separate ledgers."
    },
    "techniques/enforcement-placement-and-reconciliation.md": {
      "disposition": "clarify",
      "reason": "Repaired one-call overshoot under concurrency, universal stream usage absence, fail-open/refusal TTL bounds and record-side loss. Reserve and reconcile with explicit uncertainty and in-flight exposure."
    },
    "techniques/graduated-throttle-with-deterministic-shed.md": {
      "disposition": "clarify",
      "reason": "Repaired fresh IDs on retries, public hash gaming and conditional rather than universal monotonicity. Distinguish admission lottery from idempotency and select retry timing from actual capacity policy."
    },
    "techniques/incremental-window-accounting.md": {
      "disposition": "clarify",
      "reason": "Repaired insertion sequence mistaken for commit order, mutation blindness, durable recovery ban and average approximation error sold as worst-case overshoot. Clock and cache coherence are explicit contracts."
    },
    "techniques/metric-window-threshold-action-model.md": {
      "disposition": "reverify",
      "reason": "Policy tuple is useful but calendars and short windows are legitimate. Zero can intentionally mean deny-all with defined semantics; NaN does not simply breach. Call/token measurement can be unknown. Warning and throttle thresholds may differ by design. Separate rejection evidence from admitted totals rather than forbidding all event storage, and bound quality spend under its own policy."
    },
    "applications/node--enforcement-placement-and-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Historical three-SDK probes retained, not rerun. Finite fixtures do not prove full parity. One next response is not a numerical overshoot bound without traffic, delay and delivery guarantees; active advertised wait is checked before TTL, so TTL does not bound every refusal. Zero-usage blocked markers must not count as provider calls."
    },
    "applications/process--enforcement-placement-and-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Dated provider/gateway survey retained. Primary APIM page confirms concurrency, per-gateway accounting, estimates and quota/rate distinction, not a one-call bound. Other rollout dates, provider ceilings, absent-feature survey and gateway imputation claims remain unrefreshed. Locking record admission does not solve unknown future provider usage."
    },
    "applications/rust--concurrent-admission-integrity.md": {
      "disposition": "reverify",
      "reason": "Historical Rust store implementation retained, not rerun. All writers must honor advisory locks, hash collisions can serialize projects, lock waits need bounds and commit outcomes can be ambiguous. SQLite process restriction is material; rowid loading and wall-clock monotonicity need validation. Discarded paid-event evidence cannot be reconciled from accepted totals alone."
    },
    "applications/rust--enforcement-placement-and-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Historical Rust SDK retained, not rerun. Scope-specific view replacing project-wide view can miss a simultaneously binding project cap. Retry wait before TTL contradicts universal refusal TTL bound; delayed/out-of-order responses and one binding rule can miss constraints. Record-side rejection does not charge rejected paid calls to accepted totals."
    },
    "applications/rust--graduated-throttle-with-deterministic-shed.md": {
      "disposition": "reverify",
      "reason": "Historical Rust throttle retained, not rerun. Separator is ambiguous if IDs can contain it; public FNV permits ticket search. Fixed-ID monotone tests do not prove rolling-pressure nonflapping or adversarial fairness. Fixed window hints are advisory, not actual next-capacity calculations; single reported rule may hide other constraints."
    }
  }
}
```
