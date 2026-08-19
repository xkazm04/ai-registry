---
layer: technique
type: technique
subject: accountability-publishing-ethics
technique: accountless-notification-privacy
status: forged
laws: [provenance-or-nothing, deterministic-code-owns-numbers]
shared_with: []
use_when: [building follow or alert features on a civic platform, subscription state must not identify readers, auditing what telemetry copies out of requests]
---

# Accountless notification privacy

The readers of an accountability platform are its second population of people
to protect. Which politicians a citizen follows is political data about the
citizen — for a journalist, a source-protection matter; for a civil servant,
a career risk; and the platform's subjects have every incentive to learn who
is watching them. The strong design is **accountless subscription**: no login,
no server-side follow store, no cookies — the reader's watch list lives in
their own browser storage, and leaves it only as parameters of the feed
address they poll. The address *is* the subscription: copyable, shareable,
revocable by deletion, and the server holds no table of who watches whom
because there is no "who".

But statelessness is not privacy by itself, and the technique exists because
of the gap.

## The fingerprint in the address

A list of twenty followed entities in a query string, arriving alongside an
IP address, is a fingerprint — even though every individual key is public.
Distinctive combinations identify; that is the whole lesson of
de-anonymization research, and it applies to your own logs first. The default
observability stack copies request URLs into events on its own: set a full
URL attribute and the tracing layer will also derive and attach the query
string you never explicitly set. With standard sampling, every poll of a
subscription feed lands the reader's complete watch list plus their IP at a
third-party telemetry vendor. Nobody decided to collect it; the default did.

The countermeasures:

1. **Scrub by parameter, not by path.** The rule that removes follow keys
   from telemetry matches the *parameter* wherever it appears, because the
   URL occurs in events in several shapes (absolute, relative, bare query)
   and a path-anchored rule silently misses one of them. Every parameter
   whose value parses as a valid entity key is deleted and replaced by a
   count: "this request carried 47 keys" is an operational fact that supports
   debugging without carrying identity.
2. **Test against real emitted events.** The scrub is verified by driving the
   actual telemetry client and asserting on the event it would send — not on
   a hand-built fixture — because the leak lives precisely in the fields the
   client adds by itself.
3. **Scope the claim honestly.** The scrub removes the watch list from
   telemetry; it is not request anonymization. IP handling and header policy
   are separate controls with their own configuration, and conflating them
   lets each assume the other covered the gap.
4. **Cap the list, tolerantly parse, strictly emit.** A bounded follow count
   keeps addresses finite; the codec that reads stored state discards only
   the broken item, never the whole list (a reader's subscription should
   survive a corrupted entry), and serializes only valid items in
   deterministic order so the same list always yields the same address.

## The notification layer never writes new prose

What the subscription *delivers* is governed by the publication discipline of
everything upstream: the delta shown for a followed entity is a **literal,
already-published record with its provenance** — a journal entry, a signed
review decision, a recomputation notice — filtered to the reader's keys.
The notification layer invents no sentence, no date, no amount; it filters
and counts. This matters because a summarizer here would be the one component
that rewrites vetted copy after the vetting — the exact bypass every framing
gate upstream exists to prevent.

The boundary discipline that follows: when delivery granularity is coarser
than visit granularity (records dated by day, visits timestamped), take the
inclusive boundary and **show a record twice rather than ever withhold one**,
and say so ("since the day of your last visit"). Duplication is a cosmetic
cost; a silently skipped record about a followed politician is a correctness
failure the reader can never detect.

## Decision rules

- **Any new egress path re-runs the fingerprint audit.** A share button, a
  server-rendered preview, a cache layer keyed by full URL, a new telemetry
  integration — each is a fresh chance for the address-borne list to persist
  somewhere. The question is always: where does this URL get copied, and by
  what default?
- **Aggregate counts may be kept; lists may not.** "N requests carried keys
  today" supports capacity planning. "These keys were requested together"
  reconstructs watch lists; if per-key popularity is ever wanted, it is a
  separate, deliberated feature with its own disclosure — never a byproduct
  of logs.
- **Say the trade out loud on the surface.** The list travels in the address
  by design — that is what makes the subscription portable — and the surface
  tells the reader exactly that, so sharing the address is an informed act.

## When not to use it

- Not when delivery genuinely requires a stored address (email or push
  notifications). Those are consent-based features with a stored contact and
  a stored list; the technique's contribution there is minimization — store
  the least, scrub telemetry the same way, and never join the subscription
  store with analytics.
- The literal-records rule is not an argument against digest *counting*
  ("3 new records for X") — counts computed deterministically from the
  records are fine; only newly generated sentences are not.
