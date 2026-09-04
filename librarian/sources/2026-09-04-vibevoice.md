---
source: github
kind: research-model release (four systems in one tree; design-dense)
url: https://github.com/microsoft/VibeVoice
title: "VibeVoice: Open-Source Frontier Voice AI"
author: microsoft
commit: 1541f590c7099820f10ea012f48d2399282df69f
words: 1284 landing / ~6,600 in-tree docs across 7 files / ~700 KB Python across 44 files
extracted: 10 design + 5 claim
accepted: 4
declined: 0
leads: 2
already_covered: 5
untriaged: 3
dispatched: 0
applied: 2
shipped: 0
run_id: vibevoice-0904
siblings: 0
rescan_when: the streaming-TTS "streaming text input" TODO ships (it is checked-off-adjacent
  in docs/vibevoice-realtime-0.5b.md and would change the realtime model's whole input
  contract); or the ASR-streaming vLLM path gains data-parallel support, which would mean
  the affinity constraint was solved rather than declared; or the withdrawn TTS code
  returns in any form; or 8 weeks elapse (2026-10-30)
---

# Four systems, ten design decisions, and a corpus that already owned the ground

## Class and expected yield, stated before the table

**Research-model release**, in the class table's sense — open weights plus real
inference code — but the row undersells this tree by a wide margin. What arrived is
**four systems in one repository**: a long-form multi-speaker TTS model (code
withdrawn, see below), a 0.5B realtime streaming TTS, a 7B long-form ASR with
diarization and timestamps, and a streaming ASR — plus a vLLM serving plugin with two
launchers, a LoRA finetuning path, and a browser demo.

Expected yield stated before extraction: **2–4 rows, weighted toward design rather
than claims**, because a research release's README advertises a method and this tree's
README is 1,284 words of badges against ~6,600 words of operating documents and ~700 KB
of unusually well-argued Python. That held: 4 accepted, all four from the design read,
zero from the landing page.

The landing page contributed **nothing** except two currency signals. Phase 2b's rule
paid for itself here more than in any prior repository run — the single densest artifact
in the tree is a module docstring (`vllm_plugin/asr_streaming.py`), and it is not
reachable from the README.

## Routing count (Phase 2d) — met, and the answer is not a forge

**10 load-bearing decisions / 3 systems / 2 unhomed.**

| System | Decisions | `corpus: NONE` |
| --- | --- | --- |
| streaming ASR serving | 6 | 2 |
| preprocessing ↔ evaluation parity | 3 | 0 |
| TTS conditioning + release governance | 2 | 0 |

Neither v2.2 clause fires. No system clears three-unhomed, and the whole-tree
`HOME IF NEW` count is 2 — the CLI/preflight pair (declare-and-refuse a sibling's flag;
order validation before the mutation that strands the input on its correct route),
which share an idea but not a home. **No forge handoff**, and the reason is the good one
the 2026-09-03 microsoft/mcp run named: a high decision count over ground the corpus
already owns is a sign the corpus was right about where the material lives. Eight of ten
decisions homed into four existing subjects across two bundles.

The two unhomed decisions were not banked as leads — one of them (declare-and-refuse)
was **absorbed into row 4's technique** as its closing section, which is what the XL
guidance says to do with fragments rather than scattering them.

## Seam scored at triage, per round 21's declared focus

Focus item (1) asked that the fleet seam be named *before* drafting. It was, and **it
changed the run**:

| Row | Home subject | Fleet contexts | Consequence |
| --- | --- | --- | --- |
| 1 | `streaming-output` | personas 2, personas-web 2, gravitone 2 | applied |
| 2 | `voice-io` | all 11 projects; gravitone 35, systedo-case 29, kp 27 | applied |
| 3 | `deferred-operation-fusion` | **zero, all 11** | `unapplied by construction` |
| 4 | `serving-process-topology` | **zero, all 11** | `unapplied by construction` |

