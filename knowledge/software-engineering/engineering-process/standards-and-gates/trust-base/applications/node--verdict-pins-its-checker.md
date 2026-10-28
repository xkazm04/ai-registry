---
layer: application
type: application
subject: trust-base
technique: verdict-pins-its-checker
stack: node
status: forged
verified_on: 2026-10-27
verified_against: node@24
---

# A proof engine whose every verdict carries the hash of its import closure (TypeScript)

Project `afterlife` (https://github.com/xkazm04/afterlife), read at `main` commit `009c7893`.
Its proof engine is a model-free TypeScript checker that turns an agent's evidence into a Proof
Block with a verdict; a gate acts on those verdicts, and a ledger keeps them. The pipeline runs
the engine on Node 24 (`.gitlab-ci.yml:21 "NODE_IMAGE: node:24-bookworm"`) and prints its pin as
an artefact (`.gitlab-ci.yml:178 "npx tsx engine/cli.ts pin"`).

## The closure, not the folder

`engine/core/imports.ts` computes the pinned set. Its header states the technique's two halves
in four lines: the pin hashes what runs, and an import that cannot be followed is refused
(`engine/core/imports.ts:2 "This is what runs, so it is what the pin hashes"`,
`engine/core/imports.ts:3 "skipping it would"`, `engine/core/imports.ts:4 "silently shrink the pin."`). The walk starts at
the CLI entry and follows relative imports wherever they lead
(`engine/core/imports.ts:31 "export function importClosure(root: string, entry: string): string[]"`),
returning sorted root-relative paths (`engine/core/imports.ts:45`). The hash is over each path and
its content with line endings normalised (`engine/core/version.ts:31-32`). The README states the
consequence: the pin takes in the rules imported from `src/schemas` and leaves out tests,
fixtures and unimported files (`engine/README.md:66-68`), ending
`engine/README.md:69 "So a verdict pins its checker"`.

The tests hold both directions the technique asks for: the set reaches the shared rules outside
`engine/` and contains no test or fixture (`engine/core/pin.test.ts:38`), the hash moves when an
imported file outside the folder changes (`engine/core/pin.test.ts:49 "moves when an imported file outside engine/ changes"`)
and does not move for a file nothing imports (`engine/core/pin.test.ts:56`).

## The refusals

Each of the three refusals is an `EngineError` naming the specifier:

- unresolvable: `engine/core/imports.ts:25 "engine pin: cannot resolve"`;
- alias or any non-relative, non-package specifier:
  `engine/core/imports.ts:42 "is not a relative path; aliases are not followed"`;
- dynamic import with an argument, after comments are stripped:
  `engine/core/imports.ts:38 "uses a dynamic import(), which the pin cannot follow"`.

Third-party packages are left out by design and said to be
(`engine/core/imports.ts:2 "are outside"`), which is the
technique's "name what the closure leaves out". The engine reads no rules by path at runtime —
its file reads are of the inputs it judges (`engine/core/files.ts:13`, `engine/scan/local.ts:23`) —
so the data-file gap does not arise here.

## The gate's comparison

The gate blocks a proof made by another build:
`engine/decide/gate.ts:73 "the proof was made by a different engine build than this gate"`, with
a test that the pin passes and any other hash blocks (`engine/core/pin.test.ts:103`).

## Deviations

**The comparison is opt-in.** The check runs only when the caller passes an expected pin
(`engine/decide/gate.ts:28 "engineSha?: string; // when set"`); without `--engine-sha`, the gate
accepts a proof from any engine build and does not say so in its reasons — the test above
asserts the plain and pinned outputs are equal for a matching pin
(`engine/core/pin.test.ts:111`). The write-side sweep closes this in practice by re-deriving
every proof with its own engine, cloned at a commit it verifies, rather than accepting a target's
proof. The technique still asks that the gate refuse, or say it accepted any checker, when no
expected pin is configured.

**The dynamic-import refusal has no test.** The tests cover an unresolved path and an alias
(`engine/core/pin.test.ts:78 "fails closed on an import it cannot resolve or an alias"`) but not
`import(...)`, so a change to the `DYNAMIC` pattern at `engine/core/imports.ts:12` that stopped
matching would pass the suite while the pin shrank.
