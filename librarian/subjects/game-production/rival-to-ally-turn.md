---
subject: rival-to-ally-turn
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# rival-to-ally-turn

A narrative-and-dialogue subject forged on 2026-10-04 with six techniques and two `process`
applications. Both read Death Ride's research dossiers, not its code. It had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-rta-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. Three
lanes ran:
- a field lane that read the firetv `deathride/main` tree at `d9990777`: the rival data, the
  AI personas and skills, the grudge state, the campaign promotion, the script director, the
  line picker, and `deathride/narrative/lines.csv`;
- a counter-evidence web lane;
- a training-data-only blind lane.

The rank was real. The tree now carries the whole arc in its script, and most of what fails,
fails between the script and the code that chooses lines. Both `process` applications still
resolve at `d9990777` (36 of 36 anchors held). They were not edited.

**Widened: four kotlin applications (kotlin@2.0.21).** All 62 anchors hold under `check-anchors`.
- **`kotlin--style-plus-grudge-before-taunts`** (simulation, better). One grudge flag, set by
  any player wreck, cleared only by joining, never decayed. Rook's late braking clamps to zero
  at Pro and Champion. Signature attacks belong to the car class, and every car shows the same
  tell.
- **`kotlin--earn-respect-before-the-turn`** (simulation, better). The director records one
  boss fact, wrecked or finished. All five turn lines claim acts that nothing recorded.
- **`kotlin--refuse-once-then-turn`** (simulation, better). The refusal sits before the boss
  race, and each previous boss carries the offer to the next. The line picker plays one line
  per slot, so Rook's four-line refusal shows one line, and his reason never plays.
- **`kotlin--keep-the-rivals-own-culture`** (simulation, better). The voice is kept, and allies
  keep racing at full strength. One integer holds both side and grudge, so a post-join line
  plays to a pre-join Ox, and a delivery contract labels Relay an ally.

**Corrected: the golden path, conditioned by two lanes each.**
- *Arc grudge vs contact grudge.* Counter-evidence: GRID Legends v6.0 made a never-decaying
  nemesis decay ("good (60%) chance", verified verbatim), after a players' thread asked for it
  switched off. Field: the flag never decays. The blind lane agreed with persistence, so this is
  a condition, not a refutation.
- *Refusal: function fixed, placement free; a one-conversation recruit is not a rival turn.*
  Blind: DISAGREE, and named it the most overstated claim (a turn with no offer, a turn after
  several refusals). Counter-evidence: a tactics series' talk-recruit, and a craft authority's
  "however briefly". Field: the refusal comes before the race, carried by an ally.
- *A speech may complete a turn that something seen already cracked.* Counter-evidence: a
  peer-reviewed study (Igartua & Vega 2016) on explicit dialogue arguments, read from the PDF
  text, plus a critic's defence of the speech turn. Blind: conditional.
- *Demotion is the same role made weaker.* Counter-evidence: a roguelike's limited call-in.
  Blind: decline caused by joining.
- *The rivalry is kept; side and grudge are two states.* All three lanes reached it. The blind
  lane named it the missing rule.
- *A conditioned line claims nothing its condition did not read; an exchange must play as one;
  trace every arc line to the code that chooses it.* Field only, on several cases each.

**Technique conditions:**
- the signature is checked at the hardest setting and in every vehicle;
- a cost shown in state is measured against a rival who did not cross (the same case as the
  regional-culture row of run dp-rcw-1010, so no second applied row).

**Declined:**
- *A new technique, "the rivalry outlives the turn".* Three lanes reached it, but it is
  home-ambiguous with ally-bond-and-found-family, which owns friction inside the group. It
  landed as a section of `keep-the-rivals-own-culture` instead. Proposal for the neighbour: a
  link back to that section, if its own pass finds the same seam.
- *Baldur's Gate 3's Minthara patch, as evidence on cost.* The lane saw the patch wording only
  as quoted by players and wikis.

## Impact

The subject joins **0 contexts** across the mapped fleet. The check was `build-registry-map
--dry-run`, plus `--project firetv --out` to a scratch file: firetv's 70 joined subjects include
`voice-io`, the known positive, and not this subject. firetv's `.ai/manifest.yaml` declares
software-engineering, localization and llm-observability. firetv is registered only by a
sibling's uncommitted `projects.json` change. No verdict went stale and no `/conform --stale`
queue exists. Return: when firetv declares game-production, or Death Ride gets its own manifest.

## Applied

Six rows in `librarian/applied.md`, all on firetv (unregistered): 4 better, 1 unmeasurable
(speech after a crack: Death Ride has no player speaker), 1 unapplied (role-not-power: no ally
call-in exists). No project commits. These are findings in Death Ride's tree (the slot collapse,
the overclaiming lines, the shared flag, the clamp), recorded here for the project's owner, not
patched. A narrative change to a game in active development is the owner's call.

## Banked leads

- **The dead lines are a lint.** Lines in `lines.csv` gated on `weakness`, `prev-payout`,
  `on-straight` and `contract=delivery-done` need facts that no code sets (the lines were not
  counted). A check that every condition
  key has a writer would turn the golden path's step 8 into an instrument. Return: when a
  project asks for a script lint, or an intake brings one.
- **Respect lines and the wreck source.** The race records who wrecked whom, and the script
  does not read it. That is a one-fact fix whose effect a playtest could measure. Return: when
  Death Ride is played.
