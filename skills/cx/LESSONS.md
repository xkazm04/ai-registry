# Lessons - cx

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-09-07 - firetv

- **Authored from a real need, before its first run.** A Next.js prototype of a TV-plus-phone
  product had sixteen TV screens and seven phone screens composed in one day, and the next job was
  not more screens but walking them as a user would, one at a time, across several sessions. No
  lane skill did that: `/explorer` finds defects in code, `/uat` checks acceptance, `/perfect`
  polishes a build. The gap was a *journey* walk with a CX lens, a stop-and-review rhythm, and a
  vault that survives the session boundary.
- **The stop is the unit, not the screen.** The first draft keyed everything by screen. That fails
  the moment a screen is met in two journeys - a hint screen reached from a homework page and the
  same screen reached from a phone question are different experiences with different reads. A stop
  is one screen in one scenario; ids are stable; `replan` reorders and never renumbers.
- **The user's turn is one prompt and it is prose.** The other lane skills make every prompt a
  single keystroke, and that discipline is kept for triage. But the thing this skill exists to
  collect - the user's own read and expectation for a screen - is not a menu choice. So Phase 5 is
  one prompt with a free-text default lane and keystroke triage inside it, and the expectation
  outranks the read: a contradicted proposal is withdrawn, never argued.
- **Zero proposals must be a legal outcome.** A review skill that always returns a table teaches
  the user to skim the table. The read allows an empty table with one sentence, and the heuristics
  reference names "filling the table" as an anti-pattern.
- **Every proposal names its heuristic or dies.** This is the whole defence against taste. The
  heuristic list lives in `references/` so a consumer can extend it via the overlay's
  `## Heuristics` without a fork; the 10-foot-UI and second-device sections came straight from the
  product that prompted the skill and are written generally enough to transplant.

## 1.0.0 - 2026-09-08 - firetv
- A stop for a screen that does not exist yet reads as a spec: the executor builds the read, and the real read only happens on the built screen. When the map adds new screens, budget a second round at that stop for the user's review before moving on.
- The user's review of a freshly built screen can redirect branding (module names, illustrations, a mark). Keep a hook for an image skill (/leonardo) in the overlay's Repo law or Run section so the executor can generate assets instead of leaving placeholders.

## 1.0.0 - 2026-09-08 - firetv (second run)
- On a stop whose scenario crosses two surfaces (a TV and a phone), the read must carry both surfaces with their own captures and heuristics; reading the primary surface and mentioning the second in one line let the user find the phone "impossible to operate" after the TV side was accepted. Phase 3 should capture every surface named in the stop line.
- A toggled state and a focused state must differ in kind, not degree; the practitioner's "focus is the cursor" heuristic should also ask "can the user tell chosen from focused from three metres?".

## 1.0.0 - 2026-09-08 - gravitone-gcloud
- **The method forbade the job.** Adopted into a content-studio app whose five production steps were
  built front-to-back and abandoned halfway, the very first scoping question hit `What this skill is
  not`: *"a stop that needs a new capability records it as `deferred - new feature` and moves on."*
  Under v1.0.0 the three highest-value stops in the map - two broken seams and a final output that
  does not exist in any form - were all illegal, and the walk would have polished the entry flow
  while the product's promise stayed unreachable. A CX method that can only improve what exists is
  the wrong tool for the majority state of real products, which is *unfinished*. Fixed in v1.1.0 as
  a MODE rather than a rewrite, so the two apps already mid-walk on v1.0.0 keep their behaviour.
- **The failure was on neither screen.** Measured: `research` 28 files / 4,434 lines, `script` 44 /
  9,039, `frames` 15 / 5,268, then `score` 1 / 382 and `cut` 1 / 298. But the file counts were the
  small half of the finding. The real break was that `score` reads no upstream output at all - it
  imports a `CUES` fixture while the user's actual scenes sit unread - and `cut` reads a `TIMELINE`
  fixture and persists only nudge offsets on clips the user never made. Both screens photograph
  perfectly. A screen-by-screen walk would have proposed polish on both and never found that the
  user's work stops travelling after step three. Hence the **seam as a unit of work**, read by
  following the data (payload / writer / reader) rather than the pixels, and the `Continuity`
  heuristic family in `references/`.
