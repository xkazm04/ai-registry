---
layer: technique
type: technique
subject: authorization
technique: one-accessor-per-fold-direction
status: forged
laws: [unknown-is-not-a-value, one-authority-per-vocabulary, absent-guard-is-loud]
shared_with: []
use_when: [a decision function returns more outcomes than the branch consuming it, a caller writes "if not allowed" against a verdict that has an uncertain value, deciding whether a policy result may convert to a boolean, the same verdict is consumed by call sites with opposite safe directions, a check returns no-opinion and every consumer treats it differently]
---

# One accessor per fold direction

A decision kernel that has been built well returns more than two outcomes.
Allowed, denied, and at least one value meaning *the question was not
answered*: the lookup did not resolve, no rule addressed this case, the
evaluation could not run here. Keeping that third value distinct from the
first two is the producer-side discipline, and the corpus already demands it
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value); the
ownership fold in
[read-write-predicate-symmetry](./read-write-predicate-symmetry.md) is the
same law applied to the fact the check reads).

Then the verdict reaches a call site, and the call site has two branches.
Every uncertain value has to land on one of them. **That collapse is a policy
decision, it is made once per call site, and the type of the accessor decides
whether anybody notices making it.**

## The boolean is where the fold gets defaulted

Give the verdict an implicit conversion to a boolean, or a single `isAllowed`
field, and the fold has already happened — inside the conversion, chosen by
whoever wrote it, applied identically at every call site whether or not that
is right for any of them. What makes this specifically hard to see is that the
usual review heuristics do not fire. There is no unhandled case, no missing
branch, no compiler warning. The code reads:

    if (verdict.allowed) { proceed(); } else { refuse(); }

and it is exhaustive. It is also a silent decision that *every* uncertain
outcome means refuse — which may be exactly right, and which nothing in the
source records as a choice.

The sharper form of the same defect needs no boolean conversion at all, only
a single predicate and a negation:

> **In a verdict with more than two values, `!allowed()` and `denied()` are
> different functions.** The first absorbs every uncertain value into refusal;
> the second absorbs every uncertain value into permission. A two-valued
> verdict makes them identical, which is where the habit comes from, and a
> reviewer carries the habit across unchanged.

A codebase that exposes only `allowed()` has not prevented the second fold —
it has made it available by typing one character, in an expression that looks
like a tautology. `if (!verdict.allowed())` and `if (verdict.denied())` sit in
two files, read as the same test, and differ on exactly the inputs the third
value was created to represent.

## The mechanism

**Expose one named accessor per fold direction, expose no boolean conversion,
and let no accessor be the negation of another.**

- **Name what each one absorbs, at the definition.** Not "returns true when
  permitted" but *"true only when a permit rule matched; use this to treat an
  unresolved or unevaluated verdict as a refusal"*. The doc comment on the
  accessor is where the fold is recorded, because that is the only place all
  of its callers share.
- **Rank them.** One direction is almost always the common one, and saying so
  in the accessor's own documentation — *this is the usual choice* beside
  *avoid this one; reach for it only when you mean it* — converts a symmetric
  pair into a defaulted pair with the default written down. An engineer who
  picks the rare accessor has read the sentence telling them it is rare.
- **Provide a third accessor for "the verdict decided nothing"**, so a call
  site that wants to branch three ways is not forced through two tests whose
  conjunction it has to get right.
- **Refuse the conversion operator.** The value of this technique is entirely
  in what the type will not let a caller write. An implicit bool undoes all of
  it, and it is the single most likely thing a later contributor adds for
  convenience.
- **Record whether the answer was matched or derived.** Where a verdict can be
  produced by a fallback rule rather than by a rule that addressed the case, a
  flag saying so travels with it. A permit that was matched and a permit that
  was inferred from the absence of anything else are the same value and very
  different facts, and the audit trail is the consumer that needs them apart
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## Why this does not contradict failing closed

