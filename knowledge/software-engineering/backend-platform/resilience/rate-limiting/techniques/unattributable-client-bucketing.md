---
layer: technique
type: technique
subject: rate-limiting
technique: unattributable-client-bucketing
status: forged
laws:
  - count-carries-predicate
  - identity-survives-reuse
shared_with: []
use_when: [no trusted identity source for a request, a shared unknown bucket locking out ordinary traffic, deciding whether a client fingerprint may be reused elsewhere]
---

# Unattributable client bucketing

Some requests reach the limiter with nothing worth keying on: the trust ladder
ran out (see untrusted-key-derivation) and every remaining field is the caller's
to choose. Key design already settles the *policy* for that case along one axis,
the window's horizon — pool and refuse where the window is seconds, treat the
caller as unenforceable where the window is a month. This technique is the other
axis: **what you key on when the policy is still "limit them"**. It exists
because the obvious answer to that question is the one that does the most damage,
and it does the damage to the people who did nothing.

## One shared bucket is a denial of service you build yourself

The obvious key for "no identity" is a constant — one sentinel, one bucket, one
allowance, every unattributable caller inside it. It is the right answer in
exactly one situation: when unattributable traffic is rare and hostile. That is
not the usual situation. Carrier-scale address translation, a whole office
behind one egress, privacy relays, uptime probes, embedded clients that declare
nothing, callers who simply have not authenticated yet — all of them arrive
unattributable, and all of them are ordinary. Their *combined* honest cadence
exhausts an allowance sized for one caller, and from that moment every member of
the class is refused. The control installed to prevent a denial of service
delivers one, on a schedule, to the population least equipped to understand it,
and delivers it as the product simply not working.

The second-order failure is worse than the first. What the operator sees is a
refusal spike on the unknown bucket, which is indistinguishable from what an
attack looks like, so the natural response — lower the number, tighten the
window — deepens the lockout it was meant to answer. And the shared bucket is
itself an amplifier: one caller who empties it has locked out the whole class
for the rest of the window at a cost of a handful of requests, which is the
cheapest denial of service the system offers. Where pooling is nonetheless
correct, it is chosen knowing all three of these, and its exhaustion is watched
as a signal rather than discovered as an outage.

## Spread, then cap

The fix is to stop treating an absent identity as one identity. Derive a
**coarse fingerprint**: a hash over whatever the request does carry that varies
between clients and holds still across one client's requests — the declared
agent, the declared language and encoding preferences, the shape of the
negotiation — together with the forwarded values the ladder just declined to
trust. Those declined values are the sharp part of the recipe. A field that
failed a trust test is not worthless; it is merely not *evidence*. As variation
it is perfectly good, and demoting a rejected field to entropy costs nothing and
pulls real clients apart.

Two properties make the result usable rather than merely clever. It is **fixed
width**, because it becomes a key in a map the outside world can grow, and a
truncated digest bounds what one entry costs. And it is **salted per
deployment**, so a bucket identifier is neither guessable by the caller nor
portable between environments — a fingerprint that means the same thing in two
places is one someone will eventually join on.

The fingerprint does not resist an adversary and is not built to. A caller who
varies one declared field gets a fresh bucket, exactly as they would by varying
a field the ladder rejected. So the spread layer is never the whole answer: it
belongs underneath a coarse aggregate ceiling — a limit on the unattributable
class as a whole, or on the resource itself — which is the layer that actually
bounds a rotating caller (the layering rule is limiter topology's, where the
fine layer buys fairness and the coarse layer buys protection). Spread without a
ceiling is bypassable per request; a pool without a spread is the self-inflicted
outage above. The pair is the technique, and a design that ships only half of it
has chosen which of the two failures it prefers without saying so.

One honest floor: when a request carries no varying field at all, there is
nothing to spread, and the answer is the pooled sentinel, named as such. Hashing
an empty input produces a single constant that *looks* like a derived bucket. It
is the pooled bucket wearing a disguise, and every downstream that trusts the
shape — the distinct-bucket count most of all — will read it as a client.

## Entropy, not identity, and it says so where it is made

The fingerprint's danger is not that it is weak. It is that it is stable enough
to look strong. A fixed-width opaque token, present on every request, identical
across one client's requests within a window: everything about its shape says
identifier, and nothing about its shape says the caller chose the inputs.

So the discipline that makes this technique safe is not cryptographic. It is a
label, and the label goes **at the derivation site**: this value is entropy, it
is trivially spoofable, it exists to spread buckets, and it is never an input to
a trust decision. Not in a design document, not in a commit message — on the
line that produces the value, because that is where the next reader is standing
at the moment the value starts looking useful for something else. The reuses it
prevents are all plausible and all wrong: a block list, an audit trail, an abuse
score, a count of unique visitors, an answer to "who did this". Each of them
converts a value the caller controls into a claim about a person.

The counting case is the one that escapes quietly (law:
count-carries-predicate). A count of distinct fingerprints has the predicate
"distinct values of a tuple the caller chose, within one window, under one
salt", and that predicate cannot support the sentence "unique visitors" — the
number is inflated by every client that varies a declared field and deflated by
every pair of clients that declare the same things. Once it travels into a
dashboard, nobody re-asks what was counted.

The value also fails the identity test outright, and on purpose (law:
identity-survives-reuse). It changes when the caller edits one field, changes
when the salt rotates, changes when a client updates, and collides between two
clients that happen to declare identically. Identity must survive reuse and
restart; this is engineered not to, which is exactly why it is safe to spread
with and unsafe to remember. Give it the lifetime of the window it buckets:
do not persist it, do not carry it into a calendar-horizon quota, do not return
it to the caller, and do not let it into any decision whose mistake costs more
than one caller waiting a minute.

## What to watch

Unattributable admissions and refusals count on their own series, separate from
identified traffic, because "our anonymous class is saturated" and "the product
is down" are otherwise the same graph. The specific health signal is the count
of distinct fingerprints in a window, read against the class's request volume: a
collapse toward one means the spread stopped spreading — a client population
that stopped declaring, a normalization step that flattened the inputs, a
refactor that dropped a component — and the self-inflicted outage is back
without anything having been declared broken. A jump toward one fingerprint per
request means somebody is rotating, which is the ceiling's problem and not the
spread's, and is only visible as a problem because the two layers are counted
apart (see limit-observability).

## Decision rules

- **Never pool unattributable callers by default.** Pooling is a deliberate
  choice for short windows and a small hostile class, made with its blast radius
  written down. Everywhere else, spread.
- **Spread with what varies, including what you refused to trust.** A field that
  failed the trust test still works as entropy; discarding it throws away the
  only variation you have.
- **Always put a ceiling above the spread.** The fine layer is free to mint, so
  something coarse has to bound the class. Half the pair is a stated preference
  between two failures, not a design.
- **Say "no signal" rather than hashing nothing.** An empty fingerprint is the
  pooled bucket in disguise, and it corrupts the one metric that would have told
  you.
- **Label it at the site.** Entropy, spoofable, never a trust input — written
  where the value is produced, because that is the only place the next reader is
  guaranteed to be.
- **Give it the window's lifetime and no more.** Not persisted, not joined, not
  carried into a calendar-horizon quota, not shown to anyone.
- **Watch the distinct count, not only the refusals.** Refusals tell you the
  class is saturated; the distinct count tells you whether the spread is still
  working, which is the failure that arrives silently.
