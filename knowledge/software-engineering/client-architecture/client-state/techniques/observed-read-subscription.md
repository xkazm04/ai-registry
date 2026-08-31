---
layer: technique
type: technique
subject: client-state
technique: observed-read-subscription
status: forged
laws: [unknown-is-not-a-value, absent-guard-is-loud]
shared_with: []
use_when: [consumers re-render on fields they never read, deciding between declared and inferred subscription granularity, a rendering optimization works until someone spreads the result object, narrowing subscriptions without asking every call site to declare them]
---

# Observed-read subscription

The golden path asks each consumer to subscribe to the narrowest projection it
reads. That is the **declared** form of subscription narrowing, and its cost is
that correctness lives at every call site: the projection has to be written by
hand, kept in step with the render body, and re-narrowed whenever the render
body changes. It drifts silently and in the expensive direction — a consumer
that stops reading a field keeps subscribing to it, and nothing fails.

There is a second form, and the corpus has only ever modelled the first.
**Infer the subscription from what the consumer actually read.** Hand the
consumer a recording wrapper over the result, note which fields it touches
during the render, and on the next change notify only if a field in that
observed set changed. Nobody declares anything, the set cannot drift from the
render body because it *is* the render body's behaviour, and a consumer that
stops reading a field stops being woken by it on the next pass.

The mechanism is cheap — a proxy or getter layer whose read trap records the
key and forwards — and the cost is not the interception. It is that an
observed set is *evidence*, where a declared set is a *statement*, and
evidence has failure modes a statement does not.

## An empty observed set means unknown, never "nothing"

This is the rule that decides whether the technique is safe or catastrophic.
Before a consumer has rendered even once, its observed set is empty. So is the
observed set of a consumer that genuinely reads nothing. These two are
indistinguishable at the point of the check, and they want opposite behaviour:
the second may safely never be notified; the first must be notified about
everything, because it has not yet had the chance to reveal what it needs.

**Fail open on an empty set.** An empty observation is unknown, and rendering
it as the definite value "subscribes to nothing" is exactly the laundering
[unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value) forbids —
here at the boundary where "we have no reads recorded" meets a filter that
expects a set of keys. The failure it prevents is the worst one available: a
consumer that never renders again, because the only thing that would have
populated its subscription set was a render it will never be given.

The same reasoning covers the first change after mount, and it is worth
writing as its own guard rather than deriving it: with no previous result to
compare against, there is no meaningful "did anything change" question, so
notify unconditionally. Two guards, both fail-open, both cheap, both
protecting against a permanently silent consumer.

## Enumeration is indistinguishable from reading, and it defeats the whole thing

An interception layer sees field *accesses*. It cannot see intent, and there
is one extremely common operation that touches every field while meaning none
of them: spreading or rest-destructuring the result to pass it along. One
`{ ...result }` marks every key observed, and the consumer is now subscribed
to everything — with no error, no warning, and a rendering profile identical
to having no optimization at all.

This is the technique's defining hazard, and three properties make it worse
than an ordinary performance bug:

- **It is silent.** The code is correct, the values are right, only the wake-up
  frequency changed.
- **It is syntactically invisible.** A spread looks like a cheap forwarding
  idiom, not like a subscription decision, and nothing at the call site
  suggests it is one.
- **It travels.** A helper that forwards a result object with a spread applies
  the defect to every consumer of that helper, and the consumers look
  innocent.

The corrective is not documentation, because the defect is produced by an
idiom people reach for without deliberating. **It is a lint rule** — the
escape hatch from an invisible contract has to be made loud at the point it is
taken ([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)), and a
linter is the only instrument that reads every call site. Ship the rule with
the mechanism; a read-tracking layer without one is an optimization that
degrades to nothing at a rate nobody is measuring.

The rule needs an off switch, and the condition is precise: a consumer that
has *declared* its subscription explicitly is not relying on observation, so
spreading is harmless there. Declared and observed narrowing compose — the
declaration wins where present — and the lint rule should recognise the
declaration and stand down.

## The observed set is necessary but not sufficient

A read-set records what the render body touched. It cannot record what the
*framework* will need on the consumer's behalf, and that gap is a real one:
where an option changes control flow — a flag that turns an error state into a
thrown exception, a setting that makes a field load-bearing for the wrapper
rather than for the render — the consumer may never read the field that
triggers the behaviour it asked for. Observation will faithfully report that
the field is unused, and the behaviour will not fire.

So the resolved subscription is the observed set **plus** whatever the
consumer's own configuration implies, unioned by the layer that knows those
implications. Enumerate those injections in one place next to the resolution;
they are few, but each one is a permanently silent consumer if it is missed,
and they cannot be discovered from the read trace by construction.

## Choosing between the two forms

Both forms are legitimate and the choice is not a matter of taste:

- **Observed** suits a shared, generic result object with many consumers whose
  read patterns differ and change — the cost of correctness is paid once in
  the layer instead of at every call site, and it cannot drift.
- **Declared** suits a consumer whose reads are conditional, deferred past the
  render, or made by code the interception layer does not wrap — an effect, a
  callback, a value closed over and read later. Observation sees the render;
  anything reading outside it is invisible, and a declaration is the only
  honest answer.

The second bullet is the boundary, and it is sharp: **observation only
observes the pass it wraps.** A field read exclusively inside a deferred
callback was never read during the render, so it will never enter the set, and
the consumer will not be woken when it changes. Where reads escape the render,
declare.

## Checks

- An empty observed set notifies on everything; there is a test that a
  never-yet-rendered consumer receives its first update.
- The first update after mount is unconditional.
- A lint rule flags rest-destructuring and spreading of the tracked result,
  and stands down where an explicit declaration is present.
- Configuration-implied fields are unioned into the resolved set at one named
  place, and that place is enumerable.
- Reads that happen outside the wrapped pass are documented as requiring an
  explicit declaration.
