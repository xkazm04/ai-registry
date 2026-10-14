---
layer: application
type: application
subject: retrieval
technique: ranking-budgets
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# Two budgets in one tree: the measured pack and the summed search (cass)

The tree is cass (coding_agent_session_search), a Rust tool that searches local
coding-agent transcripts and hands agents either ranked hits (`search`) or a cited,
extractive evidence bundle (`pack`). Read at commit `7fc01958d367`. The stack version
is the toolchain pin (nightly 2026-08-31, written as a dotted date); the crate version is `Cargo.toml:3 "version"` (0.10.0); the toolchain is a dated nightly
pinned in `rust-toolchain.toml` with no release number. Nothing was executed here.

The same tree budgets output two ways, and the contrast is the lesson. The pack
learned that item costs do not add up to what is sent and now measures the rendered
artifact. Search still sums item costs, and its documented budget is a soft one.

## The pack: overfetch, select by marginal value, then measure the artifact

- **Overfetch.** Candidates are fetched at several times the requested evidence and
  session counts, clamped between 64 and a fixed cap
  (`src/search/pack_planner.rs:888 ".clamp(64, PACK_CANDIDATE_LIMIT_CAP))"`;
  `src/search/pack_planner.rs:22 "PACK_CANDIDATE_LIMIT_CAP: usize = 2_048;"`).
- **Marginal value.** Each selection round re-scores the remaining candidates against
  what is already selected, with a source-diversity term and a duplicate penalty
  (`src/search/pack_planner.rs:1387 "+ 0.10 * source_diversity_score"`;
  `src/search/pack_planner.rs:1391 "- duplicate_penalty;"`). This is the technique's
  "the tenth near-duplicate is worth nothing", implemented as a set-conditional score.
- **Redact before cutting.** Credentials are redacted before any truncation, because
  cutting first can hide a credential's shape from the detector
  (`src/search/pack_planner.rs:993 "Redact before truncation: cutting a credential first can hide"`),
  and an over-budget item is shortened before it is dropped
  (`src/search/pack_planner.rs:1104 "Fit the already-redacted excerpt before dropping relevant"`).
  The technique's cut-line disciplines do not mention ordering against a transform
  that must see the whole item; this tree shows one.
- **Admission on the measured artifact.** Planning budgets evidence additively inside
  a fixed share of the limit
  (`src/search/pack_planner.rs:924 "let evidence_tokens = percent_tokens(max_tokens, 60);"`).
  That plan is then rendered in the requested format, the rendered string is counted
  (`src/lib.rs:34522 "let output_tokens = output.chars().count().div_ceil(4);"`), and
  while it exceeds the limit the plan is reduced and rendered again
  (`src/lib.rs:34526 "plan.reduce_for_output_budget(output_tokens - token_limit"`).
  The changelog records the move: the serialized output must now fit the request
  (`CHANGELOG.md:1470 "The serialized output must fit the requested"`), and the planner
  states why one reduction cannot be priced in advance
  (`src/search/pack_planner.rs:420 "Rendering must be repeated after each reduction"`).
  Runtime metadata is frozen before each measurement so nothing is appended after
  admission (`src/lib.rs:34496 "Freeze runtime metadata before encoding and measuring."`).
- **A typed refusal.** When the pack cannot fit without dropping required citations it
  refuses with a named error kind rather than emitting an over-budget or citation-less
  artifact (`src/lib.rs:34529 "kind: CliErrorKind::PackBudgetTooSmall.kind_str(),"`), and
  every dropped candidate lands in an omitted list with a typed reason
  (`src/search/pack_planner.rs:463 "PackOmittedReason::TokenBudgetExhausted,"`).

### How it differs from the technique's search

The technique bisects over prefix length and stops inside a 10 to 15 percent band.
cass walks down from the over-budget plan: each step shrinks the last excerpt by the
measured excess, converted to characters, or drops the last item when the excerpt
cannot shrink further (`src/search/pack_planner.rs:427 "let Some(item) = self.evidence.last_mut() else {"`).
Steering the step by the measured excess lets one step remove most of the overflow
when it sits in a single excerpt (the tree records no render counts to say how often),
and walking down from above makes the technique's ratchet unnecessary, since the first
artifact under the line is the largest one the walk visits. The worst case is still
linear in the number of selected items, where bisection is logarithmic. The tolerance
is tighter than the technique's: 5 percent over the limit
(`src/search/pack_planner.rs:935 "max_output_tokens_with_overflow: max_tokens.saturating_add(max_tokens / 20)"`).

