---
layer: technique
type: technique
subject: live-defect-debugging
technique: hypothesis-mapped-probes
status: forged
laws: [silent-state-is-ungoverned, unknown-is-not-a-value, identity-survives-reuse]
shared_with: []
use_when: [about to add instrumentation to a defect nobody can see, deciding how many probes are enough, a round of evidence rejected every explanation, a probe produced no output]
---

# Hypothesis-mapped probes

Instrumentation without a question is logging. It produces volume, the volume gets
read for support, and whichever explanation the reader already preferred finds some.
This technique ties the three things together that otherwise drift apart: the
explanations, the places measured, and the verdicts.

## One technique, two halves

Generating hypotheses and rendering verdicts could be separate techniques. They are
kept as one because each half
is defined by the other. A hypothesis is only worth stating if some probe can
discriminate it, and a probe is only worth placing if some hypothesis names it. Split
them and each half decays: hypotheses become a brainstorm nobody can test, and
verdicts become a prose summary nobody can check. The shared object is the identifier
that appears in the hypothesis list, on the probe, and in the verdict.

## Before touching code: three to five hypotheses

Write down distinct explanations of why the defect occurs, give each a short
identifier, and make them detailed enough that a measurement can disagree with them.
"Something is wrong with caching" cannot be refuted; "the cached value is read after
the invalidation on the second request" can.

Why three to five and not one or two. A single hypothesis turns the probe into a
confirmation hunt, and the first thing seen that fits is taken as the answer. Two
hypotheses make the question binary and invite a false dichotomy, with the real cause
being a third nobody wrote down. Beyond five or six, probes multiply faster than the
discriminating power they add, and the reader cannot hold the set in mind. The
balance is probe cost against rounds: a probe is nearly free, while a round costs a
reproduction, a read and a revision, and often a person. So the set errs wide, because
a wide first round that contains the cause saves whole rounds, and a narrow one that
misses it costs the round and then the widening. This is a defensible default from the
cost shape and from one practitioner tool's choice, not a measured optimum; tune it to
how expensive your reproductions are.

Make the set distinct on purpose. Five variants of one idea are one hypothesis
five times and give one hypothesis's coverage. Draw them from different layers or
stages: input, state, ordering, environment, dependency.

## Probes: the minimum that settles all of them

Every probe carries the identifiers of the hypotheses it can discriminate, and it
records the values that would differ between them. Place the fewest probes that
confirm or reject every hypothesis; one well-placed probe is enough when the question
is local, and a multi-stage flow needs more. At least one probe is required, because
reading code is not instrumenting it. Treat roughly ten as a ceiling: past it, the
hypotheses are too broad, and the move is to narrow them, not to add probes.
A probe that maps to no hypothesis is cut. A hypothesis that no probe maps to is
either dropped or given one.

Useful placements, in the order they usually pay: values before and after the
operation under suspicion, which branch executed, the argument and return values at a
boundary between two stages, and the state at the moment the symptom appears. The
identifiers are part of the payload, so the sink can be filtered by hypothesis, and so
the identity of a probe survives the editing that follows
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## Verdicts: closed, three states, evidence cited

Each hypothesis ends in exactly one of **confirmed**, **rejected** or **inconclusive**,
with the sink lines that decide it cited by position. Writing the verdict down is the
point: an explanation the agent holds but has not committed to is state no one can
audit ([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)),
and "probably" is how an unproven fix gets through. Inconclusive is a real verdict and
not a failure; it names the missing probe and sends the next round there
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). It must never
be rounded up to confirmed or down to rejected.

## The silent probe is a precondition, not a fourth verdict

Evidence that is absent because the probe never fired looks like a fourth verdict.
It is not, because it is a fact about the run and not about the
hypothesis. An empty sink says either that the reproduction did not run, or that the
code path never executed, or that the instrument could not record. Only the last two
are about the system, and they cannot be told apart from silence alone.

So settle the run before reading it. Put one probe at the entry of the reproduced
action, tagged to no hypothesis, that must fire every valid run. If it did not fire,
the run is invalid: say so, repeat the reproduction, and draw no verdict from it. If it
fired and a specific probe did not, that silence is now evidence, and it is honest to
use it: the path the probe sits on was not taken, which rejects any hypothesis that
requires that path and nothing else. An empty sink with no entry probe is an
unverified run, and the loop must report it as that rather than as rejected
hypotheses.

## When everything is rejected

If every hypothesis is rejected, generate a new set from a different part of the system,
not a variation on the old set. The rejection shows where the cause is not; a variant
of a rejected idea reuses the same assumption that was just refuted, which is the
assumption most likely to be shared by the whole set. Add the instrumentation the new
set needs, keep the surviving probes, and revert any edit the old set justified
([revert-rejected-fixes](./revert-rejected-fixes.md)).

## When not to use it

Do not run this for a defect with an obvious single site and a captured trace; the
trace is already a probe and the loop is overhead. Do not extend it past the ceiling
to rescue an unfocused set; narrow first.
