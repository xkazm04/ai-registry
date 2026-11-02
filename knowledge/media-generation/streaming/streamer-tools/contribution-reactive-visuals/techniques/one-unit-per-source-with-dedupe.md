---
layer: technique
type: technique
subject: contribution-reactive-visuals
technique: one-unit-per-source-with-dedupe
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [deciding which contributions feed a reactive visual and how they combine, a visual that flares twice for one gift or after a reconnect, two subscription topics that report the same contribution]
---

# One unit per source, with dedupe

Contributions arrive from the streaming platform's event subscription in several shapes,
and in several **native units**: a cheer in the platform's paid unit, a subscription or a
gifted subscription as a count, a hype-train as a level, a channel-point redemption in
points earned by watching, a charity donation in a currency's minor units. A reactive
visual must count them honestly and count each one once. Both halves fail in ways that
look like generosity — a bigger number on stream — so they are rarely caught by eye.

## A total counts one unit

A visual's total is denominated in one native unit, and the selection that feeds it is
validated when it is saved:

- **Mixed units are refused.** A selection that combines cheers with subscriptions, or
  points with money, is rejected rather than converted. An exchange rate between them is an
  opinion presented as arithmetic, and the streamer cannot see it in the picture.
- **Currencies are partitioned upstream.** Donations in minor units are summable only within
  one currency. If the contribution record carries no currency, the layer that knows it must
  route each currency separately; the visual layer never converts.
- **Weights are positive integers within the unit.** A gifted subscription may count double
  a self-bought one; both are counts. A zero weight is refused, not left to trigger nothing
  downstream.
- **Aliases are one source.** When the platform reports one kind of contribution through
  two topics, both normalise to one source, and selecting both is refused rather than
  counted twice.

A streamer who wants cheers and subscriptions both to light the stream gets two visuals or
two layers, each honest about what it counts. Non-money sources are welcome: a visual
driven by channel points lets the non-paying majority light the stream too.

## Each contribution counts once

The same contribution can arrive more than once:

- **Redelivery.** Event delivery is at least once; a slow acknowledgement delivers again.
- **Reconnect replay.** A recovering subscription replays recent events, sometimes late.
- **Overlapping topics.** The platform may report one cheer through two subscriptions,
  each with its own delivery identifier.
- **Bundle and parts.** A gift of five subscriptions may arrive as one bundle and as five
  individual gifts. Count one shape, by a written rule, and test it.

The deduplication key is the **underlying contribution's identity** scoped to the
broadcaster. Three tempting keys are wrong. The delivery's event identifier differs between
overlapping topics, so it lets the same cheer through twice. A viewer identifier merges two
real gifts from one generous viewer. A match on source and amount erases one of two fans who
gave the same amount at the same moment. Whoever adapts the platform's events into the
tool's contribution record knows how its topics overlap, and it is that adapter's job to
supply one shared identity per contribution. A record with a blank identity is refused, not
counted on trust.

Keep the seen keys for the **whole accounting session** — for a stream, from start to
end — and start a fresh set for a new session. Evicting keys by age during a session saves
little memory and lets a late replay count again.

## Read the platform's record

Only the platform's contribution event moves a total. A chat line claiming a gift is text
anyone can type, and an amount parsed from an event's free-text message is not the amount
field. A contribution addressed to a different broadcaster than the visual's is refused.

## Decision rules

- **When adding a source**, give it a native unit, put it in the validated selection, make
  the adapter supply its underlying identity, and add a test that delivers it twice — and
  through both overlapping topics — and expects one increase.
- **When a streamer wants two units on one visual**, give them two totals; never a rate.
- **When an event lacks an identity**, refuse it and count the refusal.
- **When the duplicate rate drops to zero after a platform change**, assume the identity
  moved and check before trusting the visual.

## When not to use it

A visual driven by one local trigger the streamer presses has one unit and no redelivery,
and needs neither the validated selection nor the key set. The moment a second source or a
network transport appears, both are needed.
