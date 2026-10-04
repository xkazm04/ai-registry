---
layer: application
type: application
subject: llm-dialogue-quality-control
technique: measured-banned-pattern-list
stack: process
status: forged
verified_on: 2026-10-04
---

# Death Ride's banned-pattern table and tell blacklist, read against the two-tier list

This application reconciles the measured banned-pattern list against the dialogue research for
Death Ride, an arcade combat racer for a television-class device, in the `firetv-deathride`
tree at `C:\Users\kazda\kiro\firetv-deathride`. The research proposes a twenty-row banned-pattern
table (section B2) and a grep-able blacklist (section C4) for every generated line. Neither
exists as a file a filter reads: a search of the game folder for the list's entries finds them
only in the dossier, so this is a reading of a design on paper. Nobody has played the game, and
nothing here is evidence that any entry improves a line in play.

Anchors are root-relative to that tree.

## Sources the dossier stands on

The measured entries cite three studies and one catalogue: Paech et al., "Antislop"
(https://arxiv.org/html/2510.15061v2), Chakrabarty, Laban and Wu, "Can AI writing be salvaged?",
CHI 2025 (https://arxiv.org/html/2409.14509), Shaib et al., "Measuring AI 'Slop' in Text"
(https://arxiv.org/html/2509.19163), and the Wikipedia guideline page "Signs of AI writing"
(https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). The prompting rule comes from
Anthropic's "Prompting best practices"
(https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).
Web search was unavailable for this pass, so none of these pages was re-opened today; the
figures below are as the dossier records them.

## Confirmed

**Two tiers exist and are marked.** The dossier separates measured from editorial entries:
`docs/narrative/research/R3-dialogue-craft.md:243 "The others are editorial judgement."`, and
gives them different confidence, with the editorial ones explicitly owner-overridable:
`docs/narrative/research/R3-dialogue-craft.md:268 "which are defaults the owner can overrule"`.

**Measurements carry ratios.** The measured tier quotes over-representation against a human
baseline, as the technique asks:
`docs/narrative/research/R3-dialogue-craft.md:235 "ran up to 6.3 times the human rate"` and
`docs/narrative/research/R3-dialogue-craft.md:262 "ran at 85,513 times the human rate in one model"`.

**Filter after generation, not prohibition in the prompt.**
`docs/narrative/research/R3-dialogue-craft.md:274 "Apply the blacklist after generation, as a filter, not as the main instruction."`

**Structural entries, not only words.** The C4 list opens with constructions — the reversal, the
three-item list, the closing generalisation, named emotion, mirrored pairs:
`docs/narrative/research/R3-dialogue-craft.md:382 "more than one rhetorical question per exchange"`,
which is also a rate-limited structural entry of the kind the technique describes.

**Override with a written reason.**
`docs/narrative/research/R3-dialogue-craft.md:380 "A human may override it with a written reason."`,
logged at the pick step: `docs/narrative/research/R3-dialogue-craft.md:401 "log any blacklist overrides"`.

**The phrase ledger.** `docs/narrative/research/R3-dialogue-craft.md:403 "so later slots don't reuse them"`.
This was an upward lesson: the first draft of the technique had no cross-slot ledger, and now
has one beside the list.

## Deviations — the dossier falls short of the technique

**A catalogue is counted as a measurement.** The † mark is defined as "measured in [9], [10] or
[11]" (line 243), and [9] is the Wikipedia catalogue. Two daggered rows rest on it alone: the
tricolon (`docs/narrative/research/R3-dialogue-craft.md:248 "Rule-of-three cadence becomes a tell at density [9]"`)
and piled ellipses (`docs/narrative/research/R3-dialogue-craft.md:261 "A model tell [9]"`). The
dossier's own source note leaves [9] out of the primary list
(`docs/narrative/research/R3-dialogue-craft.md:444 "The primary sources are 1 to 4, 8, 10 to 17 and 33."`).
Under the technique both rows belong in the editorial tier. This deviation was an upward lesson
too: the technique now states that a curated catalogue is editorial however good it is.

**The enforced list merges the tiers.** C4, the version a filter would run, drops the † marks and
puts measured and editorial entries in one undifferentiated list
(`docs/narrative/research/R3-dialogue-craft.md:380 "A hit rejects the line."`). An entry cannot
be traced to its evidence or its owner from the list the filter reads.

**Nothing is measured on the production generator.** Every ratio comes from other models and
from prose, as the dossier says itself
(`docs/narrative/research/R3-dialogue-craft.md:239 "these studies cover prose and Q&A, not barks"`).
The list is a well-chosen starting point, not a measured list for this game.

**The filter has no scope report.** The protocol predicts the yield but does not require the
filter to report what it read and struck:
`docs/narrative/research/R3-dialogue-craft.md:397 "Expect about half to drop."` — an
expectation, not a measurement, and with nothing that would fail loudly on an empty batch.

## Death Ride use

When the dialogue line is built, keep the list as one data file with a tier column, a ratio and
basis for measured rows, an owner and reason for editorial rows, and a rate limit for structural
rows; let the filter read it directly and print read, struck and per-entry counts per batch.
Move rows 2 and 15 to the editorial tier. Before the first content wave, sample the chosen
drafting model a few hundred times on real Death Ride slot briefs, compare against a human
reference set of game barks and screen dialogue, and promote or demote the imported entries on
the result. Seed the phrase ledger from the reference lines in each voice bible so the first
generated slots cannot reuse a human anchor line's image.
