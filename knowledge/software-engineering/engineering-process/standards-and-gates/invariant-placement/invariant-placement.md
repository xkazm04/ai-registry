---
layer: golden-path
type: golden-path
subject: invariant-placement
status: forged
use_when: [deciding where a rule lives before choosing a checker for it, a rule that keeps being re-broken at new call sites, weighing a shape change against a validation step, a standard nobody can point at a mechanism for, pricing a correct-by-construction encoding before adopting it]
techniques:
  - placement-precedes-gate
  - constraint-deletion-is-silent
  - initialization-proof-tokens
  - completeness-at-emission
  - consumption-bounds-at-most-once
  - build-time-evaluation-of-cross-value-invariants
  - derived-properties-cannot-be-forged
---

# Invariant placement

Every rule a system holds is enforced *somewhere*, and somewhere has four
addresses. The invalid state can be made impossible to write down; it can be
refused at one construction door, so that the value's existence is the proof;
it can be read and refused by a mechanism at some rung of the pipeline; or it
can be checked at the moment of use, on every execution, forever. These are
altitudes, and the choice among them is made *before* any checker is
configured. A team that starts from "which linter catches this" has already
skipped the only decision that changes the cost curve.

The phrase this subject owns is the one that appears as a closing flourish in
half the design documents ever written: *this makes the invalid state
unrepresentable*. It is a real engineering claim with a real price, and it is
almost always asserted without one.

## The four altitudes

| Altitude | Where the rule lives | Times enforced | What a violation looks like |
|---|---|---|---|
| **Shape** | the data's own structure | zero | a program that cannot be written |
| **Door** | one construction path | once per value | a construction that refuses |
| **Gate** | a mechanism over an artifact | once per run, per rung | a build that stops |
| **Call site** | a check at the point of use | once per execution | a failure at run time |

**Shape.** The illegal combination has no expression. A status modelled as one
value drawn from a named set has no *loading-and-failed* state to guard,
because nothing can hold both — the discipline for that particular family is
[status FSMs](../../../client-architecture/client-state/techniques/status-fsms.md),
and its lesson generalises: a set of independent flags obliges every write site
to prevent every illegal combination, and write sites multiply. Nothing is
checked at this altitude because there is nothing to check. That is the whole
appeal, and it is also why the altitude has no observable liveness — see below.

**Door.** The value's kind says it was validated, and the only way to obtain
one is through the constructor that validated it. Downstream signatures then
carry the fact for free: a routine taking a checked value cannot be handed an
unchecked one, and no reviewer has to notice. This is the per-value form of
[one-validation-door](../../../_laws.md#one-validation-door) — that law binds a
*store* to a single write path with enumerable writers, and the door altitude
binds a *value* to a single construction path, which reaches every signature the
value ever appears in rather than every writer of one table.

**Gate.** A mechanism reads an artifact and refuses. Everything about which
rung, what severity, what blocking input, and how the mechanism is proven alive
belongs to [quality gates](../quality-gates/quality-gates.md); this subject
stops at the point where the answer is "a gate," and hands over.

**Call site.** The oldest and cheapest to add, the most expensive to hold. It
is enforced by whoever remembers, at each site, and its coverage decays by
attrition as sites are added
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)). It remains the
correct answer more often than the enthusiasts of the higher altitudes admit,
and two whole classes belong here permanently: see *what cannot rise*.

## Blast radius chooses the altitude; the price decides whether you can pay

The selection rule has two halves and they are applied in order.

**First, blast radius.** Ask how far a violating value travels before anybody
notices, and what it costs when it arrives. A malformed value that fails
immediately, inside one routine, observed by its only caller, does not need a
shape change; an assertion is proportionate. A violating value that is written
to a durable store, emitted to consumers you do not control, or used to
authorise something is a different question, because the moment of detection is
separated from the moment of damage by an unbounded interval. **The altitude
rises with the distance between the mistake and its consequence**, not with how
much anyone dislikes the mistake.

Two asymmetries sharpen this. Inbound and outbound boundaries are not
symmetric: one badly parsed input produces one failed request, while one badly
assembled output is seen wrong by every consumer of it, which is why
completeness at an emission boundary earns a higher altitude than the same rule
on the way in. And irreversibility raises the altitude directly: a value that
has been signed, published, or spent cannot be un-spent by a later refusal.

