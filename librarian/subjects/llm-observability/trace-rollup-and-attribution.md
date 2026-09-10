---
subject: trace-rollup-and-attribution
domain: llm-observability
last_touched: 2026-09-10
touched_by: librarian-inbox-writer
dry_streak: 0
---

# trace-rollup-and-attribution

First touch: [[2026-08-23-6]], external reconcile against `Arize-ai/phoenix`
@ `9478f95` (arize-phoenix 20.3.0). Gained `python--keyset-trace-pagination`
(uncovered); single-stack debt cleared. Hint confirmed, richer than sent.
Executed evidence: cursor codec exec'd verbatim, a 6-trace keyset harness, a
NULL-ordering probe.

## Measured disproof - LANDED in cycle N1-a ([[2026-08-23-7]]): cursor-column direction constraint written into the technique

- `keyset-trace-pagination` prescribes the trace's LATEST event time as the
  cursor column and calls the consequence a benign re-appearance. Executed:
  under the DESC order the technique also prescribes, a later-moving key
  SKIPS rows (trace 5 silently lost); an earlier-moving key only duplicates.
  The rule should read: the cursor column must be immutable, or mutable only
  in the direction that duplicates. Priority for the next cycle.

## Open leads (banked, convergence rule applies)

- Nullable sort columns need pinned NULL placement + NULL-aware cursor
  degeneration; a dialect default breaks it (SQLite NULLs-first measured).
- A short or empty page is not end-of-traversal; the flag is the only end
  signal (empty-page-with-hasNextPage + bounded refill loop sighted).
- A cursor-independent total is not a CURRENT one (1h TTL count cache).
- One timeRange argument reads span-grain in one branch, trace-grain in
  another - coexisting unstated readings the technique forbids, sighted live.
- Refusal-by-schema-extension: refusal and the constant it makes honest are a
  pair; either alone is a lie.

## Cross-subject proposals

- derived-trace-rollup tension: the tree materializes monotone extrema
  (min-start/max-end) and that is what makes keyset exact - candidate rule:
  monotone order-independent extrema are safe to materialize under late
  arrival; non-monotone derived values are not.
- span-cap-truncation-signal: same tree bounds the detail read but ships no
  truncation boolean (numSpans must be compared by hand) - a second-worker
  target on the same pin.
- tenant-scoped-trace-ids: scope-in-the-query sighting at Project.trace.

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

