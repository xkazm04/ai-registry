---
layer: technique
type: technique
subject: portable-hiring-records
technique: human-versus-automated-decision-attribution-on-export
status: forged
laws: [every-decision-names-its-actor, no-adverse-outcome-is-solely-automated, say-only-what-the-record-holds]
use_when: [exporting decisions to another system of record, mapping an actor onto a counterparty's schema, deciding what a portable decision record says about who decided]
shared_with: []
---

# Human versus automated decision attribution on export

## The concern

A decision that leaves your system carries a claim about who made it, and the
receiving system will store that claim as fact. It will report on it, it will
be queried against it, and one day it will be produced in answer to a question
about whether a person or a machine rejected someone. Whatever your export
said becomes the answer — long after your own record, your own chain and your
own context are unavailable to the reader.

That makes an export boundary the highest-consequence place attribution can go
wrong, and it goes wrong in a specific direction. Schemas differ: the
counterparty may have a single "decided by" field expecting a user, or a
"reviewer" field with no automated option at all. The path of least resistance
is to put *something person-shaped* in it — the workspace owner, the
integration's service user, the recruiter who happened to configure the
connection. Every one of those manufactures the evidence of human oversight
that [no adverse outcome is solely automated](../../../_laws.md#no-adverse-outcome-is-solely-automated)
requires you to actually have.

## The procedure

**1. Derive the automated flag; never trust one.** Compute whether a decision
was automated from what the sealed actor *is*, at export time, from the sealed
record. A stored boolean set by whoever wrote the decision can be wrong, can be
defaulted, and can be set by a code path that never considered the question. A
derivation from the actor identity is wrong only in ways the actor field also
shows.

The practical mechanic that makes this cheap: give automated actors a
structurally distinguishable identity — a reserved namespace or prefix that a
human account can never hold — so "is this automated" is a property of the
identifier rather than a fact stored beside it. An actor namespace that a
human could also occupy forces you back onto a flag.

**2. Carry three states, not two.** *A named person*, *the automated process*
(with which process), and *not identified*. The third is not a failure of the
export; it is an honest report of what the record holds, and it is the state
that keeps you from inventing the other two.

**3. Map onto the counterparty's schema without lying.** In descending order
of preference: use their automated-actor representation if they have one; use
a clearly non-human system identity if they accept one; put the attribution in
a structured note or custom field and leave the person-shaped field empty. The
option that is never available is filling a person field with a person who did
not decide.

**4. Say so when the receiver cannot represent it.** If a counterparty's schema
has no way to express "decided by an automated process", that is a stated
limitation of the integration, recorded on the connection and visible to the
operator — not a detail resolved quietly by the mapping code. A receiving
system that flattens the distinction is a fact the exporting organisation
needs to know before an audit tells them.

**5. Export the pre-override verdict alongside the final one where the record
holds it.** A decision that a machine proposed and a human changed is two
facts, and only exporting the second destroys the evidence that a person
actually intervened — which is the evidence most worth having. Where the
counterparty cannot hold both, export the human's decision as the decision and
the machine's as a structured antecedent, never the reverse.

## The decision rules

- **When the actor is ambiguous, degrade to automated or to not-identified —
  never upgrade to human.** Authority may be downgraded when the record is
  unclear; it may never be upgraded
  ([every decision names its actor](../../../_laws.md#every-decision-names-its-actor)).
  This asymmetry is the whole rule: an under-claimed human decision costs you
  a weaker file, an over-claimed one costs an innocent employee their name on
  a decision they never made.
- **When a service account or integration credential is the actor, that is
  automated**, whatever the account is named. An account called after a person
  is still not a person.
- **When a human reverses a machine's decision, the export attributes it to
  the reverser** and does not inherit the machine's attribution — and carries
  the machine's original verdict as the antecedent.
- **When the sealed record cannot be verified — the integrity marker does not
  check out, or the record was re-typed from a source that is no longer
  available — export the decision without the seal's guarantee and say so.**
  A verdict presented as sealed when its seal does not verify is a stronger
  claim than the record supports
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
- **When exporting in bulk, never attribute the export's own operator to the
  decisions inside it.** The person who ran the export decided to export. They
  did not decide any of the outcomes, and the two facts live in different
  places — the decisions in the payload, the export in the egress audit.

## The measurement

One number tells you whether an export's attribution is honest: the share of
exported decisions attributed to a named human, compared against the same
share in your own store. They should match. A divergence means the mapping is
transforming attribution, and the divergence is essentially always in the same
direction — more humans on the way out than there were on the inside, because
every ambiguity resolved toward the field that was easiest to fill.

## When not to use it

- **Records that are not decisions** — a candidate's contact details, a job's
  description — need no actor attribution, and adding one invites a
  meaningless value in a field that reads as meaningful.
- **A purely internal backup or replication** between two deployments of the
  same system does not need the mapping layer, because the schema is identical
  and the actor round-trips exactly. It still needs the derivation rather than
  a trusted flag, since a wrong flag replicates perfectly.
- **Where the receiving side re-decides** — an export feeding a system that
  will run its own assessment — do not export your attribution onto their
  decision at all. Their decision has their actor. Yours is an input to it,
  and merging the two produces a record where nobody can tell which system
  concluded what.
