---
layer: technique
type: technique
subject: show-segment-format-design
technique: segment-as-state-table
status: forged
laws: [typed-input-owns-its-channel]
shared_with: []
use_when: [writing a new live segment format, a host improvises outside a segment's purpose, audience commands misfire in the wrong segment]
---

# Segment as state table

A segment is declared as data: a small table of states, the actions and audience
commands each state permits, the transitions between them, the clock that bounds
the whole, and the rule that hands over to the next format. The host — human or
generated — runs the table; it does not invent it while live. The point is not
bureaucracy. A segment held only in a host's head or in a paragraph of direction
cannot be validated before air, cannot be enforced during air, and cannot be
compared after air, and those three are what a recurring format needs.

## What the table declares

1. **Identity and premise.** A stable id, a display name, and the premise in one
   sentence the audience could repeat to a newcomer. If the premise needs two
   sentences, the format is two formats.
2. **States.** Usually three to five: an opening that teaches the rules, one or two
   running states, an optional climax, and a close that pays the premise off. Each
   state names its purpose in a line, because the purpose is what the host directs
   toward when the room is ambiguous.
3. **Allowed actions per state.** What the host may do here (call a viewer up,
   reveal a verdict, start a timer) and what it may not (no new contestants after
   the climax opens). An action outside the set is unavailable, not discouraged.
4. **Open commands per state.** Which audience commands are live. A vote command
   open during deliberation and closed during the verdict is a design decision; an
   always-open command is usually an undecided one. Out-of-state commands are
   declined with a short, in-world acknowledgement, never silently dropped and
   never executed.
5. **Clock.** A floor and a ceiling for the segment, optionally per state. The
   floor protects the premise; the ceiling protects the show.
6. **Handover rule.** The condition that ends the segment and the format it hands
   to, including the fallback when the condition never fires (see
   metric-gated-handover).
7. **Guest allowance**, when the format puts other voices on stage (see
   guest-line-cap-host-last-word), and the **quiet-room deck** the segment draws on
   (see quiet-room-premise-deck).
8. **Small-room fallbacks** for any mechanic that needs a crowd. A vote among three
   viewers is not a vote; the table says what replaces it below a stated room size
   (the host draws, the scheduled option runs), so the format still works on the
   night it is needed most.

## Starting and closing transitions are not symmetric

Split the events that drive the table in two. **Starting** events — open a vote,
call a guest up, reveal the next item — are requests, and a state with no row for
them refuses them. **Closing** events — a vote's timer ran out, a guest left, the
handover came due — are facts, and they always happen; a state with no row for one
simply stays where it is. Treating a closing event as refusable produces a table
that can lock itself (a vote that cannot close because the state forbids it);
treating a starting event as a fact produces a table that cannot say no.

## Decision rules

- **When a rule can be enforced by the runtime, put it in the table, not in the
  host's direction.** A command that is closed is closed by the dispatcher; the
  host's prompt does not also say "do not accept votes now". Two authorities over
  one channel — a typed rule and a sentence of prose about the same thing — do not
  average; they produce a host that half-obeys both. The prose's job moves to what
  only prose can do: the segment's tone, its stakes, what a good run feels like.
- **When a guardrail can only be stated, expect it to leak, and move what you can
  of it into a check.** A segment that tells its host "never state an unproven claim
  as fact" will, across enough runs, have a night when the host does; a segment
  whose runtime refuses to mark a claim as established unless it carries a source
  never has that night for that half of the rule. The part that stays in prose is
  the part to watch in evaluation.
- **When a host instruction cannot be enforced, state it in the table anyway, as
  direction** — the premise and the state purpose are read on every turn, so they
  belong in the declaration, restated each time, not remembered from the opening.
  Generate the direction from the table where you can (the guests available
  tonight, the case being audited), so prose and data cannot disagree.
- **When anyone but the runtime shows the table, generate the view from the
  declaration and check it against the declaration.** An operator's console, a rules
  overlay or a format sheet is a copy of the table, like the host's direction. A copy
  projected by hand keeps the table's shape on the day it was written: each rule added
  afterwards (a floor, a per-state narrowing, a new clock) is enforced on air and absent
  from the screen the owner judges the format by. The check that holds walks every key
  the table declares and fails on any the view does not carry; reading the projection
  to test the projection inherits its gaps. A view's own sentence restating a rule's
  semantics drifts the same way, so it is rendered from the rule's fields, not written
  beside them.
- **When a host action is refused, record why.** Host actions outside the table
  are rejected with the rule that refused them, and the record goes where
  evaluation can see it; a host that keeps reaching for a closed action is a
  direction problem worth fixing.
- **Validate the table before it airs.** Every state reachable, every state with an
  exit, the ceiling above the floor, every open command known to the dispatcher,
  every referenced deck present. A segment that fails validation does not air; a
  show that discovers an unreachable close live discovers it in front of everyone.
- **Keep transitions observable.** Every state change and every handover is an
  event with its cause recorded — rule fired, ceiling hit, operator override —
  because the portfolio cannot judge a format whose ending it cannot explain.
- **Version the table.** A change to states, commands or clock makes a new version;
  scores from the old version do not silently pool with the new one.
- **Shelve, do not delete.** A format set aside before it ever aired keeps its table
  with a shelved status and its design notes, and the runtime refuses to start it.
  The notes are what make a revival cheap; the refusal is what keeps a half-built
  format off air.

## Content stays out of the table

The table describes the machine, not tonight's material. Lines, jokes, the
specific accusation in tonight's trial — those are the audience's and the host's
to write live. A table that starts carrying scripted lines has become a rundown
with extra steps, and loses the property that makes a format worth having: it runs
on any room.

## When not to use it

A one-off special — a launch, an anniversary, a guest appearance that will never
recur — gains little from a full table; a premise, a ceiling and a close are
enough. And a format still being discovered in a pilot may start with a looser
table, as long as it gains states and commands before it is measured as a trial:
a format that cannot be described cannot be compared.

## Failure modes

- **Theme without table** — "the roast segment" with nothing declared; every run
  is a different show and the scores mean nothing.
- **Prose duplicating the table** — the dispatcher closes a command and the
  direction also forbids it in different words; the host follows whichever was
  more recent in its context.
- **The frozen view** — an operator screen that projected the table when it had six
  kinds of rule, still showing six after the table grew to ten, so the owner reviews a
  simpler format than the one on air.
- **No fallback exit** — a handover condition that never fires on a small night,
  and a segment that runs until someone notices.
- **Silent declines** — out-of-state commands swallowed with no acknowledgement,
  so the audience concludes the command is broken rather than closed.
