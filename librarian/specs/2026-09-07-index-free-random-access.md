# XL spec — `index-free-random-access`

- **Run:** `intake-xan`
- **Source:** `github:medialab/xan` @ `0149e93c` — a record-oriented data CLI, 56,751 lines Rust, 67 commands, ~85,000 words of in-tree design documents behind a 4,320-word landing page. Mined from a clone (Phase 2b), design read at Phase 2d.
- **Status:** DISPATCHED
- **Why XL and not two techniques:** the Phase 2d routing count came out at **six load-bearing design decisions with `corpus: NONE`, all sharing one `HOME IF NEW`**. They are not six opinions — they are one capability and the five things it buys, and the corpus has no entry for any of them. Uncapped greps across `knowledge/`: `map-reduce` 0 files, `io-bound` 0, `palindrom` 0, `reverse read` 0, `self-delimiting` 0, `cosine similarity` 0. The operator chose the forge dispatch at the Phase 5 gate (E4).
- **Design record:** the seven entries with forces, buys, rejects and `file:line` anchors are at `<the run's scratch directory, deleted after the run>` (it is folded into `librarian/sources/2026-09-07-xan.md` when the run closes). **Read it before drafting; it is this spec's evidence and it is not restated here.** The clone it was read from is live at `C:/t/intake-xan` @ `0149e93c` — read the tree, do not re-clone.

## Placement (verified against the authority, not against a count)

`knowledge/software-engineering/taxonomy.json` is the AUTHORITY; the folder tree is derived from it.

