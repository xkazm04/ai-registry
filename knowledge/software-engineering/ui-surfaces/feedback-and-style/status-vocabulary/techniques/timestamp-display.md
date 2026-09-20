---
layer: technique
type: technique
subject: status-vocabulary
technique: timestamp-display
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [deciding whether a moment shows as elapsed or exact, per-row timers multiplying in a long list, future timestamps rendering as just now, an elapsed label on a surface rendered once ahead of delivery and again in the browser, a hydration mismatch naming a component that shows an age]
---

# Timestamp display

A stored moment is a point on the timeline. What a person reads is a
*projection* of that point through three inputs the point does not carry —
a timezone, a locale, and a rendering style — and code that renders a
moment without supplying them has supplied them anyway, from whatever
ambient default was nearest. The technique is two primitives, one ticker,
one vocabulary source, and one clamp.

## Two questions, two primitives

*How long ago?* and *when exactly?* are different questions with
different answers, and only the first is a function of the present. The
product answers each with one primitive:

- **The elapsed primitive** renders "3m ago"-class labels and
  live-updates. An elapsed label is a value with a shelf-life — correct
  when computed, wrong a minute later, wrong *silently* — so freezing it
  (computing once into state) and churning it (a per-cell timer) are the
  two opposite defects, and the primitive avoids both by subscribing to
  the shared ticker below.
- **The fixed-moment primitive** renders absolute dates and times through
  a small closed set of named style variants (the product's four or five
  agreed shapes), so a dense table and a detail drawer agree. A raw
  options bag at a call site is how a sixth shape gets born; when the
  variants don't cover a genuinely recurring shape, add the variant
  first — gating call sites toward a destination that does not exist
  teaches people to add exemptions.

Want both? That is what the primitives' tooltips are for — **relative by
default, absolute one hover away** (and the reverse on the fixed-moment
primitive). Never two labels.

## Never let the host machine decide

The ambient defaults — the host machine's locale and the host machine's
timezone — are each one keystroke shorter than the application's own
answer, look correct on the author's machine, and are invisible in
review. Measured at the pathological extreme: one product rendered a
moment at 221 sites, of which exactly **one** knew what language the user
had chosen in the app; a convergence check found a second team that built
the same locale channel and wired it to everything except dates. Both
primitives therefore resolve the locale from the application's active
language **internally** — the same binding rule as
[number-formatting](./number-formatting.md), with a sharper twist measured
here: the number case was a *forgotten argument* (a defaulted prop), but
the time case was a *missing* one — the primitives had no locale input at
all, so no amount of call-site discipline could correct them. An API that
cannot express the correct call is a stronger indictment than one that
merely defaults wrong, and it means the fix is always at the primitive.
The timezone, by contrast, is correctly the viewer's — *provided the
instant handed in is unambiguous*; a zone-less stored string misparsed as
local time is a wrong **instant**, not a style defect, and it belongs to
the storage subject's read-boundary normalizer. Display's obligation is
to route through it.

