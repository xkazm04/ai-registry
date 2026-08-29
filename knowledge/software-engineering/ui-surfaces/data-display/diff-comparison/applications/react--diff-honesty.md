---
layer: application
type: application
subject: diff-comparison
technique: diff-honesty
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# Diff honesty — when the vocabulary outran the alignment

*Verified against the project tree at `bf2a1e249`.*

The technique's clause "the vocabulary matches the alignment" describes a
failure that is easy to state and hard to see, because the arithmetic is
correct at every step. This is a worked case where the whole mechanism was
present in one 98-line file: the alignment, the vocabulary, and — three
functions apart — an author who already understood the rule.

## The seam

`src/features/teams/sub_teamMemory/libs/memoryDiff.ts:50` compares two runs
of an agent team's memory set. The alignment was an id-set difference:

```ts
const idsA = new Set(memoriesA.map((m) => m.id));
const added = memoriesB.filter((m) => !idsA.has(m.id));
```

and the output type labels those halves at `:18-21` — `added` is "new
learnings", `removed` is "no longer present". The panel renders them under
those words with a green plus and a red minus
(`components/diff/DiffContent.tsx:106-127`).

The alignment cannot support the words, and the schema is what proves it. A
memory row carries exactly one `run_id` (`src-tauri/db/src/repos/resources/
team_memories.rs:95-102` selects a run's rows by it) and a freshly minted id
per row. Run A's id set and run B's id set are therefore **disjoint by
construction** — not usually, not in practice, but as a property of the
table. Every memory in B is "new", every memory in A is "gone", for two runs
that learned exactly the same things. The file's own doc comment said so out
loud at `:48`: "matching is by memory ID -- memories created in different
runs have different IDs." Documentation is not disclosure; the reader of a
diff is not reading the kernel's comments.

What makes this a defect rather than an oversight is `:73-84` of the same
file. The author refuses to emit an importance shift for a category present
on one side only, with the reason written in: it "would be a fabricated
claim about a comparison that was never made." The principle was held, at a
finer grain, ten lines below the place it was not applied. The sibling hook
`useRunDiffSummaries.ts:82-87` inherited the same alignment into the
timeline markers, where `added` was always `current.length`.

## A and B

**A** — the seam as it stood: align on `id`, keep the change vocabulary.

**B** — the technique's first branch (strengthen the alignment rather than
weaken the words): align on a durable content key, `category + title +
content`, as a **multiset** so two identical memories in A against one in B
leave exactly one unmatched. Importance stays a property *of* the aligned
memory, not part of its identity, so an importance edit remains a shift
rather than a delete-plus-create. The timeline hook was routed through the
same exported helper, because the technique's other clause — the summary and
the detail agree — is violated the moment two surfaces count under different
predicates.

## What was read, and what it said

A test pinning the case the schema guarantees: two runs holding the same
learnings under fresh ids.

Under A, `vitest` on
`src/features/teams/sub_teamMemory/libs/__tests__/memoryDiff.test.ts`
reported the diff as two added and two removed — the surface asserting four
events, all of them false, for a pair where nothing happened. Under B the
same case reports zero and zero. The file's nine pre-existing cases pass
unchanged under both policies, which is the interesting part: the existing
suite could not tell A from B, because every fixture it had used distinct
content for distinct ids. A defect visible only to a fixture nobody had
written is exactly the shape this technique describes. `tsc --noEmit` and
the 24-test folder suite are green under B.

## What this cannot do or prove

- **It moves the failure, it does not remove it.** Content alignment says a
  memory whose *text was edited* between runs is one removal plus one
  addition — a real change rendered as two false events, the "moved is not
  removed-plus-added" clause failing in a different direction. Closing that
  needs a similarity pass and a labelled inference, which is a larger design
  than a 40-line change.
- **The gate measures the kernel, not the panel.** The test reads
  `computeMemoryDiff`; nobody asserted what `DiffContent.tsx` renders. The
  words on screen are still "new learnings" and "no longer present", now
  merely supported by the alignment underneath them.
- **It proves nothing about magnitude.** Whether real run pairs in the field
  were 90% falsely-added or 5% is unmeasured — the harness that would answer
  it is a replay over recorded run pairs, and none was built. The verdict is
  "the claim is now supportable", not "the claim was wrong this often".
- **Content as a key is an assumption about this entity.** It holds because
  a team memory is immutable text produced by a run. Copying the move to an
  entity whose content is edited in place would reintroduce the same class
  of lie with better manners.