One lead (personas). `single-shape-rule`'s own "each path may gather the facts its own way"
was the loophole; it now governs how facts are fetched, never which things, and a new
section pins the collection as well as the rule: counts and totals above a list are passed
down from the list's owner, never re-derived at the display site, and the conformance test
uses a fixture where the collections could differ. Corroborated by the dimensional-modeling
tradition (drilling across requires conformed row headers) and the reporting practice's
"same metric, different filter context" defect class. Application `react--single-shape-rule`
at personas `b6dcf28aa` (span count handed down beside error count; asymmetric regression).
Proposals: measurement-honesty `co-published-numbers-must-reconcile` lacks a collection
constraint; `span-cap-truncation-signal` interacts with a pinned collection.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/trace-rollup-and-attribution",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:cef53dcf01b3905b",
  "disposition": "reverify",
  "coverage": "All 13 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Fetching 5001 rows proves more than 5000 exist, not whether total is 5001 or 100000.",
    "Two deliveries of one span ID need not be two paid calls.",
    "A trace moves across a cost filter while paging on an immutable ID; keyset alone cannot freeze membership."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/telemetry-and-data/trace-rollup-and-attribution",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "trace-rollup-and-attribution.md": {
      "disposition": "reverify",
      "reason": "Materialized projections can be maintained correctly and explicit completion markers can exist. Observed spans are not necessarily all events. Summed elapsed span time is not CPU compute and min/max clocks do not establish user wait. Mutable activity keys do not guarantee exact pagination. W3C wire grammar and opaque native identity need separate contracts."
    },
    "techniques/derived-trace-rollup.md": {
      "disposition": "clarify",
      "reason": "Repaired categorical ban on maintained projections, retries treated as distinct calls, first-arrival nondeterminism and malformed events assumed harmless to totals. Version the fold and validate scope before aggregating."
    },
    "techniques/keyset-trace-pagination.md": {
      "disposition": "clarify",
      "reason": "Repaired exactness under concurrent mutation, contradictory latest-activity cursor wording and count freshness. Snapshot and filter membership matter beyond a stable cursor; scalar unique cursors are valid."
    },
    "techniques/single-shape-rule.md": {
      "disposition": "reverify",
      "reason": "Shared definitions and collection scope are useful but code reuse alone does not guarantee agreement. Any failed child is a policy choice, not necessarily failed request after recovery. Sums have units, null, dedup and rounding choices too. Use maximum finish, not finish of last-starting span; sum of elapsed spans is not compute time."
    },
    "techniques/span-cap-truncation-signal.md": {
      "disposition": "clarify",
      "reason": "Repaired limit-plus-one as exact total, oldest span assumed root, truncation assumed pathology and universal retained-only totals. Scope each aggregate and its snapshot explicitly."
    },
    "techniques/tenant-scoped-trace-ids.md": {
      "disposition": "reverify",
      "reason": "Tenant query scope and server-owned billing attribution are sound. Scope cache, scores, exports and write identities as well. A native opaque ID can be case-sensitive even if hex-shaped; shape alone does not prove protocol semantics. W3C wire traceparent requires lowercase hex rather than arbitrary case-insensitive acceptance. Opaque credential IDs are prudent; a cryptographic token hash is not automatically reversible."
    },
    "techniques/unpriced-span-accounting.md": {
      "disposition": "clarify",
      "reason": "Repaired missing latency as safe zero, missing cost as no cost, unconditional lower-bound claim and price book as only cause. Preserve measurement status and reason across aggregates."
    },
    "applications/python--keyset-trace-pagination.md": {
      "disposition": "reverify",
      "reason": "Historical Phoenix harness retained, not rerun. Mutable-start direction improves this finite fixture but cannot guarantee a live snapshot under changing filters or insertions. One-hour cached count and omitted trace predicate do not match current list population. Null ordering, malformed cursor handling and stripped assert remain concrete residuals."
    },
    "applications/react--derived-trace-rollup.md": {
      "disposition": "reverify",
      "reason": "Historical React first-wins change retained, not rerun. Test explicitly changes owner with input order, contradicting order-independent determinism. Duplicate IDs can be retries or updates, not proven distinct calls. First-wins without canonical ordering and conflict policy cannot establish correct linkage or accounting."
    },
    "applications/react--single-shape-rule.md": {
      "disposition": "reverify",
      "reason": "Historical React collection fix retained, not rerun. Null unifiedTrace becomes zero and may mean loading or unavailable. Root cost lookup still selects a population and can mislead beside merged rows. Shared counts do not establish full cost, duration or capped coverage."
    },
    "applications/react--unpriced-span-accounting.md": {
      "disposition": "reverify",
      "reason": "Historical formatter tests retained, not rerun. Null-to-dash preserves missingness at this seam, but Rust mapper already coerces other costs to zero. Type annotations are not runtime validation; a dash needs an accessible meaning and aggregate completeness is still absent."
    },
    "applications/rust--derived-trace-rollup.md": {
      "disposition": "reverify",
      "reason": "Historical Rust fold retained, not rerun. Timestamp-only ties preserve arbitrary incoming order; duplicate span IDs need delivery classification. Limit-plus-one cannot establish total above cap, shared shape does not fix snapshot/population mismatch, and ended cursor can skip moving traces."
    },
    "applications/rust--unpriced-span-accounting.md": {
      "disposition": "reverify",
      "reason": "Historical Rust accounting retained, not rerun. Known-component sum with missing count is useful but not always a lower bound on actual invoice. Latency zero without missingness hides unavailable timing; serde missing count default zero makes legacy completeness unknown."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

I retract the `documents` map of the earlier 2026-09-10 record on this subject. It
was written against the compressed rewrite that has since been reverted, so its
"Repaired ..." reasons describe text that is not on disk. Several of its
observations were real leads and I have carried two of them forward on my own
reading; the rest were generic caveats rather than findings.

All thirteen documents read in full. The subject is strong: the derived-view
argument, the two-views-one-definition rule with its collection amendment, the
truncation contract, and the null-cost discipline are each stated with the incident
that produced them. The dominant disposition is `keep`.

**The largest finding is an internal contradiction that the corpus's own measured
disproof created and did not finish propagating.** In cycle N1-a the
`keyset-trace-pagination` technique was amended: the cursor column "must be
immutable, or mutable only in the direction that duplicates", and the trace's
*latest event time* was named as precisely the column a newest-first traversal
cannot page on. The Phoenix application carries the harness that measured it (keying
on `end_time` silently lost trace 5; keying on `start_time` lost none). But the
golden path still says the technique "pages on a composite cursor (activity
timestamp plus trace id as tie-break)" — the disproved column — and the LightTrack
application still cites "the `(ended, trace_id)` keyset" as a property the
conformance suite pins, without flagging it. So a reader who enters through the
golden path, or who reads the Rust application as a model realization, is handed the
skipping column by two of the three documents that mention it. This is not a style
issue; it is the one rule in the subject whose violation loses rows silently.

