---
layer: application
type: application
subject: trust-base
technique: marker-impl-names-its-exclusion
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.88
---

# Eight hand-written marker impls around one publish protocol, in a requirements-traceability tool

Witness: the `duvet-core` package of the duvet tree at commit
`44f43e87683ae6077c64f4aa8fd519910c981fb6` (`rust-version = "1.88"`, edition 2021).
Read this application with one caveat about the instrument. The clone at
`C:/t/duvet-1014` is not the pinned commit byte for byte: the director's compile
experiment of 2026-10-14 (stable 1.97.1, `cargo check -p duvet-core`) left it in the
shrunk state, so the numbers below describe both states and say which. I could not
run the compiler or read git history in this session, so the experiment's results
are the director's and the anchors are those of the clone as it stands.

## The measurement, as handed over

At the pinned commit the package had ten manual impls. The experiment, in the
director's words: baseline green; replacing the phantom field `PhantomData<R>` with
`PhantomData<fn() -> R>` and deleting the two impls on the type map stays green;
deleting the impls on the delegating state fails on exactly one field, the boxed
future, whose trait object had no transfer bound; adding that bound and restoring
only the sharing impl is green. So three of ten claims were proved by the compiler
once one field carried its bound. The pinned commit is the state before that
experiment.

## What the pinned commit shows

The phantom field is the plain form,
`duvet-core/src/cache.rs:161 "_resolver: PhantomData<R>"`, and the type map carries
two manual impls above it, the only commented ones,
`duvet-core/src/cache.rs:165 "unsafe impl<K: Send, V: Send, R> Send for TypeMap<K, V, R> {}"`.
The boxed future has no bound,
`duvet-core/src/query.rs:280 "Pin<Box<dyn Future<Output = ()>>>"`, while its owner
claims both traits,
`duvet-core/src/query.rs:283 "unsafe impl<T: Sync + Send, F: Send> Sync for Delegate<T, F> {}"`.
Ten manual impls exist: eight in `query.rs` at lines 37, 38, 201, 202, 283, 284, 346
and 347, and two in `cache.rs`.

## The exclusion that makes the rest true

The remaining claim is the protocol around one cell. The state holds the value in
`UnsafeCell<MaybeUninit<T>>` beside a `value_set: AtomicBool` and a `Semaphore`
(`duvet-core/src/query.rs:196 "value: UnsafeCell<MaybeUninit<T>>"`), and the exclusion is
spread over three places:

- Writes happen only under the permit.
  `duvet-core/src/query.rs:121 "SAFETY: polling is guarded by semaphores"` is the only
  statement of the single-poller rule, and it sits at a call, not at an impl.
- Publication orders the write. The comment at
  `duvet-core/src/query.rs:263 "Using release ordering so any threads that read a true from this"`
  precedes `duvet-core/src/query.rs:265 "self.value_set.store(true, Ordering::Release)"`,
  and the reader loads with
  `duvet-core/src/query.rs:208 "self.value_set.load(Ordering::Acquire)"`.
- Reads after publication are admitted by
  `duvet-core/src/query.rs:129 "SAFETY: The semaphore has been closed. This only happens"`.

The bounds are the ones the exclusion calls for. The value is created on one thread
and shared on many, so the handle demands both:
`duvet-core/src/query.rs:37 "unsafe impl<T: Sync + Send> Sync for Query<T> {}"`. The
future is moved to whichever thread polls and touched only by the permit holder, so
the inner state demands transfer alone on `F`:
`duvet-core/src/query.rs:201 "unsafe impl<T: Sync + Send, F: Send> Sync for Inner<T, F> {}"`,
with no sharing bound on the future. A sharing bound there would reject any future
holding a single-consumer receiver, the over-bounding the technique warns against.

## Deviation: no impl carries its exclusion

None of the eight impls in the publish protocol has a comment at the impl line. The `SAFETY` notes sit in the
methods (lines 121, 129, 237, 299 and 364 of `query.rs`), not at the claims they
support, and the three-part content the technique asks for (exclusion, window, bounds
with reasons) is nowhere written in one place. At the pinned commit the director
counted ten impls with one comment (line 164 of `cache.rs`, per the director's notes;
I could not re-open it in the shrunk clone), and that impl is among those the
experiment removed, so the clone has none. The standard stays: each remaining impl
states its exclusion at the impl.