Rows 3 and 4 were landed anyway — both are corroborated by code read in the tree and
both correct a standing corpus claim — but the choice was **deliberate at triage**
instead of discovered at Phase 7.5, which is the whole of what the focus asked for. The
fleet map was **stale** when read (`--check` said so), so the two zeros were re-verified
directly against all eleven projects' own `.ai/registry-map.json`; both held.

## The triage table

Vetoes: none fired. V1 checked first — `llm-agent/runtime-and-io` is at **10/10**
`MAX_CHILD_DIRS`, so a new *subject* there was vetoed before scoring; both landings in
that category are techniques inside existing subjects. `backend-platform/inference-serving`
is at 4/10.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Emit behind the corrector's reach | `streaming-output` | new-technique | real gap | 3/0/2 | **accept** |
| 2 | K | amendment | M | A fourth voice-specification kind | `voice-io/authored-voice-identity` | corrects-claim | real gap | 3/0/2 | **accept** |
| 3 | K | amendment | S | Tolerance before a discrete selector | `deferred-operation-fusion/equivalence-oracle-testing` | corrects-claim | real gap | 3/0/1 | **accept** |
| 4 | K | technique | M | Cache residency sets the balancing unit | `serving-process-topology` | new-technique | real gap | 3/0/2 | **accept** |
| 5 | K | technique | M | Train/serve rounding at the final window | `windowed-inference-over-oversized-inputs` | none? | partial | — | untriaged |
| 6 | K | currency | S | Released TTS code withdrawn for misuse | — | resets-clock | real | — | lead |
| 7 | K | lead | S | Diarization cost visible as a WER↔cpWER gap | — | none | partial | — | lead |
| 8 | X | application | S | Per-worker constant × replica count | `process-count-as-a-formula` | — | likely catch | — | **caught, written into the source-tree application** |

`auto=4/0/0`, `fp=0`.

**On the rewrite penalty, argued because it decided two rows.** Rows 1 and 2 both edit
an enumeration in a mature file — row 1 adds a third arm to "either render checkpoints
or wait", row 2 adds a fourth row to a table introduced as "three specification kinds".
Scored with the `+2` rewrite penalty both land at `+1` and are recorded untriaged. They
were scored as **appends**, on the method's own mechanical test, which gives the example
verbatim: *"A new row beside three true rows is an append."* The prior arms and rows stay
true; what changes is a count word and an implied exhaustiveness that neither file
asserted. Contrast the 2026-09-04 pgmq run, where the corpus said *"There is no fourth
row"* — an explicit closure, and a genuine rewrite. The distinction is whether the
enumeration **claims** completeness, and it is worth carrying: an open list gains an arm
for free, a closed one costs `+2`.

## The four landings

**1 · `streaming-output/emit-behind-the-revision-window` (new technique).**
Found by round 21's **refutation hunt** — see below. The golden path's "when *not* to
stream" list says a non-monotone producer means render checkpoints or wait; `voice-io`
independently reaches the same denial and routes partial transcripts to display-only.
Both remedies answer a question neither asks: **how far back can the revision reach?**
Where the reach is bounded and nameable, a third remedy exists that gives up neither the
live tail nor monotonicity — hold the emission cursor at `frontier − reach`, snap it to a
semantic boundary, and treat what was emitted as **binding on the producer's retry**.
That last clause is the mechanism rather than a delay, and it inverts the subject's usual
posture: everywhere else the live region is the weak tier and the settled record binds;
here the emitted prefix is the strongest thing in the system, because it is the only part
that has already left. Corroborated by code, not prose: the source's client derives its
lag from the detector object's own `window_size` attribute, so the two cannot drift.

