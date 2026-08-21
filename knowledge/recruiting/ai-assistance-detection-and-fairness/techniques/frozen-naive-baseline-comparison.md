---
layer: technique
type: technique
subject: ai-assistance-detection-and-fairness
technique: frozen-naive-baseline-comparison
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, inference-must-look-like-inference]
shared_with: []
use_when: [deciding whether a submission shows any human judgment, building a reference artifact for a work sample, interpreting a similarity number without over-claiming]
---

# Frozen naive baseline comparison

The baseline answers one question, and it is a better question than "was this
written by a model": **what does zero human judgment look like on this exact
case?** Generate the fully-delegating submission deliberately — hand a capable
model the brief and nothing else, no exploration of the supplied material, no
resolution of conflicting requirements, no noticing of anything — and freeze the
result as a reference artifact belonging to that case.

Distance from that artifact is then measurable, per case, without any claim
about tools. A submission close to the baseline did what the baseline did: took
the brief at face value. A submission far from it went somewhere the naive path
does not go. Both of those statements are about judgment.

## Why the baseline must simulate a candidate, not describe one

The generating prompt is the technique's load-bearing part, and the common
mistake is to write it as an instruction to a grader ("produce a low-quality
submission", "write what a lazy candidate would write"). That produces a
strawman, which is worse than useless: real delegated submissions are *fluent
and competent-looking*, and a scruffy strawman makes every real submission look
far from baseline.

Write it as a role simulation instead: you are a candidate who received this
brief, you will produce a complete, professional-looking submission, you will
not open the supplied material beyond what the brief quotes, you will not
question anything the brief asserts, and you will resolve every ambiguity by
picking the first reasonable reading. The output should be something you would
plausibly receive and initially think was fine. That is the honest reference
point.

## Frozen, versioned, and bound to its case

Regenerate the baseline per grading run and the measurement dissolves: sampling
variation alone moves every candidate's distance, and two candidates graded a
week apart were graded against different rulers. Generate once, store it with
the case, version it, and record which baseline version each verdict used
([a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

Regenerate only when the case material changes, and when you do, treat the new
baseline as a new ruler: distances computed against the old one are not
comparable to distances computed against the new one, and any cohort statistic
spanning the change must say so.

Generate more than one baseline per case where you can afford it — the naive
path is not unique, and a small family of baselines makes "distance to the
nearest naive artifact" a far more stable measurement than distance to a single
sample.

## Compare the contribution, not the artifact

Both the submission and the baseline start from the same supplied material, so
most of both artifacts is material neither of them wrote. Comparing whole
artifacts measures that shared inheritance and drowns the signal — and it fails
in a particularly deceptive way, because it stays high for everyone and looks
like a working measurement.

Compare **deltas**: what each side added or changed relative to the supplied
material. That is the author's actual contribution on both sides, and its
overlap is the thing you meant to measure all along.

Prefer set overlap of added units — the proportion of added lines the two
deltas share out of all the added lines either has — over whole-text sequence
similarity. Sequence similarity is fragile against differences in length,
truncation and ordering that have nothing to do with content: if one side's
copy of a region was clipped by a size budget, sequence comparison collapses
toward zero for every candidate at once and the whole instrument silently reads
as "everyone is original".

Weight each region by how much was contributed there, so a one-line change and
a rewritten section do not count equally.

## The one part that must be excluded

Exclude the candidate's decision log, reasoning notes, or write-up from the
similarity computation.

The reason is specific and easy to get wrong. Naive submissions and thoughtful
ones both contain prose explaining the work, and that prose is the most
stylistically generic material in either artifact — both will say "I chose this
approach because it is simpler to maintain". Including it inflates similarity
for candidates who documented their reasoning well, which penalises exactly the
behaviour you want. Worse, it turns the measurement into a *style* comparison,
which is the stylometric detector this subject exists to refuse, rebuilt
accidentally.

The decision log has its own job — it is what the authorship conversation is
built on — and that job is destroyed by scoring its wording.

## Reading the number honestly

Baseline similarity is an **inference**, and must be presented as one
([inference must look like inference](../../_laws.md#inference-must-look-like-inference)).
The defensible readings are narrow:

- **High similarity** — this submission stayed on the path a brief-only reading
  produces. It is a prompt for a human to look at *what* is shared: converging
  on the same obvious solution to a constrained problem is common and innocent,
  and identical shared *errors* are the finding, not identical structure.
- **Low similarity** — this submission departed from the naive path. It does
  not follow that the departure was good; a confused submission is also far
  from baseline. Distance is a necessary condition for judgment, not a
  sufficient one.

Consequently: **never threshold it into a verdict, and never render it on a
colour ramp or a risk meter.** The moment it is a red-to-green gauge, the
reviewer has been told it is a penalty, and every downstream fairness property
in this subject is gone. Render a plain number with its interpretation in
words, next to the specific overlapping regions that produced it.

## Interaction with the canary

The two instruments answer different halves of the same question and the pair
is far stronger than either. A submission that is close to the baseline *and*
propagated the canaries is a coherent story: brief taken at face value, nothing
verified. Close to the baseline while catching every canary is a different and
entirely respectable story: the obvious solution was the right one, and the
candidate checked. Far from baseline while propagating canaries is the one to
look at hardest — creative, unverified work.

Never collapse the pair into one number. The combinations mean different
things, and the collapse throws away the meaning.

## When not to use it

- **When the case has one correct answer.** Constrained problems force
  convergence; baseline similarity on a case with a single idiomatic solution
  measures the case, not the candidate.
- **When the case is short.** Below a certain size the comparison is dominated
  by boilerplate and the number is noise.
- **When the comparison's own mechanics have broken.** Baselines are generated
  under size budgets; point the instrument at material far larger than those
  budgets and the two deltas barely overlap by construction, producing a
  uniformly tiny similarity for everyone. That is not a cohort of original
  thinkers, it is a broken ruler. Detect the condition — implausibly low
  similarity across an entire cohort, or a compared region that exceeds the
  generation budget — and report *no signal*, never the number.
- **When no frozen baseline exists for the case version served.** Report *not
  evaluable*. Do not substitute a baseline from a different case version, and
  do not generate one at grading time to fill the gap — an unfrozen baseline is
  not a ruler.
