---
subject: image-prompt-composition
domain: media-generation
last_touched: 2026-08-31
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

## 2026-08-28 - /intake run 35 ([[2026-08-28-media-generation-batch-4]])

- `medium-vocabulary-locking` gained **the named-work quality proxy**. The technique owned the impression-word failure ("hyperrealistic", "8K") and its drift toward the over-sharpened synthetic register. This is the failure that looks like the *cure* for it, because it is specific where those were vague: naming a celebrated production to set the fidelity bar. A caption-trained model has no channel separating a title's production values from its content, so the admired work's designs arrive alongside its render quality.
- **What makes it durable is that it half-works.** The render quality genuinely improves, so the prompt appears to have succeeded and the design problem is found later by whoever recognises the source. Rewording does not clear it - the source tried twice for "something different at that fidelity" and got the same lineage with the hue rotated, because the request still contained the attractor. The exposure is not "did I name a work" but "did I name a work known for *this kind of subject*": the effect is strongest exactly where the subject class overlaps the work's signature subject, and negligible elsewhere.
- Landed as a three-step split: production values into the medium kit in this technique's own vocabulary; the subject designed against the attractor **feature by feature with named inversions** (not "different", which moves toward the training mean); the attractor's signature features into the exclusions beside the style's opposites. The closing line is the one that earns its place in a vocabulary technique: **a proper noun is a content token wearing a quality adjective's clothes** - the one impression word that gets more dangerous the more precisely it is chosen.
- Untriaged from the same batch, with anchors: **constraint is conserved** - pinning slots redistributes the model's freedom into the unpinned ones rather than removing it, and forfeits the engine's own direction. Two independent voices give *opposite* advice on in-prompt timestamps (one gets four controlled cuts, the other calls it a cage that costs top-tier results), so the discriminator is already drawn for whoever picks it up.

## 2026-08-31 - /intake run 28 ([[2026-08-31-3d-documentary-ai]])

- `reference-role-map` gained **the seam between two references belongs to neither.** The map's step 3 forbids the beats from re-describing a mapped asset, and its decision rules name re-description as where drift re-enters a well-mapped call. A tutorial source re-describes on every composite - but only the *interaction*, never the attributes: "light them with something that's already in that room and they'll actually look like they're standing in it."
- **The corpus supplied its own mechanism, from the subject next door, at zero fetch cost.** `character-identity-continuity/reference-shows-only-invariants` establishes that a subject reference is "a photograph of a face *doing something* - with an expression, an eyeline, a head angle **and a key light**", and that the conditioning channel carries all of it. So in a plate-plus-subject call **both** attachments hold lighting authority, and the map's step-1 promise of one primary job per asset cannot actually be granted: telling the subject's card to control "identity, never lighting" does not remove the light already baked into it. What is needed - the subject lit by the plate's source - is in neither reference.
- The shape of the gap is worth naming because it recurs: this is not a missing attribute, it is a missing **relation**, and a map with one row per asset has no row that can hold one. Two constraints written in so step 3 survives: author the relation and never the endpoints ("lit by the lamp behind him" is the seam; "in his black coat, under the lamp behind him" has smuggled the identity card back in), and the plate is the authority in the exchange - the subject bends to the room's light, the room is never re-lit to suit the card.
- **Application, `simulation`, verdict `unmeasurable`** ([[2026-08-31-3d-documentary-ai]]). Not `not-better`: the technique did not lose, its precondition is absent. The consuming tree merges two references in one frame exactly nowhere. Instrument named, as the verdict requires: the project's own verdict grader run over composite calls - what is missing is not the grader, it is composite calls to grade.
- **The structural fact, and it is the run's second undesigned one.** That tree's extract module splits every observation into `look` (the rendering, nothing depicted) and `depiction` (subject and staging) over eleven single-surface fields, and its own types file says the split is "what the vision model reads back off ONE image". That comment was written to explain a singleton readback mode. It also happens to be the exact reason this amendment exists: **a binary split of one image's observables has no vocabulary for a relation between two images.** A well-built pipeline can therefore carry a complete style contract, a complete staging contract and a disciplined role convention, and still have nowhere to put *the subject is lit by the lamp already in the room*. The blind spot is visible there precisely because everything around it is done well.
- Catch worth recording, because it will be re-proposed: **holding the paragraph and rewriting only the identity line** is `identity-split-from-state` with the purity requirement already stated, and **a fixed two-tone grade block in every location prompt** is `assigned-colour-roles` plus the law. Both are the same source's rules and both are this subject's existing material.
- Untriaged, with an anchor, nobody verified it: the source splits *video* prompts into N labelled blocks with some locked across generations and some varied [00:06:30]. `two-block-style-and-action` is two blocks with two lifetimes for images. Whether the n-block generalization earns its own material or is that technique read at a different arity was not checked - and the lifetimes axis is the same one, which is why it is untriaged rather than a lead.

