---
layer: technique
type: technique
subject: live-response-latency-budgeting
technique: in-character-stalling
status: forged
laws: []
shared_with: []
use_when: [a live host must wait for slow generation work, a reply missed its budget and something must be said now, deciding what a host may say while it waits]
---

# In-character stalling

Some waits survive every budget. A slow beat is still being made; a call
timed out and is being retried on another route; the backend is slow for a
minute. The host must say something, because silence is the one thing a live
room punishes immediately. What it says decides whether the wait is a moment
of the show or a crack in it. A stalling line is a short, in-character line
the host voices to cover its own slow work, and it is authored, cheap and
rationed.

## What a stall is, and what it is not

A stall covers a wait that the host's own stack caused. It is not content for
a quiet room: when nobody is talking, the host needs premises, bits and
questions, which is segment design. The test is the cause. If the host would
have something to say but cannot produce it yet, stall. If there is nothing to
answer, run a premise.

A stall is in the character's voice and in the character's world. It frames
the wait as something the character is doing: considering, savouring a
question, consulting something, making the viewer wait on purpose. It never
names the machinery. "Loading", "processing", "one second while I think" and
anything that implies a model, a server or a queue break the frame the whole
show runs on, and they do so at the moment the audience is already noticing
the delay.

## Authored ahead, voiced without a model

A stall exists because the generation path is slow or down, so a stall that
needs a generation call has defeated itself. Stalling lines are written in
advance, reviewed like any other script, and, where the show is voiced,
rendered to audio ahead of time so that voicing one costs a playback and
nothing else. They live with the host's character material and change when
the character does.

A deck of them needs:

- **enough variety** that the audience does not hear the same line twice in a
  short window; track recent use and draw from what has not been heard;
- **light parameterisation** where it is safe (a viewer's name, the topic
  being waited on) and none where it is not; a slot filled from chat is chat
  in the host's mouth, and passes the same screening as any other chat;
- **graded lengths**, so a short wait gets a short line and a longer wait a
  longer one, rather than one length for every wait.

## Rationed, then escalated

A stall buys a few seconds. Two in a row buy a few more and start to sound
like a host that is stalling. A third is a loop, and the audience hears it as
one. So stalls are rationed per wait: after a small number, the host
escalates, abandoning the slow work it was waiting for and moving the show on:
a change of topic, a premise, a segment transition. The slow result, if it
arrives later, is a beat with an expiry like any other, not a debt the host
must pay.

Stalling must also not promise what the slow work may fail to deliver. A stall
that says "I have something special for you" commits the host to a payoff; if
the payoff expires or fails, the host has broken a promise in public. Prefer
stalls that frame the wait without pre-announcing its result.

## Decision rules

- When a reply will miss its first-word budget, voice a stall at the budget
  boundary, not after the room has noticed the silence.
- When a wait exceeds the stall ration, escalate; never chain stalls past it.
- When a stall line would need a model call to produce, it is not a stall.
- When a stall names the machinery, rewrite it, even if it is funny.
- When the same stall is heard twice in a short window, the deck is too small.

## When not to use it

A show where the delay is visible and the audience is told why (an honestly
labelled break) does not need stalling; it needs the break. A sincere moment,
such as a viewer in distress, is never stalled with a bit: the right answer
there is a short, plain line, voiced at once, and the bit waits.