**2 · `voice-io/authored-voice-identity` (amendment, fourth kind).**
The technique opens "There are three specification kinds" — selected / described / cloned
— and the source ships a voice that is none of them. Its `.pt` voice files hold
`cached_prompt['lm']['last_hidden_state']`: the model's own conditioning state, downstream
of the encoder. The processor's `__call__` — the entrypoint that would accept raw audio —
**raises NotImplementedError**; only `process_input_with_cached_prompt` exists. So the
technique's central pairing inverts: for described and cloned voices *the specification is
durable and the timbre is volatile*, and here **the timbre is durable and there is no
specification**, which leaves the whole storage rule (specification inputs as the system
of record, rendered sample as a cache keyed by that tuple) with no referent. The kind
buys total reproducibility and a safety property — no code path from a sample to a voice,
so cloning is *absent* rather than gated — and pays in portability that is gone rather
than reduced. The source states the trade itself: "To mitigate deepfake risks **and**
ensure low latency for the first speech chunk, voice prompts are provided in an embedded
format." One artifact substitution, two unrelated constraints, same answer.

**3 · `deferred-operation-fusion/equivalence-oracle-testing` (amendment).**
The technique's rule is that bit equality is the wrong bar and a stated per-mode tolerance
is right. It **stands on the boundary twice without naming it** — nearest mode is held to
exact equality "because there is nothing to accumulate", and a global tolerance is refused
because it would pass "the label image whose fused values were interpolated between
classes". Both are the same fact: a discrete-valued output has no meaningful tolerance.
The general rule is about what *consumes* the array: where a discontinuous selector sits
downstream, no bound on the array's error bounds the error in the result. The source
carries the measured instance — it decodes at the native rate and resamples with one
specific library "which is what the streaming checkpoints were evaluated with", because
"the two resamplers differ by ~1% RMS, and near-tied greedy argmaxes turn that into
different words." 1% RMS passes any sane array tolerance. The amendment moves the
assertion to the last continuous stage before the first discrete one, adds the near-tie
population as the cheap way to know whether you have a safe tolerance at all, and extends
the rule to implementation substitution, which the technique does not otherwise reach.

**4 · `serving-process-topology/cache-residency-sets-the-balancing-unit` (new technique).**
The subject treats replication as a pure capacity term and its own application records the
assumption as a fact — "any API server to route requests to any engine core". The
neighbouring `cross-instance-cache-lease` *does* handle router/cache coupling and its
prescription is to lease per item so the coupling stays **out of** the load balancer.
Neither contemplates the regime where the coupling cannot be dissolved because the cached
state is the client's own growing prefix. The source contains **both regimes in one
repository over one model family**, and the discriminator is one engine flag: the
non-streaming launcher passes `--no-enable-prefix-caching` and therefore balances freely
with `least_conn`; the streaming launcher's product promise *is* the prefix cache and it
refuses `--dp` outright. The technique names the discriminating question (does a request's
cost depend on which replica served its predecessor), the failure shape (a wrong answer,
load-dependent, partial, distributed — never an error), and the topology that follows.
Its closing section absorbs the second unhomed decision: **define the sibling's flag and
refuse it with the reason, rather than omitting it** — the source declares `--dp` in the
parser purely so an operator arriving from the sibling's docs gets an explanation instead
of `unrecognized arguments`.

## Apply: 2 rows, both `not-better`, and both wrote back into the corpus

This is the run's most useful result and it is the same pattern the 2026-09-04
writing-models run recorded: **the fleet was ahead of the corpus on both tested seams.**

