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

## 2026-09-10 — architecture re-review after the compression revert

Second review on this date, against the reverted bytes (HEAD `44c8996`). All 13
owned documents read in full: the golden path, seven techniques, five
applications. Two primary sources were re-resolved this run; the LightTrack
tree the applications cite is on this machine as `C:/Users/kazda/kiro/tracklight`
and six of its cited seams were opened directly.

**Retraction.** The earlier 2026-09-10 record on this note assigned `reverify`
to nine of thirteen documents and `clarify` to four, and described "4
document(s) repaired". Those repairs no longer exist — they were part of the
compression pass reverted on 2026-09-10 — and, more importantly, most of the
qualifications that record demanded are already present in the reverted text it
was measuring against. Three examples, each checkable in the current bytes:
"serializable designs are not universally wrong" is the argument
`concurrent-admission-integrity` already makes (it concedes serializable "is
enough" and rejects it on burst-latency grounds, with a "when the section is not
worth it" section conceding the advisory case); "one-call overshoot under
concurrency" is stated by `enforcement-placement-and-reconciliation`'s
enforce-on-actuals bullet in exactly those words; "fresh IDs on retries" is the
`graduated-throttle-with-deterministic-shed` monotonicity paragraph's own
caveat. That record's blanket `reverify` is retracted. It is retained above as
history; it should not be read as an outstanding work list.

**Sources checked (read, not executed).** The Azure API Management
`llm-token-limit` policy reference confirms, verbatim, all five properties the
`process--enforcement-placement-and-reconciliation` application attributes to
it: prompts sent to the backend when the limit is exceeded with blocking
detected from the response; concurrent or near-concurrent requests temporarily
exceeding the configured limit; per-gateway tracking that "doesn't aggregate
token counts across the entire instance"; streaming forcing estimation of both
sides with images over-counted at 1200 tokens; and the 429/403 split between a
rate breach and an exhausted quota. The v2-tier token-bucket-vs-sliding-window
claim and the UTC-truncated fixed quota window are also confirmed on that page.
The OpenAI "Spend limits" guide confirms the organization-vs-project scoping
sentence, the `organization_spend_limit_exceeded` / `project_spend_limit_exceeded`
429 codes, "Enforcement is not instantaneous… recorded spend can slightly exceed
the configured amount", and "Spend alerts do not enforce a cap". Nothing in
either source contradicted the corpus.

**Tree checks.** `crates/store-pg/src/admission.rs` carries the advisory-lock
rationale and `pg_advisory_xact_lock(hashtextextended($1, 0))`;
`crates/core/src/limits/status.rs` carries `shed_ticket` with the hand-written
FNV-1a, the `\x1f` separator and the SplitMix64 finisher. Line numbers have
drifted a few lines since the 2026-09-05 verification (the tree is at `d398835`
now), which is drift, not defect.

**The one finding that would justify a content change.** The node application's
closing section is stale prose. It says the technique's text "is consistent with
the finding but does not yet say it" and names "the correction owed" — but the
technique's client-side bullet now carries exactly that sentence (staleness
bounds the refusal, not the spend; spend bounded by the next response, and by
the provider ceiling alone when unreachable), and the rust sibling has been
amended to match, crediting this very application. Both owed items are
discharged; only the application still describes them as owed. Separately, the
tree has landed the paragraph the application says it landed —
`clients/README.md:153-159` states the worst case under "It fails open" — so the
measurable is closed too. The application should say the corrections landed
rather than that they are owed.

**Boundary gaps worth naming, below the bar for a rewrite.**
`concurrent-admission-integrity` requires "a stable hash of the tenant
identifier" as the lock key and does not say what happens when two tenants
collide in a 64-bit advisory-lock key space; the consequence is latency, not
lost enforcement, but the document is silent where the rust application had to
be explicit. And the golden path's exemption section ("exempt from every cap")
sits beside its own "exempt is not unbounded" sentence; the pairing is correct
but a skimming reader takes the first half.

