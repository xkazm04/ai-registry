---
layer: technique
type: technique
subject: plan-entitlements
technique: provider-publishes-state-not-decision
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value, verdict-survives-boundary]
shared_with: []
use_when: [serving entitlement answers to another team's product, designing an entitlement read contract, a limit whose meaning the serving side cannot know]
---

# When the serving side must refuse the decision

Everywhere else in this subject the product is the **consumer** of an
entitlement answer: it asks what a tenant's plan includes and acts on the
reply. This technique inverts the seat. Here the product is the system that
*computes and serves* that answer for somebody else's product — a billing
engine, a platform tier service, an internal entitlement service consumed by
three teams that do not share a release train.

From that seat, [capability-gate-predicates](./capability-gate-predicates.md)
flips. That technique's most valuable move is refusing the boolean and
returning an enumerated decision — *unlimited*, *allowance*, *credit*,
*denied*. It is right, and it stays right, for the case it was written for:
the gate and the tier model in one repository, maintained by the people who
chose the vocabulary. One level up the stack, that enumeration is the
**consumer's**, not yours. A serving system that computed it would be
authoring a second tier model over data it does not own — exactly the failure
the golden path warns about, arriving from the opposite direction.

## The condition that flips the rule

State it as a test, because it is not a matter of taste:

**Who authored the limit vocabulary?** If the capability names, their value
types and their sentinels were chosen by the same people who write the gate,
enumerate the decision. If they are **operator data** — rows an administrator
of the consuming product created, in names and units you have never seen —
you hold the values and not their meaning, and you must publish state.

The concrete failure is a single field. An operator sets a limit to zero.
Does that mean *nothing is included* or *there is no bound*? Both are
ordinary conventions, both appear in real configurations, and the serving
system cannot tell them apart, because the sentinel is a semantic and the
semantic was declared by whoever wrote the row. Coercing it either way
converts an unknown into a definite value at the boundary where an optional
meaning meets a non-optional verdict, which is
[exactly what a sentinel must never do](../../../../_laws.md#unknown-is-not-a-value).
The interpretation belongs to the consumer, and
[to the one authority for that vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
— which is the operator who authored it.

## What gets published instead

Not less than the decision — differently shaped, and usually more:

- **The resolved value**, after the serving side has applied its own layering
  rules (see below), in its declared type rather than stringified.
- **The declared type** of the field: numeric, textual, truth-valued, or a
  choice from a closed set. This is the classification the serving side
  genuinely computed and it must cross the boundary as a typed value, not be
  flattened into a string the consumer re-types by inspecting the characters.
  A verdict that survives only as prose
  [has not survived](../../../../_laws.md#verdict-survives-boundary).
- **The domain**, when the type is a closed set — the permitted choices, so
  the consumer can validate without a second copy of the enumeration.
- **The provenance**: which layer set this value — the tier, an override, a
  removal. The consumer needs it to render "this customer differs from the
  plan", and it is the tri-state of
  [subtractive-entitlement](./subtractive-entitlement.md).

## Resolution is yours; interpretation is not

The distinction that keeps this technique from collapsing into "publish the
raw rows and let them sort it out". The serving side **does** decide which
layer wins — the precedence of a subscription-level override over the tier's
value, of a removal over both — because it owns the layering model and the
consumer cannot reconstruct it. What it does not decide is what the winning
value *means*. Resolve, then stop.

## The structural test

Mechanical and worth running on any serving tree: **count the call sites in
the serving system that branch on an entitlement value.** Not on its type,
not on whether a row exists — on the value itself. The target is zero. Every
branch is a place where the serving side has adopted a semantic it did not
author, and it will be wrong for the first operator whose convention differs.
A serving tree at zero can add a new value type without auditing its own
behaviour; one with six such branches has a tier model it never admitted to
building.

## Say it in the contract, or the consumer invents it

A published read contract that shows only an example payload teaches nothing
about sentinels, and **a consumer that needs an unbounded convention and is
not given one will invent one** — usually zero, sometimes a very large number,
occasionally an absent field. Two consumers invent two, and the serving side
now has a compatibility problem it never chose. The contract states, in
words:

- values are opaque to the serving side and are never coerced or defaulted;
- the type declares how to compare, and comparison is the consumer's;
- absence of a capability and a capability present with a low value are
  different facts with different fields;
- there is no unbounded sentinel unless the operator declares one in their
  own vocabulary, and if they do, the serving side still does not read it.

## Decision rules

- **When the gate and the vocabulary live in one repository, enumerate the
  decision.** This technique does not apply, and applying it there produces a
  contract full of raw numbers that every caller interprets slightly
  differently — the sibling technique's failure, rebuilt by hand.
- **When a consumer asks for a decision endpoint**, the honest answer is to
  let the operator declare the missing semantic — a type, a domain, an
  explicit unbounded flag on their own field — rather than to guess it
  centrally. A decision endpoint over operator data is one team's convention
  shipped to everyone.
- **When a truth-valued capability is involved, publish presence, not truth.**
  "The row exists" and "the row exists and its value is true" are the
  consumer's question; a serving side that collapses them has interpreted.
- **When the serving side authors part of the vocabulary itself** — its own
  fixed, closed capability set, shipped in its own releases — it owns those
  semantics and should enumerate the decision for exactly those. Draw the line
  at authorship, not at the transport.

## When not to use this

- **Single-repository products.** The overwhelming majority. Publishing state
  where you own the semantics pushes interpretation to every caller and
  guarantees they diverge.
- **Where the serving side must enforce, not inform.** If the answer gates an
  action the serving side itself performs, it is a gate, and a gate returns a
  decision. Serving a read to a consumer that enforces is the case here.
- **Where the consuming side is a rendering surface with no logic** — a status
  page, an operator console — a resolved decision is kinder and the serving
  side can offer one *alongside* the state. Offering it *instead* is the
  defect.
