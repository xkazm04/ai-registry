---
layer: application
type: application
subject: native-guest-interop
technique: aligned-native-data-cell
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Aligned native data cell, in the Boa engine

Verified against `boa-dev/boa` at commit `665f03924a54e5162be227e7e909612e36f6e35a`,
workspace version 0.22.0; the toolchain witness is `Cargo.toml:30`,
`rust-version = "1.91.0"`. Boa is a JavaScript engine written in Rust, and its
host-data cell is the `ObjectData<T>` wrapper in
`core/engine/src/object/datatypes.rs`, with the object it sits inside in
`core/engine/src/object/mod.rs` and the collector's box in
`core/gc/src/internals/gc_box.rs`. Every line below was re-opened on the date
above.

## The cell, and how the assertion is forced

`ObjectData<T>` is declared at `datatypes.rs:222-233` with
`#[repr(C, align(8))]` (line 225), `#[non_exhaustive]` (line 226) and a
single **private** field `data: T` (line 232). The comment on the field says
why it is private: "MUST BE PRIVATE, should not be constructed directly ...
Because we want to trigger the compile-time const assertion below" (lines
228-230). The assertion is the associated constant
`OBJECT_DATA_ALIGNMENT_REQUIREMENT` at lines 245-248, `assert!(align_of::<T>()
<= 8, "Alignment of JsData must be <= 8, consider wrapping the data in a
Box<T>.")`, and it is *forced* at `ObjectData::new` (lines 250-255) by the
statement `let () = Self::OBJECT_DATA_ALIGNMENT_REQUIREMENT;` (line 252) — a
generic associated constant is evaluated only when it is used, so the
constructor is where a wide-aligned `T` fails the build. The escape hatch
named in the message is itself asserted, once, at crate level:
`static_assertions::const_assert!(align_of::<Box<()>>() <= 8);` at line 242.

The design document `docs/native_object.md:17-32` states the reason in one
sentence (line 32): the alignment "is required to ensure memory safety when
casting pointers back and forth inside the garbage-collected environment and
ensuring the GC metadata pointers maintain 8-byte alignment requirements on
all architectures". The scout's anchor `datatypes.rs:214-256` holds; the
doc's line 30 describes the crate-level `const_assert!` as if it were the
per-type check, which is approximate — the per-type check is the associated
constant, and the `const_assert!` guards the box.

## Where the 8 comes from

The collector's cell is `GcBox<T>` at `gc_box.rs:7-12`: `#[repr(C)]`, then
`header: GcHeader`, then `vtable: &'static VTable`, then `value: T`. The
header is two `Cell<u32>` (`gc_header.rs:15-18`), eight bytes at alignment
four; the vtable reference is a pointer, eight bytes at alignment eight on a
sixty-four-bit target. The box's alignment is therefore the pointer's, and
eight is the bound *derived* from the widest field the collector's own prefix
holds — the derivation the technique asks for, though the tree writes it in
the design document rather than beside the constant.

## The erased handle is thin, and identity lives in the box

`JsObject<T = ErasedObjectData>` at `core/engine/src/object/jsobject.rs:62-64`
holds one field, `inner: Gc<VTableObject<T>>`. `ErasedObjectData` at
`jsobject.rs:53-55` is a **zero-field sized struct**, not `dyn NativeObject`,
so the erased handle is a thin pointer. `VTableObject<T>` at `jsobject.rs:80-84`
is the engine's own vtable of internal methods plus a `GcRefCell<Object<T>>`,
and `Object<T>` at `mod.rs:168-184` is `#[repr(C)]` with its comment stating
why (lines 172-173: "to prevent the compiler from reordering fields, as it is
used for casting between types"); `data: ObjectData<T>` is its last field
(line 183), so the erased instantiation is a valid prefix of every concrete
one. The unchecked downcast at `jsobject.rs:300-308` reinterprets the pointer
with `Gc::cast_unchecked` and relies on exactly that (comment at line 304).

The check that guards it is `JsObject::is` at `jsobject.rs:406-408`, which
calls `Gc::is::<VTableObject<T>>`; that is `Gc::type_id(this) ==
TypeId::of::<U>()` at `core/gc/src/pointers/gc.rs:255-257`, and
`Gc::type_id` reads `this.vtable().type_id()` (lines 248-250) — the type
identity is stored in the box's vtable (`core/gc/src/internals/vtable.rs:53`,
field at line 72, accessor at 93). The box header is the one authority on
what a payload is, and the handle carries nothing.

## Structural fact

The design record for this tree says the design "rejects trait-object storage
with a fat pointer". The tree is more specific than that: fat pointers to
`dyn NativeObject` do appear, but only transiently inside the unchecked
accessors on `Object` (`mod.rs:160-165`, `let ptr: *mut dyn NativeObject =
self; ... ptr.cast::<T>()`), never in a stored handle. Every stored handle is
`Gc<VTableObject<ErasedObjectData>>`. Native *functions* take the other
route: `NativeFunction`'s closure variant at
`core/engine/src/native_function/mod.rs:137-140` is `Closure(Gc<dyn
TraceableClosure>)`, a fat pointer inside the collector's box — so the thin
handle rule holds for host data and not for host closures, and the tree does
not say why the two differ.
