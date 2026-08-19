---
layer: technique
type: technique
subject: organizational-grant-readiness
technique: multi-org-workspace-scoping
status: forged
laws: []
shared_with: []
use_when: [adding teams or consultant-managed clients to a single-user applicant tool, choosing the tenancy key for readiness data, validating which organization a request may act in]
---

# Multi-org workspace scoping

The technique is the tenancy design that lets a readiness tool grow from
"one user, one organization" to teams, consultant-managed client portfolios,
and fiscal-sponsor umbrellas — without migrating existing data and without
opening cross-tenant holes. Readiness data is unusually sensitive to
scoping mistakes: profiles, financials, evidence corpora and attestations
all describe one legal entity, and a query that leaks across the boundary
shows one organization another's finances.

## The migration-free identity trick

The founding move: **a solo user's organization id IS their user id.** Every
piece of readiness data is keyed by organization id from day one — but for
the v1 single-user model, that id is simply the authenticated user's own id.
The payoff arrives when teams land: inviting a teammate means resolving that
teammate's active-organization to the owner's id, and *every
already-organization-scoped query becomes shared with zero rewrites*. There
is no backfill, no dual-read period, no "tenant_id nullable for legacy
rows". Existing solo data is untouched because it was correctly keyed all
along.

The model extends the same way to portfolios: a user may own several
organizations (one per client). Additional organizations get generated ids
decoupled from any user id, each with an owner-membership row; the user's
primary organization keeps id-equals-user-id so nothing existing moves. The
general lesson: **key everything by the tenancy unit from the first commit,
even while the unit is degenerate.** The cost while solo is one conceptual
indirection; the cost of retrofitting is every query in the codebase.

## The active-organization boundary

With multiple reachable organizations, every request must resolve *which
one it acts in*, and that resolution is a security boundary, not a UI
preference:

1. **Compute the allowlist server-side.** The set of organizations a user
   may act in: every membership's organization id, plus their own id (a
   user can always reach their own solo organization). This set is derived
   from persisted membership rows on every resolution — never cached in
   the client, never asserted by it.
2. **Treat the client's selection as a hint, validated against the
   allowlist.** The chosen active organization travels as client state (a
   cookie, a header). On every request the server checks it against the
   allowlist; a value not in the set is *ignored* — not errored, ignored —
   and resolution falls back to a deterministic default. A forged or stale
   selection can therefore never scope reads or writes to another tenant.
   This is the insecure-direct-object-reference guard, and it lives in one
   resolution function that every read and write path flows through.
3. **Default deterministically.** No valid selection → a pure team member
   defaults to their team's organization; everyone else defaults to their
   primary organization. The default must be stable and explainable,
   because it decides what a confused session silently acts on.
4. **Resolve once per request.** Cache the resolution for the request's
   lifetime so every query in one request agrees on the tenant; re-resolve
   on the next. Cross-request caching of the resolution reintroduces the
   stale-selection window step 2 closed.

## Decision rules

- **When adding any new readiness table or store, key it by organization id
  on day one, because** the one unkeyed table becomes the one feature that
  cannot be shared, and its retrofit lands during the team launch when
  there is least room for it.
- **When roles arrive, start with two** (owner, member) **and gate only
  clearly destructive or boundary-crossing acts on ownership, because**
  fine-grained permission matrices in a tool for three-person nonprofits
  are configuration nobody sets; add granularity when a real workflow
  demands it.
- **When a fiscally sponsored program joins, model it as its own
  organization whose identity fields reference the sponsor's, because**
  collapsing sponsor and program into one workspace makes the sponsor's
  identifier and the program's voice fight over the same fields.
- **When tempted to enforce the boundary in the UI** (hiding other
  organizations' data), **enforce it in the resolution function anyway,
  because** the UI is one consumer; server actions, exports, and background
  jobs all read the same stores and must hit the same wall.

## When not to use

Do not build multi-organization machinery speculatively into a tool whose
product thesis is single-organization — the trick this technique teaches is
precisely that correct day-one *keying* buys the option cheaply, so the
switcher UI, invites and membership rows can wait until a real second
tenant exists. And do not use workspace scoping as an isolation substitute
for per-field provenance: two organizations correctly separated can still
each hold unsourced facts; the boundaries solve different problems.
