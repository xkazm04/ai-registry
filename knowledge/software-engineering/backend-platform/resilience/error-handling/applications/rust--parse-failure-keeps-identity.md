---
layer: application
type: application
subject: error-handling
technique: parse-failure-keeps-identity
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.89
---

# A decode failure that still knows its own name (rust)

`kube-rs/kube` is a Rust client and controller runtime for the Kubernetes API,
read here at commit `7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e`
(workspace `4.2.0`). Its version witness is `Cargo.toml:27`,
`rust-version = "1.89.0"` — the workspace declares no `rust-toolchain` file, so
the minimum supported compiler is the only version this tree states about
itself, and `verified_against` above is that.

The tree reads collections it does not own: every object in the API server is
written by other controllers, by humans, and by deployment tooling, and the
schema of a custom type is edited by whoever owns that type. That is the
technique's premise, met exactly.

## The frame: retryability is a property of the type, stated once

Before the item-level mechanism, the enclosing posture, because it is what
makes the item-level mechanism cheap. Each subsystem owns one error enum with
`#[source]` on every variant that wraps a cause. `watcher::Error`
(`kube-runtime/src/watcher.rs:21-48`) is five variants — `InitialListFailed`,
`WatchStartFailed`, `WatchError`, `WatchFailed`, `NoResourceVersion` — and the
enum's doc comment classifies the whole set in one sentence: *"These are all
considered retryable from a watcher's point of view, even though they may
require patching of rbac/netpols in the background to fix"* (`:23-24`),
followed by the operational consequence, *"To avoid constantly looping errors,
make sure backoff is applied"* (`:26`).

That is the corpus's *classify on structure, never on prose* rule taken one
step further than the golden path states it: the classification is not a field
on a value, it is a documented property of the **type**, so no call site
re-derives it and there is no site at which it could drift. The four wrapping
variants each preserve their cause with `#[source]`, so the chain is the
diagnostic and the enum is the taxonomy.

## The mechanism: `DeserializeGuard`

`kube-core/src/error_boundary.rs` is 145 lines and implements the technique
almost step for step.

- **The value in the slot.** `pub struct DeserializeGuard<K>(pub Result<K,
  InvalidObject>)` (`:18`). A collection of `DeserializeGuard<K>` has the same
  length as a collection of `K`; every member is individually classified. The
  doc states the purpose in the corpus's own terms: *"lets deserializing the
  parent object succeed, even if the K is invalid… this can be used to still
  access valid objects from an `Api::list` call or `watcher`"* (`:12-14`).
- **The failure carries identity and message.** `InvalidObject { error:
  String, metadata: ObjectMeta }` (`:23-30`) — the decoder's own message plus
  the identity fields.
- **Buffer, decode, fall back to the identity projection.** The custom
  `Deserialize` impl (`:38-58`) buffers into `serde_value::Value` first, with
  the reason written inline: *"Deserialize::deserialize consumes the
  deserializer, and we want to retry parsing as an ObjectMetaContainer if the
  initial parse fails"* (`:42-43`). It then tries `K::deserialize`, and
  `or_else` re-decodes the same buffer as `PartialObjectMeta<K>` (`:50-51`) —
  the identity projection, and it is a **subset of the same schema**, not a
  parallel one, which is precisely the rule the technique makes load-bearing.
- **The failure satisfies the identity interface.** `impl<K: Resource>
  Resource for DeserializeGuard<K>` (`:61-88`), and `meta()` is the whole
  point: `self.0.as_ref().map_or_else(|err| &err.metadata, K::meta)` (`:81-83`).
  A failed item answers `kind`, `group`, `version`, `plural` and `meta`
  identically to a decoded one, so every key-based consumer — the reference
  type, the store, the log line — works on it with no failure-specific code.

**The test is named after the failure.**
`should_parse_meta_of_invalid_objects` (`:97-112`) feeds an object whose
`spec.containers` is a string where a list belongs, then asserts the name and
namespace survive and the inner `Result` is `Err`. Naming a test after the
property under stress rather than after the function under test is a small
thing that makes the intent unforgettable in a diff.

## The consumer, which is where the identity is spent

`examples/errorbounded_configmap_watcher.rs` is 55 lines and shows what the
identity buys. The stream is `Api::<DeserializeGuard<CaConfigMap>>` (`:32`),
and the loop logs the identity **before** branching on success or failure:

```rust
info!("saw {}", ObjectRef::from_obj(&cm));
match cm.0 {
    Ok(cm) => info!("contents: {cm:?}"),
    Err(err) => warn!("failed to parse: {err}"),
}
```

(`:44-51`.) `ObjectRef::from_obj` is available on the failed item only because
of `meta()` at `error_boundary.rs:81-83`. Without it the second arm would read
"failed to parse: …" with no subject — the anonymous-error posture the
technique exists to refuse.

The example's parse target is deliberately narrow (`:15-26`): a variant type
that accepts only maps carrying a `ca.crt` key. Most real members of that
collection will *not* parse, on purpose, so the example is a live
demonstration that a reader can be pointed at a collection where the majority
of items are foreign and still be useful.

## Deviations from the standard

Two, both recorded without lowering the standard.

**The buffer is a whole-object clone, on every item, not only on the failing
path.** `K::deserialize(buffer.clone())` (`:47`) copies the entire decoded
intermediate before the attempt, and the tree marks it: *"FIXME: can we avoid
cloning the whole object? metadata should be enough, and even then we could
prune managedFields"* (`:46`). The technique states the double decode as its
one structural cost; here it is paid unconditionally, which on a large
collection of large objects is a real memory cost during an initial list. The
standard's preference — pay it on the failure path where the reader can retain
the input — is not achievable through this particular decoder interface, and
the tree says so rather than pretending otherwise.

**The identity projection can itself fail, and that path is silent.** At
`:51`, if `PartialObjectMeta` also fails to decode, the error is mapped
straight back out through `DeserializerError::into_error` and the whole parent
decode fails — which is the correct outcome, but it arrives as an ordinary
decode error indistinguishable from any other. The technique calls an
unidentifiable item "a rarer and louder event that deserves its own alert";
here it is neither louder nor distinguishable. Nothing in the tree counts it.

## What transfers

Any reader over an externally owned collection where one bad row currently
takes down the batch. The transferable shape is three parts and none of them
is language-specific: a sum type in the collection's own slot, an identity
projection that is a subset of the same schema, and the identity interface
implemented on the failure so existing consumers need no change. The third
part is the one that decides whether the technique is adopted or abandoned —
without it, every consumer needs a new branch, and a technique that costs a
branch per consumer does not survive review.
