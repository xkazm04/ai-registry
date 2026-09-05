---
source: cargo-make (second lens - language craft)
kind: practitioner build-tool repository (single maintainer)
url: https://github.com/sagiegurari/cargo-make
title: "cargo-make — task runner and build tool"
author: sagiegurari
words: 13,145 lines non-test source (the surface actually read this run)
commit: 95dcc545db8cf08af6fbec524e200e7c80b06027
extracted: 8
accepted: 3
declined: 0
leads: 0
already_covered: 0
untriaged: 5
dispatched: 0
applied: 3
shipped: 1
run_id: cargomake-01
siblings: 0 on the board (1 unclaimed session writing in the tree - see below)
---

# cargo-make, read for language craft rather than architecture

**This tree was already mined today** — `2026-09-04-cargo-make.md`, run
`cargomake-0904`, nine load-bearing design decisions across five systems, routing
count written, forge trigger not met. That run's ten candidates are all
architecture. The operator asked this run for *proficiency in code design*: type
modelling, error representation, ownership, the abstraction mechanisms the
language offers and what this codebase does instead.

Phase 2b names that as a separate pass — *read for reusable engineering, not only
for claims* — and the prior note has zero rows in it. So this is a second lens on
the same commit, not a delta and not a re-derivation. Same clone,
`95dcc545db8cf08af6fbec524e200e7c80b06027`, so the two notes are directly
comparable.

## Class read and predicted yield

Practitioner build-tool repository, single maintainer, mature, eight years old.
For a **craft** lens the prediction is different from the architecture lens and
worth stating: high on error representation and the boundary types, low on
abstraction machinery, and the yield concentrated in **what the language made
easy and what it made expensive**. That held. The three landings are all about a
type carrying a contract; the untriaged rows are all about abstraction the tree
declined to build.

## What the sweep found, as a shape

Three counts frame the whole run, and none is a criticism on its own:

- **Zero trait definitions in 13,145 lines of non-test source.** Not "few" —
  zero. The only `trait` token in the tree is a doc comment in
  `completion.rs:16` proposing one. Seven impls of *foreign* traits exist
  (`Box<dyn Command>` for the embedded scripting SDK), so the abstraction
  boundary is entirely at dependency edges.
- **Five generic functions**, three of which are serde plumbing.
- **347 `.clone()` calls** in non-test source, against 38 `unwrap`/`expect` and
  exactly **two** `unsafe` blocks, both in `error.rs`.

That is a coherent and defensible stance for a single-binary CLI with a
closed world: enums and match instead of trait-object polymorphism, free
functions in modules instead of interfaces, cloning instead of lifetime puzzles.
The craft findings are not "it should have used traits" — they are the three
places where a type is doing contract work and one of them is doing it wrong.

## Triage table (v2.5 scored)

| # | Shape | Title | Prior art (subject) | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | technique | The state carrier decides the lane | module-design (`concurrency-at-the-edge`) | real gap | 3/0/2 | **accept** |
| 2 | technique | Shape with a not-applicable member | invariant-placement (Shape altitude) | real gap | 3/0/2 | **accept** |
| 3 | technique | The exit contract is a taxonomy projection | error-handling (`taxonomy-design`) | real gap | 2/0/2 | **accept** |
| 4 | amendment | A module opting out of the error type opts out of the exit contract | error-handling | partial | — | folded into 3 |
| 5 | technique | Reflection standing in for a bound the newtype permits | native-guest-interop (`typed-downcast-access`) | partial | — | untriaged |
| 6 | amendment | Unsafe where a derived safe instrument is in scope | native-guest-interop | partial | — | untriaged |
| 7 | lead | Zero own traits, seven foreign impls | module-design | partial | — | untriaged |
| 8 | lead | Tri-state `Option<bool>` as the merge layer's correctness requirement | settings | likely catch | — | untriaged |

`auto=3/0/0`, `fp=0`. No vetoes fired: none of the three targets is a category at
`MAX_CHILD_DIRS` (all three are technique additions to existing subjects), all
three rest on code read in-run rather than on prose, none is a law, and all three
strip clean. **Zero of three web fetches spent** — the class predicts corpus-
internal corroboration and it held, as it did for the architecture run.

Row 4 was folded rather than landed separately because the coverage failure *is*
the projection technique's boundary: the mechanism's value is proportional to the
type's coverage, and stating it as a separate amendment would have split one rule
across two documents.

## The three landings

