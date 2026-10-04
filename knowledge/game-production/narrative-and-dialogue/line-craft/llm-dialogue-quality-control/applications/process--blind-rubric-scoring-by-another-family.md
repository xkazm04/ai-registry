---
layer: application
type: application
subject: llm-dialogue-quality-control
technique: blind-rubric-scoring-by-another-family
stack: process
status: forged
verified_on: 2026-10-04
---

# Death Ride's blind comparison protocol and revision protocol, read against blind scoring

This application reconciles blind rubric scoring by another family, and the revision loop it
feeds, against the dialogue research for Death Ride, an arcade combat racer for a
television-class device, in the `firetv-deathride` tree at `C:\Users\kazda\kiro\firetv-deathride`.
The research sets out a blind comparison protocol (section B5), a ten-dimension rubric (C1) and
an eleven-step revision protocol (C5). None of it is implemented: no judge prompt, rubric file or
score record exists in the game folder, so this is a reading of a design on paper. Nobody has
played the game, and nothing here shows that a line chosen this way works in play.

Anchors are root-relative to that tree.

## Sources the dossier stands on

Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"
(https://arxiv.org/pdf/2306.05685); Chen et al., "Humans or LLMs as the Judge? A Study on
Judgement Biases", EMNLP 2024 (https://arxiv.org/html/2402.10669v2); Wataoka et al.,
"Self-Preference Bias in LLM-as-a-Judge" (https://arxiv.org/pdf/2410.21819); Chakrabarty, Laban
and Wu, "Can AI writing be salvaged?", CHI 2025 (https://arxiv.org/html/2409.14509); Shaib et al.,
"Measuring AI 'Slop' in Text" (https://arxiv.org/html/2509.19163); Zhang et al., "Verbalized
Sampling" (https://arxiv.org/abs/2510.01171). Web search was unavailable for this pass; the
figures are as the dossier records them.

## Confirmed

**The judge selects for the typical.**
`docs/narrative/research/R3-dialogue-craft.md:294 "self-preference driven by low perplexity [16]"`, and
`docs/narrative/research/R3-dialogue-craft.md:294 "A model judge favours the most typical line"`.
This was the most important upward lesson for the subject: the first draft said a same-family
judge misses genericness; the dossier's source says an unguarded judge prefers it, and the
golden path and the technique now say so.

**Another family.** `docs/narrative/research/R3-dialogue-craft.md:298 "Use a judge from a different model family than the drafter [16]."`

**Position swapping.** `docs/narrative/research/R3-dialogue-craft.md:296 "run each comparison twice with positions swapped, and drop pairs whose verdict flips [15]"`.

**Lengths shown, shorter wins ties.** `docs/narrative/research/R3-dialogue-craft.md:297 "Shorter wins ties."`
The tie rule was an upward lesson; the draft priced length but had no tie-break.

**Reasons cite a dimension and a word.** `docs/narrative/research/R3-dialogue-craft.md:299 "cite a rubric dimension and a specific word"`.

**Anchored levels with floors.** `docs/narrative/research/R3-dialogue-craft.md:322 "with no dimension below 3 and both Voice and Tells at 4 or more"`.
The rubric's ten dimensions replaced the draft's list in the technique, because they were the
better set: freshness that survives a third hearing and tone fit were missing from the draft.

**Attribution as its own step.** `docs/narrative/research/R3-dialogue-craft.md:398 "Lines it can't attribute are dropped."`
An upward lesson: the draft folded voice into scoring; the technique now runs a name-covered
attribution step first.

**A shortlist, a person picks.** `docs/narrative/research/R3-dialogue-craft.md:399 "Keep 3 to 5"` and
`docs/narrative/research/R3-dialogue-craft.md:300 "A human picks from the top three by reading each aloud."`,
resting on `docs/narrative/research/R3-dialogue-craft.md:237 "Models flagged problem spans at 0.46 precision against 0.57 agreement between experts."`

**Bounded, single-target revision.** `docs/narrative/research/R3-dialogue-craft.md:400 "At most two rounds, each fixing only the lowest dimension."`
and `docs/narrative/research/R3-dialogue-craft.md:287 "ask for three fixes to that alone"` —
both upward lessons for the critique technique, as is the human edit profile
(`docs/narrative/research/R3-dialogue-craft.md:288 "74% replacements, 18% deletions and 8% insertions"`).

## Deviations — the dossier falls short of the technique

**Names stripped from the scoring judge, with Voice still scored.**
`docs/narrative/research/R3-dialogue-craft.md:295 "Strip speaker names. The judge sees the line and the slot brief only."`
A judge cannot score voice match without knowing whose voice is the target. C5 resolves this by
moving attribution to its own step (line 398); B5 should say the same, and the scoring judge
should receive the speaker's bible entry.

**Two orderings, no median, no calibration.** Position swapping is the only repeat. There is no
median of several draws, no stated spread for calling ties, and no calibration set of
person-ranked lines that the judge must reproduce before it is trusted on this rubric.

**Scores carry no basis and no binding.** Nothing records the judge's identity and version, the
rubric version, the bible version or a fingerprint of the scored text, so a score cannot be told
apart from a score on an earlier wording.

**A revision need not beat its original.** After revising, the protocol re-runs the filter,
attribution and judging (`docs/narrative/research/R3-dialogue-craft.md:400 "Then re-run steps 4 to 6."`)
but does not judge the revision against the line it replaced, so the polish spiral is bounded by
round count only.

**The pick is not recorded as a person's.** Step 8 is marked for a human, but no record says who
picked, so an automatic pick under deadline would be indistinguishable from a chosen one.

## Death Ride use

When the line is built, record the drafting model's family in every slot record and choose the
judge from a different one; store each score with its dimension, quoted word, judge, rubric
version, bible version and a hash of the line; take three shuffled draws and the median; and
before the first wave, have the owner rank a dozen lines for Marrow and the Mechanic —
some written by a person, some raw generated, some deliberately off-voice — and accept the
judge only if it orders the clear cases the same way. Judge every revision against its original,
blind. The human review points the dossier already lists
(`docs/narrative/research/R3-dialogue-craft.md:307 "Voice bible sign-off,"` through
`docs/narrative/research/R3-dialogue-craft.md:312 "A repetition audit"`) become the four
checkpoints of the critique technique, each recorded with who made the call.
