---
layer: technique
type: technique
subject: release-pipeline
technique: release-level-by-reader-reach
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [deciding whether a change takes a patch a minor or a major, arguing that an additive change is risk-free, a consumer broke on a release that added only an optional field, choosing a release level for a contract whose readers are generated, a chain of member tests ends in a real behaviour rather than a named member]
---

# The release level is set by the readers' reach

The level question — patch, minor or major — is almost always answered by
looking at the diff. Two teams look at the same diff and reach opposite
answers, and both can cite a principle. One says an addition risks nothing,
because no code that exists calls it. The other says an addition is breaking,
because a reader built *from* the contract does not survive a superset of it.
They are not disagreeing about versioning. They are describing two different
reader populations, and neither of them looked.

## "Additive" names two changes with opposite blast radii

**A new name** — a new exported symbol, a new endpoint, a new capability
nobody has asked for — is reachable only by a consumer that writes that name.
No existing consumer can reach it. Blast radius: zero.

**A new member of an existing shape** — a field on a value already returned, a
variant of a union already returned, a value of an enumeration already read —
arrives through a channel every existing consumer already reads. Blast radius:
total.

Both are called additive. The word covers two cases with opposite radii, which
is why the argument about whether "additive" is safe never converges: the two
sides are each right about their own case. Ask which one it is before anything
else. The answer is one sentence and it settles half the question.

## What a reader does with a member it has never heard of

The other half is a property of the reader, and there are exactly three
answers.

1. **It cannot exist.** The reader's surface is *derived* from the whole
   contract — generated from it, or closed over it by a dispatch that a bottom
   type makes total. Every addition reaches every such reader, at build time.
   These readers cannot be skewed: either they are regenerated, or they do not
   compile.
2. **It falls into a branch that acts.** The reader enumerates the members it
   knows, and its last branch is a real behaviour. Every addition reaches every
   such reader, at run time, under the identity of something else. Nothing goes
   red. The reader is behaving exactly as written, which is why review does not
   catch it (`_laws.md#unknown-is-not-a-value`).
3. **It is ignored.** The reader enumerates what it knows and its residue is
   inert. The addition reaches nobody.

## The rule

State the level from the readers, not from the diff.

- **An addition through a new name: the lowest level, always.** Nothing that
  exists can reach it.
- **An addition through an existing shape: the level of the loudest reader
  class present.** One derived reader makes it breaking, because that reader
  cannot read a superset without being rebuilt. One acting-default reader makes
  it breaking *and* silent, because it ships green. Only when every reader's
  residue is inert is this the lowest level.
- **A repair to existing behaviour: the level of the consumers that assert on
  the value rather than on the shape** — a subset of the population, and
  usually a smaller one than an existing-shape addition reaches.

Which means the blast-radius argument for demoting additions is sound, and its
own premise inverts its conclusion. A repair lands in a slot every consumer
already handles, where the worst outcome is a wrong value in a right shape. An
existing-shape addition lands in a slot some consumer has *no* behaviour for,
and that consumer's guess is the failure. Wherever any reader's residue is not
inert, the addition is the more dangerous change of the two.

## You cannot classify your own change

Those three answers are properties of how each reader was *built*, and the
publisher observes none of them.
[must-ignore-unknown](../../../standards-and-gates/repo-manifest-standard/techniques/must-ignore-unknown.md)
already states the half of this that everyone discovers first: for a
restriction, "the specification says so" is not an answer to "what happens in
practice"; only the roster of readers is. The same holds for a purely
*descriptive* addition, for a different reason — the danger is not in what the
new member means, but in how the reader was constructed.
[semver-additive-evolution](../../../standards-and-gates/repo-manifest-standard/techniques/semver-additive-evolution.md)
says sets are open by declaration, not by hope. A derived reader is the case
where the declaration is honoured by the specification and not by the code: the
contract declares itself open and the reader is closed anyway, and no amount of
declaring reopens it.

Two consequences:

- **Where the roster is surveyable, survey it, and let the level follow.** An
  internal contract with three known readers is a different object from a
  published one, and the same diff is honestly allowed a cheaper level.
- **Where the roster is not surveyable, assume a derived reader exists.** Freeze
  the live contract against additive change and put additions on the next
  version. That looks extravagant until it is priced correctly: the publisher's
  cheapest possible change is somebody else's rebuild, and an open-ended roster
  guarantees somebody is generating.

## The acting default is the one to hunt

Of the three reader classes, only the second fails without a signal, and it is
the one a version number cannot help with. It is invisible in review, too: a
chain of tests over the known members, ending in a real behaviour, reads as
complete on the day it is written and is a silent mislabeler from the first
addition afterwards. Two hand-maintained enumerations of one vocabulary are a
race with a delay fuse, and they drift precisely when somebody extends the
vocabulary and finds only one of them
(`_laws.md#one-authority-per-vocabulary`). A dispatch closed by a bottom type
is one authority; a chain ending in a label is the second copy — and the second
copy is the one no gate reads.

The repair is cheap and mechanical: **the last branch must name a member, and
the residue must go to something whose parameter type is empty.** The addition
then reaches that reader as a build failure, which is the loudest and cheapest
of the three outcomes, and the reader moves from class 2 to class 1 — the only
direction worth moving in. A reader that is *derived* over the contract is
often described as the fragile one; it is the only one that cannot be wrong
quietly.

The same mechanism has a second face at the other end of the wire, where a
reader with no slot for an added field silently *drops* it and the capability
that field carried simply never works
([one-typed-carrier-for-echoed-state](../../../../backend-platform/resilience/multi-provider-gateway-plane/techniques/one-typed-carrier-for-echoed-state.md)).
Same cause, opposite symptom: the reader's surface was derived, so the
publisher's addition had nowhere to land.

## Decision rules

- **When asked whether a change is a patch, ask which readers exist before
  looking at the diff again.** The diff cannot answer it, and every argument
  that starts from the diff stalls.
- **When an addition goes through an existing shape, find the readers whose
  residue acts and fix them in the same release.** They are the ones the
  version number will not warn.
- **When a reader is generated, count it as unable to tolerate anything**,
  whatever the contract says about unknown members. Its tolerance was not
  written; it was derived, and nobody chose it.
- **When two people argue the level from opposite principles, they have
  different reader populations in mind.** Write both populations down. The
  disagreement usually dissolves; when it does not, their union sets the level.

## When not to use this

Do not spend this on a contract whose only reader is regenerated from the same
source in the same commit. There the reader and the contract move together, no
skew is possible, and the level question is ceremony — the same boundary test
that decides whether to version the artifact at all. And do not let a
surveyable roster justify a cheap level for a contract that is about to acquire
readers nobody has met: the roster is evidence about today, and publishing is
the act that invalidates it.
