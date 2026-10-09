---
subject: llm-dialogue-quality-control
domain: game-production
last_touched: 2026-10-09
touched_by: deepen
dry_streak: 0
---

# llm-dialogue-quality-control

Forged 2026-10-04 in the narrative-and-dialogue category (line-craft) from Death Ride's R3
dialogue dossier, revised 2026-10-07. It has six techniques and, before this run, had two
`process` applications, both readings of the dossier's protocol on paper.

## Touch log

### 2026-10-09 - `/deepen`, single subject (run dp-ldq-1009)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. Three
lanes ran: counter-evidence (web), training-data-only (blind), and a field lane over the
firetv `deathride/main` tree at `d9990777`. The protocol the forge read on paper has since been
run. On 2026-10-04 a writing session drafted 456 candidates for 45 slots, two judges scored
them, nine slots were revised, and the 518-row script now loads into the Kotlin runtime. The
narrative files are unchanged since `256b8868`.

**Widened: two kotlin applications (kotlin@2.0.21), both at the experiment rung.**
- **`kotlin--critique-and-revise-with-human-checkpoints`** - `better`.
  - Every one of the 71 `key-pick` rows is a model's call. The loader ranks that status first
    as "the pick the writers marked" (Script.kt:99-101).
  - That status decides 6 of 13 multi-row slots, and 9 rows never play. Among them is the want
    line of Vex's refusal, which the record meant to play before the close.
  - 18 originals were re-scored by fresh judges of the same class. They moved a median of 0.30
    (max 1.05), and 5 of the 18 crossed the ship bar.
- **`kotlin--measured-banned-pattern-list`** - `not-better`.
  - The writer's lint ran in a scratchpad and is in no tracked file. None of ScriptTest's 13
    tests reads a tell.
  - Rebuilt from C4 with controls, the filter finds the script clean at HEAD, apart from the
    logged override and two "X, not you" hits.
  - On the judged pool it would have struck 3 of 456 candidates, where the protocol expected
    half.

Both `process` applications were re-resolved: all 33 anchors held and `verified_on` moved. The
blind-rubric one also gained the run's measurements:
- two same-family judges leaned opposite ways on length (positive in 31/45 and 12/45 slots);
- per-dimension agreement was weakest on ear (37% exact, a 0.68 offset) and subtext (39%);
- 14 of 49 picks pass the ship rule for one judge only.

Before measuring anything, the parse reproduced the report's own table: 0.64, 57 and B17 D16 C7
A5.

**Corrections, each reached by two lanes and checked against the current file:**
- **Prompt prohibitions** prime the named phrase in a small open model (web, verified in the
  arXiv abstract). The blind lane said frontier models usually obey. The rule is now
  model-dependent, a prohibition with its reason is allowed, and substitution still holds.
  The ban-list technique had misattributed this claim to vendor guidance. The vendor page,
  read raw, says positive phrasing is format steering, and it endorses a prohibition that
  carries its reason.
- **Another family is necessary, not sufficient.** Judges of several families prefer
  model-written stories (two 2026 abstracts, verified), and the blind lane reached the same
  point ("Great Models Think Alike"). Calibration now includes human-written lines.
- **Length lean is per judge.** Web (TMLR 2026: Claude concise -0.12, others longer, verified),
  blind (economy plus tie-break counts length twice), and field (opposite leans inside one
  family). The tie-break is kept only where the measured lean runs long.
- **Scores compare within a draw, and a floor split goes to the person.** Field (drift and the
  one-judge passes) and blind (judge disagreement as a routing signal).
- **A revision needs a margin over the draw spread.** Web (ten-round self-refinement converges
  to a model-preferred form an outside judge rates better, verified), blind (the best of three
  wins by chance), and field (originals fall 0.31 beside rewrites).
- **An unratified pick never outranks at runtime, and filler never gets neither reviewer.**
  Blind (the rules left filler with neither) and field (the loader; 425 drafts neither judged
  nor read by a person).
