---
layer: golden-path
type: golden-path
subject: telemetry-pii-redaction
status: forged
use_when: [wiring a hosted error tracker into a product that holds user data, deciding what a crash report may carry off the machine, auditing what an outbound telemetry payload actually contains, reviewing a new capture site before it ships]
techniques:
  - emit-site-inventory
  - denylist-plus-pattern-pass
  - correlation-preserving-redaction
  - redact-at-the-cap
  - hook-coverage-gaps
  - redaction-invariants-as-tests
  - exclusion-bounds-reads-not-output
---

# Telemetry PII redaction

Every other privacy control in a product operates on data the product still
holds. This one operates on data that is about to stop being held by the
product at all. When a record crosses into a hosted error-tracking service or
an outside analytics sink, it has changed custodian: deleting it is no longer
an operation, it is a **request**, filed against someone else's roadmap and
honoured — if it is honoured — across copies nobody can enumerate. The
ingestion pipeline took one. The search index took one. The alert mail quoted
the message into an inbox. Somebody pasted the payload into a ticket. There
is exactly one moment at which a team holds unilateral authority over that
record, and it is the instant before the transport serialises it. That moment
is this subject.

The stance follows from the asymmetry. A subsystem whose mistakes are
recoverable can be tuned; a subsystem whose mistakes are permanent is
designed inverted — its caps fail toward destroying data rather than
forwarding it, its coverage question is "what did I fail to reach" rather
than "what did I reach", and its tests assert on what actually left rather
than on what the code intended to send. Redaction that runs anywhere later
than the emit boundary is not redaction; it is a promise about copies, and
copies honour nothing.

## The vendor switch is not the control

Nearly every client library ships one option, usually spelled as some
variant of *do not send default personal information*, and a great many
teams flip it off, note it in a review, and consider the matter handled.
Understand precisely what that switch governs: only the things the library
**infers on its own** — the network address it can see on the connection,
the cookie header it can read, the authenticated username it can pull out of
a session it recognises. It governs nothing you handed it. The message your
code composed by interpolating a row into a sentence, the object you attached
as context, the crumb your own logger dropped on the way past, the exception
a data-access layer raised with the failing record embedded in its text —
all of that is caller-supplied, and the switch never looks at it.

So the switch is worth setting, and setting it narrows the surface by
perhaps a tenth while moving the team's attention off the other nine. The
naive reading is not that the switch is useless; it is that the switch is
*sufficient*. It is not, and the gap between what it covers and what the
transport actually carries is the entire working area below.

## The inventory is the deliverable

A developer picturing an outbound error pictures a sentence. What the
transport carries is a tree, and the sentence is one node of it: the
message; the exception type and its value; each stack frame, and in several
runtimes the **local variables captured at each frame**; the structured
contexts block; the free-form extras bag; the tags; the user object; the
request, meaning its method, its full address including query and any
credentials embedded in the authority portion, its headers and its body; and
a trail of breadcrumbs, each with a payload of its own, most of them written
by a logger that nobody wrote with this boundary in mind.

Redaction that covers the message and stops has covered the field *least*
likely to hold an identifier, because a developer composing a message is at
least thinking in words. The data-access layer serialising a failed write is
not thinking at all. This is why the first deliverable of the subject is not
code but an enumeration: every field the transport can carry, written down,
each one marked as scrubbed, dropped, or knowingly passed. What you did not
list is what leaks, and an inventory is the only artifact that makes the
omission visible before an incident does. Building it, keeping it honest
against a transport that adds fields between releases, and deciding what
"knowingly passed" is allowed to mean are
[emit-site-inventory](./techniques/emit-site-inventory.md).

## A key name does not predict a value's sensitivity

