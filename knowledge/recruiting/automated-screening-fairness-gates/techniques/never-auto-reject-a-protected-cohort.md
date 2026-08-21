---
layer: technique
type: technique
subject: automated-screening-fairness-gates
technique: never-auto-reject-a-protected-cohort
status: forged
laws: [no-adverse-outcome-is-solely-automated, absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [adding auto-reject or auto-advance to a screening pipeline, defining which candidate groups automation may not act on, auditing why a shielded candidate was rejected unattended]
---

# Never auto-reject a protected cohort

## The concern

Some candidates are systematically misread by any scoring instrument, and the misreading
is not noise — it is directional. A candidate whose evidence is thin *in the shapes the
instrument recognizes* scores like a candidate whose evidence is weak, and the two are
completely different people. Early-career candidates, career changers, returners after a
gap, candidates trained outside the conventional pathways, candidates whose work lives
in places the parser cannot read: the score is least valid precisely where it is most
decisive. Treating that low score as an actionable rejection is the
[absence of evidence](../../_laws.md#absence-of-evidence-is-not-evidence) failure with
an outcome attached.

The shield is the answer: a named set of cohorts that automation may surface, rank,
score and hold — but never reject and, for most of them, never auto-advance either,
because auto-advancing a shielded candidate launders the same unreliable score into a
stage transition.

## The procedure

1. **Name the set explicitly, as a set.** Not a comment, not an inline condition. A
   single enumerated collection of the archetypes or cohort markers that are shielded,
   in one place, with a name that says what it is for ("shielded from unattended adverse
   action"), not what it contains.
2. **Derive every consumer from that one collection.** The membership predicate, the
   pipeline gate, the apply-boundary recheck, the recruiter-facing explanation, and any
   analytics that count shielded candidates all read the same collection. Nothing
   re-enumerates it.
3. **Pin the single source with a test that scans the source, not just the behaviour.**
   Three assertions, all necessary: the canonical set matches a pinned literal, so
   changing it is a deliberate test-breaking act; every consumer derives its set from the
   canonical collection; and the hand-written duplicate **cannot be reintroduced
   anywhere in the sources**, checked by parsing or scanning the code for the shadowed
   literal in any bracket form. Only the third assertion survives a future engineer who
   re-adds the tuple "just here, just this once" — and that is exactly how the second
   definition gets back in.
4. **Gate before the score.** In the stage machine, check membership before dispatching
   the scoring or screening call. A shielded candidate routes straight to the human
   screening gate; no adverse verdict is produced at all, which also saves the spend.
   When the scoring step is a model call, say it in the prompt too — tell the model this
   is a shielded candidate, to judge on potential, to frame gaps as learnable, and never
   to recommend a hard reject. The prompt instruction is the weakest of the three
   placements and it is still worth having: it makes the model's rationale usable by the
   human who receives the hold, instead of a rejection argument the reviewer must
   discount.
5. **Override after the score.** Re-check membership on the returned verdict and force
   the outcome to hold if the verdict is adverse. This override is not reachable by the
   model, the prompt, the rubric, or any confidence value — it is applied to the result,
   not consulted inside the decision.
6. **Re-derive at the apply boundary** (see the companion technique) so a caller that
   skipped both gates still cannot land the rejection.
7. **Record every refusal** as an audited event (see the companion technique), because a
   shield that operates silently cannot be shown to operate at all.

## Decision rules

- **When the candidate is in the shielded set, no automated path may produce an adverse
  outcome for them, at any score, at any confidence.** The rule has no exception
  parameter; a shield with a bypass flag is a preference, not a shield.
- **When the shielded cohort is shielded because the evidence is thin rather than
  negative, shield auto-advance too.** The score that cannot be trusted downward cannot
  be trusted upward either. Route to human screening in both directions and say so in
  the rule's own name.
- **When you are tempted to implement the shield as a score adjustment, don't.** A bonus
  applied to a cohort's scores is erased by the next threshold change, is invisible in
  the audit record, and is itself a decision about a person made on the basis of cohort
  membership. The shield is a *branch*, not a term.
- **When a second definition of the protected set appears anywhere, treat it as a
  production incident, not a refactor.** Two lists that agree today will disagree after
  one edit, and the disagreement mis-routes a protected candidate with no error, no
  exception and no log line.
- **When the candidate has no genuine score, the shield applies regardless of cohort.**
  An unscored candidate is not a zero-scoring candidate; hold them for scoring. This is
  the same rule as the shield and it protects a much larger population, because data
  gaps are common and cohort membership is not.
- **When membership cannot be determined, the candidate is shielded.**
  [Uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate);
  see the fail-closed technique for the full rule and its deliberate asymmetry.
- **When the organization has an affirmative obligation toward a group, that group joins
  the set** — but keep the shield mechanism identical. One mechanism, one set, several
  reasons for membership.

## Choosing the members

The set should be small, defensible in one sentence each, and derived from how the
instrument fails rather than from demographic categories. Two tests before adding a
cohort:

- **Does the instrument systematically under-read this cohort's evidence?** If yes, it
  belongs. If the cohort simply scores lower on a valid measurement, it does not — that
  is a selection decision, not a measurement artifact, and hiding it in the shield hides
  a real problem with the role's requirements.
- **Would a rejection of this cohort be hard to explain from the record?** If the
  system's own account of the rejection would be "scored below the floor" and the record
  contains nothing that would let a person evaluate that claim, automation should not be
  making it.

Do not implement the shield off protected-characteristic inference. A system that guesses
someone's age, ethnicity or disability status in order to protect them has created a
sensitive classification that did not previously exist, and it will be wrong often
enough to protect the wrong people while stigmatizing the right ones. Shield on career
shape, which the candidate's own evidence states, not on inferred identity. Adverse-
impact monitoring across protected characteristics is a separate, aggregate,
statistically-governed practice — it belongs in the measurement lane and it never feeds
a per-candidate branch.

## When NOT to use it

- **Not as a substitute for fixing the instrument.** If a cohort needs shielding because
  the rubric misreads it, the shield buys time; recalibration is the fix. A permanent
  shield covering a large share of applicants is a statement that the screening
  instrument is not fit for its population.
- **Not for auto-advance-only automation on non-adverse paths.** If the automation
  cannot produce an adverse outcome at all — a surfacing feed, a ranking view, a
  reminder — the shield adds a branch and buys nothing. Shields exist where actions
  land.
- **Not as a stand-in for the human gate.** Shielding routes a candidate to a person;
  it does not decide anything. If the queue behind the gate is not worked, the shield
  has converted a rejection into a silence, which is worse for the candidate and no
  better for you.
- **Not in place of the narrow route vocabulary.** The shield protects specific cohorts;
  the route restriction protects *everyone* by making rejection non-routable in the first
  place. If you have only one of the two, keep the route restriction — it is the
  [no adverse outcome is solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated)
  law's minimum, and the shield is the second layer above it.