**Second, the price.** The altitudes are not free, and the literature that
advocates them is unusually quiet about this — the standard framing is that a
shape-level encoding costs nothing because nothing of it survives into the
running program. That is true of the *machine* cost and false of every other
cost, and five of them are load-bearing.

1. **Diagnostic legibility degrades with the number of tracked properties.**
   The refusal message is the shape it refused, and that shape grows one
   position per tracked property. With one or two, the message is better than
   any hand-written error, because it names the missing thing exactly. With
   four, the reader is decoding a positional structure to learn which part is
   absent. Nothing warns you at the crossing point, because the encoding still
   works perfectly.
2. **Declaration cost is combinatorial and nobody counts it.** Making four
   parts individually required, each settable in any order, means a separate
   near-identical transition declaration per part, each restating every other
   part. It reads as boilerplate because it is, it grows with the count, and
   the invariant it encodes stays one sentence long throughout.
3. **The proof does not reach the data.** A shape that proves a step was taken
   proves *that a construction path was followed* — it does not prove the
   contents. Encodings routinely guarantee that an operation is *available* and
   are then read, in the code beneath them, as guaranteeing that a field is
   *populated*. Those are different claims, and the second is usually
   discharged by an unchecked access sitting under a comment asserting the
   first. When a proof cannot reach the data, say so at the unchecked access,
   or keep the check.
