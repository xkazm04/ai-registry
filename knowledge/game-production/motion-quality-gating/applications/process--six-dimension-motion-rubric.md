---
layer: application
type: application
subject: motion-quality-gating
technique: six-dimension-motion-rubric
stack: process
status: forged
---

# The animation-critique prompt and scorecard in PoF

PoF grades character motion with a vision-language model driven by a pure prompt
builder and a pure deterministic scorer. The two halves are deliberately separated:
`src/lib/anim-critique/prompt.ts` owns the ruler's wording, `src/lib/anim-critique/score.ts`
owns the arithmetic, and neither performs I/O.

## The ruler (`prompt.ts:19-42`)

`DIMENSION_GUIDE` (lines 19-25) defines each of the six dimensions as an observable
contrast rather than a noun, which is the whole technique in six lines:

- `anticipation`: "is there a clear windup/preparation that telegraphs the action
  before it happens? (a weighty strike pulls back first)"
- `weight`: "acceleration into the hit, a sense of effort — or does it float/glide with
  uniform speed?"
- `timing`: "slow-in/slow-out, a fast snap on the strike and a settle on the recovery.
  Even, metronomic spacing reads robotic."
- `followThrough`: "does the body overshoot and settle after the peak (secondary
  motion, the blade carrying past), or stop dead?"
- `silhouette`: "at the key poses, is the action readable from the body's outline
  alone, or is it a cramped/ambiguous shape?"
- `believability`: the overall read — trained human versus "stiff, robotic,
  keyframe-interpolated, or T-pose-adjacent".

The absolute-judgment clause sits in `buildCritiquePrompt` (line 36) and is the file's
own stated load-bearing wording: judge "in ABSOLUTE terms against professional, shipped
AAA game animation — do NOT grade on a curve, do NOT assume the input is competent, and
do NOT judge it relative to itself", closing with "A 'functional' motion that doesn't
read as believable is a low score." The module docstring names the failure it exists to
prevent: "a stiff, code-authored motion scores low even though it 'technically
functions'".

Context is passed as `AnimationContext` — the asset name, the *intended* read
(`intent`, documented as "what the motion is and how it SHOULD read"), the sampled
`frameCount`, and an optional duration. Frame count and duration go into the prompt
text itself (line 32), so the basis of the score travels with the request. The reply is
constrained to a strict object with `dimensions`, `reasons` ("2-5 short, concrete
observations… cite frame-to-frame changes, e.g. 'frames 2-3 jump with no in-between'")
and `topFix`, the single highest-impact change.

## The scorer (`score.ts:9-49`)

`DEFAULT_THRESHOLDS = { passAt: 70, warnAt: 45 }` over a 0-100 scale whose anchors are
stated in the prompt (line 40): `0` broken/absent, `50` amateur/placeholder, `70`
acceptable for ship, `90+` excellent. `scoreCard` (line 43) takes an unweighted mean
across the six `DIMS` and maps it through the two thresholds to `pass | warn | fail`.

The anchors are the payload; the mean is the cheap part. Two properties of this
implementation are worth naming honestly:

- **No capped disqualifier.** A zero on `followThrough` can be carried by five adequate
  siblings into a `warn` rather than a `fail`. The golden-path standard — a dimension
  below the broken anchor caps the verdict regardless of the mean — is not implemented
  here, and the standard stands.
- **`believability` is inside the mean.** It is partly a function of the other five, so
  the gestalt is slightly overweighted. Defensible for a ship gate, but a deliberate
  choice rather than an accident of listing six fields.

`scoreMesh` in `src/lib/visual-gen/mesh-critique.ts` is the sibling instrument for mesh
structure; the shared shape of the two — pure scorer, model-independent, thresholds as
data — is what lets both be unit-tested without a model.
