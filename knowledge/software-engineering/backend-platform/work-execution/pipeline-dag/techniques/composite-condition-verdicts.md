---
layer: technique
type: technique
subject: pipeline-dag
technique: composite-condition-verdicts
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [a guard written as none-of these apply fires while its data source is down, combining child conditions where a child can fail to answer, deciding what a timed-out condition contributes to an and or an or, a branch record says not-fired and nobody can tell whether the predicate ever ran]
---

# Composite condition verdicts

[conditional-edges](./conditional-edges.md) makes a single condition
three-valued and argues at length that collapsing *unevaluable* into either
definite verdict is the same defect wearing two faces. It also says compound
conditions exist — children composed with explicit and/or — and stops there.
That gap is where the third value is usually lost again: a leaf evaluator that
returns three values correctly, wired into a combinator that returns two,
reproduces the exact bug the leaf evaluator was written to prevent, one call
frame further from where anyone looks for it. The combinator is the harder
half, because a leaf's third value is *visible* — somebody had to type the
enum member — while the combinator's is a fold over a list of booleans that
reads as obviously correct.

## Where the third value comes from

Widen the leaf's causes past the authoring mistakes the sibling technique
lists. A condition is unevaluable whenever the evaluator did not obtain an
answer, and in a deployed system most instances are environmental rather than
editorial: the source it reads timed out; the capability it interrogates does
not exist on this platform; the permission it needs was never granted; the
provider behind it failed. None of these is a fact about the subject of the
condition — they are facts about the evaluator's reach.

The rule that follows is the one most often broken by an otherwise correct
implementation: **a deadline yields unevaluable, never false.** A timeout is
the absence of an answer, and an evaluator that returns *false* when its clock
expires has performed the collapse at the one site where it looks like
resilience engineering rather than a coercion
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The
same holds for a permission refusal: *not allowed to look* is not *looked, and
it was not there*.

## The operator table

Three operators cover essentially every authored tree. Each is stated as a
priority order, because the order is the content.

- **all** — if any child is *false*, the composite is **false**. Otherwise, if
  every child is *true*, it is **true**. Otherwise it is **unevaluable**.
- **any** — if any child is *true*, the composite is **true**. Otherwise, if
  every child is *false*, it is **false**. Otherwise it is **unevaluable**.
- **none** — evaluate **any** over the children, then: *true* becomes
  **false**, *false* becomes **true**, and **unevaluable stays unevaluable**.

The first two rows encode a single principle: **a definite child can decide a
composite that other children could not evaluate.** One false child settles an
`all` no matter how many siblings were unreachable, because the composite's
truth was determined before their answers mattered. Without that rule the
tables are unusable — a tree of five conditions over four sources would go
unevaluable whenever any one source blinked, and an engine whose rules stop
deciding under partial degradation gets its third value switched off by the
first operator under schedule pressure.

The third row is the load-bearing one, and the row a naive implementation gets
wrong for free.

## Negation propagates; it does not invert

`none` is almost always implemented as the logical inverse of `any`, which is
correct in two-valued logic and catastrophic in three. Invert a two-valued
`any` — one that already folded its unevaluable children into *false* — and
you get a `none` that returns **true** precisely when the engine could not
find out whether the children hold.

Spell out what that buys, because the shape recurs in every rule engine that
has one: a rule guarded by *none of these apply* fires **because** the check
failed. The source that would have reported the disqualifying condition timed
out, or the permission to look was revoked last week; the guard's absence of
evidence is read as evidence of absence, the rule fires, and the run is green.
Positive checks fail safe under the same fault — an `all` over an unreachable
source returns unevaluable and the branch does not fire, visible as *nothing
happened*. Negative checks fail **open**, and their failure is visible as *the
thing happened*, which is indistinguishable from working.

So the rule is a prohibition, enforced at exactly one place: **negation is
never implemented as a boolean inverse of a folded result.** It is a mapping
over three values, and the third maps to itself. Where a language's negation
operator is reachable from a verdict type, that is a type-design defect rather
than a style preference — a composite verdict should not be convertible to a
boolean without a stated policy at the conversion site.

## Short-circuiting is an optimization and must stay one

Evaluators stop early to avoid paying for children whose answers cannot change
the result, and that is legitimate — but only on the **deciding** value. An
`all` may stop at the first *false*; an `any` may stop at the first *true*.
Nothing may stop at the first *unevaluable*, because an unevaluable child never
decides a composite: a later false could still settle the `all`.

Two consequences follow, and only the first is obvious. The tables must hold
whether or not the evaluator short-circuits, so a tree returns the same verdict
on a warm run that answers everything cheaply and on a cold one that stops
early. And evaluation order becomes a design choice rather than an authoring
accident: ordering cheap local children ahead of expensive remote ones lets a
definite refutation settle the composite before anything can time out, which
lowers both cost and the rate at which the tree goes unevaluable at all. That
reordering is safe only because condition evaluation is pure; an evaluator with
side effects can neither reorder nor short-circuit.

One boundary case rides with the tables. `all` over no children is **true**
and `any` over no children is **false** — the vacuous verdicts, and they are
correct. The hazard is the composite whose child list is empty *because the
list could not be built*: a selector filtering a collection that failed to
load, a group whose members come from a source that returned an error. That
composite is unevaluable, not vacuous, and the distinction has to be made
where the list is produced, because by the time the fold sees an empty
sequence both cases look identical
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
A tree that admits dynamic child sets carries the third value on the *set*,
not only on the elements.

## The record keeps the difference the outcome hides

The composite's verdict reaches the edge, and the edge's declared policy for
unevaluable is [conditional-edges](./conditional-edges.md)'s ground. What this
technique adds is what the branch record must carry when the verdict came from
a fold: **the operator, the per-child verdicts, and the reason for each
unevaluable child** — the source that timed out, the capability that was
absent, the grant that was missing.

The reason to insist is that *false* and *unevaluable* frequently produce an
identical observable: the branch was not taken either way, and the user sees
the same empty surface. Where the two outcomes are indistinguishable from
outside, the record is the only place the difference exists at all — and an
engine that stores a bare composite verdict has erased a classification it had
computed, at the boundary where an operator would have acted on it
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
It answers the question nothing else can: *did this rule decline, or did it
never get to look?*

## Decision rules

- Never offer authors a per-node "treat unevaluable as false" switch. It is
  the collapse with a checkbox on it, it will be set during an incident to
  make a tree stop blocking, and it will not be unset.
- The verdict type is a closed three-member vocabulary shared by the leaf
  evaluator, every combinator and the record format. A combinator that
  defines its own is a second dialect, and the two agree until the first
  timeout.
- A composite carries its own verdict; it does not carry a *count* of
  unevaluable children as a substitute. "Two of five children unknown" is
  useful in the record and is not a verdict anything may branch on.
- Where a policy genuinely wants unevaluable treated as a definite value, that
  conversion happens once, at the root, as a stated policy with a name — never
  inside an operator, where every tree that contains one inherits it silently.

## When not to use it

A condition tree whose every leaf reads local, already-materialized data has no
third value to propagate, and three-valued composition there is overhead.
Adopt the tables the moment one leaf class can fail to answer, which in
practice means the first condition that reaches outside the process. And do
not retrofit the tables while leaving the leaf evaluators two-valued: a correct
fold over children that already lied returns a confident, correctly computed
wrong answer, which is worse than the honest version of the same bug.