**Row 2 → gravitone, `experiment`, `not-better`.** gravitone stores voices as
pre-exported `.safetensors` embeddings — a materialized voice in production, at ~10 MB
each — and already implements the amendment's inverted storage rule, fingerprinting the
artifact's bytes rather than any specification. The A/B tested substituting its
`mtime_ns:size` fingerprint for a content hash across six artifact-delivery scenarios;
arm B was correct on 6/6 against arm A's 4/6 (one stale-audio case, one needless
invalidation). It is still `not-better`, and the measurement is why: the fingerprint is
computed inside the cache **key**, therefore before the cache **lookup**, so a content
hash taxes every request including the hits — **18.369 ms vs 0.005 ms**, a 3,700× increase
on the exact path whose stated purpose is "the difference between an instant demo replay
and another full render", on a CPU-only Arm target. The correct rule is the one the tree
forced: **establish the artifact's identity when it is installed, not when it is used**,
and make the installer responsible for moving the cheap identity. That is now in the
technique.
gravitone also **refuted the amendment's consent paragraph outright**. It was drafted
saying a materialized artifact's provenance evidence is gone; gravitone stores
`clip_sha256` in the consent receipt, stamps it forward onto every rebuilt voice, and has
an explicit one-directional **consent-laundering guard** on pack export. The paragraph was
rewritten around the content hash of the source clip as the field that makes the chain
checkable, with both consequences the project had already built.

**Row 1 → gravitone, `simulation`, `not-better`.** gravitone's conversational path solves
the same problem with a different instrument: `agreed_prefix(partials)` — the prefix two
successive decodes agree on, cut at a word boundary — governed by the rule "a speculation
is invisible until the turn is confirmed", with `continues()` asserting on normalized text
that the final transcript really extends the prefix the speculative work was built on.
Agreement needs **no knowledge of the corrector's reach**, which is exactly the case the
new technique cannot serve. The technique conflated two questions the project separates:
*what may be shown* (needs the guarantee) and *what may be acted on* (a heuristic plus a
gate, because unshown work can be discarded). A whole section was added for it. Return
condition: a seam with a *bounded* reach — gravitone's is unknown, so the cursor mechanism
has no home in this fleet yet.

**Rows 3 and 4: `unapplied by construction`**, named at triage. Neither
`deferred-operation-fusion` nor `serving-process-topology` has a context in any of the
eleven projects, verified per-project. Return condition: when a fleet project grows a
model-serving path or a lazy array pipeline.

**Ship: 0.** Both tested seams came back `not-better` and the honest consequence is that
nothing should be committed to a project tree. The fingerprint change is a measured
regression on a latency-critical path; the streaming change would replace a working
mechanism with one whose precondition the project does not meet.

## Catches — five, and one of them is the corpus predicting a live defect

- **`process-count-as-a-formula` predicted a defect this tree has.** It warns that "a
  shared pool divided by a process count is the correct derivation and a per-process
  constant is the common error". `start_dp_server` computes
  `max(64, VIBEVOICE_FFMPEG_MAX_CONCURRENCY)` and exports it into **each** of N workers,
  under a comment claiming to auto-tune on dp size that reads nothing from dp size. Host
  ceiling is `64 × dp` — 512 processes at the documented `--dp 8`. And because it is a
  `max` rather than a clamp, the knob is **one-directional**: the docs tell operators to
  tune it "based on CPU cores", and a value of 8 is silently restored to 64. Written into
  the source-tree application rather than landed, because the corpus already says it.
- **Startup validation of a model package** is `self-describing-model-packages`, whose
  `use_when` already names "a serving container that must decide at start-up whether it
  can host this model". The source's checkpoint refusal is a textbook instance, not a gap.
- **Runtime geometry read from the checkpoint** — same subject, `config-frozen-artifact`.
- **Windowed inference with overlap and a padded final window** is covered in depth by
  `windowed-inference-over-oversized-inputs`, including the pulled-back last window.
- **Hotwords / context biasing** is `voice-io/decode-time-vocabulary-biasing`.

## Untriaged — three, with causes on round 21's three-way scheme

