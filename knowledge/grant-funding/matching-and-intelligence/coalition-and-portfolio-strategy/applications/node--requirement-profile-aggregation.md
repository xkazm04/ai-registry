---
layer: application
type: application
subject: coalition-and-portfolio-strategy
technique: requirement-profile-aggregation
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: funder requirement profiles from cached match analyses

How the same TypeScript match engine (`grant-writing-nonprofits`) realizes
requirement-profile aggregation as a pure function over already-extracted
analyses: `src/features/match-engine/requirements.ts` ("Collective Requirements
Intelligence").

## The shape

The engine already extracts per-(org, grant) application requirements into each
`MatchAnalysis.requirements`; the header comment (lines 1-6) names the problem
this module fixes — "that intelligence is siloed and recomputed per org" — and
the design stance: pure, caller resolves the analyses and their funder, unit-
testable without a DB. Output is `FunderRequirementProfile` (lines 14-18):
`funderId`, `analysesCount` (the denominator, always carried), and requirements
ranked by count with each item's `share` — the comment on line 11 states the
target reading: `"always asks" ≈ 1`.

## Normalization

`normalizeRequirement` (lines 23-32) is the surface-variant collapser:

```ts
return s
  .trim()
  .toLowerCase()
  .replace(/\s+/g, " ")
  .replace(/[.;:,\s]+$/, "")
  .replace(/^(?:must|should|please|provide|submit|include|attach|required?:?)\s+/i, "")
  .replace(/^(?:a|an|the)\s+/i, "")
  .trim();
```

Lowercase, whitespace collapse, trailing punctuation strip, leading imperative
strip, leading article strip — so "Submit a 990" and "990" land in one cluster
(the comment at 20-22 uses exactly that pair). The display form is preserved
separately: the cluster keeps `display: raw.trim()` from the *first-seen* raw
string (line 54, and the `RequirementItem` comment at line 9 — "canonical display
text (first-seen casing)"), so the normalized key never leaks into the UI.

## Counting discipline

`aggregateRequirements` (lines 34-75) implements the per-application presence
cap with a per-analysis `seen` set (lines 47-53) — the inline comment states the
rule and its reason: "Count each requirement at most once per analysis so a
verbose single analysis can't inflate a requirement's frequency." Empty
normalized strings are dropped, blank funder ids are skipped entirely (lines
43-44 — no default-funder fallthrough), and the final ranking is count
descending with a deterministic `localeCompare` tie-break (lines 69-71). Shares
are computed against the funder's own `analysesCount` with a zero-guard.

## Where the standard exceeds the module

Two upward gaps against the technique, stated rather than papered over. First,
the module publishes `share` at any denominator — the small-samples discipline
(present elsewhere in this codebase for win rates) is left to the consuming
surface, which must render a 2-analysis profile as observations, not "always
asks"; nothing in the type system forces that today. Second, clustering is
purely lexical: "990" and "most recent financial statements" stay split, which
is the technique's prescribed conservative behavior, but there is no judgment
pass on top for semantic merges. Both are consumer obligations the profile's
`analysesCount` field makes possible but does not enforce.
