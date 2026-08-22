---
layer: technique
type: technique
subject: telemetry-pii-redaction
technique: correlation-preserving-redaction
status: forged
laws: [identity-survives-reuse]
shared_with: []
use_when: [triage needs to know whether a failure hits one account or many, redacting a route that contains a resource identifier, deciding between dropping an identifier and pseudonymising it]
---

# Correlation-preserving redaction

The first redactor a team writes replaces every identifier with the same
constant marker, and it is safe and useless in the same stroke. Two reports
from one person's afternoon become indistinguishable from two reports from
two strangers, and the first question triage asks — *is this one account or
everybody?* — stops having an answer. A redactor that costs the team its
answers gets loosened during the next incident, by someone under pressure,
at three in the morning. Designing for that not to happen is this
technique.

## Replace the identifier with a short keyed derivative

The move is to keep the **join** and destroy the **value**: run the
identifier through a one-way function keyed with a secret, take a short
prefix of the result, and emit that behind a tag that says what kind of
thing it stands for. The record now says *this failure and that failure
concern the same subject*, and says nothing about who the subject is. The
sink's operator holds a token that is stable, comparable, and not
resolvable to a person with anything they possess.

Four properties make the token worth having, and each is a design
decision rather than a default:

**Stable across processes, restarts and releases.** This is the entire
value, and it is why the key is configuration rather than something
generated at boot
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse): the
pseudonym is an identity, and an identity that changes on restart joins
nothing). A per-process salt is a legitimate *different* choice — it buys
within-session correlation only — but it must be a stated choice, because
a team that believes it has cross-session joins and does not will
misdiagnose a recurring failure as a one-off.

**Keyed, not bare.** A plain digest of a **low-entropy** identifier is a
dictionary lookup away from the original: the space of plausible mail
addresses is small enough to enumerate, and anyone holding the digests can
enumerate it. The key is what makes the derivation irreversible in
practice, and it must never leave the process that computes it — which
rules out computing the token anywhere downstream of the boundary.

**Short, with a stated collision budget.** Truncation is what keeps the
token readable and the record small, and it trades against collisions.
State the number rather than choosing a length by feel: at your record
volume, how many distinct subjects share a prefix? A collision merges two
subjects in triage, which is a wrong answer rather than a missing one, so
the budget belongs in the comment next to the truncation.

**Tagged by kind.** A bare eight characters in a field tells a reader
nothing. A short type tag in front tells them it is a pseudonym, of what,
and that asking for the original is not going to work.

## Rotation severs every join drawn before it

The key is a live dependency of every historical record. Rotating it makes
yesterday's tokens and today's tokens incomparable, silently — nothing
errors, the records simply stop matching. So rotation is a deliberate act
with a stated cost and a stated horizon, not a hygiene task borrowed from
credential rotation, where rotating early is always correct. Where the
regime demands periodic rotation, the honest design states the correlation
window it produces: *joins are valid within a quarter, and not across
one.*

## Pseudonymise keys; drop content

The distinction that keeps this technique from being over-applied:

- An **identifier** — an account key, a subject key, a session key, a
  device key — has join value and no content value. Pseudonymise it.
- **Content** — a note, a message body, a search string, a name — has
  content value and no join value. Drop it, or pattern-scrub it. Producing
  a token for a free-text note preserves nothing anyone will use and
  spends the collision budget on noise.

And never confuse **masking** with pseudonymisation. A prefix of a mail
address is the mail address for most identification purposes; a masked
middle is a partial disclosure that also trains readers to expect
identifying material on telemetry surfaces. The derivative replaces the
value entirely or it is not this technique.

## Routes are the everyday case

The highest-frequency application is not the user object — it is the path.
A resource-shaped product emits routes with the identifier embedded, once
per view, into a field the transport treats as a grouping key. Collapsing
the identifier-shaped segments before emitting does two jobs at once: the
identifier stops travelling, and a thousand distinct paths collapse into
one row that triage can rank. Collapse by **segment shape** — a segment
that looks like a generated key becomes a type marker — and then run the
whole collapsed path through the ordinary scrub, because the segment rule
is a heuristic and the pass behind it is not.

## What this does not buy you

The claim a team may make afterwards is precise, and stating it wrongly is
its own liability. A pseudonymised record is **still personal data** under
the regimes that matter — the derivative is a risk-reduction measure and a
recognised one, not an exit from scope. What you may say is that the sink
cannot resolve the subject with what it holds. What you may not say is that
you sent nothing personal.

One more boundary case, because teams get it backwards: an identifier that
is already opaque — a generated key that means nothing outside your
database — is still a join key into a store that holds the person, and the
question is whether the sink's operator could ever come to hold that store.
Opacity is not anonymity; it is the absence of a shortcut.

## When not to reach for this

Skip it where there is no join to preserve: a one-shot metric, a
counter, an event that is aggregated on arrival and never looked at
individually. There, drop the identifier and spend nothing. And skip it
where the record already carries a legitimate correlation handle of its own
— a trace or session key minted for that purpose, which is not derived
from a person and needs no derivation.
