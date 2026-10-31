---
layer: application
type: application
subject: engine-binding-surface
technique: hierarchy-as-three-relations
stack: rust
status: forged
verified_on: 2026-10-31
verified_against: rust@1.97
proof: structural-only
applied: simulation
ab_verdict: unmeasurable
---

# A consumer of a generated interface tree, and the generator behind it

Two trees, read the same day. The consumer is the public `xkazm04/paypal`
desktop wallet at `c98151a6`, toolchain pinned to `1.97` by
`rust-toolchain.toml` and `rust-version` in the workspace `Cargo.toml` (the
witness for `verified_against`). Its `table-os` crate pins the platform
binding crate at `=0.62.2`, and `Cargo.lock` resolves its core crate to
`windows-core 0.62.2`, which was read from the local registry source. The
foreign hierarchy is the platform's component-object interface tree: every
interface descends from one root, the runtime-object interfaces descend from a
second, and an object answers a type question through a runtime predicate that
also hands back the right pointer.

This is the first fleet tree to hold the technique's shape at all. Two earlier
apply passes (2026-10-14, 2026-10-22) found no Rust project binding a foreign
class tree. That is still true: this project **consumes** a generated surface
and does not author one. So the seam can only falsify the technique from the
consumer's side. Does the consumer write any per-pair conversions? Does
narrowing reach it as a value? Does the generator keep its edges in one
declaration list?

## What the generator does: one declaration per edge

Each interface is declared once, and its ancestors are listed **explicitly,
per edge**, not derived as a chain. This is the technique's first prefix-access
rule. The interop interface the consumer uses is declared as:

- (binding crate) src/Windows/Win32/System/WinRT/mod.rs:2351 "interface_hierarchy!(IUserConsentVerifierInterop, windows_core::IUnknown, windows_core::IInspectable);"

Both ancestors are named, although the second already implies the first. The
macro expands each edge into the infallible widening (`windows-core`
`src/imp/mod.rs:20-33`). That gives a `From` impl in both the owned and the
borrowed form, and its body is a `transmute`. The table is generated, never
written: grepping the consumer for hand-written conversions between interface
types finds **zero**.

The layout claim behind that `transmute` is not checked by a build-time
assertion, which the technique asks for. The design makes it unnecessary:
`define_interface!` (`src/imp/mod.rs:60-64`) makes every interface a
`#[repr(transparent)]` newtype over the root handle, which is one pointer.
Handles therefore cannot differ in layout. The prefix question moves to the
vtables, which the generator emits with the base vtable as the first field and
which callers never reinterpret. That is a stronger form of the same gate. The
compiler enforces the layout, so nothing is left to assert.

## Narrowing goes to the runtime and comes back as a value

`Interface::cast` (`src/interface.rs:92`) calls the runtime's query with the
target's interface identifier and returns `Result<T>`. It also rejects a
non-null pointer that comes back with a failure code, which is the guard
against an object that lies about success. The type the consumer needed was
obtained through `factory::<C, I>()`, which goes to `load_factory`
(`src/imp/factory_cache.rs:73-83`). That asks the operating system for class
`C`'s factory **under `I`'s identifier**. The OS is the authority for its own
vocabulary, and nothing local records a type tag.

The consumer handles the refusal as a branch, not a crash:

- crates/table-os/src/windows_native.rs:47 "factory::<UserConsentVerifier, IUserConsentVerifierInterop>().map_err(|_|"
- crates/table-os/src/windows_native.rs:50 "Desktop Windows Hello requires a supported Windows version"

That is the technique's first narrowing property doing real work. On an OS
build that lacks the interop interface, the query fails and the owner reads a
sentence. Under the policy the technique rejects (a cast, or a locally kept
tag), the next line would call through a vtable the object does not have.

## A fourth edge kind the technique does not list

The generator has a second edge macro, `required_hierarchy!`
(`src/imp/mod.rs:45-48`). It declares the same conversion capability with
`const QUERY: bool = true`. It covers an interface that is **required** by
another but not laid out as its prefix. The conversion is guaranteed by
contract, yet still has to ask the runtime, because only the runtime can do the
pointer adjustment. The technique's "When not to use it" sends a
multiple-inheritance tree out of the scheme, to an accessor that performs the
runtime's adjustment. This generator keeps that accessor **inside** the
declaration list, as a flag on the edge (reinterpret or query). So the list
stays the one place where a wrong edge shows up. This application records the
observation only. Whether it amends the technique's boundary is banked as a
lead in the subject note (2026-10-31).

## What the realization cannot show

- **There is nothing to A/B.** The consumer writes no conversions, so a code
  arm "with the technique applied" would be the code that is already there. The
  verdict is `unmeasurable` against the target (hand-written conversions over a
  foreign tree, in fleet code: 0). The instrument that would measure it is a
  fleet project that **authors** bindings to a deep class tree.
- **The refusal does not name both types.** The technique asks that a
  narrowing refusal name the wanted type and the held type. The generator
  returns a bare result code, and the consumer then discards it (`map_err(|_|`).
  Every factory failure, including ones unrelated to the OS version, therefore
  reads as "requires a supported Windows version". This is the consumer's
  labelling choice, not the binding surface's. It is recorded here because it
  is where the technique's second refusal property stops being enforced.
- **Only one call site.** The consumer makes one narrowing and no prefix calls
  across interface levels beyond the root. The generator, not the consumer, is
  the evidence for the declaration-list half.
