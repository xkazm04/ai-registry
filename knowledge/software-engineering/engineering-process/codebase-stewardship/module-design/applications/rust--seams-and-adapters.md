---
layer: application
type: application
subject: module-design
technique: seams-and-adapters
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.89
---

# A runtime assembled from stream stages, seamed at one two-verb trait (rust)

`kube-rs/kube` is a Rust client and controller runtime for the Kubernetes API,
read at commit `7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e`. Version witness:
`Cargo.toml:27`, `rust-version = "1.89.0"`; no `rust-toolchain` file exists in
the tree.

The runtime crate states its structural ambition in its own first paragraph
(`kube-runtime/src/lib.rs:7-9`): newcomers should start with the `Controller`
builder, *"but all components are designed to be usable á la carte if your
operator doesn't quite fit that mold."* Á la carte is a claim about seams — it
says every stage can be lifted out and used alone — and the tree is worth
reading because it makes that claim good at three of four stages and pays a
measurable price at the fourth.

**Why this document is filed here and not under
[io-free-core](../techniques/io-free-core.md).** That technique's slot on this
stack is held by a transport implementation that takes the whole form. This
tree takes half of it: it has the explicit state machine and the transition
function returning `(item, next_state)`, but it keeps the I/O **inside** the
transition, behind a two-verb trait. That is the adapter answer to the
question io-free-core answers by deletion, and the verb-count rule the two
techniques share is exactly what decides it.

## The seam: two verbs, two real adapters, no double

`trait ApiMode` (`kube-runtime/src/watcher.rs:150-159`) is the entire
substitution surface of the watch stage:

```rust
trait ApiMode {
    type Value: Clone;
    async fn list(&self, lp: &ListParams) -> kube_client::Result<ObjectList<Self::Value>>;
    async fn watch(&self, wp: &WatchParams, version: &str)
        -> kube_client::Result<BoxStream<'static, kube_client::Result<WatchEvent<Self::Value>>>>;
}
```

Two verbs, and an associated `Value` so the adapter chooses what flows through.
Two adapters implement it, and **both are production paths**: `FullObject`
(`:163-165`, impl at `:434`) and `MetaOnly` (`:455`, impl at `:459`). The
enabling point is the public constructor — `watcher()` builds
`FullObject { api: &api }` at `:794`, `metadata_watcher()` builds
`MetaOnly { api: &api }` at `:862` — so the choice is made outside the code
that varies, which is the technique's definition of a seam rather than an
interface with a hard-coded answer.

Three of the technique's rules land cleanly here.

**The seam is substituted at, so it has had to be honest.** The technique's
fork — *either substitute at the seam, or stop paying for it* — is satisfied
without a test double at all: the second adapter is a real feature (watch only
the metadata of a resource, a materially cheaper stream), and its existence is
what forced `Value` to be an associated type rather than the object type
someone would have hard-coded with one implementation.

**The verb count is the tiebreaker, and it is two.** The technique says one or
two directions of flow is an input/output pair pretending to be a dependency,
and a dozen verbs is a capability. Two is the boundary case, and the tree
resolves it toward the adapter — defensibly, because both verbs return streams
whose lifetimes the stage manages, which is more than a value handed in.

**The adapter owns the outside thing.** Nothing downstream of the watch stage
names the client. The scheduler, the runner and the reflector all take streams
and values, so "can this run against something else?" is answerable by reading
one trait.

## The stages above it are seamed by stream type, not by trait

The rest of the runtime substitutes at an even cheaper boundary: the stream
itself.

- **The watch stage is a state machine over a stream.** `enum State<K>`
  (`:114-146`) has five variants — `Empty`, `InitPage`, `InitialWatch`,
  `InitListed`, `Watching` — each documented with the transition that leaves
  it. One function advances it: `step_trampolined(api, wc, state) -> (Option<Result<Event>>, State)`
  (`:507-517`), whose doc comment is the technique's own vocabulary — *"Progresses
  the watcher a single step, returning (event, state)"* — with a trampoline
  wrapper at `:719-735` that loops until a step yields an item. The public
  entry point is nine lines of `stream::unfold` over `(api, config, state)`
  (`:791-798`). Everything about the stage's behaviour is a function of the
  enum, which is why the desync path is a documented transition (`:137-140`)
  rather than an error handler.