**Not evaluated.** No runtime witness: no cargo build, no test run, no A/B
re-execution of the three-SDK admission probes. The 2026-09-05 `ab_verdict:
better` on the node application rests on measurements this review did not rerun.
The dated provider survey's non-Azure, non-OpenAI rows (Anthropic workspace
caps, Bedrock, Google Cloud spend-cap budgets) were not re-resolved; its
`refresh_by: 2026-12-05` still governs.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/usage-limit-governance",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:eeec489bd0977863",
  "disposition": "keep",
  "coverage": "All 13 owned documents read in full against the reverted bytes. Two primary sources re-resolved by reading (Azure APIM llm-token-limit policy reference; OpenAI Spend limits guide). Six cited seams opened in the local tracklight tree. Not evaluated: any runtime witness (no build, no test run, no rerun of the three-SDK A/B), the non-Azure/non-OpenAI rows of the dated provider survey, and the fleet-consumer demand read the subject has never had.",
  "counterexamples": [
    "Two tenants whose identifiers collide in the 64-bit advisory-lock key space serialize against each other; the technique promises 'different tenants do not block each other on the lock itself' and names no collision case.",
    "A client that has never reached the server has no view at all, so the client-side seat admits everything until its first response — a bootstrap gap the rust application names and the technique's client-side bullet does not.",
    "An operator reading only the golden path's 'exempt from every cap' sentence, without the 'exempt is not unbounded' sentence two lines later, ships an unbounded scoring path."
  ],
  "sources": [
    {
      "url": "https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy",
      "result": "Read (not executed). Confirms verbatim: prompts sent to backend when the limit is exceeded with blocking detected from the response; concurrent requests temporarily exceeding the limit; per-gateway tracking with no instance-wide aggregation; streaming estimating both sides with images capped at 1200 tokens; 429 for a rate breach vs 403 for an exhausted quota; UTC-truncated fixed quota windows Hourly through Yearly; v2 tiers on a token bucket where classic tiers use a sliding window. Does not establish anything about non-Azure gateways or about a one-call overshoot bound."
    },
    {
      "url": "https://developers.openai.com/docs/guides/spend-limits",
      "result": "Read (not executed). Confirms verbatim the organization-vs-project scoping sentence, the 429 with organization_spend_limit_exceeded / project_spend_limit_exceeded, 'Enforcement is not instantaneous… recorded spend can slightly exceed the configured amount', 'Spend alerts do not enforce a cap', and reset with the next monthly cycle. Does not establish the broader error-type behaviour the application asserts about insufficient_quota."
    },
    {
      "path": "C:/Users/kazda/kiro/tracklight",
      "result": "Read at d398835. Confirms the advisory-lock rationale and pg_advisory_xact_lock(hashtextextended($1,0)) in crates/store-pg/src/admission.rs; shed_ticket's hand-written FNV-1a, \\x1f separator and SplitMix64 finisher in crates/core/src/limits/status.rs; and the worst-case paragraph at clients/README.md:153-159. Cited line numbers have drifted a few lines since 2026-09-05. Nothing was built or executed."
    }
  ],
  "documents": {
    "usage-limit-governance.md": {"disposition": "keep", "reason": "The honesty rule (record-side rejection cannot un-spend the provider call), the four-seat account and the seven consequences all hold against both primary sources. The exemption section pairs 'exempt from every cap' with 'exempt is not unbounded' in the same paragraph, which is correct; a skimming reader takes only the first half, but that is a reading hazard, not a wrong claim."},
    "techniques/concurrent-admission-integrity.md": {"disposition": "keep", "reason": "The argument is already conditional where the earlier record said it was absolute: serializable is conceded to be 'enough', rejected on burst-latency grounds, and the closing section concedes the advisory-only case where the lock is not worth taking. Silent on advisory-lock hash collisions between distinct tenants, whose consequence is latency rather than lost enforcement — a boundary gap, below the bar for a rewrite."},
    "techniques/cost-evidence-and-imputation.md": {"disposition": "keep", "reason": "The window-mean imputation states its three failure directions and its outlier sensitivity, and defends the mean against a median on recoverability-by-subtraction grounds rather than accuracy grounds. The unpriceable-refuses stance is presented as the subject's strictest decision with its own pressure valve. No claim here is contradicted by either source."},
    "techniques/dimension-scoped-caps.md": {"disposition": "keep", "reason": "The three matching rules and the absence-never-matches rule are stated with the cost of that honesty (untagged traffic is ungoverned, so the untagged bucket must be surfaced and driven down). The opaque-id-never-hash rule is a defensible posture even where a high-entropy token hash is not dictionary-reversible, because the id is also what the credential API already returns."},
    "techniques/enforcement-placement-and-reconciliation.md": {"disposition": "keep", "reason": "The client-side bullet already carries the correction the node application calls owed: staleness bounds the refusal, not the spend. The estimate-then-reconcile modes, the streaming debit-vs-cutoff posture and the seats-disagree section are all corroborated by the Azure page. The bootstrap gap (a client that has never reached the server) appears in the rust application but not here."},
    "techniques/graduated-throttle-with-deterministic-shed.md": {"disposition": "keep", "reason": "Monotonicity is already scoped to a fixed population of event ids, with the fresh-id case stated as a rising rate of refusal; the hash-pinning and avalanche rules are realized in the tree; the identity-keying fairness warning is carried with its DAGOR precedent. The public shed_ticket is a deliberate design choice (the SDKs need the server's own arithmetic), not an oversight."},
    "techniques/incremental-window-accounting.md": {"disposition": "keep", "reason": "The cursor rule, server-clock eviction, proven-not-asserted exactness, the declared coherence boundary and the memory the cache does not avoid are each stated with their assumption and its consequence. The two-bucket approximation's published error is quoted as a mean rate gap and then correctly re-read as a cap overshoot, not sold as a worst case."},
    "techniques/metric-window-threshold-action-model.md": {"disposition": "keep", "reason": "The four-part factoring, the write-time threshold validation, the three action tiers and the rejection ledger are internally consistent and match the tree. The rolling-vs-calendar choice is stated with the seats around it being calendar-aligned by design and the obligation to say which clock a surface quotes, which is the qualification the earlier record asked for."},
    "applications/node--enforcement-placement-and-reconciliation.md": {"disposition": "clarify", "reason": "The closing 'what the tree hands back' section is stale: it says the technique 'does not yet say' the correction and that the rust sibling 'should be amended', but the technique's client-side bullet now carries that exact sentence and the rust sibling has been amended to match, crediting this application. clients/README.md:153-159 in the tree also carries the paragraph this run says it landed. The A/B itself (0-of-3 vs 3-of-3 SDKs) was not rerun."},
    "applications/process--enforcement-placement-and-reconciliation.md": {"disposition": "keep", "reason": "Every claim attributed to the Azure APIM page was re-resolved against that page this run and matched verbatim, as did the OpenAI spend-limit sentences. The Anthropic, Azure OpenAI, Bedrock and Google Cloud rows were not re-resolved; the frontmatter refresh_by 2026-12-05 is the right instrument for them."},
    "applications/rust--concurrent-admission-integrity.md": {"disposition": "keep", "reason": "The advisory-lock seam was opened and matches. The document already names its two unwritten assumptions in the tree (the lock-memory pool it does not size, and the unconditioned 'never' on the clock) rather than presenting them as covered — which is the honest form. Nothing was built or run."},
    "applications/rust--enforcement-placement-and-reconciliation.md": {"disposition": "keep", "reason": "Carries the corrected bound (the TTL bounds over-prevention, not spend) with an explicit note that the first draft's sentence held in none of the three SDKs, plus the bootstrap gap the technique omits. clients/README.md now carries the operator-facing paragraph the document says was owed and then written."},
    "applications/rust--graduated-throttle-with-deterministic-shed.md": {"disposition": "keep", "reason": "shed_ticket's construction was opened and matches down to the separator and finisher. The document is explicit that the monotonicity test walks a fixed population and is therefore re-evaluation monotonicity, not a claim about a stream of fresh ids — the exact scope the technique states."}
  }
}
```
