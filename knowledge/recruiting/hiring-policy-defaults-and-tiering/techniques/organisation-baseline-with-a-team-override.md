---
layer: technique
type: technique
subject: hiring-policy-defaults-and-tiering
technique: organisation-baseline-with-a-team-override
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds]
shared_with: []
use_when: [designing where hiring policy is stored, a team asks for different thresholds, answering "what is our company's hiring policy" with a value]
---

# Organisation baseline with a team override

## The concern

Hiring policy must be both singular and local. Singular, because an organisation that
cannot state its policy in one place does not have one; local, because a company hiring
warehouse staff and research scientists through one set of numbers is either blocking the
first or waving through the second.

The failure this technique prevents is precise: **every team quietly running its own
thresholds, with nobody able to say what the company's policy actually is.** It never
arrives as a decision. It arrives as reasonable local adjustments, discovered years later
by someone who needed a single answer and found forty.

The mechanism is two tiers with real inheritance: **one organisation-default configuration
as the company baseline, and a per-team override expressed as a sparse delta against it.**

## The shape

- **Exactly one row is the organisation default.** Not "the first one created", not "the
  one with a null team" by accident — an explicit, unique, enforced marker, because the
  identity of the baseline is the single most important fact in the store and inferring it
  from a null is how a team configuration becomes the company policy after a migration.
- **A team configuration stores only what it changes.** Absent keys mean inherited, not
  zero, not false, not "use the type's default". This distinction is the whole technique:
  a sparse delta inherits future baseline changes; a full copy does not.
- **Resolution is one function, used everywhere.** Effective policy for a team is the
  baseline merged with that team's delta, computed by a single resolver that every reader
  calls — the screening pass, the recruiter surface, the audit export, the settings page.
  A second resolution path is a second policy.
- **The resolution rule is stated, not discovered.** Deltas override key by key at the leaf,
  never by replacing a whole nested object, because object-level replacement silently drops
  the baseline's siblings — the classic form of this bug is a team that overrode one
  threshold and thereby cleared the confidence floor it never mentioned.

## The procedure

1. **Create the baseline at organisation creation, from the shipped defaults, as an actual
   stored row.** A baseline that exists only as code constants cannot be versioned, cannot
   record who changed it, and cannot be shown on a screen. Materialise it.
2. **Declare which keys are overridable.** The overridable set is itself policy: the
   automation posture, statutory floors and required gates are baseline-only; thresholds
   and role-family adjustments are typically overridable. Enforce it on write — a delta
   containing a non-overridable key is rejected, not silently ignored.
3. **Bound the deltas.** An override may usually only move a value in the *safer*
   direction, or within a stated band around the baseline. A team that needs to go outside
   the band is asking for a policy change, and that request should reach the person who owns
   the baseline rather than being satisfiable locally.
