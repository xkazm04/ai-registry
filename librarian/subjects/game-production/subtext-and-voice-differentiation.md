---
subject: subtext-and-voice-differentiation
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# subtext-and-voice-differentiation

A narrative-and-dialogue subject (line-craft) forged with seven techniques and two `process`
applications. Both applications read Death Ride's 2026-10-04 dialogue research dossier. The
subject had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-svd-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The rank
was real. On 2026-10-06 Death Ride wired its 518-line script into Kotlin (`Script.kt`,
`ScriptDirector.kt`, `ScriptTest.kt`), so a code seam now exists where the applications saw only
a dossier.

Three lanes ran:
- **Field lane** on firetv `deathride/main` at `d9990777`, which read `WRITING-PROCESS.md`,
  `VOICE-BIBLES.md`, `lines.csv`, `Script.kt` and `ScriptTest.kt`. It ran two experiments in a
  detached scratch worktree. Nothing was committed to the game.
- **Counter-evidence web lane.** Verbatim re-checks covered the drama-classification paper (from
  its PDF text), the speaker-verification study (abstract plus Table 1) and the PersonaEval
  abstract.
- **Training-data-only blind lane.**

**Widened: one kotlin application, and one more process application.**
- **`kotlin--voice-bible-per-speaker`** (experiment, better; kotlin@2.0.21, 8 anchors held).
  - The writer's never-says and shared-phrase lint lived in the session scratchpad and never
    reached the repository.
  - Six documented first-build defects were put back into the script as mutants. The shipped
    `ScriptTest` (13 tests) passed all six. A copy-mismatch control turned it red, so it did run.
  - A lint reading `VOICE-BIBLES.md` caught 5 of 6 through shared 4-grams. The sixth, the
    Mechanic's repeated "not you" move, showed only as a diff against 26 baseline repeats.
  - On the clean script it found the writer's 8 shared phrases, which served as the positive
    control.
  - Of the bible's 36 never-says items, 16 carry a literal. Reading the literals out of the prose
    gave 15 hits, and all 15 were false: Ox's "'I' when she can say 'we'" is an illustration,
    not a ban.
  - 93 of 187 lines fall outside their speaker's declared word range, including 12 of 19 key
    picks. Mica's median line is 8 words against a declared 2 to 7.
- **`process--distinguish-by-rhythm-and-refusal`** (experiment, better; 3 anchors held).
  - The writer's covered-name score was 92% from one judge, with a bible that quotes 57 of the
    381 playable voiced lines.
  - The leak-free re-run used 75 lines and four judges, one arm each. Arm A, as written, scored
    59 and 63 of 75. Arm B, with address terms and names masked, scored 55 and 62. Masking changed
    26 lines and cost 2 or 3 of them.
  - That cost sits inside judge noise: the two smaller-model judges disagreed on 13 of the 49
    untouched lines.
  - Relay's per-speaker score ranged from 2 to 4 of 5. Six lines were missed by every judge,
    and one of them is a likely refusal break (Mica boasting) that no lint can see.

**Re-anchored.** The two process applications have 41 anchors at `d9990777`: 40 held and 1 is
unquoted. `verified_on` moved to 2026-10-10.

**Conditioned (no new technique).**
- *distinguish-by-rhythm-and-refusal*: "refusal is the strongest marker" is re-ranked as craft
  opinion. Both research lanes converged on measured attribution leaning on common-word rates,
  address, dialect and topic; the drama study found address and dialect words among the most
  separating features. Costume is measurably distinctive but is not a voice. The blind test
  gains three conditions: a reference with no leaked lines, two or more judges keeping the
  common misses, and masking. The evidence status now carries dialogue-level convergence
  (speaker-verification study) and the model-judge gap (PersonaEval: about 69% against 90.8%).
- *voice-bible-per-speaker*: the single-source law gains two conditions. Literal bans go in a
  parseable row. The check lives in the project suite beside the loader. A new decision rule:
  after judging, run every checkable row against the winners.
- *golden path*: the refusal sentence and the attribution-test sentence are aligned with the
  above, and the consumption paragraph names the parseable row, the suite and the
  post-judging run.

**Verified and left untouched.**
- *subtext-in-few-words*: "few words are the tool rather than the goal". Over 456 blind-scored
  candidates, the brevity-only batch scored lowest (3.60 against 3.69 to 3.75). Two model judges
  were used, from the same family as the writer.
- *voice-bible-per-speaker*: "a generator steers better from positive rows; prohibition lists
  plant phrasing". The web lane found priming measured when a ban names the exact phrase, and
  current reasoning models handling negation well. No head-to-head on dialogue exists, so the
  hedged text stands.

**Not found / declined.**
- No study measures refusal or absence as an attribution feature. The training lane named
  Zeta-style avoidance scores and said they need far more text than a bark.
- Rana 2026, Mann 2025 and Castricato 2024 on forbidden-phrase priming were seen at abstract or
  summary level only, so they are not cited.
- The speaker-verification study's percentages are in a table rather than prose, so only the
  conclusion is cited.

**Impact.** 0 contexts. A dry run of `build-registry-map` shows firetv with no game-production
join, and no project map carries this subject. Return condition: firetv declares game-production,
or Death Ride gets its own manifest.

**Banked leads.**
- The bible-reading lint as a test beside `ScriptTest`, with literal bans moved into their own
  row. Return condition: the owner signs off `VOICE-BIBLES.md`.
- The six lines every judge missed, plus the rhythm rows against the key picks. Return condition:
  the owner's read-aloud pass.
- A cross-family judge for the attribution test. Return condition: a non-Anthropic judge is
  available locally.
- A head-to-head of positive rows against ban lists for dialogue generation. Return condition: a
  project generating dialogue with a model.
