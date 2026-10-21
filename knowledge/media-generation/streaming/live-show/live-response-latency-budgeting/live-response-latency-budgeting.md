---
layer: golden-path
type: golden-path
subject: live-response-latency-budgeting
status: forged
use_when: [a generated host speaks to a live audience and its replies feel late, choosing a model tier or timeout for a role inside a live show, deciding what the host says while slow generation work is still running, the generation backend fails mid-stream and the show must end or recover gracefully]
techniques:
  - first-word-budget-decomposition
  - dual-lane-fast-voice-slow-beats
  - in-character-stalling
  - latency-class-per-role
  - say-gap-ceiling
  - fleet-loss-grace-signoff
---

# Live response latency budgeting

A generated host on a live stream is judged by time before it is judged by
wit. A viewer types a line, watches the stream, and waits to hear the host
take it up; the room as a whole listens for the next thing the host says.
Both clocks run while the generation stack works, and neither forgives it. A
brilliant reply that lands after the viewer has stopped waiting reads as a
host who was not listening, and a minute of quality work delivered over
twenty seconds of silence reads as a stream that has died. **This subject is
the discipline of holding a generated host inside the time a live audience
tolerates**: a decomposed budget for the first word of a reply, a fast lane
that voices while slow work happens elsewhere, in-character cover for the
waits that remain, a measured ceiling on silence, and a graceful exit when
the generation backend is gone.

The naive reading treats it as "use a fast model". That fails three ways.
It reads the median latency, and the audience hears the tail. It measures
the model call, and the audience hears the whole loop, of which the model is
one stage. And it assumes the backend answers, when a live show must have a
designed answer for the hour in which it does not.

## Two clocks, not one

A live host owes the audience two different promises, and conflating them
is the subject's first mistake.

The **response clock** runs per message: from the moment a viewer's line is
accepted to the moment that viewer hears the host's first word about it. It
is a per-turn promise to one person, and it is what conversational latency
research measures. Human turn-taking gaps average around a fifth of a
second, a spoken agent is felt as natural somewhere under a second, and an
answer that takes several seconds is felt as thinking or as not hearing.

The **silence clock** runs per room: the longest stretch of stream time in
which the host says nothing at all. It owes nothing to any viewer; it is the
promise that the show is alive. A host can meet every response deadline and
still go silent for half a minute when chat is quiet, and a host can answer
slowly and still never let the room fall silent.

The two clocks call for different instruments. The response clock is a
distribution, budgeted at a high percentile per stage; the silence clock is a
maximum, held under a ceiling ([say-gap-ceiling](./techniques/say-gap-ceiling.md)).
A show that reports only the mean of either has measured neither.

## The live audience already pays a delay the host cannot touch

A live stream reaches its viewers through a broadcast pipeline that adds
seconds of its own: encoding, segmenting, delivery, a player buffer. Chat
travels back almost instantly. So the loop a viewer actually experiences is
chat transport, plus everything the host's stack does, plus the broadcast
delay on the way back to the viewer's screen. The broadcast delay is fixed
by the platform and the viewer's player, is often larger than the whole
generation stack, and is the reason a conversational-agent target of under a
second is the wrong number to copy. It is also the reason the remaining
budget is small: whatever the audience tolerates, the broadcast has already
spent part of it. The honest budget is the tolerance minus the delay the
show cannot remove, and that remainder is split among stages that can each
be measured
([first-word-budget-decomposition](./techniques/first-word-budget-decomposition.md)).
In practice the remainder for the host's own stack lands in the low single
digits of seconds to the first spoken word, and the design must assume a few
seconds, not a few hundred milliseconds.

## The first word, not the whole reply

The budget binds the **first spoken word**, not the completed reply. A
listener's patience ends when the host starts speaking, not when it stops,
and a reply that streams its first sentence into speech while the rest is
still being generated has met its budget. This rules out designs that wait
for a whole reply before speaking, that run a quality check over the full
text before voicing any of it, or that collect a large batch of chat before
deciding what to answer. Each of those is a stage that holds the first word
hostage to the last. Where a stage genuinely needs the whole reply (an output
gate that must see the complete sentence), it is placed to operate on the
first speakable unit, and its cost is a named line of the budget rather than
an invisible addition to it. The mechanics of streaming tokens are the
streaming-output subject's; what this subject owns is the decision that the
first unit is what the budget is measured on.

