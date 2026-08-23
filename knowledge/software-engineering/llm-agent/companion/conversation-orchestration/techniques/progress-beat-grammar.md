---
layer: technique
type: technique
subject: conversation-orchestration
technique: progress-beat-grammar
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [a long turn produces no observable events to narrate, teaching a model to report its own progress, a progress line leaked into the visible answer]
---

# Progress beat grammar

Some turns are made of events. A capability is invoked, a source is fetched, a
sub-task completes — each one a fact the runtime observes and can narrate
without asking anyone. Other turns are made of thinking: one long generation,
no calls, several minutes, and a runtime with nothing whatsoever to say. This
technique is for the second kind, and its premise is that **the only participant
who knows what is happening is the model, so the model is asked**.

The mechanism is an in-band line convention: a standing instruction teaches the
model to emit a short, distinctly-marked line whenever it moves from one part of
the work to the next; the runtime lifts those lines out of the stream before
anything is rendered and routes them to the narration channel. It is a small
mechanism with an unusually good return — a turn that was a blank four minutes
becomes a turn the user can watch — and it fails in four specific ways that the
rules below exist to close.

## The addendum is always on, and it is short

The instruction that teaches the grammar is appended to **every** turn's system
context, not attached to the flows someone remembered. A conditional addendum is
an absent addendum for the turn that was routed around the condition, and the
user cannot tell the difference between a model that was not taught to narrate
and one that decided not to.

It costs tokens on every turn, so it is written to be worth them: what the
marker looks like, that lines are short, that they are emitted *before* starting
a part of the work and describe what is being started, that they are plain
language for a non-technical reader, and roughly how many are expected for a
long turn. It says nothing about tone or persona — that belongs to the identity
material, and duplicating it here creates two authorities for one voice.

## The marker is one vocabulary with one authority

The marker that distinguishes a beat from prose is consumed twice: once by the
instruction that teaches the model to write it, once by the sieve that strips it
out. Those two must derive from a single definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
a marker changed in the prompt and not in the parser produces the exact defect
the mechanism exists to prevent — control lines rendered to the user as if they
were the answer — and it produces it silently, on every turn, until someone
reads the output.

Design the marker for a sieve that must run on a partial line: a line-leading
token that no natural sentence begins with, followed by a separator, followed by
free text to end of line. Line-oriented is not an aesthetic choice. It is what
lets the sieve decide about a line the moment the line ends, without waiting for
the turn to settle — which is the whole requirement.

## The sieve runs on the live tail, and that is what makes it different

Extraction of machine-actionable artifacts is a settled-record discipline for
good reasons: an incomplete payload is not a payload, and a parser that guesses
at a half-arrived structure acts on a guess. Beats invert that trade
deliberately, because a beat arriving after the turn ends has no value at all —
its entire purpose is to be seen during the wait. So the sieve is a
**line-buffered filter on the live stream**, scoped so tightly that being early
is safe:

- It only makes a decision at a line boundary. A partially-arrived line is held,
  never emitted and never classified.
- A line that begins with the marker is consumed entirely: removed from the
  display stream, appended to the beat channel. A line that does not is passed
  through untouched.
- It never re-runs on the settled text. Sieving twice — once live, once at the
  end — means two implementations that will disagree on ugly input, and the
  disagreement shows up as a beat rendered inside the answer.
- It carries no repair, no tolerant matching, no recovery of a malformed marker.
  A beat that does not parse is not a beat; it stays in the prose, where the
  worst case is one odd-looking line rather than a lost sentence.

The asymmetry is the justification: mis-sieving a beat costs one cosmetic
artifact, mis-extracting an artifact costs a wrong action. Two mechanisms with
different risk budgets belong in different code paths, and unifying them is the
main way this design gets ruined.

## Where a lifted beat goes

Two destinations are legitimate and not equivalent. The weaker is a **status
line** on the working turn, latest-wins, over an activity log. The stronger is to
render each beat as **its own small message** — a lighter turn kind that clusters
with its neighbours and does not repeat the speaker's identity — so a long turn
reads as a back-and-forth rather than a spinner with a caption.

The second form improves two things downstream. The beats are already durable
conversational content, so settlement promotion narrows to whatever is *not*
already a message and can never double-show. And the instruction can be written
honestly — *each line appears as its own message the moment you emit it* — which
is the sentence that actually produces good beats, because it tells the model it
is talking rather than annotating.

One timing rule comes with the message form: a beat that becomes a message is
**written at the moment it was emitted**, not accumulated and flushed in a loop
when the turn ends. A batch write stamps every beat within the same instant, and
the conversation then replays on reload as the wall of text the whole mechanism
exists to prevent — the live experience was fine and the durable one was not,
which is the hardest version of this bug to notice.

Whichever form is chosen, the beat lines are removed from the **persisted final
reply** as well as from the live display. A beat that survives into the settled
answer is the same defect as a beat that leaked while streaming, discovered a
day later.

## Beats are reports, and the four ways they lie

**A beat announces a step at the moment that step begins.** Emitting one
immediately before a slow operation is correct and is what makes the narration
feel live — "let me pull up your recent runs" is a report about the present, not
a promise. Two things are forbidden and they are what "no promises" actually
means: a **batch of beats emitted up front** as a plan of the whole turn, which
narrates work that has not started and often never happens; and a beat that
**asserts a finding** the model does not have yet. Beats interleave with the
work, one per transition, or they are a script.

**A beat expires.** The last beat stays on screen for as long as the turn runs,
which means a beat from ninety seconds ago is asserting a present that has not
been checked. Past a threshold the surface stops asserting it: the narration
degrades to a statement about the silence rather than a stale claim about the
activity, per [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
— "no update for a while" is what is known; "reading your calendar" is not.

**Beats are budgeted.** Models that discover a narration channel over-use it.
The instruction states an expected order of magnitude, and the surface bounds
the live view to a recent window with a running count rather than growing
without limit. A narration longer than the answer has inverted the turn.

**Beats never carry data.** A beat is a human-readable sentence, not a payload.
The moment a beat contains a value some other part of the system reads, the
narration channel has become an undeclared machine channel — with no schema, no
validation, and a producer that is free to rephrase it. If a machine needs a
value, it comes from the machine channel; the beat says what is happening and
nothing more.

## What to do when the model does not comply

Some models, prompts and turns produce no beats at all. That is not an error
condition and must not be rendered as one: the surface falls back to what it does
know — elapsed time, a phase derived from whatever the transport reports, an
honest "working". The absence is still worth counting, because a compliance rate
that falls after a model or prompt change is the earliest signal the addendum
stopped working, and nothing else in the product will notice.

## When not to use this

- **When the turn is short.** Beats on a turn that settles in two seconds are
  flicker; the surface's ordinary busy state is the right answer and this
  machinery is overhead on every token.
- **When the work is genuinely observable.** If the runtime sees capability
  invocations, narrate those — they are ground truth, and asking the model to
  restate them adds a second, less reliable account of the same events.
- **When the output is consumed by a machine.** A pipeline turn whose product is
  a structured artifact has no audience for narration, and the addendum is pure
  cost plus one more thing that can end up in the payload.
