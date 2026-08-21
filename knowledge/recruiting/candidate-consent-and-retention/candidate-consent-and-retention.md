---
layer: golden-path
type: golden-path
subject: candidate-consent-and-retention
status: forged
use_when: [holding candidate data past a requisition, building a talent pool, handling an erasure request, setting a retention window, deciding what survives a scrub]
techniques:
  - retention-ttl-and-derived-disclosure
  - read-time-gate-not-just-the-sweep
  - one-transaction-scrub-across-linked-records
  - deep-redact-verbatim-quote-containers
  - anonymise-but-retain-the-aggregate-signal
  - legal-claims-carve-out-from-erasure
---

# Candidate consent and retention

A candidate database is the only asset in a hiring system that keeps accruing
value after the work is done and keeps accruing liability at the same rate. A
person applied once, for one role, in one month. Two years later the system
still holds their salary expectation, their transcript, an automated reading
of their career, and a rank against people they never met. Nothing about the
original application authorised that, and no amount of usefulness supplies the
authorisation retroactively.

This subject is the lawful-basis lifecycle: on what grounds a record is held,
for how long, what the person was told about it, what happens when the clock
runs out, and what may — and what must — survive an erasure request. It is not
a compliance appendix. Retention is a design decision that leaks into ranking,
into rediscovery, into analytics and into every export, and a system that
treats it as a batch job bolted on at the end will discover the leak through
an incident rather than through a review.

## Two clocks, two bases, one lifecycle

The single most common structural error is running one retention policy over
one undifferentiated pile of candidates. There are two clocks and they are
grounded differently.

**The application clock** covers processing a person for the role they applied
to: reading the document, scoring it, interviewing, deciding. This runs on the
necessity of the process itself — the person asked to be considered, and
considering them requires holding what they sent. It is purpose-bound and it
*ends*: when the requisition closes, the necessity that justified the holding
is discharged. What remains after that point is held on a different footing
and must say so.

**The pool clock** covers everything the organisation wants afterwards:
keeping the profile for future roles, re-contacting on a new opening,
including the record in a rediscovery sweep. This is the classic optional
purpose, and it is the one place in recruiting where consent is genuinely the
right basis — it is separable, refusable without penalty, and withdrawable
without breaking anything the candidate wanted.

The inversion of this — asking for blanket consent at application time and
treating it as the basis for the core screening — is worse than useless. It is
a basis the candidate can revoke mid-process, which means either you honour
the revocation and abandon their live application, or you do not and the
consent was theatre. Ask for consent for the thing that outlives the
application, and hold the application itself on the necessity that the
application itself creates.

Two consequences follow immediately, and both are frequently missed:

- **A rejection does not end retention; it changes its basis.** The moment a
  candidate is rejected, the necessity clock stops and the consent clock is
  the only thing still holding the record. If no consent was captured, the
  record has a defence tail (below) and nothing else.
- **Consent scope is per-purpose, not per-person.** Consent to be kept in a
  pool is not consent to be interviewed by an automated system, which is not
  consent to have a conversation recorded and stored. Each is a separate ask
  at a separate moment, enforced at its own edge.

## The clock starts at last meaningful contact, not at creation

A retention window anchored to record creation is easy and wrong. It expires
active relationships and it silently extends dormant ones through
re-import. Anchor to the last *meaningful* contact — an application, a reply,
a re-consent, an interview — and define "meaningful" narrowly enough that
system-generated touches do not refresh it. A marketing email the candidate
never opened is not contact. If a bulk sweep can reset the clock on a whole
database, the retention policy is unbounded with extra steps.

Common defensible windows, and the reasoning that makes them defensible rather
than the numbers themselves: unsuccessful applicants for a specific role are
typically held six to twelve months past the decision, because that spans the
period in which the decision could be challenged and in which reopening the
requisition is realistic. Pool retention on explicit consent typically runs
twelve to twenty-four months from last contact, with renewal before expiry;
past twenty-four months of silence the claim that the person still wants to be
in your database is not credible and will not be believed. Pick a number,
write down which of these two rationales it rests on, and treat it as a
default that each deployment may shorten and may not silently lengthen.

## What you told them is a ceiling, and it rounds up

The retention period disclosed to the candidate is a promise, and promises are
enforced against the promiser. This produces a rule that feels wrong to
engineers and is correct: when the disclosed figure and the configured TTL
disagree, **round the disclosure up**. Telling someone "up to two years" when
you delete at twenty months is a harmless conservatism. Telling them "twelve
months" when a rounding boundary or a grace period means the record sometimes
survives to thirteen is a false statement about a person's data — and the
direction of error is the whole difference between a documentation nit and a
breach of the disclosure. Under-disclosure is the worse direction; build the
rounding so it can only err generously.

