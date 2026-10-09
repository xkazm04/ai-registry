---
subject: race-event-as-story-beat
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# race-event-as-story-beat

Forged 2026-10-04 in the narrative-and-dialogue category, from Death Ride's narrative research
dossiers (R2, R4). It has five techniques. Before this run it had two `process` applications,
both reading the dossiers and the campaign data in the firetv tree at `6efb1dda`.

## Touch log

### 2026-10-09/10 - `/deepen`, single subject (run dp-resb-1009)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. Three
lanes ran:
- a field lane that read the firetv `deathride/main` tree at `d9990777`;
- a counter-evidence web lane;
- a training-data-only blind lane.

The field lane found the subject's main gap had moved under it. The 518-line script was wired
into the game on 2026-10-06 (`d6b316a6`), so the `process` application's "Barks: absent" was
stale.

**Widened: four kotlin applications (kotlin@2.0.21).**
- **`kotlin--four-part-beat-delivery`** (simulation, better).
  - Barks are triggered by state and phase. The clock only gates them: a 6 s gap, 14 per race,
    25 s per speaker.
  - 24 of 91 barks run over eight words, and 90 of 91 are scoped to any event.
  - Grudge and ally state persist, and 97 lines read them.
  - Only the boss gates have character loss lines.
  - The retry count lives in memory only, and 24 lines have condition keys that are never set.
  - The retry cap was simulated, as described under Applied.
- **`kotlin--twenty-second-story-budget`** (counted, not timed).
  - The median is 38 words before the grid and 11 after.
  - `switchback-6` is a free beat at 74 words, about 30 s at the project's 150 wpm.
  - No budget is stated in seconds, only a 12-word target per card line.
- **`kotlin--rule-variants-carry-story`** (simulation, unmeasurable).
  - The deletion test is unchanged: 34 LAPS and 1 ELIMINATION.
  - The contract column is read only by a test.
  - The boss objective names the boss but is shown only on the career screen.
- **`kotlin--few-fixed-beats-many-flexible`** (code read).
  - The bible names 16 hand-placed beats, and the campaign is strictly linear.
  - 30 events advance on finishing and 5 need a win, with the loss told at each.

Both `process` applications were re-resolved at `d9990777`. All 37 anchors held after one moved
quote was corrected (R2 319 to 318). The checker self-tests on a planted known-bad quote on every
call. `verified_on` moved. The stale barks claim was corrected, and the unknown about persisted
state was settled.

**Conditions, each reached by two lanes and checked against the current file:**
- **A retry's acknowledgment fades after two or three attempts and states no count.**
  - Web: players muting repetitive voiced lines in an open-world racer (community thread, low).
  - Blind: the acknowledgment should fade after the second or third retry.
  - Landed in four-part-beat-delivery and the golden path.
