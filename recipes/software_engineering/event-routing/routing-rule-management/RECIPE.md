---
name: routing-rule-management
version: 0.3.0
status: seed
domain: software_engineering
path: software_engineering/event-routing
---

# Event routing rule management

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Routing rules are edited by hand or not at all, so they drift from what anyone
actually wants and a conflict between two of them is discovered by an event going
somewhere wrong. Turning a sentence into a rule fails silently in both directions: a
rule that came out broader than the sentence routes more and raises nothing, and one
that came out narrower drops and raises nothing, so the only thing that catches either
is looking at what the rule would do to real traffic.

**Input.** A plain language instruction from a person, the rules currently in force with
the order they are evaluated in, and a sample of events actually received recently.

**Core action.** Translate the instruction into a rule that keeps every qualifier the
sentence carried, work out how it interacts with the rules already in force, and show
the person which real events would change destination rather than which characters
changed in the rule.

**Output.** Rules that reflect what was asked for, a stated interaction with the rules
around them, a rehearsal against real traffic shown before anything is applied, and the
instruction kept beside the rule so a later reader knows what it was for.

## Activities

1. Take the instruction and the rules in force with their evaluation order *(observe)*
2. Translate it into a rule, keeping every qualifier the sentence carried *(decide)*
3. Work out how it interacts with the rules already in force *(decide)*
4. Run the candidate against recent real events and see what changes destination *(act)*
5. Show what would change, apply only what was confirmed, and keep the instruction
beside the rule *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The person approving a rule change sees what it does, not what it says.**

- The confirmation names how many recent events would change destination and shows
  examples of them, because a small edit to a pattern can move a large share of traffic
  while the text barely changes.
- A change that moves no recent events at all is reported as moving none, so a rule
  written for traffic that never arrives is visible as that rather than as a successful
  edit.
- Nothing is applied that was not confirmed, and a confirmation covers the effect that
  was shown rather than the sentence that was said.

**A new rule's relationship to the rules around it is stated before it is enabled.**

- A rule that can never fire because an earlier one already covers it is reported as
  unreachable, not accepted.
- A rule that overlaps an existing one and sends the overlap somewhere different is
  reported as the ambiguity it is, since which one wins depends on ordering that no
  single rule reveals.
- A rule identical in match and destination to an existing one is reported as redundant
  rather than added.
- The rule set always has a path for an event that matches nothing, and a change that
  would remove it is refused.

**The qualifiers a person put in their instruction are in the rule or the person was
asked about them.**

- Words that narrow the instruction, such as only, except and unless, appear in the rule
  or are raised as a question, rather than being dropped into a broader rule that reads
  as correct.
- An instruction whose condition cannot be expressed in the rule language, such as a
  timing or a judgment, is refused with what it would take, rather than approximated.
- One clarifying question is asked where the instruction is genuinely ambiguous, and the
  rule is not guessed at instead.
- A candidate the person turns down at the rehearsal is kept beside the words that
  produced it, because what they refused is a reading of their own vocabulary rather
  than a faulty rule, and only the sentence held against the reading they refused stops
  the same word being read the same way on their next instruction.

## Guidance

The dangerous failure is not a rule that errors, it is a rule that quietly works
differently from the sentence that asked for it. Review the effect and never the text: a
change means which real events move. Qualifiers are where meaning is lost, and a rule
that lost one still looks right. Watch the set's size: one rule per case grows until
nobody reads the set, and a set nobody reads routes by accident, so collapse it into
fewer rules that decide by area before it gets there.

## Where this is worth adopting

- An operator who wants to change where something goes and would otherwise be editing a
  configuration file, where the cost of being slightly wrong is events arriving
  somewhere nobody is looking.
- A rule set that has grown for a year, where nobody can say any more which rules still
  fire and two of them have been unreachable for months.
- A team whose router evaluates in order, so adding a rule in the wrong position changes
  the behaviour of rules nobody touched, and the text diff shows one added line.
- An instruction with an exception in it, such as routing everything from a source
  except one kind, where the exception is the whole point and is exactly what a
  translation drops.
- The first week after a new source is connected, when rules are being written faster
  than anyone can reason about their interactions and a rehearsal against yesterday's
  traffic is the only check available.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`event`. The work exists only when a person states a rule change, so it wakes on that
arriving. It is not self paced: there is nothing to watch for between instructions and
nothing useful to do with an unchanged rule set.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- How the router decides which rule wins, because a conflict check written for a set
  where the first match wins is wrong for a set where every match fires, and the two are
  not distinguishable from the rules themselves.
- How this person names sources and destinations, since the translation is only as good
  as the vocabulary it shares with them.
- Whether a conflicting rule should replace, sit alongside, or be refused against the
  existing one, which is a policy rather than a case by case answer.
- Where the recent events to rehearse against come from, because a rehearsal on made up
  examples confirms only that the rule parses.

## Dependencies

None.
