---
layer: application
type: application
subject: test-harness
technique: unreached-decisions-pin-nothing
stack: node
status: forged
verified_on: 2026-09-17
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Three mutations of a locale argument, one caught by 8091 tests

*Verified against the project tree at `a6e773e3`; the toolchain witness is the
manifest's `engines.node` (`>=24.0.0 <25.0.0`) and the pipeline's `node-version:
24`, which the comment beside it pins to the verified local toolchain.*

The candidate-reasoning runner asks a second-language engine for a narrative in
the recruiter's locale. Its own history is the interesting part: the locale used
to be collapsed (`requestedLang === "cs" ? "cs" : "en"`), German and French
recruiters got English prose, and the fix — pass the requested locale straight
through — arrived with a test file that opens with a paragraph naming the defect
and two tests called *"a de request is generated in de, not collapsed to
English"*.

Those two tests cannot see the generation language. The file sets the interpreter
command to a bogus binary so no engine ever spawns, seeds the prompt cache at the
exact key, and reads the cache-hit return. On that path the value asserted —
`narrativeLang` — is derived in-process two lines above the cache lookup
(`app/_lib/reasoning-run.ts:89-90,131`). The argument that actually carries the
locale is built forty lines further down, inside the block the cache return skips,
and was an inline array literal.

## The reach probe

Three mutations, declared before any run, each a defect a reviewer would call
serious. Arm A is the suite as shipped.

| mutation | what ships if it is wrong | arm A | arm B |
| --- | --- | --- | --- |
| M1 restore the historical collapse at the derivation | every non-Czech locale English | **red** (2 tests) | red |
| M2a pass the literal `"en"` where the argv is built | every locale English, stamp still says de | **green** | red |
| M2b pass the literal `"en"` at the call site | same | **green** | red |
| M3 delete the `--lang` flag pair | engine takes its own `en` default | **green** | red |

M2 and M3 were then re-run against the **whole** unit suite, not the eight files
that name the value: 8091 tests, 8090 passing, the single failure a
load-dependent flake in an unrelated process-tree test that is green in isolation
and imports none of the touched modules. So the defect the file was written to
prevent can be reintroduced at the crossing, and the project's own gate says
nothing.

## Arm B: the decision lifted to where a test can reach it

Two changes, both in the project's own idiom — a sibling runner already extracted
its argv builder for this exact reason, and says so in its test's header:

1. `reasoningCliArgs(inputArgs, jobId, engineLang)`, a pure exported function
   returning the same array the inline literal built, asserted directly:
   `deepEqual` on the whole argv for one locale (so the flag order the engine's
   parser reads is pinned byte-for-byte) and, for each of the four shipped
   locales, that the last two elements are `--lang` and that locale.
2. A caller-side pin that the unreachable site hands the builder `engineLang` and
   not a literal, plus a count assertion that exactly one quoted `--lang` literal
   exists in the module. This half reads source text, which is the weaker
   instrument, and the test says so in its own message.

Both halves earn their place: M2a is caught only by the first, M2b only by the
second, M3 by both. The count assertion fired during construction — a first draft
counted unquoted occurrences and reported `4 !== 1` against the module's
comments, which is the cheapest possible demonstration that the new instrument
can go red.

## Verdict

- **Target** (declared first): mutations of the decision detected by the
  project's own unit runner. Arm A **1 of 4**; arm B **4 of 4**.
- **Floor 1**: unmutated, arm B is green on the eight files that name the value
  (65 tests, up from 63 — the two new ones) and on the full suite.
- **Floor 2**: `tsc --noEmit` reports nothing in either touched file.
- **Floor 3**: production argv unchanged — the builder returns the same array,
  asserted by `deepEqual` against the literal it replaced.

`better`. The seam was chosen because it could falsify: had M2 and M3 gone red,
the cache-hit stamp would have been a sufficient witness of the generation
language and the technique's claim about *this* shape of test would have been
wrong here. They did not, and the two tests that read most convincingly as pins
were pinning a derivation.
