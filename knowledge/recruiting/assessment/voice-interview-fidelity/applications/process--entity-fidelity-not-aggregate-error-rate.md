---
layer: application
type: application
subject: voice-interview-fidelity
technique: entity-fidelity-not-aggregate-error-rate
stack: process
status: forged
verified_on: 2026-08-20
---

# Entity fidelity in the voice evaluation harness

The realization is a Python evaluation harness that drives real spoken sessions
against the running app, plus the incident that forced it into existence.

## The incident that made the case

`docs/development/voice-interview-testing.md:518` — "The finding that justifies
the whole plane". A Czech-language session **passed every gate** and still
corrupted the interview:

```
said : … hlavně s Pythonem a Reactem, k tomu PostgreSQL a Docker
heard: … hlavně s Pythonem a Rustem,  k tomu později SQL a Docker
```

React → Rust, PostgreSQL → "později SQL". The agent then echoed the mishearing
back ("jak jste využíval Python a **Rust**"), and that corrupted text is what
`/complete` stores and the scorecard scores. The doc's own conclusion: "The
candidate would be rated on a fabricated skill set."

Aggregate word error rate on that session was **8.33 %**, comfortably inside the
harness's 35 % budget. The doc draws exactly the standard's conclusion — "one
substituted technology noun is *low WER, high semantic damage*" — and specifies
the replacement: an error rate restricted to the terms the scorecard depends on,
with a much tighter budget, plus a check that no domain term the candidate spoke
vanished.

## The metric

`pipeline/jobfit/eval/voice/wer.py:110` — `entity_fidelity(reference, hypothesis)`
returns recall over spoken domain terms plus the explicit `missing` tuple, and its
`ok` property is `not self.missing`: **a zero budget on deletions**, exactly the
posture the technique recommends starting from. `voice_checks` fails any session
with a missing term.

Two matching details in the same file are the difference between a working metric
and noise, and both match the technique's procedure:

- `TECH_TERMS` is prefix-matched with `_MAX_INFLECTION = 3`, so Czech case endings
  resolve (`Reactem` → `react`, `Dockeru` → `docker`) — morphology, not strings.
- `_TERMS_BY_LEN` sorts longest-first so `javascript` is not swallowed by `java`,
  and the comment records that short ambiguous names (`go`, `c`, `r`) are
  deliberately excluded to avoid false positives on ordinary speech.

Replayed offline against the exact V1 corruption (`voice-interview-testing.md`
§9.9): aggregate WER 12.5 % → **WER gate passes**; entity recall 50 %, lost
`{react, postgresql}` → **entity gate fails**. That is the anti-correlation the
technique describes, demonstrated on one real transcript.

## The disparity is visible in the harness's own two sessions

The V1 results table records corpus WER of **2.94 %** on the English scenario
against **8.33 %** on the Czech one — a roughly threefold gap between two
scenarios of comparable length, and the corrupted transcript is the non-English
one. Two sessions prove nothing on their own and the doc does not claim
otherwise, but the direction matches the published disparity evidence, and it is
the reason the fidelity measurement must be stratified by interview language
rather than pooled.

## Confirmed, deviating, and absent

- **Confirmed** — the lexicon exists as an extensible shared vocabulary; the
  deletion check is separate from the substitution rate; both figures are reported
  per session and pooled per corpus (`corpus_entity_fidelity`).
- **Confirmed** — recognition keyword biasing is a real deploy-time artifact:
  `scripts/setup-eleven-agent.mjs:70` threads a ~55-term `ASR_KEYWORDS` list into
  the agent configuration, with a comment tying it directly to the React → Rust
  incident.
- **Deviation** — that bias is **static and agent-level**. The comment states the
  reason (per-session keywords are not reachable through the browser SDK's
  override type) and the cost: it helps vocabulary and segmentation cases more
  than true homophones, and "a per-job list would be stronger but needs a non-SDK
  path". The standard stays at per-role: the job's own required skills are the
  lexicon that should prime the recogniser, and the doc itself proposes exactly
  that at the connect boundary.
- **Deviation** — fidelity is not yet stratified by candidate population. The
  per-scenario figures exist; the per-language, per-locale reporting that turns
  them into a fairness control does not.
- **Absent** — there is no fidelity floor wired to a candidate-facing remedy. A
  failing session fails a harness check, not a hiring decision. The obligation to
  offer a non-voice path automatically, without the candidate having to ask, is
  unimplemented.
