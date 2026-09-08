---
layer: application
type: application
subject: agent-instruction-files
technique: sibling-floor-ownership
stack: claude-code
verified_on: 2026-09-08
verified_against: claude-code@2.1.263
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# A repository-linked skill catalog is still the floor, measured across a fleet

The witness for the version is the CLI's own `--version` output on the
machine that ran every session below. The instrument is a replay over the
harness's recorded transcripts: for each of twelve repositories owned by one
person, the set of skills present in the repository's `.claude/skills/`
(each a directory holding a `SKILL.md`) was compared with the set of skills
the transcripts show being invoked — either through the `Skill` tool or as
a slash command in a user turn. Every transcript on the machine for each
repository was read, including the sub-agent transcripts stored beside
them.

## The measurement

| repository | transcripts | tool calls | skills loaded | ever invoked | never invoked |
| --- | --- | --- | --- | --- | --- |
| A (desktop app) | 75 | 7,049 | 39 | 6 | 33 |
| B (web app) | 1,011 | 14,055 | 18 | 4 | 14 |
| C (site) | 30 | 6,962 | 13 | 6 | 7 |
| D (game tooling) | 610 | 5,029 | 12 | 5 | 7 |
| E (service) | 21 | 2,257 | 16 | 3 | 13 |
| F (media pipeline) | 20 | 2,002 | 20 | 2 | 18 |
| G (web front) | 19 | 1,512 | 10 | 1 | 9 |
| H (telemetry) | 4 | 803 | 13 | 1 | 12 |
| I (research app) | 1 | 70 | 11 | 0 | 11 |
| J, K, L (three more) | 0-1 | 0 | 24 | 0 | 24 |
| **fleet** | **1,792** | **39,739** | **193** | **28** | **165** |

Transcripts date from 2026-08-04 onward, so the window is five weeks. The
count of invocations is a floor: a skill's body can also be read as a file
without the harness recording a skill invocation, and the replay does not
see that. The count of loaded skills is exact.

## What the shape says about the technique

The technique closes on a boundary: guidance that must reach every agent in
a tree belongs *in the tree*, not in a capability each person installs for
themselves. This fleet did exactly that. Its skills are not installed per
person; they are linked into each repository from one registry, so every
clone carries the same catalog and the catalog is versioned with the code.
Under the technique's own split, that is the repository-owned side —
authored, reviewed, inherited by every clone.

And it is still the floor. Every one of the 193 entries publishes its
description into the discovery listing at session start, on every session,
in a repository where 85% of them have never fired. Moving the catalog into
the tree bought the *accountability* the technique wants — there is a diff,
there is an owner — and did not buy the *audit*, because the audit is run
per line by someone reading a diff, and linking a catalog into twelve
repositories produced one diff in one registry and none in the twelve. The
technique's first finding, "the set of entries the owner had forgotten",
held here without a single install: the owner authored every entry and
could not have said, before this replay, which nine of thirty-nine a
desktop app's sessions had ever reached.

The harness's own tooling now agrees the question is worth asking. The
version verified against ships a built-in report of which loaded skills go
unused and what each costs in context — the technique's audit step three,
"sort by triggerability, not by quality", as a command. This replay is the
same measurement run over the recorded history rather than one session.

## What this application cannot say

The verdict is `unmeasurable` because the technique's step four was not
run: no task was completed with the catalog disabled to see what degrades.
The replay measures triggerability, which is the *cost* side of the
argument; the held-out trial measures *value*, and only the pair decides a
prune. The instrument that would close it is one representative task per
repository, run with `.claude/skills/` emptied and again with it present,
scored on the project's own gate — the trial the technique inherits from
[substrate-coupled-expiry](../techniques/substrate-coupled-expiry.md).
Until then the number licenses an enumeration, not a deletion.

Two further limits. Twenty-eight invocations across 1,792 transcripts is a
count of *distinct skill names reached*, deduplicated per repository; three
of the reached names were not in the repository's catalog at all (they were
bundled with the harness), so the fleet's own catalog was reached for
twenty-five of its 193 entries. And the three repositories with no
transcripts are not evidence of anything: a session that ran from a
different checkout path leaves its transcripts under that path.
