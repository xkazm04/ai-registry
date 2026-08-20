---
layer: technique
type: technique
subject: automated-screening-fairness-gates
technique: blocked-rejection-as-an-audited-event
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [a fairness gate refuses an automated action, designing the audit record for automated screening, preparing to demonstrate human oversight of automated hiring]
---

# Blocked rejection as an audited event

## The concern

A fairness gate that works is invisible. It refuses an automated rejection, the candidate
lands in a review queue, and nothing in the system distinguishes that from a candidate
who simply arrived there. Three separate obligations go unmet at once: nobody can show
the boundary operates, nobody can find the caller that keeps proposing what it may not
do, and the candidate's record contains a gap where a decision about them was made.

The technique is to treat the refusal as a **decision in its own right** and record it as
a first-class, retained, structured event — not a debug log line, not a metric counter,
and not a rendered sentence.

## What the event must contain

- **The proposer.** Which process, rule, or person proposed the adverse action. A null
  actor renders as *not identified*, never as a default person
  ([every consequential decision names its actor](../../_laws.md#every-decision-names-its-actor)).
- **The refusing rule**, by stable identifier: the cohort shield, the non-routable
  outcome, the unclassifiable fail-closed, the stale-decision check. This is what turns
  the log into a diagnosis.
- **The subject**, by the same candidate identity the rest of the record uses.
- **The proposed outcome and the substituted outcome** — proposed reject, applied hold —
  so the downgrade is legible rather than inferred from an absence.
- **The inputs that drove the proposal**: the score, the confidence, the model
  recommendation and the rubric or policy version in force. A verdict is bound to what it
  judged; a refusal is bound to what it refused.
- **Time**, and the policy configuration in effect at that time. Thresholds move; an event
  that cannot be read against the policy that produced it explains nothing a year later.

Persist these as **structured facts and compose the sentence at render time**.
[Meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label): prose
frozen in the producing machine's language is unreadable to the next reader and
indefensible in the next jurisdiction, and a stored sentence cannot be re-rendered when
the vocabulary changes.

## The procedure

1. **Emit at the point of refusal**, inside the same transaction that applies the
   substituted outcome. An event written afterwards, best-effort, is the event that goes
   missing exactly when the boundary was under stress.
2. **Single-source the event kind across writer and reader.** The identifier the refusal
   is written under and the identifier the attribution map, the dashboard and the export
   look it up by must come from one shared declaration. Two string literals that agree
   today produce, after one rename, an event stream that exists and a surface that
   reports zero refusals — the most reassuring possible form of a broken gate.
3. **Deduplicate on a natural key, not by dropping.** A nightly sweep re-proposing the
   same refused action every night should produce one event per candidate, per rule, per
   day — not a hundred identical rows and not a suppressed second occurrence with no
   record that it recurred. Dedupe on the key; keep the recurrence visible as a count or
   a fresh day's row.
4. **Use the workspace's existing decision-audit surface**, not a private table. A
   refusal is a hiring decision record; splitting it into a separate store guarantees it
   is absent from the export a regulator, a candidate, or a lawyer asks for.
5. **Retain it on the long horizon.** Records of automated employment decisions are now
   commonly required to be kept for several years in at least one major jurisdiction, and
   the refusal record is among the most useful of them. Design for years, not for log
   rotation.
6. **Surface the count and the trend to the people who own the pipeline**, broken down by
   refusing rule and by proposing caller. This is the operational payoff.
7. **Say only what the record holds when the event is shown to anyone.** The refusal
   record must not be rendered to a candidate as a decision that was made about their
   suitability — it is a record that the machine was not allowed to decide
   ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).

## Decision rules

- **When the gate refuses, an event is written — always, including when the refusal is
  routine.** A boundary that only logs surprising refusals cannot prove it ran on the
  ordinary ones, and the ordinary ones are the population.
- **When the volume of refusals seems too high to log, log it anyway and fix the volume.**
  A high refusal rate is not noise; it is a caller proposing adverse actions it is not
  entitled to propose, at scale. Suppressing the record removes your only view of it.
- **When a refusal count rises after a deploy, treat it as a regression with a name.**
  Group by proposing caller and refusing rule; the pair usually identifies the commit.
- **When the refusal cannot name its proposer, record *not identified* and raise it.**
  Authority may be downgraded from human to automated when the record is unclear, never
  upgraded, and never defaulted to a convenient person.
- **When someone proposes deleting old refusal events to save space, check the retention
  obligation first, then keep them anyway if the decision they shadow is still live.** A
  refusal whose candidate record still exists is part of that candidate's decision
  history.
- **When the event is included in an export or a benchmark that leaves the building,
  degrade the candidate to an identifier or an aggregate.** The event binds a person's
  identity to a hiring outcome, which is exactly the sensitivity test.

## Why this is evidence, not bookkeeping

A deployer of automated screening is increasingly asked not to *assert* that a human
stands between the tool and the outcome but to **demonstrate** it, with records, on
demand. Policy documents demonstrate intent. A dated, structured stream showing that the
system proposed an adverse action, refused to execute it, named the rule, and routed the
candidate to a person — that demonstrates operation. It is the difference between "our
policy is that we do not auto-reject" and "here are the times we did not auto-reject, and
what happened to those candidates instead".

The same stream answers the question a candidate is entitled to ask about how a decision
concerning them was reached, and it does so without inventing anything, because every
field in it was recorded at the moment it was true.

## When NOT to use it

- **Not for every gate evaluation.** Log the *refusals*, not the passes. An event per
  permitted action drowns the signal and turns retention into a cost argument you will
  lose.
- **Not as a substitute for the human queue's own record.** The refusal says the machine
  stopped; what the person then decided is a separate decision with its own actor, and a
  human reversing a machine's outcome seals to the reverser and never inherits the
  machine's attribution.
- **Not as a candidate-facing artifact by default.** It is an internal accountability
  record. What the candidate is told about automated involvement in their process is a
  disclosure question with its own standard, and it is answered in the candidate's
  language, not in the event's field names.
- **Not as a metric only.** A counter tells you refusals happened; it cannot tell you to
  whom, by which rule, or on what basis, which is every question that matters after the
  fact.
