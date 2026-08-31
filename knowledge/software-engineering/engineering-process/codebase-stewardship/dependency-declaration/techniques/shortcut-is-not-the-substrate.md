---
layer: technique
type: technique
subject: dependency-declaration
technique: shortcut-is-not-the-substrate
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [a capability works in one context and cannot be extended to an obviously similar one, a mechanism is bound to a single file format or document type, deciding whether to ship a convenient form before the general one, a feature request keeps being refused for reasons about the binding rather than the feature]
---

# The shortcut is not the substrate

Mechanisms get adopted through one convenient binding: a block in a particular
file type, an annotation in a particular language, an entry in a particular
manifest. **Shipping that first is correct.** Refusing to release until the
general form is designed is how mechanisms die in committee, and a convenient
binding that exists beats a general one that does not.

The debt is taken at a specific and identifiable moment: when the convenience
becomes the *only* way in. From then on the capability inherits every constraint
of its binding — the file format's grammar, its parse timing, its lifecycle, its
access rules, its security model — and those constraints propagate into places
that have nothing to do with the original convenience.

## The symptom, which is unmistakable once named

> A context that plainly ought to support the mechanism cannot, for a reason that
> is entirely about the binding and not at all about the mechanism.

A background worker cannot use it because the binding lives in a document type
workers do not have. A nested scope cannot override it because the binding is
defined as document-global. A headless runner cannot supply it because the binding
is parsed from markup. A second document type cannot participate because the
parser only looks in the first.

Each of those arrives as an individual feature request and gets an individually
reasonable answer, which is why the pattern takes years to become visible. The
question that reveals it: **when this was last refused, was the reason a property
of the capability, or a property of where it happens to be written?** A run of
refusals of the second kind is the diagnosis.

The tell in the codebase is the same fact from the other side: the resolution
logic cannot be called without first constructing something from the binding's
world. If exercising the mechanism in a test requires standing up a parser, a
document, or a host environment, the binding *is* the mechanism.

## The repair: a projection, not a mechanism

The distinction to design for from the start, and to restore afterwards:

- **A shortcut is a projection.** The capability exists in its own right, and the
  convenient binding is one surface that produces it. Other surfaces can produce
  the same thing, and they are peers.
- **A binding is the mechanism when** the capability has no expression outside it —
  when removing that surface removes the capability rather than removing a way to
  reach it.

Concretely, three properties separate them, and they are checkable rather than
aesthetic:

1. **The capability has a name and a shape of its own**, independent of the
   binding's syntax — a function, an interface, a value that can be constructed
   directly. If describing the capability requires describing the file format, it
   has none.
2. **A second surface exists, or could be added without touching the first.**
   This is the real test, and it is worth actually trying rather than reasoning
   about: adding a second producer is either a small independent addition or a
   refactor of everything, and which one it is tells you what you have.
3. **The consumers integrate against the capability, not against the binding.**
   Where other parts of the system reach into the binding's representation to do
   their work, they have all become coupled to the format, and the substrate
   cannot be introduced beneath them without changing every one
   ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## Unwinding it later

The debt is payable, and the order matters, because the obvious order does not
work.

The instinct is to add the second surface first, since that is the thing being
asked for. That produces two parallel implementations that drift — which is the
same defect with an extra copy, and the version that is much harder to remove
later.

The order that works:

1. **Extract the capability from the binding.** The existing surface keeps
   working, now expressed as a caller of the extracted thing. Nothing else changes,
   and this step is verifiable: the existing behaviour is unchanged and the
   capability is now reachable without the binding.
2. **Move consumers onto the capability**, off the binding's representation.
3. **Only then add the second surface**, as a second producer of a thing that
   already exists.

Step 1 is the whole repair and the other two are consequences. It is also the step
that tends to get skipped, because on its own it delivers nothing a user can see —
which is exactly why it is worth naming as the deliverable rather than as
preparation for one.

## Do not let the shortcut define the capability's limits

One subtler cost, worth stating because it survives the repair if nobody looks for
it. While a binding is the only door, the capability's *design* drifts toward what
the binding can express. Constraints that were incidental — this must be
statically present, this cannot be nested, this is document-scoped — get absorbed
into everyone's mental model of what the mechanism fundamentally is, and are then
defended on principle long after the binding stopped being the only one.

So when the substrate is finally extracted, its constraints get re-derived from
the capability rather than inherited from the surface it grew in
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Some of the old
limits will turn out to be real. The valuable ones are those that turn out not to
be, and they are invisible until somebody asks the question deliberately, because
nothing in the code distinguishes a constraint that was necessary from one that
was merely true.
