---
layer: application
type: application
subject: measurement-honesty
technique: unmeasurable-vs-zero
stack: node
status: forged
---

# The "n/a, not 0" escape hatch in a repository scoring engine

A Node scoring engine composes nine dimension scores into a headline. Eight
dimensions blend a deterministic detector score with an LLM judgment; one — D9,
Supply Chain & Security — is fully deterministic: its score is the security
check battery's risk-weighted mean and the model only narrates it. That design
is honest about *authorship* and dishonest about *visibility*, and the second
problem is what this technique exists for.

## The false zero

`src/lib/scoring/engine.ts:50-67` documents the incident precisely. Two real
security controls are invisible to a read-only file scan:

- default-setup code scanning, configured in repository settings, which leaves
  **no workflow file** in the tree;
- an organization-level security policy or dependency-update policy, which
  lives in the org's shared `.github` repository, not in the scanned repo.

Both are real. Neither is a file. So the affected sub-checks scored a genuine
`0`, D9 was floored, and — because D9 is deterministic and therefore excluded
from the guardband-widening loop that lets the model nudge other dimensions —
it had **no correction path at all**. Two widely-known repositories hit exactly
this, and the report told them they had no security controls.

## The three-valued fix

The engine does not raise D9. It removes it. `engine.ts:180-195` treats D9 as
**unmeasurable** — the third state — and returns an empty array from the
`flatMap` that builds `dimensions[]`, so D9 never enters the weighted sum. The
denominator follows automatically, because `overallScoreFor`
(`src/lib/maturity/model.ts:381-395`) renormalizes over present dimensions:

```ts
const presentWsum = scored.reduce((acc, d) => acc + lensWeightFor(lensW, d.id), 0);
if (presentWsum <= 0) return 0;
return clamp(Math.round(scored.reduce((acc, d) => acc + d.score * lensWeightFor(lensW, d.id), 0) / presentWsum));
```

The same file's `axisScore` takes an optional `isPresent` predicate for the same
reason, with the failure it prevents named in the comment: an absent dimension
"charged at 0 with full weight … deflated the axis and flipped the posture."

The exclusion is *announced*, not silent — a warning is pushed onto the report
(`engine.ts:183-190`) that states which dimension was dropped, the concrete
mechanism ("default-setup code scanning, or an org-level security policy"), and
the residual caveat: "the security score is not fully validated for this repo."
That warning is the coverage disclosure this technique requires.

## The conservative gate, and its one-directional design

The trigger is not "the model thinks D9 is low." It is a high-confidence
discrepancy that is **D9-targeted** *and* matches `D9_VISIBILITY_BLIND_SPOT`
(`engine.ts:68`), a deliberately narrow regex over the model's claim text:
`default-setup`, `org-level`, `.github repo`, `repository settings`,
`configured in … settings`, `off-repo`, `invisible to a file scan`. The comment
states the design intent in one line: "A generic 'D9 looks low' never qualifies,
so this can't become a backdoor for the LLM to hand-wave the number up."

The asymmetry is the load-bearing part, and it is worth transplanting verbatim
into any system that lets a judgment channel contest a measurement: **the model
can only mark D9 unmeasurable; it can never raise a measured D9 sub-check
score. D9 is dropped, not blended up.** The worst outcome a successful claim can
produce is "not counted" — bounded, visible in the warning, and reflected in the
coverage the report carries. A hatch that could add points would have no such
ceiling.

## The sibling case: a detector that threw

`engine.ts:167-174` handles the other absence flavor with the same mechanism. A
detector that throws emits a placeholder `signalScore: 0`, which is not a
measurement; folding it in "would deflate the overall as if the repo genuinely
scored 0 on this dimension." The `s.failed` branch drops it, warns, and lets
`overallScoreFor` renormalize — with the comment stating the principle plainly:
do not "penalize the repo for our own extraction failure."

Three flavors, one exclusion path, three distinct warning texts. That is the
whole technique in a single `flatMap`.
