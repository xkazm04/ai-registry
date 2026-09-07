---
layer: technique
type: technique
subject: deferred-finalization
technique: recomputable-draft
status: forged
laws: [derivation-names-recomputation, count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [building the pre-final version of an artifact that will later be issued, someone asks to edit a provisional total, deciding how often a provisional artifact should be rebuilt]
---

# The provisional artifact is rebuilt, never amended

A pre-final artifact of this kind is defined by one property: **it is a pure
function of its inputs and the moment it was computed.** Give it the same
inputs and it produces the same content; change an input and the next
recomputation reflects the change without anybody touching the artifact. It
holds no state of its own beyond its identity and its computation watermark,
and that is what makes it disposable enough to be cheap and honest enough to
be shown to a customer.

Everything below is a consequence of taking that property literally. Each
rule exists because a system that broke it produced an artifact that looked
live and was not.

## The recomputation is a replacement, not a merge

**Rebuild the derived content wholesale: discard the previous derivation and
write the new one.** The tempting alternative — walk the existing lines,
update the ones whose inputs moved, insert the new ones — is wrong in a way
that only shows up in the rarest and most embarrassing direction: an input
that was **withdrawn**. A corrected usage record, a cancelled subscription
item, a charge that turned out to belong to a different payer — under a merge
these leave a line behind that no current input supports, and that line is
now unattributable. Nobody can tell it from a legitimate one, because a
derived artifact carries no evidence of where its rows came from unless it
was rebuilt from them.

Two obligations follow from replacement:

- **The rebuild is atomic.** Discard and rewrite inside one transaction, or a
  concurrent reader sees an artifact with half its lines and a total that
  matches neither state. A provisional total is still shown to a human.
- **Identity of the artifact survives the rebuild.** The container keeps its
  identifier across every recomputation — links to it stay valid, and the
  history of when it was recomputed stays attached to one thing. It is the
  *content* that is replaced, not the artifact.

## It carries a watermark, and the watermark is not a timestamp alone

A derived artifact must be able to answer *what it saw*
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
The minimum is a **computed-at** time. The useful form adds the **input
boundary the computation used**: the latest input timestamp included, or the
cursor position in the input stream. Those are different facts and the
difference is exactly what an operator needs during an incident:
"recomputed five minutes ago" says the job ran; "recomputed five minutes ago
over inputs up to two hours ago" says the ingestion pipeline is behind and
the number on screen is stale for a reason that has nothing to do with the
recomputation schedule.

A total that travels — into an interface, an export, a notification, an API
response — carries that boundary with it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
provisional figure without its as-of is indistinguishable from a final one
the moment it is copied into a spreadsheet, which is where it always ends up.

## Nobody edits it, including support

**There is no write path into a recomputable artifact's derived content.**
This is a structural rule, not an access-control one: it is not that editing
is restricted to privileged staff, it is that the artifact has no field an
edit could survive in. The two failure modes are exhaustive and both are bad.

- If the edit does not suppress recomputation, the next scheduled rebuild
  discards it silently, because a total replacement has no notion of a line
  that was special. The person who made the correction is not told; they find
  out from the customer.
- If the edit does suppress recomputation — a flag that pins the artifact,
  a manual-override mode — then the artifact has stopped tracking its inputs
  while still being presented as though it tracks them. Every downstream
  reader that was written against the invariant "this is a view of current
  inputs" is now wrong about this one artifact, and there is no way to tell
  from the outside.

So a request to change a provisional number is routed to the **input** that
produced it: correct the underlying record, void the underlying line item,
apply the credit as its own object, change the subscription. Then the
artifact recomputes and agrees, and — this is the part that pays — the
correction is recorded where corrections belong, in the input's own history,
rather than as an unexplained delta on a derived document.

The one legitimate escape is not an edit either: if the correction genuinely
cannot be expressed as an input, that is a signal the input model is missing
a concept (an adjustment, a manual line, a one-off charge). Add the concept
as a first-class input the artifact derives from. A manual line item that is
*an input* is fine; a manual line item that is *an edit to the output* is the
defect.

## A provisional total is not a receivable

The most expensive class of bug in this technique is not in the artifact, it
is in the systems downstream of it that fail to distinguish provisional from
issued. A provisional total must never be:

- collected against, or sent to a payment processor;
- counted in recognized revenue, in a receivables balance, or in any figure
  reported outward;
- used to trigger dunning, service suspension, or an over-limit action;
- exported in a format whose consumer cannot see that it is provisional.

The reliable way to enforce that is not documentation but **shape**: the
provisional and issued artifacts are distinguishable by a status every query
must filter on, and the aggregate queries that feed reporting are written
against the issued set explicitly rather than against everything-minus-what-
we-remembered-to-exclude. A reporting query that reads the whole table and
subtracts is
[gating a proxy](../../../../_laws.md#gate-sees-target): it passes review and
silently starts including provisional totals the day someone adds a new
pre-final status.

## Cadence, and what makes it right

The recomputation runs on a schedule, and the interval is a trade between
freshness and cost, not a constant to be copied:

- **Bound the freshness the artifact promises, then pick an interval under
  it.** If the surface says "updated continuously", minutes; if it says
  "updated daily", the cheaper schedule is honest and correct.
- **Recompute cost scales with the input volume of the open period**, and
  that volume is largest at period end, which is exactly when finalization is
  also running. Size the schedule for the peak, not the average, or the two
  jobs collide on the busiest day of the cycle.
- **Recompute only what can have changed** — see the invalidation rule below,
  which is what keeps the interval affordable as the tenant count grows.
- **Overlapping runs must not both write.** A rebuild that takes longer than
  the interval is normal under load; the second run either waits or skips,
  and which one it did is recorded. Two concurrent total replacements of the
  same artifact produce interleaved content that matches no input state.

## Invalidation is declared by the input, not discovered by the scheduler

The scheduler should not be scanning for work. The strong form of "recompute
only what changed" puts the decision at the **write door of each input**:
every service that mutates something a provisional artifact derives from —
a rate definition, a tax rule, a plan, a metric definition, the payer's tax
configuration — marks the affected artifacts as needing recomputation as part
of its own transaction. The scheduled pass then selects only the marked ones,
and clears the mark inside the rebuild's transaction.

This is worth the small tax at each input site for three reasons. It makes
the recomputation cost proportional to change rather than to inventory, which
is the difference between a job that scales with tenants and one that does
not. It makes the *reason* a rebuild happened attributable. And it turns a
question that is otherwise unanswerable — "which of these thousands of
artifacts is stale?" — into a stored fact.

Two obligations come with it, and skipping either is where the pattern turns
back into a guess:

- **The set of marking sites must be enumerable**, because an input path that
  forgets to mark leaves an artifact silently stale — exactly the failure the
  provisional stage exists to avoid. Enumerating the writers of each input is
  the same discipline a mutable store owes its validation
  ([one door, enumerable writers](../../../../_laws.md#one-validation-door)),
  applied to invalidation.
- **The finalization path rebuilds unconditionally**, ignoring the mark. That
  single decision is what makes a missed mark a freshness bug during the
  window instead of a correctness bug in an issued record: whatever the marks
  said, the artifact is derived once more from current inputs immediately
  before it is frozen. Design the backstop deliberately; it is cheap, it runs
  once per artifact, and it converts the weakest link in the scheme into a
  cosmetic defect.

## The one interaction that must be exclusive

Recomputation and finalization race, and the race is not theoretical: the
recomputation reads inputs, computes, and writes, while finalization decides
the artifact is done and freezes it. Interleaved, they produce an issued
record whose content came from a computation that started before the freeze
and landed after it — the one state the whole pattern exists to prevent.

**Finalization takes the artifact out of the recomputable set as its first
act, inside the same transaction that will freeze it**, and every
recomputation re-checks the status inside its own write transaction rather
than relying on the status it read at the start. A rebuild that finds the
artifact already final abandons its work; that is cheap, and it is the only
correct outcome.

## When not to use this

- **When the artifact's inputs cannot change after it is created.** A
  point-of-sale receipt, a confirmation of a completed transfer, a document
  issued in the same breath as the act it describes — there is nothing to
  wait for, and a provisional stage adds a state with no purpose.
- **When a human is the author.** If the content is somebody's typed intent
  rather than a derivation, the buffer disciplines of the document-drafting
  subject apply and none of this does: their draft *should* survive
  everything, and a scheduled process that overwrote it would be data loss.
- **When the recomputation cannot be made total.** If the artifact
  accumulates something genuinely unreproducible — an externally assigned
  reference, a captured approval, a countersignature — that thing is not
  derived content and must live outside the replaced set, or the technique
  does not apply and the artifact needs a different model.
