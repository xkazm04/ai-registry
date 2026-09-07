---
layer: technique
type: technique
subject: agent-memory
technique: coverage-instrumentation
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [asking whether memory covers what it should, a store that looks healthy, reporting memory health]
---

# Coverage instrumentation

Every other technique in this subject improves what is *in* the store. This one
answers the question none of them can: **what is missing?** A memory store with
four hundred items looks healthy on any listing surface and can still be blind
to half the territory it is supposed to know, because items cluster on whatever
someone happened to care about.

The structural point: **a listing surface can only show what is there; it
cannot show an absence.** No amount of browsing, filtering, or searching over
existing items will ever surface the subject that has no items. Absence needs
its own instrument, and that instrument is built by inverting the question.

## The denominator is the population, not the rows

The whole technique is one design decision. Coverage is computed over **every
subject the system tracks** — every project, tenant, domain, or scope the agent
is responsible for — not over the subjects that already have memory. Dividing
covered-subjects by subjects-with-rows always yields a number near one hundred
percent, and that number is worse than no number: it is a confident report that
the blind spots do not exist.

This is [count-carries-predicate](../../../../_laws.md#count-carries-predicate) at
its sharpest. "Four hundred items" is not a health finding. "Nine of forty
tracked scopes have memory confirmed within the last month" is, because it
names its denominator, and the denominator is where the truth lives.

The join key between memory and the tracked population must be the *same*
attribute the writers set — the scope or namespace a human filing a note and an
automated writer both stamp. A coverage instrument keyed on something inferred
(a tag convention, a substring of the content) measures the inference, not the
coverage.

## Honest zeros

Four cases where the instrument must resist the flattering reading:

- **A subject with no memory at all is a stale subject, not an omission.** It
  reports with an explicit "never" for last-confirmed rather than being
  dropped from the result because it has no row to attach a date to. Silently
  omitting the uncovered is exactly the failure the instrument exists to
  prevent, reintroduced in its own implementation.
- **Coverage over an empty population is zero, never one hundred percent.**
  "All of nothing is covered" is arithmetically defensible and operationally a
  lie; a fresh or misconfigured system must read as uncovered.
- **Only live memory counts.** Archived, superseded, and expired items are not
  coverage. A subject whose every item was retired last quarter is uncovered,
  and reporting it as covered means the instrument disagrees with the recall
  path about what the agent knows — which is the same divergence the
  [memory-value-model](./memory-value-model.md) exists to prevent one layer down.
- **A zero the code cannot raise is not a measurement.** The three cases above
  are all about the *denominator* — an empty or unreadable population. The
  fourth is about the instrument's own numerator: a counter incremented only by
  a status its call site is structurally unable to produce, or a health line
  whose severity is a tautology over a count. Both report a clean number
  forever, and by reporting it they certify that the mechanism they watch is
  working. One measured store kept a supersession counter behind three
  increment branches that could never execute, because the inserts beneath them
  passed no supersede reference and the layer below returned that status only
  when one was present; the same store graded its live-fact health with a
  predicate of the form `count >= 0`, which no state can fail. Neither is
  visible from the reporting code, which reads correctly in both. The question
  that finds them is not "what does this number say" but **"what write would
  move it, and who performs that write"**.

That last question has to be asked at the *symbol*, not at the module. A
governance path dies most often by partial adoption: the caller imports the
cheap arithmetic helper out of the module that also holds the decision
procedure, and never calls the decision. Every check that asks whether the
module is wired in — a dependency graph, an unused-file sweep, a coverage run
over the file — answers yes, and the tests over the uncalled procedure keep
passing, because a test is a caller. Trace the exported symbol that produces
the verdict, and confirm a production path reaches it.

## Freshness is part of coverage

"Has memory" and "has memory that anyone would trust" are different questions,
and coverage answers the second by carrying a **window**: a subject is covered
when at least one live item for it was confirmed inside the window. The window
is chosen against the cadence at which the subject is expected to produce
memory — if the work touching a scope happens monthly, a scope that produced
nothing in a month has genuinely gone quiet, and that quiet is the signal.

Order the uncovered by severity, not alphabetically: never-covered first, then
longest-since-confirmed. The instrument's output is a worklist, and a worklist
that buries its worst cases in the middle is a report nobody acts on.

## The instrument is not part of the store's write surface

Coverage reads across the memory store and the tracked population, which makes
it tempting to grow it inside the store's own data layer. Keep it separate. The
store's data layer has one job — the item lifecycle — and an instrument that
joins it to an unrelated population is a second job that will drag that
population's schema into the memory layer's dependencies.

The same separation is what lets the instrument be honest about its own
failure, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success): "no
uncovered subjects" and "the population source was unreachable" must not
render as the same clean report. An instrument for absence that cannot report
its own absence has recreated the problem it was built to solve.

