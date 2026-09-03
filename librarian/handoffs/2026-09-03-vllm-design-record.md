# Design record — open-source LLM inference engine (intake 2026-09-03)

Source: `github:vllm-project/vllm` @ `facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`
Run: `intake-vllm-0903` · swept: `docs/design/` (29 docs, 50,830 words), `docs/usage/security.md`,
`docs/contributing/deprecation_policy.md`, `docs/features/` (51,560 words), `docs/configuration/`.
Landing page: 620 words — not the source.

**Routing count (Phase 2d): 8 systems, 26 load-bearing decisions, 24 with `corpus: NONE`.**
Six systems clear three-or-more independently. Handed off (operator, 2026-09-03): A–F.
G and H stay in the claim lane.

---

## System A — serving process topology and control plane

**A1. The hot loop is a process, and everything that can be moved out of it is.**
- forces: the scheduler's inner loop sets the floor on inter-token latency; anything that
  runs between forward passes is paid once per token per request.
- buys: bookkeeping cost lands in the outer loop, overlapped with accelerator execution.
- rejects: one process with the API surface and the scheduler inside it.
- where: `docs/design/arch_overview.md:68-133`; `docs/design/metrics.md:135-152`.
- stage: process decomposition, before any request is admitted.
- corpus: NONE. Nearest `llm-agent/runtime-and-io/subprocess-lifecycle` models a
  supervised child's lifecycle, not an inner/outer loop split with a latency argument.
  HOME IF NEW: `backend-platform/inference-serving`.

**A2. The process count is published as a formula, not as advice.**
- forces: operators size CPU for a deployment whose process count is a product of four
  independent knobs.
- buys: capacity planning is arithmetic a reader can check (`A + DP + N`, `+1` when the
  coordinator exists), with two worked deployments.
- rejects: "tune to taste"; a table of recommended shapes.
- where: `docs/design/arch_overview.md:104-133`.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

**A3. The process start method is PROBED at runtime, not configured.**
- forces: the fastest start method is incompatible with an already-initialized
  accelerator context and with thread-using dependencies; the compatible one re-executes
  a consuming program that has no main guard, which is unbounded recursion in somebody
  else's code.
- buys: the default works for both the CLI operator and the library consumer, and the
  known-broken case emits a warning naming the fix before the runtime's own error.
- rejects: forcing the compatible method always — written down, argued, and declined
  because it breaks existing consumers; and detecting the main guard, declined as
  impractical with the investigation cited.
- where: `docs/design/multiprocessing.md:402-415` (the three-rule policy), `:450-479`
  (alternatives considered and rejected).
- stage: executor construction, before any worker exists.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

**A4. One configuration object is engine-level global state, and its constructor is
keyword-only so old callers fail loudly.**
- forces: a deep class hierarchy in a field where features arrive weekly; a new option
  that only the innermost class reads would otherwise change every constructor between.
- buys: adding a feature touches the config type and the one class that reads it.
- rejects: per-class configuration parameters threaded through the hierarchy.
- costs, stated by the tree itself: no component can be unit-tested without a whole
  config; the mitigation is a default-everything-None factory.
- where: `docs/design/arch_overview.md:200-301`.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

---

## System B — paged block cache with content-derived keys

**B1. A block's cache identity is a CHAIN, not a hash of its own contents.**
- forces: two blocks holding identical tokens at different positions are not
  interchangeable; a prefix's meaning depends on everything before it.
- buys: a single dictionary lookup answers "is this exact prefix computed", and reuse is
  automatic across requests that never coordinated.
- rejects: hashing block contents alone; an explicit reuse API.
- where: `docs/design/prefix_caching.md:6-33`.
- corpus: PARTIAL. `llm-agent/prompt-and-context/prompt-assembly/techniques/fingerprinting-and-cache-keys`
  is the neighbour and is a different claim: a digest of a whole standing prompt used as
  a staleness gate, not a positional chain over a segmented sequence. The corpus has
  three files total mentioning this class of cache and all three are client-side.
  HOME IF NEW: `backend-platform/inference-serving`.

**B2. Only complete units are cached, and the table is append-only, so duplicates are
tolerated rather than resolved.**
- forces: the per-request block table was made append-only; retro-pointing an entry at an
  older equal block is the rewrite that invariant forbids.
- buys: no rewrite path, therefore no rewrite race; the duplicate is reclaimed when the
  request ends.
