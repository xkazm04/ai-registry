# librarian

Coverage memory for [`/librarian`](../.claude/skills/librarian/SKILL.md) - what the registry
looked like when it was last swept, what was done about it, and what was deliberately
not done.

An Obsidian vault, in the registry, in markdown, because it is reviewed like everything
else here and readable with no tool at all.

## Map of content

| Note | Holds |
| --- | --- |
| [`standard.md`](standard.md) | The bar every sweep grades against. The one place to argue with the weights. |
| `domains/<domain>.md` | Per bundle: shape, last sweep, what is owed. |
| `subjects/<domain>/<subject>.md` | Per subject: last touched, dry streak, open leads, declines with reasons. |
| `runs/<YYYY-MM-DD>-<n>.md` | What one run swept, dispatched, accepted and declined. |
| [`watchlist.md`](watchlist.md) | Candidate public trees for the reconcile and scan loops, with evidence grades. |
| [`projects.md`](projects.md) | Which connected project relates to which bundle. Slugs and domains only. |
| [`sources/index.md`](sources/index.md) | The ledger of external sources [`/intake`](../.claude/skills/intake/SKILL.md) has mined, and one note per run. |
| [`inbox.md`](inbox.md) | Leads originated INSIDE a connected project - a sweep landed a fix and the rule generalized. Folded here by [`scripts/leads-collect.mjs`](../scripts/leads-collect.mjs); triaged like any other source, and authorized by none. |
| [`harvest/index.md`](harvest/index.md) | The graded source queue [`/harvest`](../.claude/skills/harvest/SKILL.md) drains through the `/intake` method, its coverage-gap research targets, and its A/B impact ledger. |

## Bundles

- [[software-engineering]] - 143 subjects; still the largest, and the 2026-08-22 harvest grew its transplant debt as well as its coverage
- [[recruiting]] - 64 subjects, arrived from a parallel wave at 384/384 use_when
- [[game-production]] - 41 subjects, arrived by forge 2026-08-22; never swept
- [[grant-funding]] - 17 subjects
- [[llm-observability]] - 16 subjects
- [[civic-intelligence]] - 15 subjects
- [[media-generation]] - 14 subjects

## What lives here and what does not

**Here:** what a run *did*. Dates, decisions, declines, dry streaks, leads with their
return conditions.

**Not here:** anything a script can recompute. Counts, scores and coverage ratios come
from `node scripts/librarian-scan.mjs --json` fresh every run, because carried-forward
derived numbers drift silently and nobody notices until a decision rests on one. If a
number appears in a note, it is there as a *record of what was true at that moment*,
never as an input to the next run.

**Never here:** a consumer's paths, repository names or internals. This lane is public,
under the same rule as [`usage/`](../docs/usage-lane.md) and
[`signals/`](../docs/signals-lane.md).

## Subject notes are created, not seeded

A subject gets a note the first time it is touched. 186 empty notes would be noise, and
their absence already carries the fact that matters: no note means never swept, which
the scan reads and scores.