Two departures are real costs. Excerpts are cut at a character count with an ellipsis,
not at a structural seam
(`src/search/pack_planner.rs:1683 "let keep_chars = max_chars.saturating_sub(3);"`), so a
truncated excerpt can end mid-identifier, which the technique's honest-seam rule
forbids. And every count is characters divided by four
(`src/search/pack_planner.rs:20 "TOKEN_ESTIMATE_CHARS_PER_TOKEN: usize = 4;"`), never a
tokenizer, so the 5 percent band is a band in estimator units. The contract states the
approximation (`docs/planning/ANSWER_PACKS_CONTRACT.md:472 "four UTF-8 characters per"`);
nothing in the tree measures it against a real tokenizer on JSON and code, content
whose characters-per-token ratio differs from prose. The technique's instruction applies directly: where the
estimator's error and the band are the same order, say so. Here nobody has measured
which of the two is larger.

## Search: an additive budget, and an honest cursor

Search with a token budget first splits a per-hit character allowance across snippet,
content and title (`src/lib.rs:33182 "let per_hit = char_budget"`), then walks the hits,
serializing each one on its own and summing
(`src/lib.rs:35873 "let len = serde_json::to_string(&hit)"`), and stops once the next hit
would cross the line, always keeping the first
(`src/lib.rs:35876 "if !kept.is_empty() && acc_chars + len > budget_chars"`). This is
the additive model the technique says breaks when output is rendered: the sum is taken
before the per-hit trust block is attached
(`src/lib.rs:37051 "attach a metadata-only trust/provenance verdict per hit"`) and before
format encoding (`docs/planning/TOON_INTEGRATION_BRIEF.md:532 "The field filtering and truncation happen BEFORE format encoding"`),
so the emitted response is larger than what was admitted. The public description is
accordingly soft (`README.md:1227 "Soft budget (~4 chars/token); adjusts truncation dynamically"`).
A consumer that sizes a context window from the search budget is trusting a number
the tree itself does not enforce.

What search does well is the cut's report and the continuation. A hit clamped off by
the budget is not lost to paging: the next cursor's offset advances by the hits
actually emitted, not by the page size
(`src/lib.rs:37078 "encode_search_cursor(offset.saturating_add(returned_count), cursor_page_limit)"`),
and clamped-but-unemitted hits keep the has-more flag set
(`src/lib.rs:37070 "let clamped_unemitted_hits = returned_count < search_page_count;"`).
The cursor manifest says why continuation is or is not safe
(`src/lib.rs:36333 "cursor offset advances by emitted hits after token-budget clamping"`)
and whether the total is exact or a lower bound
(`src/lib.rs:36345 "total_matches is a lower bound from the current result window"`).
This is the technique's "the cut reports itself" done thoroughly, with the predicate
on the count.

The cursor itself is an ordinal: an offset and a limit, base64-encoded
(`src/lib.rs:36291 "Some(BASE64_STANDARD.encode(payload))"`). An index rebuild between
pages shifts what an offset points at. The tree declines to fix that and labels it:
continuation is marked unsafe while the index is rebuilding or after a timeout
(`src/lib.rs:36323 "let continuation_safe = input.next_cursor_present && !input.timed_out && !index_rebuilding;"`).

## What the realization cannot do

- Bound search output. The pack's measured admission was not carried back to the
  surface agents call most.
- Bound either surface in real tokens. Both are bounded in a proxy whose error is
  unmeasured.
- Keep a truncated pack excerpt whole at a seam.

## What the tree's shape says about the technique

It confirms the non-additive section from inside one codebase: the surface that moved
to measuring the artifact gives a hard bound with a typed refusal, and the surface that
still sums items documents its budget as soft. It refines the search procedure: a
measured-excess descent from an over-budget plan converges quickly and needs no ratchet,
at a linear worst case. And it adds an ordering rule the technique lacks: a transform
that must see the whole item (redaction) runs before the cut, and the budget is spent on
its output, markers included.
