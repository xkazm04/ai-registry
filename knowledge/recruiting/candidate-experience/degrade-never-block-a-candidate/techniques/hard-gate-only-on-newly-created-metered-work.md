---
layer: technique
type: technique
subject: degrade-never-block-a-candidate
technique: hard-gate-only-on-newly-created-metered-work
status: forged
laws: [say-only-what-the-record-holds, a-candidates-process-never-stalls-on-your-constraints]
use_when: [deciding whether an action should refuse or degrade under quota, adding a paywall to a hiring workflow, a partial execution would look like a full one]
---

# Hard-gate only on newly created metered work

## The concern

"Degrade, never block" read as an absolute produces a system that lies. If an
operator asks to publish a role and the system, being over quota, publishes it to one
channel instead of five and says nothing, the operator now owns a false belief about
their own pipeline. Two weeks later they will conclude the market is dry, lower the
comp band, or cancel the requisition — reasoning from a distribution that never
happened.

So the standard needs a principled boundary for where an honest refusal is the
*kinder* answer. It is not "expensive things block". It is: **an action that creates
new metered work, whose partial execution is indistinguishable from full execution,
must refuse rather than under-deliver.**

Blocking these is honest. Silently doing less produces data the operator thinks
exists and does not — which is
[say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)
inverted into a product behaviour.

## The test

Ask three questions of the action. If the answer to all three is yes, it hard-gates.

1. **Does it create work that did not exist before?** Publishing a role, launching an
   outreach sequence, commissioning a work sample, starting a bulk re-score, opening a
   new requisition. Contrast with reading, enriching, summarising or presenting
   something already in the record.
2. **Would a partial result be indistinguishable from a complete one?** If the
   operator, looking at the resulting artefact a week later, cannot tell whether it
   ran fully — it hard-gates. A half-published role looks exactly like a
   fully-published role with no applicants.
3. **Is the initiator someone who can resolve the refusal?** If not, this is a
   candidate action and the mirror technique applies instead: debit, do not gate. The
   actor test always dominates
   ([a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).

Everything failing question one or two degrades: run the deterministic floor and
declare it.

## The procedure

1. **Make the refusal explicit and typed.** A payment-required outcome, distinguishable
   from a permission failure, a validation failure and an outage. A caller — including
   a surface written next year — must be able to branch on the reason without parsing
   a message string.
2. **Refuse before any side effect.** Check at the top of the creation path, before
   the first write, the first outbound call, the first record. A gate that fires
   halfway through creates exactly the partial artefact it exists to prevent.
3. **Say what was refused, what it would cost, and what would unblock it.** The
   refusal is a commercial conversation with someone who can act on it. "Quota
   exceeded" is a dead end; naming the limit, the current usage and the upgrade path
   is the whole point of choosing refusal over degradation.
4. **Reserve the worst case, not the typical case.** The gate must check the most the
   later debit can possibly charge for this one action, and that ceiling must be
   single-sourced with the debit itself. A gate that reserves a nominal amount while
   the debit clamps to a multiple of it is not a gate — it is a formality that lets
   the largest charges through on exactly the accounts nearest their limit.
5. **Subtract work already reserved but not yet debited.** Between passing the gate
   and recording the debit there is a window; concurrent requests inside it all read
   the same remainder, all pass, and collectively overrun a cap everyone believed was
   hard. Count in-flight reservations in the check, and leave no suspension point
   between counting them and creating the new reservation.
6. **Leave nothing half-live.** If the creation is multi-step and a later step is
   refused, roll the artefact back to a state the operator can read as *not created* —
   a draft, not a published thing missing pieces.
7. **Never let a refusal reach a candidate.** A blocked creation must not surface as a
   broken application form, a dead scheduling link, or an unexplained error on a
   candidate surface. If a role could not be published, it is not visible; it is never
   visible-but-broken.
8. **Audit the refusal.** A blocked creation is an operational event worth counting.
   A spike tells the account team that a customer is hitting their ceiling — which is
   the healthy version of the conversation that overage billing otherwise starts by
   surprise.

## Decision rules

- **When the action's product is a durable artefact others will reason from, refuse
  rather than degrade.** The cost of a refusal is a conversation; the cost of a silent
  partial is a wrong decision made confidently, months later.
- **When the action's product is a rationale, a summary, a ranking garnish or an
  enrichment on an existing record, degrade rather than refuse.** These have an honest
  deterministic floor, and blocking them hard-fails a read in the middle of a pipeline
  for no gain.
- **When one workflow contains both — a creation step and an enrichment step — split
  the enforcement.** The creation step gates; the enrichment step degrades. Do not let
  one enforcement decision cover a mixed workflow, because it will be wrong for half
  of it.
- **When in doubt about whether partial execution is detectable, assume it is not.**
  Operators do not audit artefacts for completeness; they read them.

## When not to use it

- **On anything a candidate initiates**, without exception. If a candidate action
  happens to create metered work — an application creating a candidate record, an
  acceptance creating a hire — the actor test wins and the work is debited.
- **On reads and presentations, however expensive.** Cost is not the criterion;
  detectability of partial execution is. An expensive read still degrades.
- **Where a partial result is genuinely legible as partial** — a paginated export that
  states it returned the first N of M, a channel list that shows which distributions
  succeeded. If the artefact carries its own completeness, degradation is honest and
  refusal is unnecessary friction.
- **Where the refusal cannot be acted on by its recipient.** An automated background
  job that hits a limit should raise to the account owner, not silently refuse and
  leave a queue backing up behind it.
