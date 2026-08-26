---
source: web
url: https://githubnext.com/posts/knowledge-compressor
title: "Knowledge Compressor"
author: GitHub Next
kind: first-party-practitioner-account (prototype report)
mined_on: 2026-08-26
words: 4649
skill_version: 0.12.0
extracted: 10
picked: 6
accepted: 3
already_covered: 0
declined: 0
leads: 2
untriaged: 4
dispatched: 0
---

# Knowledge Compressor, 2026-08-26 - the source's method, corrected, turned on this corpus

A **first-party practitioner account**: the team that built a prototype reporting
what it does and what it cost. Authoritative for what they built and measured;
weak for generality - one synthetic article, one model, one genre. The article
asks whether documentation can be compressed for language-model readers, answers
yes at roughly 50%, and describes the loop it used.

The run's shape is unusual and worth recording: **the source's method was landed
as two techniques, both of which say the method as published is unsound**, and
then the corrected method was built and run against this registry. The result
was negative, which is the finding.

## Cross-run convergence (the reason two rows landed above technique level)

The 2026-08-22 skills-release run landed `house-vocabulary-layer` reasoning that
a length instruction "cannot know what mattered" and that vocabulary use is
*checkable* where "was this concise?" is a judgment. This source reaches the same
root from the opposite side: it refuses to ask the model whether the compressed
document is still good ("there's a good chance they'll just make something up")
and tests it behaviourally instead.

Two independent sources, two runs, one root: **compression cannot be requested or
self-assessed, only checked against something objective.**

## Law lead - banked, not written

> A green result is evidence only where red was reachable.

Four sightings, three subjects, two runs: `negative-control-tests` (test-harness,
break the system to prove the test fires), `retrieval-evaluation`'s lane ablation
(turn a lane off to prove it earns its seat), and both techniques landed today.
`failure-not-empty-success` covers how failure is *spelled*; `gate-sees-target`
covers proxies. Neither covers *reachability*, which is the shared root.

**Return condition:** a fifth sighting in a bundle other than
`software-engineering`. Three of the four current sightings are in one bundle,
which is exactly the shape that looks like a law and is actually a house habit.

## Accepted

| # | Finding | Shape | Landed | Corroboration |
| --- | --- | --- | --- | --- |
| 1+5 | Screen eval questions against the model's unaided answer | technique | `eval-harness/techniques/unaided-baseline-screening.md` + golden path section "A pass is evidence only where a failure was reachable" | Training-data convergence (closed-book baselines are standard QA-benchmark construction) plus **corpus-internal convergence**: the same move already exists twice here, in other subjects, against other unknowns. No fetch. |
| 2 | Require a failure before accepting a reduction | technique | `eval-harness/techniques/overshoot-and-restore.md` + same golden-path section | Training-data convergence with delta-debugging/ddmin, whose 1-minimality is exactly "you must observe a failure to know you are at the bound". No fetch. |
| 3+4 | The recurring bill is a second constraint; the break-even is in inclusions | amendment | `prompt-assembly/techniques/context-budgeting.md`, new section "The ceiling is one constraint; the recurring bill is the other" | The source's own measurement ($2 to halve 996 tokens, ~2,000 uncached inclusions to repay), sharpened against `model-routing/cache-continuity`, whose vendor-sourced multipliers were banked on 2026-08-25. No fetch. |

**Fetch budget: 3. Spent: 0.** Everything corroborated from the corpus itself or
from convergence. Recording this because it is the first run in the series to
spend nothing and still land at technique level - the untriaged tables and prior
runs' banked derivations are what made it free.

### Where the source was corrected rather than followed

The article's loop, as published, has two holes the corpus can see:

