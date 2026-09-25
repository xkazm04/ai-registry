# Lessons - contest

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.4.0 - 2026-09-23 - personas (Cadastre promotion, contract capture)

- A winner's heavy content lives behind an interaction (a deed opens a full-scale layer on click), so a contract captured at load found 13 of 34 roles NOT FOUND and would have licensed a port that never checked the part the owner chose it for. `style-contract.py` gained `--drive click:<sel> | press:<key> | wait:<ms>` (repeatable, run in order before measuring); a role that only exists after an interaction carries the same steps in `roles.json` and is captured and checked through them on both sides. Two captures are merged: the base one and the driven one.
- The winner's selectors were guessed from screenshots first (`.dist-h`, `.pc[data-tone]`, `.ftag.waiting`) and half were wrong; read the prototype's own class names from its stylesheet and its render functions before writing `roles.json`. A NOT FOUND role is a wrong selector, never an absent element.

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
## 1.1.0 - 2026-09-20 - personas (council-galaxy-descent)

- **A seat's argv is a contract with a CLI that moves.** codex-cli 0.154 removed `--full-auto`; the
  codex judge errored in 0.12 s with `unexpected argument`, and the panel silently shrank to one
  family. The runner now passes `--sandbox workspace-write`. Read `runs/<id>/stderr.log` for any
  seat that finishes in under a second before reading the scoreboard: an `errored` judge leaves a
  scoreboard that looks complete.
- **A seat-limit on the only second family leaves a one-judge panel.** Say so in the report and
  let the owner decide; do not substitute a same-family judge to fill the chair.

## 1.1.1 - 2026-09-22 - pumper, tracklight (backend design contests)

- **`--sandbox workspace-write` is not enough for codex on Windows; the seat can think and never
  write.** Probed directly before a run: codex-cli 0.154 with that flag answered "the read-only
  filesystem policy blocked the write" and left no file, because its shell invocation is
  `Rejected(... blocked by policy)`. The same prompt with
  `--dangerously-bypass-approvals-and-sandbox` wrote the file and exited 0. The runner now passes
  the bypass flag, which is parity with the other two seats (claude runs `bypassPermissions`,
  grok `--always-approve`), not a new risk class. Probe a seat with a one-line write before
  spending a contest on it.

## 1.1.1 - 2026-09-22 - personas (manifest-editor, the Manifest tab redesign)

Two seats (opus@xhigh, grok-4.6@high), three variants each, 22 real persona
manifests + 18 real pending diffs staged from the live app. Panel opus@high +
grok-4.6@high blind, plus a host visual pass and a keyboard pass. Owner answered
round one with a shortlist, then answered the refinement round with a FUSION.

- **The codex engine line has drifted: `codex exec` dropped `--full-auto` in
  0.154.0** ("error: unexpected argument '--full-auto' found"), so the seat
  errored in 0.11s before reaching the API. `--sandbox workspace-write` is the
  right replacement for a judge, which only reads files and writes one JSON.
  Worth pinning: the engine table is the one part of the method that rots
  against a CLI it does not own.
- **`errored` and `seat-limit` can be the same seat twice.** After the flag was
  fixed the codex judge reached the API and returned a usage-limit error, which
  the method already classifies correctly - but the FIRST failure was a method
  bug wearing the costume of a vendor problem. Read stderr before concluding
  which of the three non-score outcomes you have.
- **The rubric's seven dimensions do not include "did it build the interaction
  the brief named".** The winning fuse carried the owner's chapter-level ask and
  silently dropped the content-row one; every judge scored it highly and the
  host's screenshots could not show the difference, because a still frame of a
  selected paragraph and a still frame of a paragraph with a caret in it look
  identical. The owner caught it in seconds by clicking. A refinement round that
  names specific borrowings should be verified by DRIVING each named borrowing,
  not by scoring the result.
- **A fusion is a third owner answer the method does not model.** `/contest`
  offers "winner" or "shortlist"; this owner answered with a baseline plus three
  named borrowings from two other variants. `refine --shortlist A/1,B/1,B/3`
  builds three seats each improving its own entry, which is the opposite of a
  fusion. The scaffold had to be reshaped by hand into one seat whose variant-1
  is the baseline and whose reference/ holds the donors. Worth a `--fuse` mode:
  one seat, one baseline, the rest as references, and a brief that quotes the
  borrowings one per section.
