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

## 1.1.0 - 2026-09-20 - personas (council-galaxy-descent)

- **A seat's argv is a contract with a CLI that moves.** codex-cli 0.154 removed `--full-auto`; the
  codex judge errored in 0.12 s with `unexpected argument`, and the panel silently shrank to one
  family. The runner now passes `--sandbox workspace-write`. Read `runs/<id>/stderr.log` for any
  seat that finishes in under a second before reading the scoreboard: an `errored` judge leaves a
  scoreboard that looks complete.
- **A seat-limit on the only second family leaves a one-judge panel.** Say so in the report and
  let the owner decide; do not substitute a same-family judge to fill the chair.

## 1.3.0 - 2026-09-22 - personas (manifest-editor, the promotion)

The owner's fused winner (a document editor) was promoted into the product and the owner said the
quality had massively degraded. This entry is about the step after the verdict, which the method
did not have. Section 9 and `references/promotion.md` add it.

- **Every product gate was green on a port the owner rejected on sight.** tsc, eslint, 24 tests, a
  205-rule census and a production build all passed. Measured afterwards with a computed-style
  contract, the port carried 69 deviations across 10 roles, and all three properties the owner had
  named ("book wrapping, font choices, wider width") were among them. The port had been rebuilt from
  the product's generic tokens from memory of the winner. No gate reads a computed style; the
  contract (`scripts/style-contract.py`) does, and took it to 0.
- **A named interaction was lost the same way, and only driving it showed that.** The owner asked
  for one variant's "row focus on click". The port selected a paragraph; the winner selected one
  bullet, which is what the owner meant, because a manifest is mostly bullets. Screenshots could not
  show it, since a selected row and a row with a caret look the same in a still frame. The fix
  was read from the winner's markup (`<li data-block>`), and a scripted browser drive now asserts
  on what the save writes.
- **"Extract the style from this screen" is a claim the instrument can prove.** When the owner
  pointed at an existing product surface as the reference, its components were extracted and that
  surface migrated onto them; old render as contract, new render checked: 0 deviations across 15
  roles. The same check caught this product's re-pointed radius scale (`rounded-xl` = 16px here, not
  12px), which a mapping from Tailwind defaults would have shipped 4px wrong on every card.
- **The instrument needed a negative control to be trusted.** Its first run against an old-selector
  roles file crashed on a role absent from the roles file instead of reporting it missing. Fixed; it
  now exits 1 on the pre-fix port (15 deviations, 5 roles missing) and 0 on the fixed one.
- **A layout position is not a computed style.** A `<button>` centres its label; a flex column
  pinned it to the bottom, and every property still matched. The opt-in `position` probe caught it.
- **A prototype's viewport breakpoint became the wrong signal in the product.** The harness ran the
  surface at 1,400px; the live app put it in a 597px panel. A container query now decides the rail.
- **The bridge's screenshot route captured the foreground window (a terminal) twice**, focus route
  or not. Live verification went through DOM queries instead; don't rely on that route for pixels.
- **Git, product side:** committing through an isolated index left the shared index one commit
  behind, which against the new HEAD read as "delete the 22 files just committed". Caught before any
  other session committed; resync your own paths right after an isolated commit.

## 1.4.0 - 2026-09-22 - personas

- **The port's WORDS are part of the style contract, not decoration.** A promotion reached 0 deviations across 12 roles with two `accept: ["width"]` departures, both on shrink-to-fit text whose every style property matched: the product's pre-seeded strings were full sentences written for a settings page, and the design gives that slot a chip. Seven short keys later the same check printed 0 across 13 roles with both tolerances REMOVED, and the chip read character for character with the winner. Lesson for step 4 of `promotion.md`: when a role's only deviation is `width` on an auto-sized element, suspect the copy before the CSS, and treat "the product must use its existing keys" as a constraint that can be renegotiated rather than a reason to widen a tolerance.
- **A promotion measures what no product gate can, and this run proved it three more times.** The instrument caught that the host's `--brand-cyan` token resolves to `#1ba9be` in one shipped theme (routing three companions' identity colours through it would have collapsed them to one hue), that an SVG ring was painting an inherited `color` the winner leaves alone, and that Tailwind preflight's `max-width: 100%` reaches an `<img>` the prototype never had. None is visible to typecheck, lint, 22 tests or a production build.
- **The owner may decline the panel, and that is a valid contest.** This round ran 3 seats x 3 variants with NO judges: the owner read all nine himself and named the winner. `verdict --winner` writes the vault and the pattern ledger without a scoreboard, exactly as the skill says it may - worth stating in the report so the absence of scores does not read as a missing step.
- **A seat that completes in one turn is not automatically a poor seat.** codex:gpt-5.6-sol@high delivered 3/3 variants in 596 s and one turn against claude seats' 48 and 54 turns; its variants were thinner in prose but structurally complete, and its "state readable without colour" idea was the field's most transferable. Turn count is not effort.
