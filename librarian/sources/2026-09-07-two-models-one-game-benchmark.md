---
source: youtube
kind: first-party practitioner account
url: https://www.youtube.com/watch?v=71BiwHJXu20
title: "I Let GPT-6 Astra and Fable 5.1 Build the Same Game"
author: Coding Crash Courses
words: 892
extracted: 10
accepted: 2
declined: 0
leads: 1
already_covered: 4
untriaged: 3
applied: 2
shipped: 1
dispatched: 0
run_id: yt-71bi
siblings: 1
---

# Two models, one game, one personal benchmark

**Class: first-party practitioner account, n=1.** A practitioner runs a fixed personal
benchmark - one prompt, one small game, re-run at each frontier release - and reports what
he saw. 892 words, the shortest source this ledger records. The class is reliable for what
he *did and measured* and unreliable for his opinions about the field, and the expected
yield was said out loud before the triage table: **one landing, several catches, no
subject.** That is what it produced.

**Siblings: 1 live at claim** (a second game-development video, phase 0), rising to 4 by
Phase 4, all at phase 0. I claimed five subjects before any of them reached Phase 4, and
the board stayed clear on every one at every check. `check-bundles` counted +2
game-production techniques and +1 each in media-generation and software-engineering
between Phase 1 and Phase 7 - siblings landing mid-run, none in files I touched.

**Fetch budget: 0 of 3** (fourteenth consecutive corpus-internal run). The class predicts
it: a first-party account corroborates against the corpus and against code, and reaching
for the web here would have meant the claim had no home.

## The source in one paragraph

He asks two models for a spec first, then an implementation: an endless snowboarding game
that gets faster, damages you on collision, lets you heal, "risky and tough". Both write
specs of near-identical length. Both run a visible loop - write code, run it, screenshot
it, iterate. Both produce something that renders and plays. One is unnavigable because it
puts too many obstacles in the way at speed; the other has so little opposition that he
stops out of boredom. His conclusion is that the models cannot make a game that is *fun*,
and that fun is hard to measure.

His conclusion is the least useful thing in the video. **The observation underneath it is
the finding, and he did not draw it**: the two failures are at *opposite poles*.

## Triage

Scored per v2.5. No vetoes fired; no escalations.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | amendment | M | Unsigned residual of a tuner that never plays | gp/balance-validation/difficulty-design-and-adaptation | corrects-claim | real gap | 3/1/2 | **accept** |
| 2 | K | technique | M | Entitlement exhaustion is not ill health | lo/quality-scoring/cross-provider-benchmark-operations | new-technique | real gap | 4/1/2 | **accept** |
| 3 | K | technique | M | A generate-check loop optimises what the checker sees | gp/craft-judgment/unattended-build-loop | none | likely catch | - | catch |
| 4 | K | amendment | S | A render check passed a scene that was semantically backwards | gp/craft-judgment/unattended-build-loop | none | likely catch | - | catch |
| 5 | S | practice | M | Ask for the spec artifact before the implementation | se/llm-agent/prompt-and-context/agent-instruction-files | none | likely catch | - | catch |
| 6 | K | technique | M | A truncated arm may not carry a comparison | lo/quality-scoring/quality-regression-gating | none | likely catch | - | catch |
| 7 | K | practice | M | Keep one private fixed task as the release benchmark | lo/.../cross-provider-benchmark-operations, se/.../eval-harness | none | partial | - | untriaged |
| 8 | K | technique | L | The metric with no instrument, and the human who is the only one | recruiting/assessment/assessment-instrument-validation | none | partial | - | untriaged |
| 9 | K | currency | S | Two frontier releases both one-shot a playable web game | - | resets-clock | thin | - | untriaged |
| 10 | K | lead | S | Two independent specs converged on ~300 lines from one paragraph | - | none | thin | - | lead |

`auto=2/0/0`, `fp=0`. Rows 3-6 are catches, not rejections: the corpus says each of them
and says them better. Rows 7-9 are **untriaged**, not declined - nobody verified them and
they carry no judgment; their anchors are below so a later run does not re-derive them.

### The promoting question, executed on both `partial` rows

- **Row 7.** Q: does anything in the corpus own *contamination resistance as a property of
  keeping the task private*, as against freezing a sampled dataset? Read
  `dataset-sampling-anonymize-freeze` and `eval-harness#discriminating-task-selection`:
  both own freezing and discrimination, neither addresses publication. Genuinely a seam
  rather than a hole - and one this source cannot authorize, because he offers no evidence
  that privacy did anything for him. Stays untriaged with the seam named.
