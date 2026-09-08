---
spec: remote-capability-probing
status: PROPOSED
date: 2026-09-04
source: librarian/sources/2026-09-04-duckdb-wasm.md
bundle: software-engineering
category: backend-platform/resilience
placement_verified: "taxonomy.json - resilience is a FLAT category with a 9-entry subjects array and no categories key; a 10th subject is additive and legal. Resolved path knowledge/software-engineering/backend-platform/resilience/remote-capability-probing/. Link depth from a technique to the laws file is ../../../../_laws.md, matching sibling optional-dependency-degradation/techniques/*."
run_id: duckdb-wasm
---

# Subject spec: remote capability probing

## Why this is XL and not an amendment

The routing count fired: **three load-bearing design decisions in one subsystem
of the source tree, all with `corpus: NONE`, all sharing one home-if-new.** A
mechanism the corpus lacks gets a technique, and three with one home get a
subject.

More importantly, **two existing subjects each explicitly deny this case**, and
neither denied too much - they each correctly excluded a case that then nobody
owns:

- `operations/service-operations/health-checks/techniques/probe-design.md`:
  "a probe that runs an expensive representative workload is measuring
  performance, a different discipline; health asks only *does it work at all*."
  Health probing answers **is the peer alive**. This subject answers **how must
  I talk to this peer**, which is a different verdict with a different shelf
  life (per-peer, cached for a session, invalidated by a settings change).
- `backend-platform/resilience/optional-dependency-degradation/techniques/probe-the-grant-not-the-config.md`:
  "The narrow rule here is about the *input to the branch*: the grant, not the
  config", and "A startup probe that performs a real write to find out is almost
  never right". That subject's entire frame is **a dependency you own and can
  harden**. This subject's peer is a **third party you do not control, cannot
  configure, and whose behaviour you may only learn by spending a round trip**.

`ui-surfaces/feedback-and-style/adaptive-fidelity-tiers` owns the same slogan -
measure, do not trust the declaration - for the **local device you are already
running on**, where the probe is free and repeatable. Every force here is the
opposite: the probe costs a network round trip, its answer is per-peer rather
than per-session, and the fallback changes the cost model by orders of
magnitude.

So the gap is a **stage**, not an opinion: choosing the access protocol for a
remote you do not control, before the first real read, at a cost.

## Proposed techniques

Each must carry a decision rule, not a description.

1. **`advertised-support-is-not-evidence`**
   The peer's own declaration of what it supports is a hint, not a fact, and the
   standard-blessed advertisement is the weakest signal available. The decision
   rule: accept a capability only on a **response you provoked**, and name the
   exact observation that constitutes acceptance - a status code plus a header
   that could only be produced by the capability actually running. State why an
   advertisement header is not that observation: it is emitted by a layer that
   often is not the layer that would serve the request (a proxy, a CDN, a
   signing gateway).

2. **`the-probe-that-is-also-the-first-read`**
   The cheapest probe is one whose response is *useful work* if it succeeds. The
   decision rule: prefer a probe that requests the smallest genuine slice of the
   real resource over a metadata-only request, because the metadata verb is the
   one most often specially handled (and therefore the one that lies), and
   because a successful slice both proves the capability and returns bytes you
   keep. This is the technique that must **argue against** `probe-design`'s
   "smallest real interaction" rule rather than restate it: there, side-effect
   freedom dominates; here, the probe is a read and the scarce thing is the
   round trip.

3. **`assertion-permission-and-bypass-are-three-switches`**
   The single most transferable decision in the source. Operators need three
   *independent* controls over a probe ladder and they are routinely collapsed
   into one:
   - **assertion** - "I already know the answer, skip the probe" (an optimisation; wrong only costs correctness at the margin)
   - **permission** - "you may degrade to the expensive path if probing fails" (a policy; wrong costs money or latency)
   - **bypass** - "do not probe at all, go straight to the fallback" (an override; wrong disables the feature)

   The decision rule: these have different owners, different blast radii and
   different failure signatures, so they are separate switches with separately
   stated defaults. Carry the corollary that **a bypass defaulting to on silently
   retires the capability the system exists to provide**, and that the test which
   enumerates the serialized switches is where this is caught - cite the source's
   own instance (see the application).

