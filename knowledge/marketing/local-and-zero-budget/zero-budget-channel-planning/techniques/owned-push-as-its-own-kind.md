---
layer: technique
type: technique
subject: zero-budget-channel-planning
technique: owned-push-as-its-own-kind
status: forged
laws: [label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [folding a newsletter or a message list into a channel taxonomy, deciding whether a channel may be dealt a target query, setting a cadence cap on a channel the business sends into an inbox, reading why a channel that costs nothing to send is still spending something]
---

# Owned push is its own kind

Owned content looks like one family until you ask who moves first. A blog post, a
video, a search-facing page are **pull**: the business publishes, a stranger arrives
from a results page, and the only cost of publishing again is the work. A newsletter
issue, a message to a list, a broadcast to people who once gave an address are
**push**: nobody arrives, the business spends a standing permission by reaching into
a space it was let into, and an intermediary between sender and reader decides
whether the next one is delivered at all.

The fold matters because two downstream rules read the kind and both are wrong for
push.

## Push carries no query

A target query is dealt only to channels that can carry content, because a listing
is not a piece of writing. But "carries content" was standing in for "can be found
by a stranger who typed the query", and a newsletter carries content and cannot be
found. An issue sent to a list does not rank; nobody will ever reach it from a
results page. Dealing it a query produces a plan row instructing the business to
write a brief for a keyword against a channel with no results page behind it - the
same defect as a keyword dealt to a directory, arriving through the opposite door
because the channel *does* publish.

The cost is not only the wasted row. Queries are dealt from one ordered queue, so a
push channel high in the fit order consumes the query a rankable channel below it
would have received. The more a plan likes the newsletter, the better the query it
wastes.

**Deal a query only to a kind a stranger can arrive on.** Where a push channel
publishes a web archive that genuinely ranks, that archive is a content channel in
its own right and gets the query; the send does not.

## Push meters itself against its own past

Every other kind's cost of overuse is the reader's patience. A conversational
channel's cap exists because communities police promotion, and the plan says so.
Push has a second cost that no other kind has: **the act of sending changes what
the next send is allowed to do**, and the decision is taken by a machine reading
how the last one was received.

That makes the cadence number a different kind of number here. On a conversational
channel the cap is a ceiling the business chose, a convention it may set anywhere in
a wide band. On a push channel the ceiling is discovered: send more than the list
will engage with and complaints rise, the intermediary's reputation score falls, and
delivery degrades for *every* future message including the ones that would have
converted. The dominant mailbox provider publishes the shape of this plainly - it
asks bulk senders to keep reported spam rates under 0.30% and recommends under
0.10%, states that frequent spam reports make future messages more likely to be
marked as spam, and defines a bulk sender as one exceeding five thousand messages a
day to its users. *Footing: vendor-documented thresholds from the provider's own
sender requirements, read 2026-09-16; the numbers are one provider's policy and move,
the mechanism - recipient reaction feeding back into future placement - is the part
that is stable.*

So the honest cap on a push channel is read from a measurement, not chosen: the
complaint and unsubscribe rate the last sends produced. A business that has never
sent has no such measurement, and **absent is absent** - the plan shows no cap
rather than a default dressed as one, and the first action on a push channel is to
obtain the signal, not to pick a number. A convention may stand in only while it is
labelled as the placeholder it is.

## Decision rules

- When a channel is won by publishing but cannot be found by a stranger, it is
  push, not content. The test is a results page, not an editorial calendar.
- When a push channel sits high in the fit order, check what query it would have
  taken before congratulating the plan on ranking it there.
- When no engagement measurement exists for a push channel, show no cap and make
  obtaining the measurement the first action; a seeded number here is a prediction
  wearing an observation's clothes.
- When a push channel also publishes a rankable archive, split it: the archive is a
  content channel, the send is a push channel, and only the archive is dealt a query.
- When a business has one list and one blog, the list is still the cheaper channel to
  *reach* with and the more expensive one to *waste*, because a wasted blog post
  costs its own production and a wasted send costs the deliverability of the next
  ten.

## When NOT to use

- Do not use this split on paid channels. A paid message's cadence is governed by
  spend gates and pacing; the permission it spends was bought, not granted.
- Do not read the split as "push is worse". It is routinely the highest-return
  channel a business owns, which is exactly why its ceiling is worth discovering
  rather than guessing.
- Do not grow a sixth kind for every messaging surface. A chat thread, a direct
  message and a mailing list are one kind here: the business reaches in, an
  intermediary meters it, and no stranger arrives from a query.
- Do not apply the deliverability half where no intermediary exists. A channel the
  business delivers on its own infrastructure to an audience that pulled it - a
  feed, an on-site inbox - is pull with a notification, and its ceiling is the
  reader's patience like everything else.