**`derived-trace-rollup` sets a standard it then breaks.** Its invariant is
"malformed input may degrade the *tree*, never the *totals*", and its duplicate rule
is "two events reporting the same span id are two distinct calls, not one. Render
both." Under at-least-once exporter delivery — which the same document invokes twice
as the reason late and out-of-order spans are normal — a redelivered span is *not* a
distinct call, and rendering both folds its cost into the totals twice. The rule is
defensible as a policy (an operator-side system cannot always distinguish a collision
from a redelivery), but it is stated as a fact about the world and it degrades exactly
the thing the invariant protects.

**`unpriced-span-accounting`'s exclusion for latency is argued against the wrong
figure.** "A missing latency treated as zero merely makes a duration conservative"
is true of wall-clock duration (first start to last finish), which shortens. It is
not an argument about *summed per-span latency*, which the sibling technique requires
as a separate first-class figure on every rollup and which a zeroed latency
understates with no count beside it — the identical shape of defect the document
spends its length forbidding for cost. The Rust application confirms the live
consequence: `total_latency_ms += e.latency_ms.unwrap_or(0)` with no companion count,
pinned by a test.

**A primary source contradicts a claim that appears twice.** The golden path says
"the distributed-tracing standard defines hex ids as case-insensitive" and
`tenant-scoped-trace-ids` repeats it as "the standard's hex ids are
case-insensitive". W3C Trace Context defines `trace-id = 32HEXDIGLC` and
`parent-id = 16HEXDIGLC` over an explicitly lowercase hex alphabet, and states that
vendors *MUST* ignore a `traceparent` whose `parent-id` is invalid, giving
non-lowercase hex as the example. Only the *header name* is case-insensitive. The
operational hazard the technique describes — two ingest doors normalizing
differently and splitting one end-to-end trace — is real and the shared-function
remedy is right; the justification is not. Under the spec an uppercase-hex
`traceparent` is invalid input, which is a stronger position than "case-insensitive,
so fold it", and the technique should say so.

