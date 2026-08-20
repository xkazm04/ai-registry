---
layer: technique
type: technique
subject: production-trace-scoring
technique: drift-classified-rescoring
status: forged
laws: [never-present-absence-as-an-answer, quality-apparatus-stays-unbudgeted]
shared_with: []
use_when: [deciding whether a stale verdict earns a fresh judge call, handling traces that moved after judging, bounding re-scoring spend on late-arriving spans]
---

# Drift-classified rescoring

Once a coverage receipt can detect that a judged trace has moved, someone
must decide what the detection is *worth*. The two reflexive answers are
both wrong. "Stale means re-score" turns every late-arriving span into a
paid judge call: a child span appended to a finished trace re-buys a
verdict whose judged text is byte-identical, and on a busy stream that is a
standing tax on the judge budget for zero new information. "A verdict is a
verdict" leaves scores describing text that no longer exists — the streamed
output that filled in after the window is never re-examined, and the stored
verdict quietly becomes fiction. The resolution is to classify drift into
states with *different owners*: some drift is a disclosure for the reader,
and only one kind of drift is a purchase order for the judge.

## The three states

Comparing a verdict's receipt against the trace as it now reads yields
exactly one of:

- **None** — size and fingerprint both match. The verdict covers the trace.
  Nothing to disclose, nothing to spend.
- **Grown** — the judged exchange's fingerprint matches, but the span count
  differs. The trace has more (or fewer) spans than the verdict covers —
  yet the text the judge read is still exactly the text the trace holds at
  its judged exchange. The verdict is *stale to a reader* (it summarizes
  less than the trace now contains) and that staleness is surfaced on
  read — but re-judging would send byte-identical input to the judge and
  buy back the same verdict. Grown never justifies spend.
- **Changed** — the judged exchange's fingerprint itself differs. The
  verdict describes text that is no longer there: the true entry-point
  span arrived late (as batching exporters routinely deliver parents last),
  or a streamed output completed after the settle window. Re-judging is
  *guaranteed* to send different text. This is the only drift that earns a
  fresh judge call.

The asymmetry is the entire technique: **staleness is a disclosure problem;
re-scoring is a spend decision.** Grown gets the disclosure. Changed gets
the spend. Conflating them in either direction is the expensive mistake.

## Decision rules

- **Re-scoring means a corrective verdict, not a mutation.** The superseded
  verdict stays, marked stale on read; the fresh verdict is appended. The
  original was true when written — about the text it names — and history
  that can be silently rewritten is not a record. One covering verdict is
  enough: once the corrected verdict exists, the trace reads as covered,
  and the next cycle does not score it again. Without that rule, a trace
  carrying one stale verdict re-scores *every* cycle forever.
- **Unknown drift never spends.** A verdict with no receipt (predating the
  mechanism, or posted by outside tooling) reports no staleness and
  continues to count as covering. Per
  [never-present-absence-as-an-answer](../../../_laws.md#never-present-absence-as-an-answer),
  the absence of coverage data is a state to acknowledge, not a value to
  substitute — and substituting "probably changed" would retroactively
  re-buy the entire pre-receipt verdict population on the first cycle
  after deploying the feature. A receipt that can compare only size may
  report grown, never changed: no claiming a content change you cannot see.
- **The re-score enters through the same gates as a first score.** Changed
  drift reopens eligibility; it does not bypass the sampling policy or the
  settle window. A trace outside the 1-in-N sample that drifts is not
  suddenly in scope — otherwise drift becomes a side door into judging the
  whole population.
- **Watch the changed-rate as an operational signal.** Changed drift should
  be rare — it measures how often the settle window called "finished" too
  early. A rising changed-rate is not a re-scoring problem; it is the
  settle window mis-tuned for a new traffic shape
  ([settle-window-completion](./settle-window-completion.md)), and the fix
  is upstream, not more re-buying.

## Why the narrowness is a law, not thrift

The judge is deliberately unbudgeted — per
[quality-apparatus-stays-unbudgeted](../../../_laws.md#quality-apparatus-stays-unbudgeted),
no product cap throttles the scoring path — and an unthrottled purchaser
must be disciplined at the *decision*, because nothing downstream will stop
it. A policy that buys verdicts on grown drift is an unbounded spender
wired to an unmetered account, with its purchase volume controlled by how
chatty other people's instrumentation is. The classification is the
discipline: spend follows *information* (will the judge see different
text?), never *motion* (did anything about the trace change?).

## When not to use it

If verdicts are anchored to immutable single events rather than mutable
aggregates, there is no drift to classify — skip the machinery. And when a
rubric genuinely judges the *whole span tree* (an agent-trajectory rubric
scoring tool-call structure, not just the root exchange), grown drift *is*
changed input for that rubric — the fingerprint must then cover what that
judge reads, and the none/grown/changed boundaries move with it. The
classification survives; the fingerprint scope is rubric-relative.
