---
layer: technique
type: technique
subject: requisition-lifecycle-governance
technique: headcount-approval-as-a-precondition
status: forged
laws: [every-decision-names-its-actor, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [deciding what must be true before a role may open, designing an approval chain for hiring, a role reached final interview with no funded seat behind it]
---

# Headcount approval as a precondition

A requisition is a spend commitment before it is a document. Someone with
budget authority has agreed to fund a seat — for a period, at a band, against a
plan. Until that agreement exists and is recorded, the role may be drafted and
may not be opened.

This is the precondition most hiring software does not implement, and the one
whose absence is most expensive, because the cost is paid at the *end* of the
process by the people with the least power in it. A role opened without a
funded seat runs normally: candidates apply, are screened, interview, reach a
final panel — and then the offer cannot be made. The organisation loses the
cycle. Several candidates lose weeks against an outcome that was never
available to them, which is exactly the shape
[a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
exists to forbid.

## What an approval has to carry

A boolean `approved` field is not an approval. It cannot be audited, cannot
expire, and cannot say who is on the hook. The record needs four things:

1. **A named approver, or an ordered chain of them.** Not a role name, a
   person, with the moment they approved —
   [every decision names its actor](../../_laws.md#every-decision-names-its-actor).
   Chains are ordinary here: a manager, a function head, a finance owner, and
   for some roles an executive.
2. **A requisition class.** A **backfill** replaces a seat that already exists
   in the plan because someone left it; the money is already allocated and the
   chain is usually short. A **net-new** requisition expands the organisation
   and needs a longer chain, because it changes the plan rather than executing
   it. Conflating the two either makes every backfill wait on an executive or
   lets every expansion through on a manager's nod. The class must be recorded,
   not inferred, and a backfill should name the seat it replaces — an
   unattached backfill is a net-new role wearing a cheaper approval path.
3. **An attached band or budget.** The compensation range the organisation can
   actually offer, attached at approval time. Two things depend on it: the
   offer at the end of the process is one the approver already agreed to, and
   the advertisement can state a range honestly rather than inventing one. The
   substance of pay ranges and market honesty belongs to a sibling; what
   belongs here is only that the number is attached to the *approval*, so that
   nobody has to guess it later.
4. **An expiry.** An approval granted for a quarter is not an approval granted
   for ever. Plans change, budgets are re-cut, the person who approved it
   leaves. An expiring approval turns a stale role into a decision someone must
   consciously renew, which is a second, quieter force pushing dead
   requisitions towards closure.

## The procedure

- **The gate sits on the draft → live edge only.** Drafting a role that is not
  yet approved is not just permitted, it is the normal path: the draft is
  usually what the approver reads. Enforcing approval at save would mean
  approving something that does not yet exist.
- **The approval binds to a snapshot of the role, not to the role for ever.**
  What was approved was a role at a level, in a location, at a band. If the
  level or the band changes materially after approval, the approval no longer
  covers what the role has become and the chain re-runs. Editorial changes to
  the description do not; the test is whether the change alters what the
  approver committed money to.
- **An expired or revoked approval closes the role rather than freezing it in
  place.** A live role with a dead approval is the unapproved-role failure with
  extra steps.
- **An override must have a door with a name on it.** There will be legitimate
  urgent cases. The right answer is an explicit, attributed override — recorded
  as a decision by a person — not a back path through an interface or an API
  that opens the role with no trace. A gate people learn to route around has
  become a formality, and the route around is never the audited one.

## Decision rules

- **When the role's approval cannot be found, do not open the role.** A missing
  approval is not a lenient default; it is the one case where refusing costs
  less than proceeding.
- **When the class is unstated, treat it as net-new.** The stricter chain is
  the safe failure. Inferring backfill from a recent departure is the kind of
  convenience that produces unfunded expansion.
- **When a role is re-opened after closing, re-run the approval.** The seat may
  have been reabsorbed; the reopened role is a new span and needs a new
  commitment.
- **When approval is pending, say so on the role rather than rendering it as
  live-but-broken.** Pending is a legible state to its owner and an invisible
  one to everyone else.
- **When an organisation genuinely has no budget process** — a very small team,
  a founder hiring — do not fabricate one. Record an owner for the role and
  keep the expiry; the owner is the smallest honest version of an approver.

## When not to use this

- **Where the hiring system is not the system of record for headcount.** If a
  finance or planning system owns the approval, this gate reads that system's
  answer; it does not re-implement the chain. What it must not do is drop the
  precondition because the data lives elsewhere.
- **For internal moves and transfers** that consume no new headcount, the
  approval question is a different one (releasing manager, not budget) and this
  chain is the wrong instrument.
- **As a quality gate.** Approval certifies that the seat is funded. It says
  nothing about whether the brief is defined, whether the requirements are
  inflated, or whether the role will fill — three separate judgements with three
  separate owners.