- **Row 8.** Q: does the corpus have a technique for a quality axis with no automated
  proxy at all, as against a noisy one? `binary-metrics-over-a-noisy-scale` and
  `reference-free-quality-estimation` both presume a proxy exists. The gap is real, and
  892 words of one person's taste is not the source that fills it. Untriaged.

## What landed

### 1. The optimistic default has a premise: the estimator plays

`four-term-difficulty-decomposition` names three estimators of the one term nobody can set
- the design team, the test team, and a headless harness - and says the error they share
is *optimistic*, durable precisely "because everyone reviewing shares it". The golden path
repeats it as a failure mode ("Tuning against a player who does not exist").

**The unstated premise is that every estimator on that list plays the game.** A designer
plays it, a tester plays it, a harness resolves its mechanics at full speed. High-skill
executors produce a **signed** error, and a signed error can be corrected on sight without
measuring anything, which is exactly what makes the technique's advice cheap.

A tuner that never executes the system has no skill estimate to be optimistic about. The
source is the evidence and it is the right shape for it: two independent authors, one
brief, and the results sit at **opposite poles** - one build unnavigable once speed rises,
one with nothing to avoid. A signed error puts both on the same side. This is not a biased
estimate; it is an absent one, and an absent estimate has no direction.

What this changes is the corrective, not the model. The technique already makes
*unestimated* its own epistemic state - but describes its failure in the optimistic
register, so the reflex that follows an unestimated value is to ease the system. Against a
signed error that is right and free; against an unsigned one it is a coin flip that makes
half its cases worse while reporting that difficulty was handled. Landed as an appended
section plus one `use_when` entry. **The file's existing sentences all stay true**, which
is what kept RISK at 1 and made it an append rather than a rewrite.

### 2. Entitlement exhaustion is not ill health

The author's Astra arm hit a subscription usage limit partway through a fix; his Claude arm
did not. He says plainly that he cannot compare token use - and then reports the comparison
anyway, which `partial-run-never-green` already forbids (row 6, a catch).

The gap is next door. That technique's decision rules say **"all truncation causes converge
on one state"** and enumerate four: cost ceiling, operator cancel, pre-flight refusal, crash.
An enumeration is a claim. Every member of that list is something the harness or its
operator did; a halt imposed by the *target* is a fifth cause and it does not converge in
the same way - it is a fact about the account rather than the provider, it is **reproduced**
by re-running (where ill health is transient by construction), and it is correlated with the
target under test, which makes it the only cost signal available when the plan is not priced
per call. The same technique explicitly pushes this case away: *"do not entangle it with the
product's usage-limit machinery"*. Sound when you control the harness, and unavailable when
the thing under test is sold as a plan.

The discriminator is not the status code - a burst limiter and an exhausted allowance
return the same one - it is **the stated wait measured against the budget the run has to
give it**. Landed as a new technique in `cross-provider-benchmark-operations` with the
declaration, classification, rendering and reporting rules, plus a golden-path clause
saying why `budget-preflight-and-ceiling`'s two halves both fail when the ceiling is not
yours.

**Convergence, and it is why GAIN carried a +1.** This fleet's own memory harness recorded
on 2026-09-05, independently and about its own internals: *"an undeclared constant inside an
arm silently sets that arm's budget... any cap that can bind before the declared budget is a
predicate of the arm and belongs in the run header"*, after a hard-coded chunk ceiling spent
665 of 6,000 given tokens and made every number in that arm a fact about the ceiling. Same
shape, different owner - inside the harness there, outside it here.

## Applied - 2 of 2 owed

**Row 1 -> pof, `code`, `better`, shipped `a87224d9`.** The seam is not the evaluator
prompts the existing application already covers; it is `threat-score.ts`, a weighted sum of
an archetype's stats into a danger number, whose weights the project's own audit records as
hardcoded by a non-playing author. Both arms over the same twelve-archetype, three-tier
roster - the shipped vector, and an equally defensible one weighting defense level with
offense. **Cross-tier ordering identical; within-tier ordering flips in all three tiers**,
same pair every time, six of twelve archetypes moving. The fragile half is the half the
peer-band linter and encounter budgeting consume.

