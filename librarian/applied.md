# Applied ledger

One row per Phase 7.5 A/B test run by `/intake` (see
[`.claude/skills/intake/SKILL.md`](../.claude/skills/intake/SKILL.md)). A technique
with no row here has never been tested against a managed project and is, for this
registry's purposes, a wiki page. `/intake apply <technique>` reads this file to find
the oldest unapplied technique. Slugs, modes, verdicts and dates only - never a
project's paths; the seam lives in the project's own `.ai/applied.jsonl`.

Modes: `code` (A/B in the tree behind a flag or branch) / `experiment` (a harness over
the same inputs, product code unchanged) / `simulation` (three real cases from the tree
or its history walked under both policies, with what would falsify the prediction).
Verdicts: `better` / `not-better` (a rejection - the technique gains a condition) /
`unmeasurable` (must name the instrument).

| Date | Technique | Subject | Project | Mode | Verdict | Return condition / note |
| --- | --- | --- | --- | --- | --- | --- |

## Unapplied backlog (owed, oldest first)

- `oracle-frozen-during-repair` (quality-gates) - landed 2026-08-29 by intake; candidate
  seams: any managed project running agent repair tasks with hooks in `.claude/settings.json`.
- `gate-laddering` amendment (asking controls at stage boundaries) - 2026-08-29.
- `eval-economics` amendment (configuration in the golden-set trigger) - 2026-08-29.
- `self-healing` two-ladders amendment and `failure-diagnosis` rule - 2026-08-29.
