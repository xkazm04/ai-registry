---
layer: technique
type: technique
subject: honest-measurement-presentation
technique: no-verdict-colour-without-a-goal-someone-set
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [colouring a metric tile or funnel row, writing a bottleneck headline, adding a health status to a dashboard, adopting an external benchmark]
---

# No verdict colour without a goal somebody set

A colour on a measurement surface is a judgement. Red says *this is failing*,
green says *this is fine*, amber says *watch this*. A judgement is only
meaningful against a benchmark, and the only benchmarks that license a
judgement about an organisation's hiring are the ones that organisation
actually set.

The defect this technique prevents is not a wrong threshold. It is an
**undisclosed** one: a default constant, chosen by whoever built the panel,
applied to every tenant, rendered as a verdict, and read by a hiring manager
as *our number failing our target*. Both halves of what the reader concludes
are untrue, and the reader cannot tell, because nothing on the screen says
where the line came from.

## The states

A metric on a surface has exactly one verdict state, and there are four:

- **`none`** — no goal has been set for this metric. This is the default, it
  is the correct answer, and it is not an error. Renders neutral.
- **on target / above** — a goal exists and the figure meets or beats it.
- **below** — a goal exists and the figure misses it.
- **not measured** — there is no figure at all, which is a different axis
  entirely and is handled by the dash and no-data-tier techniques.

`none` and *below* must be visually unmistakable from each other. The
temptation is to render `none` in a muted version of the warning colour so
the panel does not look empty; that is the original defect at lower opacity.

## The procedure

**1. Make the goal a first-class record, not a constant.** A goal has a
metric, a target value, a direction (higher-is-better or lower-is-better), a
scope (which roles, which teams, which period), an owner, and a date it was
set. A number in a component file has none of those and therefore cannot
license a verdict — [a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis).

**2. Compute the verdict in the metric layer, render it in the surface.** The
surface asks "what is the verdict for this metric" and gets back one of the
four states. It does not compare a value to a threshold itself. This is what
keeps the colour rule from being re-implemented, and differently, in the tile,
the funnel, the export and the digest.

**3. Render `none` as neutral and offer the editor.** The strongest form of
this technique is that the empty state is *productive*: the panel shows the
number plainly, says that no goal is set, and links to where a goal can be
set. This converts the honest answer from a disappointment into the product's
own onboarding path.

**4. Explain partial coverage.** Real surfaces are mixed: two stages have goals
and four do not, so two rows are coloured and four are neutral. To a reader who
does not know the rule, neutral rows look disabled, stale or broken. Detect the
mixed condition explicitly — *at least one row shows a real number that no goal
can judge* — and print one sentence saying that the number is shown and the
judgement withheld. The withholding must be legible as a choice, or it reads as
a failure. Note that the number is still shown: this technique withholds the
verdict, never the measurement.

**5. Never let an external benchmark colour anything until it is adopted.** An
industry median, a peer figure, a published statistic — these are inputs to a
decision about a goal, not goals. Show them as context beside the number.
Adoption, by a named person, is the act that turns one into a target.

**6. Stamp the goal on the verdict.** Wherever a verdict is shown with room
for a caption, name the target it was judged against and, where relevant, who
set it and when. A verdict is bound to what it judged
([a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged));
a red row with no visible target is an unfalsifiable one.

**7. Age the goal rather than silently enforcing it.** A target set for a
prior period, a prior requisition mix or a prior hiring market is not
automatically the target for this one. Past a declared staleness horizon the
verdict is still computed but shown with the goal's age, so a reader can
discount it. A stale goal that keeps painting rows red trains people to ignore
red.

## The language rule that travels with the colour

The same licence governs the summary sentence. **Without a goal there is no
weakest link — only a lowest number.** A "weakest link" or "biggest
bottleneck" claim asserts that a stage is underperforming what it should do;
that is a comparison against a target. An ordering across stages is not.

Funnel stages have structurally different conversion rates, so the lowest one
is very often the one that is *supposed* to be lowest. A brief that promotes
the lowest number into the bottleneck sends people to fix the stage that is
working. Where no goal exists, the honest sentence names the lowest stage as
the lowest stage, or names the largest absolute drop-off in candidates — a
volume fact, which is true without a benchmark — and stops there.

## Decision rules

- **When a metric has no direction declared**, it gets no verdict even if a
  target exists. "Time in stage: 6 days, target 5" cannot be coloured until
  somebody says whether lower is better; some dwell times are minimums.
- **When a goal's scope does not cover the rows on screen**, do not colour the
  rows. A target set for engineering roles judges engineering rows; applying
  it to a filtered view of sales roles is a verdict bound to something it did
  not judge.
- **When a goal exists but the figure is unmeasured**, the verdict is *not
  measured*, never *below*. Missing a target requires having measured.
- **When the sample is too thin to support the metric**, the verdict is
  suppressed with the metric. A goal does not license a claim the sample
  cannot carry.
- **When a reader can set a goal in one click, still do not pre-fill it with
  the default.** A pre-filled suggested target that someone accepts without
  reading has laundered the undisclosed constant into a real goal.

## When not to use this

- **Hard external limits are not goals and do colour without adoption.** A
  statutory response deadline, a contractual service level, a retention
  horizon — these are obligations someone else set and they may render as
  breaches. Say whose rule it is.
- **Data-quality warnings are not verdicts.** "This stage has no recorded
  transitions" or "12% of records are missing a source" may render in a
  warning treatment; they are claims about the data, not about performance.
  Keep them visually distinct from metric verdicts so a reader can tell "your
  hiring is off target" from "our pipe is broken".
- **A user's own ad-hoc filter threshold** ("show rows under 10%") colours what
  it selected because the reader set it a moment ago and can see it. It must
  not persist into an export or a digest, where the person reading no longer
  has the threshold in view.
