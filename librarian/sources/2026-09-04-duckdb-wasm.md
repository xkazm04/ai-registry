---
source: github:duckdb/duckdb-wasm
kind: first-party practitioner codebase in repository form - a system
url: https://github.com/duckdb/duckdb-wasm
title: DuckDB-Wasm
author: duckdb (org)
commit: def100b4be91a8ba27d441914e496231695ba0a8
words: 626 README / 1533 total markdown in tree / ~18.6k lines C++ / ~17.2k lines TS
extracted: 13
accepted: 4
declined: 0
leads: 2
already_covered: 1
untriaged: 6
dispatched: 2
run_id: duckdb-wasm
siblings: 0 at claim, 2 by Phase 7
fetches: 0/3
applied: 1
shipped: 2
---

# duckdb-wasm

An analytics engine compiled to run inside a browser sandbox, with a C++ core, a
TypeScript control layer, a comparative benchmark suite and a set of carried
patches against its own upstream. Mined as a **system**, not as a set of claims.

## The container check, and what it changed

The ingest on a repository URL returns the rendered landing page. Here that is
**626 words**, and the whole tree carries **1,533 words of markdown across four
files** - no `docs/`, no `design/`, no `ADR/`, no release notes. A sweep that
treated "no design folder" as "no design record" would have mined the
advertisement.

The design rationale is in **source header comments and header files**: a
40-line ASCII diagram of the I/O stack above the buffer manager
(`file_page_buffer.h:31-52`), the forces for latency-class routing stated in
prose in the same block, and the probe ladder documented inline in the runtime
(`runtime_browser.ts:252-350`). This is the second consecutive repository run
where the operating documents were inside the source files; the sweep order is
right, but the tell is a header whose comment-to-code ratio is inverted.

## Routing count (Phase 2d, v2.2, both clauses) - computed BEFORE extraction

| System | Entries | `corpus: NONE` | `HOME IF NEW` |
| --- | --- | --- | --- |
| **A - remote access-protocol selection** | 4 | **3** | `se/backend-platform/resilience` |
| B - latency-class buffering and paging | 4 | 3 | none existing |
| C - capability-tiered build artifacts | 2 | 1 | `build-and-release` (exists) |
| D - comparative benchmark honesty | 1 | 1 | `llm-obs/quality-scoring` (exists) |
| E - sync/async resource lookahead | 1 | 1 | none |
| F - upstream fork switch subdivision | 1 | 1 | none |

**System A fired the per-system clause at exactly 3, sharing one home-if-new.**
Handed off as a scoped subject forge in-session - the system, not the
repository.

**The count changed what got extracted, not only what got routed.** This is the
check round 10 asked the next repository row to make. After the count I stopped
sweeping the shell and app packages for claims and spent the remaining sweep
inside the HTTP lane and the buffer manager. Rows 11 (the defect) and 5-7 exist
only because of that redirection; a whole-tree count would have read 10 NONE,
handed off the repository, and never opened `web_filesystem.cc`'s serialization
sites.

## The two denials that made System A a subject rather than an amendment

A design decision always overlaps some subject, so it always reads `partial`.
The promoting question here was: *does any subject model this decision's
forces?* Two subjects turned out to **explicitly deny the case**, and neither
denied too much - each correctly excluded a case that then nobody owns:

- `operations/service-operations/health-checks/techniques/probe-design.md`:
  "a probe that runs an expensive representative workload is measuring
  performance, a different discipline; health asks only *does it work at all*."
  Liveness, not protocol selection.
- `backend-platform/resilience/optional-dependency-degradation/techniques/probe-the-grant-not-the-config.md`:
  "The narrow rule here is about the *input to the branch*: the grant, not the
  config", and "A startup probe that performs a real write to find out is almost
  never right". Its whole frame is a dependency **you own and can harden**.

`ui-surfaces/feedback-and-style/adaptive-fidelity-tiers` owns the same slogan -
measure, do not trust the declaration - for the **local device you are already
running on**, where the probe is free and repeatable. Every force inverts here:
the probe costs a round trip, its answer is per-peer, and the fallback changes
the cost model by orders of magnitude.

So the gap is a **stage**: choosing the access protocol for a remote you do not
control, before the first real read, at a cost.

## Absence checks