- rejects: detect-and-dedupe on insert, which the previous major version did.
- where: `docs/design/prefix_caching.md:158-195` (the worked duplication trace).
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

**B3. The eviction ORDER encodes a reuse prediction, and it is written into the release
path rather than into a policy.**
- forces: the free list must be ordered by likelihood of future reuse, and the cheapest
  moment to know that is when a request releases its blocks.
- buys: a request's last block — which hashes the most tokens and is therefore the least
  likely to be a prefix of anything else — evicts first, at no scan cost; blocks are
  pushed in reverse.
- rejects: a scoring pass over the cache; plain recency.
- also: the free list is an intrusive doubly-linked list inside the block object, so
  move-to-tail is constant time and no separate queue wrapper is allocated.
- where: `docs/design/prefix_caching.md:197-209`, `:103-136`.
- **CORRECTED 2026-09-03 by the forging worker, verified in code.** This entry as first
  written described the mechanism one level too coarsely, and the correction is the
  transferable part. Allocation drains the FRONT (`popleft_n`) and release appends to the
  TAIL (`append_n`), so the queue is ALREADY a coarse recency ordering at the population
  level; reverse-order release is the tie-break WITHIN one release, where recency cannot
  discriminate because every block in it was freed at the same instant. Two consequences
  the original entry missed: blocks that cannot be cached are put at the FRONT
  (`prepend_n`, "put a list of blocks at the front of the free list") rather than the
  back — the intuitive answer is inverted, because the back of the queue holds the longest
  remaining life and a worthless block should not get it; and the release entry point is
  `free_blocks(ordered_blocks)`, which TAKES an ordered sequence whose order IS the
  eviction priority. The policy is a parameter of the release call, not a convention
  around it, and that is what makes it a mechanism a reader can adopt.
  Anchors: `vllm/v1/core/block_pool.py:661,723,747`; `vllm/v1/core/kv_cache_utils.py:240-243,318,394`.
- corpus: NONE. `client-architecture/client-fetch-cache/techniques/admission-hypothesis`
  is about admission, not release ordering. HOME IF NEW: `backend-platform/inference-serving`.

**B4. One page size across heterogeneous consumers, bought with padding.**
- forces: several classes of layer need different amounts of memory per token, and a
  single pool can only have one page size.
- buys: one allocator, one free list, one eviction policy for the whole machine.
- rejects: a pool per class; the accepted cost is grouping by the smallest class's count
  and padding the remainder, with the waste acknowledged and a request for reports of
  cases where it becomes unacceptable.
- where: `docs/design/hybrid_kv_cache_manager.md:281-393`.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

**B5. A privacy control implemented as a cache-key input.**
- forces: cache reuse across tenants is a timing side channel — a measured ROC AUC of
  0.99 at an eight-token prefix; the natural fix (disable reuse) costs the whole
  optimization.
- buys: an opt-in per-request salt mixed into the first block's hash partitions the cache
  along whatever trust boundary the caller names, and costs nothing when omitted.
- rejects: a global switch; per-tenant pools.
- where: `docs/design/prefix_caching.md:87-101`; `docs/usage/security.md:1161-1213`.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

---

## System C — extension trust boundary

**C1. Every process loads the extensions, so the extension contract is re-entrancy.**
- forces: the system is many processes, several of them created after startup; an
  extension that registers a type must have registered it in the process that will
  construct one.
- buys: an extension author writes one registration function and does not reason about
  the process graph.
- rejects: loading in the parent and inheriting; a per-process manifest.
- where: `docs/design/plugin_system.md:499-501`, `:552-554`.
- corpus: NONE. HOME IF NEW: `security`.

**C2. The allowlist default is INVERTED for the network-exposed extension group.**
- forces: one extension group adds HTTP routes; the others add in-process types. The same
  discovery mechanism serves both, and the same default would be wrong for one of them.
- buys: the group that can expose the server loads nothing unless an operator names it;
  every other group keeps load-all-unless-narrowed.
- rejects: one default for all groups; a separate discovery mechanism.
- where: `docs/design/endpoint_plugins.md:758-766`; `docs/usage/security.md:960-971`.
- corpus: NONE. HOME IF NEW: `security`.

**C3. Registration and initialization are two phases because the route surface exists
before the backend does.**
- forces: routes must be attached while the application is being built; the engine client
  the routes need does not exist until later, and on one deployment shape never exists.