One consequence deserves its own sentence: **a single component can hold
two locale policies between its label and its tooltip** — each internally
consistent, so no gate keyed on either can see the row disagreeing with
itself ([gate-sees-target](../../../../_laws.md#gate-sees-target)). Audit the
primitive's own seams, not just its call sites. And beware the doctrine
effect: a primitive's default becomes house style — one measured call
site cited the shared component's host-locale convention, by name, as
the *reason* to copy the defect.

## One ticker, self-scaling, shared

Live elapsed labels re-render off **one** application-wide ticker that
fires at the finest cadence any current subscriber needs — every second
while labels are fresh, slowing to minutes as they age, stopping at zero
subscribers. Per-cell intervals cannot be coalesced, cannot slow with
age, and multiply: the measured decay is a dozen independent one-second
timers plus a *second* shared ticker built from scratch, its comment
restating the rationale of the one that already existed. The ticker is
infrastructure; make it discoverable or it will be reinvented.

## Across a render seam, the present is an input

Freeze-versus-churn assumes one renderer holding one clock. A surface
rendered once ahead of delivery and rendered again in the browser to
attach behaviour has **two**, and an elapsed label that reads the ambient
clock in both passes has read two different instants. They agree almost
always; they disagree exactly when the pair straddles a rung boundary, so
the defect is rare, deterministic in the small, and arrives disguised as
a framework complaint rather than as a wrong label: the two passes
produce different text, reconciliation reports a mismatch naming the
component, and it repeats on every render of that surface until someone
reads the console. Measured instance: a row eighteen and a half days old,
rounded up by the first pass and down by the second.

The cure is not to freeze the label — that is the defect above — but to
stop treating the present as ambient. **The instant is an input, owned by
the render that begins the pass and threaded to every elapsed label
inside it**; the shared ticker takes ownership back once the surface is
live in front of a person. Pinning the present for one pass and
refreshing it on a ticker are the same policy at two scales, not
opposites — the rule is that exactly one thing decides what *now* is, and
for the length of a render pass that thing is the pass.

This is the same trap as the host-machine default above, not a second
one: an *ambient* input, read twice, by two hosts that do not agree. The
clock is the version that hides, because the two reads differ only at a
rung boundary. The **locale** version of it fires every time — the pass
that runs before delivery resolves an unspecified locale from whatever
machine performed it, the browser resolves it from the viewer, and a
label that reads one way in the delivered markup reads another way a
frame later. A product that answers this by pinning one fixed locale for
such labels has not skipped the technique; it has used the fixed-locale
override deliberately, and it owes the pin a comment saying so, because
the next reader will see an ambient default's opposite and assume
carelessness.

A note on how the input is introduced, earned by a consumer that argued
back. The [number-formatting](./number-formatting.md) rule — an optional
parameter whose default is the bug is a forgettable argument — does not
transfer to the present instant unchanged, and the objection is fair: a
defaulted clock is often just *the primitive owning now*, which is what
this technique asks for everywhere else, and some render models forbid
reading the clock in a component body at all, pushing the read inward. So
the sharper statement: a defaulted present-instant is correct where the
surface renders once, and is the forgettable-argument shape exactly where
it renders twice — and **nothing at the call site distinguishes the two**,
because whether a surface is delivered pre-rendered is a property of the
route it hangs under, not of the component. Make the parameter required
on the primitives that feed two-pass surfaces, or supply the instant from
a render-scoped context the primitive reads itself; keep the defaulted
form only where the module's own doc names the single-pass assumption it
is relying on.

## The elapsed vocabulary comes from the platform

*Just now, a minute ago, yesterday* is a closed, universal vocabulary
that every locale already has a canonical form for — plural rules, word
order, and all. It is the one piece of user-facing prose a program should
never author: hand-rolled ladders drift on every rung (measured: 28
independent ladders in one repo disagreeing on the sub-minute rung and
the fallback; 611 catalog strings across 14 key namespaces encoding one
four-rung vocabulary, already drifted per locale). The platform's
relative-time formatter produces the correct form in every locale for
zero catalog keys. Neither a twenty-ninth ladder nor a fifteenth key
namespace is a translation — both are forks.

## Clamp the future, and report real skew

Clock skew, resumed laptops, and misparsed instants all produce moments
that have not happened yet. An unclamped subtraction renders them as
negative elapsed time — a statement the reader cannot distinguish from a
real one — and the commonest silent behavior (any negative satisfies the
first rung's bound) renders them as *just now*, which is worse: it masks
the wrong-instant bug from users and developers alike
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) —
the impossible value must not render as the calmest one). The policy with
the best measured shape: clamp small skew to zero; past a stated
tolerance, **abandon relative rendering entirely**, show the absolute
moment, and emit one telemetry breadcrumb per session — a future
timestamp beyond tolerance is evidence of a data bug upstream, and this
is the only layer that ever sees it.
