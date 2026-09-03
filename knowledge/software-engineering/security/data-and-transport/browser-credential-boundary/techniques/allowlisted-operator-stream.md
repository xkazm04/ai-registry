---
layer: technique
type: technique
subject: browser-credential-boundary
technique: allowlisted-operator-stream
status: forged
laws: [absent-guard-is-loud, gate-sees-target, creation-names-reaper]
shared_with: []
use_when: [a debug or log surface renders requests that carried a credential, deciding whether redaction fails open or closed when a field is added, an operator surface is protected only when a token happens to be configured]
---

# The allowlisted operator stream

A process that attaches other parties' credentials to outbound calls grows an
operator surface: a live request stream, a local inspector, a page showing what
the last call actually sent. It grows because the alternative is worse —
diagnosing a brokered call without one means attaching a debugger to a process
whose memory is full of live secrets, or raising log verbosity on a running box
until the answer appears in a file nobody rotates. The surface is worth having.

It is also a second door onto exactly what the first door exists to protect, and
it is normally built by whoever was debugging that week. Two rules turn it back
into a boundary. The first governs what the stream may carry, and it is
unusual because **this payload is one you construct yourself**. The second
governs who may attach, and it is unusual because the only version of it that
holds is one the process refuses to start without.

## You assembled the record, so what survives is an allowlist

Redaction discipline is normally written for records you did not build — a
framework's error object, a third-party response, a user's free text — and there
the tool is a keyed denylist plus a pattern sweep over what survives it. That
tool is a safety net for material whose shape you do not control. Here you do
control it: the record is assembled out of your own request context by code you
wrote, in one function, at one moment. Under those conditions the denylist is
strictly the weaker instrument, and its own authors say so
([denylist-plus-pattern-pass](../../telemetry-pii-redaction/techniques/denylist-plus-pattern-pass.md)).

So: **name the keys that survive; replace the value of every other key.** A short
list — half a dozen entries, each of which an operator can say what they use it
for — is reviewable. The property that matters is what happens to a key nobody
anticipated: the credential field that next quarter's integration adds, under a
name nobody in this file has heard, is redacted by default rather than published
by default. A denylist inverts that, and the first person to learn about the
inversion is whoever is watching the stream when it happens.

Keep the list short on purpose. A surviving-key list that grows past what a
reviewer can hold is a denylist wearing the other one's clothes: nobody audits
it, additions are approved because the field "isn't sensitive", and the guarantee
degrades to the judgment of each contributor at the moment they were in a hurry.
When the list wants to grow, the honest question is whether the stream needs a
new *view* rather than a new field.

**Headers are a category, not a list.** Every header value is replaced,
unconditionally, without anyone enumerating which are safe. Header names are not
yours: intermediaries, runtimes, client libraries and the next protocol revision
all add them, and the one that carries authorization is spelled differently by
every party that has ever proxied a request. There is no version of this list
worth maintaining, and the surface loses nothing an operator needed.

## Replace the value, keep the key

The redaction marker sits at the original key. This is not cosmetic. Half of
what an operator reads a request stream for is *shape* — which fields were
present, which were absent, whether the credential was attached at all, whether
an override arrived that nobody expected — and dropping redacted keys entirely
destroys exactly that signal while protecting nothing extra. A stream that
cannot answer "was a credential attached on this call" is a stream operators
work around, and the workaround is always a temporary un-redacted build that
becomes permanent.

The same reasoning bounds volume rather than content: cap the free-form parts of
the record at a stated length and mark the truncation. An operator surface that
relays an unbounded body is a memory amplifier during the incident it exists
for.

## The sanitized region is the record, not one object inside it

The commonest way this technique is implemented and still fails: the allowlist
is applied to one nested object — the one that visibly held the credential —
while the envelope around it is passed through whole. Everything outside the
sanitized region is published, including the fields a later refactor moves out
of it.

State the region as the record, apply the pass at the point of emission, and let
the gate observe the emitted bytes rather than the intent of the function
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A test that asserts the
sanitizer redacts a credential-shaped object is a green check over a proxy if
the emitter serializes a different object than the one the test built. Assert on
what a subscriber actually receives, with a credential planted somewhere nobody
thought of.