**1 — `module-design/state-carrier-decides-the-lane`.** Flow state is threaded as
`Rc<RefCell<FlowState>>` (32 sites). `Rc` is `!Send`, so the parallel lane at
`runner.rs:238-247` deep-copies the state out, moves the copy into the thread,
and rebuilds a fresh `Rc<RefCell<_>>` inside it. `FlowState` has exactly two
fields — `time_summary` and `forced_plugin` — and **neither is per-branch state**,
so every parallel-forked task is silently absent from the time summary. The
README's parallel hazard list (`README.md:618-620`) names `cwd` and neither of
these. The nearest neighbour, `concurrency-at-the-edge`, asks where the
concurrency model should live and assumes the question is open; this is the
missing stage in front of it — the representation answered it first.

**2 — `invariant-placement/shape-with-a-not-applicable-member`.** `EngineType`
(`scriptengine/mod.rs:27-45`) carries seven members, the seventh being
`Unsupported`. The producer audit says no path through `get_engine_type` can
return it — every branch maps it onto `Generic`, `OS` or `Shebang` in the next
statement. So `invoke`'s exhaustive match carries an arm the checker *compelled*
someone to write for an unreachable state, and the cheapest arm that compiles was
`Ok(false)` (`mod.rs:310`), which the caller reads as "this task had no script".
The Shape altitude did not regress to Door; it regressed past Call-site, to a
runtime handler nobody designed that reads as deliberate.

**3 — `error-handling/exit-contract-is-a-taxonomy-projection`.** `error.rs` is the
best thing in the tree: `#[repr(u16)]` with an explicit discriminant per variant,
so the process's exit code is declared with the failure kind and cannot drift from
it, banded 100-110 / 700-731, with `NotFound = 404` borrowing a recognisable
number, and a correct narrowing rule at the byte boundary (out-of-range collapses
to `FAILURE` and prints the real number, rather than truncating into another
kind's code). And the same tree shows the coverage failure: `completion.rs`
returns `Box<dyn std::error::Error>`, so the one peripheral subcommand's failures
leave the taxonomy before the boundary and cannot carry a code. A source that
implements a good idea well *and* demonstrates its boundary in the same commit.

## Untriaged — anchors kept, no judgment formed

- **5 — reflection instead of a bound.** `SuccessOrCargoMakeError<T>`
  (`error.rs:135-181`) exists because the orphan rule forbids
  `impl Termination for Result<T, CargoMakeError>` — the comment says so. Having
  made the newtype, the impl then uses `TypeId::of::<T>() == TypeId::of::<ExitCode>()`
  plus a `downcast_ref().unwrap()` to emulate specialization, where
  `impl<T: Termination> Termination for SuccessOrCargoMakeError<T>` would delegate
  in three lines with no `Any` bound. `main.rs:37-43` is the only caller and
  always passes `ExitCode::SUCCESS`, so the branch that justified the machinery is
  never exercised. Nearest prior art is `native-guest-interop/typed-downcast-access`,
  whose subject scope is guest-heap crossings, not orphan-rule workarounds.
- **6 — unsafe where the safe instrument is already derived.** `discriminant()`
  (`error.rs:77-79`) reads the tag via `*(self as *const Self as *const u16)`,
  while `strum_macros::EnumDiscriminants` sits unused in the same derive list
  four lines above. Separately, `error.rs:172` calls `raw_os_error()` twice and
  uses `unwrap_unchecked` under a match guard that already tested `is_some()`.
  Both are sound; both spend `unsafe` where restructuring is free. This is a
  boundary case of `native-guest-interop`'s organising rule (*the safe surface is
  narrowed by a type bound until the invariant can be checked, and the wider
  surface is spelled unsafe with its obligation beside it*) at a boundary that
  subject does not own.
- **7 — zero own traits, seven foreign impls.** Worth a lead rather than a
  finding: the interesting question is not "why no traits" but whether a codebase
  whose only abstractions are imported has a measurable property — and I have no
  instrument for that. **Return condition:** when a second single-maintainer CLI
  of comparable size is mined and the count can be compared.
- **8 — tri-state `Option<bool>`.** 38 `Option<bool>` and 72 `Option<String>` in
  `types.rs`; `None` means "not declared here" and `Some(false)` means "explicitly
  off", which is what makes the descriptor merge work at all. Correct modelling,
  and probably already covered by the architecture run's `settings` landings.

## Phase 7.5 — three techniques, three rows

**3 (`exit-contract-is-a-taxonomy-projection`) — mode `code`, verdict `better`,
shipped.** The seam is this registry's own `scripts/` lane, which is exactly the
consumer class the technique is about: hooks, CI steps and skill procedures that
receive an integer. The measurable is *distinct incompatible meanings sharing one
exit code*, and arm A carries three on code `3`:

- `run-board.mjs` (4 sites) — CONTENDED, transient, a retry is meaningful
- `research-ingest.mjs:400` — source too thin, permanent, a retry can never help
- `upstream-check.mjs:668` — rows are due, which is not a failure at all

