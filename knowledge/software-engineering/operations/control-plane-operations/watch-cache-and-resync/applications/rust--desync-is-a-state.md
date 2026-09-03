---
layer: application
type: application
subject: watch-cache-and-resync
technique: desync-is-a-state
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.89
---

# Desync as a state, in a Kubernetes controller runtime

Read against `kube-rs/kube` at commit `7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e`
(workspace version 4.2.0). The version witness is the workspace manifest's own
floor: `Cargo.toml:27` declares `rust-version = "1.89.0"`, so the citations
below were resolved against `rust@1.89`. Every line number was re-opened this
run.

The Kubernetes apiserver is the archetype of a source with the four properties
the golden path demands: `resourceVersion` is a total order over a slice, a
watch may be opened at one, the stream carries whole objects rather than diffs,
and a `resourceVersion` that has fallen outside the apiserver's retained window
comes back as HTTP 410 Gone. `kube-runtime`'s watcher is what a reader of such
a source looks like when it is written as a state machine.

## The states, and the transition that has no state

`kube-runtime/src/watcher.rs:117-146` declares the machine as a private enum:

```rust
enum State<K> {
    #[default]
    Empty,
    InitPage { continue_token: Option<String>, objects: VecDeque<K>, last_bookmark: Option<String> },
    InitialWatch { stream: BoxStream<'static, Result<WatchEvent<K>>> },
    InitListed { resource_version: String },
    Watching { resource_version: String, stream: BoxStream<'static, Result<WatchEvent<K>>> },
}
```

The doc comment on `Watching` at `:135-140` states the two-family split in the
tree's own words — *"If the connection is disrupted then we propagate the error
but try to restart the watch stream by returning to the `InitListed` state. If
we fall out of the K8s watch window then we propagate the error and fall back
doing a re-list with `Empty`."*

`step_trampolined` (`:512-717`) is the single step function, typed
`(Option<Item>, State)`; `step` (`:722-737`) trampolines it until an item is
produced. Desync is written twice, once per state that holds a stream, and both
sites are three lines and identical — `:610-614` inside `InitialWatch` and
`:686-690` inside `Watching`, each carrying the same comment:

```rust
// HTTP GONE, means we have desynced and need to start over and re-list :(
let new_state = if err.code == 410 { State::default() } else { /* stay */ };
```

`State::default()` is `Empty`, so the desync target is the machine's start
state and there is no "desynced" state to linger in. Every other watch error
keeps its state (`:691-694`, `:700-707`), which is the reciprocal rule.

Three confirmations of the technique's sharper claims:

- **An item without a position is a desync, not a warning.** `:660-664` and
  `:671-675`: an `Added`/`Modified`/`Deleted` whose `resource_version()` is
  empty yields `Error::NoResourceVersion` and `State::default()`. The same
  check guards the initial list at `:566-569`, where a list response carrying
  neither a version nor a continuation token resets to `Empty`.
- **End-of-stream routes by state.** The idle-timeout `None` arm resolves to
  `State::InitListed { resource_version }` while following (`:714`) and to
  `State::default()` during the initial watch (`:632`) — one input, two
  destinations, decided by which state received it.
- **The client arms its own idle timeout.** `:480-505`:
  `WATCH_IDLE_TIMEOUT_MARGIN` is 5s added to the configured watch timeout
  (default 290s), with the reason written above it — *"the client detects dead
  connections where the server's close never arrives (e.g. network failure)"*.

## The quiet-slice hazard, named in the tree

`:359-368` documents `disable_bookmarks()` as *"not recommended to use with
production watchers as it can cause desyncs"*, citing issue #219. Bookmarks
default to on (`:266`). This is the technique's counter-intuitive corollary
confirmed from the other side: without periodic no-op progress markers a
`resourceVersion` only advances on change, so the slice that changes least ages
out first.

## Deviations

Five, recorded against the standard rather than against the tree's intent.

1. **The state machine is not driven by any test.** `ApiMode` is a private
   trait with exactly two implementations (`:434-457` `FullObject`, `:459-478`
   `MetaOnly`), both thin wrappers over a live `Api<K>`, and there is no
   in-tree fake. The test module at `:1004-1098` covers `to_watch_params`
   phase selection, the exponential backoff and `next_with_idle_timeout`, and
   never calls `step_trampolined`. The design has the shape the technique
   prescribes and none of the benefit: the desync transition, the two
   `NoResourceVersion` resets and the end-of-stream asymmetry are all
   unexercised. One test-only `ApiMode` impl over a scripted `VecDeque` of
   `WatchEvent`s would close all four cases named in the technique.
2. **The store's key does not survive reuse.**
   `kube-runtime/src/reflector/object_ref.rs:144-145` marks
   `ObjectRef::extra` — which holds `uid` and `resource_version` — as
   `#[educe(Hash(ignore), PartialEq(ignore))]`, so cache identity is
   `(dyntype, name, namespace)` and a delete-then-recreate under one name is a
   single key across a swap. The same tree fixes exactly this a directory away:
   `kube-runtime/src/utils/predicate.rs:25-31` defines `PredicateCacheKey` with
   `uid` in its equality, and its doc comment says why. The store's key is a
   deviation the tree already knows how to correct.
3. **The fan-out parks a consumer without arranging a wake.**
   `kube-runtime/src/reflector/dispatcher.rs:134-143`: `ReflectHandle::poll_next`
   takes an `ObjectRef` off the broadcast channel and does
   `.map_or(Poll::Pending, |obj| Poll::Ready(Some(obj)))` — so a reference whose
   object has already left the store returns `Pending` after the receiver was
   consumed and with no waker registered. The subscriber then sleeps until an
   unrelated broadcast wakes it. The technique requires the absent-entry case
   to be a decided outcome (act on deletion, or drop the notification); parking
   is neither.
4. **The page size is pinned, not derived.** `:265-267` sets
   `page_size: Some(500)` with the comment *"same default page size limit as
   client-go"* and a link to that client's source. That is a compatibility
   argument, and a defensible one, but the technique asks for a memory budget
   over a worst-case entry size — which is the number the module's own memory
   section (`reflector/mod.rs:63-99`, *"~2000 pods … a couple of hundred
   megabytes"*) is otherwise able to compute.
5. **The predicate cache TTL is reasoned but not derived.**
   `kube-runtime/src/utils/predicate.rs:141-149` sets one hour with *"long
   enough to avoid unnecessary reconciles but short enough to prevent unbounded
   memory growth"* — a rationale in prose with no computed input, so it will
   not move when either side of the trade does.

## Upward lessons taken into the standard

Two claims in the technique came from this tree rather than from the draft. The
end-of-stream asymmetry (`:632` versus `:714`) supplied the qualifier that a
clean stream end resets to `Empty` when no complete snapshot exists yet — the
draft had the rule without the exception. And `WATCH_IDLE_TIMEOUT_MARGIN`
(`:480-505`) supplied the rule that the reader arms its own idle timeout at the
source's close interval plus a margin, rather than relying on the close
arriving; the draft treated end-of-stream as something the source announces.
