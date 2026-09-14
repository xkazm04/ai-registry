---
layer: technique
type: technique
subject: copy-quality-gates
technique: enforcement-at-the-write-seams
status: forged
laws: [the-source-locale-is-the-source-of-truth, clean-strings-stay-untouched]
shared_with: []
use_when: [wiring a copy gate into a repository where coding agents write catalog copy, copy that breaks a rule the agent was instructed about keeps landing, verifying that always-on instructions actually reach agent sessions]
stage: solo
---

# Enforcement at the write seams

A copy gate that a writer can route around is advice with extra steps. With
coding agents writing copy, the routes are many and none is malicious: the agent
edits a catalog through its file tools in one session, generates a page through
a shell script in the next, and a parallel session merges a third set of strings
an hour later. Each path skips a different check. The question this technique
answers is not *what* the gate checks but *where it sits* so that every path
passes through it.

## Map the write paths first

List every way copy reaches the source catalog: file-edit tools, shell commands
and scripts, code generators and content importers, merges and rebases of
parallel work, and humans editing directly. A seam is a point every one of these
paths crosses. A check that sits on one path is feedback, not enforcement.

## The seams

- **End-of-session check over the working-tree diff.** When an agent session
  tries to finish, the gate runs on the changed catalog units and blocks
  finishing while error-level findings remain. It sees file-tool and shell writes
  alike, because it reads the tree, not the tool call. It must yield after a small
  number of consecutive blocks with no progress, reporting the findings, or an
  unfixable finding traps the session in a loop.
- **Commit or push gate.** One aggregate verify task that runs the catalog gate
  with the project's other checks. It sees every local path, including humans.
- **Continuous integration on the change.** The only seam a bypassed local hook
  cannot skip; the gate of record.
- **Scheduled full audit.** Not a seam for writes, but the only instrument that
  sees strings no diff will ever touch again, and the one that runs a new rule
  over old copy.

## What is not a seam

- **A pre-write deny on file tools.** Fast and useful as feedback, but a shell
  write bypasses it, and a hook that times out allows the write. Keep it only as
  a duplicate of a real seam.
- **Path-scoped instruction files.** In at least one coding agent harness they
  load when a matching file is *read*, not when a new file is created or a shell
  writes one — so they are least reliable exactly when a new page is written.
- **Always-on instructions.** They improve the first draft and enforce nothing.

## Verify delivery by load telemetry

Instructions are still worth delivering, and their delivery fails silently. The
instrument is a load-telemetry hook that records every instruction file a session
actually loaded, run in a paired probe: a plain file known to load beside the
delivery mechanism under test, in a throwaway project and then in a real one.
Listing the instruction directory proves a file exists; a consistency check that
verifies where a link points proves the link's shape. Neither proves a session
saw the file. One fleet installed its always-on rules as symlinks to a generated
file outside each project; the harness treated them as external imports needing
an approval nobody was ever prompted for, no session loaded them, and the
installer's own check reported every link healthy. The fix was to install
generated copies with a drift check, and the lasting lesson was the instrument.

## Procedure

1. **Put the source-locale gate first in every seam.** A source defect caps every
   locale, per
   [the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth);
   a source finding blocks fan-out translation of the affected units, and target
   checks run after.
2. **Scope the seam to changed units** and fail on new fingerprints only, so the
   seam never demands edits to strings the change did not touch, per
   [clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched).
3. **Auto-fix only deterministic findings** (a typography character, a forbidden
   variant with one approved rendering), and only inside the changed units. Every
   other finding is reported for the writer to resolve.
4. **Make every seam print what it checked** — units, rules, layers — so a seam
   silently scoped to nothing is visible.
5. **Probe delivery after any change** to how instructions or hooks are installed,
   and after a harness upgrade.

## Decision rules

- **When a check can see only one write path, do not count it as enforcement**,
  because the next session will use another path.
- **When a hook can time out, assume it fails open** and keep a downstream seam
  that cannot.
- **When the end-of-session check blocks twice with no change in findings, let the
  session end and surface the findings**, because a trapped agent tends to
  satisfy the gate by deleting or disguising copy.
- **When delivery of instructions is claimed, ask for the telemetry line**, never
  for a directory listing or a green link check.

## When not to use it

- **Without a counted rule set.** Wiring an unearned pattern rule into an
  end-of-session block trains agents to route around the gate, and they are good
  at it.
- **As a replacement for review.** The seams guarantee the mechanical layers ran
  on every write; they say nothing about whether the copy is native or true.
- **On catalogs the change does not own.** A seam that blocks on another team's
  legacy strings is a seam that gets disabled.