The obvious control is a set of field names that get dropped wherever they
appear at any depth — the ones whose name announces them, and the domain
identifiers that join a record to a person. Keep it; it is cheap, it is
exact, and it survives refactors that a pattern never would. But it is
half the control, because the fields that leak worst are the ones whose
names are innocent: a note, a description, a title, a search query, a
free-text field the user filled in with their own address because a form
asked them how to be reached. The key says nothing. The value says
everything.

So the second pass runs over **values**, not keys: patterns for the shapes
that identify a person regardless of where they sit — address-shaped
strings, long digit runs in the formats that carry account and card numbers,
token-shaped strings, and the authority portion of a location that so often
carries a user name and password in front of the host. One of those
patterns keys on the shape of the *sentence* rather than the shape of the
value — whatever the message put in quotes — because interpolating a
user-chosen name into error prose is how names travel, and a name is only
ever ordinary words. Two passes, always,
and each covers the other's blind spot: the keyed pass catches identifiers
whose format is unremarkable, the pattern pass catches identifiers in fields
nobody thought to name. Neither alone is a boundary. Composing them,
ordering them, and knowing which one is load-bearing for a given field are
[denylist-plus-pattern-pass](./techniques/denylist-plus-pattern-pass.md).

## Destroy the value, keep the join

The reflex on first contact is to replace everything sensitive with one
constant marker. That makes the record safe and useless in the same stroke.
Two reports from one person's afternoon now look exactly like two reports
from two strangers, and the first question triage asks — *is this one
account or everybody?* — has become unanswerable, which is how a redactor
earns a reputation for being the thing that broke debugging and gets
loosened in the next incident.

The mature move keeps the join and destroys the value: replace the
identifier with a short, stable derivative — enough to tell two subjects
apart across records and sessions, never enough to name either. Two facts a
practitioner holds about this. First, the derivative is still personal data
under the regimes that care; the technique lowers risk and preserves
usefulness, it does not move the record out of scope, and a team that
believes otherwise has bought a compliance argument it cannot make. Second,
a bare digest of a **low-entropy** identifier is a dictionary lookup away
from the original — the set of plausible mail addresses is small enough to
enumerate — so the derivation is keyed with a secret that never leaves the
process, and the key's rotation is a deliberate act with a stated cost,
because rotating it severs every join drawn before it. The shape of the
derivative, its length, its collision budget and its key discipline are
[correlation-preserving-redaction](./techniques/correlation-preserving-redaction.md).

## At the cap, drop

Every real redactor carries limits — recursion depth, sibling breadth, total
serialised size — because it runs on the failure path, where objects are
cyclic, enormous and shaped by whatever went wrong. The limits are not
optional. What happens **at** the limit is the single decision that
separates a privacy boundary from a formatter.

A pretty-printer that hits its depth cap prints an ellipsis and lets the
rest through, and that is correct for a pretty-printer, whose worst failure
is an ugly page. A redactor that hits its depth cap and lets the subtree
through has emitted the one region it did not inspect — and objects nest
deepest exactly where they are richest, so the untraversed subtree is
selected, by construction, for being the most likely to hold something. The
rule is unconditional: **at the cap, drop.** Replace the subtree with a
marker that says a limit was reached; never forward it. The same direction
governs the redactor's own failures — if the scrubber throws, the event does
not go out raw; it goes out gutted, or it does not go out. Choosing the
caps, marking the drops so an investigator can tell truncation from absence,
and the ordering rule that puts the cap check before any passthrough are
[redact-at-the-cap](./techniques/redact-at-the-cap.md).

## The global hook has holes, and they belong where the hook is installed

Transports offer one outbound callback, the team installs the redactor
there, and everyone believes coverage is total. It is not, and the reasons
are structural rather than careless. The callback receives an already
assembled record, so it can only rewrite what its walker knows to walk —
and a walker written for objects routinely steps straight past the message
and the exception value, which are strings, and past the frame variables,
which sit inside an array of frames rather than in the contexts block.
Sibling channels leave by their own path: route and transaction names,
metric attributes, session recordings, performance payloads. And in most
implementations a callback that throws is treated as consent to send the
original. Where a channel cannot be reached by a field walker even in
principle — a session recording is a picture of a screen, and the screen
had the data on it — the answer is not a cleverer scrubber but the sample
rate set to zero in the shared configuration, which is the one form of
coverage that cannot regress.

