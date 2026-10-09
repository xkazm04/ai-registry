---
subject: ending-first-narrative-structure
domain: game-production
last_touched: 2026-10-09
touched_by: deepen
dry_streak: 0
---

# ending-first-narrative-structure

Forged 2026-10-04 in the narrative-and-dialogue category (b8bf2d1a), from Death Ride's
narrative research dossiers. It had six techniques and two `process` applications, both
reading the dossiers in the firetv tree.

## Touch log

### 2026-10-09 - `/deepen`, single subject (run dp-efn-1009)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. Three
lanes ran:
- a field lane that read the firetv `deathride/main` tree at `10974fa3`;
- a counter-evidence web lane;
- a training-data-only blind lane.

The field lane found the subject's own artifact shipped. The head writer's story bible
(2026-10-04) holds a back-planned sheet and a card locked first. The 518-line script carries
the ledger as `plant:` / `payoff:` / `reveal:` tags, and it was wired into the game on
2026-10-06 (`d6b316a6`).

**Widened: two kotlin applications (kotlin@2.0.21).**
- **`kotlin--back-planned-beat-sheet`** (experiment, not-better). The technique's checks ran
  as a census at three levels: written, fired, and on a card.
  - 101 of 496 usable lines, and 33 of the 96 ledger rows, sit on 20 trigger kinds no call site
    raises (`shop-enter`, `shop-idle`, `ledger-*`, `duel-pit`, `phase` and others).
  - Nine rows are numbered siblings that a key-pick always beats. Two of them are plants,
    including the second half of Rook's refusal.
  - One reveal per act holds for acts 1-4.
  - Raw-tag payoff checks fail 43 of 45. Most of that is vocabulary: the rig carries six thread
    names, and the ending's `payoff:keys` has no `plant:keys`.
  - The project's suite checks only cards.
  - Instrument controls: the census found the card, pre-race and boss-turn call sites, and it
    flagged the ledger triggers dp-dls-1009 found unwired. dp-ctl-1009's kind-paired census
    reached 130.
- **`kotlin--lock-the-final-card-first`** (code read).
  - The locked card is byte-identical from 2026-10-04 to `10974fa3`.
  - The candidates were seven-plus wordings of one ending fixed by a brief that listed the
    prerequisites first.
  - Of the four objects the card names, only the key is planted on a channel every player sees.
    The clamp is in no line. The rack, which is the card's price, is planted only on
    `shop-idle` / `own-mine-hit` lines nothing fires. The hook is in a shadowed slot and one
    grid bark.
  - The pre-lock ending survives in `story-cards.csv` as a per-line fallback, fenced by
    ScriptTest (no permitted fallbacks; the scripted card is asserted shown). Verified and left.

Both `process` applications were re-resolved at `10974fa3`. All 45 anchors held; the checker
was asserted on a planted negative first. `verified_on` moved. Two stale claims were
corrected: "no sheet has been written" and "three candidates not run". Both were already
false in the same commit.

**Conditions, each reached by two lanes and checked against the current file:**
- **Run the sheet's checks against what the build can show.** Reached by the field census and
  by the blind lane's "a plant in content a player may never see". Landed in the technique's
  checks, its evidence status, the golden path and a failure-mode line.
- **The decisive act is a decision the protagonist owns, and refusing the trained verb can be
  it.**
  - Web: a primary interview, re-read verbatim, on a campaign whose ending changed from killing
    to refusing. The revised ending the rule came from was a decision of mercy, not the combat
    verb.
  - Blind: verb-refusal and loss-of-control endings.
  - Landed in the lock technique and the golden path.
- **Re-open a locked card when the written units no longer support it.** Both lanes named the
  same panned sitcom finale, shot eight years ahead. Both found forward-written finales that
  were acclaimed, so an early lock is survivorship evidence. Landed in the lock technique and
  the golden path.
- **Cut lore before relationships unless the property sold its mystery.** Both lanes named the
  same serial finales. Landed in the cut-the-thread technique and the golden path.

