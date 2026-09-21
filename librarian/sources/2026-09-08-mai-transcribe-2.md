---
source: web:microsoft.ai/news/mai-transcribe-2
kind: vendor release announcement
url: https://microsoft.ai/news/mai-transcribe-2-is-the-fastest-most-accurate-and-cheapest-speech-recognition-model-in-the-world
title: "MAI-Transcribe-2 is the fastest, most accurate and cheapest speech recognition model in the world"
author: vendor (first-party release post)
published: 2026-09-03
words: 999 reported / ~600 actual prose (331 KB container, see below)
extracted: 10
accepted: 1
declined: 0
untriaged: 4
already_covered: 2
leads: 3
applied: 1
shipped: 0
dispatched: 0
run_id: stt-mai-t2
siblings: 0
fetches: 0 of 3
rescan_when: a second independent source measures in-sentence language switching or speaker attribution against a stated protocol (promotes leads 1 and 2); or a managed project ingests multi-speaker audio or renders word-level timing; or 8 weeks elapse (2026-11-03)
---

# MAI-Transcribe-2 release announcement

Operator framing, which changed the run's economics before it started: *note
findings for STT proficiency; advise whether to challenge current tooling and
benchmark local open-source alternatives ourselves; for cloud paid services note
but do not test or compare.* That instruction removes the source's own subject
from the apply lane by construction — it is a hosted paid service — and points
the run at the **selection method** rather than at the model.

## Container check (Phase 2)

The ingest reported `words: 999` over a 331 KB clean file. The gap is site
chrome plus an **embedded base64 blob** (a data-URI iframe of the supported-
language table), which is the confidently-large container failure the method
warns about rather than the empty one. Actual prose is ~600 words. Extraction
ran against the article body only, with lines over 300 characters dropped to
strip the blob.

## Class and expected yield

**Vendor release announcement** — reliable for its numbers, and the prose is the
strip test's problem. Expected yield stated before triage: **1-3 rows, weighted
to currency and leads; zero techniques from the prose alone.** That held
exactly. The one technique that landed came from the *corpus* and a *connected
tree*, with the source supplying only the occasion and the checklist.

Round 40's declared focus item (3) — *when a source's class is "reliable only
for that the world moved", spend the fetch on the vendor's own surface before
the relays* — was satisfied by construction: this **is** the vendor surface.
0 of 3 fetches spent.

## Triage

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Choose an engine on decisive-term recall, not a published aggregate | voice-io/on-device-vs-cloud (quality axis, no measurement); eval-harness (general contract) | new-technique | **real gap** | 3/1/2 | **accept** |
| 2 | K | currency | S | Hosted STT reference tier moved: $0.10/hr with diarization, word timing, biasing, code-switching, auto-LID, 60 languages | voice-io/on-device-vs-cloud cost + quality axes | resets-clock | real | — | **accept** (governed by the corroboration table, not the score — see below) |
| 3 | K | technique | L | Speaker diarization as a pipeline | none (0 hits corpus-wide) | new-subject | partial | — | **lead** (return condition not fired) |
| 4 | K | technique | M | Word-level timestamps measured against forced alignment | none | new-subject | partial | — | **lead** (banked 2026-09-02, still not fired) |
| 5 | K | technique | M | In-sentence language switching as a measurable axis | none | new-technique | partial | — | folded into row 1 |
| 6 | K | amendment | S | Keyword biasing is now a table-stakes hosted feature | voice-io/decode-time-vocabulary-biasing | none | **likely catch** | — | already covered |
| 7 | K | practice | S | Noise robustness beyond controlled environments | kp tree already implements seeded degradation | none | **likely catch** | — | already covered (fleet ahead) |
| 8 | K | technique | M | One multilingual model vs per-language models (residency/complexity) | serving-process-topology/cache-residency-sets-the-balancing-unit (adjacent) | none | thin | — | untriaged |
| 9 | K | currency | S | Automatic language identification as a shipped default | none | none | thin | — | untriaged |
| 10 | K | lead | S | "Configurable transcription styles" as a first-class knob | transcript-normalization (adjacent) | none | thin | — | untriaged |