- **Let the executing seat be one that did not build the baseline.** The owner
  chose opus@xhigh to fuse a grok-built baseline. It found and fixed three real
  defects in that baseline (a save that re-emitted H2/H3 with NO `##` prefix and
  wrote it back over the section body; Escape deleting an uncommitted draft; a
  key card naming the wrong axis) plus two more of the same family that nobody
  had spotted. A seat refining its own entry had already missed all of them.
- **Verify a prototype's own verification.** The fuse claimed a corpus-wide
  round-trip via a harness it shipped (`window.__folioAudit`). Driving the real
  UI instead - 18 edit/commit cycles through actual keystrokes, compared against
  the original data globals rather than the page's own parse - reproduced the
  claim, but that is a check the host should run, not a claim the host should
  relay. Same family as the repo's own "a gate that asserts data is not a gate
  on behavior".
- **The stock visual pass is wrong for a keyboard-first brief.** It clicks the
  centre and types into the first input, which scores every variant on the
  chrome the brief told them to remove. A keyboard pass (load, `?`, Escape,
  three Tabs, deep scroll, visible-button vs `<kbd>` census) separated the field
  immediately: 0-1 `<kbd>` and 6-9 visible buttons on one entry against 16-59
  and 1-8 on the other. Consider shipping it beside visual-pass.py.
- **A probe's boolean can be a false negative; say so in the verdict.** The
  keyboard pass reported "'?' changed the page: False" for one variant because
  it compared `innerText` length; the variant does respond to `?`, minimally.
  The host verdict recorded the correction rather than the metric.
- **Cost and wall, as the CLIs reported them**: opus@xhigh 40 min / 103 turns /
  $21.76; grok-4.6@high 24 min / 28 turns / $0.95. Judging: opus@high 10 min /
  $8.25; grok-4.6@high 8 min / $1.26. The fuse round: opus@xhigh 25 min / 78
  turns / $13.46. Whole arc about 2 hours and under $46 reported.
- **Blinding ate the evidence when the brief was about models.** The tracklight brief's material is
  judge identities (`anthropic/opus@xhigh`, `google/gemini-2.5-flash`), and collect redacted 281
  strings, 125 of them in the most thorough entry and 3 in the terse one - the panel would have read
  thoroughness as sloppiness. 1.2.0 keeps compound identifiers that appear verbatim in the staged
  `data/` (and their path tails), counts them as "kept", and still redacts every bare vendor word:
  281 became 127, the rest being prose mentions no rule can tell from a signature. Tell the judges
  what `[redacted]` stands for when the material names models.
- **The code-reading judge from a competing family was the better engineer, and its self-preference
  was real too.** On pumper the codex judge scored its own family 8.4-9.0 and Claude entries 5.4-7;
  the fable judge did the reverse. But the codex judge's two sharpest defects - a safety bound that
  contradicts `detect.rs:711-731`, and field eras built on a hash of the whole RuleSet - both
  verified against the tree, and the host (screenshots plus a citation range check) had ranked the
  second of those variants first. On a design brief the host's pass measures legibility, not
  soundness; say so in the report and weight the verified claims, not the totals.
- **Two Claude seats of different tiers converge on bets, and seats of different families converge
  on names.** Every seat brought a "human decides, automate the evidence" variant, and two families
  independently called their model-behind-gates design "Airlock".