Two consequences. The hook is the floor, not the ceiling: a call site that
routinely hands over a caller-supplied payload gets an explicit scrubbing
wrapper of its own, and that wrapper — not the hook — is what the house rule
binds new capture sites to. And because the next contributor will widen the
surface without reading this document, **the gaps are written down at the
installation site**, in prose, naming what the hook does not reach. An
undocumented gap in a privacy boundary is a gap that gets rediscovered by an
incident. Enumerating them, choosing between wrapper and hook, and keeping
one shared configuration so no runtime can initialise unscrubbed are
[hook-coverage-gaps](./techniques/hook-coverage-gaps.md).

## A redactor rots in two directions

It can become a no-op — a refactor renames the field the denylist matched, a
pattern is narrowed to fix a false positive, a wrapper stops being called —
and nothing anywhere goes red, because a redactor's success and its total
absence produce the same green build and the same shipped feature. And it
can become a shredder — a pattern widened after a scare now eats identifiers
the team needs, stack traces arrive with every frame replaced by a marker,
and nobody files a defect that reads *our crash reports are too safe*; they
simply stop opening them.

So the invariants are pinned from both sides, and they are asserted on the
**serialised** form, not on the returned object: serialisation is what
travels, and an assertion against an in-memory result passes happily while
the transport reads a raw copy from somewhere else. Plant a secret in every
field of the inventory, serialise the redacted record, and assert the
secret's literal absence from the whole string. Then the mirror case: an
ordinary clean record survives byte-for-byte. Without that second case the
cheapest way to satisfy the suite is to redact everything, and the suite
becomes a ratchet toward uselessness. The planting method, the absence
assertion, the clean-survival case and the regression case for each cap are
[redaction-invariants-as-tests](./techniques/redaction-invariants-as-tests.md).

## When the payload is composed, there is nothing to scrub

Everything above assumes the sensitive value **passes through** — it exists as
a value in a field, which is what a keyed drop, a pattern pass, a cap and an
absence assertion all need. When the outbound artifact is *composed* rather
than copied — a generated report, a written summary, a synthesized description
of a system — the assumption fails completely, and every control above becomes
inapplicable rather than merely weaker: the fact was reconstructed from other
material, so no string ever entered the pipeline for a scrubber to match.

The reflex is an exclusion list naming what the generator may not read, and it
is worth having, but it bounds *reads* and not output — a fact withheld at the
read boundary stays derivable from the material that remained, through the
tests that exercise it, the configuration that names it and the history that
references it. So the two guarantees are written down separately, because a
reader supplies the stronger one from context: *this material was not read* is
what an exclusion delivers; *this material is not described* is a different
claim needing a control at the publish boundary, where the artifact exists and
can be judged. That check is a classifier or a reviewer rather than a pattern,
which makes it a sampling control with a false-negative rate — reported as
coverage, never as a clean bill — and makes the read-side exclusion its
partner rather than its alternative, since it is what shrinks the population
the expensive judgement has to cover.
[exclusion-bounds-reads-not-output](./techniques/exclusion-bounds-reads-not-output.md).

## Where this subject stops, and the neighbours start

Three subjects border this one and all four talk about scrubbing, so the
seam has to be stated rather than assumed.
[observability-telemetry](../../backend-platform/platform-observability/observability-telemetry/observability-telemetry.md)
owns the recording subsystem: the sink a record lands in, the crash store
that outlives the process, the rotation policy and its reaper, the economics
of a metered remote channel. Its privacy rule — scrub before the first write
— is the same instinct as this one, applied to a store the team controls.
This subject owns the narrower and harsher moment one step further out: the
record is assembled, the process is about to hand it to a service somebody
else operates, and after that instant the team's remaining control is a
support request. The rule for picking: if the record is going somewhere you
can delete from, that is the neighbour; if it is going somewhere you can
only *ask*, it is here.

