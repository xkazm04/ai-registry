---
layer: application
type: application
subject: deterministic-run-verification
technique: grade-with-checks-the-run-could-not-touch
stack: process
status: forged
verified_on: 2026-09-27
applied: code
ab_verdict: better
---

# Process: what an unattended loop's integrity guard could not see

An agent loop runs unattended lanes against a dozen target repositories and credits a lane
with a lift only if its checks improved. Its integrity guard is the detection half of this
technique: before a lift is credited, it classifies every path the lane's commits changed
into four scoring surfaces (the verify command, a test, a fixture, the gate's configuration)
and voids the lane if any path lands in one. The guard is a classifier on purpose, so a
renamed directory does not switch it off, and its test file pins a seed of paths that must
stay classified.

## The seed was written from one ecosystem

On 2026-09-27 the guard was run over the files that actually decide gates in the target
repositories' own trees: toolchain and lint pins, hook runners, scanner allowlists, test
setup files. There were 19 such files. The guard classified **3**. The 16 it missed:

- Rust toolchain and lint pins in three repositories: `rust-toolchain.toml`, `deny.toml`,
  `clippy.toml`, `rustfmt.toml`, and a `.cargo/config.toml` that sets the compile flags
  every Rust gate uses;
- `lefthook.yml` in two, the hook runner those repositories use instead of the one the
  guard knew;
- `.gitleaks.toml` and `knip.json`, allowlists for a secret scan and an unused-code gate;
- `ruff.toml`, in a repository the loop has run lanes against.

An edit to any of these turns a gate green without touching a test, and the guard would
have reported the lane as clean. The fix added the classes, plus a root `conftest.py`
(where a published benchmark's graded agent forged pass lines from a hook) and test setup
files. The eleven new seed paths are red under the old classifier and green under the new
one; three near misses (a `config.toml` that is not cargo's, docs about a hook, a setup
module in application code) stay unclassified under both. Coverage over the real files went
from 3 of 19 to 19 of 19. Controls: the guard's own positive seeds classify and ordinary
source does not, before and after.

## What the history says about void versus restore

The loop's lane commits in the target repositories are marked by the lane report each one
carries, which made them countable: 113 across four repositories. Replayed through both
classifiers, **no historic verdict moved** (100 void before and after), so the gain is
prospective only.

The replay said something larger about voiding itself. Of the 100 void lanes, 82 had
*added* a test file and 95 had also changed files outside the checks; several lanes'
tasks were to build a gate. A guard that voids on touch cannot grade any of that work, including the lanes that
did exactly what they were asked. Restoring the original checks and grading the new ones
separately would have let those lanes be graded. That change is not made: it needs the loop
to restore paths before its verify run, which is a change to the loop's control flow and is
left to its owner with the numbers above.

Verdict `better`, in code: coverage of the real gate surface 3/19 to 19/19, mutation-tested
by the seed, no historic verdict moved.
