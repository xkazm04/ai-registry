---
layer: application
type: application
subject: engine-binding-surface
technique: address-sensitive-construction
stack: rust
status: forged
verified_on: 2026-09-05
verified_against: rust@1.91.0
proof: structural-only
---

# Three steps, on purpose, with the fixtures that keep them load-bearing

Same tree and commit (`49f5ab4d`; `rust-toolchain.toml` pins `1.91.0`). The
module doc at the top of `src/scope.rs` is the closest thing this repository
has to a design document — there is no `docs/` directory — and it states the
forces before the mechanism:

> Both `HandleScope` and `TryCatch` cannot be moved, because V8 holds direct
> pointers to them

That is address-sensitivity named as the cause, and everything downstream is
the consequence.

## The transition, as the tree spells it

The doc comment enumerates the three steps and says why each exists:

1. allocate the storage — *at this point, the scope is not yet
   address-sensitive, and so it can be safely moved*;
2. pin the storage to the stack — *necessary because once we initialize the
   scope, it must not be moved*;
3. initialize — *our `Pin` ensures that the scope cannot be moved*.

`ScopeStorage<T>` (`src/scope.rs:165`) is the storage type, and it carries
exactly the two things the technique says it must: the room for the foreign
object as `ManuallyDrop<T>`, and an `inited: bool`. Its `Drop`
(`src/scope.rs:222`) calls the foreign destructor **only if `inited`**, which is
the distinction between the three reachable states — never initialized,
initialized normally, storage reused. The reuse path is the transition run
backwards inside `init` (`src/scope.rs:186-195`): if `inited` is already set,
`drop_inner()` runs the old occupant's destructor and clears the flag before
the new construction begins.

The one-door property holds at the type level. `init` returns `PinnedRef<'_, T>`,
and the public API takes `PinScope<'s, 'i>` — an alias for
`PinnedRef<'s, HandleScope<'i>>` — so a caller holding uninitialized storage
has nothing to pass.

## The compression is a macro, and it expands in the caller's frame

The tree ships `v8::scope!(let scope, isolate)` and documents the constraint
that decides whether the compression is honest:

> note that this expands into statements, introducing a new variable `scope`
> into the current block. Using it as an expression
> (`let scope = v8::scope!(let scope, isolate);`) will not work

That restriction is the technique's rule made mechanical. A helper that
*returned* an initialized scope would have made the object movable again; a
macro that expands to statements binds the storage to the caller's own frame
and cannot. The ergonomic wrapper and the guarantee are compatible here
precisely because the macro refuses to be an expression.

## The negative artifacts, and their count

Fourteen fixtures under `tests/compile_fail/`, each with a committed `.stderr`,
driven by `trybuild` from `tests/test_ui.rs`. Four of them are this technique's
obligations directly — `boxed_local.rs` (moving a handle out of a dead scope
into a heap allocation), `local_outlive_handle_scope.rs`,
`drop_scope_before_local.rs`, `handle_scope_escape_to_nowhere.rs` — and the
rest pin the lifetime relations the scopes exist to enforce.

Read against
[constraint-deletion-is-silent](../../../../engineering-process/standards-and-gates/invariant-placement/techniques/constraint-deletion-is-silent.md),
this tree lands in that technique's **third** fallback branch and not by
accident. The preferred repair — assert a stable error identifier rather than
rendered prose — is unavailable: borrow-checker and lifetime diagnostics carry
no stable code, so only the text exists. The technique's mitigation for that
case is to keep the fixture count small enough that a regeneration is read
rather than accepted, and fourteen is small enough. The corpus priced this
tree's choice before the tree was read, which is the strongest form of a catch.

## The finding this tree contributed back

`tests/test_ui.rs` gates the whole suite twice:

```rust
#[cfg(not(target_os = "android"))]
#[rustversion::attr(not(nightly), test)]
fn ui() { … }
```

Both guards are honest. Diagnostics differ on nightly, and the emulated Android
target cannot run the harness. The consequence is that **on nightly, and on one
supported target, the only instrument that can observe deletion of these
constraints does not run** — and deleting a structural constraint makes strictly
more programs valid, so nothing else goes red either. The remedy for the
altitude with no liveness signal is itself excluded by configuration on the
configurations where the toolchain differs, which is where a diagnostic-shaped
test is most likely to have drifted.

That is not a defect in this tree — running the fixtures on nightly would
produce failures that mean nothing — but it is a boundary the corpus did not
state, and it landed as an amendment to `constraint-deletion-is-silent` in the
same change as this document.

## What this realization cannot do

It shows the ceremony is expressible and enforced; it does not price it. The
tree offers no measurement of what the three-step pattern costs its callers in
practice — no before/after against the earlier non-pinned API this repository
used to ship, and the doc comment's own hedge (*the lifetimes just need to be a
safe approximation*, and *in some cases I'm sure they are shorter than they
could be*) says the encoding is deliberately conservative in ways nobody has
quantified. A reader deciding whether to adopt this pattern gets the mechanism
and the guarantee from here, and must find the ergonomic cost somewhere else.
