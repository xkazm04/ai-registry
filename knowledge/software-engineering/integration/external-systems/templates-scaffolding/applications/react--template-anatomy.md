---
layer: application
type: application
subject: templates-scaffolding
technique: template-anatomy
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# The category vocabulary nothing at runtime can check

*Verified against the project tree at `bf2a1e249`.*

The technique's admission-door argument is about templates, but its
mechanism generalizes to every table keyed by a template's vocabulary: a
membership check nobody code-reviews for, that a five-line structural change
kills forever. This is that change, made at a table the interview renders
from, and measured.

## The seam

`src/features/templates/sub_generated/adoption/questionnaireCategoryOrder.ts:22-30`
declares the canonical question-category vocabulary — eight members, ending
in `boundaries` — as an `as const` tuple, and `:42` derives
`QuestionnaireCategory` from it. The file's own doc comment states the
contract it expects downstream: *"Any map keyed by category should now be
declared `satisfies Record<QuestionnaireCategory, …>`, which turns a missing
entry into a compile error instead of a dimension that quietly never moves."*

One sibling had already been converted.
`adoption/questionnaire/questionnaireGlyphRow.ts:45-54` declares
`CATEGORY_TO_DIM` `as const satisfies Record<QuestionnaireCategory,
GlyphDimension>` and then exports a widened `Record<string, GlyphDimension>`
view for callers that index it with a free-form value. Its comment records
what the conversion cost: without it `boundaries` had been "silently absent
from both" maps, and "a boundaries question moved no petal and nothing said
so."

`adoption/QuestionnaireFormGridConfig.ts:24-35` is the second map, and it did
not learn. It was declared

```ts
export const CATEGORY_META: Record<
  string,
  { label: string; Icon: …; color: string; bg: string; border: string }
> = { credentials: …, configuration: …, human_in_the_loop: …, memory: …,
      notifications: …, domain: …, quality: … };
```

Seven entries against an eight-member vocabulary. Its three consumers
(`questionnaire/QuestionnaireHeroQuestion.tsx:76`,
`questionnaire/QuestionnaireStoryThread.tsx:38` and `:171`,
`QuestionnaireFormGrid.tsx:242` and `:298`) all index it as
`CATEGORY_META[question.category ?? ''] ?? FALLBACK_CATEGORY`, so the missing
member is not a crash and not a blank — it is the `Other` bucket
(`:37-43`, label `'Other'`, the Configuration gear glyph). A boundaries
question rendered under a label that says the surface does not know what it
is.

## A and B

**A** — the table as an open `Record<string, …>`. The omission is
unrepresentable as an error: the annotation the author wrote says "any string
key may be present," which is exactly the statement that makes "this key is
absent" legal.

**B** — the table declared `satisfies Record<QuestionnaireCategory,
CategoryMeta>`, with `export const CATEGORY_META: Record<string,
CategoryMeta>` as a widened view, so the call sites that pass
`question.category` keep working and an unknown category still lands on
`FALLBACK_CATEGORY`. The technique's structural fix, transplanted verbatim
from the sibling.

## What was read

`tsc --noEmit`, the project's own gate, run three times on the same tree:

1. **A, untouched:** clean. This is the finding, not a control. The whole
   defect ships through a green typecheck, which is why it survived the pass
   that fixed its twin one directory away.
2. **B with the `satisfies` added and no new entry:** exactly one error,
   `TS1360` at the table, and it names the missing member —
   `Property 'boundaries' is missing in type … but required in type
   'Record<"notifications" | "credentials" | "domain" | "memory" | "quality" |
   "configuration" | "human_in_the_loop" | "boundaries", CategoryMeta>'`.
   The gate does not merely fail; it reads the vocabulary back and points at
   the gap. That is the measurement: A cannot represent the defect, B states
   it by name.
3. **B complete,** with a `boundaries` entry: clean, and the 32 tests under
   `sub_generated/adoption/` pass.

Verdict `better`, on a gate that saw the difference in both directions.

## The structural fact

Ask who *writes* a question's `category`. Not the app: a repository-wide
search for the literal `'boundaries'` outside the vocabulary file and one
test fixture returns nothing, in the frontend or the backend. The category
arrives on `TransformQuestionResponse`, the payload of a model-driven
transform — so the value is authored by a generator, at runtime, against a
vocabulary the frontend constant is the only authority for.

That is the condition under which the technique's preference for a machine
check stops being a style argument. There is no producer to add a check to,
no seed file to audit, no import path to gate. A runtime guard could only
compare against the same constant and would fire on the user's screen, after
the question had already been bucketed. The type is the only place the
membership can be established before anything renders, and the tree
demonstrates the alternative twice: two maps keyed by this vocabulary, both
written by hand, both missing the same member, the drift caught once by an
audit and once — here — by nothing at all.

## What this cannot do or prove

- It proves the check binds, not that the *contents* are right. `boundaries`
  now has a label, a glyph and a hue, and every one of those is my judgement.
  A wrong glyph is as invisible to `tsc` as a missing entry was; the
  compiler counts keys, it does not review meaning.
- It says nothing about the technique's central claim — the
  defaults-within-options invariant at the admission door. That seam is a
  different one (`sub_recipes/types.ts:70-71` states the invariant as an
  authoring comment with no machine check anywhere) and was not tested here.
  This run tested the *mechanism* the technique recommends, on a smaller
  membership check, and found it sound; it did not test the door.
- The widened export is a deliberate hole. `CATEGORY_META` is still indexed
  with a `string`, so a generator that emits `"boundary"` or `"limits"`
  lands on `Other` exactly as before, silently. The `satisfies` protects the
  vocabulary from its *maintainers*, not from its writer. Closing that
  requires validating the category at the payload boundary, which is the
  admission door this run did not build.
- One project, one map, one run. A second map in the same tree already
  carried the fix before this run started, so the sample is not independent
  evidence that the pattern generalizes — it is evidence that a codebase
  which discovered the pattern once did not finish applying it, which is a
  claim about follow-through, not about types.