| Row | Anchor | Cause |
| --- | --- | --- |
| Train/serve rounding at the final window | `asr_streaming.py:split_windows` — training split already-encoded features (`floor`), serving encodes a short segment (`ceil`), so the last window carries an extra frame and no lookahead, "off-distribution exactly where the sequence ends" | **unverified** — `windowed-inference-over-oversized-inputs` covers padding as a *geometry* concern and this is a *distribution* concern; the promoting question needs its six technique files read and the budget went to rows 1–4 |
| The shared-kernel argument for a dependency-free module | `asr_streaming.py` module docstring: three processes need the chunk arithmetic, "a copy in each would be free to drift", and nothing imports the heavy runtime at module level so the lightest consumer can reach it by bare import | **verified-but-unwritten** — real and well-argued, no home found in one map pass |
| Two normalization dialects for sentence ends | `_SENTENCE_END_RE` — a CJK stop mark is unambiguous, an ASCII period needs a whitespace lookahead so "3.5" and "Mr. Smith" do not split a segment | **verified-but-unwritten** — plausibly `localization` or `transcript-normalization`; not mapped |

## Leads

- **A vendor withdrew released model code after discovering misuse, and could not
  withdraw the weights.** README, 2025-09-05: "we have removed the VibeVoice-TTS code from
  this repository"; `docs/vibevoice-tts.md` now reads "Installation and Usage: Disabled due
  to widespread misuse" and the model table says `Disabled` — while the HuggingFace weight
  link stays live. The withdrawal is **partial by construction**: the repository is the only
  surface still under the publisher's control after release. What makes it a lead rather
  than a landing is the second half — the *next* model in the same family answered the same
  force by changing the architecture so the misuse is not expressible (row 2). Return
  condition: a second independent instance of a publisher responding to post-release misuse
  by narrowing a capability's *representation* rather than its *policy*.
- **The diarization cost is legible as a WER↔cpWER gap and varies ~60× across languages.**
  `docs/vibevoice-asr.md` publishes both per language: Vietnamese 14.43 → 14.57 (0.14 pt),
  Portuguese 21.54 → 29.91 (8.37 pt). A joint ASR+diarization model's speaker-attribution
  error is readable as the difference between two of its own published metrics, with no
  extra evaluation. Return condition: a connected project evaluates a transcription engine
  and needs to separate recognition error from attribution error.

## Method notes

- **Round 21's refutation hunt beat the general asymmetry sweep, and the run says how.**
  Focus item (2) asked which of the two competing hunts pays. Row 1 came from the
  refutation hunt in its literal form — the corpus contradicted the source's shape (a
  non-monotone producer *can* be streamed) and the escape clause in the denial was
  unowned. What sharpens it into a rule: **the same denial appeared in two subjects**
  (`streaming-output` states it, `voice-io` cites it), and a denial repeated across
  subjects is a stronger signal than one stated once, because the second site proves the
  first was load-bearing rather than incidental. Rows 2 and 3 came from the enumeration
  hunt ("three specification kinds", "nearest should be exact"), so the two hunts split
  3–1 in the enumeration hunt's favour *by count* and the refutation hunt's favour *by
  depth*. Third sighting for the refutation hunt; by the three-runs rule it is now a rule.
- **A stale fleet map still answered the seam question, but only because it was
  re-verified.** `build-fleet-map.mjs --check` reported stale and the run read the map
  anyway, then confirmed the two load-bearing zeros against all eleven projects' own
  registry maps. The map was not regenerated: `librarian/fleet-map.md` carried an
  uncommitted edit from outside this run.
- **Instrument note: `--check` piped through `tail` swallows its exit code.** The
  `(cmd --check | tail || cmd)` idiom used here never runs the fallback, because the
  pipeline's status is `tail`'s. Same shape as the `grep -L` and `grep -e` entries in
  operator memory — an instrument that reports success for the wrong reason.
- **Board:** 0 siblings for the whole run; `check` clear on all three shared spines. Five
  files were modified in the checkout by something not on the board (an operator hand-edit
  or an unregistered session), including `librarian/applied.md`; they were treated as live
  WIP and the commit staged only this run's own hunk of that file.
- **Fetch budget: 0 of 3.** Every landing corroborated by code read in the source tree, by
  the corpus's own files, or by a fleet project's tree. Eleventh consecutive run where the
  corpus was its own second source.
