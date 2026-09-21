---
layer: technique
type: technique
subject: invariant-placement
technique: occurrence-is-not-a-type
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success, count-carries-predicate]
shared_with: []
applied: code
ab_verdict: better
use_when: [a contract term is believed to be held by the type checker and has never been tested, deciding whether a convention needs a checker when the code already type-checks, a rule concerns when a value was read rather than what it is, a rule concerns whether a returned value was used or discarded, a rule concerns which parts of a value a consumer touched, a rule concerns whether two values are the same object rather than equal ones, an annotation is required to be tighter than the checker demands, a team has one checker rule per library idiom and no account of what they have in common, a compliance rate for a convention has never been measured because nothing reads it]
---

# Occurrence is not a type

The subject's [what cannot rise](../invariant-placement.md) names two classes
barred from the shape and door altitudes: facts that expire, and obligations
to act. There is a third, it is larger than both, and it is the one authors
never look for — because the program compiles, so they believe the altitude
was collected.

**A checker holds a term only when the term is a property of some type.** A
contract term that is a property of the value's *occurrence* — which object
this is, when it was read, whether anybody used it, which of its parts were
touched, how long it stays valid — has no type to be carried in. The
violating program and the compliant program have the same types, so the
checker's output is byte-identical on both. This is
[prose-rule-drift](../../quality-gates/techniques/prose-rule-drift.md)'s "the
forbidden action works" moved one layer down: not a rule with no mechanism,
but a term whose mechanism was assumed to be the compiler.

## The test, in one sentence

> **State the term without naming where the value came from, when it was
> read, whether anybody consumed it, the order it was written in, or which of
> its parts were touched. If you cannot, no type holds it.**

Two families fail the test, and they are different denials:

- **Occurrence properties.** Identity (is this the same object as last
  time), capture time (a value read during initialisation is frozen for the
  program's life), consumption (a returned value that nobody read is legal),
  read set (which fields a consumer actually touched), and lifetime (an
  allocated thing with no matching release). The type is identical on both
  sides of the contract.
- **Terms about the annotation itself.** "This declaration must be tighter
  than the checker requires" — an index signature where an enumerated shape
  belongs, an assertion where a check belongs. A weaker annotation is not an
  error, so the checker cannot be asked whether it was given enough to work
  with. This family is small and unusually damaging, because it disables the
  checker at the exact site that documents the contract.

The test is a *filter*, not a verdict. Over thirty-three hand-written checker
rules — every one in a thirteen-repository fleet, concentrated in the three
repositories that write them at all — it admitted nine, twenty-seven percent, and
that is the property that makes it usable. The artifact test
`decidable-in-a-window` measured and rejected admits nearly every rule and
therefore predicts nothing; a filter that admits everything is a label.

## Admitting a term is only the first of two questions

The test says no type holds the term. It does not say a checker can.
[decidable-in-a-window](../../quality-gates/techniques/decidable-in-a-window.md)
is the second question and it is asked next, on the same term:

| no type holds it | decidable in a window | what to do |
|---|---|---|
| yes | yes | write the rule; this is the cheap region, and the rule is a few lines |
| yes | no | **no rule can hold it.** Record it in the unbacked column with the reason. A window-shaped guard for a term that needs the consumer graph reports a different relation than the one the rule names |
| no | — | the checker already holds it, or a shape change would. Do not write a rule for a term the type system can carry |

The third row is the one that saves the most work, and the second row is the
one that saves the most credibility. A measured instance of the second row:
the term *this consumer reads more of the value than it needs* is an
occurrence property, so the test admits it. Deciding it requires knowing what
every downstream consumer reads. The available window-shaped proxy is a field
count on the read, and over a hundred and four such reads in two large
repositories the field counts run continuously from one to seventeen with no
gap anywhere — there is no threshold to pick, and every threshold classifies
correct code as a violation. The honest output is a recorded absence, not a
guard.

## A team's rules are an inventory of this, whether or not they know it

Apply the test to a repository's own hand-written checker rules and they sort
into three piles, one of which is the point:

- **Style, token and adoption rules.** The majority, and legitimately so.
  They enforce a preference, and their violation is visible — a wrong radius
  looks wrong.
- **Arrangement rules.** What may import what, which artifact must accompany
  which. The subject already routes these:
  [placement-precedes-gate](./placement-precedes-gate.md) says a rule with no
  single value to encode is a gate, and these have none.
- **Terms no type holds.** The pile that matters, because each of its members
  was *invisible before somebody wrote that rule*, and no team writes down
  the list.

The measured distribution over the thirty-three rules: nineteen style, five
arrangement, nine type-invisible, and **zero** rules standing in for a term
the checker could have held. That last zero is the reassuring half — teams do
not commonly write checker rules for things a type would carry — and the nine
are the finding. Read together they are not nine rules about nine libraries;
they are a partial inventory of what the checker has no vocabulary for, and
the same five occurrence properties recur across unrelated repositories and
unrelated libraries. Write the inventory down. It is the only artifact that
tells a reviewer which of the system's contracts are held by a mechanism and
which by whoever remembers.

## Type-invisibility is why you cannot see the rate, not why the rule is mandatory

The tempting conclusion — no type holds it, therefore ship a rule — is too
strong, and the measurement refutes it. Two repositories using the same
container library were compared on one term the test admits: *a selector that
builds a fresh value must supply a comparison, or the snapshot differs on
every change*.

| | opportunities | violations | rule for this term |
|---|---|---|---|
| repository A | 64 | **0** | none |
| repository B | 49 | **18** | none |

Repository A holds the term perfectly, by convention, over sixty-four
opportunities inside two thousand one hundred and sixty-five call sites.
Repository B, which has no hand-written checker rules at all, violates it at
thirty-seven percent — while thirty-five other call sites in that same tree
supply the comparison correctly. The idiom is known there and applied
inconsistently.

So type-invisibility does not predict violation. What it predicts is that
**nobody can tell which of the two situations they are in.** Both teams
believed they were compliant; neither had an instrument, and the difference
between 0/64 and 18/49 was unobservable from every surface either team would
have checked. That is
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)
applied to a compliance rate rather than to a result, and it is the actual
argument for the rule: the rule's first delivery is the number, and the
enforcement is second. A team that adopts the convention and never measures
it has adopted `absent-guard-is-loud`'s optional guard
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)) in its
purest form — the guard is a memory.

