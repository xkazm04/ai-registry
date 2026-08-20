---
layer: technique
type: technique
subject: candidate-consent-and-retention
technique: read-time-gate-not-just-the-sweep
status: forged
laws: [uncertainty-resolves-toward-the-candidate, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [enforcing consent expiry, designing a retention sweep, deciding where a compliance control lives]
---

# Read-time gate, not just the sweep

## The concern

Retention policies are almost always implemented as a scheduled job that finds
expired records and clears them. That job is the only thing standing between an
expired candidate and a recruiter's screen — and scheduled jobs stop. They stop
in fresh deployments where nobody registered the schedule, in single-tenant
installs where the worker was never started, after a migration that renamed the
queue, and silently in production for weeks because nobody alerts on the
*absence* of deletions.

The fix is not better scheduling. It is to move the control to a place that
cannot fail to run: **the read path**. Every place identifying data leaves the
store, a predicate evaluates the record's consent state and withholds the
identifying fields when the state says withhold. The sweep stays, demoted to
what it always should have been — an optimisation that shrinks the store and
reduces blast radius, not the control.

## The predicate

One function, one name, used everywhere: *does this record's consent state
withhold personal data right now?* It answers from the record's own fields —
state, expiry timestamp, anonymisation marker — evaluated against the current
time. It takes no configuration that a caller can pass wrongly, and it has no
"skip" argument.

It returns true when:

- the consent state is expired, withdrawn, erased, or anonymised;
- the expiry timestamp is in the past regardless of what the state column
  says, because a state column is only as fresh as the job that last wrote it;
- the consent state is missing, unrecognised, or unparseable.

It returns false — data flows — when consent is active, and when the record is
in its pre-expiry notice window. That window deserves its own status value
rather than being folded into "active": the interface needs to warn, the
renewal prompt needs to fire, and an operator needs to see which records are
about to lapse. Thirty days is a workable default; the requirement is that the
person has real time to act, not that the number is thirty.

It also returns false for a record that **never had a consent flow because it
is held on a different basis** — a recruiter-sourced profile, for instance.
That is not the same as a missing state, and collapsing the two is a real bug
in both directions: treat "never applied" as "withheld" and half the database
goes dark for no legal reason; treat "unreadable" as "never applied" and
expired records serve names. Distinguish absent-by-design from
absent-by-corruption in the type, not by inspecting a nullable column at each
call site.

The unreadable clause is the one people argue about and it is not negotiable. A
record whose consent state cannot be determined is not a record with consent —
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence).
An unrecognised state value means either data corruption or a newer writer this
reader does not understand; both resolve the same way, because the cost of
withholding a name from a recruiter for an afternoon is a support ticket and
the cost of the reverse is a disclosure of personal data with no basis. This is
[uncertainty resolving toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)
applied to a read.

## Where the gate sits

Put it at the boundary where a record becomes output — the projection layer
that turns a stored row into something a caller sees — not in each caller. A
gate implemented as a convention ("remember to check consent before rendering
a name") is a gate with as many holes as it has call sites, and the newest call
site is always the one that forgot.

**Decision rule.** If a code path can produce a candidate's name, contact
detail, or source document, it must be downstream of the projection that
applies the predicate. If a path needs raw access — the erasure worker, an
export the candidate themselves requested — it obtains it through a distinctly
named accessor whose name says it bypasses the gate, so the bypass is greppable
and reviewable rather than incidental.

Applies equally to: list and search results, ranking and rediscovery
candidates, exports and reports, notification payloads, model prompts, and
analytics extracts. The prompt case is worth naming on its own — a name
withheld from the screen but included in the text sent to a model has not been
withheld, it has been forwarded to a third party.

## The sweep, correctly demoted

Keep the sweep. It still earns its place:

- it reduces the amount of identifying data at rest, which is the thing that
  actually limits the damage of a breach;
- it makes the store's contents match its policy, so an audit sees consistency
  rather than a live argument about whether a filter really covers everything;
- it is where the expiry-notice step lives, since notices must go out *before*
  expiry and nothing triggers on a read that never happens.

Two rules keep the sweep honest. **Terminal records are not exempt**: a
rejected, withdrawn or hired candidate whose consent lapsed is scrubbed exactly
like an active one — the temptation to skip "closed" rows is how a database
accumulates its oldest and least defensible holdings. And **the finder crosses
organisational partitions while the mutation stays scoped**: the query that
locates due records deliberately spans every tenant, because a retention
obligation is not per-customer, but each scrub runs inside the partition of the
record it found. Inverting that — a per-tenant finder invoked by a scheduler
that only knows about one tenant — is how whole customers quietly fall out of
the retention regime.

What changes is the failure semantics. If the sweep has not run for six weeks,
expired records still show no names. Test that explicitly: a test that disables
the sweep entirely and asserts the gate still withholds is the test that proves
which component is the control.

## Instrument the absence

Sweeps fail silently because success is quiet and failure is quieter. Alert on
the sweep not having completed within its interval, not on it erroring — the
error case is the one you already see. And record, per run, how many records it
found expired; a sudden zero on a large database is a broken query, not a clean
one.

## When not to use this

- **Do not use the gate as a reason to skip the sweep.** Read-time withholding
  leaves the data at rest, still in backups, still in the blast radius of a
  breach, and still available to anyone with direct store access. The gate is
  the control; the sweep is the risk reduction. Neither substitutes.
- **Do not gate the candidate's own view of their own data by consent expiry.**
  A person asking what you hold about them is exercising a right, not reading a
  candidate record, and their process must not stall on your state machine.
- **Do not gate the legal-claims carve-out set.** Those records are held
  deliberately under an enumerated exemption, and a blanket read-time withhold
  applied to them makes the exemption useless exactly when it is needed. Route
  them through their own, narrower access path.
