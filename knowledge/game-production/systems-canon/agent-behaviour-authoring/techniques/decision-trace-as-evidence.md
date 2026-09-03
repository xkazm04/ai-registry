---
layer: technique
type: technique
subject: agent-behaviour-authoring
technique: decision-trace-as-evidence
status: forged
laws: [structural-proof-is-never-sufficient, compiling-is-not-wiring, no-gate-self-certifies]
use_when: [proving an agent actually decided something rather than existing, an agent validates but does nothing, grading generated behaviour without a human watching it, answering why did the agent do that]
shared_with: []
---

# Decision trace as evidence

The named concern: emit a machine-readable record of what the agent perceived, what it
considered, what it chose and why — and treat that record, not the presence of the behaviour
artifact, as the evidence that the agent works.

The failure this exists for is specific and it is the most expensive one in the subject. Every
structural check passes: the behaviour artifact exists, it parses, its references resolve, it
is assigned to a spawned character, the character is in the level. And the character stands
still. Nothing in the structural layer can distinguish that from a working agent
([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)),
because every property it checks is genuinely set. The agent is complete and unwired
([compiling-is-not-wiring](../../../_laws.md#compiling-is-not-wiring)), and the only artifact
that tells the two apart is a record of decisions that did or did not happen.

## What a trace record carries

One entry per decision, and it is short enough to emit at play rate.

- **When** — simulation time, not wall clock, so two runs of the same seeded scenario line up.
- **Who** — the agent instance and its class, so a roster-wide report can group by class.
- **The knowledge it decided on** — the facts consulted, each with its value, its age and the
  sense that wrote it. This is the field that turns *the agent attacked* into *the agent
  attacked because it held a two-second-old sight fact at confidence 0.9*, which is the
  difference between a log line and a finding.
- **The considered set** — the options that were live at that moment, not only the winner. An
  entry that records only the choice cannot answer why an intent never fires, and *why does
  this intent never fire* is the question a generated roster raises most.
- **The choice and its margin** — what won, and by how much over the runner-up. The margin is
  what makes oscillation visible as a number rather than as a video.
- **The commitment taken** — the window the agent is now bound for, so the next entry can be
  checked against it.

Two properties make the record usable rather than merely present. It is **structured**, so a
checker reads it without parsing prose. And it is **complete over the decisions it claims to
cover**: a trace that samples decisions cannot answer a question about the one that went
wrong, and a sampled trace presented as a full one is worse than none.

## The rungs, and naming which one a claim was proven at

Evidence about an agent forms a ladder, and every claim of completion states its rung.

1. **The behaviour exists and validates.** Cheapest, always available, and — on its own —
   compatible with a motionless character.
2. **The agent is wired**: instantiated, running, ticking its decision layer at all. The trace
   proves this by containing any entry whatsoever; its absence proves the opposite, which is
   the rung most often skipped.
3. **The agent perceived**: a stimulus was present and the expected fact appeared in the
   knowledge model, within the stated latency. This is checked as a pair, and the negative
   case is checked too — a stimulus the agent should *not* have perceived must be absent from
   the model.
4. **The agent decided**: the intent the design expected won, against the considered set the
   design expected to be live.
5. **The decision produced the act**: the chosen intent is followed by the corresponding
   action in the world, within the commitment window it declared.
6. **The behaviour reads correctly to an observer**: the play looks like what the design
   described. Perceptual, and above everything mechanical here.

The rungs are not interchangeable, and the reason to enumerate them is that generated
behaviour fails at different rungs for different reasons: an empty sense set fails at three, an
unreachable intent fails at four, a missing action binding fails at five, and every one of them
passes rungs one and two identically.

## The agent may not certify itself

A behaviour that logs *I attacked* is reporting its own intent, and an intent is a claim
([no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies)). The verdict comes from an
observer reading real state: did the target's health change, did the character's position move,
did the animation state advance. Record both — the agent's claim and the observation — as two
fields, and where they disagree, the disagreement is the finding. That disagreement is exactly
the signature of a decision layer wired to nothing, and it is invisible if only one of the two
is stored.

## Decision rules

- **Emit the considered set, not just the winner.** The cost is a few entries per decision; the
  return is the only mechanical answer to *why did this intent never fire*, which is otherwise
  answered by a human watching for ten minutes.
- **When an agent produces no trace entries, report it as untraced, never as passing.** An
  empty trace and a healthy trace are different states, and a report that renders both as an
  absence of findings is the collapse that lets an unwired roster ship green.
- **Bind a behavioural verdict to the exact behaviour revision it observed.** A trace taken
  before a re-generation is evidence about the past; carry it forward as such rather than
  letting it read as a current pass.
- **Trace at the decision, not at the action.** Actions are already visible in the world; the
  decision is the thing with no other witness. A trace of actions tells you what happened and
  nothing about why, which is the half you could already see.
- **Keep the trace deterministic under a seeded scenario**, so two runs a month apart produce
  comparable records and a diff between them is a real change rather than noise.
- **Grade a roster on trace coverage.** An agent class whose intents are never all observed
  across a scenario suite has untested intents, and the correct output is the count of intents
  never chosen — a number a production line can drive to zero.
- **Cap the record and say so.** Traces are large at scale. A ring buffer over recent decisions
  is the right shape, and the cap belongs in the report so a reader knows the window they are
  reasoning over rather than assuming it is the whole session.

## When not to use this

- **As a replacement for the perceptual rung.** A perfect trace of a correct decision says
  nothing about whether the agent looks intelligent. The top rung is a human or a perceptual
  judge watching the result, and a subject that stops at the trace has proven mechanism and
  claimed craft.
- **On every agent at all times in a shipping build.** The trace is a development and
  acceptance instrument. Leaving it on for a hundred ambient characters costs memory and frame
  time for records nobody reads; gate it per class and per scenario.
- **As a metric to optimize.** Counting trace entries rewards agents that decide often, which
  is the twitching failure with a scoreboard. The trace is evidence to read, not a score to
  raise.
- **In place of a reproducible scenario.** A trace from an unrepeatable play session is an
  anecdote. The instrument only becomes evidence when the scenario that produced it can be run
  again and produce the same record.
