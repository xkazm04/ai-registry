---
layer: technique
type: technique
subject: trace-rollup-and-attribution
technique: span-cap-truncation-signal
status: forged
laws: [estimation-announces-itself, never-present-absence-as-an-answer]
shared_with: []
use_when: [bounding a trace detail read, a runaway loop puts thousands of spans under one trace, any derived number covers a clipped set]
---

# Span cap with a truncation signal

The trace detail read must be bounded: a runaway agent loop can put tens of
thousands of spans under one trace id, and an unbounded fetch turns one
operator click into a store-melting query and an unrenderable payload. So cap
the fetch. But a cap silently applied is a lie factory — every derived number
(totals, duration, status, model list) then describes a subset while reading
as the whole. The technique is the *pair*: the cap, and a self-describing
truncation signal in the same payload.

## The contract

A bounded trace read carries three fields, always, not only when clipping
occurred:

- **the true span count** — how many spans the trace really has, learned
  cheaply (fetch one past the cap, or a count query) even when not all are
  returned;
- **the retained span count** — how many this payload actually covers;
- **a truncation flag** — true exactly when retained < true.

The untruncated case reports the same three fields saying "complete". This is
deliberate: a consumer that must *infer* completeness from a missing field
will infer wrong; a consumer that reads `truncated: false` cannot.

When the flag is true, **every derived number in the payload covers the
retained spans only** — and says nothing else. Do not extrapolate cost, do
not scale token counts, do not report the clipped duration as the trace's
duration with an asterisk in the docs. The reader learns what was clipped
from the payload itself; documentation is where disclosure goes to be
unread.

## Which end to keep

Keep the **oldest** spans when the cap bites, not the newest. Three reasons,
in increasing order of importance:

1. The oldest spans contain the trace's entry point — the root — which is
   what makes the clipped tree renderable at all rather than a forest of
   orphans whose parents were dropped.
2. The trace's start time survives, so the clipped duration is measured from
   the true beginning (an honest lower bound) rather than from an arbitrary
   midpoint (a meaningless number).
3. Any downstream consumer that fingerprints the trace by its root exchange —
   a quality verdict recording what it judged, a dedupe key — remains stable
   across the cap. A clipped read of a trace must be distinguishable from a
   *changed* trace; keeping the head is what makes the root's content
   invariant under clipping, so truncation is provenance, never a drift
   signal that triggers paid re-work.

Newest-first retention feels operator-friendly ("show me what just
happened") and breaks all three. If recency matters, serve it as a separate
filtered event query, not by inverting the cap.

## Sizing the cap

Set the cap well above the honest use of the system (a legitimate agentic
request is tens to low hundreds of spans; a cap in the low thousands clips
only pathology) and treat a truncated trace as an *operational finding*, not
a display inconvenience: the flag firing means some producer is looping or
some id is being reused as a bucket. A surface that shows truncated traces
prominently converts the cap from a defensive limit into a detector.

## When not to use it

The *list* view needs no cap-and-signal — it aggregates in the store and
never materializes spans, so there is nothing to clip; imposing the detail
cap there would make the list's totals wrong for large traces with no
compensating benefit. The signal belongs exactly where a bounded set of rows
is folded into numbers that claim to describe the whole.
