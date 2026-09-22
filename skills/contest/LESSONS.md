# Lessons - contest

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-09-17 - tracklight (knowledge-skill-tree, the hardening contest)

Run shape: three seats (grok-4.6@high, opus@xhigh, fable@high), three variants each, the
registry's 471-subject corpus as a 2.3 MB static snapshot, panel fable@high + grok-4.6@high
blind plus the host's headless visual pass. Nine of nine variants delivered; no seat failed.

- **The brief and the template both opened with "## The idea", so every participant read the
  heading twice.** Fixed in `init` (the duplicate is stripped); the general rule is that a
  template owns its headings and a brief is prose under them.
- **Judges could see the host's eyes.** The visual pass wrote its screenshots under `judging/`
  and the second judge cited them by filename in its verdict ("A-1-1280x800-deep.png"). The
  panel is meant to read code, not the host's captures. Screenshots and the host verdict now
  live under `runs/`; the judge brief forbids reading other verdicts.
- **A shared machine produces false "broken".** One variant's 1280 x 800 load exceeded 20 s
  while two judge seats were spawning; it loaded in 2.8 s alone. The pass now retries once at
  60 s, and the method says to run it before the judges on a shared host.
- **A centre click is a weak probe.** On three of nine variants it landed on empty canvas and
  showed nothing; a click on a named node showed the descent every time. `--click-text` added.
- **Same-family seats converge.** Both Claude seats built a star map and something called
  "Ascent"; every judge docked the duplicate. When two seats share a family, expect one
  duplicated bet and read the set, not only the best variant - and prefer three families.
- **The judge from the participant's own family scored that entry higher on every variant**
  (grok on entry B: 7.83 vs 6.33 and 6.17 on B/2). Blinding did not remove it. With one
  judge per family the disagreement is visible in the spread column, which is the point of
  recording per-judge totals; with two judges of one family it would have hidden.
- **Cost and wall, as the CLIs reported them**: opus@xhigh 29 min / $8.26 / 56 turns;
  fable@high 29 min / $10.17 / 48 turns; grok-4.6@high 36 min / $1.42 / 58 turns. Judging:
  fable 8 min / $6.78; grok 12 min / $0.37. A whole contest of this size is about 40 minutes of
  wall clock and under $30 of reported price.
- **The Chrome extension was not connected, and that was fine.** A headless Playwright pass
  gave load, probe, search and descent frames for all nine variants in four minutes and became
  the documented fallback. A browser tool is a convenience, not a dependency.

## 1.0.0 - 2026-09-18 - tracklight (knowledge-skill-tree, the owner's review)

The owner opened all nine variants and overruled the panel. This is the lesson that matters most
from the first contest, so it is recorded apart from the mechanics above.

- **Three judges agreed and were all wrong about what the owner wanted.** The unanimous first
  place (a star map, mean 8.17) was filed by the owner under "readable but with not practical
  UX". The owner's shortlist was the panel's 4th, 5th and 6th. Every variant of one seat was
  deleted as unreadable although the panel had one of them tied for second. The rubric asked
  about wow, clarity, wayfinding, interaction, craft and concept, and nothing asked "would the
  owner open this tomorrow to do the real task". `utility` is the seventh dimension from 1.1.0.
- **The host's visual pass shared the panel's bias.** Screenshots at load and after one probe
  reward a striking first frame. They do not show that 11 px labels are tiring after a minute or
  that a detail sidebar is too narrow for a rule with five triggers and three laws. The host
  should read body text sizes out of the page (`getComputedStyle`) and report the smallest font a
  user must read, not only look at the frame.
- **The owner's review is the best brief of the whole contest.** Three sentences per variant
  named the exact defects (one layer, small type, sidebar for heavy content) and the exact
  cross-pollination (one variant's theming on another's canvas). 1.1.0 adds `verdict --shortlist`
  and `refine` so that review becomes a round instead of a footnote.
- **One seat per shortlisted variant.** Two of the three shortlisted variants came from one seat;
  refining both in one session would have halved the budget of each. `refine` labels the seat
  `#v<n>` and gives each variant its own workspace and clock.
- **The ledger must not credit wins the owner did not award.** The first verdict wrote five
  patterns as wins for a variant the owner then rejected. A shortlist verdict records sightings
  only, and the curated patterns now come from the owner's words: practical before spectacular,
  levels not one layer, heavy content gets its own surface.

## 1.2.0 - 2026-09-21 - personas (QuickDispatchDock redesign, 2 seats x 3 variants)

