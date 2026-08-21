---
layer: technique
type: technique
subject: role-intake-conversation
technique: premature-solution-quarantine
status: forged
laws: [say-only-what-the-record-holds, every-decision-names-its-actor]
shared_with: []
use_when: [the requestor opens with a title or an old description, a named person is the ask, the session drifts into tooling]
---

# Premature-solution quarantine

Requestors almost never arrive with a need. They arrive with a **solution**:
a job title, an old description, a level and a band, a named former colleague,
a list of tools, or a specific person they have already met. This is not
laziness — it is how people transmit intent, and the solution genuinely
encodes information about the need. It is also the single biggest consumer of
intake time, because a solution invites debate, and debating it produces no
statement of the work.

The requirements-engineering literature names this failure directly:
**asking about, or arguing with, the proposed solution instead of eliciting
the underlying problem** is among the most common and most damaging elicitor
mistakes. Both available reflexes are wrong. Adopting the solution ends the
elicitation before it starts. Challenging it puts the requestor in defence,
where they stop exploring and start justifying — and a defended solution
hardens into a requirement.

The third move is to **park it, visibly**.

## The procedure

1. **Receive it without evaluation.** No agreement, no pushback. "Okay —
   principal platform engineer, five to seven years, and the description from
   the last search."
2. **Say out loud that you are setting it aside and why, in one sentence.**
   "I'm writing that down and parking it for now — I want to get at what the
   work is first, then we'll come straight back to it and see how well it
   fits." The visibility is the whole technique: silently ignoring a
   requestor's opening ask is experienced as not listening, and they will
   re-raise it every few turns until it is acknowledged.
3. **Record it as stated, attributed, and unadopted.** The parked solution is
   part of the record — it was said, and it is evidence about what the
   requestor believes. It is not a requirement, and the record must be able
   to tell those apart. A parked item silently promoted to a requirement, or
   silently dropped, both violate
   [say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds):
   one invents a decision, the other erases a statement.
4. **Run the need elicitation** — reinstatement, ninety-day outcome, then
   requirements.
5. **Return to the park explicitly, before the session closes.** Hold the
   parked solution against what the conversation produced: "You opened with
   principal and the old description. What we've described is one system
   rebuild and a lot of stakeholder work — does principal still feel right,
   and which lines of that description survived?" This is where the technique
   pays: the requestor evaluates their own opening against their own
   outcomes, and the resulting decision is theirs. Per
   [every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor),
   the record names who kept or dropped it — never the interviewer by
   default and never nobody.

## Decision rules

- **Park at first mention, not the third.** A solution left running gathers
  detail: by the third turn the requestor has invested in a title debate, and
  parking then costs face. The first sentence of the session is the cheapest
  place to park.
- **Park artifacts, not just words.** An existing job description, a
  competitor's posting, a résumé of a person they liked and a spec from a
  vendor are all premature solutions with more inertia than a spoken one,
  because they look like inputs. Park them the same way, and never open the
  session by editing one.
- **Never park an outcome, a constraint, or a story.** If what they offered
  is "the close has to run without manual reconciliation by Q2", that is the
  thing you were digging for — take it. Quarantine applies to *answers about
  who to hire*, not to answers about what must be true.
- **Park at most two or three items and keep the park short and visible.** A
  park that swallows everything becomes a way of not engaging, and the
  requestor loses confidence that any of it will be revisited.
- **When the ask is a specific named person, park with extra care and
  surface the process consequence.** "We should hire Dana" is a legitimate
  input and also a fact with fairness weight: if a role is being specified
  around one individual, the specification will encode that person, and any
  competitive process run afterwards is theatre. Name that trade-off in the
  session rather than resolving it — the decision to run a real search, a
  direct approach, or a role designed for a known person belongs to the
  requestor and their governance, not to the recruiter.
- **When the requestor insists on settling the parked item immediately**,
  concede the turn rather than fighting: give a one-line provisional answer,
  mark it provisional out loud, and return to the need. The relationship
  cost of a fight over sequencing exceeds the value of the sequencing.

## Why the park must be visible rather than internal

An unspoken park is indistinguishable from being ignored, and it degrades the
two things intake depends on: the requestor's willingness to keep exploring,
and their belief that the resulting brief is theirs. A visible park also
creates the return commitment, and the return is where the solution is
re-evaluated against evidence — which is the only mechanism in intake that
reliably *lowers* a specification. An unreturned park is worse than no park:
the requestor has been told their ask would be revisited and it was not, and
the brief now contains a hole where their opening ask should have been
resolved.

## When not to use it

- **When the solution is a hard constraint from outside the requestor.** An
  approved level, a budgeted band, a headcount class, a regulated licence or
  a location requirement set by policy is not a premature solution — it is a
  boundary. Parking it wastes the session's credibility. Record it as a
  constraint with its source, and elicit inside it.
- **In a short triage session with a fluent requestor** who has already
  produced outcomes and evidence. If the title arrives *after* the work has
  been described, it is a conclusion, not a premature solution.
- **On a repeat requisition for a role the organization genuinely runs
  repeatedly** — a standard, high-volume role with a proven brief. Here the
  prior specification is a validated template, and the honest move is to ask
  what has changed since the last hire rather than to re-elicit from zero.
  The failure mode to watch is a template *claimed* to be proven that has
  never actually filled; ask when the last hire against it closed.
