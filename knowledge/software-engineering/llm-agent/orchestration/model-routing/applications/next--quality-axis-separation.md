---
layer: application
type: application
subject: model-routing
technique: quality-axis-separation
stack: next
verified_on: 2026-08-31
applied: simulation
ab_verdict: better
proof: structural-only
---

# A static ladder that cannot manufacture quality (Next.js)

A Next.js creative-tooling app whose every reasoning call enters one chokepoint router,
which walks a fallback ladder across two engines — a local CLI on an operator's seat, a
metered cloud API behind it — chosen by deployment posture and turn class. Its sibling
image router does the same across three vendors. The router is exemplary on this
subject's audit half: no elimination is silent, five named drop-out reasons travel with
every answer as a typed descent trail, and the rung and transport that served reach every
surface that displays the result.

**Its bearing on this technique is negative and structural, which is the stronger
evidence.** The router has no quality term at all: candidate order comes from a static
posture×turn-class table, not from live measurement. Nothing scores an engine, so nothing
can accidentally score it on transport — the failure this technique exists to prevent is
structurally unreachable here. That is not the technique being unnecessary; it is the
technique's precondition being absent, and the distinction matters because the tree also
shows the seam where the failure would enter the moment it stops being absent.

## The sink seam already exists, built for a different reason

The technique asks for a typed outcome record per completed call, separate from the
interface's notification channel, that a quality consumer can subscribe to without
sitting on the request path. This router already emits one. Its descent record is a typed
step with a closed `why` vocabulary, and its per-call log carries the engine, the rung and
the transport. It was built for inspectability — so an operator can tell "the engine you
configured answered" from "the model was unavailable, here is the other engine" — and it
happens to be exactly the shape a quality tracker would attach to.

So the interesting fact is not that the seam is missing. It is that the seam is present,
correct, and **feeding nothing**, which is precisely the state in which the shortcut this
technique warns about is cheapest to take: the outcome stream is right there, every record
carries a success/failure disposition, and turning that into a "quality" score is a few
lines that would look like an obvious improvement.

## Three cases from this tree, walked both ways

**A** — one quality score, fed from request outcomes (the shortcut).
**B** — two axes: operational from the request path, semantic absent until judged.

**Case 1 — the local CLI's login expires.** The engine fails when called; the trail
records the failure and the cloud engine serves. *A*: the CLI's score drops. *B*: the
operational axis drops, semantic untouched. **Both correct, and this is the case that
makes A look sufficient** — the majority of real events are operational, so a
single-axis score behaves well nearly all the time. Predicted difference: none.

**Case 2 — the recorded art-direction defect.** This tree's frame-planning route carries
a header stating that its first implementation derived each plate from a lookup table
keyed on the beat's rhetorical kind — "nine roles, nine canned compositions" — and that
it "produced exactly the deck it deserved: every `movement` beat got the same cycle
diagram whatever the movement was about." That output was fast, deterministic, and
passed every structural check the app applies: well-formed, schema-valid, complete.
*A*: every one of those calls is a clean success, so the producer's quality score is
**maximal**, and the score would have argued for keeping it. *B*: operationally perfect,
semantically unjudged — the score makes no claim about art direction because nothing
judged the art direction, and the decision to replace the table stays where it belongs,
with a human who looked at the output. Predicted difference: **decisive, and in the
technique's favour.** The defect that motivated this app's most important model call is
a documented instance of output that transport-shaped scoring rates perfectly.

**Case 3 — the model returns prose where schema-valid JSON was required.** The parse
against the schema fails. *A*: recorded as a failure, correct. *B*: recorded as an
**operational** failure specifically — an unusable success detected by the request path,
needing no evaluator. Predicted difference: none in the score, but B classifies it on the
axis that can actually observe it, which is what keeps the semantic axis empty and
therefore trustworthy.

**What would falsify this:** if case 2's output had been caught by the app's structural
validation — if the canned-composition table had produced schema violations or empty
completions rather than well-formed mediocrity — then the operational axis would have
seen it, the two axes would agree on every case in this tree, and the separation would be
bookkeeping. The route's own header is what rules that out: the table's failure mode is
explicitly described as producing a coherent, complete artifact of the wrong kind.

## What this realization cannot do

This is a simulation, not a measurement: no quality score exists in this tree, so there
is no number to move and no arm to run. The verdict rests on three real cases and one
documented historical defect, and it predicts what a scoring layer would do rather than
observing one. It becomes measurable the moment the ladder gains a live-measurement
ranker — at which point the instrument is already present, because the descent trail is
the operational stream and the only thing needing to be built is a second, separately
written field for whatever judges the output.

The tree also cannot speak to the technique's evaluator-as-sink half. With a static
ladder there is no feedback loop to keep asynchronous, so the rule that nothing judges on
the request path is untested here — correct by vacancy rather than by design.