What I did not do: I read the W3C recommendation but executed nothing, did not clone
Arize-ai/phoenix or the LightTrack and personas trees, and reran none of the three
harnesses or the React suites. Every application's verified_on and applied/ab_verdict
field is left as it stands.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/trace-rollup-and-attribution",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:fa3bcbaca1840db4",
  "disposition": "clarify",
  "coverage": "All 13 owned documents read in full at current bytes, plus a cross-document consistency check on the cursor-column rule and the case-folding claim. Retracts the earlier 2026-09-10 record's document map, which described reverted content. Not evaluated: no third-party or consumer tree was cloned or built; the Phoenix keyset/null-ordering harnesses, the vitest suites and the cargo suites were not rerun; no verified_on, applied or ab_verdict field was refreshed.",
  "counterexamples": [
    "A batching exporter redelivers one span. The fold renders it twice as 'two distinct calls' and its cost enters the totals twice - malformed input degrading the totals, which the technique's own invariant forbids.",
    "A trace's summed per-span latency is served over spans whose latency was absent and zeroed. The figure is a lower bound with no unmeasured count beside it, which is the defect the same document defines for cost.",
    "An ingest door receives a traceparent with uppercase hex. Under W3C Trace Context that header is invalid and must be ignored; the subject's rule case-folds it into a valid id instead.",
    "A trace list is paged newest-first on the trace's latest event time, as the golden path prescribes. A late span moves a not-yet-returned trace in front of the cursor and it is never served - the exact silent skip keyset exists to prevent.",
    "A grouped-aggregate list serves 'n of N' from a cached count while the page is served live. N is cursor-independent, as the technique requires, and still describes a population that no longer exists."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/trace-context/",
      "result": "Establishes that trace-id and parent-id are defined over a lowercase-only hex alphabet (HEXDIGLC) and that vendors MUST ignore a traceparent whose parent-id contains non-lowercase hex; only the header NAME is case-insensitive. It does not establish what a lenient operator-side ingest SHOULD do with such an id, which remains this subject's own design call."
    },
    {
      "path": "knowledge/llm-observability/telemetry-and-data/trace-rollup-and-attribution",
      "result": "Every owned document read at current bytes; the cursor-column rule traced across golden path, technique and both applications. Establishes the internal contradiction directly; establishes nothing about whether the cited third-party code still reads as described."
    }
  ],
  "documents": {
    "trace-rollup-and-attribution.md": {
      "disposition": "clarify",
      "reason": "Two claims need correcting. It prescribes the keyset cursor as '(activity timestamp plus trace id)' - the column its own technique's landed disproof identifies as the one that silently skips - and it justifies id canonicalization with 'the distributed-tracing standard defines hex ids as case-insensitive', which W3C Trace Context contradicts. The rest, especially the defensibility definition that closes it, is the best summary in the bundle."
    },
    "techniques/derived-trace-rollup.md": {
      "disposition": "clarify",
      "reason": "States 'two events reporting the same span id are two distinct calls, not one' as fact while the same document treats at-least-once redelivery as routine. Under redelivery they are one call, and rendering both violates the document's own invariant that malformed input never degrades the totals. Present it as a policy with its failure direction named."
    },
    "techniques/keyset-trace-pagination.md": {
      "disposition": "keep",
      "reason": "The cursor-column direction constraint is stated correctly and completely here, including why start-time paging costs newest-started rather than newest-active ordering. The predicate-independence rule, the total-is-not-the-page rule and the refuse-what-you-cannot-page rule are all sound. This is the document the other two need to follow."
    },
    "techniques/single-shape-rule.md": {
      "disposition": "keep",
      "reason": "The collection amendment closes the loophole the original rule left open, and the conformance-test extension (a fixture where the collections could differ) is what makes it checkable. The dimensional-modeling conformed-row-headers parallel is apt rather than decorative."
    },
    "techniques/span-cap-truncation-signal.md": {
      "disposition": "keep",
      "reason": "Three fields always present rather than only when clipping, keep-the-oldest with three ordered reasons, and the reading that a fired flag is an operational finding rather than a display inconvenience. The interaction with the verdict receipt in the sibling subject is stated in exactly the right place."
    },
    "techniques/tenant-scoped-trace-ids.md": {
      "disposition": "clarify",
      "reason": "The scope-in-the-query argument, the not-found-over-forbidden oracle rule and the server-stamped attribution posture are all correct and should not move. The canonicalization section's premise - 'the standard's hex ids are case-insensitive' - is wrong against W3C Trace Context, which mandates lowercase and requires an invalid traceparent to be ignored. Restate the rule as lenient ingest of a non-conforming id, not as conformance to the standard."
    },
    "techniques/unpriced-span-accounting.md": {
      "disposition": "clarify",
      "reason": "The null-versus-zero discipline from ingest through display is the strongest statement of the rule in the corpus. Its one exclusion is under-argued: 'a missing latency merely makes a duration conservative' addresses wall-clock duration and not the summed per-span latency the sibling technique requires as its own figure, where a zeroed value is an uncounted understatement."
    },
    "applications/python--keyset-trace-pagination.md": {
      "disposition": "keep",
      "reason": "The measured disproof that produced the technique's direction constraint, with the harness, the fixture and the losing traversal reported. Its extra findings (grain-shifting timeRange, the count surface's drifted predicate set, nullable sort columns needing pinned NULL placement) are each grounded in a cited line. Not rerun; scoped to Phoenix 20.3.0 @ 9478f95."
    },
    "applications/react--derived-trace-rollup.md": {
      "disposition": "keep",
      "reason": "First-wins linkage applied with an honest account of what it does not buy: no duplicate mark, no proof a real producer collides, and nothing tested about the totals under collision. The observation that consolidation moved the code that looked like a duplicate and left the code that behaved like one is the transferable part. Not rerun."
    },
    "applications/react--single-shape-rule.md": {
      "disposition": "keep",
      "reason": "The amendment's case in a live tree, including which way the pin went and why (toward the set the reader is looking at). Its limits section names the untouched tiles, the dead local fold, and the absence of an A/B rather than implying one. Not rerun."
    },
    "applications/react--unpriced-span-accounting.md": {
      "disposition": "keep",
      "reason": "The structural finding - absence destroyed in a Rust mapper before the frontend can preserve it, with a return condition naming the schema change - is worth more than the fix and is presented that way. The 609-green-tests silence is correctly read as containment by the type system rather than as coverage. Not rerun."
    },
    "applications/rust--derived-trace-rollup.md": {
      "disposition": "clarify",
      "reason": "Cites '(ended, trace_id)' as a keyset the conformance suite pins, without noting that the sibling application measured that column silently losing rows under newest-first traversal and that the technique now forbids it. A consumer reading this as a model realization inherits the defect. The rest of the record - pure fold, tolerance rules with named tests, bounded read, shared canonicalization, capability refusal - is accurate and useful. Not rerun."
    },
    "applications/rust--unpriced-span-accounting.md": {
      "disposition": "keep",
      "reason": "Shows the count and the sum folded in one pass with the test that pins the pair, and is candid about the serde-default lossiness on replayed historical payloads. It reports the zeroed-latency contrast faithfully; the finding there belongs to the technique, not to this record. Not rerun."
    }
  }
}
```