## Fast voice, slow beats

Not every piece of a live show can be fast. Planning the next segment,
synthesising a callback to something said forty minutes ago, consolidating
memory, judging a transcript: these are minutes of work, not seconds. The
answer is not to make them fast but to take them off the voicing path. A
**fast lane** owns the microphone and voices short, reactive lines within
the first-word budget; a **slow lane** produces richer beats asynchronously
and hands them to the fast lane as material, which voices them when the floor
opens. The fast lane never waits on the slow lane; the slow lane never speaks
directly. A slow beat that arrives after its moment has passed expires rather
than being voiced late
([dual-lane-fast-voice-slow-beats](./techniques/dual-lane-fast-voice-slow-beats.md)).

## Covering the wait without breaking the frame

Some waits cannot be removed: a slow beat the show has promised, a retry
after a timeout, a backend that is momentarily slow. Dead air is worse than
any line the host could say, and a line that names the machinery ("one
moment, loading") is worse than dead air because it breaks the frame the
whole show depends on. So the host carries a deck of **in-character
stalling lines**: authored ahead of time, voiced without a model call,
rotated so the audience does not hear the same one twice in a short window,
and capped so a stall that runs long escalates into a change of activity
rather than a loop of filler
([in-character-stalling](./techniques/in-character-stalling.md)). Stalling
covers slow work. Content for a room that is quiet because nobody is talking,
a deck of premises to fill an empty chat, is segment design and belongs to
the show-segment-format-design subject; the seam is that stalling exists
because the host's own stack is slow, and the premise deck exists because
the audience is.

## Every role declares a latency class

A live show calls models for many roles: the host's voice, a moderation
classifier, a picker, a segment planner, a memory consolidator, an offline
judge. They have latency needs that differ by two orders of magnitude, and
the routing table that serves them must say so. Each role declares a
**latency class** (live voice, near-live, background, offline), and the
class decides which tiers the role may use, how much reasoning effort it
may spend, what its timeout is, and what happens when the timeout fires
([latency-class-per-role](./techniques/latency-class-per-role.md)). A
timeout is sized from the measured high percentile of that role on that tier,
with headroom, never from a guess; an offline role with a timeout copied from
a live one will fail to finish, and a live role with an offline timeout will
hold the microphone for a minute.

The load-bearing lesson of measurement is that **the tail and the silence
decide the tier, not the median**. A smaller, faster tier can post the better
median latency and still produce the worse tail and the longer silences,
because it fails more often, retries more often, and stalls on the occasional
long generation. A tier is admitted to the live voice class on its high
percentile and on the longest silence it produced in rehearsal, measured on
the workload the show will actually run, and priced per usable minute of show
rather than per call ([cost per usable output](../../../_laws.md#cost-per-usable-output)).
Read only the median and you route the voice to the tier that will go quiet
on stream. Reasoning effort is part of the same decision: a model that
reasons before it answers has a first-token time that varies with the input,
so the live classes run with reasoning off where the tier offers an off, and
at its lowest level where it does not. Many current tiers have no off level,
only a lowest one, so the switch alone cannot admit or refuse a tier. The
tier is admitted on its measured first-text tail at the level it will run at.
A tier whose reasoning cannot be lowered is not a live voice.

## The silence ceiling is a gate and a watchdog

Silence is measured in **stream time**, as the largest gap between two host
utterances, and held under a ceiling. In rehearsal and simulation the
ceiling is a gate: a run that went silent past it fails, whatever its other
scores. On stream it is a watchdog: as the gap approaches the ceiling, the
host is forced to speak, from the fast lane if it can, from the stalling
deck if it cannot ([say-gap-ceiling](./techniques/say-gap-ceiling.md)). A
deliberate pause, a dramatic beat the host chose, is declared as such and
does not count, because a ceiling that cannot tell a choice from a failure
will be loosened until it catches neither. Two measurement traps sit under
the number. A simulation that advances its clock one fixed beat however long
the beat's calls took sees only the silences the host chose, never the ones
its latency caused. And a host that speaks only on a beat can only report
gaps in multiples of it, so the ceiling must be several beats wide to mean
anything. A run whose gap was never recorded has unmeasured pacing, not good
pacing ([unmeasured is not pass](../../../_laws.md#unmeasured-is-not-pass)).

## When the backend is lost, end the show on purpose

Providers go down, quotas run out, networks fail. A live host whose every
line depends on a model call goes mute when the backend does, and a mute
stream is the worst possible ending: the audience waits, the chat asks if
something is wrong, and the show ends in confusion. So the show detects
backend loss as a state (fleet-class failures across every route, persisting
from the first failure, not one timeout and not a bad reply), re-routes
before it declares anything ([refusal is a state](../../../_laws.md#refusal-is-a-state)),
covers short outages with stalling, and past a grace window voices
a **pre-authored, in-character sign-off** that needs no model, then moves to
a designed idle state and records the cause as infrastructure, not content
([fleet-loss-grace-signoff](./techniques/fleet-loss-grace-signoff.md)). An
outage the show narrates honestly in its own voice is an ending; an outage
it falls silent through is an incident.

## Boundaries with neighbours

Model routing, in the software-engineering bundle, owns choosing a model by
capability and cost for a class of call, the policy and its record, and
failover. This subject owns the **latency class a live role must meet** and
the evidence that admits a tier to it. Routing is handed a constraint (this
role must produce a first word within the budget at its high percentile, and
must time out at this bound) and solves within it; when a cheaper tier meets
the routing policy and fails the latency class, the latency class wins,
because a live host that misses its window has produced nothing usable.

Streaming output, also in the software-engineering bundle, owns the mechanics
of incremental output: typed events, buffering, cancellation, finalization.
This subject owns **what the first unit of that stream is for**: the point at
which the first-word budget is met, and the rule that no stage may hold that
unit hostage to the end of the stream. Pick by the question asked: if it is
about how bytes and events flow, it is streaming output; if it is about when
the audience hears the host and what fills the gap, it is this subject.

[Multi-speaker speech production](../../../audio-generation/multi-speaker-speech-production/multi-speaker-speech-production.md), in this bundle, owns offline rendering of a
scripted dialogue: line-addressed re-renders, chunk seams, voice assets bound
to an engine generation. A live host is not a script, and the runtime speak
path and whether a synthesis engine keeps up with real time belong to the
voice-I/O subject in the software-engineering bundle. What this subject takes
from speech is one line of the budget, the time from the first speakable text
to the first audible word, and one useful asset: stalling lines and a
sign-off are short authored scripts, rendered ahead of time, which is
exactly the offline production that subject governs.

## What a naive reading gets wrong

- It budgets the median and ships a host whose worst seconds are the ones
  the audience remembers.
- It measures the model call and ignores the tick, the batch window, the
  gate and the broadcast delay around it.
- It waits for the whole reply before speaking.
- It puts planning and memory work on the voicing path, so a slow beat
  silences the host.
- It covers a wait with a line about loading, or with nothing.
- It gives every role the same timeout, and the offline role never finishes.
- It picks the tier with the best median and the worst silences.
- It reports mean silence, when the room died during the maximum.
- It treats backend loss as a stream of errors and falls mute, or scores the
  outage as a content failure.
- It sets a grace window longer than anything can speak through, and calls
  the dead air before the sign-off graceful.

## Where this subject ends

It ends at the model choice (routing's), at the bytes of the stream (streaming
output's), at the synthesis engine (voice I/O's), and at what the host says
when the room itself is quiet (segment design's). It owns the clocks, the
budget, the lanes, the cover and the exit: the guarantee that a live host is
always heard in time, and never heard falling silent by accident.
