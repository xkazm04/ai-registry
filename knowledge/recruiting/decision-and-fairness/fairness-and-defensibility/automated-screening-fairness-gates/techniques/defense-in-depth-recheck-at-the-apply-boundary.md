---
layer: technique
type: technique
subject: automated-screening-fairness-gates
technique: defense-in-depth-recheck-at-the-apply-boundary
status: forged
laws: [no-adverse-outcome-is-solely-automated, uncertainty-resolves-toward-the-candidate, every-decision-names-its-actor]
shared_with: []
use_when: [wiring an automated decision to the code that actually changes a candidate record, adding a new caller to an existing decision path, reviewing whether a fairness rule can be bypassed]
---

# Defence in depth: recheck at the apply boundary

## The concern

The place a fairness rule is *computed* and the place its outcome is *applied* are
different code, usually in different layers and often in different runtimes: a scoring
pipeline decides, a persistence layer moves the candidate. Everything between them is a
transport, and transports are trusting. Every new caller of the apply function — a bulk
tool, a re-match sweep, an import, a retry, a manual admin path, a refactor that inlined
the decision to remove a round trip — is an opportunity to arrive at the boundary
carrying an outcome that never passed the gate.

The technique: **re-derive the invariant at the boundary where the action lands**, from
the candidate's own record, and refuse there. The apply path does not ask whether the
gate ran; it asks whether this action is permitted for this person, right now.

## The procedure

1. **Identify the true boundary.** It is the narrowest place through which a candidate's
   state actually changes — one function, one endpoint, one transaction. If there are
   three such places, that is the first finding; collapse them before adding checks to
   each.
2. **Re-derive, do not re-read.** The check consults the candidate's classification and
   the policy, not a flag the caller passed in. A caller-supplied "already checked"
   parameter reconstructs exactly the trust you are trying to remove.
3. **Downgrade rather than reject the request.** When an adverse automated action arrives
   for a shielded or unclassifiable candidate, convert it to hold and continue. The
   candidate is safe and the caller's work is not lost.
4. **Never silently apply, never silently drop.** Those are the two failure modes, and
   they are symmetric: applying loses the shield, dropping loses the candidate. The
   downgrade is the only correct third answer.
5. **Emit the refusal as an audited event** with the proposing actor, the rule, and the
   substituted outcome — see the companion technique. The boundary is where you learn
   which caller is misbehaving, and it is the only place that can name it.
6. **Assert the boundary in tests as a property, not a scenario.** The valuable test is
   "for every shielded classification, an adverse action submitted to the boundary
   results in hold" — enumerated over the taxonomy, so a new archetype cannot be added
   without the test forcing a decision about it.

## Decision rules

- **When the check at the boundary is redundant with the gate upstream, keep it.** That
  redundancy is the entire point. A rule enforced once is enforced until the next commit.
- **When re-deriving costs a lookup per decision, pay it.** The action is irreversible
  and consequential; the read is neither. If the cost genuinely matters at your volume,
  cache the classification with the candidate record — do not remove the check.
- **When the caller is a human-approved bulk action, the boundary still applies.** A
  human approving a cohort does not un-shield its members; it satisfies the "not solely
  automated" requirement for the candidates who were eligible, and the boundary is what
  keeps ineligible ones out of the batch. The neighbouring bulk subject owns the approval
  token and the drift check; this boundary is what those mechanisms land on.
- **When a downgrade fires, the applied outcome's actor is the system, not the proposing
  human.** [Every consequential decision names its actor](../../../../_laws.md#every-decision-names-its-actor):
  record that the automation refused, and do not attribute the resulting hold to whoever
  submitted the batch.
- **When the candidate's classification cannot be determined at the boundary, refuse the
  adverse action.** The boundary inherits the fail-closed rule; a lookup failure is not
  permission ([uncertainty resolves toward the candidate](../../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When the boundary starts refusing at scale, do not raise its threshold.** A spike is
  a defect report about a caller. Find the caller.

## The mirrored-threshold trap

The boundary usually has to restate a number that lives upstream — the reject floor, the
confidence bar, the aging horizon. Two rules keep the copy from becoming a hole:

- **Mirror it in the safe direction and say which direction that is.** The boundary's
  copy is a *backstop ceiling*: it refuses anything at or above it. So it must stay at or
  above the upstream floor. If the upstream floor rises and the mirror does not, the
  backstop starts spuriously downgrading legitimate decisions — noisy but safe. If the
  relationship inverts, the backstop silently permits what it exists to refuse. Write the
  inequality in a comment at the constant, and pin it from both sides with a test in each
  language or service that holds a copy.
- **Better still, do not mirror.** A single served configuration both sides read at
  runtime removes the class of bug entirely. Mirror only where a process boundary makes
  that genuinely impossible, and then treat the pair as one artifact with one owner.

## Preview and commit share one encoding

Where the boundary sits behind a dry run — a preview of what a sweep would do — the
refusal must be computed by the **same function the commit calls**, with the wording as
the only difference ("would be refused" versus "refused"). A preview that forecasts
outcomes the commit can no longer produce is worse than no preview: a recruiter shown a
forecast of rejections who then receives none has been told a fact about candidates that
turned out to be false, and will trust the next forecast less. One encoding, two
callers, identical every other byte.

## What "re-derive" actually means

Three things must be recomputed at the boundary rather than trusted:

- **Membership in the shielded set**, from the candidate's stored classification and the
  single source of the protected set — not from a field on the request.
- **The permissibility of the action itself**, from the policy: is this action type
  routable at all, and is the relevant automation enabled for this workspace right now.
  A policy toggled off between decision time and apply time must take effect; the
  decision is a proposal, and the policy at apply time governs.
- **The freshness of the decision.** An outcome computed against a record that has since
  changed — new evidence attached, stage advanced, candidate withdrawn — is stale, and a
  stale adverse action is applied against a person who is no longer the person it judged.
  Re-derive or refuse.

## When NOT to use it

- **Not as a replacement for the upstream gate.** The pre-score gate avoids producing the
  adverse verdict at all, which saves the spend and keeps the record clean. The boundary
  is the second layer, not the only one; a system that only checks at the boundary has a
  scoring pipeline routinely generating rejections it may not use, and that record is
  itself a liability.
- **Not on non-adverse, reversible actions.** Tagging, ranking, surfacing and notifying
  do not need a second enforcement point; adding one everywhere trains people to see the
  check as boilerplate and to skip it where it matters.
- **Not as a place to make new decisions.** The boundary refuses and downgrades; it does
  not score, re-rank, or choose an alternative outcome. Logic that grows here becomes a
  second, undocumented decision engine — and the one place nobody thinks to audit.
- **Not without the audited event.** A boundary that refuses silently is indistinguishable
  from a boundary that was never reached, and it cannot satisfy the deployer's obligation
  to demonstrate that
  [no adverse outcome is solely automated](../../../../_laws.md#no-adverse-outcome-is-solely-automated).