A caller that retries on 3 loops forever on a thin source and treats due upstream
rows as an error. Codes 0/1/2 held a consistent convention across ~30 scripts
with no declaration anywhere, and broke at `3` — the first code added by a later
script — which is the technique's prediction about where an undeclared vocabulary
fails.

Landed `scripts/lib/exit-codes.mjs` (the declaration, with the three live
meanings on `3` recorded as `KNOWN_COLLISIONS` rather than renumbered, because
changing a live code breaks callers mid-flight) and `scripts/check-exit-contract.mjs`
(the gate, which asserts itself against a planted positive before reporting).
Paired A/B, same tree, same injected drift — a new script exiting `4` with a novel
meaning:

| arm | instrument | result |
| --- | --- | --- |
| A | `check-bundles`, `check-skills` | `0`, `0` — blind |
| B | `check-exit-contract` | `1` — detected, with file and line |

`build-index --check` reads `1` in both arms (a stale index from this run's own
new knowledge files), so it is a constant and not a signal; the confounder was
confirmed by re-running it with the probe removed. Baseline census: 134 exit
sites across 42 scripts. Committed as `45aeba4a`, verified in `HEAD`, not pushed.

**2 (`shape-with-a-not-applicable-member`) — mode `experiment`, verdict `better`,
no code change.** The seam is `personas`, `src/api/liveRoadmap.ts:95`:
`LiveRoadmapFailureKind = 'offline' | 'timeout' | 'http' | 'schema' | 'unknown'`
— the same surface shape as `EngineType`, a failure taxonomy ending in a member
that means none-of-these. The producer audit clears it: `classify()` at
`liveRoadmap.ts:123-133` reaches `'unknown'` as its final fallback for any
unmatched message, so the member has a producer, is reachable, and is meaningful
to a consumer deciding what to show. This is the honest exception the technique
carves out.

The two cases are the A/B, and they are a matched pair: **identical at the type
declaration, opposite in verdict, separated only by the producer audit.** That is
the technique's discriminating power measured rather than asserted — eyeballing
the union tells you nothing, one grep for producers tells you everything. No
change is owed to `personas`.

**1 (`state-carrier-decides-the-lane`) — mode `experiment`, verdict `not-better`,
technique amended.** The seam is `personas`,
`src/features/agents/sub_executions/libs/comparisonDiffWorkerClient.ts` — a real
`Worker` boundary where everything crossing is structure-cloned. The technique
predicted accumulator loss and found none, for a reason worth having: the module
*does* hold accumulators (`lineCacheEvictions`, `jsonCacheEvictions`, two LRU
caches at lines 27-47) but they live on the calling side and are written when the
reply resolves, while `postMessage` carries `{ id, kind, left, right, chunkSize }`
— a request assembled at the call site, not a snapshot of state the caller already
had.

That is the technique's own primary repair reached by default. The row is
`not-better` and it bought the technique a precondition it did not have: it
triggers on **an existing shared carrier copied in order to cross**, not on a
payload built for the crossing, and a seam failing that precondition needs no
field classification and must not be reported as a clean result. Added as
*"Where it does not apply: a payload built for the crossing"*.

## Notes for the next run

- **The gate was red on a file nobody claimed.** Mid-run,
  `check-bundles` failed on
  `agent-runtime-assembly/applications/node--operator-tier-code-loading.md`
  (`stack: node`, `verified_against: bun@1`), alongside uncommitted modifications
  across `quality-gates` and `agent-runtime-assembly` from a session **not on the
  board**. It cleared on its own before the commit. Per the method the file was
  left alone and named rather than fixed, and **the index and catalog were not
  regenerated**, because a regeneration would have baked that session's
  uncommitted work into an artifact committed under this run's name. The index is
  therefore stale for this run's three techniques — a known, self-correcting
  state, and the safer of the two.
- **A second lens on a mined repository is cheap and was worth it.** The
  architecture run and this one share a commit and overlap in zero candidates.
  The prior note's own sweep list shows why: it read `types.rs` as "the real data
  model" and `error.rs` not at all, because a design read is looking for forces
  and a craft read is looking for what a type is being asked to carry. Worth
  proposing as a standing option for repository sources rather than a one-off.

## Corroboration

Zero of three fetches. All three landings rest on the tree read in-run plus
training-data convergence: thread-confinement forcing copy-and-discard is
converged across every runtime with a shareability bound; absence-as-a-member
degrading an exhaustiveness proof is converged across every language with sum
types and exhaustive matching; exit status as a projection of an error taxonomy
is converged across CLI and process-supervisor practice.

`rescan_when:` a release lands that touches `scriptengine/mod.rs`'s engine
resolution — the `Unsupported` arm is the most likely thing to change and the
finding in row 2 is falsified if a producer appears; or `completion.rs` adopts
`CargoMakeError`, which would close the coverage gap in row 3; or 12 weeks elapse
(2026-11-27).