The same asymmetry governs the *content* of the disclosure. A held-data list
shown to a candidate must be derived from what the record actually contains,
never from what the schema permits. A system that renders "we hold: your CV,
your interview recording, your assessment" from a static template will tell
someone you hold an interview record when no interview happened — a
fabrication about that specific person, in a surface whose entire purpose is
to be the trustworthy one. This is the
[say-only-what-the-record-holds](../_laws.md#say-only-what-the-record-holds)
law at its sharpest: the transparency surface is the last place invention is
acceptable.

## Expiry is a property of the read, not of a job that ran

Sweeps fail. They fail silently, they fail on a schedule that does not exist
in a fresh deployment, they fail because the worker died six weeks ago and
nobody watches worker liveness on a compliance path. A retention design whose
only enforcement is a periodic job has one control, and that control is a cron
entry.

The correct shape is that **the read path evaluates consent state**, and every
identifying field is withheld when the state says withhold. The sweep then
becomes what it should always have been: an optimisation that keeps the store
tidy and reduces blast radius, not the thing standing between an expired
record and a recruiter's screen. If the sweep never runs again, expired
records still stop showing names. That property is worth more than any amount
of scheduling reliability, because it does not depend on anything running.

## Erasure is a transformation, not a delete

"Delete the person" is the naive reading, and it fails in three directions at
once — it destroys records the organisation is entitled and sometimes obliged
to keep, it leaves the person present in derived artifacts, and it silently
falsifies every aggregate computed from the deleted rows.

The principled decomposition is three-way. **Identity dies**: name, contact
details, the source document, anything free-text that could reconstruct the
person. **The shell survives, de-identified**: enough of the record to keep
the pipeline coherent, the person reduced to a stable non-identifying handle —
initials and a surrogate id — so that a recruiter looking at a historical
funnel sees a coherent entry rather than a hole. **A narrow, enumerated set
survives intact** on the legal-claims basis: the sealed record of what was
decided and why, which is precisely the artifact that protects the candidate
in a challenge as much as it protects the organisation.

Three rules make that decomposition safe:

- **One transaction.** A scrub that partially succeeds is worse than one that
  fails, because it reports success. Every linked record moves together or
  none does, and the completion is recorded only when the transaction
  commits.
- **Scoped to the tenant that owns the person, and to all of it.** A scrub
  that filters by the wrong boundary can return success while the name, the
  document, the analyses and the transcript stay readable on a recruiter's
  board. The tenancy mechanics belong to the engineering neighbour; the
  hiring judgment here is that an erasure receipt is a claim about the whole
  organisation's holdings, and issuing it on an unverified subset is the one
  failure this surface may never have.
- **Follow the derived artifacts.** The person is not only in the person
  table. They are in the reasoning traces, the evidence citations, the
  provenance dossiers and the export bundles — usually as verbatim quotes
  from the very document that was deleted. A scrub that stops at the columns
  it knows about leaves the résumé alive in a nested field and re-exports it
  next quarter.

## Anonymisation is a claim; make it one you can defend

Masking a name to initials is not anonymisation. Neither is dropping the name
while keeping the employer, the graduation year, the salary expectation and
the town — that record identifies a person to anyone with the roster it came
from. The honest position is that most "anonymised" hiring records are
pseudonymised: re-identification is harder, not impossible, and the data stays
personal data.

Say which one you achieved. A record reduced to initials plus a surrogate id,
with free text stripped and quantities kept, is a defensible *retained,
de-identified* state — it keeps the funnel countable and the fairness
statistics computable without holding a person. Call it that. Call it
anonymous only where the transformation is irreversible, the residual
combination of attributes cannot single anyone out against realistically
available external data, and you have written down why. An aggregate that
still resolves to one person is not an aggregate, and this is the same
reasoning the small-sample and benchmarking subjects apply from the other
direction.

## Consent is a state machine with an append-only history

Model consent as states — granted, renewed, expiry-notified, expired,
anonymised, erasure-requested, erased — with an event appended on every
transition, carrying who or what caused it and when. Not a boolean, not a
timestamp column that gets overwritten.

The reason is that every question that matters afterwards is a question about
history, not about the current value. Did we have a basis on the day we ran
that screening? Was the person warned before expiry, and how long before? Was
the erasure honoured within the window, and by whom? A boolean answers none of
these, and reconstructing them from application logs is exactly the exercise
that goes badly when it is finally attempted. The event log is also the only
way to distinguish "consent expired" from "consent withdrawn" from "never
asked" — three states with different downstream permissions that a nullable
flag collapses into one.

Withdrawal and expiry are not the same event and must not route the same way.
Withdrawal is an instruction and takes effect immediately. Expiry is the
absence of renewal and should be preceded by a notice with real time to act —
a person who never received the notice has not declined, they have been
defaulted, and
[absence-of-evidence-is-not-evidence](../_laws.md#absence-of-evidence-is-not-evidence)
applies to their silence as much as to anything else.

## Enforce at the edges where data comes into being

Consent checks placed only at the entry of a workflow are checks against an
intention. Place them where irreversible things happen. Two edges matter in
practice for any recorded assessment: **before access is granted** — nobody
gets credentials to an automated interview without a recorded consent for
that specific processing — and **again before the artifact is stored**, so a
session started under consent that was withdrawn mid-flight does not leave a
transcript behind. The second check catches what the first cannot: consent is
a state that can change between the beginning of a conversation and its end.

The gate binds to *whether a real person is being screened*, not to which code
path is running. A recruiter rehearsing against themselves in a test mode has
no candidate to protect and must not be blocked; the same endpoint screening an
applicant is a hard stop. Encode that as a property of the session's mode, so
the exemption is a declared, testable predicate rather than an environment
check somebody will invert.

The same principle governs outreach. Rediscovery may legitimately re-contact
someone who was rejected — rejection is a hiring outcome, not a data
instruction. It may never re-contact someone whose consent expired or whose
record was anonymised, because in the first case the basis is gone and in the
second there is no longer a person there to contact. Encoding "why this person
is suppressed" as a reason rather than a boolean is what lets the suppression
be explained, audited, and correctly reversed when consent is renewed.

## Failure modes this standard exists to prevent

- **The indefinite hoard** — records accumulated with no window at all, on the
  theory that a bigger database is a better one. This is the single most
  commonly found defect in automated hiring systems and the one regulators
  look for first.
- **The cron-shaped control** — retention enforced only by a sweep, so a dead
  worker silently converts a twelve-month policy into forever.
- **The success-shaped no-op** — an erasure that returns confirmation while
  the person remains readable somewhere the scrub did not reach.
- **The verbatim survivor** — the deleted CV living on as quotes inside a
  reasoning trace, and being re-exported by a downstream artifact.
- **The template held-data list** — a transparency page claiming holdings the
  record does not have.
- **Anonymisation by adjective** — a record called anonymous because a name
  column is null, while five other columns identify the person jointly.
- **The unbounded carve-out** — "legal claims" invoked as a category rather
  than an enumeration, quietly restoring indefinite retention through the
  exemption door.

## Seams with neighbouring subjects

What a candidate is *told* about an automated decision, and the explanation
they are owed for it, belongs to the disclosure-and-explanation subject; this
one owns only the disclosure of *holding* — basis, duration, and contents. The
sealed decision chain itself — how a decision is bound to what it judged and
made tamper-evident — belongs to the audit-and-traceability subject; this one
owns only the question of whether that chain survives an erasure and on what
grounds. Tenancy, access control and transactional mechanics belong to the
engineering neighbour named in the bundle's boundary contract; what stays here
is the hiring judgment about which data is sensitive because it binds a
person's identity to a hiring outcome.

## The techniques

- [retention-ttl-and-derived-disclosure](techniques/retention-ttl-and-derived-disclosure.md)
  — choosing the window, anchoring the clock, and deriving the disclosed
  ceiling so it can only round generously.
- [read-time-gate-not-just-the-sweep](techniques/read-time-gate-not-just-the-sweep.md)
  — making expiry a property of every read, with the sweep demoted to an
  optimisation.
- [one-transaction-scrub-across-linked-records](techniques/one-transaction-scrub-across-linked-records.md)
  — all-or-nothing erasure across every linked table, correctly scoped, with
  the receipt issued only on commit.
- [deep-redact-verbatim-quote-containers](techniques/deep-redact-verbatim-quote-containers.md)
  — the key/array/container taxonomy for finding the person inside derived
  artifacts, and why recursive redaction is the default.
- [anonymise-but-retain-the-aggregate-signal](techniques/anonymise-but-retain-the-aggregate-signal.md)
  — reducing a person to initials and quantities so funnels and fairness
  statistics survive without a person in them.
- [legal-claims-carve-out-from-erasure](techniques/legal-claims-carve-out-from-erasure.md)
  — the narrow, enumerated, time-bounded exemption, and how to keep it from
  becoming a retention loophole.
