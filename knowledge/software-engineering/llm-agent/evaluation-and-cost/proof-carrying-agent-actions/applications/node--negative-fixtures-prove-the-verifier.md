---
layer: application
type: application
subject: proof-carrying-agent-actions
technique: negative-fixtures-prove-the-verifier
stack: node
status: forged
verified_on: 2026-10-27
verified_against: node@24
---

# The prove job: seventeen fixtures, each with the exit it must give (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). The model-free proof engine has a CI job of its own,
`proof-engine` in stage `prove` (`.gitlab-ci.yml:139-141`), on the image `node:24-bookworm`
(`.gitlab-ci.yml:21`). It is the verifier proving it can say no, in a log anyone can read.

## The assertion

`.gitlab-ci.yml:147-154` defines one shell function:

> # expect <exit code> <class> <input>: run the engine and require the exit it must give (0 pass, 1 fail, 2 inconclusive)

It runs the production entry point — `npx tsx engine/cli.ts prove --class "$cls" --input "$in"`
(`.gitlab-ci.yml:150`), the command line the engine documents (`engine/README.md:9`), so policy
loading, `$file` inlining and exit mapping are all on the tested path. It reads the verdict back out of
the written block, marks the line `OK` or `WRONG`, prints exit got and wanted, and sets
`failed=1` without stopping, so one wrong fixture does not hide the next; the job ends with
`exit $failed` (`.gitlab-ci.yml:174`). The exit vocabulary is the engine's own: "**0** pass,
**1** fail, **2** inconclusive or error" (`engine/README.md:5`).

## Honest and dishonest, in two headed sections

`.gitlab-ci.yml:155-163` — "honest evidence: the engine must re-derive a pass" — expects 0 for
one fixture per proof class, eight in all. `.gitlab-ci.yml:164-173` — "dishonest or broken
evidence: the engine must refuse it" — expects 1 for a weakened test
(`expect 1 exploit-test $F/exploit/input.weakened.json # the fix weakened a test`, line 165), a
diff outside the class envelope (line 166), a review quoting text that is not in the diff
(line 167), a real failure claimed as a flake (line 168), a link that does not resolve
(line 169), a repro against another sha (line 170), a slower benchmark (line 171) and a lower
maturity stage (line 172), and 2 for a ledger trial short of its minimum, commented
"inconclusive, never a pass" (line 173). Every class in `PROOF_CLASSES`
(`src/schemas/proof.ts:5-14`) has an honest fixture here.

## The weakened fixture, read

`engine/__fixtures__/exploit/input.weakened.json` reuses the honest run's JUnit files and a
clean same-version rescan; only the diff differs. `weakened.diff` replaces
`assertFailsWith<ExportFileNotFound> { service.read("st-1", "../../../etc/passwd") }` with
`assertTrue(outcome.isSuccess || outcome.isFailure)` — an assertion that cannot fail, which the
ladder ranks as bare truthiness and so refuses as a loosening from a typed failure — adds
`@Disabled("flaky on CI")` to a sibling test, and comments out that sibling's assertion as
"covered by the integration suite". The detectors that refuse it live in
`engine/proofs/weakening.ts`: the strength ladder at lines 34-45 ("3 = exact value or typed
failure, 2 = partial or type match, 1 = only truthiness"), the skip pattern at line 30, and
the removed-or-loosened pairing at lines 95-109.

## Deviations

- **Exit only, not reason.** The job asserts the exit and prints the verdict; it does not
  assert *which* check refused. The weakened fixture forges three things at once (a trivial
  assertion, an added skip, a removed assertion), so it stays refused if any one detector
  breaks. The standard stays: one forgery per fixture, and the refusing check named in the
  assertion.
- **The inconclusive path is thin.** One fixture expects 2, and it is ledger-record's; there is
  no exploit-test fixture for a missing rescan, a different scanner version
  (`engine/proofs/exploitTest.ts:96-97`), or a test green at base. Those branches are covered by
  the engine's unit tests — `engine/proofs/__tests__/exploitTest.test.ts:39` "fails when the test
  was already green at base", `:112` "is inconclusive when the scanner changed", `:122` "is
  inconclusive, never a pass, when evidence is missing" — which call the checker function, not
  the CLI, so the exit mapping is not on their path.
- **The edited-expectation case is untested here.** `engine/proofs/exploitTest.ts:82-84` makes
  an edited expected value alone inconclusive ("a person decides, the gate does not guess");
  a unit test pins the verdict (`engine/proofs/__tests__/exploitTest.test.ts:104`), no prove-job
  fixture pins that it exits 2.