- `backend-platform` → `data-pipeline-semantics` is a **flat subcategory holding 5 subjects** (`self-describing-data-envelopes`, `reversible-transform-pipelines`, `deferred-operation-fusion`, `keyed-sample-transforms`, `deterministic-prefix-caching`). Add `index-free-random-access` as the **6th**, under the cap of 10 (`MAX_CHILD_DIRS`, `scripts/lib/taxonomy.mjs:39`). The subcategory holds no subcategories of its own, so the both-kinds prohibition is not engaged.
- **Not** `integration/acquisition-and-ingest/*` — those subjects own getting foreign data *in* (extraction, normalization, scraping, a saved document's contract). This subject owns reading a file **you already have**, from the middle.
- **Not** `backend-platform/work-execution/*` — that category owns coordination between units of work (queues, jobs, checkpoints, scheduling). This subject owns how one artifact is *divided* so that units of work can exist at all.
- Resulting path: `knowledge/software-engineering/backend-platform/data-pipeline-semantics/index-free-random-access/`. Link depth from a technique to `_laws.md`: `../../../../_laws.md` — **verify against a sibling** (`keyed-sample-transforms/techniques/*`) before writing, do not count directories by hand.
- **Append** the slug to the `data-pipeline-semantics.subjects` array in `taxonomy.json`. Do not reorder the array.

## Single-stack debt — this is half the reason the subject is wanted

All **10 of 10** existing applications in `data-pipeline-semantics` are `python`. This subject arrives from a Rust CLI and must land its applications as `rust--<technique>.md`. `verified_against` names the stack at the version the tree **witnesses**: `rust-toolchain.toml` pins `channel = "1.85.0"`, `clippy.toml` sets `msrv = "1.85.0"`, and `.github/workflows/release.yml` runs `rustup override set 1.85.0`. Say in the application's first paragraph which witness was read. Do not write a version a dispatch guessed.

## The boundaries this subject must state, and must NOT absorb

- **`llm-agent/runtime-and-io/streaming-output/techniques/stream-parsing`** owns framing before parsing — and it assumes the reader **started at a frame boundary and never lost it**. State the discriminator in the golden path's opening: *that subject's reader knows where it is; this subject's reader must establish where it is from local evidence.* Cite it; do not restate its typed-event boundary.
- **`engineering-assessment/measurement-method/modelled-performance-estimates/techniques/refuse-rather-than-emit-a-sentinel`** already owns the refusal rule, on law `unknown-is-not-a-value`, together with its domain test for sentinels. T1's refuse path **cites** it and does not re-derive it. The addition T1 may make is narrow and must be stated as such: here the refusal is produced by a *discriminator failing to separate two hypotheses*, which is a different origin from an input being unavailable.
- **`integration/acquisition-and-ingest/native-document-format`** owns a format as a published contract with an unbounded set of readers — versioning, declared extensions, locale-free serialization. T6 owns a different question: **which encoding properties buy which recovery capabilities**. Cite it, state the split, do not absorb its rules.
- **`backend-platform/work-execution/execution-state-checkpointing`** models progress as state written *beside* the work. T6's tail-recovery is the case where **the output artifact is the checkpoint** and no separate state exists. State that discriminator explicitly — it is the interesting half.
- **`engineering-process/build-and-release/test-harness`** and **`standards-and-gates/quality-gates`** own property testing and gate design generally. T5 is narrower and must say so: a verification strategy for a component that has **no oracle** — where no expected output can be written down, but a conservation law over a swept parameter can.
- **Sibling subjects in this category** (`deferred-operation-fusion`, `reversible-transform-pipelines`, …) own how a *transform chain* behaves. This subject owns how the *input is addressed*, before any transform. They compose; neither needs the other first.

## Proposed techniques

Six. Each carries `use_when` and a decision-rules section. Cite only laws whose anchors you have verified in `knowledge/software-engineering/_laws.md`.

### T1 — `framing-recovery-by-hypothesis-rejection`

**The decision rule:** when a format escapes its own separators in-band, a byte offset is not interpretable in isolation — but the number of *live hypotheses* about your position is small and fixed, and structural consistency rejects the wrong ones. Enumerate the hypotheses, parse under each, reject on a structural invariant, and refuse if the evidence does not separate them.

Must contain: the enumeration step (here: in a quoted field or not — two); the invariant used as the rejection test (a consistent field count per record, learned from a head sample, not assumed); the tie-break when both survive (compare a *shape* profile — per-field mean sizes — against the sample, by a similarity measure; the source reports the winner usually above 0.9 and the loser below 0.2); and the refuse path, citing the law and the technique named above. The generalizable claim is the ordering: **cheap structural rejection first, expensive similarity only for the residual.**

**What must NOT be claimed:** that this works on any format. It requires a format whose records are structurally homogeneous. Fold the source's own stated defeaters into the technique rather than into a caveat paragraph: a variable field count per record, and a record-size distribution that is skewed or multimodal (a file whose rows grow monotonically, or whose head is sparse and tail dense) both defeat it.

### T2 — `structure-derived-read-budget`

**The decision rule:** a speculative parse must be bounded in **bytes derived from sampled structure**, never by "read until N records parse" — because the wrong hypothesis has an unbounded cost. Reading an unquoted region as if quoted consumes to end of file; a record-count stop condition therefore makes the failing branch's cost proportional to file size, which is the cost the whole design exists to avoid.

Must contain: the asymmetry as the reason (this is the whole technique); the budget's derivation from the head sample's maximum record size times a constant; and the rule that the sample is the source of every constant here — cite `limits-are-derived`. State plainly what the sample must record (field count, maximum record size, per-field mean sizes) and that 128 records is an instance, not a law.

**Open question the drafter decides, not discovers:** whether T1 and T2 are one technique. They are proposed separately because the failure they prevent is different — T1 prevents a wrong answer, T2 prevents an unbounded one — but a drafter who finds the split artificial should merge them and say so in the report.

### T3 — `segment-then-parallelize`

**The decision rule:** for record work whose per-record CPU cost is below the cost of moving the record between threads, give each thread **its own byte range of the artifact** rather than having one reader broadcast records to a pool. The win is concurrent IO, not concurrent compute, and a broadcast topology pays coordination for a gain that is not there.

Must contain: the discriminator that tells a reader which side they are on (compare per-record work against inter-thread hand-off cost — if the work is IO-bound, segment); the corollary that **thread count is bounded by device concurrency, not by core count**, and that over-threading degrades throughput by pressuring IO; and the ordering guarantee that segmentation costs — output rows arrive in arbitrary order once threads flush independently, and buying order back requires bounded buffering per segment, which is only affordable when the per-segment output cardinality is known in advance.

Measured instance to cite with its protocol (`count-carries-predicate`): an 11GB, ~3M-record file on SSD, frequency table over one field — 2.326s single-threaded, 0.643s at 4 threads. **Say the storage medium in the same sentence as the number**; the source states the result does not transfer across filesystems and scheduling behaviour.

**What must NOT be claimed:** that this generalizes to network object stores. The source measured local SSD only. Either scope the rule to local seekable storage or state the extension as untested — the drafter decides which, and says so.

### T4 — `sorted-data-as-a-read-only-index`

**The decision rule:** a sorted artifact plus *approximate* random access is already a search index. Binary search tolerates landing near a record rather than on one, provided the search's invariants are maintained against the approximation rather than against exact positions — so no auxiliary index needs to be built, invalidated, or shipped.

Must contain: what "approximate" costs (you cannot address the nth record, only a byte near it); the invariant discipline that makes the search still terminate correctly; and the trade against a built index — sortedness is a precondition somebody must maintain, and this technique moves cost from build time to write time rather than removing it. Measured instance with protocol: a 12M-record, ~1GB sorted file on SSD, 0.143s for a bounded linear search against 0.017s for the bisection.

### T5 — `conservation-sweep-over-a-partition-parameter`

**The decision rule:** a component with **no oracle** — where you cannot write down the expected output — can still be verified by a conservation law swept across the parameter that varies. For a partitioner: for every partition count in a range, partition, count independently within each part, and assert the sum equals the count from one linear pass.

Must contain: why a fixture is the wrong instrument here (it pins one file at one parameter value and asserts a boundary offset nobody can independently derive); what the conservation law actually proves (the partition is exhaustive and non-overlapping) and what it does **not** prove (that any individual boundary is where it should be); and the sweep as the part that finds the bug — a partitioner is usually correct at 1 and 2. Cite `count-carries-predicate`: the count is only evidence because the predicate ("records in this byte range") is identical on both sides.

Generalize past partitioning in the golden path or here: the shape is *invariant + swept parameter* for any component whose output is unpredictable but constrained.

### T6 — `reversible-encoding-buys-tail-recovery`

**The decision rule:** an escaping scheme that is **symmetric** — the escape is a doubled occurrence of the escaped character, not a directional prefix — makes the encoded byte stream valid when read backwards. That single property buys constant-time reads of the artifact's tail, and therefore lets a long job **resume from its own output** with no separate checkpoint.

Must contain: the mechanism (feed bytes in reverse to the same parser, reverse the yielded records and their fields); why a prefix-escape scheme cannot do this; the capability it buys stated as a design force, so a team choosing an encoding can test for it; and the discriminator against `execution-state-checkpointing` — there, progress is state written beside the work and can disagree with it; here, the output *is* the progress record and cannot.

**What must NOT be claimed:** that reverse reading works on a compressed or non-seekable stream. State the constraint, and state the workaround class honestly (a block-compressed format with a companion offset index restores seekability; a plain compressed stream does not).

## The golden path must open by stating the job and the precondition

The job: *you have a large record-oriented artifact on local storage and you want to start reading somewhere other than the beginning.* The enabling primitive is T1; T3–T6 are what it buys. The golden path must state the **precondition that gates the whole subject** — structural homogeneity plus a seekable stream — before the first technique, because a reader whose data fails it should stop reading and scan linearly. It must also say the honest thing the source says: on a small artifact, none of this is worth doing.

## Purity

The `software` denylist does not ban format names, and this subject would be unreadable without one. Name the canonical record format **once**, as the instance the rules were reconciled against, and write every rule over "a record-oriented text format whose fields may contain the record separator, escaped in-band". No repo paths, no source-file extensions, no product or crate names in the upper two layers — those belong in the applications, where they are welcome and where the `file:line` anchors go.

## Web budget

At most 3 fetches, spent only if a rule needs a primary the tree cannot supply: the seeker implementation's published API documentation; the interchange format's ex-post specification (for the escaping rule T6 rests on); and at most one of the prior-art implementations the source itself names (a statistical-language CSV library's chunking, a database shell's parallel table import) — used to check whether the hypothesis-rejection step is novel or conventional. **Corroborate corpus-internally first**; three consecutive repository runs spent zero fetches and landed everything.

## Override the brief and say so

If the neighbours' stated scopes contradict this placement, or if six techniques is the wrong cut, take the better structure and explain the reasoning in the report. A brief that reads as non-negotiable buys compliance with a mistake.
