---
layer: application
type: application
subject: conformance-checking
technique: fixture-repo-testing
stack: node
status: forged
verified_on: 2026-08-20
---

# Executing the shipped checker against crafted fixture repositories

`src/lib/standard/standard.test.ts:549` opens the block that tests the
checker the way the technique demands — not by calling its helpers, but by
materializing the generated `doctor.mjs` into a temporary directory and
running it as a child process. The block's own header states why:

> The round-trip block above proves the doctor's PARSERS read the
> serializer's manifest; this block proves the whole SCRIPT — findings
> collection, the `weight={pass:1,warn:0.5,fail:0}` score, the
> `exit(fails>0?1:0)` verdict, and the `--json` payload shape POSTed to
> `/api/report/conformance`. The round-trip tests run only the four parser
> functions in `new Function`; they can't see the top-level
> `await`/`fetch`/`process.exit` logic.

That is the fixture-repository argument in the source's own words: the
parser tests cannot reach argument handling, exit codes, or the report-back
path, which are three of the checker's most breakable parts.

## The fixture shapes

`writeConformantRepo(dir)` lays down the full generated foundation, *plus*
the two things a generated foundation does not include: a `lefthook.yml`
whose pre-push commands wire the backed controls (`lint`, `typecheck`) —
without it the doctor correctly emits a `fail` for "NO local hook" — and one
CI workflow file so the `ciHardPass` clause does not even warn. The pinned
invariant is that this fixture makes the gate **pass**: exit 0, JSON
`fails === 0`.

The non-conformant fixtures each break one thing (a missing manifest; a bad
`schema:` field) and must produce a non-zero exit *and* a `fail` finding
naming the reason — the assertion is on the finding, not on a count, so a
spuriously-firing second check cannot mask a broken first one.

## Isolation of the fixture run

`runDoctor` spawns `process.execPath` with `cwd: dir` so every
`process.cwd()`-relative `existsSync` resolves against the fixture "not
Ascent", and it clears `ASCENT_CONFORMANCE_URL`, `ASCENT_CONFORMANCE_TOKEN`
and `GITHUB_REPOSITORY` from the child environment "so it never tries to
POST". Both are the technique's isolation rule made literal: a fixture run
executes the real checker, so the real side effects must be removed
deliberately. The temporary tree is created with `mkdtempSync` in
`beforeEach` and removed with `rmSync(..., { recursive: true, force: true })`
in `afterEach` — creation names its reaper.

One of the block's tests asserts the *absence* case machine-readably:
"`--json` without report-back env names the skip machine-readably (never a
silent no-report)". A run that did not report and a run that reported
successfully must not look alike to whatever consumes the output.

## The self-check

`standard.test.ts:299` is the cheapest test in the file and covers a whole
class of embarrassment: **"SHIPS every path the manifest points at — no
pointer without an artifact."** It takes every string value under the
generated manifest's `paths`, and asserts the generator emits a file at each
(directory pointers match by prefix); the spec pointer is held to the same
rule. Its comment names the invariant precisely: "the self-consistency
invariant behind *a foundation that passes its own doctor*."

Beside it, a drift guard: the `.ai/SPEC.md` body must be byte-identical to
the published spec document, because the shipped copy is hand-mirrored to
survive bundling, and "if the doc is edited without re-mirroring, the
adopting repo ships a stale contract — fail loudly."

Missing from the suite, and worth naming as the deviation: there is no
*fresh-install* fixture asserting that a project which has just adopted the
standard and done none of the work receives a legible, finite report. That
shape is precisely where the `evals/` guaranteed-yellow defect lived
(`doctor.ts` declared-pointer loop), and it was found in the field rather
than by a test.
