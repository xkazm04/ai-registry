---
name: agent-context-budget-audit
version: 0.2.0
status: seed
domain: data_ai
path: data_ai/agent-context
---

# Agent context budget audit

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Everything an agent loads on every turn is paid for on every turn, and the
stack grows by accretion because each addition is individually small and nobody owns the
total. The cost is the least of it: past a certain size the stack stops being read
carefully at all, so the twentieth instruction can weaken the other nineteen, and the
same rule restated in three places quietly drifts into three different rules.

**Input.** The files this agent actually loads on every turn, enumerated for this
harness rather than assumed, each one measured, together with whatever an earlier audit
recorded so the change since then can be read.

**Core action.** Decide what has earned permanent residence. A fact needed on every task
belongs in the always loaded stack; a fact needed on one task in twenty belongs
somewhere the agent can reach for it, and the difference is measured rather than argued.
Separate a contradiction, which costs correctness, from mere weight, which only costs.

**Output.** A ranked list of findings, each quoting the passage it is about, each naming
where the fix belongs rather than only what to delete, each carrying how much care it
needs, with contradictions first regardless of size and the stack total recorded so the
next audit reports change instead of restating the size. Nothing is edited.

## Activities

1. Establish what this agent loads on every turn and measure each piece *(observe)*
2. Read the whole stack and set the total against what the last audit recorded
*(observe)*
3. Judge each passage on how often it is actually needed *(decide)*
4. Separate contradictions from redundancy, staleness and mere weight *(decide)*
5. Trace each finding to where its content is authored rather than where it appears
*(act)*
6. Hand over the ranked findings with their evidence and the recorded total *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The size of the always loaded stack is a measured number somebody now owns.**

- Every file that loads on every turn appears in the total, and nothing loaded on demand
  is counted in it.
- Each file in the total is recorded as present, configured for discovery, or observed
  loaded, and only runtime evidence puts a file in the third class, because the auditor
  is reading the stack it is itself loading and an agent's own account of what it read
  is not evidence about what was loaded.
- The total is recorded where the next audit will read it, so the next run reports
  movement rather than restating the size.
- Every saving figure traces to a measurement, and an estimate says that it is one.

**Each finding can be acted on without redoing the audit to understand it.**

- Each finding quotes the passage it is about and names the file it came from.
- Each names where the fix belongs, and a finding about content that is generated from
  somewhere else points at what generates it rather than at the copy.
- Each says how much care it needs, and nothing was edited to produce the report.

**Rules that disagree with each other are surfaced ahead of rules that merely cost.**

- Anything stated in more than one place is reported with each version quoted beside the
  other.
- Two texts reached through a link, an install copy or a generator are one rule seen
  twice and are not reported as a duplication, and identical content at two entrypoints
  is a duplication only when both are separately maintained.
- A contradiction appears first however little it weighs, because it is not a weight
  finding.
- A recommendation to drop a duplicate names which copy is the one that stays.

## Guidance

Weight is the symptom and residence is the question. Ask of each passage how often it is
needed, not whether it is true: a rule needed on one task in twenty is not free where it
sits, and moving it costs nothing a reachable copy does not pay back. Contradictions
come first, because they cost correctness rather than tokens. A deviation is a finding
only when something actually went wrong because of it, not when it departs from the
shape you would have chosen or a file you expected.

## Where this is worth adopting

- An agent whose instruction file has been appended to by a dozen people over a year,
  where every addition was obviously worth its lines at the time and nobody has read the
  result end to end since.
- A team noticing their agent has started ignoring rules it used to follow, with nothing
  changed about the rules themselves except how many of them there now are.
- A stack assembled from more than one source, where a project file, a personal file and
  promoted memory each state the same policy and two of them have since drifted apart
  without anyone comparing them.
- Handing an agent over to somebody else, when the receiving team inherits every line of
  the always loaded stack and has no way to tell which lines are still load bearing.
- A long lived agent carrying content that only ever mattered to one workflow, put in
  the permanent stack because that was the fastest place to put it and paid for on every
  unrelated turn since.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`self_paced`. Accretion is what this work answers, and accretion has no cadence: a stack
can sit untouched for a quarter and then double in a week. An agent that can see how
much its own always loaded stack has moved since the last audit is the only thing in the
loop that knows when the work is owed. Where a stack is edited by many hands and nobody
watches it, a clock is a defensible fallback, and the interval belongs to the adopter.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which files this particular harness loads on every turn, because the list differs per
  harness and a stack enumerated by assumption audits files nobody pays for while
  missing the ones they do.
- Which of those files are generated from somewhere else, since a recommendation written
  against a generated copy is undone the next time it is generated and reads as a fix
  that did not hold.
- What this adopter treats as reachable on demand, because the whole value of moving
  something out of the stack depends on whether the agent can still get to it when the
  one task in twenty arrives.

## Dependencies

None.