[failure-direction](./failure-direction.md) states the rule for the case that
matters most: where a wrong permit grants standing, every degraded state
resolves to refusal, and the asymmetry of the two errors is what makes that
non-negotiable. Nothing here weakens it. **This technique is about the
precondition that rule depends on and does not state: fail-closed is only
actionable where the two outcomes are ordered by risk.**

Sort the predicates a system actually evaluates:

- **Authority-bearing.** May this caller perform this operation; is this proof
  valid; does this grant cover this scope. One direction creates standing. The
  fold is fixed for every call site, it folds toward refusal, and it should be
  applied in the kernel rather than left to callers to get right.
- **Not ordered by risk.** Route through this path or that one; store this
  result or do not; consult this upstream first; apply this transformation.
  Both outcomes are authorized and the system must pick one. There is no
  closed direction to fail toward, "fail closed" degrades to a slogan, and the
  correct fold genuinely differs between call sites — which is precisely the
  case that produces a shared verdict type consumed in both directions.
- **Inverted.** A predicate whose *refusal* is the irreversible act — a
  suppression, a quarantine, a block. Here the uncertain value folds toward
  permission, and a reviewer running the fail-closed heuristic on autopilot
  will call the correct code a bug.

The mistake the mechanism prevents is not choosing the wrong direction. It is
a verdict type shared across all three classes that offers one boolean, so the
first class's fold is silently applied to the other two.

## Two empties are two facts

The same call site usually has more than one way to receive nothing, and they
do not mean the same thing:

- **No rule addressed this question.** The policy is silent. That is an
  unresolved verdict, and it belongs with the uncertain values.
- **A rule addressed it with an empty condition.** The operator wrote a rule
  whose condition matches everything. That is a decisive answer that happens
  to be short.

Collapsing these produces the failure where deleting the last line of a policy
file flips the system from "everything matches" to "nothing is known", or the
reverse, with no diff that looks like a behaviour change. Give them different
outcomes, write both defaults at the API next to each other so the asymmetry
is visible in one screen, and state which one an empty configuration file
produces.

## Decision rules

- **A verdict with more than two values exposes no boolean conversion and no
  single `isX` field.** If a caller needs a boolean it names which fold it
  wants by which accessor it calls.
- **Never let one accessor be the documented negation of another.** If
  `denied()` is defined as `!allowed()`, the third value has been deleted at
  the definition and every caller inherits the deletion.
- **Classify the predicate before choosing where the fold lives.** Authority-
  bearing predicates fold in the kernel; predicates not ordered by risk fold at
  the call site and the call site says which way.
- **When a reviewer cannot tell which fold a line chose, the accessor is
  misnamed**, not the line. Rename at the definition; a comment at the call
  site does not travel to the next call site.
- **An audit record stores the verdict, not the fold.** Storing the boolean the
  call site computed loses the distinction the type was built to keep, and the
  trail is exactly where somebody later asks which uncertain cases occurred.
- **A new call site is a new fold decision.** Adding a consumer of an existing
  verdict is not a mechanical reuse; the question "which way do the uncertain
  values go *here*" is asked again, and its answer is visible in the diff
  because the accessor name is.

## When not to use this

- **Where the verdict genuinely has two values.** A predicate that cannot be
  unresolved — a pure function over data already in hand, total by
  construction — returns a boolean and should. Manufacturing an uncertain value
  to justify the ceremony is worse than the boolean.
- **Where one fold is the only correct one at every call site, now and later.**
  Then fold in the kernel, return two values, and record the folding rule
  there. The pair of accessors is for a verdict that is legitimately consumed
  both ways; using it where it is not spreads a decision nobody needs to make.
- **As a substitute for the kernel being total.** Named folds describe what a
  caller does with an unresolved verdict. They do not reduce how often one is
  produced, and a kernel that returns unresolved for cases it could have
  decided is a separate defect these accessors will hide behind.
