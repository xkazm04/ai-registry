---
layer: technique
type: technique
subject: bounded-enumeration
technique: required-limit-breaks-unaware-clients
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [introducing a page limit onto an endpoint that existing clients call without one, deciding whether a limit-less request fails or is clamped, defining what zero or a negative limit means, a client must iterate a collection without knowing the ceiling]
---

# A required limit breaks unaware clients

A limit lands on a list endpoint that already has callers, and every one of
those callers was written when the list returned everything. The moment the
limit exists, each of them is making a request whose meaning has changed,
and the design question is not whether to bound them but *which way they
fail*: loudly, because the limit is now required and their request lacks
one, or quietly, because their limit-less request is clamped to the default
and they receive a truncated listing they believe is complete. Both are
choices. Only one is visible.

## The two postures

**Required.** The limit is a mandatory parameter. A request without one is
refused with an error that names the parameter. Every unaware client breaks
on its first call after the deploy, at the door, with a message, and the
operator hears about it within the hour. This is the posture
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) prefers:
the guard engages on every request, and its absence in the client is a
refusal rather than a silent downgrade.

**Clamped.** A request without a limit receives the default page. The
unaware client keeps working, receives up to the default number of keys,
and has no way to learn that more existed unless it inspects the count
against the page size — which it does not, because it was written when
there was no page size. Nothing is loud. The client's reconciliation
(delete what the listing does not mention) runs against a prefix of the
collection, and the failure is the same one declare-the-inconsistency
names, arriving through a different door.

The naive reading is that clamping is the compatible choice. It is the
choice that keeps the old clients *running*; it does not keep them
*correct*, and a client that runs incorrectly is harder to find than one
that stops. The rule: **the posture is chosen per path by the operator,
not per client by the developer**, because the operator knows which
paths have legacy callers and which of those callers would rather stop than
truncate. A policy language that lets the operator mark a path's limit as
required is what turns the choice into configuration; the default of that
setting is a separate decision, and the argument above says which way it
should lean where the collection can be large.

## Zero, negative, and absent are three different things

The limit parameter has three non-positive states, and collapsing any two
of them is a bug that ships as a feature. **Absent** means the client did
not say, and resolves to the posture above — refusal or default. **Zero**
and **negative** are the values a client sends when it means "no limit",
and they mean that only where the policy for the path permits an unbounded
list. On a path whose policy states a ceiling, the two part ways, and the
split is worth stating exactly: a zero limit is read as "as many as I am
allowed" and is clamped to the ceiling, because zero states no number the
server would be contradicting; a negative limit is refused, because it is
not a number of items and a client that sends one has misread the
parameter; and an explicit number above the ceiling is refused rather than
clamped, because the client stated an intent the policy cannot honor and a
silent clamp would tell it that intent was met. Zero clamps, negative and
over-ceiling refuse. The failure to avoid
is the one [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
names: an absent parameter zero-filled by the deserializer, then read by a
handler for whom zero means unlimited, so that "the client said nothing"
becomes "the client asked for everything" at the boundary where an optional
integer met a non-optional one. Parse the parameter as optional; treat its
absence as absence; let zero mean unlimited only after the policy has been
consulted and has said the path may be unlimited at all.

## The `max` literal

A client that knows it should page but does not know its own ceiling — a
generic iterator, a command-line tool run under a policy it cannot read —
needs a way to ask for "as many as I am allowed" without guessing a number
and being refused for guessing too high. Give it a literal: a limit spelled
`max` resolves, on the server, to the smallest ceiling that applies to this
caller on this path, and the client iterates with `after` until a page comes
back empty. The literal turns the ceiling from a number the client must
know into a number the server substitutes, and it is what lets a
policy-governed limit tighten without a client release.

The literal has a cost the designer must name: it is a string in an
integer's position, and an endpoint that accepts a real value spelled
`max` in the same parameter now has two meanings for one token. Reserve
the literal in the parameter's vocabulary, refuse it where it collides, and
document the collision rather than resolving it silently. A reserved word
is a small price; a parameter with two parsers is not.

## Iterating to the end

With a required or clamped limit and a `max` literal, the client-side loop
is: request with `after` empty and `limit` `max`; append the page; if the
page is empty, stop; otherwise set `after` to the last key received and
repeat. Two variants are wrong. Stopping on "fewer than limit" is wrong when
the limit was clamped to a ceiling the client did not compute — the client
compares against the number it *sent*, which may be larger than the number
it *got*, and it stops early. Stopping on "empty page" is right for
unfiltered listings and needs one amendment for filtered ones, which
filter-after-return-under-limit supplies.

## Decision rules

When introducing a limit onto an endpoint with existing callers, decide per
path whether a limit-less request fails or is clamped, and let the operator
set it, because the operator knows which callers would rather stop than
silently truncate.

When the collection can be large and the callers reconcile against the
listing, make the limit required, because a truncated listing read as
complete is a data-loss bug with no error.

When parsing the limit, keep absent, zero and negative distinct, because a
zero-filled absence read as "unlimited" turns a client that said nothing
into a client that asked for everything.

When a client cannot know its ceiling, give it a `max` literal that the
server resolves to the applicable ceiling, and reserve the word, because a
client that guesses a number will be refused for guessing high.

When writing a client loop, terminate on an empty page and never on a short
one, because a clamped page is short by the server's number, not the
client's.
