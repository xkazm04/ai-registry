---
layer: application
type: application
subject: test-harness
technique: negative-control-tests
stack: rust
verified_on: 2026-08-24
verified_against: rust@1.96
---

# `adversarial_mutations_…` — a negative control that ships with the scorer

In `pumper`, a local-first scraping service, the golden-fixture eval over the
model tier of the fetcher carries its own negative control **as a checked-in
sibling test** rather than as a procedure someone once ran. The eval is
`crates/core/tests/eval_tier3_extraction.rs`; the control is
`adversarial_mutations_score_below_the_recording_not_the_same`
(`:530-603`). Both are plain `#[test]`/`#[tokio::test]` functions with no
`#[ignore]`, so they run inside `cargo test --workspace`
(`.github/workflows/ci.yml:51`) on every push.

## What is under control here is an instrument, not a production guard

The technique's usual subject is a protection in the production path. Here the
subject is the **scorer** — `score_extraction` at `:314-335`, a deterministic
weighted judge (term coverage 0.55, commentary-free 0.20, chrome-free 0.10,
length-in-band 0.15) with no model anywhere in the accept path. Each case is
ratcheted against the score measured at recording time
(`evals/tier3-extraction/manifest.json:19-28`, plus a `baseline_score` per
case), and the eval fails any case that falls below it (`:486-501`).

That ratchet is worth exactly what the scorer's ability to say *worse* is worth,
which is what the control establishes. The module doc states the dependency
plainly: "the scorer is validated by the adversarial cases, so a re-record that
scores below baseline is a real regression signal rather than an opinion"
(`:54-60`).

## Five mutations, each chosen so the pipeline cannot absorb it

The control loops over all ten cases (`:534-603`) and applies five coarse
mutations to each recorded answer — the technique's rule that a mutation must be
one the system has no way to normalize:

- **Truncated to 1%** of the answer (`:543-552`) — the classic silent regression
  of a model extraction tier.
- **Prefaced with commentary** (`:554-561`) — asserted to trip
  `commentary_preamble` specifically, not merely to lower the total.
- **A refusal string** (`:569-580`) — asserted below an absolute 0.4, not merely
  below the recording.
- **Chrome re-attached** at both ends (`:582-589`) — asserted to trip
  `surviving_chrome` *and* to cost score.
- **Empty** (`:591-598`) — again against the absolute 0.4 floor.

Each assertion names the signal it expects, so a mutation that lowers the total
by accident (through some other weight) does not certify the detector that was
supposed to catch it. The two absolute floors matter for the same reason: a
scorer that ranked a refusal below a good answer while still handing it 0.7
would pass a relative check and be useless as a gate.

## The recording is not curated, and the control absorbs that

One case's recording opens with a commentary preamble — a genuine
prompt-adherence miss, kept and scored as one
(`evals/tier3-extraction/manifest.json:17`, "nothing was re-rolled for a better
score"). The preamble mutation therefore cannot make that case worse, and the
control guards the assertion behind `if base.preamble.is_none()`
(`:562-567`) with a comment naming the case. This is the honest shape: the
control is weakened for one case by a fact about the corpus, and the weakening
is visible in the source instead of being avoided by re-rolling the fixture.

## Two more controls, aimed at the other two ways this eval could lie

The scorer is not the only instrument here, and the file gates the other two:

- **The ground truth is checked against the page, not asserted.** Every
  `must_include` term must occur in the frozen HTML or the eval fails *on the
  fixture* (`:404-411`) — checked against the raw HTML rather than the derived
  Markdown, because the free-path converter legitimately drops whole regions
  (`:399-403`). Three invented terms were caught this way while the corpus was
  built (`:28-30`).
- **The replay harness must not absorb a changed prompt.**
  `a_changed_tier3_prompt_fails_the_eval_not_passes_silently` (`:605-632`)
  drives the fetcher with a prompt that no longer names the target page and
  asserts a typed replay failure with a message containing "no recorded
  transcript" — the mutation is applied to the production request, and both the
  failure *and its message* are asserted, per the technique's step 3.

## What the standing form buys over the one-off

The technique's step 4 is "restore and record" — a comment naming the mutation
that proved the test. Pumper does not restore: the mutations are permanent test
data, so the proof re-runs on every CI pass rather than aging into a claim about
a file that has since changed. That converts the control from a dated assertion
into a live one, and it is cheap precisely because the subject is a pure
function — `score_extraction` takes three strings and returns a struct, so
mutating its input costs nothing and needs no fixture teardown
([creation-names-reaper](../../../../_laws.md#creation-names-reaper) never
engages).

The honest ceiling, stated in the file itself (`:54-60`): with replayed
transcripts this grades the pipeline and the scorer, not today's live model. The
control certifies the instrument; it does not certify the extraction tier.

The same eval is an equally good realization of the eval-harness subject's
assertion-vs-judgment technique — everything gradeable is asserted (schema,
trace verdict, character counts, cost reaching the ledger, `:434-484`) and the
one residual quality question is answered by a deterministic weighted scorer
rather than by a judge — and the two documents describe the same file from
opposite ends.
