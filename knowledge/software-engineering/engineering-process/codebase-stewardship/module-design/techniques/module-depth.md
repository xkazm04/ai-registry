---
layer: technique
type: technique
subject: module-design
technique: module-depth
status: forged
laws: [one-authority-per-vocabulary, count-carries-predicate]
shared_with: []
use_when: [judging whether a proposed abstraction is worth its interface, reviewing a module whose parameter list keeps growing, deciding whether to split a long unit of code]
---

# Module depth

Depth is **behaviour delivered per unit of interface a caller must learn**. It
is the primary quality axis for a boundary, and unlike most things said about
code structure it is a ratio with two real terms: what the caller gets, and what
the caller has to know to get it. Every judgment in this technique reduces to
reading that ratio honestly.

The vocabulary is Ousterhout's, and the reason it displaced the older
"cohesion/coupling" pairing in practice is that it points at a decision. Cohesion
describes a module you already have; depth tells you whether creating one was
worth it.

## The denominator is not the signature

**The interface is everything a caller must know to use the module correctly.**
Concretely, and in roughly ascending order of what it costs to learn:

- names, parameters and types — checked mechanically, learned in minutes;
- the **invariants** the caller must establish before calling and maintain
  after;
- **ordering and lifecycle** requirements: what must be called first, what may
  not be called twice, what must be released;
- **error behaviour**: which failures are recoverable, which leave state
  partially mutated, which are silent;
- **concurrency and reentrancy** expectations;
- performance and capacity characteristics a caller must design around — a
  limit that is not in the signature is still in the interface, and it is
  discovered in production;
- the documentation that conveys all of the above, because a fact a caller must
  know is part of the interface whether or not anyone wrote it down.

A routine taking three parameters, accompanied by "call this only after the
session is open, never while a write is in flight, and note that it truncates
above a certain size," has a *large* interface. A routine taking eight
parameters with none of that may have a small one. The formal half is the half
that is cheap; the informal half is the half that produces incidents.

This is why signature-shaped metrics mislead here. Public method count, exported
symbol count and lines-of-implementation ratios all count the mechanical half
and omit the expensive one, and a number that travels without saying what it
counted will be reused for a claim it does not support
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). If
depth is asserted, the assertion carries its predicate: *what a caller must
learn, measured how, against which use.* "This module is deep" with no such
statement is a preference.

## Shallow modules and the pass-through

A module is shallow when its interface is about as complicated as its
implementation — the abstraction charges rent and returns nothing. The purest
form is the **pass-through**: a layer whose methods forward to methods of the
same shape one level down, adding a name and no behaviour.

Pass-throughs are worth naming precisely because each one is individually
defensible ("it decouples us", "it is where we will add validation later"). The
cost is paid later and elsewhere: every future change to the underlying
capability becomes two edits in two files, and the second one is what somebody
forgets. The tell is mechanical — read the module and ask what a caller would
have to learn *in addition* if the layer were removed. If the answer is "nothing,
and they would have one fewer name to know," the layer is not a module. Either
give it a real job or inline it.

The near neighbour is the **dispatcher with no decision**: a module that exists
to choose between implementations but only ever has one, whose selection logic
is a constant. That is a seam question rather than a depth question — see
[seams-and-adapters](./seams-and-adapters.md) — but it presents identically in a
review, and the same first question resolves both.

## Why more modules is not better design

Decomposition has a price and the price is interface. Every boundary introduced
is another vocabulary entry, another set of invariants, another place where a
reader must stop and establish what is guaranteed. Splitting a long procedure
into ten units that are each called exactly once and must be read in sequence
has not reduced what a maintainer holds in their head — it has replaced a linear
read with a graph traversal and added ten names.

The decision rules that follow:

- **When a proposed split produces units with exactly one caller each that must
  be read in order to be understood, the split has added interface and hidden
  nothing.** Extract for reuse, or to hide a decision, or to name something a
  reader would otherwise have to infer. Extracting for length is a metric, not
  a reason.
- **When a module's interface is as complicated as its implementation, it is a
  rename.** Delete it or deepen it.
- **When the same argument is passed through three levels untouched, the middle
  levels are not hiding it — they are transporting it,** which is the shape a
  misplaced boundary makes on the way through.

## Information leakage and temporal decomposition

Two named failures, and the second is how the first gets built deliberately.

