---
layer: application
type: application
subject: data-access
technique: capability-declared-in-the-type
stack: node
verified_on: 2026-09-07
verified_against: node@26
applied: code
ab_verdict: not-better
proof: structural-only
---

# A storage layer that declares by presence, and the adapter family that cannot

The stack version is witnessed by the tree's own `@types/node ^26.2.0`
devDependency — the only concrete node pin it carries, since its CI asks for
`node-version: lts/*` and names no number. Its package manager is pinned
exactly (`pnpm@11.22.0`) and the library reads `2.0.0-alpha.10` in its
manifest. A second tree is read beside it — a provider-adapter family in a
private codebase, cited only for structure.

## Two trees on opposite sides of one precondition

The universal storage library implements a driver contract as a **plain record
of optional function fields**: three members are required (`hasItem`,
`getItem`, `getKeys`) and eight are optional, and the core decides what a
driver can do by looking — `if (driver.getItems)`, `if (driver.getItemRaw)`,
`if (m.driver.clear)`. There is no base class and no default implementation
anywhere in the contract, so a member exists only because that driver's author
wrote it. Presence is not correlated with capability here; it is the same
fact.

Beside it, a provider-adapter family in another tree does the opposite and is
equally right. Its adapters subclass a base provider, and the base supplies a
`complete_document` that raises a typed refusal. Every adapter therefore *has*
the member whether or not it can honour it, so the capability has to live in a
declared matrix that routing reads before dispatch — which that tree does,
with the comment that the capability is "DECLARED per adapter, never probed at
call time."

The two trees agree with each other and with the technique. What separates
them is not taste, it is the presence of an inheritable default. Where the
technique's amendment says reflection stops lying, that is the tree with no
base class; where it says the original objection stands, that is the tree with
one. Neither would be improved by adopting the other's channel, which is why
this application's verdict is `not-better`: the arm worth running was whether
the boundary predicts each tree's choice, and it does, in both directions.

## What the tree's shape says that its docs do not

Two structural facts fell out of the storage library that nobody designed, and
both sharpen the technique rather than the library.

**The residue channel is where the rot goes.** Because presence carries the
eight whole-operation capabilities, the declared-data channel carries only what
presence cannot express — two behavioural flags on members that are always
present. That channel is small, and small is why it is forgotten: of
thirty-two drivers, **two** declare any flag at all, and of the two flags the
interface defines, one (`ttl`) is declared by no driver and read by no line of
the core. It is a capability that exists only in the type. The technique
already names this failure — a declared requirement nothing evaluates is
documentation wearing a check's uniform — and the observation here is where it
lands: not in the wide channel everyone thinks about, but in the narrow
residue that looks like a detail.

**Presence has no room for a refusal, and the silent branch is one line
away.** Reflection gives the router two states, so the absent branch must do
something, and in this tree it returns: a write to a mount whose driver has no
`setItem` resolves successfully and stores nothing (`return; // Readonly`,
three times in the core). *Unsupported* and *done* are spelled identically,
which is the wrong data the tier ladder exists to prevent. The library
documents this as a feature — "write methods are optional so drivers can be
read-only" — and the cost is visible in its own test suite rather than in its
prose: the shared conformance suite asserts a write then reads it back, so a
read-only driver **cannot pass it**. Thirty of thirty-five driver test files
call the shared suite; the one read-only built-in is tested by four bespoke
assertions outside it. The one partial-implementation shape the contract
advertises is the one shape the contract's own test suite cannot express.

That last fact is this application's strongest evidence, and it is negative.
The technique closes by demanding a conformance suite that asserts three
things, and names the third — *every capability declared unsupported produces
the typed refusal rather than an empty success* — as "the assertion always
missing." Here it is not merely missing. It is unrepresentable, because the
suite was written against the facade that synthesises the missing operations
rather than against the driver, so every driver's observable behaviour is
uniform by construction and the suite cannot see a capability difference at
all.

## What was changed, and where

Nothing was changed in either tree by this reading; the storage library is not
a managed tree, and the adapter family already implements the technique
correctly. One gap in the second tree *was* closed, and it is the technique's
own third assertion: the typed refusal existed in the base provider and was
asserted in no test, so a matrix row that drifted from its adapter would have
changed nothing observable until a document reached a text-only provider. Two
tests now derive both directions from the capability matrix — a row without
the capability must refuse by name, a row with it must not inherit the base —
with a floor on the derived join so a collapsed population cannot pass
vacuously. A negative control confirms they fire: claiming the capability for
an adapter that inherits the refusing base turns the pair red and names the
defect.

## What this realization cannot do

Neither tree tests the *fidelity* half. The matrix answers "will this call be
honoured", which is the yes-or-no the technique says it should answer and
nothing more; the storage library's presence check answers the same question
and no better. A driver that implements `getKeys` but returns keys under a
different normalization, or an adapter that accepts a document and analyses it
badly, is a capability declared true by both mechanisms and wrong in the way
that costs a user. That is the parity question, and it lives next door.
