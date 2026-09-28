---
layer: application
type: application
subject: combining-signals-into-a-hire-decision
technique: outcome-feedback-loop-per-team
stack: node
verified_on: 2026-09-27
verified_against: node@24
applied: simulation
ab_verdict: unmeasurable
---

# Per-team evidence, a deployment-wide floor (Node/TypeScript)

The outcome loop in this tree has two halves, and they have two different
scopes. That mismatch is the application.

## The evidence is per team, deliberately

`calibrate()` reads one workspace's outcomes and nothing else
(`app/_lib/dev-outcomes.ts:658-659`). The comment records the incident that put
the scope there (`:655-657`): "Pooling teams meant a recruiter's "Apply suggested
→ N" button moved their live promote floor to a number derived from another
team's hires — the algorithm below is unchanged, only its input set." A test
pins it (`app/_lib/dev-outcomes-tenancy.test.ts:62`, "calibration is computed
from the caller's corpus only (the promote-floor advice is per-team)"). The
automatic outcome feed derives each row's workspace from the submission it names
rather than defaulting it (`dev-outcomes.ts:440-447`), so a hire does not land
in the default tenant's corpus by omission.

The screening-threshold calibration goes one step further and partitions by
role family as well (`app/_lib/calibration-recommendation.ts:43`, `:46`):
`roleFamily ? allPairs.filter((p) => p.roleFamily === roleFamily) :
[...allPairs]`. That is "team and role family, both", when the family is
known. The promote-floor corpus has no role-family column at all, so two role
families hired by one workspace share one curve.

## The action is deployment-wide, also deliberately

The floor the advice moves is one key in a deployment-level table
(`app/_lib/dev-control.ts:140-156`, `dev_control` key `promote_floor`). The
route says so in as many words (`app/api/devcase/outcomes/route.ts:19-22`): the
corpus "(and so the promote-floor recommendation derived from it) is per-team,
not deployment-wide. The promote FLOOR itself stays global (dev_control is a
declared deployment-level table)". Moving it requires organization-level
authority (`:58-63`, `org:manage`).

So a recommendation computed from team A's hires, applied by an organization
administrator, becomes team B's floor too. The per-team evidence fix closed the
leak in one direction and left it open in the other. This is the standard's
"the action's scope may not exceed the evidence's" rule, and the tree is a
clean instance of why it had to be written. The authority check makes the move
deliberate. It does not make the number team B's.

## Overrides are recorded, and nothing reads them

A human accept or reject seals the machine's recommendation beside the human
act: `aiVerdict(current)` feeds `aiRecommendation` and `aiConfidence` into the
decision record (`app/_lib/pipeline-entry-action.ts:55-64`, `:463-479`,
`:506-526`). The raw material for scoring overrides exists. But nothing in `app`,
`pipeline` or `scripts` reads the field back; the only other hit is a UI label
key. The join to outcomes is possible and unbuilt: the outcome row's `ref` is
the submission id, which the pipeline entry carries as `dev_submission_id`, and
the entry id is the decision record's `candidate_ref`.

## Simulation (2026-09-27)

Three states taken from the tree's own tests and route. Nothing ran against
kp's store.

| State | A: per-team evidence (as shipped) | B: named prior, action scoped to the evidence |
| --- | --- | --- |
| Team A predictive, team B empty (the tenancy test) | A: suggested floor for team A; B: `insufficient`, no suggestion | A: same; B: team A's curve offered to team B *labelled as pooled*, n = 0 local |
| An administrator applies team A's suggestion | every team's floor moves to team A's number | refused, or applied to team A's scope only |
| Two role families in one workspace | one curve over both | the same, unless the corpus carries a family (it does not) |

B changes what the reader is told, and where the number lands. Whether B's
floors *predict better* is an outcome question this tree cannot answer: its
outcome corpora are small by design, and the second deviation of the
promote-floor application — the corpus mixes two scores — would contaminate any
comparison. **Unmeasurable.** Return: when a workspace holds a per-team
`promote_floor` and enough resolved outcomes to compare a pooled-prior floor
against a local-only one.

## Deviations from the standard

- **The action outruns the evidence** (above).
- **No role-family partition** on the promote-floor corpus.
- **No pooled prior.** Below the minimum a team gets `insufficient`, never a
  named prior. Under the revised standard that is not wrong, only more
  conservative than it needs to be.
- **Overrides are not scored.** They are sealed and never read, so the loop
  learns nothing from them — which, under the revised standard, is safer than
  training on them as errors, but leaves the one early signal unread.
