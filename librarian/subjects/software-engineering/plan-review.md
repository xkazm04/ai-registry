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
