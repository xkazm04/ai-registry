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
