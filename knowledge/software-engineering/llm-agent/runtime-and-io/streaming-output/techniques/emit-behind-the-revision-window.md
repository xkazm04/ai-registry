---
layer: technique
type: technique
subject: streaming-output
technique: emit-behind-the-revision-window
status: forged
laws: [limits-are-derived, record-precedes-effect]
shared_with: []
use_when: [a producer revises output it has already emitted, deciding whether a non-monotone stream can be shown live at all, a live transcript visibly rewrites itself, a detector retroactively invalidates recent output, choosing how far behind the producer a live surface should render, a downstream consumer wants to start work before the output is final]
---

# Emit behind the revision window

A producer that revises its own recent output cannot be rendered live by the
obvious method, and the subject's opening says so: a live transcript will
visibly rewrite itself, so render checkpoints or wait. Both of those remedies
are correct, and both of them are answers to a question nobody asked out loud —
**how far back can the revision reach?** They are the right answers when the
answer is *unknown* or *unbounded*, which is the common case and the reason
they are stated first.

When the reach is **bounded and nameable**, a third remedy exists that neither
of the other two provides: keep streaming, append-only, and hold the emission
cursor a fixed distance behind the producer's frontier. Output older than the
reach cannot be revised — not "is unlikely to be", *cannot*, because the
mechanism that would revise it cannot see that far back. Emitting only from
that region makes the stream monotone by construction. The user watches a live
transcript that never rewrites itself, and the entire cost is a stated latency.

## The reach is a property of the corrector, not a taste setting

The distance is not tuned and it is not a feel. It is read off whatever does
the revising ([limits-are-derived](../../../../_laws.md#limits-are-derived)):

- **A retroactive detector** — one that watches the output and invalidates a
  suffix when it recognises a pathology — can only reach as far back as the
  window it inspects. Its lookback *is* the reach.
- **A resumable retry** rewinds to the last point it can restart from, so the
  reach is the distance from the frontier to the nearest resume point.
- **A parser that carries an incomplete boundary** can revise only within the
  unterminated element it is holding.

Whichever it is, the number already exists in the implementation, usually as a
buffer size or a window length. The technique is to *name it as the reach* and
derive the lag from it, rather than picking a lag that feels responsive and
discovering the overlap in production. Write it beside the emission cursor:
`lag = <the corrector's window>`, one line, with the corrector named.

Two correctors mean the reach is the **maximum** of theirs, not the most recent
one's. A surface that holds back one detector's window while a second detector
reaches further has a lag that is right most of the time, which is the worst
available property: the overlap happens rarely enough that nobody attributes
the rewrite to the lag.

## The cursor snaps to a semantic boundary

A lag measured in bytes will land mid-token, mid-word, mid-record. The cursor
therefore moves to the **last complete unit at or before** `frontier − reach` —
a finished sentence, a closed record, a terminated event — and not to the raw
offset. Two things follow, and the second is the one that gets skipped:

- The lag is **at least** the reach and usually more, because the boundary is
  behind the offset. That is correct and must be stated as the surface's
  latency, rather than advertised at the reach and delivered at the boundary.
- **A region with no boundary in it stalls the cursor.** A producer that emits
  a long stretch with nothing to snap to will hold the display still while the
  frontier runs on, and the surface must degrade the claim rather than freeze:
  this is the stall case [phase-derivation](./phase-derivation.md) already
  owns, arriving from the emission policy rather than from the producer's
  silence. A cap that forces a cut past some distance is the escape hatch, and
  it is a distinct decision from the reach — say which one moved the cursor.

## What is emitted becomes binding on the producer

This is the half that makes the technique a mechanism rather than a delay, and
it inverts the surface's usual posture. Everywhere else in this subject the
live region is the *weak* tier — volatile, lossy, never the system of record —
and the settled record is what binds. Here the emitted prefix is the strongest
thing in the system, because it is the only part that has already left
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)): the
surface can discard its buffers, the producer can restart, but a line the user
has read cannot be recalled.