- **Verbalized sampling** measures embedding diversity, quality drops when one call asks for
  too many, and it was never compared with constraints. Web (verified in the paper's HTML) and
  blind.
- **Constraint retirement** needs a person's read, or the deck drifts toward the judge's taste.
  Blind, plus the field batch result.
- **Decode-time backtracking** is a third enforcement point. Web (Antislop abstract, verified)
  and blind.

**Single-lane, landed only as evidence or an application note:**
- Chakrabarty's 0.57 is agreement among three writers (web; the wording was fixed in the
  evidence status).
- TTS readback has no dialogue evidence (web).
- A model's text-only "read-aloud" is a page pass. It found a construction the regex missed
  five times (field). A decision rule now labels it.
- An edited line re-runs the filter and the read-aloud (blind; the subject's own binding law).

**Declined:** a local cross-family judge (Ollama Qwen) over the 456 candidates. A weaker local
model confounds family with capability, so any divergence would be unreadable. Banked below.

## Impact

The registry map was dry-run in a clean worktree of the content commit. It pairs this subject
with **0 contexts** across the 12 mapped projects. The positive control held: pof's map carries
307 game-production lines and ascent's 9, and neither names this subject. No verdict went stale
and there is no `/conform --stale` queue. firetv, the only tree with the seam, is still
unregistered at HEAD. Return: re-run the map once it is registered.

## Applied

- **blind-rubric: length lean per judge** - firetv - experiment - better.
- **blind-rubric: within-draw comparison; a floor split goes to the person** - firetv -
  experiment - better.
- **critique: revision margin** - firetv - experiment - unmeasurable. 7 wins fall to 5, and 2
  become ties; which version plays better is unknown.
- **critique: no runtime precedence for an unratified pick; never neither reviewer** - firetv -
  experiment - better.
- **measured-banned-pattern-list: filter in the build** - firetv - experiment - not-better at
  HEAD. Its value is the next edit.

## Open leads (banked, convergence rule applies)

- **A cross-family judge on the 456-candidate pool.** This directly tests "two of one family
  are one opinion". Return: a hosted non-Anthropic judge of comparable capability, or the
  owner's picks as ground truth.
- **The judge's style or formatting bias.** The web lane found it dominant over position in a
  2026 study. It is not tested on dialogue. Return: a second lane.
- **Selection at the level of the whole script** (a spread of moves per speaker, rather than
  each slot's own best) and a lore and continuity check before judging. Blind lane only; the
  field report found two continuity slips by reading aloud. Return: a second lane.
- **Localization and VO constraints on generated lines** (text expansion, wordplay that does
  not translate). Blind lane only. Return: a localized fleet project.
- **Goodhart drift**: a fixed share of slots judged only by a person. Blind lane only.
- **Cross-subject proposal for condition-tagged-line-tables.** Its lead "generator-drafted
  barks with writer curation" now has a field record in this tree. The slot grouping
  (Script.kt:12) also collapses Vex's two-speaker refusal exchange into one slot of variants.
  That is that subject's seam.
- **Project leads in firetv, waiting on the owner:**
  - write `auto-pick` until a person picks, and rank it with the drafts;
  - commit the ban list as a data file read by a ScriptTest case;
  - add the "X, not you" structural entry, and decide the prologue card;
  - turn Vex's refusal into an `after:` chain.

## Saturation

Depth rung L3: an executed run's full score record was re-analysed (test-retest, agreement,
length lean), a census was taken of the shipped loader, a lint was rebuilt and run with
controls, and primary abstracts were read raw. Last-pass yield: 2 applications, 9 convergent
corrections, 0 techniques. Dry streak 0. Clocks: the kotlin applications derive their window
from the stack. The cited research moves fast (2026 judge-bias papers), so the next pass's
event is a new judge-bias study or the owner's picks.