1. It extracts questions from the article and filters those that "can't be
   answered" from the original - but never filters those the model can answer
   **without** the original. The article names the problem in passing ("a model
   might nonetheless respond using its built-in world knowledge") and mitigates
   it with an instruction rather than a control, calling that "helpful, though
   incomplete". It is not incomplete, it is not a control: a request is not a
   measurement. The correction is the technique.
2. Its guard against a timid agent - require one test to fail - is right, and it
   is only sound *after* (1). Run in the other order, the loop can delete
   everything and stay green, because the model knew the answers anyway. That
   composition rule is stated in both techniques and in the lane doc, because it
   is the specific way this method destroys content while reporting success.

The source is stronger for being wrong here: it located a real gap in this
corpus's eval subject and stated the filter backwards, which is the same shape
as the 2026-08-21 precision-tier correction. That is now twice.

## Executed - the compression lane

The operator picked the XL row and asked for it built, not specified. Both
halves shipped:

- `docs/compression-lane.md` - the spec, and now the measured result.
- `scripts/compression-scan.mjs` - deterministic half. Ranks every document by
  re-billed tokens (exposure tier x inbound links) lifted by provable
  repetition. Self-tests before reporting; exits 2 when broken.
- `docs/compression-brief.md` - judgment half. The two-phase protocol, in the
  mandatory order.

**Result, and it is negative.** Mean measurable repetition across ~3,350
documents: **0.94%**. Nothing above 25%; six documents above 10%. The
highest-scoring entry document (`structured-output`, ~4,400 tokens) tested at
roughly **two-thirds irreducible** under a real Phase 1 screen - twelve blind
predictions, four right, four partial, four wrong, and the document's spine
(syntactic tolerance high, semantic strictness total) predicted backwards.

The prototype halved its evaluation article; that article was **synthetic and
written with the redundant texture of ordinary documentation**, which the
article discloses in a footnote. This corpus does not have that texture, so the
headline does not transfer. The lane's standing default is: run the scan, do not
run the compression.

**The instrument caught its own defect on first read.** Overlapping shingles
were counted as separate repetitions, reporting 74.3% on one document where the
truth was 15.1%. Found by reading the output rather than trusting it; the
self-test now asserts the merge. Worth recording because the naive number would
have licensed exactly the destructive pass the lane exists to prevent - the
instrument nearly authorized its own worst outcome on run one.

## Untriaged (extracted, reached the table, never picked - nobody verified these)

| # | Candidate | Anchor | Why it is here |
| --- | --- | --- | --- |
| 6 | Test behaviour; never ask the model to self-assess perceptible loss | "there's a good chance they'll just make something up" | Marked likely-catch at triage; `eval-harness/assertion-vs-judgment` appears to cover the assert-vs-judge boundary, though not this exact framing. Not verified. |
| 7 | Each test question runs in a fresh context window | "each in a fresh context window" | Marked likely-catch; `test-harness/isolation-lanes` is the presumed home. Not verified. |
| 8 | Typical technical documentation halves without substantial fidelity loss | "cut from 996 tokens to 480" | Landed as a citation inside the context-budgeting amendment, not as a claim of its own. n=1, synthetic, one model. |
| 11 | The compression agent's tool loadout (read source, count tokens, apply diffs, run tests) | "tools for reading the original content, counting tokens, applying diffs, and running test questions" | Thin. Recorded in case a second source describes the same loadout - two sightings would make it a shape rather than an anecdote. |

## Leads (with return conditions)

- **Genre-dependent compressibility.** The article's own open question: "How well
  do different types of source content compress? Do different genres benefit
  from different compression strategies?" This corpus is one genre and measured
  at ~1% redundancy. **Return when** a second corpus of a different genre is
  scanned by `compression-scan` - the instrument now exists, so the comparison
  costs one command.
- **The always-on lane as the real target.** The scan's exposure model says
  `rules/*.md` and `_laws.md` are the most expensive tokens in the fleet
  (~14.5k tokens billed every session, and `software-engineering/_laws.md` has
  2,086 inbound links). All measured at 0% repetition today. **Return when** the
  always-on lane grows past ~25k tokens, or when a law file's repetition
  crosses 10% - either would mean the cheap default stopped being right.

## Notes on the source class

Second observation of **first-party practitioner account**, and the row holds:
authoritative about what they built, unreliable about what generalizes. Both of
this run's technique-level findings came from the *stated failure modes* of
their own loop ("one risk with this agentic process is that the agent might play
it safe"), not from its features - the same pattern the release-walkthrough
sub-class showed. **A practitioner describing what nearly went wrong is worth
more than the same practitioner describing what works**, and that now has two
sightings across two runs.

New this run: a first-party account whose *method* is the finding rather than
its result. The measured 50% did not transfer and was never going to; the loop
did, once corrected. Mine this class for **procedure**, and treat its headline
number as an artifact of its test material until something replicates it.