**Which rule governs row 2** — this run settles round 40's declared method debt.
Phase 5's score rejects every currency row by construction: a clock reset has
GAIN 1 and can never clear `GAIN - RISK >= 2`. The score is not the governing
rule for that shape. **The corroboration table is**, and it says a source alone
authorizes a currency signal, because "a vendor shipped X" is a statement about
the world rather than about the standard. Rows 2 and 9 were admitted under the
table and never scored. `SKILL.md` should say this in Phase 5 rather than
leaving each run to rediscover it.

## What landed

**New technique** `voice-io/engine-choice-on-decisive-terms` (17th in the
subject). The missing stage: `on-device-vs-cloud` decides *where* an engine
runs and carries a **quality ceiling axis with no measurement**, and its own
re-evaluation trigger ("a better small model ships") cannot fire without one.
Sixteen techniques covered everything downstream of *having* an engine —
pipeline, biasing, normalization, handoff, abstraction, fallback, retirement —
and nothing owned *choosing* one. `eval-harness` owns the general discipline
(one metric optimized, the rest thresholds; discriminating task selection; N
travels with the number) and is linked, same bundle, rather than duplicated.

The technique's core claim, and the reason it is a technique and not an
amendment: a word error rate embeds the assumption that every word costs the
same, so it is dominated by absorbable tokens while the product is decided by
decisive ones — a domain noun, a name, a quantity, a negation. Its closing
section (the selection instrument must be able to reach a second engine) was
written from the negative structural fact in the kp tree, not from the source.

## The corpus-wide check that made the gap credible

- **`diarization`: 0 hits across 4,951 concept documents.**
- **`word error rate`: exactly 1 hit**, and it is an *application* in the
  **recruiting** bundle titled `entity-fidelity-not-aggregate-error-rate` —
  the same rule as row 1, recorded as a dated field observation in a different
  bundle, three weeks earlier.
- `localization/craft/translation-quality-measurement` carries
  `error-typology-over-a-single-score` — the same rule again, as a technique,
  in a third bundle.

Three bundles independently reached "the aggregate scalar hides the error that
decides the product", and **the bundle that owns speech-to-text had none of
it**. Cross-bundle links are forbidden, so the convergence is named in prose
here and the technique was written for software-engineering on its own terms.
That convergence is the `+1` in row 1's GAIN.

## Applied (Phase 7.5)

`experiment` / `ab-paired` / **`better`** — one row, against **kp** (recruiting
+ software-engineering), whose Python voice harness is the only STT evaluation
seam in the fleet.

**Seam chosen to falsify.** kp already implements the metric the technique
argues for, three weeks before the technique existed, so the seam could have
returned "already fleet practice, corpus is behind" — which was the pre-defined
caught outcome and would have taught that the landing's home was wrong. Per
round 40's focus item (2), that outcome was defined before the arm ran.

**Result.** Both arms scored by kp's own `wer.py` over the same three-utterance
reference set (one utterance is the verbatim ground truth and recogniser output
from a live Czech call, stored in the project's own test suite; the second arm
is constructed and labelled as such):

| | aggregate WER | decisive-term recall |
| --- | --- | --- |
| Arm A (real recogniser output) | **0.167** | 0.667 |
| Arm B (constructed complement) | 0.278 | **1.000** |

The metrics **invert** — the aggregate prefers the engine that fabricated two
skills. Sharper: **on the decisive utterance both arms score an identical
0.231**, so the aggregate cannot separate them at all. The finding survived the
falsifying seam in altered form: the metric is fleet practice, and the run's
contribution is the proof that it is load-bearing plus the engine-seam absence.

