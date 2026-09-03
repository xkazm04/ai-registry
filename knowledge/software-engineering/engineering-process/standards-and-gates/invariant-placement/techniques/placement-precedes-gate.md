---
layer: technique
type: technique
subject: invariant-placement
technique: placement-precedes-gate
status: forged
laws: [absent-guard-is-loud, one-validation-door]
shared_with: []
use_when: [a new rule has been agreed and nobody has said where it lives, choosing between a shape change and a checker, a rule that keeps being re-broken at newly added call sites, deciding whether to encode a domain you do not understand yet]
---

# Placement precedes gate

The question "how do we enforce this?" has a prior question that is almost
never asked out loud: **at what altitude does this rule live?** Four answers
exist — the invalid state is unrepresentable, the value is refused at one
construction door, a mechanism reads an artifact and refuses, a check runs at
the point of use — and only the third is a gate. Teams that skip the prior
question default to the third every time, because a gate is the answer that
comes with tooling, and they then spend years maintaining a checker for a rule
that a shape change would have retired.

## The procedure

1. **State the rule as a sentence about a value**, not about a file or a
   commit. "A temperature and a rotation rate are never added" is a rule about
   values. "Nobody writes an unchecked query" is a rule about call sites, and
   the translation to a value — *a query fragment that reached the driver was
   composed by the one composer* — is the work this step does.
2. **Name the blast radius.** How far does a violating value travel before
   anyone notices, and what does it cost when it lands? Three markers raise the
   answer: the value crosses a durability boundary, it crosses an ownership
   boundary to consumers you cannot fix, or it authorises something. Absent all
   three, the radius is one routine and the answer is a call-site check.
3. **Test the two upper altitudes against the value's lifetime.** The shape and
   door altitudes carry only facts that stay true for as long as the value
   exists. If the property has a clock, stop here; the altitude is a gate or a
   call site, and no encoding recovers it.
4. **Price the encoding before choosing it** — the five costs in the golden
   path, and specifically: how many properties will this shape track, how many
   near-identical declarations does that cost, what will the refusal message
   read like at that count, and is this interface published.
5. **Only now choose the mechanism.** If the answer is a gate, the entire
   downstream design — rung, severity, blocking input, liveness — belongs to
   [quality gates](../../quality-gates/quality-gates.md), and this decision
   hands over cleanly because it has already fixed what the gate is *for*.

## Why the order is not a preference

Reversing it produces two specific, common failures.

**A gate standing in for a shape.** A rule that a checker enforces over source
text is enforced once per run, over the files the run reads, at whatever rung
it was wired to, for as long as somebody maintains it. The same rule placed in
the shape is enforced at every call site that will ever exist, including the
ones added by people who never read the standard, with no maintenance and no
scope. Where both are available, the gate is the more expensive instrument
doing the smaller job — and it is an
[optional guard](../../../../_laws.md#absent-guard-is-loud), because a checker
can be unwired, skipped or scoped away while a shape cannot.

**A shape standing in for a gate.** The inverse is at least as common among
teams that have discovered the upper altitudes. Not every rule is about a
value: rules about *arrangement* — what may import what, where a file lives,
which artifact must accompany which — have no value to encode, and attempts to
encode them produce elaborate marker structures whose only effect is to make
the arrangement rule harder to read than the sentence it started as.

The discriminator: **can you write the rule as a property of one value, such
that a routine receiving that value needs no further knowledge?** If yes, the
upper altitudes are available. If it takes two values, or a value and its
context, or no value at all, you are looking at a gate.

## What rises, and how far

The door altitude is where most real gains are. It costs one constructor and
one distinct kind of value, its refusal message is written by a human, and it
composes with the per-store rule
([one-validation-door](../../../../_laws.md#one-validation-door)) rather than
competing with it: the store's write door is the natural place to mint the
validated value, and the value then carries the verdict into every signature
downstream. Most teams that believe they need the shape altitude need the door
altitude and have not distinguished them.

The shape altitude earns its price where the *combination* is the defect —
where the failure is not a bad value but a bad pairing of good ones, and where
enumerating the legal combinations is cheaper than guarding the illegal ones.
That is the same argument that replaces a cluster of independent flags with one
enumerated status
([status FSMs](../../../../client-architecture/client-state/techniques/status-fsms.md)),
and it is the form in which the altitude is almost always worth paying for.

Remember what rising costs the caller. An invariant a caller must establish is
part of the interface whether or not it appears in the signature
([module depth](../../../codebase-stewardship/module-design/techniques/module-depth.md)),
so raising a rule does not remove it from what the caller has to learn — it
moves it from prose, where it was ignorable, into the interface, where it is
mandatory. That is usually the trade you want. It is not a free one, and a
module that raised six rules has an interface six facts deeper than it reads.

## When not to use it

**When the encoding is likely to be wrong.** Exploration of an unfamiliar
domain, a protocol nobody has implemented against real hardware, a data source
whose actual shape is still being discovered: here the standard advice — raw
shapes first, refine after the behaviour is understood — is correct, and the
half that is habitually left off is that **the refinement is a breaking change
once the interface is published.** Tightening a shape invalidates callers;
removing a capability from a published interface invalidates them louder. So
the inversion carries a deadline rather than a permission: prototype with raw
shapes, and place the invariants *before the interface acquires consumers you
cannot edit*. A team that prototypes with raw shapes and publishes anyway has
not deferred the decision; it has made the expensive one silently.

**When the rule is about arrangement rather than value**, per the
discriminator above.

**When the property expires.** Covered in the golden path and repeated here
because it is the failure that looks most like a success: an encoding of a
lapsing fact is a proof that outlives the thing it proved.

## Decision rules

- Name the altitude before naming the tool. A rule with a checker and no stated
  altitude was placed by whoever configured the checker.
- The altitude rises with the distance between the mistake and its consequence,
  not with the severity of anyone's feelings about the mistake.
- If the rule cannot be written as a property of a single value, it is a gate.
- If the property has a clock, the top two altitudes are unavailable.
- Price the encoding at the property count you expect in two years, not the one
  you are starting with.
- Refine before publishing, or budget the versioned break.
