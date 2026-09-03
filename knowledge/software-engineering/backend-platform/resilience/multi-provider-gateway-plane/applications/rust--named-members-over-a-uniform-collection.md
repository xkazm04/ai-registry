---
layer: application
type: application
subject: multi-provider-gateway-plane
technique: named-members-over-a-uniform-collection
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.85
---

# A trait that is implemented eight times and dispatched through zero times

`AlexsJones/llmfit` at `d19380bac5d82c5cd3080ff1afef6d1dc20615bf` declares
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
an eight-member trait with per-member match rules and per-member failure policy
was built without dynamic dispatch, by an author who had both requirements and
no theory about them.
