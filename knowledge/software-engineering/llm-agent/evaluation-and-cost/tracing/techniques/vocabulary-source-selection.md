---
layer: technique
type: technique
subject: tracing
technique: vocabulary-source-selection
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when: [deciding whether span attributes follow a published cross-vendor convention or a house schema, instrumentation that must be readable by a backend you do not control, an external attribute vocabulary is still pre-stable, shipping instrumentation as a library rather than as part of an application]
---

# Vocabulary source selection

[span-model](./span-model.md) requires that the schema live in **one
authority**, and it is right. It does not say where that authority comes from,
and the omission hides a decision that is usually made by default: the schema is
invented in-house because that is what happens when nobody asks.

The alternative is that the authority is **external** — a published, versioned,
cross-vendor convention that names the same facts, which you adopt rather than
author. Both are legitimate. One authority is satisfied either way. What changes
is who can read your telemetry and what breaks when the vocabulary moves.

## The forces, stated on both sides

**What an external convention buys** is that the consumer stops being a party to
the decision. Instrumentation written against a shared vocabulary can be pointed
at a different backend without being rewritten, which converts a backend choice
from a migration into a configuration change, and it means dashboards, alerts
and queries written against those attribute names survive that change too. It
also buys interpretation for free: a facility that already knows the convention
renders your spans correctly without a mapping being written for you.

**What it costs** is control of the names. A pre-stable convention moves — a
field is renamed, a value is re-spelled, a category is removed in favour of a
different representation — and each move breaks something downstream at a time
chosen by the convention's maintainers rather than by you. A house schema moves
only when you move it.

**The discriminator is not which one is cleaner.** It is: *does one party
control both ends of the version skew?* If the same team ships the emitter and
runs the consumer, and pins both, the house schema costs nothing and the
external one imports someone else's release schedule. If either end is outside
your control — a backend a customer chooses, a consumer written by another team,
an emitter shipped as a library into applications you will never see — the
external vocabulary is doing real work, and its churn is a cost you are paying
in exchange for reach.

## The library case is the one that gets misfiled

An emitter shipped as a library is the case where the usual builder-side
reasoning fails, and it fails quietly.

The reasoning goes: on the builder side you know your own version, you pin it,
and defensive machinery for reading many generations of a vocabulary is
over-engineering. That is sound for an *application*, which controls its own
dependencies and its own backend.

A library controls neither. It wraps clients whose versions its author does not
choose, and it emits into backends its author will never see, so it sits between
two populations that both move independently. It therefore carries the same
multi-generation obligations a receiver carries — the ordered name table, the
retained legacy spellings, the migration notes — despite being an emitter. The
governing question is the skew, not the side of the wire.

The practical consequence is that a library which adopts an external vocabulary
must keep superseded spellings alive deliberately, and say so, rather than
tracking the convention's head and breaking every consumer that has not caught
up.

## Adopt the core, extend in your own namespace, and say which is which

Adoption is rarely total, because a convention's settled core is usually smaller
than what a system actually needs to record — and the parts it does not cover
are, predictably, the parts that are commercially specific and therefore the
parts vendors differ on.

So the workable posture is a split, made explicit:

- facts the convention names go under the convention's names, spelled its way,
  including when its spelling is worse than yours;
- facts it does not name go under a namespace you own, clearly not a
  convention name;
- **the boundary between the two is written down**, because it is the thing a
  reader needs and cannot infer.

The failure to avoid is minting an attribute in the convention's namespace for a
fact the convention has not standardized. It is the most tempting move — the
name reads as natural, and it will very likely be the name eventually chosen —
and it produces an attribute indistinguishable from a real one that collides the
day the convention lands its own version with different semantics. Squatting in
someone else's namespace is a vocabulary race with a future author who cannot
negotiate with you.

## Where a miss is a leak, depend on neither vocabulary

The skew discriminator decides between two vocabularies. It presumes the cost of
getting a name wrong is a broken query or an empty column — recoverable, visible,
annoying. There is a case it does not reach, and it inverts the whole question.

When the consequence of failing to recognise an attribute is that its **value**
escapes — a redaction pass, a scrubber, anything standing between a record and a
third party — then name-based matching is fail-open by construction. An
attribute the emitter added last week, or spelled differently this version, is
one the matcher has never heard of and therefore passes through untouched. That
is true whichever vocabulary you picked, so the choice between them does not
help: the house schema fails open on the convention's new names, and the
convention fails open on anything a wrapper added beside it.

The correct move there is to match on the **shape of the value** rather than on
the name of the field, and to walk every attribute rather than a list of known
ones. It is strictly more conservative — it will redact things it did not need
to — and that asymmetry is the point, because the failure directions are not
comparable: an over-redacted field costs a debugging session, and an
under-redacted one is disclosed and cannot be recalled.

So the rule has a precondition. Select a vocabulary source for attributes whose
*names* you must agree on with somebody. For any pass whose job is to catch
values, depend on no vocabulary at all, and treat an unrecognised attribute as
in-scope rather than out.

## An external vocabulary is a dependency, so pin it and test it

Once names are borrowed, they are inputs from a source you do not control, and
the ordinary discipline for that applies with one addition specific to strings.

Assert the literal wire spellings in your own tests — both **presence** and
**absence**. Presence: the attributes you emit have exactly the names the
convention gives them, checked against the convention's own published constants
where those exist rather than against a copy someone typed. Absence: no
superseded spelling appears anywhere outside the aliases you deliberately
retain.

The reason to assert absence as well is that renames fail silently in the worst
possible direction. An emitter that upgrades its convention dependency and
starts emitting a new name does not error; it writes a column no query reads,
and every dashboard built on the old name shows zero rather than an error. A
compiled or asserted check converts that into a build failure at upgrade time,
which is the only moment anyone is looking.

Note also that instability is frequently expressed in the **import path** and
not only in the names — pre-stable material commonly lives under a marker
segment that says so. Where it does, the breakage surface is the module path as
much as the string, and a dependency bump can move it without a single attribute
being renamed.

## Decision rules

- Name the vocabulary's source at the schema's authority site: authored here, or
  adopted from a named external convention at a stated version.
- Decide it on version-skew control — whether one party owns both the emitter
  and the consumer — not on whether the code is builder-side.
- Ship a library as if it were a receiver: ordered name tables, retained legacy
  spellings, and a stated support window across generations.
- Record the convention's stability status beside the version, and expect
  attribute names to move while it is pre-stable.
- Extend only in a namespace you own; never mint a name in the convention's
  namespace for a fact it has not standardized.
- Assert borrowed spellings in tests, both that current names hold and that
  superseded ones appear nowhere outside deliberate aliases.
- Treat the convention as a pinned dependency, and re-read its migration notes
  on every bump rather than on a schedule.
- Where an unmatched attribute leaks a value rather than breaking a query,
  select no vocabulary: match on value shape, walk every attribute, and treat
  the unrecognised one as in-scope.
- Assert against the package the application actually loads. A borrowed-spelling
  test calibrated against a transitive dependency can keep passing while the
  shipped emitter's vocabulary moves underneath it.

## What this technique does not own

The shape of a span, the parent-child rules, and the requirement that one
authority define the schema are [span-model](./span-model.md) — this technique
answers only where that authority's vocabulary comes from. How spans are
captured, buffered and shipped is [trace-capture](./trace-capture.md), and
carrying identity across a process boundary is
[cross-boundary-propagation](./cross-boundary-propagation.md). Reconciling
attributes arriving from senders you do not control, once they have arrived,
is a receiver-side concern and belongs to the observability material on
normalizing multi-provider events; this technique is about what to emit.
