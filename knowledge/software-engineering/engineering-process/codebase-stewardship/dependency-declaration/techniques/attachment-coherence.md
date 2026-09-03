---
layer: technique
type: technique
subject: dependency-declaration
technique: attachment-coherence
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [designing a system where behaviour can be attached to a type from outside, two independently correct packages cannot be assembled together, deciding whether a wrapper type is ceremony or a rule, an attachment covering every type meeting a bound is proposed]
---

# Attachment coherence

Many systems let behaviour be attached to a type **after that type is
defined**, by somebody who did not define it: an interface implemented for a
foreign type, a method added to an existing class, an instance registered for a
type in a global table, a serializer or comparator installed for a shape
somebody else owns. The mechanism is what makes an ecosystem composable — a
third package can teach two packages that know nothing of each other to work
together, with no edit to either.

Unrestricted, it is also the one mechanism that can make **two independently
correct packages undeployable together**.

## The failure, and who it lands on

Two packages each attach the same behaviour to the same type. Each is correct
in isolation, each has passing tests, each has an author who made a reasonable
decision. The conflict does not exist in either package. It comes into
existence in a third place — the assembly built by whoever needs both — and it
is discovered by a person who authored neither and can fix neither. Their only
moves are to drop one of the two packages, to fork one of them, or to wait on
two maintainers who have no shared incentive to converge.

That is a failure of **composability**, the second of this subject's three
invariants ([declaration-invariants](./declaration-invariants.md)): the
declarations of independent units must combine without somebody who knows about
all of them. An attachment mechanism with no coherence rule violates it
silently and only at assembly time, which is the worst place in the pipeline to
learn about it — a mechanism that composes for every pair of units anyone has
tried, right up until the pair somebody actually needs.

It is also [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
read at the level of the assembled program. "How this type behaves under this
interface" is one decision. Two hand-written encodings of it are not
redundancy; they are a conflict with a delay fuse, and the fuse burns down in
somebody else's build.

## The constraint that prevents it

> **One end of the attachment must be owned by the party making it.** Either
> the interface is yours, or the type is yours. An attachment where both ends
> are foreign is refused.

The rule is checkable locally — it needs no knowledge of what any other package
did — and it is exactly strong enough: for any (interface, type) pair, only one
party can satisfy it, so the conflicting pair of attachments can never both be
written. Nothing has to be resolved at assembly because nothing collides.

**The visible price is the wrapper.** When a party needs an attachment and owns
neither end, it must first create a type it owns — a thin wrapper around the
foreign one — and attach to that. This looks like pure ceremony from inside the
package that pays it, and that reading is the mistake worth correcting: the
wrapper is the cost of a guarantee, paid by the party that wants the
attachment, in the place where the decision is made. The alternative systems
are not cheaper; they merely move the payment. Where the rule is absent the same
cost reappears as last-writer-wins patching, as resolution-order surprises where
the behaviour depends on which package was loaded first, and as monkey-patched
types whose actual behaviour cannot be determined by reading anything.

A useful reframing of the wrapper: it converts *somebody else's identity* into
your own, so that the attachment is unambiguously yours. That is the same move
[borrowed-surface](../../module-design/techniques/borrowed-surface.md) makes
for a different problem, and the distinction matters. Its second form is about
depending on an upstream taxonomy *staying as it is* — a correctness premise
you did not author. This is about who may make an attachment *at all*, which is
a permission question decided by the mechanism, not a forecast about a
dependency's next release.

## The widest attachment is the least reversible

One consequence deserves its own rule, because it is where the constraint bites
hardest and latest. An attachment written **once for every type meeting a
bound** is enormously convenient and is very close to irreversible: after it
exists, a more specific attachment for a type already covered by it cannot be
added, because the two would overlap and the mechanism refuses overlap. The
convenience is bought by permanently forfeiting the ability to special-case
anything inside the covered region — including cases nobody has thought of yet.

So the ordering rule: **attach narrowly first, widen only when the general
behaviour is settled.** A specific attachment can always be generalised later;
a blanket one cannot be narrowed without a breaking change for everybody
downstream. And a package that publishes a blanket attachment has taken a
decision on behalf of every consumer's whole type universe, which is a much
larger claim than its diff suggests.

## Designing a mechanism that has this problem

If you are building the mechanism rather than living under one, the checklist
is short:

- **State the ownership rule, and enforce it at declaration time.** A rule
  enforced only at assembly gives the diagnostic to the wrong person.
- **Make the wrapper cheap.** The rule's whole cost is concentrated there, so a
  system that forces a hand-written forwarding layer for every wrapper has made
  the correct move expensive and the workaround attractive. Cheap wrapping is
  what keeps the constraint from being routed around.
- **Refuse overlap loudly, not by precedence.** A mechanism that resolves two
  attachments by load order, file order, or last registration has not avoided
  the conflict; it has made the program's behaviour a function of assembly
  order, which is the state where a working system breaks on an unrelated
  dependency bump.

## When not to use it

**In a closed system with a single assembler, there is no third party, and the
mandatory wrapper is ceremony.** An application whose whole graph is authored
by one team, an internal service, a component compiled into exactly one binary
— the conflicting pair of attachments cannot arise, because the same people
would have to write both and would notice. There, forcing a wrapper for every
foreign type buys nothing and charges a real cost: a layer of types that exist
only to satisfy a rule, each one a place where somebody must decide what to
forward.

The condition to watch is not the size of the codebase but whether a
**third-party assembler** can exist. The moment a unit is published for
consumers you do not enumerate, the closed-system exemption ends, and it ends
retroactively: attachments written under the exemption become part of what
consumers must assemble around. Decide which world a unit is in when it is
published, not when the first conflict is reported.