**The negative structural fact, which is the run's best artifact.** kp's harness
speaks one provider's realtime websocket protocol directly and has no engine
adapter. It holds the right instrument for choosing an engine and **cannot aim
it at a candidate** — an excellent regression instrument and no choice
instrument. Nobody designed that; it fell out of building the harness inside
the integration.

**Two self-corrections during the seam hunt, both flattering to the run and both
caught.** (1) A fleet-wide `git grep -lin` was parsed as `--lin`, returning five
consecutive empties that read as "no STT anywhere in the fleet"; asserting
against a known positive (`wer.py`, cited by the recruiting application) exposed
it. (2) A grep for `from .audio` concluded the seeded degradation probes were
built and unwired; `session_runner.py:24` imports them as `from . import audio`,
and they are fully wired through `make_effect` into the synthesis call. The
second correction **removed a finding** — the tree is ahead of the corpus on
noise robustness — and that is recorded as already-covered row 7 rather than
quietly dropped.

## Ship: 0, with reason

The only project change this run identifies is **an engine adapter seam in kp's
voice harness**, and that is a **direction**, not coverage: it creates a
capability (evaluating alternative recognition engines) that the harness's scope
does not name, and it is precisely the decision the operator asked to be advised
on rather than handed. Per Phase 8's two-lane rule a direction waits for the
owner. No design record exists (this is not a repository source), so the formal
direction pass is `n/a` and the recommendation was delivered in the run's
response instead.

## Leads

- **Speaker diarization as a pipeline.** Zero corpus coverage, now named
  first-class by a second independent source (first: an on-device speech runtime,
  2026-09-02). *Return when a managed project ingests multi-speaker audio* —
  still not fired; kp's interview is two speakers with channel separation by
  construction, since one of them is the product's own synthesis.
- **Word-level timestamps measured against forced alignment**, as a number
  distinct from an error rate. Banked 2026-09-02, re-sighted here as a shipped
  feature. *Return when a managed project renders word-level timing.*
- **One multilingual model versus per-language models** as a residency and
  routing decision rather than an accuracy one. The source asserts it saves
  complexity and GPU utilization and offers no measurement; the adjacent corpus
  material is `serving-process-topology/cache-residency-sets-the-balancing-unit`.
  *Return when a managed project runs more than one recognition model, or when a
  source measures the residency difference.*

## Already covered

- **Keyword biasing.** `decode-time-vocabulary-biasing` landed 2026-09-02 and is
  stronger than the announcement: it carries the two mechanisms' opposite
  failure physics and the gate ordering, where the source has a bullet point.
- **Noise robustness.** kp already applies seeded, deterministic channel
  degradation with the condition recorded on the run. The fleet is ahead of the
  source's claim, and ahead of what the corpus had written down.

## Untriaged (nobody verified these)

Rows 8, 9 and 10 above, plus: the three-way ranking itself — the source claims
first on one public multilingual benchmark, second on another leaderboard, and
"defines the Pareto frontier" on a third framing, all simultaneously and all
plausibly true. That is a clean instance of the technique's central argument
appearing in the source's own self-description, and it is recorded here with its
anchors rather than landed, because one release post is not evidence about how
benchmarks disagree in general.

## The vendor's feature list as a checklist

The most reusable thing the source offers is its capability enumeration read as
axes to score, which is how the technique's fourth section frames it. Against
the fleet's only selection set (kp's):

| Axis | Can kp's set score it? |
| --- | --- |
| Noise tolerance | **yes** — seeded SNR and gain degradation, wired |
| Vocabulary biasing | partial — deployed, but static and agent-level |
| Per-word timing | no |
| Speaker attribution | no — and not needed here |
| In-sentence language switching | **no, and this is the gap that matters** |
| Automatic language detection | no |

The last row is the finding worth carrying: the recorded corruption incident is
a Czech sentence carrying English technology nouns, which *is* the in-sentence
switch case, and because the reference audio is synthesized one language at a
time the set is least able to generate more of exactly the case that already
broke the product once.