Run shape: `claude:opus@xhigh` vs `grok:grok-4.7@high`, three variants each, the real dock's
material staged as 26 i18n strings + 12 projects + 27 skills + a 27x12 install matrix +
`globals.css` tokens verbatim. Owner chose NO panel, so the host's visual pass was the only
verdict. 6/6 delivered, 0 page errors, no seat failed.

- **`resolveBin` cannot find the current Claude CLI.** The npm package no longer ships
  `node_modules/@anthropic-ai/claude-code/cli.js`; v2.1.278 installs a real `bin/claude.exe`,
  so the npm-shim branch resolves nothing and the run dies at step 3 with "cannot find the
  claude CLI on PATH". Worked around with `CONTEST_CLAUDE_BIN`. The fallback table should
  learn the `bin/claude.exe` entry point.
- **`IDENTITY_WORDS` redacted the MATERIAL, not the author, and corrupted an entry.** The
  list hardcodes `opus`, `sonnet`, `haiku` - which in this app are the product's own model
  presets, staged as contest data and named in `data/SCHEMA.md`. `collect` rewrote entry A's
  `var MODEL_RATE = {haiku:0.35, sonnet:1.0, opus:4.2}` into `{[redacted]:0.35, ...}`, which
  is a JS *computed property* over an undefined identifier: the page throws at load. Two of
  three variants of one seat would have been scored `broken` for a defect the instrument
  introduced, and it penalises precisely the seat that hardcoded the preset table. Blinding
  must not scrub a word the brief itself staged - reconcile `IDENTITY_WORDS` against
  `data/` and skip (or warn about) collisions. The host ran the visual pass over unredacted
  `entries/` instead.
- **`visual-pass.py` needs a Node sibling.** Playwright for Python was not installed, but the
  consuming repo carried Playwright for Node 1.59 + Chromium. A port took minutes and the
  pass ran. Worth shipping `visual-pass.mjs` beside the `.py` so the fallback does not depend
  on a second Python toolchain.
- **A centre-of-page probe measures the scenery when the subject is docked.** This brief's
  subject is a bar pinned to the bottom of the window; `--click-text` does not help either.
  The probe that worked was positional and uniform: click `(w/2, h-18)`, type an objective,
  type `@`, Escape. Consider a `--probe bottom-bar` shape, or document that the host should
  write the probe for the subject's geometry.
- **A pixel diff is the wrong instrument for a layout-stability claim.** Comparing PNG clips
  of the region above the dock reported all six variants as MOVED - every one of them
  animates at rest (a travelling light, a breathing lamp, a live gauge), so the bytes differ
  for reasons unrelated to layout. Measuring the subject's own top edge with
  `getBoundingClientRect` across five states reported all six STABLE, which matched the
  frames. Geometry, not pixels, for a geometry claim.
  - And the first geometric attempt was ALSO wrong: walking up to the OUTERMOST bottom-pinned
    ancestor returned the page shell (`top=0` in every state), a reading that is constant
    because it measures nothing. A degenerate-but-consistent result looks exactly like a
    pass; cap the candidate's height so the shell cannot qualify.
- **`verdict --winner` credits every `--pattern` as a WIN, including one the winner did not
  earn.** The host curated four patterns, one of which came from the LOSING seat's variant
  (a rival's collapsed-state idea the owner also saw). `Patterns.md` recorded "4 pattern(s),
  4 credited to a winner". 1.1.0's own lesson says the ledger must not credit wins the owner
  did not award; the same applies within a winner verdict. A `--pattern` needs a way to say
  which variant it is evidence FROM, independent of who won.
- **The owner again chose practical over spectacular, and the host again ranked them the
  other way.** The host's scoreboard put the conceptually strongest entry first (a sigil
  grammar, `concept` 10); the owner picked the one that scored highest on `utility` (9) -
  the variant with a live cost/time readout - and did so without opening the gallery,
  citing what it would tell him before a dispatch. Two contests, two times the `utility`
  dimension predicted the owner's pick better than the mean did. Consider weighting
  `utility`, or at least reporting the utility ranking alongside the mean in step 8.
- **Cost and wall, as the CLIs reported them**: opus@xhigh 30.3 min / $11.52 / 58 turns /
  142,875 output tokens; grok-4.7@high 39.9 min / $7.73 / 59 turns / 151,232 output tokens.
  Grok 4.7 is far pricier than the 4.6 run in the first contest ($1.42) - the cheap-seat
  assumption from 2026-09-17 no longer holds.
- **Same brief, different families, converging concepts.** Both seats independently produced
  a "rail" and a "loading bay". 1.0.0 recorded convergence between two seats of ONE family;
  it happens across families too, so the duplicate-bet warning in the method should not be
  scoped to same-family seats.
