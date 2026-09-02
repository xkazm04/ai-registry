---
layer: application
type: application
subject: agent-memory
technique: procedure-promotion
stack: claude-code
status: forged
verified_on: 2026-09-02
verified_against: claude-code@2.1
applied: code
ab_verdict: better
proof: ab-paired
---

# Promotion on first sight, with the count taken at the write door (Claudeception, and a harness memory store)

Two realizations of one situation: the promoted store is the only durable
store. The first is the source tree; the second is the harness memory
directory of the registry's own sessions, where the technique's amendment was
applied as a change.

## The source tree: a skill that writes skills, with no layer beneath it

Claudeception is a Claude Code skill whose job is the technique's whole
pipeline compressed into one step: notice that the session just learned
something non-obvious, and write it as a new skill under `.claude/skills/`.
The harness persists nothing else across sessions, so there is no episodic
layer to count recurrence in and no consolidation pass; the skill promotes on
the first sighting or the observation is gone.

The tree records the failure that follows, and its correction, in one commit:
PR #13 (2026-01-22, "add Step 1 for checking existing skills before creating")
arrived from an outside contributor after duplicates appeared, and it is the
technique's dedupe door written as a table — six rows keyed on trigger and fix:

| found | action |
| --- | --- |
| nothing related | create |
| same trigger, same fix | update; bump minor |
| same trigger, different root cause | create; cross-link both ways |
| partial overlap (same domain, different trigger) | add a Variant subsection |
| same domain, different problem | create; See-also |
| stale or wrong | mark deprecated; link replacement |

The search that feeds it is by trigger: `rg -F "exact error message"`, then
context markers (file names, config keys), then keywords — in that order.
"Same trigger, same fix → bump the version" is the recurrence count, taken at
the second sighting. The tree does not, however, carry `n=1` on a first-sight
skill: the template's `version: 1.0.0` and `date:` are the only provenance,
and nothing distinguishes a skill observed once from one confirmed five times.
Nor does any invocation accounting exist; the "Skill Lifecycle" section names
deprecation and archival as stages and gives them no trigger.

Where the tree is stronger than the technique's text: the quality criteria
require that the solution "has actually worked, not just theoretically" — a
stateable outcome — before the write, and the 2026-01-17 tool-list change
removed the shell from the writer, so the skill can create a capability but
cannot run or install one. That is the one-door property enforced by
permission rather than by review.

## The applied arm: a harness memory directory

The registry's sessions keep a per-project memory directory the harness
writes first-sight by design: one file per fact, an index line each, no
episodic layer beneath. On 2026-09-02 it held 24 files. Two of them —
written six minutes apart by two different sessions — recorded the same
failure (a fleet-wide seam search that times out or returns a silent empty)
with overlapping fixes, neither citing the other.

- **A** — the store as found: 24 files, two on one trigger.
- **B** — the amendment applied: search by trigger before writing; the
  second file is merged into the first as a variant, and the index carries
  one line.

Instrument, same on both arms: a two-term trigger search over the
`description:` lines (`fleet` and `grep`), and a pairwise vocabulary lint
(Jaccard over description word sets) as the technique's suggested guard.

| instrument | A | B |
| --- | --- | --- |
| trigger search, files matched | 2 | 1 |
| vocabulary lint at the threshold that catches the pair (0.12) | 5 pairs, the true one ranked 3rd | 4 pairs, all false |

**Verdict: `better`** — the store no longer holds two answers to one
trigger. The second row is the structural fact: the vocabulary lint the
technique proposes as a cheap standing guard has one true positive in five at
the threshold that finds it, and at a stricter threshold (0.25) finds nothing.
Trigger search found the pair with no false positives. The amendment's rule
("search by trigger, not by resemblance") is written from this measurement,
and its scale is honest: one store, one duplicate pair, 24 items.

## What neither realization can show

Whether first-sight promotion *costs* selection here. The memory index is
loaded whole into every session (24 lines), so the selection failure the
technique measures on 5-to-100-item skill pools does not yet apply; the return
condition is the index passing roughly fifty entries, when the store would
need the scoping rule as well as the door.