## The gate is a boot condition, not a flag

An operator surface protected *when a token is configured* is unprotected in
every installation where nobody configured one, which after the first year is
most of them ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). A
warning at startup does not fix this: warnings are read once, by the person who
deployed it, at the moment they are busiest, and a fleet converges on defaults.

So the startup decision is a three-way choice and one of the three is *stop*:

1. The surface is **switched off** — an explicit mode the operator chose, in
   which the routes are never mounted at all. This is the correct answer for
   most production deployments and must be reachable without inventing a
   credential nobody will use.
2. The surface is **on and its credential is configured** — the value is present
   and usable.
3. Neither — **the process does not start**, and the failure names both remedies
   in one sentence: set the credential, or start with the surface off. A refusal
   that does not say how to satisfy it gets satisfied by deleting the check.

Two details decide whether this is real. **The check runs at start, not at first
request.** A guard that raises inside the handler leaves the process up, the
port open, and the readiness signal green; the misconfiguration is then
discovered by whoever calls the route first, which on a surface nobody visits is
either nobody or the wrong person. And **the check reads the value, not the
presence of the setting**. A configuration key present and empty satisfies every
"is it configured" test ever written and authenticates no one; the boot check
asks whether what it holds could actually gate a session.

"Development only" is not a third state. A surface whose protection depends on
an environment being labelled correctly is protected until the first deployment
that inherits the wrong label — and self-hosted installations sit on boxes
reachable from more places than their author pictured.

## The session the gate mints

Once an operator authenticates, the process holds sessions, and they are
credentials of their own with a narrower job. Two properties keep them from
becoming the leak the token gate prevented: they live **in the process**, so a
restart invalidates every one of them — an operator surface has no business
outliving the process it observes — and the store that holds them is **bounded
at creation** ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).
Expiry that is only enforced when the holder returns is not expiry; it is a map
that grows one entry per login and is emptied by coincidence. Sweep on a clock
or cap the count, and prefer a short lifetime: an operator surface is used in
bursts, during incidents, by someone already at a keyboard.

## Where this ends and its neighbours begin

**[opaque-upstream-errors](./opaque-upstream-errors.md) governs the other
audience.** The two techniques point in opposite directions from the same
process, and confusing them produces the wrong default twice. Toward the
*caller*, the rule is a closed vocabulary and nothing about the upstream —
detail is the leak. Toward the *operator*, detail is the product: they are
supposed to see which upstream refused, with what status, after how long. What
the operator must not receive is the credential, and that is the only thing this
technique withholds. The two meet at one line — the norm that a log entry is
written as though a screenshot of it ends up in a ticket. That norm is a
discipline held by every contributor; this is the mechanism that holds when the
discipline lapses.

**A record you did not build belongs to the redaction subject.** Crash reports,
third-party payloads, user-typed text and anything reaching a shared telemetry
sink need the keyed-drop-plus-pattern treatment, because their shape is not
yours to enumerate and the identifiers inside them match no key you own. The
rule for picking is one question with a factual answer: *did this process
construct the object being emitted?* If yes, allowlist, and a pattern pass is
redundant. If no, or if the object is a mixture, the two passes are the floor
and this technique's list is not available to you.

## When not to reach for this

**When the surface should not exist.** The first question is always whether the
diagnosis it enables can be had from records that never carried a credential.
Building a stream in order to sanitize it is the expensive order of operations.

**When the content must not reach the operator either.** Some payloads are held
under an obligation that the operator is not party to. Redacting the credential
out of them answers a different question; the answer there is not emitting the
body at all, and the technique's allowlist quietly implies you may see whatever
survives it.

**When the transport already proves the operator.** A stream reachable only from
the host, over a channel that host access alone can open, already has its gate,
and adding a token gives the same fact two authorities that will disagree during
an incident. Keep one — but be certain the transport is what you think it is
before you rely on it, because "only reachable locally" is the assumption most
often falsified by the deployment topology that arrived later.
