---
layer: application
type: application
subject: object-shape-representation
technique: polymorphic-inline-cache-with-weak-shapes
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# A four-entry weak inline cache whose prototype hits validate one shape

Boa (`boa-dev/boa`, commit `665f03924a54e5162be227e7e909612e36f6e35a`) keeps
its inline cache in `core/engine/src/vm/inline_cache/mod.rs` and fills it
from the property-access opcodes. The version witness is `Cargo.toml:30`
(`rust-version = "1.91.0"`). The polymorphic form landed in the `0.22.0`
cycle (`CHANGELOG.md:128`, "implement polymorphic inline cache (PIC) for
property access", PR 4740); `docs/vm.md:308-314` still describes the earlier
monomorphic design - "the last-seen object shape" - and is the doc-lags-tree
case the handoff warned about. Cite the tree.

## Minted by the compiler, keyed by site

`emit_get_property_by_name` (`bytecompiler/mod.rs:1003-1016`) takes
`self.ic.len()` as the new index (line 1010), resolves the identifier to its
constant string, and pushes `InlineCache::new(name)` (line 1016) before
emitting the instruction with that index. One cache per emitted access; the
name travels with the cache, so a miss can perform the full lookup from
`ic.name` alone (`vm/opcode/get/property.rs:64`).

## Capacity 4, weak entries, address compare, megamorphic latch

`PIC_CAPACITY` is `4` (`inline_cache/mod.rs:16`). `CacheEntry` holds a
`WeakShape` with the reason at line 21 - "to avoid the shape preventing
deallocation" - and a `Slot`; `InlineCache` holds an `ArrayVec` of them and a
`megamorphic: Cell<bool>` (lines 29-39). `set` (lines 65-84) returns early
when megamorphic, `try_push`es, and on a full vector sets the latch **and
clears the entries** (lines 80-82) - the technique's "drops the entries it
held so they pin nothing". `get` (lines 89-113) compares by
`to_addr_usize()` (line 101), never structurally, and `swap_remove`s any
entry whose weak upgrade fails as it scans (lines 106-109, "Opportunistically
clean up stale weak shapes"). All four of the technique's entry rules are in
those fifty lines.

## Cacheability is decided in the walk

The slot travels through the lookup in an `InternalMethodPropertyContext`.
`ordinary_get` (`object/internal_methods/mod.rs:706-747`) and
`ordinary_has_property` (`675-698`) call
`set_not_cacheable_if_already_prototype()` and then set `PROTOTYPE` on every
step onto a parent (lines 719-720, 689-690); `set_not_cacheable_if_already_prototype`
(`object/shape/slot.rs:108-119`) shifts the `PROTOTYPE` bit into
`NOT_CACHEABLE` so that the second step marks the slot uncacheable with no
branch - the comment at line 109 says as much. `ordinary_set` marks a store
uncacheable when the holder is not the receiver (`internal_methods/mod.rs:869-875`,
"If the object and receiver are not the same then it's not inline cacheable
for now"). `proxy_exotic_get_own_property` sets `NOT_CACHEABLE` as its first
statement (`builtins/proxy/mod.rs:472`), before the handler runs. The fill
reads `slot.is_cacheable()` after the walk (`vm/opcode/get/property.rs:69-75`).

The primitive-receiver lesson is at `get/property.rs:32-38`: instead of
`to_object()`, which "creates a temporary wrapper object", the opcode calls
`base_class` to reach the primitive's prototype directly and caches against
it; a string's `length` is answered before the cache at lines 20-29.

## The structural fact: a prototype hit checks the receiver's shape only

On a hit whose slot carries `PROTOTYPE`, the get opcode reads
`shape.prototype()` - the prototype *object* fixed by the receiver's shape -
and indexes `prototype.properties().storage[slot.index]` directly
(`get/property.rs:43-46`); the set opcode does the same for a store
(`vm/opcode/set/property.rs:49-53`). No comparison of the prototype's own
shape is made at the hit, and `CacheEntry` has no field to hold one
(`inline_cache/mod.rs:20-25`). The technique asks for two identities on a
prototype hit, because a deletion on the prototype shifts its slots in place
(`unique_shape.rs:101-112`) without touching the receiver's shape. This
application records the gap as a deviation against the standard; it did not
trace whether some other mechanism keeps prototype layouts stable under the
cached slot, and a reader who needs the answer should test it from the
guest with a prototype delete between two executions of one site.
