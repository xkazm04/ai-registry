---
layer: application
type: application
subject: voice-interview-fidelity
technique: language-choice-and-per-turn-drift-detection
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# Language as configuration, and a per-turn lock verdict that blames the interviewer

The technique has two halves, a language set in the recogniser's configuration and a
per-turn drift verdict. kp has both, in TypeScript, and the tree's own comments give
the field evidence the technique was missing. Read at kp `60aab8088` on 2026-09-29.
This subject had no application for this technique before.

## Configuration first

- **ElevenLabs.** `app/_components/voice/transport/elevenlabs.ts:172` sends
  `agent.language` as a session override whenever there is a concrete hint. The
  comment above it records why: the agent's dashboard default is Czech, "the prompt's
  'follow the candidate's language' rule loses to that config over voice (the
  voice-harness caught the agent replying in Czech to an English candidate ~2/3 of
  the time)".
- **OpenAI.** `app/_lib/voice/openai.ts:207` sets input-audio transcription
  `language` from the candidate's locale, through `normalizeTranscriptionLanguage`
  (`:143`), which accepts only a well-formed two-letter primary subtag and otherwise
  omits the field so the model auto-detects. Its comment (`:173`) records the same
  finding: "prompt-level language locks lose to transport config, so Czech speech was
  transcribing against an English default".
- **The pin used to be wrong for most locales.** `portalLanguageHint`
  (`app/_components/voice/ui-types.ts:22`) had been `locale === "cs" ? "cs" : "en"`,
  which pinned English into both transport settings for a German or French
  applicant reading a German or French portal. It now passes every shipped locale
  and falls back to `"auto"` rather than a wrong guess. That is the technique's step 7
  failing in the other direction: the language reached the speech config and was
  the wrong one, for everyone outside two locales.

## Per-turn verdict

`detectLanguageLock` (`app/_lib/voice/language-lock.ts:59`) returns `locked`,
`drifted` or `indeterminate` over the persisted transcript. The opening interviewer
turn is exempt; a turn with markers of both languages is `null` and cannot raise a
flag; a drift needs the candidate to have established a language first; and a
transcript in which the candidate never produced a confident turn is
`indeterminate`, not `locked`. The rule, the exemption and the third state are the
technique's, and it is a TypeScript port pinned to the offline Python check by a
shared-fixture test on both sides. The verdict is stamped into interview telemetry
(`app/_lib/interview-telemetry.ts:166`) and worded for the recruiter as whether the
*interviewer* "stayed in the candidate's language" or "drifted mid-call": a defect
report on the system's own turns.

## Confirmed, deviating

- **Confirmed** — language pinned in transport configuration on both providers, the
  exempt opener, per-turn scoring, the indeterminate state at both levels, and the
  finding attributed to the interviewer.
- **Confirmed, with a measured cost of not doing it** — about two in three
  interviewer turns in the wrong language when only the prompt held the lock (the
  tree's own harness comment, one scenario).
- **Deviation** — the markers cover Czech and English only (`language-lock.ts:33`),
  while the portal now passes every shipped locale to the transport. For a German or
  French interview the verdict is `indeterminate` at best, so the detector reports
  nothing exactly where the pin was fixed. The technique's "report indeterminate"
  rule makes that honest, and it is still a blind spot.
- **Deviation** — the verdict is descriptive, not a gate. A drifted call is not
  routed to the low-fidelity remedy, though the technique says more than a small
  fraction of drifted turns makes the whole transcript suspect.
- **Not checked** — whether a recruiter surface shows the verdict next to the
  candidate's name in a way that could read as a candidate attribute; the wording
  points at the interviewer.
