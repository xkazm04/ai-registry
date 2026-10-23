---
layer: application
type: application
subject: knowledge-registry
technique: lane-contracts
stack: node
verified_on: 2026-10-22
verified_against: node@22
applied: code
ab_verdict: better
proof: ab-paired
---

# A drift gate that passed over zero workflows

The stack version is witnessed by the tree's CI pin (`node-version: 22` in the
workflow that runs the check's own unit tests); the manifest carries no engines
field.

A public web repository keeps a dependency-free check that compares the commands
its workflows run against the commands its canonical agent-instruction file
advertises. The workflows directory is that check's target: the whole point is
to read every workflow and ask whether the instruction file lists what it runs.
The directory walk, though, was written as "if the directory does not exist,
return an empty list", the same helper that serves an optional runbooks folder.

That one helper collapses the two cases the technique separates. An empty lane
is legitimate and should pass with a message saying so. A lane whose path has
changed is not empty, it is unread, and the gate must fail. Here both printed
`ok (1 docs, 0 workflows)` and exited 0.

## The paired run

The seam was chosen because it could falsify the finding: the tree already met
the technique's other clauses (a per-lane gate, a stated target, a loud failure
when the canonical document is missing, which turns every workflow command into
a finding). Only the workflow walk was untested.

Both arms ran the same minimal conforming tree (one instruction file, one
manifest, one workflow) under the committed script and under the script with the
directory check:

| Tree | Before | After |
| --- | --- | --- |
| clean | ok, exit 0 | ok, exit 0 |
| workflow runs an unlisted command | 2 findings, exit 1 | 2 findings, exit 1 |
| workflows directory moved | ok `0 workflows`, exit 0 | 1 finding, exit 1 |
| workflows directory present and empty | ok, exit 0 | ok, exit 0 |

Target: a moved directory fails, 0 of 1 before, 1 of 1 after. Floor: the three
other rows are unchanged, and the check's unit tests pass 8 of 8 after (7 of 8
before, the new test red on the old script). The change is a directory-existence
test in the entry point and one spawn-based test that runs the real script in a
temp directory, since the pure drift function was tested and the entry point
never was.

## What the tree also showed

On the real tree the check is red at the committed head with 18 findings, so a
gate that is already failing cannot show this effect: the moved-directory case
only becomes visible once the baseline is clean. Not repaired here. The
technique's second clause, a regeneration that keeps a foreign producer's
fields, has no seam in this tree.

## What the realization cannot do

It tests existence, not that the path is the right one: a workflow directory
renamed and replaced with an empty one of the old name still passes, as the
empty-lane row says it should. The runbooks folder remains optional by choice.
