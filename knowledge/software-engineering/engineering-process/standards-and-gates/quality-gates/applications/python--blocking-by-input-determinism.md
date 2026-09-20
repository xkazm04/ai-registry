---
layer: application
type: application
subject: quality-gates
technique: blocking-by-input-determinism
stack: python
verified_on: 2026-09-20
verified_against: python@3.14
---

# The first gate for a Python lane inside a Node pipeline

Read on 2026-09-20 in `gravitone-gcloud`, a media pipeline whose application
and test lanes are TypeScript and whose generation stage is Python. It is a
clean instance of the founding case: a lane with no gate at all, and the
choice of *implementation* — not of severity — is what let its first check
block on the day it landed.

## The state before

`.github/workflows/gates.yml` installs Node and runs npm scripts. Both test
lanes (`npm test`, `npm run test:live`) are TypeScript. The workflow's own
header records what that meant: "until this job, no gate in the repository
executed a line of Python, while 33 tracked .py files — ~965 lines under
`pipeline/foundry/` alone — ran for hours on one card and then wrote a
verdict."

Nothing in the gate inventory could report this. No check was advisory, none
had been green-for-a-year, none had a falling finding rate — the lane simply
had no row. Every gate was green and every gate was honest. (The lane has
since grown: on 2026-09-20 the tree tracks 46 `.py` files and
`pipeline/foundry/` alone is 2,840 lines, so the uncovered surface was
expanding while the inventory stayed complete.)

## Why the obvious check would have been advisory

This repository grades blocking status on the input axis explicitly, in the
workflow header, and applies it to its own absent supply-chain job: `npm
audit` reads a feed that moves without the repository, no rotation is staffed
to read advisory output, and the header therefore records the absence as
deliberate rather than pretending to an advisory check nobody reads.

The same axis rules out the natural first Python check. A job that had to
`pip install` from a public index would, in the header's words, "take an
input this commit does not pin — no lockfile, no integrity hashes, nothing
with the shape `npm ci` has — and could hand a different verdict to the same
commit next month." Advisory by construction, for a lane whose current
coverage is zero, which is why it stayed unwritten.

## What was built instead

`pipeline/foundry/selftest.py` (314 lines on this read) exercises the
directory's failure paths with **no GPU, no ComfyUI, no Ollama, no network
and no third-party package** — every vendor call is faked at the seam, so
what is under test is the directory's own control flow. Its module imports
are `importlib.util`, `io`, `json`, `contextlib`, `sys`, `tempfile` and
`pathlib` and nothing else.

The job is separate, and the header explains both halves of the design:

- `actions/setup-python@v5` pinned to `3.14`, described in the header as "the
  only input to this job that is not a committed file in this tree";
- **no `pip install` step**, with the consequence stated where the step would
  go: "Adding a dependency step here drops this job to advisory unless what it
  installs is pinned by hash in a committed requirements file." That sentence
  is the promotion trigger written backwards — the condition that would
  *change* the answer, attached to the gate's own definition.

So the job's input shape is identical to `typecheck`'s: this tree's sources
plus a pinned interpreter. It blocks, exits non-zero naming each failing
check, and runs in under a second.

## The constraint was verified by running, not by reading

Stdlib-only is a claim about every import that executes, and this directory
defeats a source read: Pillow and numpy are imported *inside*
`crop_letterbox` and `publish` rather than at module level. The header
records the verification: "verified 2026-09-06 by re-running it with PIL,
numpy, requests, httpx, cv2 and torch blocked at `__import__` — 5 cases
green, exit 0", together with the rule that keeps it true ("a case that needs
a card belongs in a plan, not here").

## What the first run found

The workflow header records the yield: "The first three cases in selftest.py
were each a total loss of a multi-hour run, and two of them falsified the
directory README's two headline promises." The file's own docstring names
one: the README's claim that "a candidate that could not be graded is
`unmeasured`, counted separately, and never a pass" was false, "and the
statement that broke it sat directly under the code that had just made it
true."

A narrow blocking check found, on its first run, three defects that a broader
advisory check would have reported to nobody.

## Drift found on this read

`selftest.py`'s docstring still ends "WHAT IT IS NOT. It is a courtesy, not
yet a gate -- nothing invokes it." That was true when written and is now
false: `gates.yml` runs it as a blocking step. The stale line is harmless to
the gate and corrosive to the doctrine, because a contributor reading the
file learns that the lane is still ungated. It is the projection failure this
subject's [policy-projection](../techniques/policy-projection.md) names,
pointing in the direction that under-reports enforcement.
