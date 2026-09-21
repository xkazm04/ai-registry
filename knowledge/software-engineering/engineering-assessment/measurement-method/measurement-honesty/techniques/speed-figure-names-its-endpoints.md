---
layer: technique
type: technique
subject: measurement-honesty
technique: speed-figure-names-its-endpoints
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
use_when: [publishing a latency or speed figure a reader will act on, a metric is named for an event the instrument cannot observe, comparing a timing figure across configurations that do not stream the same way, a speed claim arrives footnoted to a different quantity than its headline, deciding whether a faster number means a faster wait]
shared_with: []
applied: code
ab_verdict: better
---

# A speed figure names its two endpoints and its kind

A duration is not a quantity, it is a **pair of events**, and a speed claim is
a duration plus a statement of what it is a speed *of*. Both halves are
routinely dropped, and the drop is invisible in the output: the number is
well-formed, plausible, in the right unit, and it renders identically whether
it was measured between the events its name implies or between the two events
the instrument happened to be able to reach. The reader supplies the missing
halves from the name, which is the one part of the record nobody measured.

Two dropped halves, two distinct defects.

**The end event is not the one the name implies.** An observer positioned
outside the producer can stamp the moment *it* first received something, and
what it first receives is usually not what the name promises. A relay that
forwards a stream sees a transport unit: an opening frame, an envelope with an
empty payload, a keepalive, a header. The payload's first real unit arrives
later, sometimes much later. A figure taken at the first forwarded unit and
published under a name that says *first unit of content* is not approximate —
it answers a question the observer could not see, which is the same defect as
an unknown rendered as a definite value
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

**The kind is not the one the headline implies.** *Faster* is ambiguous between
two quantities that are not convertible: the wait one request experiences, and
the work a system completes per unit of resource. Batching, queueing and
parallelism move them in opposite directions by design — a configuration can
complete substantially more work per unit of time while every individual
request waits longer. So a headline that says a cheaper tier is *sixty percent
faster* with a footnote saying the figure is system throughput has published
two different claims in two type sizes, and the one a reader acts on is the
headline.

## The rule

**A published speed figure states the event it starts at, the event it ends at,
and which of the two kinds it is. A figure whose end event is not the one its
name implies is renamed, not footnoted.**

A footnote is the honest *minimum* and it does not travel: it is dropped by the
first person who copies the number into a decision, a slide, or a capacity
model, and what survives is the name. The name is therefore the disclosure
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

Three consequences worth stating separately.

1. **Name the interval for the event you actually reach.** *Time to first
   forwarded unit* is a good metric, honestly named, and a relay that cannot
   decode the payload should publish exactly that. It is the substitute for the
   figure it cannot produce, and saying so in the document is worth more than a
   more impressive name: a reader who knows the endpoint can reason about the
   difference, and a reader who does not cannot.
2. **Publish the two kinds as two series and let neither imply the other.**
   Where a change is claimed to improve speed, say which quantity moved. A
   system-throughput improvement is a real and valuable result; it is simply not
   an answer to "will this feel faster", and the one-line conversion a reader
   performs in their head is wrong under exactly the conditions that produced
   the improvement.
3. **State the tolerance the figure is fit to carry.** A number measured to the
   nearest transport frame does not support a comparison finer than a frame,
   and a name that implies a finer resolution than the endpoint provides is the
   typographic form of the same lie as excess decimal places.

## The failure that only appears in a comparison

The expensive case is not a single mislabelled number. It is a mislabelled
number **compared across configurations**, because the end event can differ
between the things being compared while the column heading stays the same.

Measured on a live harness: a bench published one column per configuration
under a name meaning *first output unit*, taken at the first streamed fragment
of any kind. The configurations differed in how much internal work the producer
did before emitting anything — and on the runs where it did that work, the
first streamed fragment was an **empty envelope announcing the internal phase,
carrying zero characters**, arriving two and a half seconds before the first
fragment of output. On the runs where it did not, the first fragment *was* the
output. So the column contained stamps taken at two different events, the axis
that decided which one was the axis under comparison, and the arm that looked
most responsive was the one that had announced its internal work earliest.

That is a confound, and it is the one
[control-failure-is-not-a-datum-state](./control-failure-is-not-a-datum-state.md)
describes — with a cause that technique does not cover and a different repair.
There, a condition of the environment failed across the arms and the honest
move is to publish the axis and withhold the contrast. Here nothing in the
environment moved: the figure's **definition** was underspecified, so each arm
resolved it differently, and withholding the contrast is not the repair. The
repair is upstream, in the definition: bind the end event, publish one series
per event class, and record per row which class the stamp came from. A figure
that cannot say which event it ended at cannot be compared to itself.

## Decision rules

- **When the instrument cannot observe the event the name implies, rename the
  metric to the event it can observe.** Do not keep the aspirational name with
  a caveat attached.
- **When two speed quantities are available, publish both and label both.** A
  single "speed" figure forces the reader to guess which one they have, and
  they will guess the one that answers their question.
- **When a timing figure will be compared across configurations, assert that
  the end event is the same class in every arm**, and make the per-row event
  class part of the record so the assertion is checkable after the fact rather
  than assumed. A stamp with no recorded end event is not comparable evidence.
- **When a run produced no instance of the end event at all, report the figure
  as absent with the reason** — never substitute a neighbouring event's stamp
  into the same series. One series holding two end events is a series with no
  interpretation, and it will still compute a median.
- **When reading someone else's speed claim, resolve the footnote before
  acting on the headline**, and treat a headline whose footnote names a
  different quantity as a claim about the footnote's quantity only.

## When not to use this

- **A figure whose two endpoints are both inside one component and whose name
  is already the pair** — a queue wait named for the queue's own two
  transitions — needs nothing added; the discipline is already satisfied.
- **Coarse figures far above the resolution of the ambiguity.** When the
  interval is minutes and the distance between the candidate end events is
  milliseconds, the name is not carrying a lie worth repairing; say which
  endpoint was used and move on.
- **A deliberately transport-level figure consumed by transport-level
  readers** — a gateway's own timeout budget, an idle-detector's threshold —
  is correctly measured at the transport event and is not improved by reaching
  for a payload event nobody downstream is asking about.
