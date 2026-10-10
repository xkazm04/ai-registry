---
layer: application
type: application
subject: judgeable-spec-authoring
technique: enumeration-closure-as-arithmetic
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16.3.3
applied: code
ab_verdict: better
proof: ab-paired
---

# A produce prompt's required-field list, closed as a sum

## What was opened

A game-production tool built as a Next.js app (`next` 16.3.3 in `package.json` and in the
installed module). The prompt builder below runs on both sides of it: the lab panel
(`src/components/layout-lab/steps/ArchetypeStep.tsx`) and the dispatch route
(`src/app/api/one-shot/step/route.ts`). The tool has 351 catalog pipeline steps. Each one
produces an artifact, and an acceptance checker grades it. A CLI language model writes the
artifact from a produce prompt, so the prompt is the spec and the checker is the strict
reader.

The prompt already had an enumeration that claimed completeness. `stepContractBlock`
opened with `## Required fields (graded — use these exact keys)`, and it took that list
from `requiredFieldsOf`, which collects the requirement tags that checkers opt into. A
fleet test guarded the list. It ran each checker on empty data and required every key named
by its `missing:` reason, its `is N characters` reason or its `has N item(s)` reason to
appear in the prompt (`src/__tests__/catalog/required-fields-in-prompt.test.ts`, at
origin/master `727d1498`).

That guard is a sample of what a checker *says*, not a record of what it *reads*. A value
law (a price/power band, a loudness target, a margin band) reports `pending` with a detail
and no reason, so the guard never saw those fields. No tag described them either.

## Why this seam was chosen to falsify

The seam had already been fixed once for this exact defect (a 2026-09-22 run measured 102
of 114 steps blind), and a fleet test guarded it. If a tag list plus a reason-text census
were enough, the closure would already hold, the A arm would count zero, and the technique
would have nothing to add. The A arm counted 58.

## The paired run

Both arms ran over the live registry of 351 steps in one harness. A is origin/master
`727d1498`; B is the change. For each step, `accept` ran over a recording Proxy of the
step's own produce stub, the same recorder the project's spec linter uses for its rule (e).
Every top-level key the checker touched was compared with what the step's built prompt names
as a key.

| | A | B |
| --- | --- | --- |
| graded (non-deferred) steps whose checker reads a field the prompt never names | **58 of 259** (67 fields) | **0** |
| of which value-law fields (`pricePowerRatio`, `integratedLUFS`, `marginPct`, `threat`, `raresPerHour`, ...) | 14 steps, 19 fields | 0 |
| of which `links` (read by the link resolver on 44 steps, graded only when declared) | 44 steps | 0 |
| prompts telling the producer to write a `wiringContract` the step neither declares nor grades | **119 of 258** | **0** |
| contract blocks dropped by the 2,400-character cap | 0 | 0 |
| acceptance verdicts on every produce stub | 351 | 351, identical |
| contract text across all steps | 288,606 chars | 251,642 chars |

**Target:** blind graded steps, 58 → 0. **Floor:** verdicts unchanged (the change only adds
prompt text), no block evicted by the size cap, and the project's suite green. The floor
held. Typecheck and lint were clean, and the suite results are in `proof:` below.

## What B does

- `gradedFieldsOf(spec)` records the top-level keys a checker reads over its own produce
  stub. It keeps only the keys and never a value, so no entity's content can reach another
  entity's prompt. It also records whether the stub's verdict was `deferred`.
- `gradedFieldClosure` splits that read set three ways. Fields the tags describe are
  **described**. On a non-deferred step, untagged reads are **named**. On a deferred step,
  untagged reads are **settled later**, because an L3/L4 runner or the gallery selection
  writes them.
- When anything is named, the block states the sum before the list, with every term
  interpolated: `Graded: 3 top-level field(s) = 2 described + 1 named.`
- The wiring-contract instruction reaches a step only when the step declares a contract or
  grades one.
- Two planted controls pin the guard. A value law on an untagged field must be named; the
  test asserts that the old reason-text census cannot see this case. A field read only by a
  deferred gate must not be named.

Anchors, in the tree as committed:

- `src/lib/catalog/acceptance/requiredFields.ts:101` "deferred = spec.accept(proxy).status === 'deferred';"
- `src/lib/catalog/contractPrompt.ts:161` "Graded: ${c.total} top-level field(s)"
- `src/lib/catalog/contractPrompt.ts:173` "const rule = reqs.length || graded.some((r) => r.field.endsWith('wiringContract'))"
- `src/__tests__/catalog/required-fields-in-prompt.test.ts:28` "const m = /missing: ([\w, .]+)/.exec(s.accept({}, ctx(p.catalogId)).reason"
- `src/__tests__/catalog/required-fields-in-prompt.test.ts:117` "names a field only a value law reads"
- `src/lib/catalog/pipelines/vendors.ts:375` "withinPercent('marginPct', 'Vendor margin within"

## What sharpened

**One disposition for every unlisted field was wrong, and the technique predicted it.** The
first B draft gave every untagged read the same line ("graded on its value, write it under
this key"). On a deferred gallery step, that told the producer to write `selected` and
`genHistory`, which the selection owns. The technique's procedure gives each element a
disposition by owner ("read here, or owned there by name"), and the third term exists
because of it. This tree's owners are the producer, the runner and the selection.

**In a size-budgeted artifact, the closure competes with what it closes over.** The second
draft named every field and pushed one step's wiring-contract block (about 600 characters)
past the cap. The fix was not to raise the cap. It was the inverse closure: an instruction
that no checker reads, `CONTRACT_RULE` on 119 unwired steps, was deleted, and 409 characters
came back on each of those prompts. Asking "does every graded field have a line?" without
also asking "does every line have a grader?" turns the closure into a cost that the next
section pays. This is one sighting, banked in the subject note.

**Counts were not the assertion.** The guard compares field identities by name (every read
key against what the prompt contains), not two totals. That is the subject review's
counterexample ("matching counts do not prove matching sets"), applied.

## What this realization cannot do

- It sees only top-level keys. A checker that reads `stats.armor` records `stats`, so a
  missing nested key still depends on the tag describing it.
- It sees only branches the produce stub reaches. A checker path taken only by a failing
  value goes unrecorded. On a passing stub, though, `allOf` evaluates every member.
- `Effect Logic` now sits at 2,361 of 2,400 characters. The next field added to that step
  will evict its wiring block, and the cap test will not notice, because the cap test checks
  sizes, not evictions.

## Proof

`ab-paired`, 351 steps on both arms. Before the change, the new guard failed on arm A's
prompt builder in all three of its live tests. After it, the guard passes. Commit and suite
counts are in the project's `.ai/applied.jsonl` row for 2026-10-10.
