---
layer: golden-path
type: golden-path
subject: portable-hiring-records
status: forged
use_when: [designing the record a hiring system hands to another system, integrating with an external applicant-tracking system, exporting or importing an organisation's hiring data, deciding what a job, candidate or decision record must carry to survive the trip]
techniques:
  - versioned-record-envelope
  - external-identifier-as-the-sync-identity
  - per-tenant-stage-mapping-never-a-shared-assumption
  - unmapped-stage-stays-null-never-guessed
  - human-versus-automated-decision-attribution-on-export
  - personal-data-egress-audit
---

# Portable hiring records

Almost every hiring system is a guest in someone else's data. The requisition
was opened in a system of record you did not build; the candidate applied
through a careers page you do not own; the offer will be approved in a payroll
suite that has never heard of you. Your product is a stop on a journey, and
the thing that actually travels between stops is not your interface, not your
model, not your workflow — it is a **record**. This subject is about the shape
of that record, and about the single hardest fact of integration work: the
record's meaning is not in the record.

A hiring record that arrives somewhere else is three objects fused: a **job**
(what is being hired for, under what terms, by whom), a **candidate**
(a real person, with contact details, documents and a history), and a
**decision** (an outcome about that person under that job, made by someone or
something, at a time, on a basis). Every integration you will ever write is
some subset of those three moving across a boundary. Get their canonical shape
right and every connector afterwards is mechanical. Get it wrong and each new
connector is a fresh archaeology project, because the shape was never stated
— it was implied by whichever system you built first.

## The record is the contract, not the endpoint

Teams reach for the wrong artifact when they start integrating. They document
the endpoint: its path, its authentication, its rate limit, its pagination.
All of that is real and all of it is the neighbouring engineering discipline's
— it changes when the other side redeploys, and it tells you nothing about
whether the data means the same thing on both ends.

The durable artifact is the record: a named, versioned, closed set of fields
with stated semantics, into which every source system is *mapped* and out of
which every destination is *rendered*. Build the canonical record first, then
write adapters on both sides of it. A team that skips the middle and writes
direct source-to-destination translators has committed to writing one for
every pair, forever, and to discovering each pair's disagreements one
production incident at a time.

The canonical record is also what makes an integration testable without a
counterparty. You can hold a record in your hand, assert its invariants,
diff two versions of it, and replay it. You cannot do any of that with a
translation that only exists inside a request handler.

## What a portable hiring record must carry

**The job.** A stable identifier in your world; the identifier it holds in the
other world; a title; a location and its work arrangement; an employment type;
a status that says whether it is open to applications; the compensation range
if one is published, in an explicit currency with an explicit period; and the
requisition's owner. Titles are not identifiers and never were — two open
roles with the same title are routine, and the same role is renamed mid-flight
more often than anyone admits.

**The candidate.** A stable identifier; the identifier the other side holds;
a name; the contact channels; the documents or their references; the source
they arrived through; and — critically — the *legal basis and retention state*
on which you hold them, because that state governs whether this record may
cross a boundary at all. The consent-and-retention discipline owns what that
state means; this subject only insists it travels *with* the record rather
than being looked up separately by whoever receives it, since a receiving
system that never learned the retention clock will happily hold the person
forever.

**The pipeline state.** Where the candidate stands, expressed as a stage
*role* rather than a stage name, plus the source system's own stage label
carried alongside it unaltered. Both, always. The role is what any rule on the
receiving side may act on; the raw label is what a human debugging the mapping
needs to see. Discarding the raw label to save a column is the reason mapping
bugs take days instead of minutes.

**The decision.** An outcome, an actor, a moment, and a basis. Whether it was
made by a person or by an automated process. Whether it has been sealed —
and, if your store seals decisions, the seal's integrity marker so the
receiving side can tell a sealed record from a re-typed one. If an offer was
extended, its compensation and its terms.

**The envelope.** The record's own schema version, the system that produced
it, the moment it was produced, and the scope it covers. Records outlive the
code that wrote them; a record without a version is a record whose reader must
guess, and readers guess optimistically.

## A backup is not an integration

The two are constantly confused, and the confusion is expensive in both
directions. A **backup** is identity-preserving: it leaves one deployment and
returns to the same organisation in the same deployment, carrying that
deployment's own identifiers, and that is precisely what makes restoring it
safe. An **integration** crosses an identity boundary: the identifiers on the
other side are someone else's, so every record needs mapping, and nothing may
be assumed to round-trip.

Confuse them one way and you offer a backup file as a migration path between
deployments, where its identifiers mean nothing and the restore either
collides or orphans. Confuse them the other way and you offer a whole-database
dump as an "integration" — the shape that is not portable at all, because it
exports your internal schema rather than a stated record, and every consumer
of it becomes coupled to your tables.

The honest split: a backup restores in place, into the organisation it came
from, and refuses a file from anywhere else. An integration exchanges the
canonical record, per entity, through a mapping. A product needs both, and
naming which one a given file is belongs in the envelope, not in a support
article.

## The three hard problems

Everything difficult about portability reduces to three questions, and they
recur in every integration regardless of counterparty.

**Which record is this?** Two systems each hold their own primary key for the
same person. Neither can see the other's. The reconciliation between them is
the *sync identity*, and it is the single field most likely to be treated as
decoration and most likely to destroy a dataset. When the sync identity is
missed on read, nothing errors: the importer simply cannot find the existing
record, so it creates a new one. Repeat across a nightly job and the pipeline
fills with duplicates of real people — the failure that looks exactly like
success until somebody notices the count. This is the
external-identifier-as-the-sync-identity technique, and it deserves the
paranoia it asks for.

**What does this stage mean?** Two organisations on the same system of record
do not model their funnel the same way. One runs a phone screen, an onsite and
an offer; another runs two automated rounds, a panel, a client approval and a
"pending start". Their stage lists are not variations on a shared standard;
they are separate vocabularies that happen to be typed into the same field.
Any code that reads a stage string and decides what it means has hardcoded one
organisation's process into a shared product. Mapping is therefore
*per-organisation configuration*, never a shared constant — the
per-tenant-stage-mapping technique — and it rests directly on
[meaning does not live in a label](../_laws.md#meaning-does-not-live-in-a-label).

**What do we do when we do not know?** A stage arrives that the mapping does
not cover. The comfortable move — pick the nearest role, or default to the
head of the funnel — silently manufactures pipeline state for a real person.
The correct move is an explicit unmapped state that no rule may act on, that
surfaces to a human as configuration work, and that never renders as a
position on a board. This is the whole of unmapped-stage-stays-null, and it is
the local reading of
[absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence).

## Attribution is a property of the decision, not of the export

A decision that leaves your system carries a claim about who made it. The
receiving system will store that claim, report on it, and eventually defend it
— which means an export is where an attribution error becomes someone else's
permanent record.

Two rules hold. First, attribution is **derived, never asserted**: whether a
decision was automated is computed from what the actor actually was at the
moment of sealing, not read from a boolean that some earlier writer set. A
flag can be wrong; a derivation from the sealed actor cannot be wrong in a way
the record does not also show. Second, attribution **degrades toward
automated, never toward human**. Where the record is unclear about who acted,
the honest export says *automated* or *not identified* — never a person's
name. Upgrading an ambiguous actor to a human is how a hiring system
manufactures the evidence of human oversight that it does not have, which is
the specific fraud that
[no adverse outcome is solely automated](../_laws.md#no-adverse-outcome-is-solely-automated)
and [every decision names its actor](../_laws.md#every-decision-names-its-actor)
exist to prevent.

The decision-audit discipline owns how a decision is sealed, what the seal
contains and what the chain proves. This subject owns only the moment it
crosses the boundary: that the attribution travels intact, that the export
cannot upgrade it, and that a receiving system which cannot represent the
distinction is told so rather than silently flattening it.

## Exporting a hiring record moves real people's personal data

An organisation-scale export is not a convenience feature. It is the single
largest personal-data egress event your product will ever perform: every
candidate, every contact detail, every document, every automated reading of a
person's career, in one file, on someone's laptop, forever. It deserves to be
treated with the gravity of a data transfer, not the gravity of a download
button.

Three properties make an export defensible.

**Explicitly scoped, never "everything".** The set of tables, entities or
record kinds that may leave is an enumerated manifest, authored deliberately.
The failure mode of the alternative is structural: a new table is added for a
new feature, it holds something sensitive, and it is inside the export the
day it ships because the export was defined as *all of it*. The manifest must
also **fail closed** — an entity nobody has classified must break the export
rather than ride along in it. An unclassified table that quietly exports is
the exact shape of every "we did not know that field was in there" incident.

**Double-gated.** Export authority is not ordinary administrative authority.
Someone who can edit a requisition should not thereby be able to walk out with
the candidate database. Require both a permission that exists only for this
purpose and an explicit confirmation of what is about to leave.

The manifest also carries its own **exclusions and their reasons inside the
file**. A reader holding an export a year later must be able to tell "this
data was not exported" from "this data did not exist", and the only place that
distinction survives is the artifact itself. Documentation does not travel
with a file; a `not included, because` list does.

And when an existing export is discovered to be over-scoped, the correct
interim move is to **refuse it outright** rather than to keep serving it while
a narrower version is built. An over-broad personal-data door left open for
one more sprint is a decision to keep leaking, made silently.

**Audited as an egress, not as a page view.** The record of an export names
who took it, what scope, how many people's records, and when — and that record
survives independently of the exported data. This is the
personal-data-egress-audit technique. Its test is a question you will one day
be asked in earnest: *whose data left this system last quarter, and who has
it?* A product that cannot answer has not lost a log line; it has lost the
ability to notify the people affected.

## Import is more dangerous than export, and gets less ceremony

Export leaks. Import *destroys*. An import that reconciles badly does not
merely add rows — it overwrites pipeline states a recruiter set by hand, it
re-opens closed decisions, and where it is asked to mirror a source it deletes
records that exist only locally. And unlike a leak, a bad import is often
irreversible by the time it is noticed, because the previous values are gone.

The disciplines that make import survivable are cheap and almost universally
skipped:

- **Dry run first, always, and by default.** The system reports exactly what
  it *would* do — created, updated, skipped, deleted — and changes nothing.
  Applying is a separate, explicit act against a previewed plan.
- **Counts of rows, not counts of kinds.** "Twelve tables" is not a
  description of an operation. "Four thousand and eleven candidate rows will
  be deleted" is. A summary that abstracts away the magnitude has hidden the
  only number that would have stopped the operator.
- **Deletion needs its own consent.** A destructive import — one that removes
  what the source no longer has — requires a second, distinct flag beyond
  "apply". Never infer intent to delete from intent to sync.
- **Transactional, or explicitly resumable.** A half-applied import leaves a
  pipeline in a state no human designed and no rollback describes.
- **The dry run is gated exactly like the apply.** A preview reports row
  counts for a scope, which is itself a disclosure — plan a file belonging to
  an organisation the caller has no authority over and the "harmless" preview
  has just told them how many candidates that organisation holds. Refuse the
  foreign file before planning it, not before applying it.

The asymmetry with candidate-facing work is deliberate and worth stating: a
candidate's own action must never stall on your constraints, but an operator's
bulk mutation of thousands of candidate records absolutely may, and should.

## The naive readings

**"Their field names are close enough to ours."** Field-name similarity is the
most reliable predictor of semantic divergence, because the fields that mean
different things are exactly the ones both sides thought were obvious. A
"status" on one side is the requisition's publication state; on the other it
is the candidate's pipeline stage. Map deliberately; never map by name
matching, and never write a fallback that maps by name when the configured
mapping misses.

**"We will normalise everyone onto a canonical funnel."** Forcing every
organisation's stages onto one shared list produces pipeline states that never
existed and metrics over populations that never existed. Roles are the shared
axis; stages are not, and the stage-modelling discipline owns why.

**"The other system's identifier is just metadata."** It is the identity. It
is the only durable join between two databases that will never see each
other's keys. Treated as metadata, it is the field that gets dropped in a
refactor, and dropping it re-imports the world.

**"A record can be exported and re-imported symmetrically."** Rarely true, and
believing it is how derived, computed and sealed fields get round-tripped as
if they were inputs. A sealed decision that is re-imported and re-sealed on
arrival is not the same decision — it is a new record asserting an old
outcome, with a fresh actor and a fresh clock, and
[a verdict is bound to what it judged](../_laws.md#a-verdict-is-bound-to-what-it-judged)
says plainly that it does not inherit what it claims.

## What this subject cedes

**To the neighbouring engineering discipline, explicitly:** how credentials
for a counterparty system are stored and rotated; how a request is signed and
authenticated; retry, backoff, idempotency keys and queueing; rate limiting;
webhook signature verification; and the defence against a configured
destination address being used to reach systems it should not — the
server-side request forgery class. Those are real, they are load-bearing, and
they are not hiring craft. Every one of them would look identical in a product
that synchronised invoices.

**To the stage-modelling discipline:** the role vocabulary itself — what roles
exist, which are terminal, what a gate boundary means. This subject consumes
that vocabulary and insists that mapping targets it; it does not define it.

**To the decision-audit discipline:** how a decision is sealed, what the seal
covers, what a hash chain proves and does not prove.

**To the consent-and-retention discipline:** which candidates may lawfully be
exported at all, what must be scrubbed before a record leaves, and what
survives an erasure request. This subject carries the retention state in the
envelope; it does not decide it.

**To the communication-integrity discipline:** what counts as delivered when
a record is pushed to a counterparty. The general rule is theirs — an
acceptance from the receiving system is the only thing that licenses the word
"sent", and your own successful write to your own queue licenses nothing. The
boundary here is narrow and worth naming: a push that returns a non-success
status has not delivered a record, and marking the record synchronised on the
strength of having attempted it is the same lie in a different costume.

## Failure modes this standard exists to prevent

- **The duplicate flood.** A missed sync identity re-creating every candidate
  as new, nightly, until the count is noticed weeks later.
- **The guessed stage.** An unmapped stage rendered at the head of the funnel,
  so a candidate mid-interview appears to a recruiter as a new applicant.
- **The shared assumption.** One organisation's stage names compiled into the
  product, working perfectly for the first customer and wrongly for every
  subsequent one.
- **The upgraded actor.** An export that names a human on a decision the
  machine made, manufacturing oversight evidence.
- **The unclassified table.** A new entity riding along in an export because
  the export was defined by exclusion rather than by manifest.
- **The silent destructive sync.** A mirror import deleting local-only
  records, reported to the operator as a table count.
- **The versionless file.** An archive nobody can read, because the schema it
  was written against was never named.
- **The lost egress.** A full candidate export with no independent record of
  who took it, discovered when someone asks whose data left.

## The techniques

- [versioned-record-envelope](techniques/versioned-record-envelope.md) — the
  small fixed header that lets a reader know what shape it is holding, and the
  migration rules that follow from it.
- [external-identifier-as-the-sync-identity](techniques/external-identifier-as-the-sync-identity.md)
  — the compound join key between two databases that will never see each
  other's primary keys, and the duplicate flood that follows losing it.
- [per-tenant-stage-mapping-never-a-shared-assumption](techniques/per-tenant-stage-mapping-never-a-shared-assumption.md)
  — why a funnel translation is per-organisation configuration and never a
  constant in the source.
- [unmapped-stage-stays-null-never-guessed](techniques/unmapped-stage-stays-null-never-guessed.md)
  — the explicit unknown state, what may not act on it, and how it surfaces.
- [human-versus-automated-decision-attribution-on-export](techniques/human-versus-automated-decision-attribution-on-export.md)
  — deriving who decided rather than trusting a flag, and never upgrading an
  ambiguous actor to a person.
- [personal-data-egress-audit](techniques/personal-data-egress-audit.md) — the
  fail-closed manifest, the double gate, and the record that answers whose
  data left.
