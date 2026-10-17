---
layer: application
type: application
subject: retrieval
technique: retrieval-evaluation
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# A quality gate that measures plumbing (cass, a counter-example)

The tree is cass (coding_agent_session_search), a Rust tool that indexes local
coding-agent transcripts and serves lexical, semantic and hybrid search to agents.
Read at commit `7fc01958d367`. The stack version is the toolchain pin (nightly 2026-08-31, written as a dotted date); the crate version is
`Cargo.toml:3 "version"` (0.10.0); the toolchain is a dated nightly pinned in
`rust-toolchain.toml` with no release number. Nothing was executed here.

cass is a useful counter-example because it did the expensive parts of retrieval
evaluation well and skipped the part that decides whether the number means anything.
It has a pure, deterministic scorer, a gate that runs the real binary, and a privacy
assertion most evaluation harnesses lack. Its labeled set, though, is built so that
the gate cannot fail on ranking, and the one instrument that does measure ranking has
never reached its own floor.

## What it gets right

- **The eval exercises the production path.** The gate seeds a fixture corpus as real
  sessions, indexes it once with the shipped binary and issues every judgment through
  the robot search command
  (`tests/e2e_search_quality_gate.rs:11 "indexed once by the real"`). This is the
  technique's gate-sees-target rule honored: no replica of the ranking exists to drift
  from the shipped one.
- **The report cannot leak what it scores.** Document references are sanitized again
  at the scoring boundary
  (`src/search_quality_eval.rs:24 "Document refs are sanitized again at the scoring boundary"`),
  and the gate plants private body text in the corpus and asserts it is absent from
  both emitted artifacts (`tests/e2e_search_quality_gate.rs:473 "!json_str.contains(PLANTED_BODY_TEXT)"`).
  For an evaluation over private transcripts this is the right first constraint, and
  the technique does not state it.
- **Metrics carry their predicate.** Precision divides by the slots actually
  considered rather than by k, so a four-document corpus does not depress it
  artificially (`src/search_quality_eval.rs:276 "Dividing by"`), and a judgment
  with no expected references fails instead of passing vacuously
  (`src/search_quality_eval.rs:828 "empty qrels must never pass vacuously"`).

## Where the set defeats the instrument

**Every query is an invented token that names its own answer.** The judgment file
says so in its header: each query is one distinctive token from the corpus, and
single-reference queries use a keyword unique to one document
(`tests/fixtures/search_quality/qrels.json:2 "Single-ref queries use a keyword unique to one doc"`;
`tests/fixtures/search_quality/qrels.json:10 "unique keyword maps to exactly one doc"`).
That is the technique's corpus leak taken to its limit: the query is not merely
overlapping the target's vocabulary, it is a string that exists only in the target.
Recall of 1.0 is guaranteed by construction, and the gate asserts exactly that
(`tests/e2e_search_quality_gate.rs:402 "report.aggregate.mean_recall_at_k >= 1.0 - 1e-9"`),
together with precision of 1.0
(`tests/e2e_search_quality_gate.rs:408 "report.aggregate.mean_precision_at_k >= 1.0 - 1e-9"`).
A ranking regression that kept each unique token findable would pass.

**No stratum maps to a lane failure.** There is no paraphrase query, no
recency-dependent query and no query whose right answer is nothing. The semantic lane
is not merely unmeasured but switched to an offline hash embedder for the run
(`tests/e2e_search_quality_gate.rs:28 "CASS_SEMANTIC_EMBEDDER=hash"`), so the "hybrid"
mode every judgment requests cannot see the lane that hybrid search exists to add.
The gate's own header is honest about scope
(`tests/e2e_search_quality_gate.rs:24 "This is the small, deterministic CI suite"`;
`tests/e2e_search_quality_gate.rs:25 "corpus benchmarking stays separate/manual"`).
The problem is the name: a check called a search-quality gate that measures plumbing
and privacy will be read as evidence about quality by anyone who sees it green.

**The vacuity guard forbids the should-be-empty stratum.** A query passes only when
its expected set is non-empty
(`src/search_quality_eval.rs:343 "let passed = !expected_sorted.is_empty()"`) and no
unexpected reference appears in the top k
(`src/search_quality_eval.rs:347 "unexpected_refs.is_empty();"`). So "this query
should return nothing" cannot be written as a judgment: an empty expected set is the
spelling the guard reserves for a missing judgment. This is a boundary the technique
does not mark. Its should-be-empty stratum and the rule that an empty judgment must
not pass both need to hold, which means the judgment format needs an explicit
expect-empty value distinct from absent, rather than overloading the empty list.

## The instrument that does measure ranking never met its bar

The separate manual bake-off scores NDCG@10 over an external benchmark corpus against
a floor of 0.25 (`docs/reference/cass_bakeoff_validation.md:45 "minimum acceptable NDCG@10 (default 0.25)"`).
Its six recorded runs score 0.070, three runs of 0.0, 0.041 and 0.118
(`docs/reference/cass_bakeoff_validation.md:99 "NDCG@10: 0.070061"`;
`docs/reference/cass_bakeoff_validation.md:114 "NDCG@10: 0.0"`;
`docs/reference/cass_bakeoff_validation.md:158 "NDCG@10: 0.041154"`;
`docs/reference/cass_bakeoff_validation.md:172 "NDCG@10: 0.117723"`). Every run was
recorded under a non-strict mode in which failing the floor is a warning
(`docs/reference/cass_bakeoff_validation.md:90 "eligibility failures are allowed but recorded as warnings"`;
`docs/reference/cass_bakeoff_validation.md:120 "cutoff exception: STRICT=0"`). The three
lexical zeros are not diagnosed in the document; a lexical engine scoring exactly zero
over a whole query set is more likely a harness or corpus-mapping defect than a ranking
result, which is the technique's point that a number is only as good as the pairing
of queries to judgments behind it.

Two further properties keep the bake-off from becoming a standing gate. The corpus
path is hard-wired to a sibling project on the owner's machine
(`scripts/bakeoff/cass_validation_e2e.sh:41 "benchmark_corpus.json"`), so nobody else
can rerun it. And the code-level quality criterion is relative, a model must reach
eighty percent of a baseline model's score
(`src/bakeoff.rs:20 "pub const QUALITY_MIN_RATIO: f64 = 0.80;"`), where the recorded
baseline itself scored 0.07 against the absolute floor: a relative bar anchored to a
baseline that fails the absolute one certifies parity with failure.

## What the realization cannot do

- Attribute a regression to a lane. With one stratum of unique tokens, a drop in any
  lane looks the same as no drop.
- Measure floors. Without expect-empty judgments, the eval rewards a system that never
  returns empty, which the technique names as the structural failure.
- Detect drift between judgments and corpus. The judgments are pinned to an in-tree
  fixture of four documents and five judgments, so they cannot go stale; they also cannot represent the
  production corpus, which is private and changes size between audits.

## What the tree's shape says about the technique

It confirms the technique's central claim from the failure side. The machinery the
technique treats as secondary (pure scorers, production-path execution, reports) was
built well, and the labeled set the technique treats as primary was built for
determinism instead of discrimination, so the machinery measures nothing about
ranking. It adds two boundaries: a private corpus makes the privacy assertion part of
the instrument, and a vacuity guard written as "empty expected set fails" collides with
the should-be-empty stratum unless the format distinguishes expect-empty from missing.