4. **Record every write with its actor and its previous value**
   ([every consequential decision names its actor](../../_laws.md#every-decision-names-its-actor)).
   A policy change is a decision about every candidate the team will ever see.
5. **Show inheritance in the interface.** Each value displays as inherited or overridden,
   with the baseline value visible alongside the local one, and the name and date of the
   override. A number without provenance cannot be reviewed, and
   [say only what the record holds](../../_laws.md#say-only-what-the-record-holds) applies to
   a settings screen exactly as it applies to a candidate's file: do not render an inherited
   value as though this team chose it.
6. **Make the deviation set queryable in one call.** "Show me every team that differs from
   baseline, in what, since when, by whom" must be a single answer. If producing it requires
   diffing rows by hand, the governance layer is decorative.
7. **Review deviations on a schedule.** Every override is a standing exception; exceptions
   accumulate. A quarterly pass that either folds an override into the baseline or removes it
   keeps the number small enough to read.

## Omission is not erasure

The hardest bug in this model appears when a configuration is written **wholesale** by a
surface that predates one of its fields. The form submits the whole object, the new key is
simply not in it, and the write clears an override the organisation deliberately set —
with no error, no event, and no way to notice until outcomes change.

The rule: **an absent key in a wholesale write means "no opinion", not "clear".** Carry
forward the stored value for keys the writer did not mention, and keep clearing
*expressible* — an explicitly empty value clears, so the operation still exists for anyone
who wants it. This is the same three-state discipline defaults need (absent, explicitly
set, malformed), applied to writes rather than to reads, and it is what lets an old client
and a new field coexist without a migration.

The alternative designs both fail: patch-only writes make "remove this override" hard to
express, and full-replace writes make every stale client a data-loss event.

## Deleting a dimension is a read-time prune, not a rewrite

When a structural element disappears — a stage removed, a family retired, a phase dropped
— the stored overrides pointing at it become orphans. Prune them **at read time** and let
the next ordinary save persist the pruned shape. Do not rewrite storage as a side effect
of a read: a read that writes turns every viewer into a mutator, destroys the ability to
tell what was actually configured from what a migration decided, and runs the correction
under whatever actor happened to be looking.

Prune, do not delete outright, where the removed element still appears in history. A
retired element keeps its label so past records resolve to something a human can read
instead of a raw identifier.

## Policy must be keyed by the thing it governs

A subtle and expensive failure: policy keyed by the *kind* of a thing rather than by the
thing itself. One gate stored per step-role, when the process may legitimately contain two
steps of that role, means the second step silently shares the first one's rule — and any
interface offering a per-step control is writing a shared value while appearing to write a
local one. That is worse than having no control, because the operator believes they made a
local change and the record will show they did.

Key every policy entry by the identity of the element it governs. Where the identity space
allows duplicates, the policy must too.

## Decision rules

- **When a team asks for different numbers, first ask whether the baseline is wrong.** Most
  override requests are the organisation discovering that its central value was set for a
  different kind of work. Folding it into the baseline, or into a role-family adjustment,
  serves more people and leaves fewer exceptions.
- **When an override would weaken a protection, refuse it at the layer.** Safety values move
  one way from below: a team may be stricter than the baseline, never more permissive. This
  turns the tiering into a ratchet and removes the most common abuse.
- **When a delta and the baseline conflict on a key the baseline later removes, drop the
  delta and log it.** An orphaned override is a live rule pointing at a dimension that no
  longer exists; leaving it in place produces behaviour nobody can explain.
- **When migrating from per-team configurations to this model, do not seed teams with full
  copies.** Compute each team's delta against the new baseline and store only that. Seeding
  copies preserves the fragmentation you migrated to fix, with a governance layer on top of
  it.
- **When a team is deleted or re-organised, its delta does not silently move.** Re-parenting
  a team under a different part of the organisation changes which baseline it inherits, and
  that is a policy change that needs an actor.
- **When you find yourself wanting a third tier for a sub-team, stop.** Depth is where
  inheritance models become unreadable; the answer is usually a role-family adjustment at the
  baseline, which is reviewable, rather than another level of local override, which is not.

## Why two tiers and not more

The tiering is deliberately shallow because its purpose is *answerability*, and
answerability degrades with depth faster than with breadth. Two tiers means any effective
value is explainable in one sentence — "this is the company baseline" or "this is the
baseline, overridden by this team on this date by this person". Three tiers means the
explanation requires a trace, and a policy that requires a trace to state is one nobody
will state.

There is one exception that is not really a tier: the role-family adjustment, which lives
*inside* the baseline as named occupational overrides rather than as a level of the
hierarchy. That keeps occupational variation centrally visible instead of scattering it
across the teams that happen to hire each occupation.

## When NOT to use it

- **Not for values that are genuinely per-requisition.** The brief, the rounds chosen from
  the permitted set, the timeline: those belong to the requisition and modelling them as
  policy overrides makes the deviation list useless noise.
- **Not for a small organisation with one hiring team.** Ship the baseline alone until a
  second team actually needs to differ. An override mechanism with no overrides is
  maintenance cost and an attack surface on the policy.
- **Not as a permissions model.** Who may *edit* which layer is an access-control question
  that the general engineering practice owns; this technique defines the layers, not the
  authorisation. Conflating them produces a system where the person with write access is
  treated as the person accountable for the policy, and those are rarely the same person.