- **A claude seat can report `completed` with zero variants.** On athena, opus@xhigh ($11.97, 39
  turns) delegated its three variants to background subagents and ended its turn; headless `-p`
  waits 600 s for background tasks and then terminates them ("Background tasks still running after
  600s; terminating"), so nothing reached the workspace. The claude seat now runs with
  `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`. A completed seat with zero variants is an
  infrastructure failure, not a result: read `runs/<id>/stderr.log`, and a rerun is not a redraw.
- **The owner reviews in a browser, across contests, and the gallery names the seats.** A
  hand-built page linking the blinded copies of every contest was the first thing the owner asked
  for once two contests existed. 1.3.0 makes it an instrument output (`router`), plus `reveal`: the
  owner asked for a round where each seat sees the field, keeps one variant and argues it.

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
## 1.3.0 - 2026-09-22 - pumper, tracklight (the owner's review of the design reports)

- **The owner judged the reports on how they carry the argument, and every report missed the
  pay-off.** Praised: a commented diagram per part of the solution instead of paragraphs, a grouped
  left navigation, data models as code, designed comparison tables and claims, and a hero that puts
  the claim "right into my face". Faulted across the field: no clarity about the positive impact
  achievable. Marked down: a strong theme that crowds text and competes with its own diagrams.
  Recorded verbatim, with a transferable bar, in `references/design-report-craft.md`.
- **The owner decided two contests without the panel's order.** On pumper they asked for one
  design merging B/1 and C/1 (panel 1st and 6th); on tracklight they named C/2 (panel 2nd, and the
  variant its own seat kept in reveal over the panel's 1st). `verdict --design` links the resulting
  design doc from the router.
- **Reveal choices:** on pumper every seat kept its own panel-best variant; on tracklight two of
  three seats did not - opus kept its panel-2nd, and fable dropped the variant whose premise the
  judge had shown wrong. The reveal is a second opinion from the makers, not a repeat of the panel.
- **The owner's four decisions took four shapes, and the instrument knew two.** Pumper: one design
  merging two finalists (recorded as winner + runner-up, which understates the runner-up). Tracklight:
  a single winner. Athena: all three reveal survivors combined as layers, decided without any panel
  (`verdict` refused to run without judges). Personas: all three kept, pending a business consult.
  `--combine` and panel-less verdicts were added; a shortlist now reads as "decision pending" with
  its reason linked. The reveal is what made these decisions possible - each survivor arrived with
  its own comparison against the field, which is what the owner read to see that three designs
  answered three different questions.

## 1.4.0 - 2026-09-22 - personas

- **The port's WORDS are part of the style contract, not decoration.** A promotion reached 0 deviations across 12 roles with two `accept: ["width"]` departures, both on shrink-to-fit text whose every style property matched: the product's pre-seeded strings were full sentences written for a settings page, and the design gives that slot a chip. Seven short keys later the same check printed 0 across 13 roles with both tolerances REMOVED, and the chip read character for character with the winner. Lesson for step 4 of `promotion.md`: when a role's only deviation is `width` on an auto-sized element, suspect the copy before the CSS, and treat "the product must use its existing keys" as a constraint that can be renegotiated rather than a reason to widen a tolerance.
- **A promotion measures what no product gate can, and this run proved it three more times.** The instrument caught that the host's `--brand-cyan` token resolves to `#1ba9be` in one shipped theme (routing three companions' identity colours through it would have collapsed them to one hue), that an SVG ring was painting an inherited `color` the winner leaves alone, and that Tailwind preflight's `max-width: 100%` reaches an `<img>` the prototype never had. None is visible to typecheck, lint, 22 tests or a production build.
- **The owner may decline the panel, and that is a valid contest.** This round ran 3 seats x 3 variants with NO judges: the owner read all nine himself and named the winner. `verdict --winner` writes the vault and the pattern ledger without a scoreboard, exactly as the skill says it may - worth stating in the report so the absence of scores does not read as a missing step.
- **A seat that completes in one turn is not automatically a poor seat.** codex:gpt-5.6-sol@high delivered 3/3 variants in 596 s and one turn against claude seats' 48 and 54 turns; its variants were thinner in prose but structurally complete, and its "state readable without colour" idea was the field's most transferable. Turn count is not effort.

## 1.3.0 - 2026-09-22 - personas (goal-desk-scale, then a /prototype round on the winner's map layer)

Run shape: `claude:claude-opus-5-5@xhigh` vs `codex:gpt-6-sol@high`, three variants each, 90
goals across 16 real projects staged as `goals.js` + the app's real tokens and English copy.
Grok was 402 Payment Required, so with both remaining families competing **no panel could be
blinded** - host visual pass only, disclosed in the verdict. 6/6 delivered, 0 page errors.

- **The codex sandbox flag was still wrong, for the third recorded time.** The consuming repo's
  overlay asserted "the runner now passes `--dangerously-bypass-approvals-and-sandbox`" and the
  1.1.0 lesson filed it as a PROPOSAL, but `participants.mjs` still sent `--sandbox
  workspace-write`. Probed both ways in a scratch dir before the run: workspace-write answers
  `patch rejected: writing is blocked by read-only sandbox; rejected by user approval settings`
  and writes nothing; the bypass writes. **Now applied.** A participant seat that cannot write
  produces a silent zero, which is indistinguishable from a bad entry. Probe a seat's write
  path before a contest, not after.
- **`visual-pass.mjs` now ships beside the `.py`** (the 1.2.0 lesson asked for it). It finds
  Playwright in the consuming repo first, takes `--from entries|judging`, `--keys` for a
  keyboard probe, and `--titles <file.json>`.
- **The measurement that decided this contest did not exist before it.** `--titles` reports how
  many expected strings render IN FULL at load. It read 80/90, 80/90, 80/90 for one seat and
  7/90, 18/90, 7/90 for the other - the whole gap between the entries in one number, on the
  brief's own first constraint. Every rubric dimension is a judgement; this is not. When a brief
  names a hard content constraint, build the instrument for it before the seats run.
- **A clipped-leaf-element test is not a truncation test, and its zero is a false negative.**
  The pass reported `clipped 0` for a variant whose load frame visibly cuts three sentences: the
  overflow was on a *container with children* behind a fade, which a leaf test never visits. The
  fix that works is to sum `scrollHeight - clientHeight` over every box whose `overflow-y` clips,
  and report the px hidden and in how many places. "Hidden in 1 named scroll" and "hidden in 16
  silent fades" are different designs and the leaf test scores them identically.
- **`verdict --pattern` credited an ANTI-pattern as a win.** 1.2.0 recorded that a `--pattern`
  taken from a losing variant is credited to the winner. Sharper instance here: one curated
  pattern *described the winner's own defect* (`weighting-by-verbosity-encodes-the-wrong-quantity`,
  which is the thing the owner asked to have fixed) and landed as `wins: 1`. Three of four
  patterns had to be demoted to sightings by hand. `--pattern` needs a source variant and a
  polarity, or the ledger teaches the next contest to do the wrong thing.
