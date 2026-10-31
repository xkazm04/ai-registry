---
layer: technique
type: technique
subject: audience-absorption-at-scale
technique: first-contact-exemptions
status: forged
laws: []
shared_with: []
use_when: [deciding whether a first-time chatter should jump the queue, newcomers chatting once and never again, defining which messages may bypass picking caps]
---

# First-contact exemptions

A viewer's first message on a stream is exempt from the per-viewer cap and boosted in the
picker. The technique is to grant that exemption deliberately, **bound it so it cannot be
farmed or flooded**, and keep the list of exemptions short enough that the caps still mean
something.

## Why first contact earns the exemption

The decision to keep chatting is made on the first message. A lurker who finally types
something and is answered by name has been invited in; one who types and watches the host
answer the same regulars has learned that this room is not for them. Of all the lines a
host speaks, the acknowledgement of a first message has the highest return in retention,
and it is the line a size-blind picker is most likely to drop, because a newcomer has no
rank, no history and no momentum in the ranking.

## The procedure

1. **Define "first" over the right horizon.** First message this stream is the usual
   unit; a returning regular's first message tonight is a greeting worth making, but a
   lifetime-first message deserves the stronger boost. Track both.
2. **Exempt from the rate cap, not from moderation.** The first message still passes every
   acceptability check; a first message that is bait gets no boost. Nor may it be
   swallowed by near-duplicate collapse: it joins a wave only as an exact copy, or the
   newcomer becomes a count.
3. **Boost, do not guarantee.** In choose mode the first message gets a strong ranking bonus
   and a short expiry; in answer mode it would have been answered anyway; in aggregate mode
   the host acknowledges first-timers in small batches ("welcome in, the three of you who
   just spoke up") rather than one at a time.
4. **Lapse after one answer.** The exemption is spent the moment the viewer is
   acknowledged. A second message competes on ordinary terms.
5. **Suppress during raids.** When a raid lands, every arrival is first contact; the group
   greeting serves them all, and individual first-contact boosts resume only for raiders
   who speak beyond the ritual once the surge settles. Suspend every newness bonus for raid
   arrivals, not only this one; a picker that also favours never-answered viewers rewards
   the same raiders a second way ([raid-group-greeting](./raid-group-greeting.md)).

## The second exemption: the question that was missed

A sincere direct question to the host — a real question mark, second person or the host's
name, enough real words that it is not rhetorical spam — from a viewer the host has not
answered in the last few turns earns the same pass through the rate cap. Repetition is the
reason. A viewer who asks the host the same real question twice is telling the show they
were missed; a flood cap that drops the second ask, because the viewer had already chatted
a lot that minute, has made the one message the room most needs answered impossible to
deliver. Bound it like first contact: one sincere-question pass per viewer per batch, and
it lapses the moment the viewer is answered.

## The exemption that is not an allocation

One class of message bypasses every cap in this subject, ahead of both: a message that may
signal a viewer in danger. That bypass is owned by the safety layer, whose detector is
biased toward false positives, and it is not an attention allocation at all — it routes
the message to a different kind of response, and it still consumes one of the turn's
answer slots. Keep it out of the picker's tuning surface, so that nobody adjusting fairness
constants can accidentally throttle it.

A gift or subscription announcement may also pass the flood cap, so the thank-you is never
lost; it is acknowledged as an event and buys no further chat priority.

Beyond those, resist adding exemptions. Every class of viewer that "should always be
answered" — moderators, top gifters, the owner's friends — is a hole in the caps, and a
picker with five exemption classes has no caps. A moderator may need to bypass a flood cap
to do moderation; that is not the same as bypassing the picker.

## Decision rules

- **When accounts are cheap**, gate the lifetime-first boost on a minimal signal of a real
  viewer (some watch time, an account older than the stream) so that throwaway accounts
  cannot farm the front of the queue.
- **When many first messages arrive together** outside a raid, batch them into one
  welcome; a host spending a minute on separate hellos has turned the exemption into a
  flood.
- **When a first message is a question**, answer the question, not only the hello; being
  welcomed and ignored in one line is still being ignored.

## When not to use it

A closed community where every chatter is known has no first contacts to court, and a
show whose audience is overwhelmingly first-time — a one-off event — would exempt nearly
everyone; there the per-viewer cap alone does the work and the boost adds only noise.
