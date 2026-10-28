---
layer: technique
type: technique
subject: concept-scene-parity
technique: cap-attribution-before-the-next-round
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [planning the next look round after a scorecard, a round of work moved the scene and not the score, the team keeps improving the stage it is best at, the judge's priorities differ from the builders' ranking]
---

# Name each element's cap before funding the next round

The named concern: after a scored round, the team must decide what to work on next, and the
default decision is whatever the team is fastest at. An engine-minded team tunes light; an
art-minded team re-renders props. Both feel productive, and the elements that cap the scene
do not move. Cap attribution replaces the default with a rule.

## Every element short of a match names one cap

For each element below the top score, name the **one** stage that stops it rising:

- **asset**: the mesh, its finish, its materials, the character or prop design;
- **engine**: light, shadow, reflection, post, the renderer's feature set;
- **data**: what the product actually holds to draw, its density and its content;
- **composition**: layout, scale, typography, what sits where in frame and how it reads.

One stage, not a list. An element capped by "light and the asset and the layout" has not
been looked at closely enough, and a round funded against it will be spread across all
three and move none. When the honest answer is two stages, name the one that would have to
move first for the other to matter. An element whose cap nobody can name is marked
unattributed and is not funded until someone looks.

## Fund by gain per effort, weighted by what the judge looks at

Rank the attributed caps by expected score gain per unit of effort. Then weight each by
the element's salience to the judge: where it sits in the frame, how large it is, whether
the eye goes to it first. Score arithmetic counts every element the same; a judge does not.
A prop at the back of the room improved from placeholder to finished is a real gain on the
scorecard and is received as *fine, but it does not matter*. The surface in the middle of
the frame, where the eye lands first, carries the verdict.

## Who attributes, and what one run showed

Stage attribution is a builder's job: it needs knowledge of the pipeline that the judge
usually does not have. Salience is the judge's job, and builders guess it badly. One run
shows the split clearly. After an engine round that brought in reflections, baked light and
a filmic grade, every builder named the asset or content stage as the cap on every element,
and they were right that rendering was no longer the limit. The judge then redirected the
next round to the clarity of the central sheet and its typography, a composition cap that
the planning had ranked, but not first. Neither reading was wrong; they answered different
questions.

What the run shows is that builders can attribute stages and cannot be trusted to rank by
salience. What it does not show is that the judge should attribute stages: the judge named
a priority, not a cap, and the builders still had to say which stage would deliver it. So
the rule is a hand-off, not a transfer. Builders attribute; the judge ranks; the round is
funded from the judge's ranking of the builders' attributions.

## Procedure

1. Take the scored list. For each element below the top score, name its one capping stage
   and the change that would lift it.
2. Estimate the gain and the effort of each change.
3. Ask the judge to rank the elements by how much they matter to the read of the scene, or
   reuse a ranking the judge gave in the last verdict.
4. Order the changes by gain per effort, weighted by the judge's ranking.
5. Fund from the top. Record the attribution beside each element so the next round can
   check it: did the element move when its cap was addressed?

## Decision rules

- **When a round moved the scene and not the score, the attribution was wrong.** Re-attribute
  before funding the same stage again.
- **When every builder names the same stage, believe it about the stage and still ask the
  judge about the order.**
- **When the judge's priority lands on an element nobody ranked first, the scorecard is
  missing salience,** not the judge mistaken.
- **When an element is unattributed, it is not funded.** A guess spent is a round lost.

## When not to use this

- When the scene is so far from the concept that most elements are absent; build the
  missing layer first, the attribution is obvious.
- When a single stage clearly caps everything, such as a renderer that cannot draw the
  concept's light at all; fix that, then attribute.
