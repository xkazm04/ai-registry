---
domain: llm-observability
subject: multi-provider-event-normalization
last_touched: 2026-09-10
---

# multi-provider-event-normalization

## 2026-08-28 - /harvest batch 1 + A/B evaluation

Landed: declared two-axis identity paragraph on `provider-family-matching`;
lists-resolve-names-not-shapes bullet + cost-attribute-stability currency
clause on `attribute-precedence-lists` (from the second major span
convention). A/B probe (spend-ledger identity/normalization design) returned
**impact-positive with caveats**, blind 9-6: declared-identity-first was
decisive, but the sender-cost-as-claim rule that also decided it pre-existed
in both arms' packs (arm variance, not the landing), and the landed shapes
clause did NOT transfer into either arm's answer - watch whether its wording
earns its place or needs sharpening at the next sweep.
Evaluation ledger: [[../../harvest/evaluations.md]].

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/multi-provider-event-normalization",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:e844695fb7461ff3",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two tenants can submit the same trace and span strings; deduplication must not cross tenant boundaries.",
    "Two spans in one trace with absent span IDs collapse if trace alone is used as the key.",
    "Inclusive input of 100 with 20 cache-write tokens must not price all 100 at base and add the 20-token write charge."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/telemetry-and-data/multi-provider-event-normalization",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://opentelemetry.io/docs/specs/otlp/",
      "scope": "Primary OTLP response and partial-success contract consulted; current GenAI attribute version matrix not fully refreshed."
    },
    {
      "url": "https://platform.claude.com/docs/en/about-claude/pricing",
      "scope": "Primary provider pricing page distinguishes hosting/geography pricing, refuting unconditional hosted-family price equivalence."
    }
  ],
  "documents": {
    "multi-provider-event-normalization.md": {
      "disposition": "reverify",
      "reason": "Normalize equivalent facts, preserving unknowns and provenance, but family substring identity is unsafe for billing and hosted prices can differ. OTLP response semantics are not arbitrary native per-item errors. Receipt-time admission cannot prevent already incurred spend. Current convention stability and exact rename claims need version-specific checks; retaining total usage is useful even without a split."
    },
    "techniques/attribute-precedence-lists.md": {
      "disposition": "reverify",
      "reason": "First present requires type/validity and conflict policy; latest name need not be correct or semantically identical under every instrumentation version. Request model and response model are distinct facts. Preserve bounded safe provenance, not every arbitrary losing payload indefinitely. Compatibility retirement can be justified even while old senders remain; coverage depends on semantics, not list length."
    },
    "techniques/deterministic-span-derived-ids.md": {
      "disposition": "clarify",
      "reason": "Repaired span-only fallback as globally unique, missing span with trace-only collision, client IDs as globally trusted and duplicate acknowledgement before content comparison. Deterministic keys need tenant scope, atomic persistence and conflict policy."
    },
    "techniques/per-provider-usage-extractors.md": {
      "disposition": "reverify",
      "reason": "Per-provider adapters are useful but host, API and SDK versions can differ within one family. A declarative generic engine over explicit schemas is legitimate; response sniffing can be explicit validated dispatch rather than guessing. Missing details can leave inclusive totals unknown, and stream accumulation must distinguish deltas from totals. Both server and wrapper can possess raw provider responses."
    },
    "techniques/provider-family-matching.md": {
      "disposition": "clarify",
      "reason": "Repaired hosted-family price equivalence and eager substrings as making totals honest. Preserve host and model identity as pricing dimensions; ambiguous mapping is explicit rather than first-match pricing."
    },
    "techniques/refuse-to-derive.md": {
      "disposition": "reverify",
      "reason": "Do not invent input/output split, but preserve reported total as its own fact. Total minus known component can be valid under a declared complete relationship. Invalid values differ from absent fields and deserve diagnostics. Supported estimates can be stored separately with provenance; gen-AI namespace alone does not prove an inference call."
    },
    "techniques/two-doors-one-pipeline.md": {
      "disposition": "reverify",
      "reason": "Shared semantic pipeline is useful, but authentication, payload limits, content-type and wire validation belong at doors. OTLP partial success, retryable errors and endpoint behavior must follow its protocol. Identical pipeline code cannot prove all callers use it or that retrospective caps prevent upstream spend. Cost and debugging time bases are scoped."
    },
    "applications/process--per-provider-usage-extractors.md": {
      "disposition": "reverify",
      "reason": "Dated provider matrix retained, not fully refreshed. The displayed inclusive-input formula subtracts reads but then adds cache-write cost without subtracting writes, double-pricing writes already in the total. Total may contain other classes; missing fields must not silently become zero. Historical convention claims need version pins."
    },
    "applications/rust--attribute-precedence-lists.md": {
      "disposition": "reverify",
      "reason": "Historical Rust mapper retained, not rerun. First-present then as_u64 can suppress a valid legacy field when the preferred field is malformed; record explicit conflict/error policy. Dropping total loses real evidence. Preserved provider/model metadata alone cannot reconstruct missing token attributes, so full remapping claim is too strong."
    },
    "applications/rust--two-doors-one-pipeline.md": {
      "disposition": "reverify",
      "reason": "Historical Rust architecture retained, not rerun. Native-like 429/per-item semantics may not match OTLP exporter expectations. Shared handler does not prove atomic duplicate accounting, tenant scope or transport validation. Attribute prefixes can include non-inference agent spans, and retrospective telemetry rejection cannot undo paid generation."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

All ten documents read in full at restored bytes: golden path, six techniques,
three applications. Nothing under `knowledge/` was edited. Two claims were
checked against primary sources; one verified, one refuted.

The subject's premise is the sharpest in my group: the operator ingests telemetry
it did not emit, from senders it cannot upgrade or pin, so the design centre is
"survive the format's entire deployed history at once" rather than "parse the
format". Everything downstream follows honestly — precedence lists because
multiplicity is structural rather than transitional, family matching because what
provider identity is *for* is selecting a price book, refusal-with-a-code because
silent dropping hides the operator's own coverage gaps from the operator, and
deterministic span-derived ids because at-least-once delivery is the exporter
contract rather than misbehaviour. The two-normalizers section (eager at ingest
where a miss deletes real spend; conservative across an installation boundary
where a false merge cannot be unwound by any single contributor) is a genuine
insight, and the later third-posture amendment generalizes it correctly to the
question that actually discriminates: does a miss delete something real, or does a
false positive assert something false.

**One arithmetic error, re-derived and confirmed.**
`applications/process--per-provider-usage-extractors.md` builds Anthropic's
inclusive input total as `input_tokens + cache_read_input_tokens +
cache_creation_input_tokens`, then in the very next section prices it as
`(input_total − cached_read) × base_rate + cached_read × cache_rate`, "with
cache-write counters priced at their premium on top." Because `input_total`
already contains the creation tokens, the first term prices them at the base rate
and the "on top" clause prices them again at the write premium. The creation
tokens are billed twice — which is precisely the double-pricing hazard the section
is written to warn against, committed inside its own corrective formula. The
correct form subtracts both sub-counts before applying the base rate:
`(input_total − cached_read − cache_creation) × base_rate + cached_read ×
cache_rate + cache_creation × write_rate`. The previous record reached the same
conclusion; I re-derived it independently rather than carrying it, and it stands.
Reporting it, not fixing it.

**One anchor verified.** `applications/rust--attribute-precedence-lists.md`
annotates its provider-key list with "`gen_ai.system` (deprecated in semconv
v1.37)". Checked against the OpenTelemetry semantic-conventions record: the
attribute was renamed to `gen_ai.provider.name` in semantic-conventions v1.37.0.
The application's version pin is correct, and so is the golden path's account of
the churn it describes elsewhere — the prompt/completion to input/output token
rename and the removal of content attributes in favour of opt-in structured
message attributes both match.

**One thing the same check surfaced that the subject does not carry.** The GenAI
conventions have since moved out of the main semantic-conventions repository into
their own (`open-telemetry/semantic-conventions-genai`). That does not change any
mapping, but it invalidates the *maintenance* instruction:
`techniques/attribute-precedence-lists.md` says "every release of the conventions
gets diffed against the table", and an operator following that today would be
diffing releases of a repository the relevant attributes have left. This is the
subject's own moving-target thesis catching up with the subject; the fix is one
sentence naming where the changelog now lives, and it is the highest-value
correction available here because the whole technique's upkeep depends on it.

**Two smaller internal tensions.** `techniques/per-provider-usage-extractors.md`
carries a rule headed "Required facts default defensively, but visibly" whose body
then forbids the default it announces — "prefer recording the event with null
usage or an error status over inventing counts". The heading licenses what the
body refuses; a reader skimming construction rules will take the heading. And
`techniques/provider-family-matching.md` states the declared-identity-pair rule
(map the family attribute, keep the host as provenance) above a decision rule
about hosts that serve many families, which the declared pair largely dissolves
where it is present. Both are one-clause repairs.

I also note a coverage hole the subject creates by design and does not
acknowledge. `refuse-to-derive` correctly refuses to split a bare
`gen_ai.usage.total_tokens`, and `rust--attribute-precedence-lists.md` implements
that as "not mapped" — the total is discarded rather than stored as its own fact.
So an event from a total-only sender carries null input, null output, and no
record of the one quantity the sender actually asserted, and the operator cannot
answer "how many tokens did this sender move" even though the wire supplied it.
Refusing the split and preserving the total are separable; the subject collapses
them.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/multi-provider-event-normalization",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:20d80bd47dbe78cc",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at restored bytes: golden path, 6 techniques, 3 applications. The Anthropic inclusive-total pricing formula was re-derived by hand. The semconv v1.37 deprecation anchor was checked against the OpenTelemetry semantic-conventions record, which also surfaced the GenAI conventions' move to a separate repository. Not evaluated: the LightTrack semconv.rs / ARCHITECTURE.md line anchors, the Python client extractors, any executed ingest or OTLP round-trip, the provider response shapes beyond what the documented conventions assert, and any application maturity or verified_on refresh. No knowledge/ file was edited.",
  "counterexamples": [
    "Anthropic cache-creation tokens under the field survey's own formula: they sit inside the inclusive input total, are priced once at the base rate by the subtraction that removes only cache reads, and are priced again by the write premium added on top.",
    "A sender emitting only gen_ai.usage.total_tokens: the split is correctly refused and the total is then discarded entirely, so a real asserted quantity leaves no trace and the coverage question it answers becomes unanswerable.",
    "An operator following the maintenance rule diffs each semantic-conventions release against the precedence table, and the GenAI attributes have moved to a separate repository whose releases that diff never sees.",
    "A marketplace or router fronting several vendors is excluded from every family substring list by rule, and model identity may not be family-matched by another rule, so exactly the fastest-growing hosted traffic falls into the Unknown unpriced bucket by design.",
    "Two spans legitimately sharing a span id from a buggy sender: the deterministic rule keeps the first and acknowledges the second as a duplicate, so real distinct spend is silently deduplicated — the inverse failure, handled for the all-zeroes sentinel and not for this case."
  ],
  "sources": [
    {
      "url": "https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/",
      "result": "Confirmed that gen_ai.system was renamed to gen_ai.provider.name in semantic-conventions v1.37.0 and is deprecated, verifying the version pin in rust--attribute-precedence-lists.md, and corroborating the golden path's account of the prompt/completion to input/output token rename and the removal of content attributes in favour of opt-in structured message attributes. It also established that the GenAI conventions have moved to a separate repository, which the subject's maintenance rule does not account for. It did not establish the current membership of any precedence list beyond the provider key."
    },
    {
      "path": "knowledge/llm-observability/telemetry-and-data/multi-provider-event-normalization/applications/process--per-provider-usage-extractors.md",
      "result": "Re-derivation of the document's own pricing formula against its own inclusive-total definition established that cache-creation tokens are priced twice: once at the base rate inside (input_total - cached_read), and again by the write premium applied on top. It did not establish the provider response shapes in the matrix, which were read from the document rather than from provider documentation."
    }
  ],
  "documents": {
    "multi-provider-event-normalization.md": {
      "disposition": "keep",
      "reason": "The premise (survive the format's deployed history, not parse the format), the whose-SDK-is-it boundary, the refusal posture across its three edges, and the plural-identity-normalization section are all correct and each hands off to an owned technique. The moving-target section's specific churn claims check out against the current conventions record."
    },
    "techniques/attribute-precedence-lists.md": {
      "disposition": "clarify",
      "reason": "The list-not-a-name argument, the newest-first tie-break, the no-wildcard rule, the keep-the-losers provenance rule and the audit-list-length-against-the-price-book insight are all sound, and the last is the most valuable sentence here. The maintenance discipline is now stale: 'every release of the conventions gets diffed against the table' points at a repository the GenAI attributes have left. One sentence naming the new location restores the whole upkeep loop."
    },
    "techniques/provider-family-matching.md": {
      "disposition": "clarify",
      "reason": "The economic argument for family membership, the Unknown-is-accepted-unpriced-preserved rule, the never-let-Unknown-vanish clause, and the two-appetites and third-posture sections are all correct, and the closing question (does a miss delete something real, or does a false positive assert something false) is the right discriminator. The declared-identity-pair paragraph largely dissolves the host-serves-many-families decision rule below it, and neither says so."
    },
    "techniques/per-provider-usage-extractors.md": {
      "disposition": "clarify",
      "reason": "The four structural divergences, the inclusive-totals-with-sub-counts convention and its subtraction consequence, and the shared-accessor-with-per-provider-knowledge split are all right, and the argument against a generic walker ('its failure mode is worse than crashing: it finds something') is the correct one. One rule contradicts itself between heading and body: 'Required facts default defensively, but visibly' announces a default the body then forbids in favour of null usage or an error status."
    },
    "techniques/refuse-to-derive.md": {
      "disposition": "clarify",
      "reason": "The canonical case, the two-code refusal boundary, the filter-don't-clamp rule and the test for any proposed derivation ('could two honest senders with identical wire data have different true values') are all correct, and the licensed-computation line is drawn precisely. It conflates two separable obligations: refusing to split a total, and discarding the total. Preserving a bare total as its own recorded fact violates nothing here and closes a coverage hole the subject currently creates."
    },
    "techniques/deterministic-span-derived-ids.md": {
      "disposition": "keep",
      "reason": "Identity as a pure function of the input, the argument against dedup-by-content from both directions, the all-zeroes sentinel treated as absent rather than as identity, the explicit rather than random degradation, and acknowledge-don't-error on replay. The accounting consequence — spend stamped once at first receipt, so exporter retries during an incident cannot retroactively inflate an evaluated window — is the payoff and is stated as such."
    },
    "techniques/two-doors-one-pipeline.md": {
      "disposition": "keep",
      "reason": "'A door may translate; it may never adjudicate' is the right invariant and each of the four leak consequences names a distinct failure. The clock discipline clause is the load-bearing one and is correctly placed in the shared pipeline rather than in a door. The narrow-scope rule (one signal, one transport, stated plainly) is what stops a door half-supporting a format."
    },
    "applications/process--per-provider-usage-extractors.md": {
      "disposition": "clarify",
      "reason": "The inclusive-versus-exclusive matrix is the right artifact and its per-direction framing is the argument for the technique in one table. Its pricing formula is wrong: after defining the input total as inclusive of cache-creation tokens, it subtracts only cache reads before applying the base rate and then adds the write premium on top, double-pricing the creation tokens — the exact hazard the section warns about. Re-derived independently and confirmed. The provider shapes were read from this document, not from provider documentation, and refresh_by 2026-11-20 is still in force."
    },
    "applications/rust--attribute-precedence-lists.md": {
      "disposition": "keep",
      "reason": "The semconv v1.37 deprecation pin verifies against the conventions record. The document does what an application of this technique should: shows the lists as ordered const slices with the pre-standard ecosystems behind the standard names, shows the deliberate hole (no total-tokens entry) as a semantic claim about list membership, and shows provenance kept for both model attributes since only one wins the race. Line anchors not checked against the tree and nothing was executed."
    },
    "applications/rust--two-doors-one-pipeline.md": {
      "disposition": "reverify",
      "reason": "Demonstrates the invariant at the two places it is usually lost — central clock re-stamping with the client start time surviving only as latency input, and one shared trace-reference canonicalizer whose comment records the case-split incident that motivated it — and states its own scope narrowly (no gRPC/protobuf, no metrics or logs). Not executed and the ARCHITECTURE.md / semconv.rs anchors were not checked. The claim that the limit check cannot be routed around by choosing the other door rests on reading the shared handler, not on a test."
    }
  }
}
```
