---
subject: on-stream-persona-continuity
domain: media-generation
last_touched: 2026-10-21
dry_streak: 0
---

# on-stream-persona-continuity

First note. The subject was forged on 2026-10-19 from shadowrunr (kiro/overlord) with
six techniques and two applications. It had never been swept. A Curator dispatch
ranked it on "never swept by the librarian".

## State

7 techniques (one new this pass), 3 applications (`process` tone tournament and `rust`
owner brief at shadowrunr 4025231; `rust` per-turn anchor at 829eb0a).

## 2026-10-21 - deepen (ospc-deepen-1021)

Landed in eb0a0c45. Two lanes: counter-evidence on the web, and a blind training-data
lane. The consumer tree was a third instrument. It had moved 288 commits past the cited
sha and shipped a line bank, a worn-out list and a Tone Lab on the same day. All
load-bearing quotes were re-read verbatim from the arXiv abstracts, the Li et al. HTML
and Kotaku, not from a summarizer.

- **New technique per-turn-persona-anchor.** Three lanes converged. Li et al. 2024
  (arXiv 2402.10962) report "a significant instruction drift within eight rounds of
  conversations" with the system prompt present, attributed to "attention decay over
  long exchanges". Their repetition baseline injects the prompt "before each user
  utterance" and "excels in regions with a larger number of turns". Leins et al. 2026
  (arXiv 2609.24532): "reinjection reduced the modeled rate of LLM-rated drift by
  35--38%", "None eliminated drift", and no gain from adaptive timing. The blind lane
  ranked re-anchoring and situation-rotated exemplars among its top practices. The
  field instance is shadowrunr's voice section.
- **Refuted: same bytes give identity.** The golden path and byte-stable-persona-prefix
  listed identity as the prefix's first payoff ("drift can only come from the lower
  layers"). Corrected to identity of input. The prefix adds no drift of its own, and
  it does not stop drift.
- **Feeding the window back is a hypothesis.** Xu et al. 2022 (arXiv 2206.02369):
  "the more times a sentence is repeated in the context, the higher the probability of
  continuing to generate that sentence". The web lane also cited a finding that naming
  a topic primes it under a do-not instruction, and vendor guidance to say what to do
  rather than what not to do. The blind lane reached the same conclusion with medium
  confidence. The technique now asks for a positive or abstract form, measured as an
  arm.
- **Precedence in text is necessary, not sufficient.** Control Illusion (arXiv
  2502.15851): "system/user prompt separation fails to establish a reliable
  instruction hierarchy", and social-authority framings outweigh role markers. Wallace
  et al. 2024 (arXiv 2404.13208) needed training to get the hierarchy. Both lanes agree
  with high confidence. Conditions were added to the golden path, immutable-core,
  owner-brief (a pre-stream deterministic directive check) and cited-memory (the
  code-side scope filter is what holds).
- **Outage case de-causalized.** Kotaku confirms the recast ("essentially recast the
  entire show"), a peak of "nearly 20,000 simultaneous viewers" and "some 2,600"
  after the return. No source separates the recast from a month off air and spent
  novelty, so the golden path no longer says the show "did not survive the recast".
- **Applications re-checked.** 46 of 46 anchors held at 4025231 under `--strict`.
  `verified_on` moved to 2026-10-21 on both. At consumer HEAD, 3 anchors of the
  owner-brief application are absent (the compose.rs header was rewritten when
  directions were added), so the next refresh re-cites against a new sha.
- **Verified untouched:** prompt caching keys on a byte-identical prefix and helps
  time-to-first-token (Anthropic and OpenAI caching docs, read by the web lane). A
  per-turn value above the cache point breaks it. The empty-section rule, the tone
  bet sheet, tombstones and the signature budget had no counter-evidence. The blind
  lane converged on all six original techniques.

## Impact

- shadowrunr (kiro/overlord): 2 contexts join (`brain-composition-memory` 608.3,
  `character-package` 402.4). Both are state unknown and none is judged, so there are
  0 stale verdicts and no `/conform --stale` queue. The regenerated map was committed
  by a sibling curator round as 8515b9f, two seconds after this run wrote it.
- Maps for gravitone-gcloud (5b883084) and systedo-case (522ae7dc) were regenerated
  and committed locally on their active branches, not pushed. Neither joins this
  subject.

## Open leads

- **The anchor's own measurement.** No in-character rate by stream minute exists in
  the consumer. Return: a paired run, voice section present and absent, n stated.
- **Quoted versus abstract worn-out list.** The consumer quotes tics verbatim. Return:
  a three-arm run (none, quoted, abstract) on guard fire rate and tic share.
- **Owner directions in the prefix.** The Tone Lab's `directions.md` composes between
  tone and bible, unfenced, with no subordination line. That deviates from
  immutable-core step 2 and from owner-brief's rule for standing directives. Return:
  the next touch of the directions path. That run is also when the owner-brief
  application is re-cited at a new sha.
- **Behaviour-specific instruction (87%).** In Leins et al. this beat reinjection by a
  wide margin, but the study measured simulated student personas, and it needs a
  monitor. Return: a project that measures drift per behaviour.
- **"Assistant axis" (Lu et al. 2026).** Seen only in a search snippet and the blind
  lane (low confidence). It might source the golden path's "polite, agreeable mean"
  mechanism, which no opened page states. Return: a raw read of the paper.
