---
layer: application
type: application
subject: multi-provider-gateway-plane
technique: named-members-over-a-uniform-collection
stack: rust
status: forged
verified_on: 2026-09-09
verified_against: rust@1.85
---

# A trait implemented seven times, dispatched through zero, in an aggregate of eight

`AlexsJones/llmfit` at `1e7bdb3ecf43071597ffd2eb2305dfac35e22a40` declares
`ModelProvider` (`llmfit-core/src/providers.rs:15-29`) with four methods —
`name`, `is_available`, `installed_models`, `start_pull` — and implements it for
every runtime it supports. It is the textbook setup for a
`Vec<Box<dyn ModelProvider>>`.

**The structural fact is that no such collection exists anywhere in the tree.** A
search across all 54k lines of Rust for `dyn ModelProvider`, `Box<dyn` over that
trait, or any vector of providers returns nothing. The trait is kept as a
uniformity contract — every adapter must answer the same four questions — and
the aggregate is built by naming its members. Nobody wrote that decision down as
a principle; it fell out of two requirements the collection could not have met,
and both are visible in one function.

**Correction, 2026-09-09 (delta re-scan).** This document previously said the
trait was implemented *eight* times. It is implemented **seven** times, and the
error was not a miscount so much as a conflation the tree invites: the aggregate
has eight members and the trait has seven implementations. `impl ModelProvider
for` appears seven times, all in `providers.rs` (`OllamaProvider`, `MlxProvider`,
`LlamaCppProvider`, `DockerModelRunnerProvider`, `LmStudioProvider`,
`VllmProvider`, `RamaLamaProvider`), matching seven `pub struct …Provider`
declarations. `providers.rs` is byte-identical between the originally cited
commit and this one, so the count was wrong when first written rather than
overtaken by the tree.

## The aggregate is a record with one field per member

`InstalledIndex` (`llmfit-core/src/analysis.rs:16-34`) has a named set and a
named count per provider: `ollama`/`ollama_count`, `llamacpp`/`llamacpp_count`,
`docker_mr`, `lmstudio`, `lmstudio_disk`, `vllm`, `ramalama`, `mlx`. Its doc
comment says why it exists: *"A single point of truth used by both the CLI and
the TUI... Replaces the scattered `HashSet<String>` fields that used to live on
each caller's struct."* The type is the inventory's documentation — reading it
tells you exactly which upstreams contribute.

**Match semantics differ per member, and the type carries the difference**
(`analysis.rs:26-29`):

```rust
/// Models found in LM Studio's models directory. Kept apart from
/// `lmstudio` because the API ids there are matched by substring, while
/// these directory-derived names are matched by equality.
pub lmstudio_disk: HashSet<String>,
```

Two sets from one runtime, deliberately not merged, because merging them would
leak a substring rule onto values that need equality — the exact erasure the
technique predicts a uniform collection performs.

## The fan-out and its per-member failure policy, in one screen

`InstalledIndex::detect_all` (`analysis.rs:64-101`) opens a `std::thread::scope`
and spawns eight probes by name. Its doc comment states the latency argument the
technique makes:

> Each provider query is issued on its own thread so that a single offline/slow
> backend (worst case ~1.5 s timeout) doesn't serialize into ~9 s of total
> blocking time for the CLI path.

Then, at the joins, seven members are `join().unwrap()` and one is not
(`analysis.rs:98-101`):

```rust
// Enrichment rather than a load-bearing provider: if the scan
// thread dies, report no disk models instead of taking the whole
// installed-model analysis down with it.
let (lmstudio_disk, lmstudio_disk_count) = lmstudio_disk.join().unwrap_or_default();
```

That is the technique's per-member failure policy, written at the join site, with
the comment the technique asks for — the one that stops a later maintainer from
"tidying" the odd line into consistency and silently promoting an enrichment
source into a dependency.

## The eighth member is not an implementation of the interface at all

The gap between eight members and seven implementations is where this tree
argues the technique harder than the technique argues itself. Seven of the
eight probes in `detect_all` construct a provider and call a trait method. The
eighth does not:

```rust
let lmstudio_disk = s.spawn(providers::scan_lmstudio_models_dir);
```

`scan_lmstudio_models_dir` is a free function. It is not a runtime, it has no
`is_available` and no `start_pull`, and there is no sensible implementation of
those for a directory walk. It is a second *view* of a runtime that already
appears in the aggregate under its own name.

This is the same member that carries both of the asymmetries above — the
equality-vs-substring match rule and the `unwrap_or_default` failure policy. So
the member most responsible for the technique's argument is the one member a
`Vec<Box<dyn ModelProvider>>` could not have held at all. Not "would have erased
its distinctions": **could not have contained it**, because membership in a
collection of an interface is decided by the type, and this member does not
implement the type.

That is a sharper cost than erasure and it is the one that stays invisible. A
uniform collection does not announce that it is filtering; the design question
*"should this source contribute to the inventory?"* is silently answered by
*"can it implement the trait?"*, and the two questions have different answers.
The choices left are to drop the source, or to force it through a stub
implementation whose unreachable methods are exactly the fake decisions a
closed set with a not-applicable member manufactures. Naming the members leaves
the question open where a human can answer it.

## The substrate claim holds here, and the tree states its own constraint

Concurrency is `std::thread::scope` over blocking calls; there is no async
runtime in the workspace. The dependency policy in `AGENTS.md` names the reason
in the form the technique predicts — one blocking HTTP client for the whole
program, *"Do not add a second core HTTP client without a concrete need"* — and
the constrained consumer is explicit elsewhere in the same file: the TUI's
render pass must not mutate state and its event loop is the sole mutator, which
is a synchronous loop that cannot await. Eight bounded, timeout-capped probes
once per refresh is precisely the shape the technique says threads win.

## What this tree does not prove

The technique claims the uniform collection is still right on the **request
path**. This tree has no request path — it never proxies inference — so it
supplies no evidence either way for that half, and a reader should not take the
absence of `Vec<Box<dyn>>` here as an argument against it there. What this tree
establishes is narrower and, for that reason, cleaner: on the *inventory* path,
an eight-member aggregate over a seven-implementation interface, with per-member
match rules and per-member failure policy, was built without dynamic dispatch by
an author who had all three requirements and no theory about them.