[data-retention](../../operations/governance-and-records/data-retention/data-retention.md)
owns the lifecycle of data you keep — per-tenant horizons, the scheduled
purge, and compelled erasure of a named subject across an inventory of
stores. That inventory carries a line reading *anything a third party holds
on the system's behalf*, and this subject exists to keep that line short:
what was never emitted needs no erasure, and every identifier destroyed at
the boundary is one fewer external store to chase under a regulator's
deadline. Retention answers *when does this go*; redaction answers *does it
ever arrive*.

[audit-logging](../../operations/governance-and-records/audit-logging/audit-logging.md)
is the sharpest line, because its
[write-path-sanitization](../../operations/governance-and-records/audit-logging/techniques/write-path-sanitization.md)
technique reads almost word for word like this subject: scrub at one door,
allowlist where the shape is known, pattern-scrub where it is not, fail
closed. The difference is **custody**, and custody changes what the
discipline is for. An audit trail is an internal, append-only store the team
owns; a leak into it is serious because the ledger is durable and retained,
but the rows are yours and a remedy, however unpleasant, exists. A hosted
sink is not yours. You cannot delete what you already sent. That is why this
subject's caps fail toward redaction where a sanitizer's may reasonably
truncate and pass, why its coverage question is *what does the hook fail to
reach* rather than *who bypassed the door*, and why its assertions are made
against the serialised payload rather than the stored row. When the mistake
is still fixable afterwards, read the neighbour. When it is not, read this.

## What healthy looks like

A healthy instance of this subject can answer four questions without
reading the transport's source. *What can leave?* — the inventory, current,
naming every field and its disposition. *What happens to an identifier?* —
destroyed, but joinable, by a keyed derivative whose key never leaves the
process. *What happens when the redactor runs out of room or crashes?* — the
untraversed part is dropped and marked, in every case, with no path that
forwards uninspected data. *How do we know it still works?* — a suite that
plants secrets in every inventoried field and asserts their absence from the
serialised payload, plus a case proving clean records survive. An instance
that cannot answer one of those has its gap exactly where the next
disclosure will come from, and unlike most gaps in a product, this one is
not repairable after the fact.

## The techniques

- [emit-site-inventory](./techniques/emit-site-inventory.md) — enumerate
  every field the transport can carry, mark each scrubbed, dropped or
  knowingly passed, and keep the list honest across releases.
- [denylist-plus-pattern-pass](./techniques/denylist-plus-pattern-pass.md) —
  keyed field drops at any depth *and* pattern rewriting over free text,
  because a key name does not predict a value's sensitivity.
- [correlation-preserving-redaction](./techniques/correlation-preserving-redaction.md)
  — a short keyed derivative that keeps records joinable while destroying
  the identifier, and the key discipline that makes it defensible.
- [redact-at-the-cap](./techniques/redact-at-the-cap.md) — depth, breadth
  and size limits that drop the untraversed subtree rather than forwarding
  it, and mark the drop so truncation reads differently from absence.
- [hook-coverage-gaps](./techniques/hook-coverage-gaps.md) — what a single
  outbound callback does not reach, the explicit wrapper for high-risk call
  sites, and writing the gaps down where the hook is installed.
- [redaction-invariants-as-tests](./techniques/redaction-invariants-as-tests.md)
  — absence assertions on the serialised output, a clean-survival case
  against over-redaction, and a regression case per cap.
- [exclusion-bounds-reads-not-output](./techniques/exclusion-bounds-reads-not-output.md)
  — why a composed payload defeats every scrubbing control, the two guarantees
  an exclusion list is read as making, and the publish-boundary judgement that
  has to replace the absence assertion.