- **A state grade per stop turns the map into the finding.** Writing `built / thin / fixture /
  absent` beside each line, from evidence a reader can recheck, made the shape of the product
  visible in the map itself: a front half at `built` and a back half at `fixture` is a product that
  was demoed rather than finished. The user picked the start of the walk off that gradient - at the
  break, not at the front - which is a better decision than the one the ungraded map invited.
- **Ask where to start AFTER grading, not before.** The first map presented was an ungraded tour of
  16 screens and the natural answer was "S1, in order". The graded map made "start at the break"
  obvious, and it is the right call: polish upstream of a severed seam is spent twice.

### Redesign proposal
- **The overlay should carry the final output, and the skill should refuse to map without one.**
  `complete` mode currently derives the ending from the product brief and the reviewer's judgement.
  A `final_output:` key in the overlay frontmatter - "a cut they would show someone" - would make
  the destination declared rather than inferred, and every stop's grade could then be stated as its
  contribution to that artefact. Not applied in v1.1.0: it changes the overlay contract for the two
  consumers already running, and it should be earned by a second `complete` run somewhere else
  first.

## 1.1.0 - 2026-09-08 - gravitone-gcloud (first `complete` run)
- **A grade set from the map is a hypothesis; a grade set from walking the stop is a measurement.**
  `seam script→frames` was graded `built` on good evidence — `useFrames` demonstrably reads
  `TrailerCutStepData`. Walking the stop DOWNSTREAM of it found that `framesFor` returns `[]`
  unless the source origin is one specific fixture, so the seam is built for exactly one of the
  product's disciplines. v1.1.0's Phase 2 should say this out loud: **grades are provisional until
  the stop is walked, and a stop may regrade its neighbours.** Add a `regraded` note to the journey
  line rather than silently editing the grade, so the correction is visible.
- **The deepest finding was one stop downstream of where it lives, and only building revealed it.**
  The read of S10 was correct and complete, and still could not see that NO PROJECT IN THE BUILD
  can have both halves of the step: one discipline has the picture and no musical intent, the other
  has the intent and no picture. That is invisible to a read of either screen AND to a read of the
  seam — it emerged from an executor trying to make the seam work end to end. **`complete` mode
  should expect a stop to yield a new blocking stop upstream of itself**, and Phase 7 should ask
  "did this stop change the map?" before closing. Right now the map is only rebuilt by `map` /
  `replan`.
- **A capture that renders is not a capture that is right, and the failure mode is silent.** Twice
  the tool produced a full-size, plausible PNG of the WRONG screen: once the framework's fresh
  profile had no seeded project (an error page), once the target step's upstream writer had never
  run so the screen showed its honest empty state. The second cost a false "failed acceptance"
  verdict. Phase 3 should require the capture to ASSERT it reached the screen — a title, a
  testid, a known string — and treat a deep-linked screen as suspect until the steps upstream of
  it have been walked. In a multi-step product a screen does not only render, it READS what the
  step before it WROTE.
- **Executor reports are evidence-shaped and partly wrong.** Both dispatches returned excellent
  work plus at least one confident false claim (one called a token a type-scale violation that had
  been fixed earlier in the same session). Phase 6 already says to run the gates yourself; it
  should also say to **diff the files yourself and verify each report's factual claims**, because
  the wrong claims arrive in the same register as the right ones.
- **The most valuable brief content was quoted from the repo, not written by the reviewer.** Two
  proposals were narrowed or decided before a line was written — one by a code comment that had
  already settled the question (`stepStore.ts`, on why a step persists nothing), one by the
  product's own craft knowledge (`knowledge/.../03-score/PATTERNS.md` §1). Phase 1 loads the
  design doc; for a multi-step product it should also load **the step's own knowledge directory
  when one exists**, and Phase 6 should require the brief to quote it.
- **An acceptance line can be unreachable for a structural reason, and that is a finding, not a
  failure.** S10's "at least one spot PLACED on the captured screen" could not be met by any
  project in the build. The item still landed — proven by probe and by an injected-fixture
  capture. Phase 6's "an item that fails acceptance is not landed" needs the caveat: **first ask
  whether the acceptance line was reachable**, and if not, record why and what was used instead.
