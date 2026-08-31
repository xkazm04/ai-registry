---
layer: technique
type: technique
subject: delivery-analytics
technique: revert-linkage
status: forged
laws: [identity-survives-reuse, count-carries-predicate]
shared_with: []
use_when: [deriving a failure signal from change history alone, reporting a revert or change-failure rate, tying a failure back to the change that caused it]
---

# Revert linkage

A revert is the cheapest failure signal available from change history alone —
and the only *terminal* one, which is both its strength and its limit: it
arrives after the decision it might have informed, and a team that repairs
rather than undoes emits none at all. What that team emits instead is a repair
stream, read by
[post-landing-repair-density](./post-landing-repair-density.md). Recognition and
linkage below are shared machinery; both signals need them.

A revert
needs no incident tracker, no deployment record, no post-mortem culture, and no
cooperation from the team being measured: someone decided a merged change had
to be undone, and the act of undoing left an artifact. That makes it the
cheapest evidence in the subject — and the most frequently overstated.

Two operations, and they are not the same:

- **Recognition** — deciding that a given change *is* an undo of something.
- **Linkage** — identifying *which* change it undid.

Recognition alone yields a revert count. Only linkage yields the findings worth
having: the size of what failed, whether it was reviewed, what produced it, how
long it survived. A revert rate without linkage tells you a number went up; a
linked revert tells you unreviewed changes over the large-batch threshold are
where your undo events come from, which is an action.

## Recognition

The reliable signals, in decreasing precision:

1. **A structured reference to the reverted change** in the message — the
   conventional generated form carries the original identifier verbatim. This
   is the only channel that gives recognition and linkage in one step.
2. **A conventional message prefix** without a usable reference — recognizes,
   does not link.
3. **A proposal explicitly titled or labelled as a revert** by its author.
4. **An inverse diff** — the change exactly undoes an earlier one. Expensive,
   and the only channel that catches hand-written reverts.

Two shapes must be handled deliberately because they corrupt naive counts:

- **Revert of a revert.** A restore of previously-reverted work is recognized
  as a revert by every signal above. Counted naively, one indecisive afternoon
  produces two failures. Follow the chain: an even-depth chain nets to
  *restored*, and only the odd-depth tail is a live undo.
- **Bulk reverts.** One undo commit can retract many changes. It is one event
  and *n* affected changes; which of the two the metric counts must be stated,
  because the two numbers can differ by an order of magnitude on the week that
  matters most.

## Linkage identity

Linkage rests on an identifier of the reverted change surviving the operations
history actually performs on it — squash, rebase, cherry-pick, mirror,
re-import. This is [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)
in a domain that violates it constantly. A squash merge replaces the commit
identifiers a revert message might name; a re-imported repository renumbers
proposals. So linkage keys on the most durable identifier available and
**records which one it used**, and a link that cannot be resolved is stored as
*unresolved*, never dropped: an unresolved link is a known failure with an
unknown cause, and deleting the row converts it into no failure at all.

## The undercount is part of the metric

Every one of these fails to produce a revert artifact:

- a **fix-forward** patch that corrects the defect instead of undoing it — in
  many mature teams the dominant response, which means the best-run
  repositories can show the lowest revert rates for the wrong reason;
- a **rollback at the deploy layer** — the running system is restored, the
  change history is untouched;
- a **feature flag turned off**, which is a rollback with no code event at all;
- a defect that was **never noticed**.

Therefore: a revert rate is a **lower bound on one failure mode**, and it must
be labelled as one. Presenting it as a change-failure rate — the four-metric
delivery framework's term, which means *deployments causing degraded service* —
is a category error that survives review because both numbers are small
percentages with plausible shapes. If a report wants a change-failure rate, it
needs deployment and incident data; if it only has history, it reports a revert
rate and says what that excludes
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Decision rules

- **When linking by title rather than by identifier, require the target to have
  merged before the revert.** Titles are not unique; without the temporal
  guard, two identically-titled changes link backwards and a revert is recorded
  against work that had not happened yet. Identifier matches are unambiguous
  and need no such guard.
- **When several undo events target the same change, the earliest wins.** The
  first roll-back is the rework event; later re-reverts do not move it, and
  letting them do so makes the metric depend on how long the argument lasted.
- **When the revert chain nets to restored, exclude the pair from the failure
  count and keep both events in the timeline.** The churn is real and worth
  seeing; the failure is not two.
- **When a revert cannot be linked, count it in the rate and exclude it from
  every breakdown by cause.** Breakdowns that silently drop unlinked reverts
  will disagree with the headline rate, and the reader will trust the more
  detailed one.
- **When the reverted change is outside the measurement window, still resolve
  the link.** Time-to-revert is one of the few genuinely informative
  derivations here — a change reverted within an hour and one reverted after
  three weeks describe different failures — and windowing the lookup destroys
  the long tail, which is the interesting half.
- **When a repository's revert count is zero, do not report a 0% failure
  rate.** Report "no revert events observed" with the sample size. Zero
  observed events in a small population is not a claim about reliability.
- **When automation performs reverts (an automated rollback bot), separate
  them.** Automated and human undo decisions have different meanings and
  different latencies; merged, they make time-to-revert bimodal and its median
  meaningless.

## When not to use this

Do not use revert rate to compare teams with different rollback cultures. A
team that reverts readily and a team that fixes forward differ in policy, not
in reliability, and the metric ranks the cautious team as worse. Cross-team
comparison on this metric requires establishing that both practise undo the
same way — which usually means asking, not measuring.

Do not use it as a gate. Making revert rate a target is the fastest known way
to eliminate reverts without eliminating defects, and a team that has learned
not to revert has lost the cheapest recovery tool it had — deleting the
artifact that exposes the defect rather than fixing the defect.

Do not use inverse-diff detection on generated or vendored content, where
mechanical regeneration routinely produces exact inverses that no human
intended as an undo.
