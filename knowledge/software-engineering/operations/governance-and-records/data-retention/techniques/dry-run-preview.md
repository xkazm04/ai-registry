---
layer: technique
type: technique
subject: data-retention
technique: dry-run-preview
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [rolling out a retention window, adding a destructive operation, an operator asks what a purge would remove]
---

# Dry-run preview

A mode of a destructive operation that answers *what would you remove right
now?* and removes nothing. It is not a comfort feature. It is the only way
to review a retention policy against real data before the policy acts, and
retention policies are configured months before their first consequential
run, unattended, on data nobody has looked at.

## Same predicate, or it is a lie

The preview is a **mode of the deleter**, not a second implementation that
counts. One code path resolves the window, computes the cutoff, and selects
the population; a flag decides whether the selection is counted or deleted.

The reason is not elegance. A parallel counting implementation gates against
a proxy rather than the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)), so it passes review
exactly when it has drifted from the deleter — and it drifts on the first
change that touches only one of them: a new exclusion, a changed timestamp
field, a population added to the sweep. A preview whose numbers the deleter
does not share does worse than nothing, because it produces confident
approval of an operation nobody has actually inspected.

Practical consequences of that rule:

- The preview runs with the same tenant resolution and the same population
  list.
- The **safety floor is the one guard the preview deliberately does not
  enforce** ([destructive-override-floor](./destructive-override-floor.md)).
  This looks like an inconsistency and is the opposite: showing an operator
  what a below-floor window would destroy is precisely the question the
  preview exists to answer, and it is the evidence they need before deciding
  whether to opt in. A preview that reported zero for a refused tenant would
  hide the very number that justifies the refusal. The preview reports the
  yield *and* labels the policy as below floor.
- The preview reads with the same access scope. A preview run with broader
  privileges than the purge will report rows the purge cannot touch.
- Where the deletion cascades, the preview counts the cascade's yield, not
  just the top-level rows. Previewing a thousand and deleting sixty thousand
  is a preview that misinformed. Where enumerating the dependents is too
  expensive to do per preview, say so in the output — "dependent rows not
  enumerated" is honest; a zero in that column is a lie the reader cannot
  detect.

The result itself must be **stamped as a preview**, in the payload and not
only in the request that asked for it. A summary that reads identically
whether it deleted or counted will eventually be pasted into a ticket as
proof of what happened. For the same reason a preview writes none of the
destructive path's side effects — no accountability record of a purge that
did not occur, no counters advanced — because a trail entry claiming a
deletion that never happened is worse than a missing one.

## Every number carries its predicate

Retention populations move continuously by construction — rows cross the
horizon while you read the screen — so a preview number without its
qualifiers is unusable within minutes
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). Emit,
with each count: the population it counts, the window applied and where the
window came from, the computed cutoff moment, and the as-of timestamp of the
count itself.

Break the total down by population and by tenant rather than reporting one
figure. A single number hides the case the operator most needs to see — that
99% of the deletion falls in one population, or on one tenant, which is the
signature of a misconfiguration rather than a routine sweep.

## Disclose the drift honestly

A preview is a forecast, and saying so is part of the technique. State that
the executed run may differ, and design so the difference is bounded and
visible:

- **The execution reports what it actually did**, and that report is the
  record of truth. The preview is never retained as the account of what
  happened.
- Where the gap between preview and execution can be made small, make it
  small — present the preview and the confirmation on the same screen, and
  compute the preview at the moment the screen renders rather than serving a
  cached figure.
- For genuinely high-stakes operations, re-run the preview server-side at
  execution time and **abort if the yield exceeds the previewed figure by
  more than a stated tolerance**. The operator consented to destroying
  roughly this much; a tenfold surprise is not the thing they consented to.
  This turns the preview from advice into a guard.

## Two audiences, two shapes

- **Operator-facing**, attached to a confirmation ladder
  ([confirm-by-echo](./confirm-by-echo.md)): human units, casualties and
  survivors both named, and the survivors said out loud — "these will be
  kept" is as important as "these will go", because the fear that stops
  people from deleting is uncertainty about what else goes with it.
- **Engineer-facing**, invoked as a mode of the runner before a policy
  change ships: machine-readable, per tenant, diffable between two candidate
  windows. Running the preview against production data with the *proposed*
  window is the review step that catches the horizon nobody modelled.

## When not to use this

- **Reversible operations with a restore path**; the restore *is* the
  preview, and the ceremony costs more than it returns.
- **When the preview itself is expensive enough to harm the live system.**
  A full-scan count on a huge table run per screen render trades a rare
  destructive risk for a constant availability risk; use a bounded or
  approximate count, and label it as an estimate rather than pretending to
  precision.
- **As a substitute for the floor or the confirmation.** A preview informs;
  it does not refuse. A system whose only safety is that someone could have
  looked has no safety at all on the unattended path.