- buys: an extension attaches routes with no engine and captures the client later, with
  the engine-less server explicitly modelled as a case the extension must answer for.
- rejects: a single init hook; deferring route attachment.
- where: `docs/design/endpoint_plugins.md:685-706`.
- corpus: NONE. HOME IF NEW: `security`.

**C4. Route collision is unenforced and last-registration wins, so the mitigation is a
naming convention plus a documented audit step.**
- forces: an extension can register any path; conflict detection was deferred to a
  follow-up on the governing proposal.
- buys: honesty — the document names shadowing as a capability an allowlisted extension
  has, tells operators to inspect the route table after startup, and asks extensions to
  namespace under a distinct prefix.
- rejects: silence; and a check that does not exist yet.
- where: `docs/design/endpoint_plugins.md:782-787`; `docs/usage/security.md:969`.
- corpus: NONE. HOME IF NEW: `security`.

---

## System D — the metric surface as a contract

**D1. Metrics are collected in the outer loop from what the inner loop already returns.**
- forces: instrumenting the latency-critical loop makes the instrument part of the cost
  it measures.
- buys: the inner loop ships events it was already producing; all derivation happens
  where it overlaps accelerator time.
- rejects: timers around the hot path.
- where: `docs/design/metrics.md:135-152`.
- corpus: PARTIAL. `operations/service-operations/perf-instrumentation` holds
  `probe-cost-budgeting` and is the real neighbour — but it models an in-process
  instrument measuring its own host, not a two-loop split where one loop emits and the
  other derives. HOME IF NEW: `backend-platform/platform-observability`.

**D2. An interval requires two monotonic timestamps from the SAME process, so the events
are stamped where they happen and shipped.**
- forces: monotonic clocks have per-process reference points and are meaningless across
  them; wall clocks move under time sync.
- buys: intervals that survive both hazards, at the cost of the inner loop carrying a
  small event vocabulary (queued, scheduled, preempted, new-tokens) in its output.
- rejects: reconstructing the intervals from what the frontend can see — considered
  explicitly, rejected because two of the four events are invisible there.
- where: `docs/design/metrics.md:153-227`.
- corpus: PARTIAL. `llm-observability/telemetry-and-data/llm-call-telemetry-model/techniques/dual-clock-event-time`
  is the neighbour and covers wall-vs-event clock skew on ingest; it does not carry the
  same-process rule or the "ship the event, not the interval" consequence.
  HOME IF NEW: `backend-platform/platform-observability`.

**D3. Publish the numerator and the denominator; never the ratio.**
- forces: a hit rate is only meaningful over a window, and the exporter cannot know which
  window the consumer wants.
- buys: two counters let every consumer compute the rate over its own interval; the log
  publisher, which has no time-series store, keeps a fixed recent-N rate instead — the
  same quantity computed differently because the consumers differ.
- rejects: a gauge holding a rate.
- where: `docs/design/metrics.md:406-433`, `:281-292`.
- corpus: NONE. HOME IF NEW: `backend-platform/platform-observability`.

**D4. A metric is a published interface, so removing one runs a staged pipeline.**
- forces: a metric is consumed by dashboards and autoscalers nobody exporting it can
  enumerate; a removal that looked safe was noticed by a user after the fact.
- buys: three stages tied to minor releases — on by default with a stated removal
  version, then off by default erroring with an escape-hatch flag, then removed — plus a
  rule that patch releases never remove.
- rejects: removing on a deprecation comment in the code, which is what happened and is
  cited as the reason the policy exists.
- where: `docs/contributing/deprecation_policy.md`; `docs/design/metrics.md:435-462`.
- corpus: NONE. HOME IF NEW: `backend-platform/platform-observability`.

**D5. An expensive metric is afforded by sampling, and the sample is declared.**
- forces: per-unit residency histograms over every cache block would cost more than they
  inform.
- buys: an operator-set sample rate makes the overhead a knob; three histograms
  (lifetime, idle-before-eviction, reuse gap) read together answer "is this cache
  stranded or churning".
- rejects: always-on per-block accounting; no metric at all.
- where: `docs/design/metrics.md:258-279`.
- corpus: NONE. HOME IF NEW: `backend-platform/platform-observability`.

---

## System E — the persistent-batch mutation protocol

**E1. Batch mutation is a typed, ordered protocol, not a rebuild.**
- forces: stateful per-request extensions hold parallel arrays indexed by batch position;
  the batch changes membership and order every step.
