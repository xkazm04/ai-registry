---
layer: technique
type: technique
subject: agent-memory
technique: gap-directed-elicitation
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a coverage instrument names a hole nothing will ever fill, memory is complete about what happened and empty about what was decided, a store that has captured for months and still cannot answer why, deciding whether to ask the principal directly instead of waiting for an event, a fresh scope that will never accumulate memory on its own]
---

# Gap-directed elicitation

Every write path in this subject begins with something the agent *witnessed*.
Working state is observed, episodes are captured at meaningful boundaries,
beliefs are distilled from episodes, procedures are promoted from repeated
runs. The pipeline is a sequence of transformations over a stream of events,
and it is complete with respect to that stream.

Which fixes exactly what it can never hold. **A fact that was never transacted
produces no event, and no amount of capture, consolidation, or decay will
manufacture one.** The principal's goals for the quarter, the constraint they
are working under, the alternative they considered and rejected, the reason a
convention exists, what they intend the system to become — these are not
missing because the pipeline is badly tuned. They are missing because they
never happened *to* the agent. The store can be perfectly healthy on every
instrument in this subject and blind to the half of the territory that lives
only in the principal's head.

[coverage-instrumentation](./coverage-instrumentation.md) is the technique that
finds these holes, and it is explicit that finding is where it stops — it
"answers exactly one question", and its closing section routes the open-ended
case to the recall path's empty rate rather than to any filler. This technique
is what a named hole is handed to: **the deliberate manufacture of the events
the pipeline needs, by asking the one party who has them.**

## The trigger is a named gap, never a schedule

Open-ended interviewing is a different and worse thing. It spends the
principal's attention on whatever the interviewer finds interesting, produces
bulk rather than coverage, and has no stopping condition — which is why the
practice degenerates into a chore nobody runs twice.

Elicitation is triggered by an instrument's output and inherits its worklist:
the never-covered scopes first, then the longest-since-confirmed, then the
questions on which recall has been returning empty. Each session carries the
gap it was opened against and closes when that gap is covered or when the
principal declines it. A session that cannot name the hole it is filling is
not this technique.

That ordering is also what keeps the instrument honest. Coverage is a metric
somebody will try to raise, and the cheapest way to raise it is to write a
worthless item for every uncovered scope — the shortcut coverage-instrumentation
warns about by name. Elicitation is the *expensive* way to raise the same
number, and the only thing separating them is where the content came from. So
the provenance is not decoration here: an elicited item records the session,
the question, and that a human answered it, because that record is the entire
difference between closing a coverage hole and gaming one.

## The output is an episode, not a belief

An interview does not write to the consolidated store. It produces a
transcript, and that transcript enters the pipeline at
[episodic-capture](./episodic-capture.md) like any other episode: distilled by
[consolidation](./consolidation.md), governed by
[memory-governance](./memory-governance.md), aged by
[decay-and-forgetting](./decay-and-forgetting.md), recalled under the budget
[recall-injection](./recall-injection.md) sets.

This is the whole of the design, and it is worth stating as a rule because the
tempting shortcut is the other way:

> **Elicitation is an acquisition path, not a privileged store.** What the
> principal says is evidence with an unusually good source, not a belief
> exempt from judgment.

Every argument for routing it around the pipeline is an argument for a second
store with its own decay policy, its own provenance rules, and its own
supersedence — which is the failure this subject's hierarchy exists to prevent.
It also gets the epistemics wrong. Principals misremember, state aspirations as
facts, and describe the process they wish they ran; a stated preference that
the record contradicts is a **conflict to consolidate**, not a correction to
apply. The one property elicited material genuinely has is a strong source
attribution, and provenance already carries that.

## An unanswered question is not an answer

Two failures sit at the same boundary, and both convert a hole into a
confident claim:

- **A question the principal never answered must not be stored as a value.**
  Skipped, deferred, and timed-out questions leave the gap exactly where it
  was; the durable artifact is the *question*, still open, still on the
  worklist ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
  A model asked to summarize an interview will happily fill an unanswered
  question from context, and the summary reads no differently than one built
  from answers.
- **"Never asked" and "asked, and there is nothing there" are different
  records.** A principal who says "we have no policy on that, decide it
  yourself" has supplied a real and durable fact. A question nobody put has
  supplied none. Collapsing them retires the gap from the worklist without
  covering it, which is
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
  in the one place the store has no other detector.

## It is the only write path that spends the principal's attention

Every other technique here trades machine resources: tokens, storage, latency,
compute at write time. This one bills a human, and it bills the specific human
whose goodwill the whole system depends on. That changes the budget rule rather
than merely tightening it.

Elicitation is scheduled against the *value of the gap*, not the size of it. A
hole nothing ever asks about is not worth a question, however red the coverage
report is; a hole the recall path hits weekly is worth several. The signal for
ranking is already available — recall's empty-result log names what the store
was asked for and could not answer, which is the closest thing to a demand
curve over knowledge that does not exist yet.

Two consequences follow, and both are easy to skip:

- **Ask what only the principal can answer.** A question whose answer is in
  the repository, the ticket tracker, or last week's transcript spends human
  attention on something the agent could have reached. This is the admission
  test the always-loaded instruction file runs on its own lines, applied to a
  scarcer budget: reachable material is not merely wasteful here, it teaches
  the principal that the interview is not worth their time.
- **A declined question is a durable answer.** "I do not want to talk about
  that" retires the gap for a while, and recording the decline is what stops
  the worklist from re-asking it every cycle — the same discipline
  [decay-and-forgetting](./decay-and-forgetting.md) applies to beliefs, applied
  to questions.

## The measurement blind spot this creates

A memory benchmark is built by generating a world, emitting its facts as
events, replaying the events through the store, and probing. Every fact the
probes ask about entered through the event stream, because a fact that entered
no other way is the only kind the harness knows how to construct — and a
generator that derives its probes from its own world states this as a virtue,
since it is what stops the fixture set from feeding on itself.

The consequence is that **this class of gap is invisible to the entire
apparatus that ranks memory designs.** Every arm scores on witnessed knowledge;
none is ever asked a question whose answer was never transacted, so no arm can
lose points for having no way to acquire one. A ladder of accuracy numbers over
such a scenario is a ranking of retrieval and distillation quality, correctly
measured, on a territory chosen so that acquisition is free.

The instrument that would see it is a **held-out fact class**: facts true of
the principal that the generator creates and deliberately never emits, with
probes over them. Every design that acquires only by capture scores zero on
that class by construction, including whichever one leads the table. Until a
scenario carries such a class, treat a memory benchmark's ceiling as a ceiling
on *witnessed* knowledge and say so when citing it — the number is sound and
its territory is narrower than the word "memory" suggests.

## When not to use it

Where the agent's principal is not a person — a pipeline stage, a service, a
scheduled job — there is nobody to ask, and a coverage hole is genuinely a
capture problem. Fix the capture.

And where the store's purpose is a faithful record of what occurred, elicited
material actively damages it: an interview is testimony about the past, not an
observation of it, and mixing the two into one episodic record destroys the
property the record was kept for. Elicitation belongs to the consolidated
layer's supply, never to the episodic layer's fidelity — file it as its own
episode kind, so a consumer that needs "what actually happened" can exclude it.