## The predicate is the whole rule, and the sledgehammer is the failure mode

A term that survives both questions gets a rule, and the rule will be
tempting to write broadly, because the narrow predicate is the hard part and
the broad one catches the narrow one. Measured on the same term, in the same
tree, over nine hundred and seventy-nine files:

- the narrow rule — flag a selector that builds a *fresh* value without the
  comparison — reported **18**, all eighteen real.
- the broad rule — flag any selector without the comparison — reported
  **280**, of which **262 are correct narrow reads** that need no comparison
  at all. Ninety-four percent false, from deleting one predicate.

Both rules are about the same length and both run in under a second. The cost
was never the discriminator; the predicate was. A count of 280 and a count of
18 are the same kind of integer and different claims
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and
the broad rule's number is the one that gets the rule switched off.

## Proving the term really is invisible, rather than assuming it

The claim "the checker cannot see this" is itself checkable, and it is worth
checking, because the alternative is writing a rule for something the checker
already refuses. The procedure is the subject's negative artifact
([constraint-deletion-is-silent](./constraint-deletion-is-silent.md)) run in
the other direction:

> **Repair one violation and run the checker on both versions. Same error
> count, same codes, same sites means the term is invisible and the rule is
> load-bearing. Any difference means the checker held part of it and the rule
> is narrower than you thought.**

Run on the eighteen repairs above, the checker reported thirty-nine errors
before and thirty-nine after — identical codes at identical sites, none of
them at a selector, the only difference a one-line offset from an added
import. That is the evidence, and it takes one run to get.

## When not to use it

**When a shape change is available.** The test says no *type* holds the term
as stated; it does not say no encoding can. An identity term can sometimes be
converted into a type term by making the stable thing a distinct kind of
value minted at one door. Try the door altitude first — that is the subject's
own order — and reach for a rule when the conversion would cost every call
site.

**When the members are merely indistinguishable.** If the term is "these two
values must not be swapped" and the checker simply cannot tell them apart,
that is
[indistinguishable-members-do-not-rise](./indistinguishable-members-do-not-rise.md),
a different denial: the checker's *resolution* is too coarse for a term it
does have a vocabulary for, and the repair is to make the members
distinguishable. Here the checker has no vocabulary at all, and no branding
recovers it.

**When the rule was already written down and ignored.** A term nobody
mechanised because it sat in a standing document that nobody read is
`prose-rule-drift`'s population, and its remedy is the caller, not the
placement. This technique's population is terms that were never written down
as rules, because everyone assumed the compiler was holding them.

## Decision rules

- Before writing a checker rule, ask whether the term is a property of a
  type. If it is, the rule is the expensive instrument doing a shape's job.
- A term about identity, capture time, consumption, read set or lifetime has
  no type. Stop looking for one.
- A term requiring an annotation to be tighter than the checker demands has
  no type either, and its violation disables the checker at the contract's
  own site.
- Admitted by this test, decidable in a window: write the rule, and keep the
  predicate narrow enough that a correct call site never appears in the
  output.
- Admitted by this test, not decidable in a window: write the absence down
  with its reason. Do not ship the field-count proxy.
- Prove the invisibility by repairing one violation and diffing the checker's
  output. Identical output is the rule's justification; any difference
  shrinks the rule.
- Keep the inventory. The list of terms no type holds is the honest statement
  of which contracts have mechanisms, and no tool produces it.
