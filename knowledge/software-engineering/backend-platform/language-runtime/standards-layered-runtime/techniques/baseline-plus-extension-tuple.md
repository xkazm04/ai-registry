---
layer: technique
type: technique
subject: standards-layered-runtime
technique: baseline-plus-extension-tuple
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [designing the entry point an embedder calls to install the runtime's APIs into a context, letting an embedder add host-specific APIs without forking the registration code, registering an extension whose construction needs a running context]
---

# Baseline plus extension tuple

An embedder installs the runtime's APIs into a guest context through one
call. That call has to do two things that pull in opposite directions: install
a **baseline** the embedder cannot leave out, so every program can assume it,
and accept **extensions** the runtime has never heard of, so the embedder can
add its own. The shape that reconciles them is a fixed baseline registered
unconditionally, followed by a caller-supplied tuple of extensions, each
implementing one small registration trait, with the tuple itself implementing
the trait structurally so that composition needs no new type.

## The registration trait

The trait has one method: given the guest context and the realm to install
into, register whatever this extension provides, or fail. Every API in the
baseline implements it; every host extension implements it; and the tuple of
any such implementors implements it by calling each member in order. The
arity is bounded — a dozen positions is the customary ceiling, because trait
implementations over tuples are written out per arity and a ceiling has to be
chosen — and an embedder with more extensions than the ceiling nests a tuple
inside a tuple.

The uniformity of the signature is what makes the tuple work, and it is the
rule that most often breaks: **when an API's registration needs an argument
the trait does not carry, extend the trait for everyone or capture the
argument in the extension's own constructor; never give one registrar a
different signature**, because the tuple cannot compose a member that does not
implement the trait, and the workaround — a second, hand-written registration
path for that one API — is exactly the second validation door the whole design
avoids ([one-validation-door](../../../../_laws.md#one-validation-door): every
API that enters the context passes through one registrar with one signature,
and the set of things that can register is enumerable by listing the trait's
implementors).

## Baseline is unconditional

The baseline is not an extension the runtime happens to pass by default; it is
registered before the tuple, without a flag to skip it. **When an embedder
asks to omit part of the baseline, refuse and offer the lower layer instead**,
because a context with a partial baseline is a context whose programs cannot
be portable, and the honest way to get a smaller surface is to depend on a
smaller package ([crate-per-standards-body](./crate-per-standards-body.md)),
not to hollow out a larger one at registration time. The member most likely to
fall out of the baseline is the one that carries a backend parameter — a
console that needs a logger, a fetch that needs a client — because its
constructor has an argument and the fixed list has nowhere to put one. **Keep
it in the baseline with its default backend, and let the embedder's tuple
override it**, rather than moving a standard-required API into the caller's
extensions; an API the caller must remember to pass is an API some caller
will forget, and the resulting context is missing part of the baseline while
the registration reported success. What an embedder *may*
choose is which baseline: the standard package's registration installs the
standard's set, the extras layer's registration installs that plus the
non-standard conveniences, and an embedder picks by which package's entry
point it calls.

## Order and failure

Members of the tuple register in order, and order can matter: an extension
that installs a global the next extension references must come first. The
tuple preserves the caller's order, so the caller owns this. **When
registration of any member fails, the whole call fails and returns which
member failed**, because a context with half its extensions installed is a
state no program can reason about, and a registration error that names no
member sends the embedder into a bisection. The baseline's own members follow
the same rule and are registered in a fixed order the runtime owns.

## The late door

Some extensions cannot exist before the context does: an API whose backend
needs a handle the context creates, a host object that must be constructed
inside a realm. For those, a second entry point registers one more extension
into an already-initialised context, taking the same trait, the same
arguments, and reaching the same single registrar. The door is late, not
different: it is the same signature called at a later time.

**When an embedder reaches for the late door for an extension that could have
been in the tuple, prefer the tuple**, because the tuple is the one place a
reader can see the whole installed surface, and a late registration scattered
across the host's start-up code is an installed API nobody can enumerate.
The late door exists for the extension that genuinely needs the context, and
its use is a small signal that the extension is doing something the runtime
did not anticipate.

## When not to use it

A runtime with a single embedder — the runtime's own executable — does not
need the tuple; a function that registers everything in order is smaller and
equally clear. The tuple pays when there are embedders the runtime does not
control, who will want to add things without patching the registration code,
and who will need the installed set to be readable from one call site.
