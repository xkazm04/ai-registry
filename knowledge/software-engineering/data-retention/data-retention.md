---
layer: golden-path
type: golden-path
subject: data-retention
status: forged
use_when: [setting how long a system keeps stored data, building a scheduled purge, honouring an erasure request, gating an irreversible destructive operation]
techniques:
  - per-tenant-retention-policy
  - destructive-override-floor
  - time-budgeted-batch-purge
  - confirm-by-echo
  - dry-run-preview
  - erasure-requests
---

# Data retention

Retention is the discipline of **bounding how long a system keeps what it
stores, and being able to delete on request**. It is the only subsystem in
a product whose normal, correct, uneventful operation is the permanent
destruction of customer data. That sets the whole stance: every other
subsystem's default failure is to do too little, and retention's is to do
too much. A queue that stalls delivers late; a purge that misreads its own
configuration deletes years of history in one tick with nothing to roll
back to. So retention is designed inverted relative to the rest of the
system — the configuration path is suspicious of its own inputs, the
execution path assumes it will be interrupted, and the irreversible doors
demand more from the operator than a click.

It becomes a subject, rather than a line in a cleanup script, the moment
three things are true at once: the horizon differs per customer, the volume
exceeds what one pass can delete, and someone outside the company can
compel a deletion. Most products cross all three in the same quarter and
discover retention as an incident.

## What this subject owns, and what borders it

The removal of **one entity** — what it takes with it, what survives, and
whether the removal is reversible — belongs to
[entity-lifecycle](../entity-lifecycle/entity-lifecycle.md): blast radius,
cascades, archive-and-restore semantics. This subject owns the case that
lifecycle deliberately does not: destruction that is **time-bounded,
policy-driven, and whole-tenant** — nobody named these rows, a horizon
did, and no human is present when they go. Where lifecycle asks "what
does deleting this take with it?", retention asks "what is now older than
the promise we made, and can we get through all of it before the runner is
killed?"

**Cadence** — when the purge fires, whether a missed tick is made up, how
overlapping runs are prevented — belongs to
[scheduling](../scheduling/scheduling.md). The **runner** that hosts the
work, its supervision and its progress contract, belongs to
[background-jobs](../background-jobs/background-jobs.md). This subject
assumes both and owns only what happens between the tick and the commit.

The hardest border is [audit-logging](../audit-logging/audit-logging.md),
and it deserves more than a sentence, because it is the one place where two
correct disciplines pull in opposite directions. Audit logging owns
*writing* the trail and the ledger's own horizon — append-only shape, one
write door, per-ledger age and count bounds. It does not own the collision
this subject lives inside: **the trail is precisely the data a retention
window is most dangerous to.** For a product whose value is accountability,
the audit history *is* the compliance evidence; a window applied to it does
not free storage, it destroys the customer's ability to prove what
happened. Retention must therefore treat the trail as a distinct population
with its own floor, override path and preview — never as one more table
swept by the same horizon. Get this wrong and the purge is not a bug; it is
the deletion of the evidence that would have shown the bug.

## A retention policy is a promise with a shape

The naive form is a constant — ninety days, everywhere, in code. It fails
on contact with the second customer, because retention horizons are
commercial and regulatory facts, not engineering ones: one tenant is
contractually owed seven years, another wants nothing kept past a month,
and a third is in a regime that treats indefinite storage as a violation
in itself. The mature form is a **per-tenant policy with a safe default**:
a stored, per-tenant window; a default applied to every tenant that has not
chosen; and exactly one place in the system that resolves the pair into
the number a purge will act on. Two resolution sites is not redundancy —
it is a future incident in which the preview and the deletion disagree
about which tenant's data is expired.

One convention earns its keep in that resolution: a distinguished value
meaning **keep everything**, so "unbounded" is expressible in the same
field rather than through a second boolean nobody remembers to check. The
storage shape, the default-versus-override resolution, and the
keep-everything sentinel are the
[per-tenant-retention-policy](techniques/per-tenant-retention-policy.md)
technique.