- `readahead` returns **zero corpus-wide** from `research-map`. Verified
  uncapped rather than from a piped result: `grep -ril` for four spellings over
  `knowledge/` returns 37 files across 28 directories, none of which is a
  subject about read-ahead - the term appears incidentally. A concept returning
  zero is a finding.
- No absence in this run was established from a proper-noun query. The
  vocabulary of this source (the engine name, the sandbox name, the object-store
  name) returns zero by construction against the purity gate and measures
  nothing.

## Candidates and outcomes

**Accepted and landed**

1. **System A as a subject** (rows 1+2+3) - `backend-platform/resilience/remote-capability-probing`,
   forged in-session from a spec, one worker, diff-reviewed here. Placement
   verified against `taxonomy.json`: `resilience` is a flat category with a
   9-entry `subjects` array and no `categories`, so a 10th subject is additive
   and legal.
2. **`handicap-disclosure-in-the-result-row`** in
   `llm-observability/quality-scoring/cross-provider-benchmark-operations`.
   The mechanism: in a comparative benchmark the publisher wins, the concession
   made to each competitor to make the workload runnable is a **typed field on
   the result row**, carried into the published result set and rendered at the
   point of comparison. Anchors: `system_benchmark.ts:19` (`warning?: string`),
   `suite.ts:38-46` (spread into the same flat result object as the timings),
   `benchmark_reader.ts:18,64` (survives as a column), `benchmark_table.tsx:121-131`.
   Two of my readings were corrected by the worker against the tree and both
   corrections verified: the concession clears for exactly four query ids
   (13, 14, 16, 18), so it is **per-benchmark, not per-system**; and the cell
   renders `{value} *` **at rest** plus a hover tooltip - the asterisk is the
   load-bearing half, because a hover-only caveat dies the moment the chart is
   screenshotted.
3. **Rows 5 and 7** folded into the new subject as `buffer-by-access-latency-class`
   and `instrument-by-cause-not-by-hit-rate`, on the worker's judgment that
   their force is the same one.
4. **Row 11, the defect** - see below.

**Already covered (a catch)**

- Row 4's neighbour question: announcing that a deployment silently ran in
  fallback mode is already `optional-dependency-degradation`'s ground
  (`use_when` names it explicitly). Only the cost-model-break half was new.

**Untriaged, with anchors - unverified, nobody declined these**

- Row 6, adaptive read-heads: geometric ramp (base 16KB, x4, cap 16MB), 10 heads
  per thread, invalidation by an atomic mask FETCH_OR'd with the file id
  (`readahead_buffer.h:21-24, 47-70`).
- Row 8, a capability-tier set encoding its mandatory floor **in the type**:
  `mvp` is required and `eh?`/`coi?` optional in `DuckDBBundles`
  (`platform.ts:31-45`), so the floor tier cannot be omitted by construction.
- Row 9, capability built but not offered: the highest tier is compiled and
  shipped but deliberately excluded from the default bundle set with the comment
  "COI is still experimental, let the user opt in explicitly" (`platform.ts:57`).
  Likely a boundary case inside `declinable-capability-split`.
- Row 10, lookahead resource acquisition: the async layer **parses the query
  text** to pre-resolve every sandboxed-filesystem handle the synchronous engine
  will need, and drops them in a `finally`, because the engine cannot await
  mid-execution (`async_bindings.ts:449-460`, `config.ts:36-42` for the
  auto/manual switch).
- Row 12, subdividing an upstream's coarse switch: an 841-line carried patch
  whose substance is splitting one size-reduction macro into a finer-grained one
  rather than choosing a side of it (`patches/duckdb/all_of_them.patch`),
  applied at build time via `make apply_patches`.
- Row 13's remainder: extensions are lazily fetched rather than bundled, and
  multithreading ships disabled by default.

## The defect at the source's own default (row 11)

**The flag that disables this system's headline capability defaults to on.**

`force_full_http_reads` is `std::nullopt` at both declaration sites
(`config.h:77`, `config.cc:52`), and **both** serialization sites read
`.value_or(true)` (`web_filesystem.cc:329` per-file, `:524` global). An
unconfigured session therefore emits `forceFullHttpReads: true` to the control
layer, which short-circuits both range probes (`runtime_browser.ts:252` and
`:286`) and takes the whole-object download path for every remote file.