So when the corrector fires and the producer is restarted or resumed, **the
prefix it must continue from is what was emitted, not what the producer
believes is best.** The two differ: the corrector will usually identify a good
cut somewhere *after* the emission cursor, and resuming from that later point
is the tempting choice because it discards less work. It is also the one that
puts text on the screen and then contradicts it. Resume from the cursor,
discard the difference, and the transcript is consistent by construction.

The corollary is worth stating because it is free and frequently missed:
**before the first emission, nothing is binding, so the whole output is still
revocable.** A pathology detected while the cursor is still at zero permits a
clean restart from the beginning — a strictly better recovery than any resume,
and available only in that window. Branch on it explicitly rather than falling
into the resume path with an empty prefix.

## Acting on a prefix and showing a prefix are different questions

Everything above answers *what may be shown*, and treats emission as the commit
because emission is irreversible. There is a second question that looks like
the same one and is not: **what may be acted on.** A consumer that wants to
start expensive work as early as possible — a downstream model, a prefetch, a
compile — is not bound by irreversibility at all, because its output has not
left the system yet and can still be thrown away.

Where the two are conflated, one of them is answered wrongly. Holding the
speculative consumer to the emission cursor wastes the whole latency the lag
just cost; letting the display run at the consumer's frontier puts revisable
text on the screen. Answer them separately:

- **Showing** takes the guarantee: the cursor, the reach, the binding prefix.
- **Acting** takes a heuristic, plus a gate. The cheapest useful heuristic is
  **agreement between successive revisions** — two consecutive versions of the
  output saying the same thing about the same span is evidence that the
  producer has stopped changing its mind about it, and it needs no knowledge of
  the corrector's reach, which is its real advantage. Cut it at a semantic
  boundary for the same reason the cursor is cut at one: a truncated word
  handed to a downstream consumer reads as a different word, not as an
  unfinished one.
- **The gate is the load-bearing half, and it is a check, not a promise.** When
  the confirmed output finally arrives, assert that it actually *continues* the
  prefix the speculative work was built on. If it does not, the work is
  discarded unheard. Without that check the heuristic has silently become a
  commit, which is the failure this whole technique exists to prevent, relocated
  one layer down where nothing is watching for it. Compare on a normalization
  that ignores what the producer is entitled to revise — casing, punctuation,
  spacing — because a partial and a final rendering of the same words routinely
  differ there and a byte comparison would discard sound work every time.

This is the answer when the reach is **unknown**: agreement is measurable
without it, so a producer whose corrector you do not control can still be
consumed early, as long as nothing the speculation produced becomes visible
before the confirmation. The two mechanisms compose — a display held at the
cursor, a consumer running at the agreed prefix, one gate between the
speculation and anything anybody sees.

## What it does not buy

- **It does not make the output correct.** It makes it *stable*. A producer
  that emits a wrong sentence and never revises it emits the same wrong
  sentence here, one window later.
- **It does not remove the need for a terminal outcome.** The tail between the
  cursor and the frontier is unemitted at the end of the run and must be
  flushed at finalization, after which the reach no longer applies because
  there is no more producer to revise anything.
- **It does not survive an unbounded corrector.** If the mechanism that revises
  can reach arbitrarily far back — a global re-rank, a second pass over the
  whole output — there is no lag that makes the stream monotone, and the
  subject's original two remedies are the answer.

## When not to use this

- **The reach is most of the output.** A lag that approaches the run's total
  length is waiting with extra machinery; wait honestly instead.
- **The consumer acts on each increment.** The lag is latency added to every
  action, and a consumer that must respond promptly to partial output is better
  served by explicitly-marked revisable increments than by late final ones.
- **The revision is visible and wanted.** Where the audience benefits from
  watching a draft improve, rewriting is the feature and hiding it behind a lag
  removes the thing they came for.