## What coverage is not

It is not a quality measure. A subject with one shallow, stale-but-in-window
item counts as covered, and coverage will never tell you the item is useless —
that judgment belongs to [consolidation](./consolidation.md) and to the value
model. Coverage answers exactly one question, and its usefulness comes from
answering it without qualification.

Nor is it a target to be optimized directly. Coverage measured is coverage that
someone will try to raise, and the cheapest way to raise it is to write a
worthless item for every uncovered subject. Report coverage next to the
freshness distribution and the item counts, so the shortcut is visible the
moment it is taken, and treat a sudden jump in coverage the way you would
treat a sudden jump in any other metric: as something to explain before
celebrating.

## Downstream quality does not detect a coverage hole either

This technique already refuses the forward inference: coverage is not a quality
measure. The reverse is equally false and is the one teams actually rely on,
because it is the metric they were already watching.

Measured: an extraction pass that silently dropped roughly a third of its
source files — indexing about two-thirds of them and reporting the skips only
in a run log — scored within one or two questions of a complete pass on a
downstream question suite, and tied a no-structure control on one corpus
entirely. The hole was a third of the input. The quality number barely moved.

The mechanism is redundancy, and it is a property of the corpus rather than of
the pipeline: where the dropped material is recoverable from surviving
neighbours, an end-to-end score cannot see its absence, and the more redundant
the store the blinder the score. That is precisely the regime a memory store
lives in after any period of capture.

So the two instruments are not substitutes in either direction, and a pipeline
reporting only one of them is reporting health through whichever hole the other
would have caught. Emit both. And where an extraction step can fail per item,
its **per-item success rate is part of coverage**, not an operational detail
that lives in a log — a pass that skipped a file and a pass that processed it
and found nothing are the same `0` in every downstream metric, which is the
absence distinction this subject exists to keep.

## A reliability rate is not an accuracy delta

The same instrument answers a second question, and reading the answer wrong is
common enough to name. When a stage of a pipeline fails *operationally* — a
pass times out, a worker dies, a batch is skipped — the temptation is to
predict its cost in end-to-end quality and then treat the quality number as the
measure of the bug.

Measured: a consolidation pass that lost **31 of 102 cycles** to a fixed
timeout cost **two points** of end-to-end accuracy. The prediction attached to
that failure had been much larger, and it was wrong in a way that would have
misdirected the next repair: a third of the passes never ran, and the store was
still able to answer most questions, because the surviving passes covered the
same ground on their next attempt and the retrieval path was doing more of the
work than the architecture diagram suggested.

> **The accuracy delta is not the size of the reliability bug.** Classifying an
> operational failure as an accuracy failure aims the next fix at the wrong
> target, and classifying it as harmless because accuracy held is the same
> error with the opposite sign.

Fixing that pass bought what a reliability fix should buy and what the accuracy
column could barely see: long-horizon recall rose sharply, and the classes that
depend on the pass having actually run improved by ten to twenty points each
while the aggregate moved by two. So report the two axes separately — a
completion rate per pass (cycles finished over cycles attempted, beside items
admitted over items eligible) and the quality score — and predict what a fix
will buy *before* measuring it, then record the miss. A prediction nobody wrote
down cannot be wrong, which is why it keeps being made.

## When not to use it

Coverage requires an enumerable population. When the territory an agent is
supposed to know is open-ended — everything the operator might ever ask about
— there is no honest denominator, and a manufactured one (topics seen in the
last quarter) measures traffic rather than coverage. In that case, instrument
the *recall* path instead: how often recall returns empty, and for what, is
the closest honest signal about the shape of what the store does not hold.