## A configurable destructive knob needs a floor that refuses

Here is the load-bearing lesson, and most teams learn it the expensive way.
Once retention is per-tenant, some human types the number, and this field
converts a typo into irreversible loss on a schedule, unattended, with no
review between the keystroke and the deletion. A value intended as a
hundred, entered as a one, is not a misconfiguration producing a degraded
system; it is an instruction the next tick will carry out faithfully,
wiping nearly all of a tenant's history.

So the configuration path holds a **floor**, and its behaviour is the
distinction that matters: it **refuses**, it does not silently correct.
Clamping a below-floor value up to the minimum is the tempting design and
the wrong one — the stored configuration still holds the dangerous number,
nobody is told, and the misconfiguration persists invisibly until the floor
is raised or the clamp removed. Refusal means the tenant is **skipped**, an
error is raised into the run's result, and the run reports partial success
loudly enough to page a human. A deliberate short window stays possible,
but only behind an operator opt-in set out of band — an environment-level
flag, not a request parameter — because the person who typed the number
must not also be the one authorising a bypass of the check on it. And the
keep-everything sentinel is never floored: unbounded is the safe direction,
and flooring it would be the one case where the guard causes the loss. That
shape — refuse-not-clamp, skip and raise, out-of-band opt-in, sentinel
exemption — is the
[destructive-override-floor](techniques/destructive-override-floor.md)
technique.

## The purge is a resumable process, not a statement

A retention purge is not "delete where created_at < X". It is a long,
interruptible, partially-failing process that must survive being killed at
any instant and continue correctly on the next tick. Three properties
carry that.

It runs **inside a declared time budget derived from the runner's own
limit** — not a hand-tuned constant that drifts from the platform's kill
deadline the first time someone edits a deployment setting. Single-sourcing
the limit and the budget, and pinning the relationship with a test, is the
difference between a large tenant stopping cleanly at a batch boundary and
one being killed mid-transaction every night forever, never making
progress, while the dashboard shows a job that "ran".

It deletes in **bounded batches**, checking the budget between them, so the
unit of interruption is a completed batch rather than an open transaction.
Batching also bounds lock contention and replication lag — the two ways a
correct purge takes down the live product.

It reports a **partial summary** — what was deleted, per tenant, and
whether the run finished or ran out of budget — that distinguishes *nothing
to delete* from *could not run*. A purge reporting zero because it was
denied access looks identical, on a chart, to one reporting zero because
everything is inside its window; the first is an outage of the retention
obligation itself.

Two corollaries follow, because an unattended run is watched only by its
status. **Degraded is never green** — skipped tenants, an exhausted budget
or a lost record must all produce a non-success status. And **interruption
must not starve the same tenant forever**: once the budget regularly stops
runs short, the visiting order becomes a fairness mechanism, and only a
deterministic rotation bounds every tenant's wait. Budget derivation,
batching, resume semantics and honest reporting are the
[time-budgeted-batch-purge](techniques/time-budgeted-batch-purge.md)
technique.

## Irreversible actions are gated on the operator naming the target

For the destructive operations a human initiates — erase this tenant, purge
this workspace now — the confirmation must prove **comprehension of the
specific target**, not consent in the abstract. A yes/no dialog collects a
reflex. Requiring the operator to type the exact name of the thing being
destroyed collects a demonstration that they read it, and it is the only
confirmation that reliably catches the highest-frequency destructive error
in operations: acting on the right screen for the wrong account. The echoed
value is compared server-side against the same record the operation will
act on, because a check against a client-supplied copy of the name gates
nothing. Echo is one rung of a ladder: above it, authorisation — the
narrowest permission the product has — and below it, request-origin checks
that stop the operation being triggered cross-site by a page the operator
never visited, ordered cheapest-and-most-absolute first. The ladder and the
comparison rules are [confirm-by-echo](techniques/confirm-by-echo.md).

