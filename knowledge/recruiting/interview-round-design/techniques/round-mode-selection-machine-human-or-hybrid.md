---
layer: technique
type: technique
subject: interview-round-design
technique: round-mode-selection-machine-human-or-hybrid
status: forged
laws: [no-adverse-outcome-is-solely-automated, every-decision-names-its-actor, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [deciding which rounds a machine may conduct, placing a machine round in a loop, defining what a machine round is allowed to conclude]
---

# Round mode selection: machine, human, or hybrid

Each round in a loop is conducted in one of three modes, and the mode is chosen per
round from the judgment that round owns — never as a blanket policy about the process.
The question is not "do we use automated interviewing"; it is "for this specific
judgment, which counterparty can produce it, and what may that counterparty conclude".

## The three modes

**Machine-conducted.** A machine runs the conversation against a brief and produces a
transcript plus structured observations. Its comparative advantages are breadth (a
cohort no team could interview individually), consistency (the hundredth candidate gets
the same question as the first, phrased the same way), and availability (a candidate
takes it when they can rather than when a calendar allows). Its comparative
disadvantages are that it cannot be a counterparty — nobody learns what it is like to
work with the team from it — and that it cannot be given authority over an adverse
outcome.

**Human-conducted.** A named person runs the conversation. Reserved for judgments that
require a human on the other side of the table: mutual fit, the team's real problems,
anything the candidate is entitled to negotiate or push back on, and every judgment
whose adverse version ends the candidacy.

**Hybrid.** Either a human conversation prepared or supported by machine-generated
probes, or a machine conversation whose output a human reviews before it carries weight.
Hybrid is the correct default for the middle of a loop and the honest answer whenever a
machine can *gather* something it may not *conclude*.

## The placement rule

Machine rounds go where the cohort is widest and the judgment is most standardisable —
that is, early. Human rounds go where the cohort is narrow and the judgment is
consequential — that is, late. The narrowing between them is the reducer, and the
loop's economics come entirely from that ordering: a machine round that is followed by
no reduction has spent breadth to buy nothing.

Two placements are almost always wrong:

- **A machine round as the last word.** If nothing human follows it, some adverse
  outcome is being decided by a machine, whatever the interface calls it. Even a
  "confirmation" step is insufficient if the confirming human sees only a verdict; see
  the gating rule below.
- **A human round before any reducer.** Spending the scarcest resource in the process
  on the unfiltered cohort is how loops become unschedulable, and unschedulable loops
  are how candidates leave. The exception is a short human screening gate whose purpose
  is precisely to reduce — that is a reducer wearing a conversation, and it is a
  legitimate first round when volume is moderate.

## What a machine round may conclude

A machine round produces observations and a recommendation. It does not produce a
rejection. Concretely:

- The machine-actionable outcomes are **advance** and **hold**. A recommendation of
  reject is a recommendation; it parks at a human gate, per
  [no-adverse-outcome-is-solely-automated](../../_laws.md#no-adverse-outcome-is-solely-automated).
- The gate must be *reviewable*, not merely *clickable*. A human who can see only the
  verdict is ratifying a label; a human who can see the transcript, the observations
  and the rubric is making a decision. The difference decides whether the process has a
  human in the loop or a human in the audit log.
- The round's record names its actor — the automated process, explicitly, not a blank
  and not the recruiter who happened to configure it, per
  [every-decision-names-its-actor](../../_laws.md#every-decision-names-its-actor).

## Interviewer identity is part of the mode

A human round's record must name *the human*. This sounds obvious and is one of the
most commonly missed structural requirements in interview tooling, because it is easy
to build a system where invitations, sessions and calendar access are all scoped to a
team rather than a person. The result is person-blind: the record can say a team
interviewed the candidate, which is not a fact anyone can act on. It cannot answer who
assessed this person, cannot route a replication to a *different* assessor, cannot
detect that one interviewer's ratings run a full band above everyone else's, and cannot
support a debrief in which disagreement is attributed.

The standard: interviewer identity is captured at invitation and again at the session,
they are compared, and a session conducted by someone other than the invited assessor
is recorded as such rather than silently attributed. Where a round is hybrid, both
actors appear — the machine that conducted and the human who ratified — because they
made different decisions.

## Degradation is a mode question

Machine rounds depend on infrastructure that will occasionally be unavailable. The
candidate's side of the process must not stall on it, per
[a-candidates-process-never-stalls-on-your-constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
Design the fallback with the round, not after the first outage:

- A candidate's own action — starting the session, booking the slot, submitting the
  work — is never blocked by your quota or outage.
- When the conducting capability degrades, the round either continues on a deterministic
  path with its provenance truthfully downgraded, or it is deferred with the candidate
  told; it never freezes a degraded reading as though it were the full one.
- A degraded machine round must not silently become the basis of a reducer. If the
  reading is weaker, the reducer either waits or resolves toward the candidate.

## When not to use a machine round at all

- **When the population is small.** Below a few dozen candidates the consistency
  argument is weak and the human cost of the alternative is affordable. Machine rounds
  earn their place on breadth.
- **When the competency is unobservable in conversation.** A machine conversation is
  still a conversation; it yields evidence, not proof. Judgments that need a
  demonstration need a work sample, and the work-sample subject owns that.
- **When the round must be negotiable.** Anything the candidate may argue with,
  counter, or ask for an exception to needs a counterparty with the authority to say
  yes.
- **Before the instrument has been validated.** Whether a given machine interviewer is
  safe and fair enough to occupy a seat is a separate discipline entirely — the
  conversational-assessment-validation subject owns proving it, and the brief-authoring
  subject owns instructing it. Round design assigns the seat; it does not certify the
  occupant.