- **Validate a staged asset before `init`, not after.** The host built `tokens.css` by piping a
  CSS block through `head -80`, which cut it mid-rule; the unclosed brace swallowed the entire
  `.typo-*` scale for every seat. Three of six variants detected it and re-declared the scale;
  three did not. Both seats got the identical file so the comparison held, but a brace-balance or
  parse check on every staged asset costs one line and removes the doubt.
- **A one-turn seat is a finding about the seat, not about the brief.** `gpt-6-sol` finished in
  11.8 minutes and **one turn**, 34k output tokens, and brought one idea at three densities -
  project cells plus glyph strips, three times. `claude-opus-5-5` took 19.6 min, 35 turns, 122k
  output tokens and brought three different hypotheses. Both read the identical brief, which
  demands "a different metaphor, a different information architecture". Turn count is worth
  reporting in step 8 beside wall and cost.
- **Codex reports no price.** `parseCodex` returns `cost_usd: null`, so a two-seat report with a
  codex seat can state one price and must say the other is unavailable rather than imply parity.
- **Cost and wall, as the CLIs reported them**: `claude-opus-5-5@xhigh` 19.6 min / 35 turns /
  $5.26 / 122k output. `codex:gpt-6-sol@high` 11.8 min / 1 turn / 34k output / no price reported.
  The follow-on map round (one seat, same model) 24.7 min / 40 turns / $6.04 / 135k output.
- **Three contests, and the host's mean has never predicted the owner's pick.** Twice he took the
  `utility` leader; here he took the `concept` leader that the host ranked third and had flagged
  for breaking the brief's first constraint. The stable signal is not a dimension: he picks the
  **structural bet** and treats the rendering as a later round. A host recommendation should name
  the structural bet each variant makes, not only rank the means.
- **A won contest can hand straight to a `/prototype` round on ONE layer of the winner.** The
  owner kept the winner's three-level architecture and sent only its level 1 back out: four maps
  behind a throwaway switcher, levels 2 and 3 shared and untouched, plus an app-chrome frame
  toggle built to measured geometry so the port cost was visible while the design was still
  cheap. Extracting the control behind the same interface as the new approaches, and proving the
  extracted control renders identical rects to the original, is what makes the round a
  measurement rather than a re-pitch.