- **A scene before the grid survives only when the event's objective reads what it set up.**
  - Web: a racer whose rivals must each be beaten in races kept praised cut-scenes between
    races. Re-read verbatim 2026-10-10: "whereupon they must win against the racer in a
    successive series of races" and "which usually falls victim to critics"
    (https://en.wikipedia.org/wiki/Need_for_Speed:_Most_Wanted_(2005_video_game)).
  - Blind: finish-ahead-of-the-rival objectives carry story by changing only the goal.
  - Landed in the golden path and rule-variants-carry-story, with the named-opponent clause.

**Evidence corrections:**
- **"Somewhere around the third event."** No lane found a published skip rate. The one director
  statement found gives no figure, re-read verbatim 2026-10-10: "I see a lot of people
  discontinuing watching the cutscenes from "DS1" by stats"
  (https://frvr.com/blog/news/hideo-kojima-says-a-lot-of-people-skipped-death-stranding-cutscenes-but-they-are-part-of-the-game/).
  The golden path and the budget technique now say the direction is reported and the speed is
  unmeasured.
- **The phase-not-clock bark rule.** The research rated it low. It is now medium, from a 2008
  biometric analysis of shooters, re-read verbatim: "information is largely communicated via
  radio and conversations during lulls in gameplay"
  (https://www.gamedeveloper.com/game-platforms/analysis-fps-cutscenes-should-engage-and-connect-not-deliver-info).
  It is also realized in Death Ride's code.
- **Branching outcomes.** One review of a racing story mode, re-read verbatim: "Even if you
  manage to overcome impossible odds and win every on-track situation you are placed into, the
  events play out the same"
  (https://www.shacknews.com/article/125546/f1-2021-review-a-solid-points-finish). This is one
  critic's view, and others liked the mode.
- **The budget's ceiling.** "Adult programs: Up to 20 characters per second", re-read verbatim
  (https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide).
  That is about 65-75 words in 20 s for a viewer's full attention. The "few dozen words" holds
  below it.

**Verified and left:**
- One idea per event, then retire it. Both lanes found that recurring rivals work when each
  appearance is a different person or carries a changed proposition. That is the technique's
  existing "a character, not an idea" exception.
- The deletion test and the four parts. The web lane found no counter-case.

**Declined, not landed:**
- The GRID Legends chapter attrition figures (91.1% to 23.2%). The Steam page, re-fetched
  2026-10-10, shows no achievement naming a story chapter. The lane's chapter mapping came from
  guide summaries. It was drafted into the budget technique and removed before commit.

## Impact

The subject joins **0 contexts** across the 12 mapped projects. This was checked by reading
each registered project's committed `.ai/registry-map.json`, with a positive control: pof joins
game-economy-tuning 21 times. No verdict went stale and no `/conform --stale` queue exists.
firetv, the only tree with the seam, is still unregistered at HEAD. Its registration is a
sibling's uncommitted change in the shared tree and was not touched. Return: re-run the map once
that registration lands.

## Applied

- **four-part-beat-delivery (retry acknowledgment fades, states no count)** - firetv -
  simulation - better. All four boss gates repeat 3-4 lines verbatim from the fourth attempt. The
  old rule passed all four.
- **golden path + rule-variants-carry-story (scene survives when the objective reads it)** -
  firetv - simulation - unmeasurable. The wordings differ only in classification, on the 4 boss
  gates. The 13 other scened events fail under both.

## Open leads (banked, convergence rule applies)

- **Seconds are the right fixed unit and percentages are not.** For a one-minute event, forty
  seconds is 40% of the session. Blind lane only. The golden path already frames the figure on
  two- to four-minute events. Return: a campaign with sub-minute events.
- **Disclosing help can shame the player, so frame it as an assist the player chose.** The
  blind lane cited hidden catch-up as common practice. This contradicts the disclosure rule and
  has one lane. Return: a web or field case where disclosed help measurably hurt.
- **A relationship-introduction beat may change no rule and still belong at the event.** Blind
  lane only. The web lane let the deletion test stand. Return: a second lane.
- **Win-only payoff variants for rival beats.** Blind lane only, and the web lane found no
  finish-against-win comparison. Return: completion data that separates the two.
- **Story-mode chapter attrition from public achievement data.** Needs achievement names that
  map to chapters on a primary page. Return: a primary page with the mapping.
- **Project leads in firetv, not registry content:**
  - give the 13 scened lap events an objective that names their rival, or move the scenes to
    the hub;
  - show the boss objective on the race HUD;
  - persist the retry count;
  - unshadow or retire the announcer's retry grid rows;
  - vary or drop the repeating book lines at retries.

  These wait on the owner.

## Saturation

Depth rung L3: a code read, a selector mirror and an anchor census over the shipped script.
Last-pass yield:
- 4 applications;
- 2 two-lane conditions;
- 4 evidence corrections;
- 1 stale claim corrected.

Clocks: the derived per-stack windows; the vendor-free web evidence has no clock of its own.
Demand: none mapped. dry_streak 0.
