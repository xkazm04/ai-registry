---
subject: image-prompt-composition
domain: media-generation
last_touched: 2026-08-27
dry_streak: 0
---

# image-prompt-composition

First note: [[2026-08-25-awesome-gpt-image-2]] - /intake run 11. Subject predates the notes (forged 2026-08-19).

## State

10 techniques, 2 applications (process, react). Golden path names both architectures (compositor renders text / model renders text) and now points at the technique for the second. Its anatomy table now declares **four** blocks, not three.

## 2026-08-25 - /intake run 11

- New technique `verbatim-text-locking` - the stage the golden path's "it then owns per-character proofreading" sentence implied and nobody owned.
- `prompt-dialect-matching` gained a third dialect class (instruction-following multimodal models: brief-readers, JSON as serialization, no negative channel, state cardinality) and a decision rule; `style-first-token-ordering` gained the brief-reader rule with the aspect-ratio exception kept.
- Two triage reads downgraded from corrects-claim to fills-stage on reading the files: the corpus was right and incomplete, not wrong.

## 2026-08-26 - /intake run 23 ([[2026-08-26-joyai-echo]])

- New technique `identity-split-from-state`, and the golden path's "three blocks, three scopes" enumeration corrected to four. The subject's own completeness claim was the finding: a recurring **subject** has a project-lifetime identity and a per-image state, and the anatomy folded the whole subject into the per-image block.
- The point worth remembering: the restatement law had an unstated precondition that stayed hidden because the constant was always a *style*, and a style has no moods. The precondition only becomes visible when the constant is a character. Look for this shape elsewhere - a rule that is silently relying on a property of the one example it was forged against.
- Second-order rule inside it, which I would not have reached alone: when a language model writes the per-shot prompts, constrain it against **rewording**, not toward consistency. A faithful paraphrase satisfies "keep it consistent" and is a fresh sample.
- Boundary held: `visual-style-locking` was the rival home and lost. It owns carrying a *look*; this owns the block anatomy and stated the enumeration that broke. Recorded on both sides - see [[visual-style-locking]].

## Open leads (banked, with return conditions)

- No application on the text-capable class yet. Return when a connected project (systedo-case is the candidate) generates text-bearing images and can be dated.
- Pass rate of locked text under style pressure is unmeasured anywhere in the fleet; the technique requires recording it - the first project to do so is the application.
- `identity-split-from-state` has no application. Return when a connected project generates a set with a recurring character and the identity blocks can be string-diffed for real - the diff is the measurement and nothing in the fleet has run it.
- "Reserve identity labels for people, never objects" was extracted from the same source and left untriaged; it may belong as a decision rule here rather than as anything of its own.

## 2026-08-27 - /intake run 24 ([[2026-08-27-video-workflow-batch]])

- Two amendments on `identity-split-from-state`. **Persistent state gets promoted to a reference**: state that must hold across takes (soaked, an outfit change, damage) is identity for the span it persists; describing it in text re-samples it per take while the model lets go of the face - author the variant sheet up front, switch at the transition, name the variant instead of describing the state. **The voice is a second identity surface**: the descriptor in the identity block is the text half; the accepted take's extracted audio is the reference half - the two-channel lock at the audio modality, corroborated corpus-internally by the both-channels asymmetry rather than by any fetch.
- The subject's identity row now spans text block, image sheet (via visual-style-locking's amended reference-sheet), state variants and voice. That is four surfaces of one concern; if a fifth arrives (motion signature? gait?), identity may deserve its own subject rather than a row and a scatter of amendments.

## 2026-08-27 - /intake run 25 ([[2026-08-27-video-workflow-batch-2]])

- NEW technique `reference-role-map`: the labeling rule (say what the images are FOR) generalized to heterogeneous multi-reference calls - every attachment one named role in a map at the prompt's head, negative scope where bleed is likely ("controls the style, not the content"), map labels reused in the beats, one card multiplied into a group by language. The anatomy's constraint that the disambiguating half arrives before the ambiguous material now has a third instance (style first, identity first, roles first).
- Run 24's state-promotion amendment widened on a second independent sighting one day later: the rule is about recurrence, not characters - a location the story damages is authored twice (intact + ruined, edited with change-nothing-else).
- Currency: two platforms in this batch bind a VOICE to the character card at creation - run 24's voice-as-second-identity amendment is now a product surface. No content change; the amendment's framing holds.

## 2026-08-27 - /intake run 26 ([[2026-08-27-video-workflow-batch-3]])

- Voice section widened on a second independent sighting: the reference asset can be **extracted from the first accepted take or authored up front in a voice tool** with the animation conditioned on the audio; the rule is the ordering (reference before the second line), not the route. The typed-input law shows up here too - audio conditioning holds the voice channel.
