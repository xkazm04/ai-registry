---
layer: golden-path
type: golden-path
subject: show-segment-format-design
status: forged
use_when: [designing the recurring formats of a live show, deciding when a live segment should end or hand over, a live host drifts or the room goes quiet, choosing which formats to keep, pilot or retire]
techniques:
  - segment-as-state-table
  - metric-gated-handover
  - guest-line-cap-host-last-word
  - segment-portfolio-lifecycle
  - quiet-room-premise-deck
---

# Show segment format design

A live show is not written; it is built from **formats**. A format is a repeatable
machine for producing a stretch of live television out of whatever the room brings:
a hot seat, a trial, a call-in, a game with a scoreboard, a confession booth. The
host does not know tonight's lines, but the format knows tonight's rules — what the
segment is for, who may speak and how much, which audience commands are open, how
long it may run, and what makes it end. Segment format design is the discipline of
writing those rules down so precisely that a host can run them, a machine can
check them, and an owner can measure which of them the audience actually wants.

The naive readings fail in opposite directions. The first treats the show as one
long improvisation: the host "reads the room" and does whatever seems fun. It
produces a show that cannot be repeated, cannot be measured, and dies the first
night the room is small, because improvisation feeds on input and a quiet room
supplies none. The second treats the show as a rundown — fixed slots, fixed
durations, the clock calling every change. It produces a show that cuts away from
its best moment because the slot ran out and limps through its worst because the
slot has not. The principal reading sits between them: **the format is fixed, the
content is co-written by the audience, and the transitions are governed by what
the room is doing, bounded by the clock rather than dictated by it.**

## A format is a contract, not a theme

The most common design defect is a segment that is only a name and a mood — "the
interrogation segment", "chaos hour". A theme tells the host what to feel; it does
not tell anyone what may happen. A format earns the word when it declares five
things: a **premise** stated in one sentence the audience can repeat; the
**states** the segment moves through (opening, running, climax, closing) and what
is allowed in each; the **commands** the audience may use while it runs, and which
are closed; the **clock** — a floor below which it may not end and a ceiling above
which it must; and the **handover rule** that decides when it yields to the next
format. Those five are the contract between the format and the host, and between
the format and the audience, who learn a format's rules by watching it twice and
participate better every time it recurs.

Declared, they become data rather than prose, and data can do what prose cannot:
be validated before air (does every state have an exit?), be enforced during air
(a command outside the open set is declined, not improvised around), and be
compared afterwards (did the segment hand over on its rule or on its ceiling?). Every
other place the table is shown, an operator's console or a rules overlay, is then a
copy generated from it and checked against it, because a view written by hand keeps the
rules the table had on the day it was written.
The state-table discipline (segment-as-state-table) is what turns a segment from a
suggestion to the host into a machine the host runs.

The line between table and prose is worth drawing hard, because it is where formats
leak. A rule the runtime enforces holds every time; the same rule written only into
the host's direction holds most of the time, and on a live show "most of the time"
means a handful of nights a season on which the format says the one thing it exists
not to say. Whatever the runtime can check — which actions exist, which commands are
open, whether a claim carries the grade it needs to be stated as fact — belongs in
the table. Direction keeps what only direction can carry: tone, stakes, the feel of
a good run.

## The room decides when; the clock decides how long at most

A live segment ends well when it ends on its own success or its own exhaustion,
not on an arbitrary minute mark. The handover therefore listens to a measured
signal — audience size, chat rate, participation in the segment's own mechanic —
and acts only when that signal has **held** past a threshold for a sustain window.
A single sample is noise: one burst of messages from an arriving group, one lull
while everyone types. Without the sustain window a segment flaps between staying
and leaving; with it, the change is a decision. The clock stays, but as a bound:
the floor protects a segment from being abandoned before its premise has paid off,
and the ceiling protects the show from a format that has quietly become the whole
night (metric-gated-handover).

The rule decides *that* the segment ends; the host decides *how*. When the gate
fires, the show announces the handover and gives the host a short grace period to
close the premise and bridge into the next format in its own voice — and if the host
has not made the move when the grace period lapses, the runtime completes the switch
itself. A handover that depends on the host remembering to make it is a handover
that eventually does not happen; a handover the runtime performs with no host
involvement is a hard cut the audience feels.

The same signal can also stretch or shorten. A segment running far above its own
baseline has earned more time, and a show that cannot stretch a hit is wasting the
rarest thing live television produces; a segment running far below it for a
sustained stretch should be cut short rather than served out. Both are bounded,
explicit reflexes — a fixed increment, a threshold measured against the segment's
own history, a cap on how often they fire — never an open licence.

## The host owns the frame

Many formats put other voices on stage: a foil, a guest character, a viewer called
up, a second host. Each extra voice is a gift of texture and a threat to the show's
centre of gravity. Unbounded, a guest voice expands to fill whatever room it is
given, two voices start trading lines past the point anyone in chat is following,
and the host — the one voice the audience came for and the one voice that carries
the show's rules — becomes a participant in someone else's segment. The rule that
holds is mechanical: **a guest speaks at most a short, fixed allowance per turn,
and the host always closes the exchange.** The cap keeps the exchange fast; the
last word keeps the frame, the judgement and any correction in the voice that is
accountable for them (guest-line-cap-host-last-word). A guest who outlives its
segment does not keep its seat: carried across a handover, it shrinks to an
occasional observer with a rate of its own, so the next format starts as the host's.