- buys: three operations (remove, add, move) with a MANDATED processing order and a
  stated index semantics — an add's index is its index at the time of the add, before any
  move — so every extension reconstructs the same final state.
- rejects: handing extensions the new batch and letting them diff it.
- where: `docs/design/logits_processors.md:998-1132`, with two worked examples.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

**E2. Compaction is part of the protocol, expressed in the protocol's own operations.**
- forces: removals leave holes; the array must be contiguous before the step runs.
- buys: condensation is a defined sequence of moves from the highest occupied slot into
  the lowest hole, so an extension that implements the three operations gets compaction
  for free and the batch size shrinks as a stated side effect.
- rejects: a separate compaction callback.
- where: `docs/design/logits_processors.md:1112-1120`.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

**E3. An extension declares a property that lets the engine skip it, and the property is
per instance, evaluated once at startup.**
- forces: some transformations cannot change the outcome under one sampling mode; the
  engine cannot infer which.
- buys: a declared invariance flag turns into a whole-batch skip. The flag is per
  instance and not a class method, because the same extension type can be configured into
  or out of the invariance.
- rejects: a class-level annotation; inferring it.
- also, and this is the boundary the corpus most lacks: because the transform runs at
  batch granularity, the skip only fires when EVERY request in the batch qualifies. A
  per-request property that can only be exploited per batch is a distinct shape.
- where: `docs/design/logits_processors.md:862-868`, `:985-987`, `:1229-1241`.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

---

## System F — cross-instance cache lease

**F1. A short lease with renewal replaces a long timeout, because the two failures it must
survive pull in opposite directions.**
- forces: a consumer that crashes should release gigabytes in seconds; a consumer merely
  queued behind a traffic surge must hold them for an unbounded time. One fixed timeout
  is wrong for one of them whichever value it takes.
- buys: a short initial lease plus periodic renewal is short for the dead case and
  unbounded for the slow case, with no knob to tune between them.
- rejects: lowering the single timeout — named as the obvious move and shown to convert
  one failure into the other.
- where: `docs/design/nixl_kv_cache_lease.md:490-502`.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

**F2. Renewal starts when the request ENTERS the queue, not when it is scheduled.**
- forces: the gap between arrival and scheduling is unbounded under load and is exactly
  when the lease would otherwise expire.
- buys: the holder learns the consumer exists before the consumer can do any work; the
  early connection also warms the transfer path.
- rejects: renewing from the execution path, which is where the work is.
- where: `docs/design/nixl_kv_cache_lease.md:518-524`.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

**F3. Four secondary rules that make the lease safe, each answering a specific hazard.**
- renewal is idempotent and monotonic (`max(old, now + extension)`), so a reordered or
  duplicated renewal can never SHORTEN a lease — the hazard when several senders renew
  one holder;
- renewals are batched per remote peer and per step, so N requests to one peer cost one
  message;
- when a deadline is produced by a peer's own monotonic clock, the receiver estimates the
  offset from the handshake round trip before comparing — a deadline is not portable
  between processes, and the fix is at the comparison, not at the clock;
- renewal runs in the existing execution loop with no background thread, justified by an
  order-of-magnitude margin between the loop's period and the lease interval — the margin
  is stated, which is what makes it a design decision rather than an omission.
- where: `docs/design/nixl_kv_cache_lease.md:580-601`, `:526-528`, `:587-589`.
- corpus: NONE. HOME IF NEW: `backend-platform/inference-serving`.

---

## Systems NOT handed off (claim lane)

**G — the optimization-level ladder.** Four named presets over the same underlying
flags, with user-set flags always winning over the preset, the default preset being the
production one, and the top rung documented as currently identical to the one below it
so the name can gain meaning later without a migration.
`docs/design/optimization_levels.md`. One decision; a technique-sized finding.

**H — deployment security posture.** Three decisions worth the claim lane:
authentication is scoped to a PATH PREFIX and the document enumerates every endpoint
outside it, including one that reaches the same inference functions and several that
cause denial of service (`docs/usage/security.md:768-878`); decode limits are set on
each expansion stage separately, with one guard existing specifically because an
inflated declared sample rate defeats the duration guard while the real frame count
still allocates gigabytes (`:710-728`); and the cluster environment is propagated
copy-all-except-denylist, documented as a credential-leak shape with the reasoning for
why isolating it would not be a real boundary (`:1063-1160`).