4. **`the-degraded-rung-changes-the-cost-model`**
   A fallback ladder whose rungs differ in *kind* rather than in degree needs the
   transition announced, budgeted and retirable. Decision rule: when a rung
   converts a bounded partial read into an unbounded whole-object transfer, the
   ladder must state a size above which the fallback is a refusal rather than a
   degradation. Cross-reference `optional-dependency-degradation/fallback-retirement-condition`
   for the retirement half - do not restate it.

5. **`buffer-by-access-latency-class`**
   A filesystem-shaped abstraction hides how far away the bytes are, so a uniform
   buffering layer is simultaneously pure overhead for the near tier and
   insufficient for the far one. Decision rule: classify each backing store by
   access latency class at open time, buffer explicitly for every expensive class,
   and provide a **direct-I/O bypass** for the class that is already memory-speed.
   The bypass is per-file and set at open, not a global mode.

6. **`instrument-by-cause-not-by-hit-rate`**
   A cache or buffer instrumented as hits-versus-misses cannot distinguish the
   three things an operator needs separated: bytes fetched because they were
   demanded cold, bytes fetched speculatively that were never read, and bytes
   served from what was already resident. Decision rule: partition every byte
   counter by **why the fetch happened**, because prefetch waste and cold demand
   have opposite remedies and a hit rate averages them into a number that
   recommends nothing. Note the resolution trade the source makes - a capped
   block count with a widening shift, so histogram resolution degrades as the
   object grows rather than memory growing.

## Boundaries this subject must NOT absorb

- **Liveness and health verdicts** - `operations/service-operations/health-checks`. Say the boundary in one sentence in the golden path and move on.
- **Gating on your own dependency's grants and configuration** - `backend-platform/resilience/optional-dependency-degradation`. That subject owns the credential/config distinction and fallback retirement.
- **Local device capability measurement** - `ui-surfaces/feedback-and-style/adaptive-fidelity-tiers`.
- **Build-time capability splitting and shipped variants** - `engineering-process/build-and-release/build-economics`.
- **Cache admission, keying and eviction policy** - `client-architecture/client-fetch-cache`. Technique 6 is about the *instrument*, not the policy.
- **Retrying a request that failed** - `backend-platform/resilience/retry-backoff`. A probe that says "no" succeeded.

## Open questions the drafter must decide

- Whether technique 4 is really distinct from `fallback-retirement-condition`, or
  is a boundary case belonging inside it. **Read that file before writing.** If it
  is a boundary case, drop technique 4 and write the amendment there instead, and
  say so in the report.
- Whether 5 and 6 belong in this subject at all, or whether they are a second
  subject about heterogeneous-latency buffering. The count put them here because
  their *force* is the same one - the peer is far away and you learn how far by
  measuring - but the drafter has the neighbours open and may disagree.

## Instances a reader can open

- The source tree, pinned: `github.com/duckdb/duckdb-wasm` @ `def100b4`.
  - Probe ladder: `packages/duckdb-wasm/src/bindings/runtime_browser.ts:252-350`
  - The three switches: `lib/include/duckdb/web/config.h:74-78`, `lib/src/config.cc:105-116`
  - Latency-class buffering, in the tree's own words: `lib/include/duckdb/web/io/file_page_buffer.h:31-52`
  - Cause-partitioned instrumentation: `lib/include/duckdb/web/io/file_stats.h:29-58`
  - Adaptive read heads: `lib/include/duckdb/web/io/readahead_buffer.h:21-24`
- The defect that proves technique 3: `lib/src/io/web_filesystem.cc:329` and `:524`
  (`force_full_http_reads.value_or(true)`), with the enumerating test that misses
  it at `lib/test/webdb_test.cc:151`.

## Web budget

At most 2 fetches, on the partial-content standard and one CDN/object-store
vendor document about range-request support. The rest corroborates
corpus-internally.

## Override mandate

**Override this spec where the neighbours contradict it, and argue the override
in your report.** Placement, technique count and the two open questions above are
all negotiable; the boundaries list is not, because those subjects already own
that ground.