For unattended destruction there is no operator to confirm, so the
equivalent safety is **fail-closed authentication on the scheduler's entry
point**: an unauthenticated call must be refused, and a missing credential
in the environment must refuse *harder*, not fall through to open. A
destructive endpoint whose auth check is skipped when its secret is unset
is an internet-exposed delete button.

## Before it deletes, it can be asked what it would delete

Every retention path needs a mode that answers *what would this remove,
right now?* without removing it. The value is not reassurance; it is that
the preview is the only way to review a policy against real data before it
acts, and retention windows are set months before the unattended run that
finally matters.

The preview must be produced by **the same predicate the deletion will
execute**, in the same resolution path, or it is a second implementation
that will drift and reassure the operator with a number the deleter does
not share. Every number it emits carries what was counted and as of when,
because retention counts move continuously by construction. And a preview
is a forecast — rows cross the horizon between preview and execution —
which is why the executed run reports what it actually did rather than
assuming the preview held. Preview construction, drift disclosure and the
reporting contract are [dry-run-preview](techniques/dry-run-preview.md).

## Erasure is a different obligation from expiry

Expiry is the system acting on its own schedule. **Erasure** is an
externally compelled deletion of a specific subject's data, on a clock the
system does not control, arising under data-protection regimes in several
jurisdictions. Teams that treat erasure as "the purge, but with a
where-clause" discover the differences under a deadline:

- **It is targeted, not horizon-based**, so every store holding a copy is
  in scope — primary store, derived rollups, caches, search indexes,
  exports, and anything a third party holds on the system's behalf. That
  inventory is the actual work; the deletion is trivial beside it.
- **It must be provable** — which raises the question of what the proof may
  contain, since a record of erasure written in full detail re-creates the
  data it attests to destroying. The resolution is that the trail holds
  **identifiers, not attributes**: erasure removes what the identifier
  resolves to, leaving a trail that says an action occurred without saying
  who, in personal terms, it happened to.
- **Backups are a stated carve-out, not an omission.** Restoring a backup
  taken before an erasure resurrects the erased data. Mature practice states
  a bounded backup horizon, records erased subjects in a **deletion list
  replayed against any restored dataset before it goes live**, and documents
  the arrangement. Supervisory practice generally accepts backup data being
  put beyond use pending overwrite; it does not accept an undocumented gap
  between the retention schedule and the backup schedule.
- **Soft delete is not erasure.** A flagged row is retained data with a
  filter in front of it — a fine reversibility mechanism and a false
  compliance one, conflated because the code path looks the same. Where an
  erasure obligation applies, the row goes, or the identifying content
  within it does; if reversibility is genuinely needed, the honest design is
  a short stated grace window followed by a hard delete, not an indefinite
  flag ([deletion-is-not-repair](../_laws.md#deletion-is-not-repair) read in
  reverse — a delete that removes only the *visibility* of the data has
  changed the evidence, not the fact).

The store inventory, the proof-without-content record, the backup carve-out
and the grace-window design are the
[erasure-requests](techniques/erasure-requests.md) technique.


- [per-tenant-retention-policy](techniques/per-tenant-retention-policy.md)
  — stored per-tenant window, safe default, one resolver, the
  keep-everything sentinel.
- [destructive-override-floor](techniques/destructive-override-floor.md) —
  refuse rather than clamp, skip and raise, out-of-band opt-in, sentinel
  exemption.
- [time-budgeted-batch-purge](techniques/time-budgeted-batch-purge.md) —
  budget derived from the runner's limit, bounded batches, resume, partial
  summaries that distinguish empty from broken.
- [confirm-by-echo](techniques/confirm-by-echo.md) — type the target's
  exact name; server-side comparison against the real record; the guard
  ladder around it.
- [dry-run-preview](techniques/dry-run-preview.md) — same predicate as the
  deleter, counts that carry their horizon and as-of, drift disclosed.
- [erasure-requests](techniques/erasure-requests.md) — targeted deletion
  across an inventory of stores, proof without content, backup carve-outs,
  grace windows over indefinite flags.
