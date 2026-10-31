---
domain: software-engineering
subject: plan-review
last_touched: 2026-09-09
touched_by: intake
dry_streak: 0
---

# plan-review

First touch: forged 2026-08-28 from
[[../../../docs/subject-proposal-plan-review]], raised by `/intake` from
[[../../sources/2026-08-28-ai-literacy-superpowers-concepts]] and executed in the same
session - the first spec forged under the 0.17.0 rule that an accepted XL spec is
dispatched before Phase 9 rather than banked. Placed at `llm-agent/orchestration`
(7 of a cap of 10). Five techniques, two `process` applications, both reconciled
against this registry's own machinery.

## Why it exists

`hitl-approval` owns the pause and stops at "the human decides on the real thing, not
a summary produced by the gated party". For a plan, the real thing is mostly what was
not written down. Four plan-stage readers from one source each mapped near that subject
and inside none of its eleven techniques - a missing stage, found as a cluster.

## The five dispatch questions, as resolved by the worker

1. **One subject, not two.** Slicing stays: its charter (refuse coherence at the wrong
   scale) is defined by what the plan gate can hold, so it is a review-shaped
   constraint expressed before authorship, and there is no planning subject to split
   toward.
2. **Hard/soft placement landed here.** `hitl-approval`'s predicates key on the
   action's consequence; this rule keys on the record class (untriaged risk blocks the
   plan; captured decision blocks the merge; slices sit with the objections), and the
   record classes are this subject's. One sentence added to `hitl-approval`'s anatomy
   section pointing here.
3. **Three disposition vocabularies, one authority each.** `one-authority-per-vocabulary`
   forbids two definitions of one vocabulary, not three vocabularies for three record
   classes; `accepted` is shared with identical semantics, any other token appearing
   twice with different meanings is the violation.
4. **`fresh-posture-self-challenge` stays here**, because its content is a claim about
   review independence and its ladder terminates in a two-agent dispatch.
5. **Applications** - below.

## Overrides, both argued

- `informational-fold-in` kept as a technique against the brief. Four rules nowhere else
  in the corpus: durability tracks confidence; a forecast is never co-located with
  actuals; unavailable is a state; the three-step accretion by which an advisory field
  becomes a gate. Verified against `preflight-estimation`, which owns the estimate and
  none of these.
- Claim 2 sharpened by the literature rather than adopted. A fresh review context
  outperforms a same-session role switch; models repair an error once its location is
  supplied and locate it unreliably in their own output; challenged, they move toward
  the challenge rather than the evidence. So the in-context posture switch is a
  **priced, degraded middle rung**, and the ladder is the technique's point.

## The applications, and the structural fact

Both against this registry. The `architect` skill (symlinked into five bridged trees)
is a real plan gate for agent work and a mixed instance: it confirms the four-value
disposition independently (`execute now / queue / drop / rework`, with `rework` as
`revised`), and its structure is the negative fact - the template asks the *proposing*
reader for a "migration plan, 3-7 shippable steps" after the plan, by the planner, with
no disposition per step; `Enter -> queue everything` is the coherence trap in one
keypress; and its three self-declared risk slots arrive at exactly the right time and
buy nothing, which is the sharpest lesson: **timing alone is not the technique.** The
positive half is the forge/deepen director pattern - workers told to override and
argue, the director reviewing diffs never reports.

What neither can do: produce the cross-mode signal, because neither persists an
objection with an identity that survives from plan stage to change stage. A storage
gap, not a discipline gap.

## Watch

"A reader that pads to a count masks its own signal" now appears in three subjects
(`silent-decision-surfacing`, `objection-before-artifacts`, `review-queues`). Not a
law yet; a fourth sighting is the return condition.

## Architecture review - 2026-09-09

