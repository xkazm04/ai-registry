---
layer: technique
type: technique
subject: catalog-pipeline-authoring
technique: packaging-exempt-two-state-rule
status: forged
laws: [unmeasured-is-not-a-pass, compiling-is-not-wiring, law-and-check-share-one-source]
shared_with: []
use_when: [a convention that most members follow and a few legitimately do not, an exemption that reads as silence, deciding whether a production line needs a terminal shipping step]
---

# The two-state rule for a legitimate exemption

Most content classes end on a terminal step — the one that stages what actually ships
and can be re-graded from what is on disk. A few legitimately do not: their outputs land
in the project by another route, or the class is a cross-project workflow recipe rather
than a shipping row.

Before the rule exists, those few classes simply end on something else. The drain that
verifies terminal steps finds nothing to re-grade for them and says nothing about it, so
an intentional exemption and an authoring omission are the same observable: silence.
Nobody can audit the convention, because the population that violates it is
indistinguishable from the population that is exempt from it.

**Encode it as two states and no third: either own the terminal step, or declare, in a
machine-readable field, why one would be meaningless here.** A check fails any class
that has neither.

## The shape

- **Own it.** The class ends on the terminal step — matched either by a canonical label
  most classes share, or by an explicit flag for a class that names the step something
  else. The flag exists so the convention rests on a declaration rather than on string
  matching, and the canonical label exists so most classes need declare nothing.
- **Or declare the exemption.** A required non-empty reason on the class declaration
  itself, in prose, written for an operator to read.

There is no third state, and this is the whole rule. In particular: **do not add an
empty terminal step to satisfy the convention.** A step that stages nothing passes the
structural check, reports as present, and adds a permanently meaningless verdict to
every coverage number the class contributes to. It is worse than the exemption, because
it is an exemption disguised as compliance.

## Writing the reason

The reason must say why a terminal step would be **meaningless**, not why it would be
inconvenient. It should name what the class actually produces and where those outputs
land instead. Good exemption reasons are concrete about the alternative route and about
what the class's real terminal proof is — a class whose closing evidence is a perceptual
gate rather than a package manifest should say exactly that. Ending the reason with the
condition under which it should be revisited turns a static exemption into one that can
expire: *revisit if this class ever lands outputs in the shipped tree.*

That last clause is what stops an exemption from silently outliving the situation that
justified it. An exemption with no revisit condition is permanent by default, and the
population of permanent exemptions only grows.

## Surfacing exemptions as decisions

The reason must be **reported, not merely stored**. The verifier that walks the terminal
steps emits exempt classes as their own summary category — the class and its reason —
alongside the ones it graded. Then an exempt class reads to an operator as a decision
somebody made, rather than as a class the verifier had nothing to say about.

This is the same instinct as the acceptance layer's refusal to let an unmeasured thing
render as a pass: three populations exist — verified, exempt-with-reason, and
not-yet-done — and they must be three visible values. Collapsing exempt into either of
the others loses the information the rule was created to preserve.

## Decision rules

- **Declare an exemption only where the terminal step would be meaningless**, never to
  dodge the work. If the outputs *do* pass through the shipping route, the class owns
  the step, however awkward.
- **The reason is required and non-empty**, and the check enforces non-emptiness. An
  optional reason field decays to an unchecked boolean.
- **Keep the exempt population small and named.** Two exempt classes out of thirty is a
  convention with edges; ten is a convention that has stopped being one, and the right
  response is to ask whether the terminal step is really the right requirement.
- **Never soften the underlying requirement to make a class pass.** The two-state rule
  gives you a legitimate way to say "not here"; that is precisely what removes the
  excuse for weakening the requirement itself.

## Generalising

Any convention with legitimate exceptions belongs in this shape. The question to ask of
any "every X should have a Y" rule is: *what does a legitimate absence look like, and
can the system tell it from a mistake?* If the answer is no, the rule is not being
measured — it is being hoped for.

The general form is three parts: a required behaviour; a declared, reasoned exemption in
the same declaration the behaviour lives in; and a check that fails the class having
neither. Applied to wiring, an artifact either names how it is granted and activated or
declares why it needs no grant. Applied to coverage, a class is either walked or carries
a documented skip. Applied to verification, a criterion either produces a verdict or
declares itself deferred with a reason. Each is the same rule: **an absence must be
declared to count as a decision.**

## When not to use this

Where absence is never legitimate, do not add an exemption field — it will be used. If
every member genuinely must comply, the rule has one state and a failing check, and
adding a reasoned escape hatch converts a hard requirement into a soft one for the price
of one sentence.

Where absence is *usually* legitimate — where more members are exempt than comply — the
rule is pointed the wrong way. Invert it: make the behaviour the declared, reasoned case
and the absence the default.
