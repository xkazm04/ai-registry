---
layer: application
type: application
subject: plan-review
technique: decision-sized-slicing
stack: process
status: forged
verified_on: 2026-08-28
---

# Process — a structural-scan pipeline whose slices ride inside the finding they cannot be dispositioned against

The realization is the `architect` skill at `skills/architect/SKILL.md` in this registry,
symlinked into five connected project checkouts (`ascent`, `personas`, `personas-web`,
`gravitone-gcloud`, and via the shared skill set elsewhere) as
`.claude/skills/architect`. It is a real plan gate for agent work: a scan produces
findings, each finding carries a proposed change, and a person renders a verdict before
anything is built. It is worth writing down because it gets the disposition vocabulary
almost exactly right and gets the slicing stage exactly wrong, and the two facts sit
eleven lines apart in the same document.

`verified_against` is omitted deliberately: this is a prompt pipeline with no runtime,
and the profile rejects the field on `process`.

## What the four-way triage confirms

Phase 6 (SKILL.md:449-468) asks for one of four verdicts per finding:

```
  1. execute now    - implement this one in this session
  2. queue          - accept as backlog decision; defer       <- default
  3. drop           - not worth pursuing
  4. rework         - true gap, wrong proposed shape
```

`rework` is the technique's `revised` — and the skill spends a line defending it exactly
as the technique does: *"ask: 'what shape would actually fit?' Capture user's reframe,
update the finding, re-present"* (SKILL.md:468). The push-back loop is real, it is
implemented, and the fallback when the user has no reframe is a `proposed (needs
reshape)` state rather than a silent drop. The prose immediately above it makes the
binary-collapse argument in its own words: *"architect findings rarely all execute now,
but they shouldn't all drop either"* (SKILL.md:461).

This is an independent instance of the four-value claim, arrived at from a different
direction — the skill's fourth value exists because the *proposed shape* can be wrong
while the gap is real, which is precisely the `revised` case.

## Where it deviates: the slices are inside the unit being dispositioned

The finding template (SKILL.md:406-408) asks the proposing reader for:

```
    Migration plan (sketch):
      {3-7 numbered steps, each shippable independently. Note which are
       breaking vs additive. Ballpark commit count and PR size.}
```

Every element of the technique's output is present — thin units, end-to-end
completeness ("independently shippable"), a count — and every structural property is
absent:

- **It runs after the plan, not before.** The steps are produced beneath `Proposed
  shape`, by the same reader, in the same pass. The framing is already committed by the
  time the slicing happens, which is the sunk-cost failure the technique names.
- **The slicer and the planner are one charter.** The skill never separates them, so the
  lens actually in use is end-to-end completeness alone — used as a *source* of
  boundaries rather than as the technique's filter. There is no decision-boundary lens,
  so a step is a shippable increment rather than one material decision.
- **The steps carry no disposition.** The verdict is rendered on the finding, whole. A
  reviewer who thinks step 3 is the wrong boundary has no verdict that says so; their
  options are `rework` on the entire finding or acceptance. The four-value vocabulary
  the skill got right is applied at the wrong grain.
- **The rejected boundaries are never recorded.** Nothing asks what was considered and
  not chosen as a step boundary, so the slicing is an assertion the reviewer can only
  take or leave.

The confirming detail is Phase 7b (SKILL.md:520-556), which writes the decision record —
including a `## Rollout` section of *"atomic commits planned. Each one is independently
shippable"* — **after** the verdict has been given. The plan the person approved and the
plan that gets written down are two documents, and the second one is authored by the
party executing the first.

## The negative instance, in one keypress

The triage prompt's default (SKILL.md:456-458) is:

```
  "all=2"             ->  queue everything
  Enter               ->  same as "all=2"   <- default
```

One keypress dispositions every finding in the run. This is the coherence trap in its
purest observable form: the findings arrive whole, internally consistent and already
ranked by a summary table, and the cheapest action accepts all of them at once. Nothing
about the outcome is distinguishable afterwards from a run where each finding was
weighed — the backlog reads the same, the artifact contract is satisfied, and the
deliverable rule at SKILL.md:18 is met in full.

The skill is not wrong to have a default; a gate with no default at machine pace stalls.
It is that the default is *approve everything*, at a grain the reviewer never chose, on
units nobody sliced for the purpose of being disposed.

## What this realization cannot do

Two things, and naming them is more useful than the confirmations.

It cannot tell an under-sliced finding from a correctly indivisible one. There is no
inseparability rationale anywhere in the template, so a finding with one step and a
finding whose author stopped slicing look identical in the summary table — and the
summary table is what the reviewer reads before typing verdicts.

And it cannot be fixed by tightening the finding template, which is the obvious repair
and the wrong one. Adding a decision-boundary lens to the same reader that writes the
proposed shape puts both charters back in one place; the reader would slice its own
proposal, and its proposal is what the slicing is supposed to test. The repair the
technique implies is a stage, not a field — and the skill's own structure shows why it
was never built that way: the scan, the proposal and the slicing are cheap when they
share a context, and the cost of separating them is a second pass over material the
first pass already holds. That is a real trade, and it is the trade this application
exists to make visible rather than to pretend away.