4. **The door invents data.** The construction door exists to refuse
   incomplete input, and it is the exact place where a missing optional part
   acquires a plausible fallback so that construction can succeed — a
   fabricated threshold described as a safe default, inside the very mechanism
   sold as abolishing fabricated thresholds. An absent value that becomes a
   definite one at the validating door is
   [unknown rendered as a value](../../../_laws.md#unknown-is-not-a-value), and
   the door's authority is what makes it invisible downstream.
5. **A wrong encoding is a one-way door.** Tightening a shape is usually
   compatible; loosening a published one is not, and neither is adding back a
   capability the encoding removed. The common advice — prototype with raw
   shapes and refine once the domain is understood — is correct and incomplete,
   because it never prices the refinement. Refine before publishing, or accept
   that the refinement is a versioned break with a migration behind it.

The resulting rule: **place the invariant at the highest altitude whose price
you can name, and write the price down next to it.** An encoding adopted
without a stated cost is adopted without a stated exit, and the exit is where
the whole guarantee is eventually spent.

## What cannot rise

Two classes are permanently barred from the top two altitudes, and knowing them
prevents most of the wasted effort in this area.

**Facts that expire.** The shape and door altitudes carry facts that are true
for the life of the value. A property that can stop being true while the value
sits unchanged cannot be carried there, because nothing about the value changes
when the fact lapses — the proof outlives the thing it proved and goes on
looking like proof. Freshness therefore stays at the call site or is
re-established at the point of use, and the machinery of expiry, revalidation
and caching belongs to the subjects that own those. What belongs *here* is only
the refusal: **if the property has a clock, the top two altitudes are not
available, and an encoding that claims otherwise asserts an expired fact with
the authority of a checked one** — which is strictly worse than no encoding,
because the check it replaced would still have been running.

**Obligations to act.** A structural encoding is good at *at most once* and
incapable of *at least once*. It can make a second use impossible; it cannot
make a first use happen, because discarding a value is always legal. Every
"must happen" requirement keeps a runtime check; only the "must not happen
twice" half rises.

## Where placement stops

This subject ends at four boundaries it must not cross.

- **Gate mechanics.** Rungs, severity by construction, blocking inputs,
  liveness and ratchets are [quality gates](../quality-gates/quality-gates.md).
  Once the answer is "a gate," every question after it is theirs.
- **Interface shape.** Whether an abstraction is worth its interface, and why
  the interface is much larger than the signature, is
  [module depth](../../codebase-stewardship/module-design/techniques/module-depth.md).
  Placement raises an invariant *into* the interface; depth judges what that
  costs the caller. The borrowing is one line, and it is the one that keeps
  this subject honest: an invariant a caller must establish is part of the
  interface whether or not it appears in the signature, so moving a rule into
  the shape does not delete it from the caller's burden — it moves it from
  documentation into the denominator.
- **Runtime failure handling.** What the check *does* when it fires — the
  taxonomy, the routing, the user-facing rendering — is
  [error handling](../../../backend-platform/resilience/error-handling/error-handling.md).
- **The store's write door.** Per-store validation with enumerable writers is
  the law cited above, and it is not re-litigated here. The distinction worth
  holding: that law is satisfied by one door per store; this subject's claim is
  per *value*, and a value validated once travels through every signature
  downstream carrying its verdict. The two compose — a store's door is the
  natural place to mint the validated value — and neither replaces the other.
  The construction-side analogue for queries, where the safe posture is that
  unsafe composition is unrepresentable in ordinary code rather than caught by
  review, is
  [data access](../../../backend-platform/data-layer/data-access/data-access.md).

## The blindness rule governs the build-time altitude

There is a fifth thing that looks like another altitude and is not: evaluating
an expression during the build so that a violation becomes a failed build. It
is a real and valuable placement for invariants *between* values known before
the program runs, and it is bounded by a rule this corpus already holds and
states better than its advocates do: **prefer the runtime conditional over the
compile-time one wherever both branches can compile everywhere; the
compile-time one buys the deletion and pays with the blindness**
([gate laddering](../quality-gates/techniques/gate-laddering.md)). A branch
selected before analysis begins is a branch no other configuration's checker
ever reads. Build-time evaluation lands *inside* that rule, not beside it, and
the technique below draws the line: the placement is sound while the
invariant's inputs exist in every configuration, and becomes an instance of the
blindness the moment the invariant itself is selected by configuration.

There is also a testing boundary worth naming, because it runs the other way:
where a shape makes the invalid state unrepresentable, generating invalid
inputs against it tests the language rather than the system
([negative-space generation](../../build-and-release/test-input-generation/techniques/negative-space-generation.md)).
Raising an invariant retires a body of tests. That is a genuine benefit, and it
is also the mechanism by which the next section's problem is created.

## The altitude with no liveness signal

A gate is proven alive by feeding it a known violation and watching it go red.
The top two altitudes cannot be probed that way by default, and they fail in a
direction no existing test can see: **deleting a structural constraint makes
strictly more programs valid, so every existing test still passes.** There is
no red. The suite did not shrink, no coverage number moved, and the guarantee
is simply gone — which is
[failure spelled as empty success](../../../_laws.md#failure-not-empty-success)
at the one altitude that had no instrument. Every invariant raised above the
call site therefore acquires an obligation at the moment it is raised: an
explicit artifact asserting that a known-bad construction is *rejected*. This
is the most commonly skipped step in the whole subject, and it is what decides
whether an encoding survives its second year and its third maintainer.

## The techniques

- [placement-precedes-gate](./techniques/placement-precedes-gate.md) — the four
  altitudes as an ordered decision, blast radius as the selector, and the
  exploration case that inverts it.
- [constraint-deletion-is-silent](./techniques/constraint-deletion-is-silent.md)
  — why a removed structural invariant has no failing test, the negative
  artifact that supplies one, and the diagnostic-text trap that retires it.
- [initialization-proof-tokens](./techniques/initialization-proof-tokens.md) —
  representing a successful bring-up as a value only the initializer can mint,
  and the expiry condition that makes it worse than a check.
- [completeness-at-emission](./techniques/completeness-at-emission.md) —
  making the emit operation unavailable until every required part is supplied,
  the inbound/outbound asymmetry that justifies it, and where declaration cost
  overtakes a schema check.
- [consumption-bounds-at-most-once](./techniques/consumption-bounds-at-most-once.md)
  — the half of a single-use obligation a structure can hold, the half it
  cannot, and the requirement shape that makes the placement worthless.
- [build-time-evaluation-of-cross-value-invariants](./techniques/build-time-evaluation-of-cross-value-invariants.md)
  — the exact class of invariant this placement serves, its three denials, and
  how it lands inside the blindness rule.
- [derived-properties-cannot-be-forged](./techniques/derived-properties-cannot-be-forged.md)
  — a property computed from the parts versus one declared by the author, the
  two failure modes annotation cannot avoid, and the override as the place the
  guarantee is spent.
