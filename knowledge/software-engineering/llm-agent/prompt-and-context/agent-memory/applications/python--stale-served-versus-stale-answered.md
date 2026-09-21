---
layer: application
type: application
subject: agent-memory
technique: stale-served-versus-stale-answered
stack: python
status: forged
verified_on: 2026-09-18
verified_against: python@3
applied: code
ab_verdict: better
proof: ab-paired
---

# The rate that had no instrument, on the harness that produced it

This tree replays a fabricated year against pluggable memory designs and reports a
wrong-old rate per probe class. That rate is the *answered* half of staleness. The
*served* half - did the store put the superseded value in front of the reader at all -
had no instrument here, which is why the finding it produced had to be measured by hand
before it could be believed.

The Python version is witnessed by the harness being invoked as `py -m memory_year`;
nothing pins a minor version, so `python@3` is what the tree supports.

## Where it was missing

The report's denominator work is all on verdicts, so a stale answer and a clean answer
over a context that carried the stale value are indistinguishable in the output. The
gap matters most for exactly the design that motivated it: a store whose supersedence is
a version link rather than a read filter serves the old belief every time and depends on
labels to survive it.

## The change

evals/memory-year/memory_year/run.py:31 "def served_stale(probe, context: str) -> bool:"
evals/memory-year/memory_year/run.py:37 "A store whose supersedence is a link rather"
evals/memory-year/memory_year/model.py:65 "the recalled context carried a value the probe's gold has superseded"

and the pair is printed together, so neither number travels alone:

evals/memory-year/memory_year/run.py:248 "served: a superseded value reached the context in"

The served rate is computed from the assembled context against the fixture's own record
of what each value superseded - no consumer, no judge, no model call.

## Arm A and arm B

**Target:** the split is reported. **Floor:** no verdict moves.

A is the harness at the prior commit, B with the instrument. Re-ran one arm over
**identical replayed contexts**, so the comparison isolates the reporting change:
**194 of 194 consumer calls served from cache, 0 of 194 verdicts changed**, and the new
section reports **92 served / 6 answered** over the 92 reversal and expired probes.

That zero-cost re-run is a property of the arm's design, not luck: it records each
probe's context at the instant it was captured, so replaying it produces byte-identical
prompts and the model cache answers them.

## The structural fact

The first store measured through the instrument returned **92 of 92** - every reversal
and expired probe's context carried the value that had been superseded, through a
*retrieved memory* rather than through raw history, under both of its read modes. The
store filters deleted and expired items; a non-latest version is neither, so the chain
records which item won without keeping the loser out of the result set. Nobody designed
that, and no wrong-answer rate could show it: the same store answers 0.90 to 0.92 correct
because each item carries its date and version, and the reader adjudicates.

## What this application cannot tell you

The served rate depends on the fixture knowing what superseded what, so it works here and
does not transfer to a suite of questions with no recorded supersession. It is a substring
test against the ground truth's own value strings, so a paraphrase of the old value that
shares no substring reads as not-served; that direction under-counts, which is the safe
one for a rate whose purpose is to catch a store that serves too much. And it says nothing
about *why* a reader adjudicated well - the label, the short context and a capable consumer
are not separated by this number.
