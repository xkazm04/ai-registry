---
layer: application
type: application
subject: brand-voice-capture
technique: voice-profile-dimensions
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Voice profile dimensions - the twin's injection gate and its trained badge

The Czech-first adtech workspace (`systedo-case`, commit `8d91046f` on the
branch `cur/n160-voice-floor`, 2026-10-14) stores a per-scope voice with
directives, traits, a length hint, always/never constraints and examples, and
renders it through one shared function appended to the user prompt. Most of the
technique was already met: per-scope storage with a generic fallback, a single
rendering function with per-field caps (eight traits, twelve rules per list),
the voice server-resolved and kept out of the system prompt and schema, and a
demo-only sample that never speaks for a tenant.

## The seam: "untrained" meant "empty", not "too short to instruct"

The seam was chosen to falsify "the profile is already validated". The
injection gate and the trained badge each tested only that the directives were
non-empty after trimming, so a saved voice of one word (`Vykej.`) injected as a
trained voice, counted as trained in readiness, and was rendered under the
heading that tells the model to "write exactly like this". The technique's rule
is that directives shorter than a sentence or two are an untrained profile.

## A and B

- **A (before):** a tenant voice with the one-word directive injects; the new
  test against the old gate fails (5 of 6 pass in the file).
- **B (after):** one shared predicate (twenty characters, below the
  technique's forty-character convention so a short saved Czech voice is not
  silently dropped) now governs the injection gate, `voiceTrainedAt` and
  therefore readiness and the badge. The one-word voice injects nothing; a
  two-sentence voice still does.
- **Target:** tone-word-only voices injected, A 1, B 0.
- **Floor:** 4175 unit tests pass after B; the three failures are unrelated
  (an install-mode packaging test, a docs-loop test, a CI-job-scope test) and
  tsc and eslint are clean. Four fixtures with directives under twenty
  characters had to be lengthened, which is itself the size of the behaviour
  change for a tenant who saved a very short voice.

## Not measured

How many stored tenant voices fall under the floor (no production store on
this machine), and whether the voice editor should warn when the directives
are too short to be saved as trained; the editor still accepts them silently.
The project's `main` push gate was red for an unrelated reason (a source-file
context-map baseline, 160 against 159, from files this change did not add), so
the commit sits on a named branch.
