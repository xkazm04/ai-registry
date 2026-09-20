---
layer: application
type: application
subject: cross-provider-benchmark-operations
technique: graded-case-difficulty
stack: rust
status: forged
verified_on: 2026-09-20
verified_against: rust@2021
---

# Rust: a three-rung ladder in LightTrack, and what a live run did to it

LightTrack's benchmark lane grew an ordered difficulty ladder and then ran a
six-target matrix over it. The run is the reason this application is worth
reading: the ladder worked exactly as designed, and the corpus it graded still
spent two thirds of the round learning nothing. Every layer of the fix — the
type, the two deserializers, the per-tier tables, the render — is in the tree,
and so is the record of what the first run got wrong.

## The type, and the two different jobs its deserializer had

`Difficulty` in `crates/core/src/dataset.rs` is three rungs (`Easy`, `Medium`,
`Hard`) with `PartialOrd`/`Ord` derived, so the ladder is an order and not a
label set. `Difficulty::ALL` exists as the list a console or API validates a
spelling against, its doc comment saying so, precisely so a refusal elsewhere
cannot hardcode the rungs and go stale when the ladder grows one.

The instructive part is the pair of entry points.

- `de_difficulty` (same file) degrades an unrecognised value to `None` rather
  than failing the record, and its comment argues the case: a corpus exported
  from a four-rung system must import into a three-rung one, because a case
  nobody can read back is a case that leaves the corpus. It also refuses the
  obvious shortcut — `Difficulty` must never grow a catch-all rung, because a
  catch-all has to sit somewhere on a total order and every placement is a claim
  nobody made. The degrade target is the absence the field already models, and
  `None` means ungraded, never medium.
- `crates/api/src/difficulty_input.rs` is the **write** half, and it refuses.
  `parse_stated_tier` returns the rungs in the error; `stated_tier` treats
  absent and `null` alike as ungraded and every other shape — a number, an
  object, an unknown string — as a caller stating something this ladder cannot
  name.

Its module comment records why the split exists, and it is the finding: one
function was doing both jobs. A live model×effort benchmark on 2026-09-07 used a
fourth tier, `expert`, on 8 of its 18 cases; all 8 were accepted with a 200 and
stored ungraded, and the per-tier analysis then reported a phantom bucket,
noticed only because a script divided by zero. The same closed vocabulary had
been enforced on the *listing filter*'s query string since the ladder landed —
enforced on one surface and not the other, which is the shape this class of
defect always takes.

## The per-tier tables, and the verdict that is deliberately not a test

`crates/runner/src/stats/tiers.rs` buckets judged cases with a `Tier` enum whose
variants are `Graded(Difficulty)` and `Ungraded` — the remainder is a bucket and
never a rung, and the buckets sum to the judged case count so a reader can see
when the rungs alone do not cover the corpus. The module's own header records
the run that motivated it: a six-target matrix (`{haiku,sonnet,opus}` ×
`{low,high}`, 2026-09-07) scored 1.00 on every `easy` and every `medium` case
from all six targets, 36 of that round's 54 generation calls bought no
information, and nothing in the framework could say so, because the case
difficulty was carried all the way into the runner and dropped on the floor. The
finding came from a hand-written script hitting the API afterwards.

The verdict it now emits is descriptive and the tree is emphatic about keeping
it that way: no p-value, no alpha, no significance vocabulary, no per-tier
recommendation. The stated reason is power — in that same run the tier that
*did* discriminate held three cases — plus a second one specific to a codebase
with exactly one statistics path: a second, softer statistic invented for a
headline is where it would do the most damage. Two honesty rules ship with it: a
tier only one target reached reports `separates: null` rather than `false`, and
a tier where a target errored carries `uneven_coverage` so a complete-looking
count cannot imply the coverage it lacks.

## The audit that is not circular

`crates/runner/src/stats/thinking.rs` answers the question the grades cannot.
Its header states the problem in one line — difficulty grades come from an
operator, and that run's `medium` tier was a set of classic
cognitive-reflection traps that every target scored 1.00 on at every effort,
*because those puzzles are famous*. Thinking tokens are the run's own measure of
where a model found work to do, so a tier where thinking does not rise is a tier
this corpus did not make harder for this model. It is reported beside the
operator's grades and never in place of them, and it is never derived from the
scores.

The honesty machinery around it is the transplantable part. Medians rather than
means, because one case that spiralled to the token cap would drag a mean past
what the model typically spends. `CaseSpend::thinking` returns `None` where the
basis was not measured, which keeps a missing count out of the median instead of
entering it as a zero. And `thinking_basis` labels the figure: the Messages API
and the CLI path report no reasoning/answer split, so there the measure falls
back to output tokens and every derived figure says `output_tokens`, never
"reasoning tokens". `crates/runner/src/stats/effort_curve.rs` walks the same
data across adjacent rungs of one model, over the cases both judged, and reports
whether the dial is alive at all (a ratio of median thinking below ~1.2× means
every rung above it is the same call at a higher price), which cases flipped
wrong→right and right→wrong counted separately, and the score per 1k extra
thinking tokens. The whole block is documented in
`docs/BENCHMARK_FRAMEWORK.md` §2c–§2d.

## Where the grade reaches a caller, and where it stops

Two surfaces carry the ladder outward. `crates/contract/src/nested.rs` puts the
enum in the schema a tool caller receives for the inline dataset, with prose
saying ungraded is a state of its own and a spelling off the ladder is a refusal
rather than a silent downgrade; the contract's own tests assert the enum is
present, in ascending order, and not required — one of them carrying the
`expert` incident as its rationale. `crates/render/src/compare.rs` prints the
discrimination block verbatim from the object the runner hands it, deriving
none of it, and prints nothing at all when the key is absent.

The boundary worth recording is the one the tree chose on purpose. Per-target
tier means are layered onto each target's run report, which is POSTed and so
survives for a later gate or agent to read. The **cross-target discrimination
verdict** is inherently cross-target and lives only on the printed matrix
summary, because compare mode posts one run per target from inside its
per-target loop so a crash mid-matrix still records the targets that finished.
Deferring those posts to gain a persisted matrix artifact would trade a real
durability property for a reporting one. The cost is real and unstated
elsewhere: the sentence that says which tier separated anything reaches whoever
watched the run and is not in the artifact anybody reads afterwards.
