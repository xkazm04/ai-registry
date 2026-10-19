---
layer: technique
type: technique
subject: show-segment-format-design
technique: quiet-room-premise-deck
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [chat goes quiet during a live segment, a small room leaves the host with nothing to respond to, a host fills silence with filler]
---

# Quiet-room premise deck

Each segment carries a deck of prepared premises — self-contained prompts the host
can deliver when chat has been quiet past a short threshold. A card gives the room
something specific to answer for the price of one line, and it is written ahead of
time for exactly the moment when there is nothing live to respond to. The deck is
the format's answer to silence; without it, the host's answer is filler, and filler
is what turns a quiet room into an empty one.

This is content for silence. Covering a slow response — staying in character while
a long piece of work completes — is a different problem with a different owner:
latency budgeting. A premise card is never a stall; it changes the subject on
purpose and invites the audience back in.

## What makes a card

1. **It fits the segment.** A card belongs to a format and advances its premise —
   in a trial, a new piece of "evidence"; in a hot seat, a question for the room
   about the person in it. A generic icebreaker that could run in any segment
   breaks the format's frame.
2. **It costs one line to join.** A choice between two options, a name, a number, a
   one-word verdict. A card that needs a paragraph from a viewer stays unanswered
   in a small room — the room it was written for.
3. **It stands alone.** No reference to an earlier moment the current viewers may
   not have seen; the audience in a quiet stretch is often mostly newcomers.
4. **It carries no unverified claim about a real person or a viewer.** A card is
   written in advance and repeated across nights; a false or unsupported claim in
   one is broadcast on schedule. Premises built on facts state only what is
   sourced, and framed provocations are framed as such.
5. **It has a payoff.** The host knows what it will do with answers — tally them,
   rule on the best, fold them into the segment's state — so a card that does get
   answers turns into show rather than a dropped question.

## Why not just ask the host to fill it

A generated host can be told, every quiet beat, to start something new, and for a
few beats it will. Then it runs short of material that is both fresh and in frame:
it repeats a bit, a repetition guard rightly suppresses the repeat, the next beat
arrives with the same instruction and less to work from, and the spiral ends with
the host stepping out of the show to observe that the room is quiet and the beats
are repeating. A guard can catch that line at the output gate, but by then the show
has already spent several beats saying nothing. Prepared cards break the spiral at
its first turn by supplying the one thing the generator lacks in a quiet room:
something to react to.

## Procedure

1. **Write the deck with the format.** A segment does not pass validation without
   a deck large enough that a long quiet night does not repeat a card — at least
   as many cards as the segment's ceiling divided by the trigger threshold, and
   in practice more. Refresh it between shows: draft new cards offline from what
   the last nights produced (running jokes, recurring viewers' choices, the
   season's arc), review them, and add them before the next show. Cards are never
   generated live in the quiet moment — that is the filler the deck exists to
   replace.
2. **Trigger on measured silence.** When no acceptable chat message has arrived for
   the threshold — on the order of ten seconds, tuned per show — the host draws the
   next card. Messages that were received but declined still count as activity for
   the host's honesty (the room was not silent; the host chose not to engage), even
   when they do not reset the deck timer.
3. **Draw without repetition** across the night, and avoid the cards a returning
   viewer heard most recently on earlier nights. Shuffle within the deck rather
   than cycling in a fixed order, so the deck does not become a recognisable loop.
4. **Deliver in the host's voice**, adapted to the moment, not read verbatim. The
   card is a premise, not a script line.
5. **Back off when the room answers.** A card that draws responses hands control
   back to chat immediately; the next card waits for the next silence.
6. **Log which cards draw responses.** Cards that never land are rewritten or
   removed; the deck is curated like the portfolio, on evidence.

## Decision rules

- **When the room is quiet because it is small**, the deck is the main material, and
  the host should draw sooner and favour cards that reward the few present viewers
  by name or by choice.
- **When the room is quiet because it is busy elsewhere** — a large audience reading
  a long reveal, a tense moment — silence is the content. Raise the threshold in
  states where silence is expected; a card fired into a held breath breaks it.
- **When the deck is exhausted**, hand over to the next format rather than looping
  the deck; exhaustion is a signal that the segment has outlived the night.

## When not to use it

A format whose premise is the host performing — a monologue, a story — does not
need audience input to stay alive, and a card interrupting it is noise. Its silence
problem, if any, is pacing, not participation.

## Failure modes

- **The empty-room monologue** — the host narrates the silence ("chat is dead
  tonight"), which tells every newcomer to leave.
- **The generic card** — an icebreaker unrelated to the segment, which dissolves the
  format into small talk.
- **The recognisable loop** — a small deck in fixed order; regulars recite the next
  card before the host does.
- **The scheduled falsehood** — a premise card asserting something unsourced about a
  real person, delivered on cue every quiet night.
