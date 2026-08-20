---
layer: golden-path
type: golden-path
subject: readiness-passports
status: forged
use_when: [comparing many projects at a glance, deciding what may be delegated in a given project, publishing an externally derived readiness fingerprint, recording an owner's accepted trade-offs so re-assessment stops re-litigating them]
techniques:
  - two-axis-readiness
  - named-vs-capability-metadata
  - declined-by-choice
  - blocker-rollups
  - fingerprint-provenance
---

# Readiness passports

A **readiness passport** is a small, portable, per-project fingerprint that
states what a project is ready *for*. It is computed by an assessor, not
declared by the project; it is shaped so that a stack of them can be laid side
by side and read at a glance; and it is durable enough that the decisions its
owner has already made about it survive the next re-assessment.

The word *passport* is doing real work. A passport is not a description of a
person — it is a compact, externally issued, comparable claim about what
crossings that person is admitted to, carried by the traveller, readable by an
official who has never met them, and stamped with when it was issued and by
whom. Every one of those properties is a design constraint here: **compact**
(it must be read in seconds, next to forty others), **externally issued** (the
issuer is not the subject), **comparable** (two passports from two unrelated
projects must be readable against each other without a translation step),
**carried** (it travels with the project, not locked in the assessor's
database), and **stamped** (it says what it saw, when, and with what
instrument).

## The direction of authority is the whole subject

The nearest neighbour is the self-declared repository contract, and the seam
between them is not a matter of taste. A **repository manifest** — the
[`repo-manifest-standard`](../repo-manifest-standard/repo-manifest-standard.md) subject — is written *by* the project, at a known
location, about itself: what capabilities exist, how to invoke them, where
evidence lives. It is trustworthy about intent and about invocation, and it is
proven in place, by a conformance checker run against that same repository. A
passport runs the other way: it is **derived by an external assessor about the
project, for comparison against projects that never agreed on anything**.

Neither can be substituted for the other, and the failure mode of confusing
them is specific. A self-declared score is the worst artifact in this space: it
carries the authority-shape of an assessment with the incentive-shape of
marketing, and nothing in its structure prevents the subject from grading its
own homework. This is the same lesson the artifact-provenance world learned the
hard way — a build that writes its own provenance document proves nothing,
because a compromised build can write exactly the same document. The
separation of *who computes* from *who is described* is not a nicety layered on
top of the format; it is the only thing that makes the format mean anything.

Two other seams. The ordinal ladders a passport's axes are built from —
rung criteria, cumulativity, band edges, the present-versus-enforced
distinction, the rules for what may not be averaged — belong to
[maturity ladders](../maturity-ladders/maturity-ladders.md); this subject is a
*consumer* of ladders and must not redefine them. Provenance of a **build
output** — signing what a pipeline produced so a downstream consumer can verify
it — belongs to `signed-artifacts`; the provenance discussed here is provenance
of an *assessment*, which is a different subject with a different threat model.
And a catalog of reusable knowledge is `knowledge-registry`; a portfolio of
passports catalogs projects, not know-how.

## The passport computes nothing

The single structural rule that keeps a passport honest: it is a **pure,
deterministic projection of a finished assessment**. It performs no new
measurement, opens no new connection, retries nothing. Everything it says was
already established by the assessment run; the passport's entire job is to
select, shape and stamp.

The temptation to violate this arrives disguised as convenience — "while we are
building the fingerprint we could just check one more thing" — and the cost is
paid three ways. A passport that measures can produce a value the full
assessment does not contain, so the compact artifact and the long report
disagree and nobody can say which is right. A passport that fetches can fail,
so a summarization step acquires an error path and a partial state. And a
passport that is not a pure function of its input cannot be regenerated for
comparison, which destroys the only cheap check available: recompute from the
stored assessment, diff against the stored fingerprint, and any difference is
drift with a name (`_laws.md#derivation-names-recomputation`).

The corollary is that **the projection is the schema's owner**. If a field
cannot be derived from the assessment, it does not belong in the passport; the
right response to "the fingerprint should also say X" is to ask what part of the
assessment computes X, and to fix that first.

## Two axes, because there are two questions

A single readiness number is the default design and it is wrong, because the
population it serves asks two different questions that do not co-vary. *Is this
project fit to run in front of real users?* — which is about tests, errors,
security posture, operability. And *how much of the work here can safely be
handed to an autonomous agent?* — which is about whether the project has the
guard rails that make unattended change survivable: a gate that fails, a way to
roll back, a check that observes the real target.

These come apart in both directions, routinely. A mature production service
with no automated gate is high on the first axis and low on the second: it works
because people are careful, and carefulness does not delegate. A young project
with a strict pipeline, comprehensive checks and nothing in production is the
mirror: safe to hand to an agent, not yet fit to launch. Collapsing them into
one score makes both answers unavailable, and it makes the score behave
strangely — a delegation improvement moves a "production readiness" number,
which teaches readers that the number does not mean what it is called.

So the passport carries **two independent ordinals plus their posture**, and
reports them as a pair. [two-axis-readiness](techniques/two-axis-readiness.md)
covers the axis-selection test (would a reader take a *different action* on a
change in each?), what the axes may share as inputs, and the rule that the pair
is never averaged into a headline.

## Naming the tool, on purpose

Here the passport deliberately inverts its neighbour's central rule. A manifest
declares *capabilities*, never the tool that currently provides them, because a
manifest must survive its own tooling being replaced. A passport does the
opposite: it names the concrete tooling it found, because its reader is looking
at forty projects at once and needs to see, on first sight, that thirty use one
test runner and ten use another.

This is not a relaxation of discipline; it is a different consumer with a
different need. "Has a test capability: true" is precisely the wrong output for
a portfolio reader — it is the fact they already assumed, and it hides the fact
they need: the *spread*. Capability-shaped metadata answers "can this project do
X"; a portfolio reader is asking "what am I actually standardising on, and where
is the long tail". Only named metadata answers the second, and the second is why
the artifact exists.

The cost is real and must be paid deliberately: named metadata rots, because
tools are replaced and names change. The mitigations —
recompute-don't-store-the-name, an open vocabulary with an explicit `other`,
never letting a name become a gate condition, and keeping the axes themselves
capability-shaped even while the descriptive fields are name-shaped — are
[named-vs-capability-metadata](techniques/named-vs-capability-metadata.md). The
rule of thumb: **axes are capability-shaped, the descriptive skin is
name-shaped, and nothing downstream branches on a name.**

## The passport is also decision memory

An assessment re-run over an unchanged project produces the same findings, which
is correct and, after the third run, useless. The owner has already read the
finding "no error-tracking integration", already decided this internal batch
tool does not warrant one, and has no way to say so — so the finding returns
forever, and the owner learns to skim past the whole section, which is the exact
failure a recurring report exists to prevent.

The fix is that a passport carries an **overlay of decisions the owner has
already made**: an explicitly enumerated set of findings that may be *declined
by choice*, stored separately from the computed result and applied when the
fingerprint is read. A declined item does not vanish — it re-renders as
"accepted, with a reason and a date", which is strictly more information than
either hiding it or repeating it.

Two constraints make this a memory rather than a laundering device. First, the
declinable set is an **allow-list, not a deny-list**: the artifact enumerates
what an owner may decline, so adding a new kind of finding does not silently
make it dismissible. Second — and this is the rule that gets discovered rather
than designed — **a caveat that says "we could not see this" is never
declinable**. An owner may accept a real gap; an owner may not dismiss a blind
spot. A caveat like "evidence limited: no credential was available for the
deployment host" is not a trade-off the owner is entitled to accept, because
accepting it converts *missing evidence* into a clean report, which is the one
transformation this artifact must never perform
(`_laws.md#failure-not-empty-success`). The mechanics — overlay storage, the
allow-list, decline provenance, re-surfacing when the underlying finding
materially changes — are [declined-by-choice](techniques/declined-by-choice.md).
The related but distinct rule that *a decline never moves a rung* is the
ladder's, and lives with `maturity-ladders`; here we own the overlay's shape and
its portability.

## A portfolio is not a list of passports

The payoff of comparability is only collected if something reads across the
stack. The highest-value read is the **blocker rollup**: not "here are 40
projects and their scores" but "31 of 40 are blocked on the same thing, and it
is one afternoon of platform work." That inversion — from per-project verdicts
to a ranked list of blockers with the projects hanging off them — turns forty
individual remediation efforts into one, and it is invisible until someone
aggregates.

The aggregation is arithmetically humble on purpose. Counts, not averages;
identity-based grouping rather than string matching on rendered text; and every
number carrying the predicate that produced it —
"31 of 40 assessed within the last 30 days, under assessor v4"
(`_laws.md#count-carries-predicate`). A rollup that averages ordinals across a
portfolio produces a confident figure that corresponds to nothing.
[blocker-rollups](techniques/blocker-rollups.md) covers the grouping key, the
ordering, and what a rollup may claim about projects it could not read.

## Stamped, or worthless

A fingerprint with no stamp is a rumour. Three facts must travel inside the
artifact itself, not in the database row beside it, because the artifact is the
thing that gets copied into a message, pasted into a document, and read six
months later:

- **What was assessed** — bound to an immutable identifier for the exact state
  observed, never a moving one. A fingerprint tied to a branch name describes a
  moving target and can never be matched back to what it actually saw; tied to
  an immutable revision identifier, it can.
- **By what instrument** — the assessor version and the ladder versions, so a
  stored fingerprint from last quarter is still interpretable after the criteria
  change, and so a schema bump can be migrated on read rather than by rewriting
  history.
- **When, and how completely** — the timestamp and the coverage caveats. Every
  such artifact decays from the instant it is issued: the project keeps
  changing, the assessment does not. A passport that does not present its own
  age lets a reader extend a stale claim the trust owed to a fresh one, which is
  the single most common way this class of artifact misleads.

[fingerprint-provenance](techniques/fingerprint-provenance.md) covers the stamp,
the staleness contract, and migrating a stored fingerprint forward when it is
read rather than when the schema changes.

## The stakes are part of the fingerprint

One field earns its place beside the axes and is almost always omitted: **how
hard the reader should judge these numbers**. A throwaway experiment sitting at
a middling ship-readiness rung is fine; a revenue-critical service at the same
rung is an alarm. Without a criticality field the portfolio reader must supply
that context from memory for every row, which they will do for the five
projects they know and not for the other thirty-five.

Criticality is also the one class of field an assessor genuinely cannot
observe: nothing in a codebase says how much the organisation would suffer if
it stopped. So it is an **owner-supplied input to an externally computed
artifact** — which is legitimate exactly as long as it stays an input to the
reader's interpretation and never becomes a term in either axis. The moment
criticality raises a rung, the fingerprint is self-declared again through a
side door.

## Failure modes worth naming

- **The self-issued passport.** The project computes and publishes its own
  fingerprint. Structurally indistinguishable from marketing; the format's whole
  value came from the issuer being external.
- **One number.** The two axes are averaged for a "headline", the headline is
  the only thing anyone quotes, and both real questions become unanswerable.
- **The passport that measures.** A field is added that the assessment does not
  compute, so the projection acquires a fetch, an error path, and the ability to
  disagree with the report it summarizes.
- **Absence rendered as failure.** A project never assessed and a project
  assessed as unready produce the same empty cell in the portfolio view. They
  are opposite facts (`_laws.md#failure-not-empty-success`).
- **The stale fingerprint quoted as current.** No age on the artifact, so a
  reader treats a six-month-old claim as today's. The artifact must carry its own
  expiry pressure.
- **Vocabulary drift across issuers.** Two assessors each emitting sensible
  fingerprints with no shared field or rung vocabulary produce values that
  compare and meanings that do not
  (`_laws.md#one-authority-per-vocabulary`).
- **Declines that erase.** A dismissed finding disappears from the artifact
  instead of re-rendering as an accepted trade-off, and the passport becomes a
  record of what the owner was willing to look at.

## What good looks like, compressed

- The issuer is not the subject, and the artifact says who issued it.
- The passport is a pure projection: regenerating it from the stored assessment
  reproduces it byte for byte, and any difference is reported as drift.
- Two ordinals with their postures, reported as a pair, never averaged.
- Descriptive fields name concrete tooling; axes and gates read capabilities;
  no consumer branches on a tool name.
- Declines are an allow-listed overlay that re-renders rather than hides, and
  evidence limitations are outside the allow-list by construction.
- Every count in a portfolio rollup carries its predicate and its coverage.
- Every fingerprint carries the immutable identifier of what it saw, the
  versions of the instruments that saw it, and its own age.
- An unreadable, unassessed or expired project is visibly that, and never a low
  score.

## The techniques

- [two-axis-readiness](techniques/two-axis-readiness.md) — why fitness-to-ship
  and fitness-to-delegate are separate ordinals, the axis-selection test, and the
  no-headline rule.
- [named-vs-capability-metadata](techniques/named-vs-capability-metadata.md) —
  when naming the concrete tool is the correct choice, how to stop the names from
  rotting, and the line nothing may cross.
- [declined-by-choice](techniques/declined-by-choice.md) — the decision-memory
  overlay: allow-listed declinable findings, decline provenance, re-surfacing,
  and why blind spots are never declinable.
- [blocker-rollups](techniques/blocker-rollups.md) — reading across a portfolio:
  grouping keys, count discipline, ordering by unlock value, and honest coverage.
- [fingerprint-provenance](techniques/fingerprint-provenance.md) — the stamp:
  immutable subject binding, instrument versions, staleness, and migrate-on-read
  of stored fingerprints.
