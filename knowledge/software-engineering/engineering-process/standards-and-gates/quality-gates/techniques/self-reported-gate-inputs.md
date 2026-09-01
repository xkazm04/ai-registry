---
layer: technique
type: technique
subject: quality-gates
technique: self-reported-gate-inputs
status: forged
laws: [gate-sees-target, absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [a gate counts records the gated party writes, designing an override for a check that machinery rather than a person will trip, a guard passed every review and never fired in production, deciding which layer of a guard stack is load-bearing]
---

# Evidence the subject authors

[gate-sees-target](../../../../_laws.md#gate-sees-target) asks what the check
actually read. This technique is the case where the answer is *the subject's
own paperwork*, and it is worth separating because the failure does not look
like a proxy problem. The gate reads a real record, in the real system, kept
current by the real workflow. It is not stale and it is not a summary. It is
simply **written by the party the gate exists to constrain** — and therefore
absent exactly when the constraint is being escaped.

The shape recurs wherever cooperation produces the evidence: a coverage gate
reading the report the build chose to emit; a dependency check reading a
manifest the author maintains; a review requirement counting approvals on
work that was routed through review. In each, the honest path leaves a trace
and the dishonest path leaves none, so the gate's population is exactly the
set of cases that did not need gating.

## The inert branch

The sharp version is not evasion, it is **structural inertness**, and it is
worth stating because it survives a code review that finds nothing wrong.

Take a guard stack whose blocking condition is "work is in flight" — it
refuses to let a session end, or a stage advance, while something is
outstanding. The count of outstanding work comes from records created by the
sanctioned dispatch path. Now the actor starts work some other way: a
different tool, a manual invocation, a path nobody thought to fence. No
record is written. The count is zero. **The guard does not fail — it
evaluates correctly, against an empty set, and permits.**

Every downstream guard keyed on the same records is now equally inert, all
at once, and none of them logs anything: a count of zero and a genuine
absence of work are the same bytes
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
This is the fourth way a gate can be unfireable, alongside the three in
[severity-by-construction](./severity-by-construction.md) and the derived
condition in [vacuous-by-evaluation](./vacuous-by-evaluation.md): the
severity is real, the exit code depends on it, the evaluation is honest —
and the input is supplied by the thing being judged.

The recovery instinct — add a guard that checks whether the records look
complete — cannot work, and the reason is worth stating plainly rather than
discovering: **no check keyed on the record can detect the absence of the
record**, because the absence is the failure. A second guard on the same
input is a second inert guard.

## The rule

**Put one layer of the stack on the act, upstream of the record — and where
a check must trust an input the subject writes, make the not-writing loud.**

- **Fence the surface, not the bookkeeping.** The load-bearing layer sits
  where the actor reaches for the capability, before anything untracked can
  exist. Every layer after it may key on records, because by then the
  records are guaranteed. One layer earns the whole stack its meaning; the
  rest are refinements.
- **Classify by shape, not by enumeration, and let one owner decide.** A
  fence built from a list of known names fails open on the next name, and it
  fails open *before* the classifier sees it — which means the failure is
  invisible to the component that would have caught it. Route everything to
  the classifier and let the classifier hold the exclusions. The exclusions
  are then reviewable in one place, and a new name is a decision rather than
  a gap ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).
- **Keep exclusion lists separate when their justifications differ**, even
  where they behave identically today. Two lists that both mean "allowed"
  for two different reasons — *this only observes what already exists* and
  *this writes, but writes nothing that can act* — drift apart the moment one
  reason stops holding, and a merged list carries no record of which reason
  applied to which entry.
- **State what the fence does not cover.** A guard on a tool surface catches
  the wrong reach; it says nothing about whether the reach should have
  happened at all. That second question has no mechanical signal, and a check
  that tries to answer it degrades into an advisory nag which trains the
  actor to ignore the layer that *is* load-bearing
  ([false-positive-economics](./false-positive-economics.md)).

## The override is an input too

[enforcement-binding](./enforcement-binding.md) establishes that a binding
without an escape hatch gets loosened permanently, and governs the hatch with
a ledger: attributable, visible after the fact, counted. That discipline
assumes a **person** uses it, which is what makes after-the-fact attribution
sufficient — the reviewer and the bypasser are different parties, and the
ledger reaches the reviewer.

Where the gated party is machinery acting on its own, after-the-fact is too
late and attribution is circular: the same actor that would trip the gate
writes the ledger entry. So the hatch needs a property the ledger does not
supply, and it is a property of the **channel**, not of the policy:

> The override must live somewhere the gated party cannot write **during the
> run it would authorize**.

A value fixed in the process's environment at launch has this property: no
action taken inside the run can set it for the action that follows. A flag,
a configuration file, or a state record does not, because reaching them is
itself an action the run can take — and a guard whose bypass is one write
away is advisory wearing enforcement's label.

The ergonomics are the point rather than a cost. Turning the hatch requires
restarting the work with the value set, which makes a deliberate use a
conscious act and an accidental use structurally impossible. Two clauses keep
it honest: **fail closed on every value but the exact one** — an override
that also accepts the empty string, `0`, `true`, or `yes` has four accidental
spellings — and **treat the hatch as a separate surface from any removal
performed above it**, since a capability withdrawn upstream stays withdrawn
and the hatch cannot restore it.

## Removal beats interception, and rarely travels

Where the surrounding platform can remove a capability from the actor
outright rather than intercepting its use, that is strictly stronger: there
is no call to catch, no classifier to get wrong, no fail-open path, and no
dependence on the actor's cooperation. Prefer it — and expect it not to be
portable, because withdrawal is usually a feature of one host while the
system must run on several.

The resolution is both layers, with their scopes stated: the portable fence
is what ships and is what the tests cover; the stronger removal is
recommended where it exists and is documented as local hardening rather than
as the mechanism. The failure to avoid is letting the strong local layer
become the reason the portable one is never built — the hardened installation
stops reporting the problem, and every other installation is unguarded and
quiet.

One placement warning that costs a session to learn: **configuration that
performs the removal must not be installed where it is inherited.** Settings
that propagate down a workspace hierarchy will disarm legitimate actors
further down — the delegated worker whose entire job is the capability the
top-level actor was denied — and the symptom appears as a competent process
inexplicably unable to do its work.
