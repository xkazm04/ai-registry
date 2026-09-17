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
