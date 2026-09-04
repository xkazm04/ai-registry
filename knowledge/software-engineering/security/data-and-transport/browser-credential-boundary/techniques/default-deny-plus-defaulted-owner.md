---
layer: technique
type: technique
subject: browser-credential-boundary
technique: default-deny-plus-defaulted-owner
status: forged
laws: [one-validation-door, failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [switching row-level policies on for a table a browser reaches, a client must write rows it then owns, a write that used to work starts being refused]
---

# Default-deny, and let the identity default itself

Under a client-held credential, the store's policy engine is the only
enforcement point, and it has one property that makes it trustworthy: switching
it on for a table with **no policies written** denies everything to every
non-privileged role. Not "denies writes", not "denies unlisted operations" —
returns nothing, accepts nothing. That is the correct resting state, and it is
also the correct final state for every table the browser has no business
touching.

"Non-privileged" carries one exemption people forget: the **table's owner**
is not subject to its own policies unless the table is explicitly told to
force them. A runtime role that also ran the migrations owns every table and
walks past every policy, and nothing in the policy set says so. Either the
runtime never connects as the owner — the normal hosted arrangement, where
the browser-facing role owns nothing — or the table is set to force row
security and the exemption is closed at the object. Confirm which of the two
holds; it is a property of the deployment, not of the policy text.

So the posture is two rules that fit on one line each. **Policies on for every
table in the reachable schema, without exception** — including the ones you are
sure are unreachable, because "unreachable" is a claim about grants that a
future migration will quietly falsify. And **zero policies for the anonymous
role unless a feature demands one**, at which point the policy is written as
narrowly as the feature needs and no wider.

This is [one-validation-door](../../../../_laws.md#one-validation-door) in a form
that cannot be bypassed by a forgotten call site, because the door is not in
your code. Every writer, yours and everyone else's, passes the policy engine.
The corresponding obligation is that the policy set has to be right, since
there is no second layer behind it.

## The owner column defaults from the authenticated identity

The common write case is "the caller creates a row that belongs to them", and
the naive implementation has the client send its own identifier and the policy
check that the sent value matches the authenticated one. It works, and it is
strictly worse than the alternative for three reasons: the client can send a
different value (the policy catches it, but now refusal is a runtime error
path the UI must handle), the identifier is now part of the client's write
contract (so every writer must know how to obtain it), and the check exists in
two places that can disagree.

The better shape: the owner column **defaults to the authenticated identity, in
the schema**. The client sends the payload without an owner. The store fills it
from the session, and the policy checks the same session value against the same
column. The client never sends what the policy checks, so it cannot forge it,
cannot omit it, and cannot get it wrong. A whole class of "the write failed for
a user we can't reproduce" disappears.

Two details make it work in practice. The default must be evaluated per
statement, not captured at schema definition. And a client library that
helpfully populates the owner from its own session state undoes the benefit by
re-introducing a client-sent value — so the write path is written to *omit* the
column deliberately, with a comment saying why, because it looks like an
oversight to the next reader.

## Write the policies for the statements that actually run

Policy sets are read as declarations of intent and behave as a conjunction over
the operations a statement performs. The gap between those two readings is
where working code starts failing, and one case accounts for most of it: an
**insert-or-update** statement is checked against the insert policy *and*, when
it takes the conflict path, the update policy — and the read policy besides, if
anything in the statement returns rows.

The practical consequence is blunt. If a client writes with an upsert and the
table has only an insert policy, the first write for a given key succeeds and
every subsequent one is denied. That reads to the user as "my change did not
save", to the developer as an intermittent bug, and to the operator as nothing
at all, because a policy refusal is not an application error. Write the update
policy in the same change as the insert policy, or make the client's write path
a plain insert and handle the conflict yourself.

Related, and equally common: a write that returns the written row needs a read
policy too. A client library that requests the row back by default turns every
insert into an insert plus a select, and a table with a write policy but no
read policy refuses at the second half of an operation the developer thinks of
as one.

## Assert refusal, not just permission

A denied read returns an empty result set. A denied write, in the common
client shapes, returns a refusal that is easy to swallow. Neither is
distinguishable, from the outside, from the benign case
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)) — so
a test suite that checks "the legitimate caller still sees its rows" passes
identically against a table with policies off, policies on and correct, and
policies on and accidentally universal. It is a test of your client, not of
your boundary.

The suite that means something has three shapes per table, and connects as the
**public role itself** rather than as a privileged one
([gate-sees-target](../../../../_laws.md#gate-sees-target)):

- The legitimate caller reads what it should and **not one row more** — assert
  the count and the absence of the rows belonging to others, not merely
  non-emptiness.
- The anonymous caller reads **nothing** from every table that is not
  deliberately public, and the assertion is on emptiness *and* on the table
  having been queried at all, so a typo in the table name cannot pass as a
  security result.
- The forbidden write is **refused**, asserted as a refusal with the expected
  class, not as an absence of change.

Run it against the deployed schema, as the role the browser uses, on the same
key the bundle ships. A suite run as the migration's own privileged role proves
nothing: that role is exempt from the policies by design.

## Record the deliberate non-actions

Not everything gets locked down, and the tables you leave readable on purpose
are decisions with reasons — a public reference list, a non-identifying tally,
seed data that is on the marketing site anyway. Write each one down where the
policies are defined, with the reason and the property that makes it safe
("public, non-identifying, no user content"). An unrecorded exception is
indistinguishable from an oversight, which costs twice: the next audit
re-litigates it, and eventually someone "fixes" it into an outage.

## When not to use this

**When your code is the only client.** If every request passes a server you
control, the policy engine is defense in depth and your dispatch gate is the
mechanism — a different subject with different tools, and pushing the whole
authorization model into policy predicates there buys expressiveness you will
fight.

**When the rule is not row-shaped.** Rate limits, cross-row invariants, and
multi-step workflows do not express well as per-row predicates; forcing them in
produces policies nobody can read, and unreadable policies are edited
carelessly. Put those behind a broker route and keep the policy set small
enough that a reviewer can hold all of it at once.
