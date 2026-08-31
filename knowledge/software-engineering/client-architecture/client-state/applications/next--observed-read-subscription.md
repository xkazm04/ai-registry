---
layer: application
type: application
subject: client-state
technique: observed-read-subscription
stack: next
status: forged
applied: code
ab_verdict: better
proof: structural-only
shipped: d4995c3
verified_on: 2026-08-31
verified_against: next@16
---

# Observation with nothing guarding it

This stack takes the inferred form of subscription narrowing by default: its
fetch layer hands each consumer a recording wrapper and wakes it only for
fields it read. The technique's question is not whether that is a good
default — it is — but whether the two things the inferred form needs are
present. Neither is.

## The A/B

**Arm A** — the tree as it stands: rely entirely on observation.
**Arm B** — observation plus the two guards the technique names: an explicit
declaration where reads escape the render, and a lint rule catching the
enumeration that defeats the tracker.

The measurable is the number of sites where observation is silently defeated,
and the number of instruments that would catch one.

**Result: `notifyOnChangeProps` — the explicit declaration — appears nowhere
in the tree. The lint plugin that ships with the fetch layer is not installed:
zero references in the package manifest and zero in the lint configuration.
So the project relies on observation at 100% of its call sites and has no
instrument that can see the defeat.**

One site trips the linter. A shared wrapper hook returns `{ ...query, page, pageSize,
… }` — spreading its inner result to merge pagination helpers into it. **See the
correction below: that object has already been mapped to a plain literal by the
time it is spread, so the real subscription cost sits one level up, and the
linter is flagging the idiom rather than this instance of the loss.**

## The structural fact

The cost is in a **wrapper**, not in a leaf component, and that is the part
worth recording. The technique predicts that this defect travels: a helper
that forwards a tracked object applies the loss to everyone downstream, and
the downstream call sites look innocent because they are innocent. This tree
instantiates that exactly — the consumers cannot be audited for the problem,
because the problem is not in them.

The measured blast radius is honest and small: **two consumers** of that
wrapper. So the finding is not that this project is paying a large rendering
cost today. It is that the project has adopted an optimization whose failure
mode is silent, placed the one known defeat in the position that propagates
it, and installed none of the three things that would report it — no
declaration anywhere, no lint rule, and no render-count instrumentation.
The cost is currently two components and is bounded only by how many call
sites the wrapper acquires.

That is also why the verdict is `structural-only` rather than `ab-paired` on a
behavioural number: both arms were read, not run. Arm B is known to be better
by construction — it adds an instrument where there is none — and no render
counts were measured.

## What this realization cannot do

It cannot say what the spread costs in renders. Establishing that needs a
render counter under both arms on the same interaction, which this run did not
build and the tree does not emit. A wrapper whose consumers re-render on
`isFetching` transitions may cost nothing visible if those consumers are cheap.

It also cannot rule out further defeats: the enumeration here was a search for
spread and rest syntax applied to query results, which finds the idiomatic
form. A field-by-field copy would be invisible to that search and equally
defeating.

## Return condition

Install the lint rule. It is one dependency and one configuration line, it
would have flagged the wrapper at the moment it was written, and it converts
this application from a census into a standing gate — which is the difference
between knowing about one site today and knowing about every future one.

The second return, only if the first finds more sites than expected: a render
counter on the wrapper's consumers under both arms, which turns
`structural-only` into a paired behavioural number.

## Correction, and the better finding underneath it

The census above located the right file and drew the wrong conclusion from it,
and the correction is the most useful thing this application produced.

**What was claimed:** the shared wrapper spreads *the tracked result*, so the
spread defeats tracking for every consumer downstream.

**What is actually true:** the spread is on an object that is no longer
tracked. The paginated hook spreads the return value of its sibling hook, and
that sibling has *already* mapped the tracked result onto a plain object
literal. By the time the spread runs there is no proxy left to trip. The lint
rule flags the idiom, correctly and usefully, but the tracking was not lost
there.

**Where it is actually lost:** one level up, in the sibling's own mapping. That
function reads thirteen fields off the tracked result — data, error, the five
status booleans, refetch, staleness, both update timestamps, the failure count
and the status string — to build the declared interface every consumer depends
on. Reading a field is what marks it observed, so **the wrapper subscribes on
behalf of its consumers to the entire declared surface**, including the fields
that change on every fetch regardless of whether the data did.

That is a materially different finding, and a better one, because **nothing was
done wrong.** Wrapping a data layer behind a stable enumerated interface is
good practice; the interface is explicit, typed and honest. The optimization is
lost as an unavoidable side effect of describing a surface, the loss is
invisible, and — unlike the spread — **no linter will ever flag it**, because
reading a field you named is exactly what that code exists to do. The technique
gained a section from this
([observed-read-subscription](../techniques/observed-read-subscription.md),
"A wrapper that normalizes the result destroys the observation") which it did
not have when it was written at a desk.

## Shipped

`d4995c3` (not pushed). Three changes, and the honest accounting of what each
one buys:

- The lint plugin is installed and its six rules are promoted to **error at 0
  findings**, following the severity policy this project already documents —
  which requires a rule be measured at zero before promotion.
- It found **three real violations**, not one. The predicted spread, plus two
  instances of `no-unstable-deps` this run did not predict: a memoized callback
  depending on two mutation objects, which are not referentially stable, so the
  callback was rebuilt on every mutation state change along with anything
  memoized on it. **The census found one site by looking for one idiom; the
  linter found a whole class the census was not searching for**, which is the
  argument for the instrument over the audit.
- Both populations are fixed, so the rules sit at error/0 and refuse the next
  instance.

Project gates: typecheck 29 before and after with 0 in the changed files;
`eslint src` 0 errors; ratchet unchanged across all 27 buckets.

**What shipping did not fix:** the thirteen-field mapping above. It is still
there, it is still the real subscription cost, and it is deliberate — repairing
it means converting the wrapper's surface to lazy getters, which is a design
change to a public interface rather than a lint fix, and was outside what this
run was authorized to do. The verdict stays `better` on the instrument, not on
the subscription cost, and the row says so.

## Return condition

Convert the wrapper's declared surface to getters that read through to the
underlying result, then measure renders on the same interaction under both
arms. That is the change that would make the optimization real here, and it is
the one this application can now name precisely — which it could not before the
correction above.
