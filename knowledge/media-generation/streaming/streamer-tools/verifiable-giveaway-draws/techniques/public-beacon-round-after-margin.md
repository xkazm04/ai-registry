---
layer: technique
type: technique
subject: verifiable-giveaway-draws
technique: public-beacon-round-after-margin
status: forged
laws: []
shared_with: []
use_when: [choosing a source of randomness for a public draw, choosing which future beacon round a draw will use, deciding how long the room waits between announcement and result]
---

# A public beacon round, chosen after a margin

The randomness for a draw comes from a **public randomness beacon** and the draw names a
round whose publication time lies strictly after the moment the announcement became
visible, plus a margin. Two decisions: which source, and which round.

## Which source

A public beacon run by a network of independent parties publishes a value at a fixed
period. Each value is a threshold signature over the round number: enough members must
cooperate to produce it, no minority can produce it early, and the signature verifies
against one long-lived network public key. Because the message signed is a function of the
round number alone — the so-called unchained mode — a round's value is fixed the moment
the network's key is, and it cannot be biased by anyone who sees earlier rounds; it can
only be learned when the threshold signs it.

Reject the alternatives for named reasons, not taste:

- **The operator's own generator**, however strong, is unverifiable: the room sees an
  output and has to trust the input.
- **Commit-and-reveal with viewers** has a last-revealer problem. Whoever reveals last
  sees every other share and can decline to reveal, which vetoes the outcome; on a live
  stream the operator is the natural last revealer.
- **A value read from a public feed** — a price, a score, a block hash on some ledger — is
  usually coarse in time, ambiguous about which reading counts, and in some cases biasable
  by whoever produces it at a cost below the prize.
- **A third-party random-number page** is a server the room must trust, and its output is
  usually a screenshot, which proves only that a page once showed a number.

## Which round

Rounds are scheduled on a public clock: round *n* is published at genesis time plus
*(n − 1)* periods. The draw takes the first round whose scheduled time is **strictly
after freeze time plus a margin**. Both inputs are inside the committed bytes, so the round
is a function of the commitment, not a separate claim: a verifier recomputes it from the
pinned chain's genesis and period, and a record pointing elsewhere fails a schedule check.
"Strictly" matters at the boundary — a round due exactly at freeze plus margin may already
be published when the margin was meant to protect it. The margin absorbs:

- **clock skew** between the operator's machine and the beacon's schedule — the tool must
  not trust its own clock blindly, and can compare it with the latest published round's
  scheduled time before announcing;
- **announcement latency** — a stream reaches viewers seconds after it leaves the
  operator, so "announced" means visible to the room, not sent;
- **beacon jitter** — a round can publish a little after its scheduled time; it never
  publishes meaningfully before.

The margin is a few periods for a fast beacon, tens of seconds in total, and it is
stated in the draw rules so a viewer can check it: given the announcement's recorded
time and the round number, a verifier recomputes the round's scheduled time and confirms
the gap.

## Decision rules

- When the latest published round is already past the computed target at announcement
  time — a slow machine, a paused tool — the announcement is refused and recomputed. Never
  announce a round that might already exist.
- When the period is short, prefer more rounds of margin over fewer; dead air of thirty
  seconds is cheap, a credible accusation that the round was visible is not.
- When the beacon publishes several networks (different periods, different schemes),
  pin one network by its chain identifier in the rules and in the verifier. A draw that
  could be resolved against either of two chains has a choice point.
- When the round is late, wait; when it never arrives within a stated window, the draw
  is abandoned on the record, never re-pointed at another round (see the single-attempt
  technique).
- When fetching the round, treat the transport as untrusted: disable redirects, bound
  the response size before parsing, reject a reply in a different signing format, check
  that the round returned is the round requested, and verify the signature locally. A
  fetch that returns *a* valid round is not a fetch that returned *this* one.
- When the operator's own commit-and-reveal is offered as a fallback, it is a different
  source with its own committed tag, and it is labelled as operator-controlled wherever
  the draw appears. A margin protects a beacon round; it does nothing for a seed the
  operator chose before committing to it.

## When not to use it

An offline event with physical witnesses can use physical randomness drawn in their
sight; the technique exists because a stream's witnesses are remote. And a draw that
needs no public trust needs no public beacon — but must not borrow its visual language.
