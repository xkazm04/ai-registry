---
subject: condition-tagged-line-tables
domain: game-production
last_touched: 2026-10-09
touched_by: deepen
dry_streak: 0
---

# condition-tagged-line-tables

Forged 2026-10-04 in the narrative-and-dialogue category (b8bf2d1a), from Death Ride's
narrative research dossiers. It had six techniques and two `process` applications, both
reading design documents in the firetv tree.

## Touch log

### 2026-10-09 - `/deepen`, single subject (run dp-ctl-1009)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. There
were three lanes: counter-evidence (web), training-data-only (blind), and a field lane that read
and ran the firetv `deathride/main` runtime at `10974fa3`. Since the forge, that tree has shipped
the table the dossiers proposed: `narrative/lines.csv` (518 rows), a matcher (`Script.kt`) and a
director (`ScriptDirector.kt`).

**Widened: two kotlin applications (kotlin@2.0.21), both at the experiment rung.**
- **`kotlin--react-to-what-the-player-caused`.** The director infers "the player hit me" from
  per-frame damage totals, while the combat resolver records every hit's author. A headless
  probe ran 102 races with the resolver as ground truth. 2.0% of spoken hit barks name the
  wrong author at 60 fps, 3.5% at 30 fps and 6.0% at 15 fps. Mine lines are the worst. Wreck
  barks read the resolver and are right.
- **`kotlin--line-table-schema`.** A census of the table against what the director queries and
  writes, asserted on a known positive and a known negative first.
  - 130 of 496 usable rows can never play: 108 sit on triggers nothing queries, and 22 need a
    fact nothing writes. The project's suite is green over all of them.
  - `!=` passes on a missing fact, by an asserted contract.
  - 28 of 91 speaker × bark-trigger pairs have no row.
  - Specificity outranks recency, so a special greeting repeats every race.
  - The retry count lives in memory and resets on relaunch.

Both `process` applications were re-resolved at the same sha. All 22 anchors held,
`verified_on` moved, and each gained a line saying that the table now exists in code.

**Corrections. Each was reached by both the blind and the web lane, and each was checked
against the current file before landing:**
- **Count is one shipped ranking.** The source engine had weighted, optional criteria. Two
  other shipped systems rank by priority bands, and one widely used tool ranks unheard lines
  above more specific heard ones. Landed in the golden path and in most-specific-match-wins,
  which gained "a heard special line yields to an unheard general one". The field lane showed
  the failure.
- **Must-land beats are guaranteed, not "never matched".** They are placed, or given a
  must-play band with prerequisites and an exemption from cooldowns. One shipped game's ending
  row is exactly that.
- **The confidence gate binds claims about the player.** A speaker's voiced intention is
  exempt; the source is a squad-AI postmortem. Freshness is checked at speaking time, per the
  source talk.
- **Silence.** It is forgiven only through the unremarkable; under-reacting to a salient event
  is a named failure.
- **Gating.** "Story advances on finishing" binds the between-attempt story. The canonical
  failure-as-story game gates its ending on a clear, and the release is an assist.

**Confirmed and strengthened:** unknown fails a criterion. The source talk says so verbatim, and
two shipped tools violate it the same way Death Ride does: one passes a negation on absence,
the other has no unknown at all.

**Blind-lane internal contradictions, landed after reading the files:**
- The persistence rule permitted its own named failure. It is now keyed to meaning, not clock
  unit; the field lane found the same gap in the retry count.
- Losing-yields' "deepen the loss pools first" collided with repeat-avoidance's "reduce fire
  rate before commissioning". The two rules now point at each other.
- The shadowed-row check ignored exhaustion.
- line-table-schema now says a count is written as zero when its scope opens.

**Declined (no convergence, banked below):** listed in Open leads. "Misattribution costs more
than silence" has no source either way; its rate is now measured, its cost is not.

## Impact

The registry map was dry-run in a clean worktree of the content commit. It pairs this subject
with **0 contexts** across the 12 mapped projects, so no verdict went stale and no `/conform
--stale` queue exists. firetv, the only tree with the seam, is still unregistered at HEAD. A
sibling's uncommitted `projects.json` change registers it, the same state dp-afg-1009 recorded.
Return: re-run the map once that registration lands.

## Applied

- **react-to-what-the-player-caused** - firetv - experiment - better. Spoken-and-wrong rates
  are 9/460, 16/463 and 28/467 at 60, 30 and 15 fps. Not fixed in the project; the resolver's
  HIT stream is the seam.
- **line-table-schema** - firetv - experiment - better. 130 of 496 rows are unreachable under
  a green suite.
- **most-specific-match-wins** - firetv - simulation - better on distinct lines per hearing. On
  two grid greetings, heard-yields takes 1 distinct line to 2; the grudge tie is the count
  proxy, live.
- **repeat-avoidance + losing-yields (persistence by meaning, ending bound)** - firetv -
  simulation - unmeasurable. The flip moves the retry count and the once-per-retry scene keys;
  nobody has played a relaunch.

## Open leads (banked, convergence rule applies)

- **Information-bearing state lines are first-class.** Callouts, warnings, an enemy noticing
  an empty gun. This came from the blind lane only, and it would bound cause-over-state.
  Return: a web or field lane reaching it.
- **Speaker election and squad de-duplication.** One voice answers, and a world-level "already
  called" fact suppresses the rest. Blind lane only. Return: a second lane, or a fleet tree with
  several speakers on one event.
- **A deferred must-play queue.** A must-play line waits for the next valid slot rather than
  lapsing. The blind lane proposed it; the web lane's only source was a fan wiki it did not
  fetch. Return: a primary source.
- **A visible meter invites optimisation.** Both lanes named it, but the web evidence is a
  forum paraphrase. It would bound signals-stand-in-for-lines. Return: a primary source.
- **A level becomes worth a line when banded and voiced on band entry.** Web lane only, from
  an unverified search summary. Return: a verbatim read.
- **Pool rotation by campaign progress.** Web lane only (one writer's interview). Return: a
  second lane.
- **Repetition as written facts with expiry.** This would unify recency, cooldown and once-only.
  Blind lane only. Return: a second lane.
- **Generator-drafted barks with writer curation.** Blind lane only. Return: a sourced shipped
  pipeline.
- **The cost of misattribution versus silence.** Unsourced either way; the rate is now measured
  in one tree. Return: a played session or a player study.
- **Project leads in firetv, not registry content:**
  - attribute hits from the resolver's HIT stream;
  - add a fact dictionary and run the census on every save;
  - persist the retry count;
  - decide whether the ally-voiced grudge lines ("We share a cause") should play to a rival
    who never joined.
  These wait on the owner.

## Saturation

Depth rung L3: one experiment against the resolver's ground truth, one census of the shipped
table, and primary sources read on the page. The web lane read shipped selection code
directly. Last-pass yield: 2 applications, 5 convergent corrections, 4 internal-contradiction
fixes, 0 techniques. Dry streak 0. Clocks: both kotlin applications derive their window from the
stack; no override.
