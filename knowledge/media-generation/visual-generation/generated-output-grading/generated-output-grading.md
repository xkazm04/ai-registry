---
layer: golden-path
type: golden-path
subject: generated-output-grading
status: forged
use_when: [judging generated images at scale, choosing between image models or providers, deciding whether a failure is the prompt or the model, building a quality gate for a generation pipeline, validating that a controlled vocabulary carries meaning]
techniques:
  - unconditional-fail-criteria
  - vision-model-grading-schema
  - two-grader-disagreement-rule
  - regrade-without-regenerate
  - cross-provider-flip-analysis
  - trial-matrix-design
  - replication-as-comprehension-test
---

# Generated output grading

"Looks good" is not a judgement; it is a mood. The moment a pipeline generates
images faster than a human can look at them — and every production pipeline
does — the question of whether an output is usable has to become something a
machine can answer, a human can audit, and a spreadsheet can aggregate. That is
what this subject is: the discipline of turning aesthetic impressions into
**countable, diagnosable verdicts**, so that a batch of renders carries a
finding and not just a folder of pictures.

The principal practitioner's core belief is that **a grade exists to route a
decision**, not to decorate an asset. Every grade in the system should answer
one of three questions: *is this specific output usable* (the gate), *which
generator should we standardize on* (the comparison), and *when it failed, whose
fault was it — the brief or the model* (the diagnosis). A grading scheme that
answers none of these is overhead. A scheme that answers them badly — a single
1–10 "quality" number, say — is worse than overhead, because it launders three
different questions into one figure that answers none of them.

## Count what can be counted, judge what cannot

The naive rubric is a list of adjectives: "clean", "professional", "on-brand".
The professional rubric is stratified by **how the check can be verified**,
because verification method determines reliability:

- **Countable checks** come first and dominate. "Exactly three arrows." "Left
  panel widest." "One element in the accent colour, nowhere else." These are
  boolean per check, and a grader — human or vision model — either counts
  correctly or can be shown to have miscounted. Measured practice across
  evaluation literature agrees: precise boolean checks produce dramatically
  better inter-rater agreement than scalar scales, because a scale invites each
  grader to bring their own internal calibration and a count does not.
- **Judged checks** are the small remainder — did the model *invent* something
  apt, does the composition carry the idea. These are legitimately taste, and
  the honest move is to label them as taste, keep them few, and never average
  them into the countable score. Two candidates that tie on counts are
  separated by judgement; judgement never rescues a candidate that failed the
  counts.
- **Unconditional fails** sit above both: properties that make an output
  unusable regardless of everything else it got right. These are not low
  scores; they are vetoes, and they short-circuit the rest of the rubric
  (unconditional-fail-criteria).

A useful calibration for any countable rubric: a serious candidate lands most
of the counts; a candidate below half is generating moods, not compositions,
however attractive the output. State that threshold before grading, not after.

## The grade is the durable artifact

Renders are cheap to lose and cheap to remake; judgements are neither. A graded
batch should persist its verdicts in a structured index that outlives the
images — keyed by every variable that produced each cell (style, brief,
generator), so that later analysis can diff any two slices without re-rendering
anything. Two consequences follow, and both are repeatedly relearned the hard
way:

1. **Grading and generation must be separable operations.** A judgement can be
   lost (vision calls time out under concurrency far more often than
   generation fails) while the image underneath is perfectly good. If the only
   way to recover a judgement is to re-render, you are paying generation cost
   to fix a recognition problem — and, worse, the new render is a *different*
   image, so the recovered grade describes an artifact nobody reviewed
   (regrade-without-regenerate).
2. **Reading a finding must cost nothing.** The report that interprets the
   index is a separate, free, endlessly re-runnable step. The expensive builder
   half-fails sometimes; the reader runs after every partial pass. A pipeline
   where "see the results" and "spend money" are the same command gets its
   results looked at exactly once.

## Failure attribution: the prompt or the model

A single failed render tells you almost nothing, because generation is
stochastic — the same prompt on the same model can leak text on one run and
not the next. Attribution requires **structure**: hold everything constant
except one variable, and let agreement across the varied axis do the work.

The instrument is a trial matrix (trial-matrix-design): a small set of briefs,
each probing a *different* visual problem — plotting a magnitude, holding an
inventory without clutter, carrying an analogy, drawing a causal mechanism,
showing directional flow — crossed against every style or model under test.
Chosen well, no candidate can pass the whole set by being good at one thing,
which is precisely the property a single showcase image cannot have.

Run the same matrix on two generators and the diagnosis falls out of the diff
(cross-provider-flip-analysis): a cell that fails on **both** indicts the
brief; a cell that flips indicts a model; a failure that survives many
unrelated prompt variants on one model is that model's ceiling, not a wording
problem. And before concluding incompetence at all, rule out the mechanical
explanations — some architectures silently truncate long prompts, so a model
that "ignored" everything after the midpoint may never have seen it. Re-run
with only the head of the prompt before writing the verdict.

The comparison's bottom line is economic, and it must be computed over the
right denominator: **cost per usable output, not cost per render**. A cheaper
generator that fails the gate more often is the more expensive one, and the
inversion is common enough that per-render pricing routinely picks the wrong
winner.

## Machine graders are instruments, and instruments drift

Vision-model grading is what makes any of this scale — a model reads each
render against the brief that produced it and fills a fixed schema of counts
and booleans (vision-model-grading-schema). Treat it as an instrument with
known error characteristics, not an oracle:

- A single vision model is **an opinion, not a measurement**. Two competent
  graders can disagree on the same image over a genuinely arguable property.
  Agreement between graders upgrades an opinion toward a measurement;
  disagreement is a first-class outcome that routes the cell to a human,
  never a tie to be averaged away (two-grader-disagreement-rule).
- Judge choice is a **systematic** error source, larger than the stochastic
  noise within one judge. Averaging many runs of one grader narrows the error
  bars around its bias; it does not remove the bias.
- The grader must be pinned to the visible. Instruct it to answer only about
  what it can actually see, and record *which* grader produced each verdict —
  an ungraded cell labeled as ungraded is honest; an ungraded cell that looks
  like a pass is a lie the pipeline tells itself.

The mature arrangement is a cascade: deterministic detectors for whatever can
be detected deterministically, vision-model grading for semantic adherence,
and a thin human layer that both breaks grader ties and periodically
re-calibrates the machine graders against its own judgement. Each layer is
cheap relative to the one below it, and each catches what the layer above
cannot.

## Sampling: the spread is the finding

Two rules keep a sample from flattering the system. **Generate several per
cell before judging** — one sample measures luck, and the spread across a
handful is the finding, not the best of the handful; a per-generation risk
like stray text appears and disappears between identical runs, which is the
argument for judging every output rather than spot-checking. **Spread any
subsample across the whole work**, never the first N — the opening beats of
any authored sequence are systematically the easiest, and a sample of easy
cases proves nothing.

Finally, distrust your own fixed test set over time. A benchmark whose prompts
never change gets optimized against, deliberately or not; a trial set lifted
from *real* production briefs — including the shapes that are awkward to draw —
resists this in a way an invented set never does, because invented sets
quietly avoid what their author suspects is hard.

The end state to aim for: every generated output in the pipeline carries a
verdict, every verdict names its grader, unmeasured is visibly distinct from
pass, and any human can go from "this batch feels off" to "this model cannot
draw countable mechanisms, and here are the twelve cells that prove it" in one
report run.
