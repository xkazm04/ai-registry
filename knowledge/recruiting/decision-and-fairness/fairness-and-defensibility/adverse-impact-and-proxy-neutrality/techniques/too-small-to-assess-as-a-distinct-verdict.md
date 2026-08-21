---
layer: technique
type: technique
subject: adverse-impact-and-proxy-neutrality
technique: too-small-to-assess-as-a-distinct-verdict
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds]
shared_with: []
use_when: [designing the return type of a fairness computation, reviewing how a fairness result renders to a human]
---

# Too small to assess, as a distinct verdict

The fairness result has three states, not two. **Impact indicated. No impact
indicated. Too small to assess.** The third is not an error, not a null, not a
degenerate case of the second — it is a verdict with its own meaning: *this
population cannot answer this question, and nobody has looked with anything
that could.*

Every serious failure in this subject traces back to the third state being
collapsed into the second somewhere between the computation and the reader.

## Why collapsing is the default failure

It happens at four different places, and each needs its own guard.

- **In the type.** A function returning a boolean, or a ratio with `null`
  meaning "fine", has already lost the distinction. The return must be an
  explicit variant carrying the reason it could not assess and the counts it
  had.
- **In the aggregation.** A roll-up that counts flagged groups and shows
  "0 issues found" turns forty unassessable groups into a clean bill. Roll-ups
  must carry an assessed-count alongside the flagged-count and refuse to render
  a headline when the assessed count is zero.
- **In the rendering.** Any colour system with a green and a red will paint
  too-small green unless told otherwise. It gets its own neutral treatment and
  its own words; a grey chip reading "not assessable — 14 considered, floor 30"
  is the whole fix.
- **In the prose.** "No adverse impact was found" is true and disastrous when
  nothing was assessed — nothing was found because nothing could be looked for.
  The sentence must be "not assessed", and a report generator that composes
  fairness sentences from a template needs the variant, not the number.

## The rendering contract

A too-small result states, in the same breath: **what it could not assess**
(the group and the gate), **why** (considered count against the floor), and
**what would change it** (the cohort size, or the window, that would make the
assessment possible). Those three make the state actionable instead of merely
honest. A reader who sees "not assessable, 14 of 30 considered, reaches the
floor at roughly the current rate by year-end" knows what to do; a reader who
sees a dash does not.

## Decision rules

- **Too small never satisfies an obligation.** Where a jurisdiction or an
  internal policy requires an analysis, a too-small result is an unmet
  requirement recorded as such, not a completed check. Where a regime permits
  excluding a negligibly-sized category from a published computation, that
  exclusion is itself disclosed.
- **Too small never gates an action open.** A pipeline step that proceeds "if
  no adverse impact was indicated" must proceed only on the affirmative
  no-impact verdict. Treating the third state as permissive is how an
  unassessed bulk rejection ships.
- **Too small is preserved through export.** The state that survives the
  dashboard and dies in the spreadsheet is the state that misleads the
  regulator. Exports carry the variant as a value, not as an empty cell.
- **Mixed reports state the mix in the headline.** "Two groups assessed, no
  impact indicated; three groups not assessable" is the honest one-liner. It is
  longer than "no adverse impact" and it is the only version that is true.
- **Do not let time launder it.** A too-small result from last quarter, carried
  forward into a trend chart as a data point, becomes a green dot. Trend series
  either skip unassessable periods with a visible gap, or do not exist.

## When not to use this

The third state is not a place to park inconvenient findings. A cohort that
clears the floor and produces an uncomfortable ratio is assessed; re-slicing it
until every bucket falls under the floor converts a finding into a
non-assessment, and that is the one abuse this state enables. Slice
granularity, like the reference rule, is fixed in policy before the data.

Nor is it a substitute for the analysis. A system that reports too-small
forever is a system that has never measured its own fairness, and it should
read that way in its own governance record — the state is honest about a single
run, and a permanent state of honesty about not knowing is still not knowing.