Three things make this a defect rather than a decision:

- **`allow` and `force` push in opposite risk directions** - `allow=true` widens
  capability, `force=true` narrows it - yet both carry the identical
  `.value_or(true)` idiom. That is the signature of a copied line.
- **If `force` defaulted true deliberately, `allow_full_http_reads` would be
  dead code in the default path**, which is exactly what it is today.
- **The test that enumerates the serialized flags checks the other two.**
  `webdb_test.cc:151` asserts `allowFullHttpReads` and `s3Config` are present
  and never mentions the third. This is the enumeration hunt applied to a test:
  an enumeration is a claim, and the member it omits is the question.

Recorded as a **lead** for upstream rather than asserted as unknown to the
maintainers - I did not spend a fetch on the issue tracker, and the structural
evidence stands on its own without that. **Return condition: when someone reads
the upstream tracker, or when a later run mines this repository again, check
whether the default moved.**

## Applied (Phase 7.5)

One row, `code` mode, verdict `better` - `tracklight` commits `462d0f1` and
`1d78064`, pathspec, **not pushed**.

The seam: `tracklight`'s agent collapses two causes of an empty capability
advertisement - "I read my library and it holds nothing runnable" and "I could
not read my library at all" - into the same empty vector
(`crates/agent/src/inventory.rs`), and the cloud reads empty as *no filter*, so
a device with a mistyped `actions_dir` leases every action type in the fleet.
The collapse is deliberate for routing and was **not** changed; the wire value
is bit-identical and the pre-existing back-compat test passes unmodified. What
was fixed is that the startup banner - whose stated job in its own comment is to
answer "why is nothing being picked up" without reading the cloud's logs - could
not name the likelier cause.

**The structural fact, which nobody designed:** one line above the inventory
call, `main()` probes the engine binary and refuses to start with a message
naming both the path and the config file it came from. Two capability checks a
line apart, one fatal and actionable, the other silent. That fell out of the two
being added at different times, and it is better evidence for the technique than
the code the run then wrote.

Measurable: distinguishable causes for an empty inventory at the operator's
first diagnostic surface **1 -> 2**; crate tests **22 -> 23**; `cargo fmt
--check` clean; `cargo clippy` clean.

**Fleet reach: 1 of 8.** All eight authorized trees were checked for a seam.
`gravity` already implements the discipline and **states the rule
independently** in `lib/capabilities.ts` - "'the model is reachable' and 'this
app can drive it' are different claims and only the first is measured" - which
is convergence and was recorded as corroboration rather than converted into a
manufactured change. `pumper`'s capability code is guest-sandbox ground a prior
run already covered. `politicas`, `grant`, `goat`, `kp` and `personas` have no
seam. `gravity`'s text router was examined closely for a second seam at
`router.ts:281` (`provider.enforcesSchema` is a static declaration trusted
without a probe) and **cleared**: the adapter appends the schema instruction
itself when the schema is not natively expressible (`google.ts:256`) and reports
the enforcement it actually performed, so the declaration cannot silently lose
the constraint.

## Leads

- **The upstream default above.** Return condition stated.
- **A benchmark harness that admits n=1.** `system_benchmark.ts:44-45` sets
  `maxTime: 5, minSamples: 1` for a **cross-system comparison**, so a published
  competitive number may stand on a single sample. The corpus's
  `a-claim-carries-its-sample-and-its-basis` law says a claim carries its
  sample; this harness carries `samples` in its result schema but sets no floor.
  Return condition: when a run mines a second comparative harness that does set
  one, the pair is a technique about where the floor belongs - the harness or
  the renderer.

## Parallel-run facts worth the note

Board read at Phase 1 showed **0 live siblings**. By Phase 7 there were **two**
(`pi-2026-09-04` at phase 7, `flatnotes-2026-09-04` at phase 4), and their
uncommitted files appeared in this checkout mid-run - a worker flagged two
modified files that were not its own, which is exactly the signal the board
exists to make legible. Neither sibling held either of this run's subjects;
`check` returned clear before the first write. The ledger answers "was this
mined"; only the board can see the sessions whose notes do not exist yet.

`build-index --check` reported `software-engineering/index.json` stale against a
**clean tree** at Phase 1 - pre-existing committed staleness, not a sibling's
WIP.
