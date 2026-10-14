---
layer: technique
type: technique
subject: trust-base
technique: leaf-spec-states-what-callers-read
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [writing the contract of a function the checker is told to trust, a trusted contract is deliberately weaker than the body, a refactor adds a caller of a trusted function, a proof fails because a trusted contract says too little]
---

# A leaf's spec states what callers read

The contract on a trusted body is the only thing the checker knows about it, so
the contract defines the leaf for every proof built on top. There are two ways to
get it wrong and they point in opposite directions. A contract **stronger than
the body** is a lie the checker will believe: every downstream proof passes on a
fact the code does not provide. A contract **weaker than the body** is honest and
safe, but it is only as safe as the discipline around it, because the person
reading the body sees more than the contract promises and will rely on it.

The technique is to size the contract to what callers consume, and to write the
omissions down beside it.

## Write the omissions

A contract says what is guaranteed. A trusted leaf's contract also needs a line
for what is **deliberately not guaranteed**, adjacent to the contract text, so
the next reader meets the gap before relying on it. The usual cases:

- A conversion from an unordered container to a sequence that guarantees
  membership in both directions and says nothing about the length or about
  whether any element repeats. Say that it is membership-only and name the two
  properties a caller would have to ask for before relying on them.
- A lookup whose contract covers present and absent keys but not which of two
  duplicate entries wins.
- A read of a collection whose contract states the set of values returned and
  not their order.

Name the omission by its property, because "partial spec" gives a reader nothing
to act on and "length and uniqueness are not stated" does.

## The rule when a caller needs more

**Strengthen the contract; never assume.** A caller that needs uniqueness has
three bad options and one good one. It can assume the property from the body it
read, which works until the body changes. It can add an unchecked assumption at
the call, which relocates the trust to a place with no contract. It can
duplicate the check, which hides the dependency. The good option is to change the
contract on the leaf itself and extend both of its witnesses in the same change:
the body must be re-read against the new clause, and the outside test described
in [trusted-leaf-gets-an-outside-test](./trusted-leaf-gets-an-outside-test.md)
must gain an assertion for the new clause. A contract strengthened without
touching the test has moved the axiom and left it unobserved.

## How a reviewer finds a new caller that reads more

This is the weak point, and the answer depends on whether the caller is inside the
checker's view.

- **A caller the checker reads cannot silently read more.** If it needs a property
  the contract omits, its proof fails to go through, and that failure is the
  alarm. The omission is self-enforcing in a checked caller, and the comment's job
  is to tell the author who hits that failure the right move (strengthen the
  contract and the test) rather than the wrong one (assume it at the call).
- **A caller outside the checker's view can.** Unverified code that calls the leaf
  can depend on any property the body happens to have. Two mechanisms narrow the
  exposure. First, keep the leaf **private to the module that verifies against
  it**, so its caller set is the module and is findable by search. Second, state
  the caller set in the comment, for example "the only caller reads membership",
  which makes adding a caller an edit the reviewer sees contradicts a sentence in
  the diff context. That sentence is a claim with a count in it, and like any
  count it must carry its predicate: which callers, found by what search
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Decision rules

- **Prefer the weaker contract when callers read less.** A stronger clause is a
  stronger claim about a body nobody proves. Do not strengthen a contract
  speculatively; every clause added to a trusted leaf is another thing its test
  must observe.
- **Write the contract from the callers, not the body.** List what each caller
  reads, take the union, and stop. The body will do more; the contract should not
  say so.
- **Do not hide the omission in a general disclaimer.** One sentence naming the two
  properties is a review aid. A page of caveats is noise and gets skipped.
- **Re-read the omission whenever a caller is added**, as an explicit step of the
  change, not of the quarterly audit.

## When not to use it

- **When the contract is total.** A leaf whose contract fully specifies its result,
  such as a read that returns exactly the stored value or nothing, has no omission
  to record. Writing "nothing is omitted" is padding.
- **When the leaf is about to be proved.** If the work is under way to make the
  checker read the body, spend the effort there and delete the leaf.
