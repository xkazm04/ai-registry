---
layer: technique
type: technique
subject: live-defect-debugging
technique: run-scoped-evidence
status: forged
laws: [identity-survives-reuse, failure-not-empty-success]
shared_with: []
use_when: [reading instrumentation output after a reproduction, comparing a run before a fix with a run after it, more than one debugging session may share a machine, about to clear or delete a log]
---

# Run-scoped evidence

A fix is proven by a comparison, so the comparison has to be between two things that
can be told apart. The sink instrumentation writes to is shared by every run unless
something makes it not, and a shared sink produces the quiet failure of this loop: a
verdict drawn from lines that came from the wrong run.

## Each run starts empty

Before every run, the sink is emptied. The reproduction then writes only its own
evidence, and every line in the sink is attributable to the run just performed. Skipping
this is cheap and wrong: the second run's output is appended to the first's, a
confirming line from the old run is cited for the new one, and a fix is declared on
evidence that predates it. If the empty-before-run step can fail, it must fail loudly;
a clear that silently did nothing leaves the same mixed sink as no clear at all
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Runs are labelled

Each run carries a label in every payload: at least one for before the fix, one for
after it, and a fresh one for every later attempt. The label is minted when the run is
planned and attached by the probe, so it survives the clearing, the reordering of
lines, and the passage of time between sessions
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). The proof of a
fix is then a statement of this shape: in the before run these lines show the value
wrong at this position; in the after run the same probe shows it right, and the other
probes are unchanged. Two labelled runs cited side by side are an argument. One run
reread after a code change is an anecdote.

A change to the reproduction path between runs is itself a label boundary. If the steps
changed, the comparison no longer isolates the fix, and the run is labelled so a
reader can see that.

## A session owns its sink and only its sink

Several debugging sessions can share a machine: a second agent, a teammate, a
previous session whose probes are still live in another checkout. Their sinks
look alike and sit side by side. A session therefore clears, reads, and edits only the
sink it created, by the address it was given at creation, and never by listing a
directory and picking whatever is there. Deleting or rewriting another session's
sink destroys evidence the owner is about to read, and nothing marks the loss; the
owner sees fewer lines and draws a verdict from them.

The practical form is to treat the sink's identity as a value issued at session start,
recorded, and used for every later operation, rather than a path reconstructed from
convention. Creation is also where the ownership claim has to be checked: if starting
a session returns a pre-existing sink that another session made, the new session does
not own it, and the sharing should be a visible choice rather than a side effect.

## Clearing is not removing probes

These are different operations on different objects. Clearing empties the sink so the
next run is clean; the probes in the code stay exactly where they are. Removal deletes
the probes from the code and ends the instrumentation. Mixing them up fails in both
directions: a session that removes probes to "clear the logs" loses its instrument
mid-loop, and a session that clears the sink and believes the instrumentation is gone
leaves probes in the tree. Name the two operations separately in any notes, and never
let one stand in for the other.

## When not to use it

For a defect that appears only once per process lifetime, a fresh process is a fresh
run, and a label is all that is needed. Do not build a shared store for a single
developer on a scratch copy; the point is attribution, and attribution there is trivial.
