---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: graded-case-difficulty
status: forged
laws: [never-present-absence-as-an-answer, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [a scorecard must answer which model is sufficient rather than which is best, an eval corpus has stopped separating targets, deciding whether cases need more than tags, routing an easy majority away from an expensive model]
---

# Graded case difficulty

A benchmark that averages over an ungraded corpus answers "which target scores
highest". The question an operator actually has is "which is the cheapest target
that is **good enough** for this workload" — and those questions have different
answers whenever the workload is not uniformly hard, which is almost always. The
cheap model is often entirely sufficient for the easy majority of traffic and
merely adequate on the hard minority; a blended mean hides both facts and
recommends over-buying for the majority.

An **ordered** difficulty grade on each case is what separates them. Ordered is
the load-bearing word: free-text tags can express "multi-part" or "long-input",
and those are useful for clustering failures, but they cannot express *more
than* — so they cannot be a monotone axis, cannot be a report ordering, and
cannot support the sentence the operator needs, which is "clears easy and
medium; only hard needs the expensive one".

## What the grade buys beyond the routing sentence

- **Discrimination.** A tier every target passes carries zero information; so
  does a tier every target fails. Both are being paid for at full price. A
  graded corpus can report its own ceiling and floor, which is how a program
  learns its eval has stopped measuring — the failure mode of every eval suite
  that ages well past the models it was built for.
- **A sanity check on the instrument.** Scores should fall as difficulty rises.
  A target that scores *higher* on hard cases than easy ones is evidence about
  the corpus or the judge, not about the model — mis-graded cases, or a rubric
  whose anchors reward the elaboration that hard cases invite.
- **Cheaper decisions.** Once the tiers separate targets, the expensive
  configuration only has to be measured where it might matter. A matrix pruned
  by tier is the same evidence for less money.

## Procedure

1. **Model it as a small ordered ladder**, closed and enumerated. Three rungs is
   the honest minimum; more rungs need more cases per rung to say anything, and
   a ladder wider than the corpus can populate is decoration. Widening later is
   cheap and narrowing is not, so start narrow.
2. **Ungraded is a distinct state, never the middle rung.** An absent grade is
   not a middling grade, and imputing one puts every ungraded case into a bucket
   it was never assigned to — which then reports a per-tier mean nobody measured.
   Grade absence explicitly and report the ungraded count beside the tiers.
3. **Tolerate an unknown grade on import; refuse one a caller just stated.** A
   corpus exported from a system with a four-rung ladder should not fail to
   import into a three-rung one — degrade the unrecognised value to ungraded and
   say so, the same way a workload taxonomy degrades an unknown kind rather than
   refusing the row. A case nobody can read back is a case that leaves the
   corpus. Applied to a *stated* write the same tolerance is a defect: that
   string was typed on purpose seconds ago, so accepting it and storing the case
   ungraded produces a corpus that reads as graded and is not, and a per-tier
   report over a rung nobody stored. The two jobs cannot share one function —
   the read degrades, the write refuses by name and lists the rungs it knows.
   The asymmetry is worth stating because the lenient half is always written
   first and then reused for the strict one, and because a closed vocabulary
   tends to get enforced on the *filter* surface long before anyone checks the
   write surface, which is how a ladder comes to be enforced where cases are
   listed and not where they are created.
4. **Report per tier and in aggregate, and never only in aggregate.** The
   blended mean stays — it is what compares to history — but the per-tier
   breakdown is what the decision reads.
5. **Report the discrimination verdict descriptively, and never as a test.** The
   sentence an operator needs is "every target scored the same on this tier — it
   separated nothing", printed beside the tier's case count. It is an
   observation about this run, not a statistical claim, and it must not be
   dressed as one: no p-value, no corrected alpha, no significance vocabulary,
   and no per-tier recommendation. Per-tier power is far below the run's, and
   the tier that actually discriminates is usually the smallest — a per-tier
   "cheapest sufficient" computed over a handful of cases is precisely the
   confident-on-nothing failure the recommendation's power disclosure exists to
   prevent. Two honesty rules travel with the verdict: a tier only one target
   reached has **no answer** to "did it separate them", which is not the answer
   "no"; and where a target errored on part of a tier, the row says its mean
   covers fewer cases than the tier holds, so a complete-looking count cannot
   imply a coverage nobody had. A corpus that is entirely ungraded produces no
   table at all rather than an empty or zero-filled one.
6. **Carry the grade through every layer that carries the case.** A grade that
   exists in the dataset and is dropped by one storage backend produces per-tier
   reports that are correct on one deployment and silently ungraded on another
   — the same class of defect as an unported filter returning an unfiltered page.

## Who assigns the grade

This is the part that decides whether the whole technique is honest.

- **Hand-graded by the operator** is the defensible default. It is a statement
  about the workload, made by someone who knows it, before any model is run.
  What it grades, though, is **difficulty for a human**, and that is a different
  ladder. The clearest demonstration is the class of puzzle written to be hard
  for people: the reflection traps whose whole design is that a fast reader
  answers confidently and wrongly. They are famous, which means they and their
  worked solutions are in the training data, and every target answers them
  perfectly at every setting. A tier built from them separates nothing and costs
  a share of the run proportional to its size — the operator's intuition about
  what is hard produced the most expensive possible null. Grade from the
  *product's* hard cases, not from what would trip a clever person.
- **Derived from observed pass rates is circular** and must not be the primary
  source: it defines difficulty by the performance of the very targets under
  test, so a case is "hard" because today's models fail it, and the corpus
  re-grades itself every time the field improves. As a *diagnostic* it is
  excellent — a case graded easy that every target fails is a mis-grade worth
  reviewing — but a grade that moves with the leaderboard cannot be the axis the
  leaderboard is read along.
- **Provenance-derived** is the scalable middle: when cases are mined from real
  traffic, the traffic often carries a proxy — escalation, retry, human
  override, downstream correction. That proxy is a claim about the *product's*
  difficulty rather than the model's, which is the right thing to grade by, and
  it must be recorded as derived rather than presented as assigned.
- **Audited by expended effort** is the second opinion that escapes the
  circularity, and it is the answer to the human-ladder problem above. How much
  deliberation a target spent on a case — reasoning or thinking tokens, as
  reported per call — is the run's own measure of where a model found work to
  do, and it is not derived from the scores. A tier where the models' spend does
  not rise is a tier this corpus did not make harder *for these models*,
  whatever it cost a person to solve. Report it beside the operator's grades,
  never in place of them: it is diagnostic, it says nothing about whether the
  answers were right, and it is only available where the instrument recorded
  generation spend per case in the first place. Where a provider reports no
  split between reasoning and answer, say which basis the figure rests on rather
  than presenting the fallback as if it were the measured thing — and keep an
  unmeasured call out of the median instead of entering it as a zero.

## When not to use it

- A corpus small enough that a tier would hold three cases. Per-tier means over
  three cases are noise with a decimal point, and the statistical machinery will
  correctly refuse to call anything significant — grade it when there are enough
  cases for the grade to survive the test, and until then use tags.
- A workload that genuinely is uniform — one narrowly-scoped extraction task
  over homogeneous inputs. Grading it manufactures an axis with no variance,
  which costs the corpus its clarity and buys nothing.
- As a substitute for failure clustering. Difficulty says *how hard*; clustering
  says *what kind of hard*. The diagnosis needs both, and a tier alone will send
  an operator to a bigger model when the actual finding was that one dimension
  fails on one input shape.
