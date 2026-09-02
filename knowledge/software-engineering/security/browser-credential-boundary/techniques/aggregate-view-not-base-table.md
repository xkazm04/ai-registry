---
layer: technique
type: technique
subject: browser-credential-boundary
technique: aggregate-view-not-base-table
status: forged
laws: [gate-sees-target, derivation-names-recomputation]
shared_with: []
use_when: [a public client needs counts computed from identifying rows, revoking a browser grant that a feature still depends on, a view is about to be published to an anonymous role]
---

# Publish the aggregate, revoke the base table

A browser feature almost never needs the rows. It needs a number derived from
them: how many, how much, which option leads. The rows underneath carry
identifiers — who voted, who signed up, which account did what — and a grant
that lets an anonymous caller compute the number also lets them enumerate the
identifiers, because under a client-held credential the caller writes their own
query.

The move is to publish the **derivation** and revoke the **source**: a view
that returns only the aggregate, granted to the browser-facing role, with the
grant on the identifier-bearing table underneath removed. The feature keeps
working, and the enumeration endpoint stops existing. Note what changed and
what did not — the data is identical, the exposure is not — which is why this
reads as a schema change and behaves as a security fix.

## The view must evaluate as its caller

A view has an identity when it reads its base tables, and the default in most
engines is the **view's own author** — who typically has broad privileges,
precisely because they were the one writing schema. Such a view reads straight
past the row-level policies on its base tables, for every caller, forever. It
is a policy bypass with a friendly name, and the reason it survives review is
that nothing about the view's definition mentions security.

So the view is declared to run with the **invoker's** identity: the policies on
the base tables are evaluated for whoever is querying, exactly as if they had
queried the table directly. This is
[gate-sees-target](../../../_laws.md#gate-sees-target) in its literal form —
the policy engine is the gate, and a definer-evaluated view points it at the
wrong principal, so it returns a green answer about somebody else's
permissions. Confirm the setting on the deployed object rather than trusting
the migration text; it is a property with a default, and defaults are how this
one is usually wrong.

Two consequences follow that surprise people:

- The view's own grant is necessary but not sufficient. The caller needs the
  grant on the view *and* a policy on the base table that lets them see the
  rows the aggregate is computed from. An aggregate over rows the caller may
  not read does not fail; it returns a *wrong number that looks like a
  result* — a grouped aggregate returns no groups, an ungrouped count returns
  zero, an ungrouped sum returns null — and the feature renders a tally of
  nothing without a single error anywhere
  ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
  A suite for the view asserts the expected count, never mere success.
- The invoker option is recent. In the most widely deployed open-source
  engine it arrived in the 2022 major and is off by default; a deployment
  pinned to an older major has no caller-evaluated view at all, and the
  choice collapses to column-level grants or the privileged routine below.
  Read the engine's major before designing around the view.
- If the aggregate must be visible to callers who may *not* read the underlying
  rows — the common case for a public tally — the base table needs a read
  policy for that role that is narrow enough to be harmless, or the aggregate
  belongs to a stored routine that is deliberately privileged, documented as
  such, and takes no caller-controlled predicate. Do not reach for the
  privileged routine first; it re-creates the definer problem with more steps.

## The aggregate names its recomputation

A published aggregate is a derived value, and derived values owe an answer to
"how is this recomputed"
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).
A view answers it by construction: the definition *is* the recomputation, and
it cannot drift from the source because it has no stored copy to drift from.
That is the strongest reason to prefer a view over the alternative teams reach
for under load — a counter column on a parent row, maintained by triggers or by
application code, which is a second copy of the truth with no arbiter and a
well-known failure mode of slowly going wrong in a direction nobody notices.

If the view is too expensive and the aggregate must be materialized, then the
refresh path is part of the design: what recomputes it, on what schedule, and
how a reader knows how stale the number is. Materializing without answering
those three is how a public tally freezes at a number from last Tuesday and
nobody finds out until someone counts by hand.

## The alternative worth recording: column-level grants

There is a second way to keep a browser off the identifying columns without
introducing a view: grant read on **specific columns** rather than on the
table. It is narrower to reason about — no new object, no evaluation-identity
question — and it is the right choice when the browser genuinely needs rows and
merely must not see two of the fields.

It is the wrong choice when the exposure is the *rows themselves*: a
column-restricted grant still lets a caller enumerate one row per underlying
record, which for a table of participation records leaks the very fact you were
protecting. Aggregation collapses that; column grants do not.

Whichever is chosen, **record the one you did not choose and why**, in the
migration. This decision gets revisited every time someone needs one more field
in the browser, and an unrecorded rationale means the revisit starts from
scratch and usually ends at "just grant the table".

## Revoking is the half that is usually skipped

Creating the view and switching the client to it is the easy, visible half. The
security change is the **revoke**, and a migration that adds the view without
removing the base-table grant has changed nothing: the old endpoint is still
there, still anonymous, still returning identifiers, and now it is also
untested because no client uses it.

Order matters and has a precondition. Any server-side caller still reaching
that table through the browser's public role must have its own privileged
credential in place *before* the revoke lands, or the revoke is an outage. Say
so in the migration, at the top, where the person about to run it will read it
— a script that assumes a precondition without naming it will be run before the
precondition holds.

## When not to use this

**When the client needs the rows for a legitimate feature.** A user reading
their own records is not an aggregation problem; that is a row-level policy
keyed to their identity, and replacing it with a view hides the real question.

**When the aggregate itself is sensitive.** Counts leak. A tally of one reveals
its member; a tally that changes by one between two observations reveals a
single action; a set of aggregates sliced finely enough reconstructs the rows
they came from. If the grouping is fine-grained, either coarsen it, apply a
minimum-cell rule, or accept that the aggregate is as sensitive as the rows and
protect it accordingly.

**When the table holds nothing worth hiding.** A public, non-sensitive
reference table is fine to read directly, and wrapping it in a view for
symmetry adds an object with a security-relevant setting and no security
benefit. Leave it — and write down that leaving it was a decision.
