---
layer: technique
type: technique
subject: remediation-handoff
technique: evidence-based-auto-close
status: forged
laws: [gate-sees-target, failure-not-empty-success, derivation-names-recomputation]
shared_with: []
use_when:
  - closing findings without a human confirming the work
  - deciding what counts as proof that remediation landed
---

# Evidence-based auto-close

Auto-close is the decision to mark a finding resolved **because of something
observed in the codebase, not because anyone said so**. It is what makes the
handoff a loop rather than a list: the operator hands work out, the work
lands somewhere unseen, and the next routine observation of the codebase
discovers that it landed.

The discipline's single premise is that the closing observation must see the
target itself ([gate-sees-target](../../_laws.md#gate-sees-target)). A close
driven by a status field, a form submission, or a report the executor wrote
about itself is not evidence — it is a proxy, and it diverges from the
codebase exactly when someone is mistaken or optimistic, which is the moment
the closer existed for. Re-run the analysis that raised the finding, over the
branch that counts, and read the result.

## The two admissible signals

**1. A resolution claim in the durable history.** A marker naming the
finding's identifier appeared in the sampled commits
([resolution-trailers](resolution-trailers.md)). High confidence, exact
match, deterministic. Close on it directly.

**2. The finding is no longer raised.** The fresh assessment, run over the
same codebase with the same rubric, does not produce this finding again.
This is inference, and it is *good* inference for a specific structural
reason: the assessment is regenerated from scratch each run, so its output is
a statement about the codebase as it is now, not a mutated copy of last run's
list. If the current codebase no longer produces the finding, the condition
that produced it is gone. Whether it is gone because someone fixed it or
because the code was deleted is a distinction the finding itself cannot make,
and mostly should not.

There is no admissible third signal. In particular, elapsed time is not
evidence, an executor's self-report is not evidence, and an operator's
memory is not evidence — though a manual control for all three is necessary
(below).

## The preconditions the naive version skips

Signal 2 is safe only when three things hold, and each is a real trap.

- **The assessment must actually have run.** An analysis that failed, timed
  out, hit a rate limit, or ran over an empty checkout produces zero
  findings, and zero findings would auto-close the entire ledger. This is the
  most expensive lie automation tells
  ([failure-not-empty-success](../../_laws.md#failure-not-empty-success)):
  assert the instrument before interpreting the result, and refuse to apply
  any close rule to a run that did not complete its analysis of that
  codebase.
- **The comparison must be over the same scope.** A fresh run restricted to a
  subdirectory, a branch, or a subset of categories does not produce the
  findings outside its scope, and treating that silence as resolution closes
  everything the run did not look at. Only a run whose scope matches the
  ledger's scope may close by absence — which in practice means only
  authoritative full runs of the assessed branch write resolutions at all.
- **Matching must be strict enough.** Deciding that a finding was "not
  raised again" is a matching problem, and a loose matcher will pair the old
  finding with an unrelated new one and conclude, wrongly, that it is still
  open — or worse, carry a claim onto it. The rules are
  [claim-carry-forward-rules](claim-carry-forward-rules.md).

## Every close records its mechanism

An auto-close writes a record on the item stating *which* rule fired —
claimed by a marker in a named commit, or no longer raised by a named run —
and when. This is not audit theatre. It is the answer to the only question
anyone asks about an automated closure, which is "why does this say done?",
and without it the loop is untrustworthy in exactly the way that makes people
turn it off. The status is a derived value, and a derived value names how it
was derived and how it could be recomputed
([derivation-names-recomputation](../../_laws.md#derivation-names-recomputation)).

Write the resolution onto the *current* state of the ledger — the resolved
item is carried onto the new run's row set as closed — rather than leaving it
to be reconstructed by a query across runs. A ledger you have to join across
history to read is one whose "resolved" count will eventually disagree with
itself.

## Keep the manual control

Auto-close covers the fixes the analysis can see. It cannot see a fix that
landed without a marker and left the wording similar enough to be restated;
it cannot see a fix that is correct but that the rubric still scores as a
gap; it cannot see a finding that was wrong to begin with. So the surface
keeps per-item resolve, dismiss and reopen controls, operated by a human, and
records those closures as human closures. The two mechanisms coexist and are
distinguishable in the record. A dismissal, in particular, is a different
outcome from a resolution and must not be collapsed into it — dismissed means
*we decline this finding*, and the difference is the only feedback the
assessor will ever get about its own precision.

## Decision rules

- **When a marker names the item, close it as resolved by marker**, even if
  the finding is also still restated — an executor's explicit claim outranks
  the rubric's opinion, and if the rubric is right the finding returns next
  run as a fresh open item.
- **When the run did not complete for that codebase, apply no close rules at
  all** and leave the ledger untouched.
- **When the run's scope is narrower than the ledger's, apply no close rules
  by absence**; markers may still be read, since a marker is a positive
  statement about a specific item.
- **When the finding is no longer raised and no marker exists, close it as
  no-longer-raised** and say so in the record.
- **When you cannot tell whether a run is authoritative, treat it as not.**
  A missed close costs one cycle; a wrong mass-close costs the ledger's
  credibility.

## When not to use this

- **When the assessment is nondeterministic run to run.** If the same
  codebase produces materially different findings on consecutive runs,
  absence is noise, not evidence, and only markers may close.
- **When findings are legal, contractual or safety obligations** whose
  closure requires a named human accepting the risk. Evidence can inform that
  decision; it cannot be it — route through the human gate instead.
- **When the ledger's items were entered by hand.** Auto-close by absence
  presupposes that the item set is regenerated by the same instrument each
  run; a hand-curated item will never be "raised again" and would close at
  the first run.