**Evidence corrections:**
- **The prestige-series lock.** The showrunner's later words are that the last scene is
  "nearly the same", and that versions of the end scenes were written. Re-read verbatim
  (gamesradar, 2026-10-09).
- **The revised-ending "stolen agency" reading.** It is the journalist's narration of "some
  players' minds", re-read verbatim; the same finding as dp-dls-1009. Medium, not High.
- **A friend's betrayal damaging replay.** No measurement in either lane, and the blind lane
  argued the opposite. The rule now chooses by what the friendships must still carry.
- **The spoiler-benefit study.** The most-cited one is an outlier in its literature, re-read
  verbatim at https://ssol-journal.com/articles/10.61645/ssol.190. It is not evidence that
  dense planting is free.
- **One reveal per unit.** It is a heuristic. A peer-reviewed suspense model supports only the
  escalation half (https://www.journals.uchicago.edu/doi/10.1086/677350).

**Declined (banked below):** structure-carried theme needing a cue, the one-thread-id
requirement, completion-rate reach data, chained reveals, and the wording-versus-ending
candidates point.

## Impact

The subject joins **0 contexts** across the 12 mapped projects. This was checked with a map
dry-run in a clean worktree of the content commit, then a grep of each project's committed
`.ai/registry-map.json`, with a positive control (pof joins game-economy-tuning 21 times). No
verdict went stale and no `/conform --stale` queue exists. firetv, the only tree with the
seam, is still unregistered at HEAD. The registration is in the shared tree as a sibling's
uncommitted change and was not touched. Return: re-run the map once that registration lands.

## Applied

- **back-planned-beat-sheet (checks against what the build shows)** - firetv - experiment -
  not-better. 33 of 96 ledger rows and the final card's price plants never fire, and the
  sheet-level checks would have certified them.
- **lock-the-final-card-first (the decision is owned; refusing the verb can be it)** - firetv -
  unapplied. The duel is the player's own act with trained verbs, so the bound does not reach it.
- **lock-the-final-card-first (re-open when the units no longer support the card)** - firetv -
  code - unmeasurable. The one locked card in the fleet is still supported by its written
  units. Old and new rules agree, and the defect is wiring, not drift.
- **cut-the-thread-that-cannot-pay-off (unless the property sold its mystery)** - firetv -
  unapplied. Death Ride's premise sells a debt, not a mystery.

## Open leads (banked, convergence rule applies)

- **A theme carried only by structure can be misread, and one anchoring cue fixes it.** A
  primary interview, re-read verbatim, says playtesters were confused why the protagonist
  spares the antagonist, and the team added a flashback hint. Theme-comprehension research
  falls sharply with age. Web lane only. Return: a second lane, or a playtest read in the
  fleet.
- **The mechanical checks need one thread id carried by plant and payoff alike.** Over
  free-text tags the census reports vocabulary. Field lane only. Return: a second tagged script,
  or the project re-keying its tags.
- **Late payoffs reach far fewer players than early plants.** Public achievement data for one
  episodic series falls from 56.9% of owners finishing episode 1 to 35.2% finishing episode 5.
  These are owner-based lower bounds. The blind lane recalled the same 20-50% range. Return: a
  rule this changes, beyond the existing second-touch line.
- **Two reveals in one unit land when the second is the first's consequence.** Blind lane only.
  Return: a web or field case.
- **Candidates written as wordings of one ending skip the technique's choice step.** Field lane
  only, one project. Return: a second project's candidate pool.
- **Project leads in firetv, not registry content:**
  - move the Mechanic's mine plants onto a channel that fires;
  - give the hook a shown plant;
  - turn numbered refusal sequences into `after:` chains;
  - wire or retire the shop, ledger and finale-pit triggers.

  These wait on the owner.

## Saturation

Depth rung L3: a code read and census over the shipped script, with an anchor census.
Last-pass yield:
- 2 applications;
- 4 two-lane conditions;
- 5 evidence corrections;
- 0 techniques.

Dry streak 0. Clocks: the kotlin applications derive their window from the stack, with no
override.