The structural fact nobody designed: **every existing assertion was weight-independent** -
damage outranks health, a score is positive, empty is zero - so each passes for any vector
where damage outranks health, and a suite that looked like coverage pinned no shipped value
at all. Shipped the corrective the technique prescribes, which is explicitly *not* a retune:
provenance recorded as unestimated with the reason the easing reflex does not apply, and the
within-tier ordering pinned by characterization tests that say in their own comment that
they do not claim the order is right.

**The guard was calibrated and the first calibration failed.** A single weight nudged 0.05
left all 11 tests green - the guard did not protect what I had just claimed it protected.
Re-run against the perturbation actually measured (the full reweighting), both new tests go
red. Restored, 50/50 green across the balance lane. The comment now states the reach
honestly: it catches a change of **stance**, not drift. A characterization test that has
never been shown to fail is indistinguishable from one that cannot.

**Row 2 -> tracklight, `experiment`, `better`, `structural-only`, ship 0.** Seam chosen to
falsify, and it did most of its job. That runner **already** renders provider-side absence
separately from money-side absence, comments on the distinction in this technique's own
terms, feeds its breaker on generation failures only, fails open when every target is
indicted, and tests the leaderboard's winner paired on the cases both completed. The
coverage half of the technique lands as **already-covered**, and the document says so
rather than claiming it.

What survives is one rule, and it is missing *structurally*. The engine defines eleven
typed error variants, one of which - `OverBudgetWait` - is exactly this technique's
discriminator, carrying the wait that did not fit and the budget that remained, with a doc
comment insisting it be kept distinct from ordinary exhaustion. One layer up the comparison
runner reduces every generation outcome to a boolean before the breaker or the report sees
it. **Eleven causes upstream, two absence classes in the artifact, and the variant that
would have made a third possible is discarded at the assignment.** Not an oversight about
the distinction - the same tree draws the harder version of it two fields away. A type
collapsing at a layer boundary, one line before the consumer that needed it, invisible to a
reviewer reading either file alone.

**Ship 0, with a recorded reason and not an excuse**: the file holding the collapse had
another session's uncommitted work in it, which is the one case the standing authorization
does not cover. Return condition: when that work lands.

## Catches - the corpus already says it, better

- **Rows 3 and 4.** The screenshot-and-iterate loop, and the bear that rendered correctly
  while facing away from the slope, are both `unattended-build-loop`: *"the builder
  substitutes shape for semantics - it confirms the artifact exists, is well-formed, and
  mentions the right things, and treats that as evidence of correctness"*, which is
  `structural-proof-is-never-sufficient` observed in the wild. The video is a clean
  illustration and adds nothing to the rule.
- **Row 5.** Spec-before-implementation is owned in three places and none of them needed
  this.
- **Row 6.** `partial-run-never-green` states the source's own error better than the source
  notices it: a run that judged part of its set is unverified, and truncation causes do not
  get to upgrade to green.

## Untriaged - anchors kept, nobody verified these

- **Row 7 - the private fixed task.** *"I created my own little benchmark a while ago"*,
  re-run per release, never published. The corpus owns freezing and discrimination; nobody
  owns publication as a contamination surface. Return: a second source that measures the
  difference, or a fleet harness that has one.
- **Row 8 - the axis with no proxy.** *"fun is hard to measure and probably very hard to
  assess for an LLM"*. Every neighbouring technique presumes a noisy proxy exists rather
  than none. Return: a source with a construct-validity argument behind it.
- **Row 9 - currency.** Two frontier releases each one-shot a playable web game from one
  paragraph. No application in the corpus carries a claim this dates, so there is no clock
  to reset; recorded so a later run can see the date.

## Leads

- **Two independent specs converged on ~300 lines from a one-paragraph brief** (314 against
  roughly 294). If spec length is a property of the *brief* rather than of the generator, a
  spec-length delta becomes a cheap signal that a brief is underspecified. n=2, one
  observer, no protocol - not evidence of anything yet. **Return condition:** when a fleet
  harness produces the same artifact from two generators on one brief and the lengths can
  be measured rather than eyeballed - the memory-year harness's adapter contract is the
  nearest shape that could carry it.

## For the next run

The two accepted rows share one shape and it is worth naming: **both were found by
catching an enumeration's unstated premise, not by finding something the corpus lacks.**
Row 1 - three estimators listed, all of them players, the premise never said. Row 2 - four
truncation causes listed, all of them harness-side, the premise never said. Neither
subject was thin; both are among the better-argued files in their bundles, and that is
precisely why the premise went unwritten. Phase 6's enumeration hunt found both, and
neither was visible in the Phase 3 rows.
