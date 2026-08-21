---
layer: technique
type: technique
subject: pre-publish-fillability-forecast
technique: counterfactual-gate-loosening
status: forged
laws: [uncertainty-resolves-toward-the-candidate, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [a requisition admits too few people and nobody knows which filter did it, deciding which hard requirement to argue about with a hiring manager, quantifying what a language or education floor costs]
---

# Counterfactual gate loosening

Take the requisition as written. Remove exactly one hard gate. Re-run the same
eligibility filter over the same pool. The difference in the eligible count is
what that gate costs — and because only one thing changed, the number is
*attributable*: those people were blocked by that gate and nothing else.

This is the forecast's primary diagnostic, and its power comes entirely from
the discipline of the single lever. Everything else in the procedure exists to
keep that attribution honest.

## Procedure

1. **Score the baseline.** Run the unmodified requisition over the pool and
   record the eligible count. This one number is the shared reference for every
   counterfactual; it is computed once and never recomputed per lever, so that
   deltas are commensurable.
2. **Enumerate the removable gates.** Only requirements that act as filters
   qualify — see `eligible-versus-qualified-distinction`. Skills do not appear
   in this list; putting them here is the most common implementation bug and it
   yields a page of zeros.
3. **For each gate, build a mutated copy** of the requisition with that gate —
   and only that gate — absent. Mutate a copy in memory. The stored requisition
   is never touched; the coach runs before publication precisely so that
   nothing about it is a write.
4. **Re-run the same filter** on the same pool snapshot and record the new
   eligible count.
5. **Emit the delta** with its lever, its population and its base.

## Decision rules

- **One lever per run, always.** Multi-lever counterfactuals answer a question
  nobody asked and destroy attribution. If a recruiter wants to know the effect
  of two relaxations together, that is a second forecast run on a revised
  draft, not a row in this table.
- **Deltas never sum.** Two gates can exclude overlapping people, so the
  arithmetic sum of independent deltas exceeds the effect of removing both. The
  presentation must make each row read as an independent scenario against the
  same baseline — never a cumulative column, never a total.
- **A zero delta is a finding, not a blank.** A gate with no effect on the pool
  is a gate that costs nothing *here*, which is useful: it is either genuinely
  cheap or the pool has no one near that boundary. Render it; do not filter it
  out. Filtering zeros hides the case where every gate scores zero because the
  pool is empty for unrelated reasons.
- **Unknown inputs do not fail the gate.** Whatever mercy the production filter
  extends to missing data, the counterfactual inherits unchanged. A gate that
  is skipped under uncertainty in production must be skipped identically here,
  or the delta measures record completeness rather than requisition strictness
  ([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **Snapshot the pool.** Every counterfactual reads the same pool as the
  baseline. A pool that grows between passes produces deltas that include new
  arrivals, and the error is small enough to never be noticed and large enough
  to change a decision.
- **Report the base with the count.** A delta of fourteen means something
  different against a pool of forty than against a pool of four thousand
  ([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
- **Defaulted fields are not gates.** A constraint the advertisement never
  stated, supplied by a normalisation default so downstream code has something
  to read, must be treated as absent by the filter and excluded from the lever
  list. Enforcing a phantom silently empties the pool before scoring; offering
  to loosen one recommends editing a line nobody wrote. This requires the
  requisition to carry a record of which of its fields were defaulted — without
  that record the distinction is unavailable and the bug is undetectable.

## Non-negotiable gates are diagnosed, never suggested away

Some gates cannot be relaxed regardless of what they cost: authorization to
work, a licence the law requires, a safety certification, an age floor for
regulated work. These must still be *measured* — a recruiter deciding whether
to fund a relocation or a visa sponsorship needs to know the gate excludes
sixty percent of the pool — but they must be excluded from the suggestion
surface entirely.

A coach that ranks levers purely by delta will place exactly these at the top,
because non-negotiable gates are usually the most exclusive ones. Classify each
gate as advisory or non-negotiable at the point it is defined, default to
non-negotiable when the class is unknown, and let the presentation layer show
non-negotiable gates in a diagnostic section with no apply affordance. See
`staged-suggestion-never-auto-applied` for why that separation must be
structural rather than a matter of wording.

## When not to use this

- **After publication.** Once real applicants exist, the pipeline is a better
  measurement of the same thing and the counterfactual competes with it for
  attention. The instrument's whole value is being early.
- **When the pool is not representative of where you will source.** A gate
  loosening measured over a pool built entirely from one region says almost
  nothing about a role being advertised into another. State the pool's shape,
  or decline.
- **On a gate the pool cannot speak to.** If almost nobody in the pool has the
  field the gate reads, the delta is dominated by the skip rule and reads as
  "this gate is free". Report the coverage of the field alongside, or suppress
  the row with a reason.
- **As a compliance argument.** The delta says what a gate costs in candidates.
  It says nothing about whether the gate is lawful, justified, or has a
  disparate effect on a protected group — that is a different analysis with a
  different method, and borrowing this number for it is a misuse.
