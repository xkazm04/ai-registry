---
layer: application
type: application
subject: vendored-patch-stack
technique: least-invasive-carrier
stack: node
verified_on: 2026-10-22
verified_against: node@22
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A rewrite carrier whose target path vanishes says nothing

The stack version is witnessed by the tree's `.nvmrc` (22), as in the sibling
application on the same tree. The tree is a public desktop app, read at commit
`318f24730` and changed at `20600e3757`.

## The rung, and the seam chosen to falsify the orphan check

The xterm frozen-intrinsics fix is carried by a postinstall that rewrites one
statement per minified upstream file. Asked "what stops this from being a
higher rung", the answer is: nothing available. The change is already
mechanical (no logic, one statement rewritten), so it sits at the seam rung,
and no resolution order, plugin point or first-party wrapper can reach a
module-scope assignment executed at import. The ladder holds here.

The technique states its orphan check for rung 2 (overrides). The seam was
chosen to ask whether the check also belongs to a rewrite carrier, because
that is where it could be refuted: a rewrite list names paths too. The script
treated a missing target as `missing (skipped)` at exit 0, the same message
class as "already patched".

## A and B

Fixtures in a scratch tree, the real script, upstream's `addon-webgl` build
moved from `lib/` to `dist/` (the orphan case) with the xterm files intact.

| | A: missing is a skip | B: missing fails the install |
| --- | --- | --- |
| orphan layout, exit code | 0 | 1 |
| orphan layout, shipped bytes in the moved file | raw assignment | raw assignment, but the install stopped |
| pristine layout, exit code | 0 | 0 |
| second run (idempotent) | 0 | 0 |
| live tree (already patched), exit code | 0 | 0 |

Target: installs that finish green while a patched dependency ships unpatched
went 1 to 0 for the orphan case. Floor: every non-orphan run is unchanged.
The `no match ... fixed upstream` path stays a soft note, because a hunk that
no longer matches in a file that exists is evidence of an upstream fix, while
a file that is gone is evidence of nothing.

## What the realization cannot do

It checks that each listed path exists, not that the listed paths are all the
files carrying the hunk: a new build output added by upstream is invisible to
it. It also fails the install for every contributor at the moment of the bump,
which is the intended place but is a real cost.
