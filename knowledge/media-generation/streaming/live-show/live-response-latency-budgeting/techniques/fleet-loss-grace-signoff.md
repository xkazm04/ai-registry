---
layer: technique
type: technique
subject: live-response-latency-budgeting
technique: fleet-loss-grace-signoff
status: forged
laws: [refusal-is-a-state, unmeasured-is-not-pass]
shared_with: []
use_when: [every generation route of a live host is failing, a provider outage or exhausted quota hits mid-stream, deciding how a generated show ends when it cannot generate]
---

# Fleet-loss grace sign-off

A generated host speaks only while something generates. When every route to
every model fails (a provider outage, an exhausted quota, a network partition)
the host has nothing to say and no way to say why. Left to default, it goes
mute: the stream keeps broadcasting, the chat asks whether something is
wrong, and the show ends in confusion rather than in an ending. This technique
designs that hour in advance: detect the loss as a state, cover the short
outage, and end the long one on purpose, in character, without a model.

## Loss is a state, not a timeout

One failed call is a timeout, owned by the role's latency class and covered
by stalling. Loss of the fleet is a different thing: every route the voice
could take has failed, repeatedly, over a window. Detect it as a state, from
consecutive failures across all routes or from every circuit being open, and
name the state explicitly in the show's runtime. A system that infers fleet
loss from one slow call signs off on a hiccup; a system that never infers it
retries into silence for an hour.

Classify the failures that feed the state. Rate limits, unavailability,
transport errors and timeouts are fleet signals; a reply that failed to parse
or a refusal of one request is a content event and says nothing about the
fleet. Mixing the two signs off a healthy show over a bad reply, or keeps a
dead one on air because its last error looked like content. One healthy call
resets the state, because the fleet that answered is the fleet that exists.

Before declaring loss, re-route: a failing provider is a routing decision, and
the fallback tiers exist for this. A degraded local lane, weaker but
independent of the remote fleet, is a route like any other: it can carry
idle banter and lengthen the grace window, but it does not replace the
authored sign-off, because it can fail too. Fleet loss is what remains when
the re-routes have failed.

## The grace window

Between the first failures and the declaration sits a short grace window, in
which the host stalls in character as it would for any slow work. Most
outages are short, and a show that signs off at the first failure ends streams
it could have saved. The window has a length fixed in advance, set by the
silence ceiling: the stalling deck can carry the room for a little while,
and when its ration is spent the decision is made, not deferred. A window
longer than the deck can cover is a window of dead air with a sign-off at
the end of it; if the show wants a long window, it needs a lane that can
speak through it.

The window's clock starts at the first failure, not at the next moment the
loop happens to look. A loop that checks on a beat and starts the clock on
the beat after the failure adds a beat to every window and, worse, lets a
failure that lands between beats go uncounted.

## The sign-off

When the window closes, the host voices a **sign-off**: a short, in-character
closing that frames the end as the character's choice or the character's
world intervening, never as an error message. It is authored and reviewed
ahead of time, stored locally, and, where the show is voiced, pre-rendered, so
that playing it needs no model, no network to the generation backend, and no
decision. It is played once. Then the show moves to a designed idle state (a
holding scene, an honest "back soon" card), not to a frozen frame or a black
screen.

The sign-off should be honest about the end without exposing the machinery.
The audience should leave knowing the show has stopped, not wondering whether
it will resume in a minute.

## Record the cause as infrastructure

Every stream that ends this way is recorded with the cause: backend lost, the
routes that failed, the window, the time of the sign-off. It is never recorded
as a content result. A rehearsal run that ended in fleet loss is an engine
failure to re-run, not a run that scored zero on pacing; a run whose evaluation
call could not complete is pending, not a pass and not a void. An outage that
is scored as content teaches the show to change things that were never wrong.

## Recovery

When routes return, the show does not resume mid-sentence. Coming back is a
deliberate act by the operator or a scheduled restart, opening with a return
line as authored as the sign-off. A host that silently resumes after signing
off has contradicted its own ending in public.

## Decision rules

- When one route fails, re-route; when all routes fail, start the grace
  window; when the window closes, sign off. Never skip a step and never loop
  one.
- When the sign-off needs a model call, it will fail exactly when it is
  needed; make it authored and local.
- When an outage is recorded, record it as infrastructure; when an evaluation
  could not run, record it as pending.
- When the show recovers, return on purpose, never by resuming the old loop.

## When not to use it

A show with a human co-host who can carry the room has a better exit: hand
the microphone over. The detection, the cause record and the no-model rule
still apply.
