---
layer: application
type: application
subject: voice-interview-fidelity
technique: entity-fidelity-not-aggregate-error-rate
stack: process
status: forged
verified_on: 2026-09-29
---

# Entity fidelity in the voice evaluation harness

The realization is a Python evaluation harness that drives real spoken sessions
against the running app, plus the incident that forced it into existence. Re-read at
kp `60aab8088` on 2026-09-29, from the commit.

## The incident that made the case

`docs/development/voice-interview-testing.md:555` — "The finding that justifies the
whole plane" (it moved from about line 518). A Czech-language session **passed every
gate** and still corrupted the interview:

```
said : … hlavně s Pythonem a Reactem, k tomu PostgreSQL a Docker
heard: … hlavně s Pythonem a Rustem,  k tomu později SQL a Docker
```

React → Rust, PostgreSQL → "později SQL". The agent then echoed the mishearing back
("jak jste využíval Python a **Rust**"), and that corrupted text is what `/complete`
stores and the scorecard scores. The doc's own conclusion: "The candidate would be
rated on a fabricated skill set."

Aggregate word error rate on that session was **8.33 %**, inside the harness's 35 %
budget. The doc draws exactly the standard's conclusion — "one substituted technology
noun is *low WER, high semantic damage*" — and specifies the replacement: an error
rate restricted to the terms the scorecard depends on, with a much tighter budget,
plus a check that no domain term the candidate spoke vanished.

## The metric

`pipeline/jobfit/eval/voice/wer.py:242` — `entity_fidelity(reference, hypothesis)`
returns recall over spoken domain terms plus the explicit `missing` tuple; its `ok`
is `not self.missing` (`:238`), a **zero budget on deletions**, the posture the
technique recommends starting from. `voice_checks` (moved to
`pipeline/jobfit/eval/voice/session_runner.py:179`) fails any session with a missing
term. Two matching details are the difference between a working metric and noise, and
both match the technique's procedure:

- `TECH_TERMS` (`:195`) is prefix-matched with `_MAX_INFLECTION = 3` (`:214`), so
  Czech case endings resolve (`Reactem` → `react`, `Dockeru` → `docker`) —
  morphology, not strings.
- `_TERMS_BY_LEN` (`:213`) sorts longest-first so `javascript` is not swallowed by
  `java`, and short ambiguous names (`go`, `c`, `r`) are deliberately excluded.

Replayed against the exact V1 corruption: aggregate WER passes; entity recall 50 %,
lost `{react, postgresql}` → the entity gate fails. The committed fixture
`pipeline/jobfit/eval/voice/fixtures/entity_pairs.json` carries the corruption and
two clean pairs as recorded (said, heard) pairs, so the gate runs without a live
agent; it is new since the first verification.

## The disparity in the harness's own sessions

The V1 results table records corpus WER of **2.94 %** on the English scenario
against **8.33 %** on the Czech one (`voice-interview-testing.md:546`), a roughly
threefold gap between scenarios of comparable length, and the corrupted transcript is
the non-English one. Two sessions prove nothing alone and the doc does not claim
otherwise, but the direction matches the published evidence and is the reason the
measurement must be stratified by interview language.

## Per-job keyword bias is now real, for one provider

The first verification recorded the keyword bias as static and agent-level, with a
per-job list blocked by the browser SDK. That deviation is closed for ElevenLabs.

- `app/_lib/voice/asr-keywords.mjs` builds the list: the job's own terms first, then
  an account-wide floor (`BASE_ASR_KEYWORDS`, `:31`), de-duplicated and capped at 50
  (`ASR_KEYWORD_LIMIT`, `:22`), with each term held to 40 characters, three words and a
  term shape so a free-text requirement ("5+ years of experience with distributed
  systems") cannot spend a slot. The reasoning in the file is that biasing toward
  ordinary words "is worse than not biasing at all".
- `app/_lib/interview-run.ts:743-759` takes `job.requirements[].skill` then
  `job.detectedSkills`; the connect route returns them and the browser sends them as
  `overrides.asr.keywords` (`app/_components/voice/transport/elevenlabs.ts:182`). The
  eval harness forwards the same list (`el_ws.py:81`).
- The OpenAI provider gets none: `provider-traits.ts:51` has `asrKeywords: false`. An
  interview run on that provider has no vocabulary bias at all.

The floor list is where the phantom-terms technique bites. `BASE_ASR_KEYWORDS` holds
both **React** and **Rust**, the swap in the recorded incident, and **Java** beside
**JavaScript**, a pair close in sound and spelling that is not recorded as swapped
here. The account-wide floor is used for a lab session or a job with no
detected skills. Nothing in the tree measures whether boosting both members of a
confusable pair helps or hurts; the null-audio control in
phantom-terms-and-silence-insertions has not been run against it.

## Confirmed, deviating, and absent

- **Confirmed** — the lexicon exists as an extensible shared vocabulary; the deletion
  check is separate from the substitution rate; both figures are reported per session
  and pooled per corpus (`corpus_entity_fidelity`, `:250`). The engine bake-off
  (`voice/bakeoff.py`, new) ranks candidate recognisers on entity recall and uses WER
  only to disqualify, which is this technique's order of precedence applied to a
  vendor choice.
- **Confirmed** — recognition keyword biasing is a per-job deploy-time artifact for
  ElevenLabs, as above.
- **Deviation, new** — the metric is recall only. It cannot see a domain term that was
  written and never spoken: on the recorded corruption it names react and postgresql
  as missing and never reports the `rust` it produced. The phantom-terms application
  runs it.
- **Deviation, still open** — fidelity is not stratified by candidate population. The
  bake-off carries `lang` on each reference utterance (`bakeoff.py:46`) and pools per
  engine; its default set has three utterances, one Czech and two English. The
  committed fixtures are asserted one by one, not stratified.
- **Absent, still open** — there is no fidelity floor wired to a candidate-facing
  remedy. `entity_fidelity` and `voice_checks` are referenced only from
  `pipeline/jobfit/eval/`; nothing in `app` measures fidelity at run time, and there
  is no text alternative offered when a transcript falls short. A failing session
  fails a harness check, not a hiring decision.