- **The cache stage observes and passes through.** `reflector(writer, stream)`
  (`kube-runtime/src/reflector/mod.rs:112-131`) applies each event to a store
  and then yields the same event unmodified. The doc says so as a contract
  (`:18-21`): *"Observes the raw `Stream` of `watcher::Event` objects, and
  modifies the cache. It passes the raw `watcher()` stream through
  unmodified."* A pass-through observer is a seam with zero interface: any
  producer of the event stream composes with it, and removing it from the
  chain changes nothing but the presence of a cache.
- **The controller stage composes the others.** `applier`
  (`kube-runtime/src/controller/mod.rs:422-503`) is one expression:
  `stream::select` of the user's trigger stream and the scheduler's own
  requeue channel (`:424-442`), into `debounced_scheduler` (`:446`), into
  `Runner` with a concurrency bound (`:445-447`), with the whole runner held
  behind a readiness barrier — `delay_tasks_until(store.wait_until_ready())`
  (`:485-490`). Each of those four is separately public and separately
  usable; the builder is a convenience over them, exactly as `lib.rs:7-9`
  claims.

## The measurement that makes this more than a description

The price of keeping I/O inside the watch stage's transition is visible in the
test population at this commit, counted over each module's `#[cfg(test)]`
block:

| Stage | Inputs to the unit under test | Tests |
| --- | --- | --- |
| scheduler (`scheduler.rs:304+`) | values plus a controllable clock (`pause()`, `advance()` at `:328, 416, 442`) | 11 |
| runner (`controller/runner.rs:158+`) | values | 5 |
| reflector (`reflector/mod.rs:145+`) | `stream::iter(vec![Ok(Event::Apply(cm))])` at `:156` | 5 |
| **watcher FSM** (`watcher.rs:1004+`) | — | **5, none of which touch `step`** |

The watcher's five tests are three over `Config::to_watch_params` (`:1008-1029`)
and two over backoff arithmetic (`:1036, :1046`). The transition function — the
five-state machine that decides whether a disrupted watch retries or re-lists,
which is the most consequential logic in the crate — has **no unit test**,
because exercising it requires an `ApiMode` double, and no double exists. The
adapter discipline says a double counts as a substitution and is the cheap way
to buy honesty; here the second *production* adapter bought the interface's
honesty, and nobody then wrote the double that would have bought the logic's.

Beside it, the three stages whose inputs are plain values are tested by handing
them values. The reflector's five tests construct a writer, feed
`stream::iter` of hand-built events, and assert on the store (`:146-161`). The
scheduler's eleven advance time by assignment. That contrast is the technique's
"where can I test this in isolation" and "where should this be replaceable"
being the same question, answered four times in one crate with four different
amounts of ceremony — and the stage that needed the most ceremony is the one
that went untested.

## Deviations

**No shared contract exercise across the two adapters.** `FullObject` and
`MetaOnly` differ in what they return and are expected to behave identically
in every other respect — the same list semantics, the same pagination, the same
version handling. Nothing asserts that. A contract suite run against both is
the technique's first mechanism and it is absent; a divergence would surface
only as a metadata-only watcher behaving subtly unlike a full one, in a user's
cluster.

**The seam is private.** `trait ApiMode` is crate-private (`:150`), so the
á la carte claim in `lib.rs:7-9` does not extend to it: a consumer can compose
the *stages*, but cannot supply a third adapter — a recorded fixture, a
simulator, an in-memory source — without forking the crate. That is a defensible
API-surface decision and it is also precisely the thing that makes the missing
FSM test hard to add from outside. The standard does not move: the seam that
would make the crate's hardest logic testable exists, and is sealed.
