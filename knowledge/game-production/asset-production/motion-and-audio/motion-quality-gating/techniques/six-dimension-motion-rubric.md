---
layer: technique
type: technique
subject: motion-quality-gating
technique: six-dimension-motion-rubric
status: forged
laws: [grade-against-what-ships-not-on-a-curve, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [building the scoring card for a motion critic, deciding what dimensions movement is graded on, turning animation principles into checkable criteria]
---

# The six-dimension motion rubric

Character motion decomposes into six independently observable qualities. Fewer and the
score stops being diagnosable — a single "quality" number tells nobody what to fix.
More and the dimensions start correlating, raters spread thin, and the extra columns
add noise rather than resolution. Six is where the published animation principles
collapse when you keep only what is visible in a sampled sequence of frames and drop
what is a rule for authoring rather than a property of the result.

## The ruler

Each dimension is stated as a visible contrast, so the rater answers a question about
the artifact rather than about the word.

- **Anticipation** — is there a windup that telegraphs the action before it happens, or
  does the action begin from nothing? A weighty strike pulls back first.
- **Weight** — does the motion convey mass and effort, with acceleration into the
  impact, or does it glide at uniform speed? Floating is the failure state.
- **Timing** — is the spacing slow-in and slow-out, a fast snap on the peak and a
  settle on the recovery, or is it even and metronomic? Metronomic reads robotic.
- **Follow-through** — after the peak, does the body overshoot and settle, with
  secondary motion carrying past, or does it stop dead?
- **Silhouette** — at the key poses, is the action readable from the outline alone, or
  is the shape cramped and ambiguous?
- **Believability** — the overall read: does this look like motion from a trained body,
  or is it stiff, robotic, interpolated between keys, or close to a neutral rest pose?

Score each on the same wide scale, and anchor the scale with named levels rather than
adjectives: a bottom anchor for broken or absent, a low anchor for amateur placeholder
work, a middle anchor at the lowest quality that would be accepted into a shipping
build, and a top anchor for excellent. Those four anchor definitions carry essentially
all of the rubric's meaning. The arithmetic that turns six numbers into one is
comparatively unimportant and should never be the part you spend the argument on.

## Anchors first, arithmetic second

A plain mean of the six is a reasonable default and it has one known weakness: it lets
a catastrophic zero on one dimension be carried by five adequate ones. Motion does not
work that way — a strike with no follow-through at all is not a passing strike no matter
how good its silhouette is. So the aggregate needs a floor rule alongside the mean: any
dimension below the broken anchor caps the overall verdict regardless of the average.
State the cap explicitly; do not encode it by re-weighting, because weights are opaque
and invite endless tuning while a cap is a rule anyone can read.

Watch the double count. The overall-read dimension is not independent of the other
five — it is partly their sum — so a mean that includes it slightly overweights the
gestalt. That is usually acceptable and occasionally the point, but decide it
deliberately and write down which it is.

## Decision rules

- **Two thresholds, not one.** A pass bar and a distinctly lower warn bar. The band
  between them is the queue a human reviews; without it every borderline artifact is
  either silently accepted or bounced, and the borderline band is where all the useful
  information about the generator lives.
- **A missing dimension is not a zero.** If the critic did not return a value — it
  refused, the reply failed to parse, the sampled frames could not support the
  judgment — record it as unscored and let that block the verdict. A zero says "broken
  motion"; unscored says "we do not know". Substituting one for the other manufactures
  the most damaging kind of false negative.
- **Require a small number of concrete observations and one highest-impact fix.**
  The observations must cite what changed between named frames. The single fix is what
  makes the score actionable rather than merely true, and it is also the best cheap
  check on the score: a fix that does not follow from the low dimensions means the
  score was not read off the artifact.
- **Give the critic the intended read and the sampled frame count.** Both are basis. A
  score of a strike judged as a strike and a score of the same frames judged as a dodge
  are different quantities, and so are scores taken from eight frames and twenty.
- **Anchor the dimensions in the published principles, but never cite a principle as
  the criterion.** "Follow-through" is a principle; "does the body overshoot and settle
  or stop dead" is a criterion. Only the second is checkable.

## When not to use it

- **On non-character motion.** Cloth, foliage, camera moves and interface transitions
  fail on different axes; anticipation and silhouette are meaningless for a fading
  panel. Build a separate short ruler rather than stretching this one.
- **On a single frame.** Four of the six dimensions are properties of change over time.
  A rubric applied to one image measures pose, and pose is a different subject.
- **As a rig or technical check.** Interpenetration, joint limits, foot contact and
  root-motion correctness are structural facts with structural tests. Passing them
  through a perceptual ruler wastes an expensive instrument and gets a fuzzy answer to
  a question with a crisp one.
- **On loops evaluated for seam continuity.** A cycle's seam is a specific defect —
  does the last frame flow into the first — that this ruler will only ever notice
  indirectly, if at all.

## The failure this prevents

A rubric of undefined nouns produces scores that correlate with the rater and not the
artifact, and the damage is invisible because the numbers keep arriving. The tell is a
distribution that never moves: the generator improves, the pipeline changes, the mean
stays where it was. That is a rubric measuring its own vocabulary, and it will report
the same value the day a regression ships.
