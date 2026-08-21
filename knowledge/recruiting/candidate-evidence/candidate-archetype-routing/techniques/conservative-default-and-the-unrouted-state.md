---
layer: technique
type: technique
subject: candidate-archetype-routing
technique: conservative-default-and-the-unrouted-state
status: forged
laws: [uncertainty-resolves-toward-the-candidate, meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
use_when: [a candidate's career cannot be classified, choosing the fallback archetype for a scorer, deciding what to persist when routing fails]
shared_with: []
---

# The conservative default and the unrouted state

## The concern

Some careers do not parse. An unusual education system, a long interruption, a portfolio
instead of employment, a document the extractor half-read, a person whose situation the
taxonomy simply does not contain — the classifier has to return *something*, and the
something it returns is where the most damaging failure in this subject lives.

There are two questions hiding in one, and conflating them is the failure:

- **Which rubric do we score them on?** Answer: the conservative one — the general,
  experience-weighted, unprotected path.
- **What class do we record them as?** Answer: **unrouted**. Not the conservative
  default. Unrouted is a member of the taxonomy with a name, and it must survive.

The technique is holding those two answers apart. A scorer may pick a fallback without
the record adopting it.

## The procedure

1. **Add an explicit unrouted member to the archetype taxonomy**, named and documented,
   meaning "could not classify". Not a null, not an empty string, not the absence of a
   field that each caller interprets for itself.
2. **Name the conservative scoring default separately**, in the same declaration, as
   what it is: the rubric to run when no archetype was determined. Two fields, two
   meanings.
3. **Choose the general, unprotected archetype as that default.** It asks for evidence
   the candidate may not have, which understates them — the honest direction. A
   potential-based rubric would flatter, and worse, would assert a claim about their
   career stage that nothing in the record supports.
4. **Send the unrouted state, unmodified, to the fairness gate**, which treats unknown as
   protected. The scorer's fallback choice must not reach that gate as a class.
5. **Persist the unrouted state.** This is the step teams skip, usually at a boundary
   where a type is narrowed for convenience. If unrouted is not representable in
   storage, it will be coerced at write time, silently, once, forever.
6. **Render it as itself.** A recruiter sees "not classified — review", never a
   confident archetype the system chose for them.
7. **Alarm on the rate.** Unrouted is a safe *handling* of a rare case, not a viable
   main path. When it exceeds a small share of intake, the classifier is broken and the
   shield has quietly become the default.

## Decision rules

- **When a predicate can withhold an adverse automated action, unrouted means
  protected.** [Uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate),
  and the cost ratio is not close: a wrongly-protected candidate costs one human review;
  a wrongly-unprotected one can lose the job on a classification nobody made.
- **When a predicate only selects wording, unrouted means false.** Encouraging copy
  written for an early-career candidate, shown to someone with twenty years behind them,
  is an insult with a database behind it. Same uncertainty, opposite default, because
  only one of the two branches can end an application.
- **When those two defaults look inconsistent, write down why and keep them.** Consistency
  is not the value here; consequence is. Unannotated, the asymmetry survives exactly
  until the next tidy-up.
- **When a downstream consumer's type does not admit the unrouted member, widen the
  type.** Do not narrow the value. Every coercion of unrouted into a concrete class is
  permanent and silent.
- **When the classification step did not run at all, keep that distinct in the record
  from "ran and could not decide".** They converge in the branch — both resolve
  protective — and they diverge in the diagnosis, and a check that did not run may never
  render as a result
  ([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
- **When a person routes an unrouted candidate manually, record it as a human
  decision** with the actor, not as though the classifier had succeeded.

## Why collapsing the unknown is the worst variant

Of every way to mishandle an unclassifiable candidate, coercing them into the fallback
class is the most damaging, because it is the only one that produces a *confident wrong
record*. A flagged candidate can be reviewed. An unrouted candidate can be routed by a
person. But a candidate stamped with an archetype the system inferred from nothing:

- loses the fairness shield everywhere downstream, since the shield keys off the class;
- receives copy, questions and rubrics written for a career they are not having;
- appears in cohort analytics as a member of a group they were never in — corrupting the
  very measurements meant to detect this;
- and leaves an audit record asserting a classification no evidence supports, which is
  precisely the claim you would be asked to defend.

[Meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label): the
unrouted state is a fact about the evidence, and the moment it is written away as a
concrete class, that fact is unrecoverable. Note also that the coercion looks harmless at
the point it is made — the scorer needs a rubric, one is chosen, the run completes. The
damage is entirely in the *other* consumers, which is why it survives code review.

## When NOT to use it

- **Not as a way to avoid classifying.** If the classifier could resolve this candidate
  from evidence already in the record, or if the intake question would resolve it, the
  fix is upstream. Unrouted handles genuine ambiguity, not missing work.
- **Not in aggregate statistics.** A cohort metric must not fold unrouted candidates
  into a default and report a comfortable number. This technique governs per-candidate
  branches; measurement has its own, stricter rule, and an unmeasured metric fails
  rather than defaults.
- **Not where the conservative rubric would itself be the adverse outcome.** If the
  general rubric's score would trip an automated consequence the potential-based one
  would not, the conservative choice is to score neither and hold. Check which branch
  actually helps the person; the rule points toward the candidate, not toward the
  stricter rubric for its own sake.
- **Not as a permanent state.** Unrouted is a request for attention with a deadline
  attached. A candidate sitting unrouted while the process moves around them is a stall
  dressed as a safety mechanism.