Earlier entries are historical. This pass corrects the claimed authority properties
of workers/directors, the queue-versus-execute interpretation, and unconditional
review-mode superiority. It preserves useful review artifacts while making adopted
policy, empirical scope and unverified runtime effects explicit.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/plan-review",
  "date": "2026-09-09",
  "baseline": "bc1bd8aa",
  "digest": "sha256:bd0c53f634a72ef4",
  "disposition": "clarify",
  "coverage": "All eight owned documents read in full; process claims checked against current local methods. Research checks establish scope, not reproduced performance.",
  "counterexamples": [
    "An authorization requirement can be omitted from a plan, so a literal quote from that plan is not the only admissible evidence.",
    "A worker can edit every owned file while being forbidden to commit.",
    "Queuing a finding for later is not authorization to execute it now.",
    "A labeled estimate can be persisted for forecast calibration without blocking the workflow.",
    "A role-change heading in the same context cannot remove earlier context."
  ],
  "sources": [
    {
      "url": "https://aclanthology.org/2024.findings-acl.826/",
      "result": "Primary abstract supports a distinction between locating and correcting errors on its studied reasoning tasks."
    },
    {
      "url": "https://aclanthology.org/2024.emnlp-main.714/",
      "result": "Primary abstract reports gains from a particular intrinsic verification procedure; counterexample to a universal no-benefit claim."
    },
    {
      "url": "https://arxiv.org/html/2601.04790v1",
      "result": "Read study setup and controlled-role discussion; preference judgments do not establish plan-review accuracy."
    },
    {
      "source": "skills/architect/SKILL.md at 1.8.0; .claude/skills/forge/SKILL.md; .claude/skills/deepen/SKILL.md",
      "result": "Read relevant implementation instructions; queue/execute and write/commit distinctions directly observable."
    }
  ],
  "documents": {
    "plan-review.md": {
      "disposition": "clarify",
      "reason": "Scope the adopted human gate; remove universal separation and concordance claims; distinguish classification policy from deterministic classification."
    },
    "techniques/decision-sized-slicing.md": {
      "disposition": "clarify",
      "reason": "Small specified work can skip extra slicing; an internal change can have observable acceptance; single and multiple slices both need proportional rationale."
    },
    "techniques/fresh-posture-self-challenge.md": {
      "disposition": "clarify",
      "reason": "Same-context headings do not erase reasoning. Primary studies differ by task and method; fresh-context superiority and role-label accuracy are not universal."
    },
    "techniques/informational-fold-in.md": {
      "disposition": "clarify",
      "reason": "Typed estimate retention permits calibration and audit without a new approval gate. Colocation, navigation and fixed field counts are not authority boundaries."
    },
    "techniques/objection-before-artifacts.md": {
      "disposition": "clarify",
      "reason": "Ground omissions in requirements; retain newly discovered premise objections; gates require adopted policy and advisory review is not inherently worthless."
    },
    "techniques/silent-decision-surfacing.md": {
      "disposition": "clarify",
      "reason": "Replace an apparent five-story floor with a configured ceiling and materiality requirement; retain distinct decision and risk records."
    },
    "applications/process--decision-sized-slicing.md": {
      "disposition": "clarify",
      "reason": "Current Architect queue is backlog deferral, distinct from execute-now; corrected the interpretation without refreshing historical deployment evidence."
    },
    "applications/process--objection-before-artifacts.md": {
      "disposition": "clarify",
      "reason": "Source methods allow worker writes and director review; cannot-commit does not establish read-only or human adjudication."
    }
  }
}
```

## Architecture review - 2026-10-31

Re-review against `140c101d`. Every clarify the 2026-09-09 record named landed. The
subject is stale because of those edits plus two new applications, both soundly
scoped. What remains is vocabulary drift left by the rewrite. 'Ladder' and 'rung'
still carry a cost-ordered dominance in the golden path, the self-challenge
technique and two process applications. The golden-path summary of
informational-fold-in still states the retired durability rule. No verification
date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/plan-review",
  "date": "2026-10-31",
  "baseline": "140c101d",
  "digest": "sha256-b2:c9a78a4c9faf0799",
  "disposition": "clarify",
  "coverage": "All 10 current documents decided. The eight carried from the 2026-09-09 record (baseline bc1bd8aa) were checked by full diff, and every clarify that record named is present in the text. The two applications added since were read in full. The changed sections of fresh-posture-self-challenge and informational-fold-in were read in context, and a grep for the 'ladder' and 'rung' vocabulary was run across the subject. Relative links resolve. No primary source was re-fetched, because no new external claim entered; the 2026-09-09 sources still cover the cited studies. No private tree was reopened.",
  "counterexamples": [
    "A subject can declare 'not a universal cost-ordered ladder' and still route escalation through 'rung two to rung three' and 'the wrong rung for the artifact whose approval matters most'. The dominance claim survives in the vocabulary after leaving the argument.",
    "A golden-path summary can still say 'durability tracking confidence' after its technique has replaced that rule with 'retention preserves uncertainty; confidence alone does not determine it'.",
    "A record with three stored states (not run, ran with notes, ran and found nothing) has no 'fourth value'. Naming one invites a reader to look for a state that does not exist.",
    "A forecast computed for one item and shown on a per-item surface is unavailable for every other item, and silence there reads as completeness (from the react application)."
  ],
  "sources": [
    {
      "source": "git diff bc1bd8aa..140c101d over the subject directory",
      "result": "Confirmed that the 2026-09-09 clarifies landed: the scoped human gate, the removed concordance and separation claims, the classification policy, proportional slicing rationale, the quotable-or-requirement evidence rule, premise objections after plan time, the configured cap with no floor, typed estimate retention, and the queue-versus-execute and write-versus-commit corrections in both process applications."
    },
    {
      "source": "grep for 'ladder' and 'rung' across the subject",
      "result": "Residual cost-ordered vocabulary appears at plan-review.md:116 and :263-264; fresh-posture-self-challenge.md:103, :113, :144-145 and :157; process--fresh-posture-self-challenge.md:18; and process--objection-before-artifacts.md:34."
    },
    {
      "url": "https://aclanthology.org/2024.findings-acl.826/",
      "result": "Relied on as recorded 2026-09-09. The technique now cites it with that scope."
    },
    {
      "url": "https://arxiv.org/html/2601.04790v1",
      "result": "Relied on as recorded 2026-09-09. The technique now scopes it to preference judgments, as that record asked."
    }
  ],
  "documents": {
    "plan-review.md": {
      "disposition": "clarify",
      "reason": "Prior clarifies applied. Residual drift: the heading 'Two readers are less independent than the ladder implies' and the technique-list entry ('the cheap rung', 'the escalation ladder') re-assert the ordering line 107 disowns; rename to modes. The informational-fold-in entry still says 'durability tracking confidence'; replace it with 'retention preserving uncertainty'. The objection entry's 'the hard gate' should read 'the blocking gate where adopted'."
    },
    "techniques/decision-sized-slicing.md": {
      "disposition": "keep",
      "reason": "The observable-acceptance filter and proportional rationale landed. The guidance is consistent."
    },
    "techniques/fresh-posture-self-challenge.md": {
      "disposition": "clarify",
      "reason": "The study-scoping and sentinel clarifies landed. Still owed: (1) 'the same fourth value' contradicts 'keep three distinguishable states'; say empty, absent or malformed all map to the 'not run' state. (2) 'The escalation ladder', 'rung two to rung three', 'the wrong rung for the artifact whose approval matters most' and 'why the ladder has a third rung' keep a cost-ordered dominance the rewritten list disowns. Rename to modes, and state the move to a separate reader as a trigger-driven choice."
    },
    "techniques/informational-fold-in.md": {
      "disposition": "keep",
      "reason": "Typed retention and an estimate/actual discriminator replaced the deletion and colocation absolutes. The new item-scope rule for 'unavailable' is grounded in its application."
    },
    "techniques/objection-before-artifacts.md": {
      "disposition": "keep",
      "reason": "Evidence admissibility, retained late premise objections and the adopted-policy gate all landed. Consistent."
    },
    "techniques/silent-decision-surfacing.md": {
      "disposition": "keep",
      "reason": "A configured cap with no required minimum and a materiality condition replaced the five-story floor."
    },
    "applications/process--decision-sized-slicing.md": {
      "disposition": "reverify",
      "reason": "The queue-versus-execute interpretation is corrected, and it says historical counts are not new runtime evidence. Not re-run."
    },
    "applications/process--fresh-posture-self-challenge.md": {
      "disposition": "clarify",
      "reason": "Rename 'rung two of the challenge ladder' to the same-context role-switch mode. Its 'better' verdict covers only stored-state distinguishability (a target it states), and the private tree and its 97-test floor were not re-run."
    },
    "applications/process--objection-before-artifacts.md": {
      "disposition": "clarify",
      "reason": "The read-only and human-verdict corrections landed. Rename 'rung one of the challenge ladder' to the one-context self-review mode. Its historical installation evidence is not re-verified."
    },
    "applications/react--informational-fold-in.md": {
      "disposition": "reverify",
      "reason": "Honestly scoped: unmeasurable, structural-only, no render ran, fix filed rather than shipped. The private tree at 63a1703a4e was not reopened."
    }
  }
}
```

