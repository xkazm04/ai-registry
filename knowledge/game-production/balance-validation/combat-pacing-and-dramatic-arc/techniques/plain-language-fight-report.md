---
layer: technique
type: technique
subject: combat-pacing-and-dramatic-arc
technique: plain-language-fight-report
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [simulation output is being ignored by the people it was built for, writing the metric glossary that ships with a balance tool, deciding which numbers reach a designer at all]
---

# Plain-language fight report

The named concern: emit the result of a pacing analysis so that a designer who does not read
code changes a decision because of it. A metric nobody can interpret does not change any
decision, which makes the language layer a component of the instrument rather than
documentation of it — and it fails the same way a miscomputed curve fails, silently and
downstream.

## The glossary is part of the tool

Every metric that reaches a human ships with three things, and a metric missing any of them
is cut rather than shipped:

1. **A definition in ordinary words.** What is counted, over what population, in what unit.
   Not the formula — the meaning.
2. **A worked example with real units.** *A time-to-kill of 8.5 seconds means the average
   enemy in this encounter dies eight and a half seconds after the player first engages it.*
   The example is what converts a name into a quantity the reader can picture.
3. **The design judgment that makes it actionable.** *A one-shot rate above roughly five
   percent reads as unfair.* *An ability used a tenth of a time per fight should be buffed or
   cut.* These are the expensive part: accumulated opinion from people who have tuned fights.
   Written next to the number, they turn a telemetry dump into a design conversation; omitted,
   the reader supplies their own threshold and two readers disagree without noticing.

Twenty or so well-chosen metrics with all three parts beat a hundred bare ones. Key the
glossary by the exact identifier the emitting code already holds for each metric, so a panel
cannot display a number without being able to reach its definition, and every surface defines
the term identically. A fourth part earns its place for metrics that are only meaningful in
pairs: say how to read them *against each other*. *A six-second median with a nine-second
average means a few long fights are pulling the average up* teaches more than either entry
alone, and divergences like that are where the interesting tuning problems hide.

The glossary is versioned and single-sourced with the tool that emits the numbers; a judgment
that lives only in a designer's head is not a judgment the report can carry.

## The card

The report is a small, fixed structure so that readers learn its shape once:

- **The verdict line** — the difficulty band with its measured value and the boundary it was
  compared against, plus the sample size behind it. State the rate as a small count out of ten:
  *you win seven of ten tries* is picturable in a way *0.71 survival* is not, and the rounding
  loss is irrelevant next to the comprehension gain.
- **The shape** — the named beats in order of what to change, each with its timestamp, its
  measured value and the threshold it crossed. Absence stated explicitly: *no climax detected*
  is a finding, not an empty section.
- **The length** — measured duration against its envelope, and which side of it.
- **The dominant cause, when there is one.** When a single damage source accounts for a large
  share of deaths — a threshold near thirty percent works well — name it. One named cause
  outperforms a full distribution, because it points at one thing to change. Below the
  threshold, say the deaths are spread and give the distribution; inventing a leader out of a
  flat spread is worse than reporting the spread. The attribution machinery that produces
  those shares belongs to the simulation harness, a neighbouring concern; this technique owns
  only the rule for when a share is worth naming and how to say it.
- **The suggested moves** — phrased as changes to inputs the designer controls, never as
  changes to the output. *Reduce enemy health by roughly a fifth*, not *raise the survival
  rate to 0.7*.

## Decision rules

- Write numbers with their unit and basis inline. *Tension 0.81 over one-second windows,
  normalized against effective player health per second* — a bare 0.81 will be compared
  against a differently computed 0.79 within a week.
- Never render an unmeasured thing as a neutral value. Not simulated, not enough trials, and
  metric unavailable are their own labels; a zero, a dash or an omission all read as *fine*.
- Prefer a sentence to a chart when the finding is one fact. Charts are for distributions and
  curves; a chart of a single scalar is a decoration that costs a reader a translation step.
- Say what changed since the last run when a previous run exists. A report that cannot be
  diffed makes every tuning pass start from zero.
- Read every threshold the prose quotes from the same source the checks use. A card that calls
  a fight a slog at thirty seconds while the alert gating it fires at forty-five has
  contradicted itself in front of the person it was built to convince. Two authorities for one
  quantity is worse than one, and the drift is invisible from either side.
- Cap the secondary notes — three is a good number — and drop anything the headline already
  said. A card that repeats its verdict in its own footnotes trains readers to skim past both.
  Filter informational findings out of the narrated layer entirely; they belong in the raw
  output, where someone looking for them will find them.
- Make the card emittable as plain text, not only as a rendered panel. Reports travel by being
  pasted into a design document or a message; a finding that cannot leave the tool has a much
  smaller audience than one that can.
- Keep the vocabulary stable. If *tough* means one thing in the band table and another in the
  prose, the report has taught the reader to distrust it.
- Do not editorialize past the evidence. A report that says a fight is *boring* has made a
  claim the instrument cannot support; a report that says the fight has no climax, no
  near-death and variance below the flat-pacing floor has said the same thing defensibly.

## When not to use this

- **As a substitute for the raw output.** Analysts and tools need the series, the trial
  records and the thresholds in machine form. The prose layer sits on top of that, never in
  place of it.
- **When the underlying analysis is below its own floor.** A confidently worded card over
  three trials, or over an encounter too short to analyse, is worse than no card: fluent prose
  raises confidence exactly where it should be lowered. Report the floor breach as the
  finding.
- **For a metric the team has no judgment about yet.** Shipping a number with a definition and
  no threshold invites each reader to invent one. Hold it in the raw output until someone can
  write the sentence that says what a good value looks like.
