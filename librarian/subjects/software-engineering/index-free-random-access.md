---
subject: index-free-random-access
domain: software-engineering
last_touched: 2026-09-21
---
# index-free-random-access

`software-engineering` / `backend-platform` / `data-pipeline-semantics`

Forged 2026-09-07 from `github:medialab/xan` @ `0149e93c` by run `intake-xan`
(`/intake`, XL dispatch). Spec: `librarian/specs/2026-09-07-index-free-random-access.md`.
Source note: `librarian/sources/2026-09-07-xan.md`.

## What it owns

Addressing a large record-oriented artifact by byte offset **without building
an index** — and the four capabilities that one primitive buys. The enabling
operation is *given a byte offset, return the offset of the next record
boundary, or refuse*, which is hard because the formats that survive in this
role escape their own separators in band, so a byte offset is not locally
interpretable.

Six techniques: `framing-recovery-by-hypothesis-rejection`,
`structure-derived-read-budget`, `segment-then-parallelize`,
`sorted-data-as-a-read-only-index`,
`conservation-sweep-over-a-partition-parameter`,
`reversible-encoding-buys-tail-recovery`.

## Why it was a subject and not an amendment

The Phase 2d routing count gave six load-bearing design decisions with
`corpus: NONE`, all sharing one `HOME IF NEW` — both v2.2 clauses firing on one
system. Absence was established uncapped and then **re-verified after a
two-machine merge landed mid-run** (`software-engineering` 220 → 228 subjects,
1,644 → 1,692 techniques): `map-reduce` 0 files, `io-bound` 0, `palindrom` 0,
`reverse read` 0, `self-delimiting` 0, `cosine similarity` 0.

## Boundaries stated in the golden path

- **`llm-agent/runtime-and-io/streaming-output/stream-parsing`** — the
  discriminator is one sentence: *that subject's reader knows where it is; this
  subject's reader must establish where it is from local evidence.* The two
  compose in the obvious order.
- **`modelled-performance-estimates/refuse-rather-than-emit-a-sentinel`** —
  owns the refusal rule and its domain test; cited, not re-derived. The
  addition is narrow: there the refusal originates in an unavailable input,
  here in a discriminator failing to separate two surviving hypotheses.
- **`integration/acquisition-and-ingest/native-document-format`** — owns what a
  format owes its readers; this subject asks the inverse question, which
  encoding properties buy which recovery capabilities.
- **`work-execution/execution-state-checkpointing`** — models progress as state
  written *beside* the work. The tail-recovery case here is the one where the
  output artifact **is** the checkpoint and cannot disagree with itself.
- **`test-harness` / `quality-gates`** — own property testing generally;
  technique five is narrower: a strategy for a component with **no oracle**.

## Single-stack debt

The category held **10 of 10 python** applications before this subject. It
lands three `rust@1.85` applications, so the category is now two-stacked. The
version witness is the toolchain pin, corroborated by the lint configuration's
minimum supported version and the release workflow's override — three
statements of one number.

## The strongest application is negative

`rust--conservation-sweep-over-a-partition-parameter` records that the source
tree **invented** the technique's instrument (a conservation sweep across
partition counts 1–128) and then left it outside the build: continuous
integration runs only the compiled suite, the sweep is a shell script nothing
invokes, and it prints rather than asserts. Meanwhile the compiled test file
for the same command covers the *deterministic* splitting mode and never
mentions the heuristic one. **The mode with automated tests is the one that
cannot be wrong.** Nobody designed that — it fell out of the deterministic mode
being easy to fixture and the heuristic mode not being, which is the difficulty
the technique exists to answer.

## Open

- `structure-derived-read-budget` and `framing-recovery-by-hypothesis-rejection`
  were kept separate on the grounds that they prevent different failures (a
  wrong answer versus an unbounded one). A later pass may find the split
  artificial.
- `segment-then-parallelize` is scoped to local seekable storage. The
  extension to network object stores is stated as untested, not claimed. Return
  condition: a source that measures it.
- No fleet project currently has a seam for any of the six — the apply lane for
  this subject is empty and honestly so. The nearest candidate carries
  multi-megabyte delimited caches and an ingest path but no parallel or
  offset-addressed reader.