## Clarify applied - 2026-10-31

Applied the four vocabulary clarifies the 2026-10-31 review named, against `19cb20182`.
'Ladder' and 'rung' are gone from the golden path, the self-challenge technique and both
process applications; the three review modes are named as modes and the move to a
separate reader is stated as a trigger-driven choice. The remaining 'ladder' at
plan-review.md:107 is the sentence that disowns the cost-ordered ladder, and the one in
informational-fold-in names a different system's severity ladder; both stay. Vocabulary
only, so no primary source was re-fetched. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/plan-review",
  "date": "2026-10-31",
  "baseline": "19cb20182",
  "digest": "sha256-b2:9669031f932606bb",
  "disposition": "reverify",
  "coverage": "All 10 documents keyed. The four documents carrying clarify items were re-read in their affected sections and edited; the other six are carried from the 2026-10-31 review unchanged (their bytes were not touched). A grep for 'ladder' and 'rung' across the subject after editing leaves only the disowning sentence at plan-review.md:107 and an unrelated 'severity ladder' in informational-fold-in. No private tree reopened, no model run.",
  "counterexamples": [
    "A subject that disowns a cost-ordered ladder in its argument and keeps 'rung two to rung three' in its headings still teaches the ladder; renaming to modes is what removes it.",
    "A record with three stored states has no 'fourth value'; mapping empty, absent and malformed to 'not run' says the same thing without inventing a state."
  ],
  "sources": [
    {
      "source": "The 2026-10-31 architecture-review record's documents map for this subject",
      "result": "Named the exact renames applied here; each was a vocabulary change with no new external claim, so no primary source was re-fetched."
    },
    {
      "source": "grep for 'ladder' and 'rung' across the subject after the edits",
      "result": "Residuals: plan-review.md:107 ('not a universal cost-ordered ladder', the disowning sentence) and informational-fold-in.md:88 (another system's severity ladder). Neither carries the cost-ordered dominance."
    },
    {
      "url": "https://arxiv.org/html/2601.04790v1",
      "result": "Relied on as recorded 2026-09-09; the technique's scoping to preference judgments is unchanged."
    }
  ],
  "documents": {
    "plan-review.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: heading 'Two readers are less independent than the ladder implies' -> '... than separation implies'; the self-challenge list entry 'the cheap rung ... the escalation ladder' -> 'the fresh-posture mode ... the three review modes with the observable trigger for choosing a separate reader'; the informational-fold-in entry 'durability tracking confidence' -> 'retention preserving uncertainty'; the objection entry 'the hard gate' -> 'the blocking gate where adopted'."
    },
    "techniques/decision-sized-slicing.md": {
      "disposition": "keep",
      "reason": "The observable-acceptance filter and proportional rationale landed. The guidance is consistent."
    },
    "techniques/fresh-posture-self-challenge.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'the same fourth value: did not run' -> empty, absent or malformed all map to the 'not run' state; heading 'The escalation ladder, with its trigger' -> 'Three review modes, and the trigger for a separate reader', with 'None dominates the others by cost' and the move to two-agent dispatch stated as a trigger-driven choice; 'the wrong rung' -> 'the wrong mode'; 'why the ladder has a third rung ... a team on rung two' -> 'why two-agent dispatch remains an available mode ... a team using the fresh-posture mode'."
    },
    "techniques/informational-fold-in.md": {
      "disposition": "keep",
      "reason": "Typed retention and an estimate/actual discriminator replaced the deletion and colocation absolutes. The new item-scope rule for 'unavailable' is grounded in its application."
    },
    "techniques/objection-before-artifacts.md": {
      "disposition": "keep",
      "reason": "Evidence admissibility, retained late premise objections and the adopted-policy gate all landed. Consistent."
    },
    "techniques/silent-decision-surfacing.md": {
      "disposition": "keep",
      "reason": "A configured cap with no required minimum and a materiality condition replaced the five-story floor."
    },
    "applications/process--decision-sized-slicing.md": {
      "disposition": "reverify",
      "reason": "The queue-versus-execute interpretation is corrected, and it says historical counts are not new runtime evidence. Not re-run."
    },
    "applications/process--fresh-posture-self-challenge.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'rung two of the challenge ladder' -> 'the fresh-posture (same-context role-switch) mode'. Still reverify: its 'better' verdict covers only stored-state distinguishability, and the private tree and its 97-test floor were not re-run."
    },
    "applications/process--objection-before-artifacts.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'rung one of the challenge ladder' -> 'the one-context self-review mode'. Still reverify: its historical installation evidence is not re-verified."
    },
    "applications/react--informational-fold-in.md": {
      "disposition": "reverify",
      "reason": "Honestly scoped: unmeasurable, structural-only, no render ran, fix filed rather than shipped. The private tree at 63a1703a4e was not reopened."
    }
  }
}
```