## Formats are a portfolio, managed on evidence

No designer can tell in advance which format a given audience will love. A show
that lives for months therefore runs its formats as a portfolio: new ones enter as
**pilots** on a short, bounded slot; formats that measure well move to **trial** and
then to **regular**, earning a longer slot at each step; formats that measure badly
for several runs in a row are **retired**, and retirement beats promotion when both
would fire. Each stage is judged on the runs it has had since it reached that stage,
so a regular cannot coast on its pilot's premiere. The measure is not raw audience —
raw audience tracks the hour, the day and whoever just arrived from another channel
— but a score normalised against the show's own baseline, so a format is judged
against what the show normally does at that point rather than against the luck of
its slot. A format with too few runs has no verdict yet, and saying so is part of the
score; even a format its designer is sure will headline enters as a pilot, and every
threshold stays labelled an assumption until the show's first season has calibrated
it (segment-portfolio-lifecycle; see
[unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)).

Automation and ownership split along the time axis. Within a run, the reflexes —
handover, extend, cut — are automatic, because a decision that waits for a human
arrives after the moment has passed. Across runs, the score *proposes* promotions
and retirements and the owner confirms them, and the top slot of the show is the
owner's alone to award: a number may nominate the flagship, never crown it.

## Silence is a format's problem, not the host's

Every live show has quiet minutes: the room is small, chat is between thoughts, a
segment's mechanic has stalled. A host who meets silence with nothing fills it with
filler — rhetorical questions, recaps, the same complaint about the quiet chat —
and filler is what makes a quiet room empty. The format owns the answer: a
**premise deck**, a prepared set of self-contained prompts that fit the segment, cost
a viewer one line to join, and fire when chat has been quiet past a short
threshold. The deck is content written ahead for exactly the moment when there is
nothing to respond to, and it rotates so a regular never hears the same card twice
in a night (quiet-room-premise-deck).

The case for writing ahead is sharper for a generated host than for a human one. A
generator asked, beat after beat, to "fill the silence" with nothing to respond to
does not run dry gracefully: it repeats itself, a repetition guard suppresses the
repeat, the next beat is asked for something fresh with even less to work from, and
the end of that spiral is the host stepping out of character to remark that the
room is quiet and it will stop. A deck breaks the spiral at its first turn, because
each card is new material the generator did not have to invent from nothing.

## Where this subject stops

Short-form narrative structure and [narrative engine selection](../../../narrative-craft/narrative-engine-selection/narrative-engine-selection.md) govern **authored**
narrative: one writer owns every beat, the causal chain is designed end to end, and
the artefact is finished before anyone watches it. A live segment is the opposite
kind of object — a format whose content the audience co-writes while it airs — so
its designer authors rules, states and exits rather than beats. Their craft still
reaches in at the edges (a segment's premise wants a real gap, and a host's
transitions want "therefore" rather than "and then"), but when the question is
"what happens next in this sequence", it is theirs; when it is "what is allowed to
happen while the room decides", it is this subject's. [Production pipeline phasing](../../../production-ops/production-pipeline-phasing/production-pipeline-phasing.md)
governs the phases of producing an artefact, each settling decisions before a more
expensive phase spends on them. A segment's states are phases of a broadcast that is
already happening, and the pilot-to-regular ladder ranks formats across many
broadcasts by audience evidence rather than gating one artefact's spend; when the
question is "may this render proceed", it belongs to phasing. Within live
streaming, the quiet-room premise deck is content for silence and belongs here,
while in-character stalling over slow work and the ceiling on gaps in speech belong
to [live response latency budgeting](../live-response-latency-budgeting/live-response-latency-budgeting.md); votes, their weights and the powers the
audience can buy belong to [audience steering economies](../audience-steering-economies/audience-steering-economies.md), which a segment declares
open or closed but does not design; and which messages the host attends to belongs
to [audience absorption at scale](../audience-absorption-at-scale/audience-absorption-at-scale.md).

## Failure modes of the naive reading

- **The theme segment** — a name and a mood with no states, no commands, no exit.
  The host improvises until bored, and no two runs are comparable.
- **The rundown** — every handover on the clock. The show leaves its hit early and
  outstays its flop, and the audience learns the schedule instead of the format.
- **The frozen view** — an operator screen projected from the table by hand, still
  showing the rules it had when the screen was built while the runtime enforces more.
- **The flapping handover** — a metric gate with no sustain window, so one burst or
  one lull moves the show and the next sample moves it back.
- **The guest who took the show** — an uncapped foil trading lines with the host
  until the audience is watching a conversation it cannot join.
- **The forgotten handover** — a gate that fires and waits for the host to act on
  it, with nothing to complete the switch when the host does not.
- **The immortal format** — a segment kept because it was the first one, or because
  it once worked, with no retirement rule to make the portfolio pay for it.
- **The verdict on two runs** — a format promoted or killed on a sample too small
  to separate it from its slot's luck.
- **The empty-room monologue** — a quiet chat met with filler about the quiet chat,
  instead of a prepared card that gives a viewer something to answer.
