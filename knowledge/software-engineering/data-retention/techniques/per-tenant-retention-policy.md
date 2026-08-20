---
layer: technique
type: technique
subject: data-retention
technique: per-tenant-retention-policy
status: forged
laws: [one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [adding a configurable retention window, replacing a hardcoded cleanup horizon, resolving which window applies to a tenant]
---

# Per-tenant retention policy

The stored answer to "how long do we keep this tenant's data?", plus the
single resolver that turns that stored answer into the number a purge acts
on. The technique exists because retention horizons are commercial and
regulatory facts that differ per customer, while the code that deletes must
see exactly one number — and the gap between those two statements is where
the mistakes live.

## The shape

Three parts, and all three are required:

1. **A per-tenant stored window**, nullable or absent by default, in days
   (or whatever unit the domain reasons in — pick one and never mix).
   Absent means "has not chosen", which is different from "chose zero".
2. **A system default** applied to every tenant that has not chosen. It is
   a named constant with one definition
   ([one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary)),
   not a literal repeated at each call site, and it is chosen
   conservatively: the default is what every silent customer gets, so it
   errs long, not short.
3. **One resolver** that takes a tenant and returns the effective window.
   Every consumer — the scheduled purge, the preview, the settings screen
   that displays "your data is kept for N days", any export tooling — calls
   it. Two resolution sites means the preview and the deletion can disagree
   about which rows are expired, which is the exact discrepancy nobody
   notices until after the delete.

The resolved value should carry its provenance where the surrounding code
can afford it: the window, the source (tenant setting or default), and the
cutoff moment it computes to. A bare integer arriving at a delete predicate
has already lost the information an operator will need to explain a result,
and the settings screen that says "kept for 90 days" cannot say whether
that is a choice or an inheritance.

## The keep-everything sentinel

Reserve one distinguished value — zero is the natural choice — meaning
**retain indefinitely**. The alternative, a separate boolean beside the
number, produces four representable states for a two-state concept and a
permanent question about what a window of 30 means while the boolean says
unbounded. One field, one vocabulary.

The sentinel also answers a question every retrofit faces: **what is the
default when retention is introduced into a system that has never had it?**
The answer is the sentinel — unbounded — for everyone, so that shipping the
feature deletes nothing and each customer opts in deliberately. A rollout
whose default horizon starts deleting existing data on the first tick after
deploy is a migration that destroys data, and it will be discovered by the
customer rather than by the release notes.

Two rules follow and both are load-bearing:

- The sentinel **short-circuits before any cutoff is computed.** Never let
  "keep everything" flow into arithmetic that a later refactor could turn
  into a cutoff of *now*, which deletes everything. The most catastrophic
  retention bugs are sign and sentinel errors, not logic errors.
- The sentinel is **exempt from the safety floor**
  ([destructive-override-floor](destructive-override-floor.md)). Flooring
  it would be the one case where the guard causes the loss it exists to
  prevent.

## Populations are declared, not implied

A tenant's retention window does not automatically apply to everything with
that tenant's identifier on it. Declare the **populations** the window
governs and, explicitly, the ones it does not: operational events, derived
rollups, and the accountability trail typically have different obligations
from each other, and the trail in particular may be the customer's evidence
rather than the system's exhaust. Write the list down next to the resolver;
an undeclared population is one that either grows forever or gets swept by
a horizon nobody chose for it.

Populations also differ in the *shape* of window that suits them, and a
mature policy carries more than one. An **age window** ("older than D") is
the shape obligations are written in and the right default for
event-shaped data. A **keep-the-newest-N per parent** window is the shape
that bounds a population whose growth rate varies wildly between tenants —
one busy parent cannot evict a quiet one's history, and the storage cost
becomes a function of the number of parents rather than of activity. Where
both apply, they are separate settings on the same policy, resolved
together and previewed together; collapsing them into one number forces the
noisiest tenant's needs onto everyone.

Each declared population also names the field the horizon is measured
against, and that field must be **immutable after write**. Measuring
expiry against a last-modified timestamp produces a population that can
un-expire when someone touches a row, and a purge whose result is not a
function of time alone is not auditable.

## Where the policy is enforced

The reaper is named at the same place the population is created
([creation-names-reaper](../../_laws.md#creation-names-reaper)): a new table
that accumulates per-tenant rows ships with its retention answer, even if
that answer is "governed by the tenant window" or "never expires, and here
is why". This is a design-review question, not an incident-review question.
Enforcement itself is scheduled rather than at insert, because the volumes
retention deals with cannot be trimmed inline without paying an unbounded
cost on a user-facing write — which is precisely the trade a high-volume
ledger makes differently, and a good reason to keep the two mechanisms
distinct rather than pretending one generalises.

## Decision rules

- **When a horizon differs by customer contract or jurisdiction, store it
  per tenant** — a constant in code cannot be answered for in a compliance
  review, because nobody can show what applied to whom last March.
- **When you cannot justify a specific default, choose the longer one and
  write down why** — over-retention is a policy problem that can be fixed
  next quarter; under-retention is a loss that cannot.
- **When a consumer needs "is this row expired?", route it through the
  resolver** rather than reimplementing the comparison, however trivial the
  comparison looks.
- **When the window changes, treat the change as an effective-dated event**,
  not an in-place edit, if the product must later explain what policy was in
  force at a past moment.

## When not to use this

- **Single-tenant or fixed-obligation systems.** If one horizon genuinely
  governs everything and always will, per-tenant configuration adds a
  dangerous knob for no benefit — the safest configuration surface is the
  one that does not exist.
- **Extremely high-volume append ledgers** whose bound must be an invariant
  rather than a nightly convergence; those want enforcement on the insert
  path, which is a different mechanism with a different owner.
- **Data with a legal hold.** A hold suspends expiry regardless of the
  tenant's window; if holds exist in the domain, they are a separate
  predicate that the resolver must consult, and a per-tenant window that
  can silently override a hold is worse than no configuration at all.
