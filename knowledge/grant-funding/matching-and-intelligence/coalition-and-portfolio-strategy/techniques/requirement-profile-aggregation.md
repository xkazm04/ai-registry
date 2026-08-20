---
layer: technique
type: technique
subject: coalition-and-portfolio-strategy
technique: requirement-profile-aggregation
status: forged
laws: [small-samples-stay-silent, untrusted-text-is-data]
shared_with: []
use_when: [building funder-level intelligence from per-application analyses, assessing readiness against a funder before assembly or pursuit]
---

# Requirement profile aggregation

The concern: every analyzed application yields a list of what the funder asked
for — attachments, registrations, financial documents, certifications. Kept
per-application, that intelligence is recomputed each time and discarded, so the
tenth encounter with a funder starts as ignorant as the first. Aggregated across
all analyses of the same funder, it becomes a **requirement profile**: a ranked,
deduplicated answer to "what does this funder always ask for?" — intelligence
that feeds readiness checks, portfolio decisions, and coalition assembly before
a single application is drafted.

## Normalization: surface variants are one demand

Requirements arrive as free text extracted from funder documents, and the same
demand wears many surfaces: "Submit a 990", "990", "Must include your most
recent 990". Counted raw, one requirement fragments into several minor ones and
the profile's ranking lies. The canonical form is produced by a normalization
pass: lowercase, collapse whitespace, strip trailing punctuation, strip the
leading imperative scaffolding (must / should / please / provide / submit /
include / attach / required) and leading articles. What survives is the noun of
the demand, and variants of one demand collapse into one cluster.

Two rules keep normalization honest. **Preserve a display form** — keep the
first-seen original casing as the human-facing text, because the normalized key
is a clustering artifact, not prose. And **treat the input as untrusted data**:
these strings come out of funder documents and extraction pipelines; they are
clustered and counted, never interpreted as instructions, and anything that
looks like markup or delimiter forgery is stripped at the boundary.

Know the technique's ceiling: string normalization clusters *surface* variants.
"990" and "most recent financial statements" may be one demand semantically and
will count as two. That is the correct conservative behavior — merging on
meaning requires a judgment pass, and a wrong merge silently deletes a
requirement from the profile, which is worse than a split one.

## Counting: per-application presence, not mention frequency

The frequency that matters is **in how many of the funder's applications the
requirement appeared**, not how many times it was mentioned. So each requirement
counts at most once per analyzed application — a verbose analysis that restates
"audited financials" five times contributes one, the same as a terse one. Without
this cap, the profile ranks verbosity, and one wordy extraction manufactures an
"always asks" that never was.

Each profile entry then carries three values: the display text, the count of
applications citing it, and the **share** — count divided by the number of
analyses aggregated. Share near 1.0 is the signal the profile exists to surface:
this funder always asks for this. Share near the bottom is noise or a
program-specific quirk. Rank by count descending, tie-break deterministically,
and always publish the denominator alongside the shares: "audited financials, 9
of 10 analyses" is intelligence; "90%" alone is a number hiding its own weight.

## Thin profiles present themselves as thin

A profile aggregated from two analyses can legitimately say "both applications
we analyzed asked for X" — it must not say "this funder always asks for X." The
sample-size discipline applies exactly as it does to win rates: below a minimum
number of analyses, present the profile as observations, not as a behavioral
claim about the funder, and suppress any always/never framing. The denominator
is part of every statement the profile makes.

## What the profile feeds

- **Readiness gating.** Diff the profile's high-share entries against what the
  organization has on hand. A funder whose profile demands audited financials
  is a different portfolio position for an organization without them — the gap
  surfaces *before* the writing slot is spent, when there is still time to fix
  it or pick a different target.
- **Coalition assembly.** A coalition's exposure to a funder is the union of
  member gaps against the profile — and in most regimes the lead must be able
  to produce the compliance-grade documents for the coalition. Checking the
  proposed lead against the profile before assembly finalizes is cheaper than
  discovering the gap at submission week.
- **Portfolio effort estimates.** A funder whose profile runs long and heavy on
  compliance documents costs more per application; that cost belongs in the
  effort term of the portfolio's expected-value math.

## When not to use

Do not aggregate across funders into a global requirement list — "what funders
in general ask for" flattens exactly the per-funder variation the profile
exists to capture; the funder is the aggregation key. Do not let the profile
substitute for reading the current solicitation: profiles predict, the live
document binds, and a funder that dropped a requirement last cycle will still
show it at high share. And do not auto-generate compliance checklists from
thin profiles — below the sample floor, the profile is a research aid for a
human, not an input to automated gating.
