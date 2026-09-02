---
layer: technique
type: technique
subject: session-continuation
technique: stuck-loop-detection
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a continuation loop is repeating the same failed fix, choosing when a keep-working loop must stop anyway, a self-improvement loop keeps accepting negligible gains, a batching policy is deferring a stop the loop already earned]
---

# Stuck-loop detection

A loop built to refuse stops needs a rule for when to stop regardless, and
the obvious rule — a maximum number of attempts — is wrong in both
directions. Ten attempts that each fail differently are a loop making
progress through a hard problem, and cutting it at ten wastes the work.
Three attempts that fail identically are a loop with no new information, and
letting it run to ten burns seven rounds producing the same error. The
instrument that separates the two is not the count but **the identity of the
failure**.

## Stop on failure identity

Each failed attempt yields a **failure signature**: the error class, the
location, the assertion or the message with volatile parts (addresses, line
numbers that shift with edits, timestamps) normalised away. The loop keeps
the signatures of its recent attempts. When the **same signature survives N
repair attempts** — the loop tried N different repairs and the failure came
back identical each time — that lane halts. N is small, on the order of three,
and it is the same at every layer the loop nests: a worker halts its own lane
at N, a coordinator halts the worker's lane at N, an outer run halts the
coordinator at N. A count of attempts without the predicate "of this
signature" is the number the naive design uses, and it supports no
conclusion ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
"attempt 7" says nothing; "attempt 3 of the same failure after 3 distinct
repairs" says the loop has run out of hypotheses.

The halt is not a bare stop. The lane hands upward a **root-cause
hypothesis** — what the loop believes the failure is, what it tried, why each
repair did not change the signature — because the layer above has context the
lane lacks and can decide whether to widen the scope, change the approach
family, or take the question to a person. A halt that reports only "stuck"
forces the layer above to re-derive what the lane already learned.

## The stop outranks batching and deferral

Loops accumulate policies that defer decisions: batch the findings and report
at the end, defer non-blocking issues to a later pass, finish the current
sweep before acting on anything. Each is reasonable and each will, applied to
a stuck lane, keep it running. **The stuck stop outranks all of them.** When
the signature rule fires, the lane halts now, in the middle of the batch, and
the batching policy reports a partial with the halt named. A design in which
a deferral policy can postpone a stuck stop has decided that finishing the
sweep is worth more than the sweep's remaining rounds producing nothing, and
it has decided that silently.

## Two counters, asymmetric resets

A single "no progress" counter conflates two situations that need different
responses, so the loop keeps two:

- **The failure counter** counts consecutive rounds with **no win** — the
  candidate did not improve the measured state at all, or made it worse.
  It resets to zero on any win.
- **The stagnation counter** counts consecutive rounds whose win was **too
  small to matter** — an improvement below a declared threshold. It resets
  only on a *meaningful* win, not on any win.

The resets are asymmetric on purpose. A tiny win resets the failure counter
(something changed) but not the stagnation counter (nothing that matters
changed), so a loop that is squeezing out negligible gains round after round
is caught by stagnation while its failure counter sits at zero. A loop that
alternates failure and tiny win never trips a single merged counter and runs
forever; with two counters, stagnation catches it. Each counter has its own
threshold and its own consequence: failure at N halts the lane with the
hypothesis above; stagnation at N ends the *current approach* and demands a
different family before the loop may continue.

## Accept only after re-measuring the merged state

A candidate improvement is measured in isolation, on the branch or in the
sandbox where it was produced. That measurement is not the acceptance. The
loop **merges the candidate into the current state and re-measures**, and
only the merged measurement decides. Two candidates that each improved the
baseline can cancel when combined; a candidate measured against a baseline
that has since moved is measured against nothing. Accepting on the isolated
number is how a loop reports twelve consecutive wins and a final state no
better than where it started.

## Forbid a family from winning N rounds running

An approach family — the kind of change being tried: tuning a threshold,
adding a special case, rewriting a prompt section — that wins N rounds in
succession is winning either because it is right or because the loop has
stopped looking anywhere else. The loop cannot tell which from inside, so it
forbids the streak: after N consecutive wins by one family, the next round
must try a different one, and the streak resets only when a different family
has been measured. The cost is one round; the benefit is that a loop
climbing a local hill is forced to look off it before the budget is spent.

## Decision rules

- Key the stop on the failure signature, normalised; halt a lane when the
  same signature survives N repair attempts, with N the same at every layer.
- Halt with a root-cause hypothesis handed upward, never a bare stop.
- The stuck stop outranks batching, deferral and sweep-completion policies.
- Keep failure and stagnation counters separately; any win resets failure,
  only a meaningful win resets stagnation.
- Accept a candidate only from the re-measured merged state.
- Forbid one approach family from winning N consecutive rounds.

## When not to use this

A dependency that is down produces the same failure signature every round,
and this technique would halt the lane with a root-cause hypothesis that is
correct and useless. That detection belongs to retry-backoff and circuit
breakers, which own "the thing we call is unavailable"; this technique owns
"the thing we are doing is not working". A loop that cannot tell the two
apart should check the dependency before counting the failure.