**Information leakage** is one design decision reflected in two or more modules:
a record layout, a status vocabulary, an ordering convention, a units
assumption. The modules are then coupled invisibly — nothing in either one
mentions the other — and they must change together forever. This is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
at the structural scale: two hand-maintained encodings of one decision are not
redundancy, they are a race with a delay fuse, and the fuse burns down on the
day somebody extends the vocabulary and finds only one of the encodings. The
detection question is not "do these modules call each other" but **"if I changed
this decision, how many places would I have to visit?"**

**Temporal decomposition** is dividing a system by the order in which things
happen — read stage, transform stage, write stage — rather than by what
knowledge each part requires. It feels natural because execution order is the
first thing a designer knows, and it leaks by construction: the read stage and
the write stage both have to know the format, so the format is now in two
places. The rule: **divide by what a part must know, not by when it runs.** When
a sequence must be preserved, that is a coordination concern, and it belongs
inside one module rather than being promoted into the shape of the system.

## Depth is placed, not maximised

A deep module that hides the wrong decision is worse than a shallow one, because
callers cannot simply pay for it — they must defeat it. The symptoms are
recognisable and they arrive in this order:

1. A caller needs the hidden decision made differently, so a parameter is added
   to override it. The module now hides a decision and also exposes it.
2. The options surface grows roughly one entry per caller, which is the ratio
   that gives the failure away: the module is not making a decision, it is
   collecting everyone else's.
3. Somebody adds an escape hatch returning the underlying thing, and the
   abstraction becomes optional. Every path that takes the hatch is a path where
   the module's invariants no longer apply, and nothing marks those paths.

**The rule: when adding a parameter would let a caller override a decision the
module exists to make, do not add the parameter.** The boundary is in the wrong
place and the parameter is what will keep it there. Either the decision belongs
to callers — in which case lift it out and let the module hide the parts that do
not vary — or the caller's need is a different job, in which case it needs a
different module rather than a mode flag in this one.

The general form: hide what callers should not have to reason about; expose what
they legitimately need to vary. Both halves are load-bearing, and depth pursued
as a maximum only ever gets the first one right.
## A variation is data until it changes a guarantee

The rule above sends a caller's different need to "a different module rather
than a mode flag." The inverse mistake is as common, and the rule invites it:
promoting *every* variation into a unit. A regional rate, a retry count, a
step that can be switched on or off — each gets a named subtype or a sibling
module, because the name is meaningful and the mechanism is available, and the
result is a lattice: one unit per combination of settings, growing as the
product of the dimensions, none of them carrying behaviour. They differ by
constants and are read as if they differed by design.

The discriminator is what the variation changes, not how many callers want
it. **When two variants differ only in values, the variation is data — one
unit, parameterised by a record the caller constructs, with a named
constructor per combination worth naming. When they differ in what is
guaranteed — an invariant, an ordering, a failure behaviour, a meaning callers
reason about — the variation is a unit.** Features that can be switched or
combined independently are always the first kind: a unit per combination is a
unit per subset, and that count does not survive a third dimension.

This does not contradict the options-bag failure above; it is its counterpart,
and one question separates them. An options bag fails when its entries are
*decisions the module exists to make*, handed back to callers one at a time. A
configuration record succeeds when its entries are values the module never had
an opinion about. Ask whether the module would be wrong to choose a default.
If it would — the rate is the caller's fact — it is a parameter. If it would
not — the retry policy is the module's job — it is a decision, and a parameter
for it is symptom one of the sequence above. A flag that switches a whole step
on or off sits on the line: data in shape, a decision in effect, and it couples
the step to the module that hosts it. The honest move there is usually to lift
the step out entirely, so the module receives input the step has already
processed and the flag has nothing left to switch.


## When not to use it

Depth is not a licence to accumulate. A module hiding many unrelated decisions
behind one interface is not deep; it is a package with a door, and it fails two
tests a genuinely deep module passes: it has no coherent job that can be stated
in a sentence, and its callers do not use it — they use disjoint parts of it,
with no two callers touching the same subset. When those two signals appear
together, the answer is not "make the interface smaller"; it is that several
modules were merged and the ratio was measured against the wrong denominator.

Depth is also the wrong axis for boundaries whose job is substitution rather
than abstraction. A boundary drawn so that something can be replaced is
justified by replaceability even when the ratio is poor, and evaluating it as a
shallow module will get it deleted right before the replacement arrives.
